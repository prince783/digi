"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Share2,
  Phone,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
  Sparkles,
  Truck,
  ShieldCheck,
  Zap,
} from "lucide-react";

import type {
  CatalogCategory,
  CatalogProduct,
} from "@/lib/catalogDummyData";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import Pagination from "./Pagination";

interface LuxuryDesertCatalog {
  companyName?: string;
  username?: string;
  description?: string;
  logo?: string;
  tagline?: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  category?: CatalogCategory;
  hero?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

interface LuxuryDesertCatalogTemplateProps {
  catalog?: LuxuryDesertCatalog;
  products: LuxuryDesertProduct[];
  isEditorPreview?: boolean;
}

type LuxuryDesertProduct = {
  id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  mrp: number;
  image: string;
  category?: CatalogCategory;
};

type CartItem = LuxuryDesertProduct & {
  quantity: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function cleanPhone(value?: string) {
  if (!value) return "";

  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length >= 12) {
    return digits;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

function getPrice(product: LuxuryDesertProduct) {
  return Number(product.sellingPrice || 0);
}

function getMrp(product: LuxuryDesertProduct) {
  return Number(product.mrp || 0);
}

function getDiscount(product: LuxuryDesertProduct) {
  const price = getPrice(product);
  const mrp = getMrp(product);

  if (!mrp || mrp <= price) {
    return 0;
  }

  return Math.round(((mrp - price) / mrp) * 100);
}

/*
 * ProductDetailsModal is shared across every catalog template and
 * expects the generic CatalogProduct shape (_id / price / mrp).
 * This template's own product type uses `id` and `sellingPrice`
 * instead, so it's adapted here before handing it to the modal.
 */
function toCatalogProduct(
  product: LuxuryDesertProduct
): CatalogProduct {
  return {
    _id: product.id,
    name: product.name,
    description: product.description || "",
    image: product.image,
    mrp: getMrp(product),
    price: getPrice(product),
    category: product.category as CatalogCategory,
  };
}

export default function LuxuryDesertCatalogTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: LuxuryDesertCatalogTemplateProps) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<LuxuryDesertProduct | null>(null);

  const companyName =
    catalog?.companyName || "Luxury Desert";

  const logo = catalog?.logo || "";

  const tagline = catalog?.tagline || "Curated collection";

  const heroTitle = catalog?.hero?.title || "";

  const heroDescription = catalog?.hero?.description || "";

  const heroImage = catalog?.hero?.image || "";

  const heroEyebrow = catalog?.hero?.eyebrow || "";

  const whatsappNumber = cleanPhone(
    catalog?.whatsapp || catalog?.phone
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description =
        product.description?.toLowerCase() || "";

      return (
        name.includes(query) ||
        description.includes(query)
      );
    });
  }, [products, search]);

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
  }, [search]);

  const addToCart = (product: LuxuryDesertProduct) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
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
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (id: string) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
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
          item.id === id
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
      current.filter((item) => item.id !== id)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + getPrice(item) * item.quantity,
    0
  );

  const discountCount = products.filter(
    (product) => getDiscount(product) > 0
  ).length;

  const shareCatalog = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: companyName,
          text: `Explore ${companyName}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        window.alert("Catalog link copied!");
      }
    } catch {
      // User cancelled sharing.
    }
  };

  const callCompany = () => {
    const phone = cleanPhone(
      catalog?.phone || catalog?.whatsapp
    );

    if (!phone) {
      window.alert(
        "Phone number is not available for this catalog."
      );
      return;
    }

    window.location.href = `tel:+${phone}`;
  };

  const orderOnWhatsApp = () => {
    if (!whatsappNumber || cart.length === 0) {
      return;
    }

    setOrdering(true);

    const productLines = cart
      .map((item, index) => {
        const price = getPrice(item);

        return [
          `${index + 1}. ${item.name}`,
          `Qty: ${item.quantity}`,
          `Price: ${formatCurrency(price)}`,
          `Amount: ${formatCurrency(
            price * item.quantity
          )}`,
        ].join("\n");
      })
      .join("\n\n");

    const message = [
      `Hello ${companyName},`,
      "",
      "I would like to order the following products:",
      "",
      productLines,
      "",
      `Total: ${formatCurrency(cartTotal)}`,
      "",
      `Catalog: ${window.location.href}`,
      "",
      "Please confirm availability and delivery details.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank");
    }

    window.setTimeout(() => {
      setOrdering(false);
    }, 800);
  };

  return (
    <main className="luxury-desert-public min-h-screen bg-[#f6f3ed] text-[#211f1b]">
      <style jsx global>{`
        .luxury-desert-public [class*="text-[7px]"] { font-size: 9px; }
        .luxury-desert-public [class*="text-[8px]"] { font-size: 10px; }
        .luxury-desert-public [class*="text-[9px]"] { font-size: 11px; }
        .luxury-desert-public [class*="text-[10px]"] { font-size: 12px; }
        .luxury-desert-public [class*="text-[11px]"] { font-size: 13px; }
        .luxury-desert-public [class*="text-[12px]"] { font-size: 14px; }
        .luxury-desert-public [class~="text-sm"] { font-size: 1rem; }
        .luxury-desert-public [class~="text-xl"] { font-size: 1.5rem; }
        .luxury-desert-public [class~="text-2xl"] { font-size: 1.75rem; }

        @keyframes luxuryReveal {
          0% {
            opacity: 0;
            transform: translateY(35px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes luxuryImage {
          0% {
            opacity: 0;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes luxuryFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        .luxury-reveal {
          animation: luxuryReveal 0.9s ease-out both;
        }

        .luxury-reveal-delay-1 {
          animation-delay: 0.12s;
        }

        .luxury-reveal-delay-2 {
          animation-delay: 0.24s;
        }

        .luxury-reveal-delay-3 {
          animation-delay: 0.36s;
        }

        .luxury-image {
          animation: luxuryImage 1.1s ease-out both;
        }

        .luxury-float {
          animation: luxuryFloat 5s ease-in-out infinite;
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#ddd6ca] bg-[#f6f3ed]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d7d0c4] bg-white">
              {logo ? (
                <img
                  src={logo}
                  alt={companyName}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <span className="text-xs font-semibold tracking-widest">
                  LD
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold tracking-[-0.02em]">
                {companyName}
              </h1>

              <p className="truncate text-[9px] uppercase tracking-[0.18em] text-[#89837a]">
                {tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={shareCatalog}
              className="flex h-9 items-center gap-2 rounded-full border border-[#d9d2c7] bg-white px-3 text-[10px] font-medium transition hover:bg-[#eee9e0] active:scale-95"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">
                Share
              </span>
            </button>

            <button
              type="button"
              onClick={callCompany}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d2c7] bg-white transition hover:bg-[#eee9e0] active:scale-95"
              aria-label="Call"
            >
              <Phone size={13} />
            </button>

            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#292722] text-white transition active:scale-95"
              aria-label="Cart"
            >
              <ShoppingBag size={14} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9a56b] px-1 text-[8px] font-bold text-[#211f1b]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto w-full max-w-[1440px] px-4 pt-5 sm:px-7 lg:px-10 lg:pt-7">
        <div className="relative min-h-[300px] overflow-hidden rounded-[28px] bg-[#ded6c9] shadow-[0_20px_70px_rgba(54,45,34,0.10)] sm:min-h-[380px] lg:min-h-[460px]">
          {heroImage ? (
            <img
              src={heroImage}
              alt={heroTitle}
              className="luxury-image absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#ddd4c5] via-[#c9bca9] to-[#a9957b]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-[#1d1914]/75 via-[#1d1914]/40 to-transparent" />

          <div className="relative z-10 flex min-h-[300px] max-w-[720px] flex-col justify-end px-6 py-8 sm:min-h-[380px] sm:px-10 sm:py-12 lg:min-h-[460px] lg:px-14 lg:py-14">
            <div className="luxury-reveal">
              {heroEyebrow && (
                <div className="mb-4 flex items-center gap-2 text-white/80">
                  <Sparkles size={13} />

                  <span className="text-[9px] uppercase tracking-[0.35em]">
                    {heroEyebrow}
                  </span>
                </div>
              )}
            </div>

            {heroTitle && (
              <h2 className="luxury-reveal luxury-reveal-delay-1 max-w-[650px] font-serif text-[34px] font-normal leading-[0.98] tracking-[-0.045em] text-white sm:text-[48px] lg:text-[64px]">
                {heroTitle}
              </h2>
            )}

            {heroDescription && (
              <p className="luxury-reveal luxury-reveal-delay-2 mt-5 max-w-[540px] text-[11px] leading-5 text-white/75 sm:text-[13px] sm:leading-6">
                {heroDescription}
              </p>
            )}

            <div className="luxury-reveal luxury-reveal-delay-3 mt-6 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
                {products.length} Products
              </span>

              {discountCount > 0 && (
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
                  {discountCount} Offers
                </span>
              )}
            </div>
          </div>

          <div className="luxury-float absolute bottom-7 right-7 hidden h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md sm:flex">
            <Sparkles
              size={18}
              className="text-white"
            />
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto w-full max-w-[1440px] px-4 pt-5 sm:px-7 lg:px-10">
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#ddd6ca] bg-[#ebe6dd]">
          <div className="flex items-center justify-center gap-2 border-r border-[#d8d0c4] px-2 py-4">
            <Truck
              size={14}
              className="text-[#6d655a]"
            />
            <span className="hidden text-[9px] font-medium uppercase tracking-[0.12em] text-[#625b51] sm:inline">
              Easy Delivery
            </span>
            <span className="text-[8px] font-medium text-[#625b51] sm:hidden">
              Delivery
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 border-r border-[#d8d0c4] px-2 py-4">
            <ShieldCheck
              size={14}
              className="text-[#6d655a]"
            />
            <span className="hidden text-[9px] font-medium uppercase tracking-[0.12em] text-[#625b51] sm:inline">
              Trusted Quality
            </span>
            <span className="text-[8px] font-medium text-[#625b51] sm:hidden">
              Quality
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 px-2 py-4">
            <Zap
              size={14}
              className="text-[#6d655a]"
            />
            <span className="hidden text-[9px] font-medium uppercase tracking-[0.12em] text-[#625b51] sm:inline">
              Direct Orders
            </span>
            <span className="text-[8px] font-medium text-[#625b51] sm:hidden">
              Direct Order
            </span>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section className="mx-auto w-full max-w-[1440px] px-4 pt-8 sm:px-7 sm:pt-10 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#8a8278]">
              Discover
            </p>

            <h3 className="mt-2 font-serif text-[27px] leading-none tracking-[-0.03em] sm:text-[32px]">
              The Collection
            </h3>

            <p className="mt-2 text-[10px] text-[#8a8379]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "piece"
                : "pieces"}{" "}
              selected for you
            </p>
          </div>

          <div className="relative w-full sm:w-[280px]">
            <Search
              size={13}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958d82]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search collection..."
              className="h-10 w-full rounded-full border border-[#d9d2c7] bg-white pl-10 pr-4 text-[10px] outline-none transition placeholder:text-[#aaa399] focus:border-[#aaa092]"
            />
          </div>
        </div>

        <div className="mt-6 h-px bg-[#ddd6ca]" />
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">
        {filteredProducts.length === 0 ? (
          <div className="rounded-[24px] border border-[#ddd6ca] bg-white px-6 py-20 text-center">
            <Search
              size={25}
              className="mx-auto text-[#918a80]"
            />

            <h3 className="mt-4 font-serif text-2xl">
              Nothing found
            </h3>

            <p className="mt-2 text-[10px] text-[#8d867c]">
              Try another product or keyword.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 ${
              isEditorPreview
                ? ""
                : "lg:grid-cols-4"
            }`}
          >
            {pagedProducts.map((product, index) => {
              const price = getPrice(product);
              const mrp = getMrp(product);
              const discount = getDiscount(product);

              return (
                <article
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group flex min-w-0 cursor-pointer flex-col"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[0.86] overflow-hidden rounded-[18px] border border-[#ded8ce] bg-[#e8e2d8]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[#8e877e]">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition group-hover:opacity-100" />

                    {discount > 0 && (
                      <span className="absolute left-2.5 top-2.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1.5 text-[7px] font-semibold tracking-[0.12em] text-[#8a4f43] backdrop-blur-sm sm:text-[8px]">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="flex flex-1 flex-col pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="min-w-0 truncate font-serif text-[18px] font-semibold leading-6 tracking-[-0.01em] sm:text-[18px]">
                        {product.name}
                      </h4>

                      {discount > 0 && (
                        <span className="shrink-0 text-[7px] uppercase tracking-wider text-[#987568]">
                          Sale
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <span className="text-[11px] font-semibold sm:text-[13px]">
                        {formatCurrency(price)}
                      </span>

                      {mrp > price && (
                        <span className="text-[8px] text-[#9a9389] line-through sm:text-[9px]">
                          {formatCurrency(mrp)}
                        </span>
                      )}
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isEditorPreview && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            className="text-[#292722]"
          />
        )}

      </section>

      {/* CART BAR */}
      {filteredProducts.length > 0 && (
        <div className="sticky bottom-0 z-40 mt-9">
          <div className="mx-auto flex w-full max-w-[1440px] gap-2 rounded-full border border-[#d9d2c7] bg-white p-1.5 shadow-[0_10px_30px_rgba(42,35,27,0.08)] sm:px-3">
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full px-3 py-1 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#292722] text-white">
                <ShoppingBag size={13} />
              </span>

              <span className="min-w-0">
                <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.08em]">
                  Your Selection
                </span>

                <span className="block truncate text-[7px] text-[#8d867c]">
                  {cartCount > 0
                    ? `${cartCount} ${
                        cartCount === 1
                          ? "item"
                          : "items"
                      } selected`
                    : "Add products to your selection"}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={orderOnWhatsApp}
              disabled={
                !whatsappNumber ||
                cart.length === 0 ||
                ordering
              }
              className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#b7d9c2] px-4 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#315743] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 sm:px-7 sm:text-[9px]"
            >
              <MessageCircle size={13} />

              <span>
                {ordering
                  ? "Opening..."
                  : "WhatsApp Order"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mx-auto mt-4 w-full max-w-[1440px] border-t border-[#ddd6ca] px-4 py-8 text-center sm:px-7 lg:px-10">
        <div className="mx-auto max-w-[500px]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#d7d0c4] bg-white">
            {logo ? (
              <img
                src={logo}
                alt={companyName}
                className="h-full w-full object-contain p-1.5"
              />
            ) : (
              <span className="text-xs font-semibold">
                LD
              </span>
            )}
          </div>

          <p className="mt-3 font-serif text-lg">
            {companyName}
          </p>

          <p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-[#928a80]">
            Curated with intention
          </p>
        </div>
      </footer>

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setShowCart(false)}
            className="absolute inset-0 h-full w-full bg-black/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-[#f6f3ed] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ded8ce] px-5 py-5">
              <div>
                <p className="text-[8px] uppercase tracking-[0.3em] text-[#8b8379]">
                  Your selection
                </p>

                <h3 className="mt-1 font-serif text-2xl">
                  Shopping Bag
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d2c7] bg-white"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag
                    size={26}
                    className="text-[#8d867c]"
                  />

                  <p className="mt-4 font-serif text-xl">
                    Your bag is empty
                  </p>

                  <p className="mt-1 text-[10px] text-[#8d867c]">
                    Add something beautiful to continue.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const price = getPrice(item);

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 border-b border-[#ded8ce] pb-4"
                      >
                        <div className="h-[76px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-[#e8e2d8]">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-3">
                            <h4 className="line-clamp-2 font-serif text-lg leading-6">
                              {item.name}
                            </h4>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  item.id
                                )
                              }
                              className="shrink-0 text-[#817a70]"
                              aria-label="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <p className="mt-1 text-[13px] font-semibold sm:text-sm">
                            {formatCurrency(price)}
                          </p>

                          <div className="mt-2 flex w-fit items-center rounded-full border border-[#d9d2c7] bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>

                            <span className="w-6 text-center text-[9px]">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#ded8ce] bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[#7f786e]">
                    Total
                  </span>

                  <span className="font-serif text-xl font-semibold">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={orderOnWhatsApp}
                  disabled={
                    !whatsappNumber || ordering
                  }
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#292722] text-[10px] font-medium uppercase tracking-[0.1em] text-white disabled:opacity-50"
                >
                  <MessageCircle size={14} />

                  {ordering
                    ? "Opening WhatsApp..."
                    : "Order on WhatsApp"}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <ProductDetailsModal
        product={
          selectedProduct ? toCatalogProduct(selectedProduct) : null
        }
        onClose={() => setSelectedProduct(null)}
        quantity={
          selectedProduct
            ? (cart.find((item) => item.id === selectedProduct.id)
                ?.quantity ?? 0)
            : 0
        }
        onAdd={() => {
          if (selectedProduct) addToCart(selectedProduct);
        }}
        onIncrease={() => {
          if (selectedProduct) increaseQuantity(selectedProduct.id);
        }}
        onDecrease={() => {
          if (selectedProduct) decreaseQuantity(selectedProduct.id);
        }}
      />
    </main>
  );
}