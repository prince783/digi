import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import { getCurrentUser, getCurrentAdmin } from "@/app/lib/auth";

import DigitalCard from "@/app/models/DigitalCard";
import Catalog from "@/app/models/Catalogs";
import Resume from "@/app/models/Resume";
import Invoice from "@/app/models/Invoice";
import User from "@/app/models/User";

import { generateInvoicePdf } from "@/app/lib/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductType = "card" | "catalog" | "resume";

/*
 * Persisted Invoice record is the single source of truth for both
 * customer email receipts and Admin Panel invoice downloads.
 * The invoice number, customer name, email, billing details, plan,
 * amount, payment ID, order ID, and date all come directly from the
 * persisted Invoice document in MongoDB.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productType: string; id: string }> },
) {
  try {
    await connectDB();

    const { productType, id } = await params;

    if (!["card", "catalog", "resume"].includes(productType)) {
      return NextResponse.json(
        { success: false, message: "Unknown product type." },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    const admin = await getCurrentAdmin();

    if (!user && !admin) {
      return NextResponse.json(
        { success: false, message: "Please login to continue." },
        { status: 401 },
      );
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    // 1. First, search for the persisted Invoice record
    let persistedInvoice = await Invoice.findOne({
      $or: [
        { productType: productType as ProductType, productId: isObjectId ? new mongoose.Types.ObjectId(id) : id },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
        { invoiceNumber: id },
      ],
    }).lean();

    // 2. If already persisted, verify access and generate directly from persisted data
    if (persistedInvoice) {
      if (!admin && (!user || (persistedInvoice.userId && String(user._id) !== String(persistedInvoice.userId)))) {
        return NextResponse.json(
          { success: false, message: "You do not have access to this invoice." },
          { status: 403 },
        );
      }

      const pdfBuffer = await generateInvoicePdf({
        invoiceNumber: persistedInvoice.invoiceNumber,
        paidAt: persistedInvoice.paidAt ? new Date(persistedInvoice.paidAt) : new Date(),
        productName: persistedInvoice.productName,
        customerName: persistedInvoice.customerName,
        customerEmail: persistedInvoice.customerEmail,
        amount: persistedInvoice.amount,
        paymentId: persistedInvoice.paymentId,
        orderId: persistedInvoice.orderId,
        address: persistedInvoice.address || "",
        city: persistedInvoice.city || "",
        state: persistedInvoice.state || "",
        pincode: persistedInvoice.pincode || "",
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${persistedInvoice.invoiceNumber}.pdf"`,
        },
      });
    }

    // 3. Fallback for older legacy payments: look up product, create persisted Invoice record once, and use it
    let ownerId = "";
    let paymentStatus = "";
    let invoiceNumber = "";
    let productName = "";
    let customerName = "";
    let customerEmail = "";
    let amount = 0;
    let paymentId = "";
    let orderId = "";
    let paidAt: Date = new Date();
    let address = "";
    let city = "";
    let state = "";
    let pincode = "";

    if (productType === "card") {
      const card = await DigitalCard.findById(id).lean();
      if (!card) {
        return NextResponse.json(
          { success: false, message: "Card not found." },
          { status: 404 },
        );
      }
      ownerId = String(card.userId || "");
      paymentStatus = card.paymentStatus || "";
      invoiceNumber = `DGP-CARD-${String(card._id).slice(-8).toUpperCase()}`;
      productName = "DigiProfilo Digital Visiting Card Subscription (1 Year)";
      customerName = card.fullName || card.companyName || "";
      customerEmail = card.email || "";
      amount = Number(process.env.RAZORPAY_CARD_AMOUNT) || 0;
      paymentId = card.paymentId || "";
      orderId = card.paymentOrderId || "";
      paidAt = card.paidAt ? new Date(card.paidAt) : new Date();
    } else if (productType === "catalog") {
      const catalog = await Catalog.findById(id).lean();
      if (!catalog) {
        return NextResponse.json(
          { success: false, message: "Catalog not found." },
          { status: 404 },
        );
      }
      ownerId = String(catalog.userId || "");
      paymentStatus = catalog.paymentStatus || "";
      invoiceNumber = `DGP-CAT-${String(catalog._id).slice(-8).toUpperCase()}`;
      productName = "DigiProfilo Catalogue Subscription (1 Year)";
      customerName = catalog.company?.fullName || catalog.company?.companyName || "";
      customerEmail = catalog.company?.email || "";
      amount = Number(catalog.paymentAmount) || 0;
      paymentId = catalog.paymentId || "";
      orderId = catalog.paymentOrderId || "";
      paidAt = catalog.paidAt ? new Date(catalog.paidAt) : new Date();
      if (catalog.billing) {
        address = catalog.billing.address || "";
        city = catalog.billing.city || "";
        state = catalog.billing.state || "";
        pincode = catalog.billing.pincode || "";
      }
    } else {
      const resume = await Resume.findById(id).lean();
      if (!resume) {
        return NextResponse.json(
          { success: false, message: "Resume not found." },
          { status: 404 },
        );
      }
      ownerId = String(resume.userId || "");
      paymentStatus = resume.paymentStatus || "";
      invoiceNumber = `DGP-CV-${String(resume._id).slice(-8).toUpperCase()}`;
      productName = "DigiProfilo Resume/CV Subscription (1 Year)";
      customerName = resume.username || "";
      // Retrieve customer user email, not current admin session email
      const customerUser = ownerId ? await User.findById(ownerId).lean() : null;
      customerEmail = customerUser?.email || "";
      amount = Number(resume.paymentAmount) || 0;
      paymentId = resume.paymentId || resume.razorpayPaymentId || "";
      orderId = resume.razorpayOrderId || resume.paymentOrderId || "";
      paidAt = resume.paidAt ? new Date(resume.paidAt) : new Date();
      if (resume.billing) {
        address = resume.billing.address || "";
        city = resume.billing.city || "";
        state = resume.billing.state || "";
        pincode = resume.billing.pincode || "";
      }
    }

    if (!admin && (!user || String(user._id) !== ownerId)) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this invoice." },
        { status: 403 },
      );
    }

    if (paymentStatus !== "paid") {
      return NextResponse.json(
        { success: false, message: "This subscription has not been paid yet." },
        { status: 400 },
      );
    }

    // Persist the invoice record so it becomes the single permanent source of truth
    const createdInvoice = await Invoice.findOneAndUpdate(
      { productType: productType as ProductType, productId: isObjectId ? new mongoose.Types.ObjectId(id) : id },
      {
        userId: ownerId ? new mongoose.Types.ObjectId(ownerId) : null,
        productType: productType as ProductType,
        productId: isObjectId ? new mongoose.Types.ObjectId(id) : id,
        invoiceNumber,
        productName,
        customerName,
        customerEmail,
        amount,
        paymentId,
        orderId,
        address,
        city,
        state,
        pincode,
        paidAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const pdfBuffer = await generateInvoicePdf({
      invoiceNumber: createdInvoice.invoiceNumber,
      paidAt: createdInvoice.paidAt ? new Date(createdInvoice.paidAt) : paidAt,
      productName: createdInvoice.productName,
      customerName: createdInvoice.customerName,
      customerEmail: createdInvoice.customerEmail,
      amount: createdInvoice.amount,
      paymentId: createdInvoice.paymentId,
      orderId: createdInvoice.orderId,
      address: createdInvoice.address || "",
      city: createdInvoice.city || "",
      state: createdInvoice.state || "",
      pincode: createdInvoice.pincode || "",
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${createdInvoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("INVOICE PDF ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to generate invoice PDF." },
      { status: 500 },
    );
  }
}
