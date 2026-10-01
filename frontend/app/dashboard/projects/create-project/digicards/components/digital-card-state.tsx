"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  useRef,
} from "react";

import { templateIds } from "./templateData";

/* =========================================================
   TEMPLATE TYPE
========================================================= */

export type TemplateId = string;

/* =========================================================
   WORKING HOURS
========================================================= */

export interface WorkingHour {
  from: string;
  to: string;
}

export interface WorkingHours {
  weekday: WorkingHour;
  weekend: WorkingHour;
}

/* =========================================================
   BUSINESS DETAILS
========================================================= */

export interface BusinessDetails {
  businessName: string;
  businessType: string;
  gstNumber: string;
  description: string;

  companyLogo: string;
  coverBanner: string;

  services: string[];

  workingHours: WorkingHours;
}

/* =========================================================
   SOCIAL LINKS
========================================================= */

export interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  telegram: string;
  other: string;
}

/* =========================================================
   GALLERY
========================================================= */

export interface GalleryImage {
  url: string;
  publicId?: string;
  name?: string;
}

export interface GalleryVideo {
  id: string;
  url: string;
  platform: "youtube" | "vimeo";
}

export interface GalleryCertificate {
  id: string;
  name: string;
  size: number;
  url: string;
  publicId?: string;
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

export interface ProductImage {
  url: string;
  publicId?: string;
  name?: string;
}

/* =========================================================
   DIGITAL CARD PRODUCT
========================================================= */

export interface DigitalCardProduct {
  id: string;

  name: string;

  description: string;

  mrp: number;

  sellingPrice: number;

  images: ProductImage[];

  createdAt?: string;

  updatedAt?: string;
}

/* =========================================================
   PAYMENT
========================================================= */

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed";

/* =========================================================
   ACCOUNT STATUS
========================================================= */

export type AccountStatus =
  | "active"
  | "pending"
  | "expired"
  | "suspended";

/* =========================================================
   DIGITAL CARD
========================================================= */

export interface DigitalCardData {
  _id?: string;

  userId?: string | null;

  username: string;

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
     CONTACT
  ======================================================= */

  mobile: string;

  whatsapp: string;

  email: string;

  website: string;

  address: string;

  googleMapLink: string;

  /* =======================================================
     BUSINESS
  ======================================================= */

  businessDetails: BusinessDetails;

  /* =======================================================
     SOCIAL
  ======================================================= */

  socialLinks: SocialLinks;

  /* =======================================================
     GALLERY
  ======================================================= */

  gallery: GalleryImage[];

  videos: GalleryVideo[];

  certificates: GalleryCertificate[];

  /* =======================================================
     PRODUCTS
     
     Products belong to the user's digital card.
     
     Example:
     - Product name
     - Description
     - MRP
     - Selling price
     - Product images
  ======================================================= */

  products: DigitalCardProduct[];

  /* =======================================================
     DESIGN
  ======================================================= */

  backgroundColor: string;

  /* =======================================================
     ACTION SETTINGS
  ======================================================= */

  showCall: boolean;

  showWhatsapp: boolean;

  showEmail: boolean;

  showWebsite: boolean;

  showLocation: boolean;

  showCustomButton: boolean;

  customButtonLabel: string;

  customButtonLink: string;

  cardLink: string;

  /* =======================================================
     SEO
  ======================================================= */

  seoVisible: boolean;

  /* =======================================================
     PASSWORD
  ======================================================= */

  passwordProtection: boolean;

  cardPassword: string;

  /* =======================================================
     STATISTICS
  ======================================================= */

  views?: number;

  shares?: number;

  qrScans?: number;

  /* =======================================================
     PUBLICATION
  ======================================================= */

  isPublished?: boolean;

  /* =======================================================
     PAYMENT
  ======================================================= */

  paymentStatus?: PaymentStatus;

  paymentId?: string | null;

