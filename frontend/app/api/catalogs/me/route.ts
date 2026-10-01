import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    // This endpoint only ever needs the products COUNT (dashboard/
    // analytics summaries), never the individual products — so the
    // full array (with each product's own image/description/price)
    // never needs to leave the database. $size + $project computes
    // productsCount in Mongo and drops the raw array from the payload.
    const catalogs = await Catalog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          productsCount: {
            $size: { $ifNull: ["$products", []] },
          },
        },
      },
      { $project: { products: 0 } },
    ]);

    return NextResponse.json({
      success: true,
      catalogs,
      count: catalogs.length,
    });
  } catch (error) {
    console.error("GET /api/catalogs/me ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load catalogs.",
      },
      { status: 500 }
    );
  }
}