"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PaymentsHistorySkeleton,
  Skeleton,
  SkeletonText,
} from "../components/Shimmer";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";

type PaymentStatus = "paid" | "pending" | "failed";
type ProductFilter =
  | "all"
  | "Digital Visiting Card"
  | "Resume"
  | "Product Catalog";

interface PaymentRecord {
  id: string;
  product: string;
  plan?: string;
  paymentStatus: PaymentStatus | string;
  paymentId: string | null;
  razorpayOrderId: string | null;
  paidAt: string | null;
  createdAt: string | null;
  amount: number;
  username?: string;
  projectName?: string;
  isPublished?: boolean;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function productTypeSlug(product: string) {
  if (product === "Digital Visiting Card") return "card";
  if (product === "Product Catalog") return "catalog";
  if (product === "Resume") return "resume";
  return "card";
}

function statusLabel(status: string) {
  if (status === "paid") return "Paid";
  if (status === "failed") return "Failed";
  return "Pending";
}

function ProductIcon({ product }: { product: string }) {
  if (product === "Resume") return <FileText size={18} />;
  if (product === "Product Catalog") return <Wallet size={18} />;
  return <CreditCard size={18} />;
}

function StatusBadge({ status }: { status: string }) {
  const paid = status === "paid";
  const failed = status === "failed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        paid
          ? "bg-accent text-success"
          : failed
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      {paid ? <CheckCircle2 size={12} /> : failed ? <XCircle size={12} /> : <AlertCircle size={12} />}
      {statusLabel(status)}
    </span>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [productFilter, setProductFilter] = useState<ProductFilter>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "30" | "90" | "365">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime] = useState(() => Date.now());

  const loadPayments = useCallback(async () => {
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
        throw new Error("Please log in to view your payment history.");
      }

      const response = await fetch(
        `/api/subscription?userId=${encodeURIComponent(userId)}`,
        { credentials: "include", cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load payment history.");
      }

      setPayments(
        (data.subscriptions || []).map((item: Record<string, unknown>) => ({
          id: String(item.id),
          product: String(item.product || "Subscription"),
          plan: String(item.plan || "1 Year"),
          paymentStatus: String(item.paymentStatus || "pending"),
          paymentId: item.paymentId ? String(item.paymentId) : null,
          razorpayOrderId: item.razorpayOrderId
            ? String(item.razorpayOrderId)
            : null,
          paidAt: item.paidAt ? String(item.paidAt) : null,
          createdAt: item.createdAt ? String(item.createdAt) : null,
          amount: Number(item.amount || 0),
          username: item.username ? String(item.username) : "",
          projectName: item.companyName
            ? String(item.companyName)
            : String(item.product || "Subscription"),
          isPublished: Boolean(item.isPublished),
        })),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load payment history.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPayments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const paymentDate = payment.paidAt || payment.createdAt;
      const timestamp = paymentDate ? new Date(paymentDate).getTime() : 0;
      const days = dateFilter === "all" ? 0 : Number(dateFilter);
      const inDateRange =
        dateFilter === "all" ||
        (timestamp > 0 && timestamp >= currentTime - days * 86400000);
      const matchesSearch =
        !query ||
        [payment.product, payment.projectName, payment.paymentId, payment.razorpayOrderId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return (
        (productFilter === "all" || payment.product === productFilter) &&
        (statusFilter === "all" || payment.paymentStatus === statusFilter) &&
        inDateRange &&
        matchesSearch
      );
    });
  }, [currentTime, dateFilter, payments, productFilter, search, statusFilter]);

  const totals = useMemo(
    () => ({
      total: payments.length,
      paid: payments.filter((payment) => payment.paymentStatus === "paid").length,
      amount: payments
        .filter((payment) => payment.paymentStatus === "paid")
        .reduce((total, payment) => total + payment.amount, 0),
    }),
    [payments],
  );

