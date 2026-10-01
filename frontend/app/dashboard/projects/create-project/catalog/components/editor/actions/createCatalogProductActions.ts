import type { ChangeEvent } from "react";
import { createProduct } from "../utils/catalog-editor.utils";
import type { Product, ProductErrors } from "../../catalog-editor.types";

export function createCatalogProductActions (state: ReturnType<typeof import("../hooks/useCatalogEditorState")["useCatalogEditorState"]>, removeFromCart: (productId: string) => void) {
  const {
    editingProductId,
    products,
    savedProductIds,
    setCart,
    setCropImage,
    setEditingProductId,
    setHasChanges,
    setImageLoadingId,
    setPreviewProduct,
    setProductErrors,
    setProducts,
    setSavedProductIds,
    setShowDemoProducts,
    setSuccessToast
  } = state;

function updateProduct(
    productId: string,
    field: keyof Product,
    value: string,
  ) {
    if (field === "name" || field === "description") {
      value = value.slice(0, field === "name" ? 25 : 100);
    }

    setHasChanges(true);
    setProducts((previous) =>
      previous.map((product) =>
        product.id === productId
          ? {
              ...product,
              [field]: value,
            }
          : product,
      ),
    );
    setProductErrors((previous) => {
      const current = previous[productId];
      if (!current) return previous;
      const nextErrors = { ...current };
      delete nextErrors[field as keyof ProductErrors];
      return { ...previous, [productId]: nextErrors };
    });
  }

function saveProduct(productId: string) {
    const product = products.find((item) => item.id === productId);

    if (!product) return;

    const errors: ProductErrors = {};
    if (!product.image) errors.image = "Product image is required.";
    if (!product.name.trim()) errors.name = "Product name is required.";
    if (!product.sellingPrice.trim())
      errors.sellingPrice = "Selling price is required.";
    if (!product.mrp.trim()) errors.mrp = "MRP is required.";
    if (
      product.sellingPrice &&
      product.mrp &&
      Number(product.mrp) < Number(product.sellingPrice)
    ) {
      errors.mrp = "MRP should be greater than selling price.";
    }

    if (Object.keys(errors).length > 0) {
      setProductErrors((previous) => ({ ...previous, [productId]: errors }));
      return;
    }

    const wasAlreadySaved = savedProductIds.includes(productId);

    setShowDemoProducts(false);
    setProductErrors((previous) => {
      const next = { ...previous };
      delete next[productId];
      return next;
    });
    setSavedProductIds((previous) =>
      previous.includes(productId) ? previous : [...previous, productId],
    );

    setEditingProductId(null);
    setPreviewProduct(product);
    setSuccessToast(
      wasAlreadySaved
        ? "Product updated successfully."
        : "Product added successfully.",
    );
  }

function editProduct(productId: string) {
    if (editingProductId && editingProductId !== productId) {
      alert("Please save the current product before editing another product.");
      return;
    }

    setEditingProductId(productId);
  }

function addProduct() {
    if (editingProductId) {
      alert("Please save the current product before adding another product.");
      return;
    }

    setHasChanges(true);
    setShowDemoProducts(false);
    const product = createProduct();

    setProducts((previous) => [...previous, product]);
    setEditingProductId(product.id);
  }

function removeProduct(productId: string) {
    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }

    setHasChanges(true);
    setProducts((previous) =>
      previous.filter((product) => product.id !== productId),
    );

    setSavedProductIds((previous) => previous.filter((id) => id !== productId));
    setProductErrors((previous) => {
      const next = { ...previous };
      delete next[productId];
      return next;
    });

    setEditingProductId((current) => (current === productId ? null : current));

    setCart((previous) => previous.filter((item) => item.id !== productId));

    setPreviewProduct((current) =>
      current?.id === productId ? null : current,
    );

    setSuccessToast("Product deleted successfully.");
  }

function clearDemoProducts() {
    if (
      !window.confirm(
        "Clear ALL products? This removes every product in this catalog and cannot be undone.",
      )
    ) {
      return;
    }

    setHasChanges(true);
    setShowDemoProducts(false);
    setProducts([]);
    setSavedProductIds([]);
    setProductErrors({});
    setEditingProductId(null);
    setCart([]);
    setPreviewProduct(null);
  }

function handleProductImage(
    productId: string,
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
      alert("Image size should be less than 5MB.");
      event.target.value = "";
      return;
    }

    setImageLoadingId(productId);

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setCropImage({ productId, src: result });
      }

      setImageLoadingId(null);
    };

    reader.onerror = () => {
      setImageLoadingId(null);
      alert("Unable to read this image.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  return { updateProduct, saveProduct, editProduct, addProduct, removeProduct, clearDemoProducts, handleProductImage };
}
