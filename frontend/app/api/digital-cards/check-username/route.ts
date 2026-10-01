import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

import {
  normalizeUsername,
  isValidUsername,
} from "@/app/lib/username";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest
) {
  try {
    /* =====================================================
       GET PARAMETERS
    ===================================================== */

    const usernameParam =
      request.nextUrl.searchParams.get(
        "username"
      );

    const cardId =
      request.nextUrl.searchParams.get(
        "cardId"
      );

    /* =====================================================
       USERNAME REQUIRED
    ===================================================== */

    if (!usernameParam) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          message: "Username is required",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       NORMALIZE USERNAME
    ===================================================== */

    const username =
      normalizeUsername(usernameParam);

    /* =====================================================
       VALIDATE USERNAME
    ===================================================== */

    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          username,
          message:
            "Username must be 3-30 characters and contain only letters, numbers, hyphens or underscores.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VALIDATE CARD ID
    ===================================================== */

    if (
      cardId &&
      !mongoose.Types.ObjectId.isValid(
        cardId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          message: "Invalid card ID",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CONNECT DATABASE
    ===================================================== */

    await connectDB();

    /* =====================================================
       BUILD QUERY
    ===================================================== */

    const query: Record<string, unknown> = {
      username,
    };

    /*
     * When editing an existing card,
     * exclude the current card.
     *
     * Example:
     *
     * Current card:
     * _id      = 123
     * username = prince
     *
     * We search:
     *
     * username = prince
     * _id != 123
     */

    if (cardId) {
      query._id = {
        $ne:
          new mongoose.Types.ObjectId(
            cardId
          ),
      };
    }

    /* =====================================================
       CHECK DATABASE
    ===================================================== */

    const existingCard =
      await DigitalCard.findOne(query)
        .select("_id")
        .lean();

    /* =====================================================
       USERNAME TAKEN
    ===================================================== */

    if (existingCard) {
      return NextResponse.json({
        success: true,
        available: false,
        username,
        message:
          "Username already taken",
      });
    }

    /* =====================================================
       USERNAME AVAILABLE
    ===================================================== */

    return NextResponse.json({
      success: true,
      available: true,
      username,
      message:
        "Username is available",
    });
  } catch (error) {
    console.error(
      "USERNAME CHECK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        available: false,
        message:
          "Unable to check username",
      },
      { status: 500 }
    );
  }
}