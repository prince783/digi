import type { CatalogCategory } from "@/lib/catalogDummyData";

export type Step = 1 | 2 | 3 | 4 | 5 | 6;

export type Product = {
  id: string;
  name: string;
  description: string;
  sellingPrice: string;
  mrp: string;
  image: string;
  categoryId?: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  image: string;
  icon: string;
};

export type ProductErrors = Partial<{
  image: string;
  name: string;
  description: string;
  sellingPrice: string;
  mrp: string;
}>;

export type CompanyErrors = Partial<{
  companyName: string;
  mobile: string;
  aboutCompany: string;
  address: string;
  logo: string;
}>;

export type HeroErrors = Partial<{
  title: string;
}>;

export type CartItem = Product & {
  quantity: number;
};

export type Company = {
  fullName: string;
  companyName: string;
  designation: string;
  profilePhoto: string;
  logo: string;
  tagline: string;
  aboutCompany: string;
  mobile: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapLink: string;
};

export type HeroSlide = {
  id: string;
  image: string;
  active: boolean;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  images: HeroSlide[];
};

export type CardResponse = {
  success?: boolean;
  card?: Record<string, unknown>;
  message?: string;
};

export type CatalogResponse = {
  success?: boolean;
  message?: string;
  catalog?: Record<string, unknown>;
  _id?: string;
  catalogId?: string;
};

export type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid";

export type DraftData = {
  catalogId?: string;
  company: Company;
  products: Product[];
  productCategories?: ProductCategory[];
  cart: CartItem[];
  username: string;
  currentStep: Step;
  templateId?: string;
  layoutTemplateId?: string;
  category?: CatalogCategory;
  hero?: HeroContent;
  savedAt: string;
  paymentStatus?: string;
  paymentDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
};

export type CatalogTheme = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  products: string[];
};