  paidAt?: string | null;

  paymentOrderId?: string | null;

  razorpayOrderId?: string | null;

  razorpaySignature?: string | null;

  /* =======================================================
     ACCOUNT
  ======================================================= */

  accountStatus?: AccountStatus;

  suspendedAt?: string | null;

  suspensionReason?: string;

  subscriptionStart?: string | null;

  subscriptionEnd?: string | null;

  /* =======================================================
     DATES
  ======================================================= */

  createdAt?: string;

  updatedAt?: string;
}

/* =========================================================
   EMPTY CARD
========================================================= */

export const emptyCard: DigitalCardData = {
  _id: undefined,

  userId: null,

  username: "",

  /* =======================================================
     TEMPLATE
  ======================================================= */

  templateId: "template-1" as TemplateId,

  /* =======================================================
     BASIC
  ======================================================= */

  fullName: "",

  companyName: "",

  designation: "",

  profilePhoto: "",

  tagline: "",

  aboutCompany: "",

  /* =======================================================
     CONTACT
  ======================================================= */

  mobile: "",

  whatsapp: "",

  email: "",

  website: "",

  address: "",

  googleMapLink: "",

  /* =======================================================
     BUSINESS
  ======================================================= */

  businessDetails: {
    businessName: "",

    businessType: "",

    gstNumber: "",

    description: "",

    companyLogo: "",

    coverBanner: "",

    services: [],

    workingHours: {
      weekday: {
        from: "09:00 AM",
        to: "07:00 PM",
      },

      weekend: {
        from: "10:00 AM",
        to: "04:00 PM",
      },
    },
  },

  /* =======================================================
     SOCIAL
  ======================================================= */

  socialLinks: {
    facebook: "",

    instagram: "",

    linkedin: "",

    twitter: "",

    youtube: "",

    telegram: "",

    other: "",
  },

  /* =======================================================
     GALLERY
  ======================================================= */

  gallery: [],

  videos: [],

  certificates: [],

  /* =======================================================
     PRODUCTS
  ======================================================= */

  products: [],

  /* =======================================================
     DESIGN
  ======================================================= */

  backgroundColor: "#152A47",

  /* =======================================================
     ACTION SETTINGS
  ======================================================= */

  showCall: true,

  showWhatsapp: true,

  showEmail: true,

  showWebsite: true,

  showLocation: true,

  showCustomButton: false,

  customButtonLabel: "",

  customButtonLink: "",

  cardLink: "",

  /* =======================================================
     SEO
  ======================================================= */

  seoVisible: true,

  /* =======================================================
     PASSWORD
  ======================================================= */

  passwordProtection: false,

  cardPassword: "",

  /* =======================================================
     STATISTICS
  ======================================================= */

  views: 0,

  shares: 0,

  qrScans: 0,

  /* =======================================================
     PUBLICATION
  ======================================================= */

  isPublished: false,

  /* =======================================================
     PAYMENT
  ======================================================= */

  paymentStatus: "pending",

  paymentId: null,

  paidAt: null,

  paymentOrderId: null,

  razorpayOrderId: null,

  razorpaySignature: null,

  /* =======================================================
     ACCOUNT
  ======================================================= */

  accountStatus: "pending",

  suspendedAt: null,

  suspensionReason: "",

  subscriptionStart: null,

  subscriptionEnd: null,
};

/* =========================================================
   CONTEXT TYPE
========================================================= */

interface DigitalCardContextType {
  card: DigitalCardData;

  updateCard: <K extends keyof DigitalCardData>(
    key: K,
    value: DigitalCardData[K]
  ) => Promise<void>;

  setUsername: (
    username: string
  ) => Promise<void>;

  setTemplate: (
    templateId: TemplateId
  ) => Promise<void>;

  saveCard: () => Promise<void>;

  loading: boolean;

  saving: boolean;

