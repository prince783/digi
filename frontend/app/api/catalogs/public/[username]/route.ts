import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";
import { resolveCatalogThemeId } from "@/lib/catalogThemes";

export const runtime = "nodejs";

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      username: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { username: rawUsername } = await context.params;

    const username = normalizeUsername(rawUsername);

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalog username is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * PUBLIC ACCESS CHECK
     * =========================================================
     *
     * Catalog is publicly accessible ONLY when:
     *
     * paymentStatus === "paid"
     * paymentId exists
     * isPublished === true
     *
     * Payment does NOT determine the template.
     */
    const catalog = await Catalog.findOne({
      username,
      paymentStatus: "paid",
      paymentId: {
        $exists: true,
        $nin: [null, ""],
      },
      isPublished: true,
    }).lean();

    if (!catalog) {
      return NextResponse.json(
        {
          success: false,
          message: "Catalog not found or not published.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =========================================================
     * TEMPLATE RESOLUTION
     * =========================================================
     *
     * Priority:
     *
     * 1. layoutTemplateId
     * 2. legacy templateId
     * 3. simple
     *
     * DO NOT use:
     *
     * catalog.theme
     * catalog.theme.themeId
     *
     * for the new template system.
     */
    const layoutTemplateId = resolveCatalogThemeId(
      catalog.layoutTemplateId,
      catalog.templateId,
    );

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */

    return NextResponse.json({
      success: true,

      catalog: {
        ...catalog,

        _id: catalog._id.toString(),

        userId: catalog.userId
          ? catalog.userId.toString()
          : undefined,

        /*
         * This is the template that the public frontend
         * must pass to CatalogRenderer.
         */
        layoutTemplateId,

        /*
         * Keep templateId synchronized in the response too.
         * This makes the frontend backward compatible.
         */
        templateId: layoutTemplateId,

        publicUrl: `/catalogs/${catalog.username}`,
      },
    });
  } catch (error) {
    console.error(
      "[Public Catalog] GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load catalog.",
      },
      {
        status: 500,
      }
    );
  }
}