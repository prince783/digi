import {
  NextRequest,
  NextResponse,
} from "next/server";

import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";

export const runtime = "nodejs";

/* =========================================================
   GET CATALOG BY ID OR USERNAME
========================================================= */

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalog ID is required.",
        },
        { status: 400 }
      );
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const catalog = isObjectId
      ? await Catalog.findById(id).lean()
      : await Catalog.findOne({ username: id.toLowerCase().trim() }).lean();

    if (!catalog) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalog not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      catalog: {
        ...catalog,
        _id: String(catalog._id),
      },
    });
  } catch (error) {
    console.error("GET CATALOG ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load catalog.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE CATALOG
========================================================= */

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    /* =====================================================
       VALIDATE CATALOG ID
    ===================================================== */

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalog ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid catalog ID.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       FIND CATALOG
    ===================================================== */

    const catalog = await Catalog.findById(id);

    if (!catalog) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalog not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       DELETE CATALOG
    ===================================================== */

    await Catalog.findByIdAndDelete(id);

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json({
      success: true,
      message: "Catalog deleted successfully.",
      catalogId: id,
    });
  } catch (error) {
    console.error(
      "DELETE CATALOG ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete catalog.",
      },
      {
        status: 500,
      }
    );
  }
}