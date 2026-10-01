"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface AdminInvoiceRow {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  productType: "card" | "catalog" | "resume";
  productName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentId: string;
  orderId: string;
  paidAt: string | null;
  billing?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<AdminInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/admin/invoices", {
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.message || "Unable to load invoices.");
        }
        setInvoices(body.invoices || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load invoices.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 sm:mb-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A5F]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1E3A5F]">
              Admin Panel
            </p>
          </div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Invoices</h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            All persisted customer invoice records. Both customer receipts and Admin Panel downloads originate strictly from these persisted documents.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">
            Loading invoices…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">
            No paid invoices yet.
          </div>
        ) : (
          <>
            {/* Mobile Invoices Card List */}
            <div className="space-y-3 md:hidden">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoiceId || `${invoice.productType}-${invoice.id}`}
                  className="rounded-xl border border-line bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">
                        {invoice.customerName || "Customer"}
                      </div>
                      {invoice.customerEmail && (
                        <div className="truncate text-xs text-muted">
                          {invoice.customerEmail}
                        </div>
                      )}
                    </div>
                    <div className="text-right font-bold text-black">
                      {formatAmount(invoice.amount)}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-[#FAF9F6] border border-line px-2.5 py-0.5 font-medium text-ink capitalize">
                      {invoice.productName || invoice.productType}
                    </span>
                    <span className="text-muted">
                      Paid: {formatDate(invoice.paidAt)}
                    </span>
                  </div>

                  <div className="mt-2.5 rounded-lg bg-[#FAF9F6] border border-line/60 p-2.5 text-xs">
                    <div className="flex flex-col gap-1 font-mono text-[11px] text-muted">
                      <div className="flex items-center justify-between">
                        <span>Payment ID:</span>
                        <span className="text-ink font-semibold">{invoice.paymentId || "—"}</span>
                      </div>
                      {invoice.orderId && (
                        <div className="flex items-center justify-between">
                          <span>Order ID:</span>
                          <span className="truncate max-w-[170px] text-ink">{invoice.orderId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-line/60">
                    <a
                      href={`/api/invoices/${invoice.productType}/${invoice.id}/pdf`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-[#1E3A5F] shadow-sm transition active:bg-accent"
                    >
                      <Download size={14} />
                      Download Invoice PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Invoices Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Paid On</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    return (
                      <tr
                        key={invoice.invoiceId || `${invoice.productType}-${invoice.id}`}
                        className="border-b border-line transition-colors hover:bg-black/[0.01] last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink">
                            {invoice.customerName || "—"}
                          </div>
                          {invoice.customerEmail && (
                            <div className="text-xs text-muted">
                              {invoice.customerEmail}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-black">
                          {formatAmount(invoice.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-muted">
                            {invoice.paymentId || "—"}
                          </div>
                          {invoice.orderId && (
                            <div className="text-[10px] text-muted/70 truncate max-w-[140px]" title={invoice.orderId}>
                              Ord: {invoice.orderId}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                          {formatDate(invoice.paidAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`/api/invoices/${invoice.productType}/${invoice.id}/pdf`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1E3A5F] shadow-sm transition hover:bg-accent hover:border-[#1E3A5F]/20"
                          >
                            <Download size={13} />
                            Download
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
