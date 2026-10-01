import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import Resume from "@/app/models/Resume";
import Pricing from "@/app/models/Pricing";
import Catalog from "@/app/models/Catalogs";
import DigitalCard from "@/app/models/DigitalCard";
import Payment from "@/app/models/Payment";
import { isValidUsername, normalizeUsername } from "@/app/lib/username";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Please login to continue." }, { status: 401 });
    const body = await request.json();
    const username = normalizeUsername(String(body?.username || ""));
    if (!isValidUsername(username)) return NextResponse.json({ success: false, message: "A valid username is required." }, { status: 400 });
    await connectDB();
    const pricing = await Pricing.findOne({ projectType: "resume", isActive: true }).lean();
    const basePrice = Number(pricing?.yearlyPrice);
    if (!Number.isFinite(basePrice) || basePrice <= 0) return NextResponse.json({ success: false, message: "Resume pricing is not configured in Admin Pricing." }, { status: 400 });
    const totalAmount = basePrice;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return NextResponse.json({ success: false, message: "Razorpay configuration is missing." }, { status: 500 });
    const conflict = await Promise.all([
      Catalog.findOne({ username }).select("_id").lean(),
      DigitalCard.findOne({ username }).select("_id").lean(),
    ]);
    if (conflict.some(Boolean)) return NextResponse.json({ success: false, message: "Username is already taken." }, { status: 409 });
    const resume = await Resume.findOneAndUpdate(
      { userId: user._id },
      { $set: { username, paymentAmount: totalAmount, paymentStatus: "pending", isPublished: false, paymentId: null, razorpayPaymentId: null, paymentSignature: null, razorpaySignature: null } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    if (!resume) return NextResponse.json({ success: false, message: "Unable to prepare resume payment." }, { status: 500 });
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `resume_${resume._id.toString().slice(-10)}_${Date.now()}`,
      notes: { resumeId: resume._id.toString(), username, userId: String(user._id), product: "resume" },
    });
    resume.paymentOrderId = order.id;
    resume.razorpayOrderId = order.id;
    await resume.save();
    await Payment.findOneAndUpdate(
      { projectId: resume._id, projectType: "resume" },
      {
        userId: user._id,
        projectId: resume._id,
        projectType: "resume",
        amount: totalAmount,
        currency: "INR",
        paymentStatus: "pending",
        razorpayOrderId: order.id,
        razorpayPaymentId: undefined,
        razorpaySignature: undefined,
        paidAt: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    return NextResponse.json({ success: true, key: keyId, orderId: order.id, amount: order.amount, currency: order.currency, resumeId: resume._id.toString(), username, basePrice, totalAmount });
  } catch (error) {
    console.error("RESUME CREATE PAYMENT ORDER ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to create resume payment order." }, { status: 500 });
  }
}
