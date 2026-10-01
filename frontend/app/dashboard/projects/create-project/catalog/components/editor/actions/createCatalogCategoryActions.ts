import { DEFAULT_CATEGORY_ICON } from "@/lib/productCategoryIcons";
import type { ProductCategory } from "../../catalog-editor.types";

export function createCatalogCategoryActions (state: ReturnType<typeof import("../hooks/useCatalogEditorState")["useCatalogEditorState"]>) {
  const {
    deleteCategoryId,
    setDeleteCategoryId,
    setHasChanges,
    setProductCategories,
    setProducts,
    setSuccessToast
  } = state;

function addProductCategory(name: string, image: string, icon: string) {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const newCategory: ProductCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      image,
      icon: icon || DEFAULT_CATEGORY_ICON,
    };

    setProductCategories((previous) => [...previous, newCategory]);
    setHasChanges(true);
    setSuccessToast("Category added successfully.");

    return newCategory;
  }

function updateProductCategory(
    categoryId: string,
    patch: Partial<Omit<ProductCategory, "id">>,
  ) {
    setProductCategories((previous) =>
      previous.map((item) =>
        item.id === categoryId ? { ...item, ...patch } : item,
      ),
    );
    setHasChanges(true);
    setSuccessToast("Category updated successfully.");
  }

function removeProductCategory(categoryId: string) {
    setProductCategories((previous) =>
      previous.filter((item) => item.id !== categoryId),
    );
    setProducts((previous) =>
      previous.map((product) =>
        product.categoryId === categoryId
          ? { ...product, categoryId: "" }
          : product,
      ),
    );
    setHasChanges(true);
    setSuccessToast("Category deleted successfully.");
  }

function confirmDeleteCategory() {
    if (deleteCategoryId) {
      removeProductCategory(deleteCategoryId);
    }
    setDeleteCategoryId(null);
  }

  return { addProductCategory, updateProductCategory, removeProductCategory, confirmDeleteCategory };
}
