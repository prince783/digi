"use client";

import { useEffect, useMemo, useState } from "react";

import {
  buildCatalogPublicUrl,
  resolveConfiguredBaseUrl,
} from "@/lib/publicUrl";

import {
  ArrowRight,
  Phone,
  Share2,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
} from "lucide-react";

import { getDiscount } from "@/lib/catalogDummyData";
import ProductDetailsModal from "../ui/ProductDetailsModal";
import type { CatalogTemplateProps } from "./types";
import Pagination from "./Pagination";

/* =========================================================
   CART ITEM
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

/* =========================================================
   EDITORIAL LUXE TEMPLATE
========================================================= */

export default function EditorialLuxeTemplate({
  catalog,
  products,
  isEditorPreview = false,
}: CatalogTemplateProps) {
  const companyName =
    catalog?.companyName || "Rivaara Jewellery";

  const logo = catalog?.logo || "";

  const tagline = catalog?.tagline || "Timeless beauty";

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

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  /* =======================================================
     CART BAR MOUNT (public page only)
     -----------------------------------------------------
     The bar's own 500ms fade/slide-out (below) only plays if
     it's still in the DOM while it runs. Unmounting the moment
     cartCount hits 0 would cut that transition off mid-animation,
     so keep it mounted for one extra transition cycle after the
     cart empties, then drop it — this only matters for the
     public page; the editor preview stays always-mounted.
  ======================================================= */

  const [cartBarMounted, setCartBarMounted] = useState(
    cartCount > 0,
  );

  useEffect(() => {
    if (cartCount > 0) {
      setCartBarMounted(true);
      return;
    }

    const timer = setTimeout(
      () => setCartBarMounted(false),
      500,
    );

    return () => clearTimeout(timer);
  }, [cartCount]);

  /* =======================================================
     CART TOTAL
  ======================================================= */

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = (product: any) => {
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
          image: product.image,
          price: Number(product.price || 0),
          mrp: Number(product.mrp || 0),
          quantity: 1,
        },
      ];
    });
    setShowCart(true);
  };

  /* =======================================================
     INCREASE
  ======================================================= */

  const increaseQuantity = (id: string) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  /* =======================================================
     DECREASE
  ======================================================= */

  const decreaseQuantity = (id: string) => {
    setCart((currentCart) =>
      currentCart
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

  /* =======================================================
     REMOVE
  ======================================================= */

  const removeFromCart = (id: string) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item._id !== id
      )
    );
  };

  /* =======================================================
     SHARE
  ======================================================= */

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

  /* =======================================================
     CALL
  ======================================================= */

  const callCompany = () => {
    const phone = cleanPhone(
      catalog?.phone || catalog?.whatsapp
    );

    if (!phone) {
      alert("Phone number is not available for this catalog.");
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  /* =======================================================
     WHATSAPP ORDER
  ======================================================= */

  const sendToWhatsApp = () => {
    if (cart.length === 0) {
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
      message += `Price: ${formatPrice(
        item.price
      )}\n`;
      message += `Amount: ${formatPrice(
        item.price * item.quantity
      )}\n\n`;
    });

    message += `Total: ${formatPrice(
      cartTotal
    )}\n\n`;

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

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => {
      setOrdering(false);
    }, 1000);
  };

  /* =======================================================
     SCROLL
  ======================================================= */

  const scrollToCollection = () => {
    document
      .getElementById("collection-products")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`
        relative
        min-h-full
        w-full
        bg-[#f3e9d8]
        text-[#18130f]
      `}
    >
      {/* ===================================================
          MAIN RESPONSIVE CONTAINER
      =================================================== */}

      <div
        className={`
          mx-auto
          w-full
          ${isEditorPreview
            ? "max-w-[430px]"
            : "max-w-7xl"}
        `}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className={`
            flex
            items-center
            justify-between
            border-b
            border-[#d8c8b3]
            ${
              isEditorPreview
                ? "px-5 py-4"
                : "px-5 py-5 sm:px-8 lg:px-10"
            }
          `}
        >
          <div className="min-w-0 flex-1 pr-3">
            <p
              className={`
                font-serif
                font-semibold
                tracking-wide
                ${
                  isEditorPreview
                    ? "line-clamp-2 max-w-[200px] break-words text-lg leading-tight [overflow-wrap:anywhere]"
                    : "line-clamp-2 max-w-full break-words text-lg leading-tight [overflow-wrap:anywhere] sm:truncate sm:leading-normal sm:max-w-[460px] sm:text-2xl lg:max-w-[620px] lg:text-3xl"
                }
              `}
            >
              {logo ? (
                <span className="inline-flex items-center gap-2 align-middle">
                  <img
                    src={logo}
                    alt={companyName}
                    className="inline-block h-8 w-8 shrink-0 rounded-full object-contain sm:h-9 sm:w-9"
                  />
                  {companyName}
                </span>
              ) : (
                companyName
              )}
            </p>

            <p
              className={`
                uppercase
                tracking-[0.32em]
                text-[#9a7652]
                ${
                  isEditorPreview
                    ? "text-[8px]"
                    : "text-[8px] sm:text-[9px]"
                }
              `}
            >
              {tagline}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="
              relative
              shrink-0
              rounded-full
              border
              border-[#ad916f]
              px-3
              py-1.5
              text-[9px]
              uppercase
              tracking-wider
              transition
              hover:bg-[#eadfc9]
              sm:px-4
              sm:py-2
            "
          >
            Collection

            {cartCount > 0 && (
              <span
                className="
                  absolute
                  -right-2
                  -top-2
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-[#173b31]
                  px-1
                  text-[8px]
                  font-semibold
                  text-white
                "
              >
                {cartCount}
              </span>
            )}
          </button>
        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className={`
            relative
            overflow-hidden
            text-center
            ${
              isEditorPreview
                ? "px-6 pb-8 pt-9"
                : "px-6 pb-10 pt-12 sm:px-10 sm:pb-12 lg:px-16 lg:pb-14 lg:pt-16"
            }
          `}
        >
          {hero?.eyebrow && (
            <p
              className={`
                uppercase
                tracking-[0.42em]
                text-[#9a7652]
                ${
                  isEditorPreview
                    ? "mb-3 text-[9px]"
                    : "mb-4 text-[9px] sm:text-[10px]"
                }
              `}
            >
              {hero.eyebrow}
            </p>
          )}

          {hero?.title && (
            <h1
              className={`
                mx-auto
                max-w-4xl
                font-serif
                leading-[0.95]
                ${
                  isEditorPreview
                    ? "text-4xl"
                    : "text-4xl sm:text-5xl lg:text-7xl"
                }
              `}
            >
              {hero.title}
            </h1>
          )}

          {hero?.description && (
            <p
              className={`
                mx-auto
                text-[#74675c]
                ${
                  isEditorPreview
                    ? "mt-4 max-w-[280px] text-xs leading-5"
                    : "mt-5 max-w-2xl text-xs leading-5 sm:text-sm sm:leading-6 lg:text-base"
                }
              `}
            >
              {hero.description}
            </p>
          )}

          <button
            type="button"
            onClick={scrollToCollection}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              border-b
              border-black
              pb-1
              text-[10px]
              font-medium
              uppercase
              tracking-[0.2em]
              transition
              hover:gap-3
            "
          >
            Explore Collection

            <ArrowRight size={12} />
          </button>
        </section>

        {/* =================================================
            HERO IMAGE
        ================================================= */}

        <div
          className={`
            overflow-hidden
            ${
              isEditorPreview
                ? "mx-4 rounded-[3px]"
                : "mx-4 rounded-[4px] sm:mx-8 lg:mx-10"
            }
          `}
        >
          {hero?.image || products[0]?.image ? (
            <img
              src={
                hero?.image ||
                products[0]?.image ||
                ""
              }
              alt={
                hero?.title ||
                products[0]?.name ||
                "Jewellery collection"
              }
              className={`
                w-full
                object-cover
                ${
                  isEditorPreview
                    ? "h-[215px]"
                    : "h-[250px] sm:h-[350px] lg:h-[500px]"
                }
              `}
            />
          ) : (
            <div
              className={`
                flex
                items-center
                justify-center
                bg-[#eadfc9]
                text-[#8d7965]
                ${
                  isEditorPreview
                    ? "h-[215px] text-xs"
                    : "h-[250px] text-sm sm:h-[350px] lg:h-[500px]"
                }
              `}
            >
              {hero?.title ||
                "Jewellery Collection"}
            </div>
          )}
        </div>

        {/* =================================================
            COLLECTION
        ================================================= */}

        <section
          id="collection-products"
          className={`
            ${
              isEditorPreview
                ? "px-4 py-9"
                : "px-4 py-12 sm:px-8 lg:px-10 lg:py-16"
            }
          `}
        >
          {/* TITLE */}

          <div
            className={`
              text-center
              ${
                isEditorPreview
                  ? "mb-6"
                  : "mb-8 lg:mb-10"
              }
            `}
          >
            {catalog?.hero?.eyebrow && (
              <p
                className="
                  text-[8px]
                  uppercase
                  tracking-[0.42em]
                  text-[#957552]
                "
              >
                {catalog.hero.eyebrow}
              </p>
            )}

            {catalog?.hero?.title && (
              <h2
                className={`
                  mt-2
                  font-serif
                  ${
                    isEditorPreview
                      ? "text-2xl"
                      : "text-2xl sm:text-3xl lg:text-4xl"
                  }
                `}
              >
                {catalog.hero.title}
              </h2>
            )}

            <div
              className="
                mx-auto
                mt-3
                h-px
                w-14
                bg-[#a78968]
              "
            />
          </div>

          {/* =================================================
              PRODUCT GRID
          ================================================= */}

          <div
            className={`
              grid
              ${
                isEditorPreview
                  ? "grid-cols-2 gap-x-3 gap-y-8"
                  : "grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12"
              }
            `}
          >
            {pagedProducts.map((product) => {
              const discount = getDiscount(
                product.mrp,
                product.price
              );

              return (
                <article
                  key={product._id}
                  onClick={() => setSelectedProduct(product)}
                  className="min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-[#1b1815]/10 shadow-[0_8px_24px_rgba(24,19,15,0.08)]"
                >
                  {/* PRODUCT IMAGE */}

                  <div
                    className="
                      group
                      relative
                      aspect-[4/5]
                      overflow-hidden
                      bg-[#eadfc9]
                    "
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-700
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          items-center
                          justify-center
                          text-[12px]
                          text-[#8d7965]
                        "
                      >
                        No image
                      </div>
                    )}

                    {discount > 0 && (
                      <span
                        className="
                          absolute
                          left-2
                          top-2
                          bg-[#f3e9d8]
                          px-2
                          py-1
                          text-[8px]
                          uppercase
                          tracking-wider
                        "
                      >
                        {discount}% off
                      </span>
                    )}
                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="px-3 pb-4 pt-3 text-center">
                    <h3
                      className={`
                        line-clamp-1
                        font-serif
                        font-semibold
                        text-[#18130f]
                        ${
                          isEditorPreview
                            ? "text-[15px]"
                            : "text-base sm:text-[17px] lg:text-xl"
                        }
                      `}
                    >
                      {product.name}
                    </h3>

                    {/* PRICE */}

                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      <span
                        className={`
                          font-semibold
                          ${
                            isEditorPreview
                              ? "text-sm"
                              : "text-sm sm:text-base"
                          }
                        `}
                      >
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString("en-IN")}
                      </span>

                      {Number(
                        product.mrp || 0
                      ) >
                        Number(
                          product.price || 0
                        ) && (
                        <span
                          className="
                            text-[10px]
                            text-gray-400
                            line-through
                          "
                        >
                          ₹
                          {Number(
                            product.mrp || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
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

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            flex
            items-center
            justify-center
            gap-6
            px-5
            py-6
            text-[#765f48]
          "
        >
          <button
            type="button"
            onClick={callCompany}
            aria-label="Call"
            className="transition hover:text-[#3f3226]"
          >
            <Phone size={16} />
          </button>

          <button
            type="button"
            onClick={shareCatalog}
            aria-label="Share catalog"
            className="transition hover:text-[#3f3226]"
          >
            <Share2 size={16} />
          </button>

          <span
            className="
              max-w-[200px]
              truncate
              text-[9px]
              uppercase
              tracking-[0.18em]

              sm:max-w-[360px]
              lg:max-w-none
            "
          >
            {companyName}
          </span>
        </footer>

        {/* =================================================
            CART / WHATSAPP BAR
        ================================================= */}

        {(isEditorPreview || cartBarMounted) && (
        <div
          className={`
            ${
              isEditorPreview
                ? "absolute bottom-0 left-0 right-0 z-40"
                : "sticky bottom-0 z-40"
            }
            border-t
            border-[#d8c8b3]
            bg-[#f3e9d8]
            transition-all
            duration-500
            ease-out
            ${
              cartCount > 0
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-full opacity-0"
            }
            ${
              isEditorPreview
                ? "mt-4 p-3"
                : "mt-4 px-4 py-4 sm:px-8 lg:px-10"
            }
          `}
        >
          <div
            className="
              mx-auto
              flex
              w-full
              items-center
              gap-2
              rounded-full
              border
              border-[#d8c8b3]
              bg-white
              p-1.5
            "
          >
            {/* CART */}

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
                rounded-full
                px-2
                py-1
                text-left
              "
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#18130f]
                  text-white
                "
              >
                <ShoppingBag size={13} />
              </span>

              <span className="min-w-0">
                <span
                  className="
                    block
                    truncate
                    text-[9px]
                    font-semibold
                    text-[#18130f]
                  "
                >
                  Your Cart
                </span>

                <span
                  className="
                    block
                    truncate
                    text-[10px]
                    text-[#81756a]
                  "
                >
                  {cartCount > 0
                    ? `${cartCount} ${
                        cartCount === 1
                          ? "product"
                          : "products"
                      } added`
                    : "Add products to order"}
                </span>
              </span>
            </button>

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={sendToWhatsApp}
              disabled={
                cart.length === 0 ||
                ordering
              }
              className="
                flex
                h-[40px]
                shrink-0
                items-center
                justify-center
                gap-1.5
                rounded-full
                bg-[#9ed4b7]
                px-3
                text-[11px]
                font-medium
                text-[#28523b]
                transition
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:px-5
              "
            >
              <MessageCircle size={12} />

              <span className="whitespace-nowrap">
                {ordering
                  ? "Opening..."
                  : "Order on WhatsApp"}
              </span>
            </button>
          </div>
        </div>
        )}
      </div>

      {/* ===================================================
          CART DRAWER
      =================================================== */}

      {showCart && (
        <div
          className={`${
            isEditorPreview ? "absolute" : "fixed"
          } inset-0 z-[100]`}
        >
          {/* OVERLAY */}

          <button
            type="button"
            aria-label="Close cart"
            onClick={() =>
              setShowCart(false)
            }
            className="
              absolute
              inset-0
              h-full
              w-full
              bg-black/50
            "
          />

          {/* DRAWER */}

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              mx-auto
              flex
              max-h-[85vh]
              w-full
              max-w-[520px]
              flex-col
              rounded-t-[24px]
              bg-[#f3e9d8]
              text-[#18130f]
              shadow-2xl
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#d8c8b3]
                px-5
                py-4
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.25em]
                    text-[#957552]
                  "
                >
                  Your selection
                </p>

                <h3
                  className="
                    mt-1
                    font-serif
                    text-xl
                  "
                >
                  Your Cart
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCart(false)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#d8c8b3]
                  bg-white
                "
              >
                <X size={15} />
              </button>
            </div>

            {/* CART ITEMS */}

            <div
              className="
                flex-1
                overflow-y-auto
                px-5
                py-4
              "
            >
              {cart.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-[250px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <ShoppingBag
                    size={28}
                    className="text-[#957552]"
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-medium
                    "
                  >
                    Your cart is empty
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-[#8d7965]
                    "
                  >
                    Add jewellery to
                    continue.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="
                        flex
                        gap-3
                        border-b
                        border-[#e1d7ca]
                        pb-4
                      "
                    >
                      {/* IMAGE */}

                      <div
                        className="
                          h-[78px]
                          w-[64px]
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          bg-[#eadfc9]
                        "
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-full
                              items-center
                              justify-center
                              text-[8px]
                              text-[#8d7965]
                            "
                          >
                            No image
                          </div>
                        )}
                      </div>

                      {/* DETAILS */}

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-2
                          "
                        >
                          <h4
                            className={` 
                              truncate
                              font-semibold
                              ${
                                isEditorPreview
                                  ? "text-xs"
                                  : "text-sm sm:text-[15px]"
                              }
                            `}
                          >
                            {item.name}
                          </h4>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item._id
                              )
                            }
                            className="
                              shrink-0
                              text-[#8d7965]
                            "
                          >
                            <Trash2
                              size={13}
                            />
                          </button>
                        </div>

                        <p
                          className={`
                            mt-1
                            text-[#75675c]
                            ${
                              isEditorPreview
                                ? "text-[10px]"
                                : "text-xs sm:text-[13px]"
                            }
                          `}
                        >
                          {formatPrice(
                            item.price
                          )}
                        </p>

                        {/* QUANTITY */}

                        <div
                          className="
                            mt-3
                            flex
                            w-fit
                            items-center
                            rounded-full
                            border
                            border-[#d8c8b3]
                            bg-white
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item._id
                              )
                            }
                            className="
                              flex
                              h-7
                              w-7
                              items-center
                              justify-center
                            "
                          >
                            <Minus size={11} />
                          </button>

                          <span
                            className="
                              w-7
                              text-center
                              text-[9px]
                              font-semibold
                            "
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item._id
                              )
                            }
                            className="
                              flex
                              h-7
                              w-7
                              items-center
                              justify-center
                            "
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CART FOOTER */}

            {cart.length > 0 && (
              <div
                className="
                  border-t
                  border-[#d8c8b3]
                  bg-white
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-xs
                      text-[#75675c]
                    "
                  >
                    Total
                  </span>

                  <span
                    className="
                      font-serif
                      text-xl
                      font-semibold
                    "
                  >
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  disabled={ordering}
                  className="
                    mt-4
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#25D366]
                    text-xs
                    font-semibold
                    text-white
                    transition
                    active:scale-[0.98]
                    disabled:opacity-60
                  "
                >
                  <MessageCircle size={15} />

                  {ordering
                    ? "Opening WhatsApp..."
                    : "Order on WhatsApp"}
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