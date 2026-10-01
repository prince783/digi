"use client";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import CatalogProductCard from "../ui/CatalogProductCard";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

type CartItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
};

export default function NoirAtelier({
  catalog = {},
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
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

  const featured = products?.[0];
  const hero = catalog?.hero;
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Fine Atelier";

  /*
   * =========================================================
   * SLIDER
   * =========================================================
   */

  const moveSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    const amount = Math.min(
      520,
      sliderRef.current.clientWidth * 0.8
    );

    sliderRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  /*
   * =========================================================
   * CART
   * =========================================================
   */

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

  const addToCart = (
    product: CatalogTemplateProps["products"][number]
  ) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item._id === product._id
      );

      if (existing) {
        return currentCart.map((item) =>
          item._id === product._id
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
          _id: product._id,
          name: product.name,
          description: product.description,
          price: Number(product.price || 0),
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
          : item,
      ),
    );
  };

  const decreaseQuantity = (id: string) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  /*
   * =========================================================
   * WHATSAPP
   * =========================================================
   */

  const whatsappNumber =
    (
      catalog as typeof catalog & {
        whatsapp?: string;
        whatsappNumber?: string;
        mobile?: string;
      }
    ).whatsapp ||
    (
      catalog as typeof catalog & {
        whatsappNumber?: string;
      }
    ).whatsappNumber ||
    (
      catalog as typeof catalog & {
        mobile?: string;
      }
    ).mobile ||
    "";

  const whatsappDigits = whatsappNumber.replace(/\D/g, "");
  const cleanWhatsappNumber =
    whatsappDigits.length === 10
      ? `91${whatsappDigits}`
      : whatsappDigits;

  const whatsappMessage = cart.length
    ? `Hello, I would like to order:\n\n${cart
        .map(
          (item) =>
            `${item.name} x ${item.quantity} - ₹${(
              item.price * item.quantity
            ).toLocaleString("en-IN")}`
        )
        .join("\n")}\n\nTotal: ₹${cartTotal.toLocaleString(
        "en-IN"
      )}`
    : featured
      ? `Hello, I am interested in ${featured.name}. Please share more details.`
      : "Hello, I am interested in your products. Please share more details.";

  const whatsappUrl = cleanWhatsappNumber
    ? `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : "";

  const openWhatsApp = () => {
    if (!whatsappUrl) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const scrollToCollection = () => {
    document
      .getElementById("noir-collection")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <main
      data-public={!isEditorPreview ? "true" : undefined}
      className={`
        @container
        relative
        ${isEditorPreview ? "min-h-full" : "min-h-screen"}
        w-full
        bg-[#0d0c0b]
        text-[#f4eee5]
        selection:bg-[#c7a76a]
        selection:text-black
      `}
    >
      {!isEditorPreview && (
        <style jsx global>{`
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
          NAVBAR
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/[0.07]
          bg-[#0d0c0b]/85
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[68px]
            max-w-7xl
            items-center
            justify-between
            px-5

            @[640px]:h-[74px]
            @[640px]:px-6

            @[1024px]:h-[82px]
            @[1024px]:px-8

            @[1280px]:px-0
          "
        >
          {/* LOGO */}

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="group min-w-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-[#c7a76a]/50
                  text-[#c7a76a]
                  transition
                  duration-500
                  group-hover:rotate-45
                "
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={catalog.companyName || "NOIR"}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Sparkles size={13} strokeWidth={1.4} />
                )}
              </div>

              <div className="min-w-0 text-left">
                <h1
                  className="
                    truncate
                    font-serif
                    text-[17px]
                    tracking-[0.18em]
                    text-[#d2b277]

                    @[640px]:text-[19px]

                    @[1024px]:text-xl
                  "
                >
                  {catalog.companyName || "NOIR"}
                </h1>

                <p
                  className="
                    mt-0.5
                    text-[6px]
                    uppercase
                    tracking-[0.5em]
                    text-white/35

                    @[640px]:text-[7px]
                  "
                >
                  {tagline}
                </p>
              </div>
            </div>
          </button>

          {/* DESKTOP NAV */}

          <nav
            className="
              hidden
              items-center
              gap-8
              text-[9px]
              uppercase
              tracking-[0.2em]
              text-white/55

              @[900px]:flex

              @[1100px]:gap-10
              @[1100px]:text-[10px]
            "
          >
            <button
              type="button"
              onClick={scrollToCollection}
              className="
                relative
                py-2
                transition
                hover:text-[#d2b277]
                after:absolute
                after:bottom-0
                after:left-0
                after:h-px
                after:w-0
                after:bg-[#c7a76a]
                after:transition-all
                hover:after:w-full
              "
            >
              Collection
            </button>

            <button
              type="button"
              onClick={openWhatsApp}
              className="
                relative
                py-2
                transition
                hover:text-[#d2b277]
                after:absolute
                after:bottom-0
                after:left-0
                after:h-px
                after:w-0
                after:bg-[#c7a76a]
                after:transition-all
                hover:after:w-full
              "
            >
              Contact
            </button>
          </nav>

          {/* CART */}

          <button
            type="button"
            onClick={() => {
              if (cart.length > 0) {
                openWhatsApp();
              }
            }}
            className="
              group
              relative
              flex
              items-center
              gap-2
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-[#d2b277]
              transition
              hover:text-white

              @[640px]:text-[9px]
            "
          >
            <ShoppingBag
              size={17}
              strokeWidth={1.3}
              className="transition group-hover:-translate-y-0.5"
            />

            <span className="hidden @[420px]:inline">
              Cart
            </span>

            {cartCount > 0 && (
              <span
                className="
                  absolute
                  -right-3
                  -top-3
                  flex
                  h-4
                  min-w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-[#c7a76a]
                  px-1
                  text-[7px]
                  font-semibold
                  text-black
                "
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      {featured && (
        <section
          className="
            mx-auto
            w-full
            max-w-7xl
            px-4
            pt-4

            @[640px]:px-6
            @[640px]:pt-6

            @[1024px]:px-8
            @[1024px]:pt-8

            @[1280px]:px-0
          "
        >
          <div
            className="
              group
              relative
              min-h-[620px]
              w-full
              overflow-hidden
              bg-[#171412]

              @[640px]:min-h-[680px]

              @[900px]:min-h-[700px]

              @[1024px]:min-h-[720px]
            "
          >
            {/* IMAGE */}

            <motion.img
              initial={{
                scale: 1.08,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                duration: 2,
                ease: [0.22, 1, 0.36, 1],
              }}
              src={
                hero?.image ||
                featured?.image ||
                "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1400"
              }
              alt={hero?.title || featured?.name || "Jewellery collection"}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-[2s]
                ease-out
                group-hover:scale-[1.025]
              "
            />

            {/* IMAGE OVERLAYS */}

            <div className="absolute inset-0 bg-black/25" />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/75
                via-black/25
                to-transparent
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/70
                via-transparent
                to-black/20
              "
            />

            {/* DECORATIVE FRAME */}

            <div
              className="
                pointer-events-none
                absolute
                inset-4
                border
                border-white/15

                @[640px]:inset-6

                @[1024px]:inset-8
              "
            />

            {/* HERO CONTENT */}

            <div
              className="
                relative
                z-10
                flex
                min-h-[620px]
                items-end
                px-8
                pb-12

                @[640px]:min-h-[680px]
                @[640px]:px-12
                @[640px]:pb-16

                @[900px]:min-h-[700px]
                @[900px]:px-16

                @[1024px]:min-h-[720px]
                @[1024px]:px-20
                @[1024px]:pb-20
              "
            >
              <div className="max-w-2xl">
                {hero?.eyebrow && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 18,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                    className="flex items-center gap-3"
                  >
                    <span className="h-px w-8 bg-[#c7a76a]" />

                    <p
                      className="
                        text-[8px]
                        uppercase
                        tracking-[0.45em]
                        text-[#d4b675]

                        @[640px]:text-[9px]

                        @[1024px]:text-[10px]
                      "
                    >
                      {hero.eyebrow}
                    </p>
                  </motion.div>
                )}

                {hero?.title && (
                  <motion.h2
                    initial={{
                      opacity: 0,
                      y: 30,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.15,
                      duration: 0.9,
                    }}
                    className="
                      mt-5
                      max-w-xl
                      font-serif
                      text-[54px]
                      leading-[0.9]
                      tracking-[-0.035em]
                      text-white

                      @[640px]:mt-6
                      @[640px]:text-[72px]

                      @[900px]:text-[84px]

                      @[1024px]:text-[96px]

                      @[1200px]:text-[108px]
                    "
                  >
                    {hero.title}
                  </motion.h2>
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
                      delay: 0.3,
                      duration: 0.7,
                    }}
                    className="
                      mt-6
                      max-w-md
                      text-[11px]
                      leading-6
                      text-white/55

                      @[640px]:text-xs
                      @[640px]:leading-7
                    "
                  >
                    {hero.description}
                  </motion.p>
                )}

                {/* ACTIONS */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.4,
                    duration: 0.7,
                  }}
                  className="
                    mt-8
                    flex
                    flex-col
                    gap-3

                    @[480px]:flex-row
                  "
                >
                  <button
                    type="button"
                    onClick={scrollToCollection}
                    className="
                      group
                      flex
                      min-h-[48px]
                      items-center
                      justify-center
                      gap-3
                      border
                      border-[#c7a76a]
                      bg-[#c7a76a]
                      px-7
                      text-[8px]
                      font-medium
                      uppercase
                      tracking-[0.22em]
                      text-black
                      transition-all
                      duration-300
                      hover:bg-white
                      hover:border-white

                      @[640px]:min-h-[52px]
                      @[640px]:px-8
                      @[640px]:text-[9px]
                    "
                  >
                    Explore collection

                    <ArrowUpRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => addToCart(featured)}
                    className="
                      flex
                      min-h-[48px]
                      items-center
                      justify-center
                      gap-2
                      border
                      border-white/25
                      bg-black/15
                      px-7
                      text-[8px]
                      uppercase
                      tracking-[0.22em]
                      text-white
                      backdrop-blur-sm
                      transition-all
                      duration-300
                      hover:border-white
                      hover:bg-white
                      hover:text-black

                      @[640px]:min-h-[52px]
                      @[640px]:px-8
                      @[640px]:text-[9px]
                    "
                  >
                    <ShoppingBag size={14} />
                    Add to cart
                  </button>
                </motion.div>
              </div>
            </div>

            {/* HERO SIDE LABEL */}

            <div
              className="
                absolute
                right-8
                top-1/2
                z-10
                hidden
                -translate-y-1/2
                rotate-90
                items-center
                gap-3
                @[1100px]:flex
              "
            >
              <span className="h-px w-10 bg-white/25" />

              <span
                className="
                  text-[7px]
                  uppercase
                  tracking-[0.5em]
                  text-white/40
                "
              >
                Established · Timeless · Refined
              </span>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          PHILOSOPHY
      ====================================================== */}

      <section className="hidden">
        <div className="mx-auto mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-[#c7a76a]/60" />

          <span className="text-[#c7a76a]">
            <Sparkles size={14} strokeWidth={1} />
          </span>

          <span className="h-px w-10 bg-[#c7a76a]/60" />
        </div>

        <p
          className="
            text-[8px]
            uppercase
            tracking-[0.45em]
            text-[#c7a76a]

            @[640px]:text-[9px]
          "
        >
          Atelier philosophy
        </p>

        <h2
          className="
            mt-6
            font-serif
            text-4xl
            leading-[1.05]
            tracking-[-0.02em]

            @[480px]:text-5xl

            @[640px]:text-6xl

            @[900px]:text-7xl

            @[1024px]:text-[82px]
          "
        >
          Jewellery should whisper,
          <br />
          <span className="italic text-white/75">
            never shout.
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-7
            max-w-lg
            text-[11px]
            leading-6
            text-white/35

            @[640px]:text-xs
            @[640px]:leading-7
          "
        >
          We believe true luxury lives in restraint.
          Every piece is created to complement the wearer,
          not compete with them.
        </p>
      </section>

      {/* =====================================================
          COLLECTION
      ====================================================== */}

      <section
        id="noir-collection"
        className="
          border-y
          border-white/[0.07]
          bg-[#100e0d]
          py-20

          @[640px]:py-24

          @[1024px]:py-32
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-7xl
            px-5

            @[640px]:px-6

            @[1024px]:px-8

            @[1280px]:px-0
          "
        >
          {/* HEADER */}

          <div
            className="
              mb-10
              flex
              items-end
              justify-between
              gap-6

              @[640px]:mb-12

              @[1024px]:mb-14
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#c7a76a]" />

                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.45em]
                    text-[#c7a76a]

                    @[640px]:text-[9px]
                  "
                >
                  Curated selection
                </p>
              </div>

              <h2
                className="
                  mt-3
                  font-serif
                  text-4xl
                  tracking-[-0.025em]

                  @[640px]:text-5xl

                  @[1024px]:text-6xl
                "
              >
                Signature pieces
              </h2>
            </div>

            {/* CONTROLS */}

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => moveSlider("left")}
                aria-label="Previous products"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/15
                  text-white/60
                  transition-all
                  hover:border-[#c7a76a]
                  hover:text-[#c7a76a]

                  @[640px]:h-11
                  @[640px]:w-11
                "
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => moveSlider("right")}
                aria-label="Next products"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/15
                  text-white/60
                  transition-all
                  hover:border-[#c7a76a]
                  hover:text-[#c7a76a]

                  @[640px]:h-11
                  @[640px]:w-11
                "
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* PRODUCT SLIDER */}

          <div
            ref={sliderRef}
            className="
              flex
              gap-4
              overflow-x-auto
              overflow-y-hidden
              pb-6
              snap-x
              snap-mandatory
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden

              @[640px]:gap-5

              @[1024px]:gap-6
            "
          >
            {pagedProducts.map((product, index) => (
              <motion.div
                key={
                  product._id ||
                  `${product.name}-${index}`
                }
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.1,
                }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(index * 0.05, 0.3),
                }}
                className="
                  w-[245px]
                  min-w-[245px]
                  shrink-0
                  snap-start
                  [&>article]:border-[#c7a76a]/35!
                  [&>article]:hover:border-[#c7a76a]/70!

                  @[480px]:w-[270px]
                  @[480px]:min-w-[270px]

                  @[640px]:w-[290px]
                  @[640px]:min-w-[290px]

                  @[900px]:w-[310px]
                  @[900px]:min-w-[310px]

                  @[1100px]:w-[325px]
                  @[1100px]:min-w-[325px]
                "
              >
                <CatalogProductCard
                  product={product}
                  onCardClick={(p) => setSelectedProduct(p)}
                  dark
                />
              </motion.div>
            ))}
          </div>

          {products.length > 2 && (
            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                text-[7px]
                uppercase
                tracking-[0.4em]
                text-white/25
              "
            >
              <span className="h-px w-8 bg-white/15" />
              Drag to explore
            </div>
          )}

          {!isEditorPreview && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              className="text-white"
            />
          )}
        </div>
      </section>

      {/* =====================================================
          WHATSAPP
      ====================================================== */}

      {cleanWhatsappNumber && (
        <section
          className="
            hidden
          "
        >
          <div
            className="
              relative
              overflow-hidden
              border
              border-[#c7a76a]/20
              bg-[#151210]
              px-7
              py-10

              @[640px]:px-10
              @[640px]:py-12

              @[900px]:px-14
              @[900px]:py-14

              @[1024px]:flex
              @[1024px]:items-center
              @[1024px]:justify-between
              @[1024px]:gap-10
            "
          >
            {/* DECORATIVE CIRCLE */}

            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-64
                w-64
                rounded-full
                border
                border-[#c7a76a]/10
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-16
                h-48
                w-48
                rounded-full
                border
                border-[#c7a76a]/10
              "
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <MessageCircle
                  size={15}
                  strokeWidth={1.2}
                  className="text-[#c7a76a]"
                />

                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.4em]
                    text-[#c7a76a]
                  "
                >
                  Private client service
                </p>
              </div>

              <h3
                className="
                  mt-3
                  font-serif
                  text-3xl

                  @[640px]:text-4xl

                  @[900px]:text-5xl
                "
              >
                Speak with our atelier.
              </h3>

              <p
                className="
                  mt-3
                  max-w-lg
                  text-[10px]
                  leading-5
                  text-white/35

                  @[640px]:text-xs
                  @[640px]:leading-6
                "
              >
                For product details, availability,
                custom requests or personal assistance,
                our team is just a message away.
              </p>
            </div>

            <div
              className="
                relative
                z-10
                mt-7
                flex
                flex-col
                gap-3

                @[480px]:flex-row

                @[1024px]:mt-0
              "
            >
              {featured && (
                <button
                  type="button"
                  onClick={() => addToCart(featured)}
                  className="
                    flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    border
                    border-white/15
                    px-6
                    text-[8px]
                    uppercase
                    tracking-[0.2em]
                    text-white/75
                    transition-all
                    hover:border-[#c7a76a]
                    hover:text-[#c7a76a]

                    @[640px]:px-7
                  "
                >
                  <ShoppingBag size={14} />
                  Add to cart
                </button>
              )}

              <button
                type="button"
                onClick={openWhatsApp}
                className="
                  flex
                  min-h-[48px]
                  items-center
                  justify-center
                  gap-2
                  bg-[#c7a76a]
                  px-6
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-black
                  transition-all
                  hover:bg-white

                  @[640px]:px-7
                "
              >
                <MessageCircle size={14} />
                WhatsApp us
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className="
          border-t
          border-white/[0.06]
          px-5
          py-20
          text-center

          @[640px]:py-24

          @[1024px]:py-28
        "
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-white/10" />

            <Sparkles
              size={14}
              strokeWidth={1}
              className="text-[#c7a76a]"
            />

            <span className="h-px w-10 bg-white/10" />
          </div>

          <p
            className="
              font-serif
              text-3xl
              text-[#c7a76a]

              @[640px]:text-4xl

              @[1024px]:text-5xl
            "
          >
            {catalog.companyName || "NOIR"}
          </p>

          <p
            className="
              mt-4
              text-[7px]
              uppercase
              tracking-[0.45em]
              text-white/25

              @[640px]:text-[8px]
            "
          >
            Made to be remembered
          </p>

          <div className="mt-10 text-[7px] text-white/15">
            © {new Date().getFullYear()}{" "}
            {catalog.companyName || "Noir Atelier"}.
            All rights reserved.
          </div>
        </div>
      </footer>

      {/* =====================================================
          CART BAR
      ====================================================== */}

      {cart.length > 0 && (
        <div
          className={`
            ${isEditorPreview ? "absolute bottom-0 left-0 right-0" : "sticky bottom-0"}
            z-[90]
            border-t
            border-white/10
            bg-[#12100f]/90
            px-4
            py-3
            backdrop-blur-2xl

            @[640px]:px-6
          `}
        >
          <div
            className="
              mx-auto
              flex
              max-w-3xl
              items-center
              justify-between
              gap-4
            "
          >
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
                  hidden
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#c7a76a]/30
                  @[420px]:flex
                "
              >
                <ShoppingBag
                  size={15}
                  strokeWidth={1.3}
                  className="text-[#c7a76a]"
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[7px]
                    uppercase
                    tracking-[0.2em]
                    text-white/35
                  "
                >
                  {cartCount}{" "}
                  {cartCount === 1 ? "piece" : "pieces"}{" "}
                  selected
                </p>

                <p
                  className="
                    mt-0.5
                    font-serif
                    text-lg
                    text-[#d4b675]
                  "
                >
                  ₹{cartTotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openWhatsApp}
              disabled={!whatsappUrl}
              className="
                flex
                min-h-[42px]
                shrink-0
                items-center
                justify-center
                gap-2
                bg-[#25D366]
                px-5
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
                transition
                hover:bg-[#20bd5a]
                disabled:cursor-not-allowed
                disabled:opacity-40

                @[640px]:px-7
              "
            >
              <MessageCircle size={14} />

              <span className="hidden @[420px]:inline">
                Order on WhatsApp
              </span>

              <span className="@[420px]:hidden">
                Order
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          FLOATING WHATSAPP
      ====================================================== */}

      {cleanWhatsappNumber && (
        <motion.button
          type="button"
          onClick={openWhatsApp}
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 1,
          }}
          className="
            fixed
            bottom-20
            right-4
            z-[100]
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-[#25D366]
            text-white
            shadow-[0_12px_40px_rgba(0,0,0,0.4)]
            transition-all
            duration-300
            hover:scale-105
            hover:bg-[#20bd5a]
            active:scale-95

            @[420px]:bottom-20
            @[420px]:right-5

            @[640px]:bottom-6
            @[640px]:right-6
            @[640px]:h-14
            @[640px]:w-14
          "
        >
          <MessageCircle
            size={21}
            strokeWidth={1.8}
          />

          <span
            className="
              absolute
              -right-0.5
              -top-0.5
              h-3
              w-3
              rounded-full
              border-2
              border-[#0d0c0b]
              bg-[#25D366]
            "
          />
        </motion.button>
      )}

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