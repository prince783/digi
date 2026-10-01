"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildCatalogPublicUrl,
  resolveConfiguredBaseUrl,
} from "@/lib/publicUrl";
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  Package,
  Plus,
  QrCode,
  Share2,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

import { DashboardSkeleton } from "./components/Shimmer";

/* =========================================================
   TYPES
========================================================= */

type UserData = {
  _id?: string;
  id?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  companyName?: string;
};

type DigitalCard = {
  _id?: string;
  id?: string;
  userId?: string;

  fullName?: string;
  companyName?: string;
  designation?: string;
  username?: string;

  paymentStatus?: string;
  isPublished?: boolean;

  views?: number;
  viewCount?: number;
  totalViews?: number;

  qrScans?: number;
  qrScanCount?: number;
  scans?: number;

  shares?: number;
  shareCount?: number;

  paymentDate?: string;
  paidAt?: string;

  subscriptionEndDate?: string;
  subscriptionExpiresAt?: string;
  expiresAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

type CatalogCompany = {
  fullName?: string;
  companyName?: string;
  designation?: string;
  profilePhoto?: string;
  logo?: string;
  tagline?: string;
  aboutCompany?: string;
  mobile?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
};

type CatalogProduct = {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  sellingPrice?: string | number;
  mrp?: string | number;
  image?: string;
};

type Catalog = {
  _id?: string;
  id?: string;
  userId?: string;

  username?: string;

  company?: CatalogCompany;
  products?: CatalogProduct[];
  productsCount?: number;

  paymentStatus?: string;
  paymentId?: string | null;

  paymentDate?: string;
  paidAt?: string;

  subscriptionStartDate?: string;
  subscriptionStartedAt?: string;

  subscriptionEndDate?: string;
  subscriptionExpiresAt?: string;
  expiresAt?: string;

  isPublished?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

type Project = {
  id: string;
  rawId: string;
  name: string;
  url: string;
  type: "Digital Visiting Card" | "Catalog";
  status: string;
  statusClass: string;
  icon: typeof FileText;
  details?: string;
  createdAt?: string;
  qrProductType: "card" | "catalog" | null;
};

type Stat = {
  label: string;
  value: string;
  icon: typeof FileText;
  iconBg: string;
  iconColor: string;
};

/* =========================================================
   HELPERS
========================================================= */

function extractId(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return "";

    try {
      const parsed = JSON.parse(trimmed);

      if (parsed !== trimmed) {
        return extractId(parsed);
      }
    } catch {
      // Normal string ID
    }

    return trimmed;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    const possibleKeys = [
      "_id",
      "id",
      "userId",
      "userid",
      "userID",
    ];

    for (const key of possibleKeys) {
      const id = extractId(record[key]);

      if (id) {
        return id;
      }
    }
  }

  return "";
}

function getStoredUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const keys = [
    "userId",
    "user_id",
    "userid",
    "userID",
    "id",
    "user",
    "currentUser",
    "authUser",
  ];

  for (const key of keys) {
    try {
      const localValue = localStorage.getItem(key);

      if (localValue) {
        const id = extractId(localValue);

        if (id) {
          return id;
        }
      }
    } catch {
      // Ignore storage error
    }

    try {
      const sessionValue = sessionStorage.getItem(key);

      if (sessionValue) {
        const id = extractId(sessionValue);

        if (id) {
          return id;
        }
      }
    } catch {
      // Ignore storage error
    }
  }

  return "";
}

function getUserFromResponse(data: any): UserData | null {
  if (!data) {
    return null;
  }

  const possibleUsers = [
    data.user,
    data.data?.user,
    data.data,
    data.profile,
    data.userData,
  ];

  for (const value of possibleUsers) {
    if (
      value &&
      typeof value === "object"
    ) {
      return value as UserData;
    }
  }

  return null;
}

function getUserIdFromResponse(
  data: any,
  user: UserData | null
): string {
  const candidates = [
    user?._id,
    user?.id,
    user?.userId,

    data?._id,
    data?.id,
    data?.userId,

    data?.data?._id,
    data?.data?.id,
    data?.data?.userId,
  ];

  for (const candidate of candidates) {
    const id = extractId(candidate);

    if (id) {
      return id;
    }
  }

  return getStoredUserId();
}

