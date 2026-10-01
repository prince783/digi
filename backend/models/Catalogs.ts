import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

/* =========================================================
   PAYMENT STATUS
========================================================= */

export type CatalogPaymentStatus =
  | "pending"
  | "paid"
  | "failed";

/* =========================================================
   VALID CATALOG TEMPLATE IDS
========================================================= */

export const CATALOG_LAYOUT_TEMPLATES = [
  "simple",
  "editorial-luxe",
  "modern-grid",
  "organic-nature",
  "boutique-showcase",
  "warm-living",
  "luxury-desert",
  "noir-atelier",
  "maison-luxe",
  "ivory-gallery",
  "corner-editorial",
  "vertical-split",
  "framed-gallery",
  "dark-strip",
  "arch-window",
  "voltex-tech",
  "rivaara-jewellery",
  "style-vibe",
] as const;

export type CatalogLayoutTemplateId =
  (typeof CATALOG_LAYOUT_TEMPLATES)[number];

/* =========================================================
   COMPANY
========================================================= */

export interface ICatalogCompany {
  fullName: string;
  companyName: string;
  designation: string;

  profilePhoto: string;
  logo: string;

  tagline: string;
  aboutCompany: string;

  mobile: string;
  phone: string;
  whatsapp: string;

  email: string;
  website: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapLink: string;
}

/* =========================================================
   PRODUCT
========================================================= */

export interface ICatalogProduct {
  id: string;
  name: string;
  description: string;

  sellingPrice: number;
  mrp: number;

  image: string;

  // References ICatalogProductCategory.id below — not the fixed
  // business `category` on ICatalog, which is a separate concept.
  categoryId?: string;
}

export interface ICatalogProductCategory {
  id: string;
  name: string;
  image: string;
  icon: string;
}

export interface ICatalogHeroSlide {
  id: string;
  image: string;
  active: boolean;
}

export interface ICatalogHero {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  images: ICatalogHeroSlide[];
}

/* =========================================================
   BILLING
========================================================= */

export interface ICatalogBilling {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

/* =========================================================
   CATALOG
========================================================= */

export interface ICatalog extends Document {
  userId: mongoose.Types.ObjectId | string;

  username: string;

  /*
   * Legacy field.
   *
   * Keep this for backward compatibility, but DO NOT use
   * this field to decide which new catalog layout to render.
   */
  templateId: string;

  /*
   * IMPORTANT:
   *
   * This is the ONLY field that should determine the
   * selected catalog design.
   */
  layoutTemplateId: CatalogLayoutTemplateId;

  company: ICatalogCompany;

  billing: ICatalogBilling;

  category: string;

  hero: ICatalogHero;

  products: ICatalogProduct[];

  productCategories: ICatalogProductCategory[];

  paymentStatus: CatalogPaymentStatus;

  paymentOrderId: string | null;

  paymentId: string | null;

  paymentSignature: string | null;

  paymentAmount: number;

  paidAt: Date | null;

  expiresAt?: Date | null;

  isPublished: boolean;

  accountStatus?: "active" | "pending" | "expired" | "suspended";

  suspendedAt?: Date | null;

  suspensionReason?: string;

  createdAt: Date;

