"use client";

import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import CatalogProductCard from "../ui/CatalogProductCard";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

interface CartItem {
  product: CatalogTemplateProps["products"][number];
  quantity: number;
}

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("en-IN");
}

function getWhatsappNumber(catalog: CatalogTemplateProps["catalog"]) {
  const raw = catalog?.whatsapp?.toString() || catalog?.phone?.toString() || "";
  let phone = raw.replace(/\D/g, "");
  if (phone.length === 10) phone = `91${phone}`;
  return phone;
}

/* =========================================================
   TEMPLATE

   Distinguishing move: the entry is a scroll-snapped, full
   viewport sequence — a hero screen, then a dark room-select
   screen — each one owning the whole frame before the visitor
   settles into a normal scrolling shop below.
========================================================= */

export default function DarkStripTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName = catalog?.companyName || "Mercer & Home";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Spaces for a brighter tomorrow";
  const hero = catalog?.hero;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const heroImage =
    hero?.image ||
    products[0]?.image ||
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=90";

  const filteredProducts = products;

  const PRODUCTS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const pagedProducts = isEditorPreview
    ? filteredProducts
    : filteredProducts.slice(
        (page - 1) * PRODUCTS_PER_PAGE,
        page * PRODUCTS_PER_PAGE,
      );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0,
  );

  function addToCart(product: CatalogTemplateProps["products"][number]) {
    setCart((current) => {
      const existing = current.find((item) => item.product._id === product._id);
      if (existing) {
        return current.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function increase(id: string) {
    setCart((current) =>
      current.map((item) =>
        item.product._id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrease(id: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.product._id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function quantityOf(id: string) {
    return cart.find((item) => item.product._id === id)?.quantity || 0;
  }

  function orderOnWhatsApp() {
    const phone = getWhatsappNumber(catalog);
    if (!phone || !cart.length) {
      if (!phone) alert("WhatsApp number is not available.");
      return;
    }
    const message = `Hello, I would like to order:\n\n${cart
      .map(
        (item) =>
          `${item.product.name} x ${item.quantity} - ₹${formatPrice(
            item.product.price * item.quantity,
          )}`,
      )
      .join("\n")}\n\nTotal: ₹${formatPrice(cartTotal)}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    // Mobile browsers often block window.open() with a
    // non-empty features string; navigating directly always
    // reaches the wa.me redirect.
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }

  const snapHeight = isEditorPreview ? "min-h-[340px]" : "h-[100svh]";

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className="@container/drk w-full bg-[#f5f1e9] text-[#171512]"
    >
      {!isEditorPreview && (
        <style jsx global>{`
          [data-public="true"] [class*="text-[6px]"] { font-size: 8px; }
          [data-public="true"] [class*="text-[7px]"] { font-size: 9px; }
          [data-public="true"] [class*="text-[8px]"] { font-size: 10px; }
          [data-public="true"] [class*="text-[9px]"] { font-size: 11px; }
          [data-public="true"] [class*="text-[10px]"] { font-size: 12px; }
          [data-public="true"] [class~="text-xs"] { font-size: 0.9375rem; }
          [data-public="true"] [class~="text-sm"] { font-size: 1.0625rem; }
        `}</style>
      )}

      {/* =====================================================
          SNAP SEQUENCE — hero screen, then room-select screen
      ====================================================== */}

      <div
        className={`${
          isEditorPreview
            ? ""
            : "snap-y snap-mandatory overflow-y-auto"
        } ${isEditorPreview ? "" : "h-[100svh]"}`}
      >
        {/* SCREEN 1 — HERO */}

        <section
          className={`relative flex w-full snap-start flex-col justify-between overflow-hidden ${snapHeight}`}
        >
          <img
            src={heroImage}
            alt={companyName}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60" />

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`relative flex items-start justify-between gap-3 px-5 pt-6 ${
              isEditorPreview ? "!pt-4" : "sm:px-8 sm:pt-8 lg:px-12 lg:pt-10"
            }`}
          >
            <div className="min-w-0 pr-3">
              <p className={`break-words text-[13px] font-semibold uppercase tracking-[0.24em] text-white [overflow-wrap:anywhere] ${isEditorPreview ? "" : "sm:text-[14px]"}`}>
                {logo ? (
                  <span className="inline-flex items-center gap-1.5 align-middle">
                    <img
                      src={logo}
                      alt={companyName}
                      className="inline-block h-7 w-7 shrink-0 rounded-full object-contain sm:h-8 sm:w-8"
                    />
                    {companyName}
                  </span>
                ) : (
                  companyName
                )}
                <sup className="ml-0.5 text-[6px]">™</sup>
              </p>

              <p className="mt-1.5 break-words text-[10px] uppercase tracking-[0.22em] text-white/80 [overflow-wrap:anywhere] sm:text-[11px]">
                {tagline}
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-3 sm:gap-4">
              <p className="text-right text-[8px] font-medium uppercase tracking-[0.18em] text-white/80 sm:text-[9px]">
                {new Date().getFullYear()}
                <br />
                Collection
              </p>

              <button
                type="button"
                aria-label="Open cart"
                onClick={() => setShowCart(true)}
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-[#14120f] sm:h-11 sm:w-11"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-[#14120f]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`relative px-5 ${
              isEditorPreview ? "mt-6 pb-6" : "pb-16 sm:px-8 lg:px-12"
            }`}
          >
            {hero?.title && (
              <h1 className={`max-w-2xl [overflow-wrap:anywhere] font-serif leading-[1.02] tracking-[-0.02em] text-white ${
                isEditorPreview ? "text-[24px]" : "text-[38px] sm:text-[52px] lg:text-[62px]"
              }`}>
                {hero.title}
              </h1>
            )}
            {hero?.description && (
              <p className={`mt-3 [overflow-wrap:anywhere] text-[10px] uppercase tracking-[0.16em] text-white/85 ${isEditorPreview ? "" : "sm:mt-4 sm:text-[11px]"}`}>
                {hero.description}
              </p>
            )}
          </motion.div>
        </section>
      </div>

      {/* =====================================================
          SHOP — normal scroll, below the snap sequence
      ====================================================== */}

      <section className="bg-[#faf7f0]">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="text-[7px] uppercase tracking-[0.3em] text-[#6b4a30] sm:text-[8px]">
                All pieces
              </p>
              <h2 className="mt-2 font-serif text-2xl tracking-[-0.02em] sm:mt-3 sm:text-3xl">
                {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
              </h2>
            </div>
          </div>

          <div
            className={`grid grid-cols-2 gap-4 sm:gap-6 ${
              isEditorPreview ? "@[560px]/drk:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {pagedProducts.map((product) => (
              <CatalogProductCard
                key={product._id}
                product={product}
                onCardClick={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="py-16 text-center text-sm text-[#8a7f6f]">
              No products added yet.
            </p>
          )}

          {!isEditorPreview && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              className="text-[#171512]"
              activeClassName="bg-[#171512] text-[#f5f1e9]"
            />
          )}
        </div>
      </section>

      {/* STICKY CART BAR */}

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className={`sticky bottom-0 z-40 w-full border-t border-[#e6dfce] bg-[#faf7f0]/95 shadow-[0_-10px_30px_rgba(23,21,18,0.08)] backdrop-blur-xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14120f] text-white">
                  <ShoppingBag size={15} />
                </span>
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-[#8a7f6f]">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <span className="block font-serif text-lg">₹{formatPrice(cartTotal)}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={orderOnWhatsApp}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#171512] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#14120f] sm:px-6"
              >
                <MessageCircle size={14} />
                Order on WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <button
              type="button"
              aria-label="Close cart"
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#faf7f0] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e6dfce] px-5 py-5 sm:px-7">
                <h2 className="font-serif text-2xl">Your cart</h2>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6dfce]"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {cart.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#8a7f6f]">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product._id}
                        className="rounded-2xl border border-[#e6dfce] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-lg">{item.product.name}</h3>
                          <span className="text-sm text-[#8a7f6f]">
                            ₹{formatPrice(item.product.price)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-[#e6dfce]">
                            <button
                              type="button"
                              onClick={() => decrease(item.product._id)}
                              className="flex h-8 w-8 items-center justify-center"
                              aria-label={`Decrease ${item.product.name}`}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => increase(item.product._id)}
                              className="flex h-8 w-8 items-center justify-center"
                              aria-label={`Increase ${item.product.name}`}
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <p className="font-serif text-base">
                            ₹{formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-[#e6dfce] px-5 py-5 sm:px-7">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.14em] text-[#8a7f6f]">
                      Total
                    </span>
                    <span className="font-serif text-2xl">₹{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#171512] text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#14120f]"
                  >
                    <MessageCircle size={16} />
                    Order on WhatsApp
                  </button>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}

      <footer className="border-t border-[#e6dfce] bg-[#f5f1e9]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-[12px]">
            {companyName}
          </p>
          <p className="text-[8px] uppercase tracking-[0.24em] text-[#6b4a30] sm:text-[9px]">
            {tagline}
          </p>
        </div>
      </footer>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        quantity={selectedProduct ? quantityOf(selectedProduct._id) : 0}
        onAdd={() => {
          if (selectedProduct) addToCart(selectedProduct);
        }}
        onIncrease={() => {
          if (selectedProduct) increase(selectedProduct._id);
        }}
        onDecrease={() => {
          if (selectedProduct) decrease(selectedProduct._id);
        }}
      />
    </main>
  );
}
