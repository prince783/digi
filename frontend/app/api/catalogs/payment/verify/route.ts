import {
  NextRequest,
  NextResponse,
} from "next/server";

import crypto from "crypto";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";
import { normalizeCatalogThemeId } from "@/lib/catalogThemes";
import { generateInvoicePdf } from "@/app/lib/invoice";
import { sendInvoiceEmail } from "@/app/lib/email";
import Invoice from "@/app/models/Invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeUsername(
  value: string
) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

export async function POST(
  request: NextRequest
) {
  try {
    await connectDB();

    const body =
      await request.json();

    const username =
      normalizeUsername(
        String(
          body?.username || ""
        )
      );

    const catalogId =
      String(
        body?.catalogId || ""
      );

    const layoutTemplateId =
      normalizeCatalogThemeId(
        body?.layoutTemplateId,
      );

    const hero =
      body?.hero &&
      typeof body.hero === "object"
        ? {
            eyebrow:
              typeof body.hero.eyebrow === "string"
                ? body.hero.eyebrow.trim()
                : "",
            title:
              typeof body.hero.title === "string"
                ? body.hero.title.trim()
                : "",
            description:
              typeof body.hero.description === "string"
                ? body.hero.description.trim()
                : "",
            image:
              typeof body.hero.image === "string"
                ? body.hero.image.trim()
                : "",
          }
        : undefined;

    const billing =
      body?.billing && typeof body.billing === "object"
        ? {
            address:
              typeof body.billing.address === "string"
                ? body.billing.address.trim()
                : "",
            city:
              typeof body.billing.city === "string"
                ? body.billing.city.trim()
                : "",
            state:
              typeof body.billing.state === "string"
                ? body.billing.state.trim()
                : "",
            pincode:
              typeof body.billing.pincode === "string"
                ? body.billing.pincode.trim()
                : "",
          }
        : {
            address: "",
            city: "",
            state: "",
            pincode: "",
          };

    const razorpayOrderId =
      String(
        body?.razorpay_order_id ||
          ""
      );

    const razorpayPaymentId =
      String(
        body?.razorpay_payment_id ||
          ""
      );

    const razorpaySignature =
      String(
        body?.razorpay_signature ||
          ""
      );

    console.log(
      "=========================================="
    );

    console.log(
      "[Catalog Payment] VERIFY PAYMENT"
    );

    console.log({
      username,
      catalogId,
      razorpayOrderId,
      razorpayPaymentId,
      hasSignature:
        Boolean(
          razorpaySignature
        ),
    });

    console.log(
      "=========================================="
    );

    /*
    ==========================================================
    VALIDATION
    ==========================================================
    */

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is required.",
        },
        { status: 400 }
      );
    }

    if (!razorpayOrderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order ID is required.",
        },
        { status: 400 }
      );
    }

    if (!razorpayPaymentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay payment ID is required.",
        },
        { status: 400 }
      );
    }

    if (!razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay signature is required.",
        },
        { status: 400 }
      );
    }

    /*
    ==========================================================
    RAZORPAY SECRET
    ==========================================================
    */

    const secret =
      process.env
        .RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error(
        "[Catalog Payment] RAZORPAY_KEY_SECRET is missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment configuration is missing.",
        },
        { status: 500 }
      );
    }

    /*
    ==========================================================
    FIND CATALOG
    ==========================================================
    */

    let catalog = null;

    if (
      catalogId &&
      mongoose.Types.ObjectId.isValid(
        catalogId
      )
    ) {
      catalog =
        await Catalog.findById(
          catalogId
        );
    }

    if (!catalog) {
      catalog =
        await Catalog.findOne({
          username,
        });
    }

    if (!catalog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catalog not found.",
        },
        { status: 404 }
      );
    }

    /*
    ==========================================================
    USERNAME CHECK
    ==========================================================
    */

    if (
      catalog.username !==
      username
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catalog username mismatch.",
        },
        { status: 400 }
      );
    }

    /*
    ==========================================================
    IDEMPOTENCY

    If webhook / frontend sends verification
    more than once, don't fail a payment
    that is already completed.
    ==========================================================
    */

    if (
      catalog.paymentStatus ===
        "paid" &&
      catalog.paymentId ===
        razorpayPaymentId
    ) {
      return NextResponse.json({
        success: true,

        alreadyVerified: true,

        catalogId:
          catalog._id.toString(),

        username:
          catalog.username,

        layoutTemplateId:
          catalog.layoutTemplateId,

        isPublished:
          catalog.isPublished,

        url:
          `/catalogs/${catalog.username}`,

        message:
          "Payment already verified.",
      });
    }

    /*
    ==========================================================
    ORDER ID CHECK
    ==========================================================
    */

    if (
      catalog.paymentOrderId &&
      catalog.paymentOrderId !==
        razorpayOrderId
    ) {
      console.error(
        "[Catalog Payment] Order ID mismatch:",
        {
          database:
            catalog.paymentOrderId,

          received:
            razorpayOrderId,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order mismatch.",
        },
        { status: 400 }
      );
    }

    /*
    ==========================================================
    SIGNATURE GENERATION
    ==========================================================
    */

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");

    /*
    ==========================================================
    TIMING-SAFE SIGNATURE CHECK
    ==========================================================
    */

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpaySignature,
        "utf8"
      );

    const signatureValid =
      generatedBuffer.length ===
        receivedBuffer.length &&
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      console.error(
        "[Catalog Payment] Invalid Razorpay signature."
      );

      catalog.paymentStatus =
        "failed";

      await catalog.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    /*
    ==========================================================
    PAYMENT SUCCESS
    ==========================================================
    */

    const now = new Date();
    const existingEnd = catalog.expiresAt ? new Date(catalog.expiresAt) : null;
    const baseDate = (existingEnd && existingEnd > now) ? existingEnd : now;
    const newEnd = new Date(baseDate);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    const updatedCatalog =
      await Catalog.findByIdAndUpdate(
        catalog._id,
        {
          $set: {
            paymentStatus: "paid",
            paymentOrderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            paymentSignature: razorpaySignature || null,
            paidAt: now,
            expiresAt: newEnd,
            accountStatus: "active",
            isPublished: true,
            templateId: layoutTemplateId,
            layoutTemplateId,
            ...(hero ? { hero } : {}),
          },
          $unset: {
            theme: "",
          },
        },
        { new: true, runValidators: true },
      );

    if (!updatedCatalog) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalog could not be updated after payment.",
        },
        { status: 500 },
      );
    }

    catalog = updatedCatalog;

    console.log(
      "=========================================="
    );

    console.log(
      "[Catalog Payment] PAYMENT VERIFIED"
    );

    console.log(
      "[Catalog Payment] Catalog:",
      catalog._id.toString()
    );

    console.log(
      "[Catalog Payment] Username:",
      catalog.username
    );

    console.log(
      "[Catalog Payment] Published:",
      catalog.isPublished
    );

    console.log(
      "=========================================="
    );

    /*
    ==========================================================
    INVOICE EMAIL (non-blocking — don't fail the payment
    response if PDF generation or email sending fails)
    ==========================================================
    */

    {
      const invoiceNumber = `DGP-CAT-${catalog._id.toString().slice(-8).toUpperCase()}`;
      const customerName = catalog.company?.fullName || catalog.company?.companyName || "";

      try {
        await Invoice.findOneAndUpdate(
          { productType: "catalog", productId: catalog._id },
          {
            userId: catalog.userId,
            productType: "catalog",
            productId: catalog._id,
            invoiceNumber,
            productName: "DigiProfilo Catalogue Subscription (1 Year)",
            customerName,
            customerEmail: catalog.company?.email || "",
            amount: catalog.paymentAmount || 0,
            paymentId: catalog.paymentId || "",
            orderId: catalog.paymentOrderId || "",
            address: billing.address,
            city: billing.city,
            state: billing.state,
            pincode: billing.pincode,
            paidAt: catalog.paidAt || new Date(),
          },
          { upsert: true, setDefaultsOnInsert: true },
        );
      } catch (invoiceSaveError) {
        console.error(
          "[Catalog Payment] Invoice record save failed:",
          invoiceSaveError,
        );
      }

      if (catalog.company?.email) {
        try {
          const pdfBuffer = await generateInvoicePdf({
            invoiceNumber,
            paidAt: catalog.paidAt || new Date(),
            productName: "DigiProfilo Catalogue Subscription (1 Year)",
            customerName,
            customerEmail: catalog.company.email,
            amount: catalog.paymentAmount || 0,
            paymentId: catalog.paymentId || "",
            orderId: catalog.paymentOrderId || "",
            address: billing.address,
            city: billing.city,
            state: billing.state,
            pincode: billing.pincode,
          });

          await sendInvoiceEmail({
            to: catalog.company.email,
            customerName,
            productName: "Catalogue Subscription",
            invoiceNumber,
            pdfBuffer,
            catalogUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/catalogs/${catalog.username}`,
          });
        } catch (invoiceError) {
          console.error(
            "[Catalog Payment] Invoice email failed:",
            invoiceError
          );
        }
      }
    }

    return NextResponse.json({
      success: true,

      catalogId:
        catalog._id.toString(),

      username:
        catalog.username,

      layoutTemplateId:
        catalog.layoutTemplateId,

      paymentStatus:
        catalog.paymentStatus,

      isPublished:
        catalog.isPublished,

      paymentId:
        catalog.paymentId,

      paidAt:
        catalog.paidAt,

      url:
        `/catalogs/${catalog.username}`,

      message:
        "Catalog payment verified successfully.",
    });
  } catch (error: any) {
    console.error(
      "[Catalog Payment] VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to verify catalog payment.",
      },
      { status: 500 }
    );
  }
}