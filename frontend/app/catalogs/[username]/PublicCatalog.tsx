"use client";

import { useMemo } from "react";

import CatalogRenderer from "@/app/dashboard/projects/create-project/catalog/components/ui/CatalogRenderer";
import {
  normalizeCatalogThemeId,
} from "@/lib/catalogThemes";

import type { CatalogCategory } from "@/lib/catalogDummyData";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  name: string;
  description?: string;
  sellingPrice?: number;
  mrp?: number;
  image?: string;
  categoryId?: string;
};

type ProductCategory = {
  id: string;
  name: string;
  image: string;
  icon: string;
};

type Company = {
  fullName?: string;
  companyName?: string;
  designation?: string;

  profilePhoto?: string;
  logo?: string;
  companyLogo?: string;

  tagline?: string;
  aboutCompany?: string;

  mobile?: string;
  phone?: string;
  whatsapp?: string;

  email?: string;
  website?: string;

  address?: string;
  googleMapLink?: string;
};

type Catalog = {
  username: string;

  /* =======================================================
     NEW TEMPLATE FIELD
     
     This is the primary source of truth.
     
     Valid values:
       simple
       editorial-luxe
       modern-grid
       organic-nature
       boutique-showcase
       luxury-desert
       warm-living
  ======================================================= */

  layoutTemplateId?: string;

  /* =======================================================
     OLD TEMPLATE FIELD

     Kept only for backwards compatibility.
  ======================================================= */

  templateId?: string;

  category?: CatalogCategory;
  hero?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: string;
  };

  company?: Company;

  products?: Product[];

  productCategories?: ProductCategory[];

  /* =======================================================
     OLD THEME OBJECT

     DO NOT use theme.themeId for the new renderer.
     
     Example old value:
       grocery-theme
  ======================================================= */

  theme?: {
    category?: string;
    themeId?: string;
  };

  paymentStatus?: string;
  isPublished?: boolean;
};

/* =========================================================
   PUBLIC CATALOG
========================================================= */

export default function PublicCatalog({
  catalog,
}: {
  catalog: Catalog;
}) {
  /* =======================================================
     COMPANY
  ======================================================= */

  const company = catalog.company ?? {};

  const username = catalog.username;

  /* =======================================================
     SELECTED TEMPLATE
  =======================================================

     Priority:

     1. layoutTemplateId
     2. templateId
     3. simple

     IMPORTANT:
     We intentionally DO NOT use:

       catalog.theme?.themeId

     because old values such as:

       grocery-theme

     are not valid CatalogRenderer template IDs.
  ======================================================= */

  const selectedTemplateId = useMemo(() => {
    const rawTemplateId =
      catalog.layoutTemplateId ||
      catalog.templateId ||
      "simple";

    return normalizeCatalogThemeId(rawTemplateId);
  }, [
    catalog.layoutTemplateId,
    catalog.templateId,
  ]);

  /* =======================================================
     VALID PRODUCTS
  ======================================================= */

  const validProducts = useMemo(() => {
    if (!Array.isArray(catalog.products)) {
      return [];
    }

    return catalog.products.filter((product) => {
      if (!product) {
        return false;
      }

      const hasName =
        typeof product.name === "string" &&
        product.name.trim().length > 0;

      const hasImage =
        typeof product.image === "string" &&
        product.image.trim().length > 0;

      return hasName || hasImage;
    });
  }, [catalog.products]);

  /* =======================================================
     MAP PRODUCTS FOR CATALOG RENDERER
  ======================================================= */

  const rendererProducts = useMemo(() => {
    const categoryById = new Map(
      (catalog.productCategories ?? []).map((item) => [item.id, item]),
    );

    return validProducts.map((product) => {
      const matchedCategory = product.categoryId
        ? categoryById.get(product.categoryId)
        : undefined;

      return {
        _id: product.id,

        name:
          typeof product.name === "string"
            ? product.name
            : "",

        description:
          typeof product.description === "string"
            ? product.description
            : "",

        price:
          Number(product.sellingPrice) || 0,

        mrp:
          Number(product.mrp) || 0,

        image:
          typeof product.image === "string"
            ? product.image
            : "",

        category: catalog.category,
        productCategory: matchedCategory
          ? {
              name: matchedCategory.name,
              image: matchedCategory.image,
              icon: matchedCategory.icon,
            }
          : undefined,
        hero: catalog.hero,
      };
    });
  }, [
    validProducts,
    catalog.category,
    catalog.productCategories,
    catalog.hero,
  ]);

  /* =======================================================
     COMPANY NAME
  ======================================================= */

  const companyName =
    company.companyName?.trim() ||
    company.fullName?.trim() ||
    "Our Catalog";

  /* =======================================================
     COMPANY LOGO
  ======================================================= */

  const companyLogo =
    company.logo ||
    company.companyLogo ||
    company.profilePhoto ||
    "";

  /* =======================================================
     PHONE
  ======================================================= */

  const phone =
    company.phone ||
    company.mobile ||
    "";

  /* =======================================================
     WHATSAPP
  ======================================================= */

  const whatsapp =
    company.whatsapp ||
    company.mobile ||
    company.phone ||
    "";

  /* =======================================================
     WEBSITE
  ======================================================= */

  const website =
    company.website || "";

  /* =======================================================
     DESCRIPTION
  ======================================================= */

  const description =
    company.aboutCompany?.trim() ||
    company.tagline?.trim() ||
    "";

  /* =======================================================
     TAGLINE
  ======================================================= */

  const tagline = company.tagline?.trim() || "";

  /* =======================================================
     RENDER PUBLIC CATALOG
  ======================================================= */

  return (
    <main className="min-h-screen bg-white">
      <CatalogRenderer
        /*
         * Force remount when the selected template changes.
         *
         * Example:
         *
         * simple
         * editorial-luxe
         * modern-grid
         * organic-nature
         * boutique-showcase
         * luxury-desert
         * warm-living
         */
        key={selectedTemplateId}

        /*
         * THIS IS THE IMPORTANT PART.
         *
         * CatalogRenderer receives the exact selected
         * template ID from layoutTemplateId.
         */
        themeId={selectedTemplateId}

        /*
         * Company/catalog information used by templates.
         */
        catalog={{
          companyName,

          username,

          description,

          logo: companyLogo,

          tagline,

          whatsapp,

          phone,

          website,

          category: catalog.category,
          hero: catalog.hero,
        }}

        /*
         * Only actual products from the database.
         *
         * Public catalog should NOT display demo products
         * when the user has no products.
         */
        products={rendererProducts}
        isEditorPreview={false}

        /*
         * IMPORTANT:
         * Public catalog must not automatically create
         * dummy products.
         */
        useDummyProducts={false}
      />
    </main>
  );
}