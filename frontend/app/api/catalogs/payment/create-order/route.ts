import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";
import { normalizeCatalogThemeId } from "@/lib/catalogThemes";
import Pricing from "@/app/models/Pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   CONSTANTS
========================================================= */

const GST_RATE = 0;

/* =========================================================
   TYPES
========================================================= */

interface CatalogCompany {
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
  googleMapLink: string;
}

interface CleanProduct {
  id: string;
  name: string;
  description: string;
  sellingPrice: number;
  mrp: number;
  image: string;
}

interface CatalogHero {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeUsername(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

/* ---------------------------------------------------------
   STRING VALUE
--------------------------------------------------------- */

function stringValue(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanHero(value: unknown): CatalogHero {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    eyebrow: stringValue(source.eyebrow),
    title: stringValue(source.title),
    description: stringValue(source.description),
    image: stringValue(source.image),
  };
}

/* ---------------------------------------------------------
   NUMBER VALUE
--------------------------------------------------------- */

function numberValue(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

/* ---------------------------------------------------------
   CLEAN COMPANY
--------------------------------------------------------- */

function cleanCompany(
  value: unknown
): CatalogCompany {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    fullName:
      stringValue(
        source.fullName
      ),

    companyName:
      stringValue(
        source.companyName
      ),

    designation:
      stringValue(
        source.designation
      ),

    profilePhoto:
      stringValue(
        source.profilePhoto
      ),

    logo:
      stringValue(
        source.logo ||
        source.companyLogo
      ),

    tagline:
      stringValue(
        source.tagline
      ),

    aboutCompany:
      stringValue(
        source.aboutCompany
      ),

    mobile:
      stringValue(
        source.mobile
      ),

    phone:
      stringValue(
        source.phone
      ),

    whatsapp:
      stringValue(
        source.whatsapp
      ),

    email:
      stringValue(
        source.email
      ),

    website:
      stringValue(
        source.website
      ),

    address:
      stringValue(
        source.address
      ),

    googleMapLink:
      stringValue(
        source.googleMapLink
      ),
  };
}

/* ---------------------------------------------------------
   CLEAN PRODUCTS
--------------------------------------------------------- */

function cleanProducts(
  value: unknown
): CleanProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((product: any): CleanProduct => ({
      id:
        stringValue(
          product?.id
        ),

      name:
        stringValue(
          product?.name
        ),

      description:
        stringValue(
          product?.description
        ),

      sellingPrice:
        numberValue(
          product?.sellingPrice
        ),

      mrp:
        numberValue(
          product?.mrp
        ),

      image:
        stringValue(
          product?.image
        ),
    }))
    .filter(
      (product) =>
        Boolean(
          product.name ||
          product.image
        )
    );
}

/* =========================================================
   POST
   CREATE CATALOG RAZORPAY ORDER
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /* =====================================================
       DATABASE
    ===================================================== */

    await connectDB();

    /* =====================================================
       READ REQUEST
    ===================================================== */

    const body =
      await request.json();

    const userId =
      stringValue(
        body?.userId
      );

    const username =
      normalizeUsername(
        body?.username
      );

    const layoutTemplateId =
      normalizeCatalogThemeId(
        body?.layoutTemplateId,
      );

    const company: CatalogCompany =
      cleanCompany(
        body?.company
      );

    const hero: CatalogHero =
      cleanHero(
        body?.hero
      );

    const products: CleanProduct[] =
      cleanProducts(
        body?.products
      );

    console.log(
      "=========================================="
    );

    console.log(
      "[Catalog Payment] CREATE ORDER"
    );

    console.log(
      "[Catalog Payment] User ID:",
      userId
    );

    console.log(
      "[Catalog Payment] Username:",
      username
    );

    console.log(
      "[Catalog Payment] Products:",
      products.length
    );

