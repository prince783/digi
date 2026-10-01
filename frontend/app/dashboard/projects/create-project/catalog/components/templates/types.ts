import type {
  CatalogCategory,
  CatalogProduct,
} from "@/lib/catalogDummyData";

export interface CatalogData {
  companyName?: string;
  aboutCompany?: string;
  username?: string;
  description?: string;
  logo?: string;
  tagline?: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  email?: string;
  category?: CatalogCategory;
  hero?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface CatalogTemplateProps {
  catalog?: CatalogData;
  products: CatalogProduct[];
  onAddToCart: (product: CatalogProduct) => void;
  isEditorPreview?: boolean;
}