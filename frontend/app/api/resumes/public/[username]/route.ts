import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Resume from "@/app/models/Resume";
import { normalizeUsername } from "@/app/lib/username";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ username: string }> }) {
  try {
    const { username: rawUsername } = await context.params;
    const username = normalizeUsername(rawUsername);
    await connectDB();
    const resume = await Resume.findOne({ username, paymentStatus: "paid", isPublished: true }).lean();
    if (!resume) return NextResponse.json({ success: false, message: "Resume not found." }, { status: 404 });
    return NextResponse.json({ success: true, resume });
  } catch (error) {
    console.error("PUBLIC RESUME ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to load resume." }, { status: 500 });
  }
}
