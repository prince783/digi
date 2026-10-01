
/* =========================================================
   TEMPLATE CATEGORY
========================================================= */

export type TemplateCategory =
  | "all"
  | "business"
  | "real-estate"
  | "tour-travel"
  | "health-care"
  | "education"
  | "e-commerce"
  | "ayurvedic"
  | "ngo"
  | "actor"
  | "dancer"
  | "singer"
  | "model"
  | "youtuber"
  | "influencer"
  | "legal"
  | "ca"
  | "fitness"
  | "motivational-speaker"
  | "electrician"
  | "plumber"
  | "photography"
  | "event"
  | "author-writer"
  | "restaurant"
  | "automobile"
  | "food-business"
  | "luxury"
  | "professional"
  | "minimal"
  | "creative"
  | "dark"
  | "others";

/* =========================================================
   TEMPLATE CONFIG
========================================================= */

export interface TemplateConfig {
  id: string;

  name: string;

  category: TemplateCategory;

  categoryLabel: string;

  description: string;

  /*
   * Background image from /public/templates/
   */
  image: string;

  /*
   * Background fallback
   */
  background: string;

  accent: string;

  textColor: string;

  secondaryTextColor: string;

  /*
   * Save Contact button
   */
  button: string;

  buttonText: string;
}

/* =========================================================
   TEMPLATE CATEGORIES
========================================================= */

export const templateCategories: {
  value: TemplateCategory;
  label: string;
}[] = [
  {
    value: "all",
    label: "All Templates",
  },

  {
    value: "business",
    label: "Business",
  },

  {
    value: "real-estate",
    label: "Real Estate",
  },

  {
    value: "tour-travel",
    label: "Tour & Travel",
  },

  {
    value: "health-care",
    label: "Health Care",
  },

  {
    value: "education",
    label: "Education",
  },

  {
    value: "youtuber",
    label: "YouTuber",
  },
  {
    value: "fitness",
    label: "Fitness",
  },

  {
    value: "photography",
    label: "Photography",
  },

  {
    value: "event",
    label: "Event",
  },
  {
    value: "restaurant",
    label: "Restaurant",
  },

  {
    value: "food-business",
    label: "Food Business",
  },

  {
    value: "professional",
    label: "Professional",
  },
 
];

/* =========================================================
   TEMPLATE LIST
========================================================= */

