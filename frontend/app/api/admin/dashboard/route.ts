import { NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import { getCurrentAdmin } from "@/app/lib/auth";

import DigitalCard from "@/app/models/DigitalCard";
import Catalog from "@/app/models/Catalogs";
import Resume from "@/app/models/Resume";
import User from "@/app/models/User";

export const runtime = "nodejs";

/*
 * NOTE ON WHAT "ACTIVE" / "EXPIRED" MEANS HERE:
 *
 * This used to query the Subscription collection, which nothing in
 * the codebase ever writes to (grepped: no route creates, updates,
 * or upserts a Subscription document anywhere) - so those tiles
 * were structurally stuck at 0 regardless of real paid customers.
 *
 * Digital cards and catalogs each track their own payment + expiry
 * directly on their own document (paymentStatus / subscriptionEnd,
 * paymentStatus / expiresAt), so active/expired is computed straight
 * off those fields instead of a collection nothing populates.
 *
 * Resumes have paymentStatus but no expiry field at all in their
 * schema - paid resumes never expire in the data model today, so a
 * paid resume only ever counts as "active", never "expired".
 *
 * "Suspended" also used to query User.accountStatus, a field that
 * does not exist on the User schema. Suspension is currently only
 * implemented on DigitalCard (accountStatus: "suspended"), so that's
 * the only place counted.
 */

export async function GET() {
  try {
    await connectDB();

    if (!(await getCurrentAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const now = new Date();

    const [
      totalUsers,

      cardTotal,
      cardPaid,
      cardActive,
      cardExpired,
      cardSuspended,

      catalogTotal,
      catalogPaid,
      catalogActive,
      catalogExpired,
      catalogSuspended,

      resumeTotal,
      resumePaid,
      resumeSuspended,
    ] = await Promise.all([
      User.countDocuments(),

      DigitalCard.countDocuments(),
      DigitalCard.countDocuments({ paymentStatus: "paid" }),
      DigitalCard.countDocuments({
        paymentStatus: "paid",
        accountStatus: { $ne: "suspended" },
        $or: [
          { subscriptionEnd: null },
          { subscriptionEnd: { $gte: now } },
        ],
      }),
      DigitalCard.countDocuments({
        paymentStatus: "paid",
        accountStatus: { $ne: "suspended" },
        subscriptionEnd: { $lt: now },
      }),
      DigitalCard.countDocuments({ accountStatus: "suspended" }),

      Catalog.countDocuments(),
      Catalog.countDocuments({ paymentStatus: "paid" }),
      Catalog.countDocuments({
        paymentStatus: "paid",
        accountStatus: { $ne: "suspended" },
        $or: [
          { expiresAt: null },
          { expiresAt: { $exists: false } },
          { expiresAt: { $gte: now } },
        ],
      }),
      Catalog.countDocuments({
        paymentStatus: "paid",
        accountStatus: { $ne: "suspended" },
        expiresAt: { $lt: now },
      }),
      Catalog.countDocuments({ accountStatus: "suspended" }),

      Resume.countDocuments(),
      Resume.countDocuments({
        paymentStatus: "paid",
        accountStatus: { $ne: "suspended" },
      }),
      Resume.countDocuments({ accountStatus: "suspended" }),
    ]);

    return NextResponse.json({
      success: true,

      stats: {
        totalUsers,

        digitalCards: {
          total: cardTotal,
          paid: cardPaid,
          active: cardActive,
          expired: cardExpired,
          suspended: cardSuspended,
        },

        catalogs: {
          total: catalogTotal,
          paid: catalogPaid,
          active: catalogActive,
          expired: catalogExpired,
          suspended: catalogSuspended,
        },

        resumes: {
          total: resumeTotal,
          paid: resumePaid,
          suspended: resumeSuspended,
        },

        // Top-line tiles: sum across every product that tracks the
        // concept. Resumes have no expiry field, so they only ever
        // contribute to "active", never "expired".
        activePlans: cardActive + catalogActive + resumePaid,
        expiredPlans: cardExpired + catalogExpired,
        suspendedUsers: cardSuspended + catalogSuspended + resumeSuspended,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}