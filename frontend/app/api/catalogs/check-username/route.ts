import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const rawUsername =
      searchParams.get("username") || "";

    const catalogId =
      searchParams.get("catalogId") || "";

    const username =
      normalizeUsername(rawUsername);

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          username: "",
          message:
            "Username is required.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          username,
          message:
            "Username must contain at least 3 characters.",
        },
        { status: 400 }
      );
    }

    if (username.length > 30) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          username,
          message:
            "Username cannot contain more than 30 characters.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[a-z0-9_-]{3,30}$/.test(
        username
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          username,
          message:
            "Only letters, numbers, hyphens and underscores are allowed.",
        },
        { status: 400 }
      );
    }

    const query: Record<
      string,
      unknown
    > = {
      username,
    };

    /*
     * When editing an existing catalog,
     * allow the catalog to keep its own username.
     */
    if (catalogId) {
      query._id = {
        $ne: catalogId,
      };
    }

    const existingCatalog =
      await Catalog.findOne(query)
        .select("_id username")
        .lean();

    if (existingCatalog) {
      return NextResponse.json({
        success: true,
        available: false,
        username,
        message:
          "Username is already taken.",
      });
    }

    return NextResponse.json({
      success: true,
      available: true,
      username,
      message:
        "Username is available.",
    });
  } catch (error) {
    console.error(
      "Catalog username check error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        available: false,
        message:
          "Unable to check username. Please try again.",
      },
      { status: 500 }
    );
  }
}