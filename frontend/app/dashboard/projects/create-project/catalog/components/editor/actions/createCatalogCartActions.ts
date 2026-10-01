import { productPrice } from "../utils/catalog-editor.utils";
import type { CartItem, Product } from "../../catalog-editor.types";

export function createCatalogCartActions (state: ReturnType<typeof import("../hooks/useCatalogEditorState")["useCatalogEditorState"]>) {
  const {
    cart,
    setCart,
    setPreviewProduct
  } = state;

function addToCart(product: Product) {
    if (!product.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (!product.description.trim()) {
      alert("Please enter product description.");
      return;
    }

    if (!product.sellingPrice) {
      alert("Please enter selling price.");
      return;
    }

    if (!product.image) {
      alert("Please add product image.");
      return;
    }

    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...previous,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setPreviewProduct(product);
  }

function isInCart(productId: string) {
    return cart.some((item) => item.id === productId);
  }

function updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  }

function removeFromCart(productId: string) {
    setCart((previous) => previous.filter((item) => item.id !== productId));
  }

  return { addToCart, isInCart, updateCartQuantity, removeFromCart };
}
