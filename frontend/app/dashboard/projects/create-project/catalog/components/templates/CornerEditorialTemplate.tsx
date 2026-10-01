"use client";

import {
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
import { useRef, useState } from "react";

import CatalogProductCard from "../ui/CatalogProductCard";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

/* =========================================================
   CART TYPES
========================================================= */

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

function getWhatsappNumber(catalog: CatalogTemplateProps["catalog"]) {
  const raw = catalog?.whatsapp?.toString() || catalog?.phone?.toString() || "";
  let phone = raw.replace(/\D/g, "");
  if (phone.length === 10) {
    phone = `91${phone}`;
  }
  return phone;
}

/* =========================================================
   TEMPLATE

   Distinguishing move: the hero photo parallaxes against
   scroll (photo drifts slower than the page), and the product
   grid is an asymmetric masonry — the first piece runs large,
   the rest fall into a denser rhythm around it, rather than a
   uniform grid of equal tiles.
========================================================= */

export default function CornerEditorialTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName = catalog?.companyName || "Studio Home";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || catalog?.aboutCompany?.trim() || "Living beautifully";
  const hero = catalog?.hero;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
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

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const heroImage =
    hero?.image ||
    products[0]?.image ||
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=90";

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

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className="@container/cnr min-h-screen w-full bg-[#2a1418] text-[#f3e9e4]"
    >
      {!isEditorPreview && (
        <style jsx global>{`
          [data-public="true"] [class*="text-[6px]"] { font-size: 8px; }
          [data-public="true"] [class*="text-[7px]"] { font-size: 9px; }
          [data-public="true"] [class*="text-[8px]"] { font-size: 10px; }
          [data-public="true"] [class*="text-[9px]"] { font-size: 11px; }
          [data-public="true"] [class*="text-[10px]"] { font-size: 12px; }
          [data-public="true"] [class*="text-[11px]"] { font-size: 13px; }
          [data-public="true"] [class~="text-xs"] { font-size: 0.9375rem; }
          [data-public="true"] [class~="text-sm"] { font-size: 1.0625rem; }
        `}</style>
      )}

      {/* =====================================================
          HERO — parallax photo
      ====================================================== */}

      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
      >
        <div
          className={`relative w-full overflow-hidden ${
            isEditorPreview
              ? "flex min-h-[560px] flex-col justify-between"
              : "aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9]"
          }`}
        >
          <motion.img
            src={heroImage}
            alt={companyName}
            style={
              isEditorPreview ? undefined : { y: heroY, scale: heroScale }
            }
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

          {/* TOP BAR */}

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`relative flex items-start justify-between gap-3 px-5 pt-6 ${
              isEditorPreview ? "" : "sm:px-8 sm:pt-8 lg:px-12 lg:pt-10"
            }`}
          >
            <div>
              <p className={`min-w-0 break-words text-[13px] font-semibold uppercase tracking-[0.28em] text-white ${isEditorPreview ? "" : "sm:text-[15px]"}`}>
                {logo ? (
                  <span className="inline-flex items-center gap-2.5 align-middle">
                    <img
                      src={logo}
                      alt={companyName}
                      className="inline-block h-10 w-10 shrink-0 rounded-full object-contain sm:h-12 sm:w-12"
                    />
                    {companyName}
                  </span>
                ) : (
                  companyName
                )}
              </p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.25em] text-white/80 sm:text-[11px]">
                {tagline}
              </p>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`text-right ${isEditorPreview ? "hidden @[560px]/cnr:block" : ""}`}>
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/90 sm:text-[10px]">
                  {new Date().getFullYear()} Collection
                </p>
                <span className="mt-1.5 inline-block h-px w-10 bg-white/50" />
              </div>

              <button
                type="button"
                aria-label="Open cart"
                onClick={() => setShowCart(true)}
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-[#1c1a17] sm:h-11 sm:w-11"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-[#1c1a17]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {/* HEADLINE BLOCK */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`px-5 pb-8 ${
              isEditorPreview
                ? "relative mt-8"
                : "absolute inset-x-0 bottom-0 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16"
            }`}
          >
            {hero?.eyebrow && (
              <p className="mb-2 text-[7px] font-medium uppercase tracking-[0.3em] text-white/80 sm:mb-3 sm:text-[8px]">
                {hero.eyebrow}
              </p>
            )}

            {hero?.title && (
              <h1 className={`max-w-xl [overflow-wrap:anywhere] font-serif leading-[0.98] tracking-[-0.02em] text-white ${
                isEditorPreview
                  ? "text-[34px]"
                  : "text-[40px] sm:text-[56px] lg:text-[68px]"
              }`}>
                {hero.title}
              </h1>
            )}

            <span className="mt-4 block h-px w-14 bg-white/50 sm:mt-6" />

            {hero?.description && (
              <p className={`mt-4 max-w-xs [overflow-wrap:anywhere] text-[11px] leading-5 text-white/85 ${isEditorPreview ? "" : "sm:mt-5 sm:text-[13px] sm:leading-6"}`}>
                {hero.description}
              </p>
            )}
          </motion.div>
        </div>

        {/* FOOTER STRIP OF HERO */}

        <div className="flex items-center justify-between bg-[#1d0d10] px-5 py-3 text-white sm:px-8 sm:py-4 lg:px-12">
          <p className="text-[7px] uppercase tracking-[0.24em] text-white/70 sm:text-[9px]">
            Design for a better tomorrow
          </p>
        </div>
      </section>

      {/* =====================================================
          STORY
      ====================================================== */}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-5xl px-5 py-14 text-center sm:px-8 sm:py-20"
      >
        <p className="text-[7px] uppercase tracking-[0.3em] text-[#e39a73] sm:text-[8px] sm:tracking-[0.36em]">
          Our story
        </p>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-2xl leading-[1.1] tracking-[-0.02em] sm:mt-5 sm:text-4xl">
          {catalog?.description?.trim() ||
            "Furniture and decor built for the way people actually live — comfortable, considered, and quietly beautiful."}
        </h2>
      </motion.section>

      {/* =====================================================
          MASONRY PRODUCT GRID
      ====================================================== */}

      <section className="border-t border-[#4a2a2f] bg-[#361c21]">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
            <div>
              <p className="text-[7px] uppercase tracking-[0.3em] text-[#e39a73] sm:text-[8px]">
                Shop the edit
              </p>
              <h2 className="mt-2 font-serif text-2xl tracking-[-0.02em] sm:mt-3 sm:text-3xl">
                All pieces
              </h2>
            </div>
          </div>

          <div
            className={`grid auto-rows-min grid-cols-2 gap-4 sm:gap-6 ${
              isEditorPreview ? "@[560px]/cnr:grid-cols-4" : "@[820px]/cnr:grid-cols-4"
            }`}
          >
            {pagedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index * 0.05, 0.25),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="min-w-0"
              >
                <CatalogProductCard
                  product={product}
                  onCardClick={(p) => setSelectedProduct(p)}
                  dark
                />
              </motion.div>
            ))}
          </div>

          {products.length === 0 && (
            <p className="py-16 text-center text-sm text-[#c9a9a3]">
              No products added yet.
            </p>
          )}

          {!isEditorPreview && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              className="text-[#f3e9e4]"
              activeClassName="bg-[#f3e9e4] text-[#2a1418]"
            />
          )}
        </div>
      </section>

      {/* =====================================================
          STICKY CART BAR
      ====================================================== */}

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className={`sticky bottom-0 z-40 w-full border-t border-[#4a2a2f] bg-[#2a1418]/95 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3e9e4] text-[#2a1418]">
                  <ShoppingBag size={15} />
                </span>
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-[#c9a9a3]">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <span className="block font-serif text-lg">
                    ₹{formatPrice(cartTotal)}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={orderOnWhatsApp}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2a1418] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#1d0d10] sm:px-6"
              >
                <MessageCircle size={14} />
                Order on WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          CART DRAWER
      ====================================================== */}

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
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbf9f5] text-[#1c1a17] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e4dccf] px-5 py-5 sm:px-7">
                <h2 className="font-serif text-2xl">Your cart</h2>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4dccf]"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {cart.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[#8a8175]">
                    Your cart is empty.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product._id}
                        className="rounded-2xl border border-[#e4dccf] bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-lg">{item.product.name}</h3>
                          <span className="text-sm text-[#8a8175]">
                            ₹{formatPrice(item.product.price)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-[#e4dccf]">
                            <button
                              type="button"
                              onClick={() => decrease(item.product._id)}
                              className="flex h-8 w-8 items-center justify-center"
                              aria-label={`Decrease ${item.product.name}`}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="min-w-6 text-center text-sm">
                              {item.quantity}
                            </span>
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
                <div className="border-t border-[#e4dccf] px-5 py-5 sm:px-7">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.14em] text-[#8a8175]">
                      Total
                    </span>
                    <span className="font-serif text-2xl">
                      ₹{formatPrice(cartTotal)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2a1418] text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#1d0d10]"
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

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#4a2a2f] bg-[#1d0d10]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-[12px]">
            {companyName}
          </p>
          <p className="text-[8px] uppercase tracking-[0.24em] text-[#c9a9a3] sm:text-[9px]">
            Design for a better tomorrow
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
