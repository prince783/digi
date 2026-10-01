"use client";

import { useMemo, useState } from "react";

import {
  buildCatalogPublicUrl,
  resolveConfiguredBaseUrl,
} from "@/lib/publicUrl";

import {
  Gem,
  Leaf,
  Crown,
  Gift,
  Heart,
  Cake,
  Diamond,
  PartyPopper,
  Phone,
  Globe,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import {
} from "react-icons/fa6";

import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

/* =========================================================
   CART ITEM
========================================================= */

type CartItem = {
  _id: string;
  name: string;
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
  return digits.length === 10 ? `91${digits}` : digits;
}

const FEATURES = [
  { icon: Gem, label: "Premium Quality" },
  { icon: Leaf, label: "Skin Friendly & Safe" },
  { icon: Crown, label: "Trendy & Traditional" },
  { icon: Gift, label: "Perfect for Every Occasion" },
];

const GIFT_OCCASIONS = [
  { icon: Cake, label: "Birthdays" },
  { icon: Heart, label: "Anniversaries" },
  { icon: Diamond, label: "Weddings" },
  { icon: PartyPopper, label: "Festive Gifting" },
];

/* =========================================================
   RIVAARA JEWELLERY TEMPLATE

   Jewellery-brand storefront: cream/gold hero, a product grid
   styled as "starting from" collection cards, a gift/occasion
   banner, and a dark-green contact footer.

   Uses @container queries (not sm:/lg:) throughout — this
   renders inside preview boxes of varying widths (the editor's
   phone mockup, admin template gallery cards) on a desktop
   browser, so regular viewport breakpoints would key off the
   BROWSER window, not the box, and stay in "desktop" layout
   even inside a 350px-wide box.
========================================================= */

export default function RivaaraJewelleryTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName = catalog?.companyName || "Rivaara Jewellery";
  const logo = catalog?.logo || "";
  const tagline = catalog?.tagline || "Always with you";
  const hero = catalog?.hero;

  /* =======================================================
     CART STATE
  ======================================================= */

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

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.price || 0) * item.quantity,
        0,
      ),
    [cart],
  );

  const addToCart = (product: (typeof products)[number]) => {
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...current,
        {
          _id: product._id,
          name: product.name,
          image: product.image,
          price: Number(product.price || 0),
          mrp: Number(product.mrp || 0),
          quantity: 1,
        },
      ];
    });
    setShowCart(true);
  };

  const increaseQuantity = (id: string) => {
    setCart((current) =>
      current.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity = (id: string) => {
    setCart((current) =>
      current
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item._id !== id));
  };

  const sendToWhatsApp = () => {
    if (cart.length === 0) {
      setShowCart(true);
      return;
    }

    const phone = cleanPhone(catalog?.whatsapp || catalog?.phone);
    if (!phone) {
      alert("WhatsApp number is not available for this catalog.");
      return;
    }

    setOrdering(true);

    let message = `Hello ${companyName},\n\nI would like to order the following products:\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `Quantity: ${item.quantity}\n`;
      message += `Amount: ${formatPrice(item.price * item.quantity)}\n\n`;
    });
    message += `Total: ${formatPrice(cartTotal)}\n\n`;
    message += catalog?.username
      ? `Catalog: ${buildCatalogPublicUrl(
          catalog.username,
          resolveConfiguredBaseUrl(window.location.origin),
        )}\n\n`
      : `Catalog: ${window.location.href}\n\n`;
    message += "Please confirm availability and delivery details.";

    const rivaaraWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = rivaaraWhatsappUrl;
    } else {
      window.open(rivaaraWhatsappUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => setOrdering(false), 1000);
  };

  const scrollToCollection = () => {
    document
      .getElementById("rivaara-collection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="@container/rivaara relative min-h-full w-full bg-[#FAF6EE] text-[#241A10]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-[#e8ddc8]">
        <div className="grid @lg/rivaara:grid-cols-[1.3fr_1fr]">
          {/* LEFT — brand + badges */}

          <div className="relative bg-[#0d2018] px-6 py-10 @sm/rivaara:px-10 @sm/rivaara:py-14">
            <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full border border-[#c8a35a]/30" />

            {logo ? (
              <img
                src={logo}
                alt={companyName}
                className="mx-auto mb-3 h-12 w-12 object-contain @sm/rivaara:mx-0"
              />
            ) : (
              <Gem
                size={34}
                className="mx-auto mb-3 text-[#b8912f] @sm/rivaara:mx-0"
                strokeWidth={1.3}
              />
            )}

            <h1 className="text-center font-serif text-4xl font-bold tracking-tight text-[#f2ece2] @sm/rivaara:text-left @sm/rivaara:text-5xl">
              {companyName}
            </h1>

            {hero?.eyebrow && (
              <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.35em] text-[#b8912f] @sm/rivaara:text-left">
                {hero.eyebrow}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-4 border-t border-white/15 pt-6 @sm/rivaara:justify-start">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex w-20 flex-col items-center text-center">
                  <Icon size={20} className="text-[#b8912f]" strokeWidth={1.5} />
                  <span className="mt-2 text-[11px] font-medium leading-tight text-[#cdbba6]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={scrollToCollection}
              className="mx-auto mt-8 flex h-11 w-fit items-center gap-2 rounded-full bg-[#f2ece2] px-6 text-xs font-semibold uppercase tracking-wider text-[#0d2018] transition hover:bg-white @sm/rivaara:mx-0"
            >
              Explore Collection
            </button>
          </div>

          {/* RIGHT — portrait + dark accent panel */}

          <div className="relative flex min-h-[260px] items-end overflow-hidden bg-gradient-to-br from-[#3a2a18] via-[#241A10] to-[#1a120a] @sm/rivaara:min-h-[340px]">
            {hero?.image && (
              <img
                src={hero.image}
                alt={companyName}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#150e08]/90 via-[#150e08]/10 to-transparent" />

            <div className="relative w-full px-6 pb-7 @sm/rivaara:px-8">
              {hero?.title && (
                <p className="text-lg font-medium leading-tight text-white/90">
                  {hero.title}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c8a35a]">
                <span>Tradition</span>
                <span>Beauty</span>
                <span>Elegance</span>
                <span>You</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION
      ===================================================== */}

      <section id="rivaara-collection" className="mx-auto max-w-6xl px-5 py-12 @sm/rivaara:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#b8912f]">
            Our Collection
          </p>
          <p className="mt-1 text-xs text-[#8a7860]">
            For every moment, a special shine
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#e8ddc8] bg-white/60 py-16 text-center text-sm text-[#8a7860]">
            {isEditorPreview
              ? "Add products to see them in your collection."
              : "New pieces are on their way — check back soon."}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 @sm/rivaara:gap-6 @lg/rivaara:grid-cols-2 @4xl/rivaara:grid-cols-4">
            {pagedProducts.map((product) => {
              const mrp = Number(product.mrp || 0);
              const price = Number(product.price || 0);
              const hasDiscount = mrp > price;
              const discount = hasDiscount
                ? Math.round(((mrp - price) / mrp) * 100)
                : 0;

              return (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e8ddc8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f2ece0]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#c8a35a]">
                      <Gem size={28} strokeWidth={1.3} />
                    </div>
                  )}

                  {discount > 0 && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#b8912f] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <div className="p-3.5 @sm/rivaara:p-4">
                  <p className="truncate text-xs font-bold uppercase tracking-wide text-[#241A10] @sm/rivaara:text-sm">
                    {product.name}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#241A10]">
                        {formatPrice(price)}
                      </span>

                      {hasDiscount && (
                        <span className="text-[10px] text-[#8a7860] line-through">
                          {formatPrice(mrp)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {!isEditorPreview && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            className="text-[#241A10]"
            activeClassName="bg-[#241A10] text-[#f2ece2]"
          />
        )}
      </section>

      {/* =====================================================
          GIFT BANNER
      ===================================================== */}

      <section className="mx-5 mb-12 overflow-hidden rounded-2xl bg-[#1F3D2B] @sm/rivaara:mx-8">
        <div className="grid gap-6 px-6 py-9 @sm/rivaara:px-10 @md/rivaara:grid-cols-[1.4fr_1fr] @md/rivaara:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c8a35a]">
              Make Every Occasion Special
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-white @sm/rivaara:text-4xl">
              Gift Happiness
            </h2>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4">
              {GIFT_OCCASIONS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={18} className="text-white/80" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="border-t border-white/10 pt-6 font-serif text-lg italic leading-snug text-white/80 @md/rivaara:border-t-0 @md/rivaara:border-l @md/rivaara:pl-8 @md/rivaara:pt-0">
            &ldquo;More than Gift. It&apos;s an Emotion.&rdquo;
          </p>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#081410] px-5 py-7 text-white @sm/rivaara:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 @sm/rivaara:flex-row @sm/rivaara:flex-wrap @sm/rivaara:items-center @sm/rivaara:justify-between">
          {catalog?.website && (
            <div className="flex items-center gap-2.5 text-xs">
              <Globe size={15} className="shrink-0 text-[#c8a35a]" />
              <div>
                <p className="text-white/50">Shop Online</p>
                <p className="font-medium">{catalog.website}</p>
              </div>
            </div>
          )}

          {(catalog?.phone || catalog?.whatsapp) && (
            <div className="flex items-center gap-2.5 text-xs">
              <Phone size={15} className="shrink-0 text-[#c8a35a]" />
              <div>
                <p className="text-white/50">Call / WhatsApp</p>
                <p className="font-medium">
                  +91 {catalog.phone || catalog.whatsapp}
                </p>
              </div>
            </div>
          )}

        </div>

        <p className="mx-auto mt-6 max-w-6xl border-t border-white/10 pt-4 text-center text-[11px] text-white/40">
          {companyName} · {tagline}
        </p>
      </footer>

      {/* =====================================================
          FLOATING CART BUTTON
      ===================================================== */}

      {cartCount > 0 && !showCart && (
        <button
          type="button"
          onClick={() => setShowCart(true)}
          className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#241A10] px-5 text-sm font-semibold text-white shadow-xl transition hover:bg-[#3a2a18]"
        >
          <ShoppingBag size={18} />
          {cartCount} item{cartCount === 1 ? "" : "s"}
          <span className="border-l border-white/20 pl-2">
            {formatPrice(cartTotal)}
          </span>
        </button>
      )}

      {/* =====================================================
          CART DRAWER
      ===================================================== */}

      {showCart && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setShowCart(false)}
        >
          <div
            className="flex h-full w-full max-w-sm flex-col bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e8ddc8] px-5 py-4">
              <p className="text-sm font-bold text-[#241A10]">Your Cart</p>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a7860] hover:bg-[#f2ece0]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <p className="mt-10 text-center text-xs text-[#8a7860]">
                  Your cart is empty.
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f2ece0]">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#241A10]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#8a7860]">
                          {formatPrice(item.price)}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item._id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e8ddc8] text-[#241A10]"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item._id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e8ddc8] text-[#241A10]"
                          >
                            <Plus size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id)}
                            className="ml-auto text-[#8a7860] hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#e8ddc8] px-5 py-4">
                <div className="flex items-center justify-between text-sm font-bold text-[#241A10]">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={ordering}
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1F3D2B] text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#295239] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MessageCircle size={15} />
                  {ordering ? "Opening WhatsApp..." : "Order on WhatsApp"}
                </button>
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
