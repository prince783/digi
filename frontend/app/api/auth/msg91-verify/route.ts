import {
  NextRequest,
  NextResponse,
} from "next/server";

import connectDB from "@/app/lib/db";
import { createSession } from "@/app/lib/auth";
import User from "@/app/models/User";
import { verifyOtpAccessToken } from "@/app/lib/truebulk-otp";

/* =========================================================
   REQUEST TYPE
========================================================= */

interface VerifyRequest {
  mobile?: string;
  accessToken?: string;
}

/* =========================================================
   NORMALIZE MOBILE
========================================================= */

function normalizeMobile(
  value: unknown,
): string {
  let mobile = String(value ?? "").replace(
    /\D/g,
    "",
  );

  /*
   * 919876543210
   *       ↓
   * 9876543210
   */

  if (
    mobile.length === 12 &&
    mobile.startsWith("91")
  ) {
    mobile = mobile.substring(2);
  }

  /*
   * +919876543210
   *       ↓
   * 919876543210
   *       ↓
   * 9876543210
   */

  if (
    mobile.length > 10 &&
    mobile.startsWith("91")
  ) {
    mobile = mobile.substring(
      mobile.length - 10,
    );
  }

  return mobile;
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest,
) {
  try {
    /* =====================================================
       READ REQUEST
    ===================================================== */

    const body =
      (await request.json()) as VerifyRequest;

    const mobile = normalizeMobile(
      body.mobile,
    );
    const accessToken = String(body.accessToken || "");

    if (!verifyOtpAccessToken(accessToken, mobile)) {
      return NextResponse.json(
        { success: false, message: "OTP verification is required." },
        { status: 401 },
      );
    }

    console.log(
      "=================================",
    );

    console.log(
      "MSG91 LOGIN FINALIZATION",
    );

    console.log(
      "Received mobile:",
      body.mobile,
    );

    console.log(
      "Normalized mobile:",
      mobile,
    );

    console.log(
      "=================================",
    );

    /* =====================================================
       VALIDATE MOBILE
    ===================================================== */

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_MOBILE",
          message:
            "Invalid mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       CONNECT MONGODB
    ===================================================== */

    await connectDB();

    console.log(
      "MongoDB connected for login.",
    );

    /* =====================================================
       FIND USER
    ===================================================== */

    const possibleMobiles = [
      mobile,
      `91${mobile}`,
      `+91${mobile}`,
    ];

    console.log(
      "Searching user with:",
      possibleMobiles,
    );

    const user = await User.findOne({
      mobile: {
        $in: possibleMobiles,
      },
    });

    /* =====================================================
       USER NOT FOUND
    ===================================================== */

    if (!user) {
      console.log(
        "LOGIN USER NOT FOUND:",
        mobile,
      );

      return NextResponse.json(
        {
          success: false,
          code: "USER_NOT_FOUND",
          message:
            "No account found with this mobile number. Please register first.",
        },
        {
          status: 404,
        },
      );
    }

    console.log(
      "LOGIN USER FOUND:",
      user._id.toString(),
    );

    /* =====================================================
       VERIFY USER
    ===================================================== */

    if (!user.isVerified) {
      user.isVerified = true;

      await user.save();

      console.log(
        "User marked as verified.",
      );
    }

    /* =====================================================
       CREATE APPLICATION SESSION
    ===================================================== */

    await createSession(
      user._id.toString(),
    );

    console.log(
      "Application session created.",
    );

    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "LOGIN SUCCESSFUL FOR:",
      mobile,
    );

    return NextResponse.json(
      {
        success: true,
        code: "LOGIN_SUCCESS",
        message:
          "Login successful.",

        user: {
          id: user._id.toString(),

          name:
            user.name ?? "",

          designation:
            user.designation ?? "",

          companyName:
            user.companyName ?? "",

          email:
            user.email ?? "",

          mobile:
            user.mobile ?? mobile,

          bio:
            user.bio ?? "",

          isVerified:
            Boolean(user.isVerified),

          role:
            user.role ?? "user",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "MSG91 LOGIN FINALIZATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        code: "LOGIN_FINALIZATION_ERROR",
        message:
          "Unable to complete login.",
      },
      {
        status: 500,
      },
    );
  }
}