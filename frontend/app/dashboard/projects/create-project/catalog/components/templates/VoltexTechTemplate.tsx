"use client";

import {
  ArrowRight,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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

   A dark, tech-retailer storefront: glowing hero product shot,
   category dial, featured grid, a promo split banner, trust
   strip, a testimonial, and a newsletter capture — built for
   electronics rather than lifestyle goods.
========================================================= */

export default function VoltexTechTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName = catalog?.companyName || "Voltex";
  const logo = catalog?.logo || "";
  const hero = catalog?.hero;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<
    CatalogTemplateProps["products"][number] | null
  >(null);

  const heroImage =
    hero?.image ||
    "https://images.unsplash.com/photo-1627594953927-b6e174ee13cc?w=1400&q=90";

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return products;
    return products.filter((p) => p.name.toLowerCase().includes(search));
  }, [products, query]);

  const PRODUCTS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const pagedProducts = isEditorPreview
    ? filteredProducts
    : filteredProducts.slice(
        (page - 1) * PRODUCTS_PER_PAGE,
        page * PRODUCTS_PER_PAGE,
      );

  useEffect(() => {
    setPage(1);
  }, [query]);

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
      className="@container/vtx min-h-screen w-full bg-[#05070d] text-white"
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
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <p className="min-w-0 flex-1 truncate text-[15px] font-bold uppercase tracking-[0.16em] sm:flex-initial">
            {logo ? (
              <span className="flex items-center gap-2">
                <img
                  src={logo}
                  alt={companyName}
                  className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
                />
                <span className="truncate">{companyName}</span>
              </span>
            ) : (
              companyName
            )}
          </p>

          <div className="flex shrink-0 items-center gap-4 text-white/80">
            <a href="#featured" aria-label="Search products" className="transition hover:text-white">
              <Search size={17} strokeWidth={1.8} />
            </a>
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="relative"
              aria-label="Cart"
            >
              <ShoppingCart size={17} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#3d8bfd] text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(61,139,253,0.22),transparent_55%)]" />

        <div
          className={`relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 py-14 sm:px-8 sm:py-20 ${
            isEditorPreview ? "@[600px]/vtx:grid-cols-2" : "lg:grid-cols-2"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {hero?.eyebrow && (
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#6fa8fd] sm:text-[10px]">
                {hero.eyebrow}
              </p>
            )}

            {hero?.title && (
              <h1 className="mt-4 font-sans text-[42px] font-bold leading-[1.02] tracking-[-0.02em] sm:mt-5 sm:text-[54px] lg:text-[62px]">
                {hero.title}
              </h1>
            )}

            {hero?.description && (
              <p className="mt-5 max-w-md text-[13px] leading-6 text-white/60 sm:text-sm">
                {hero.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
              <a
                href="#featured"
                className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[12px] font-semibold text-[#05070d] transition hover:bg-white/90"
              >
                Shop Now
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-6 text-[10px] text-white/50 sm:mt-10">
              <span className="flex items-center gap-2">
                <Truck size={15} strokeWidth={1.6} /> Free Shipping
              </span>
              <span className="flex items-center gap-2">
                <Shield size={15} strokeWidth={1.6} /> 1 Year Warranty
              </span>
              <span className="flex items-center gap-2">
                <RotateCcw size={15} strokeWidth={1.6} /> Easy Returns
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
              <img
                src={heroImage}
                alt={companyName}
                className="h-full w-full object-cover"
                style={{
                  filter: "drop-shadow(0 20px 50px rgba(61,139,253,0.25))",
                }}
              />
            </div>

            <p className="absolute -top-1 right-2 text-right text-[9px] uppercase leading-4 tracking-[0.18em] text-[#6fa8fd] sm:text-[10px]">
              Sleeker
              <br />
              Faster
              <br />
              Smarter
            </p>

            <p className="absolute bottom-2 right-2 text-right text-[8px] uppercase tracking-[0.2em] text-white/40">
              {companyName}
              <br />
              Pro Series
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ====================================================== */}

      <section id="featured" className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">Featured Products</h2>
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#6fa8fd]">
            View All Products <ArrowRight size={12} />
          </span>
        </div>

        <div className="mb-6 max-w-sm">
          <div className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4">
            <Search size={14} className="text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        <div
          className={`grid grid-cols-2 gap-4 sm:gap-5 ${
            isEditorPreview ? "@[560px]/vtx:grid-cols-4" : "lg:grid-cols-4"
          }`}
        >
          {pagedProducts.map((product, index) => {
            const mrp = Number(product.mrp || 0);
            const price = Number(product.price || 0);
            const hasDiscount = mrp > price;
            const discount = hasDiscount
              ? Math.round(((mrp - price) / mrp) * 100)
              : 0;

            return (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
              onClick={() => setSelectedProduct(product)}
              className="cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/25"
            >
              <div className="relative aspect-square overflow-hidden bg-white/5">
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-[#3d8bfd] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-white">
                    Best Seller
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-white">
                    {discount}% OFF
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="truncate text-[12px] font-semibold sm:text-[13px]">
                  {product.name}
                </h3>

                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-[13px] font-bold sm:text-sm">
                      ₹{formatPrice(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-white/40 line-through">
                        ₹{formatPrice(mrp)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <p className="py-16 text-center text-sm text-white/40">
            No products match your search.
          </p>
        )}

        {!isEditorPreview && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            className="text-white"
          />
        )}
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
            className={`sticky bottom-0 z-40 w-full border-t border-white/10 bg-[#05070d]/95 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl`}
          >
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="flex items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3d8bfd] text-white">
                  <ShoppingCart size={15} />
                </span>
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.16em] text-white/50">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <span className="block text-lg font-bold">₹{formatPrice(cartTotal)}</span>
                </span>
              </button>

              <button
                type="button"
                onClick={orderOnWhatsApp}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[11px] font-semibold text-white transition hover:bg-[#20bd5a] sm:px-6"
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
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#0a0d16] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7">
                <h2 className="text-xl font-bold">Your cart</h2>
                <button
                  type="button"
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {cart.length === 0 ? (
                  <p className="py-16 text-center text-sm text-white/40">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product._id}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[14px] font-semibold">{item.product.name}</h3>
                          <span className="text-sm text-white/50">
                            ₹{formatPrice(item.product.price)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-white/15">
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

                          <p className="text-base font-bold">
                            ₹{formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-white/10 px-5 py-5 sm:px-7">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.14em] text-white/50">
                      Total
                    </span>
                    <span className="text-2xl font-bold">₹{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={orderOnWhatsApp}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white"
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
          if (selectedProduct) increase(selectedProduct._id);
        }}
        onDecrease={() => {
          if (selectedProduct) decrease(selectedProduct._id);
        }}
      />
    </main>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

