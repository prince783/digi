"use client";

import { useCallback, useEffect, useState } from "react";

import { SubscriptionSkeleton } from "../components/Shimmer";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface DigitalCard {
  _id?: string;

  userId?: string | null;

  username?: string;

  fullName?: string;
  companyName?: string;
  designation?: string;

  paymentStatus?: string;
  paymentId?: string | null;
  paymentOrderId?: string | null;
  razorpayOrderId?: string | null;
  razorpaySignature?: string | null;
  paidAt?: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
  accountStatus?: string;
  isPublished?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

type ProjectFilter =
  | "all"
  | "Resume"
  | "Digital Visiting Card"
  | "Product Catalog";

interface SubscriptionData {
  id: string;
  projectType: string;

  status: "active" | "pending" | "expired";

  paymentStatus: string;

  paymentId: string | null;
  paymentOrderId: string | null;
  razorpayOrderId: string | null;
  razorpaySignature: string | null;

  paidAt: string | null;

  startDate: string | null;

  expiryDate: string | null;

  amount: number;

  duration: string;

  projectName: string;

  username: string;

  fullName: string;

  companyName: string;

  canRenew?: boolean;
  renewalUrl?: string;
  daysRemaining?: number;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getExpiryDate(
  paidAt: string | null | undefined,
) {
  if (!paidAt) {
    return null;
  }

  const date = new Date(paidAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setFullYear(date.getFullYear() + 1);

  return date.toISOString();
}

function getSubscriptionStatus(
  paymentStatus: string | undefined,
  expiryDate: string | null,
): "active" | "pending" | "expired" {
  const status = String(paymentStatus || "").toLowerCase();

  if (status !== "paid") {
    return "pending";
  }

  if (expiryDate) {
    const expiry = new Date(expiryDate);

    if (
      !Number.isNaN(expiry.getTime()) &&
      expiry.getTime() < Date.now()
    ) {
      return "expired";
    }
  }

  return "active";
}

function getRemainingDays(
  expiryDate: string | null,
) {
  if (!expiryDate) {
    return 0;
  }

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return 0;
  }

  const difference =
    expiry.getTime() - Date.now();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24),
    ),
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SubscriptionPage() {
  const router = useRouter();

  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);
  const [subscriptions, setSubscriptions] =
    useState<SubscriptionData[]>([]);
  const [filter, setFilter] =
    useState<"all" | "active" | "pending" | "expired">("all");
  const [projectFilter, setProjectFilter] =
    useState<ProjectFilter>("all");
  const [currentPlanFilter, setCurrentPlanFilter] =
    useState<ProjectFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD SUBSCRIPTION
  ======================================================= */

  const loadSubscription = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const sessionResponse = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        const sessionData = await sessionResponse.json();
        const userId = sessionData?.user?.id;

        if (!sessionResponse.ok || !userId) {
          throw new Error("Unable to identify your account.");
        }

        const allResponse = await fetch(
          `/api/subscription?userId=${encodeURIComponent(userId)}`,
          { cache: "no-store" },
        );
        const allData = await allResponse.json();

        if (!allResponse.ok || !allData?.success) {
          throw new Error(
            allData?.message || "Unable to load subscriptions.",
          );
        }

        const mapped: SubscriptionData[] = (allData.subscriptions || []).map(
          (item: Record<string, unknown>) => ({
            id: String(item.id),
            projectType: String(item.product || "Subscription"),
            status: item.status as SubscriptionData["status"],
            paymentStatus: String(item.paymentStatus || "pending"),
            paymentId: item.paymentId ? String(item.paymentId) : null,
            paymentOrderId: null,
            razorpayOrderId: item.razorpayOrderId
              ? String(item.razorpayOrderId)
              : null,
            razorpaySignature: null,
            paidAt: item.paidAt ? String(item.paidAt) : null,
            startDate: item.startDate ? String(item.startDate) : null,
            expiryDate: item.endDate ? String(item.endDate) : null,
            amount: Number(item.amount || 0),
            duration: String(item.plan || "1 Year"),
            projectName: item.companyName
              ? `${String(item.companyName)} ${String(item.product || "Subscription")}`
              : String(item.product || "Subscription"),
            username: String(item.username || ""),
            fullName: String(item.fullName || ""),
            companyName: String(item.companyName || ""),
            canRenew: Boolean(item.canRenew),
            renewalUrl: String(item.renewalUrl || ""),
            daysRemaining: Number(item.daysRemaining || 0),
          }),
        );

        setSubscriptions(mapped);
        setSubscription(mapped[0] || null);
        setLoading(false);
        return;

        /*
         * IMPORTANT:
         *
         * Do NOT depend on a separate client
         * session object.
         *
         * Your existing DigitalCardEditor already
         * stores the current card ID here.
         */

        const cardId =
          localStorage.getItem(
            "digitalCardId",
          ) ?? "";

        console.log(
          "SUBSCRIPTION CARD ID:",
          cardId,
        );

        if (!cardId) {
          setSubscription(null);

          setError(
            "No digital visiting card found. Please create your project first.",
          );

          return;
        }

        /* =================================================
           FETCH DIGITAL CARD
        ================================================= */

        const response = await fetch(
          `/api/digital-cards/${encodeURIComponent(
            cardId,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        /*
         * Prevent unexpected HTML / DOCTYPE
         * errors when an API route fails.
         */

        const contentType =
          response.headers.get(
            "content-type",
          ) || "";

        if (
          !contentType.includes(
            "application/json",
          )
        ) {
          const text =
            await response.text();

          console.error(
            "SUBSCRIPTION API RETURNED NON-JSON:",
            text.slice(0, 500),
          );

          throw new Error(
            "The subscription API returned an invalid response.",
          );
        }

        const data =
          await response.json();

        console.log(
          "SUBSCRIPTION CARD RESPONSE:",
          data,
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load digital card.",
          );
        }

        if (
          !data?.success ||
          !data?.card
        ) {
          throw new Error(
            data?.message ||
              "Digital card was not found.",
          );
        }

        const card =
          data.card as DigitalCard;

        /* =================================================
           PAYMENT INFORMATION
        ================================================= */

        const paymentStatus =
          String(
            card.paymentStatus ||
              "pending",
          ).toLowerCase();

        const paidAt =
          card.paidAt || null;

        const startDate = card.subscriptionStart || paidAt;
        const expiryDate = card.subscriptionEnd || getExpiryDate(paidAt);

        let amount = 0;
        const pricingResponse = await fetch("/api/admin/pricing", {
          cache: "no-store",
        });
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          const pricing = Array.isArray(pricingData?.pricing)
            ? pricingData.pricing.find(
                (item: { projectType?: string; yearlyPrice?: number }) =>
                  item.projectType === "digital-visiting-card",
              )
            : null;
          amount = Number(pricing?.yearlyPrice) || 0;
        }

        const status =
          getSubscriptionStatus(
            paymentStatus,
            expiryDate,
          );

        /* =================================================
           CREATE SUBSCRIPTION OBJECT
        ================================================= */

        const subscriptionData: SubscriptionData =
          {
            id:
              card.paymentId ||
              card._id ||
              cardId,

            projectType:
              "Digital Visiting Card",

            status,

            paymentStatus,

            paymentId:
              card.paymentId || null,

            paidAt,

            startDate,

            expiryDate,

            /*
             * Your digital visiting card
             * subscription is currently yearly.
             *
             * The actual price can later come
             * from your pricing collection.
             */
            amount,

            duration: "1 Year",

            projectName:
              card.fullName?.trim()
                ? `${card.fullName}'s Digital Card`
                : "Digital Visiting Card",

            username:
              card.username || "",

            fullName:
              card.fullName || "",

            companyName:
              card.companyName || "",
            paymentOrderId: card.paymentOrderId || null,
            razorpayOrderId: card.razorpayOrderId || null,
            razorpaySignature: card.razorpaySignature || null,
          };

        setSubscription(
          subscriptionData,
        );
      } catch (err) {
        console.error(
          "SUBSCRIPTION LOAD ERROR:",
          err,
        );

        setSubscription(null);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load subscription.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <SubscriptionSkeleton />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212]">
              Subscription
            </h1>

            <p className="mt-1 text-xs text-[#77736E]">
              Manage your digital visiting card
              subscription.
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#121212]">
              Unable to load subscription
            </h2>

            <p className="mx-auto mt-2 max-w-[500px] text-xs leading-6 text-[#77736E]">
              {error}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={loadSubscription}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] px-5 text-xs font-semibold text-white transition hover:bg-[#1E3A5F]"
              >
                <RefreshCw size={15} />
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/projects",
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-xs font-semibold text-ink transition hover:bg-page"
              >
                <FileText size={15} />
                My Projects
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     NO SUBSCRIPTION
  ======================================================= */

  if (!subscription) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212]">
              Subscription
            </h1>

            <p className="mt-1 text-xs text-[#77736E]">
              Manage your plans and subscriptions.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF0F6]">
              <Sparkles
                size={28}
                className="text-[#1E3A5F]"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#121212]">
              No subscription yet
            </h2>

            <p className="mx-auto mt-2 max-w-[480px] text-xs leading-6 text-[#77736E]">
              Create a digital visiting card from
              My Projects and complete the payment
              to activate your subscription.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/projects",
                )
              }
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#1E3A5F] px-5 text-xs font-semibold text-white transition hover:bg-[#1E3A5F]"
            >
              Go to My Projects
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  const remainingDays =
    getRemainingDays(
      subscription.expiryDate,
    );

  const isActive =
    subscription.status === "active";

  const isPending =
    subscription.status === "pending";

  const isExpired =
    subscription.status === "expired";
  const filteredSubscriptions = subscriptions.filter(
    (item) =>
      (filter === "all" || item.status === filter) &&
      (projectFilter === "all" || item.projectType === projectFilter),
  );

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard",
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-ink"
                aria-label="Back"
              >
                <ArrowLeft size={17} />
              </button>

              <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212]">
                Subscription
              </h1>
            </div>

            <p className="mt-1 pl-10 text-xs text-[#77736E]">
              Manage your digital visiting card
              subscription and billing details.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSubscription}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-line bg-white px-4 text-xs font-semibold text-muted transition hover:bg-page sm:self-auto"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <section className="mb-5 rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink">
                All Subscriptions
              </h2>
              <p className="mt-1 text-xs text-muted">
                Review plans, payment IDs, dates, and expiry details.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as "all" | "active" | "pending" | "expired",
                  )
                }
                className="h-9 sm:h-10 flex-1 sm:flex-initial rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={projectFilter}
                onChange={(event) =>
                  setProjectFilter(
                    event.target.value as
                      | "all"
                      | "Resume"
                      | "Digital Visiting Card"
                      | "Product Catalog",
                  )
                }
                className="h-9 sm:h-10 flex-1 sm:flex-initial rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink"
              >
                <option value="all">All projects</option>
                <option value="Resume">Resume</option>
                <option value="Digital Visiting Card">Digital Visiting Card</option>
                <option value="Product Catalog">Catalog</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {filteredSubscriptions.map((item) => {
              const isItemActive = item.status === "active";
              const isItemExpired = item.status === "expired" || Boolean(item.canRenew);
              const isItemPending = item.status === "pending";

              return (
                <div
                  key={item.id}
                  onClick={() => setSubscription(item)}
                  className={`w-full cursor-pointer rounded-xl border p-4 text-left transition ${
                    subscription.id === item.id
                      ? "border-[#1E3A5F] bg-accent shadow-sm"
                      : "border-line bg-white hover:bg-page"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-ink">
                          {item.projectName}
                        </p>
                        {item.username && (
                          <span className="text-xs font-medium text-muted">
                            @{item.username}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.projectType} · {item.duration}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isItemActive && (
                        <>
                          <span className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-bold text-success shadow-xs">
                            Active {item.daysRemaining ? `(${item.daysRemaining}d left)` : ""}
                          </span>
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-gray-100 px-3 py-1.5 text-xs font-medium text-muted cursor-not-allowed opacity-80"
                            title={`Renewal button unlocks once subscription reaches end date: ${formatDate(item.expiryDate)}`}
                          >
                            <Lock size={12} className="text-muted/70" />
                            Renewal on {formatDate(item.expiryDate)}
                          </button>
                        </>
                      )}

                      {isItemExpired && (
                        <>
                          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                            Expired
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(item.renewalUrl || "/dashboard/projects");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E3A5F] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#152A47]"
                          >
                            <RefreshCw size={12} />
                            Renew Now
                          </button>
                        </>
                      )}

                      {isItemPending && (
                        <>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                            Payment Pending
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(item.renewalUrl || "/dashboard/projects");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                          >
                            <CreditCard size={12} />
                            Complete Payment
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 border-t border-line/60 pt-3 text-xs text-muted sm:grid-cols-4">
                    <span>Paid: {formatDate(item.paidAt)}</span>
                    <span>Start: {formatDate(item.startDate)}</span>
                    <span>Expiry: {formatDate(item.expiryDate)}</span>
                    <span className="truncate" title={item.paymentId || undefined}>
                      Payment ID: {item.paymentId || "Not paid"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================
            STATUS BANNER
        ================================================= */}

        {isActive && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-line bg-accent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                <CheckCircle2
                  size={20}
                  className="text-success"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-success">
                  Subscription Active
                </p>

                <p className="mt-0.5 text-xs text-success">
                  Your digital visiting card is
                  active.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-medium text-success">
                {remainingDays} days remaining
              </p>

              <p className="mt-0.5 text-xs text-success">
                Expires{" "}
                {formatDate(
                  subscription.expiryDate,
                )}
              </p>
            </div>
          </div>
        )}

        {isPending && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
              <AlertCircle
                size={20}
                className="text-amber-500"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-amber-800">
                Payment Pending
              </p>

              <p className="mt-0.5 text-xs text-amber-700">
                Complete payment to activate your
                subscription.
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                <XCircle
                  size={20}
                  className="text-red-500"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-red-800">
                  Subscription Expired
                </p>

                <p className="mt-0.5 text-xs text-red-700">
                  Renew your subscription to keep your profile live.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  subscription.renewalUrl || "/dashboard/projects"
                )
              }
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-red-700 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-red-800"
            >
              <RefreshCw size={13} />
              Renew Now
            </button>
          </div>
        )}

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_0.9fr]">
          {/* =================================================
              CURRENT PLAN
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_10px_rgba(21,42,71,0.025)]">
            <div className="border-b border-[#E5E0D9] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#77736E]">
                    Current Plan
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#121212]">
                    {subscription.projectType}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={currentPlanFilter}
                    onChange={(event) => {
                      const nextFilter = event.target.value as ProjectFilter;
                        setCurrentPlanFilter(nextFilter);

                      if (nextFilter !== "all") {
                        const nextSubscription = subscriptions.find(
                          (item) => item.projectType === nextFilter,
                        );
                        if (nextSubscription) {
                          setSubscription(nextSubscription);
                        }
                      }
                    }}
                    className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink"
                    aria-label="Filter current plan by project type"
                  >
                    <option value="all">All plans</option>
                    <option value="Resume">Resume</option>
                    <option value="Digital Visiting Card">
                      Digital Visiting Card
                    </option>
                    <option value="Product Catalog">Catalog</option>
                  </select>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF0F6]">
                    <CreditCard
                      size={20}
                      className="text-[#1E3A5F]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* Plan summary */}

              <div className="rounded-xl bg-gradient-to-br from-[#EAF0F6] to-[#FAF9F6] p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#77736E]">
                      Subscription
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-[-0.5px] text-[#121212]">
                      1 Year
                    </p>

                    <p className="mt-1 text-xs text-[#77736E]">
                      {subscription.projectType}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-[#77736E]">
                      Plan Price
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#121212]">
                      ₹
                      {subscription.amount.toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}

              <div className="mt-6">
                <h3 className="text-xs font-semibold text-[#121212]">
                  Included with your plan
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    "Professional digital visiting card",
                    "Custom username & public URL",
                    "Contact and social links",
                    "QR code sharing",
                    "Profile and business information",
                    "Gallery and portfolio support",
                  ].map(
                    (feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2.5"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-success"
                        />

                        <span className="text-xs leading-5 text-[#77736E]">
                          {feature}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* =====================================================
                  RENEWAL ACTION
              ===================================================== */}

              <div className="mt-6 border-t border-[#E5E0D9] pt-5">
                {isActive && (
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-[#FAF9F6] px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#121212]">
                        Renewal
                      </p>
                      <p className="mt-0.5 text-xs text-[#77736E]">
                        Available after {formatDate(subscription.expiryDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled
                      title={`Renewal unlocks on ${formatDate(subscription.expiryDate)}`}
                      className="inline-flex shrink-0 cursor-not-allowed items-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-4 py-2 text-xs font-semibold text-[#77736E] opacity-70"
                    >
                      <Lock size={12} />
                      Renew Subscription
                    </button>
                  </div>
                )}

                {isExpired && (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-800">
                        Subscription Expired
                      </p>
                      <p className="mt-0.5 text-xs text-red-700">
                        Expired on {formatDate(subscription.expiryDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          subscription.renewalUrl || "/dashboard/projects"
                        )
                      }
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-800"
                    >
                      <RefreshCw size={12} />
                      Renew Now
                    </button>
                  </div>
                )}

                {isPending && (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-800">
                        Payment Pending
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700">
                        Complete payment to activate this plan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          subscription.renewalUrl || "/dashboard/projects"
                        )
                      }
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                    >
                      <CreditCard size={12} />
                      Complete Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              SUBSCRIPTION SUMMARY
          ================================================= */}

          <section className="rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_10px_rgba(21,42,71,0.025)]">
            <div className="border-b border-[#E5E0D9] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#121212]">
                Subscription Details
              </h2>
            </div>

            <div className="p-5">
              {/* Project */}

              <div className="flex items-center gap-3 rounded-xl bg-[#FAF9F6] p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0F6]">
                  <Sparkles
                    size={19}
                    className="text-[#1E3A5F]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#121212]">
                    {subscription.projectName}
                  </p>

                  {subscription.username ? (
                    <p className="mt-0.5 truncate text-xs text-[#77736E]">
                      @{subscription.username}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-[#77736E]">
                      Digital Visiting Card
                    </p>
                  )}
                </div>
              </div>

              {/* Details */}

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[#77736E]">
                    <CalendarDays size={15} />
                    <span className="text-xs">
                      Start Date
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#121212]">
                    {formatDate(
                      subscription.startDate,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[#77736E]">
                    <CalendarDays size={15} />
                    <span className="text-xs">
                      Expiry Date
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#121212]">
                    {formatDate(
                      subscription.expiryDate,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[#77736E]">
                    <CreditCard size={15} />
                    <span className="text-xs">
                      Payment Status
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                      isActive
                        ? "bg-accent text-success"
                        : isExpired
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {subscription.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[#77736E]">
                    <FileText size={15} />
                    <span className="text-xs">
                      Payment Date
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#121212]">
                    {formatDate(
                      subscription.paidAt,
                    )}
                  </span>
                </div>
              </div>

              {/* Payment ID */}

              <div className="mt-5 space-y-2 rounded-lg border border-[#E5E0D9] bg-[#E5E0D9] p-3">
                {[
                  ["Payment ID", subscription.paymentId],
                  ["Payment Order ID", subscription.paymentOrderId],
                  ["Razorpay Order ID", subscription.razorpayOrderId],
                  ["Razorpay Signature", subscription.razorpaySignature],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#77736E]">
                        {label}
                      </p>
                      <p className="mt-1 break-all text-xs font-medium text-[#121212]">
                        {value}
                      </p>
                    </div>
                  ))}
                {!subscription.paymentId &&
                  !subscription.paymentOrderId &&
                  !subscription.razorpayOrderId &&
                  !subscription.razorpaySignature && (
                    <p className="text-xs text-[#77736E]">
                      No payment transaction details available.
                    </p>
                  )}
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            ACCOUNT / SECURITY
        ================================================= */}

        <section className="mt-5 rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_10px_rgba(21,42,71,0.025)]">
          <div className="border-b border-[#E5E0D9] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#121212]">
              Subscription Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[#E5E0D9] p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <ShieldCheck
                  size={17}
                  className="text-[#1E3A5F]"
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-[#121212]">
                Secure Payment
              </p>

              <p className="mt-1 text-xs leading-5 text-[#77736E]">
                Your payment information is securely
                processed by the payment provider.
              </p>
            </div>

            <div className="rounded-xl border border-[#E5E0D9] p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <CalendarDays
                  size={17}
                  className="text-[#7A9B7E]"
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-[#121212]">
                Yearly Subscription
              </p>

              <p className="mt-1 text-xs leading-5 text-[#77736E]">
                Your digital visiting card subscription
                is valid for one year from the payment
                date.
              </p>
            </div>

            <div className="rounded-xl border border-[#E5E0D9] p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <FileText
                  size={17}
                  className="text-[#1E3A5F]"
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-[#121212]">
                Payment Record
              </p>

              <p className="mt-1 text-xs leading-5 text-[#77736E]">
                Your payment ID and payment date are
                stored with your digital card.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {isActive && (
            <>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/projects",
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] px-5 text-xs font-semibold text-white transition hover:bg-[#152A47]"
              >
                Manage My Project
                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                disabled
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-gray-100 px-5 text-xs font-semibold text-muted cursor-not-allowed opacity-80"
                title={`Renewal unlocks once subscription reaches end date: ${formatDate(subscription.expiryDate)}`}
              >
                <Lock size={14} className="text-muted/70" />
                Renewal Available on {formatDate(subscription.expiryDate)}
              </button>
            </>
          )}

          {isExpired && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  subscription.renewalUrl || "/dashboard/projects",
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#152A47]"
            >
              <RefreshCw size={14} />
              Renew Subscription
            </button>
          )}

          {isPending && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  subscription.renewalUrl || "/dashboard/projects",
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] px-5 text-xs font-semibold text-white transition hover:bg-[#152A47]"
            >
              <CreditCard size={14} />
              Complete Payment
            </button>
          )}
        </div>
      </div>
    </main>
  );
}