import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary environment variables are missing");

      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary configuration is missing",
        },
        { status: 500 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);

    const folder = "digital-cards/profile-photos";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      apiSecret
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate Cloudinary signature",
      },
      { status: 500 }
    );
  }
}