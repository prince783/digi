// app/lib/catalogDummyData.ts

/* =========================================================
   CATALOG TYPES
========================================================= */

export type CatalogCategory =
  | "Fashion & Clothing"
  | "Jewellery & Fashion Accessories"
  | "Ayurvedic & Natural Products"
  | "Beauty & Personal Care"
  | "Home & Furniture"
  | "Medical & Healthcare"
  | "Electronics & Technology";

export interface CatalogProduct {
  _id: string;
  name: string;
  description: string;
  image: string;
  mrp: number;
  price: number;
  // Optional: a product has no category until the catalog owner
  // actually picks a business category — never defaulted/hardcoded.
  category?: CatalogCategory;
  // Distinct from `category` above: this is the catalog owner's own
  // custom per-product category (e.g. "Dry Fruits"), created in the
  // Catalog Builder's product form — not the fixed business category.
  productCategory?: {
    name: string;
    image: string;
    icon: string;
  };
}

/* =========================================================
   CATEGORIES
========================================================= */

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  "Fashion & Clothing",
  "Jewellery & Fashion Accessories",
  "Ayurvedic & Natural Products",
  "Beauty & Personal Care",
  "Home & Furniture",
  "Medical & Healthcare",
  "Electronics & Technology",
];

/* =========================================================
   DUMMY PRODUCTS
========================================================= */

export const DUMMY_PRODUCTS: Record<
  CatalogCategory,
  CatalogProduct[]
