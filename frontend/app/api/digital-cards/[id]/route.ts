import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import DigitalCard from "@/app/models/DigitalCard";
import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface GalleryItem {
  url: string;
  publicId: string;
  name: string;
}

interface VideoItem {
  id: string;
  url: string;
  platform: "youtube" | "vimeo";
}

interface CertificateItem {
  id: string;
  url: string;
  publicId: string;
  name: string;
  size: number;
}

type PaymentStatus = "pending" | "paid" | "failed";

/* =========================================================
   CONSTANTS
========================================================= */

const ALLOWED_TEMPLATES = [
  "template-1",
  "template-2",
  "template-3",
  "template-4",
  "template-5",
  "template-6",
  "template-7",
  "template-8",
  "template-9",
  "template-10",
  "template-11",
  "template-12",
  "template-13",
  "template-14",
  "template-15",
  "template-16",
  "template-17",
  "template-18",
  "template-19",
  "template-20",
  "template-21",
  "template-22",
  "template-23",
  "template-24",
  "template-25",
] as const;

const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
];

/* =========================================================
   HELPERS
========================================================= */

function isObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function hasOwn(
  object: Record<string, unknown>,
  key: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

/* =========================================================
   USERNAME
========================================================= */

function normalizeUsername(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

function isValidUsername(username: string): boolean {
  return /^[a-z0-9_-]{3,30}$/.test(username);
}

/* =========================================================
   TEMPLATE
========================================================= */

function isValidTemplate(
  templateId: unknown,
): templateId is (typeof ALLOWED_TEMPLATES)[number] {
  return (
    typeof templateId === "string" &&
    ALLOWED_TEMPLATES.includes(
      templateId as (typeof ALLOWED_TEMPLATES)[number],
    )
  );
}

/* =========================================================
   STRING
========================================================= */

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/* =========================================================
   GET
   GET ONLY CURRENT USER'S CARD
========================================================= */

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to continue.",
        },
        {
          status: 401,
        },
      );
    }

    /* =====================================================
       CARD ID
    ===================================================== */

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid card ID",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       CURRENT USER ID

       DigitalCard.userId is stored as a string.
       getCurrentUser()._id is an ObjectId.

       Convert ObjectId -> string before querying.
    ===================================================== */

    const currentUserId = String(user._id);

    /* =====================================================
       OWNERSHIP CHECK
    ===================================================== */

    const card = await DigitalCard.findOne({
      _id: id,
      userId: currentUserId,
    }).lean();

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "Digital card not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      card,
    });
  } catch (error) {
    console.error("GET DIGITAL CARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch digital card",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   PATCH
   UPDATE ONLY CURRENT USER'S CARD
========================================================= */

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to continue.",
        },
        {
          status: 401,
        },
      );
    }

    /* =====================================================
       CURRENT USER ID
    ===================================================== */

    const currentUserId = String(user._id);

    /* =====================================================
       CARD ID
    ===================================================== */

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid card ID",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       REQUEST BODY
    ===================================================== */

    const body: unknown = await request.json();

    if (!isObject(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FIND CARD WITH OWNERSHIP CHECK
    ===================================================== */

    const card = await DigitalCard.findOne({
      _id: id,
      userId: currentUserId,
    });

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "Digital card not found",
        },
        {
          status: 404,
        },
      );
    }

    /* =====================================================
       IMPORTANT DRAFT FIX

       Old cards may contain:

       username: ""

       Mongoose minlength validation will reject that
       when card.save() is called.

       Convert empty username to undefined.
    ===================================================== */

    if (
      typeof card.username === "string" &&
      card.username.trim() === ""
    ) {
      card.username = undefined;
    }

    /* =====================================================
       DETERMINE PUBLISH REQUEST
    ===================================================== */

    const wantsToPublish = body.isPublished === true;

    /* =====================================================
       USERNAME
    ===================================================== */

    if (hasOwn(body, "username")) {
      if (typeof body.username !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Username must be a string",
            field: "username",
          },
          {
            status: 400,
          },
        );
      }

      const rawUsername = body.username.trim();

      /*
       * Empty username is allowed while saving a draft.
       */

      if (rawUsername === "") {
        if (wantsToPublish) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Username is required before publishing your card.",
              field: "username",
            },
            {
              status: 400,
            },
          );
        }

        card.username = undefined;
      } else {
        const username = normalizeUsername(rawUsername);

        if (!isValidUsername(username)) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Username must be 3-30 characters and contain only lowercase letters, numbers, hyphens or underscores.",
              field: "username",
            },
            {
              status: 400,
            },
          );
        }

        /* =================================================
           CHECK USERNAME AVAILABILITY
        ================================================= */

        if (username !== card.username) {
          const existingCard = await DigitalCard.findOne({
            username,
            _id: {
              $ne: String(card._id),
            },
          }).lean();

          if (existingCard) {
            return NextResponse.json(
              {
                success: false,
                message: "Username is already taken",
                field: "username",
              },
              {
                status: 409,
              },
            );
          }
        }

        card.username = username;
      }
    }

    /* =====================================================
       PUBLISH VALIDATION

       Username is REQUIRED only when publishing.
    ===================================================== */

    if (wantsToPublish) {
      const username =
        typeof card.username === "string"
          ? card.username.trim().toLowerCase()
          : "";

      if (!username) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please enter a username before publishing your card.",
            field: "username",
          },
          {
            status: 400,
          },
        );
      }

      if (!isValidUsername(username)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Username must be 3-30 characters and contain only lowercase letters, numbers, hyphens or underscores.",
            field: "username",
          },
          {
            status: 400,
          },
        );
      }

      /* ================================================
         FINAL USERNAME DUPLICATE CHECK
      ================================================= */

      const existingCard = await DigitalCard.findOne({
        username,
        _id: {
          $ne: String(card._id),
        },
      }).lean();

      if (existingCard) {
        return NextResponse.json(
          {
            success: false,
            message: "Username is already taken",
            field: "username",
          },
          {
            status: 409,
          },
        );
      }

      card.username = username;
    }

    /* =====================================================
       TEMPLATE ID
    ===================================================== */

    if (hasOwn(body, "templateId")) {
      if (!isValidTemplate(body.templateId)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid templateId. Allowed templates: ${ALLOWED_TEMPLATES.join(
              ", ",
            )}`,
            field: "templateId",
          },
          {
            status: 400,
          },
        );
      }

      card.templateId = body.templateId;
    }

    /* =====================================================
       BASIC FIELDS
    ===================================================== */

    const stringFields = [
      "fullName",
      "companyName",
      "designation",
      "profilePhoto",
      "tagline",
      "aboutCompany",
      "mobile",
      "whatsapp",
      "email",
      "website",
      "address",
      "googleMapLink",
      "backgroundColor",
    ] as const;

    for (const field of stringFields) {
      if (hasOwn(body, field)) {
        if (typeof body[field] !== "string") {
          return NextResponse.json(
            {
              success: false,
              message: `${field} must be a string`,
              field,
            },
            {
              status: 400,
            },
          );
        }

        card.set(field, normalizeString(body[field]));
      }
    }

    /* =====================================================
       BUSINESS DETAILS
    ===================================================== */

    if (hasOwn(body, "businessDetails")) {
      if (!isObject(body.businessDetails)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid businessDetails data",
          },
          {
            status: 400,
          },
        );
      }

      const incomingBusiness = body.businessDetails;

      const currentBusiness = card.businessDetails;

      const incomingWorkingHours = isObject(
        incomingBusiness.workingHours,
      )
        ? incomingBusiness.workingHours
        : {};

      const incomingWeekday = isObject(
        incomingWorkingHours.weekday,
      )
        ? incomingWorkingHours.weekday
        : {};

      const incomingWeekend = isObject(
        incomingWorkingHours.weekend,
      )
        ? incomingWorkingHours.weekend
        : {};

      const services = Array.isArray(
        incomingBusiness.services,
      )
        ? incomingBusiness.services.filter(
            (service): service is string =>
              typeof service === "string",
          )
        : currentBusiness.services;

      card.businessDetails = {
        businessName:
          typeof incomingBusiness.businessName === "string"
            ? incomingBusiness.businessName
            : currentBusiness.businessName,

        businessType:
          typeof incomingBusiness.businessType === "string"
            ? incomingBusiness.businessType
            : currentBusiness.businessType,

        gstNumber:
          typeof incomingBusiness.gstNumber === "string"
            ? incomingBusiness.gstNumber
            : currentBusiness.gstNumber,

        description:
          typeof incomingBusiness.description === "string"
            ? incomingBusiness.description
            : currentBusiness.description,

        companyLogo:
          typeof incomingBusiness.companyLogo === "string"
            ? incomingBusiness.companyLogo
            : currentBusiness.companyLogo,

        coverBanner:
          typeof incomingBusiness.coverBanner === "string"
            ? incomingBusiness.coverBanner
            : currentBusiness.coverBanner,

        services,

        workingHours: {
          weekday: {
            from:
              typeof incomingWeekday.from === "string"
                ? incomingWeekday.from
                : currentBusiness.workingHours.weekday.from,

            to:
              typeof incomingWeekday.to === "string"
                ? incomingWeekday.to
                : currentBusiness.workingHours.weekday.to,
          },

          weekend: {
            from:
              typeof incomingWeekend.from === "string"
                ? incomingWeekend.from
                : currentBusiness.workingHours.weekend.from,

            to:
              typeof incomingWeekend.to === "string"
                ? incomingWeekend.to
                : currentBusiness.workingHours.weekend.to,
          },
        },
      };
    }

    /* =====================================================
       SOCIAL LINKS
    ===================================================== */

    if (hasOwn(body, "socialLinks")) {
      if (!isObject(body.socialLinks)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid socialLinks data",
          },
          {
            status: 400,
          },
        );
      }

      const incomingSocial = body.socialLinks;

      const currentSocial = card.socialLinks;

      card.socialLinks = {
        facebook:
          typeof incomingSocial.facebook === "string"
            ? incomingSocial.facebook
            : currentSocial.facebook,

        instagram:
          typeof incomingSocial.instagram === "string"
            ? incomingSocial.instagram
            : currentSocial.instagram,

        linkedin:
          typeof incomingSocial.linkedin === "string"
            ? incomingSocial.linkedin
            : currentSocial.linkedin,

        twitter:
          typeof incomingSocial.twitter === "string"
            ? incomingSocial.twitter
            : currentSocial.twitter,

        youtube:
          typeof incomingSocial.youtube === "string"
            ? incomingSocial.youtube
            : currentSocial.youtube,

        telegram:
          typeof incomingSocial.telegram === "string"
            ? incomingSocial.telegram
            : currentSocial.telegram,

        other:
          typeof incomingSocial.other === "string"
            ? incomingSocial.other
            : currentSocial.other,
      };
    }

    /* =====================================================
       GALLERY
    ===================================================== */

    if (hasOwn(body, "gallery")) {
      if (!Array.isArray(body.gallery)) {
        return NextResponse.json(
          {
            success: false,
            message: "Gallery must be an array",
          },
          {
            status: 400,
          },
        );
      }

      if (body.gallery.length > 12) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You can upload up to 12 gallery images",
          },
          {
            status: 400,
          },
        );
      }

      const gallery: GalleryItem[] = [];

      for (const image of body.gallery) {
        if (!isObject(image)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid gallery image",
            },
            {
              status: 400,
            },
          );
        }

        if (
          typeof image.url !== "string" ||
          image.url.trim() === ""
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Gallery image URL is required",
            },
            {
              status: 400,
            },
          );
        }

        gallery.push({
          url: image.url.trim(),

          publicId:
            typeof image.publicId === "string"
              ? image.publicId
              : "",

          name:
            typeof image.name === "string"
              ? image.name
              : "",
        });
      }

      card.gallery = gallery as typeof card.gallery;
    }

    /* =====================================================
       VIDEOS
    ===================================================== */

    if (hasOwn(body, "videos")) {
      if (!Array.isArray(body.videos)) {
        return NextResponse.json(
          {
            success: false,
            message: "Videos must be an array",
          },
          {
            status: 400,
          },
        );
      }

      const videos: VideoItem[] = [];

      for (const video of body.videos) {
        if (!isObject(video)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid video data",
            },
            {
              status: 400,
            },
          );
        }

        if (
          typeof video.url !== "string" ||
          video.url.trim() === ""
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Video URL is required",
            },
            {
              status: 400,
            },
          );
        }

        if (
          video.platform !== "youtube" &&
          video.platform !== "vimeo"
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Video platform must be youtube or vimeo",
            },
            {
              status: 400,
            },
          );
        }

        videos.push({
          id:
            typeof video.id === "string" &&
            video.id.trim()
              ? video.id
              : new mongoose.Types.ObjectId().toString(),

          url: video.url.trim(),

          platform: video.platform,
        });
      }

      card.videos = videos as typeof card.videos;
    }

    /* =====================================================
       CERTIFICATES
    ===================================================== */

    if (hasOwn(body, "certificates")) {
      if (!Array.isArray(body.certificates)) {
        return NextResponse.json(
          {
            success: false,
            message: "Certificates must be an array",
          },
          {
            status: 400,
          },
        );
      }

      if (body.certificates.length > 10) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You can upload up to 10 certificates",
          },
          {
            status: 400,
          },
        );
      }

      const certificates: CertificateItem[] = [];

      for (const certificate of body.certificates) {
        if (!isObject(certificate)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid certificate data",
            },
            {
              status: 400,
            },
          );
        }

        if (
          typeof certificate.url !== "string" ||
          certificate.url.trim() === ""
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Certificate URL is required",
            },
            {
              status: 400,
            },
          );
        }

        if (
          typeof certificate.name !== "string" ||
          certificate.name.trim() === ""
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Certificate name is required",
            },
            {
              status: 400,
            },
          );
        }

        certificates.push({
          id:
            typeof certificate.id === "string" &&
            certificate.id.trim()
              ? certificate.id
              : new mongoose.Types.ObjectId().toString(),

          url: certificate.url.trim(),

          publicId:
            typeof certificate.publicId === "string"
              ? certificate.publicId
              : "",

          name: certificate.name.trim(),

          size:
            typeof certificate.size === "number"
              ? certificate.size
              : 0,
        });
      }

      card.certificates =
        certificates as typeof card.certificates;
    }

    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    if (hasOwn(body, "paymentStatus")) {
      const paymentStatus = body.paymentStatus;

      if (
        typeof paymentStatus !== "string" ||
        !VALID_PAYMENT_STATUSES.includes(
          paymentStatus as PaymentStatus,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "paymentStatus must be one of: pending, paid, failed",
          },
          {
            status: 400,
          },
        );
      }

      card.paymentStatus =
        paymentStatus as PaymentStatus;

      /*
       * Do not publish a paid card unless
       * a valid username exists.
       */

      if (paymentStatus === "paid") {
        const username =
          typeof card.username === "string"
            ? card.username.trim()
            : "";

        if (!username) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Username is required before publishing your card.",
              field: "username",
            },
            {
              status: 400,
            },
          );
        }

        card.isPublished = true;

        if (!card.paidAt) {
          card.paidAt = new Date();
        }
      }

      if (paymentStatus === "failed") {
        card.isPublished = false;
      }
    }

    /* =====================================================
       PAYMENT ID
    ===================================================== */

    if (hasOwn(body, "paymentId")) {
      card.paymentId =
        body.paymentId === null
          ? null
          : typeof body.paymentId === "string"
            ? body.paymentId
            : String(body.paymentId);
    }

    /* =====================================================
       RAZORPAY ORDER ID
    ===================================================== */

    if (hasOwn(body, "razorpayOrderId")) {
      card.razorpayOrderId =
        body.razorpayOrderId === null
          ? null
          : typeof body.razorpayOrderId === "string"
            ? body.razorpayOrderId
            : String(body.razorpayOrderId);
    }

    /* =====================================================
       RAZORPAY SIGNATURE
    ===================================================== */

    if (hasOwn(body, "razorpaySignature")) {
      card.razorpaySignature =
        body.razorpaySignature === null
          ? null
          : typeof body.razorpaySignature === "string"
            ? body.razorpaySignature
            : String(body.razorpaySignature);
    }

    /* =====================================================
       PAID AT
    ===================================================== */

    if (hasOwn(body, "paidAt")) {
      if (
        body.paidAt === null ||
        body.paidAt === ""
      ) {
        card.paidAt = null;
      } else {
        const paidAtDate = new Date(
          String(body.paidAt),
        );

        if (
          Number.isNaN(
            paidAtDate.getTime(),
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "paidAt must be a valid date",
            },
            {
              status: 400,
            },
          );
        }

        card.paidAt = paidAtDate;
      }
    }

    /* =====================================================
       PUBLICATION
    ===================================================== */

    if (hasOwn(body, "isPublished")) {
      if (
        typeof body.isPublished !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "isPublished must be a boolean",
          },
          {
            status: 400,
          },
        );
      }

      /* ================================================
         UNPUBLISH
      ================================================= */

      if (body.isPublished === false) {
        card.isPublished = false;
      }

      /* ================================================
         PUBLISH
         
         Username MUST exist.
      ================================================= */

      if (body.isPublished === true) {
        const username =
          typeof card.username === "string"
            ? card.username
                .trim()
                .toLowerCase()
            : "";

        if (!username) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Please enter a username before publishing your card.",
              field: "username",
            },
            {
              status: 400,
            },
          );
        }

        if (!isValidUsername(username)) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Username must be 3-30 characters and contain only lowercase letters, numbers, hyphens or underscores.",
              field: "username",
            },
            {
              status: 400,
            },
          );
        }

        if (
          card.paymentStatus !== "paid"
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Card can only be published after successful payment",
            },
            {
              status: 400,
            },
          );
        }

        card.username = username;
        card.isPublished = true;
      }
    }

    /* =====================================================
       PAID CARD PROTECTION

       IMPORTANT:
       Only automatically publish if username exists.
    ===================================================== */

    if (
      card.paymentStatus === "paid" &&
      card.username
    ) {
      card.isPublished = true;

      if (!card.paidAt) {
        card.paidAt = new Date();
      }
    }

    /* =====================================================
       FINAL DRAFT USERNAME CLEANUP

       This fixes existing documents that contain:

       username: ""
    ===================================================== */

    if (
      typeof card.username === "string" &&
      card.username.trim() === ""
    ) {
      card.username = undefined;
    }

    /* =====================================================
       SAVE
    ===================================================== */

    await card.save();

    /* =====================================================
       RETURN UPDATED CARD
    ===================================================== */

    const savedCard = await DigitalCard.findOne({
      _id: id,
      userId: currentUserId,
    }).lean();

    return NextResponse.json({
      success: true,
      message:
        "Digital card updated successfully",
      card: savedCard,
    });
  } catch (error) {
    console.error(
      "UPDATE DIGITAL CARD ERROR:",
      error,
    );

    /* =====================================================
       DUPLICATE USERNAME
    ===================================================== */

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code ===
        11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This username is already taken",
          field: "username",
        },
        {
          status: 409,
        },
      );
    }

    /* =====================================================
       MONGOOSE VALIDATION ERROR
    ===================================================== */

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      const errors: Record<
        string,
        string
      > = {};

      for (const [
        field,
        validationError,
      ] of Object.entries(
        error.errors,
      )) {
        errors[field] =
          validationError.message;
      }

      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update digital card",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   DELETE
   DELETE ONLY CURRENT USER'S CARD
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await connectDB();

    /* =====================================================
       AUTHENTICATION
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
        },
      );
    }

    /* =====================================================
       CURRENT USER ID

       DigitalCard.userId is a string.
    ===================================================== */

    const currentUserId = String(user._id);

    /* =====================================================
       CARD ID
    ===================================================== */

    const { id } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid card ID",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       DELETE WITH OWNERSHIP CHECK

       User B cannot delete User A's card.
    ===================================================== */

    const card =
      await DigitalCard.findOneAndDelete({
        _id: id,
        userId: currentUserId,
      });

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Digital card not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Digital card deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE DIGITAL CARD ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete digital card",
      },
      {
        status: 500,
      },
    );
  }
}