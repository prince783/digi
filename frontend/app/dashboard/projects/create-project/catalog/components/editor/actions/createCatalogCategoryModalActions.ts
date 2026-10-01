import type { ChangeEvent } from "react";
import type { Product } from "../../catalog-editor.types";
import type { ProductCategory } from "../../catalog-editor.types";
import { DEFAULT_CATEGORY_ICON } from "@/lib/productCategoryIcons";
import { normalizeCategory } from "../utils/catalog-editor.utils";
import { useCatalogEditorState } from "../hooks/useCatalogEditorState";

export function createCatalogCategoryModalActions(state: ReturnType<typeof useCatalogEditorState>, actions: { updateProduct: (id: string, field: keyof Product, value: string) => void; addProductCategory: (name: string, image: string, icon: string) => ProductCategory | null; updateProductCategory: (id: string, patch: Partial<Omit<ProductCategory, "id">>) => void }) {
  const {
    categoryModal,
    categoryModalIcon,
    categoryModalImage,
    categoryModalName,
    productCategories,
    setCategoryImageCropSrc,
    setCategoryModal,
    setCategoryModalError,
    setCategoryModalIcon,
    setCategoryModalImage,
    setCategoryModalName
  } = state;
  const { updateProduct, addProductCategory, updateProductCategory } = actions;

function openAddCategoryModal(forProductId: string) {
    setCategoryModal({ mode: "add", forProductId });
    setCategoryModalName("");
    setCategoryModalIcon(DEFAULT_CATEGORY_ICON);
    setCategoryModalImage("");
    setCategoryModalError("");
  }

function openEditCategoryModal(categoryId: string) {
    const existing = productCategories.find((item) => item.id === categoryId);
    if (!existing) return;

    setCategoryModal({ mode: "edit", categoryId });
    setCategoryModalName(existing.name);
    setCategoryModalIcon(existing.icon);
    setCategoryModalImage(existing.image);
    setCategoryModalError("");
  }

function closeCategoryModal() {
    setCategoryModal(null);
  }

function handleCategoryModalImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Category image should be less than 5MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCategoryImageCropSrc(reader.result);
      }
    };
    reader.onerror = () => {
      alert("Unable to read this image.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

function submitCategoryModal() {
    const trimmed = categoryModalName.trim();

    if (!trimmed) {
      setCategoryModalError("Category name is required.");
      return;
    }

    if (categoryModal?.mode === "edit" && categoryModal.categoryId) {
      updateProductCategory(categoryModal.categoryId, {
        name: trimmed,
        icon: categoryModalIcon,
        image: categoryModalImage,
      });
    } else {
      const created = addProductCategory(
        trimmed,
        categoryModalImage,
        categoryModalIcon,
      );

      if (created && categoryModal?.forProductId) {
        updateProduct(categoryModal.forProductId, "categoryId", created.id);
      }
    }

    setCategoryModal(null);
  }

  return { openAddCategoryModal, openEditCategoryModal, closeCategoryModal, handleCategoryModalImageChange, submitCategoryModal };
}
