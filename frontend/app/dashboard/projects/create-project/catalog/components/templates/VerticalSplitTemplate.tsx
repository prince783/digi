"use client";

import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import CatalogProductCard from "../ui/CatalogProductCard";
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

   Distinguishing move: the split panel and the photo drift
   against scroll at different speeds (the panel eases, the
   photo moves faster), and the product grid is replaced with
   a horizontal, snap-scrolling rail — browsing is a sideways
   swipe, not a downward scroll.
========================================================= */

export default function VerticalSplitTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName = catalog?.companyName || "Atelier Home";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Timeless designs for a brighter tomorrow";
  const hero = catalog?.hero;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const railRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const updateCanScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    updateCanScroll();
    el.addEventListener("scroll", updateCanScroll, { passive: true });
    const observer = new ResizeObserver(updateCanScroll);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateCanScroll);
      observer.disconnect();
    };
  }, [updateCanScroll, products.length]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const panelY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const heroImage =
    hero?.image ||
    products[0]?.image ||
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1400&q=90";

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

  function scrollRail(direction: -1 | 1) {
    railRef.current?.scrollBy({
      left: direction * (railRef.current.clientWidth * 0.85),
      behavior: "smooth",
    });
  }

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className="@container/vsp min-h-screen w-full bg-[#f3ede2] text-[#2a2118]"
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
          HERO — differential parallax split
      ====================================================== */}

      <section
        ref={heroRef}
        className={`grid grid-cols-1 overflow-hidden ${
          isEditorPreview ? "@[560px]/vsp:grid-cols-[0.9fr_1.4fr]" : "lg:grid-cols-[0.9fr_1.4fr]"
        }`}
      >
        {/* TEXT PANEL */}

        <motion.div
          style={isEditorPreview ? undefined : { y: panelY }}
          className="flex flex-col justify-between px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] sm:text-[14px]">
                {logo ? (
                  <span className="flex items-center gap-2">
                    <img
                      src={logo}
                      alt={companyName}
                      className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
                    />
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                      {companyName}
                    </span>
                  </span>
                ) : (
                  <span className="break-words [overflow-wrap:anywhere]">
                    {companyName}
                  </span>
                )}
              </p>

              <p className="mt-1.5 break-words text-[9px] uppercase tracking-[0.22em] text-[#8a5a34] [overflow-wrap:anywhere] sm:text-[10px]">
                {tagline}
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-3">
              <p className="text-right text-[8px] font-medium uppercase tracking-[0.2em] text-[#8a5a34] sm:text-[9px]">
                {new Date().getFullYear()}
                <br />
                Collection
              </p>

              <button
                type="button"
                aria-label="Open cart"
                onClick={() => setShowCart(true)}
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2a2118]/25 text-[#2a2118] transition hover:bg-[#2a2118] hover:text-[#f3ede2]"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#2a2118] px-1 text-[10px] font-semibold text-[#f3ede2]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 lg:mt-0"
          >
            {hero?.title && (
              <h1 className="font-serif text-[38px] leading-[0.96] tracking-[-0.02em] sm:text-[48px] lg:text-[54px]">
                {hero.title
                  .split(" ")
                  .reduce<string[]>((lines, word, i) => {
                    const lineIndex = i < 2 ? 0 : 1;
                    lines[lineIndex] = lines[lineIndex] ? `${lines[lineIndex]} ${word}` : word;
                    return lines;
                  }, ["", ""])
                  .filter(Boolean)
                  .map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
              </h1>
            )}

            {hero?.eyebrow && (
              <p className="mt-5 max-w-xs text-[10px] uppercase tracking-[0.18em] text-[#8a5a34] sm:text-[11px]">
                {hero.eyebrow}
              </p>
            )}

            <span className="mt-5 block h-px w-12 bg-[#c9b79a] sm:mt-6" />
          </motion.div>

        </motion.div>

        {/* PHOTO PANEL */}

        <div
          className={`relative w-full overflow-hidden ${
            isEditorPreview ? "aspect-[4/5] min-h-[300px]" : "aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[560px]"
          }`}
        >
          <motion.img
            src={heroImage}
            alt={companyName}
            style={isEditorPreview ? undefined : { y: photoY, scale: 1.15 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
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
        <h2 className="mx-auto max-w-xl font-serif text-2xl leading-[1.15] tracking-[-0.015em] sm:text-3xl">
          {catalog?.description?.trim() ||
            "Every piece is chosen for how it lives in a room, not just how it looks in a photo."}
        </h2>
      </motion.section>

      {/* =====================================================
          HORIZONTAL SNAP-SCROLL RAIL
      ====================================================== */}

      <section className="border-t border-[#e0d3ba] bg-[#f8f4ec]">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16 @[1000px]/vsp:max-w-[1600px] @[1000px]/vsp:px-10">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="text-[7px] uppercase tracking-[0.3em] text-[#8a5a34] sm:text-[8px]">
                Shop the collection
              </p>
              <h2 className="mt-2 font-serif text-2xl tracking-[-0.02em] sm:mt-3 sm:text-3xl">
                All pieces
              </h2>
            </div>

            <div className="hidden shrink-0 gap-2 @[480px]/vsp:flex">
              <button
                type="button"
                onClick={() => scrollRail(-1)}
                disabled={!canScroll.left}
                aria-label="Scroll left"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d3ba] transition hover:bg-[#ece3d2] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(1)}
                disabled={!canScroll.right}
                aria-label="Scroll right"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d3ba] transition hover:bg-[#ece3d2] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div
            ref={railRef}
            className="hide-scrollbar -mx-5 flex snap-x scroll-smooth gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 @[480px]/vsp:gap-6 @[1000px]/vsp:gap-3"
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[65%] shrink-0 snap-start @[480px]/vsp:w-[38%] @[720px]/vsp:w-[26%] @[1000px]/vsp:w-[calc((100%-5.25rem)/8)] @[1000px]/vsp:[&>article>div:last-child]:p-3 @[1000px]/vsp:[&_h3]:text-[14px] @[1000px]/vsp:[&_p]:text-[12px] @[1000px]/vsp:[&_button]:h-10 @[1000px]/vsp:[&_button]:text-[12px]"
              >
                <CatalogProductCard
                  product={product}
                  onCardClick={(p) => setSelectedProduct(p)}
                />
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p className="py-16 text-center text-sm text-[#8a8175]">
              No products added yet.
            </p>
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
            className={`sticky bottom-0 z-40 w-full border-t border-[#e0d3ba] bg-[#f8f4ec]/95 shadow-[0_-10px_30px_rgba(42,33,24,0.08)] backdrop-blur-xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a2118] text-white">
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
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2a2118] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#1e170f] sm:px-6"
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
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f8f4ec] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e0d3ba] px-5 py-5 sm:px-7">
                <h2 className="font-serif text-2xl">Your cart</h2>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0d3ba]"
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
                        className="rounded-2xl border border-[#e0d3ba] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-lg">{item.product.name}</h3>
                          <span className="text-sm text-[#8a7f6f]">
                            ₹{formatPrice(item.product.price)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-[#e0d3ba]">
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
                <div className="border-t border-[#e0d3ba] px-5 py-5 sm:px-7">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.14em] text-[#8a7f6f]">
                      Total
                    </span>
                    <span className="font-serif text-2xl">₹{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2a2118] text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#1e170f]"
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

      <footer className="border-t border-[#e0d3ba] bg-[#f3ede2]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-[12px]">
            {companyName}
          </p>
          <p className="text-[8px] uppercase tracking-[0.24em] text-[#8a7f6f] sm:text-[9px]">
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