function normalizeStatus(
  status?: string
): string {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function isPaid(status?: string): boolean {
  const normalized =
    normalizeStatus(status);

  return (
    normalized === "paid" ||
    normalized === "success" ||
    normalized === "successful" ||
    normalized === "completed"
  );
}

function getCatalogStatus(
  catalog: Catalog
): {
  label: string;
  className: string;
} {
  if (
    isPaid(catalog.paymentStatus) &&
    catalog.isPublished
  ) {
    return {
      label: "Active",
      className:
        "bg-[#EAF0F6] text-[#7A9B7E]",
    };
  }

  if (isPaid(catalog.paymentStatus)) {
    return {
      label: "Paid",
      className:
        "bg-[#EAF0F6] text-[#1E3A5F]",
    };
  }

  if (
    normalizeStatus(
      catalog.paymentStatus
    ) === "failed" ||
    normalizeStatus(
      catalog.paymentStatus
    ) === "cancelled"
  ) {
    return {
      label: "Payment Failed",
      className:
        "bg-[#fff0ef] text-[#e35d59]",
    };
  }

  return {
    label: "Draft",
    className:
      "bg-[#FAF9F6] text-[#77736E]",
  };
}

function getCardStatus(
  card: DigitalCard
): {
  label: string;
  className: string;
} {
  if (
    card.isPublished ||
    isPaid(card.paymentStatus)
  ) {
    return {
      label: "Active",
      className:
        "bg-[#EAF0F6] text-[#7A9B7E]",
    };
  }

  return {
    label: "Draft",
    className:
      "bg-[#FAF9F6] text-[#77736E]",
  };
}

function getProjectId(
  value: {
    _id?: string;
    id?: string;
  },
  fallback: string
) {
  return value._id || value.id || fallback;
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getCatalogUrl(
  username?: string
) {
  if (!username) {
    return "";
  }

  return buildCatalogPublicUrl(
    username,
    resolveConfiguredBaseUrl(
      typeof window !== "undefined" ? window.location.origin : "",
    ),
  );
}

function getCardUrl(
  username?: string
) {
  if (!username) {
    return "";
  }

  if (typeof window === "undefined") {
    return `/digitalvisitingcard/${username}`;
  }

  return `${window.location.origin}/digitalvisitingcard/${username}`;
}

function formatNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString(
    "en-IN"
  );
}

function getCardViews(
  card: DigitalCard
) {
  return (
    card.views ??
    card.viewCount ??
    card.totalViews ??
    0
  );
}

function getCardScans(
  card: DigitalCard
) {
  return (
    card.qrScans ??
    card.qrScanCount ??
    card.scans ??
    0
  );
}

function getCardShares(
  card: DigitalCard
) {
  return (
    card.shares ??
    card.shareCount ??
    0
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

const quickActions = [
  {
    title: "Create New Card",
    description:
      "Create a new digital card",
    icon: Plus,
    iconBg: "bg-[#EAF0F6]",
    iconColor: "text-[#1E3A5F]",
    href:
      "/dashboard/projects/create-project",
  },
  {
    title: "Create Catalog",
    description:
      "Create a product catalog",
    icon: ShoppingBag,
    iconBg: "bg-[#EAF0F6]",
    iconColor: "text-[#7A9B7E]",
    href:
      "/dashboard/projects/create-project/catalog",
  },
  {
    title: "View My Projects",
    description:
      "Manage your projects",
    icon: CreditCard,
    iconBg: "bg-[#EAF0F6]",
    iconColor: "text-[#1E3A5F]",
    href:
      "/dashboard/projects",
  },
  {
    title: "Upgrade Plan",
    description:
      "Unlock more features",
    icon: Sparkles,
    iconBg: "bg-[#fff5df]",
    iconColor: "text-[#e9a52f]",
    href:
      "/dashboard/subscription",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserData | null>(null);

  const [digitalCards, setDigitalCards] =
    useState<DigitalCard[]>([]);

  const [catalogs, setCatalogs] =
    useState<Catalog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [catalogLoading, setCatalogLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        /* ================================================
           USER
        ================================================= */

        const authResponse =
          await fetch("/api/auth/me", {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          });

        let authData: any = null;

        try {
          authData =
            await authResponse.json();
        } catch {
          authData = null;
        }

        if (!authResponse.ok) {
          throw new Error(
            authData?.message ||
              "Unable to load your account."
          );
        }

        const loadedUser =
          getUserFromResponse(
            authData
          );

        const userId =
          getUserIdFromResponse(
            authData,
            loadedUser
          );

        if (!userId) {
          throw new Error(
            "User ID was not found. Please login again."
          );
        }

        if (cancelled) {
          return;
        }

        setUser(loadedUser);

        /* ================================================
           DIGITAL CARDS + CATALOGS — independent of each
           other once userId is known, so they run in
           parallel instead of one waiting on the other.
        ================================================= */

        if (!cancelled) {
          setCatalogLoading(true);
        }

        const [cardsResult, catalogsResult] = await Promise.allSettled([
          fetch("/api/digital-cards/me", {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          }).then((res) => (res.ok ? res.json() : Promise.reject(res.status))),

          fetch(
            `/api/catalogs/me?userId=${encodeURIComponent(userId)}`,
            {
              method: "GET",
              cache: "no-store",
              credentials: "include",
            },
          ).then((res) => (res.ok ? res.json() : Promise.reject(res.status))),
        ]);

        if (!cancelled) {
          if (cardsResult.status === "fulfilled") {
            const loadedCards =
              cardsResult.value?.cards ??
              cardsResult.value?.digitalCards ??
              cardsResult.value?.data ??
              [];
            setDigitalCards(Array.isArray(loadedCards) ? loadedCards : []);
          } else {
            console.warn(
              "Unable to load digital cards:",
              cardsResult.reason,
            );
            setDigitalCards([]);
          }

          if (
            catalogsResult.status === "fulfilled" &&
            catalogsResult.value?.success !== false
          ) {
            const loadedCatalogs =
              catalogsResult.value?.catalogs ??
              catalogsResult.value?.data ??
              [];
            setCatalogs(Array.isArray(loadedCatalogs) ? loadedCatalogs : []);
          } else {
            console.warn(
              "Unable to load catalogs:",
              catalogsResult.status === "fulfilled"
                ? catalogsResult.value?.message
                : catalogsResult.reason,
            );
            setCatalogs([]);
          }

          setCatalogLoading(false);
        }
      } catch (dashboardError: any) {
        console.error(
          "Dashboard loading error:",
          dashboardError
        );

        if (!cancelled) {
          setError(
            dashboardError?.message ||
              "Unable to load dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     PROJECTS
     
     ONLY 3 RECENT PROJECTS
  ======================================================= */

  const projects = useMemo<Project[]>(
    () => {
      const cardProjects: Project[] =
        digitalCards.map(
          (card, index) => {
            const status =
              getCardStatus(card);

            const id =
              getProjectId(
                card,
                `card-${index}`
              );

            const name =
              card.companyName?.trim() ||
              card.fullName?.trim() ||
              "Digital Visiting Card";

            const url =
              card.username
                ? getCardUrl(
                    card.username
                  )
                : "No public username";

            const views =
              getCardViews(card);

            const scans =
              getCardScans(card);

            const shares =
              getCardShares(card);

            return {
              id: `card-${id}`,
              rawId: id,
              name,
              url,
              status: status.label,
              statusClass:
                status.className,
              icon: ImageIcon,
              type:
                "Digital Visiting Card",
              details:
                card.username
                  ? `${formatNumber(
                      views
                    )} views · ${formatNumber(
                      scans
                    )} scans · ${formatNumber(
                      shares
                    )} shares`
                  : "Public username not set",
              createdAt:
                card.createdAt,
              qrProductType: "card" as const,
            };
          }
        );

      const catalogProjects: Project[] =
        catalogs.map(
          (catalog, index) => {
            const status =
              getCatalogStatus(
                catalog
              );

            const id =
              getProjectId(
                catalog,
                `catalog-${index}`
              );

            const companyName =
              catalog.company
                ?.companyName?.trim() ||
              catalog.company
                ?.fullName?.trim() ||
              "Product Catalog";

            const productCount =
              typeof catalog.productsCount === "number"
                ? catalog.productsCount
                : 0;

            const url =
              catalog.username
                ? getCatalogUrl(
                    catalog.username
                  )
                : "No public username";

            return {
              id: `catalog-${id}`,
              rawId: id,
              name: companyName,
              url,
              status: status.label,
              statusClass:
                status.className,
              icon: ShoppingBag,
              type: "Catalog",
              details: `${productCount} ${
                productCount === 1
                  ? "product"
                  : "products"
              }${
                catalog.username
                  ? ` · /catalogs/${catalog.username}`
                  : ""
              }`,
              createdAt:
                catalog.createdAt ||
                catalog.updatedAt,
              qrProductType: "catalog" as const,
            };
          }
        );

      /*
       * Combine cards + catalogs,
       * sort newest first,
       * SHOW ONLY 3.
       */
      return [
        ...cardProjects,
        ...catalogProjects,
      ]
        .sort((a, b) => {
          const aTime = a.createdAt
            ? new Date(
                a.createdAt
              ).getTime()
            : 0;

          const bTime = b.createdAt
            ? new Date(
                b.createdAt
              ).getTime()
            : 0;

          return bTime - aTime;
        })
        .slice(0, 3);
    },
    [digitalCards, catalogs]
  );

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo<Stat[]>(
    () => {
      const totalProjects =
        digitalCards.length +
        catalogs.length;

      const activeCards =
        digitalCards.filter(
          (card) =>
            card.isPublished ||
            isPaid(
              card.paymentStatus
            )
        ).length;

      const activeCatalogs =
        catalogs.filter(
          (catalog) =>
            catalog.isPublished &&
            isPaid(
              catalog.paymentStatus
            )
        ).length;

      const totalViews =
        digitalCards.reduce(
          (sum, card) =>
            sum +
            Number(
              getCardViews(card) || 0
            ),
          0
        );

      const totalScans =
        digitalCards.reduce(
          (sum, card) =>
            sum +
            Number(
              getCardScans(card) || 0
            ),
          0
        );

      const totalShares =
        digitalCards.reduce(
          (sum, card) =>
            sum +
            Number(
              getCardShares(card) || 0
            ),
          0
        );

      return [
        {
          label: "Total Projects",
          value: String(
            totalProjects
          ).padStart(2, "0"),
          icon: FileText,
          iconBg: "bg-[#EAF0F6]",
          iconColor:
            "text-[#1E3A5F]",
        },
        {
          label: "Active Projects",
          value: String(
            activeCards +
              activeCatalogs
          ).padStart(2, "0"),
          icon: CreditCard,
          iconBg: "bg-[#EAF0F6]",
          iconColor:
            "text-[#7A9B7E]",
        },
        {
          label: "Total Views",
          value:
            formatNumber(
              totalViews
            ),
          icon: Activity,
          iconBg: "bg-[#fff0ef]",
          iconColor:
            "text-[#f26b67]",
        },
        {
          label: "QR Scans",
          value:
            formatNumber(
              totalScans
            ),
          icon: QrCode,
          iconBg: "bg-[#EAF0F6]",
          iconColor:
            "text-[#7A9B7E]",
        },
        {
          label: "Shares",
          value:
            formatNumber(
              totalShares
            ),
          icon: Share2,
          iconBg: "bg-[#EAF0F6]",
          iconColor:
            "text-[#1E3A5F]",
        },
      ];
    },
    [digitalCards, catalogs]
  );

  /* =======================================================
     DISPLAY NAME
  ======================================================= */

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.companyName ||
    "there";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <DashboardSkeleton />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E0D9] bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff0ef]">
            <UserRound
              size={22}
              className="text-[#e35d59]"
            />
          </div>

          <h1 className="mt-4 text-lg font-bold text-[#121212]">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#77736E]">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 h-10 rounded-lg bg-[#3D6A9C] px-5 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212]">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#77736E]">
              Welcome back,{" "}
              {displayName}! 👋
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/projects/create-project"
              )
            }
            className="flex h-[38px] w-full items-center justify-center gap-2 rounded-md bg-[#1E3A5F] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#152A47] sm:w-auto"
          >
            <Plus size={15} />
            Create New Project
          </button>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex min-h-[84px] sm:min-h-[92px] items-center gap-4 rounded-xl border border-[#E5E0D9] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(21,42,71,0.025)]"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    className={
                      stat.iconColor
                    }
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-[#77736E]">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-xl sm:text-2xl font-bold leading-none tracking-[-0.5px] text-[#121212]">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* =================================================
            RECENT PROJECTS + ANALYTICS
        ================================================= */}

        <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">

          {/* =================================================
              RECENT PROJECTS
          ================================================= */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

            <div className="flex items-center justify-between border-b border-[#E5E0D9] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <h2 className="text-base font-semibold text-[#121212]">
                  Recent Projects
                </h2>

                {catalogLoading && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#77736E]">
                    <Loader2
                      size={11}
                      className="animate-spin"
                    />
                    Loading catalogs...
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/projects"
                  )
                }
                className="text-xs font-semibold text-[#1E3A5F] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="px-4 sm:px-5">

              {projects.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF0F6]">
                    <FileText
                      size={21}
                      className="text-[#3D6A9C]"
                    />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-[#121212]">
                    No projects yet
                  </p>

                  <p className="mt-1 max-w-[260px] text-xs leading-5 text-[#77736E]">
                    Create a digital card
                    or product catalog
                    to see it here.
                  </p>
                </div>
              ) : (
                projects.map(
                  (project, index) => {
                    const Icon =
                      project.icon;

                    return (
                      <div
                        key={project.id}
                        className={`flex min-h-[80px] sm:min-h-[88px] items-center gap-3 py-2.5 ${
                          index !==
                          projects.length - 1
                            ? "border-b border-[#E5E0D9]"
                            : ""
                        }`}
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0F6]"
                        >
                          <Icon
                            size={19}
                            strokeWidth={1.8}
                            className={
                              project.type ===
                              "Catalog"
                                ? "text-[#7A9B7E]"
                                : "text-[#3D6A9C]"
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <p className="truncate text-xs font-semibold text-[#121212]">
                              {
                                project.name
                              }
                            </p>

                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold ${
                                project.type ===
                                "Catalog"
                                  ? "bg-[#EAF0F6] text-[#7A9B7E]"
                                  : "bg-[#EAF0F6] text-[#1E3A5F]"
                              }`}
                            >
                              {
                                project.type
                              }
                            </span>
                          </div>

                          <p className="mt-0.5 truncate text-xs text-[#77736E]">
                            {
                              project.url
                            }
                          </p>

                          {project.details && (
                            <p className="mt-0.5 truncate text-[11px] text-[#77736E]">
                              {
                                project.details
                              }
                            </p>
                          )}
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${project.statusClass}`}
                        >
                          {
                            project.status
                          }
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            aria-label={`Options for ${project.name}`}
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === project.id
                                  ? null
                                  : project.id
                              )
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#77736E] transition hover:bg-[#FAF9F6] hover:text-[#1E3A5F]"
                          >
                            <MoreVertical
                              size={18}
                              strokeWidth={1.8}
                            />
                          </button>

                          {openMenuId === project.id && (
                            <>
                              {/* Backdrop to close menu */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />

                              <div className="absolute right-0 top-9 z-20 min-w-[170px] rounded-xl border border-[#E5E0D9] bg-white py-1.5 shadow-[0_8px_24px_rgba(21,42,71,0.10)]">
                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    if (project.type === "Catalog") {
                                      router.push(
                                        `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(project.rawId)}`
                                      );
                                    } else {
                                      router.push("/dashboard/projects");
                                    }
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#121212] hover:bg-[#FAF9F6]"
                                >
                                  <FileText size={13} />
                                  Edit
                                </button>

                                {/* Copy Link */}
                                {project.url && project.url !== "No public username" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      // project.url is already an absolute
                                      // URL for catalogs (getCatalogUrl
                                      // returns the full canonical link) —
                                      // only prepend the origin for types
                                      // that still hand back a relative path.
                                      const fullUrl = /^https?:\/\//i.test(
                                        project.url,
                                      )
                                        ? project.url
                                        : typeof window !== "undefined"
                                          ? `${window.location.origin}${project.url.startsWith("/") ? project.url : `/${project.url}`}`
                                          : project.url;
                                      navigator.clipboard
                                        .writeText(fullUrl)
                                        .then(() => {
                                          setCopiedId(project.id);
                                          setTimeout(() => setCopiedId(null), 2000);
                                        })
                                        .catch(() => {});
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#121212] hover:bg-[#FAF9F6]"
                                  >
                                    <Globe size={13} />
                                    {copiedId === project.id ? "Copied!" : "Copy Link"}
                                  </button>
                                )}

                                {/* Download QR */}
                                {project.qrProductType && project.rawId && (
                                  <a
                                    href={`/api/qr/${project.qrProductType}/${project.rawId}`}
                                    onClick={() => setOpenMenuId(null)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#121212] hover:bg-[#FAF9F6]"
                                  >
                                    <QrCode size={13} />
                                    Download QR Code
                                  </a>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>

            <div className="px-5 pb-4 pt-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/projects"
                  )
                }
                className="flex h-10 w-full items-center justify-center rounded-lg border border-[#E5E0D9] text-xs font-semibold text-[#1E3A5F] transition hover:bg-[#FAF9F6]"
              >
                View All Projects
              </button>
            </div>
          </div>

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

            <div className="flex items-center justify-between border-b border-[#E5E0D9] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#121212]">
                  Analytics Overview
                </h2>

                <p className="mt-1 text-xs text-[#77736E]">
                  Digital card activity
                </p>
              </div>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-3 py-2 text-xs font-medium text-[#77736E] hover:bg-[#FFFFFF]"
              >
                This Month

                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="px-4 pb-3 pt-4 sm:px-5">
              <div className="relative h-[245px]">

                <div className="absolute inset-x-0 bottom-8 top-3 flex flex-col justify-between">
                  {[800, 600, 400, 200, 0].map(
                    (value) => (
                      <div
                        key={value}
                        className="flex items-center gap-3"
                      >
                        <span className="w-7 text-right text-xs text-[#77736E]">
                          {value}
                        </span>

                        <div className="h-px flex-1 bg-[#FAF9F6]" />
                      </div>
                    )
                  )}
                </div>

                <svg
                  className="absolute left-[40px] right-0 top-3 h-[205px] w-[calc(100%-40px)] overflow-visible"
                  viewBox="0 0 600 205"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0 184
                    C35 155 45 100 82 94
                    C116 88 120 133 158 137
                    C195 141 207 78 239 61
                    C271 44 284 106 319 105
                    C354 104 365 51 397 32
                    C430 13 447 87 481 87
                    C516 87 531 60 548 72
                    C565 84 578 32 600 18"
                    stroke="#1E3A5F"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute bottom-0 left-[40px] right-0 flex justify-between">
                  {[
                    "01 May",
                    "08 May",
                    "15 May",
                    "22 May",
                    "29 May",
                  ].map(
                    (date) => (
                      <span
                        key={date}
                        className="text-[10px] sm:text-xs text-[#77736E]"
                      >
                        {date}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CATALOG OVERVIEW
        ================================================= */}

        <section className="mb-5 rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

          <div className="flex flex-col gap-3 border-b border-[#E5E0D9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#121212]">
                Catalog Overview
              </h2>

              <p className="mt-1 text-xs text-[#77736E]">
                Your product catalogs
                and publishing status
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/projects/create-project/catalog"
                )
              }
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#3D6A9C] px-4 text-xs font-semibold text-white transition hover:bg-[#1E3A5F]"
            >
              <Plus size={14} />
              Add Catalog
            </button>
          </div>

          {catalogs.length === 0 ? (
            <div className="flex min-h-[150px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0F6]">
                <ShoppingBag
                  size={20}
                  className="text-[#7A9B7E]"
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-[#121212]">
                No catalog found
              </p>

              <p className="mt-1 text-xs text-[#77736E]">
                Create your first product
                catalog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalogs
                .slice(0, 6)
                .map(
                  (
                    catalog,
                    index
                  ) => {
                    const status =
                      getCatalogStatus(
                        catalog
                      );

                    const productCount =
                      typeof catalog.productsCount === "number"
                        ? catalog.productsCount
                        : 0;

                    const catalogId =
                      catalog._id ||
                      catalog.id ||
                      `catalog-${index}`;

                    const companyName =
                      catalog.company
                        ?.companyName ||
                      catalog.company
                        ?.fullName ||
                      "Product Catalog";

                    const publicUrl =
                      catalog.username
                        ? getCatalogUrl(
                            catalog.username
                          )
                        : "";

                    return (
                      <div
                        key={catalogId}
                        className="rounded-xl border border-[#E5E0D9] bg-white p-4 transition hover:border-[#E5E0D9] hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF0F6]">
                            {catalog
                              .company
                              ?.logo ||
                            catalog
                              .company
                              ?.profilePhoto ? (
                              <img
                                src={
                                  catalog
                                    .company
                                    .logo ||
                                  catalog
                                    .company
                                    .profilePhoto
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2
                                size={19}
                                className="text-[#7A9B7E]"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-[#121212]">
                              {
                                companyName
                              }
                            </p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-[#FAF9F6] px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <Package
                                size={13}
                                className="text-[#3D6A9C]"
                              />

                              <span className="text-xs text-[#77736E]">
                                Products
                              </span>
                            </div>

                            <p className="mt-1 text-sm font-bold text-[#121212]">
                              {
                                productCount
                              }
                            </p>
                          </div>

                          <div className="rounded-lg bg-[#FAF9F6] px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <Globe
                                size={13}
                                className="text-[#7A9B7E]"
                              />

                              <span className="text-xs text-[#77736E]">
                                Username
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs font-semibold text-[#121212]">
                              {catalog.username ||
                                "Not set"}
                            </p>
                          </div>
                        </div>

                        {catalog.createdAt && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#77736E]">
                            <CalendarDays
                              size={12}
                            />
                            Created{" "}
                            {formatDate(
                              catalog.createdAt
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/dashboard/projects/create-project/catalog?edit=${encodeURIComponent(
                                  String(
                                    catalogId
                                  )
                                )}`
                              )
                            }
                            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E0D9] text-xs font-semibold text-[#1E3A5F] transition hover:bg-[#FAF9F6]"
                          >
                            <FileText
                              size={13}
                            />
                            Edit
                          </button>

                          {/* Open only when the catalog is actually
                              paid + published - the public /catalogs/x
                              route gates on exactly that and 404s
                              otherwise, so a username alone isn't
                              enough to justify showing this button. */}
                          {publicUrl &&
                          isPaid(catalog.paymentStatus) &&
                          catalog.isPublished ? (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  publicUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#3D6A9C] text-xs font-semibold text-white transition hover:bg-[#1E3A5F]"
                            >
                              <ExternalLink
                                size={13}
                              />
                              Open
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="Complete payment to publish this catalog"
                              className="flex h-9 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-[#E5E0D9] text-xs font-semibold text-[#77736E] opacity-60"
                            >
                              <ExternalLink
                                size={13}
                              />
                              Not Published
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          )}
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">

          <div className="border-b border-[#E5E0D9] px-5 py-4">
            <h2 className="text-base font-semibold text-[#121212]">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map(
              (action) => {
                const Icon =
                  action.icon;

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() =>
                      router.push(
                        action.href
                      )
                    }
                    className="group flex min-h-[78px] items-center gap-3 rounded-xl border border-[#E5E0D9] bg-white px-4 text-left transition hover:-translate-y-0.5 hover:border-[#E5E0D9] hover:shadow-sm"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        className={
                          action.iconColor
                        }
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#121212]">
                        {
                          action.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        {
                          action.description
                        }
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      strokeWidth={1.8}
                      className="ml-auto hidden text-[#77736E] transition group-hover:translate-x-1 group-hover:text-[#3D6A9C] sm:block"
                    />
                  </button>
                );
              }
            )}
          </div>
        </section>
      </div>
    </main>
  );
}