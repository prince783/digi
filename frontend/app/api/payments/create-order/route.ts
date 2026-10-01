import {
  NextRequest,
  NextResponse,
} from "next/server";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";

import { razorpay } from "@/app/lib/razorpay";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

interface PricingResponse {
  success?: boolean;

  price?: number | string;

  yearlyPrice?: number | string;

  amount?: number | string;

  data?: {
    price?: number | string;
    yearlyPrice?: number | string;
    amount?: number | string;
  };

  pricing?: {
    price?: number | string;
    yearlyPrice?: number | string;
    amount?: number | string;
  };

  message?: string;
}

/* =========================================================
   GET ADMIN PRICE
========================================================= */

async function getAdminPrice(
  request: NextRequest
): Promise<number> {
  /*
  =========================================================
  GET CURRENT HOST
  =========================================================

  We call your existing pricing API:

  /api/pricing/digital-visiting-card

  This ensures the payment API uses the SAME price
  that your payment page displays.
  */

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    "http";

  const host =
    request.headers.get("host");

  if (!host) {
    throw new Error(
      "Unable to determine application host."
    );
  }

  const pricingUrl =
    `${protocol}://${host}/api/pricing/digital-visiting-card`;

  console.log(
    "FETCHING ADMIN PRICE FROM:",
    pricingUrl
  );

  const response =
    await fetch(pricingUrl, {
      method: "GET",

      headers: {
        "Content-Type":
          "application/json",
      },

      cache: "no-store",
    });

  const pricingData: PricingResponse =
    await response.json();

  console.log(
    "ADMIN PRICING RESPONSE:",
    pricingData
  );

  if (!response.ok) {
    throw new Error(
      pricingData?.message ||
        "Failed to fetch current subscription price."
    );
  }

  /*
  =========================================================
  EXTRACT PRICE
  =========================================================

  Supports all of these responses:

  {
    price: 799
  }

  {
    yearlyPrice: 799
  }

  {
    amount: 799
  }

  {
    data: {
      price: 799
    }
  }

  {
    pricing: {
      yearlyPrice: 799
    }
  }
  */

  const price = Number(
    pricingData?.price ??
      pricingData?.yearlyPrice ??
      pricingData?.amount ??
      pricingData?.data?.price ??
      pricingData?.data?.yearlyPrice ??
      pricingData?.data?.amount ??
      pricingData?.pricing?.price ??
      pricingData?.pricing?.yearlyPrice ??
      pricingData?.pricing?.amount ??
      0
  );

  console.log(
    "CURRENT ADMIN BASE PRICE:",
    price
  );

  /*
  =========================================================
  VALIDATE PRICE
  =========================================================
  */

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new Error(
      "Invalid digital visiting card price configured by admin."
    );
  }

  /*
  =========================================================
  RETURN TWO DECIMAL PRICE
  =========================================================
  */

  return Number(
    price.toFixed(2)
  );
}

/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /*
    =======================================================
    READ REQUEST
    =======================================================
    */

    const body =
      await request.json();

    const username =
      body?.username;

    console.log(
      "========================================"
    );

    console.log(
      "CREATE RAZORPAY ORDER"
    );

    console.log(
      "USERNAME:",
      username
    );

    console.log(
      "========================================"
    );

    /*
    =======================================================
    VALIDATE USERNAME
    =======================================================
    */

    if (
      !username ||
      typeof username !== "string"
    ) {
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

    /*
    =======================================================
    DATABASE
    =======================================================
    */

    await connectDB();

    const normalizedUsername =
      username
        .trim()
        .toLowerCase();

    const card =
      await DigitalCard.findOne({
        username:
          normalizedUsername,
      });

    /*
    =======================================================
    CARD NOT FOUND
    =======================================================
    */

    if (!card) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Digital card not found.",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "CARD ID:",
      card._id.toString()
    );

    /*
    =======================================================
    ALREADY PAID
    =======================================================
    */

    if (
      card.paymentStatus ===
        "paid" &&
      card.isPublished === true
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This card has already been paid for.",
        },
        {
          status: 400,
        }
      );
    }

  

    const baseAmount =
      await getAdminPrice(
        request
      );

    console.log(
      "========================================"
    );

    console.log(
      "PRICE CALCULATION"
    );

    console.log(
      "BASE PRICE:",
      baseAmount
    );

    /*
    =======================================================
    TOTAL
    =======================================================
    */

    const totalAmount =
      Number(
        baseAmount.toFixed(2)
      );

    const amountInPaise =
      Math.round(
        totalAmount * 100
      );

    console.log(
      "RAZORPAY AMOUNT:",
      amountInPaise
    );

    console.log(
      "========================================"
    );

    /*
    =======================================================
    CREATE RAZORPAY ORDER
    =======================================================
    */

    const order =
      await razorpay.orders.create(
        {
          amount:
            amountInPaise,

          currency:
            "INR",

          receipt:
            `card_${card._id}_${Date.now()}`,

          notes: {
            username:
              normalizedUsername,

            cardId:
              card._id.toString(),

            product:
              "digital-visiting-card",

            plan:
              "1-year",

            baseAmount:
              baseAmount.toFixed(2),

            totalAmount:
              totalAmount.toFixed(2),
          },
        }
      );

    /*
    =======================================================
    RAZORPAY ORDER CREATED
    =======================================================
    */

    console.log(
      "RAZORPAY ORDER CREATED:",
      order.id
    );

    console.log(
      "RAZORPAY ORDER AMOUNT:",
      order.amount
    );

    /*
    =======================================================
    SAVE PAYMENT ORDER
    =======================================================
    */

    card.paymentStatus =
      "pending";

    card.paymentOrderId =
      order.id;

    await card.save();

    /*
    =======================================================
    RESPONSE
    =======================================================
    */

    return NextResponse.json(
      {
        success: true,

        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        orderId:
          order.id,

        amount:
          order.amount,

        currency:
          order.currency,

        baseAmount:
          baseAmount,

        totalAmount:
          totalAmount,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "CREATE ORDER ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create Razorpay order.",
      },
      {
        status: 500,
      }
    );
  }
}