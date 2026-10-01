import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import SupportTicket from "@/app/models/SupportTicket";

export const runtime = "nodejs";

/* =========================================================
   HELPERS
========================================================= */

function isValidObjectId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value)
  );
}

/**
 * Get user ID from:
 *
 * 1. userId cookie
 * 2. x-user-id header
 * 3. Authorization Bearer token if your auth system
 *    puts the MongoDB user ID directly in the token
 * 4. request body userId
 * 5. query parameter userId
 *
 * The body/query fallbacks are intentionally supported
 * for compatibility with the current frontend.
 */
function getUserId(
  request: NextRequest,
  body?: Record<string, unknown>,
): string | null {
  /* -------------------------------------------------------
     1. COOKIE
  ------------------------------------------------------- */

  const cookieUserId =
    request.cookies.get("userId")?.value?.trim();

  if (isValidObjectId(cookieUserId)) {
    return cookieUserId;
  }

  /* -------------------------------------------------------
     2. HEADER
  ------------------------------------------------------- */

  const headerUserId =
    request.headers.get("x-user-id")?.trim();

  if (isValidObjectId(headerUserId)) {
    return headerUserId;
  }

  /* -------------------------------------------------------
     3. AUTHORIZATION HEADER

     Only use this if the bearer value itself is a MongoDB
     ObjectId. We do NOT attempt to decode arbitrary JWTs
     here because your authentication implementation may
     differ.
  ------------------------------------------------------- */

  const authorization =
    request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    const bearerToken =
      authorization.substring(7).trim();

    if (isValidObjectId(bearerToken)) {
      return bearerToken;
    }
  }

  /* -------------------------------------------------------
     4. BODY
  ------------------------------------------------------- */

  const bodyUserId =
    typeof body?.userId === "string"
      ? body.userId.trim()
      : "";

  if (isValidObjectId(bodyUserId)) {
    return bodyUserId;
  }

  /* -------------------------------------------------------
     5. QUERY PARAMETER
  ------------------------------------------------------- */

  const queryUserId =
    request.nextUrl.searchParams
      .get("userId")
      ?.trim();

  if (isValidObjectId(queryUserId)) {
    return queryUserId;
  }

  return null;
}

/* =========================================================
   NORMALIZE USER
========================================================= */

function serializeUser(user: any) {
  return {
    id: user?._id
      ? user._id.toString()
      : "",

    _id: user?._id
      ? user._id.toString()
      : "",

    name: user?.name ?? "",

    email: user?.email ?? "",

    mobile: user?.mobile ?? "",

    companyName:
      user?.companyName ?? "",

    designation:
      user?.designation ?? "",

    profilePhoto:
      user?.profilePhoto ?? "",
  };
}

/* =========================================================
   GET
   LOAD SUPPORT TICKETS
========================================================= */

