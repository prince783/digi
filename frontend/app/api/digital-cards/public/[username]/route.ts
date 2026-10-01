import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      username: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { username } = await params;

    const cleanUsername = username
      .trim()
      .toLowerCase();

    const card = await DigitalCard.findOne({
      username: cleanUsername,
      paymentStatus: "paid",
      isPublished: true,
    }).lean();

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Digital visiting card not found or not published",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      card,
    });
  } catch (error) {
    console.error(
      "GET PUBLIC DIGITAL CARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load digital card",
      },
      {
        status: 500,
      }
    );
  }
}