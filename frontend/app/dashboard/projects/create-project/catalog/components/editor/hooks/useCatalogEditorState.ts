"use client";

import { useRef, useState } from "react";
import type { Billing, BillingErrors } from "@/lib/billing";
import type { CatalogCategory } from "@/lib/catalogDummyData";
import { DEFAULT_BILLING } from "@/lib/billing";
import { DEFAULT_COMPANY, DEFAULT_LAYOUT_TEMPLATE_ID, DEFAULT_TEMPLATE_ID, getHeroDefaults } from "../config/catalog-editor.defaults";
import { createProduct } from "../utils/catalog-editor.utils";
import { DEFAULT_CATEGORY_ICON } from "@/lib/productCategoryIcons";
import type { CartItem, Company, CompanyErrors, HeroContent, HeroErrors, Product, ProductCategory, ProductErrors, Step, UsernameStatus } from "../../catalog-editor.types";

export function useCatalogEditorState() {
const stickyHeaderRef = useRef<HTMLDivElement>(null);
const [stickyHeaderHeight, setStickyHeaderHeight] = useState(116);
const [currentStep, setCurrentStep] = useState<Step>(1);
const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
const [layoutTemplateId, setLayoutTemplateId] = useState(
    DEFAULT_LAYOUT_TEMPLATE_ID,
  );
const [company, setCompany] = useState<Company>(DEFAULT_COMPANY);
const [billing, setBilling] = useState<Billing>(DEFAULT_BILLING);
const [billingErrors, setBillingErrors] = useState<BillingErrors>({});
const [category, setCategory] = useState<CatalogCategory | undefined>(
    undefined,
  );
const [hero, setHero] = useState<HeroContent>(() => ({
    ...getHeroDefaults(DEFAULT_LAYOUT_TEMPLATE_ID),
  }));
const heroCustomizedRef = useRef(false);
const [companyErrors, setCompanyErrors] = useState<CompanyErrors>({});
const [heroErrors, setHeroErrors] = useState<HeroErrors>({});
const [sameWhatsappAsMobile, setSameWhatsappAsMobile] = useState(false);
const [products, setProducts] = useState<Product[]>([createProduct()]);
const [showDemoProducts, setShowDemoProducts] = useState(true);
const [productCategories, setProductCategories] = useState<
    ProductCategory[]
  >([]);
const [categoryModal, setCategoryModal] = useState<{
    mode: "add" | "edit";
    categoryId?: string;
    forProductId?: string;
  } | null>(null);
const [categoryModalName, setCategoryModalName] = useState("");
const [categoryModalIcon, setCategoryModalIcon] = useState<string>(
    DEFAULT_CATEGORY_ICON,
  );
const [categoryModalImage, setCategoryModalImage] = useState("");
const [categoryModalError, setCategoryModalError] = useState("");
const [categoryImageCropSrc, setCategoryImageCropSrc] = useState<
    string | null
  >(null);
const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(
    null,
  );
const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
const [productErrors, setProductErrors] = useState<
    Record<string, ProductErrors>
  >({});
const [editingProductId, setEditingProductId] = useState<string | null>(null);
const [cart, setCart] = useState<CartItem[]>([]);
const [username, setUsername] = useState("");
const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
const [usernameMessage, setUsernameMessage] = useState("");
const [catalogId, setCatalogId] = useState("");
const [paymentStatus, setPaymentStatus] = useState("pending");
const [paymentCompleted, setPaymentCompleted] = useState(false);
const [paymentDate, setPaymentDate] = useState("");
const [subscriptionStartDate, setSubscriptionStartDate] = useState("");
const [subscriptionEndDate, setSubscriptionEndDate] = useState("");
const [isPaying, setIsPaying] = useState(false);
const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
const [successRedirectUrl, setSuccessRedirectUrl] = useState("");
const [urlReady, setUrlReady] = useState(false);
const [loadingCompany, setLoadingCompany] = useState(true);
const [savingDraft, setSavingDraft] = useState(false);
const [saveSuccess, setSaveSuccess] = useState(false);
const [saveErrorMessage, setSaveErrorMessage] = useState("");
const [lastSaved, setLastSaved] = useState<string>("");
const [mobilePanel, setMobilePanel] = useState<"form" | "preview">("form");
const [showPreview, setShowPreview] = useState(false);
const [hasChanges, setHasChanges] = useState(false);
const [showCart, setShowCart] = useState(false);
const [isOrdering, setIsOrdering] = useState(false);
const [imageLoadingId, setImageLoadingId] = useState<string | null>(null);
const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
const [cropImage, setCropImage] = useState<{
    productId: string;
    src: string;
  } | null>(null);
const [heroCropImage, setHeroCropImage] = useState<string | null>(null);
const [heroCropTargetId, setHeroCropTargetId] = useState<string | null>(
    null,
  );
const [logoCropImage, setLogoCropImage] = useState<string | null>(null);
const [validationToast, setValidationToast] = useState<string[] | null>(
    null,
  );
const [successToast, setSuccessToastState] = useState<{
    message: string;
    key: number;
  } | null>(null);
const [errorToast, setErrorToastState] = useState<{
    message: string;
    key: number;
  } | null>(null);
const [catalogPrice, setCatalogPrice] = useState<number | null>(null);
const [catalogPriceLoading, setCatalogPriceLoading] = useState(true);
const [userId, setUserId] = useState("");
const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const originalUsernameRef = useRef("");
const initializedRef = useRef("");
const savingServerRef = useRef(false);

function setSuccessToast(message: string | null) {
  setSuccessToastState(message ? { message, key: Date.now() } : null);
}

function setErrorToast(message: string | null) {
  setErrorToastState(message ? { message, key: Date.now() } : null);
}

function reportMissingFields(missing: { id: string; label: string }[]) {
  setValidationToast(missing.map((item) => item.label));

  const first = missing[0];
  if (!first) return;

  requestAnimationFrame(() => {
    const element = document.getElementById(first.id);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    (element as HTMLInputElement | HTMLTextAreaElement | null)?.focus?.({
      preventScroll: true,
    });
  });
}

  return {
    stickyHeaderRef,
    stickyHeaderHeight,
    setStickyHeaderHeight,
    currentStep,
    setCurrentStep,
    templateId,
    setTemplateId,
    layoutTemplateId,
    setLayoutTemplateId,
    company,
    setCompany,
    billing,
    setBilling,
    billingErrors,
    setBillingErrors,
    category,
    setCategory,
    hero,
    setHero,
    heroCustomizedRef,
    companyErrors,
    setCompanyErrors,
    heroErrors,
    setHeroErrors,
    sameWhatsappAsMobile,
    setSameWhatsappAsMobile,
    products,
    setProducts,
    showDemoProducts,
    setShowDemoProducts,
    productCategories,
    setProductCategories,
    categoryModal,
    setCategoryModal,
    categoryModalName,
    setCategoryModalName,
    categoryModalIcon,
    setCategoryModalIcon,
    categoryModalImage,
    setCategoryModalImage,
    categoryModalError,
    setCategoryModalError,
    categoryImageCropSrc,
    setCategoryImageCropSrc,
    deleteCategoryId,
    setDeleteCategoryId,
    savedProductIds,
    setSavedProductIds,
    productErrors,
    setProductErrors,
    editingProductId,
    setEditingProductId,
    cart,
    setCart,
    username,
    setUsername,
    usernameStatus,
    setUsernameStatus,
    usernameMessage,
    setUsernameMessage,
    catalogId,
    setCatalogId,
    paymentStatus,
    setPaymentStatus,
    paymentCompleted,
    setPaymentCompleted,
    paymentDate,
    setPaymentDate,
    subscriptionStartDate,
    setSubscriptionStartDate,
    subscriptionEndDate,
    setSubscriptionEndDate,
    isPaying,
    setIsPaying,
    showSuccessOverlay,
    setShowSuccessOverlay,
    successRedirectUrl,
    setSuccessRedirectUrl,
    urlReady,
    setUrlReady,
    loadingCompany,
    setLoadingCompany,
    savingDraft,
    setSavingDraft,
    saveSuccess,
    setSaveSuccess,
    saveErrorMessage,
    setSaveErrorMessage,
    lastSaved,
    setLastSaved,
    mobilePanel,
    setMobilePanel,
    showPreview,
    setShowPreview,
    hasChanges,
    setHasChanges,
    showCart,
    setShowCart,
    isOrdering,
    setIsOrdering,
    imageLoadingId,
    setImageLoadingId,
    previewProduct,
    setPreviewProduct,
    cropImage,
    setCropImage,
    heroCropImage,
    setHeroCropImage,
    heroCropTargetId,
    setHeroCropTargetId,
    logoCropImage,
    setLogoCropImage,
    validationToast,
    setValidationToast,
    successToast,
    setSuccessToastState,
    errorToast,
    setErrorToastState,
    catalogPrice,
    setCatalogPrice,
    catalogPriceLoading,
    setCatalogPriceLoading,
    userId,
    setUserId,
    usernameTimerRef,
    originalUsernameRef,
    initializedRef,
    savingServerRef,
    setSuccessToast,
    setErrorToast,
    reportMissingFields,
  };
}
