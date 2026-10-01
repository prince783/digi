import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Pricing from "@/app/models/Pricing";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const pricing = await Pricing.findOne({ projectType: "resume", isActive: true }).select("yearlyPrice").lean();
    const yearlyPrice = Number(pricing?.yearlyPrice);
    if (!Number.isFinite(yearlyPrice) || yearlyPrice <= 0) {
      return NextResponse.json({ success: false, message: "Resume pricing is not configured." }, { status: 404 });
    }
    return NextResponse.json({ success: true, yearlyPrice });
  } catch (error) {
    console.error("GET RESUME PRICING ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to load resume pricing." }, { status: 500 });
  }
}
