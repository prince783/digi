"use client";

import type { ChangeEvent } from "react";
import { Edit3, Eye, ImagePlus, Package, Save, Trash2, X } from "lucide-react";
import type { Product, ProductCategory, ProductErrors } from "../catalog-editor.types";
import { FormInput, FormTextarea } from "./form-controls";
import { CategoryDropdown, CategoryThumb } from "./CategoryComponents";
export default function ProductEditorCard({
  product,
  index,
  imageLoading,
  updateProduct,
  handleProductImage,
  removeProduct,
  saveProduct,
  setPreviewProduct,
  errors,
  isNew,
  productCategories,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: {
  product: Product;
  index: number;
  imageLoading: boolean;
  updateProduct: (id: string, field: keyof Product, value: string) => void;
  handleProductImage: (
    id: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  removeProduct: (id: string) => void;
  saveProduct: (id: string) => void;
  setPreviewProduct: (product: Product) => void;
  errors?: ProductErrors;
  isNew: boolean;
  productCategories: ProductCategory[];
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: () => void;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-line bg-page/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-xs font-bold text-white">
            {index + 1}
          </div>
          <div>
            <p className="text-xs font-bold text-ink">
              Product {index + 1}
            </p>
            <p className="text-xs text-muted">
              {isNew ? "New product" : "Editing product"}
            </p>
          </div>
        </div>

        {isNew ? (
          <button
            type="button"
            onClick={() => removeProduct(product.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-500"
            title="Close new product"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPreviewProduct(product)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-bold text-muted hover:bg-page"
          >
            <Eye size={13} />
            Preview
          </button>
        )}
      </div>

      <div className="p-5 md:p-6">
        <div className="mb-5">
          <CategoryDropdown
            categories={productCategories}
            value={product.categoryId}
            onSelect={(categoryId) => onSelectCategory(categoryId)}
            onAddNew={onAddCategory}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[190px_1fr]">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
              Product Image
            </p>

            <label className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-page transition hover:border-muted hover:bg-page">
              {product.image ? (
                <>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition group-hover:opacity-100">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-ink">
                      <Edit3 size={13} />
                      Change Image
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  {imageLoading ? (
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-line border-t-slate-900" />
                  ) : (
                    <ImagePlus size={24} className="mx-auto text-muted" />
                  )}
                  <p className="mt-2 text-xs font-bold text-muted">
                    Add Image
                  </p>
                  <p className="mt-1 text-[9px] text-muted">
                    JPG, PNG up to 5MB · Crop to 800 × 800 px
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleProductImage(product.id, event)}
              />
            </label>
            {errors?.image && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.image}
              </p>
            )}
            <p className="mt-2 text-xs leading-4 text-muted">
              Recommended: square 800 × 800 px for the best product fit.
            </p>
          </div>

          <div className="space-y-4">
            <FormInput
              label="Product Name"
              value={product.name}
              onChange={(value) => updateProduct(product.id, "name", value)}
              placeholder="e.g. Premium Almonds"
              required
              maxLength={25}
              counterMax={25}
              error={errors?.name}
            />

            <FormTextarea
              label="Product Description (Optional)"
              value={product.description}
              onChange={(value) =>
                updateProduct(product.id, "description", value)
              }
              placeholder="Write a short product description..."
              rows={3}
              maxLength={30}
              counterMax={30}
              error={errors?.description}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput
                label="Selling Price"
                value={product.sellingPrice}
                onChange={(value) =>
                  updateProduct(
                    product.id,
                    "sellingPrice",
                    value.replace(/[^0-9.]/g, ""),
                  )
                }
                placeholder="499"
                prefix="₹"
                required
                type="text"
                inputMode="decimal"
                error={errors?.sellingPrice}
              />

              <FormInput
                label="MRP"
                value={product.mrp}
                onChange={(value) =>
                  updateProduct(
                    product.id,
                    "mrp",
                    value.replace(/[^0-9.]/g, ""),
                  )
                }
                placeholder="599"
                prefix="₹"
                type="text"
                inputMode="decimal"
                required
                error={errors?.mrp}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          {!isNew && (
            <button
              type="button"
              onClick={() => removeProduct(product.id)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-100 px-4 text-xs font-bold text-red-500 transition hover:bg-red-50"
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={() => setPreviewProduct(product)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line px-4 text-xs font-bold text-muted transition hover:bg-page"
          >
            <Eye size={15} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => saveProduct(product.id)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-white ring-2 ring-primary/40 ring-offset-2 transition hover:bg-primary-dark animate-pulse hover:animate-none"
          >
            <Save size={15} />
            {isNew ? "Save Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