  updatedAt: Date;
}

/* =========================================================
   COMPANY SCHEMA
========================================================= */

const CatalogCompanySchema =
  new Schema<ICatalogCompany>(
    {
      fullName: {
        type: String,
        default: "",
        trim: true,
      },

      companyName: {
        type: String,
        default: "",
        trim: true,
      },

      designation: {
        type: String,
        default: "",
        trim: true,
      },

      profilePhoto: {
        type: String,
        default: "",
      },

      logo: {
        type: String,
        default: "",
      },

      tagline: {
        type: String,
        default: "",
        trim: true,
      },

      aboutCompany: {
        type: String,
        default: "",
        trim: true,
      },

      mobile: {
        type: String,
        default: "",
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      whatsapp: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
      },

      website: {
        type: String,
        default: "",
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      state: {
        type: String,
        default: "",
        trim: true,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
      },

      googleMapLink: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   BILLING SCHEMA
========================================================= */

const CatalogBillingSchema =
  new Schema<ICatalogBilling>(
    {
      address: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      pincode: { type: String, default: "", trim: true },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   PRODUCT SCHEMA
========================================================= */

const CatalogProductSchema =
  new Schema<ICatalogProduct>(
    {
      id: {
        type: String,
        required: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 30,
      },

      sellingPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      mrp: {
        type: Number,
        default: 0,
        min: 0,
      },

      image: {
        type: String,
        default: "",
      },

      categoryId: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

const CatalogProductCategorySchema =
  new Schema<ICatalogProductCategory>(
    {
      id: {
        type: String,
        required: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
      },

      image: {
        type: String,
        default: "",
      },

      icon: {
        type: String,
        default: "Package",
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   CATALOG SCHEMA
========================================================= */

const CatalogSchema =
  new Schema<ICatalog>(
    {
      /* =====================================================
         USER
      ===================================================== */

      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
      },

      // No default — a catalog has no category until its owner
      // actually picks one.
      category: {
        type: String,
        trim: true,
      },

      hero: {
        eyebrow: { type: String, default: "", trim: true },
        title: { type: String, default: "", trim: true },
        description: { type: String, default: "", trim: true },
        image: { type: String, default: "" },
        images: {
          type: [
            {
              id: { type: String, required: true },
              image: { type: String, default: "" },
              active: { type: Boolean, default: true },
              _id: false,
            },
          ],
          default: [],
        },
        _id: false,
      },

      /* =====================================================
         USERNAME
      ===================================================== */

      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: /^[a-z0-9_-]{3,30}$/,
      },

      /* =====================================================
         LEGACY TEMPLATE ID
         -----------------------------------------------------
         Keep this only if other old code still expects it.
         New rendering should NOT use this.
      ===================================================== */

      templateId: {
        type: String,
        default: "simple",

        enum: [
          "simple",
          "editorial-luxe",
          "modern-grid",
          "organic-nature",
          "boutique-showcase",
          "warm-living",
          "luxury-desert",
          "noir-atelier",
          "maison-luxe",
          "ivory-gallery",
          "corner-editorial",
          "vertical-split",
          "framed-gallery",
          "dark-strip",
          "arch-window",
          "voltex-tech",
          "rivaara-jewellery",
          "style-vibe",
        ],
      },

      /* =====================================================
         ACTIVE CATALOG LAYOUT
         -----------------------------------------------------
         THIS IS THE IMPORTANT FIELD.
      ===================================================== */

      layoutTemplateId: {
        type: String,

        required: true,

        default: "simple",

        enum: [
          "simple",
          "editorial-luxe",
          "modern-grid",
          "organic-nature",
          "boutique-showcase",
          "warm-living",
          "luxury-desert",
          "noir-atelier",
          "maison-luxe",
          "ivory-gallery",
          "corner-editorial",
          "vertical-split",
          "framed-gallery",
          "dark-strip",
          "arch-window",
          "voltex-tech",
          "rivaara-jewellery",
          "style-vibe",
        ],
      },

      /* =====================================================
         COMPANY
      ===================================================== */

      billing: {
        type: CatalogBillingSchema,
        default: () => ({}),
      },

      company: {
        type: CatalogCompanySchema,
        required: true,
      },

      /* =====================================================
         PRODUCTS
      ===================================================== */

      products: {
        type: [CatalogProductSchema],
        default: [],
      },

      productCategories: {
        type: [CatalogProductCategorySchema],
        default: [],
      },

      /* =====================================================
         PAYMENT
      ===================================================== */

      paymentStatus: {
        type: String,

        enum: [
          "pending",
          "paid",
          "failed",
        ],

        default: "pending",
      },

      paymentOrderId: {
        type: String,
        default: null,
      },

      paymentId: {
        type: String,
        default: null,
      },

      paymentSignature: {
        type: String,
        default: null,
      },

      paymentAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      expiresAt: {
        type: Date,
        default: null,
        index: true,
      },

      /* =====================================================
         PUBLISHED
      ===================================================== */

      isPublished: {
        type: Boolean,
        default: false,
      },

      accountStatus: {
        type: String,
        enum: ["active", "pending", "expired", "suspended"],
        default: "pending",
      },

      suspendedAt: {
        type: Date,
        default: null,
      },

      suspensionReason: {
        type: String,
        default: "",
        trim: true,
      },
    },

    {
      timestamps: true,
    }
  );

/* =========================================================
   INDEXES
========================================================= */

CatalogSchema.index({
  userId: 1,
});

CatalogSchema.index({
  username: 1,
});

CatalogSchema.index({
  paymentStatus: 1,
  isPublished: 1,
});

CatalogSchema.index({
  paymentStatus: 1,
  paidAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

if (mongoose.models.Catalog && !mongoose.models.Catalog.schema.paths.accountStatus) {
  delete mongoose.models.Catalog;
}

const Catalog: Model<ICatalog> =
  mongoose.models.Catalog ||
  mongoose.model<ICatalog>(
    "Catalog",
    CatalogSchema
  );

export default Catalog;