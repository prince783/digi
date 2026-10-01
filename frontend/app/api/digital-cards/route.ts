import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";
import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

interface GalleryItem {
  url: string;
  publicId?: string;
  name?: string;
}

interface VideoItem {
  id?: string;
  url: string;
  platform: "youtube" | "vimeo";
}

interface CertificateItem {
  id: string;
  url: string;
  publicId?: string;
  name: string;
  size: number;
}

/* =========================================================
   TEMPLATE IDS
========================================================= */

const ALLOWED_TEMPLATE_IDS = [
  "template-1",
  "template-2",
  "template-3",
  "template-4",
  "template-5",
] as const;

type TemplateId =
  (typeof ALLOWED_TEMPLATE_IDS)[number];

/* =========================================================
   DEFAULT BUSINESS DETAILS
========================================================= */

const defaultBusinessDetails = {
  businessName: "",
  businessType: "",
  gstNumber: "",
  description: "",

  companyLogo: "",
  coverBanner: "",

  services: [] as string[],

  workingHours: {
    weekday: {
      from: "09:00 AM",
      to: "07:00 PM",
    },

    weekend: {
      from: "10:00 AM",
      to: "04:00 PM",
    },
  },
};

/* =========================================================
   DEFAULT SOCIAL LINKS
========================================================= */

const defaultSocialLinks = {
  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  youtube: "",
  telegram: "",
  other: "",
};

/* =========================================================
   USERNAME NORMALIZER
========================================================= */