> = {
  /* =======================================================
     FASHION & CLOTHING
  ======================================================= */

  "Fashion & Clothing": [
    {
      _id: "fashion-1",
      name: "Classic Linen Shirt",
      description:
        "Premium breathable linen shirt",
      image:
        "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?w=1200",
      mrp: 1999,
      price: 1499,
      category: "Fashion & Clothing",
    },
    {
      _id: "fashion-2",
      name: "Women's Cotton Kurti",
      description:
        "Elegant ethnic wear for every occasion",
      image:
        "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200",
      mrp: 1299,
      price: 899,
      category: "Fashion & Clothing",
    },
    {
      _id: "fashion-3",
      name: "Slim Fit Denim Jeans",
      description:
        "Comfort stretch premium denim",
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200",
      mrp: 2499,
      price: 1799,
      category: "Fashion & Clothing",
    },
    {
      _id: "fashion-4",
      name: "Floral Summer Dress",
      description:
        "Lightweight everyday printed dress",
      image:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200",
      mrp: 2299,
      price: 1599,
      category: "Fashion & Clothing",
    },
    {
      _id: "fashion-5",
      name: "Premium Polo T-Shirt",
      description:
        "Classic comfortable cotton polo",
      image:
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=1200",
      mrp: 1199,
      price: 899,
      category: "Fashion & Clothing",
    },
    {
      _id: "fashion-6",
      name: "Everyday Sneakers",
      description:
        "Comfortable everyday casual sneakers",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
      mrp: 2999,
      price: 2199,
      category: "Fashion & Clothing",
    },
  ],

  /* =======================================================
     JEWELLERY & FASHION ACCESSORIES
  ======================================================= */

  "Jewellery & Fashion Accessories": [
    {
      _id: "jewellery-1",
      name: "Classic Gold Necklace",
      description:
        "Elegant everyday statement necklace",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200",
      mrp: 2999,
      price: 2299,
      category: "Jewellery & Fashion Accessories",
    },
    {
      _id: "jewellery-2",
      name: "Minimal Gold Earrings",
      description:
        "Lightweight elegant earrings",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200",
      mrp: 1499,
      price: 999,
      category: "Jewellery & Fashion Accessories",
    },
    {
      _id: "jewellery-3",
      name: "Luxury Watch",
      description:
        "Sophisticated everyday wrist watch",
      image:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200",
      mrp: 3999,
      price: 2999,
      category: "Jewellery & Fashion Accessories",
    },
    {
      _id: "jewellery-4",
      name: "Leather Handbag",
      description:
        "Premium structured everyday handbag",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200",
      mrp: 3499,
      price: 2499,
      category: "Jewellery & Fashion Accessories",
    },
    {
      _id: "jewellery-5",
      name: "Classic Sunglasses",
      description:
        "Modern UV protected fashion sunglasses",
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
      mrp: 1999,
      price: 1299,
      category: "Jewellery & Fashion Accessories",
    },
    {
      _id: "jewellery-6",
      name: "Premium Leather Wallet",
      description:
        "Slim genuine leather wallet",
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200",
      mrp: 1499,
      price: 999,
      category: "Jewellery & Fashion Accessories",
    },
  ],

  /* =======================================================
     AYURVEDIC & NATURAL PRODUCTS
  ======================================================= */

  "Ayurvedic & Natural Products": [
    {
      _id: "ayurvedic-1",
      name: "Herbal Wellness Tea",
      description:
        "Natural herbal blend for everyday wellness",
      image:
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200",
      mrp: 499,
      price: 349,
      category: "Ayurvedic & Natural Products",
    },
    {
      _id: "ayurvedic-2",
      name: "Natural Aloe Vera Gel",
      description:
        "Pure soothing aloe vera skin gel",
      image:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200",
      mrp: 299,
      price: 199,
      category: "Ayurvedic & Natural Products",
    },
    {
      _id: "ayurvedic-3",
      name: "Organic Honey",
      description:
        "Naturally sourced raw honey",
      image:
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200",
      mrp: 599,
      price: 449,
      category: "Ayurvedic & Natural Products",
    },
    {
      _id: "ayurvedic-4",
      name: "Herbal Hair Oil",
      description:
        "Traditional herbal hair care oil",
      image:
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200",
      mrp: 399,
      price: 299,
      category: "Ayurvedic & Natural Products",
    },
    {
      _id: "ayurvedic-5",
      name: "Neem Herbal Soap",
      description:
        "Gentle natural neem cleansing soap",
      image:
        "https://images.unsplash.com/photo-1607006344380-b6775a0824c7?w=1200",
      mrp: 199,
      price: 149,
      category: "Ayurvedic & Natural Products",
    },
    {
      _id: "ayurvedic-6",
      name: "Natural Turmeric Powder",
      description:
        "Pure traditionally sourced turmeric",
      image:
        "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=1200",
      mrp: 249,
      price: 189,
      category: "Ayurvedic & Natural Products",
    },
  ],

  /* =======================================================
     BEAUTY & PERSONAL CARE
  ======================================================= */

  "Beauty & Personal Care": [
    {
      _id: "beauty-1",
      name: "Hydrating Face Serum",
      description:
        "Lightweight daily hydration serum",
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200",
      mrp: 999,
      price: 699,
      category: "Beauty & Personal Care",
    },
    {
      _id: "beauty-2",
      name: "Vitamin C Face Cream",
      description:
        "Brightening daily skincare cream",
      image:
        "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=1200",
      mrp: 799,
      price: 549,
      category: "Beauty & Personal Care",
    },
    {
      _id: "beauty-3",
      name: "Luxury Body Lotion",
      description:
        "Deep moisturizing everyday body lotion",
      image:
        "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1200",
      mrp: 599,
      price: 449,
      category: "Beauty & Personal Care",
    },
    {
      _id: "beauty-4",
      name: "Premium Perfume",
      description:
        "Long-lasting sophisticated fragrance",
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200",
      mrp: 2499,
      price: 1899,
      category: "Beauty & Personal Care",
    },
    {
      _id: "beauty-5",
      name: "Natural Lip Care Balm",
      description:
        "Nourishing daily lip protection",
      image:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1200",
      mrp: 249,
      price: 179,
      category: "Beauty & Personal Care",
    },
    {
      _id: "beauty-6",
      name: "Hair Care Essentials",
      description:
        "Complete everyday hair care collection",
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200",
      mrp: 1299,
      price: 899,
      category: "Beauty & Personal Care",
    },
  ],

  /* =======================================================
     HOME & FURNITURE
  ======================================================= */

  "Home & Furniture": [
    {
      _id: "home-1",
      name: "Modern Accent Chair",
      description:
        "Comfortable contemporary accent chair",
      image:
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200",
      mrp: 8999,
      price: 6999,
      category: "Home & Furniture",
    },
    {
      _id: "home-2",
      name: "Minimal Wooden Table",
      description:
        "Elegant solid wood side table",
      image:
        "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1200",
      mrp: 5999,
      price: 4499,
      category: "Home & Furniture",
    },
    {
      _id: "home-3",
      name: "Decorative Ceramic Vase",
      description:
        "Minimal ceramic home decor piece",
      image:
        "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=1200",
      mrp: 1299,
      price: 899,
      category: "Home & Furniture",
    },
    {
      _id: "home-4",
      name: "Luxury Cushion Set",
      description:
        "Soft decorative cushions for modern homes",
      image:
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200",
      mrp: 1599,
      price: 1199,
      category: "Home & Furniture",
    },
    {
      _id: "home-5",
      name: "Modern Table Lamp",
      description:
        "Warm ambient lighting for your space",
      image:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200",
      mrp: 2499,
      price: 1799,
      category: "Home & Furniture",
    },
    {
      _id: "home-6",
      name: "Soft Cotton Bedsheet",
      description:
        "Premium breathable cotton bedsheet",
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200",
      mrp: 1999,
      price: 1399,
      category: "Home & Furniture",
    },
  ],

  /* =======================================================
     MEDICAL & HEALTHCARE
  ======================================================= */

  "Medical & Healthcare": [
    {
      _id: "medical-1",
      name: "Digital Blood Pressure Monitor",
      description:
        "Accurate, easy-to-use home health monitor",
      image:
        "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200",
      mrp: 2499,
      price: 1899,
      category: "Medical & Healthcare",
    },
    {
      _id: "medical-2",
      name: "Wellness Vitamin Pack",
      description:
        "Daily essential vitamins and minerals",
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200",
      mrp: 899,
      price: 699,
      category: "Medical & Healthcare",
    },
    {
      _id: "medical-3",
      name: "First Aid Kit",
      description:
        "Complete first aid essentials for home",
      image:
        "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=1200",
      mrp: 799,
      price: 599,
      category: "Medical & Healthcare",
    },
    {
      _id: "medical-4",
      name: "Digital Thermometer",
      description:
        "Fast and accurate digital thermometer",
      image:
        "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1200",
      mrp: 399,
      price: 249,
      category: "Medical & Healthcare",
    },
    {
      _id: "medical-5",
      name: "Pulse Oximeter",
      description:
        "Compact fingertip oxygen monitor",
      image:
        "https://images.unsplash.com/photo-1615485737651-9b3a5d0a5c8d?w=1200",
      mrp: 999,
      price: 699,
      category: "Medical & Healthcare",
    },
    {
      _id: "medical-6",
      name: "Reusable Hot Water Bag",
      description:
        "Comfortable reusable heat therapy bag",
      image:
        "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=1200",
      mrp: 499,
      price: 349,
      category: "Medical & Healthcare",
    },
  ],

  /* =======================================================
     ELECTRONICS & TECHNOLOGY
  ======================================================= */

  "Electronics & Technology": [
    {
      _id: "electronics-1",
      name: "Wireless Noise Cancelling Headphones",
      description:
        "Premium wireless headphones with deep bass and active noise cancellation",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200",
      mrp: 5999,
      price: 3999,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-2",
      name: "Smart Fitness Watch",
      description:
        "Modern smartwatch with fitness tracking, heart rate and activity monitoring",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
      mrp: 4999,
      price: 2999,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-3",
      name: "Premium Wireless Earbuds",
      description:
        "Compact true wireless earbuds with clear sound and long battery life",
      image:
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200",
      mrp: 3499,
      price: 2199,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-4",
      name: "Portable Bluetooth Speaker",
      description:
        "Powerful portable speaker with rich sound and wireless connectivity",
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200",
      mrp: 2999,
      price: 1899,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-5",
      name: "Fast Charging Power Bank",
      description:
        "High-capacity power bank with fast charging and dual USB output",
      image:
        "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=1200",
      mrp: 2499,
      price: 1499,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-6",
      name: "Mechanical Gaming Keyboard",
      description:
        "RGB mechanical keyboard designed for gaming and professional setups",
      image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200",
      mrp: 3999,
      price: 2699,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-7",
      name: "Wireless Gaming Mouse",
      description:
        "Ergonomic precision wireless mouse with adjustable DPI",
      image:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200",
      mrp: 2499,
      price: 1599,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-8",
      name: "USB-C Fast Charger",
      description:
        "Compact high-speed USB-C charger for phones, tablets and laptops",
      image:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1200",
      mrp: 1999,
      price: 1199,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-9",
      name: "4K Smart LED Monitor",
      description:
        "Ultra HD display with vibrant colors for work, entertainment and gaming",
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200",
      mrp: 24999,
      price: 19999,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-10",
      name: "Smart Home Security Camera",
      description:
        "Full HD smart security camera with night vision and mobile monitoring",
      image:
        "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=1200",
      mrp: 3999,
      price: 2499,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-11",
      name: "Laptop Stand",
      description:
        "Premium adjustable aluminum laptop stand for comfortable desk setups",
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200",
      mrp: 1999,
      price: 1299,
      category: "Electronics & Technology",
    },
    {
      _id: "electronics-12",
      name: "Smartphone Gimbal Stabilizer",
      description:
        "3-axis smartphone stabilizer for smooth professional videos",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200",
      mrp: 7999,
      price: 5499,
      category: "Electronics & Technology",
    },
  ],
};

