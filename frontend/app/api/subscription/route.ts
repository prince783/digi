import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";
import Catalog from "@/app/models/Catalogs";
import Resume from "@/app/models/Resume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

interface SubscriptionCard {
  _id: string;
  username?: string;
  fullName?: string;
  companyName?: string;
  designation?: string;
  profilePhoto?: string;

  paymentStatus?: "pending" | "paid" | "failed";

  paymentId?: string | null;
  razorpayOrderId?: string | null;
  razorpaySignature?: string | null;

  paidAt?: string | null;

  createdAt?: string;
  updatedAt?: string;

  isPublished?: boolean;
}

/* =========================================================
   GET SUBSCRIPTION
========================================================= */

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const userId =
      searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    =========================================================
    GET USER'S DIGITAL CARDS + CATALOGS + RESUME — three
    independent collections, no dependency between them, so
    they run in parallel instead of one after another. Each
    also excludes the heavy fields this route never reads
    (gallery/images, the full products array) — this endpoint
    only ever needs scalar summary fields.
    =========================================================
    */

    const [cards, catalogs, resume] = await Promise.all([
      DigitalCard.find({ userId })
        .select("-gallery -images")
        .sort({ createdAt: -1 })
        .lean(),

      Catalog.find({ userId })
        .select("-products")
        .sort({ createdAt: -1 })
        .lean(),

      Resume.findOne({ userId }).lean(),
    ]);

    /*
    =========================================================
    CALCULATE SUBSCRIPTIONS
    =========================================================
    */

    const subscriptions =
      cards.map((card) => {
        let status:
          | "active"
          | "pending"
          | "failed"
          | "expired" =
          "pending";

        const paidAt = card.paidAt
          ? new Date(card.paidAt)
          : card.paymentStatus === "paid" && card.updatedAt
            ? new Date(card.updatedAt)
            : null;

        const startDate = card.subscriptionStart
          ? new Date(card.subscriptionStart)
          : paidAt;

        let endDate: Date | null = null;
        if (card.subscriptionEnd) {
          endDate = new Date(card.subscriptionEnd);
        } else if (startDate) {
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const now = new Date();

        if (card.paymentStatus === "paid") {
          status = endDate && now > endDate ? "expired" : "active";
        } else if (card.paymentStatus === "failed") {
          status = "failed";
        } else {
          status = "pending";
        }

        let daysRemaining = 0;
        if (status === "active" && endDate) {
          const difference = endDate.getTime() - now.getTime();
          daysRemaining = Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
        }

        const canRenew = Boolean(status === "expired" || (endDate && now >= endDate));
        const renewalUrl = `/payment/${card.username || card._id}`;

        return {
          id: String(card._id),
          product: "Digital Visiting Card",
          projectTypeSlug: "card",
          plan: "1 Year",
          duration: 365,
          status,
          canRenew,
          renewalUrl,
          username: card.username || "",
          fullName: card.fullName || "",
          companyName: card.companyName || "",
          designation: card.designation || "",
          profilePhoto: card.profilePhoto || "",
          paymentStatus: card.paymentStatus || "pending",
          paymentId: card.paymentId || null,
          razorpayOrderId: card.razorpayOrderId || null,
          paidAt: card.paidAt || null,
          createdAt: card.createdAt || null,
          updatedAt: card.updatedAt || null,
          startDate,
          endDate,
          daysRemaining,
          isPublished: Boolean(card.isPublished),
          amount: Number(card.paymentAmount || 0),
        };
      });

    const catalogSubscriptions = catalogs.map((catalog) => {
      const paidAt = catalog.paidAt ? new Date(catalog.paidAt) : null;
      const startDate = paidAt;
      let endDate: Date | null = null;
      if (catalog.expiresAt) {
        endDate = new Date(catalog.expiresAt);
      } else if (startDate) {
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      const paymentStatus = catalog.paymentStatus || "pending";
      const now = new Date();
      const status =
        paymentStatus !== "paid"
          ? "pending"
          : endDate && now > endDate
            ? "expired"
            : "active";

      const daysRemaining =
        status === "active" && endDate
          ? Math.max(
              0,
              Math.ceil((endDate.getTime() - now.getTime()) / 86400000),
            )
          : 0;

      const canRenew = Boolean(status === "expired" || (endDate && now >= endDate));
      const renewalUrl = `/dashboard/projects/create-project/catalog?id=${catalog._id}`;

      return {
        id: String(catalog._id),
        product: "Product Catalog",
        projectTypeSlug: "catalog",
        plan: "1 Year",
        duration: 365,
        status,
        canRenew,
        renewalUrl,
        username: catalog.username || "",
        fullName: catalog.company?.fullName || "",
        companyName: catalog.company?.companyName || "",
        designation: catalog.company?.designation || "",
        profilePhoto: catalog.company?.profilePhoto || "",
        paymentStatus,
        paymentId: catalog.paymentId || null,
        razorpayOrderId: catalog.paymentOrderId || null,
        paidAt: catalog.paidAt || null,
        createdAt: catalog.createdAt || null,
        updatedAt: catalog.updatedAt || null,
        startDate,
        endDate,
        daysRemaining,
        isPublished: Boolean(catalog.isPublished),
        amount: Number(catalog.paymentAmount || 0),
      };
    });

    const resumeSubscriptions = resume
      ? [
          (() => {
            const paidAt = resume.paidAt ? new Date(resume.paidAt) : null;
            const startDate = resume.subscriptionStart ? new Date(resume.subscriptionStart) : paidAt;
            let endDate: Date | null = null;
            if (resume.expiresAt) {
              endDate = new Date(resume.expiresAt);
            } else if (startDate) {
              endDate = new Date(startDate);
              endDate.setFullYear(endDate.getFullYear() + 1);
            }
            const paymentStatus = resume.paymentStatus || "pending";
            const now = new Date();
            const status =
              paymentStatus !== "paid"
                ? "pending"
                : endDate && now > endDate
                  ? "expired"
                  : "active";

            const resumeData =
              resume.resume && typeof resume.resume === "object"
                ? (resume.resume as Record<string, unknown>)
                : {};

            const daysRemaining =
              status === "active" && endDate
                ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000))
                : 0;

            const canRenew = Boolean(status === "expired" || (endDate && now >= endDate));
            const renewalUrl = `/dashboard/projects/create-project/resume`;

            return {
              id: String(resume._id),
              product: "Resume",
              projectTypeSlug: "resume",
              plan: "1 Year",
              duration: 365,
              status,
              canRenew,
              renewalUrl,
              username: resume.username || "",
              fullName: String(resumeData.fullName || ""),
              companyName: "",
              designation: String(resumeData.jobTitle || ""),
              profilePhoto: String(resumeData.profilePhoto || ""),
              paymentStatus,
              paymentId: resume.paymentId || resume.razorpayPaymentId || null,
              razorpayOrderId: resume.razorpayOrderId || resume.paymentOrderId || null,
              paidAt: resume.paidAt || null,
              createdAt: resume.createdAt || null,
              updatedAt: resume.updatedAt || null,
              startDate,
              endDate,
              daysRemaining,
              isPublished: Boolean(resume.isPublished),
              amount: Number(resume.paymentAmount || 0),
            };
          })(),
        ]
      : [];

    const allSubscriptions = [
      ...subscriptions,
      ...catalogSubscriptions,
      ...resumeSubscriptions,
    ].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );

    /*
    =========================================================
    SUMMARY
    =========================================================
    */

    const activeSubscriptions =
      allSubscriptions.filter(
        (item) =>
          item.status === "active"
      );

    const pendingSubscriptions =
      allSubscriptions.filter(
        (item) =>
          item.status === "pending"
      );

    const expiredSubscriptions =
      allSubscriptions.filter(
        (item) =>
          item.status === "expired"
      );

    const totalPaid =
      allSubscriptions.reduce(
        (total, item) => {
          if (
            item.paymentStatus ===
            "paid"
          ) {
            return total + (Number(item.amount) || Number(process.env.RAZORPAY_CARD_AMOUNT) || 0);
          }

          return total;
        },
        0
      );

    return NextResponse.json(
      {
        success: true,

        summary: {
          total:
            allSubscriptions.length,

          active:
            activeSubscriptions.length,

          pending:
            pendingSubscriptions.length,

          expired:
            expiredSubscriptions.length,

          totalPaid,
        },

        subscriptions: allSubscriptions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "SUBSCRIPTION GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load subscription.",
      },
      {
        status: 500,
      }
    );
  }
}