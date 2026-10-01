import type { Company, HeroContent } from "../../catalog-editor.types";

export const DEFAULT_LAYOUT_TEMPLATE_ID = "simple";
export const DEFAULT_TEMPLATE_ID = "simple";

export const DEFAULT_COMPANY: Company = {
  fullName: "",
  companyName: "",
  designation: "",
  profilePhoto: "",
  logo: "",
  tagline: "",
  aboutCompany: "",
  mobile: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  googleMapLink: "",
};

export const HERO_DEFAULTS: Record<
  string,
  { eyebrow: string; title: string; description: string; image: string }
> = {
  simple: {
    eyebrow: "Welcome",
    title: "Quality products, simple shopping",
    description: "Everything you need, thoughtfully selected for everyday living.",
    image: "",
  },
  "editorial-luxe": {
    eyebrow: "New Collection",
    title: "Jewellery that tells your story",
    description: "Discover carefully selected designs made for timeless moments and memorable occasions.",
    image: "",
  },
  "modern-grid": {
    eyebrow: "The everyday collection",
    title: "Better products. Better living.",
    description: "Discover carefully selected products designed to bring quality, simplicity and value into your everyday life.",
    image: "",
  },
  "organic-nature": {
    eyebrow: "Nature & wellness",
    title: "Ancient wisdom for modern living",
    description: "Natural products thoughtfully selected for everyday wellness.",
    image: "",
  },
  "boutique-showcase": {
    eyebrow: "Curated Collection",
    title: "Your Store",
    description: "Our collection is coming soon.",
    image: "",
  },
  "warm-living": {
    eyebrow: "Crafted spaces",
    title: "Make your space feel home.",
    description: "Thoughtfully selected pieces that bring warmth, comfort, and character to every room.",
    image: "",
  },
  "noir-atelier": {
    eyebrow: "The Noir Collection",
    title: "The art of adornment.",
    description: "Timeless pieces, thoughtfully designed for those who appreciate quiet luxury and exceptional detail.",
    image: "",
  },
  "ivory-gallery": {
    eyebrow: "Fine collection",
    title: "Nothing here yet.",
    description: "Our collection is being carefully curated. Please check back soon.",
    image: "",
  },
  "maison-luxe": {
    eyebrow: "The new collection",
    title: "Designed for forever.",
    description: "Thoughtfully selected pieces designed to become part of your everyday story.",
    image: "",
  },
  "luxury-desert": {
    eyebrow: "Welcome to",
    title: "Your collection",
    description: "A carefully considered collection of pieces for timeless everyday living.",
    image: "",
  },
};

export function getHeroDefaults(selectedTemplateId?: string): HeroContent {
  const key = (selectedTemplateId || DEFAULT_LAYOUT_TEMPLATE_ID || "simple")
    .trim()
    .toLowerCase();

  return {
    ...(HERO_DEFAULTS[key] || HERO_DEFAULTS.simple),
    images: [],
  };
}
