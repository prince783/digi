import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";
import { normalizeCatalogThemeId } from "@/lib/catalogThemes";
import { cleanBilling } from "@/lib/billing";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

interface ICatalogCompany {
  fullName: string;
  companyName: string;
  designation: string;
  profilePhoto: string;
  logo: string;
  tagline: string;
  aboutCompany: string;

  mobile: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapLink: string;
}

interface ICatalogProduct {
  id: string;
  name: string;
  description: string;
  sellingPrice: number;
  mrp: number;
  image: string;
  categoryId: string;
}

interface ICatalogProductCategory {
  id: string;
  name: string;
  image: string;
  icon: string;
}

function cleanHero(value: unknown) {
  const source = value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
  const text = (item: unknown) => typeof item === "string" ? item.trim() : "";

  const images = Array.isArray(source.images)
    ? source.images
        .map((item: any) => ({
          id: text(item?.id),
          image: text(item?.image),
          active: item?.active !== false,
        }))
        .filter((slide) => slide.id && slide.image)
    : [];

  return {
    eyebrow: text(source.eyebrow),
    title: text(source.title),
    description: text(source.description),
    image: text(source.image),
    images,
  };
}

/* =========================================================
   HELPERS
========================================================= */

/**
 * Normalize username
 */
function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

/**
 * Resolve the selected catalog layout.
 *
 * Priority:
 *
 * 1. layoutTemplateId
 * 2. templateId
 * 3. simple
 *
 * IMPORTANT:
 *
 * Only valid IDs from catalogThemes.ts are accepted.
 */
function resolveLayoutTemplateId(
  layoutTemplateId?: unknown,
  templateId?: unknown,
) {
  const selected =
    typeof layoutTemplateId === "string" &&
    layoutTemplateId.trim()
      ? layoutTemplateId.trim()
      : typeof templateId === "string" &&
          templateId.trim()
        ? templateId.trim()
        : "simple";

  return normalizeCatalogThemeId(selected);
}

/* =========================================================
   CLEAN PRODUCTS
========================================================= */

function mapProducts(
  products: unknown,
): ICatalogProduct[] {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(
    (product: any): ICatalogProduct => ({
      id: String(
        product?.id ||
          product?._id ||
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
      ),

      name: String(
        product?.name || "",
      ),

      description: String(
        product?.description || "",
      ).slice(0, 30),

      sellingPrice: Number(
        product?.sellingPrice || 0,
      ),

      mrp: Number(
        product?.mrp || 0,
      ),

      image: String(
        product?.image || "",
      ),

      categoryId: String(
        product?.categoryId || "",
      ),
    }),
  );
}

function mapProductCategories(
  categories: unknown,
): ICatalogProductCategory[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories
    .map(
      (category: any): ICatalogProductCategory => ({
        id: String(category?.id || ""),
        name: String(category?.name || "").trim().slice(0, 30),
        image: String(category?.image || ""),
        icon: String(category?.icon || "Package"),
      }),
    )
    .filter((category) => category.id && category.name);
}

/* =========================================================
   CLEAN COMPANY
========================================================= */

function cleanCompany(
  value: unknown,
): ICatalogCompany {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const stringValue = (
    item: unknown,
  ): string =>
    typeof item === "string"
      ? item
      : "";

  return {
    fullName: stringValue(
      source.fullName,
    ),

    companyName: stringValue(
      source.companyName,
    ),

    designation: stringValue(
      source.designation,
    ),

    profilePhoto: stringValue(
      source.profilePhoto,
    ),

    logo: stringValue(
      source.logo ||
        source.companyLogo,
    ),

    tagline: stringValue(
      source.tagline,
    ),

    aboutCompany: stringValue(
      source.aboutCompany,
    ),

    mobile: stringValue(
      source.mobile,
    ),

    phone: stringValue(
      source.phone,
    ),

    whatsapp: stringValue(
      source.whatsapp,
    ),

    email: stringValue(
      source.email,
    ),

    website: stringValue(
      source.website,
    ),

    address: stringValue(
      source.address,
    ),

    city: stringValue(
      source.city,
    ),

    state: stringValue(
      source.state,
    ),

    pincode: stringValue(
      source.pincode,
    ),

    googleMapLink: stringValue(
      source.googleMapLink,
    ),
  };
}

/* =========================================================
   CREATE CATALOG
========================================================= */

