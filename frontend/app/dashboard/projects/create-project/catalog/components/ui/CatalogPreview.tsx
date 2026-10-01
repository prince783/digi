"use client";

import { Check, Eye, ExternalLink, Globe, MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalogDummyData";
import type { CartItem, Company, HeroContent, Product, ProductCategory } from "../catalog-editor.types";
import { formatCurrency, productPrice, resolveHeroImage, resolveProductCategory } from "../editor/utils/catalog-editor.utils";
import CatalogRenderer from "./CatalogRenderer";
export default function CatalogPreview({
  company,
  products,
  productCategories,
  layoutTemplateId,
  cart,
  username,
  total,
  onAddToCart,
  isInCart,
  onRemoveFromCart,
  onQuantityChange,
  onOrder,
  showDemoProducts = false,
  category,
  hero,
  stickyHeaderHeight,
}: {
  company: Company;
  products: Product[];
  productCategories: ProductCategory[];
  layoutTemplateId: string;
  cart: CartItem[];
  username: string;
  total: number;
  onAddToCart: (product: Product) => void;
  isInCart: (id: string) => boolean;
  onRemoveFromCart: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onOrder: () => void;
  showDemoProducts?: boolean;
  category?: CatalogCategory;
  stickyHeaderHeight: number;
  hero?: HeroContent;
}) {

  /*
   * ---------------------------------------------------------
   * VALID / NORMALIZED TEMPLATE
   * ---------------------------------------------------------
   */
  const selectedTemplateId = layoutTemplateId || "simple";
  /*
   * ---------------------------------------------------------
   * PRODUCTS
   * ---------------------------------------------------------
   *
   * Demo products are shown only when explicitly requested.
   * Otherwise the user's actual products are shown.
   */
  const validProducts = products.filter(
    (product) => product.name?.trim() || product.image?.trim(),
  );

  const rendererProducts: CatalogProduct[] = validProducts.map((product) => ({
    _id: product.id,
    name: product.name || "Product",
    description:
      product.description || "Quality product selected for our collection.",
    image: product.image || "",
    mrp: Number(product.mrp) || 0,
    price: Number(product.sellingPrice) || 0,
    category,
    productCategory: resolveProductCategory(product, productCategories),
  }));

  /*
   * ---------------------------------------------------------
   * COMPANY DATA
   * ---------------------------------------------------------
   *
   * Keep this mapping identical to the public catalog.
   */
  const companyName = company.companyName || company.fullName || "Our Catalog";

  const companyLogo = company.logo || company.profilePhoto || "";

  const companyDescription = company.aboutCompany || company.tagline || "";

  /*
   * ---------------------------------------------------------
   * PUBLIC CATALOG DATA
   * ---------------------------------------------------------
   */
  const catalogData = {
    companyName,
    category,

    username,

    description: companyDescription,

    logo: companyLogo,

    tagline: company.tagline || "",

    whatsapp: company.whatsapp || company.mobile || company.phone || "",

    phone: company.phone || company.mobile || "",

    website: company.website || "",

    address: company.address || "",

    googleMapLink: company.googleMapLink || "",
    hero: hero ? { ...hero, image: resolveHeroImage(hero) } : hero,
  };

  return (
    // Same measured stickyHeaderHeight as the step header above
    // (see the other uses of this in this file) so this stays
    // aligned too.
    <div
      className="sticky z-10 will-change-transform"
      style={{ top: Math.max(0, stickyHeaderHeight - 4) }}
    >
      {/* =====================================================
          PREVIEW HEADER
      ===================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-muted" />

            <h2 className="text-sm font-bold text-ink">Live Preview</h2>
          </div>

          <p className="mt-1 text-xs text-muted">
            {selectedTemplateId} design preview
          </p>
        </div>

        <div className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-bold text-muted">
          Mobile
        </div>
      </div>

      {/* =====================================================
          PHONE FRAME
      ===================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[30px]
          border-[7px]
          border-ink
          bg-white
          shadow-2xl
        "
      >
        {/* ===================================================
            MOBILE SCREEN
        =================================================== */}

        <div
          className="
            hide-scrollbar
            h-[680px]
            w-full
            overflow-y-auto
            overscroll-contain
          "
        >
          {/* =================================================
              IMPORTANT
              =================================================

              The SAME CatalogRenderer is used by:

              1. Catalog Editor
              2. Full Preview
              3. Public /catalogs/[username]

              Therefore the visual design will stay identical.
          */}

          <CatalogRenderer
            key={selectedTemplateId}
            themeId={selectedTemplateId}
            catalog={catalogData}
            products={rendererProducts}
            useDummyProducts={showDemoProducts}
            isEditorPreview={true}
          />
        </div>
      </div>

      {/* =====================================================
          PREVIEW CART / ORDER CONTROLS
      =====================================================

      IMPORTANT:

      CatalogRenderer owns the actual visual template.

      Keep cart/order state in the editor.

      If your individual CatalogRenderer templates already
      support cart callbacks, pass those callbacks there.

      Otherwise do NOT recreate the complete catalog UI here,
      because that would create a second design system again.
      ===================================================== */}

      {/* =====================================================
          CART SUMMARY
      ===================================================== */}

      <div className="mx-auto mt-3 w-full max-w-[430px] rounded-xl border border-line bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink">Cart</p>

            <p className="mt-0.5 text-[9px] text-muted">
              {cart.length === 0
                ? "No products added"
                : `${cart.reduce((sum, item) => sum + item.quantity, 0)} ${
                    cart.reduce((sum, item) => sum + item.quantity, 0) === 1
                      ? "item"
                      : "items"
                  }`}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-ink">
              {formatCurrency(total)}
            </p>

            <button
              type="button"
              onClick={onOrder}
              disabled={cart.length === 0}
              className="
                mt-1
                inline-flex
                items-center
                gap-1
                rounded-lg
                bg-[#7A9B7E]
                px-3
                py-1.5
                text-[9px]
                font-bold
                text-white
                transition
                hover:bg-[#7A9B7E]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <MessageCircle size={10} strokeWidth={2} />
              WhatsApp Order
            </button>
          </div>
        </div>

        {/* CART ITEMS */}

        {cart.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-line pt-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                  rounded-lg
                  border
                  border-line
                  bg-page
                  px-2
                  py-1.5
                "
              >
                <div className="min-w-0">
                  <p className="truncate text-[8px] font-semibold text-ink">
                    {item.name}
                  </p>

                  <p className="text-[7px] text-muted">
                    Qty {item.quantity}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                    className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-muted
                    "
                  >
                    <Minus size={8} />
                  </button>

                  <span className="w-4 text-center text-[7px] font-semibold text-ink">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-muted
                    "
                  >
                    <Plus size={8} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.id)}
                    className="ml-1 text-red-400"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          PUBLIC URL
      ===================================================== */}

      <div className="mx-auto mt-4 w-full max-w-[430px] rounded-xl border border-line bg-white p-3">
        <div className="flex items-center gap-2">
          <Globe size={14} className="shrink-0 text-muted" />

          <p className="min-w-0 truncate text-xs font-semibold text-muted">
            {username
              ? `/catalogs/${username}`
              : "Choose username to create public link"}
          </p>
        </div>
      </div>
    </div>
  );
}

