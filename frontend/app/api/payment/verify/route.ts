import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("====================================");
    console.log("RAZORPAY VERIFY API HIT");
    console.log("====================================");

    // ---------------------------------------------
    // READ REQUEST BODY
    // ---------------------------------------------

    let body: any;

    try {
      body = await request.json();
    } catch (error) {
      console.error("INVALID JSON BODY:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const {
      username,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    console.log("VERIFY REQUEST:", {
      username,
      razorpay_order_id,
      razorpay_payment_id,
      hasSignature: !!razorpay_signature,
    });

    // ---------------------------------------------
    // VALIDATE DATA
    // ---------------------------------------------

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required.",
        },
        { status: 400 }
      );
    }

    if (!razorpay_order_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay order ID is required.",
        },
        { status: 400 }
      );
    }

    if (!razorpay_payment_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay payment ID is required.",
        },
        { status: 400 }
      );
    }

    if (!razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay signature is required.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // RAZORPAY SECRET
    // ---------------------------------------------

    const razorpaySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      console.error(
        "RAZORPAY_KEY_SECRET NOT FOUND"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay secret is not configured.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------
    // CREATE SIGNATURE
    // ---------------------------------------------

    const signatureBody =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpaySecret
        )
        .update(signatureBody)
        .digest("hex");

    console.log(
      "GENERATED SIGNATURE:",
      generatedSignature
    );

    console.log(
      "RECEIVED SIGNATURE:",
      razorpay_signature
    );

    // ---------------------------------------------
    // COMPARE SIGNATURE
    // ---------------------------------------------

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpay_signature,
        "utf8"
      );

    if (
      generatedBuffer.length !==
      receivedBuffer.length
    ) {
      console.error(
        "SIGNATURE LENGTH MISMATCH"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Razorpay payment signature.",
        },
        { status: 400 }
      );
    }

    const signatureValid =
      crypto.timingSafeEqual(
        generatedBuffer,
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
            "Invalid Razorpay payment signature.",
        },
        { status: 400 }
      );
    }

    console.log(
      "RAZORPAY SIGNATURE VERIFIED"
    );

    // ---------------------------------------------
    // CONNECT DATABASE
    // ---------------------------------------------

    await connectDB();

    console.log("DATABASE CONNECTED");

    // ---------------------------------------------
    // NORMALIZE USERNAME
    // ---------------------------------------------

    const normalizedUsername =
      String(username)
        .trim()
        .toLowerCase();

    // ---------------------------------------------
    // FIND CARD
    // ---------------------------------------------

    const card =
      await DigitalCard.findOne({
        username: normalizedUsername,
      });

    if (!card) {
      console.error(
        "CARD NOT FOUND:",
        normalizedUsername
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Digital card not found.",
        },
        { status: 404 }
      );
    }

    console.log("CARD FOUND:", {
      id: card._id,
      username: card.username,
      paymentStatus: card.paymentStatus,
      paymentOrderId: card.paymentOrderId,
      isPublished: card.isPublished,
    });

    // ---------------------------------------------
    // CHECK ORDER ID
    // ---------------------------------------------

    if (
      card.paymentOrderId &&
      card.paymentOrderId !==
        razorpay_order_id
    ) {
      console.error(
        "ORDER ID DOES NOT MATCH"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order does not belong to this card.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // ALREADY PAID
    // ---------------------------------------------

    if (
      card.paymentStatus === "paid" &&
      card.isPublished === true
    ) {
      console.log(
        "CARD ALREADY PAID"
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Payment already verified.",
          card: {
            username: card.username,
            paymentStatus:
              card.paymentStatus,
            paymentId:
              card.paymentId,
            paymentOrderId:
              card.paymentOrderId,
            paidAt: card.paidAt,
            isPublished:
              card.isPublished,
          },
        },
        { status: 200 }
      );
    }

    // ---------------------------------------------
    // UPDATE CARD
    // ---------------------------------------------

    card.paymentStatus = "paid";

    card.paymentId =
      razorpay_payment_id;

    card.paidAt = new Date();

    card.isPublished = true;

    if (!card.paymentOrderId) {
      card.paymentOrderId =
        razorpay_order_id;
    }

    await card.save();

    console.log(
      "CARD UPDATED SUCCESSFULLY"
    );

    console.log({
      username: card.username,
      paymentStatus:
        card.paymentStatus,
      paymentId:
        card.paymentId,
      paymentOrderId:
        card.paymentOrderId,
      paidAt: card.paidAt,
      isPublished:
        card.isPublished,
    });

    // ---------------------------------------------
    // SUCCESS
    // ---------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment verified successfully.",
        card: {
          username: card.username,
          paymentStatus:
            card.paymentStatus,
          paymentId:
            card.paymentId,
          paymentOrderId:
            card.paymentOrderId,
          paidAt: card.paidAt,
          isPublished:
            card.isPublished,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "RAZORPAY VERIFY API ERROR:",
      error
    );

    console.error(
      "===================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}