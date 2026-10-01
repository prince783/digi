import {
  ShoppingCart,
  UtensilsCrossed,
  Shirt,
  Gift,
  Gem,
  PawPrint,
  Coffee,
  Salad,
  Leaf,
  SprayCan,
  Baby,
  Package,
} from "lucide-react";

// Small, template-agnostic preset so "Select Icon" has something to
// show without depending on a per-template icon set. A category's
// `image` (if uploaded) always takes priority over its `icon` when
// both are rendered.
export const CATEGORY_ICON_OPTIONS = [
  "ShoppingCart",
  "UtensilsCrossed",
  "Shirt",
  "Gift",
  "Gem",
  "PawPrint",
  "Coffee",
  "Salad",
  "Leaf",
  "SprayCan",
  "Baby",
  "Package",
] as const;

export const DEFAULT_CATEGORY_ICON: (typeof CATEGORY_ICON_OPTIONS)[number] =
  "Package";

const CATEGORY_ICON_COMPONENTS: Record<
  (typeof CATEGORY_ICON_OPTIONS)[number],
  typeof ShoppingCart
> = {
  ShoppingCart,
  UtensilsCrossed,
  Shirt,
  Gift,
  Gem,
  PawPrint,
  Coffee,
  Salad,
  Leaf,
  SprayCan,
  Baby,
  Package,
};

export function CategoryIcon({
  icon,
  size = 16,
  className,
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const IconComponent =
    CATEGORY_ICON_COMPONENTS[icon as keyof typeof CATEGORY_ICON_COMPONENTS] ??
    Package;
  return <IconComponent size={size} className={className} />;
}
