"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, Check, CreditCard, Edit3, ExternalLink, Eye, Loader2, Save, X } from "lucide-react";
import type { CatalogEditorController } from "../editor/useCatalogEditorController";
import CatalogThemePicker from "./CatalogThemePicker";
import CompanyStep from "./CompanyStep";
import HeroStep from "./HeroStep";
import UsernameStep from "./UsernameStep";
import BillingDetailsForm from "./BillingDetailsForm";
import ProductsStep from "./ProductsStep";
import PaymentStep from "./PaymentStep";
import TemplateLivePreview from "./TemplateLivePreview";

type CatalogEditorMainProps = { editor: CatalogEditorController };

export default function CatalogEditorMain({ editor }: CatalogEditorMainProps) {
  const {
    STEP_DATA,
    addProduct,
    billing,
    billingErrors,
    catalogId,
    catalogPrice,
    catalogPriceLoading,
    category,
    clearDemoProducts,
    company,
    companyErrors,
    currentStep,
    editProduct,
    editingProductId,
    handleCopyLink,
    handleHeaderPayment,
    handleHeroImage,
    handleOpenCatalog,
    handleProductImage,
    handleSaveDraft,
    handleUsernameChange,
    hasChanges,
    hero,
    heroErrors,
    hidesLivePreviewPanel,
    imageLoadingId,
    isCatalogPaid,
    isPaying,
    layoutTemplateId,
    loadingCompany,
    mobilePanel,
    moveHeroSlide,
    nextStep,
    openAddCategoryModal,
    openEditCategoryModal,
    paymentDate,
    paymentStatus,
    previousStep,
    productCategories,
    productErrors,
    products,
    publicUrl,
    removeHeroSlide,
    removeProduct,
    sameWhatsappAsMobile,
    saveErrorMessage,
    saveProduct,
    savedProductIds,
    savingDraft,
    selectLayoutTemplate,
    setDeleteCategoryId,
    setLogoCropImage,
    setMobilePanel,
    setPreviewProduct,
    setSameWhatsappAsMobile,
    setSaveErrorMessage,
    setSuccessToast,
    showDemoProducts,
    stickyHeaderHeight,
    subscriptionEndDate,
    subscriptionStartDate,
    suggestUsernameFromCompany,
    toggleHeroSlideActive,
    updateBilling,
    updateCompany,
    updateHero,
    updateProduct,
    username,
    usernameMessage,
    usernameStatus
  } = editor;

  return <main className="mx-auto max-w-[1500px] px-4 py-5 lg:px-6">
        {/* MOBILE/TABLET TABS
            Hidden on steps with no live template preview panel (see
            RIGHT PREVIEW below) — those steps show only the form, so
            there's nothing for a "Live Preview" tab to switch to.
            The header's own Preview button (opens the Full Preview
            modal) still works from any step. */}
        {!hidesLivePreviewPanel && (
          <div className="mb-4 flex rounded-xl border border-line bg-white p-1 xl:hidden">
            <button
              type="button"
              onClick={() => setMobilePanel("form")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold ${
                mobilePanel === "form"
                  ? "bg-ink text-white"
                  : "text-muted"
              }`}
            >
              <Edit3 size={14} />
              Edit Catalog
            </button>

            <button
              type="button"
              onClick={() => setMobilePanel("preview")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold ${
                mobilePanel === "preview"
                  ? "bg-ink text-white"
                  : "text-muted"
              }`}
            >
              <Eye size={14} />
              Live Preview
            </button>
          </div>
        )}

        {/* ===================================================
            DESKTOP 2 COLUMN EDITOR
        =================================================== */}

        {/* items-start would shrink the right column to only its own
            content height (~800px), leaving the sticky preview nothing
            to stick within past that point — it would leave the
            document flow entirely instead of staying pinned while the
            (usually much taller) left form scrolls. Default stretch
            keeps both columns the height of the taller one. */}
        <div
          className={`grid gap-5 ${
            hidesLivePreviewPanel
              ? "xl:grid-cols-1"
              : "xl:grid-cols-[minmax(620px,760px)_minmax(360px,500px)]"
          }`}
        >
          {/* =================================================
              LEFT EDITOR
          ================================================= */}

          <section
            className={`min-w-0 ${
              mobilePanel === "preview" && !hidesLivePreviewPanel
                ? "hidden xl:block"
                : "block"
            }`}
          >
            <div className="rounded-2xl border border-line bg-white shadow-sm">
              {/* =============================================
                  STICKY: step header + save error banner.
                  (The Previous/Save Draft/Continue action bar
                  lives at the bottom of this card now, sticky to
                  the viewport bottom instead — see below.)

                  top uses stickyHeaderHeight, MEASURED from the
                  actual navbar+progress wrapper above (ref=
                  stickyHeaderRef) rather than a hardcoded guess —
                  that wrapper's real height changes across
                  breakpoints (the progress bar gains step titles
                  at lg), and a fixed px value kept drifting out of
                  sync, breaking this box's sticky behavior at
                  whichever breakpoint the guess didn't match. A
                  small margin is subtracted so this box's top edge
                  stays just under the wrapper's real bottom rather
                  than sitting exactly at it (its higher z-index,
                  z-50 vs z-10, would otherwise create a 1px seam).
              ============================================= */}

              <div
                className="sticky z-10 rounded-t-2xl bg-white will-change-transform"
                style={{ top: Math.max(0, stickyHeaderHeight - 4) }}
              >
              {/* SECTION HEADER */}

              <div className="border-b border-line px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                      {(() => {
                        const Icon = STEP_DATA[currentStep - 1].icon;
                        return <Icon size={18} />;
                      })()}
                    </div>

                    <div className="min-w-0">
                      <p className="font-display text-xs font-bold uppercase tracking-wider text-primary">
                        Step {currentStep} of 6
                      </p>

                      <h2 className="truncate text-base font-bold text-ink">
                        {STEP_DATA[currentStep - 1].title}
                      </h2>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg bg-page px-3 py-1.5 font-display text-xs font-semibold text-muted">
                    {currentStep === 6
                      ? isCatalogPaid
                        ? "Catalog Active"
                        : "Payment Required"
                      : "In Progress"}
                  </span>
                </div>
              </div>

              {saveErrorMessage && (
                <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-3">
                  <p role="alert" className="text-xs font-semibold text-red-600">
                    {saveErrorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSaveErrorMessage("")}
                    aria-label="Dismiss save error"
                    className="shrink-0 rounded-md p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              </div>
              {/* end sticky step header */}

              {/* =================================================
                  STEP CONTENT
              ================================================= */}

              <div className="p-5 pb-24">
                {currentStep === 1 && (
                  <CatalogThemePicker
                    selectedThemeId={layoutTemplateId}
                    onSelect={selectLayoutTemplate}
                    category={category}
                  />
                )}

                {currentStep === 2 && (
                  <CompanyStep
                    company={company}
                    errors={companyErrors}
                    sameWhatsappAsMobile={sameWhatsappAsMobile}
                    setSameWhatsappAsMobile={(checked) => {
                      setSameWhatsappAsMobile(checked);
                      if (checked) {
                        updateCompany("whatsapp", company.mobile);
                      }
                    }}
                    loading={loadingCompany}
                    updateCompany={updateCompany}
                    setLogoCropImage={setLogoCropImage}
                    onImageRemoved={() =>
                      setSuccessToast("Image removed successfully.")
                    }
                  />
                )}

                {currentStep === 3 && (
                  <HeroStep
                    layoutTemplateId={layoutTemplateId}
                    hero={hero}
                    errors={heroErrors}
                    updateHero={updateHero}
                    handleHeroImage={handleHeroImage}
                    onRemoveSlide={removeHeroSlide}
                    onToggleSlideActive={toggleHeroSlideActive}
                    onMoveSlide={moveHeroSlide}
                  />
                )}

                {currentStep === 4 && (
                  <ProductsStep
                    products={products}
                    savedProductIds={savedProductIds}
                    productErrors={productErrors}
                    editingProductId={editingProductId}
                    imageLoadingId={imageLoadingId}
                    updateProduct={updateProduct}
                    handleProductImage={handleProductImage}
                    addProduct={addProduct}
                    clearDemoProducts={clearDemoProducts}
                    showDemoProducts={showDemoProducts}
                    removeProduct={removeProduct}
                    saveProduct={saveProduct}
                    editProduct={editProduct}
                    setPreviewProduct={setPreviewProduct}
                    productCategories={productCategories}
                    onAddCategory={openAddCategoryModal}
                    onEditCategory={openEditCategoryModal}
                    onDeleteCategory={setDeleteCategoryId}
                  />
                )}

                {currentStep === 5 && (
                  <UsernameStep
                    username={username}
                    status={usernameStatus}
                    message={usernameMessage}
                    onChange={handleUsernameChange}
                    company={company}
                    onSuggest={() => void suggestUsernameFromCompany(true)}
                  />
                )}

                {currentStep === 6 && !isCatalogPaid && (
                  <BillingDetailsForm
                    billing={billing}
                    errors={billingErrors}
                    onChange={updateBilling}
                  />
                )}

                {currentStep === 6 && (
                  <PaymentStep
                    isPaid={isCatalogPaid}
                    paymentStatus={paymentStatus}
                    paymentDate={paymentDate}
                    subscriptionStartDate={subscriptionStartDate}
                    subscriptionEndDate={subscriptionEndDate}
                    username={username}
                    company={company}
                    productsCount={products.length}
                    publicUrl={publicUrl}
                    isPaying={isPaying}
                    catalogPrice={catalogPrice}
                    catalogPriceLoading={catalogPriceLoading}
                    onCopyLink={handleCopyLink}
                    onOpenCatalog={handleOpenCatalog}
                  />
                )}
              </div>

              {/* =============================================
                  STICKY ACTION BAR — Previous / Save Draft /
                  Continue. Sticky to the viewport bottom (not
                  fixed), so it stays reachable while a long step
                  form scrolls, without leaving the card's own
                  width/bounds. rounded-b-2xl matches the card's
                  own bottom corners since this sits right at the
                  card's bottom edge. The p-5 content div above
                  has pb-24 so its last field never sits behind
                  this bar.
              ============================================= */}

              <div className="sticky bottom-0 z-30 rounded-b-2xl border-t border-line bg-white px-5 py-3 shadow-[0_-4px_16px_rgba(21,42,71,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={previousStep}
                      className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-bold text-ink transition hover:bg-page sm:px-4"
                    >
                      <ArrowLeft size={15} />
                      <span>Previous</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {!isCatalogPaid && (
                      <button
                        type="button"
                        onClick={() => void handleSaveDraft()}
                        disabled={savingDraft}
                        className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-bold text-ink transition hover:bg-page disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                      >
                        <Save size={15} />
                        <span className="hidden sm:inline">
                          Save Draft
                        </span>
                      </button>
                    )}

                    {currentStep < 6 ? (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={nextStep}
                          disabled={
                            savingDraft ||
                            (currentStep === 4 && Boolean(editingProductId))
                          }
                          title={
                            currentStep === 4 && editingProductId
                              ? "Save your product changes first"
                              : undefined
                          }
                          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                        >
                          <span>
                            {savingDraft
                              ? "Saving..."
                              : catalogId && hasChanges
                                ? "Update"
                                : "Continue"}
                          </span>
                          <ArrowRight size={15} />
                        </button>

                        {currentStep === 4 && editingProductId && (
                          <span className="text-[11px] font-semibold text-red-600">
                            Save your product changes first
                          </span>
                        )}
                      </div>
                    ) : !isCatalogPaid ? (
                      <button
                        type="button"
                        onClick={handleHeaderPayment}
                        disabled={isPaying || catalogPriceLoading}
                        className="flex h-10 items-center gap-2 rounded-xl bg-ink px-3 text-xs font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                        title="Pay and publish catalog"
                      >
                        {isPaying ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CreditCard size={15} />
                        )}
                        <span>
                          {isPaying ? "Processing..." : "Pay & Publish"}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenCatalog}
                        className="flex h-10 items-center gap-2 rounded-xl bg-ink px-3 text-xs font-bold text-white transition hover:opacity-90 sm:px-4"
                      >
                        <ExternalLink size={15} />
                        <span>Open Catalog</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* SECURITY / INFO */}
          </section>

          {/* =================================================
              RIGHT PREVIEW
          ================================================= */}

          {/* No live template preview on Steps 2 (Company) and 3
              (Hero) — see hidesLivePreviewPanel above (mobile tabs
              hidden, LEFT EDITOR forced full-width). The header's
              Preview button (openPreview(), unrelated to this panel)
              still opens the same Full Preview modal from any step. */}
          {!hidesLivePreviewPanel && (
            <section
              className={`min-w-0 ${
                mobilePanel === "form" ? "hidden xl:block" : "block"
              }`}
            >
              <TemplateLivePreview
                layoutTemplateId={layoutTemplateId}
                company={company}
                products={products}
                productCategories={productCategories}
                showDemoProducts={showDemoProducts}
                category={category}
                hero={hero}
                stickyHeaderHeight={stickyHeaderHeight}
              />

              {/* Mobile/tablet only: preview and editor are separate
                  tabs there (see mobilePanel above), so give a way
                  back to the form instead of leaving the user stuck
                  on the read-only preview. Fixed to the viewport
                  bottom (not just placed below the phone frame) since
                  the frame has its own internal scroll — a button
                  sitting below it in normal flow would be unreachable
                  whenever the user's scroll gesture lands inside the
                  frame instead of the page. */}
              {mobilePanel === "preview" && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 xl:hidden">
                  <button
                    type="button"
                    onClick={() => setMobilePanel("form")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>;
}
