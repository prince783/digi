import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      username,
      paymentId,
      orderId,
      paidAt,
    } = body;

    if (!username || !paymentId || !orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing card/payment information",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const card = await DigitalCard.findOne({
      username,
    });

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "Digital card not found",
        },
        { status: 404 }
      );
    }

    card.paymentStatus = "paid";
    card.paymentId = paymentId;
    card.paymentOrderId = orderId;
    card.paidAt = paidAt
      ? new Date(paidAt)
      : new Date();

    card.isPublished = true;

    await card.save();

    return NextResponse.json({
      success: true,
      message: "Digital card published successfully",
      card: {
        username: card.username,
        paymentStatus: card.paymentStatus,
        paymentId: card.paymentId,
        paidAt: card.paidAt,
        isPublished: card.isPublished,
      },
    });
  } catch (error) {
    console.error("Payment completion error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to publish card",
      },
      { status: 500 }
    );
  }
}