export const templates: TemplateConfig[] = [
  /* =======================================================
     1 - BUSINESS
  ======================================================= */

  {
    id: "template-1",
    name: "Executive",
    category: "business",
    categoryLabel: "Business",
    description: "Modern corporate business card",

    image: "/template/business.jpg",

    background:
      "linear-gradient(145deg,#17133a 0%,#21194e 55%,#100d29 100%)",

    accent: "#6737e8",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.75)",

    button: "#6737e8",

    buttonText: "#ffffff",
  },

  /* =======================================================
     2 - PROFESSIONAL
  ======================================================= */

  {
    id: "template-2",
    name: "business",
    category: "business",
    categoryLabel: "Business",
    description: "Clean professional blue design",

    image: "/template/business1.jpg",

    background:
      "linear-gradient(145deg,#1769e0 0%,#287ce8 55%,#0e56c7 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.75)",

    button: "#ffffff",

    buttonText: "#1769e0",
  },

  /* =======================================================
     3 - MINIMAL
  ======================================================= */

  {
    id: "template-3",
    name: "Gold Minimal",
    category: "business",
    categoryLabel: "Business",
    description: "Premium dark minimal layout",

    image: "/template/business2.jpg",

    background:
      "linear-gradient(145deg,#111111 0%,#191919 55%,#000000 100%)",

    accent: "#f0b400",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.72)",

    button: "#f0b400",

    buttonText: "#111111",
  },

  /* =======================================================
     4 - CREATIVE
  ======================================================= */

  {
    id: "template-4",
    name: "Green Creative",
    category: "business",
    categoryLabel: "Business",
    description: "Fresh modern creative layout",

    image: "/template/business3.jpg",

    background:
      "linear-gradient(145deg,#15945f 0%,#24a86f 55%,#087348 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.78)",

    button: "#ffffff",

    buttonText: "#15945f",
  },

  /* =======================================================
     5 - LUXURY
  ======================================================= */

  {
    id: "template-5",
    name: "Royal Purple",
    category: "event",
    categoryLabel: "Event",
    description: "Elegant premium purple design",

    image: "/template/event.jpg",

    background:
      "linear-gradient(145deg,#6737e8 0%,#7438d7 55%,#4c20ba 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.76)",

    button: "#ffffff",

    buttonText: "#6737e8",
  },

  /* =======================================================
     6 - REAL ESTATE
  ======================================================= */

  {
    id: "template-6",
    name: "Property Pro",
    category: "real-estate",
    categoryLabel: "Real Estate",
    description: "Professional real estate profile",

    image: "/template/realetate1.jpg",

    background:
      "linear-gradient(145deg,#0b5d45 0%,#08775a 50%,#064434 100%)",

    accent: "#d9b56d",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.76)",

    button: "#d9b56d",

    buttonText: "#0b5d45",
  },

  /* =======================================================
     7 - REAL ESTATE LUXURY
  ======================================================= */

  {
    id: "template-7",
    name: "Luxury Estate",
    category: "real-estate",
    categoryLabel: "Real Estate",
    description: "Luxury property consultant design",

    image: "/template/realestate2.jpg",

    background:
      "linear-gradient(145deg,#181818 0%,#292929 55%,#101010 100%)",

    accent: "#d9ad58",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.72)",

    button: "#d9ad58",

    buttonText: "#181818",
  },

  /* =======================================================
     8 - REAL ESTATE BLUE
  ======================================================= */

  {
    id: "template-8",
    name: "Prime Realty",
    category: "real-estate",
    categoryLabel: "Real Estate",
    description: "Premium property business card",

    image: "/template/realestate.jpg",

    background:
      "linear-gradient(145deg,#092e63 0%,#104b91 55%,#061d40 100%)",

    accent: "#dcecff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.74)",

    button: "#dcecff",

    buttonText: "#092e63",
  },

  /* =======================================================
     9 - LUXURY PROPERTY
  ======================================================= */

  {
    id: "template-9",
    name: "Elite Property",
    category: "health-care",
    categoryLabel: "Health Care",
    description: "Elegant luxury property profile",

    image: "/template/health1.jpg",

    background:
      "linear-gradient(145deg,#3b1c57 0%,#5a287b 55%,#241037 100%)",

    accent: "#e7c26e",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.74)",

    button: "#e7c26e",

    buttonText: "#3b1c57",
  },

  /* =======================================================
     10 - DARK
  ======================================================= */

  {
    id: "template-10",
    name: "Black Signature",
    category: "tour-travel",
    categoryLabel: "Tour & Travel",
    description: "Bold black professional design",

    image: "/template/tour1.jpg",

    background:
      "linear-gradient(145deg,#050505 0%,#181818 50%,#000000 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.65)",

    button: "#ffffff",

    buttonText: "#050505",
  },

  /* =======================================================
     11 - TRAVEL
  ======================================================= */

  {
    id: "template-11",
    name: "Travel Explorer",
    category: "tour-travel",
    categoryLabel: "Tour & Travel",
    description: "Modern travel and tourism card",

    image: "/template/tour.jpg",

    background:
      "linear-gradient(145deg,#0077b6 0%,#00a6c7 55%,#005f8c 100%)",

    accent: "#ffe082",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.78)",

    button: "#ffe082",

    buttonText: "#0077b6",
  },

  /* =======================================================
     12 - HEALTH CARE
  ======================================================= */

  {
    id: "template-12",
    name: "Medical Care",
    category: "health-care",
    categoryLabel: "Health Care",
    description: "Clean healthcare professional design",

    image: "/template/health.jpg",

    background:
      "linear-gradient(145deg,#087f8c 0%,#11a7a7 55%,#05646d 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.78)",

    button: "#ffffff",

    buttonText: "#087f8c",
  },

  /* =======================================================
     13 - EDUCATION
  ======================================================= */

  {
    id: "template-13",
    name: "Education Pro",
    category: "education",
    categoryLabel: "Education",
    description: "Academic and educational profile",

    image: "/template/education1.jpg",

    background:
      "linear-gradient(145deg,#4338ca 0%,#5b5ce2 55%,#29227e 100%)",

    accent: "#f8d66d",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.76)",

    button: "#f8d66d",

    buttonText: "#4338ca",
  },

  /* =======================================================
     14 - E-COMMERCE
  ======================================================= */

  {
    id: "template-14",
    name: "Online Store",
    category: "education",
    categoryLabel: "Education",
    description: "Modern online business card",

    image: "/template/education.jpg",

    background:
      "linear-gradient(145deg,#db2777 0%,#ec4899 55%,#9d174d 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.76)",

    button: "#ffffff",

    buttonText: "#db2777",
  },

  /* =======================================================
     15 - AYURVEDIC
  ======================================================= */

  {
    id: "template-15",
    name: "Educations",
    category: "education",
    categoryLabel: "Education",
    description: "eduction design card",

    image: "/template/education2.jpg",

    background:
      "linear-gradient(145deg,#31572c 0%,#4f772d 55%,#19381f 100%)",

    accent: "#e9d8a6",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.76)",

    button: "#e9d8a6",

    buttonText: "#31572c",
  },

  /* =======================================================
     16 - NGO
  ======================================================= */

  {
    id: "template-16",
    name: "Social Impact",
    category: "health-care",
    categoryLabel: "Health Care",
    description: "Trust-focused NGO profile",

    image: "/template/health2.jpg",

    background:
      "linear-gradient(145deg,#0f766e 0%,#14b8a6 55%,#115e59 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.78)",

    button: "#ffffff",

    buttonText: "#0f766e",
  },

  /* =======================================================
     17 - ACTOR
  ======================================================= */

  {
    id: "template-17",
    name: "Event",
    category: "event",
    categoryLabel: "Event",
    description: "Creative actor portfolio design",

    image: "/template/event1.jpg",

    background:
      "linear-gradient(145deg,#4c0519 0%,#9f1239 55%,#27000d 100%)",

    accent: "#fda4af",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.74)",

    button: "#fda4af",

    buttonText: "#4c0519",
  },

  /* =======================================================
     18 - DANCER
  ======================================================= */

  {
    id: "template-18",
    name: "Performer",
    category: "event",
    categoryLabel: "Event",
    description: "Dynamic performer",

    image: "/template/event2.jpg",

    background:
      "linear-gradient(145deg,#312e81 0%,#7c3aed 55%,#1e1b4b 100%)",

    accent: "#f0abfc",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.75)",

    button: "#f0abfc",

    buttonText: "#312e81",
  },

  /* =======================================================
     19 - SINGER
  ======================================================= */

  {
    id: "template-19",
    name: "Music Studio",
    category: "youtuber",
    categoryLabel: "YouTuber",
    description: "Stylish singer and musician profile",

    image: "/template/youtube.png",

    background:
      "linear-gradient(145deg,#111827 0%,#374151 55%,#030712 100%)",

    accent: "#a78bfa",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.70)",

    button: "#a78bfa",

    buttonText: "#111827",
  },

  /* =======================================================
     20 - YOUTUBER
  ======================================================= */

  {
    id: "template-20",
    name: "Creator",
    category: "food-business",
    categoryLabel: "Food Business",
    description: "Content creator profile",

    image: "/template/resturent1.jpg",

    background:
      "linear-gradient(145deg,#991b1b 0%,#ef4444 55%,#450a0a 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.78)",

    button: "#ffffff",

    buttonText: "#991b1b",
  },

  /* =======================================================
     21 - INFLUENCER
  ======================================================= */

  {
    id: "template-21",
    name: "photography",
    category: "photography",
    categoryLabel: "Photography",
    description: "Social media influencer card",

    image: "/template/photography.jpg",

    background:
      "linear-gradient(145deg,#be185d 0%,#f472b6 55%,#831843 100%)",

    accent: "#ffffff",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.78)",

    button: "#ffffff",

    buttonText: "#be185d",
  },

  /* =======================================================
     22 - LEGAL
  ======================================================= */

  {
    id: "template-22",
    name: "Legal Counsel",
    category: "fitness",
    categoryLabel: "Fitness",
    description: "Professional legal consultant card",

    image: "/template/fitness.jpg",

    background:
      "linear-gradient(145deg,#172554 0%,#1e3a8a 55%,#0f172a 100%)",

    accent: "#d6b36a",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.72)",

    button: "#d6b36a",

    buttonText: "#172554",
  },

  /* =======================================================
     23 - FITNESS
  ======================================================= */

  {
    id: "template-23",
    name: "Fitness Coach",
    category: "fitness",
    categoryLabel: "Fitness",
    description: "Strong modern fitness profile",

    image: "/template/fitness1.jpg",

    background:
      "linear-gradient(145deg,#14532d 0%,#16a34a 55%,#052e16 100%)",

    accent: "#bef264",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.76)",

    button: "#bef264",

    buttonText: "#14532d",
  },

  /* =======================================================
     24 - PHOTOGRAPHY
  ======================================================= */

  {
    id: "template-24",
    name: "Photographer",
    category: "photography",
    categoryLabel: "Photography",
    description: "Creative photography portfolio",

    image: "/template/photography1.jpg",

    background:
      "linear-gradient(145deg,#18181b 0%,#3f3f46 55%,#09090b 100%)",

    accent: "#f4f4f5",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.70)",

    button: "#f4f4f5",

    buttonText: "#18181b",
  },

  /* =======================================================
     25 - FOOD
  ======================================================= */

  {
    id: "template-25",
    name: "Food Business",
    category: "food-business",
    categoryLabel: "Food Business",
    description: "Modern food and restaurant profile",

    image: "/template/resturent.jpg",

    background:
      "linear-gradient(145deg,#7c2d12 0%,#ea580c 55%,#431407 100%)",

    accent: "#fed7aa",

    textColor: "#ffffff",

    secondaryTextColor: "rgba(255,255,255,.78)",

    button: "#fed7aa",

    buttonText: "#7c2d12",
  },
];

/* =========================================================
   TEMPLATE IDS
========================================================= */

export const templateIds: string[] = templates.map(
  (template) => template.id,
);
export const TEMPLATE_DATA = templates;

/* =========================================================
   GET TEMPLATE
========================================================= */

export function getTemplateData(
  template: string,
): TemplateConfig {
  return (
    templates.find(
      (item) => item.id === template,
    ) || templates[0]
  );
}

/* =========================================================
   GET CATEGORY
========================================================= */

export function getTemplateCategory(
  template: string,
): TemplateCategory {
  return (
    templates.find(
      (item) => item.id === template,
    )?.category || "business"
  );
}