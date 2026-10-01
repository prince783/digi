"use client";

import { Check } from "lucide-react";

import { CATALOG_THEMES } from "@/lib/catalogThemes";

import {
  CatalogCategory,
  getDummyProducts,
} from "@/lib/catalogDummyData";

import CatalogRenderer from "./CatalogRenderer";

interface CatalogThemePickerProps {
  selectedThemeId: string;
  onSelect: (themeId: string) => void;
  category: CatalogCategory | undefined;
}

export default function CatalogThemePicker({
  selectedThemeId,
  onSelect,
  category,
}: CatalogThemePickerProps) {
  const products = getDummyProducts(category);

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
      {CATALOG_THEMES.map((theme) => {
        const selected =
          selectedThemeId === theme.id;

        return (
          <article
            key={theme.id}
            role="button"
            tabIndex={0}
            aria-label={`Select ${theme.name} template`}
            aria-pressed={selected}
            onClick={() => onSelect(theme.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(theme.id);
              }
            }}
            className={`cursor-pointer overflow-hidden rounded-[24px] border bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#6737e8] focus:ring-offset-2 ${
              selected
                ? "border-[#6737e8] ring-2 ring-[#6737e8]/20"
                : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
            }`}
          >
            <div className="relative flex h-[430px] w-full items-start justify-center overflow-hidden bg-gray-100">
              <div className="relative h-[430px] w-[237px] shrink-0 overflow-hidden bg-white shadow-sm">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[780px] w-[430px] origin-top -translate-x-1/2 scale-[0.55] overflow-hidden bg-white">
                  <CatalogRenderer
                    themeId={theme.id}
                    catalog={{
                      companyName: getCompanyName(category),
                      category,
                    }}
                    products={products}
                    useDummyProducts
                    isEditorPreview={true}
                  />
                </div>
              </div>

              {selected && (
                <div className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-[#6737e8] text-white shadow-lg">
                  <Check size={17} />
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function getCompanyName(
  category: CatalogCategory | undefined
) {
  switch (category) {
    case "Jewellery & Fashion Accessories":
      return "Rivaara Jewellery";

    case "Fashion & Clothing":
      return "StyleVibe";

    case "Ayurvedic & Natural Products":
      return "AyurLife";

    case "Beauty & Personal Care":
      return "Bloom Beauty";

    case "Home & Furniture":
      return "Casa Living";

    case "Medical & Healthcare":
      return "CareWell Medical";

    default:
      return "DailyMart";
  }
}