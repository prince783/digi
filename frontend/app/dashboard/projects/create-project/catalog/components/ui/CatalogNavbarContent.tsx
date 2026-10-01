"use client";

import { ArrowLeft, Edit3, Eye, Package, ShoppingCart } from "lucide-react";
import type { Company, Product } from "../catalog-editor.types";

type Props = { router: { back: () => void }; company: Company; savingDraft: boolean; saveSuccess: boolean; lastSaved: string; products: Product[]; cartCount: number; openPreview: () => void; setShowCart: (show: boolean) => void };

export default function CatalogNavbarContent({ router, company, savingDraft, saveSuccess, lastSaved, products, cartCount, openPreview, setShowCart }: Props) {
  return <div className="flex min-w-0 flex-1 items-center gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-muted transition hover:bg-page"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-xs font-bold text-ink sm:text-sm">
            Product Catalog
          </h1>

          <Edit3 size={14} className="hidden text-muted sm:block" />
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span className="hidden sm:inline">
            {company.companyName || "Create your digital catalog"}
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />

          <span className="flex items-center gap-1 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {savingDraft
              ? "Saving..."
              : saveSuccess
                ? "Catalog saved successfully."
                : lastSaved
                  ? `Draft saved ${lastSaved}`
                  : "Draft Saved"}
          </span>
        </div>
      </div>

      <div className="ml-auto hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-page px-2.5 py-1.5">
          <Package size={14} className="text-muted" />
          <span className="text-xs font-semibold text-ink">
            {products.filter((p) => p.name.trim()).length} Products
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={openPreview}
          className="hidden h-9 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-xs font-semibold text-ink transition hover:bg-page sm:flex"
        >
          <Eye size={14} />
          Preview
        </button>

        <button
          type="button"
          onClick={() => setShowCart(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition hover:opacity-90 sm:hidden"
        >
          <ShoppingCart size={17} />

          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-success px-1 text-[9px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>;
}
