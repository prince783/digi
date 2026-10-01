"use client";

import { getDiscount, type CatalogProduct } from "@/lib/catalogDummyData";

export default function CatalogProductCard({
  product,
  onCardClick,
  dark = false,
}: {
  product: CatalogProduct;
  onCardClick: (product: CatalogProduct) => void;
  dark?: boolean;
}) {
  const discount = getDiscount(product.mrp, product.price);
  const hasMrp = Number(product.mrp || 0) > Number(product.price || 0);

  return (
    <article
      onClick={() => onCardClick(product)}
      className={`
        group
        flex
        h-full
        flex-col
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        transition-all
        duration-300
        ${
          dark
            ? "border-white/10 bg-white/[0.04] text-white hover:border-[#c7a76a]/40"
            : "border-black/10 bg-white text-slate-900 hover:border-[#c7a76a]/50"
        }
      `}
    >
      {/* =====================================================
          PRODUCT IMAGE
      ====================================================== */}

      <div className="relative aspect-square overflow-hidden bg-black/5">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <div
            className={`
              flex
              h-full
              items-center
              justify-center
              text-xs
              ${
                dark
                  ? "text-white/40"
                  : "text-slate-500"
              }
            `}
          >
            No image
          </div>
        )}

        {discount > 0 && (
          <span
            className={`
              absolute
              left-2
              top-2
              rounded-full
              px-2
              py-1
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.06em]
              ${
                dark
                  ? "bg-[#c7a76a] text-black"
                  : "bg-slate-900 text-white"
              }
            `}
          >
            {discount}% OFF
          </span>
        )}
      </div>

      {/* =====================================================
          PRODUCT DETAILS
      ====================================================== */}

      <div className="flex flex-1 flex-col p-4">
        {/* PRODUCT NAME */}

        <h3
          className={`
            truncate
            text-sm
            font-semibold
            tracking-wide

            @[640px]:text-base

            ${
              dark
                ? "text-white"
                : "text-slate-900"
            }
          `}
        >
          {product.name}
        </h3>

        {/* =================================================
            PRICE
        ================================================== */}

        <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-2">
          <span
            className={`
              font-serif
              text-base
              font-medium

              @[640px]:text-lg

              ${
                dark
                  ? "text-[#c7a76a]"
                  : "text-slate-900"
              }
            `}
          >
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </span>

          {hasMrp && (
            <span
              className={`
                text-xs
                line-through

                ${
                  dark
                    ? "text-white/40"
                    : "text-slate-400"
                }
              `}
            >
              ₹{Number(product.mrp || 0).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}