"use client";

import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import CatalogProductCard from "../ui/CatalogProductCard";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function IvoryGallery({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const [active, setActive] = useState(0);
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

  const companyName = catalog?.companyName || "NOORÉ";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Fine collection";

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (!products?.length) {
    return (
      <main className="min-h-screen w-full bg-[#1f1c19] text-[#f1ebe2]">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 text-center">
          <div className="max-w-lg">
            <span className="text-[8px] uppercase tracking-[0.35em] text-[#9a8877] sm:text-[9px]">
              The Collection
            </span>

            <h1 className="mt-4 font-serif text-3xl tracking-[-0.02em] sm:text-5xl">
              Nothing here yet.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-xs leading-6 text-[#b8ada2] sm:mt-5 sm:text-sm sm:leading-7">
              Our collection is being carefully curated. Please check
              back soon to discover the latest pieces.
            </p>

            <div className="mx-auto mt-7 h-px w-14 bg-[#c8b9a8]" />
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ACTIVE PRODUCT
  ========================================================= */

  const safeActive =
    active >= 0 && active < products.length ? active : 0;

  const product = products[safeActive];

  /* =========================================================
     CART
  ========================================================= */

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const addToCart = (item: typeof product) => {
    setCart((currentCart) => {
      const id = String(item._id);

      const existing = currentCart.find(
        (cartItem) => String(cartItem._id) === id
      );

      if (existing) {
        return currentCart.map((cartItem) =>
          String(cartItem._id) === id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          _id: id,
          name: item.name,
          price: Number(item.price || 0),
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (id: string) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== id)
    );
  };

  /* =========================================================
     SLIDER
  ========================================================= */

  const previous = () => {
    setActive((value) =>
      value <= 0 ? products.length - 1 : value - 1
    );
  };

  const next = () => {
    setActive((value) =>
      value >= products.length - 1 ? 0 : value + 1
    );
  };

  /* =========================================================
     WHATSAPP
  ========================================================= */

  const getWhatsappNumber = () => {
    const rawNumber =
      catalog?.whatsapp?.toString() ||
      catalog?.phone?.toString() ||
      "";

    let phone = rawNumber.replace(/\D/g, "");

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    return phone;
  };

  const openWhatsApp = (item: typeof product) => {
    const phone = getWhatsappNumber();

    if (!phone) {
      alert("WhatsApp number is not available.");
      return;
    }

    const message = `Hello, I am interested in this product:

Product: ${item.name}
Price: ₹${Number(item.price || 0).toLocaleString("en-IN")}

Please share more details.`;

    const ivoryWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = ivoryWhatsappUrl;
    } else {
      window.open(ivoryWhatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const orderCartOnWhatsApp = () => {
    const phone = getWhatsappNumber();

    if (!phone || !cart.length) {
      if (!phone) {
        alert("WhatsApp number is not available.");
      }
      return;
    }

    const message = `Hello, I would like to order:

${cart
  .map(
    (item) =>
      `${item.name} x ${item.quantity} - ₹${(
        item.price * item.quantity
      ).toLocaleString("en-IN")}`
  )
  .join("\n")}

Total: ₹${cartTotal.toLocaleString("en-IN")}`;

    const ivoryWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = ivoryWhatsappUrl;
    } else {
      window.open(ivoryWhatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  /* =========================================================
     DISCOUNT
  ========================================================= */

  const discount =
    product.mrp &&
    Number(product.mrp) > Number(product.price)
      ? Math.round(
          ((Number(product.mrp) - Number(product.price)) /
            Number(product.mrp)) *
            100
        )
      : 0;

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className="@container/ivory min-h-screen w-full bg-[#1f1c19] text-[#f1ebe2]"
    >
      {!isEditorPreview && (
        <style jsx global>{`
          [data-public="true"] [class*="text-[6px]"] { font-size: 8px; }
          [data-public="true"] [class*="text-[7px]"] { font-size: 9px; }
          [data-public="true"] [class*="text-[8px]"] { font-size: 10px; }
          [data-public="true"] [class*="text-[9px]"] { font-size: 11px; }
          [data-public="true"] [class*="text-[10px]"] { font-size: 12px; }
          [data-public="true"] [class*="text-[11px]"] { font-size: 13px; }
          [data-public="true"] [class*="text-[12px]"] { font-size: 14px; }
          [data-public="true"] [class*="text-[13px]"] { font-size: 15px; }
          [data-public="true"] [class~="text-xs"],
          [data-public="true"] [class*=":text-xs"] { font-size: 0.9375rem; }
          [data-public="true"] [class~="text-sm"],
          [data-public="true"] [class*=":text-sm"] { font-size: 1.0625rem; }
        `}</style>
      )}
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#3a352f]/80 bg-[#1f1c19]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] w-full max-w-6xl items-center justify-between px-4 sm:h-[70px] sm:px-6 lg:h-[76px] lg:px-8">
          {/* BRAND */}

          <div
            className={`min-w-0 flex-1 pr-2 ${
              isEditorPreview
                ? "@[600px]/ivory:max-w-[45%] @[600px]/ivory:flex-none"
                : "sm:max-w-[45%] sm:flex-none"
            }`}
          >
            {logo ? (
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt={companyName}
                  className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
                />
                <p className="line-clamp-2 break-words font-serif text-[15px] leading-tight tracking-[0.12em] [overflow-wrap:anywhere] sm:text-lg sm:tracking-[0.18em]">
                  {companyName}
                </p>
              </div>
            ) : (
              <p className="line-clamp-2 break-words font-serif text-[15px] leading-tight tracking-[0.12em] [overflow-wrap:anywhere] sm:text-lg sm:tracking-[0.18em]">
                {companyName}
              </p>
            )}

            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#9a8877] sm:text-[10px] sm:tracking-[0.25em]">
              {tagline}
            </p>
          </div>

          {/* CENTER */}

          <div
            className={`hidden items-center gap-3 lg:gap-4 ${
              isEditorPreview ? "@[600px]/ivory:flex" : "sm:flex"
            }`}
          >
            <span className="h-px w-6 bg-[#cdbfaf] lg:w-8" />

            <span className="text-[9px] uppercase tracking-[0.28em] text-[#8f8176] lg:text-[10px] lg:tracking-[0.32em]">
              Collection
            </span>

            <span className="h-px w-6 bg-[#cdbfaf] lg:w-8" />
          </div>

          {/* CART */}

          <button
            type="button"
            aria-label="Shopping cart"
            onClick={() => setShowCart(true)}
            className="group flex h-10 items-center gap-2 rounded-full border border-transparent px-3 text-[9px] uppercase tracking-[0.14em] transition hover:border-[#4a443c] hover:bg-[#2d2924] sm:h-11 sm:gap-2.5 sm:px-4 sm:text-[10px]"
          >
            <ShoppingBag
              size={18}
              strokeWidth={1.4}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />

            <span className="hidden sm:inline">Cart</span>

            {cartCount > 0 && (
              <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#f1ebe2] px-1 text-[9px] text-[#171411]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-5 sm:pt-5 lg:px-7 lg:pt-7">
        <div
          className={`grid grid-cols-1 overflow-hidden bg-[#2a2622] ${
            isEditorPreview
              ? "@[600px]/ivory:grid-cols-2"
              : "lg:grid-cols-2"
          }`}
        >
          {/* HERO IMAGE */}

          <div
            className={`relative aspect-[1/1.08] overflow-hidden sm:aspect-[1/1] ${
              isEditorPreview
                ? "w-full min-h-[360px] @[600px]/ivory:aspect-auto @[600px]/ivory:min-h-[560px]"
                : "lg:aspect-auto lg:min-h-[560px] xl:min-h-[610px]"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={product._id || product.name}
                src={product.image}
                alt={product.name}
                initial={{
                  opacity: 0,
                  scale: 1.06,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.02,
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

            {/* INDEX */}

            <div className="absolute bottom-4 left-4 text-white sm:bottom-6 sm:left-6 lg:bottom-7 lg:left-7">
              <p className="text-[7px] uppercase tracking-[0.25em] text-white/65 sm:text-[8px] sm:tracking-[0.3em]">
                Selected piece
              </p>

              <p className="mt-1 font-serif text-lg sm:text-xl">
                {String(safeActive + 1).padStart(2, "0")}

                <span className="mx-1.5 text-white/40 sm:mx-2">
                  /
                </span>

                <span className="text-white/60">
                  {String(products.length).padStart(2, "0")}
                </span>
              </p>
            </div>

            {/* MOBILE CONTROLS */}

            <div className="absolute bottom-4 right-4 flex gap-1.5 sm:bottom-6 sm:right-6 lg:hidden">
              <button
                type="button"
                onClick={previous}
                aria-label="Previous product"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-md transition hover:bg-black/40 active:scale-95 sm:h-10 sm:w-10"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next product"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-md transition hover:bg-black/40 active:scale-95 sm:h-10 sm:w-10"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* HERO CONTENT */}

          <div
            className={`flex min-w-0 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12 ${
              isEditorPreview
                ? "w-full"
                : ""
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={product._id || product.name}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -12,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="max-w-lg"
              >
                {/* EYEBROW */}

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="h-px w-6 bg-[#b9a28f] sm:w-8" />

                  <p className="text-[7px] uppercase tracking-[0.3em] text-[#927e6f] sm:text-[8px] sm:tracking-[0.38em]">
                    Featured piece
                  </p>
                </div>

                {/* TITLE */}

                <h1 className="mt-4 break-words font-serif font-bold text-[32px] leading-[0.98] tracking-[-0.035em] sm:mt-5 sm:text-[42px] lg:text-[48px] xl:text-[58px]">
                  {product.name}
                </h1>

                {/* DESCRIPTION */}

                <p className="mt-4 max-w-lg text-[11px] leading-5 text-[#b8ada2] sm:mt-5 sm:text-[12px] sm:leading-6 lg:text-[13px]">
                  {product.description ||
                    "A carefully selected piece from our latest collection, designed with timeless elegance and refined craftsmanship."}
                </p>

                <div className="my-5 h-px w-full max-w-xs bg-[#4a443c] sm:my-7 sm:max-w-sm" />

                {/* PRICE */}

                <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
                  <span className="font-serif text-xl tracking-[-0.02em] sm:text-2xl">
                    ₹
                    {Number(product.price || 0).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  {product.mrp &&
                    Number(product.mrp) >
                      Number(product.price) && (
                      <>
                        <span className="pb-0.5 text-xs text-[#aaa098] line-through sm:text-sm">
                          ₹
                          {Number(product.mrp).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        {discount > 0 && (
                          <span className="rounded-full bg-[#f1ebe2] px-2.5 py-1 text-[7px] uppercase tracking-[0.1em] text-[#171411] sm:px-3 sm:py-1.5 sm:text-[8px]">
                            {discount}% Off
                          </span>
                        )}
                      </>
                    )}
                </div>

                {/* ACTIONS */}

                <div className="mt-5 grid max-w-md grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="flex h-11 items-center justify-center gap-2 bg-[#f1ebe2] px-4 text-[7px] font-medium uppercase tracking-[0.16em] text-[#171411] transition hover:bg-[#ddd4c9] active:scale-[0.99] sm:h-12 sm:text-[8px] sm:tracking-[0.2em]"
                  >
                    <ShoppingBag
                      size={14}
                      strokeWidth={1.5}
                    />

                    Add to selection
                  </button>

                  {catalog?.whatsapp && (
                    <button
                      type="button"
                      onClick={() => openWhatsApp(product)}
                      className="flex h-11 items-center justify-center gap-2 border border-[#25D366] bg-[#25D366] px-4 text-[7px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#20bd5a] active:scale-[0.99] sm:h-12 sm:text-[8px] sm:tracking-[0.2em]"
                    >
                      <MessageCircle
                        size={14}
                        strokeWidth={1.6}
                      />

                      WhatsApp
                    </button>
                  )}
                </div>

                {/* DESKTOP NAVIGATION */}

                <div className="mt-7 hidden items-center gap-3 lg:flex xl:mt-9">
                  <button
                    type="button"
                    onClick={previous}
                    aria-label="Previous product"
                    className="flex h-10 w-10 items-center justify-center border border-[#4a443c] transition hover:border-[#f1ebe2] hover:bg-[#f1ebe2] hover:text-[#171411]"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next product"
                    className="flex h-10 w-10 items-center justify-center border border-[#4a443c] transition hover:border-[#f1ebe2] hover:bg-[#f1ebe2] hover:text-[#171411]"
                  >
                    <ChevronRight size={14} />
                  </button>

                  <span className="ml-1 text-[7px] uppercase tracking-[0.25em] text-[#9a8877]">
                    Browse collection
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION INTRO
      ====================================================== */}

      <section className="mx-auto w-full max-w-6xl px-5 py-14 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
          }}
        >
          {catalog?.hero?.eyebrow && (
            <div className="mx-auto flex items-center justify-center gap-2.5 sm:gap-3">
              <span className="h-px w-6 bg-[#cdbfaf] sm:w-8" />

              <span className="text-[7px] uppercase tracking-[0.32em] text-[#9a8877] sm:text-[8px] sm:tracking-[0.4em]">
                {catalog.hero.eyebrow}
              </span>

              <span className="h-px w-6 bg-[#cdbfaf] sm:w-8" />
            </div>
          )}

          {catalog?.hero?.title && (
            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-[1.05] tracking-[-0.03em] sm:mt-5 sm:text-4xl lg:text-5xl">
              {catalog.hero.title}
            </h2>
          )}

          {catalog?.hero?.description && (
            <p className="mx-auto mt-4 max-w-lg text-[11px] leading-5 text-[#b8ada2] sm:mt-5 sm:text-xs sm:leading-6">
              {catalog.hero.description}
            </p>
          )}
        </motion.div>
      </section>

      {/* =====================================================
          PRODUCT COLLECTION
          MAX 2 COLUMNS
      ====================================================== */}

      <section className="border-y border-[#3a352f] bg-[#26221e]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* SECTION HEADER */}

          <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10 lg:mb-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a8877] sm:text-[11px] sm:tracking-[0.32em]">
                Discover
              </p>

              <h2 className="mt-2 font-serif text-2xl tracking-[-0.025em] sm:mt-3 sm:text-3xl lg:text-4xl">
                All pieces
              </h2>
            </div>

            <p className="hidden max-w-sm text-right text-[11px] leading-6 text-[#a89d92] sm:block sm:text-[12px]">
              A curated selection of signature pieces,
              thoughtfully presented.
            </p>
          </div>

          {/* =================================================
              2 COLUMNS ON PHONES, 4 ON WIDE SCREENS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-2
              gap-x-3
              gap-y-7

              sm:gap-x-5
              sm:gap-y-9

              @[820px]/ivory:grid-cols-4
              @[820px]/ivory:gap-x-5
              @[820px]/ivory:gap-y-10
            "
          >
            {pagedProducts.map((item, index) => (
              <motion.div
                key={item._id || `${item.name}-${index}`}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.08,
                }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index * 0.04, 0.2),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="min-w-0"
              >
                <CatalogProductCard
                  product={item}
                  onCardClick={(p) => setSelectedProduct(p)}
                  dark
                />
              </motion.div>
            ))}
          </div>

          {!isEditorPreview && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              className="text-[#f1ebe2]"
              activeClassName="bg-[#f1ebe2] text-[#171411]"
            />
          )}
        </div>
      </section>

      {/* =====================================================
          WHATSAPP / CART BAR
      ====================================================== */}

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 30,
            }}
            transition={{
              duration: 0.35,
            }}
            className={`sticky bottom-0 z-40 w-full border-t border-[#3a352f] bg-[#1f1c19]/95 shadow-[0_-12px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a8877] sm:text-[11px] sm:tracking-[0.2em]">
                  {cartCount}{" "}
                  {cartCount === 1 ? "item" : "items"} selected
                </p>

                <p className="mt-0.5 font-serif text-xl sm:mt-1 sm:text-2xl">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </p>
              </div>

              <button
                type="button"
                onClick={orderCartOnWhatsApp}
                className="flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#20bd5a] sm:min-h-[50px] sm:gap-2.5 sm:px-7 sm:text-[11px] sm:tracking-[0.14em]"
              >
                <MessageCircle size={13} />

                <span className="hidden xs:inline">
                  Order on WhatsApp
                </span>

                <span className="xs:hidden">Order</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#faf8f4] text-[#171411] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e6dfd6] px-5 py-5 sm:px-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#9a8877]">
                    Your selection
                  </p>
                  <h2 className="mt-1 font-serif text-3xl">
                    Cart
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7cec4]"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {cart.length === 0 ? (
                  <p className="py-16 text-center font-serif text-2xl text-[#756c64]">
                    Your cart is empty.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="border border-[#e6dfd6] bg-white/50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-serif text-xl">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-[#756c64]">
                              ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id)}
                            aria-label={`Remove ${item.name}`}
                            className="text-[#9a8877]"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border border-[#d7cec4]">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item._id)}
                              className="px-3 py-1.5 text-lg"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increaseQuantity(item._id)}
                              className="px-3 py-1.5 text-lg"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <p className="font-serif text-lg">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-[#e6dfd6] px-5 py-5 sm:px-7">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.14em] text-[#9a8877]">
                      Total
                    </span>
                    <span className="font-serif text-2xl">
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={orderCartOnWhatsApp}
                    className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold uppercase tracking-[0.12em] text-white"
                  >
                    <MessageCircle size={17} />
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

      <footer className="border-t border-[#3a352f] bg-[#171513]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:px-6 sm:py-10 lg:flex-row lg:px-8 lg:text-left">
          <div>
            <p className="font-serif text-xl tracking-[0.12em] sm:text-2xl sm:tracking-[0.14em]">
              {catalog?.companyName || "NOORÉ"}
            </p>

            <p className="mt-1.5 text-[9px] uppercase tracking-[0.22em] text-[#9a8877] sm:text-[10px] sm:tracking-[0.26em]">
              {tagline}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="h-px w-5 bg-[#cdbfaf] sm:w-6" />

            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a8877] sm:text-[11px] sm:tracking-[0.24em]">
              Curated with intention
            </p>

            <span className="h-px w-5 bg-[#cdbfaf] sm:w-6" />
          </div>
        </div>
      </footer>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        quantity={
          selectedProduct
            ? (cart.find((item) => item._id === selectedProduct._id)
                ?.quantity ?? 0)
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
    </main>
  );
}