  cardId: string | null;
}

/* =========================================================
   CONTEXT
========================================================= */

const DigitalCardContext =
  createContext<DigitalCardContextType | undefined>(
    undefined
  );

/* =========================================================
   CREATE CLIENT ID
========================================================= */

function createClientId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/* =========================================================
   NORMALIZE TEMPLATE
========================================================= */

function normalizeTemplate(
  value: unknown
): TemplateId {
  if (
    typeof value === "string" &&
    (templateIds as readonly string[]).includes(value)
  ) {
    return value as TemplateId;
  }

  return "template-1" as TemplateId;
}

/* =========================================================
   NORMALIZE USERNAME
========================================================= */

export function normalizeUsername(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

/* =========================================================
   NORMALIZE GALLERY
========================================================= */

function normalizeGallery(
  gallery: unknown
): GalleryImage[] {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery
    .map(
      (
        item
      ): GalleryImage | null => {
        if (typeof item === "string") {
          const url = item.trim();

          if (!url) {
            return null;
          }

          return {
            url,
          };
        }

        if (
          item &&
          typeof item === "object" &&
          typeof (item as GalleryImage).url === "string"
        ) {
          const image =
            item as GalleryImage;

          const url =
            image.url.trim();

          if (!url) {
            return null;
          }

          return {
            url,

            ...(typeof image.publicId === "string"
              ? {
                  publicId:
                    image.publicId,
                }
              : {}),

            ...(typeof image.name === "string"
              ? {
                  name: image.name,
                }
              : {}),
          };
        }

        return null;
      }
    )
    .filter(
      (
        item
      ): item is GalleryImage =>
        item !== null
    );
}

/* =========================================================
   NORMALIZE VIDEOS
========================================================= */

function normalizeVideos(
  videos: unknown
): GalleryVideo[] {
  if (!Array.isArray(videos)) {
    return [];
  }

  return videos
    .map(
      (
        video
      ): GalleryVideo | null => {
        if (
          !video ||
          typeof video !== "object"
        ) {
          return null;
        }

        const item =
          video as Partial<GalleryVideo>;

        const url =
          typeof item.url === "string"
            ? item.url.trim()
            : "";

        if (!url) {
          return null;
        }

        return {
          id:
            typeof item.id === "string" &&
            item.id.trim()
              ? item.id
              : createClientId(),

          url,

          platform:
            item.platform === "vimeo"
              ? "vimeo"
              : "youtube",
        };
      }
    )
    .filter(
      (
        video
      ): video is GalleryVideo =>
        video !== null
    );
}

/* =========================================================
   NORMALIZE CERTIFICATES
========================================================= */

function normalizeCertificates(
  certificates: unknown
): GalleryCertificate[] {
  if (!Array.isArray(certificates)) {
    return [];
  }

  return certificates
    .map(
      (
        certificate
      ): GalleryCertificate | null => {
        if (
          !certificate ||
          typeof certificate !== "object"
        ) {
          return null;
        }

        const item =
          certificate as Partial<GalleryCertificate>;

        const url =
          typeof item.url === "string"
            ? item.url.trim()
            : "";

        if (!url) {
          return null;
        }

        return {
          id:
            typeof item.id === "string" &&
            item.id.trim()
              ? item.id
              : createClientId(),

          name:
            typeof item.name === "string"
              ? item.name
              : "",

          size:
            typeof item.size === "number"
              ? item.size
              : 0,

          url,

          ...(typeof item.publicId === "string"
            ? {
                publicId:
                  item.publicId,
              }
            : {}),
        };
      }
    )
    .filter(
      (
        certificate
      ): certificate is GalleryCertificate =>
        certificate !== null
    );
}

/* =========================================================
   NORMALIZE PRODUCTS
========================================================= */

function normalizeProducts(
  products: unknown
): DigitalCardProduct[] {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .map(
      (
        product
      ): DigitalCardProduct | null => {
        if (
          !product ||
          typeof product !== "object"
        ) {
          return null;
        }

        const item =
          product as Partial<DigitalCardProduct>;

        const name =
          typeof item.name === "string"
            ? item.name.trim()
            : "";

        const description =
          typeof item.description === "string"
            ? item.description.trim()
            : "";

        const mrp =
          typeof item.mrp === "number"
            ? Math.max(0, item.mrp)
            : 0;

        const sellingPrice =
          typeof item.sellingPrice === "number"
            ? Math.max(0, item.sellingPrice)
            : 0;

        if (!name) {
          return null;
        }

        const images =
          Array.isArray(item.images)
            ? item.images
                .map(
                  (
                    image
                  ): ProductImage | null => {
                    if (
                      !image ||
                      typeof image !==
                        "object"
                    ) {
                      return null;
                    }

                    const imageItem =
                      image as Partial<ProductImage>;

                    const url =
                      typeof imageItem.url ===
                      "string"
                        ? imageItem.url.trim()
                        : "";

                    if (!url) {
                      return null;
                    }

                    return {
                      url,

                      ...(typeof imageItem.publicId ===
                      "string"
                        ? {
                            publicId:
                              imageItem.publicId,
                          }
                        : {}),

                      ...(typeof imageItem.name ===
                      "string"
                        ? {
                            name:
                              imageItem.name,
                          }
                        : {}),
                    };
                  }
                )
                .filter(
                  (
                    image
                  ): image is ProductImage =>
                    image !== null
                )
            : [];

        return {
          id:
            typeof item.id === "string" &&
            item.id.trim()
              ? item.id
              : createClientId(),

          name,

          description,

          mrp,

          sellingPrice,

          images,

          ...(typeof item.createdAt === "string"
            ? {
                createdAt:
                  item.createdAt,
              }
            : {}),

          ...(typeof item.updatedAt === "string"
            ? {
                updatedAt:
                  item.updatedAt,
              }
            : {}),
        };
      }
    )
    .filter(
      (
        product
      ): product is DigitalCardProduct =>
        product !== null
    );
}

/* =========================================================
   NORMALIZE BUSINESS DETAILS
========================================================= */

function normalizeBusinessDetails(
  businessDetails: unknown
): BusinessDetails {
  const source =
    businessDetails &&
    typeof businessDetails === "object"
      ? (businessDetails as Partial<BusinessDetails>)
      : {};

  const workingHours: Partial<WorkingHours> =
    source.workingHours ?? {};

  const weekday: Partial<WorkingHour> =
    workingHours.weekday ?? {};

  const weekend: Partial<WorkingHour> =
    workingHours.weekend ?? {};

  return {
    ...emptyCard.businessDetails,

    ...source,

    services:
      Array.isArray(source.services)
        ? source.services.filter(
            (service): service is string =>
              typeof service === "string"
          )
        : [],

    workingHours: {
      ...emptyCard.businessDetails
        .workingHours,

      ...workingHours,

      weekday: {
        ...emptyCard.businessDetails
          .workingHours.weekday,

        ...weekday,
      },

      weekend: {
        ...emptyCard.businessDetails
          .workingHours.weekend,

        ...weekend,
      },
    },
  };
}

/* =========================================================
   NORMALIZE SOCIAL LINKS
========================================================= */

function normalizeSocialLinks(
  socialLinks: unknown
): SocialLinks {
  const source =
    socialLinks &&
    typeof socialLinks === "object"
      ? (socialLinks as Partial<SocialLinks>)
      : {};

  return {
    ...emptyCard.socialLinks,

    ...source,
  };
}

/* =========================================================
   NORMALIZE CARD
========================================================= */

function normalizeCard(
  data?: Partial<DigitalCardData> | null
): DigitalCardData {
  const source =
    data ?? {};

  return {
    ...emptyCard,

    ...source,

    /* =====================================================
       USERNAME
    ===================================================== */

    username:
      normalizeUsername(
        source.username
      ),

    /* =====================================================
       TEMPLATE
    ===================================================== */

    templateId:
      normalizeTemplate(
        source.templateId
      ),

    /* =====================================================
       BUSINESS
    ===================================================== */

    businessDetails:
      normalizeBusinessDetails(
        source.businessDetails
      ),

    /* =====================================================
       SOCIAL
    ===================================================== */

    socialLinks:
      normalizeSocialLinks(
        source.socialLinks
      ),

    /* =====================================================
       GALLERY
    ===================================================== */

    gallery:
      normalizeGallery(
        source.gallery
      ),

    /* =====================================================
       VIDEOS
    ===================================================== */

    videos:
      normalizeVideos(
        source.videos
      ),

    /* =====================================================
       CERTIFICATES
    ===================================================== */

    certificates:
      normalizeCertificates(
        source.certificates
      ),

    /* =====================================================
       PRODUCTS
    ===================================================== */

    products:
      normalizeProducts(
        source.products
      ),
  };
}

/* =========================================================
   PROVIDER
========================================================= */

export function DigitalCardProvider({
  children,
}: {
  children: ReactNode;
}) {
  /* =======================================================
     CARD STATE
  ======================================================= */

  const [card, setCard] =
    useState<DigitalCardData>(() =>
      normalizeCard(emptyCard)
    );

  /* =======================================================
     CARD REF
  ======================================================= */

  const cardRef =
    useRef<DigitalCardData>(
      normalizeCard(emptyCard)
    );

  /* =======================================================
     CARD ID
  ======================================================= */

  const [cardId, setCardId] =
    useState<string | null>(null);

  const cardIdRef =
    useRef<string | null>(null);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     SAVING
  ======================================================= */

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     CREATE LOCK
  ======================================================= */

  const creatingCardRef =
    useRef<Promise<string> | null>(
      null
    );

  /* =======================================================
     SAVE VERSION
  ======================================================= */

  const saveVersionRef =
    useRef(0);

  /* =======================================================
     SET CARD ID
  ======================================================= */

  const setCurrentCardId =
    useCallback(
      (
        id: string | null
      ) => {
        cardIdRef.current =
          id;

        setCardId(id);
      },
      []
    );

  /* =======================================================
     CREATE CARD
  ======================================================= */

  const createCard =
    useCallback(
      async (
        initialData:
          Partial<DigitalCardData>
      ): Promise<string> => {
        /*
         * Prevent duplicate POST requests.
         */
        if (
          creatingCardRef.current
        ) {
          return creatingCardRef.current;
        }

        const createPromise =
          (async () => {
            try {
              setSaving(true);

              const newCard =
                normalizeCard(
                  initialData
                );

              const response =
                await fetch(
                  "/api/digital-cards",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    credentials:
                      "include",

                    body:
                      JSON.stringify(
                        newCard
                      ),
                  }
                );

              const data =
                await response.json();

              if (!response.ok) {
                throw new Error(
                  data?.message ??
                    "Failed to create digital card."
                );
              }

              if (
                !data?.card?._id
              ) {
                throw new Error(
                  "Card ID was not returned by the server."
                );
              }

              const newId =
                String(
                  data.card._id
                );

              /*
               * Save ID locally.
               */
              localStorage.setItem(
                "digitalCardId",
                newId
              );

              setCurrentCardId(
                newId
              );

              const createdCard =
                normalizeCard(
                  data.card
                );

              /*
               * Never lose the current
               * selected template.
               */
              const finalCard =
                normalizeCard({
                  ...createdCard,

                  templateId:
                    newCard.templateId,

                  /*
                   * Also preserve locally
                   * entered products if the
                   * server response does not
                   * contain them yet.
                   */
                  products:
                    newCard.products,
                });

              cardRef.current =
                finalCard;

              setCard(
                finalCard
              );

              return newId;
            } catch (error) {
              console.error(
                "CREATE CARD ERROR:",
                error
              );

              throw error;
            } finally {
              setSaving(false);
            }
          })();

        creatingCardRef.current =
          createPromise;

        try {
          return await createPromise;
        } finally {
          creatingCardRef.current =
            null;
        }
      },
      [setCurrentCardId]
    );

  /* =======================================================
     LOAD CARD
  ======================================================= */

  const loadCard =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const savedCardId =
            localStorage.getItem(
              "digitalCardId"
            );

          /*
           * No saved card.
           */
          if (!savedCardId) {
            const initial =
              normalizeCard(
                emptyCard
              );

            cardRef.current =
              initial;

            setCard(
              initial
            );

            setCurrentCardId(
              null
            );

            return;
          }

          setCurrentCardId(
            savedCardId
          );

          const response =
            await fetch(
              `/api/digital-cards/${savedCardId}`,
              {
                method: "GET",

                credentials:
                  "include",

                cache: "no-store",
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            /*
             * Only remove local ID if
             * the server says the card
             * cannot be loaded.
             */
            localStorage.removeItem(
              "digitalCardId"
            );

            setCurrentCardId(
              null
            );

            const initial =
              normalizeCard(
                emptyCard
              );

            cardRef.current =
              initial;

            setCard(
              initial
            );

            return;
          }

          if (
            data?.success &&
            data?.card
          ) {
            const loadedCard =
              normalizeCard(
                data.card
              );

            cardRef.current =
              loadedCard;

            setCard(
              loadedCard
            );
          }
        } catch (error) {
          console.error(
            "LOAD CARD ERROR:",
            error
          );

          const initial =
            normalizeCard(
              emptyCard
            );

          cardRef.current =
            initial;

          setCard(
            initial
          );
        } finally {
          setLoading(false);
        }
      },
      [setCurrentCardId]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  /* =======================================================
     UPDATE CARD
  ======================================================= */

