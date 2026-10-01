import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId is required",
        },
        { status: 400 }
      );
    }

    const card = await DigitalCard.findOne({
      userId: userId,
    }).lean();

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "Digital visiting card not found for this user",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      card,
    });
  } catch (error) {
    console.error("MY CARD API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch digital card",
      },
      { status: 500 }
    );
  }
}