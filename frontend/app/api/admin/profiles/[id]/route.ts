import {
  NextRequest,
  NextResponse,
} from "next/server";

import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import { getCurrentAdmin } from "@/app/lib/auth";

import DigitalCard from "@/app/models/DigitalCard";
import Catalog from "@/app/models/Catalogs";
import Resume from "@/app/models/Resume";
import Subscription from "@/app/models/Subscription";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/*
 * Normalized shape shared by all three profile types, so the
 * detail page doesn't need to know which collection a profile
 * came from. Mirrors the same normalization already done in
 * /api/admin/profiles (the list route).
 */
interface NormalizedProfile {
  id: string;
  type: "digital-visiting-card" | "catalog" | "resume";

  fullName: string;
  designation: string;
  username: string;
  mobile: string;
  email: string;
  website: string;
  address: string;
  profilePhoto: string;

  views: number;
  shares: number;

  createdAt: Date | null;
  paymentDate: Date | null;
  subscriptionStart: Date | null;
  subscriptionEnd: Date | null;
  subscriptionStatus: string;

  publicUrl: string;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    if (!(await getCurrentAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } =
      await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       TRY DIGITAL VISITING CARD FIRST
    ===================================================== */

    const card = await DigitalCard.findById(id).lean();

    if (card) {
      const subscription = await Subscription.findOne({
        projectId: card._id,
        projectType: "digital-visiting-card",
      }).lean();

      const profile: NormalizedProfile = {
        id: card._id.toString(),
        type: "digital-visiting-card",
        fullName: card.fullName || "Unnamed",
        designation: card.designation || "",
        username: card.username || "",
        mobile: card.mobile || "",
        email: card.email || "",
        website: card.website || "",
        address: card.address || "",
        profilePhoto: card.profilePhoto || "",
        views: Number(card.views) || 0,
        shares: Number(card.shares) || 0,
        createdAt: card.createdAt || null,
        paymentDate: subscription?.paymentDate || card.paidAt || null,
        subscriptionStart: subscription?.startDate || card.subscriptionStart || null,
        subscriptionEnd: subscription?.endDate || card.subscriptionEnd || null,
        subscriptionStatus:
          card.accountStatus === "suspended"
            ? "Suspended"
            : subscription?.status === "active" || card.accountStatus === "active" || card.paymentStatus === "paid"
              ? "Active"
              : card.accountStatus === "expired" || subscription?.status === "expired"
                ? "Expired"
                : "Pending",
        publicUrl: `/digitalvisitingcard/${card.username}`,
      };

      return NextResponse.json({ success: true, profile });
    }

    /* =====================================================
       TRY CATALOG
    ===================================================== */

    const catalog = await Catalog.findById(id).lean();

    if (catalog) {
      const profile: NormalizedProfile = {
        id: catalog._id.toString(),
        type: "catalog",
        fullName: catalog.company?.fullName || catalog.company?.companyName || "Unnamed",
        designation: catalog.company?.designation || "",
        username: catalog.username || "",
        mobile: catalog.company?.mobile || catalog.company?.phone || "",
        email: catalog.company?.email || "",
        website: catalog.company?.website || "",
        address: catalog.company?.address || "",
        profilePhoto: catalog.company?.profilePhoto || catalog.company?.logo || "",
        views: 0,
        shares: 0,
        createdAt: catalog.createdAt || null,
        paymentDate: catalog.paidAt || null,
        subscriptionStart: catalog.paidAt || null,
        subscriptionEnd: catalog.expiresAt || null,
        subscriptionStatus:
          catalog.accountStatus === "suspended"
            ? "Suspended"
            : catalog.paymentStatus === "paid" && catalog.isPublished
              ? "Active"
              : "Pending",
        publicUrl: `/catalogs/${catalog.username}`,
      };

      return NextResponse.json({ success: true, profile });
    }

    /* =====================================================
       TRY RESUME
    ===================================================== */

    const resumeDoc = await Resume.findById(id).lean();

    if (resumeDoc) {
      const resumeData = (resumeDoc.resume || {}) as Record<string, unknown>;

      const profile: NormalizedProfile = {
        id: resumeDoc._id.toString(),
        type: "resume",
        fullName: String(resumeData.fullName || "Unnamed"),
        designation: String(resumeData.jobTitle || ""),
        username: resumeDoc.username || "",
        mobile: String(resumeData.phone || ""),
        email: String(resumeData.email || ""),
        website: String(resumeData.website || ""),
        address: String(resumeData.location || ""),
        profilePhoto: String(resumeData.profilePhoto || ""),
        views: 0,
        shares: 0,
        createdAt: resumeDoc.createdAt || null,
        paymentDate: resumeDoc.paidAt || null,
        subscriptionStart: resumeDoc.paidAt || null,
        subscriptionEnd: null,
        subscriptionStatus:
          resumeDoc.accountStatus === "suspended"
            ? "Suspended"
            : resumeDoc.paymentStatus === "paid" && resumeDoc.isPublished
              ? "Active"
              : "Pending",
        publicUrl: `/resume/${resumeDoc.username}`,
      };

      return NextResponse.json({ success: true, profile });
    }

    /* =====================================================
       NOT FOUND IN ANY COLLECTION
    ===================================================== */

    return NextResponse.json(
      {
        success: false,
        message: "Profile not found",
      },
      {
        status: 404,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
