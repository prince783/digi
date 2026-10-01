import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

/* =========================================================
   TEMPLATE TYPES
========================================================= */

export type TemplateId =
  | "template-1"
  | "template-2"
  | "template-3"
  | "template-4"
  | "template-5"
  | "template-6"
  | "template-7"
  | "template-8"
  | "template-9"
  | "template-10"
  | "template-11"
  | "template-12"
  | "template-13"
  | "template-14"
  | "template-15"
  | "template-16"
  | "template-17"
  | "template-18"
  | "template-19"
  | "template-20"
  | "template-21"
  | "template-22"
  | "template-23"
  | "template-24"
  | "template-25";

/* =========================================================
   PAYMENT TYPES
========================================================= */

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed";

/* =========================================================
   ACCOUNT STATUS TYPES
========================================================= */

export type AccountStatus =
  | "active"
  | "pending"
  | "expired"
  | "suspended";

/* =========================================================
   GALLERY TYPES
========================================================= */

export interface IGalleryItem {
  url: string;
  publicId?: string;
  name?: string;
}

/* =========================================================
   VIDEO TYPES
========================================================= */

export interface IVideoItem {
  id?: string;
  url: string;
  platform: "youtube" | "vimeo";
}

/* =========================================================
   CERTIFICATE TYPES
========================================================= */

export interface ICertificateItem {
  id: string;
  url: string;
  publicId?: string;
  name: string;
  size: number;
}

/* =========================================================
   PRODUCT IMAGE TYPES
========================================================= */

export interface IProductImage {
  url: string;
  publicId?: string;
  name?: string;
}

/* =========================================================
   PRODUCT TYPES
========================================================= */

export interface IProduct {
  id: string;

  name: string;

  description: string;

  mrp: number;

  sellingPrice: number;

  images: IProductImage[];

  createdAt?: Date;

  updatedAt?: Date;
}

/* =========================================================
   BUSINESS DETAILS TYPE
========================================================= */

export interface IWorkingHours {
  from: string;
  to: string;
}

export interface IBusinessDetails {
  businessName: string;

  businessType: string;

  gstNumber: string;

  description: string;

  companyLogo: string;

  coverBanner: string;

  services: string[];

  workingHours: {
    weekday: IWorkingHours;

    weekend: IWorkingHours;
  };
}

/* =========================================================
   SOCIAL LINKS TYPE
========================================================= */

export interface ISocialLinks {
  facebook: string;

  instagram: string;

  linkedin: string;

  twitter: string;

  youtube: string;

  telegram: string;

  other: string;
}

/* =========================================================
   DIGITAL CARD INTERFACE
========================================================= */

export interface IDigitalCard extends Document {
  /* =======================================================
     USER
  ======================================================= */

  userId?: string | null;

  /* =======================================================
     USERNAME
  ======================================================= */

  username?: string;

  /* =======================================================
     TEMPLATE
  ======================================================= */

  templateId: TemplateId;

  /* =======================================================
     BASIC DETAILS
  ======================================================= */

  fullName: string;

  companyName: string;

  designation: string;

  profilePhoto: string;

  tagline: string;

  aboutCompany: string;

  /* =======================================================
     STATISTICS
  ======================================================= */

  views?: number;

  shares?: number;

  /* =======================================================
     CONTACT INFORMATION
  ======================================================= */

  mobile: string;

  whatsapp: string;

  email: string;

  website: string;

  address: string;

  googleMapLink: string;

  /* =======================================================
     BUSINESS DETAILS
  ======================================================= */

  businessDetails: IBusinessDetails;

  /* =======================================================
     SOCIAL LINKS
  ======================================================= */

  socialLinks: ISocialLinks;

  /* =======================================================
     GALLERY
  ======================================================= */

  gallery: IGalleryItem[];

  /* =======================================================
     VIDEOS
  ======================================================= */

  videos: IVideoItem[];

  /* =======================================================
     CERTIFICATES
  ======================================================= */

  certificates: ICertificateItem[];

  /* =======================================================
     PRODUCTS
  ======================================================= */

  products: IProduct[];

  /* =======================================================
     DESIGN
  ======================================================= */

  backgroundColor: string;

  /* =======================================================
     PAYMENT
  ======================================================= */

  paymentStatus: PaymentStatus;

  paymentId: string | null;

  paidAt: Date | null;

  paymentAmount: number;

  paymentOrderId: string | null;

  razorpayOrderId: string | null;

  razorpaySignature: string | null;

