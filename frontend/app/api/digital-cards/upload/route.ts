import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       ALLOWED FILE TYPES
    ===================================================== */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "File type is not allowed",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       FILE SIZE
    ===================================================== */

    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "File size must be less than 10 MB",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       EXTENSION
    ===================================================== */

    const originalName = file.name;

    const extension =
      path.extname(originalName).toLowerCase() ||
      (file.type === "application/pdf" ? ".pdf" : ".jpg");

    /* =====================================================
       UNIQUE FILE NAME
    ===================================================== */

    const fileName = `${crypto.randomUUID()}${extension}`;

    /* =====================================================
       UPLOAD DIRECTORY
    ===================================================== */

    const uploadDirectory = path.join(
      process.cwd(),
      "frontend",
      "public",
      "uploads",
      "digital-cards"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    /* =====================================================
       SAVE FILE
    ===================================================== */

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    /* =====================================================
       PUBLIC URL
    ===================================================== */

    const url =
      `/uploads/digital-cards/${fileName}`;

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",

        url,

        name: originalName,

        size: file.size,

        type: file.type,

        publicId: fileName,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DIGITAL CARD FILE UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload file",
      },
      {
        status: 500,
      }
    );
  }
}