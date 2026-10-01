"use client";

import { useEffect, useMemo, useState } from "react";

import {
  buildCatalogPublicUrl,
  resolveConfiguredBaseUrl,
} from "@/lib/publicUrl";

import {
  ArrowRight,
  ArrowUpRight,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { getDiscount } from "@/lib/catalogDummyData";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

/* =========================================================
   TYPES
========================================================= */

type CartItem = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  mrp: number;
  quantity: number;
};

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function cleanPhone(value?: string) {
  if (!value) return "";

  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

/*
  Creates the luxury 2-line hero structure.

  Example:

  Better Products
      Better Living
*/
function getHeroLines(title?: string) {
  if (!title) {
    return { first: "", second: "" };
  }

  const words = title
    .replace(/[.,!?;:]+/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 2) {
    return {
      first: words.join(" "),
      second: "",
    };
  }

  return {
    first: words.slice(0, 2).join(" "),
    second: words.slice(2).join(" "),
  };
}

/* =========================================================
   ANIMATIONS
========================================================= */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.985,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

/* =========================================================
   TEMPLATE
========================================================= */

export default function ModernGridTemplate({
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

  const hero = catalog?.hero;
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Curated everyday essentials";

  const heroLines = useMemo(
    () => getHeroLines(hero?.title),
    [hero?.title]
  );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const searchText = query.toLowerCase().trim();

    if (!searchText) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchText) ||
        product.description
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [products, query]);

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
     CART
  ======================================================= */

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + Number(item.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  /* =======================================================
     ADD
  ======================================================= */

  const addToCart = (product: any) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item._id === product._id
      );

      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          _id: product._id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: Number(product.price || 0),
          mrp: Number(product.mrp || 0),
          quantity: 1,
        },
      ];
    });
  };

  /* =======================================================
     QUANTITY
  ======================================================= */

  const increaseQuantity = (id: string) => {
    setCart((current) =>
      current.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCart((current) =>
      current
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) =>
      current.filter((item) => item._id !== id)
    );
  };

  /* =======================================================
     WHATSAPP
  ======================================================= */

  const sendToWhatsApp = () => {
    if (!cart.length) {
      setShowCart(true);
      return;
    }

    const phone = cleanPhone(
      catalog?.whatsapp || catalog?.phone
    );

    if (!phone) {
      alert(
        "WhatsApp number is not available for this catalog."
      );
      return;
    }

    setOrdering(true);

    let message = `Hello ${
      catalog?.companyName || "there"
    },\n\n`;

    message +=
      "I would like to order the following products:\n\n";

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `Quantity: ${item.quantity}\n`;
      message += `Price: ${formatPrice(item.price)}\n`;
      message += `Amount: ${formatPrice(
        item.price * item.quantity
      )}\n\n`;
    });

    message += `Total: ${formatPrice(cartTotal)}\n\n`;

    if (catalog?.username) {
      message += `Catalog: ${buildCatalogPublicUrl(
        catalog.username,
        resolveConfiguredBaseUrl(window.location.origin),
      )}\n\n`;
    } else {
      message += `Catalog: ${window.location.href}\n\n`;
    }

    message +=
      "Please confirm availability and delivery details.";

    const whatsappUrl =
      `https://wa.me/${phone}?text=` +
      encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      // Mobile browsers frequently block window.open() with a
      // non-empty features string, treating it as an unwanted
      // popup. Navigating directly always reaches the wa.me
      // redirect (it opens the WhatsApp app or web.whatsapp.com).
      window.location.href = whatsappUrl;
    } else {
      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }

    setTimeout(() => {
      setOrdering(false);
    }, 1000);
  };

  /* =======================================================
     SCROLL
  ======================================================= */

  const scrollToProducts = () => {
    document
      .getElementById("modern-grid-products")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =======================================================
     COMPONENT
  ======================================================= */

  return (
    <div
      className={`@container/modern relative isolate min-h-full w-full overflow-hidden bg-[#f4f1eb] text-[#171614] selection:bg-[#171614] selection:text-white ${
        isEditorPreview ? "" : "modern-grid-catalog-preview"
      }`}
    >
      {!isEditorPreview && (
        <style>{`
          .modern-grid-catalog-preview [class*="text-[5px]"] { font-size: 8px; }
          .modern-grid-catalog-preview [class*="text-[6px]"] { font-size: 9px; }
          .modern-grid-catalog-preview [class*="text-[7px]"] { font-size: 10px; }
          .modern-grid-catalog-preview [class*="text-[8px]"] { font-size: 11px; }
          .modern-grid-catalog-preview [class*="text-[9px]"] { font-size: 12px; }
          .modern-grid-catalog-preview [class*="text-[10px]"] { font-size: 13px; }
          .modern-grid-catalog-preview [class*="text-[11px]"] { font-size: 14px; }
          .modern-grid-catalog-preview [class*="text-[13px]"] { font-size: 16px; }
          .modern-grid-catalog-preview [class~="text-xs"],
          .modern-grid-catalog-preview [class*=":text-xs"] { font-size: 0.9375rem; }
          .modern-grid-catalog-preview [class~="text-sm"],
          .modern-grid-catalog-preview [class*=":text-sm"] { font-size: 1.0625rem; }
          .modern-grid-catalog-preview [class~="text-lg"],
          .modern-grid-catalog-preview [class*=":text-lg"] { font-size: 1.3125rem; }
          .modern-grid-catalog-preview [class~="text-xl"],
          .modern-grid-catalog-preview [class*=":text-xl"] { font-size: 1.4375rem; }
          .modern-grid-catalog-preview [class~="text-2xl"],
          .modern-grid-catalog-preview [class*=":text-2xl"] { font-size: 1.875rem; }
        `}</style>
      )}

      {/* =====================================================
          TOP ACCENT LINE
      ====================================================== */}

      <div className="absolute left-0 right-0 top-0 z-[60] h-px bg-gradient-to-r from-transparent via-[#a78b5b]/60 to-transparent" />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-black/[0.055]
          bg-[#f4f1eb]/90
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[58px]
            w-full
            max-w-7xl
            items-center
            justify-between
            px-3

            @[600px]/modern:h-[62px]
            @[600px]/modern:px-5

            @[1000px]/modern:h-[68px]
            @[1000px]/modern:px-8
          "
        >
          {/* BRAND */}

          <motion.div
            initial={{
              opacity: 0,
              x: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="min-w-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="
                  flex
                  size-9
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-[#b8955b]/30
                  bg-[#ebe3d5]
                  text-[#866d45]

                  @[600px]/modern:size-10
                "
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={catalog?.companyName || "DailyMart"}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Sparkles size={11} />
                )}
              </span>

              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]

                    @[600px]/modern:text-[13px]
                  "
                >
                  {catalog?.companyName || "DailyMart"}
                </h1>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[8px]
                    uppercase
                    tracking-[0.18em]
                    text-[#948d82]

                    @[600px]/modern:text-[9px]
                  "
                >
                  {tagline}
                </p>
              </div>
            </div>
          </motion.div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={scrollToProducts}
              whileTap={{ scale: 0.94 }}
              className="
                hidden
                rounded-full
                border
                border-black/[0.07]
                bg-white/70
                px-4
                py-2
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-[#686259]

                @[700px]/modern:flex
              "
            >
              Shop collection
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setShowCart((value) => !value)}
              whileTap={{ scale: 0.9 }}
              className="
                relative
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#171614]
                text-white
                shadow-[0_8px_22px_rgba(0,0,0,0.15)]

                @[600px]/modern:size-9
              "
            >
              <ShoppingBag size={13} />

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                    }}
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      size-4
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-[#f4f1eb]
                      bg-[#ad8b54]
                      text-[6px]
                      font-bold
                      text-white
                    "
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </header>

      {/* =====================================================
          CART PANEL

          IMPORTANT:
          This is ABSOLUTE INSIDE THE TEMPLATE ROOT.
          It will NOT escape the editor preview.
      ====================================================== */}

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="
              absolute
              right-2
              top-[64px]
              z-[45]
              w-[calc(100%-16px)]
              max-w-[390px]
              overflow-hidden
              rounded-[20px]
              border
              border-black/[0.07]
              bg-[#faf8f4]
              shadow-[0_25px_70px_rgba(0,0,0,0.18)]

              @[600px]/modern:right-5
              @[600px]/modern:top-[70px]

              @[1000px]/modern:right-8
            "
          >
            {/* CART HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-black/[0.06]
                bg-white
                px-4
                py-3
              "
            >
              <div>
                <p className="text-[6px] font-semibold uppercase tracking-[0.22em] text-[#a1988b]">
                  Your selection
                </p>

                <h3 className="mt-0.5 text-sm font-bold tracking-[-0.03em]">
                  Shopping Cart
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="
                  flex
                  size-7
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f1eee8]
                  text-[#686259]
                "
              >
                <X size={12} />
              </button>
            </div>

            {/* CART CONTENT */}

            <div className="max-h-[45vh] overflow-y-auto px-4 py-3">
              {cart.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#eeeae2]">
                    <ShoppingBag
                      size={18}
                      className="text-[#aaa196]"
                    />
                  </div>

                  <p className="mt-3 text-xs font-semibold">
                    Your cart is empty
                  </p>

                  <p className="mt-1 text-[8px] text-[#999188]">
                    Add something beautiful.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <motion.div
                      layout
                      key={item._id}
                      className="
                        flex
                        gap-2.5
                        border-b
                        border-black/[0.05]
                        pb-3
                      "
                    >
                      {/* IMAGE */}

                      <div
                        className="
                          size-14
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          bg-[#ebe8e1]
                        "
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[7px] text-[#aaa196]">
                            No image
                          </div>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <h4 className="truncate text-[9px] font-semibold">
                            {item.name}
                          </h4>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item._id)
                            }
                            className="shrink-0 text-[#aaa196]"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>

                        <p className="mt-0.5 text-[8px] text-[#8e887e]">
                          {formatPrice(item.price)}
                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            w-fit
                            items-center
                            overflow-hidden
                            rounded-full
                            border
                            border-black/[0.07]
                            bg-white
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item._id)
                            }
                            className="flex size-6 items-center justify-center"
                          >
                            <Minus size={9} />
                          </button>

                          <span className="w-6 text-center text-[8px] font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item._id)
                            }
                            className="flex size-6 items-center justify-center"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      </div>

                      <div className="shrink-0 self-center text-right">
                        <p className="text-[9px] font-bold">
                          {formatPrice(
                            item.price * item.quantity
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* CART FOOTER */}

            {cart.length > 0 && (
              <div className="border-t border-black/[0.06] bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.15em] text-[#a0998f]">
                      Total
                    </p>

                    <p className="mt-0.5 text-lg font-black tracking-[-0.04em]">
                      {formatPrice(cartTotal)}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#f1eee8] px-2.5 py-1 text-[7px] font-semibold text-[#777168]">
                    {cartCount}{" "}
                    {cartCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={ordering}
                  className="
                    mt-3
                    flex
                    h-9
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    rounded-xl
                    bg-[#278f52]
                    text-[8px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#207b45]
                    disabled:opacity-50
                  "
                >
                  <MessageCircle size={12} />

                  {ordering
                    ? "Opening WhatsApp..."
                    : "Order on WhatsApp"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto w-full max-w-7xl">
        {/* ===================================================
            HERO
        ==================================================== */}

        <section
          className="
            px-3
            pb-3
            pt-3

            @[600px]/modern:px-5
            @[600px]/modern:pt-5

            @[1000px]/modern:px-8
            @[1000px]/modern:pt-7
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              group
              relative
              min-h-[255px]
              overflow-hidden
              rounded-[22px]
              border
              border-black/[0.055]
              bg-[#e6dfd2]
              shadow-[0_15px_50px_rgba(0,0,0,0.065)]

              @[600px]/modern:min-h-[290px]
              @[600px]/modern:rounded-[26px]

              @[1000px]/modern:min-h-[340px]
              @[1000px]/modern:rounded-[30px]
            "
          >
            {/* HERO IMAGE */}

            {hero?.image && (
              <motion.img
                src={hero.image}
                alt=""
                aria-hidden="true"
                initial={{
                  scale: 1.08,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  opacity-90
                  transition-transform
                  duration-[1400ms]
                  group-hover:scale-[1.035]
                "
              />
            )}

            {/* LUXURY OVERLAY */}

            <div
              className={`absolute inset-0 bg-gradient-to-r from-[#e6dfd2]/95 via-[#e6dfd2]/80 to-[#e6dfd2]/35 ${
                hero?.image ? "opacity-40" : ""
              }`}
            />

            {/* GRAIN */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-[0.055]
                [background-image:radial-gradient(#000_0.55px,transparent_0.55px)]
                [background-size:5px_5px]
              "
            />

            {/* CIRCLES */}

            <motion.div
              animate={{
                rotate: [0, 8, 0],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute
                -right-20
                -top-28
                size-56
                rounded-full
                border
                border-[#8e744b]/10

                @[600px]/modern:size-72
              "
            />

            <motion.div
              animate={{
                x: [0, 12, 0],
                y: [0, -8, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute
                bottom-[-90px]
                right-[18%]
                size-48
                rounded-full
                border
                border-black/[0.045]

                @[600px]/modern:size-60
              "
            />

            {/* CONTENT */}

            <div
              className="
                relative
                z-10
                flex
                min-h-[255px]
                flex-col
                justify-center
                px-5
                py-7

                @[600px]/modern:min-h-[290px]
                @[600px]/modern:px-8

                @[1000px]/modern:min-h-[340px]
                @[1000px]/modern:px-11
              "
            >
              {/* EYEBROW */}

              {hero?.eyebrow && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.15,
                    duration: 0.5,
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="h-px w-6 bg-[#a38657]" />

                  <p
                    className="
                      text-[6px]
                      font-bold
                      uppercase
                      tracking-[0.3em]
                      text-[#856b43]

                      @[600px]/modern:text-[7px]
                    "
                  >
                    {hero.eyebrow}
                  </p>
                </motion.div>
              )}

              {/* HERO TITLE */}

              {hero?.title && (
                <motion.h2
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.22,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    mt-3
                    max-w-[320px]
                    text-[38px]
                    font-black
                    leading-[0.9]
                    tracking-[-0.055em]

                    @[600px]/modern:max-w-xl
                    @[600px]/modern:text-[48px]

                    @[1000px]/modern:max-w-2xl
                    @[1000px]/modern:text-[64px]
                  "
                >
                  <span className="block">
                    {heroLines.first}
                  </span>

                  {heroLines.second && (
                    <span
                      className="
                        ml-5
                        mt-1
                        block
                        text-[#514b43]

                        @[600px]/modern:ml-8

                        @[1000px]/modern:ml-12
                      "
                    >
                      {heroLines.second}
                    </span>
                  )}
                </motion.h2>
              )}

              {/* DESCRIPTION */}

              {hero?.description && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.32,
                    duration: 0.55,
                  }}
                  className="
                    mt-4
                    max-w-[310px]
                    text-[11px]
                    leading-[1.7]
                    text-[#777066]

                    @[600px]/modern:max-w-md
                    @[600px]/modern:text-xs

                    @[1000px]/modern:max-w-lg
                    @[1000px]/modern:text-sm
                  "
                >
                  {hero.description}
                </motion.p>
              )}

              {/* CTA */}

              <motion.button
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
                type="button"
                onClick={scrollToProducts}
                whileHover={{
                  x: 3,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="
                  group/cta
                  mt-5
                  flex
                  w-fit
                  min-h-[44px]
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#171614]
                  px-4
                  py-2.5
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-white
                  shadow-[0_10px_25px_rgba(0,0,0,0.14)]

                  @[600px]/modern:px-5
                  @[600px]/modern:py-3
                  @[600px]/modern:text-[8px]

                  @[1000px]/modern:min-h-0
                "
              >
                Explore collection

                <ArrowUpRight
                  size={11}
                  className="transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                />
              </motion.button>
            </div>

            {/* HERO DECORATION */}

            <div className="absolute bottom-5 right-5 hidden @[700px]/modern:block">
              <div className="flex items-center gap-2 text-[#8c806e]">
                <span className="text-[7px] uppercase tracking-[0.25em]">
                  Est.
                </span>

                <span className="h-px w-8 bg-[#9c8866]/40" />

                <span className="text-[7px] uppercase tracking-[0.25em]">
                  Everyday
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===================================================
            SEARCH
        ==================================================== */}

        <section
          className="
            px-3
            py-2

            @[600px]/modern:px-5
            @[600px]/modern:py-3

            @[1000px]/modern:px-8
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            className="
              mx-auto
              flex
              max-w-2xl
              items-center
              gap-2.5
              rounded-full
              border
              border-black/[0.07]
              bg-white/85
              px-3
              py-2.5
              shadow-[0_5px_24px_rgba(0,0,0,0.035)]
              backdrop-blur-sm
              transition
              focus-within:border-[#9e8357]/40
              focus-within:shadow-[0_10px_35px_rgba(0,0,0,0.07)]

              @[600px]/modern:px-4
              @[600px]/modern:py-3
            "
          >
            <Search
              size={13}
              className="shrink-0 text-[#918a80]"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search the collection..."
              className="
                min-w-0
                flex-1
                bg-transparent
              text-[9px]
                outline-none
                placeholder:text-[#aaa39a]

              @[600px]/modern:text-xs
              "
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[#8d867c]"
              >
                <X size={12} />
              </button>
            )}
          </motion.div>
        </section>

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        <section
          id="modern-grid-products"
          className="
            scroll-mt-16
            px-3
            pb-16
            pt-4

            @[600px]/modern:px-5
            @[600px]/modern:pt-5

            @[1000px]/modern:px-8
            @[1000px]/modern:pt-7
          "
        >
          {/* SECTION HEADER */}

          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-5 bg-[#aa8b59]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#9b9183] @[600px]/modern:text-[10px]">
                  Curated selection
                </p>
              </div>

              <h2
                className="
                  mt-1.5
                  text-3xl
                  font-black
                  tracking-[-0.045em]

                  @[600px]/modern:text-4xl

                  @[1000px]/modern:text-5xl
                "
              >
                Popular products
              </h2>
            </div>

            <p className="text-[9px] text-[#a29a90] @[600px]/modern:text-[10px]">
              {filteredProducts.length} pieces
            </p>
          </div>

          {/* EMPTY */}

          {filteredProducts.length === 0 ? (
            <div className="rounded-[20px] border border-black/[0.06] bg-white px-5 py-14 text-center">
              <Search
                size={25}
                className="mx-auto text-[#c7c0b6]"
              />

              <p className="mt-4 text-xs font-semibold">
                No products found
              </p>

              <p className="mt-1 text-[8px] text-[#a39b91]">
                Try another search.
              </p>
            </div>
          ) : (
            /*
              IMPORTANT RESPONSIVE GRID

              Narrow editor preview:
              2 columns

              Medium preview:
              3 columns

              Full desktop:
              4 columns

              This is based on the ACTUAL component width,
              not browser viewport width.
            */

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="
                grid
                grid-cols-2
                gap-3

                @[520px]/modern:gap-3

                @[680px]/modern:grid-cols-3
                @[680px]/modern:gap-3.5

                @[1000px]/modern:grid-cols-4
                @[1000px]/modern:gap-4

                @[1200px]/modern:gap-5
              "
            >
              {pagedProducts.map((product) => {
                const discount = getDiscount(
                  product.mrp,
                  product.price
                );

                return (
                  <motion.article
                    key={product._id}
                    variants={cardVariants}
                    whileHover={{
                      y: -4,
                    }}
                    onClick={() => setSelectedProduct(product)}
                    className="
                      group
                      flex
                      h-full
                      min-w-0
                      cursor-pointer
                      flex-col
                      overflow-hidden
                      rounded-[14px]
                      border
                      border-black/[0.055]
                      bg-white
                      shadow-[0_5px_18px_rgba(0,0,0,0.035)]
                      transition-all
                      duration-500
                      hover:shadow-[0_14px_35px_rgba(0,0,0,0.09)]

                      @[600px]/modern:rounded-[16px]

                      @[1000px]/modern:rounded-[18px]
                    "
                  >
                    {/* IMAGE */}

                    <div
                      className="
                        relative
                        aspect-[0.94]
                        overflow-hidden
                        bg-[#ece9e2]
                      "
                    >
                      {product.image ? (
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          whileHover={{
                            scale: 1.055,
                          }}
                          transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[7px] text-[#aaa196]">
                          No image
                        </div>
                      )}

                      {/* IMAGE SHADE */}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* DISCOUNT */}

                      {discount > 0 && (
                        <span
                          className="
                            absolute
                            left-1.5
                            top-1.5
                            rounded-full
                            bg-[#171614]
                            px-1.5
                            py-1
                            text-[5px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-white

                            @[600px]/modern:left-2
                            @[600px]/modern:top-2
                            @[600px]/modern:px-2
                            @[600px]/modern:text-[6px]
                          "
                        >
                          {discount}% off
                        </span>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div
                      className="
                        flex
                        flex-1
                        flex-col
                        p-2

                        @[600px]/modern:p-2.5

                        @[1000px]/modern:p-3
                      "
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h3
                          className={`
                            min-w-0
                            truncate
                            font-semibold
                            leading-tight
                            tracking-[-0.01em]
                            ${
                              isEditorPreview
                                ? "text-[8px] @[600px]/modern:text-[9px] @[1000px]/modern:text-[10px]"
                                : "text-[11px] @[600px]/modern:text-[13px] @[1000px]/modern:text-[14px]"
                            }
                          `}
                        >
                          {product.name}
                        </h3>
                      </div>

                      {/* PRICE */}

                      <div className="mt-auto flex min-w-0 items-baseline gap-1 pt-2">
                        <span
                          className="
                            truncate
                            text-[10px]
                            font-black
                            tracking-[-0.03em]

                            @[600px]/modern:text-[11px]

                            @[1000px]/modern:text-[13px]
                          "
                        >
                          {formatPrice(
                            Number(product.price || 0)
                          )}
                        </span>

                        {Number(product.mrp || 0) >
                          Number(product.price || 0) && (
                          <span
                            className="
                              truncate
                              text-[5px]
                              text-[#aaa198]
                              line-through

                              @[600px]/modern:text-[6px]
                            "
                          >
                            {formatPrice(
                              Number(product.mrp || 0)
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}

          {!isEditorPreview && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              className="text-[#1c1a17]"
            />
          )}
        </section>
      </main>

      {/* =====================================================
          SMALL STICKY CART

          In editor preview this is positioned inside the template root.
          Public catalogs keep the cart visible above the viewport edge.
      ====================================================== */}

    {/* =====================================================
    PREMIUM FLOATING CART
===================================================== */}

<AnimatePresence>
  {cartCount > 0 && !showCart && (
    <motion.div
      initial={{
        opacity: 0,
        y: 35,
        x: isEditorPreview ? "-50%" : 0,
        scale: 0.94,
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: isEditorPreview ? "-50%" : 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 35,
        x: isEditorPreview ? "-50%" : 0,
        scale: 0.94,
      }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 28,
        mass: 0.7,
      }}
      className={`
        ${isEditorPreview ? "absolute bottom-4 left-1/2 sm:bottom-5" : "fixed bottom-4 left-0 right-0 mx-auto sm:bottom-5"}
        z-[150]

        w-[calc(100%-24px)]
        max-w-[760px]

        sm:w-[calc(100%-32px)]
        sm:max-w-[820px]

        lg:max-w-[900px]
      `}
    >
      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-3

          overflow-hidden

          rounded-[20px]
          border
          border-white/[0.10]

          bg-[#171716]/95
          px-3
          py-2.5

          shadow-[0_18px_55px_rgba(0,0,0,0.24)]
          backdrop-blur-2xl

          sm:rounded-[22px]
          sm:px-4
          sm:py-3

          lg:px-5
        "
      >

        {/* PREMIUM LIGHT EFFECT */}

        <div
          className="
            pointer-events-none
            absolute
            -left-10
            -top-10
            size-28
            rounded-full
            bg-white/[0.05]
            blur-2xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-12
            -bottom-12
            size-32
            rounded-full
            bg-[#b8955b]/[0.08]
            blur-3xl
          "
        />

        {/* LEFT — CART INFO */}

        <motion.button
          type="button"
          onClick={() => setShowCart(true)}
          whileTap={{ scale: 0.97 }}
          className="
            relative
            flex
            min-w-0
            flex-1
            items-center
            gap-3
            rounded-xl
            px-1
            py-1
            text-left

            sm:gap-3.5
            sm:px-1.5
          "
        >

          {/* CART ICON */}

          <motion.span
            animate={{
              y: [0, -2, 0],
              rotate: [0, -2, 2, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
            className="
              relative
              flex
              size-11
              shrink-0
              items-center
              justify-center
              rounded-xl

              border
              border-white/[0.10]

              bg-white/[0.08]
              text-white

              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]

              sm:size-12
              sm:rounded-[15px]
            "
          >
            <ShoppingBag
              size={18}
              strokeWidth={1.8}
              className="sm:size-[20px]"
            />

            {/* COUNT */}

            <AnimatePresence mode="popLayout">
              <motion.span
                key={cartCount}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  y: 5,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className="
                  absolute
                  -right-1.5
                  -top-1.5

                  flex
                  size-[19px]
                  items-center
                  justify-center

                  rounded-full
                  border-2
                  border-[#171716]

                  bg-[#b8955b]
                  text-[8px]
                  font-bold
                  text-white

                  shadow-[0_3px_10px_rgba(184,149,91,0.35)]
                "
              >
                {cartCount}
              </motion.span>
            </AnimatePresence>
          </motion.span>

          {/* TEXT */}

          <div className="min-w-0">

            <div className="flex items-center gap-1.5">

              <p
                className="
                  truncate
                  text-[9px]
                  font-semibold
                  tracking-[-0.01em]
                  text-white

                  sm:text-[10px]
                "
              >
                Your selection
              </p>

              <span
                className="
                  hidden
                  h-1
                  w-1
                  rounded-full
                  bg-[#b8955b]

                  sm:block
                "
              />

              <span
                className="
                  hidden
                  text-[7px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-white/40

                  sm:block
                "
              >
                Cart
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={`${cartCount}-${cartTotal}`}
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="
                  mt-0.5
                  truncate
                  text-[7px]
                  text-white/45

                  sm:text-[8px]
                "
              >
                {cartCount}{" "}
                {cartCount === 1
                  ? "product"
                  : "products"}{" "}
                <span className="text-white/20">
                  •
                </span>{" "}
                <span className="font-medium text-white/65">
                  {formatPrice(cartTotal)}
                </span>
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.button>

        {/* RIGHT — ORDER BUTTON */}

        <motion.button
          type="button"
          onClick={sendToWhatsApp}
          disabled={ordering}
          whileHover={{
            scale: 1.025,
          }}
          whileTap={{
            scale: 0.96,
          }}
          className="
            relative
            flex
            h-10
            shrink-0
            items-center
            justify-center
            gap-2

            rounded-[13px]

            bg-[#249653]
            px-4

            text-[8px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-white

            shadow-[0_8px_22px_rgba(36,150,83,0.22)]

            transition-all
            duration-300

            hover:bg-[#2aa55c]
            hover:shadow-[0_10px_28px_rgba(36,150,83,0.30)]

            disabled:cursor-not-allowed
            disabled:opacity-50

            sm:h-11
            sm:rounded-[14px]
            sm:px-5
            sm:text-[9px]

            lg:px-6
          "
        >

          {/* SHINE */}

          <motion.span
            animate={{
              x: ["-120%", "220%"],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
            className="
              pointer-events-none
              absolute
              inset-y-0
              w-8
              rotate-12
              bg-white/10
              blur-md
            "
          />

          <MessageCircle
            size={13}
            strokeWidth={2}
            className="relative sm:size-[14px]"
          />

          <span className="relative">
            {ordering ? "Opening..." : "Order"}
          </span>

          <ArrowUpRight
            size={11}
            className="
              relative
              hidden
              opacity-70
              transition-transform
              duration-300

              sm:block
            "
          />
        </motion.button>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* =====================================================
          BOTTOM MICRO FOOTER
      ====================================================== */}

      <div className="border-t border-black/[0.045] px-4 py-5 text-center">
        <div className="flex items-center justify-center gap-2 text-[#aaa196]">
          <span className="h-px w-8 bg-[#b7aa98]/40" />

          <span className="text-[5px] font-semibold uppercase tracking-[0.3em]">
            Curated with intention
          </span>

          <span className="h-px w-8 bg-[#b7aa98]/40" />
        </div>
      </div>

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
    </div>
  );
}