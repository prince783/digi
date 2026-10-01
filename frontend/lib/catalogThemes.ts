import type { CatalogCategory } from "./catalogDummyData";

export const CATALOG_THEMES = [
  {
    id: "simple",
    name: "Simple",
    description: "A clear, simple catalog layout for any business.",
    categories: [
      "Fashion & Clothing",
      "Beauty & Personal Care",
      "Home & Furniture",
      "Medical & Healthcare",
    ],
    accent: "#123f2e",
    background: "#f7f5f1",
  },

  {
    id: "editorial-luxe",
    name: "Editorial Luxe",
    description: "Elegant editorial design for luxury products.",
    categories: [
      "Jewellery & Fashion Accessories",
      "Fashion & Clothing",
      "Beauty & Personal Care",
    ],
    accent: "#9a6b39",
    background: "#f7f2e9",
  },

  {
    id: "modern-grid",
    name: "Modern Grid",
    description: "Clean modern shopping catalog for everyday products.",
    categories: [
      "Fashion & Clothing",
      "Beauty & Personal Care",
    ],
    accent: "#111111",
    background: "#ffffff",
  },

  {
    id: "organic-nature",
    name: "Organic Nature",
    description: "Natural wellness inspired green catalog.",
    categories: [
      "Ayurvedic & Natural Products",
      "Beauty & Personal Care",
    ],
    accent: "#4a5c22",
    background: "#f4f3e7",
  },

  {
    id: "luxury-desert",
    name: "Luxury Desert",
    description: "Warm sand tones and refined premium editorial styling.",
    categories: [
      "Jewellery & Fashion Accessories",
      "Fashion & Clothing",
      "Home & Furniture",
      "Electronics & Technology",
    ],
    accent: "#a66a4c",
    background: "#f7f3ec",
  },

  {
    id: "warm-living",
    name: "Warm Living",
    description: "Warm, welcoming layout for home and lifestyle products.",
    categories: [
      "Home & Furniture",
      "Fashion & Clothing",
    ],
    accent: "#7a513b",
    background: "#ede7de",
  },
  {
    id: "noir-atelier",
    name: "Noir Atelier",
    description: "Dark luxury presentation for premium collections.",
    categories: [
      "Jewellery & Fashion Accessories",
      "Fashion & Clothing",
      "Beauty & Personal Care",
    ],
    accent: "#d1ad70",
    background: "#100e0d",
  },
  {
    id: "maison-luxe",
    name: "Maison Luxe",
    description: "Refined luxury collection storefront.",
    categories: [
      "Jewellery & Fashion Accessories",
      "Fashion & Clothing",
      "Home & Furniture",
    ],
    accent: "#641b2c",
    background: "#f8f4ed",
  },
  {
    id: "ivory-gallery",
    name: "Ivory Gallery",
    description: "Minimal gallery-inspired product presentation.",
    categories: [
      "Jewellery & Fashion Accessories",
      "Fashion & Clothing",
      "Beauty & Personal Care",
    ],
    accent: "#181513",
    background: "#fbfaf7",
  },

  {
    id: "corner-editorial",
    name: "Corner Editorial",
    description: "Full-bleed photography with a magazine-style corner mark.",
    categories: [
      "Home & Furniture",
      "Fashion & Clothing",
    ],
    accent: "#a8542f",
    background: "#f6f3ee",
  },

  {
    id: "vertical-split",
    name: "Vertical Split",
    description: "Panel-and-photo layout for image-led collections.",
    categories: [
      "Home & Furniture",
      "Fashion & Clothing",
    ],
    accent: "#8a5a34",
    background: "#f3ede2",
  },

  {
    id: "framed-gallery",
    name: "Framed Gallery",
    description: "Editorial headline block framing a single hero photo.",
    categories: [
      "Home & Furniture",
      "Ayurvedic & Natural Products",
    ],
    accent: "#4a5c3a",
    background: "#f7f4ee",
  },

  {
    id: "dark-strip",
    name: "Dark Strip",
    description: "Warm hero with a functional dark category strip.",
    categories: [
      "Home & Furniture",
      "Electronics & Technology",
    ],
    accent: "#6b4a30",
    background: "#f5f1e9",
  },

  {
    id: "arch-window",
    name: "Arch Window",
    description: "Cinematic full-bleed hero with a corner brand mark.",
    categories: [
      "Home & Furniture",
      "Fashion & Clothing",
    ],
    accent: "#9c5a35",
    background: "#f4efe6",
  },

  {
    id: "voltex-tech",
    name: "Voltex Tech",
    description: "Dark electronics storefront with a glowing hero product shot.",
    categories: [
      "Electronics & Technology",
    ],
    accent: "#3d8bfd",
    background: "#05070d",
  },

  {
    id: "rivaara-jewellery",
    name: "Rivaara Jewellery",
    description: "Cream and gold jewellery storefront with a gift banner and collection grid.",
    categories: [
      "Jewellery & Fashion Accessories",
    ],
    accent: "#b8912f",
    background: "#faf6ee",
  },
] as const;

/* =========================================================
   TYPES
========================================================= */

export type CatalogThemeId =
  (typeof CATALOG_THEMES)[number]["id"];

export function getCatalogThemesForCategory(
  category: CatalogCategory,
) {
  return CATALOG_THEMES.filter((theme) =>
    theme.categories.some((themeCategory) => themeCategory === category),
  );
}

export function getDefaultCatalogThemeForCategory(
  category: CatalogCategory,
): CatalogThemeId {
  const preferred: Record<CatalogCategory, CatalogThemeId> = {
    "Fashion & Clothing": "modern-grid",
    "Jewellery & Fashion Accessories": "editorial-luxe",
    "Home & Furniture": "warm-living",
    "Beauty & Personal Care": "ivory-gallery",
    "Medical & Healthcare": "simple",
    "Ayurvedic & Natural Products": "organic-nature",
    "Electronics & Technology": "luxury-desert",
  };

  return preferred[category];
}

/* =========================================================
   NORMALIZE TEMPLATE ID
========================================================= */

export function normalizeCatalogThemeId(
  themeId: unknown,
): CatalogThemeId {
  if (typeof themeId !== "string") {
    return "simple";
  }

  const normalized = themeId.trim();

  const isValid = (
    CATALOG_THEMES as readonly { id: string }[]
  ).some(
    (theme) => theme.id === normalized,
  );

  return isValid
    ? (normalized as CatalogThemeId)
    : "simple";
}

/* =========================================================
   RESOLVE TEMPLATE ID
=========================================================

   Priority:

   1. layoutTemplateId
   2. templateId
   3. simple

   IMPORTANT:
   Do NOT use the old `theme.themeId`.
========================================================= */

export function resolveCatalogThemeId(
  layoutTemplateId: unknown,
  templateId?: unknown,
): CatalogThemeId {
  /*
   * ---------------------------------------------------------
   * 1. NEW FIELD
   * ---------------------------------------------------------
   */
  if (
    typeof layoutTemplateId === "string" &&
    layoutTemplateId.trim()
  ) {
    return normalizeCatalogThemeId(
      layoutTemplateId,
    );
  }

  /*
   * ---------------------------------------------------------
   * 2. LEGACY TEMPLATE FIELD
   * ---------------------------------------------------------
   *
   * Used only for older catalog records that don't yet have
   * layoutTemplateId.
   */
  if (
    typeof templateId === "string" &&
    templateId.trim()
  ) {
    return normalizeCatalogThemeId(
      templateId,
    );
  }

  /*
   * ---------------------------------------------------------
   * 3. DEFAULT
   * ---------------------------------------------------------
   */
  return "simple";
}