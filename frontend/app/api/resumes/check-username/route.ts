import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Resume from "@/app/models/Resume";
import Catalog from "@/app/models/Catalogs";
import DigitalCard from "@/app/models/DigitalCard";
import { getCurrentUser } from "@/app/lib/auth";
import { isValidUsername, normalizeUsername } from "@/app/lib/username";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, available: false, message: "Please login to continue." }, { status: 401 });
    const username = normalizeUsername(request.nextUrl.searchParams.get("username") || "");
    if (!isValidUsername(username)) {
      return NextResponse.json({ success: false, available: false, username, message: "Username must be 3-30 characters and contain only letters, numbers, hyphens or underscores." }, { status: 400 });
    }
    await connectDB();
    const current = await Resume.findOne({ userId: user._id }).select("_id username").lean();
    const exclude = current?._id instanceof mongoose.Types.ObjectId ? { _id: { $ne: current._id } } : {};
    const [resume, catalog, card] = await Promise.all([
      Resume.findOne({ username, ...exclude }).select("_id").lean(),
      Catalog.findOne({ username }).select("_id").lean(),
      DigitalCard.findOne({ username }).select("_id").lean(),
    ]);
    const available = !resume && !catalog && !card;
    return NextResponse.json({ success: true, available, username, message: available ? "Username is available." : "Username is already taken." });
  } catch (error) {
    console.error("RESUME USERNAME CHECK ERROR:", error);
    return NextResponse.json({ success: false, available: false, message: "Unable to check username." }, { status: 500 });
  }
}
