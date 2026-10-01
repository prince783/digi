"use client";

import CatalogEditorView from "./ui/CatalogEditorView";
import { useCatalogEditorController } from "./editor/useCatalogEditorController";

export type { CartItem, Company, HeroContent, HeroSlide, Product, ProductCategory, UsernameStatus } from "./catalog-editor.types";
export { formatCurrency } from "./editor/utils/catalog-editor.utils";

export default function CatalogEditor(props?: { onBack?: () => void; onComplete?: () => void }) {
  const editor = useCatalogEditorController(props);
  return <CatalogEditorView editor={editor} />;
}
