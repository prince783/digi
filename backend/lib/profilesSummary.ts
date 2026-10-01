import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";
import Catalog from "@/app/models/Catalogs";
import Resume from "@/app/models/Resume";
import Subscription from "@/app/models/Subscription";

export type ProfileStatus = "active" | "pending" | "expired" | "suspended";

export interface AdminProfile {
  id: string;
  type: "digital-visiting-card" | "resume" | "biography" | "catalog";
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  profilePhoto: string;
  views: number;
  shares: number;
  registrationDate: string | Date | null;
  paymentDate: string | Date | null;
  subscriptionStart: string | Date | null;
  subscriptionEnd: string | Date | null;
  status: ProfileStatus;
  accountStatus: ProfileStatus;
  isPublished: boolean;
  suspendedAt: Date | null;
  suspensionReason: string;
  daysOverdue?: number;
  renewalUrl?: string;
}

export interface ProfilesSummary {
  total: number;
  types: {
    digitalCards: number;
    catalogs: number;
    resumes: number;
    biographies: number;
  };
  status: {
    all: number;
    active: number;
    expired: number;
    pending: number;
    suspended: number;
  };
}

export async function getGlobalProfilesDataset(): Promise<{
  allProfiles: AdminProfile[];
  summary: ProfilesSummary;
}> {
  await connectDB();

  /* =====================================================
     FETCH ALL COLLECTIONS IN PARALLEL (COMPLETE DATASET)
  ===================================================== */
  const [cards, catalogs, resumes] = await Promise.all([
    DigitalCard.find({})
      .select(
        "_id username fullName email mobile profilePhoto views shares createdAt paidAt subscriptionStart subscriptionEnd paymentStatus accountStatus isPublished suspendedAt suspensionReason",
      )
      .lean(),

    Catalog.find({})
      .select(
        "_id username company.fullName company.companyName company.email company.mobile company.phone company.profilePhoto company.logo paymentStatus isPublished accountStatus suspendedAt suspensionReason createdAt paidAt expiresAt",
      )
      .lean(),

    Resume.find({})
      .select(
        "_id username resume.fullName resume.email resume.phone resume.profilePhoto paymentStatus isPublished accountStatus suspendedAt suspensionReason createdAt paidAt expiresAt subscriptionStart",
      )
      .lean(),
  ]);

  // Batch-fetch subscriptions in ONE query for all digital cards
  const cardIds = cards.map((c) => c._id);
  const subscriptions =
    cardIds.length > 0
      ? await Subscription.find({
          projectId: { $in: cardIds },
          projectType: "digital-visiting-card",
        }).lean()
      : [];
  const subMap = new Map(subscriptions.map((s) => [String(s.projectId), s]));

  const allProfiles: AdminProfile[] = [];
  const now = Date.now();

  /* =====================================================
     1. PROCESS DIGITAL VISITING CARDS
  ===================================================== */
  for (const card of cards) {
    const subscription = subMap.get(String(card._id));
    const effectiveCardEndDate = subscription?.endDate || card.subscriptionEnd;
    const isPastExpiry = Boolean(
      effectiveCardEndDate && new Date(effectiveCardEndDate).getTime() < now,
    );
    const daysOverdue =
      isPastExpiry && effectiveCardEndDate
        ? Math.max(
            0,
            Math.floor(
              (now - new Date(effectiveCardEndDate).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0;

    const cardAccountStatus = (card.accountStatus || "pending") as ProfileStatus;
    let profileStatus: ProfileStatus;

    if (cardAccountStatus === "suspended") {
      profileStatus = "suspended";
    } else if (
      cardAccountStatus === "expired" ||
      subscription?.status === "expired" ||
      isPastExpiry
    ) {
      profileStatus = "expired";
    } else if (
      cardAccountStatus === "active" ||
      subscription?.status === "active" ||
      card.paymentStatus === "paid"
    ) {
      profileStatus = "active";
    } else {
      profileStatus = "pending";
    }

    allProfiles.push({
      id: card._id.toString(),
      type: "digital-visiting-card",
      fullName: card.fullName || "Unnamed",
      username: card.username || "",
      email: card.email || "",
      mobile: card.mobile || "",
      profilePhoto: card.profilePhoto || "",
      views: Number(card.views) || 0,
      shares: Number(card.shares) || 0,
      registrationDate: card.createdAt || null,
      paymentDate: subscription?.paymentDate || card.paidAt || null,
      subscriptionStart:
        subscription?.startDate || card.subscriptionStart || null,
      subscriptionEnd:
        subscription?.endDate || card.subscriptionEnd || null,
      status: profileStatus,
      accountStatus: cardAccountStatus,
      isPublished: Boolean(card.isPublished),
      suspendedAt: card.suspendedAt || null,
      suspensionReason: card.suspensionReason || "",
      daysOverdue,
      renewalUrl: `/payment/${card.username || card._id}`,
    });
  }

  /* =====================================================
     2. PROCESS CATALOGS
  ===================================================== */
  for (const catalog of catalogs) {
    const fullName =
      catalog.company?.fullName ||
      catalog.company?.companyName ||
      "Unnamed";
    const username = catalog.username || "";
    const email = catalog.company?.email || "";
    const mobile = catalog.company?.mobile || catalog.company?.phone || "";

    const isPastExpiry = Boolean(
      catalog.expiresAt && new Date(catalog.expiresAt).getTime() < now,
    );
    const daysOverdue =
      isPastExpiry && catalog.expiresAt
        ? Math.max(
            0,
            Math.floor(
              (now - new Date(catalog.expiresAt).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0;

    const catalogAccountStatus = (catalog.accountStatus || "pending") as ProfileStatus;
    let profileStatus: ProfileStatus;

    if (catalogAccountStatus === "suspended") {
      profileStatus = "suspended";
    } else if (catalogAccountStatus === "expired" || isPastExpiry) {
      profileStatus = "expired";
    } else if (
      catalogAccountStatus === "active" ||
      catalog.paymentStatus === "paid"
    ) {
      profileStatus = "active";
    } else {
      profileStatus = "pending";
    }

    allProfiles.push({
      id: catalog._id.toString(),
      type: "catalog",
      fullName,
      username,
      email,
      mobile,
      profilePhoto:
        catalog.company?.logo || catalog.company?.profilePhoto || "",
      views: 0,
      shares: 0,
      registrationDate: catalog.createdAt || null,
      paymentDate: catalog.paidAt || null,
      subscriptionStart: catalog.paidAt || null,
      subscriptionEnd: catalog.expiresAt || null,
      status: profileStatus,
      accountStatus: catalogAccountStatus,
      isPublished: Boolean(catalog.isPublished),
      suspendedAt: catalog.suspendedAt || null,
      suspensionReason: catalog.suspensionReason || "",
      daysOverdue,
      renewalUrl: `/catalogs/payment/${catalog.username || catalog._id}`,
    });
  }

  /* =====================================================
     3. PROCESS RESUMES
  ===================================================== */
  for (const resumeDoc of resumes) {
    const resumeData = (resumeDoc.resume || {}) as Record<string, unknown>;
    const fullName = String(resumeData.fullName || "Unnamed");
    const username = resumeDoc.username || "";
    const email = String(resumeData.email || "");
    const mobile = String(resumeData.phone || "");

    const isPastExpiry = Boolean(
      resumeDoc.expiresAt && new Date(resumeDoc.expiresAt).getTime() < now,
    );
    const daysOverdue =
      isPastExpiry && resumeDoc.expiresAt
        ? Math.max(
            0,
            Math.floor(
              (now - new Date(resumeDoc.expiresAt).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0;

    const resumeAccountStatus = (resumeDoc.accountStatus || "pending") as ProfileStatus;
    let profileStatus: ProfileStatus;

    if (resumeAccountStatus === "suspended") {
      profileStatus = "suspended";
    } else if (resumeAccountStatus === "expired" || isPastExpiry) {
      profileStatus = "expired";
    } else if (
      resumeAccountStatus === "active" ||
      resumeDoc.paymentStatus === "paid"
    ) {
      profileStatus = "active";
    } else {
      profileStatus = "pending";
    }

    allProfiles.push({
      id: resumeDoc._id.toString(),
      type: "resume",
      fullName,
      username,
      email,
      mobile,
      profilePhoto: String(resumeData.profilePhoto || ""),
      views: 0,
      shares: 0,
      registrationDate: resumeDoc.createdAt || null,
      paymentDate: resumeDoc.paidAt || null,
      subscriptionStart:
        resumeDoc.subscriptionStart || resumeDoc.paidAt || null,
      subscriptionEnd: resumeDoc.expiresAt || null,
      status: profileStatus,
      accountStatus: resumeAccountStatus,
      isPublished: Boolean(resumeDoc.isPublished),
      suspendedAt: resumeDoc.suspendedAt || null,
      suspensionReason: resumeDoc.suspensionReason || "",
      daysOverdue,
      renewalUrl: `/resumes/payment/${resumeDoc.username || resumeDoc._id}`,
    });
  }

  /* =====================================================
     CALCULATE GLOBAL SUMMARY COUNTS ACROSS ALL COLLECTIONS
  ===================================================== */
  const summary: ProfilesSummary = {
    total: allProfiles.length,
    types: {
      digitalCards: allProfiles.filter(
        (p) => p.type === "digital-visiting-card",
      ).length,
      catalogs: allProfiles.filter((p) => p.type === "catalog").length,
      resumes: allProfiles.filter((p) => p.type === "resume").length,
      biographies: 0,
    },
    status: {
      all: allProfiles.length,
      active: allProfiles.filter((p) => p.status === "active").length,
      expired: allProfiles.filter((p) => p.status === "expired").length,
      pending: allProfiles.filter((p) => p.status === "pending").length,
      suspended: allProfiles.filter((p) => p.status === "suspended").length,
    },
  };

  return { allProfiles, summary };
}
