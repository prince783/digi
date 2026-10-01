"use client";

import { useState } from "react";

import { CATALOG_THEMES } from "@/lib/catalogThemes";
import { getDummyProducts } from "@/lib/catalogDummyData";
import CatalogRenderer from "@/app/dashboard/projects/create-project/catalog/components/ui/CatalogRenderer";

import { TEMPLATE_DATA as DIGITAL_CARD_TEMPLATES } from "@/app/dashboard/projects/create-project/digicards/components/templateData";

import { templates as RESUME_TEMPLATES } from "@/app/dashboard/projects/create-project/resume/template-data";
import { initialResume } from "@/app/dashboard/projects/create-project/resume/initial-resume";
import { ResumeDocument } from "@/app/dashboard/projects/create-project/resume/resume-document";

type Product = "catalog" | "digital-visiting-card" | "resume";

const TABS: { id: Product; label: string; count: number }[] = [
  { id: "catalog", label: "Catalog", count: CATALOG_THEMES.length },
  {
    id: "digital-visiting-card",
    label: "Digital Visiting Card",
    count: DIGITAL_CARD_TEMPLATES.length,
  },
  { id: "resume", label: "Resume", count: RESUME_TEMPLATES.length },
];

export default function AdminTemplatesPage() {
  const [tab, setTab] = useState<Product>("catalog");

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-[-0.5px] text-[#121212] sm:text-2xl">
            Templates
          </h1>

          <p className="mt-1 text-xs text-[#77736E] sm:text-sm">
            Every design vendors can pick from, across all three products.
            This is a read-only gallery — new templates are added in code, not here.
          </p>
        </div>

        {/* =====================================================
            TABS
        ====================================================== */}

        <div className="mb-6 flex gap-2 border-b border-[#E5E0D9] overflow-x-auto hide-scrollbar whitespace-nowrap pb-px">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === item.id
                  ? "border-[#1E3A5F] text-[#1E3A5F]"
                  : "border-transparent text-[#77736E] hover:text-[#121212]"
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  tab === item.id
                    ? "bg-[#EAF0F6] text-[#1E3A5F]"
                    : "bg-[#F5F1E9] text-[#77736E]"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {tab === "catalog" && <CatalogTemplatesTab />}
        {tab === "digital-visiting-card" && <DigitalCardTemplatesTab />}
        {tab === "resume" && <ResumeTemplatesTab />}
      </div>
    </main>
  );
}

/* =========================================================
   CATALOG TAB

   Live-rendered — CatalogRenderer takes plain props, so each
   tile is a real, independent instance of the actual template.
========================================================= */

function CatalogTemplatesTab() {
  const [openTheme, setOpenTheme] =
    useState<(typeof CATALOG_THEMES)[number] | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CATALOG_THEMES.map((theme) => {
          const category = theme.categories[0];
          const products = getDummyProducts(category);

          return (
            // Not a <button>: the live-rendered template below already
            // contains its own buttons, and nesting button-in-button is
            // invalid HTML that breaks hydration.
            <div
              key={theme.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpenTheme(theme)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setOpenTheme(theme);
                }
              }}
              className="cursor-pointer overflow-hidden rounded-xl border border-[#E5E0D9] bg-white text-left shadow-[0_1px_4px_rgba(21,42,71,0.025)] transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2"
            >
              <div className="relative h-[300px] w-full overflow-hidden bg-[#FAF9F6]">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[545px] w-[300px] origin-top -translate-x-1/2 scale-[0.55] overflow-hidden bg-white">
                  <CatalogRenderer
                    themeId={theme.id}
                    catalog={{ companyName: "Your Company", category }}
                    products={products}
                    useDummyProducts
                    isEditorPreview
                  />
                </div>
              </div>

              <div className="border-t border-[#E5E0D9] px-4 py-3">
                <p className="text-sm font-semibold text-[#121212]">{theme.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[#77736E]">
                  {theme.description}
                </p>
                <p className="mt-1.5 text-[10px] font-mono text-[#77736E]">{theme.id}</p>
              </div>
            </div>
          );
        })}
      </div>

      {openTheme && (
        <CatalogTemplateModal theme={openTheme} onClose={() => setOpenTheme(null)} />
      )}
    </>
  );
}

/* =========================================================
   CATALOG TEMPLATE MODAL

   Full-size, unscaled render of the picked template — the
   exact component a vendor's real public catalog page uses,
   not a shrunk-down thumbnail.
========================================================= */

function CatalogTemplateModal({
  theme,
  onClose,
}: {
  theme: (typeof CATALOG_THEMES)[number];
  onClose: () => void;
}) {
  const category = theme.categories[0];
  const products = getDummyProducts(category);

  return (
    // z-[1300]: the admin Sidebar/Navbar use MUI's zIndex 1200/1100,
    // which sits above a plain Tailwind z-50.
    <div className="fixed inset-0 z-[1300] flex flex-col bg-black/40">
      <div className="flex items-center justify-between border-b border-[#E5E0D9] bg-white px-4 py-3 sm:px-5 sm:py-4">
        <div>
          <p className="text-sm font-semibold text-[#121212]">{theme.name}</p>
          <p className="text-xs text-[#77736E]">{theme.description}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#E5E0D9] px-4 py-2 text-xs font-semibold text-[#121212] transition hover:bg-[#FAF9F6]"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#FAF9F6]">
        <div className="mx-auto max-w-4xl bg-white shadow-lg">
          <CatalogRenderer
            themeId={theme.id}
            catalog={{ companyName: "Your Company", category }}
            products={products}
            useDummyProducts
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DIGITAL VISITING CARD TAB

   These templates render through a context provider tied to
   the signed-in vendor's own card, so they can't be mounted
   standalone here. Their own static preview image (already
   used inside the vendor template picker) is a faithful
   representative instead.
========================================================= */

function DigitalCardTemplatesTab() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {DIGITAL_CARD_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className="overflow-hidden rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]"
        >
          <div
            className="relative aspect-[3/4] w-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${template.image})`,
              backgroundColor: template.background,
            }}
          >
            <div
              className="absolute inset-x-0 bottom-0 h-1.5"
              style={{ backgroundColor: template.accent }}
            />
          </div>

          <div className="border-t border-[#E5E0D9] px-3 py-2.5">
            <p className="truncate text-xs font-semibold text-[#121212]">
              {template.name}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-[#77736E]">
              {template.categoryLabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   RESUME TAB

   Live-rendered — ResumeDocument is a plain-props component,
   same zoom(0.353) technique the resume builder's own preview
   pane already uses on a 794px-wide render.
========================================================= */

function ResumeTemplatesTab() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {RESUME_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className="overflow-hidden rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]"
        >
          <div className="relative h-[320px] w-full overflow-hidden bg-[#FAF9F6]">
            <div className="mx-auto mt-3 h-[290px] w-[210px] overflow-hidden border border-[#E5E0D9] bg-white">
              <div className="w-[794px]" style={{ zoom: 0.264 }}>
                <ResumeDocument
                  resume={initialResume}
                  template={template.id}
                  color={template.defaultColor}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E5E0D9] px-4 py-3">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: template.defaultColor }}
              />
              <p className="text-sm font-semibold text-[#121212]">{template.name}</p>
              {template.recommended && (
                <span className="ml-auto rounded-full bg-[#EAF0F6] px-2 py-0.5 text-[10px] font-medium text-[#1E3A5F]">
                  Recommended
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-[#77736E]">
              {template.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