/* =========================================================
   TEMPLATE 3 (MODERN GRID) — its own clothing sample set
========================================================= */

export const MODERN_GRID_DUMMY_PRODUCTS: CatalogProduct[] = [
  {
    _id: "modern-1",
    name: "Leather Biker Jacket",
    description: "Classic black leather jacket",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200",
    mrp: 5999,
    price: 4299,
    category: "Fashion & Clothing",
  },
  {
    _id: "modern-2",
    name: "Yellow Co-ord Set",
    description: "Cropped hoodie and jogger set",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
    mrp: 3499,
    price: 2499,
    category: "Fashion & Clothing",
  },
  {
    _id: "modern-3",
    name: "Terracotta Bomber Jacket",
    description: "Lightweight zip-up bomber",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200",
    mrp: 3299,
    price: 2399,
    category: "Fashion & Clothing",
  },
  {
    _id: "modern-4",
    name: "Tailored Check Suit",
    description: "Three-piece blue check suit",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200",
    mrp: 11999,
    price: 8999,
    category: "Fashion & Clothing",
  },
  {
    _id: "modern-5",
    name: "Utility Cargo Joggers",
    description: "Relaxed multi-pocket joggers",
    image:
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=1200",
    mrp: 1999,
    price: 1399,
    category: "Fashion & Clothing",
  },
  {
    _id: "modern-6",
    name: "Graphic Street Tee",
    description: "Soft cotton oversized tee",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200",
    mrp: 999,
    price: 699,
    category: "Fashion & Clothing",
  },
];

