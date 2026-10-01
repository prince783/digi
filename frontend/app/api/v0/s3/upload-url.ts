import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;

const s3 =
  region && accessKeyId && secretAccessKey
    ? new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })
    : null;

export async function POST(req: NextRequest) {
  try {
    // Check AWS configuration first
    if (
      !region ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "AWS configuration missing",
        },
        { status: 500 }
      );
    }

    if (!s3) {
      return NextResponse.json(
        {
          success: false,
          message: "S3 client could not be initialized",
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      fileName,
      fileType,
    } = body as {
      fileName?: string;
      fileType?: string;
    };

    if (!fileName || !fileType) {
      return NextResponse.json(
        {
          success: false,
          message:
            "fileName and fileType are required",
        },
        { status: 400 }
      );
    }

    const key = `uploads/${uuidv4()}_${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(
      s3,
      command,
      {
        expiresIn: 3600,
      }
    );

    const fileUrl =
      `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json(
      {
        success: true,
        uploadUrl,
        fileUrl,
        fileName: key,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "S3 upload URL generation error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate upload URL";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate upload URL",
        error: message,
      },
      { status: 500 }
    );
  }
}