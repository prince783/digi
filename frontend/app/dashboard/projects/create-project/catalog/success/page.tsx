"use client";

import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Home,
  Loader2,
  PackageCheck,
  QrCode,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";


import {
  useEffect,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  buildCatalogPublicUrl,
  resolveConfiguredBaseUrl,
} from "@/lib/publicUrl";

type Product = {
  id: string;
  name: string;
  description: string;
  sellingPrice: number;
  mrp: number;
  image: string;
};

type Company = {
  companyName?: string;
  tagline?: string;
  logo?: string;
  profilePhoto?: string;
  aboutCompany?: string;
};

type Catalog = {
  _id?: string;
  username: string;
  company: Company;
  products: Product[];
  paymentStatus?: string;
  accountStatus?: string;
  isPublished?: boolean;
  paidAt?: string;
  expiresAt?: string;
  paymentId?: string;
};

function formatCurrency(
  value: number
) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string | Date) {
  if (!value) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CatalogPaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const username = searchParams.get("username") || "";
  const catalogId = searchParams.get("catalogId") || "";

  const [catalog, setCatalog] =
    useState<Catalog | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        setLoading(true);
        setError("");

        if (
          !username &&
          !catalogId
        ) {
          throw new Error(
            "Catalog information is missing."
          );
        }

        /*
         * We intentionally load through the
         * public endpoint after payment because
         * the catalog has already been published.
         */

        if (username) {
          const response =
            await fetch(
              `/api/catalogs/public/${encodeURIComponent(
                username
              )}`,
              {
                cache:
                  "no-store",
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success ||
            !data.catalog
          ) {
            throw new Error(
              data.message ||
                "Unable to load catalog."
            );
          }

          if (!cancelled) {
            setCatalog(
              data.catalog
            );
          }

          return;
        }

        /*
         * Fallback if only catalogId
         * exists.
         */

        const response =
          await fetch(
            `/api/catalogs/${encodeURIComponent(
              catalogId
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load catalog."
          );
        }

        if (!cancelled) {
          setCatalog(
            data.catalog
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load catalog."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [
    username,
    catalogId,
  ]);

  const publicUrl = catalog?.username
    ? buildCatalogPublicUrl(
        catalog.username,
        resolveConfiguredBaseUrl(
          typeof window !== "undefined" ? window.location.origin : "",
        ),
      )
    : "";

  const previewProducts =
    catalog?.products || [];

  function copyLink() {
    if (!publicUrl) return;

    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {
        alert(
          "Unable to copy the link."
        );
      });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
            <Loader2
              size={25}
              className="animate-spin text-primary"
            />
          </div>

          <p className="mt-4 text-sm font-bold text-ink">
            Preparing your catalog...
          </p>

          <p className="mt-1 text-xs text-muted">
            Please wait while we load your live catalog.
          </p>
        </div>
      </main>
    );
  }

  if (error || !catalog) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-black text-ink">
            Catalog could not be loaded
          </h1>

          <p className="mt-2 text-xs leading-5 text-muted">
            {error ||
              "Something went wrong while loading your catalog."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-xs font-bold text-white"
          >
            <Home size={15} />
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6]">

      {/* =====================================================
          SUCCESS HEADER
      ===================================================== */}

      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent">
                <Check
                  size={27}
                  strokeWidth={3}
                  className="text-success"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-success">
                  Payment Successful
                </p>

                <h1 className="mt-1 text-2xl font-black tracking-[-0.5px] text-ink sm:text-3xl">
                  🎉 Congratulations!
                </h1>

                <p className="mt-1 text-base font-semibold text-ink">
                  Your catalog is live!
                </p>

                <p className="mt-2 max-w-xl text-xs leading-5 text-muted">
                  Your payment has been verified and your catalog is now available on your public link.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard"
                  )
                }
                className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-xs font-bold text-ink hover:bg-page"
              >
                <Home size={15} />
                Dashboard
              </button>

              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white hover:bg-primary"
                >
                  <ExternalLink size={15} />
                  Open Catalog
                </a>
              )}

              {(catalog._id) && (
                <a
                  href={`/api/qr/catalog/${String(catalog._id)}`}
                  className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-xs font-bold text-ink shadow-sm hover:bg-page"
                >
                  <QrCode size={15} />
                  Download QR
                </a>
              )}
            </div>
          </div>

          {/* =================================================
              CONFIRMATION STATUS CARDS (3-COLUMN GRID)
          ================================================= */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* 1. PAYMENT CONFIRMATION */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-success">
                    <CheckCircle2 size={13} />
                    Payment Confirmed
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Razorpay
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-ink">
                  Yearly Subscription
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Payment has been verified and processed successfully.
                </p>
              </div>

              <div className="mt-5 border-t border-line pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Validity</span>
                  <span className="font-bold text-ink">
                    Until {formatDate(catalog.expiresAt)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted">Payment Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-success">
                    <Check size={13} />
                    Paid &amp; Active
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ACTIVE-PRODUCT CONFIRMATION */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-success">
                    <PackageCheck size={13} />
                    Active Product
                  </span>
                  <span className="rounded-full bg-page px-2 py-0.5 text-[10px] font-bold text-muted">
                    {previewProducts.length} items
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-ink">
                  {catalog.company?.companyName || "Catalogue Active"}
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted">
                  {previewProducts.length} product{previewProducts.length === 1 ? "" : "s"} published &amp; available for customer orders.
                </p>
              </div>

              <div className="mt-5 border-t border-line pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Catalogue Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Live on Web
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted">Visibility</span>
                  <span className="font-bold text-ink">Public</span>
                </div>
              </div>
            </div>

            {/* 3. LIVE-LINK CONFIRMATION */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-success">
                    <Globe size={13} />
                    Live Link
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                    LIVE
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-ink">
                  Public Catalogue URL
                </h3>

                <p className="mt-1 break-all text-xs font-semibold text-primary">
                  {publicUrl}
                </p>
              </div>

              <div className="mt-5 flex gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={copyLink}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    copied
                      ? "bg-success text-white"
                      : "border border-line bg-page text-ink hover:bg-line"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={13} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy Link
                    </>
                  )}
                </button>

                {publicUrl && (
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white transition hover:bg-ink"
                  >
                    <ExternalLink size={13} />
                    Open
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* =================================================
              QR CODE DOWNLOAD
          ================================================= */}

          {(catalog._id) && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#E5E0D9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF0F6]">
                  <QrCode size={22} className="text-[#1E3A5F]" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#121212]">
                    Branded QR Code
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#77736E]">
                    Share a scannable QR code that opens your catalogue directly. Downloadable 3&quot; &times; 4&quot; JPEG.
                  </p>
                </div>
              </div>

              <a
                href={`/api/qr/catalog/${String(catalog._id)}`}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#1E3A5F] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#152A47]"
              >
                <QrCode size={15} />
                Download QR Code
              </a>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          PREVIEW
      ===================================================== */}

      <section className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Live Preview
            </p>

            <h2 className="mt-1 text-xl font-black text-ink">
              Your Published Catalog
            </h2>
          </div>

          <span className="hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-success sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            LIVE
          </span>
        </div>

        {/* FULL PREVIEW */}

        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_20px_70px_rgba(21,42,71,0.08)]">

          {/* Preview top */}

          <div className="border-b border-line bg-white px-5 py-4 sm:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-page">
                {catalog.company
                  ?.logo ||
                catalog.company
                  ?.profilePhoto ? (
                  <img
                    src={
                      catalog.company
                        .logo ||
                      catalog.company
                        .profilePhoto
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBag
                    size={18}
                    className="text-muted"
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-ink">
                  {catalog.company
                    ?.companyName ||
                    "Product Catalog"}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  Live catalog preview
                </p>
              </div>
            </div>
          </div>

          {/* Preview hero */}

          <div className="bg-gradient-to-br from-accent via-white to-page px-5 py-10 sm:px-10">

            <div className="mx-auto max-w-3xl text-center">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
                <Check
                  size={12}
                />
                Premium Quality
              </span>

              <h3 className="mt-4 text-2xl font-black tracking-[-0.6px] text-ink sm:text-4xl">
                {catalog.company
                  ?.companyName ||
                  "Our Products"}
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-muted sm:text-sm">
                {catalog.company
                  ?.aboutCompany ||
                  catalog.company
                    ?.tagline ||
                  "Explore our products."}
              </p>
            </div>
          </div>

          {/* Products */}

          <div className="px-5 py-8 sm:px-8">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
                  Collection
                </p>

                <h3 className="mt-1 text-lg font-black text-ink">
                  Products
                </h3>
              </div>

              <span className="rounded-full bg-page px-3 py-1 text-xs font-bold text-muted">
                {
                  previewProducts.length
                }{" "}
                products
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {previewProducts.map(
                (product) => {
                  const price =
                    Number(
                      product.sellingPrice
                    ) || 0;

                  const mrp =
                    Number(
                      product.mrp
                    ) || 0;

                  return (
                    <div
                      key={
                        product.id
                      }
                      className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-page">

                        {product.image ? (
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag
                              size={
                                30
                              }
                              className="text-line"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="text-sm font-bold text-ink">
                          {
                            product.name
                          }
                        </h4>

                        {product.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                            {
                              product.description
                            }
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-sm font-black text-ink">
                            {formatCurrency(
                              price
                            )}
                          </span>

                          {mrp >
                            price && (
                            <span className="text-xs text-muted line-through">
                              {formatCurrency(
                                mrp
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Preview footer */}

          <div className="border-t border-line bg-page px-5 py-7 text-center sm:px-8">
            <p className="text-xs font-bold text-muted">
              Your catalog is published and ready to share.
            </p>

            <a
              href={
                publicUrl
              }
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-xs font-bold text-white"
            >
              <ExternalLink
                size={14}
              />
              View Full Catalog
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}