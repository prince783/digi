"use client";

import {
  Armchair,
  ChevronRight,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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
   TEMPLATE
========================================================= */

export default function WarmLivingTemplate({
  catalog,
  products,
  onAddToCart,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const hero = catalog?.hero;

  const companyName = catalog?.companyName || "Casa Living";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Timeless interiors";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const fallbackHero =
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=90";

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

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

  /* =========================================================
     ROOM CATEGORIES
  ========================================================= */

  const roomCategories = [
    {
      title: "Living Room",
      image: products[0]?.image,
    },
    {
      title: "Bedroom",
      image: products[1]?.image || products[0]?.image,
    },
    {
      title: "Dining",
      image: products[3]?.image || products[1]?.image,
    },
    {
      title: "Decor",
      image: products[5]?.image || products[2]?.image,
    },
  ];

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

  function addProductToCart(
    product: CatalogTemplateProps["products"][number]
  ) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.product._id === product._id
      );

      if (existing) {
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

    /*
     * Keep existing parent cart functionality if supplied.
     */
    if (onAddToCart) {
      onAddToCart(product);
    }
  }

  /* =========================================================
     INCREASE
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
     DECREASE
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
     REMOVE
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

    const phone = cleanPhone(whatsappNumber);

    if (!phone) {
      alert("Invalid WhatsApp number.");
      return;
    }

    setOrdering(true);

    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "";

    const orderLines = cart.map((item, index) => {
      const price = Number(item.product.price || 0);

      const total = price * item.quantity;

      return [
        `${index + 1}. ${item.product.name}`,
        `Qty: ${item.quantity}`,
        `Price: ₹${formatPrice(price)}`,
        `Total: ₹${formatPrice(total)}`,
      ].join("\n");
    });

    const message = [
      "🛋️ *NEW ORDER REQUEST*",
      "",
      `*Catalog:* ${companyName}`,
      "",
      "*ORDER ITEMS*",
      "",
      ...orderLines,
      "",
      "━━━━━━━━━━━━━━━━",
      `*GRAND TOTAL: ₹${formatPrice(cartTotal)}*`,
      "━━━━━━━━━━━━━━━━",
      "",
      currentUrl
        ? `*Catalog:* ${currentUrl}`
        : "",
      "",
      "Hello, I would like to place this order. Please confirm availability and delivery details.",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl =
      `https://wa.me/${phone}` +
      `?text=${encodeURIComponent(message)}`;

    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setTimeout(() => {
        setOrdering(false);
      }, 700);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      data-public={!isEditorPreview ? "true" : undefined}
      className={
        isEditorPreview
          ? "min-h-full w-full bg-[#5a463a] text-[#f3ede3]"
          : "min-h-screen w-full bg-[#5a463a] text-[#f3ede3]"
      }
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
          [data-public="true"] [class*="text-[15px]"] { font-size: 1rem; }
          [data-public="true"] [class*="text-[17px]"] { font-size: 1.125rem; }
          [data-public="true"] [class~="text-xs"],
          [data-public="true"] [class*=":text-xs"] { font-size: 0.9375rem; }
          [data-public="true"] [class~="text-sm"],
          [data-public="true"] [class*=":text-sm"] { font-size: 1rem; }
          [data-public="true"] [class*="line-clamp-2"] {
            -webkit-line-clamp: 3;
            line-clamp: 3;
          }
          [data-public="true"] .warm-living-product-description {
            min-height: 60px;
            line-height: 1.5rem;
            font-size: 0.875rem;
          }
          [data-public="true"] .warm-living-product-name {
            font-size: 1.25rem;
            line-height: 1.2;
          }
          @media (min-width: 768px) {
            [data-public="true"] .warm-living-product-description {
              font-size: 1rem;
              line-height: 1.625rem;
            }
            [data-public="true"] .warm-living-product-name {
              font-size: 1.375rem;
            }
          }
        `}</style>
      )}
      <div
        className={
          isEditorPreview
            ? "relative mx-auto w-full max-w-[430px]"
            : "mx-auto w-full max-w-5xl"
        }
      >
        {/* ===================================================
            HEADER
        ==================================================== */}

        <motion.header
          initial={
            isEditorPreview
              ? undefined
              : {
                  opacity: 0,
                  y: -20,
                }
          }
          animate={
            isEditorPreview
              ? undefined
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="
            sticky
            top-0
            z-40
            border-b
            border-[#7a6453]/60
            bg-[#4b3a30]/90
            px-5
            py-4
            backdrop-blur-xl
          "
        >
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <motion.div
                whileHover={
                  isEditorPreview
                    ? undefined
                    : {
                        rotate: -5,
                        scale: 1.05,
                      }
                }
                className="
                  flex
                  size-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f3ede3]
                  text-[#3a2d25]
                  shadow-[0_8px_25px_rgba(58,45,37,0.18)]
                "
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={companyName}
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <Armchair
                    size={18}
                    strokeWidth={1.6}
                  />
                )}
              </motion.div>

              <div className="min-w-0">
                <h1 className="truncate font-serif text-[17px] font-semibold">
                  {companyName}
                </h1>

                <p className="text-[7px] uppercase tracking-[0.3em] text-[#cdbba6]">
                  {tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() =>
                  setSearchOpen((value) => !value)
                }
                whileTap={
                  isEditorPreview
                    ? undefined
                    : {
                        scale: 0.94,
                      }
                }
                className="
                  flex
                  size-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#cfc3b7]
                  bg-[#f4efe8]
                  text-[#3a2d25]
                "
                aria-label="Search"
              >
                <Search
                  size={15}
                  strokeWidth={1.7}
                />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setShowCart(true)}
                whileHover={
                  isEditorPreview
                    ? undefined
                    : {
                        scale: 1.05,
                      }
                }
                whileTap={
                  isEditorPreview
                    ? undefined
                    : {
                        scale: 0.94,
                      }
                }
                className="
                  relative
                  flex
                  size-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f3ede3]
                  text-[#3a2d25]
                  shadow-[0_7px_20px_rgba(0,0,0,0.3)]
                "
                aria-label="Open cart"
              >
                <ShoppingCart
                  size={20}
                  strokeWidth={1.7}
                />

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
                      bg-[#b98a58]
                      text-[7px]
                      font-bold
                      text-white
                    "
                  >
                    {cartCount > 9
                      ? "9+"
                      : cartCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-[#cfc3b7]
                      bg-[#f5f0e9]
                      text-[#3a2d25]
                      px-4
                      py-2.5
                    "
                  >
                    <Search
                      size={13}
                      className="text-[#74655a]"
                    />

                    <input
                      value={query}
                      onChange={(event) =>
                        setQuery(event.target.value)
                      }
                      placeholder="Search products..."
                      className="
                        w-full
                        bg-transparent
                        text-[9px]
                        outline-none
                        placeholder:text-[#7f7167]
                      "
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="text-[#74655a]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="px-0 pt-5 md:px-0 md:pt-7">
          <motion.div
            initial={
              isEditorPreview
                ? undefined
                : {
                    opacity: 0,
                    scale: 0.97,
                    y: 15,
                  }
            }
            animate={
              isEditorPreview
                ? undefined
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }
            }
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              group
              relative
              min-h-[450px]
              overflow-hidden
              rounded-t-[72px]
              rounded-b-[18px]
              bg-[#c9b8a7]
              shadow-[0_25px_70px_rgba(58,45,37,0.16)]
              md:h-[560px]
            "
          >
            <motion.img
              initial={
                isEditorPreview
                  ? undefined
                  : {
                      scale: 1.08,
                    }
              }
              animate={
                isEditorPreview
                  ? undefined
                  : {
                      scale: 1,
                    }
              }
              transition={{
                duration: 1.5,
                ease: "easeOut",
              }}
              src={
                hero?.image ||
                products[0]?.image ||
                fallbackHero
              }
              alt={
                hero?.title ||
                "Home and furniture collection"
              }
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-[1600ms]
                group-hover:scale-[1.04]
              "
            />

            <div className="absolute inset-0 bg-black/10" />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/90
                via-black/40
                to-transparent
              "
            />

            <div className="absolute right-7 top-8 size-24 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute inset-x-0 bottom-0 p-6 pb-10 text-white md:p-10 md:pb-12">
              <motion.div
                initial={
                  isEditorPreview
                    ? undefined
                    : {
                        opacity: 0,
                        y: 20,
                      }
                }
                animate={
                  isEditorPreview
                    ? undefined
                    : {
                        opacity: 1,
                        y: 0,
                      }
                }
                transition={{
                  delay: 0.35,
                  duration: 0.7,
                }}
              >
                {hero?.eyebrow && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-px w-7 bg-white/60" />

                    <p className="text-[8px] uppercase tracking-[0.3em] text-white/80">
                      {hero.eyebrow}
                    </p>
                  </div>
                )}

                {hero?.title && (
                  <h2 className="max-w-[680px] font-serif text-[37px] leading-[1.04] tracking-[-0.025em] md:text-[52px] md:leading-[1.02]">
                    {hero.title}
                  </h2>
                )}

                {hero?.description && (
                  <p className="mt-5 max-w-[430px] text-[10px] leading-6 text-white/80 md:text-[11px] md:leading-6">
                    {hero.description}
                  </p>
                )}

                <button
                  type="button"
                  className="
                    mt-7
                    flex
                    items-center
                    gap-3
                    py-2.5
                    -my-2.5
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                  "
                >
                  Explore Collection
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ===================================================
            INTRO
        ==================================================== */}

        <motion.section
          initial={
            isEditorPreview
              ? undefined
              : {
                  opacity: 0,
                  y: 20,
                }
          }
          whileInView={
            isEditorPreview
              ? undefined
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
          }}
          className="hidden"
        >
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles
                  size={12}
                  className="text-[#7d6653]"
                />

                <p className="text-[8px] uppercase tracking-[0.3em] text-[#7d6653]">
                  The art of living
                </p>
              </div>

              <h2 className="max-w-xl font-serif text-[27px] leading-tight md:text-[35px]">
                Pieces with character,
                <br />
                spaces with soul.
              </h2>
            </div>

            <p className="max-w-[310px] text-[9px] leading-5 text-[#77695f]">
              Discover timeless furniture and considered
              objects designed to make everyday living feel
              beautiful.
            </p>
          </div>
        </motion.section>

        {/* ===================================================
            SHOP BY ROOM
        ==================================================== */}

        {/* ===================================================
            NEW COLLECTION
        ==================================================== */}

        <section className="@container bg-[#4b3a30] px-5 pb-32 pt-10 md:px-8 md:pb-40 md:pt-14">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-7 bg-[#cdbba6]" />

                <p className="text-[8px] uppercase tracking-[0.3em] text-[#cdbba6]">
                  New collection
                </p>
              </div>

              <h2 className="mt-2 font-serif text-[28px] leading-tight md:text-[36px]">
                Made for living
              </h2>
            </div>

            <p className="max-w-[300px] text-[9px] leading-5 text-[#d8c9b6]">
              Thoughtfully chosen pieces with timeless forms,
              natural textures and effortless character.
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-[20px] bg-[#e2d6c4] px-5 py-12 text-center text-[#3a2d25]">
              <Search
                size={25}
                className="mx-auto mb-3 text-[#8d7b6e]"
              />

              <p className="font-serif text-lg">
                No products found
              </p>

              <p className="mt-1 text-[8px] text-[#74655a]">
                Try another search term.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-3 @[560px]:grid-cols-3 @[560px]:gap-5 @[860px]:grid-cols-4">
              {pagedProducts.map(
                (product, index) => {
                  const price = Number(
                    product.price || 0
                  );

                  const mrp = Number(
                    product.mrp || 0
                  );

                  const hasDiscount = mrp > price;

                  const discount = hasDiscount
                    ? Math.round(
                        ((mrp - price) / mrp) * 100
                      )
                    : 0;

                  return (
                    <motion.article
                      key={product._id}
                      onClick={() => setSelectedProduct(product)}
                      initial={
                        isEditorPreview
                          ? undefined
                          : {
                              opacity: 0,
                              y: 30,
                            }
                      }
                      whileInView={
                        isEditorPreview
                          ? undefined
                          : {
                              opacity: 1,
                              y: 0,
                            }
                      }
                      viewport={{
                        once: true,
                        amount: 0.15,
                      }}
                      transition={{
                        duration: 0.65,
                        delay: index * 0.06,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      className="
                        group
                        flex
                        cursor-pointer
                        flex-col
                        overflow-hidden
                        rounded-[18px]
                        bg-[#f3ede3]
                        text-[#3a2d25]
                        shadow-[0_12px_35px_rgba(0,0,0,0.25)]
                      "
                    >
                      {/* Product image */}
                      <div className="relative aspect-square overflow-hidden bg-[#cdbfaf]">
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          whileHover={
                            isEditorPreview
                              ? undefined
                              : {
                                  scale: 1.06,
                                }
                          }
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                          }}
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70" />

                        {/* Number */}
                        <div
                          className="
                            absolute
                            left-2.5
                            top-2.5
                            flex
                            size-7
                            items-center
                            justify-center
                            rounded-full
                            bg-[#f7f2eb]/90
                            text-[7px]
                            font-semibold
                            text-[#3a2d25]
                            backdrop-blur-md
                          "
                        >
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        {/* Discount */}
                        {discount > 0 && (
                          <span
                            className="
                              absolute
                              right-2.5
                              top-2.5
                              rounded-full
                              bg-[#45362d]
                              px-2
                              py-1
                              text-[7px]
                              font-semibold
                              text-white
                            "
                          >
                            {discount}% OFF
                          </span>
                        )}

                      </div>

                      {/* Product details */}
                      <div className="flex flex-1 flex-col p-2.5 md:p-3">
                        <p className="text-[7px] uppercase tracking-[0.2em] text-[#7d6653]">
                          Curated piece
                        </p>

                        <h3 className="warm-living-product-name mt-1 line-clamp-1 font-serif font-semibold text-[13px] leading-tight text-[#3a2d25] md:text-[15px]">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="mt-auto flex items-center gap-1.5 pt-2 md:pt-3">
                          <span className="text-[12px] font-semibold text-[#3a2d25] md:text-[13px]">
                            ₹{formatPrice(price)}
                          </span>

                          {hasDiscount && (
                            <span className="text-[8px] text-[#7f7167] line-through">
                              ₹{formatPrice(mrp)}
                            </span>
                          )}
                        </div>

                      </div>
                    </motion.article>
                  );
                }
              )}
            </div>
          )}

          {!isEditorPreview && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              className="text-[#f3ede3]"
              activeClassName="bg-[#f3ede3] text-[#3a2d25]"
            />
          )}
        </section>

        {/* ===================================================
            PHILOSOPHY
        ==================================================== */}

        <motion.section
          initial={
            isEditorPreview
              ? undefined
              : {
                  opacity: 0,
                }
          }
          whileInView={
            isEditorPreview
              ? undefined
              : {
                  opacity: 1,
                }
          }
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
          }}
          className="hidden"
        >
          <div className="absolute left-1/2 top-0 size-48 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

          <Sparkles
            size={20}
            strokeWidth={1.3}
            className="relative mx-auto text-[#665448]"
          />

          <p className="relative mt-4 font-serif text-[27px] leading-tight md:text-[34px]">
            Designed to age beautifully.
          </p>

          <p className="relative mx-auto mt-3 max-w-[440px] text-[9px] leading-5 text-[#67584e]">
            We believe the most beautiful homes are not
            decorated overnight. They are collected slowly,
            intentionally, and with feeling.
          </p>
        </motion.section>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="hidden">
          <motion.div
            animate={
              isEditorPreview
                ? undefined
                : {
                    y: [0, -5, 0],
                  }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Armchair
              className="mx-auto mb-4"
              size={25}
              strokeWidth={1.4}
            />
          </motion.div>

          <p className="font-serif text-[23px]">
            Beautiful living starts here
          </p>

          <p className="mx-auto mt-2 max-w-[300px] text-[8px] leading-4 text-white/50">
            Designed for comfort • Crafted with care
          </p>

          <div className="mx-auto mt-5 h-px w-12 bg-white/20" />

          <p className="mt-4 text-[7px] uppercase tracking-[0.25em] text-white/35">
            {companyName}
          </p>
        </footer>

        {/* ===================================================
            EXISTING ORDER BAR
        ==================================================== */}

        {/* ===================================================
            FLOATING CART BAR
        ==================================================== */}

        <AnimatePresence>
          {(cartCount > 0 || isEditorPreview) && (
            <motion.div
              initial={{
                opacity: 0,
                y: 80,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 80,
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`
                ${isEditorPreview ? "absolute bottom-4 left-1/2 z-40 -translate-x-1/2" : "sticky bottom-0 mx-auto"}
                w-[calc(100%-24px)]
                max-w-4xl
              `}
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-[20px]
                  border
                  border-white/60
                  bg-[#f7f2eb]/95
                  text-[#3a2d25]
                  p-2
                  shadow-[0_18px_50px_rgba(58,45,37,0.22)]
                  backdrop-blur-xl
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowCart(true)
                  }
                  className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-2
                    rounded-[15px]
                    px-2
                    py-2
                    text-left
                  "
                >
                  <div
                    className="
                      relative
                      flex
                      size-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#3a2d25]
                      text-white
                    "
                  >
                    <ShoppingCart size={23} />

                    <span
                      className="
                        absolute
                        -right-1
                        -top-1
                        flex
                        size-[21px]
                        items-center
                        justify-center
                        rounded-full
                        bg-[#b98a58]
                        text-[8px]
                        font-bold
                      "
                    >
                      {cartCount > 9
                        ? "9+"
                        : cartCount}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#3a2d25]">
                      Your Cart
                    </p>

                    <p className="truncate text-[10px] text-[#74655a]">
                      {cartCount}{" "}
                      {cartCount === 1
                        ? "item"
                        : "items"}{" "}
                      • ₹
                      {formatPrice(cartTotal)}
                    </p>
                  </div>
                </button>

                <motion.button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={ordering}
                  whileTap={{
                    scale: 0.96,
                  }}
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-[14px]
                    bg-[#287b4a]
                    px-4
                    py-3
                    text-[10px]
                    font-bold
                    text-white
                    shadow-[0_7px_18px_rgba(40,123,74,0.2)]
                    transition
                    hover:bg-[#21683e]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <span>
                    {ordering
                      ? "Opening..."
                      : "WhatsApp"}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            CART DRAWER
        ==================================================== */}

        <AnimatePresence>
          {showCart && (
            <div className="fixed inset-0 z-[100]">
              {/* Overlay */}
              <motion.button
                type="button"
                aria-label="Close cart"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setShowCart(false)
                }
                className="
                  absolute
                  inset-0
                  bg-black/45
                  backdrop-blur-[3px]
                "
              />

              {/* Drawer */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: "100%",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: "100%",
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  absolute
                  bottom-0
                  left-1/2
                  flex
                  max-h-[86vh]
                  w-full
                  max-w-[520px]
                  -translate-x-1/2
                  flex-col
                  overflow-hidden
                  rounded-t-[30px]
                  bg-[#f4efe8]
                  text-[#3a2d25]
                  shadow-2xl
                "
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-[#d6cabe] px-5 py-4">
                  <div>
                    <p className="font-serif text-xl font-bold text-[#3a2d25]">
                      Your Cart
                    </p>

                    <p className="text-[11px] text-[#74655a]">
                      {cartCount}{" "}
                      {cartCount === 1
                        ? "item"
                        : "items"}{" "}
                      selected
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowCart(false)
                    }
                    className="
                      flex
                      size-9
                      items-center
                      justify-center
                      rounded-full
                      bg-[#d5c7b2]
                      text-[#3a2d25]
                    "
                    aria-label="Close cart"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Cart content */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  {cart.length === 0 ? (
                    <div className="py-14 text-center">
                      <ShoppingCart
                        size={30}
                        className="mx-auto mb-3 text-[#74655a]"
                      />

                      <p className="font-serif text-lg font-bold">
                        Your cart is empty
                      </p>

                      <p className="mt-1 text-[9px] text-[#74655a]">
                        Add something beautiful to
                        your collection.
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
                          <motion.div
                            layout
                            key={product._id}
                            className="
                              flex
                              gap-3
                              rounded-[18px]
                              bg-[#d5c7b2]
                              p-3
                            "
                          >
                            {/* Image */}
                            <div className="size-[76px] shrink-0 overflow-hidden rounded-[13px] bg-[#cdbfaf]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="truncate font-serif text-[20px] font-bold text-[#3a2d25]">
                                    {product.name}
                                  </h3>

                                  <p className="mt-0.5 text-[12px] text-[#74655a]">
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
                                    text-[#8c5d5d]
                                  "
                                  aria-label={`Remove ${product.name}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                {/* Quantity */}
                                <div
                                  className="
                                    flex
                                    items-center
                                    rounded-full
                                    border
                                    border-[#cfc3b7]
                                    bg-[#f8f4ef]
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
                                      text-[#3a2d25]
                                    "
                                  >
                                    <Minus size={11} />
                                  </button>

                                  <span className="w-8 text-center text-[12px] font-bold">
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
                                      text-[#3a2d25]
                                    "
                                  >
                                    <Plus size={11} />
                                  </button>
                                </div>

                                <span className="text-lg font-bold text-[#3a2d25]">
                                  ₹
                                  {formatPrice(
                                    itemTotal
                                  )}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                  <div className="border-t border-[#d6cabe] bg-[#fffaf5] px-5 pb-5 pt-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] text-[#74655a]">
                        Grand Total
                      </span>

                      <span className="text-xl font-black text-[#3a2d25]">
                        ₹{formatPrice(cartTotal)}
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
                        rounded-[15px]
                        bg-[#287b4a]
                        text-[10px]
                        font-bold
                        text-white
                        shadow-[0_10px_25px_rgba(40,123,74,0.2)]
                        transition
                        hover:bg-[#21683e]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <ShoppingCart size={15} />

                      {ordering
                        ? "Opening WhatsApp..."
                        : "Order on WhatsApp"}
                    </button>

                    <p className="mt-2 text-center text-[7px] text-[#7f7167]">
                      Your order details will be sent
                      directly to {companyName}.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
          if (selectedProduct) addProductToCart(selectedProduct);
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