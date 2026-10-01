"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Share2,
  ShoppingBag,
  ChevronDown,
  Edit3,
  Eye,
  ImagePlus,
  Mail,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
  Building2,
  Globe,
  MessageCircle,
  Save,
  Clock3,
  Send,
  ShieldCheck,
  BadgeCheck,
  ExternalLink,
  CreditCard,
  Loader2,
  Copy,
  CalendarDays,
  CheckCircle2,
  Link2,
  Palette,
  AlertTriangle,
  Pencil,
} from "lucide-react";

import {
  ChangeEvent,
  CSSProperties,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useCatalogEditorState } from "./hooks/useCatalogEditorState";
import { useCatalogPricing } from "./hooks/useCatalogPricing";
import { createCatalogFormActions } from "./actions/createCatalogFormActions";
import { createCatalogThemeActions } from "./actions/createCatalogThemeActions";
import { createCatalogCategoryModalActions } from "./actions/createCatalogCategoryModalActions";
import { createCatalogProductActions } from "./actions/createCatalogProductActions";
import { createCatalogCategoryActions } from "./actions/createCatalogCategoryActions";
import { createCatalogHeroActions } from "./actions/createCatalogHeroActions";
import { createCatalogCartActions } from "./actions/createCatalogCartActions";
import { createCatalogPersistenceActions } from "./actions/createCatalogPersistenceActions";
import { createCatalogValidationActions } from "./actions/createCatalogValidationActions";
import { createCatalogUsernameActions } from "./actions/createCatalogUsernameActions";
import { DEFAULT_COMPANY, DEFAULT_TEMPLATE_ID, getHeroDefaults } from "./config/catalog-editor.defaults";
import { useNavbarLeftSlot } from "@/app/dashboard/components/NavbarSlotContext";
import {
  CATALOG_THEMES as CATALOG_LAYOUT_THEMES,
  getCatalogThemesForCategory,
  getDefaultCatalogThemeForCategory,
  resolveCatalogThemeId,
} from "@/lib/catalogThemes";
import {
  buildCatalogPublicUrl,
  resolveConfiguredBaseUrl,
} from "@/lib/publicUrl";
import {
  addOneYear,
  calculateCartTotal,
  cleanPhoneNumber,
  createProduct,
  formatCurrency,
  getUserId,
  mapBilling,
  mapCompany,
  mapProductCategories,
  mapProducts,
  normalizeCategory,
  normalizeHeroImages,
  normalizeUsername,
  productPrice,
  resolveHeroImage,
  resolveProductCategory,
} from "./utils/catalog-editor.utils";
export { formatCurrency } from "./utils/catalog-editor.utils";
import type {
  CardResponse,
  CatalogResponse,
  CatalogTheme,
  CartItem,
  Company,
  CompanyErrors,
  DraftData,
  HeroContent,
  HeroErrors,
  HeroSlide,
  Product,
  ProductCategory,
  ProductErrors,
  Step,
  UsernameStatus,
} from "../catalog-editor.types";

export type {
  CartItem,
  Company,
  HeroContent,
  HeroSlide,
  Product,
  ProductCategory,
  UsernameStatus,
} from "../catalog-editor.types";