function normalizeUsername(
  username: unknown
): string {
  if (typeof username !== "string") {
    return "";
  }

  return username
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

/* =========================================================
   USERNAME VALIDATOR
========================================================= */

function isValidUsername(
  username: string
): boolean {
  return /^[a-z0-9_-]{3,30}$/.test(username);
}

/* =========================================================
   TEMPLATE NORMALIZER
========================================================= */

function normalizeTemplateId(
  templateId: unknown
): TemplateId {
  if (
    typeof templateId === "string" &&
    ALLOWED_TEMPLATE_IDS.includes(
      templateId as TemplateId
    )
  ) {
    return templateId as TemplateId;
  }

  return "template-1";
}

/* =========================================================
   NORMALIZE GALLERY
========================================================= */

function normalizeGallery(
  gallery: unknown
): GalleryItem[] {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery
    .filter(
      (
        item
      ): item is Record<string, unknown> =>
        Boolean(item) &&
        typeof item === "object" &&
        !Array.isArray(item)
    )
    .map((item) => ({
      url:
        typeof item.url === "string"
          ? item.url.trim()
          : "",

      publicId:
        typeof item.publicId === "string"
          ? item.publicId
          : "",

      name:
        typeof item.name === "string"
          ? item.name
          : "",
    }))
    .filter(
      (item) =>
        item.url.length > 0
    );
}

/* =========================================================
   NORMALIZE VIDEOS
========================================================= */

function normalizeVideos(
  videos: unknown
): VideoItem[] {
  if (!Array.isArray(videos)) {
    return [];
  }

  return videos
    .filter(
      (
        item
      ): item is Record<string, unknown> =>
        Boolean(item) &&
        typeof item === "object" &&
        !Array.isArray(item)
    )
    .map(
      (item): VideoItem => ({
        id:
          typeof item.id === "string" &&
          item.id.trim()
            ? item.id
            : crypto.randomUUID(),

        url:
          typeof item.url === "string"
            ? item.url.trim()
            : "",

        platform:
          item.platform === "vimeo"
            ? "vimeo"
            : "youtube",
      })
    )
    .filter(
      (item) =>
        item.url.length > 0
    );
}

/* =========================================================
   NORMALIZE CERTIFICATES
========================================================= */

function normalizeCertificates(
  certificates: unknown
): CertificateItem[] {
  if (!Array.isArray(certificates)) {
    return [];
  }

  return certificates
    .filter(
      (
        item
      ): item is Record<string, unknown> =>
        Boolean(item) &&
        typeof item === "object" &&
        !Array.isArray(item)
    )
    .map(
      (item): CertificateItem => ({
        id:
          typeof item.id === "string" &&
          item.id.trim()
            ? item.id
            : crypto.randomUUID(),

        url:
          typeof item.url === "string"
            ? item.url.trim()
            : "",

        publicId:
          typeof item.publicId === "string"
            ? item.publicId
            : "",

        name:
          typeof item.name === "string"
            ? item.name.trim()
            : "",

        size:
          typeof item.size === "number" &&
          Number.isFinite(item.size)
            ? item.size
            : 0,
      })
    )
    .filter(
      (item) =>
        item.url.length > 0 &&
        item.name.length > 0
    );
}

/* =========================================================
   SAFE STRING
========================================================= */

function safeString(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* =========================================================
   POST
   CREATE DIGITAL CARD

   IMPORTANT:

   Username is OPTIONAL during draft creation.

   User can fill:
   - Basic details
   - Contact
   - Business
   - Social
   - Gallery
   - etc.

   Username can be added at the LAST step.
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    await connectDB();

    /* =====================================================
       AUTH
    ===================================================== */

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to continue.",
        },
        {
          status: 401,
        }
      );
    }

    const authenticatedUserId =
      user._id.toString();

    /* =====================================================
       BODY
    ===================================================== */

    const body =
      await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       USERNAME

       IMPORTANT:
       DO NOT REQUIRE USERNAME HERE.

       Empty username means this is a draft.
    ===================================================== */

    const username =
      normalizeUsername(body.username);

    /*
     * Only validate username if
     * user actually provided one.
     */
    if (username) {
      if (!isValidUsername(username)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username must be 3-30 characters and contain only letters, numbers, hyphens or underscores.",
            field: "username",
          },
          {
            status: 400,
          }
        );
      }

      const existingCard =
        await DigitalCard.findOne({
          username,
        }).lean();

      if (existingCard) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username is already taken",
            field: "username",
          },
          {
            status: 409,
          }
        );
      }
    }

    /* =====================================================
       TEMPLATE
    ===================================================== */

    const templateId =
      normalizeTemplateId(
        body.templateId
      );

    /* =====================================================
       BUSINESS DETAILS
    ===================================================== */

    const incomingBusiness =
      body.businessDetails &&
      typeof body.businessDetails ===
        "object" &&
      !Array.isArray(
        body.businessDetails
      )
        ? body.businessDetails
        : {};

    const incomingWorkingHours =
      incomingBusiness.workingHours &&
      typeof incomingBusiness.workingHours ===
        "object" &&
      !Array.isArray(
        incomingBusiness.workingHours
      )
        ? incomingBusiness.workingHours
        : {};

    const incomingWeekday =
      incomingWorkingHours.weekday &&
      typeof incomingWorkingHours.weekday ===
        "object" &&
      !Array.isArray(
        incomingWorkingHours.weekday
      )
        ? incomingWorkingHours.weekday
        : {};

    const incomingWeekend =
      incomingWorkingHours.weekend &&
      typeof incomingWorkingHours.weekend ===
        "object" &&
      !Array.isArray(
        incomingWorkingHours.weekend
      )
        ? incomingWorkingHours.weekend
        : {};

    const businessDetails = {
      businessName:
        safeString(
          incomingBusiness.businessName
        ),

      businessType:
        safeString(
          incomingBusiness.businessType
        ),

      gstNumber:
        safeString(
          incomingBusiness.gstNumber
        ).toUpperCase(),

      description:
        safeString(
          incomingBusiness.description
        ),

      companyLogo:
        safeString(
          incomingBusiness.companyLogo
        ),

      coverBanner:
        safeString(
          incomingBusiness.coverBanner
        ),

      services:
        Array.isArray(
          incomingBusiness.services
        )
          ? incomingBusiness.services
              .filter(
                (
                  service: unknown
                ): service is string =>
                  typeof service ===
                  "string"
              )
              .map(
                (service: string) =>
                  service.trim()
              )
              .filter(Boolean)
          : [],

      workingHours: {
        weekday: {
          from:
            safeString(
              incomingWeekday.from
            ) ||
            defaultBusinessDetails
              .workingHours.weekday.from,

          to:
            safeString(
              incomingWeekday.to
            ) ||
            defaultBusinessDetails
              .workingHours.weekday.to,
        },

        weekend: {
          from:
            safeString(
              incomingWeekend.from
            ) ||
            defaultBusinessDetails
              .workingHours.weekend.from,

          to:
            safeString(
              incomingWeekend.to
            ) ||
            defaultBusinessDetails
              .workingHours.weekend.to,
        },
      },
    };

    /* =====================================================
       SOCIAL LINKS
    ===================================================== */

    const incomingSocial =
      body.socialLinks &&
      typeof body.socialLinks ===
        "object" &&
      !Array.isArray(
        body.socialLinks
      )
        ? body.socialLinks
        : {};

    const socialLinks = {
      facebook:
        safeString(
          incomingSocial.facebook
        ),

      instagram:
        safeString(
          incomingSocial.instagram
        ),

      linkedin:
        safeString(
          incomingSocial.linkedin
        ),

      twitter:
        safeString(
          incomingSocial.twitter
        ),

      youtube:
        safeString(
          incomingSocial.youtube
        ),

      telegram:
        safeString(
          incomingSocial.telegram
        ),

      other:
        safeString(
          incomingSocial.other
        ),
    };

    /* =====================================================
       GALLERY
    ===================================================== */

    const gallery =
      normalizeGallery(
        body.gallery
      );

    if (gallery.length > 12) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can upload up to 12 gallery images",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VIDEOS
    ===================================================== */

    const videos =
      normalizeVideos(
        body.videos
      );

    /* =====================================================
       CERTIFICATES
    ===================================================== */

    const certificates =
      normalizeCertificates(
        body.certificates
      );

    /* =====================================================
       CREATE DRAFT CARD
    ===================================================== */

    const cardData: Record<
      string,
      unknown
    > = {
      userId:
        authenticatedUserId,

      /*
       * Only send username if
       * it exists.
       *
       * This allows draft cards
       * without username.
       */
      ...(username
        ? { username }
        : {}),

      templateId,

      fullName:
        safeString(
          body.fullName
        ),

      companyName:
        safeString(
          body.companyName
        ),

      designation:
        safeString(
          body.designation
        ),

      profilePhoto:
        safeString(
          body.profilePhoto
        ),

      tagline:
        safeString(
          body.tagline
        ),

      aboutCompany:
        safeString(
          body.aboutCompany
        ),

      mobile:
        safeString(
          body.mobile
        ),

      whatsapp:
        safeString(
          body.whatsapp
        ),

      email:
        safeString(
          body.email
        ).toLowerCase(),

      website:
        safeString(
          body.website
        ),

      address:
        safeString(
          body.address
        ),

      googleMapLink:
        safeString(
          body.googleMapLink
        ),

      businessDetails,

      socialLinks,

      gallery,

      videos,

      certificates,

      backgroundColor:
        safeString(
          body.backgroundColor
        ) ||
        "#152A47",

      paymentStatus:
        "pending",

      paymentId: null,

      paidAt: null,

      paymentOrderId: null,

      razorpayOrderId: null,

      razorpaySignature: null,

      accountStatus:
        "pending",

      suspendedAt: null,

      suspensionReason: "",

      subscriptionStart: null,

      subscriptionEnd: null,

      isPublished: false,
    };

    const card =
      await DigitalCard.create(
        cardData
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          username
            ? "Digital card created successfully"
            : "Digital card draft created successfully",

        card,

        /*
         * Public URL is available
         * only after username is added.
         */
        publicUrl:
          username
            ? `/digitalvisitingcard/${username}`
            : null,

        paymentRequired:
          Boolean(username),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE DIGITAL CARD ERROR:",
      error
    );

    /* =====================================================
       DUPLICATE USERNAME
    ===================================================== */

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (
        error as {
          code?: number;
        }
      ).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username is already taken",
          field: "username",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create digital card",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   GET
   CURRENT USER'S CARDS ONLY

   IMPORTANT:
   User A can ONLY see User A's cards.
   User B can ONLY see User B's cards.
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to continue.",
        },
        {
          status: 401,
        }
      );
    }

    const userId =
      user._id.toString();

    const cards =
      await DigitalCard.find({
        userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error(
      "GET MY DIGITAL CARDS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch digital cards",
      },
      {
        status: 500,
      }
    );
  }
}