  /* =======================================================
     ACCOUNT STATUS
  ======================================================= */

  accountStatus: AccountStatus;

  suspendedAt: Date | null;

  suspensionReason: string;

  /* =======================================================
     SUBSCRIPTION
  ======================================================= */

  subscriptionStart: Date | null;

  subscriptionEnd: Date | null;

  /* =======================================================
     PUBLICATION
  ======================================================= */

  isPublished: boolean;

  /* =======================================================
     TIMESTAMPS
  ======================================================= */

  createdAt: Date;

  updatedAt: Date;
}

/* =========================================================
   GALLERY ITEM SCHEMA
========================================================= */

const GalleryItemSchema =
  new Schema<IGalleryItem>(
    {
      url: {
        type: String,

        required: true,

        trim: true,
      },

      publicId: {
        type: String,

        default: "",
      },

      name: {
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
   VIDEO ITEM SCHEMA
========================================================= */

const VideoItemSchema =
  new Schema<IVideoItem>(
    {
      id: {
        type: String,

        default: "",
      },

      url: {
        type: String,

        required: true,

        trim: true,
      },

      platform: {
        type: String,

        enum: [
          "youtube",
          "vimeo",
        ],

        default: "youtube",
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   CERTIFICATE ITEM SCHEMA
========================================================= */

const CertificateItemSchema =
  new Schema<ICertificateItem>(
    {
      id: {
        type: String,

        required: true,

        trim: true,
      },

      url: {
        type: String,

        required: true,

        trim: true,
      },

      publicId: {
        type: String,

        default: "",
      },

      name: {
        type: String,

        required: true,

        trim: true,
      },

      size: {
        type: Number,

        default: 0,

        min: 0,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   PRODUCT IMAGE SCHEMA
========================================================= */

const ProductImageSchema =
  new Schema<IProductImage>(
    {
      url: {
        type: String,

        required: true,

        trim: true,
      },

      publicId: {
        type: String,

        default: "",

        trim: true,
      },

      name: {
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
   PRODUCT SCHEMA
========================================================= */

const ProductSchema =
  new Schema<IProduct>(
    {
      /* =====================================================
         PRODUCT ID
      ===================================================== */

      id: {
        type: String,

        required: true,

        trim: true,

        index: false,
      },

      /* =====================================================
         PRODUCT NAME
      ===================================================== */

      name: {
        type: String,

        required: true,

        trim: true,

        maxlength: 150,
      },

      /* =====================================================
         PRODUCT DESCRIPTION
      ===================================================== */

      description: {
        type: String,

        default: "",

        trim: true,

        maxlength: 2000,
      },

      /* =====================================================
         MRP
      ===================================================== */

      mrp: {
        type: Number,

        required: true,

        min: 0,

        default: 0,
      },

      /* =====================================================
         SELLING PRICE
      ===================================================== */

      sellingPrice: {
        type: Number,

        required: true,

        min: 0,

        default: 0,
      },

      /* =====================================================
         PRODUCT IMAGES
      ===================================================== */

      images: {
        type: [
          ProductImageSchema,
        ],

        default: [],
      },
    },
    {
      _id: false,

      timestamps: true,
    }
  );

/* =========================================================
   DIGITAL CARD SCHEMA
========================================================= */

const DigitalCardSchema =
  new Schema<IDigitalCard>(
    {
      /* =====================================================
         USER
      ===================================================== */

      userId: {
        type: String,

        default: null,

        index: true,
      },

      /* =====================================================
         USERNAME

         Username is optional while creating/saving
         a draft.

         It becomes required when publishing.
      ===================================================== */

      username: {
        type: String,

        required: false,

        trim: true,

        lowercase: true,

        minlength: 3,

        maxlength: 30,

        match: /^[a-z0-9_-]{3,30}$/,

        unique: true,

        sparse: true,

        index: true,

        default: undefined,
      },

      /* =====================================================
         TEMPLATE
      ===================================================== */

      templateId: {
        type: String,

        enum: [
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
        ],

        default: "template-1",

        required: true,
      },

      /* =====================================================
         BASIC DETAILS
      ===================================================== */

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

      tagline: {
        type: String,

        default: "",

        trim: true,
      },

      aboutCompany: {
        type: String,

        default: "",
      },

      /* =====================================================
         STATISTICS
      ===================================================== */

      views: {
        type: Number,

        default: 0,

        min: 0,
      },

      shares: {
        type: Number,

        default: 0,

        min: 0,
      },

      /* =====================================================
         CONTACT
      ===================================================== */

      mobile: {
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

        lowercase: true,
      },

      website: {
        type: String,

        default: "",

        trim: true,
      },

      address: {
        type: String,

        default: "",
      },

      googleMapLink: {
        type: String,

        default: "",
      },

      /* =====================================================
         BUSINESS DETAILS
      ===================================================== */

      businessDetails: {
        businessName: {
          type: String,

          default: "",

          trim: true,
        },

        businessType: {
          type: String,

          default: "",

          trim: true,
        },

        gstNumber: {
          type: String,

          default: "",

          trim: true,

          uppercase: true,
        },

        description: {
          type: String,

          default: "",
        },

        companyLogo: {
          type: String,

          default: "",
        },

        coverBanner: {
          type: String,

          default: "",
        },

        services: {
          type: [String],

          default: [],
        },

        workingHours: {
          weekday: {
            from: {
              type: String,

              default: "09:00 AM",
            },

            to: {
              type: String,

              default: "07:00 PM",
            },
          },

          weekend: {
            from: {
              type: String,

              default: "10:00 AM",
            },

            to: {
              type: String,

              default: "04:00 PM",
            },
          },
        },
      },

      /* =====================================================
         SOCIAL LINKS
      ===================================================== */

      socialLinks: {
        facebook: {
          type: String,

          default: "",
        },

        instagram: {
          type: String,

          default: "",
        },

        linkedin: {
          type: String,

          default: "",
        },

        twitter: {
          type: String,

          default: "",
        },

        youtube: {
          type: String,

          default: "",
        },

        telegram: {
          type: String,

          default: "",
        },

        other: {
          type: String,

          default: "",
        },
      },

      /* =====================================================
         GALLERY
      ===================================================== */

      gallery: {
        type: [
          GalleryItemSchema,
        ],

        default: [],
      },

      /* =====================================================
         VIDEOS
      ===================================================== */

      videos: {
        type: [
          VideoItemSchema,
        ],

        default: [],
      },

      /* =====================================================
         CERTIFICATES
      ===================================================== */

      certificates: {
        type: [
          CertificateItemSchema,
        ],

        default: [],
      },

      /* =====================================================
         PRODUCTS

         Example:

         products: [
           {
             id: "product-123",
             name: "Premium Visiting Card",
             description: "Professional digital card",
             mrp: 999,
             sellingPrice: 499,
             images: [
               {
                 url: "...",
                 publicId: "...",
                 name: "front.jpg"
               }
             ]
           }
         ]
      ===================================================== */

      products: {
        type: [
          ProductSchema,
        ],

        default: [],
      },

      /* =====================================================
         DESIGN
      ===================================================== */

      backgroundColor: {
        type: String,

        default: "#152A47",
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

        index: true,
      },

      paymentId: {
        type: String,

        default: null,
      },

      paidAt: {
        type: Date,

        default: null,
      },

      paymentOrderId: {
        type: String,

        default: null,
      },

      razorpayOrderId: {
        type: String,

        default: null,
      },

      razorpaySignature: {
        type: String,

        default: null,
      },

      /* =====================================================
         ACCOUNT STATUS
      ===================================================== */

      accountStatus: {
        type: String,

        enum: [
          "active",
          "pending",
          "expired",
          "suspended",
        ],

        default: "pending",

        required: true,

        index: true,
      },

      /* =====================================================
         SUSPENSION
      ===================================================== */

      suspendedAt: {
        type: Date,

        default: null,
      },

      suspensionReason: {
        type: String,

        default: "",

        trim: true,
      },

      /* =====================================================
         SUBSCRIPTION
      ===================================================== */

      subscriptionStart: {
        type: Date,

        default: null,

        index: true,
      },

      subscriptionEnd: {
        type: Date,

        default: null,

        index: true,
      },

      /* =====================================================
         PUBLICATION
      ===================================================== */

      isPublished: {
        type: Boolean,

        default: false,

        index: true,
      },
    },

    {
      timestamps: true,

      collection: "digitalcards",
    }
  );

DigitalCardSchema.index({
  paymentStatus: 1,
  paidAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

if (mongoose.models.DigitalCard && !mongoose.models.DigitalCard.schema.paths.accountStatus) {
  delete mongoose.models.DigitalCard;
}

const DigitalCard: Model<IDigitalCard> =
  mongoose.models.DigitalCard ||
  mongoose.model<IDigitalCard>(
    "DigitalCard",
    DigitalCardSchema
  );

export default DigitalCard;