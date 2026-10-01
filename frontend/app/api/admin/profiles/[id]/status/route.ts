import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import { getCurrentAdmin } from "@/app/lib/auth";
import DigitalCard from "@/app/models/DigitalCard";
import Catalog from "@/app/models/Catalogs";
import Resume from "@/app/models/Resume";
import { getGlobalProfilesDataset } from "@/app/lib/profilesSummary";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_STATUS = [
  "active",
  "pending",
  "expired",
  "suspended",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUS)[number];

/* =========================================================
   PATCH
   SUSPEND / ACTIVATE PROFILE
========================================================= */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    if (!(await getCurrentAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    /* =====================================================
       VALIDATE ID
    ===================================================== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid profile ID",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       BODY
    ===================================================== */
    const body = await request.json();
    const status = body.status as AllowedStatus;
    const reason =
      typeof body.reason === "string" ? body.reason.trim() : "";

    /* =====================================================
       VALIDATE STATUS
    ===================================================== */
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid account status",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FIND PROFILE (DigitalCard, Catalog, or Resume)
       Also fallback to check by userId in case userId was provided
    ===================================================== */
    const targetObjectId = new mongoose.Types.ObjectId(id);

    let targetCollection: mongoose.mongo.Collection | null = null;
    let targetDocId: mongoose.Types.ObjectId | null = null;
    let targetType: "card" | "catalog" | "resume" = "card";

    // 1. Check DigitalCard
    const existingCard = await DigitalCard.findById(targetObjectId).lean();
    if (existingCard) {
      targetCollection = DigitalCard.collection;
      targetDocId = existingCard._id;
      targetType = "card";
    }

    // 2. Check Catalog
    if (!targetCollection) {
      const existingCatalog = await Catalog.findById(targetObjectId).lean();
      if (existingCatalog) {
        targetCollection = Catalog.collection;
        targetDocId = existingCatalog._id;
        targetType = "catalog";
      }
    }

    // 3. Check Resume
    if (!targetCollection) {
      const existingResume = await Resume.findById(targetObjectId).lean();
      if (existingResume) {
        targetCollection = Resume.collection;
        targetDocId = existingResume._id;
        targetType = "resume";
      }
    }

    // 4. Fallback: check if id is a userId
    if (!targetCollection) {
      const cardByUser = await DigitalCard.findOne({
        $or: [{ userId: id as any }, { userId: targetObjectId as any }],
      }).lean();
      if (cardByUser) {
        targetCollection = DigitalCard.collection;
        targetDocId = cardByUser._id;
        targetType = "card";
      } else {
        const catalogByUser = await Catalog.findOne({
          $or: [{ userId: id as any }, { userId: targetObjectId as any }],
        }).lean();
        if (catalogByUser) {
          targetCollection = Catalog.collection;
          targetDocId = catalogByUser._id;
          targetType = "catalog";
        } else {
          const resumeByUser = await Resume.findOne({
            $or: [{ userId: id as any }, { userId: targetObjectId as any }],
          }).lean();
          if (resumeByUser) {
            targetCollection = Resume.collection;
            targetDocId = resumeByUser._id;
            targetType = "resume";
          }
        }
      }
    }

    if (!targetCollection || !targetDocId) {
      return NextResponse.json(
        {
          success: false,
          message: "Profile not found",
        },
        {
          status: 404,
        },
      );
    }

    /* =====================================================
       PERFORM DATABASE UPDATE DIRECTLY
       Using collection.updateOne guarantees the field is written
       to MongoDB without Mongoose schema-cache stripping.
    ===================================================== */
    const now = new Date();
    const isSuspended = status === "suspended";
    const updateFields: Record<string, any> = {
      accountStatus: status,
      isPublished: status === "active",
      suspendedAt: isSuspended ? now : null,
      suspensionReason: isSuspended
        ? reason || "Suspended by administrator"
        : "",
      updatedAt: now,
    };

    const updateResult = await targetCollection.updateOne(
      { _id: targetDocId },
      { $set: updateFields },
    );

    if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Database update failed: record not found or could not be updated",
        },
        {
          status: 500,
        },
      );
    }

    /* =====================================================
       COMPUTE FRESH GLOBAL SUMMARY & PROFILE FROM MONGODB
    ===================================================== */
    const { allProfiles, summary } = await getGlobalProfilesDataset();
    const updatedProfile =
      allProfiles.find((p) => p.id === targetDocId.toString()) || null;

    const message =
      status === "suspended"
        ? "User suspended successfully."
        : status === "active"
          ? "User activated successfully."
          : `Profile status changed to ${status}`;

    return NextResponse.json({
      success: true,
      message,
      profile: updatedProfile || {
        id: targetDocId.toString(),
        type: targetType,
        status,
        accountStatus: status,
        isPublished: status === "active",
        suspendedAt: updateFields.suspendedAt,
        suspensionReason: updateFields.suspensionReason,
      },
      card: {
        id: targetDocId.toString(),
        accountStatus: status,
        isPublished: status === "active",
        suspendedAt: updateFields.suspendedAt,
        suspensionReason: updateFields.suspensionReason,
      },
      summary,
    });
  } catch (error) {
    console.error("ADMIN UPDATE PROFILE STATUS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update profile status",
      },
      {
        status: 500,
      },
    );
  }
}