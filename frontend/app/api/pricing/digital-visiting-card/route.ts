import { NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import Pricing from "@/app/models/Pricing";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const pricing = await Pricing.findOne({
      projectType: "digital-visiting-card",
      isActive: true,
    }).lean();

    if (!pricing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Digital Visiting Card pricing is not available.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      pricing: {
        id: pricing._id.toString(),

        projectType:
          pricing.projectType,

        yearlyPrice:
          Number(pricing.yearlyPrice),

        isActive:
          pricing.isActive,
      },
    });
  } catch (error) {
    console.error(
      "GET DIGITAL CARD PRICING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load pricing.",
      },
      {
        status: 500,
      }
    );
  }
}