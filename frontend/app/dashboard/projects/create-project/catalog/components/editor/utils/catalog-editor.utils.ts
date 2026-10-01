import { CATEGORY_ICON_OPTIONS, DEFAULT_CATEGORY_ICON } from "@/lib/productCategoryIcons";
import { CATALOG_CATEGORIES, type CatalogCategory } from "@/lib/catalogDummyData";
import type { Billing } from "@/lib/billing";
import type { CartItem, Company, HeroContent, Product, ProductCategory, HeroSlide } from "../../catalog-editor.types";

export function normalizeCategory(
  value: unknown,
): CatalogCategory | undefined {
  return CATALOG_CATEGORIES.includes(value as CatalogCategory)
    ? (value as CatalogCategory)
    : undefined;
}

export function extractStoredId(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed !== trimmed) return extractStoredId(parsed);
    } catch {
      // Plain string ID.
    }

    return trimmed;
  }

  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const keys = ["userId", "_id", "id", "userid", "userID"];

  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

export function getUserId(): string {
  if (typeof window === "undefined") return "";

  const directKeys = ["userId", "user_id", "userid", "userID", "_id", "id"];

  const objectKeys = [
    "user",
    "currentUser",
    "authUser",
    "userData",
    "currentUserData",
    "profile",
    "account",
    "loggedInUser",
    "auth",
    "session",
  ];

  const storages: Storage[] = [];

  try {
    storages.push(window.localStorage);
  } catch {}

  try {
    storages.push(window.sessionStorage);
  } catch {}

  // ---------------------------------------------------------
  // 1. Direct user ID
  // ---------------------------------------------------------
  for (const storage of storages) {
    for (const key of directKeys) {
      try {
        const value = storage.getItem(key);

        if (!value) continue;

        const trimmed = value.trim();

        if (!trimmed) continue;

        // If the value itself is a MongoDB ID/string
        if (/^[a-fA-F0-9]{24}$/.test(trimmed)) {
          return trimmed;
        }

        // If stored as JSON
        try {
          const parsed = JSON.parse(trimmed);
          const id = extractStoredId(parsed);

          if (id) {
            return id;
          }
        } catch {
          // Not JSON
        }
      } catch {
        // Ignore storage errors
      }
    }
  }

  // ---------------------------------------------------------
  // 2. User object
  // ---------------------------------------------------------
  for (const storage of storages) {
    for (const key of objectKeys) {
      try {
        const value = storage.getItem(key);

        if (!value) continue;

        const id = extractStoredId(value);

        if (id) {
          return id;
        }
      } catch {
        // Ignore storage errors
      }
    }
  }

  return "";
}

export function addOneYear(dateValue: string): string {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString();
}

export function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

export function cleanPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `91${digits.slice(1)}`;
  }

  return digits;
}

export function formatCurrency(value: string | number) {
  const number = Number(value) || 0;

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function productPrice(product: Product) {
  return Number(product.sellingPrice) || 0;
}

export function calculateCartTotal(cart: CartItem[]) {
  return cart.reduce(
    (total, item) => total + productPrice(item) * item.quantity,
    0,
  );
}

export function createProduct(): Product {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "",
    description: "",
    sellingPrice: "",
    mrp: "",
    image: "",
  };
}

export function mapCompany(source: Record<string, unknown>): Company {
  const nested = source.company;
  const card =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : source;

  return {
    fullName: String(card.fullName ?? card.name ?? ""),
    companyName: String(card.companyName ?? card.businessName ?? ""),
    designation: String(card.designation ?? ""),
    profilePhoto: String(card.profilePhoto ?? card.profileImage ?? ""),
    logo: String(card.logo ?? card.companyLogo ?? ""),
    tagline: String(card.tagline ?? ""),
    aboutCompany: String(card.aboutCompany ?? card.about ?? ""),
    mobile: String(card.mobile ?? card.phone ?? card.phoneNumber ?? ""),
    phone: String(card.phone ?? card.mobile ?? card.phoneNumber ?? ""),
    whatsapp: String(
      card.whatsapp ?? card.whatsApp ?? card.whatsappNumber ?? "",
    ),
    email: String(card.email ?? ""),
    website: String(card.website ?? ""),
    address: String(card.address ?? ""),
    city: String(card.city ?? ""),
    state: String(card.state ?? ""),
    pincode: String(card.pincode ?? ""),
    googleMapLink: String(card.googleMapLink ?? card.googleMapsLink ?? ""),
  };
}

export function mapBilling(source: Record<string, unknown>): Billing {
  const nested = source.billing;
  const billing =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : {};

  return {
    address: String(billing.address ?? ""),
    city: String(billing.city ?? ""),
    state: String(billing.state ?? ""),
    pincode: String(billing.pincode ?? ""),
  };
}

export function mapProducts(value: unknown): Product[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const product =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};

    return {
      id: String(product.id ?? product._id ?? `product-${Date.now()}-${index}`),
      name: String(product.name ?? ""),
      // Clamped to the CatalogProductSchema description maxlength (30).
      // Older catalogs saved before this limit existed can have longer
      // descriptions still sitting in the database — without this the
      // oversized text loads untouched into the form, and the next
      // save fails whole-document validation with a raw Mongoose error.
      description: String(product.description ?? "").slice(0, 30),
      sellingPrice: String(product.sellingPrice ?? ""),
      mrp: String(product.mrp ?? ""),
      image: String(product.image ?? ""),
      categoryId: product.categoryId ? String(product.categoryId) : undefined,
    };
  });
}

export function mapProductCategories(value: unknown): ProductCategory[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const category =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};

      const icon = String(category.icon ?? "");

      return {
        id: String(category.id ?? ""),
        name: String(category.name ?? ""),
        image: String(category.image ?? ""),
        icon: (CATEGORY_ICON_OPTIONS as readonly string[]).includes(icon)
          ? icon
          : DEFAULT_CATEGORY_ICON,
      };
    })
    .filter((category) => category.id && category.name);
}

export function resolveProductCategory(
  product: Product,
  categories: ProductCategory[],
) {
  if (!product.categoryId) return undefined;
  const match = categories.find((item) => item.id === product.categoryId);
  if (!match) return undefined;
  return { name: match.name, image: match.image, icon: match.icon };
}

export function resolveHeroImage(hero: HeroContent): string {
  const activeSlide = hero.images.find((slide) => slide.active);
  return activeSlide?.image || hero.images[0]?.image || hero.image || "";
}


export function normalizeHeroImages(source: Partial<HeroContent>): HeroSlide[] {
  if (Array.isArray(source.images) && source.images.length > 0) {
    return source.images
      .filter(
        (item): item is HeroSlide =>
          Boolean(item) && typeof item === "object" && typeof (item as HeroSlide).image === "string",
      )
      .map((item) => ({
        id: item.id || `slide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        image: item.image,
        active: item.active !== false,
      }));
  }

  if (source.image) {
    return [{ id: `slide_legacy_${Date.now()}`, image: source.image, active: true }];
  }

  return [];
}
