import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import { sendTrueBulkOtp } from "@/app/lib/truebulk-otp";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const mobile = await sendTrueBulkOtp(body?.mobile);
    return NextResponse.json({ success: true, mobile });
  } catch (error) {
    console.error("TRUEBULKSMS SEND OTP ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to send OTP.",
      },
      { status: 400 },
    );
  }
}
