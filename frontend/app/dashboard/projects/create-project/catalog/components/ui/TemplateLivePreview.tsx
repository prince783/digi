"use client";

import type { CatalogCategory, CatalogProduct } from "@/lib/catalogDummyData";
import { getDummyProducts } from "@/lib/catalogDummyData";
import { Eye } from "lucide-react";
import type { Company, HeroContent, Product, ProductCategory } from "../catalog-editor.types";
import { resolveHeroImage, resolveProductCategory } from "../editor/utils/catalog-editor.utils";
import CatalogRenderer from "./CatalogRenderer";
export default function TemplateLivePreview({
  layoutTemplateId,
  company,
  products,
  productCategories,
  showDemoProducts,
  category,
  hero,
  stickyHeaderHeight,
}: {
  layoutTemplateId: string;
  company: Company;
  products: Product[];
  productCategories: ProductCategory[];
  showDemoProducts: boolean;
  category: CatalogCategory | undefined;
  hero: HeroContent;
  stickyHeaderHeight: number;
}) {
  const dummyProducts = getDummyProducts(category);
  const heroForRender = { ...hero, image: resolveHeroImage(hero) };
  const previewProducts = showDemoProducts
    ? dummyProducts
    : products
        .filter((product) => product.name.trim() || product.image.trim())
        .map((product) => ({
          _id: product.id,
          name: product.name || "Product",
          description: product.description || "Product description",
          image: product.image || "",
          mrp: Number(product.mrp) || 0,
          price: Number(product.sellingPrice) || 0,
          category,
          productCategory: resolveProductCategory(product, productCategories),
          hero: heroForRender,
        }));

  return (
    // Same measured stickyHeaderHeight as the left column's sticky
    // step header, so both columns line up while scrolling. z-10 to
    // match that header too — without it this had no explicit
    // stacking order and could paint above the navbar/progress bar
    // while scrolling instead of staying tucked underneath them.
    <div
      className="sticky z-10 will-change-transform"
      style={{ top: Math.max(0, stickyHeaderHeight - 4) }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-ink">
              Template Preview
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            {showDemoProducts
              ? "Sample products show how this template will look."
              : "Your catalog details update this preview live."}
          </p>
        </div>
        <span className="rounded-lg bg-page px-2.5 py-1.5 text-xs font-bold text-muted">
          Live
        </span>
      </div>

      <div className="mx-auto h-[680px] w-full max-w-[430px] overflow-hidden rounded-[30px] border-[7px] border-ink bg-white shadow-2xl">
        <div className="hide-scrollbar h-full w-full overflow-y-auto overscroll-contain">
          <CatalogRenderer
            themeId={layoutTemplateId}
            catalog={{
              companyName: company.companyName || undefined,
              logo: company.logo || undefined,
              tagline: company.tagline || undefined,
              category,
              hero: heroForRender,
            }}
            products={previewProducts}
            useDummyProducts={showDemoProducts}
            isEditorPreview={true}
          />
        </div>
      </div>
    </div>
  );
}

