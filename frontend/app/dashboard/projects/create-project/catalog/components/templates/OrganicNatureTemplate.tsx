"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Heart,
  Leaf,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
  Check,
  Star,
} from "lucide-react";

import { getDiscount } from "@/lib/catalogDummyData";
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
   PUBLIC AYURVEDIC CATALOG
   NOTE:
   - Premium redesign applies ONLY to public catalog.
   - Editor preview keeps the compact editor-oriented layout.
========================================================= */

export default function OrganicNatureTemplate({
  catalog,
  products = [],
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const companyName = catalog?.companyName || "AyurLife";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Pure by Nature";
  const hero = catalog?.hero;

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)
      );
    });
  }, [products, query]);

  const featuredProducts = useMemo(
    () => filteredProducts,
    [filteredProducts]
  );

  const PRODUCTS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(featuredProducts.length / PRODUCTS_PER_PAGE)
  );

  const pagedProducts = isEditorPreview
    ? featuredProducts
    : featuredProducts.slice(
        (page - 1) * PRODUCTS_PER_PAGE,
        page * PRODUCTS_PER_PAGE
      );

  useEffect(() => {
    setPage(1);
  }, [query]);

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.product.price || 0) * item.quantity,
        0
      ),
    [cart]
  );

  function addToCart(
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
    setShowCart(true);
  }

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

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product._id !== productId
      )
    );
  }

  function sendToWhatsApp() {
    if (!cart.length || ordering) return;

    const whatsappNumber =
      catalog?.whatsapp || catalog?.phone;

    if (!whatsappNumber) {
      alert(
        "WhatsApp number is not available for this catalog."
      );
      return;
    }

    setOrdering(true);

    const catalogUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "";

    const orderLines = cart.map((item, index) => {
      const price = Number(item.product.price || 0);
      const total = price * item.quantity;

      return `${index + 1}. ${item.product.name}
Qty: ${item.quantity}
Price: ₹${formatPrice(price)}
Total: ₹${formatPrice(total)}`;
    });

    const message = [
      `🌿 *NEW ORDER REQUEST*`,
      ``,
      `*Store:* ${companyName}`,
      ``,
      `*Products:*`,
      ...orderLines,
      ``,
      `*GRAND TOTAL: ₹${formatPrice(cartTotal)}*`,
      ``,
      catalogUrl
        ? `Catalog: ${catalogUrl}`
        : "",
      ``,
      `Please confirm availability and order details.`,
    ]
      .filter(Boolean)
      .join("\n");

    const phone = cleanPhone(whatsappNumber);

    const orgWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = orgWhatsappUrl;
    } else {
      window.open(orgWhatsappUrl, "_blank");
    }

    setTimeout(() => setOrdering(false), 700);
  }

  /*
   * =======================================================
   * EDITOR PREVIEW
   *
   * The premium public layout below is intentionally not
   * rendered while editing.
   *
   * This keeps the editor preview compact and prevents the
   * public fixed navigation/cart treatment from affecting
   * the template preview.
   * =======================================================
   */

  if (isEditorPreview) {
    return (
      <div className="relative min-h-full overflow-x-hidden bg-[#f7f6e9] text-[#323e17]">
        <header className="px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4a5b24] text-white">
                {logo ? (
                  <img
                    src={logo}
                    alt={companyName}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Leaf size={17} />
                )}
              </div>

              <div className="min-w-0">
                <h1 className="truncate font-serif text-xl font-bold">
                  {companyName}
                </h1>

                <p className="text-[8px] uppercase tracking-[0.22em] text-[#687252]">
                  {tagline}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="relative flex size-11 items-center justify-center rounded-full bg-[#4a5b24] text-white shadow-sm"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#b15939] text-[9px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <section className="px-5 pb-7">
          <div className="overflow-hidden rounded-[30px] bg-[#dce5c6]">
            <div className="px-5 pb-5 pt-7">
              {hero?.eyebrow && (
                <p className="text-[9px] uppercase tracking-[0.22em] text-[#687252]">
                  {hero.eyebrow}
                </p>
              )}

              {hero?.title && (
                <h2 className="mt-2 font-serif text-[30px] leading-[1.02]">
                  {hero.title}
                </h2>
              )}

              {hero?.description && (
                <p className="mt-3 max-w-[250px] text-[10px] leading-4 text-[#687056]">
                  {hero.description}
                </p>
              )}
            </div>

            <img
              src={
                hero?.image ||
                products[0]?.image ||
                "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=900"
              }
              alt={hero?.title || "Natural wellness collection"}
              className="h-[180px] w-full object-cover"
            />
          </div>
        </section>

        <section className="px-4 pb-20 pt-2">
          <div className="mb-5 text-center">
            <p className="text-[8px] uppercase tracking-[0.3em] text-[#7e846f]">
              Natural • Pure • Effective
            </p>

            <h2 className="mt-1 font-serif text-2xl font-bold">
              Our Products
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const discount = getDiscount(
                product.mrp,
                product.price
              );

              return (
                <article
                  key={product._id}
                  onClick={() => setSelectedProduct(product)}
                  className="cursor-pointer overflow-hidden rounded-[22px] bg-[#eef0df]"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />

                    {discount > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#576a2b] px-2 py-1 text-[7px] font-bold text-white">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="line-clamp-1 font-serif text-[14px] font-bold">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-sm font-bold">
                        ₹{formatPrice(product.price)}
                      </span>

                      {product.mrp > product.price && (
                        <span className="text-[9px] text-[#7b8071] line-through">
                          ₹{formatPrice(product.mrp)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {cartCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-40 translate-y-0 p-3 opacity-100 transition-all duration-500 ease-out">
            <div className="flex items-center gap-2 rounded-full border border-[#444f29]/15 bg-[#f8f5e9]/95 p-2 shadow-[0_20px_70px_rgba(49,59,25,.2)] backdrop-blur-2xl">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-full px-2 py-1.5 text-left"
              >
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#3f4e1d] text-white">
                  <ShoppingBag size={16} />
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#b15939] text-[8px] font-bold">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-bold text-[#414c27]">
                    Your Cart
                  </span>
                  <span className="block truncate text-[10px] text-[#7b8071]">
                    {cartCount} {cartCount === 1 ? "item" : "items"} added
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={sendToWhatsApp}
                disabled={ordering}
                className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#3f4e1d] px-4 text-[11px] font-bold text-white disabled:opacity-60"
              >
                <ShoppingCart size={14} />
                {ordering ? "Opening..." : "Order"}
              </button>
            </div>
          </div>
        )}

        {showCart && (
          <div className="absolute inset-0 z-[100] bg-[#202710]/60 p-3">
            <div className="absolute bottom-0 left-3 right-3 max-h-[80%] overflow-y-auto rounded-t-[24px] bg-[#f7f3e8] p-4 text-[#323d17] shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl">Your Cart</h3>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-white"
                  aria-label="Close cart"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {cart.map(({ product, quantity }) => (
                  <div key={product._id} className="flex items-center gap-2 rounded-xl bg-white p-2">
                    <img src={product.image} alt={product.name} className="size-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">{product.name}</span>
                    <span className="text-xs">×{quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
      </div>
    );
  }

  /* =========================================================
     PUBLIC CATALOG
     ========================================================= */

  return (
    <div className="ayur-public relative min-h-screen bg-[#f3eee0] text-[#333b20]">

      {/* =====================================================
          PREMIUM ANIMATION SYSTEM
      ===================================================== */}

      <style jsx global>{`
        @keyframes ayurFadeUp {
          0% {
            opacity: 0;
            transform: translateY(28px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ayurFadeIn {
          0% {
            opacity: 0;
          }

          @keyframes ayurCartUp {
            0% {
              opacity: 0;
              transform: translateY(100%);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes ayurFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes ayurPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(76,91,40,0.18);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(76,91,40,0);
          }
        }

        @keyframes ayurShimmer {
          0% {
            transform: translateX(-130%);
          }
          100% {
            transform: translateX(130%);
          }
        }

        @keyframes ayurLeaf {
          0% {
            transform: rotate(-8deg) translateY(0);
          }
          50% {
            transform: rotate(8deg) translateY(-4px);
          }
          100% {
            transform: rotate(-8deg) translateY(0);
          }
        }

        .ayur-fade-up {
          animation: ayurFadeUp 0.8s cubic-bezier(.22,1,.36,1) both;
        }

        .ayur-fade-in {
          animation: ayurFadeIn 1s ease both;
        }

        .ayur-float {
          animation: ayurFloat 5s ease-in-out infinite;
        }

        .ayur-pulse {
          animation: ayurPulse 2.5s infinite;
        }

        .ayur-leaf {
          animation: ayurLeaf 4s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .ayur-delay-1 {
          animation-delay: .1s;
        }

        .ayur-delay-2 {
          animation-delay: .2s;
        }

        .ayur-delay-3 {
          animation-delay: .3s;
        }

        .ayur-delay-4 {
          animation-delay: .4s;
        }

        .ayur-delay-5 {
          animation-delay: .5s;
        }

        .ayur-product {
          transition:
            transform .55s cubic-bezier(.22,1,.36,1),
            box-shadow .55s cubic-bezier(.22,1,.36,1),
            border-color .4s ease;
        }

        .ayur-product:hover {
          transform: translateY(-8px);
          box-shadow:
            0 25px 60px rgba(63,72,41,.14),
            0 4px 12px rgba(63,72,41,.08);
        }

        .ayur-image {
          transition:
            transform 1s cubic-bezier(.22,1,.36,1),
            filter .6s ease;
        }

        .ayur-product:hover .ayur-image {
          transform: scale(1.065);
          filter: saturate(1.08);
        }

        .ayur-shine {
          position: relative;
          overflow: hidden;
        }

        .ayur-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 40%;
          transform: translateX(-150%) skewX(-18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.28),
            transparent
          );
          pointer-events: none;
        }

        .ayur-shine:hover::after {
          animation: ayurShimmer 1.1s ease;
        }

        .ayur-public [class*="text-[7px]"] { font-size: 9px; }
        .ayur-public [class*="text-[8px]"] { font-size: 10px; }
        .ayur-public [class*="text-[9px]"] { font-size: 11px; }
        .ayur-public [class*="text-[10px]"] { font-size: 12px; }
        .ayur-public [class*="text-[11px]"] { font-size: 13px; }
        .ayur-public [class*="text-[12px]"] { font-size: 14px; }
        .ayur-public [class*="text-[13px]"] { font-size: 15px; }
        .ayur-public [class~="text-sm"] { font-size: 1rem; }
        .ayur-public [class~="text-lg"] { font-size: 1.25rem; }
        .ayur-public [class~="text-xl"] { font-size: 1.5rem; }
        .ayur-public [class~="text-2xl"] { font-size: 1.75rem; }
        .ayur-public [class~="text-3xl"] { font-size: 2rem; }

        @media (prefers-reduced-motion: reduce) {
          .ayur-public *,
          .ayur-public *::before,
          .ayur-public *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* =====================================================
          TOP ANNOUNCEMENT
      ===================================================== */}

      <div className="relative z-50 bg-[#323d17] text-[#e7d9a8]">
        <div className="mx-auto flex h-9 w-full max-w-7xl items-center justify-center px-4 text-center">
          <p className="text-[8px] font-medium uppercase tracking-[0.25em] sm:text-[9px] sm:tracking-[0.32em]">
            Ancient Wisdom • Modern Wellness • Purely Natural
          </p>
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#444f29]/10 bg-[#f7f3e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center justify-between px-5 sm:h-[82px] sm:px-8 lg:px-10">

          {/* Brand */}

          <a
            href="#home"
            className="group flex min-w-0 items-center gap-3"
          >
            <span className="ayur-float flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c88e79]/60 bg-[#e7ead7] text-[#4d5d27] shadow-sm sm:size-14">
              {logo ? (
                <img
                  src={logo}
                  alt={companyName}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Leaf
                  size={20}
                  strokeWidth={1.5}
                />
              )}
            </span>

            <span className="block min-w-0">
              <span className="block truncate font-serif text-xl font-bold tracking-[-0.02em] text-[#323b1e]">
                {companyName}
              </span>

              <span className="hidden text-[7px] font-medium uppercase tracking-[0.3em] text-[#7b806e] sm:block">
                {tagline}
              </span>
            </span>
          </a>

          {/* Desktop navigation */}

          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#home"
              className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#414b29] transition hover:text-[#a14c2d]"
            >
              Home
            </a>

            <a
              href="#collection"
              className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#414b29] transition hover:text-[#a14c2d]"
            >
              Collection
            </a>

            <a
              href="#philosophy"
              className="hidden"
            >
              Philosophy
            </a>

            <a
              href="#promise"
              className="hidden"
            >
              Our Promise
            </a>
          </nav>

          {/* Cart */}

          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="ayur-pulse relative flex size-11 items-center justify-center rounded-full border border-[#444f29]/15 bg-white/70 text-[#3f4c21] transition hover:bg-[#3f4c21] hover:text-white"
            aria-label="Open shopping cart"
          >
            <ShoppingBag
              size={17}
              strokeWidth={1.5}
            />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#b15838] text-[7px] font-bold text-white shadow-sm">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="home"
        className="relative overflow-hidden border-b border-[#444f29]/10"
      >
        <div className="absolute -left-32 top-20 size-72 rounded-full bg-[#d9dfbf]/50 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-80 rounded-full bg-[#e7d6a3]/30 blur-3xl" />

        <div className="relative mx-auto grid min-h-[620px] w-full max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-16 xl:min-h-[700px]">

          {/* Hero copy */}

          <div className="relative z-10 min-w-0 ayur-fade-up">
            {hero?.eyebrow && (
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-10 bg-[#b05a3b]" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#7d8065]">
                  {hero.eyebrow}
                </span>
              </div>
            )}

            {hero?.title && (
              <h1 className="max-w-[680px] [overflow-wrap:anywhere] font-serif text-[clamp(48px,8vw,94px)] font-medium leading-[.9] tracking-[-0.055em] text-[#303b18]">
                {hero.title}
              </h1>
            )}

            {hero?.description && (
              <p className="mt-7 max-w-[510px] [overflow-wrap:anywhere] text-[12px] leading-7 text-[#6e7263] sm:text-[13px]">
                {hero.description}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#collection"
                className="ayur-shine group inline-flex h-12 items-center gap-3 rounded-full bg-[#42511e] px-6 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(66,81,30,.18)] transition hover:-translate-y-1 hover:bg-[#333f17]"
              >
                Explore Collection

                <ArrowRight
                  size={14}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </a>

              {products[0] && (
                <button
                  type="button"
                  onClick={() => addToCart(products[0])}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-[#444f29]/20 bg-white/60 px-5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#444f29] transition hover:-translate-y-1 hover:border-[#444f29]/40 hover:bg-white"
                >
                  <ShoppingBag size={14} />
                  Shop Now
                </button>
              )}
            </div>

            <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#444f29]/10 pt-7">
              <MiniTrust
                icon={<Leaf size={13} />}
                text="Plant Based"
              />

              <MiniTrust
                icon={<ShieldCheck size={13} />}
                text="Pure Ingredients"
              />

              <MiniTrust
                icon={<Heart size={13} />}
                text="Made With Care"
              />
            </div>
          </div>

          {/* Hero visual */}

          <div className="relative ayur-fade-up ayur-delay-2">
            <div className="absolute -inset-4 rounded-[40px] border border-[#b47660]/15" />

            <div className="relative mx-auto max-w-[680px] overflow-hidden rounded-[34px] bg-[#dfe5cf] shadow-[0_35px_90px_rgba(59,66,42,.16)]">
              <img
                src={
                  hero?.image ||
                  products[0]?.image ||
                  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200"
                }
                alt={
                  hero?.title ||
                  "Natural wellness collection"
                }
                className="h-[430px] w-full object-cover sm:h-[560px] lg:h-[610px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#323d17]/45 via-transparent to-white/10" />

              <div className="absolute bottom-5 left-5 right-5 rounded-[22px] border border-white/25 bg-white/15 p-4 text-white shadow-xl backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.25em] text-white/65">
                      The Ayurvedic Edit
                    </p>

                    <p className="mt-1 font-serif text-xl">
                      Pure. Grounded. Timeless.
                    </p>
                  </div>

                  <div className="ayur-leaf flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e4d39c]/90 text-[#404c23]">
                    <Leaf size={17} />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decorative card */}

            <div className="ayur-float absolute -bottom-5 -left-3 hidden rounded-2xl border border-[#d4a999]/40 bg-[#f7f3e8]/95 p-4 shadow-[0_20px_50px_rgba(53,61,35,.12)] sm:block lg:-left-8">
              <Sparkles
                size={17}
                className="text-[#a95334]"
              />

              <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.16em] text-[#404b28]">
                Rooted In Nature
              </p>

              <p className="mt-1 text-[7px] text-[#7c8072]">
                Traditional wellness
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION HEADER + SEARCH
      ===================================================== */}

      <section
        id="collection"
        className="mx-auto w-full max-w-7xl px-5 pb-8 pt-20 sm:px-8 lg:px-10 lg:pt-28"
      >
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_380px]">

          <div className="ayur-fade-up">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-[#b05a3b]" />

              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#7b816e]">
                Curated Collection
              </p>
            </div>

            <h2 className="mt-5 font-serif text-[clamp(42px,6vw,72px)] leading-[.9] tracking-[-.05em] text-[#303b18]">
              Wellness,
              <br />
              <span className="italic text-[#76815e]">
                naturally.
              </span>
            </h2>

            <p className="mt-5 max-w-[520px] text-[11px] leading-6 text-[#7b8071] sm:text-[12px]">
              Explore our collection of natural and
              Ayurvedic-inspired products created for
              everyday rituals, balance and wellbeing.
            </p>
          </div>

          <div className="ayur-fade-up ayur-delay-2">
            <div className="flex h-14 items-center gap-3 rounded-full border border-[#444f29]/10 bg-white/70 px-5 shadow-[0_10px_35px_rgba(54,63,34,.05)] backdrop-blur-xl">
              <Search
                size={16}
                className="shrink-0 text-[#7b816e]"
              />

              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search products..."
                className="w-full bg-transparent text-[10px] text-[#333b20] outline-none placeholder:text-[#8f9385]"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e5eadb] text-[#4c5731]"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between px-3">
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#8e9284]">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "Product"
                  : "Products"}
              </p>

              <p className="text-[8px] text-[#a15235]">
                Carefully selected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      <section className="mx-auto w-full max-w-7xl px-5 pb-36 sm:px-8 lg:px-10">
        {filteredProducts.length === 0 ? (
          <div className="rounded-[32px] border border-[#444f29]/10 bg-[#e8ead9] px-6 py-20 text-center">
            <Leaf
              size={32}
              strokeWidth={1.2}
              className="mx-auto text-[#697255]"
            />

            <h3 className="mt-5 font-serif text-2xl text-[#37411f]">
              No products found
            </h3>

            <p className="mt-2 text-[10px] text-[#818578]">
              Try another search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {pagedProducts.map((product, index) => (
              <PublicProductCard
                key={product._id}
                product={product}
                index={index}
                onCardClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {!isEditorPreview && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            className="text-[#333b20]"
          />
        )}
      </section>

      {/* =====================================================
          PHILOSOPHY
      ===================================================== */}

      <section
        id="philosophy"
        className="hidden"
      >
        <div className="absolute -left-32 top-1/2 size-80 -translate-y-1/2 rounded-full bg-[#d0927c]/10 blur-3xl" />

        <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-[#93a26f]/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-32">

          <div className="ayur-fade-up">
            <div className="flex items-center gap-3">
              <Sparkles
                size={15}
                className="text-[#d58f75]"
              />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#b8ba9e]">
                Our Philosophy
              </span>
            </div>

            <h2 className="mt-6 font-serif text-[clamp(42px,6vw,75px)] leading-[.9] tracking-[-.05em]">
              Return to
              <br />
              <span className="italic text-[#d99f8a]">
                nature.
              </span>
            </h2>
          </div>

          <div className="flex items-center ayur-fade-up ayur-delay-2">
            <div className="max-w-[620px]">
              <p className="text-[13px] leading-7 text-white/65 sm:text-[15px]">
                Ayurveda teaches us that wellbeing is
                not about chasing perfection. It is about
                creating harmony between ourselves,
                nature and the rituals we repeat every day.
              </p>

              <p className="mt-6 text-[13px] leading-7 text-white/65 sm:text-[15px]">
                Every product in this collection is chosen
                with that philosophy in mind — simple,
                thoughtful and deeply connected to the
                natural world.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <span className="h-px w-12 bg-[#b66548]" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#d99f8a]">
                  {tagline}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PREMIUM PROMISE
      ===================================================== */}

      <section
        id="promise"
        className="hidden"
      >
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">

          <div className="relative overflow-hidden rounded-[34px] bg-[#dfe5cf]">
            <img
              src={
                products[1]?.image ||
                products[0]?.image ||
                "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900"
              }
              alt="Ayurvedic wellness"
              className="h-[430px] w-full object-cover sm:h-[550px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#303b18]/35 to-transparent" />

            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/25 bg-white/15 px-5 py-4 text-white backdrop-blur-xl">
              <p className="text-[7px] uppercase tracking-[0.25em] text-white/60">
                Nature's ritual
              </p>

              <p className="mt-1 font-serif text-xl">
                Slow down. Breathe. Restore.
              </p>
            </div>
          </div>

          <div className="lg:pl-10">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#a15336]">
              The Ayurvedic Promise
            </p>

            <h2 className="mt-5 font-serif text-[clamp(42px,5vw,70px)] leading-[.92] tracking-[-.05em] text-[#35401c]">
              Beautiful rituals
              <br />
              for everyday
              <br />
              <span className="italic text-[#788261]">
                wellbeing.
              </span>
            </h2>

            <p className="mt-7 max-w-[520px] text-[12px] leading-7 text-[#7c8073]">
              We believe the best wellness rituals are
              the ones that become part of your life.
              Gentle, intentional and inspired by the
              wisdom of nature.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <PromiseCard
                icon={<Leaf />}
                title="Nature First"
                text="Inspired by traditional plant wisdom."
              />

              <PromiseCard
                icon={<ShieldCheck />}
                title="Thoughtfully Chosen"
                text="Products selected with care."
              />

              <PromiseCard
                icon={<Heart />}
                title="Made For Rituals"
                text="Designed for everyday wellbeing."
              />

              <PromiseCard
                icon={<Sparkles />}
                title="Timeless Wellness"
                text="Simple practices that last."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="hidden">
        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] bg-[#dfdfc9]">
          <div className="relative px-6 py-20 text-center sm:px-10 lg:py-28">
            <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b9c59f]/40 blur-3xl" />

            <div className="relative">
              <Leaf
                size={25}
                strokeWidth={1.2}
                className="ayur-leaf mx-auto text-[#4f5c31]"
              />

              <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.32em] text-[#7a806d]">
                Begin Your Ritual
              </p>

              <h2 className="mx-auto mt-5 max-w-[760px] font-serif text-[clamp(40px,6vw,72px)] leading-[.92] tracking-[-.05em] text-[#303b18]">
                Choose something
                <br />
                <span className="italic text-[#77815f]">
                  naturally beautiful.
                </span>
              </h2>

              <a
                href="#collection"
                className="ayur-shine mt-9 inline-flex h-12 items-center gap-3 rounded-full bg-[#3f4e1d] px-7 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_15px_40px_rgba(63,78,29,.18)] transition hover:-translate-y-1"
              >
                Explore Products
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="hidden">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-12 md:grid-cols-[1.2fr_.8fr_.8fr]">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10">
                  <Leaf size={20} />
                </div>

                <div>
                  <h3 className="font-serif text-2xl">
                    {companyName}
                  </h3>

                  <p className="text-[7px] uppercase tracking-[0.3em] text-white/45">
                    {tagline}
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-[360px] text-[10px] leading-6 text-white/55">
                Natural and Ayurvedic-inspired products
                thoughtfully selected for mindful everyday
                living.
              </p>
            </div>

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#d29078]">
                Explore
              </p>

              <div className="mt-5 space-y-3">
                <a
                  href="#home"
                  className="block text-[9px] text-white/65 transition hover:text-white"
                >
                  Home
                </a>

                <a
                  href="#collection"
                  className="block text-[9px] text-white/65 transition hover:text-white"
                >
                  Collection
                </a>

                <a
                  href="#philosophy"
                  className="block text-[9px] text-white/65 transition hover:text-white"
                >
                  Philosophy
                </a>

                <a
                  href="#promise"
                  className="block text-[9px] text-white/65 transition hover:text-white"
                >
                  Our Promise
                </a>
              </div>
            </div>

            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#d29078]">
                Contact
              </p>

              <div className="mt-5 space-y-3 text-[9px] text-white/60">
                {catalog?.phone && (
                  <p>{catalog.phone}</p>
                )}

                {catalog?.whatsapp && (
                  <p>{catalog.whatsapp}</p>
                )}

                {catalog?.email && (
                  <p>{catalog.email}</p>
                )}

                {!catalog?.phone &&
                  !catalog?.whatsapp &&
                  !catalog?.email && (
                    <p>Connect with us for details.</p>
                  )}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-center text-[7px] uppercase tracking-[0.25em] text-white/35 sm:text-left">
            © {new Date().getFullYear()}{" "}
            {companyName}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* =====================================================
          PUBLIC STICKY CART
      ===================================================== */}

      {cartCount > 0 && (
        <div className="sticky bottom-0 z-40 animate-[ayurCartUp_500ms_ease-out] px-3 py-4 sm:px-5">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-2 rounded-full border border-[#444f29]/15 bg-[#f8f5e9]/90 p-2 shadow-[0_20px_70px_rgba(49,59,25,.2)] backdrop-blur-2xl">

            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-full px-2 py-1.5 text-left transition hover:bg-white/60 sm:px-3"
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#3f4e1d] text-white">
                <ShoppingBag size={16} />

                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#b15939] text-[7px] font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              </span>

              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#414c27]">
                  Your Selection
                </span>

                <span className="mt-0.5 block truncate font-serif text-[18px] text-[#323d17] sm:text-xl">
                  ₹{formatPrice(cartTotal)}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={sendToWhatsApp}
              disabled={ordering}
              className="ayur-shine flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#3f4e1d] px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#303c15] disabled:opacity-60 sm:px-6 sm:text-xs"
            >
              <ShoppingCart size={14} />

              <span className="hidden xs:inline sm:inline">
                {ordering
                  ? "Opening..."
                  : "Order on WhatsApp"}
              </span>

              <span className="sm:hidden">
                {ordering ? "..." : "Order"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          CART DRAWER
      ===================================================== */}

      {showCart && (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setShowCart(false)}
            className="absolute inset-0 bg-[#202710]/60 backdrop-blur-sm"
          />

          <div className="absolute bottom-0 left-1/2 flex max-h-[88vh] w-full max-w-[580px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[32px] border border-white/40 bg-[#f7f3e8] shadow-[0_-30px_100px_rgba(31,39,13,.25)]">

            {/* Drawer header */}

            <div className="flex items-center justify-between border-b border-[#444f29]/10 px-6 py-5 sm:px-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#818676] sm:text-xs">
                  Your Selection
                </p>

                <h3 className="mt-1 font-serif text-4xl text-[#323d17] sm:text-5xl">
                  Shopping Bag
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="flex size-10 items-center justify-center rounded-full border border-[#444f29]/10 bg-white/60 text-[#434e28] transition hover:bg-[#434e28] hover:text-white"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cart content */}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e5ead9] text-[#5c6742]">
                    <ShoppingBag size={25} />
                  </div>

                  <h4 className="mt-5 font-serif text-2xl text-[#323d17]">
                    Your bag is empty
                  </h4>

                  <p className="mx-auto mt-2 max-w-[260px] text-[9px] leading-5 text-[#818578]">
                    Discover something beautiful for
                    your daily wellness ritual.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const product = item.product;

                    const itemTotal =
                      Number(product.price || 0) *
                      item.quantity;

                    return (
                      <div
                        key={product._id}
                        className="group flex gap-3 rounded-[22px] border border-[#444f29]/8 bg-white/55 p-3 transition hover:bg-white"
                      >
                        <div className="size-[82px] shrink-0 overflow-hidden rounded-[17px] bg-[#dfe5cf] sm:size-[90px]">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate font-serif text-[20px] font-semibold text-[#35401d] sm:text-[22px]">
                                {product.name}
                              </h4>

                              <p className="mt-1 text-[12px] text-[#828679] sm:text-[14px]">
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
                              className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#9a6863] transition hover:bg-[#f2dfdc]"
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center overflow-hidden rounded-full border border-[#444f29]/10 bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    product._id
                                  )
                                }
                                className="flex size-8 items-center justify-center text-[#4c5731] transition hover:bg-[#e9eedf]"
                              >
                                <Minus size={11} />
                              </button>

                              <span className="w-7 text-center text-[9px] font-bold text-[#3f4b24]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    product._id
                                  )
                                }
                                className="flex size-8 items-center justify-center text-[#4c5731] transition hover:bg-[#e9eedf]"
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            <span className="font-serif text-lg font-semibold text-[#323d17]">
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

            {/* Cart footer */}

            {cart.length > 0 && (
              <div className="border-t border-[#444f29]/10 bg-[#ecebdc]/90 px-5 pb-6 pt-5 sm:px-7">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#818578]">
                      Total
                    </p>

                    <p className="mt-1 text-[8px] text-[#8d9184]">
                      {cartCount}{" "}
                      {cartCount === 1
                        ? "item"
                        : "items"}
                    </p>
                  </div>

                  <span className="font-serif text-3xl font-semibold text-[#323d17]">
                    ₹{formatPrice(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={ordering}
                  className="ayur-shine mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#3f4e1d] text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_15px_40px_rgba(63,78,29,.18)] transition hover:-translate-y-0.5 hover:bg-[#313d15] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShoppingCart size={15} />

                  {ordering
                    ? "Opening WhatsApp..."
                    : "Complete Order on WhatsApp"}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[7px] uppercase tracking-[0.15em] text-[#8d9184]">
                  <Check size={11} />
                  Order confirmation via WhatsApp
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}

/* =========================================================
   PUBLIC PRODUCT CARD
========================================================= */

function PublicProductCard({
  product,
  index,
  onCardClick,
}: {
  product: CatalogTemplateProps["products"][number];
  index: number;
  onCardClick: () => void;
}) {
  const discount = getDiscount(
    product.mrp,
    product.price
  );

  return (
    <article
      onClick={onCardClick}
      className={`ayur-product ayur-fade-up ayur-delay-${Math.min(
        index + 1,
        5
      )} group flex h-full cursor-pointer flex-col overflow-hidden rounded-[25px] border border-[#444f29]/8 bg-[#f8f6ec]`}
    >
      {/* Image */}

      <div className="ayur-shine relative aspect-[.86] overflow-hidden bg-[#dfe5cf]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="ayur-image h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-[#7c816f]">
            No image
          </div>
        )}

        {/* Image overlay */}

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#313d16]/20 to-transparent" />

        {/* Discount */}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#404d21]/90 px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.08em] text-white shadow-sm backdrop-blur">
            {discount}% Off
          </span>
        )}

        {/* Natural badge */}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/15 px-2.5 py-1.5 text-white backdrop-blur-md">
          <Leaf size={9} />

          <span className="text-[6px] font-bold uppercase tracking-[0.1em]">
            Natural
          </span>
        </div>
      </div>

      {/* Product details */}

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div>
          <h3 className="line-clamp-1 font-serif text-[18px] font-semibold leading-tight text-[#35401d] sm:text-[21px]">
            {product.name}
          </h3>
        </div>

        {/* Price */}

        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-3">
          <span className="font-serif text-[18px] font-semibold text-[#37421c] sm:text-[20px]">
            ₹{formatPrice(product.price)}
          </span>

          {product.mrp > product.price && (
            <span className="text-[8px] text-[#9b9e93] line-through">
              ₹{formatPrice(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MINI TRUST
========================================================= */

function MiniTrust({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-full bg-[#e5e8d7] text-[#5b6641]">
        {icon}
      </span>

      <span className="text-[7px] font-semibold uppercase tracking-[0.12em] text-[#6e7263]">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   PROMISE CARD
========================================================= */

function PromiseCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-[20px] border border-[#444f29]/8 bg-[#f7f5eb] p-4 transition duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_15px_40px_rgba(57,66,37,.08)]">
      <div className="flex size-9 items-center justify-center rounded-full bg-[#e2e8d7] text-[#4f5c31] transition duration-500 group-hover:scale-110">
        {icon}
      </div>

      <h3 className="mt-4 font-serif text-[17px] font-semibold text-[#3c4721]">
        {title}
      </h3>

      <p className="mt-1.5 text-[8px] leading-4 text-[#808478]">
        {text}
      </p>
    </div>
  );
}