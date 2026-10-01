import { notFound } from "next/navigation";

import PublicCatalog from "./PublicCatalog";
import {
  CATALOG_CATEGORIES,
  type CatalogCategory,
} from "@/lib/catalogDummyData";
import { resolveCatalogThemeId } from "@/lib/catalogThemes";

import connectDB from "@/app/lib/db";
import Catalog from "@/app/models/Catalogs";

export const dynamic = "force-dynamic";

export const revalidate = 0;

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

export default async function CatalogPublicPage({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  await connectDB();

  const { username: rawUsername } = await params;

  const username = normalizeUsername(rawUsername);

  /*
   * =========================================================
   * FIND PUBLISHED + PAID CATALOG
   * =========================================================
   *
   * A catalog is publicly accessible only when:
   *
   * paymentStatus === "paid"
   * isPublished === true
   *
   */
  const rawCatalog = await Catalog.findOne({
    username,
  }).lean();

  if (!rawCatalog) {
    notFound();
  }

  if (rawCatalog.accountStatus === "suspended") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-red-600"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 8l8 8" />
              <path d="M16 8l-8 8" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink">
            This Catalog Has Been Suspended
          </h1>
          <p className="mt-2 text-sm text-muted">
            This catalog is temporarily inactive. Please contact support or the administrator for assistance.
          </p>
        </div>
      </main>
    );
  }

  const isCatalogExpired =
    rawCatalog.accountStatus === "expired" ||
    Boolean(rawCatalog.expiresAt && new Date() > new Date(rawCatalog.expiresAt));

  if (isCatalogExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-ink">Catalog Expired</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This catalog is no longer active because its subscription has expired.
          </p>
          <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-800">Subscription Expired</p>
            <p className="mt-1 text-xs leading-5 text-orange-700">
              Please contact the catalog owner or administrator to renew.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (rawCatalog.paymentStatus !== "paid" || !rawCatalog.isPublished) {
    notFound();
  }

  const catalog = rawCatalog;

  /*
   * =========================================================
   * TEMPLATE
   * =========================================================
   *
   * New source of truth:
   *
   * 1. layoutTemplateId
   * 2. templateId (backward compatibility)
   * 3. simple
   *
   * DO NOT use catalog.theme.themeId here.
   */
  const layoutTemplateId = resolveCatalogThemeId(
    catalog.layoutTemplateId,
    catalog.templateId,
  );

  /*
   * =========================================================
   * CATEGORY
   * =========================================================
   */
  // No hardcoded fallback — a catalog only has a category once its
  // owner actually picked one. A stored value no longer in
  // CATALOG_CATEGORIES (e.g. the removed "Grocery & Daily Needs")
  // is treated the same as "none selected".
  const category: CatalogCategory | undefined =
    CATALOG_CATEGORIES.includes(catalog.category as CatalogCategory)
      ? (catalog.category as CatalogCategory)
      : undefined;

  /*
   * =========================================================
   * COMPANY DATA
   * =========================================================
   */
  const company = {
    fullName: catalog.company?.fullName || "",

    companyName: catalog.company?.companyName || "",

    designation: catalog.company?.designation || "",

    profilePhoto: catalog.company?.profilePhoto || "",

    logo:
      catalog.company?.logo ||
      (catalog.company as { companyLogo?: string })?.companyLogo ||
      "",

    tagline: catalog.company?.tagline || "",

    aboutCompany:
      catalog.company?.aboutCompany || "",

    mobile: catalog.company?.mobile || "",

    phone: catalog.company?.phone || "",

    whatsapp: catalog.company?.whatsapp || "",

    email: catalog.company?.email || "",

    website: catalog.company?.website || "",

    address: catalog.company?.address || "",

    googleMapLink:
      catalog.company?.googleMapLink || "",
  };

  /*
   * =========================================================
   * PRODUCTS
   * =========================================================
   *
   * Public catalog uses ONLY real saved products.
   *
   * Dummy/demo products are NOT used on the public page.
   */
  const products = Array.isArray(catalog.products)
    ? catalog.products.map((product) => ({
        id: product.id,

        name: product.name || "",

        description:
          product.description || "",

        sellingPrice:
          Number(product.sellingPrice) || 0,

        mrp:
          Number(product.mrp) || 0,

        image:
          product.image || "",

        categoryId:
          product.categoryId || "",
      }))
    : [];

  const productCategories = Array.isArray(catalog.productCategories)
    ? catalog.productCategories.map((item) => ({
        id: item.id || "",
        name: item.name || "",
        image: item.image || "",
        icon: item.icon || "",
      }))
    : [];

  /*
   * =========================================================
   * SERIALIZED CATALOG
   * =========================================================
   */
  const serializedCatalog = {
    username: catalog.username,

    /*
     * IMPORTANT:
     * This is the selected template that was saved
     * from CatalogEditor.
     */
    layoutTemplateId,

    category,

    hero: (() => {
      const rawHero = catalog.hero || {
        eyebrow: "",
        title: "",
        description: "",
        image: "",
        images: [],
      };
      const slides = Array.isArray(rawHero.images) ? rawHero.images : [];
      const activeSlide = slides.find((slide: any) => slide?.active);
      const resolvedImage =
        activeSlide?.image || slides[0]?.image || rawHero.image || "";

      return { ...rawHero, image: resolvedImage };
    })(),

    company,

    products,

    productCategories,
  };

  return (
    <PublicCatalog
      catalog={serializedCatalog}
    />
  );
}