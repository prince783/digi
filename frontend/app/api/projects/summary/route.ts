import { NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import Catalog from "@/app/models/Catalogs";
import DigitalCard from "@/app/models/DigitalCard";
import Resume from "@/app/models/Resume";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please login to continue." },
        { status: 401 },
      );
    }

    await connectDB();

    const userIdString = user._id.toString();

    const [cards, catalogs, resumes] = await Promise.all([
      DigitalCard.countDocuments({ userId: userIdString }),
      Catalog.countDocuments({ userId: user._id }),
      Resume.countDocuments({ userId: user._id }),
    ]);

    return NextResponse.json({
      success: true,
      cards,
      catalogs,
      resumes,
    });
  } catch (error) {
    console.error("PROJECTS SUMMARY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load project summary." },
      { status: 500 },
    );
  }
}