/* =========================================================
   GET PRODUCTS BY CATEGORY
========================================================= */

export function getDummyProductsByCategory(
  category: CatalogCategory
): CatalogProduct[] {
  return DUMMY_PRODUCTS[category] ?? [];
}

/* =========================================================
   GET DUMMY PRODUCTS
========================================================= */

/**
 * Compatibility helper.
 *
 * Supports:
 *
 * getDummyProducts()
 *
 * and:
 *
 * getDummyProducts("Fashion & Clothing")
 */

export function getDummyProducts(
  category?: CatalogCategory
): CatalogProduct[] {
  /* ---------------------------------------------
     Specific category
  --------------------------------------------- */

  if (category) {
    return getDummyProductsByCategory(category);
  }

  /* ---------------------------------------------
     No category
     Return all products
  --------------------------------------------- */

  return CATALOG_CATEGORIES.flatMap(
    (item) => DUMMY_PRODUCTS[item] ?? []
  );
}

/* =========================================================
   GET ALL PRODUCTS
========================================================= */

export function getAllDummyProducts(): CatalogProduct[] {
  return CATALOG_CATEGORIES.flatMap(
    (category) => DUMMY_PRODUCTS[category] ?? []
  );
}

/* =========================================================
   DISCOUNT CALCULATOR
========================================================= */

/**
 * Supports:
 *
 * getDiscount(mrp, price)
 *
 * and:
 *
 * getDiscount(product)
 */

export function getDiscount(
  mrpOrProduct:
    | number
    | CatalogProduct
    | null
    | undefined,
  price?: number
): number {
  let mrp = 0;
  let sellingPrice = 0;

  /* ---------------------------------------------
     Product object
  --------------------------------------------- */

  if (
    typeof mrpOrProduct === "object" &&
    mrpOrProduct !== null
  ) {
    mrp = Number(mrpOrProduct.mrp || 0);
    sellingPrice = Number(
      mrpOrProduct.price || 0
    );
  } else {
    mrp = Number(mrpOrProduct || 0);
    sellingPrice = Number(price || 0);
  }

  if (
    !Number.isFinite(mrp) ||
    !Number.isFinite(sellingPrice) ||
    mrp <= 0 ||
    sellingPrice <= 0 ||
    sellingPrice >= mrp
  ) {
    return 0;
  }

  return Math.round(
    ((mrp - sellingPrice) / mrp) * 100
  );
}

/* =========================================================
   CATEGORY PRODUCT HELPERS
========================================================= */

/**
 * Returns products for a category while limiting
 * the number of products when required.
 */

export function getCategoryProducts(
  category: CatalogCategory,
  limit?: number
): CatalogProduct[] {
  const products =
    getDummyProductsByCategory(category);

  if (!limit || limit <= 0) {
    return products;
  }

  return products.slice(0, limit);
}

/* =========================================================
   FEATURED PRODUCTS
========================================================= */

export function getFeaturedDummyProducts(
  category?: CatalogCategory,
  limit = 6
): CatalogProduct[] {
  const products = category
    ? getDummyProductsByCategory(category)
    : getAllDummyProducts();

  return products.slice(0, limit);
}

/* =========================================================
   SEARCH PRODUCTS
========================================================= */

export function searchDummyProducts(
  query: string,
  category?: CatalogCategory
): CatalogProduct[] {
  const normalizedQuery = query
    .trim()
    .toLowerCase();

  if (!normalizedQuery) {
    return category
      ? getDummyProductsByCategory(category)
      : getAllDummyProducts();
  }

  const products = category
    ? getDummyProductsByCategory(category)
    : getAllDummyProducts();

  return products.filter((product) => {
    return (
      product.name
        .toLowerCase()
        .includes(normalizedQuery) ||
      product.description
        .toLowerCase()
        .includes(normalizedQuery) ||
      product.category
        ?.toLowerCase()
        .includes(normalizedQuery)
    );
  });
}