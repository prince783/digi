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

   Distinguishing move: there is no product grid. Browsing is
   a single large gallery frame that auto-advances through the
   pieces (pausing on hover/interaction), with a thumbnail
   filmstrip beneath it to jump straight to a piece — a viewer,
   not a catalog page.
========================================================= */

export default function FramedGalleryTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName = catalog?.companyName || "Studio Verde";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Thoughtful designs for a kinder, brighter tomorrow";
  const hero = catalog?.hero;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const safeActive = products.length ? active % products.length : 0;
  const current = products[safeActive];

  // Auto-advance the gallery every 4.5s unless the viewer is
  // interacting (hovering the frame, or the cart is open).
  useEffect(() => {
    if (paused || showCart || products.length < 2) return;
    const timer = setInterval(() => {
      setActive((value) => (value + 1) % products.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused, showCart, products.length]);

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

  const discount =
    current && Number(current.mrp) > Number(current.price)
      ? Math.round(((Number(current.mrp) - Number(current.price)) / Number(current.mrp)) * 100)
      : 0;

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className="@container/frm min-h-screen w-full bg-[#e6ebdd] text-[#1e2a1f]"
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
          HEADLINE BLOCK
      ====================================================== */}

      <section className="mx-auto w-full max-w-6xl px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-3">
            {logo ? (
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt={companyName}
                  className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
                />
                <p className="min-w-0 break-words text-[13px] font-semibold uppercase tracking-[0.24em] [overflow-wrap:anywhere] sm:text-[14px]">
                  {companyName}
                </p>
              </div>
            ) : (
              <p className="break-words text-[13px] font-semibold uppercase tracking-[0.24em] [overflow-wrap:anywhere] sm:text-[14px]">
                {companyName}
              </p>
            )}

            <p className="mt-2 break-words text-[13px] uppercase tracking-[0.2em] text-[#5c6b58] [overflow-wrap:anywhere] sm:text-[15px]">
              {tagline}
            </p>
          </div>

          <p className="text-right text-[8px] font-medium uppercase tracking-[0.18em] text-[#5c6b58] sm:text-[9px]">
            {new Date().getFullYear()}
            <br />
            Collection
          </p>
        </div>

        {hero?.title && (
          <h1 className="mt-8 break-words font-serif text-[42px] leading-[0.98] tracking-[-0.02em] sm:mt-10 sm:text-[58px] lg:text-[68px]">
            {hero.title}
          </h1>
        )}

        {hero?.description && (
          <p className="mt-4 max-w-sm text-[12px] leading-5 text-[#4a5647] sm:mt-5 sm:text-[13px]">
            {hero.description}
          </p>
        )}
      </section>

      {/* =====================================================
          GALLERY FRAME — auto-advancing, one piece at a time
      ====================================================== */}

      {current && (
        <section className="mt-8 w-full sm:mt-10 lg:mt-12">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`relative w-full overflow-hidden bg-[#1e2a1f] ${
              isEditorPreview ? "aspect-[16/10] min-h-[300px]" : "h-[64vh] min-h-[340px] max-h-[680px]"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={current._id}
                src={current.image}
                alt={current.name}
                onClick={() => setSelectedProduct(current)}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full cursor-pointer object-contain"
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-3 p-5 sm:p-8 lg:px-12"
              >
                <div
                  className="min-w-0 max-w-xl cursor-pointer"
                  onClick={() => setSelectedProduct(current)}
                >
                  <h2 className="truncate font-serif font-bold text-xl text-white sm:text-2xl">
                    {current.name}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-white sm:text-base">
                      ₹{formatPrice(current.price)}
                    </span>
                    {discount > 0 && (
                      <span className="text-[10px] text-white/60 line-through">
                        ₹{formatPrice(current.mrp)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#1e2a1f]">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* PROGRESS DOTS */}

            {products.length > 1 && (
              <div className="absolute right-5 top-5 flex gap-1.5 sm:right-8 sm:top-8 lg:right-12">
                {products.map((product, index) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Show ${product.name}`}
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: index === safeActive ? 20 : 8,
                      backgroundColor:
                        index === safeActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* THUMBNAIL FILMSTRIP */}

          <div className="hide-scrollbar flex gap-2 overflow-x-auto bg-[#1e2a1f] px-5 py-3 sm:gap-3 sm:px-8 sm:py-4 lg:justify-center">
            {products.map((product, index) => (
              <button
                key={product._id}
                type="button"
                onClick={() => setActive(index)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-16 sm:w-16 ${
                  index === safeActive
                    ? "border-white"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between bg-[#1e2a1f] px-5 py-3 text-white sm:px-8 lg:px-12">
            <p className="text-[7px] uppercase tracking-[0.24em] text-white/70 sm:text-[9px]">
              More than furniture
            </p>
            <p className="text-[7px] uppercase tracking-[0.24em] text-white sm:text-[9px]">
              A better tomorrow
            </p>
          </div>
        </section>
      )}

      {products.length === 0 && (
        <p className="py-16 text-center text-sm text-[#7c8578]">No products added yet.</p>
      )}

      {/* STORY */}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-4xl px-5 py-14 text-center sm:px-8 sm:py-20"
      >
        <h2 className="mx-auto max-w-xl font-serif text-2xl leading-[1.15] tracking-[-0.015em] sm:text-3xl">
          {catalog?.description?.trim() ||
            "Rooted in craft, shaped for modern life — pieces designed to be lived with, not just looked at."}
        </h2>
      </motion.section>

      {/* STICKY CART BAR */}

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className={`sticky bottom-0 z-40 w-full border-t border-[#c4cdb6] bg-[#d9e0cd]/95 shadow-[0_-10px_30px_rgba(30,42,31,0.12)] backdrop-blur-xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e2a1f] text-white">
                  <ShoppingBag size={15} />
                </span>
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-[#7c8578]">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <span className="block font-serif text-lg">₹{formatPrice(cartTotal)}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={orderOnWhatsApp}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#1e2a1f] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#16201a] sm:px-6"
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
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbfaf6] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e2dfd0] px-5 py-5 sm:px-7">
                <h2 className="font-serif text-2xl">Your cart</h2>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e2dfd0]"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {cart.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#7c8578]">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product._id}
                        className="rounded-2xl border border-[#e2dfd0] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-lg">{item.product.name}</h3>
                          <span className="text-sm text-[#7c8578]">
                            ₹{formatPrice(item.product.price)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-[#e2dfd0]">
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
                <div className="border-t border-[#e2dfd0] px-5 py-5 sm:px-7">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.14em] text-[#7c8578]">
                      Total
                    </span>
                    <span className="font-serif text-2xl">₹{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1e2a1f] text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#16201a]"
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

      <footer className="border-t border-[#c4cdb6] bg-[#d9e0cd]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-[12px]">
            {companyName}
          </p>
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#5c6b58] sm:text-[14px]">
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