  const printReceipt = (payment: PaymentRecord) => {
    const receipt = window.open("", "_blank", "width=720,height=720");
    if (!receipt) return;
    receipt.document.write(`
      <html><head><title>Payment receipt</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#121212}h1{font-size:22px}p{font-size:14px;margin:12px 0}.muted{color:#77736E}</style>
      </head><body><h1>Payment receipt</h1>
      <p><strong>Product:</strong> ${payment.product}</p>
      <p><strong>Amount:</strong> ${formatAmount(payment.amount)}</p>
      <p><strong>Status:</strong> ${statusLabel(payment.paymentStatus)}</p>
      <p><strong>Date:</strong> ${formatDateTime(payment.paidAt || payment.createdAt)}</p>
      <p><strong>Payment ID:</strong> ${payment.paymentId || "—"}</p>
      <p><strong>Order ID:</strong> ${payment.razorpayOrderId || "—"}</p>
      <p class="muted">This is a digitally generated receipt.</p>
      </body></html>`);
    receipt.document.close();
    receipt.focus();
    receipt.print();
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-3.5 py-4 text-[#121212] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1E3A5F]">
              Billing center
            </p>
            <h1 className="text-2xl font-bold">Payment History</h1>
            <p className="mt-1 text-xs text-[#77736E]">
              View every payment for your digital products in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadPayments()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-4 text-xs font-semibold text-[#121212] shadow-sm transition hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
            <span className="flex items-center gap-2"><AlertCircle size={16} />{error}</span>
            <button type="button" onClick={() => void loadPayments()} className="font-semibold underline">Try again</button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#E5E0D9] bg-white p-4 shadow-sm"
              >
                <SkeletonText w="w-28" className="h-2.5" />
                <Skeleton className="mt-3 h-6 w-16 rounded" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-xl border border-[#E5E0D9] bg-white p-4 shadow-sm">
                <p className="text-xs text-[#77736E]">Total transactions</p>
                <p className="mt-2 text-xl font-bold">{totals.total}</p>
              </div>
              <div className="rounded-xl border border-[#E5E0D9] bg-white p-4 shadow-sm">
                <p className="text-xs text-[#77736E]">Successful payments</p>
                <p className="mt-2 text-xl font-bold text-success">{totals.paid}</p>
              </div>
              <div className="rounded-xl border border-[#E5E0D9] bg-white p-4 shadow-sm">
                <p className="text-xs text-[#77736E]">Total paid</p>
                <p className="mt-2 text-xl font-bold text-[#1E3A5F]">{formatAmount(totals.amount)}</p>
              </div>
            </>
          )}
        </div>

        <section className="rounded-xl border border-[#E5E0D9] bg-white shadow-sm">
          <div className="border-b border-[#E5E0D9] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Filter size={16} className="text-[#1E3A5F]" />
              <h2 className="text-sm font-bold">Filter payments</h2>
              {(productFilter !== "all" || statusFilter !== "all" || dateFilter !== "all" || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setProductFilter("all");
                    setStatusFilter("all");
                    setDateFilter("all");
                    setSearch("");
                  }}
                  className="ml-auto text-xs font-semibold text-[#1E3A5F]"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
              <label className="relative block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product, payment or order ID"
                  className="h-10 w-full rounded-lg border border-[#E5E0D9] pl-9 pr-3 text-xs outline-none focus:border-[#1E3A5F]"
                />
              </label>
              <select value={productFilter} onChange={(event) => setProductFilter(event.target.value as ProductFilter)} className="h-10 rounded-lg border border-[#E5E0D9] px-3 text-xs outline-none focus:border-[#1E3A5F]">
                <option value="all">All products</option>
                <option value="Digital Visiting Card">Digital Visiting Card</option>
                <option value="Resume">Resume</option>
                <option value="Product Catalog">Product Catalog</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | PaymentStatus)} className="h-10 rounded-lg border border-[#E5E0D9] px-3 text-xs outline-none focus:border-[#1E3A5F]">
                  <option value="all">All status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as "all" | "30" | "90" | "365")} className="h-10 rounded-lg border border-[#E5E0D9] px-3 text-xs outline-none focus:border-[#1E3A5F]">
                  <option value="all">Any date</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 text-xs text-[#77736E]">
            <span>{filteredPayments.length} transaction{filteredPayments.length === 1 ? "" : "s"} found</span>
            <span className="hidden items-center gap-1 sm:flex"><CalendarDays size={13} />Newest first</span>
          </div>

          {loading ? (
            <PaymentsHistorySkeleton />
          ) : filteredPayments.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <Wallet size={28} className="mb-3 text-[#77736E]" />
              <p className="text-xs font-semibold">No payments found</p>
              <p className="mt-1 text-xs text-[#77736E]">Try changing the filters or complete a product purchase.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E0D9]">
              {filteredPayments.map((payment) => {
                const expanded = expandedId === payment.id;
                return (
                  <div key={`${payment.product}-${payment.id}`} className="px-4 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0F6] text-[#1E3A5F]"><ProductIcon product={payment.product} /></div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">{payment.product}</p>
                          <p className="mt-1 truncate text-xs text-[#77736E]">{payment.projectName || payment.plan} • {formatDate(payment.paidAt || payment.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="text-left sm:text-right"><p className="text-sm font-bold">{formatAmount(payment.amount)}</p><div className="mt-1"><StatusBadge status={payment.paymentStatus} /></div></div>
                        <button type="button" onClick={() => setExpandedId(expanded ? null : payment.id)} className="rounded-md p-2 text-[#77736E] hover:bg-[#FAF9F6] hover:text-[#1E3A5F]" aria-label={expanded ? "Hide payment details" : "Show payment details"}>{expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="mt-4 grid gap-3 rounded-lg bg-[#FFFFFF] p-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                        <div><p className="text-[#77736E]">Payment date</p><p className="mt-1 font-semibold">{formatDateTime(payment.paidAt || payment.createdAt)}</p></div>
                        <div><p className="text-[#77736E]">Payment ID</p><p className="mt-1 break-all font-semibold">{payment.paymentId || "Not available"}</p></div>
                        <div><p className="text-[#77736E]">Order ID</p><p className="mt-1 break-all font-semibold">{payment.razorpayOrderId || "Not available"}</p></div>
                        <div><p className="text-[#77736E]">Publication</p><p className="mt-1 font-semibold">{payment.isPublished ? "Published" : "Not published"}</p></div>
                        {payment.paymentStatus === "paid" && (
                          <div className="mt-1 flex flex-wrap items-center gap-4">
                            <a
                              href={`/api/invoices/${productTypeSlug(payment.product)}/${payment.id}/pdf`}
                              className="inline-flex w-fit items-center gap-1.5 font-semibold text-[#1E3A5F]"
                            >
                              <Download size={13} />Download Invoice
                            </a>
                            <button type="button" onClick={() => printReceipt(payment)} className="inline-flex w-fit items-center gap-1.5 font-semibold text-[#1E3A5F]"><Download size={13} />Print / save receipt</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
