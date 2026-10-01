"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Building2,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { getDiscount } from "@/lib/catalogDummyData";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

interface CartItem {
  product: CatalogTemplateProps["products"][number];
  quantity: number;
}

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("en-IN");
}

function cleanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/* =========================================================
   SIMPLE TEMPLATE
========================================================= */

export default function SimpleTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const productsSectionRef = useRef<HTMLElement | null>(null);

  const companyName = catalog?.companyName || "Your Company";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Quality products, simple shopping";
  const hero = catalog?.hero;

  /*
    IMPORTANT:
    publicText = true only on the public catalog.
    Editor preview keeps the original typography.
  */
  const publicText = !isEditorPreview;

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)
    );
  }, [products, query]);

  /* =======================================================
     PAGINATION (public page only, 8 per page)
  ======================================================= */

  const PRODUCTS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const pagedProducts = isEditorPreview
    ? filteredProducts
    : filteredProducts.slice(
        (page - 1) * PRODUCTS_PER_PAGE,
        page * PRODUCTS_PER_PAGE
      );

  useEffect(() => {
    setPage(1);
  }, [query]);

  /* =======================================================
     CART TOTALS
  ======================================================= */

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.product.price || 0) * item.quantity,
    0
  );

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function addToCart(
    product: CatalogTemplateProps["products"][number]
  ) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product._id === product._id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.product._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }

  /* =======================================================
     INCREASE
  ======================================================= */

  function increaseQuantity(productId: string) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product._id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  /* =======================================================
     DECREASE
  ======================================================= */

  function decreaseQuantity(productId: string) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product._id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  /* =======================================================
     REMOVE
  ======================================================= */

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product._id !== productId
      )
    );
  }

  /* =======================================================
     SCROLL TO PRODUCTS
  ======================================================= */

  function scrollToProducts() {
    productsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  /* =======================================================
     WHATSAPP ORDER
  ======================================================= */

  function sendToWhatsApp() {
    if (!cart.length || ordering) {
      return;
    }

    const whatsappNumber =
      catalog?.whatsapp || catalog?.phone;

    if (!whatsappNumber) {
      alert(
        "WhatsApp number is not available for this catalog."
      );
      return;
    }

    setOrdering(true);

    const catalogUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "";

    const orderLines = cart.map((item, index) => {
      const price = Number(item.product.price || 0);
      const total = price * item.quantity;

      return `${index + 1}. ${item.product.name}
Qty: ${item.quantity}
Price: ₹${formatPrice(price)}
Total: ₹${formatPrice(total)}`;
    });

    const message = [
      `🛒 *New Order Request*`,
      ``,
      `*Catalog:* ${companyName}`,
      ``,
      `*Products:*`,
      ...orderLines,
      ``,
      `*Grand Total: ₹${formatPrice(cartTotal)}*`,
      ``,
      catalogUrl ? `Catalog: ${catalogUrl}` : "",
      ``,
      `Please confirm the availability and order details.`,
    ]
      .filter(Boolean)
      .join("\n");

    const phone = cleanPhone(whatsappNumber);

    const whatsappUrl =
      `https://wa.me/${phone}?text=` +
      encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank");
    }

    setOrdering(false);
  }

  /* =======================================================
     WHATSAPP ENQUIRY — SINGLE PRODUCT
     (Separate from the cart-wide order above: this sends a
     message about just the one product tapped on its card.)
  ======================================================= */

  function orderProductOnWhatsApp(
    product: CatalogTemplateProps["products"][number]
  ) {
    const whatsappNumber = catalog?.whatsapp || catalog?.phone;

    if (!whatsappNumber) {
      alert("WhatsApp number is not available for this catalog.");
      return;
    }

    const catalogUrl =
      typeof window !== "undefined" ? window.location.href : "";

    const message = [
      `🛍️ *Product Enquiry*`,
      ``,
      `*Catalog:* ${companyName}`,
      ``,
      `*Product:* ${product.name}`,
      `*Price:* ₹${formatPrice(product.price)}`,
      ``,
      catalogUrl ? `Catalog: ${catalogUrl}` : "",
      ``,
      `Please confirm availability and order details.`,
    ]
      .filter(Boolean)
      .join("\n");

    const phone = cleanPhone(whatsappNumber);

    const whatsappUrl =
      `https://wa.me/${phone}?text=` + encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank");
    }
  }

  return (
    <div className="@container/simplecatalog w-full">
      <div className="min-h-full bg-[#f7f5f1] text-[#1c1b19]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 @[1024px]:mx-auto @[1024px]:max-w-7xl @[1024px]:px-8 @[1024px]:py-4">

            <div className="flex min-w-0 items-center gap-2 @[1024px]:gap-3">

              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#123f2e] text-white @[1024px]:size-12 @[1024px]:rounded-xl">
                {logo ? (
                  <img
                    src={logo}
                    alt={companyName}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <>
                    <Building2
                      size={14}
                      className="@[1024px]:hidden"
                    />

                    <Building2
                      size={18}
                      className="hidden @[1024px]:block"
                    />
                  </>
                )}
              </div>

              <div className="min-w-0">
                <h1
                  className={
                    publicText
                      ? "truncate text-[17px] font-bold tracking-[-0.01em] @[1024px]:text-lg"
                      : "truncate text-sm font-bold @[1024px]:text-lg"
                  }
                >
                  {companyName}
                </h1>

                <p
                  className={
                    publicText
                      ? "text-[10px] leading-4 text-slate-500 @[1024px]:text-[10px]"
                      : "text-[8px] text-slate-500 @[1024px]:text-[10px]"
                  }
                >
                  {tagline}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#123f2e] transition hover:bg-[#dfeae3] @[1024px]:size-11"
              aria-label="Open cart"
            >
              <ShoppingCart
                size={19}
                className="@[1024px]:hidden"
              />

              <ShoppingCart
                size={20}
                className="hidden @[1024px]:block"
              />

              {cartCount > 0 && (
                <span
                  className={
                    publicText
                      ? "absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#123f2e] text-[9px] font-bold text-white @[1024px]:size-5"
                      : "absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#123f2e] text-[7px] font-bold text-white @[1024px]:size-5 @[1024px]:text-[9px]"
                  }
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="bg-[#e5eee8] px-4 py-7 @[1024px]:bg-transparent @[1024px]:px-0 @[1024px]:py-8">
          <div className="relative w-full overflow-hidden @[1024px]:mx-auto @[1024px]:max-w-7xl @[1024px]:rounded-[30px] @[1024px]:bg-[#e5eee8]">

            {/* Hero image (optional) — dark gradient overlay keeps
                the text below readable regardless of the uploaded
                image's own brightness. Absent entirely when no hero
                image is set, leaving the original solid-color look
                unchanged. */}
            {hero?.image && (
              <>
                <img
                  src={hero.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
              </>
            )}

            <div
              className={`relative @[1024px]:px-12 @[1024px]:py-14 ${
                hero?.image ? "px-4 py-7" : ""
              }`}
            >

              {hero?.eyebrow && (
                <p
                  className={`${
                    publicText
                      ? "text-[11px] tracking-[0.2em] @[1024px]:text-[11px] @[1024px]:tracking-[0.3em]"
                      : "text-[9px] tracking-[0.2em] @[1024px]:text-[11px] @[1024px]:tracking-[0.3em]"
                  } font-bold uppercase ${
                    hero?.image ? "text-white/90" : "text-[#47755a]"
                  }`}
                >
                  {hero.eyebrow}
                </p>
              )}

              {hero?.title && (
                <h2
                  className={`${
                    publicText
                      ? "mt-2 text-[28px] leading-[1.1] tracking-[-0.025em] @[1024px]:mt-3 @[1024px]:text-5xl @[1024px]:leading-[1.05]"
                      : "mt-2 text-2xl leading-tight @[1024px]:mt-3 @[1024px]:text-5xl @[1024px]:leading-[1.05]"
                  } break-words font-black ${
                    hero?.image ? "text-white" : ""
                  }`}
                >
                  {hero.title}
                </h2>
              )}

              {hero?.description && (
                <p
                  className={`${
                    publicText
                      ? "mt-3 max-w-[330px] text-[13px] leading-[1.65] @[1024px]:mt-5 @[1024px]:max-w-2xl @[1024px]:text-base @[1024px]:leading-7"
                      : "mt-2 max-w-[290px] text-[10px] leading-4 @[1024px]:mt-5 @[1024px]:max-w-2xl @[1024px]:text-base @[1024px]:leading-7"
                  } ${hero?.image ? "text-white/85" : "text-[#58705f]"}`}
                >
                  {hero.description}
                </p>
              )}

              <div className="mt-5 flex items-center gap-2 @[1024px]:mt-7 @[1024px]:gap-3">

                <span
                  className={
                    publicText
                      ? "rounded-full bg-white px-3.5 py-2 text-[10px] font-semibold text-[#123f2e] @[1024px]:px-5 @[1024px]:py-2.5 @[1024px]:text-xs"
                      : "rounded-full bg-white px-3 py-1.5 text-[8px] font-semibold text-[#123f2e] @[1024px]:px-5 @[1024px]:py-2.5 @[1024px]:text-xs"
                  }
                >
                  {products.length}{" "}
                  {products.length === 1 ? "Product" : "Products"}
                </span>

                <button
                  type="button"
                  onClick={scrollToProducts}
                  className={
                    publicText
                      ? "flex h-11 items-center justify-center rounded-full bg-[#123f2e] px-3.5 text-[10px] font-semibold text-white transition hover:bg-[#0d3023] @[1024px]:h-auto @[1024px]:px-5 @[1024px]:py-2.5 @[1024px]:text-xs"
                      : "rounded-full bg-[#123f2e] px-3 py-1.5 text-[8px] font-semibold text-white transition hover:bg-[#0d3023] @[1024px]:px-5 @[1024px]:py-2.5 @[1024px]:text-xs"
                  }
                >
                  Shop Now
                </button>

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <section className="px-3 pt-4 @[1024px]:px-0 @[1024px]:pt-0">
          <div className="w-full @[1024px]:mx-auto @[1024px]:max-w-7xl">

            <div
              className={
                publicText
                  ? "flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm @[1024px]:h-auto @[1024px]:rounded-2xl @[1024px]:px-5 @[1024px]:py-4"
                  : "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 @[1024px]:rounded-2xl @[1024px]:px-5 @[1024px]:py-4"
              }
            >
              <Search
                size={17}
                className="shrink-0 text-slate-400 @[1024px]:hidden"
              />

              <Search
                size={19}
                className="hidden shrink-0 text-slate-400 @[1024px]:block"
              />

              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className={
                  publicText
                    ? "w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400 @[1024px]:text-sm"
                    : "w-full bg-transparent text-[9px] outline-none placeholder:text-slate-400 @[1024px]:text-sm"
                }
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section
          ref={productsSectionRef}
          className="px-3 pb-32 pt-5 @[1024px]:px-0 @[1024px]:pb-36 @[1024px]:pt-10"
        >

          <div className="w-full @[1024px]:mx-auto @[1024px]:max-w-7xl">

            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-4 @[1024px]:mb-8 @[1024px]:pb-5">

              <div>
                <p
                  className={
                    publicText
                      ? "text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 @[1024px]:text-[10px] @[1024px]:tracking-[0.28em]"
                      : "text-[7px] font-medium uppercase tracking-[0.18em] text-slate-400 @[1024px]:text-[10px] @[1024px]:tracking-[0.28em]"
                  }
                >
                  Collection
                </p>

                <h2
                  className={
                    publicText
                      ? "mt-1 whitespace-nowrap text-[18px] font-bold tracking-[-0.015em] @[1024px]:text-3xl @[1024px]:font-semibold"
                      : "mt-1 whitespace-nowrap text-sm font-bold @[1024px]:text-3xl @[1024px]:font-semibold"
                  }
                >
                  All Products
                </h2>
              </div>

              <span
                className={
                  publicText
                    ? "text-[11px] font-medium text-slate-500 @[1024px]:text-sm"
                    : "text-[9px] text-slate-500 @[1024px]:text-sm"
                }
              >
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "item" : "items"}
              </span>
            </div>

            {filteredProducts.length === 0 ? (

              <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center @[1024px]:rounded-2xl @[1024px]:px-10 @[1024px]:py-20">

                <ShoppingCart
                  size={25}
                  className="mx-auto mb-3 text-slate-300 @[1024px]:h-10 @[1024px]:w-10"
                />

                <p
                  className={
                    publicText
                      ? "text-base font-bold @[1024px]:text-lg"
                      : "text-sm font-semibold @[1024px]:text-lg"
                  }
                >
                  No products found
                </p>

                <p
                  className={
                    publicText
                      ? "mt-1 text-[11px] leading-5 text-slate-400 @[1024px]:text-sm"
                      : "mt-1 text-[9px] text-slate-400 @[1024px]:text-sm"
                  }
                >
                  Try searching with another product name.
                </p>
              </div>

            ) : (

              <div className="grid grid-cols-2 gap-3 @[1024px]:grid-cols-4 @[1024px]:gap-5">

                {pagedProducts.map((product) => {

                  const discount = getDiscount(
                    product.mrp,
                    product.price
                  );

                  const cartItem = cart.find(
                    (item) => item.product._id === product._id
                  );

                  return (
                    <article
                      key={product._id}
                      onClick={() => setSelectedProduct(product)}
                      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] @[1024px]:rounded-[20px] @[1024px]:shadow-[0_8px_30px_rgba(0,0,0,0.06)] @[1024px]:transition-transform @[1024px]:duration-300 @[1024px]:hover:-translate-y-1 @[1024px]:hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]"
                    >

                      {/* Image */}

                      <div className="relative aspect-square overflow-hidden bg-slate-100 @[1024px]:aspect-[1.08/1]">

                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />

                        {discount > 0 && (
                          <span
                            className={
                              publicText
                                ? "absolute left-2 top-2 rounded-md bg-[#123f2e] px-2 py-1.5 text-[9px] font-bold text-white shadow-sm @[1024px]:left-4 @[1024px]:top-4 @[1024px]:rounded-full @[1024px]:px-3 @[1024px]:py-1.5 @[1024px]:text-[10px]"
                                : "absolute left-2 top-2 rounded bg-[#123f2e] px-1.5 py-1 text-[7px] font-bold text-white @[1024px]:left-4 @[1024px]:top-4 @[1024px]:rounded-full @[1024px]:px-3 @[1024px]:py-1.5 @[1024px]:text-[10px]"
                            }
                          >
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Details */}

                      <div
                        className={
                          publicText
                            ? "flex flex-1 flex-col p-3 @[1024px]:p-4"
                            : "flex flex-1 flex-col p-2.5 @[1024px]:p-4"
                        }
                      >

                        {/* Product title */}

                        <h3
                          className={
                            publicText
                              ? "line-clamp-1 text-[20px] font-bold leading-[1.35] tracking-[-0.01em] text-slate-900 @[1024px]:text-base"
                              : "line-clamp-1 text-[10px] font-bold @[1024px]:text-sm"
                          }
                        >
                          {product.name}
                        </h3>

                        {/* Price + Add to Cart icon */}

                        <div
                          className={
                            publicText
                              ? "mt-auto flex items-center justify-between gap-2 pt-3 @[1024px]:pt-4"
                              : "mt-auto flex items-center justify-between gap-2 pt-2 @[1024px]:pt-4"
                          }
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span
                              className={
                                publicText
                                  ? "text-[16px] font-black tracking-[-0.02em] @[1024px]:text-lg"
                                  : "text-xs font-black @[1024px]:text-lg"
                              }
                            >
                              ₹{formatPrice(product.price)}
                            </span>

                            {product.mrp > product.price && (
                              <span
                                className={
                                  publicText
                                    ? "text-[10px] text-slate-400 line-through @[1024px]:text-sm"
                                    : "text-[8px] text-slate-400 line-through @[1024px]:text-sm"
                                }
                              >
                                ₹{formatPrice(product.mrp)}
                              </span>
                            )}
                          </div>

                          {cartItem ? (
                            <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#123f2e] px-1 py-1 text-white @[1024px]:gap-1.5 @[1024px]:px-1.5">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  decreaseQuantity(product._id);
                                }}
                                aria-label={`Decrease ${product.name} quantity`}
                                className="flex size-6 items-center justify-center rounded-full bg-white/15 @[1024px]:size-7"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-4 text-center text-[10px] font-bold @[1024px]:text-xs">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  increaseQuantity(product._id);
                                }}
                                aria-label={`Increase ${product.name} quantity`}
                                className="flex size-6 items-center justify-center rounded-full bg-white/15 @[1024px]:size-7"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                addToCart(product);
                              }}
                              aria-label={`Add ${product.name} to cart`}
                              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#123f2e] text-white transition hover:bg-[#0d2f22] @[1024px]:size-9"
                            >
                              <ShoppingCart size={15} />
                            </button>
                          )}
                        </div>

                        {/* Order this product on WhatsApp */}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            orderProductOnWhatsApp(product);
                          }}
                          className={
                            publicText
                              ? "mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#29a85c] text-xs font-bold text-white transition hover:bg-[#23934f] @[1024px]:h-10 @[1024px]:text-sm"
                              : "mt-1.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[#29a85c] text-[10px] font-bold text-white transition hover:bg-[#23934f] @[1024px]:h-10 @[1024px]:text-sm"
                          }
                        >
                          <MessageCircle size={14} />
                          Order on WhatsApp
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!isEditorPreview && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                className="text-[#123f2e]"
              />
            )}
          </div>
        </section>

        {/* =====================================================
            BOTTOM CART BAR
        ===================================================== */}

        {cartCount > 0 && (
          <div
            className={`${
              isEditorPreview
                ? "fixed bottom-4 left-1/2 z-40 -translate-x-1/2"
                : "sticky bottom-0 mx-auto"
            } w-[calc(100%-1.5rem)] max-w-[1280px] px-3 py-4 @[1024px]:px-0`}
          >

            <div className="mx-auto w-full @[1024px]:max-w-7xl">

              <div className="flex items-center gap-2 rounded-[20px] border border-slate-200 bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur @[1024px]:rounded-[22px] @[1024px]:p-3 @[1024px]:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">

                <button
                  type="button"
                  onClick={() => setShowCart(true)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left @[1024px]:px-4 @[1024px]:py-3"
                >

                  <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e5eee8] text-[#123f2e] @[1024px]:size-12">

                    <ShoppingBag
                      size={18}
                      className="@[1024px]:hidden"
                    />

                    <ShoppingBag
                      size={20}
                      className="hidden @[1024px]:block"
                    />

                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#123f2e] text-[8px] font-bold text-white @[1024px]:size-5 @[1024px]:text-[9px]">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>

                  </div>

                  <div className="min-w-0">

                    <p
                      className={
                        publicText
                          ? "text-[12px] font-bold text-slate-900 @[1024px]:text-sm"
                          : "text-[9px] font-bold @[1024px]:text-sm"
                      }
                    >
                      Your Cart
                    </p>

                    <p
                      className={
                        publicText
                          ? "truncate text-[10px] font-medium text-slate-500 @[1024px]:text-xs"
                          : "truncate text-[7px] text-slate-400 @[1024px]:text-xs"
                      }
                    >
                      {cartCount}{" "}
                      {cartCount === 1 ? "item" : "items"}{" "}
                      • ₹{formatPrice(cartTotal)}
                    </p>

                  </div>
                </button>

                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={ordering}
                  className={
                    publicText
                      ? "shrink-0 rounded-xl bg-[#29a85c] px-4 py-3 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#23934f] disabled:opacity-60 @[1024px]:px-7 @[1024px]:py-4 @[1024px]:text-sm"
                      : "shrink-0 rounded-xl bg-[#29a85c] px-4 py-3 text-[8px] font-bold text-white transition hover:bg-[#23934f] disabled:opacity-60 @[1024px]:px-7 @[1024px]:py-4 @[1024px]:text-sm"
                  }
                >
                  {ordering ? "Opening..." : "Order on WhatsApp"}
                </button>

              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            CART DRAWER
        ===================================================== */}

        {showCart && (
          <div className="fixed inset-0 z-50">

            {/* Overlay */}

            <button
              type="button"
              aria-label="Close cart"
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-black/40"
            />

            {/* Drawer */}

            <div className="absolute bottom-0 left-1/2 flex max-h-[88vh] w-full max-w-[520px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[26px] bg-[#f7f5f1] shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

                <div>

                  <h2
                    className={
                      publicText
                        ? "text-[25px] font-bold leading-tight tracking-[-0.02em] text-slate-900 @[1024px]:text-2xl"
                        : "text-xl font-bold tracking-[-0.02em]"
                    }
                  >
                    Your Cart
                  </h2>

                  <p
                    className={
                      publicText
                        ? "mt-1 text-[13px] font-semibold text-slate-500 @[1024px]:text-[12px]"
                        : "text-[8px] text-slate-400"
                    }
                  >
                    {cartCount}{" "}
                    {cartCount === 1 ? "item" : "items"}{" "}
                    selected
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  className={
                    publicText
                      ? "flex size-10 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                      : "flex size-9 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                  }
                  aria-label="Close cart"
                >
                  <X size={publicText ? 18 : 16} />
                </button>

              </div>

              {/* Items */}

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">

                {cart.length === 0 ? (

                  <div className="py-12 text-center">

                    <ShoppingCart
                      size={28}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p
                      className={
                        publicText
                          ? "text-[18px] font-bold"
                          : "text-base font-bold"
                      }
                    >
                      Your cart is empty
                    </p>

                    <p
                      className={
                        publicText
                          ? "mt-1 text-[12px] leading-5 text-slate-400"
                          : "mt-1 text-[10px] leading-5 text-slate-400"
                      }
                    >
                      Add products to continue.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {cart.map((item) => {

                      const product = item.product;

                      const itemTotal =
                        Number(product.price || 0) *
                        item.quantity;

                      return (
                        <div
                          key={product._id}
                          className={
                            publicText
                              ? "flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
                              : "flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                          }
                        >

                          {/* Image */}

                          <div
                            className={
                              publicText
                                ? "size-[78px] shrink-0 overflow-hidden rounded-lg bg-slate-100"
                                : "size-[74px] shrink-0 overflow-hidden rounded-lg bg-slate-100"
                            }
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Details */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                {/* Cart Product Name */}

                                <h3
                                  className={
                                    publicText
                                      ? "line-clamp-2 text-[17px] font-bold leading-[1.35] tracking-[-0.01em] text-slate-900 @[1024px]:text-xl"
                                      : "truncate text-[11px] font-bold"
                                  }
                                >
                                  {product.name}
                                </h3>

                                {/* Cart Product Price */}

                                <p
                                  className={
                                    publicText
                                      ? "mt-1 text-[14px] font-semibold leading-5 text-slate-600 @[1024px]:text-base"
                                      : "mt-0.5 text-[8px] text-slate-400"
                                  }
                                >
                                  ₹{formatPrice(product.price)} each
                                </p>

                              </div>

                              {/* Remove */}

                              <button
                                type="button"
                                onClick={() =>
                                  removeFromCart(product._id)
                                }
                                className={
                                  publicText
                                    ? "flex size-9 shrink-0 items-center justify-center rounded-full text-red-400 transition hover:bg-red-50 hover:text-red-500"
                                    : "flex size-7 shrink-0 items-center justify-center rounded-full text-red-400 transition hover:bg-red-50 hover:text-red-500"
                                }
                                aria-label={`Remove ${product.name}`}
                              >
                                <Trash2
                                  size={publicText ? 17 : 13}
                                />
                              </button>

                            </div>

                            {/* Quantity + Total */}

                            <div className="mt-4 flex items-center justify-between">

                              {/* Quantity */}

                              <div
                                className={
                                  publicText
                                    ? "flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50"
                                    : "flex items-center rounded-lg border border-slate-200 bg-slate-50"
                                }
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(product._id)
                                  }
                                  className={
                                    publicText
                                      ? "flex size-10 items-center justify-center transition hover:bg-slate-100"
                                      : "flex size-8 items-center justify-center transition hover:bg-slate-100"
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus
                                    size={publicText ? 15 : 10}
                                  />
                                </button>

                                <span
                                  className={
                                    publicText
                                      ? "w-9 text-center text-[16px] font-bold leading-none text-slate-900"
                                      : "w-6 text-center text-[9px] font-bold"
                                  }
                                >
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(product._id)
                                  }
                                  className={
                                    publicText
                                      ? "flex size-10 items-center justify-center transition hover:bg-slate-100"
                                      : "flex size-8 items-center justify-center transition hover:bg-slate-100"
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <Plus
                                    size={publicText ? 15 : 10}
                                  />
                                </button>

                              </div>

                              {/* Total */}

                              <span
                                className={
                                  publicText
                                    ? "text-[20px] font-black tracking-[-0.02em] text-slate-900 @[1024px]:text-xl"
                                    : "text-sm font-black"
                                }
                              >
                                ₹{formatPrice(itemTotal)}
                              </span>

                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}

              {cart.length > 0 && (
                <div className="border-t border-slate-200 bg-white px-5 pb-5 pt-4">

                  <div className="mb-4 flex items-center justify-between">

                    <span
                      className={
                        publicText
                          ? "text-[13px] font-semibold text-slate-500 @[1024px]:text-sm"
                          : "text-[10px] text-slate-500"
                      }
                    >
                      Grand Total
                    </span>

                    <span
                      className={
                        publicText
                          ? "text-[25px] font-black tracking-[-0.025em] text-[#123f2e] @[1024px]:text-[28px]"
                          : "text-xl font-black text-[#123f2e]"
                      }
                    >
                      ₹{formatPrice(cartTotal)}
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={sendToWhatsApp}
                    disabled={ordering}
                    className={
                      publicText
                        ? "flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#29a85c] text-[14px] font-bold text-white shadow-sm transition hover:bg-[#23934f] disabled:opacity-60 @[1024px]:h-14 @[1024px]:text-base"
                        : "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#29a85c] text-[11px] font-bold text-white shadow-sm transition hover:bg-[#23934f] disabled:opacity-60"
                    }
                  >

                    <ShoppingCart
                      size={publicText ? 18 : 15}
                    />

                    {ordering
                      ? "Opening WhatsApp..."
                      : "Order on WhatsApp"}

                  </button>

                </div>
              )}

            </div>
          </div>
        )}

      </div>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        quantity={
          selectedProduct
            ? (cart.find(
                (item) => item.product._id === selectedProduct._id,
              )?.quantity ?? 0)
            : 0
        }
        onAdd={() => {
          if (selectedProduct) addToCart(selectedProduct);
        }}
        onIncrease={() => {
          if (selectedProduct) increaseQuantity(selectedProduct._id);
        }}
        onDecrease={() => {
          if (selectedProduct) decreaseQuantity(selectedProduct._id);
        }}
      />
    </div>
  );
}