  const updateCard =
    useCallback(
      async <
        K extends keyof DigitalCardData
      >(
        key: K,
        value: DigitalCardData[K]
      ) => {
        const previousCard =
          cardRef.current;

        /*
         * Normalize the value.
         */
        let normalizedValue =
          value;

        if (
          key === "username"
        ) {
          normalizedValue =
            normalizeUsername(
              value
            ) as DigitalCardData[K];
        }

        if (
          key === "templateId"
        ) {
          normalizedValue =
            normalizeTemplate(
              value
            ) as DigitalCardData[K];
        }

        if (
          key === "products"
        ) {
          normalizedValue =
            normalizeProducts(
              value
            ) as DigitalCardData[K];
        }

        /*
         * Create next card.
         */
        const nextCard =
          normalizeCard({
            ...previousCard,

            [key]:
              normalizedValue,
          });

        /*
         * New request version.
         */
        const requestVersion =
          ++saveVersionRef.current;

        /*
         * IMPORTANT:
         *
         * Update local ref FIRST.
         *
         * This prevents fast template/product
         * changes from getting lost.
         */
        cardRef.current =
          nextCard;

        /*
         * Update UI immediately.
         */
        setCard(
          nextCard
        );

        try {
          setSaving(true);

          /* =================================================
             CREATE
          ================================================= */

          if (
            !cardIdRef.current
          ) {
            await createCard(
              nextCard
            );

            return;
          }

          /* =================================================
             UPDATE
          ================================================= */

          const response =
            await fetch(
              `/api/digital-cards/${cardIdRef.current}`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                credentials:
                  "include",

                body:
                  JSON.stringify({
                    [key]:
                      normalizedValue,
                  }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ??
                "Failed to save card."
            );
          }

          /*
           * Ignore stale responses.
           */
          if (
            requestVersion !==
            saveVersionRef.current
          ) {
            return;
          }

          /*
           * Server response.
           */
          if (
            data?.card
          ) {
            const serverCard =
              normalizeCard(
                data.card
              );

            const latestCard =
              cardRef.current;

            /*
             * Merge server data with
             * latest local data.
             *
             * This is important when the
             * user changes several fields
             * quickly.
             */
            const finalCard =
              normalizeCard({
                ...serverCard,

                ...latestCard,

                templateId:
                  latestCard.templateId,

                products:
                  latestCard.products,
              });

            cardRef.current =
              finalCard;

            setCard(
              finalCard
            );
          }
        } catch (error) {
          console.error(
            "UPDATE CARD ERROR:",
            error
          );

          /*
           * Revert only if this is still
           * the newest request.
           */
          if (
            requestVersion ===
            saveVersionRef.current
          ) {
            cardRef.current =
              previousCard;

            setCard(
              previousCard
            );
          }

          throw error;
        } finally {
          if (
            requestVersion ===
            saveVersionRef.current
          ) {
            setSaving(false);
          }
        }
      },
      [createCard]
    );

