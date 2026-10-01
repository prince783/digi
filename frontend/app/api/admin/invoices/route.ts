import { NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import { getCurrentAdmin } from "@/app/lib/auth";

import Invoice from "@/app/models/Invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AdminInvoiceRow {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  productType: "card" | "catalog" | "resume";
  productName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentId: string;
  orderId: string;
  paidAt: string | null;
  billing: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const PRODUCT_LABEL: Record<AdminInvoiceRow["productType"], string> = {
  card: "Digital Visiting Card",
  catalog: "Product Catalog",
  resume: "Resume",
};

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 401 },
      );
    }

    await connectDB();

    const records = await Invoice.find({})
      .sort({ paidAt: -1 })
      .lean();

    const invoices: AdminInvoiceRow[] = records.map((invoice) => ({
      id: String(invoice.productId),
      invoiceId: String(invoice._id),
      invoiceNumber: invoice.invoiceNumber || "",
      productType: invoice.productType,
      productName: invoice.productName || PRODUCT_LABEL[invoice.productType] || "Subscription",
      customerName: invoice.customerName || "",
      customerEmail: invoice.customerEmail || "",
      amount: invoice.amount || 0,
      paymentId: invoice.paymentId || "",
      orderId: invoice.orderId || "",
      paidAt: invoice.paidAt ? new Date(invoice.paidAt).toISOString() : null,
      billing: {
        address: invoice.address || "",
        city: invoice.city || "",
        state: invoice.state || "",
        pincode: invoice.pincode || "",
      },
    }));

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error("ADMIN INVOICES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load invoices." },
      { status: 500 },
    );
  }
}
