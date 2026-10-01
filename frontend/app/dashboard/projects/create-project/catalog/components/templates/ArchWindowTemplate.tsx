"use client";

import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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

   Distinguishing move: the hero background auto-crossfades
   through the collection's own photos (a cinematic backdrop,
   not one static image), and browsing below is an alternating
   left/right editorial lookbook — each piece gets a full row,
   image and copy swapping sides, animating in as it scrolls
   into view — rather than a grid of equal tiles.
========================================================= */

export default function ArchWindowTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName = catalog?.companyName || "Solstice Living";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Modern spaces, a brighter you";
  const hero = catalog?.hero;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [slide, setSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const PRODUCTS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / PRODUCTS_PER_PAGE)
  );

  const pagedProducts = isEditorPreview
    ? products
    : products.slice(
        (page - 1) * PRODUCTS_PER_PAGE,
        page * PRODUCTS_PER_PAGE
      );

  const heroImages = hero?.image
    ? [hero.image]
    : products.length
    ? products.slice(0, 5).map((p) => p.image)
    : [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=90",
      ];

  useEffect(() => {
    if (isEditorPreview || heroImages.length < 2) return;
    const timer = setInterval(() => {
      setSlide((value) => (value + 1) % heroImages.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isEditorPreview, heroImages.length]);

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

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className="@container/arc min-h-screen w-full bg-[#241629] text-[#f0e8f2]"
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
          HERO — auto-crossfading backdrop
      ====================================================== */}

      <section className="relative w-full">
        <div
          className={`relative w-full overflow-hidden ${
            isEditorPreview ? "aspect-[3/4] min-h-[440px]" : "aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]"
          }`}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={isEditorPreview ? "static" : slide}
              src={heroImages[isEditorPreview ? 0 : slide]}
              alt={companyName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/20" />

          {/* TOP BAR */}

          <div className="relative flex items-start justify-between px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10">
            <div className="min-w-0 pr-3">
              <p className="break-words text-[13px] font-semibold uppercase tracking-[0.24em] text-white [overflow-wrap:anywhere] sm:text-[15px]">
                {logo ? (
                  <span className="inline-flex items-center gap-2 align-middle">
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
              </p>

              <p className="mt-1.5 break-words text-[10px] uppercase tracking-[0.22em] text-white/80 [overflow-wrap:anywhere] sm:text-[11px]">
                {tagline}
              </p>
            </div>

            <div className="shrink-0 text-right text-[11px] uppercase leading-5 tracking-[0.2em] text-white/90 sm:text-[13px] sm:leading-6">
              <p>Furniture</p>
              <p>Decor</p>
              <p>Lighting</p>
              <p>Living</p>
              <span className="mt-2 inline-block h-px w-8 bg-white/50" />
            </div>
          </div>

          {/* HEADLINE */}

          <div className="absolute left-5 top-1/2 max-w-sm -translate-y-1/2 sm:left-8 lg:left-12">
            {hero?.title && (
              <h1 className="font-serif text-[38px] leading-[0.98] tracking-[-0.02em] text-white sm:text-[50px] lg:text-[60px]">
                {hero.title}
              </h1>
            )}

            {hero?.description && (
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/85 sm:mt-5 sm:text-[11px]">
                {hero.description}
              </p>
            )}
          </div>

          {/* SLIDE INDICATOR */}

          {!isEditorPreview && heroImages.length > 1 && (
            <div className="absolute bottom-6 left-5 flex gap-1.5 sm:bottom-9 sm:left-8 lg:bottom-12 lg:left-12">
              {heroImages.map((_, index) => (
                <span
                  key={index}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: index === slide ? 18 : 6,
                    backgroundColor:
                      index === slide ? "#ffffff" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          )}

          {/* COLLECTION TAG */}

          <div className="absolute bottom-6 right-5 text-right sm:bottom-9 sm:right-8 lg:bottom-12 lg:right-12">
            <p className="text-[7px] uppercase tracking-[0.24em] text-white/85 sm:text-[8px]">
              The
              <br />
              {new Date().getFullYear()}
              <br />
              Collection
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-4xl px-5 py-14 text-center sm:px-8 sm:py-20"
      >
        <p className="text-[7px] uppercase tracking-[0.3em] text-[#e39a73] sm:text-[8px]">
          Our story
        </p>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-2xl leading-[1.15] tracking-[-0.015em] sm:mt-5 sm:text-3xl">
          {catalog?.description?.trim() ||
            "Each piece is chosen to hold up to daily life while still feeling like a considered choice."}
        </h2>
      </motion.section>

      {/* =====================================================
          LOOKBOOK — alternating rows, not a grid
      ====================================================== */}

      <section className="border-t border-[#3d2a45] bg-[#2f1d35]">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-[7px] uppercase tracking-[0.3em] text-[#e39a73] sm:text-[8px]">
            Shop the edit
          </p>
          <h2 className="mt-2 font-serif text-2xl tracking-[-0.02em] sm:mt-3 sm:text-3xl">
            All pieces
          </h2>

          <div className="mt-10 flex flex-col gap-14 sm:mt-14 sm:gap-20">
            {pagedProducts.map((product, index) => {
              const reversed = index % 2 === 1;
              const discount =
                Number(product.mrp) > Number(product.price)
                  ? Math.round(
                      ((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100,
                    )
                  : 0;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: reversed ? 24 : -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedProduct(product)}
                  className={`grid cursor-pointer grid-cols-1 items-center gap-6 sm:gap-10 ${
                    isEditorPreview ? "@[560px]/arc:grid-cols-2" : "lg:grid-cols-2"
                  }`}
                >
                  <div
                    className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-white/20 ${
                      reversed ? "lg:order-2" : ""
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {discount > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#f0e8f2] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#241629]">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className={`min-w-0 ${reversed ? "lg:order-1 lg:text-right" : ""}`}>
                    <span className="text-[10px] font-medium text-[#e39a73]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 truncate font-serif font-semibold text-2xl tracking-[-0.015em] sm:text-3xl">
                      {product.name}
                    </h3>
                    <div
                      className={`mt-4 flex items-center gap-3 sm:mt-5 ${
                        reversed ? "lg:justify-end" : ""
                      }`}
                    >
                      <span className="font-serif text-lg sm:text-xl">
                        ₹{formatPrice(product.price)}
                      </span>
                      {discount > 0 && (
                        <span className="text-xs text-[#a89a89] line-through">
                          ₹{formatPrice(product.mrp)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {products.length === 0 && (
            <p className="py-16 text-center text-sm text-[#cdbfd3]">
              No products added yet.
            </p>
          )}

          {!isEditorPreview && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              className="text-[#f0e8f2]"
              activeClassName="bg-[#f0e8f2] text-[#241629]"
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
            className={`sticky bottom-0 z-40 w-full border-t border-[#3d2a45] bg-[#241629]/95 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e8f2] text-[#241629]">
                  <ShoppingBag size={15} />
                </span>
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-[#cdbfd3]">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <span className="block font-serif text-lg">₹{formatPrice(cartTotal)}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={orderOnWhatsApp}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#241629] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2f1d35] sm:px-6"
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
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#faf7f1] text-[#1b1815] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e6dcc7] px-5 py-5 sm:px-7">
                <h2 className="font-serif text-2xl">Your cart</h2>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6dcc7]"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {cart.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#8a8175]">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product._id}
                        className="rounded-2xl border border-[#e6dcc7] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-lg">{item.product.name}</h3>
                          <span className="text-sm text-[#8a8175]">
                            ₹{formatPrice(item.product.price)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-[#e6dcc7]">
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
                <div className="border-t border-[#e6dcc7] px-5 py-5 sm:px-7">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.14em] text-[#8a8175]">
                      Total
                    </span>
                    <span className="font-serif text-2xl">₹{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#241629] text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2f1d35]"
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

      <footer className="border-t border-[#3d2a45] bg-[#1b0f1f]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="break-words text-[15px] font-semibold uppercase tracking-[0.2em] [overflow-wrap:anywhere] sm:text-[18px]">
            {companyName}
          </p>
          <p className="break-words text-[13px] uppercase tracking-[0.2em] text-[#e39a73] [overflow-wrap:anywhere] sm:text-[15px]">
            {tagline}
          </p>
        </div>
      </footer>

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
          if (selectedProduct) increase(selectedProduct._id);
        }}
        onDecrease={() => {
          if (selectedProduct) decrease(selectedProduct._id);
        }}
      />
    </main>
  );
}