const STEP_DATA = [
  {
    step: 1,
    title: "Select Template",
    shortTitle: "Template",
    description: "Choose your catalog layout",
    icon: Palette,
  },
  {
    step: 2,
    title: "Company Details",
    shortTitle: "Company",
    description: "Your company information",
    icon: Building2,
  },
  {
    step: 3,
    title: "Hero Section",
    shortTitle: "Hero",
    description: "Customize your headline and banner content",
    icon: Palette,
  },
  {
    step: 4,
    title: "Add Products",
    shortTitle: "Products",
    description: "Add products to your catalog",
    icon: Package,
  },
  {
    step: 5,
    title: "Catalog Username",
    shortTitle: "Username",
    description: "Choose your public catalog link",
    icon: Globe,
  },
  {
    step: 6,
    title: "Payment",
    shortTitle: "Payment",
    description: "Complete payment and publish your catalog",
    icon: CreditCard,
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function useCatalogEditorController(props?: { onBack?: () => void; onComplete?: () => void }) {
  const state = useCatalogEditorState();
  useCatalogPricing({
    setCatalogPrice: state.setCatalogPrice,
    setCatalogPriceLoading: state.setCatalogPriceLoading,
  });
  const { setSuccessToast, setErrorToast, reportMissingFields } = state;
  const validationActions = createCatalogValidationActions(state);
  const usernameActions = createCatalogUsernameActions(state);
  const { validateHero, validateCompany, validateProducts, validateUsername } = validationActions;
  const { handleUsernameChange, suggestUsernameFromCompany } = usernameActions;
  const persistenceActions = createCatalogPersistenceActions(state, { validateHero, setSuccessToast, setErrorToast });
  const { updateCatalogUrl, resolveAuthenticatedUserId, saveDraft, handleSaveDraft } = persistenceActions;
  const cartActions = createCatalogCartActions(state);
  const productActions = createCatalogProductActions(state, cartActions.removeFromCart);
  const categoryActions = createCatalogCategoryActions(state);
  const formActions = createCatalogFormActions(state);
  const heroActions = createCatalogHeroActions(state);
  const themeActions = createCatalogThemeActions(state);
  const categoryModalActions = createCatalogCategoryModalActions(state, {
    ...productActions,
    ...categoryActions,
  });
  const { selectLayoutTemplate, updateHero, updateCatalogCategory } = themeActions;
  const {
    openAddCategoryModal,
    openEditCategoryModal,
    closeCategoryModal,
    handleCategoryModalImageChange,
    submitCategoryModal,
  } = categoryModalActions;
  const { addToCart, isInCart, updateCartQuantity, removeFromCart } = cartActions;
  const {
    updateProduct,
    saveProduct,
    editProduct,
    addProduct,
    removeProduct,
    clearDemoProducts,
    handleProductImage,
  } = productActions;
  const {
    addProductCategory,
    updateProductCategory,
    removeProductCategory,
    confirmDeleteCategory,
  } = categoryActions;
  const { updateCompany, updateBilling, validateBilling } = formActions;
  const {
    handleHeroImage,
    addHeroSlide,
    replaceHeroSlideImage,
    removeHeroSlide,
    toggleHeroSlideActive,
    moveHeroSlide,
  } = heroActions;
  const { stickyHeaderRef, stickyHeaderHeight, setStickyHeaderHeight, currentStep, setCurrentStep, templateId, setTemplateId, layoutTemplateId, setLayoutTemplateId, company, setCompany, billing, setBilling, billingErrors, setBillingErrors, category, setCategory, hero, setHero, heroCustomizedRef, companyErrors, setCompanyErrors, heroErrors, setHeroErrors, sameWhatsappAsMobile, setSameWhatsappAsMobile, products, setProducts, showDemoProducts, setShowDemoProducts, productCategories, setProductCategories, categoryModal, setCategoryModal, categoryModalName, setCategoryModalName, categoryModalIcon, setCategoryModalIcon, categoryModalImage, setCategoryModalImage, categoryModalError, setCategoryModalError, categoryImageCropSrc, setCategoryImageCropSrc, deleteCategoryId, setDeleteCategoryId, savedProductIds, setSavedProductIds, productErrors, setProductErrors, editingProductId, setEditingProductId, cart, setCart, username, setUsername, usernameStatus, setUsernameStatus, usernameMessage, setUsernameMessage, catalogId, setCatalogId, paymentStatus, setPaymentStatus, paymentCompleted, setPaymentCompleted, paymentDate, setPaymentDate, subscriptionStartDate, setSubscriptionStartDate, subscriptionEndDate, setSubscriptionEndDate, isPaying, setIsPaying, showSuccessOverlay, setShowSuccessOverlay, successRedirectUrl, setSuccessRedirectUrl, urlReady, setUrlReady, loadingCompany, setLoadingCompany, savingDraft, setSavingDraft, saveSuccess, setSaveSuccess, saveErrorMessage, setSaveErrorMessage, lastSaved, setLastSaved, mobilePanel, setMobilePanel, showPreview, setShowPreview, hasChanges, setHasChanges, showCart, setShowCart, isOrdering, setIsOrdering, imageLoadingId, setImageLoadingId, previewProduct, setPreviewProduct, cropImage, setCropImage, heroCropImage, setHeroCropImage, heroCropTargetId, setHeroCropTargetId, logoCropImage, setLogoCropImage, validationToast, setValidationToast, successToast, setSuccessToastState, errorToast, setErrorToastState, catalogPrice, setCatalogPrice, catalogPriceLoading, setCatalogPriceLoading, userId, setUserId, usernameTimerRef, originalUsernameRef, initializedRef, savingServerRef } = state;


  const router = useRouter();

  useEffect(() => {
    const node = stickyHeaderRef.current;
    if (!node) return;

    const updateHeight = () => setStickyHeaderHeight(node.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!validationToast) return;
    const timer = setTimeout(() => setValidationToast(null), 6000);
    return () => clearTimeout(timer);
  }, [validationToast]);

  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => setSuccessToastState(null), 3000);
    return () => clearTimeout(timer);
  }, [successToast]);

  useEffect(() => {
    if (!errorToast) return;
    const timer = setTimeout(() => setErrorToastState(null), 5000);
    return () => clearTimeout(timer);
  }, [errorToast]);

  // Scroll to the top of the page whenever the wizard step changes
  // (Continue/Previous, the step indicator, or a restored draft) —
  // otherwise the new step renders at whatever scroll position the
  // previous one was left at, which can drop the user mid-page on
  // a step they haven't seen yet.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Open the initial empty product form automatically. Once a product is
  // saved, the form collapses and only the compact product row remains.
  useEffect(() => {
    if (currentStep !== 3) return;
    if (editingProductId) return;
    if (savedProductIds.length > 0) return;

    const firstProduct = products[0];
    if (products.length === 1 && firstProduct && !firstProduct.name.trim()) {
      setEditingProductId(firstProduct.id);
    }
  }, [currentStep, editingProductId, products, savedProductIds.length]);

  /* =========================================================
     RESOLVE USER ID WITHOUT FREEZING IT AT FIRST RENDER
     -----------------------------------------------------
     getUserId() alone only checks localStorage/sessionStorage,
     and nothing in this codebase ever writes a userId there -
     so on its own it fails silently for every session, and the
     whole editor stops saving with no error shown to the user.
     resolveAuthenticatedUserId() tries the same storage lookup
     first, then correctly falls back to the real, authoritative
     session via /api/auth/me.
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      try {
        const id = await resolveAuthenticatedUserId();
        if (!cancelled && id) {
          console.log("CatalogEditor resolved userId:", id);
          setUserId((current) => current || id);
        }
      } catch (error) {
        console.warn(
          "CatalogEditor could not resolve the logged-in user ID:",
          error,
        );
      }
    };

    void resolve();

    const onStorage = () => void resolve();
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /* =========================================================
     READ EDIT / ADD PRODUCT URL
  ========================================================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("edit") || params.get("catalogId") || "";
    const action = params.get("action") || "";
    const tab = params.get("tab") || "";

    if (id) setCatalogId(id);

    if (action === "add-product" || tab === "products") {
      setCurrentStep(4);
    }

    setUrlReady(true);
  }, []);

  /* =========================================================
     LOAD EXISTING CATALOG OR NEW CATALOG DATA
  ========================================================= */

  useEffect(() => {
    if (!urlReady) return;

    let cancelled = false;

    async function load() {
      /* ---------------------------------------------
         EXISTING CATALOG
      --------------------------------------------- */
      if (catalogId) {
        const key = `existing:${catalogId}`;
        if (initializedRef.current === key) return;

        setLoadingCompany(true);

        try {
          const response = await fetch(
            `/api/catalogs?catalogId=${encodeURIComponent(catalogId)}`,
            { cache: "no-store" },
          );

          const data: CatalogResponse = await response.json();

          if (!response.ok || !data.success || !data.catalog) {
            throw new Error(data.message || "Unable to load catalog.");
          }

          const catalog = data.catalog;
          const loadedCompany = mapCompany(catalog);
          const loadedProducts = mapProducts(catalog.products);
          const loadedUsername = normalizeUsername(
            String(catalog.username ?? ""),
          );
          const loadedTemplateId = String(
            catalog.templateId ?? DEFAULT_TEMPLATE_ID,
          );

          // Normalized (not the raw DB value) so a catalog still
          // pointing at a since-removed template (e.g. a deleted
          // theme) silently falls back to a valid one instead of
          // carrying a stale id back into the save payload, where
          // it would fail schema enum validation.
          const loadedLayoutTemplateId = resolveCatalogThemeId(
            catalog.layoutTemplateId,
            catalog.templateId,
          );

          const loadedPaymentStatus = String(
            catalog.paymentStatus ?? "pending",
          ).toLowerCase();
          const loadedPaymentDate = String(
            catalog.paymentDate ?? catalog.paidAt ?? "",
          );
          const loadedSubscriptionStart = String(
            catalog.subscriptionStartDate ??
              catalog.subscriptionStartedAt ??
              "",
          );
          const loadedSubscriptionEnd = String(
            catalog.subscriptionEndDate ??
              catalog.subscriptionExpiresAt ??
              catalog.expiresAt ??
              addOneYear(loadedSubscriptionStart || loadedPaymentDate) ??
              "",
          );

          if (cancelled) return;

          setCompany(loadedCompany);
          setBilling(mapBilling(catalog));
          if (typeof catalog.category === "string") {
            setCategory(normalizeCategory(catalog.category));
          }
          const hasSavedHero =
            catalog.hero && typeof catalog.hero === "object";

          if (hasSavedHero) {
            const savedHero = catalog.hero as Partial<HeroContent>;
            setHero((current) => ({
              ...current,
              ...savedHero,
              images: normalizeHeroImages(savedHero),
            }));
            heroCustomizedRef.current = true;
          }

          const productsToUse =
            loadedProducts.length > 0 ? loadedProducts : [createProduct()];

          setProducts(productsToUse);
          setShowDemoProducts(loadedProducts.length === 0);
          setProductCategories(
            mapProductCategories(catalog.productCategories),
          );

          const loadedSavedIds = productsToUse
            .filter((product) => Boolean(product.name.trim() || product.image))
            .map((product) => product.id);

          setSavedProductIds(loadedSavedIds);
          setEditingProductId(
            loadedSavedIds.length === productsToUse.length
              ? null
              : (productsToUse.find(
                  (product) => !loadedSavedIds.includes(product.id),
                )?.id ?? null),
          );

          setUsername(loadedUsername);
          setTemplateId(
            CATALOG_LAYOUT_THEMES.some((theme) => theme.id === loadedTemplateId)
              ? loadedTemplateId
              : DEFAULT_TEMPLATE_ID,
          );
          setLayoutTemplateId(loadedLayoutTemplateId);
          if (!hasSavedHero) {
            setHero({ ...getHeroDefaults(loadedLayoutTemplateId) });
            heroCustomizedRef.current = false;
          }
          setPaymentStatus(loadedPaymentStatus);
          if (
            ["paid", "success", "successful", "completed"].includes(
              loadedPaymentStatus,
            )
          ) {
            setPaymentCompleted(true);
          }
          setPaymentDate(loadedPaymentDate);
          setSubscriptionStartDate(loadedSubscriptionStart);
          setSubscriptionEndDate(loadedSubscriptionEnd);
          setHasChanges(false);
          originalUsernameRef.current = loadedUsername;

          if (loadedUsername) {
            setUsernameStatus("available");
            setUsernameMessage("Current catalog username");
          } else {
            setUsernameStatus("idle");
            setUsernameMessage("");
          }

          // Cart is not stored by the current Catalog API.
          // Restore only cart/step from a matching local draft.
          try {
            const id = userId || getUserId();
            if (id) {
              const raw = localStorage.getItem(`catalog-draft-${id}`);
              if (raw) {
                const draft = JSON.parse(raw) as DraftData;
                if (draft.catalogId === catalogId) {
                  if (Array.isArray(draft.cart)) {
                    setCart(draft.cart);
                  }

                  const params = new URLSearchParams(window.location.search);
                  if (
                    params.get("action") !== "add-product" &&
                    params.get("tab") !== "products" &&
                    [1, 2, 3, 4, 5, 6].includes(draft.currentStep)
                  ) {
                    setCurrentStep(draft.currentStep);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Failed to restore catalog cart draft:", error);
          }

          setLastSaved("Loaded from catalog");
        } catch (error) {
          console.error("Failed to load catalog:", error);
          if (!cancelled) {
            alert(
              error instanceof Error
                ? error.message
                : "Unable to load catalog.",
            );
          }
        } finally {
          // Marking "initialized" here, not before the fetch, matters:
          // React Strict Mode's dev-only double-invoke mounts this
          // effect, cleans it up (cancelled=true), then remounts it.
          // Marking the ref up front made the real (second) run see
          // "already initialized" and bail out before ever calling
          // setLoadingCompany — while the aborted first run's own
          // finally also skipped it (cancelled), leaving loading
          // stuck true forever. Only the run that actually finishes
          // gets to claim the key.
          if (!cancelled) {
            initializedRef.current = key;
            setLoadingCompany(false);
          }
        }

        return;
      }

      /* ---------------------------------------------
         NEW CATALOG
      --------------------------------------------- */

      const resolvedId = userId || getUserId();

      if (!resolvedId) {
        // Do not show a login error just because auth storage
        // has not populated yet. Keep the editor usable.
        setLoadingCompany(false);
        return;
      }

      if (!userId) setUserId(resolvedId);

      const key = `new:${resolvedId}`;
      if (initializedRef.current === key) return;

      setLoadingCompany(true);

      try {
        let loadedCompany = DEFAULT_COMPANY;

        try {
          const response = await fetch(
            `/api/digital-cards/my-card?userId=${encodeURIComponent(
              resolvedId,
            )}`,
            { cache: "no-store" },
          );

          const data: CardResponse = await response.json();

          if (data.success && data.card) {
            loadedCompany = mapCompany(data.card);
          }
        } catch (error) {
          console.error("Failed to load digital card:", error);
        }

        try {
          const raw = localStorage.getItem(`catalog-draft-${resolvedId}`);

          if (raw) {
            const draft = JSON.parse(raw) as DraftData;

            if (draft.company) {
              setCompany({
                ...loadedCompany,
                ...draft.company,
              });
            } else {
              setCompany(loadedCompany);
            }
            if (draft.category) setCategory(normalizeCategory(draft.category));
            if (Array.isArray(draft.productCategories)) {
              setProductCategories(mapProductCategories(draft.productCategories));
            }
            if (draft.hero) {
              setHero((current) => ({
                ...current,
                ...draft.hero,
                images: normalizeHeroImages(draft.hero as Partial<HeroContent>),
              }));
              heroCustomizedRef.current = true;
            }

            if (Array.isArray(draft.products) && draft.products.length) {
              // Same maxlength-30 clamp as mapProducts() — this is a
              // separate load path (restoring a browser-local
              // autosave draft) that was bypassing it, so a draft
              // saved before the limit existed could still carry an
              // oversized description straight into a failing save.
              const clampedDraftProducts = draft.products.map(
                (product: Product) => ({
                  ...product,
                  description: String(product.description ?? "").slice(
                    0,
                    30,
                  ),
                }),
              );

              setProducts(clampedDraftProducts);
              setShowDemoProducts(false);
              setHasChanges(true);

              const draftSavedIds = clampedDraftProducts
                .filter((product) =>
                  Boolean(product.name.trim() || product.image),
                )
                .map((product) => product.id);

              setSavedProductIds(draftSavedIds);
              setEditingProductId(
                draftSavedIds.length === clampedDraftProducts.length
                  ? null
                  : (clampedDraftProducts.find(
                      (product) => !draftSavedIds.includes(product.id),
                    )?.id ?? null),
              );
            }

            if (Array.isArray(draft.cart)) {
              setCart(draft.cart);
            }

            if (typeof draft.username === "string") {
              setUsername(draft.username);
            }
            if (
              typeof draft.templateId === "string" &&
              CATALOG_LAYOUT_THEMES.some((theme) => theme.id === draft.templateId)
            ) {
              setTemplateId(draft.templateId);
            }
            if (
              typeof draft.layoutTemplateId === "string" &&
              draft.layoutTemplateId.trim()
            ) {
              const resolvedDraftLayoutId = resolveCatalogThemeId(
                draft.layoutTemplateId,
              );
              setLayoutTemplateId(resolvedDraftLayoutId);
              if (!draft.hero) {
                setHero({
                  ...getHeroDefaults(resolvedDraftLayoutId),
                });
                heroCustomizedRef.current = false;
              }
            } else if (
              typeof draft.templateId === "string" &&
              draft.templateId.trim()
            ) {
              const resolvedDraftTemplateId = resolveCatalogThemeId(
                draft.templateId,
              );
              setLayoutTemplateId(resolvedDraftTemplateId);
              if (!draft.hero) {
                setHero({
                  ...getHeroDefaults(resolvedDraftTemplateId),
                });
                heroCustomizedRef.current = false;
              }
            }

            const params = new URLSearchParams(window.location.search);
            if (
              params.get("action") !== "add-product" &&
              params.get("tab") !== "products" &&
              [1, 2, 3, 4, 5, 6].includes(draft.currentStep)
            ) {
              setCurrentStep(Math.min(draft.currentStep, 6) as Step);
            }

            if (draft.savedAt) setLastSaved(draft.savedAt);
          } else {
            setCompany(loadedCompany);
          }
        } catch (error) {
          console.error("Failed to load local catalog draft:", error);
          setCompany(loadedCompany);
        }
      } finally {
        // Same fix as the "existing catalog" branch above: claim
        // the key only once this run actually finishes, so a Strict
        // Mode dev double-invoke can't leave loading stuck true.
        if (!cancelled) {
          initializedRef.current = key;
          setLoadingCompany(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [catalogId, urlReady, userId]);
  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  /* =========================================================
     NAVIGATION
  ========================================================= */

  async function persistHeroSection() {
    if (!catalogId) {
      return;
    }

    setSavingDraft(true);

    try {
      const response = await fetch("/api/catalogs", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          catalogId,
          userId: userId || undefined,
          hero,
        }),
      });

      const data: CatalogResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Hero section could not be saved.",
        );
      }
    } finally {
      setSavingDraft(false);
    }
  }

  async function nextStep() {
    if (currentStep === 1) {
      if (!layoutTemplateId) {
        alert("Please select a catalog template.");
        return;
      }

      setCurrentStep(2);
      setMobilePanel("form");
      return;
    }

    if (currentStep === 2) {
      if (!validateCompany()) return;

      setCurrentStep(3);
      setMobilePanel("form");
      return;
    }

    if (currentStep === 3) {
      if (!validateHero()) return;

      try {
        const didPersist = Boolean(catalogId);
        await persistHeroSection();
        if (didPersist) {
          setSuccessToast("Changes saved successfully.");
        }
      } catch (error) {
        console.error("Hero section save failed:", error);
        alert(
          error instanceof Error
            ? error.message
            : "Hero section could not be saved. Please try again.",
        );
        return;
      }

      setCurrentStep(4);
      setMobilePanel("form");
      return;
    }

    if (currentStep === 4) {
      if (!validateProducts()) return;

      void suggestUsernameFromCompany();
      setCurrentStep(5);
      setMobilePanel("form");
      return;
    }

    if (currentStep === 5) {
      if (!validateUsername()) return;

      if (catalogId && hasChanges) {
        try {
          await saveDraft(false);
          setSuccessToast("Catalog details updated successfully.");
        } catch (error) {
          console.error("Catalog update failed:", error);
          alert(
            error instanceof Error
              ? error.message
              : "Catalog could not be updated. Please try again.",
          );
          return;
        }
      }

      setCurrentStep(6);
      setMobilePanel("preview");
      return;
    }
  }

  function previousStep() {
    if (currentStep === 1) {
      router.back();
      return;
    }

    setCurrentStep((previous) => Math.max(1, previous - 1) as Step);

    setMobilePanel("form");
  }

  /* =========================================================
     CATALOG PAYMENT
  ========================================================= */

  const isCatalogPaid = ["paid", "success", "successful", "completed"].includes(
    paymentStatus.toLowerCase(),
  ) || paymentCompleted;
  // Single source of truth for this catalog's public URL — every
  // display, copy, open, and QR-code spot below reads from this
  // same value instead of independently rebuilding the string.
  const publicUrl = buildCatalogPublicUrl(
    username,
    resolveConfiguredBaseUrl(
      typeof window !== "undefined" ? window.location.origin : "",
    ),
  );

  const handleCopyLink = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      alert("Catalog link copied successfully.");
    } catch (error) {
      console.error("Failed to copy catalog link:", error);
    }
  };

  const handleOpenCatalog = () => {
    if (!publicUrl) return;
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  };

  function getPublicCatalogUrl() {
    return publicUrl;
  }

  function formatDate(value: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function loadRazorpay() {
    if (typeof window === "undefined") return false;
    if ((window as any).Razorpay) return true;

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Unable to load payment gateway.")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Unable to load payment gateway."));
      document.body.appendChild(script);
    });

    return Boolean((window as any).Razorpay);
  }
  async function resolveCatalogUserId(): Promise<string> {
    // 1. Already resolved in state
    const currentId = String(userId || "").trim();

    if (currentId) {
      return currentId;
    }

    // 2. Try existing local/session storage helper
    const storedId = String(getUserId() || "").trim();

    if (storedId) {
      setUserId(storedId);
      return storedId;
    }

    // 3. Resolve from authenticated session
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Unable to read login session. Please login again.");
      }

      const data = await response.json();

      console.log("[Catalog Payment] /api/auth/me:", data);

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Login session expired. Please login again.",
        );
      }

      const candidates = [
        data?.user?._id,
        data?.user?.id,
        data?.user?.userId,

        data?.data?._id,
        data?.data?.id,
        data?.data?.userId,

        data?._id,
        data?.id,
        data?.userId,
      ];

      const resolvedId =
        candidates.map((value) => String(value ?? "").trim()).find(Boolean) ||
        "";

      if (!resolvedId) {
        console.error(
          "[Catalog Payment] User ID missing from /api/auth/me:",
          data,
        );

        throw new Error(
          "Logged-in user ID could not be found. Please login again.",
        );
      }

      setUserId(resolvedId);

      return resolvedId;
    } catch (error) {
      console.error("[Catalog Payment] Failed to resolve user ID:", error);

      throw new Error(
        error instanceof Error
          ? error.message
          : "Unable to identify logged-in user.",
      );
    }
  }
  async function handleCatalogPayment(finalCatalogId: string) {
    if (isCatalogPaid) return;

    if (!finalCatalogId) {
      alert("Catalog could not be saved. Please save the catalog first.");
      return;
    }

    if (!validateHero() || !validateCompany() || !validateProducts() || !validateUsername() || !validateBilling()) {
      return;
    }

    setIsPaying(true);

    try {
      const authenticatedUserId = await resolveCatalogUserId();

      // Keep state synchronized too.
      setUserId(authenticatedUserId);

      console.log("==========================================");
      console.log("[Catalog Payment] CREATE ORDER");
      console.log("[Catalog Payment] User ID:", authenticatedUserId);
      console.log("[Catalog Payment] Username:", username.trim());
      console.log("[Catalog Payment] Products:", savedProductIds.length);
      console.log("==========================================");

      const razorpayReady = await loadRazorpay();

      if (!razorpayReady) {
        throw new Error(
          "Payment gateway could not be loaded. Please try again.",
        );
      }

      const createOrderResponse = await fetch(
        "/api/catalogs/payment/create-order",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: authenticatedUserId,
            catalogId: finalCatalogId,
            username: username.trim(),
            layoutTemplateId,
            company,
            hero,
            products: products
              .filter((product) => savedProductIds.includes(product.id))
              .map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                sellingPrice: product.sellingPrice,
                mrp: product.mrp,
                image: product.image,
              })),
          }),
        },
      );

      const orderData = await createOrderResponse.json();

      console.log("[Catalog Payment] CREATE ORDER RESPONSE:", orderData);

      if (!createOrderResponse.ok || !orderData?.success) {
        throw new Error(
          orderData?.message || "Unable to create catalog payment.",
        );
      }

      const Razorpay = (window as any).Razorpay;

      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: orderData.amount,

        currency: orderData.currency || "INR",

        name: orderData.name || "Digi Profilo",

        description: orderData.description || "Catalog Subscription",

        order_id: orderData.orderId || orderData.order_id,

        prefill: {
          name: company.fullName,
          email: company.email,
          contact: company.mobile,
        },

        theme: {
          color: "#152A47",
        },

        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },

        handler: async (paymentResponse: any) => {
          try {
            const verifyResponse = await fetch("/api/catalogs/payment/verify", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                userId: authenticatedUserId,
                catalogId: finalCatalogId,
                username: username.trim(),
                layoutTemplateId,
                hero,
                billing,

                razorpay_order_id: paymentResponse?.razorpay_order_id,

                razorpay_payment_id: paymentResponse?.razorpay_payment_id,

                razorpay_signature: paymentResponse?.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            console.log("[Catalog Payment] VERIFY RESPONSE:", verifyData);

            if (!verifyResponse.ok || !verifyData?.success) {
              throw new Error(
                verifyData?.message || "Payment verification failed.",
              );
            }

            setCatalogId(finalCatalogId);
            setPaymentStatus("paid");
            setPaymentCompleted(true);
            setCurrentStep(6);

            setPaymentDate(
              String(
                verifyData.paymentDate ||
                  verifyData.paidAt ||
                  new Date().toISOString(),
              ),
            );

            const verifiedStart = String(
              verifyData.subscriptionStartDate || new Date().toISOString(),
            );

            setSubscriptionStartDate(verifiedStart);

            setSubscriptionEndDate(
              String(
                verifyData.subscriptionEndDate ||
                  verifyData.expiresAt ||
                  addOneYear(verifiedStart) ||
                  "",
              ),
            );

            const successUrl = `/dashboard/projects/create-project/catalog/success?username=${encodeURIComponent(
                username.trim(),
              )}&catalogId=${encodeURIComponent(finalCatalogId)}`;
            setSuccessRedirectUrl(successUrl);
            setShowSuccessOverlay(true);

          } catch (error) {
            console.error("[Catalog Payment] Verification error:", error);

            alert(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          } finally {
            setIsPaying(false);
          }
        },
      };

      if (!options.key || !options.amount || !options.order_id) {
        throw new Error("Invalid payment order received from server.");
      }

      const razorpay = new Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("[Catalog Payment] Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to start catalog payment.",
      );

      setIsPaying(false);
    }
  }

  async function copyCatalogLink() {
    const url = getPublicCatalogUrl();
    if (!url) {
      alert("Create a catalog username first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Catalog link copied.");
    } catch {
      alert(url);
    }
  }

  /* =========================================================
     WHATSAPP ORDER
  ========================================================= */

  function buildWhatsAppMessage() {
    const lines: string[] = [];

    lines.push(`Hello ${company.companyName || "Team"},`);
    lines.push("");
    lines.push("I would like to place an order from your catalog.");
    lines.push("");

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("ORDER DETAILS");
    lines.push("━━━━━━━━━━━━━━━━━━━━");

    cart.forEach((item, index) => {
      const itemTotal = productPrice(item) * item.quantity;

      lines.push(`${index + 1}. ${item.name}`);

      lines.push(`   Qty: ${item.quantity}`);

      lines.push(`   Price: ${formatCurrency(item.sellingPrice)}`);

      lines.push(`   Total: ${formatCurrency(itemTotal)}`);

      lines.push("");
    });

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push(`TOTAL: ${formatCurrency(cartTotal)}`);
    lines.push("━━━━━━━━━━━━━━━━━━━━");

    lines.push("");

    lines.push("CUSTOMER / CATALOG LINK");
    lines.push(publicUrl);

    lines.push("");

    lines.push("Please confirm my order. Thank you!");

    return lines.join("\n");
  }

  function orderOnWhatsApp() {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const whatsappNumber =
      company.whatsapp ||
      company.mobile ||
      process.env.NEXT_PUBLIC_COMPANY_WHATSAPP_NUMBER ||
      "";

    const phone = cleanPhoneNumber(whatsappNumber);

    if (!phone) {
      alert(
        "WhatsApp number is not available. Please update company contact information.",
      );
      return;
    }

    setIsOrdering(true);

    const message = buildWhatsAppMessage();

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      setIsOrdering(false);
    }, 700);
  }

  /* =========================================================
     PREVIEW
  ========================================================= */

  useEffect(() => {
    if (!showPreview) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPreview(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showPreview]);

  function openPreview() {
    setShowPreview(true);
  }

  function handleSuccessClose() {
    setShowSuccessOverlay(false);
    if (props?.onComplete) {
      props.onComplete();
      return;
    }
    router.push(successRedirectUrl);
  }

  async function handleHeaderPayment() {
    if (isPaying || catalogPriceLoading) return;

    if (
      catalogPrice === null ||
      !Number.isFinite(Number(catalogPrice)) ||
      Number(catalogPrice) <= 0
    ) {
      alert(
        "Catalog pricing is not configured. Please configure the Catalog price in Admin Pricing.",
      );
      return;
    }

    if (!validateHero() || !validateCompany() || !validateProducts() || !validateUsername() || !validateBilling()) {
      return;
    }

    try {
      const savedCatalogId = await saveDraft(false);
      if (!savedCatalogId) {
        throw new Error("Catalog could not be saved. Please try again.");
      }
      await handleCatalogPayment(savedCatalogId);
    } catch (error) {
      console.error("Header catalog payment failed:", error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  /* =========================================================
     NAVBAR CONTENT
     -----------------------------------------------------
     Rendered inside the shared dashboard Navbar's own row
     (see NavbarSlotContext) instead of a separate header bar
     below it, so "Product Catalog" and the account menu sit in
     one combined top row. Opt-in and scoped to this page only —
     every other dashboard/admin page keeps its Navbar exactly as
     it already renders.
  ========================================================= */

  // Memoized: without this, the JSX below is a brand-new element every
  // render, so the effect in useNavbarLeftSlot() (which depends on
  // this node) reruns and calls setContent() every render too. That
  // update on NavbarSlotProvider re-renders this same component,
  // producing a new node again — an infinite "Maximum update depth
  // exceeded" loop. Keying on the actual values shown here means the
  // slot content is only rebuilt (and setContent only called) when
  // something in it would visibly change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navbarLeftContent = useMemo(
    () => (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <button
        type="button"
        onClick={() => (props?.onBack ? props.onBack() : router.back())}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-muted transition hover:bg-page"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-xs font-bold text-ink sm:text-sm">
            Product Catalog
          </h1>

          <Edit3 size={14} className="hidden text-muted sm:block" />
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span className="hidden sm:inline">
            {company.companyName || "Create your digital catalog"}
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />

          <span className="flex items-center gap-1 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {savingDraft
              ? "Saving..."
              : saveSuccess
                ? "Catalog saved successfully."
                : lastSaved
                  ? `Draft saved ${lastSaved}`
                  : "Draft Saved"}
          </span>
        </div>
      </div>

      <div className="ml-auto hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-page px-2.5 py-1.5">
          <Package size={14} className="text-muted" />
          <span className="text-xs font-semibold text-ink">
            {products.filter((p) => p.name.trim()).length} Products
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={openPreview}
          className="hidden h-9 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-xs font-semibold text-ink transition hover:bg-page sm:flex"
        >
          <Eye size={14} />
          Preview
        </button>

        <button
          type="button"
          onClick={() => setShowCart(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition hover:opacity-90 sm:hidden"
        >
          <ShoppingCart size={17} />

          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-success px-1 text-[9px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
    ),
    [
      company.companyName,
      savingDraft,
      saveSuccess,
      lastSaved,
      products,
      cartCount,
      props?.onBack,
      router,
    ],
  );

  useNavbarLeftSlot(navbarLeftContent);

  /* =========================================================
     RENDER
  ========================================================= */

  // Steps with no inline "Template Preview" panel — the form takes
  // the full width instead. The header's own Preview button (opens
  // the Full Preview modal, fully live/reactive off the same state
  // as everything else) still works from every step regardless.
  const hidesLivePreviewPanel =
    currentStep === 2 || currentStep === 3;

  
  return {
    STEP_DATA,
    addHeroSlide,
    addProduct,
    addToCart,
    billing,
    billingErrors,
    cart,
    cartTotal,
    catalogId,
    catalogPrice,
    catalogPriceLoading,
    category,
    categoryImageCropSrc,
    categoryModal,
    categoryModalError,
    categoryModalIcon,
    categoryModalImage,
    categoryModalName,
    clearDemoProducts,
    closeCategoryModal,
    company,
    companyErrors,
    confirmDeleteCategory,
    cropImage,
    currentStep,
    deleteCategoryId,
    editProduct,
    editingProductId,
    errorToast,
    handleCategoryModalImageChange,
    handleCopyLink,
    handleHeaderPayment,
    handleSuccessClose,
    handleHeroImage,
    handleOpenCatalog,
    handleProductImage,
    handleSaveDraft,
    handleUsernameChange,
    hasChanges,
    hero,
    heroCropImage,
    heroCropTargetId,
    heroErrors,
    hidesLivePreviewPanel,
    imageLoadingId,
    isCatalogPaid,
    isInCart,
    isPaying,
    layoutTemplateId,
    loadingCompany,
    logoCropImage,
    mobilePanel,
    moveHeroSlide,
    nextStep,
    openAddCategoryModal,
    openEditCategoryModal,
    orderOnWhatsApp,
    paymentDate,
    paymentStatus,
    previousStep,
    productCategories,
    productErrors,
    products,
    publicUrl,
    removeFromCart,
    removeHeroSlide,
    removeProduct,
    replaceHeroSlideImage,
    router,
    sameWhatsappAsMobile,
    saveErrorMessage,
    saveProduct,
    savedProductIds,
    savingDraft,
    selectLayoutTemplate,
    setCategoryImageCropSrc,
    setCategoryModalError,
    setCategoryModalIcon,
    setCategoryModalImage,
    setCategoryModalName,
    setCropImage,
    setCurrentStep,
    setDeleteCategoryId,
    setErrorToast,
    setHeroCropImage,
    setHeroCropTargetId,
    setLogoCropImage,
    setMobilePanel,
    setPreviewProduct,
    setSameWhatsappAsMobile,
    setSaveErrorMessage,
    setShowPreview,
    setShowSuccessOverlay,
    setSuccessToast,
    setValidationToast,
    showDemoProducts,
    showPreview,
    showSuccessOverlay,
    stickyHeaderHeight,
    stickyHeaderRef,
    submitCategoryModal,
    subscriptionEndDate,
    subscriptionStartDate,
    successRedirectUrl,
    successToast,
    suggestUsernameFromCompany,
    toggleHeroSlideActive,
    updateBilling,
    updateCartQuantity,
    updateCompany,
    updateHero,
    updateProduct,
    username,
    usernameMessage,
    usernameStatus,
    validationToast
  };
}

export type CatalogEditorController = ReturnType<typeof useCatalogEditorController>;
