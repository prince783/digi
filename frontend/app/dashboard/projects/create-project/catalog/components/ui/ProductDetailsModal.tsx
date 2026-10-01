"use client";

import { Minus, Plus, ShoppingCart, X } from "lucide-react";

import { getDiscount, type CatalogProduct } from "@/lib/catalogDummyData";
import { CategoryIcon } from "@/lib/productCategoryIcons";

/*
 * ONE shared product-details modal, reused by every catalog
 * template (see each template's ProductCard: clicking a card opens
 * this instead of the card carrying its own Add to Cart button).
 *
 * Deliberately template-agnostic in styling — it does not try to
 * match any one template's color palette, so it stays consistent
 * regardless of which of the 16 templates is rendering it.
 */

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("en-IN");
}

interface ProductDetailsModalProps {
  /** null = closed. */
  product: CatalogProduct | null;
  onClose: () => void;
  /** Current quantity of this product already in the cart (0 if not added). */
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
}: ProductDetailsModalProps) {
  if (!product) return null;

  const mrp = Number(product.mrp || 0);
  const price = Number(product.price || 0);
  const hasMrp = mrp > price;
  const discount = getDiscount(product);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            CLOSE BUTTON
        ===================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white"
        >
          <X size={18} />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div className="relative aspect-square w-full bg-slate-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                No image
              </div>
            )}

            {discount > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="p-5 sm:p-6">
            {product.category && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {product.category}
              </p>
            )}

            {product.productCategory && (
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {product.productCategory.image ? (
                  <img
                    src={product.productCategory.image}
                    alt=""
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <CategoryIcon
                    icon={product.productCategory.icon}
                    size={13}
                  />
                )}
                {product.productCategory.name}
              </span>
            )}

            <h2
              id="product-details-modal-title"
              className="mt-1 break-words text-xl font-bold leading-snug text-slate-900"
            >
              {product.name}
            </h2>

            {product.description && (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                {product.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
              <span className="text-2xl font-bold text-slate-900">
                ₹{formatPrice(price)}
              </span>

              {hasMrp && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{formatPrice(mrp)}
                </span>
              )}

              {discount > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {discount}% off
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            ADD TO CART / QUANTITY STEPPER
            Sticky at the bottom so it stays reachable regardless
            of how long the description makes the content scroll.
        ===================================================== */}

        <div className="border-t border-slate-100 p-4 sm:p-5">
          {quantity > 0 ? (
            <div className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4">
              <button
                type="button"
                onClick={onDecrease}
                aria-label={`Decrease ${product.name} quantity`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                <Minus size={16} />
              </button>

              <span className="text-sm font-bold text-slate-900">
                {quantity} in cart
              </span>

              <button
                type="button"
                onClick={onIncrease}
                aria-label={`Increase ${product.name} quantity`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-slate-800"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
