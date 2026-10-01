import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import User from "@/app/models/User";

/* =========================================================
   NORMALIZE MOBILE
========================================================= */

function normalizeMobile(value: unknown): string {
  let mobile = String(value ?? "").replace(/\D/g, "");

  // +91XXXXXXXXXX / 91XXXXXXXXXX
  if (mobile.startsWith("91") && mobile.length === 12) {
    mobile = mobile.substring(2);
  }

  return mobile;
}

/* =========================================================
   POST
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const mobile = normalizeMobile(body?.mobile);

    console.log("=================================");
    console.log("LOGIN USER CHECK");
    console.log("Received mobile:", body?.mobile);
    console.log("Normalized mobile:", mobile);
    console.log("=================================");

    /* =====================================================
       VALIDATE MOBILE
    ===================================================== */

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_MOBILE",
          message:
            "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       CONNECT DATABASE
    ===================================================== */

    await connectDB();

    /* =====================================================
       FIND USER
    ===================================================== */

    /*
     * We support all of these formats:
     *
     * 9876543210
     * 919876543210
     * +919876543210
     */

    const possibleMobiles = [
      mobile,
      `91${mobile}`,
      `+91${mobile}`,
    ];

    const user = await User.findOne({
      mobile: {
        $in: possibleMobiles,
      },
    }).lean();

    console.log("Searching mobiles:", possibleMobiles);
    console.log("USER FOUND:", Boolean(user));

    /* =====================================================
       USER NOT FOUND
    ===================================================== */

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          code: "USER_NOT_FOUND",
          message:
            "No account found with this mobile number. Please register first.",
        },
        { status: 404 },
      );
    }

    /* =====================================================
       USER FOUND
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        code: "USER_FOUND",
        message: "Account found.",

        user: {
          id: String(user._id),
          mobile: user.mobile,
          name: user.name ?? "",
          email: user.email ?? "",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("LOGIN USER CHECK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        code: "LOGIN_CHECK_ERROR",
        message:
          "Unable to check your account. Please try again.",
      },
      { status: 500 },
    );
  }
}