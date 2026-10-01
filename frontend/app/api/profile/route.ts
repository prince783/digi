import {
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/app/lib/auth";
import User from "@/app/models/User";

function serializeUser(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    designation: user.designation,
    companyName: user.companyName,
    email: user.email,
    phone: user.mobile,
    profilePhoto: user.profilePhoto || "",
    bio: user.bio || "",
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export async function GET() {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,

      user: serializeUser(user),
    });
  } catch (error) {
    console.error(
      "PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch profile.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const fields = ["name", "designation", "companyName", "email", "mobile", "bio"];
    const updates: Record<string, string> = {};

    for (const field of fields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return NextResponse.json(
            { success: false, message: `${field} must be text.` },
            { status: 400 },
          );
        }

        updates[field] = body[field].trim();
      }
    }

    for (const requiredField of ["name", "designation", "companyName", "email", "mobile"]) {
      if (!updates[requiredField]) {
        return NextResponse.json(
          { success: false, message: `${requiredField} is required.` },
          { status: 400 },
        );
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (updates.bio.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Bio must be 1000 characters or less." },
        { status: 400 },
      );
    }

    const duplicate = await User.findOne({
      _id: { $ne: user._id },
      $or: [{ email: updates.email }, { mobile: updates.mobile }],
    }).lean();

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Email or mobile number is already in use." },
        { status: 409 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        strict: false,
      },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User profile could not be found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "Email or mobile number is already in use." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to update profile." },
      { status: 500 },
    );
  }
}