"use client";

import { CalendarDays, Check, CheckCircle2, Clock3, Copy, CreditCard, ExternalLink, Link2, Loader2, ShieldCheck } from "lucide-react";
import type { Company } from "../catalog-editor.types";
import SmallSummary from "./SmallSummary";
export default function PaymentStep({
  isPaid,
  paymentStatus,
  paymentDate,
  subscriptionStartDate,
  subscriptionEndDate,
  username,
  company,
  productsCount,
  publicUrl,
  isPaying,
  catalogPrice,
  catalogPriceLoading,
  onCopyLink,
  onOpenCatalog,
}: {
  isPaid: boolean;
  paymentStatus: string;
  paymentDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  username: string;
  company: Company;
  productsCount: number;
  publicUrl: string;
  isPaying: boolean;

  /*
   * Real yearly price coming from Admin Pricing
   */
  catalogPrice: number | null;
  catalogPriceLoading: boolean;

  onCopyLink: () => void;
  onOpenCatalog: () => void;
}) {
  const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-ink">
              {isPaid ? "Catalog Published" : "Complete Your Catalog"}
            </h3>

            <p className="mt-1 text-xs leading-5 text-muted">
              {isPaid
                ? "Your catalog is active and ready to share with customers."
                : "Your company details, products and public username are ready. Complete payment to publish your catalog."}
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
              isPaid
                ? "bg-accent text-success"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isPaid ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}

            {isPaid ? "Active" : "Payment Pending"}
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* PAID */}
      {/* ================================================== */}

      {isPaid ? (
        <>
          {/* Active Message */}
          <div className="rounded-2xl border border-line bg-accent p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-success shadow-sm">
                <CheckCircle2 size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-success">
                  Catalog Active
                </p>

                <p className="mt-1 text-xs leading-5 text-success">
                  Payment completed successfully. You can now edit the catalog
                  and save changes without paying again.
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SmallSummary
              label="Company"
              value={company.companyName || "Your Company"}
            />

            <SmallSummary
              label="Products"
              value={`${productsCount} Product${
                productsCount === 1 ? "" : "s"
              }`}
            />

            <SmallSummary
              label="Payment"
              value={`Paid · ${formatDate(paymentDate)}`}
            />

            <SmallSummary label="Plan" value="Catalog · Yearly" />
          </div>

          {/* Subscription */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-muted" />

                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Valid Until
                </p>
              </div>

              <p className="mt-2 text-sm font-black text-ink">
                {formatDate(subscriptionEndDate)}
              </p>

              {subscriptionStartDate && (
                <p className="mt-1 text-xs text-muted">
                  Started {formatDate(subscriptionStartDate)}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center gap-2">
                <Link2 size={15} className="text-muted" />

                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Public Catalog
                </p>
              </div>

              <p className="mt-2 truncate text-sm font-black text-ink">
                {username ? `/catalogs/${username}` : "Username not selected"}
              </p>
            </div>
          </div>

          {/* Public URL */}
          <div className="mt-4 rounded-2xl border border-line bg-page p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Public Catalog Link
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
                {publicUrl || "Choose a username first"}
              </p>

              <button
                type="button"
                onClick={onCopyLink}
                disabled={!publicUrl}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-ink shadow-sm disabled:opacity-40"
              >
                <Copy size={13} />
                Copy
              </button>
            </div>
          </div>

          {/* Open Catalog */}
          <button
            type="button"
            onClick={onOpenCatalog}
            disabled={!publicUrl}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ExternalLink size={17} />
            Open Public Catalog
          </button>

          {/* Editing Message */}
          <div className="mt-3 rounded-xl border border-line bg-accent px-4 py-3 text-xs leading-5 text-primary">
            <span className="font-bold">Catalog is active:</span> your catalog is published and live. Any updates to your company details, products, images, or prices are saved directly without any additional payment.
          </div>
        </>
      ) : (
        <>
          {/* ================================================== */}
          {/* PAYMENT PLAN */}
          {/* ================================================== */}

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Catalog Plan
                </p>

                <h4 className="mt-1 text-base font-black text-ink">
                  Catalog Subscription
                </h4>

                <p className="mt-1 text-xs text-muted">
                  Yearly catalog publishing plan
                </p>
              </div>

              {/* -------------------------------------------- */}
              {/* REAL ADMIN PRICE */}
              {/* -------------------------------------------- */}

              <div className="text-right">
                {catalogPriceLoading ? (
                  <>
                    <div className="flex items-center justify-end gap-1.5">
                      <Loader2
                        size={15}
                        className="animate-spin text-muted"
                      />

                      <p className="text-sm font-bold text-muted">
                        Loading...
                      </p>
                    </div>
                  </>
                ) : catalogPrice !== null &&
                  Number.isFinite(Number(catalogPrice)) &&
                  Number(catalogPrice) > 0 ? (
                  <>
                    <p className="text-2xl font-black text-ink">
                      {formatCurrency(catalogPrice)}
                    </p>

                    <p className="text-xs font-semibold text-muted">
                      / year
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black text-muted">—</p>

                    <p className="text-xs font-semibold text-red-400">
                      Price unavailable
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-5 space-y-2.5">
              {[
                "Company details included",

                `${productsCount} product${
                  productsCount === 1 ? "" : "s"
                } added`,

                username
                  ? `Public URL: /catalogs/${username}`
                  : "Public username selected",

                "Mobile-friendly public catalog",
                "Change your catalog template anytime",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-muted"
                >
                  <Check size={14} className="shrink-0 text-success" />

                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ================================================== */}
          {/* SECURITY */}
          {/* ================================================== */}

          <div className="mt-4 rounded-2xl border border-line bg-page p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-muted"
              />

              <div>
                <p className="text-xs font-bold text-ink">
                  Secure payment & publishing
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Your catalog is saved first. After successful payment
                  verification, its payment status is marked paid and the public
                  catalog becomes active.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-muted">
            Use the Pay &amp; Publish button beside Save Draft in the header.
          </p>
        </>
      )}
    </div>
  );
}

