import { NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";
import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

/* =========================================================
   GET CURRENT USER'S DIGITAL CARDS
========================================================= */

export async function GET() {
  try {
    await connectDB();

    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to continue.",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user._id.toString();

    /* =====================================================
       FIND ALL CURRENT USER'S CARDS
    ===================================================== */

    const cards = await DigitalCard.find({
      userId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,
      cards,
      count: cards.length,
    });
  } catch (error) {
    console.error("GET MY DIGITAL CARDS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your digital cards.",
      },
      {
        status: 500,
      }
    );
  }
}