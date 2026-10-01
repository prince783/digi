import {
  NextRequest,
  NextResponse,
} from "next/server";

import connectDB from "@/app/lib/db";
import { getCurrentAdmin } from "@/app/lib/auth";
import Pricing from "@/app/models/Pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   ALLOWED PROJECT TYPES
========================================================= */

const ALLOWED_TYPES = [
  "digital-visiting-card",
  "resume",
  "biography",
  "catalog",
] as const;

/* =========================================================
   GET ALL PRICING
========================================================= */

export async function GET() {
  try {
    await connectDB();

    /*
     * Public read: vendor-facing pages (catalog editor,
     * order step, subscription page) fetch this to show
     * the current price before payment. Only PATCH
     * (actually changing a price) is admin-gated.
     */

    const pricing =
      await Pricing.find({})
        .sort({
          projectType: 1,
        })
        .lean();

    return NextResponse.json(
      {
        success: true,
        pricing,
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "[Admin Pricing] GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load pricing.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH / UPDATE PRICING
========================================================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    await connectDB();

    if (!(await getCurrentAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const body =
      await request.json();

    /* =====================================================
       PROJECT TYPE
    ===================================================== */

    const projectType =
      String(
        body?.projectType || ""
      )
        .trim()
        .toLowerCase();

    /* =====================================================
       YEARLY PRICE
    ===================================================== */

    const yearlyPrice =
      Number(
        body?.yearlyPrice
      );

    /* =====================================================
       ACTIVE STATUS
    ===================================================== */

    const isActive =
      typeof body?.isActive ===
      "boolean"
        ? body.isActive
        : true;

    /* =====================================================
       VALIDATE PROJECT TYPE
    ===================================================== */

    if (
      !ALLOWED_TYPES.includes(
        projectType as
          (typeof ALLOWED_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid project type.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE PRICE
    ===================================================== */

    if (
      !Number.isFinite(
        yearlyPrice
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Yearly price must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      yearlyPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Yearly price cannot be negative.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       NORMALIZE PRICE
    ===================================================== */

    const normalizedPrice =
      Number(
        yearlyPrice.toFixed(2)
      );

    /* =====================================================
       UPDATE / CREATE PRICING
    ===================================================== */

    const pricing =
      await Pricing.findOneAndUpdate(
        {
          projectType,
        } as Record<string, unknown>,

        {
          $set: {
            projectType,

            yearlyPrice:
              normalizedPrice,

            isActive,
          },
        },

        {
          new: true,

          upsert: true,

          runValidators: true,

          setDefaultsOnInsert:
            true,
        }
      ).lean();

    /* =====================================================
       LOG
    ===================================================== */

    console.log(
      "[Admin Pricing] Updated:",
      {
        projectType,

        yearlyPrice:
          normalizedPrice,

        isActive,
      }
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Pricing updated successfully.",

        pricing,
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "[Admin Pricing] PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update pricing.",
      },
      {
        status: 500,
      }
    );
  }
}