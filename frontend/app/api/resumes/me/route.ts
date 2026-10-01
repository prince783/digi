import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Resume from "@/app/models/Resume";
import { cleanBilling } from "@/lib/billing";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Please login to continue." }, { status: 401 });
    await connectDB();
    const resume = await Resume.findOne({ userId: user._id }).lean();
    return NextResponse.json({ success: true, resume });
  } catch (error) {
    console.error("GET MY RESUME ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to load your resume." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Please login to continue." }, { status: 401 });
    const body = await request.json();
    const { resume, template, color, billing } = body;
    if (!resume || typeof resume !== "object" || Array.isArray(resume)) {
      return NextResponse.json({ success: false, message: "A valid resume payload is required." }, { status: 400 });
    }
    if (typeof template !== "string" || typeof color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json({ success: false, message: "Template and color are required." }, { status: 400 });
    }
    await connectDB();
    await Resume.updateOne(
      { userId: user._id, paymentStatus: { $exists: false } },
      { $set: { paymentStatus: "pending", paymentOrderId: null, razorpayOrderId: null, paymentId: null, razorpayPaymentId: null, paymentSignature: null, razorpaySignature: null, paymentAmount: 0, paidAt: null, isPublished: false } },
    );
    const savedResume = await Resume.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          resume,
          template,
          color,
          ...(billing !== undefined ? { billing: cleanBilling(billing) } : {}),
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return NextResponse.json({ success: true, resume: savedResume });
  } catch (error) {
    console.error("SAVE RESUME ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to save your resume." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Please login to continue." }, { status: 401 });
    await connectDB();
    await Resume.deleteOne({ userId: user._id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE MY RESUME ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to delete your resume." }, { status: 500 });
  }
}
