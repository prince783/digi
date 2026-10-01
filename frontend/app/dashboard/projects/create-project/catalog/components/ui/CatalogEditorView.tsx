"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, Check, CreditCard, Edit3, ExternalLink, Eye, Loader2, Save, X } from "lucide-react";
import type { Step } from "../catalog-editor.types";
import type { CatalogEditorController } from "../editor/useCatalogEditorController";
import CatalogEditorMain from "./CatalogEditorMain";
import PaymentSuccessOverlay from "@/app/components/PaymentSuccessOverlay";
import CatalogThemePicker from "./CatalogThemePicker";
import CompanyStep from "./CompanyStep";
import HeroStep from "./HeroStep";
import UsernameStep from "./UsernameStep";
import BillingDetailsForm from "./BillingDetailsForm";
import ProductsStep from "./ProductsStep";
import ProductImageCropper from "./ProductImageCropper";
import { CategoryFormModal, DeleteCategoryConfirmModal } from "./CategoryComponents";
import PaymentStep from "./PaymentStep";
import TemplateLivePreview from "./TemplateLivePreview";
import CatalogPreview from "./CatalogPreview";

export default function CatalogEditorView({ editor }: { editor: CatalogEditorController }) {
  const {
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
  } = editor;

  return <div className="min-h-screen overflow-x-clip bg-[#FAF9F6] pb-10 font-display text-ink">
      {/* ===========================================
          PAYMENT SUCCESS OVERLAY
      =========================================== */}
      {showSuccessOverlay && (
        <PaymentSuccessOverlay
          productType="catalog"
          customerName={company.fullName || company.companyName}
          productUrl={publicUrl}
          onClose={handleSuccessClose}
        />
      )}
      {/* ===========================================
          TOAST STACK (validation / success / error) —
          one column so simultaneous toasts offset instead
          of rendering on top of each other.
      =========================================== */}
      {(validationToast?.length || successToast || errorToast) && (
        <div
          className="fixed right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
          style={{ top: stickyHeaderHeight + 16 }}
        >
          {validationToast && validationToast.length > 0 && (
            <div className="animate-[slideInRight_0.25s_ease-out] flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-lg">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">
                  Please complete the required fields
                </p>
                <ul className="mt-1 list-inside list-disc text-xs text-muted">
                  {validationToast.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setValidationToast(null)}
                className="shrink-0 text-muted hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {successToast && (
            <div className="animate-[slideInRight_0.25s_ease-out] flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-lg">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600">
                <Check size={16} className="text-white" />
              </div>
              <p className="min-w-0 flex-1 text-sm font-bold text-ink">
                {successToast.message}
              </p>
              <button
                type="button"
                onClick={() => setSuccessToast(null)}
                className="shrink-0 text-muted hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {errorToast && (
            <div className="animate-[slideInRight_0.25s_ease-out] flex items-center gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-lg">
              <AlertTriangle size={18} className="shrink-0 text-red-500" />
              <p className="min-w-0 flex-1 text-sm font-bold text-ink">
                {errorToast.message}
              </p>
              <button
                type="button"
                onClick={() => setErrorToast(null)}
                className="shrink-0 text-muted hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      {/* "Product Catalog" + back button + status + Products count
          + Preview now render INSIDE the shared dashboard Navbar's
          own row instead of a separate header bar here (see
          useNavbarLeftSlot() above and NavbarSlotContext) — the
          Navbar is fixed/64px tall on every page, so this progress
          bar is the only thing left in this page's own sticky
          wrapper (ref={stickyHeaderRef}). The per-step section
          header (further down in this file, and twice more in
          TemplateLivePreview / CatalogPreview below) reads this
          wrapper's MEASURED height via stickyHeaderHeight state
          rather than a hardcoded px guess — a guess drifts out of
          sync whenever this wrapper's real height changes (e.g. the
          progress bar gaining step titles at the lg breakpoint),
          silently breaking those elements' sticky behavior. */}
      {/* Fully opaque, no backdrop-blur: that combo on a sticky
          element repaints every scroll frame and can lag behind
          fast scrolling, letting a stale frame of the content
          scrolling underneath flash through for an instant. */}
      <div
        ref={stickyHeaderRef}
        className="sticky top-16 z-50 will-change-transform"
      >
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-2.5 lg:px-6">
          <div className="flex items-center justify-between">
            {STEP_DATA.map((item, index) => {
              const Icon = item.icon;

              const active = currentStep === item.step;
              const completed =
                currentStep > item.step ||
                (item.step === 6 && isCatalogPaid);

              return (
                <div
                  key={item.step}
                  className="flex min-w-0 flex-1 items-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (item.step < currentStep) {
                        setCurrentStep(item.step as Step);
                      }
                    }}
                    className={`group flex min-w-0 items-center gap-2 ${
                      item.step <= currentStep
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                        completed
                          ? "border-primary bg-primary text-white"
                          : active
                            ? "border-success bg-accent text-success"
                            : "border-line bg-white text-muted"
                      }`}
                    >
                      {completed ? <Check size={13} /> : <Icon size={13} />}
                    </div>

                    <div className="hidden min-w-0 text-left lg:block">
                      <p
                        className={`truncate font-display text-xs font-bold ${
                          active || completed
                            ? "text-ink"
                            : "text-muted"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="truncate font-display text-xs text-muted">
                        {item.description}
                      </p>
                    </div>
                  </button>

                  {index < STEP_DATA.length - 1 && (
                    <div
                      className={`mx-2 h-px flex-1 ${
                        currentStep > item.step
                          ? "bg-ink"
                          : "bg-line"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
      {/* end shared sticky header + progress wrapper */}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <CatalogEditorMain editor={editor} />

      {cropImage && (
        <ProductImageCropper
          src={cropImage.src}
          onCancel={() => setCropImage(null)}
          onSave={(croppedImage) => {
            updateProduct(cropImage.productId, "image", croppedImage);
            setCropImage(null);
            setSuccessToast("Image uploaded successfully.");
          }}
        />
      )}

      {heroCropImage && (
        <ProductImageCropper
          src={heroCropImage}
          aspectRatio={16 / 9}
          title={heroCropTargetId ? "Crop Slide Image" : "Crop New Slide"}
          outputWidth={1920}
          outputHeight={1080}
          onCancel={() => {
            setHeroCropImage(null);
            setHeroCropTargetId(null);
          }}
          onSave={(croppedImage) => {
            if (heroCropTargetId) {
              replaceHeroSlideImage(heroCropTargetId, croppedImage);
            } else {
              addHeroSlide(croppedImage);
            }
            setHeroCropImage(null);
            setHeroCropTargetId(null);
          }}
        />
      )}

      {logoCropImage && (
        <ProductImageCropper
          src={logoCropImage}
          aspectRatio={16 / 9}
          title="Crop Logo"
          outputWidth={640}
          outputHeight={360}
          onCancel={() => setLogoCropImage(null)}
          onSave={(croppedImage) => {
            updateCompany("logo", croppedImage);
            setLogoCropImage(null);
            setSuccessToast("Image uploaded successfully.");
          }}
        />
      )}

      {categoryImageCropSrc && (
        <ProductImageCropper
          src={categoryImageCropSrc}
          aspectRatio={1}
          title="Crop Category Image"
          outputWidth={400}
          outputHeight={400}
          onCancel={() => setCategoryImageCropSrc(null)}
          onSave={(croppedImage) => {
            setCategoryModalImage(croppedImage);
            setCategoryImageCropSrc(null);
          }}
        />
      )}

      {categoryModal && (
        <CategoryFormModal
          mode={categoryModal.mode}
          name={categoryModalName}
          setName={(value) => {
            setCategoryModalName(value);
            setCategoryModalError("");
          }}
          icon={categoryModalIcon}
          setIcon={setCategoryModalIcon}
          image={categoryModalImage}
          onImageFileSelected={handleCategoryModalImageChange}
          onRemoveImage={() => setCategoryModalImage("")}
          error={categoryModalError}
          onCancel={closeCategoryModal}
          onSubmit={submitCategoryModal}
        />
      )}

      {deleteCategoryId && (
        <DeleteCategoryConfirmModal
          onCancel={() => setDeleteCategoryId(null)}
          onConfirm={confirmDeleteCategory}
        />
      )}

      {/* =====================================================
          FULL PREVIEW MODAL
      ===================================================== */}

      {showPreview && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink/70 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-preview-title"
        >
          <div className="flex h-full max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#FAF9F6] shadow-2xl">
            <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
              <div>
                <h3
                  id="catalog-preview-title"
                  className="text-sm font-bold"
                >
                  Catalog Preview
                </h3>

                <p className="text-xs text-muted">
                  How your customers will see the catalog
                </p>
              </div>

              <button
                type="button"
                aria-label="Close catalog preview"
                onClick={() => setShowPreview(false)}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-page px-3 text-xs font-semibold text-ink transition hover:bg-line"
              >
                <X size={17} />
                <span>Close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-md">
                <CatalogPreview
                  company={company}
                  products={products}
                  productCategories={productCategories}
                  layoutTemplateId={layoutTemplateId}
                  cart={cart}
                  username={username}
                  total={cartTotal}
                  onAddToCart={addToCart}
                  isInCart={isInCart}
                  onRemoveFromCart={removeFromCart}
                  onQuantityChange={updateCartQuantity}
                  onOrder={orderOnWhatsApp}
                  showDemoProducts={showDemoProducts}
                  category={category}
                  hero={hero}
                  stickyHeaderHeight={stickyHeaderHeight}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
}