    /* =====================================================
       VALIDATE USER ID
    ===================================================== */

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE USERNAME
    ===================================================== */

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      username.length < 3 ||
      username.length > 30
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username must contain 3 to 30 characters.",
        },
        {
          status: 400,
        }
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
          message:
            "Invalid username.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE PRODUCTS
    ===================================================== */

    if (!products.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please add at least one product.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       GET ADMIN CATALOG PRICE
    =====================================================

       IMPORTANT:

       Payment price is NEVER taken from:

       product.sellingPrice
       product.mrp
       frontend amount
       frontend total

       It comes ONLY from:

       Pricing
       projectType = "catalog"
       isActive = true
   ===================================================== */

    const catalogPricing =
      await Pricing.findOne({
        projectType:
          "catalog",

        isActive:
          true,
      })
        .select(
          "_id projectType yearlyPrice isActive"
        )
        .lean();

    console.log(
      "[Catalog Payment] ADMIN PRICING:",
      catalogPricing
    );

    /* =====================================================
       ADMIN PRICE NOT FOUND
    ===================================================== */

    if (!catalogPricing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Catalog pricing is not configured in Admin Pricing.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       ADMIN BASE PRICE
    ===================================================== */

    const basePrice =
      Number(
        catalogPricing.yearlyPrice
      );

    if (
      !Number.isFinite(
        basePrice
      ) ||
      basePrice <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Catalog price. Please configure a valid Catalog price in Admin Pricing.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       ROUND BASE PRICE
    ===================================================== */

    const finalBasePrice =
      Number(
        basePrice.toFixed(2)
      );

    /* =====================================================
       GST
    ===================================================== */

    const gst =
      Number(
        (
          finalBasePrice *
          GST_RATE /
          100
        ).toFixed(2)
      );

    /* =====================================================
       FINAL TOTAL
    ===================================================== */

    const totalAmount =
      Number(
        (
          finalBasePrice +
          gst
        ).toFixed(2)
      );

    /* =====================================================
       RAZORPAY PAISE
    ===================================================== */

    const amountInPaise =
      Math.round(
        totalAmount * 100
      );

    console.log(
      "=========================================="
    );

    console.log(
      "[Catalog Payment] PRICE CALCULATION"
    );

    console.log(
      "[Catalog Payment] Admin Base Price:",
      finalBasePrice
    );

    console.log(
      "[Catalog Payment] GST Rate:",
      GST_RATE
    );

    console.log(
      "[Catalog Payment] GST:",
      gst
    );

    console.log(
      "[Catalog Payment] Final Total:",
      totalAmount
    );

    console.log(
      "[Catalog Payment] Razorpay Paise:",
      amountInPaise
    );

    console.log(
      "=========================================="
    );

    /* =====================================================
       RAZORPAY ENVIRONMENT
    ===================================================== */

    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (
      !keyId ||
      !keySecret
    ) {
      console.error(
        "[Catalog Payment] Razorpay environment variables missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay configuration is missing.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       RAZORPAY INSTANCE
    ===================================================== */

    const razorpay =
      new Razorpay({
        key_id:
          keyId,

        key_secret:
          keySecret,
      });

    /* =====================================================
       FIND EXISTING CATALOG
    ===================================================== */

    let catalog: any =
      await Catalog.findOne({
        username,
      });

    /* =====================================================
       CREATE / UPDATE CATALOG
    ===================================================== */

    if (catalog) {
      /*
      -----------------------------------------------------
      EXISTING CATALOG
      -----------------------------------------------------
      */

      catalog.userId =
        userId;

      catalog.company =
        company;

      catalog.hero =
        hero;

      catalog.products =
        products;

      catalog.layoutTemplateId =
        layoutTemplateId;
      catalog.templateId =
        layoutTemplateId;

      /*
      IMPORTANT:

      This is the ADMIN PRICE + GST.

      It is NOT the product selling price.
      */

      catalog.paymentAmount =
        totalAmount;

      catalog.paymentStatus =
        "pending";

      catalog.isPublished =
        false;

      await catalog.save();

      console.log(
        "[Catalog Payment] Existing catalog:",
        catalog._id.toString()
      );
    } else {
      /*
      -----------------------------------------------------
      NEW CATALOG
      -----------------------------------------------------
      */

      catalog =
        await Catalog.create({
          userId,

          username,

          layoutTemplateId,

          templateId:
            layoutTemplateId,

          company,

          hero,

          products,

          /*
          ADMIN CATALOG PRICE + GST
          */

          paymentAmount:
            totalAmount,

          paymentStatus:
            "pending",

          isPublished:
            false,
        });

      console.log(
        "[Catalog Payment] New catalog:",
        catalog._id.toString()
      );
    }

    /* =====================================================
       CREATE RAZORPAY ORDER
    ===================================================== */

    const razorpayOrder =
      await razorpay.orders.create({
        amount:
          amountInPaise,

        currency:
          "INR",

        receipt:
          `catalog_${catalog._id
            .toString()
            .slice(-10)}_${Date.now()}`,

        notes: {
          /*
          Catalog information
          */

          catalogId:
            catalog._id.toString(),

          username,

          userId,

          product:
            "catalog",

          plan:
            "1-year",

          /*
          ADMIN PRICE
          */

          catalogBasePrice:
            finalBasePrice.toFixed(2),

          /*
          GST
          */

          gstRate:
            String(
              GST_RATE
            ),

          gstAmount:
            gst.toFixed(2),

          /*
          FINAL PAYMENT
          */

          catalogTotal:
            totalAmount.toFixed(2),

          productCount:
            String(
              products.length
            ),
        },
      });

    console.log(
      "=========================================="
    );

    console.log(
      "[Catalog Payment] RAZORPAY ORDER CREATED"
    );

    console.log(
      "Order ID:",
      razorpayOrder.id
    );

    console.log(
      "Amount:",
      razorpayOrder.amount
    );

    console.log(
      "Currency:",
      razorpayOrder.currency
    );

    console.log(
      "=========================================="
    );

    /* =====================================================
       SAVE RAZORPAY ORDER
    ===================================================== */

    catalog.paymentOrderId =
      razorpayOrder.id;

    catalog.paymentAmount =
      totalAmount;

    catalog.paymentStatus =
      "pending";

    catalog.isPublished =
      false;

    await catalog.save();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        /*
        Razorpay public key
        */

        key:
          keyId,

        /*
        Razorpay order
        */

        orderId:
          razorpayOrder.id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        /*
        Catalog
        */

        catalogId:
          catalog._id.toString(),

        username:
          catalog.username,

        /*
        IMPORTANT:
        These values are from ADMIN PRICING.
        */

        basePrice:
          finalBasePrice,

        subtotal:
          finalBasePrice,

        gst:
          gst,

        gstRate:
          GST_RATE,

        total:
          totalAmount,

        /*
        Payment object
        */

        payment: {
          basePrice:
            finalBasePrice,

          gst:
            gst,

          gstRate:
            GST_RATE,

          total:
            totalAmount,

          currency:
            "INR",
        },

        /*
        Order object
        */

        order: {
          id:
            razorpayOrder.id,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "=========================================="
    );

    console.error(
      "[Catalog Payment] CREATE ORDER ERROR"
    );

    console.error(
      error
    );

    console.error(
      "=========================================="
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create payment order.";

    return NextResponse.json(
      {
        success: false,

        message,
      },
      {
        status: 500,
      }
    );
  }
}