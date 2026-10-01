import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import { verifyTrueBulkOtp } from "@/app/lib/truebulk-otp";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const result = await verifyTrueBulkOtp(body?.mobile, body?.otp);
    return NextResponse.json({
      success: true,
      mobile: result.mobile,
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error("TRUEBULKSMS VERIFY OTP ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Invalid OTP.",
      },
      { status: 400 },
    );
  }
}
