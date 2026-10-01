"use client";

import type {
  CatalogProduct,
  CatalogCategory,
} from "@/lib/catalogDummyData";

import {
  getDummyProducts,
  MODERN_GRID_DUMMY_PRODUCTS,
} from "@/lib/catalogDummyData";
import {
  normalizeCatalogThemeId,
} from "@/lib/catalogThemes";

import EditorialLuxeTemplate from "../templates/EditorialLuxeTemplate";
import ModernGridTemplate from "../templates/ModernGridTemplate";
import OrganicNatureTemplate from "../templates/OrganicNatureTemplate";
import SimpleTemplate from "../templates/SimpleTemplate";
import LuxuryDesertCatalogTemplate from "../templates/LuxuryDesertCatalogTemplate";
import WarmLivingTemplate from "../templates/WarmLivingTemplate";
import NoirAtelier from "../templates/NoirAtelier";
import MaisonLuxe from "../templates/MaisonLuxe";
import IvoryGallery from "../templates/IvoryGallery";
import CornerEditorialTemplate from "../templates/CornerEditorialTemplate";
import VerticalSplitTemplate from "../templates/VerticalSplitTemplate";
import FramedGalleryTemplate from "../templates/FramedGalleryTemplate";
import DarkStripTemplate from "../templates/DarkStripTemplate";
import ArchWindowTemplate from "../templates/ArchWindowTemplate";
import VoltexTechTemplate from "../templates/VoltexTechTemplate";
import RivaaraJewelleryTemplate from "../templates/RivaaraJewelleryTemplate";

interface CatalogRendererProps {
  themeId?: string;

  catalog?: {
    companyName?: string;
    username?: string;
    description?: string;
    logo?: string;
    tagline?: string;
    whatsapp?: string;
    phone?: string;
    website?: string;

    category?: CatalogCategory;

    hero?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      image?: string;
    };
  };

  products?: CatalogProduct[];

  useDummyProducts?: boolean;
  isEditorPreview?: boolean;
}

/* =========================================================
   TEMPLATE → CATEGORY
========================================================= */

const TEMPLATE_CATEGORY_MAP: Record<
  string,
  CatalogCategory
