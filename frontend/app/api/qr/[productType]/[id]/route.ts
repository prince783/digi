import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/app/lib/db";
import { getCurrentUser, getCurrentAdmin } from "@/app/lib/auth";

import DigitalCard from "@/app/models/DigitalCard";
import Catalog from "@/app/models/Catalogs";
import Resume from "@/app/models/Resume";

import { generateQrCardJpeg } from "@/app/lib/qrCard";
import { resolveConfiguredBaseUrl } from "@/lib/publicUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productType: string; id: string }> },
) {
  try {
    await connectDB();

    const { productType, id } = await params;

    if (!["card", "catalog", "resume"].includes(productType)) {
      return NextResponse.json(
        { success: false, message: "Unknown product type." },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    const admin = await getCurrentAdmin();

    if (!user && !admin) {
      return NextResponse.json(
        { success: false, message: "Please login to continue." },
        { status: 401 },
      );
    }

    let ownerId = "";
    let businessName = "";
    let subtitle = "";
    let username = "";
    let publicPath = "";

    const cleanId = decodeURIComponent(id || "").trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);

    if (productType === "card") {
      let card = isObjectId ? await DigitalCard.findById(cleanId).lean() : null;
      if (!card) {
        card = await DigitalCard.findOne({ username: cleanId.toLowerCase() }).lean();
      }
      if (!card) {
        return NextResponse.json(
          { success: false, message: "Card not found." },
          { status: 404 },
        );
      }
      ownerId = String(card.userId || "");
      businessName = card.companyName || card.fullName || "DigiProfilo";
      subtitle = card.fullName || card.designation || "";
      username = card.username || "";
      publicPath = `/digitalvisitingcard/${username}`;
    } else if (productType === "catalog") {
      let catalog = isObjectId ? await Catalog.findById(cleanId).lean() : null;
      if (!catalog) {
        catalog = await Catalog.findOne({ username: cleanId.toLowerCase() }).lean();
      }
      if (!catalog) {
        return NextResponse.json(
          { success: false, message: "Catalog not found." },
          { status: 404 },
        );
      }
      ownerId = String(catalog.userId || "");
      businessName = catalog.company?.companyName || catalog.company?.fullName || "DigiProfilo";
      subtitle = "Product Catalog";
      username = catalog.username || "";
      publicPath = `/catalogs/${username}`;
    } else {
      let resume = isObjectId ? await Resume.findById(cleanId).lean() : null;
      if (!resume) {
        resume = await Resume.findOne({ username: cleanId.toLowerCase() }).lean();
      }
      if (!resume) {
        return NextResponse.json(
          { success: false, message: "Resume not found." },
          { status: 404 },
        );
      }
      ownerId = String(resume.userId || "");
      businessName = resume.username || "DigiProfilo";
      subtitle = "Resume";
      username = resume.username || "";
      publicPath = `/resume/${username}`;
    }

    if (!admin && (!user || String(user._id) !== ownerId)) {
      return NextResponse.json(
        { success: false, message: "You do not have access to this QR code." },
        { status: 403 },
      );
    }

    if (!username) {
      return NextResponse.json(
        { success: false, message: "This project does not have a public link yet." },
        { status: 400 },
      );
    }

    const baseUrl = resolveConfiguredBaseUrl(request.nextUrl.origin);
    const link = `${baseUrl}${publicPath}`;

    const jpegBuffer = await generateQrCardJpeg({
      businessName,
      subtitle,
      link,
    });

    return new NextResponse(new Uint8Array(jpegBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${username}-qr-code.jpg"`,
      },
    });
  } catch (error) {
    console.error("QR CODE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to generate QR code." },
      { status: 500 },
    );
  }
}