export async function GET(
  request: NextRequest,
) {
  try {
    await connectDB();

    const userId = getUserId(request);

    console.log(
      "========================================",
    );

    console.log(
      "SUPPORT GET",
    );

    console.log(
      "COOKIE USER ID:",
      request.cookies.get("userId")?.value,
    );

    console.log(
      "HEADER USER ID:",
      request.headers.get("x-user-id"),
    );

    console.log(
      "QUERY USER ID:",
      request.nextUrl.searchParams.get(
        "userId",
      ),
    );

    console.log(
      "FINAL USER ID:",
      userId,
    );

    console.log(
      "========================================",
    );

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User session not found. Please login again.",
        },
        {
          status: 401,
        },
      );
    }

    /* -------------------------------------------------------
       FIND USER
    ------------------------------------------------------- */

    const user =
      await User.findById(userId)
        .select(
          "_id name email mobile companyName designation profilePhoto",
        )
        .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found. Please login again.",
        },
        {
          status: 401,
        },
      );
    }

    /* -------------------------------------------------------
       FIND USER TICKETS
    ------------------------------------------------------- */

    const tickets =
      await SupportTicket.find({
        userId: user._id.toString(),
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,

      user: serializeUser(user),

      tickets,
    });
  } catch (error) {
    console.error(
      "SUPPORT GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to load support requests.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   POST
   CREATE SUPPORT TICKET
========================================================= */

export async function POST(
  request: NextRequest,
) {
  try {
    await connectDB();

    /* -------------------------------------------------------
       READ BODY
    ------------------------------------------------------- */

    let body: Record<string, unknown> = {};

    try {
      const parsedBody =
        await request.json();

      if (
        parsedBody &&
        typeof parsedBody === "object"
      ) {
        body =
          parsedBody as Record<
            string,
            unknown
          >;
      }
    } catch {
      body = {};
    }

    /* -------------------------------------------------------
       GET USER ID
    ------------------------------------------------------- */

    const userId =
      getUserId(request, body);

    console.log(
      "========================================",
    );

    console.log(
      "SUPPORT POST REQUEST",
    );

    console.log(
      "COOKIE USER ID:",
      request.cookies.get("userId")?.value,
    );

    console.log(
      "HEADER USER ID:",
      request.headers.get("x-user-id"),
    );

    console.log(
      "BODY USER ID:",
      body?.userId,
    );

    console.log(
      "FINAL USER ID:",
      userId,
    );

    console.log(
      "========================================",
    );

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User session not found. Please login again.",
        },
        {
          status: 401,
        },
      );
    }

    /* -------------------------------------------------------
       FIND USER
    ------------------------------------------------------- */

    const user =
      await User.findById(userId)
        .select(
          "_id name email mobile companyName designation profilePhoto",
        )
        .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found. Please login again.",
        },
        {
          status: 401,
        },
      );
    }

    /* -------------------------------------------------------
       READ FORM DATA
    ------------------------------------------------------- */

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const priority =
      typeof body.priority === "string"
        ? body.priority
            .trim()
            .toLowerCase()
        : "medium";

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a support category.",
        },
        {
          status: 400,
        },
      );
    }

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (subject.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject cannot exceed 150 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide at least 10 characters in your message.",
        },
        {
          status: 400,
        },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot exceed 2000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    /* -------------------------------------------------------
       CATEGORY
    ------------------------------------------------------- */

  const allowedCategories = [
  "Account",
  "Digital Visiting Card",
  "Resume",
  "Biography",
  "Payment",
  "Subscription",
  "Technical Issue",
  "Other",
] as const;

type SupportCategory =
  (typeof allowedCategories)[number];

const categoryMap: Record<
  string,
  SupportCategory
> = {
  account: "Account",
  "digital visiting card":
    "Digital Visiting Card",
  resume: "Resume",
  biography: "Biography",
  payment: "Payment",
  subscription: "Subscription",
  "technical issue":
    "Technical Issue",
  other: "Other",
};

const normalizedCategory =
  category.trim().toLowerCase();

const finalCategory =
  categoryMap[normalizedCategory];

if (!finalCategory) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Invalid support category.",
    },
    {
      status: 400,
    },
  );
}
 

    /* -------------------------------------------------------
       PRIORITY

       SupportTicket expects:
       Low | Medium | High | Urgent
    ------------------------------------------------------- */

    const allowedPriorities = [
      "Low",
      "Medium",
      "High",
      "Urgent",
    ] as const;

    const priorityMap: Record<
      string,
      (typeof allowedPriorities)[number]
    > = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };

    const finalPriority =
      priorityMap[priority] ||
      "Medium";

    /* -------------------------------------------------------
       CREATE TICKET
    ------------------------------------------------------- */

    const ticket =
      await SupportTicket.create({
        userId: user._id.toString(),

        name:
          user.name ?? "",

        email:
          user.email ?? "",

        mobile:
          user.mobile ?? "",

        category:
          finalCategory,

        subject,

        message,

        priority:
          finalPriority,

        status: "Open",
      });

    /* -------------------------------------------------------
       SUCCESS
    ------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        message:
          "Your support request has been submitted successfully.",

        ticket,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "SUPPORT POST ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to submit support request.",
      },
      {
        status: 500,
      },
    );
  }
}