> = {
  /*
   * TEMPLATE 1
   * Fashion & Clothing only
   */
  "simple": "Fashion & Clothing",

  /*
   * TEMPLATE 2
   * Fashion only
   */
  "editorial-luxe":  "Jewellery & Fashion Accessories",

  /*
   * TEMPLATE 3
   * Clothing only
   */
  "modern-grid":
    "Fashion & Clothing",

  /*
   * TEMPLATE 4
   * Ayurvedic only
   */
  "organic-nature":
    "Ayurvedic & Natural Products",

  /*
   * TEMPLATE 6
   * Home & Furniture only
   */
  "warm-living":
    "Home & Furniture",

  /*
   * TEMPLATE 8
   * Grocery only
   */
  "noir-atelier":
    "Beauty & Personal Care",

  /*
   * TEMPLATE 9
   * Fashion only
   */
  "ivory-gallery":
    "Fashion & Clothing",

  /*
   * Additional template
   */
  "luxury-desert":
    "Electronics & Technology",

  /*
   * Additional template
   */
  "maison-luxe":
    "Home & Furniture",

  "corner-editorial":
    "Home & Furniture",

  "vertical-split":
    "Home & Furniture",

  "framed-gallery":
    "Home & Furniture",

  "dark-strip":
    "Home & Furniture",

  "arch-window":
    "Home & Furniture",

  "voltex-tech":
    "Electronics & Technology",

  "rivaara-jewellery":
    "Jewellery & Fashion Accessories",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CatalogRenderer({
  themeId,
  catalog,
  products = [],
  useDummyProducts = false,
  isEditorPreview = false,
}: CatalogRendererProps) {
  /* =========================================================
     THEME
  ========================================================= */

  const selectedThemeId = normalizeCatalogThemeId(
    themeId || "simple"
  );

  /* =========================================================
     TEMPLATE CATEGORY
  ========================================================= */

  const templateCategory =
    TEMPLATE_CATEGORY_MAP[selectedThemeId];

  /* =========================================================
     PRODUCTS
  ========================================================= */

  let displayProducts: CatalogProduct[] = [];

  if (useDummyProducts) {
    /*
     * IMPORTANT:
     *
     * Dummy products are selected from the TEMPLATE category,
     * NOT catalog.category.
     */

    displayProducts =
      selectedThemeId === "modern-grid"
        ? MODERN_GRID_DUMMY_PRODUCTS
        : getDummyProducts(
            templateCategory ||
              catalog?.category
          );
  } else {
    /*
     * Real products are already scoped to this catalog. Do not filter
     * them by the template's demo category: saved products may have a
     * category selected by the user, and templates should render them
     * regardless of that presentation category.
     *
     * Reversed so the most recently added product shows first — the
     * array itself stays in the order products were created (new
     * ones are appended), so newest-first is a display concern, not
     * a storage one. Every template renders through this one prop,
     * so this single flip covers all of them at once.
     */
    displayProducts = [...products].reverse();
  }

  /* =========================================================
     COMMON PROPS
  ========================================================= */

  const commonProps = {
    catalog,
    products: displayProducts,
    onAddToCart: () => undefined,
    isEditorPreview,
  };

  /* =========================================================
     TEMPLATE SWITCH
  ========================================================= */

  switch (selectedThemeId) {
    case "simple":
      return (
        <SimpleTemplate
          {...commonProps}
        />
      );

    case "editorial-luxe":
      return (
        <EditorialLuxeTemplate
          {...commonProps}
        />
      );

    case "modern-grid":
      return (
        <ModernGridTemplate
          {...commonProps}
        />
      );

    case "organic-nature":
      return (
        <OrganicNatureTemplate
          {...commonProps}
        />
      );

    case "warm-living":
      return (
        <WarmLivingTemplate
          {...commonProps}
        />
      );

    case "noir-atelier":
      return (
        <NoirAtelier
          {...commonProps}
        />
      );

    case "ivory-gallery":
      return (
        <IvoryGallery
          {...commonProps}
        />
      );

    case "maison-luxe":
      return (
        <MaisonLuxe
          {...commonProps}
        />
      );

    case "corner-editorial":
      return (
        <CornerEditorialTemplate
          {...commonProps}
        />
      );

    case "vertical-split":
      return (
        <VerticalSplitTemplate
          {...commonProps}
        />
      );

    case "framed-gallery":
      return (
        <FramedGalleryTemplate
          {...commonProps}
        />
      );

    case "dark-strip":
      return (
        <DarkStripTemplate
          {...commonProps}
        />
      );

    case "arch-window":
      return (
        <ArchWindowTemplate
          {...commonProps}
        />
      );

    case "voltex-tech":
      return (
        <VoltexTechTemplate
          {...commonProps}
        />
      );

    case "rivaara-jewellery":
      return (
        <RivaaraJewelleryTemplate
          {...commonProps}
        />
      );

    case "luxury-desert":
      return (
        <LuxuryDesertCatalogTemplate
          catalog={{
            companyName:
              catalog?.companyName,
            username:
              catalog?.username,
            description:
              catalog?.description,
            logo: catalog?.logo,
            tagline: catalog?.tagline,
            whatsapp:
              catalog?.whatsapp,
            phone: catalog?.phone,
            website:
              catalog?.website,
            category:
              catalog?.category,
            hero: catalog?.hero,
          }}
          products={displayProducts.map(
            (product) => ({
              id: product._id,
              name: product.name,
              description:
                product.description,
              sellingPrice:
                product.price,
              mrp: product.mrp,
              image: product.image,
            })
          )}
          isEditorPreview={isEditorPreview}
        />
      );

    default:
      return (
        <SimpleTemplate
          {...commonProps}
        />
      );
  }
}