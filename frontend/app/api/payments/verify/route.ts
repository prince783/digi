import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";
import { generateInvoicePdf } from "@/app/lib/invoice";
import { sendInvoiceEmail } from "@/app/lib/email";
import Invoice from "@/app/models/Invoice";

export const runtime = "nodejs";

/**
 * POST /api/payment/verify
 *
 * Verifies Razorpay payment signature and then
 * marks the Digital Card as paid and published.
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=================================");
    console.log("PAYMENT VERIFY API CALLED");
    console.log("=================================");

    /*
    =====================================================
    1. READ REQUEST BODY
    =====================================================
    */

    let body: any;

    try {
      body = await request.json();
    } catch (error) {
      console.error(
        "INVALID JSON REQUEST BODY:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      username,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    console.log(
      "VERIFY PAYMENT REQUEST:",
      {
        username,
        razorpay_order_id,
        razorpay_payment_id,
        hasSignature:
          Boolean(razorpay_signature),
      }
    );

    /*
    =====================================================
    2. VALIDATION
    =====================================================
    */

    if (
      typeof username !== "string" ||
      !username.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof razorpay_order_id !== "string" ||
      !razorpay_order_id.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof razorpay_payment_id !== "string" ||
      !razorpay_payment_id.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay payment ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof razorpay_signature !== "string" ||
      !razorpay_signature.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay signature is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    =====================================================
    3. NORMALIZE USERNAME
    =====================================================
    */

    const normalizedUsername =
      username.trim().toLowerCase();

    /*
    =====================================================
    4. RAZORPAY SECRET
    =====================================================
    */

    const razorpaySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      console.error(
        "RAZORPAY_KEY_SECRET IS MISSING"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay server configuration is missing.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    =====================================================
    5. CREATE RAZORPAY SIGNATURE
    =====================================================

    Razorpay:

    HMAC SHA256(
      razorpay_order_id + "|" + razorpay_payment_id,
      RAZORPAY_KEY_SECRET
    )
    */

    const signatureBody =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpaySecret
        )
        .update(signatureBody)
        .digest("hex");

    /*
    =====================================================
    6. SAFE SIGNATURE COMPARISON
    =====================================================
    */

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpay_signature.trim(),
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      console.error(
        "INVALID RAZORPAY SIGNATURE - LENGTH MISMATCH"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment signature.",
        },
        {
          status: 400,
        }
      );
    }

    const signatureValid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      console.error(
        "INVALID RAZORPAY SIGNATURE"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment signature.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "RAZORPAY SIGNATURE VERIFIED"
    );

    /*
    =====================================================
    7. CONNECT DATABASE
    =====================================================
    */

    await connectDB();

    console.log(
      "DATABASE CONNECTED"
    );

    /*
    =====================================================
    8. FIND DIGITAL CARD
    =====================================================
    */

    const card =
      await DigitalCard.findOne({
        username:
          normalizedUsername,
      });

    if (!card) {
      console.error(
        "DIGITAL CARD NOT FOUND:",
        normalizedUsername
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Digital card not found.",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "DIGITAL CARD FOUND:",
      {
        id: card._id,
        username: card.username,
        paymentStatus:
          card.paymentStatus,
        paymentOrderId:
          card.paymentOrderId,
        isPublished:
          card.isPublished,
      }
    );

    /*
    =====================================================
    9. VERIFY ORDER ID
    =====================================================
    */

    if (
      card.paymentOrderId &&
      card.paymentOrderId !==
        razorpay_order_id
    ) {
      console.error(
        "PAYMENT ORDER ID DOES NOT MATCH"
      );

      console.error({
        databaseOrderId:
          card.paymentOrderId,

        razorpayOrderId:
          razorpay_order_id,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order does not match this card.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    =====================================================
    10. ALREADY PAID
    =====================================================
    */

    if (
      card.paymentStatus === "paid" &&
      card.isPublished === true
    ) {
      console.log(
        "CARD IS ALREADY PAID AND PUBLISHED"
      );

      return NextResponse.json(
        {
          success: true,

          message:
            "Payment was already verified.",

          card: {
            username:
              card.username,

            paymentStatus:
              card.paymentStatus,

            paymentId:
              card.paymentId,

            paidAt:
              card.paidAt,

            isPublished:
              card.isPublished,
          },
        },
        {
          status: 200,
        }
      );
    }

    /*
    =====================================================
    11. UPDATE CARD PAYMENT STATUS
    =====================================================
    */

    const now = new Date();
    const existingEnd = card.subscriptionEnd ? new Date(card.subscriptionEnd) : null;
    const baseDate = (existingEnd && existingEnd > now) ? existingEnd : now;
    const newEnd = new Date(baseDate);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    card.paymentStatus = "paid";
    card.paymentId = razorpay_payment_id;
    card.paidAt = now;
    card.isPublished = true;
    card.accountStatus = "active";
    card.subscriptionStart = card.subscriptionStart || now;
    card.subscriptionEnd = newEnd;

    /*
    IMPORTANT:
    If your schema contains paymentOrderId,
    keep it synchronized.
    */

    if (!card.paymentOrderId) {
      card.paymentOrderId =
        razorpay_order_id;
    }

    await card.save();

    /*
    =====================================================
    12. INVOICE EMAIL (non-blocking)
    =====================================================
    */

    {
      const invoiceNumber = `DGP-CARD-${card._id.toString().slice(-8).toUpperCase()}`;
      const customerName = card.fullName || card.companyName || "";
      const amount = Number(process.env.RAZORPAY_CARD_AMOUNT) || 0;
      const cardBilling = (body?.billing || {}) as Record<string, unknown>;
      const cardAddress = String(cardBilling.address || "").trim();
      const cardCity = String(cardBilling.city || "").trim();
      const cardState = String(cardBilling.state || "").trim();
      const cardPincode = String(cardBilling.pincode || "").trim();

      try {
        await Invoice.findOneAndUpdate(
          { productType: "card", productId: card._id },
          {
            userId: card.userId,
            productType: "card",
            productId: card._id,
            invoiceNumber,
            productName: "DigiProfilo Digital Visiting Card Subscription (1 Year)",
            customerName,
            customerEmail: card.email || "",
            amount,
            paymentId: card.paymentId || "",
            orderId: card.paymentOrderId || "",
            address: cardAddress,
            city: cardCity,
            state: cardState,
            pincode: cardPincode,
            paidAt: card.paidAt || new Date(),
          },
          { upsert: true, setDefaultsOnInsert: true },
        );
      } catch (invoiceSaveError) {
        console.error(
          "INVOICE RECORD SAVE FAILED:",
          invoiceSaveError,
        );
      }

      if (card.email) {
        try {
          const pdfBuffer = await generateInvoicePdf({
            invoiceNumber,
            paidAt: card.paidAt || new Date(),
            productName: "DigiProfilo Digital Visiting Card Subscription (1 Year)",
            customerName,
            customerEmail: card.email,
            amount,
            paymentId: card.paymentId || "",
            orderId: card.paymentOrderId || "",
            address: cardAddress,
            city: cardCity,
            state: cardState,
            pincode: cardPincode,
          });

          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://digiprofilo.com";
          const cardPublicUrl = `${baseUrl}/card/${card.username}`;

          await sendInvoiceEmail({
            to: card.email,
            customerName,
            productName: "Digital Visiting Card Subscription",
            invoiceNumber,
            pdfBuffer,
            productUrl: cardPublicUrl,
          });
        } catch (invoiceError) {
          console.error(
            "INVOICE EMAIL FAILED:",
            invoiceError
          );
        }
      }
    }

    /*
    =====================================================
    13. CONFIRM DATABASE UPDATE
    =====================================================
    */

    console.log(
      "================================="
    );

    console.log(
      "PAYMENT VERIFIED SUCCESSFULLY"
    );

    console.log({
      username:
        card.username,

      paymentStatus:
        card.paymentStatus,

      paymentId:
        card.paymentId,

      paymentOrderId:
        card.paymentOrderId,

      paidAt:
        card.paidAt,

      isPublished:
        card.isPublished,
    });

    console.log(
      "================================="
    );

    /*
    =====================================================
    13. SUCCESS RESPONSE
    =====================================================
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment verified successfully.",

        card: {
          username:
            card.username,

          paymentStatus:
            card.paymentStatus,

          paymentId:
            card.paymentId,

          paymentOrderId:
            card.paymentOrderId,

          paidAt:
            card.paidAt,

          isPublished:
            card.isPublished,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    /*
    =====================================================
    GLOBAL ERROR HANDLER
    =====================================================
    */

    console.error(
      "================================="
    );

    console.error(
      "VERIFY PAYMENT API ERROR:"
    );

    console.error(error);

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      {
        status: 500,
      }
    );
  }
}