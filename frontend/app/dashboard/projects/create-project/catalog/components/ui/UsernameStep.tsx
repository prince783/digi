"use client";

import { Check, ExternalLink, X } from "lucide-react";
import type { Company, UsernameStatus } from "../catalog-editor.types";
import { buildCatalogPublicUrl, resolveConfiguredBaseUrl } from "@/lib/publicUrl";

export default function UsernameStep({
  username,
  status,
  message,
  onChange,
  company,
  onSuggest,
}: {
  username: string;
  status: UsernameStatus;
  message: string;
  onChange: (value: string) => void;
  company: Company;
  onSuggest?: () => void;
}) {
  const publicUrl = buildCatalogPublicUrl(
    username,
    resolveConfiguredBaseUrl(
      typeof window !== "undefined" ? window.location.origin : "",
    ),
  );

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-sm font-bold text-ink">
          Choose Your Catalog Username
        </h3>

        <p className="mt-1 text-xs leading-5 text-muted">
          This username will be used for your public catalog URL.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-page p-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-ink">
            Catalog Username
          </label>
          {(company.companyName || company.fullName) && onSuggest && (
            <button
              type="button"
              onClick={onSuggest}
              className="text-xs font-semibold text-[#1E3A5F] hover:underline"
            >
              ✨ Suggest from Business Name
            </button>
          )}
        </div>

        <div
          className={`mt-2 flex overflow-hidden rounded-xl border bg-white focus-within:ring-2 ${
            status === "taken" || status === "invalid"
              ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100"
              : "border-line focus-within:border-muted focus-within:ring-line"
          }`}
        >
          <div className="flex items-center border-r border-line bg-page px-3 text-xs text-muted">
            /catalogs/
          </div>

          <input
            id="field-username"
            type="text"
            value={username}
            onChange={(event) => onChange(event.target.value)}
            placeholder="yourcompany"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-semibold text-ink outline-none placeholder:text-line"
          />

          <div className="flex items-center px-3">
            {status === "checking" && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-slate-700" />
            )}

            {status === "available" && (
              <Check size={18} className="text-success" />
            )}

            {status === "taken" && <X size={18} className="text-red-500" />}
          </div>
        </div>

        <div className="mt-3 min-h-5">
          {status === "checking" && (
            <p className="text-xs font-medium text-muted">
              Checking username availability...
            </p>
          )}

          {status === "available" && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-success">
              <Check size={13} />
              {message}
            </p>
          )}

          {status === "taken" && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-500">
              <X size={13} />
              {message}
            </p>
          )}

          {status === "invalid" && (
            <p className="text-xs font-medium text-red-500">{message}</p>
          )}

          {status === "idle" && (
            <p className="text-xs text-muted">
              Use 3–30 characters. Letters, numbers, underscore and hyphen are
              allowed.
            </p>
          )}
        </div>
      </div>

      {publicUrl && status === "available" && (
        <div className="mt-5 rounded-2xl border border-line bg-accent p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-success">
            Your Catalog Link
          </p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs font-bold text-success">
              {publicUrl}
            </p>

            <ExternalLink size={15} className="shrink-0 text-success" />
          </div>
        </div>
      )}
    </div>
  );
}
