"use client";

import { Check, Edit3, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Fragment, type ChangeEvent } from "react";
import type { Product, ProductCategory, ProductErrors } from "../catalog-editor.types";
import { CategoryDropdown, CategoryThumb } from "./CategoryComponents";
import ProductEditorCard from "./ProductEditorCard";
export default function ProductsStep({
  products,
  savedProductIds,
  productErrors,
  editingProductId,
  imageLoadingId,
  updateProduct,
  handleProductImage,
  addProduct,
  clearDemoProducts,
  showDemoProducts,
  removeProduct,
  saveProduct,
  editProduct,
  setPreviewProduct,
  productCategories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: {
  products: Product[];
  savedProductIds: string[];
  productErrors: Record<string, ProductErrors>;
  editingProductId: string | null;
  imageLoadingId: string | null;
  updateProduct: (id: string, field: keyof Product, value: string) => void;
  handleProductImage: (
    id: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  addProduct: () => void;
  clearDemoProducts: () => void;
  showDemoProducts: boolean;
  removeProduct: (id: string) => void;
  saveProduct: (id: string) => void;
  editProduct: (id: string) => void;
  setPreviewProduct: (product: Product) => void;
  productCategories: ProductCategory[];
  onAddCategory: (forProductId: string) => void;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}) {
  // Reversed for display so the most recently added product is
  // listed first — products stay in creation order in state/on
  // save (new ones are appended), this only affects how the saved
  // list is shown.
  const savedProducts = [...products]
    .reverse()
    .filter((product) => savedProductIds.includes(product.id));

  const editingProduct = products.find(
    (product) => product.id === editingProductId,
  );

  // True only while a NEW (unsaved) product's form is open — editing
  // an already-saved product doesn't count, since that product is in
  // savedProductIds.
  const isNewProductFormOpen = Boolean(
    editingProduct && !savedProductIds.includes(editingProduct.id),
  );

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink">
            Add Your Products
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            Save each product after filling its details. Saved products appear
            below as a table with Edit and Delete actions.
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-page px-3 py-2 text-xs font-bold text-muted">
          {savedProducts.length} Product{savedProducts.length === 1 ? "" : "s"}
        </div>
      </div>

      {showDemoProducts && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div>
            <p className="text-xs font-bold text-amber-900">
              Preview products are ready
            </p>
            <p className="mt-1 text-xs leading-4 text-amber-700">
              Clear the sample products before adding your own catalog items.
            </p>
          </div>
          <button
            type="button"
            onClick={clearDemoProducts}
            className="shrink-0 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
          >
            Clear All
          </button>
        </div>
      )}

      {!isNewProductFormOpen && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <button
            type="button"
            onClick={addProduct}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white text-xs font-bold text-muted transition hover:border-muted hover:bg-page"
          >
            <Plus size={16} />
            Add Another Product
          </button>

          <div className="sm:w-64">
            <CategoryDropdown
              categories={productCategories}
              value={undefined}
              onSelect={() => {}}
              onAddNew={() => onAddCategory("")}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
            />
          </div>
        </div>
      )}

      {editingProduct && !savedProductIds.includes(editingProduct.id) && (
        <ProductEditorCard
          product={editingProduct}
          index={products.findIndex(
            (product) => product.id === editingProduct.id,
          )}
          imageLoading={imageLoadingId === editingProduct.id}
          updateProduct={updateProduct}
          handleProductImage={handleProductImage}
          removeProduct={removeProduct}
          saveProduct={saveProduct}
          setPreviewProduct={setPreviewProduct}
          errors={productErrors[editingProduct.id]}
          isNew
          productCategories={productCategories}
          onSelectCategory={(categoryId) =>
            updateProduct(editingProduct.id, "categoryId", categoryId)
          }
          onAddCategory={() => onAddCategory(editingProduct.id)}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
        />
      )}

      {/* =====================================================
          SAVED PRODUCTS TABLE
      ===================================================== */}
      {savedProducts.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-page px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-ink">
                  Saved Products
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {savedProducts.length} product
                  {savedProducts.length === 1 ? "" : "s"} added to your catalog
                </p>
              </div>
              <span className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-bold text-success">
                Saved
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-line bg-white text-left">
                  <th className="w-11 px-2.5 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                    #
                  </th>

                  <th className="w-[62px] px-1.5 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                    Image
                  </th>

                  <th className="px-2 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                    Product
                  </th>

                  <th className="w-28 px-2 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                    Selling Price
                  </th>

                  <th className="w-24 px-2 py-2.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                    MRP
                  </th>

                  <th className="w-36 px-2.5 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {savedProducts.map((product) => {
                  const productNumber =
                    products.findIndex((item) => item.id === product.id) + 1;
                  const isEditing = editingProduct?.id === product.id;

                  return (
                    <Fragment key={product.id}>
                      <tr className="group transition hover:bg-page/70">
                        <td className="px-2.5 py-3 align-middle">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-[9px] font-bold text-white">
                            {productNumber}
                          </span>
                        </td>

                        <td className="px-1.5 py-3 align-middle">
                          <div className="h-10 w-10 overflow-hidden rounded-lg border border-line bg-page">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name || `Product ${productNumber}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package size={15} className="text-line" />
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="max-w-[280px] px-2 py-3 align-middle">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-ink">
                              {product.name}
                            </p>

                            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted">
                              {product.description || "No description added"}
                            </p>

                            {(() => {
                              const category = productCategories.find(
                                (item) => item.id === product.categoryId,
                              );
                              if (!category) return null;
                              return (
                                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                  <CategoryThumb category={category} size={14} />
                                  {category.name}
                                </span>
                              );
                            })()}
                          </div>
                        </td>

                        <td className="px-2 py-3 align-middle">
                          <span className="text-xs font-bold text-ink">
                            ₹{product.sellingPrice || "0"}
                          </span>
                        </td>

                        <td className="px-2 py-3 align-middle">
                          <span className="text-xs font-medium text-muted">
                            {product.mrp ? `₹${product.mrp}` : "—"}
                          </span>
                        </td>

                        <td className="px-2.5 py-3 align-middle">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => editProduct(product.id)}
                              className="flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-xs font-bold text-ink transition hover:border-line hover:bg-page"
                            >
                              <Edit3 size={12} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="flex h-8 items-center gap-1 rounded-lg border border-red-100 bg-white px-2.5 text-xs font-bold text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isEditing && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <ProductEditorCard
                              product={product}
                              index={productNumber - 1}
                              imageLoading={imageLoadingId === product.id}
                              updateProduct={updateProduct}
                              handleProductImage={handleProductImage}
                              removeProduct={removeProduct}
                              saveProduct={saveProduct}
                              setPreviewProduct={setPreviewProduct}
                              errors={productErrors[product.id]}
                              isNew={false}
                              productCategories={productCategories}
                              onSelectCategory={(categoryId) =>
                                updateProduct(
                                  product.id,
                                  "categoryId",
                                  categoryId,
                                )
                              }
                              onAddCategory={() => onAddCategory(product.id)}
                              onEditCategory={onEditCategory}
                              onDeleteCategory={onDeleteCategory}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {savedProducts.length === 0 && !editingProduct && (
        <div className="mt-5 rounded-2xl border border-dashed border-line bg-page p-5 text-center">
          <Package size={22} className="mx-auto text-line" />
          <p className="mt-2 text-xs font-bold text-ink">
            No products saved yet
          </p>
          <p className="mt-1 text-xs text-muted">
            Click Add Another Product to create your first product.
          </p>
        </div>
      )}
    </div>
  );
}