  /* =======================================================
     SET USERNAME
  ======================================================= */

  const setUsername =
    useCallback(
      async (
        username: string
      ) => {
        const normalized =
          normalizeUsername(
            username
          );

        await updateCard(
          "username",
          normalized
        );
      },
      [updateCard]
    );

  /* =======================================================
     SET TEMPLATE
  ======================================================= */

  const setTemplate =
    useCallback(
      async (
        templateId: TemplateId
      ) => {
        const normalized =
          normalizeTemplate(
            templateId
          );

        await updateCard(
          "templateId",
          normalized
        );
      },
      [updateCard]
    );

  /* =======================================================
     SAVE COMPLETE CARD
  ======================================================= */

  const saveCard =
    useCallback(
      async () => {
        const requestVersion =
          ++saveVersionRef.current;

        try {
          setSaving(true);

          const normalizedCard =
            normalizeCard(
              cardRef.current
            );

          cardRef.current =
            normalizedCard;

          /* ===============================================
             CREATE
          =============================================== */

          if (
            !cardIdRef.current
          ) {
            await createCard(
              normalizedCard
            );

            return;
          }

          /* ===============================================
             UPDATE COMPLETE CARD
          =============================================== */

          const response =
            await fetch(
              `/api/digital-cards/${cardIdRef.current}`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                credentials:
                  "include",

                body:
                  JSON.stringify(
                    normalizedCard
                  ),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ??
                "Failed to save digital card."
            );
          }

          /*
           * Ignore stale response.
           */
          if (
            requestVersion !==
            saveVersionRef.current
          ) {
            return;
          }

          if (
            data?.card
          ) {
            const serverCard =
              normalizeCard(
                data.card
              );

            const latestCard =
              cardRef.current;

            const finalCard =
              normalizeCard({
                ...serverCard,

                ...latestCard,

                /*
                 * Always preserve
                 * latest template.
                 */
                templateId:
                  latestCard.templateId,

                /*
                 * Always preserve
                 * latest products.
                 */
                products:
                  latestCard.products,
              });

            cardRef.current =
              finalCard;

            setCard(
              finalCard
            );
          }
        } catch (error) {
          console.error(
            "SAVE CARD ERROR:",
            error
          );

          throw error;
        } finally {
          if (
            requestVersion ===
            saveVersionRef.current
          ) {
            setSaving(false);
          }
        }
      },
      [createCard]
    );

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <DigitalCardContext.Provider
      value={{
        card,

        updateCard,

        setUsername,

        setTemplate,

        saveCard,

        loading,

        saving,

        cardId,
      }}
    >
      {children}
    </DigitalCardContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useDigitalCard() {
  const context =
    useContext(
      DigitalCardContext
    );

  if (!context) {
    throw new Error(
      "useDigitalCard must be used inside DigitalCardProvider"
    );
  }

  return context;
}