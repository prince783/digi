import { NextResponse } from "next/server";

import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        name: user.name || "",
        email: user.email || "",
        profilePhoto: user.profilePhoto || "",
        companyName: user.companyName || "",
        designation: user.designation || "",
        bio: user.bio || "",
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get current user",
      },
      {
        status: 500,
      }
    );
  }
}