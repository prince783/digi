"use client";

import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import CatalogProductCard from "../ui/CatalogProductCard";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

/* =========================================================
   TYPES
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

function cleanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/* =========================================================
   MAISON LUXE
========================================================= */

export default function MaisonLuxe({
  catalog = {},
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const [slide, setSlide] = useState(0);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
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

  const heroProducts = products.slice(0, 4);
  const hero = catalog?.hero;
  const companyName = catalog.companyName || "NOORÉ";
  const logo = catalog?.logo || "";

  /* =========================================================
     AUTO SLIDER
  ========================================================= */

  useEffect(() => {
    if (heroProducts.length <= 1) return;

    const timer = setInterval(() => {
      setSlide((current) =>
        current === heroProducts.length - 1
          ? 0
          : current + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const current = heroProducts[slide];

  /* =========================================================
     RESET SLIDE
  ========================================================= */

  useEffect(() => {
    if (slide >= heroProducts.length) {
      setSlide(0);
    }
  }, [heroProducts.length, slide]);

  /* =========================================================
     CART TOTALS
  ========================================================= */

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.product.price || 0) * item.quantity,
    0
  );

  /* =========================================================
     ADD TO CART
  ========================================================= */

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
    setShowCart(true);
  }

  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

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

  /* =========================================================
     DECREASE QUANTITY
  ========================================================= */

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

  /* =========================================================
     REMOVE FROM CART
  ========================================================= */

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product._id !== productId
      )
    );
  }

  /* =========================================================
     WHATSAPP ORDER
  ========================================================= */

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

    const companyName =
      catalog?.companyName || "Your Company";

    const catalogUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "";

    const orderLines = cart.map((item, index) => {
      const price = Number(
        item.product.price || 0
      );

      const total =
        price * item.quantity;

      return `${index + 1}. ${item.product.name}
Qty: ${item.quantity}
Price: ₹${formatPrice(price)}
Total: ₹${formatPrice(total)}`;
    });

    const message = [
      `🛍️ *New Order Request*`,
      ``,
      `*Catalog:* ${companyName}`,
      ``,
      `*Products:*`,
      ...orderLines,
      ``,
      `*Grand Total: ₹${formatPrice(cartTotal)}*`,
      ``,
      catalogUrl
        ? `Catalog: ${catalogUrl}`
        : "",
      ``,
      `Please confirm the availability and order details.`,
    ]
      .filter(Boolean)
      .join("\n");

    const phone = cleanPhone(
      whatsappNumber
    );

    if (!phone) {
      alert(
        "Invalid WhatsApp number."
      );
      setOrdering(false);
      return;
    }

    const whatsappUrl =
      `https://wa.me/${phone}?text=` +
      encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }

    setOrdering(false);
  }

  /* =========================================================
     NO HERO PRODUCT
  ========================================================= */

  if (!current) {
    return (
      <main
        data-public={!isEditorPreview ? "true" : undefined}
        className="
          maison-luxe
          @container
          relative
          relative
          min-h-screen
          w-full
          min-w-0
          bg-[#f8f4ed]
          text-[#211a16]
        "
      >
        {!isEditorPreview && (
          <style jsx global>{`
            [data-public="true"] [class*="text-[5px]"] { font-size: 8px; }
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
            [data-public="true"] [class*=":text-sm"] { font-size: 1rem; }
            [data-public="true"] [class~="text-base"],
            [data-public="true"] [class*=":text-base"] { font-size: 1.0625rem; }
            [data-public="true"] [class*="line-clamp-2"] {
              -webkit-line-clamp: 3;
              line-clamp: 3;
            }
            [data-public="true"] p[class*="text-[11px]"] {
              min-height: 4.5rem;
              line-height: 1.5rem;
            }
          `}</style>
        )}
        <div className="flex min-h-[300px] items-center justify-center px-5 text-center">
          <div>
            <ShoppingBag
              size={32}
              className="mx-auto mb-3 text-[#9a806e]"
            />

            <h2 className="font-serif text-2xl">
              No products available
            </h2>

            <p className="mt-2 text-sm text-[#776d65]">
              Products will appear here once they are added.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className="
        maison-luxe
        @container
        min-h-screen
        w-full
        min-w-0
        bg-[#f8f4ed]
        text-[#211a16]
      "
    >
      {!isEditorPreview && (
        <style jsx global>{`
          [data-public="true"] [class*="text-[5px]"] { font-size: 8px; }
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
          [data-public="true"] [class*=":text-sm"] { font-size: 1rem; }
          [data-public="true"] [class~="text-base"],
          [data-public="true"] [class*=":text-base"] { font-size: 1.0625rem; }
          [data-public="true"] [class*="line-clamp-2"] {
            -webkit-line-clamp: 3;
            line-clamp: 3;
          }
          [data-public="true"] p[class*="text-[11px]"] {
            min-height: 4.5rem;
            line-height: 1.5rem;
          }
        `}</style>
      )}
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          w-full
          border-b
          border-[#e5ddd2]
          bg-[#f8f4ed]/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[58px]
            w-full
            max-w-[1500px]
            min-w-0
            items-center
            justify-between
            gap-2
            px-3

            @[480px]:min-h-[64px]
            @[480px]:px-4

            @[640px]:min-h-[70px]
            @[640px]:px-6

            @[900px]:min-h-[78px]
            @[900px]:px-8

            @[1200px]:px-10
            @[1400px]:px-12
          "
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <div className="min-w-0 flex-1">
            {logo ? (
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt={companyName}
                  className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
                />
                <div
                  className="
                    max-w-full
                    break-words [overflow-wrap:anywhere] line-clamp-2
                    font-serif
                    text-[16px]
                    leading-tight
                    tracking-[0.12em]
                    text-[#641b2c]

                    @[400px]:text-[18px]

                    @[640px]:text-[21px]

                    @[900px]:text-2xl
                    @[900px]:tracking-[0.2em]
                  "
                >
                  {companyName}
                </div>
              </div>
            ) : (
              <div
                className="
                  max-w-full
                  break-words [overflow-wrap:anywhere] line-clamp-2
                  font-serif
                  text-[16px]
                  leading-tight
                  tracking-[0.12em]
                  text-[#641b2c]

                  @[400px]:text-[18px]

                  @[640px]:text-[21px]

                  @[900px]:text-2xl
                  @[900px]:tracking-[0.2em]
                "
              >
                {companyName}
              </div>
            )}

            <p
              className="
                mt-1
                truncate
                text-[5px]
                tracking-[0.25em]
                text-[#9a8575]

                @[480px]:text-[7px]
                @[480px]:tracking-[0.35em]

                @[900px]:text-[8px]
                @[900px]:tracking-[0.4em]
              "
            >
              {catalog?.tagline?.trim() || "JEWELLERY"}
            </p>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav
            className="
              hidden
            "
          >
            <button
              type="button"
              className="transition-colors hover:text-[#641b2c]"
            >
              Home
            </button>

            <button
              type="button"
              className="font-medium text-[#641b2c]"
            >
              Collection
            </button>

            <button
              type="button"
              className="transition-colors hover:text-[#641b2c]"
            >
              New Arrivals
            </button>

            <button
              type="button"
              className="transition-colors hover:text-[#641b2c]"
            >
              Best Sellers
            </button>

            <button
              type="button"
              className="transition-colors hover:text-[#641b2c]"
            >
              About
            </button>
          </nav>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1

              @[480px]:gap-2
              @[640px]:gap-3
            "
          >
            {/* SEARCH */}

            <button
              type="button"
              aria-label="Search"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                transition
                hover:bg-black/5

                @[480px]:h-9
                @[480px]:w-9
              "
            >
              <span className="text-lg leading-none">
                ⌕
              </span>
            </button>

            {/* BAG */}

            <button
              type="button"
              aria-label="Shopping bag"
              onClick={() => setShowCart(true)}
              className="
                relative
                flex
                min-h-8
                items-center
                justify-center
                rounded-full
                border
                border-[#d8cfc4]
                px-2.5
                py-1.5
                text-[11px]
                uppercase
                tracking-[0.1em]
                transition
                hover:border-[#641b2c]
                hover:text-[#641b2c]

                @[480px]:px-3
                @[480px]:text-[12px]

                @[640px]:px-4
                @[640px]:text-[13px]
              "
            >
              Bag

              {(cartCount > 0 || isEditorPreview) && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    size-4
                    items-center
                    justify-center
                    rounded-full
                    bg-[#641b2c]
                    text-[9px]
                    font-bold
                    text-white

                    @[480px]:size-5
                    @[480px]:text-[10px]
                  "
                >
                  {cartCount > 9
                    ? "9+"
                    : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-2
          pt-2

          @[480px]:px-3
          @[480px]:pt-3

          @[640px]:px-5
          @[640px]:pt-5

          @[900px]:px-7
          @[900px]:pt-6

          @[1200px]:px-9

          @[1400px]:px-10
        "
      >
        <div
          className="
            relative
            min-h-[300px]
            w-full
            min-w-0
            overflow-hidden
            rounded-[12px]

            @[360px]:min-h-[320px]

            @[480px]:min-h-[370px]
            @[480px]:rounded-[16px]

            @[640px]:min-h-[450px]
            @[640px]:rounded-[20px]

            @[900px]:min-h-[530px]
            @[900px]:rounded-[24px]

            @[1200px]:min-h-[600px]
            @[1200px]:rounded-[28px]

            @[1400px]:min-h-[640px]
          "
        >
          {/* =================================================
              HERO IMAGE
          ================================================= */}

          <AnimatePresence mode="wait">
            <motion.img
              key={hero?.image || current?._id || "maison-hero"}
              src={
                hero?.image ||
                current?.image ||
                "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1400"
              }
              alt={hero?.title || current?.name || "Luxury collection"}
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
              }}
              transition={{
                duration: 1.1,
                ease: "easeOut",
              }}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
              "
            />
          </AnimatePresence>

          {/* =================================================
              OVERLAY
          ================================================= */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/80
              via-black/30
              to-black/5
            "
          />

          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-10
              flex
              max-w-2xl
              flex-col
              items-start
              p-4
              pb-[58px]
              text-white

              @[480px]:p-6
              @[480px]:pb-[70px]

              @[640px]:p-8
              @[640px]:pb-[82px]

              @[900px]:p-10
              @[900px]:pb-[92px]

              @[1200px]:p-14
              @[1200px]:pb-[105px]

              @[1400px]:p-16
              @[1400px]:pb-[110px]
            "
          >
            {hero?.eyebrow && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  text-[7px]
                  uppercase
                  tracking-[0.25em]
                  text-white/75

                  @[480px]:text-[8px]

                  @[640px]:text-[9px]
                  @[640px]:tracking-[0.35em]

                  @[900px]:text-[10px]
                  @[900px]:tracking-[0.4em]
                "
              >
                {hero.eyebrow}
              </motion.p>
            )}

            {hero?.title && (
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                  duration: 0.6,
                }}
                className="
                  mt-2
                  max-w-[220px]
                  font-serif
                  text-[29px]
                  leading-[0.94]
                  tracking-[-0.025em]

                  @[360px]:text-[32px]

                  @[480px]:mt-3
                  @[480px]:max-w-[300px]
                  @[480px]:text-[38px]

                  @[640px]:max-w-[380px]
                  @[640px]:text-[48px]

                  @[900px]:text-[58px]

                  @[1200px]:text-[68px]

                  @[1400px]:text-[78px]
                "
              >
                {hero.title}
              </motion.h1>
            )}

            {hero?.description && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.5,
                }}
                className="
                  mt-3
                  max-w-[280px]
                  text-[9px]
                  leading-4
                  text-white/80

                  @[480px]:max-w-[360px]
                  @[480px]:text-[10px]
                  @[480px]:leading-5

                  @[640px]:mt-4
                  @[640px]:max-w-[440px]
                  @[640px]:text-xs

                  @[900px]:max-w-[520px]
                  @[900px]:text-sm
                "
              >
                {hero.description}
              </motion.p>
            )}

            <motion.button
              type="button"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
              }}
              onClick={() =>
                document
                  .getElementById(
                    "maison-products"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="
                mt-4
                flex
                min-h-[44px]
                items-center
                gap-2
                border-b
                border-white
                pb-1
                text-[7px]
                uppercase
                tracking-[0.14em]
                transition-all
                hover:gap-4

                @[480px]:mt-5
                @[480px]:text-[8px]

                @[640px]:mt-6
                @[640px]:text-[10px]

                @[900px]:min-h-[36px]
                @[900px]:text-xs
              "
            >
              Discover collection

              <ArrowRight
                size={13}
                strokeWidth={1.5}
              />
            </motion.button>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section
        className="hidden"
      >
        <p
          className="
            text-[7px]
            uppercase
            tracking-[0.25em]
            text-[#9a806e]

            @[480px]:text-[8px]

            @[640px]:text-[9px]
            @[640px]:tracking-[0.35em]

            @[900px]:text-[10px]
            @[900px]:tracking-[0.4em]
          "
        >
          Our philosophy
        </p>

        <h2
          className="
            mt-3
            font-serif
            text-[28px]
            leading-[1.03]
            tracking-[-0.025em]

            @[480px]:mt-4
            @[480px]:text-[32px]

            @[640px]:mt-5
            @[640px]:text-[38px]

            @[900px]:text-5xl
          "
        >
          Quiet luxury.
          <br />
          Made personal.
        </h2>

        <p
          className="
            mx-auto
            mt-4
            max-w-xl
            text-[11px]
            leading-5
            text-[#776d65]

            @[480px]:mt-5
            @[480px]:text-[12px]

            @[640px]:mt-6
            @[640px]:text-[13px]
            @[640px]:leading-6

            @[900px]:text-sm
            @[900px]:leading-7
          "
        >
          {catalog.description ||
            "Thoughtfully selected pieces designed to become part of your everyday story."}
        </p>
      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section
        id="maison-products"
        className="
          mx-auto
          w-full
          max-w-[1500px]
          min-w-0
          px-2.5
          pt-10
          pb-16

          @[480px]:px-3
          @[480px]:pt-12
          @[480px]:pb-18

          @[640px]:px-5
          @[640px]:pt-16
          @[640px]:pb-22

          @[900px]:px-7
          @[900px]:pt-20
          @[900px]:pb-26

          @[1200px]:px-9
          @[1200px]:pt-24
          @[1200px]:pb-28

          @[1400px]:px-10
        "
      >
        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div
          className="
            mb-5
            flex
            items-end
            justify-between
            gap-2

            @[480px]:mb-6

            @[640px]:mb-8

            @[900px]:mb-10
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[7px]
                uppercase
                tracking-[0.25em]
                text-[#9a806e]

                @[480px]:text-[8px]

                @[640px]:text-[9px]
                @[640px]:tracking-[0.35em]

                @[900px]:text-[10px]
              "
            >
              Selected pieces
            </p>

            <h2
              className="
                mt-1
                truncate
                font-serif
                text-[24px]
                leading-none
                tracking-[-0.02em]

                @[400px]:text-[27px]

                @[480px]:mt-1.5
                @[480px]:text-[30px]

                @[640px]:text-[34px]

                @[900px]:text-4xl
              "
            >
              The collection
            </h2>
          </div>

          <span
            className="
              shrink-0
              pb-0.5
              text-[8px]
              text-[#897b70]

              @[480px]:text-[9px]

              @[640px]:text-xs
            "
          >
            {products.length} pieces
          </span>
        </div>

        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        <div
          className="
            grid
            w-full
            min-w-0
            grid-cols-2
            gap-x-3
            gap-y-6

            @[480px]:gap-x-3
            @[480px]:gap-y-8

            @[640px]:grid-cols-3
            @[640px]:gap-x-4
            @[640px]:gap-y-10

            @[900px]:grid-cols-4
            @[900px]:gap-x-5
            @[900px]:gap-y-12

            @[1200px]:gap-x-6
            @[1200px]:gap-y-14

            @[1400px]:gap-x-7
          "
        >
          {pagedProducts.map((product) => {
            return (
              <div
                key={product._id}
                className="
                  min-w-0
                  w-full
                  max-w-full
                  overflow-hidden
                "
              >
                {/* Product Card */}

                <CatalogProductCard
                  product={product}
                  onCardClick={(p) => setSelectedProduct(p)}
                />

              </div>
            );
          })}
        </div>

        {!isEditorPreview && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            className="text-[#18130f]"
          />
        )}
      </section>

      {/* =====================================================
          BOTTOM CART BAR
      ===================================================== */}

      {cartCount > 0 && (
        <div
          className={`
            ${
              isEditorPreview
                ? "sticky bottom-0 left-0 right-0"
                : "sticky bottom-0"
            }
            z-40
            w-full
            px-2.5
            pb-2.5
            pt-2

            @[480px]:px-3
            @[480px]:pb-3

            @[640px]:px-5
            @[640px]:pb-5

            @[900px]:px-7
          `}
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1500px]
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-[#e5ddd2]
                bg-[#f8f4ed]/95
                p-2
                shadow-[0_10px_40px_rgba(0,0,0,0.16)]
                backdrop-blur-xl

                @[640px]:rounded-[22px]
                @[640px]:p-3
              "
            >
              {/* Cart Summary */}

              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-2
                  rounded-xl
                  px-2
                  py-2
                  text-left

                  @[640px]:px-4
                  @[640px]:py-3
                "
              >
                <div
                  className="
                    relative
                    flex
                    size-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#eadfe1]
                    text-[#641b2c]

                    @[640px]:size-12
                  "
                >
                  <ShoppingBag
                    size={16}
                    className="@[640px]:hidden"
                  />

                  <ShoppingBag
                    size={20}
                    className="hidden @[640px]:block"
                  />

                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      size-4
                      items-center
                      justify-center
                      rounded-full
                      bg-[#641b2c]
                      text-[7px]
                      font-bold
                      text-white

                      @[640px]:size-5
                      @[640px]:text-[9px]
                    "
                  >
                    {cartCount > 9
                      ? "9+"
                      : cartCount}
                  </span>
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[12px]
                      font-bold
                      text-[#211a16]

                      @[640px]:text-base
                    "
                  >
                    Your Bag
                  </p>

                  <p
                    className="
                      truncate
                      text-[15px]
                      text-[#897b70]

                      @[640px]:text-sm
                    "
                  >
                    {cartCount}{" "}
                    {cartCount === 1
                      ? "item"
                      : "items"}{" "}
                    • ₹
                    {formatPrice(cartTotal)}
                  </p>
                </div>
              </button>

              {/* WhatsApp */}

              <button
                type="button"
                onClick={sendToWhatsApp}
                disabled={ordering}
                className="
                  shrink-0
                  rounded-xl
                  bg-[#29a85c]
                  px-3.5
                  py-3
                  text-[14px]
                  font-bold
                  text-white
                  transition
                  hover:bg-[#23934f]
                  disabled:opacity-60

                  @[480px]:px-5

                  @[640px]:px-7
                  @[640px]:py-4
                  @[640px]:text-base
                "
              >
                {ordering
                  ? "Opening..."
                  : "Order on WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CART DRAWER
      ===================================================== */}

      {showCart && (
        <div
          className={`${
            isEditorPreview ? "absolute" : "fixed"
          } inset-0 z-[100]`}
        >
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setShowCart(false)}
            className="
              absolute
              inset-0
              bg-black/45
              backdrop-blur-[2px]
            "
          />

          {/* Drawer */}

          <div
            className="
              absolute
              bottom-0
              left-1/2
              flex
              max-h-[84vh]
              w-full
              max-w-[560px]
              -translate-x-1/2
              flex-col
              overflow-hidden
              rounded-t-[28px]
              bg-[#f8f4ed]
              shadow-2xl
            "
          >
            {/* =================================================
                CART HEADER
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#e5ddd2]
                bg-white
                px-5
                py-4
              "
            >
              <div>
                <h2
                  className="
                    font-serif
                    text-2xl
                    font-medium
                    text-[#211a16]
                  "
                >
                  Your Bag
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[12px]
                    text-[#897b70]
                  "
                >
                  {cartCount}{" "}
                  {cartCount === 1
                    ? "item"
                    : "items"}{" "}
                  selected
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="
                  flex
                  size-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f3eee8]
                  text-[#211a16]
                  transition
                  hover:bg-[#eadfe1]
                "
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            {/* =================================================
                CART ITEMS
            ================================================= */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                px-4
                py-4
              "
            >
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag
                    size={30}
                    className="
                      mx-auto
                      mb-3
                      text-[#c8b9ad]
                    "
                  />

                  <p
                    className="
                      font-serif
                      text-lg
                      font-medium
                    "
                  >
                    Your bag is empty
                  </p>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      text-[#897b70]
                    "
                  >
                    Add products to continue.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const product =
                      item.product;

                    const itemTotal =
                      Number(
                        product.price || 0
                      ) * item.quantity;

                    return (
                      <div
                        key={product._id}
                        className="
                          flex
                          gap-3
                          rounded-xl
                          border
                          border-[#e5ddd2]
                          bg-white
                          p-3
                        "
                      >
                        {/* Image */}

                        <div
                          className="
                            size-[70px]
                            shrink-0
                            overflow-hidden
                            rounded-lg
                            bg-[#f1ece6]
                          "
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        </div>

                        {/* Details */}

                        <div className="min-w-0 flex-1">
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-2
                            "
                          >
                            <div className="min-w-0">
                              <h3
                                className="
                                  truncate
                                  text-[15px]
                                  font-bold
                                  text-[#211a16]
                                "
                              >
                                {product.name}
                              </h3>

                              <p
                                className="
                                  mt-0.5
                                  text-[15px]
                                  text-[#897b70]
                                "
                              >
                                ₹
                                {formatPrice(
                                  product.price
                                )}{" "}
                                each
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  product._id
                                )
                              }
                              className="
                                flex
                                size-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                text-red-400
                                transition
                                hover:bg-red-50
                              "
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2
                                size={13}
                              />
                            </button>
                          </div>

                          <div
                            className="
                              mt-2
                              flex
                              items-center
                              justify-between
                            "
                          >
                            {/* Quantity */}

                            <div
                              className="
                                flex
                                items-center
                                rounded-lg
                                border
                                border-[#e5ddd2]
                                bg-[#f8f4ed]
                              "
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    product._id
                                  )
                                }
                                className="
                                  flex
                                  size-7
                                  items-center
                                  justify-center
                                  text-[#641b2c]
                                "
                              >
                                <Minus
                                  size={10}
                                />
                              </button>

                              <span
                                className="
                                  w-6
                                  text-center
                                  text-[9px]
                                  font-bold
                                "
                              >
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    product._id
                                  )
                                }
                                className="
                                  flex
                                  size-7
                                  items-center
                                  justify-center
                                  text-[#641b2c]
                                "
                              >
                                <Plus
                                  size={10}
                                />
                              </button>
                            </div>

                            {/* Total */}

                            <span
                              className="
                                text-sm
                                font-black
                                text-[#641b2c]
                              "
                            >
                              ₹
                              {formatPrice(
                                itemTotal
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =================================================
                CART FOOTER
            ================================================= */}

            {cart.length > 0 && (
              <div
                className="
                  border-t
                  border-[#e5ddd2]
                  bg-white
                  px-5
                  pb-5
                  pt-4
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-[10px]
                      text-[#897b70]
                    "
                  >
                    Grand Total
                  </span>

                  <span
                    className="
                      font-serif
                      text-xl
                      font-bold
                      text-[#641b2c]
                    "
                  >
                    ₹
                    {formatPrice(
                      cartTotal
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={ordering}
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#29a85c]
                    text-[10px]
                    font-bold
                    text-white
                    transition
                    hover:bg-[#23934f]
                    disabled:opacity-60
                  "
                >
                  <ShoppingBag size={15} />

                  {ordering
                    ? "Opening WhatsApp..."
                    : "Order on WhatsApp"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          FOOTER SPACE
      ===================================================== */}

      <div className="h-4 @[640px]:h-8" />

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
    </main>
  );
}