export async function POST(
  request: NextRequest,
) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      userId,
      username,
      templateId,
      layoutTemplateId,
      category,
      hero,
      company,
      billing,
      products,
      productCategories,
      isPublished,
    } = body;

    /* =====================================================
       USER ID
    ===================================================== */

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       USERNAME
    ===================================================== */

    const cleanUsername =
      normalizeUsername(
        username || "",
      );

    if (!cleanUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username must contain at least 3 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !/^[a-z0-9_-]{3,30}$/.test(
        cleanUsername,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       CHECK USERNAME
    ===================================================== */

    const existing =
      await Catalog.findOne({
        username: cleanUsername,
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is already taken.",
        },
        {
          status: 409,
        },
      );
    }

    /* =====================================================
       RESOLVE TEMPLATE
    ===================================================== */

    const selectedLayoutTemplateId =
      resolveLayoutTemplateId(
        layoutTemplateId,
        templateId,
      );

    console.log(
      "[Catalog POST] Selected template:",
      selectedLayoutTemplateId,
    );

    /* =====================================================
       CREATE CATALOG
    ===================================================== */

    const catalog =
      await Catalog.create({
        userId,

        username:
          cleanUsername,

        /*
         * Keep both fields synchronized.
         *
         * layoutTemplateId is the new source of truth.
         * templateId remains for backwards compatibility.
         */
        templateId:
          selectedLayoutTemplateId,

        layoutTemplateId:
          selectedLayoutTemplateId,

        // No fallback — leave unset until the user actually picks a
        // category. undefined is dropped by Mongoose rather than
        // stored as an empty/placeholder value.
        category:
          typeof category === "string" && category.trim()
            ? category.trim()
            : undefined,

        hero: cleanHero(hero),

        company:
          cleanCompany(company),

        billing:
          cleanBilling(billing),

        products:
          mapProducts(products),

        productCategories:
          mapProductCategories(productCategories),

        paymentStatus:
          "pending",

        paymentOrderId:
          null,

        paymentId:
          null,

        paymentSignature:
          null,

        paidAt:
          null,

        isPublished:
          false,
      });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Catalog created successfully.",

        catalog,

        catalogId:
          catalog._id.toString(),

        templateId:
          selectedLayoutTemplateId,

        layoutTemplateId:
          selectedLayoutTemplateId,
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    console.error(
      "CREATE CATALOG ERROR:",
      error,
    );

    if (
      error?.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is already taken.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create catalog.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   UPDATE CATALOG
========================================================= */

export async function PUT(
  request: NextRequest,
) {
  try {
    await connectDB();

    const body =
      await request.json();

    const {
      catalogId,
      userId,
      username,
      templateId,
      layoutTemplateId,
      category,
      hero,
      company,
      billing,
      products,
      productCategories,
      isPublished,
    } = body;

    /* =====================================================
       CATALOG ID
    ===================================================== */

    if (!catalogId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catalog ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FIND CATALOG
    ===================================================== */

    const catalog =
      await Catalog.findById(
        catalogId,
      );

    if (!catalog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catalog not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* =====================================================
       OWNERSHIP
    ===================================================== */

    if (
      userId &&
      String(catalog.userId) !==
        String(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to update this catalog.",
        },
        {
          status: 403,
        },
      );
    }

    /* =====================================================
       UPDATE USERNAME
    ===================================================== */

    if (
      typeof username === "string"
    ) {
      const cleanUsername =
        normalizeUsername(
          username,
        );

      if (
        cleanUsername.length < 3
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username must contain at least 3 characters.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        !/^[a-z0-9_-]{3,30}$/.test(
          cleanUsername,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid username.",
          },
          {
            status: 400,
          },
        );
      }

      const duplicate =
        await Catalog.findOne({
          username:
            cleanUsername,

          _id: {
            $ne: catalogId,
          },
        });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username is already taken.",
          },
          {
            status: 409,
          },
        );
      }

      catalog.username =
        cleanUsername;
    }

    /* =====================================================
       UPDATE COMPANY
    ===================================================== */

    if (
      company !== undefined
    ) {
      catalog.company =
        cleanCompany(company);
    }

    if (
      billing !== undefined
    ) {
      catalog.billing =
        cleanBilling(billing);
    }

    /* =====================================================
       UPDATE PRODUCTS
    ===================================================== */

    if (
      Array.isArray(products)
    ) {
      catalog.products =
        mapProducts(products);
    }

    if (
      Array.isArray(productCategories)
    ) {
      catalog.productCategories =
        mapProductCategories(productCategories);
    }

    if (typeof category === "string" && category.trim()) {
      catalog.category = category.trim();
    }
    if (hero !== undefined) {
      catalog.hero = cleanHero(hero);
    }

    if (typeof isPublished === "boolean") {
      catalog.isPublished = isPublished;
    }

    /* =====================================================
       UPDATE TEMPLATE
    ===================================================== */

    if (
      layoutTemplateId !==
        undefined ||
      templateId !== undefined
    ) {
      const selectedLayoutTemplateId =
        resolveLayoutTemplateId(
          layoutTemplateId,
          templateId,
        );

      console.log(
        "[Catalog PUT] Selected template:",
        selectedLayoutTemplateId,
      );

      /*
       * New source of truth
       */
      catalog.layoutTemplateId =
        selectedLayoutTemplateId;

      /*
       * Keep legacy field synchronized
       */
      catalog.templateId =
        selectedLayoutTemplateId;
    }

    /* =====================================================
       SAVE
    ===================================================== */

    await catalog.save();

    /* =====================================================
       RESOLVE FINAL TEMPLATE
    ===================================================== */

    const resolvedLayoutTemplateId =
      resolveLayoutTemplateId(
        catalog.layoutTemplateId,
        catalog.templateId,
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Catalog updated successfully.",

        catalog,

        catalogId:
          catalog._id.toString(),

        templateId:
          resolvedLayoutTemplateId,

        layoutTemplateId:
          resolvedLayoutTemplateId,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error(
      "UPDATE CATALOG ERROR:",
      error,
    );

    if (
      error?.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is already taken.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update catalog.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   GET CATALOGS
========================================================= */

export async function GET(
  request: NextRequest,
) {
  try {
    await connectDB();

    const {
      searchParams,
    } = new URL(
      request.url,
    );

    const userId =
      searchParams.get(
        "userId",
      );

    const catalogId =
      searchParams.get(
        "catalogId",
      );

    const username =
      normalizeUsername(
        searchParams.get(
          "username",
        ) || "",
      );

    /* =====================================================
       SINGLE CATALOG BY ID
    ===================================================== */

    if (catalogId) {
      const catalog =
        await Catalog.findById(
          catalogId,
        ).lean();

      if (!catalog) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Catalog not found.",
          },
          {
            status: 404,
          },
        );
      }

      /* ===================================================
         OWNERSHIP CHECK
      =================================================== */

      if (
        userId &&
        String(
          catalog.userId,
        ) !== String(userId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You are not authorized to access this catalog.",
          },
          {
            status: 403,
          },
        );
      }

      /* ===================================================
         RESOLVE TEMPLATE
      =================================================== */

      const resolvedLayoutTemplateId =
        resolveLayoutTemplateId(
          (catalog as any)
            .layoutTemplateId,
          (catalog as any)
            .templateId,
        );

      return NextResponse.json({
        success: true,

        catalog: {
          ...catalog,

          /*
           * Always expose the resolved new field.
           */
          layoutTemplateId:
            resolvedLayoutTemplateId,

          /*
           * Keep both fields synchronized
           * in the API response.
           */
          templateId:
            resolvedLayoutTemplateId,
        },
      });
    }

    /* =====================================================
       SINGLE CATALOG BY USERNAME
    ===================================================== */

    if (username) {
      const catalog =
        await Catalog.findOne({
          username,
        }).lean();

      if (!catalog) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Catalog not found.",
          },
          {
            status: 404,
          },
        );
      }

      /* ===================================================
         RESOLVE TEMPLATE
      =================================================== */

      const resolvedLayoutTemplateId =
        resolveLayoutTemplateId(
          (catalog as any)
            .layoutTemplateId,
          (catalog as any)
            .templateId,
        );

      return NextResponse.json({
        success: true,

        catalog: {
          ...catalog,

          layoutTemplateId:
            resolvedLayoutTemplateId,

          templateId:
            resolvedLayoutTemplateId,
        },
      });
    }

    /* =====================================================
       ALL CATALOGS FOR DASHBOARD
    ===================================================== */

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      // Dashboard listing only ever needs the products COUNT, never
      // each product's own image/description/price — the $size +
      // $project below computes that count in Mongo instead of
      // shipping every catalog's full products array over the wire.
      const catalogs =
        await Catalog.aggregate([
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

      const mappedCatalogs =
        catalogs.map(
          (catalog: any) => {
            const resolvedLayoutTemplateId =
              resolveLayoutTemplateId(
                catalog.layoutTemplateId,
                catalog.templateId,
              );

            return {
              ...catalog,

              layoutTemplateId:
                resolvedLayoutTemplateId,

              templateId:
                resolvedLayoutTemplateId,
            };
          },
        );

      return NextResponse.json({
        success: true,

        catalogs:
          mappedCatalogs,
      });
    }

    /* =====================================================
       INVALID REQUEST
    ===================================================== */

    return NextResponse.json(
      {
        success: false,
        message:
          "userId, catalogId or username is required.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "GET CATALOG ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch catalog.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   DELETE CATALOG
========================================================= */

export async function DELETE(
  request: NextRequest,
) {
  try {
    await connectDB();

    const {
      searchParams,
    } = new URL(
      request.url,
    );

    const catalogId =
      searchParams.get(
        "catalogId",
      );

    const userId =
      searchParams.get(
        "userId",
      );

    /* =====================================================
       VALIDATE CATALOG ID
    ===================================================== */

    if (!catalogId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catalog ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FIND CATALOG
    ===================================================== */

    const catalog =
      await Catalog.findById(
        catalogId,
      );

    if (!catalog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catalog not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* =====================================================
       OWNERSHIP
    ===================================================== */

    if (
      userId &&
      String(
        catalog.userId,
      ) !== String(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to delete this catalog.",
        },
        {
          status: 403,
        },
      );
    }

    /* =====================================================
       DELETE
    ===================================================== */

    await Catalog.findByIdAndDelete(
      catalogId,
    );

    return NextResponse.json({
      success: true,

      message:
        "Catalog deleted successfully.",

      catalogId,
    });
  } catch (error) {
    console.error(
      "DELETE CATALOG ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete catalog.",
      },
      {
        status: 500,
      },
    );
  }
}