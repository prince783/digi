import { useEffect } from "react";

type CatalogPricingEntry = {
  projectType?: string;
  yearlyPrice?: number | string;
  isActive?: boolean;
};

type CatalogPricingSetters = {
  setCatalogPrice: (price: number | null) => void;
  setCatalogPriceLoading: (loading: boolean) => void;
};

export function useCatalogPricing({
  setCatalogPrice,
  setCatalogPriceLoading,
}: CatalogPricingSetters) {
  useEffect(() => {
    let cancelled = false;

    async function loadCatalogPrice() {
      try {
        setCatalogPriceLoading(true);

        const response = await fetch("/api/admin/pricing", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Pricing API failed: ${response.status}`);
        }

        const data = await response.json();
        const pricingList: unknown[] = Array.isArray(data?.pricing)
          ? data.pricing
          : [];
        const catalogPricing = pricingList.find(
          (item): item is CatalogPricingEntry =>
            typeof item === "object" &&
            item !== null &&
            String((item as CatalogPricingEntry).projectType || "")
              .trim()
              .toLowerCase() === "catalog" &&
            (item as CatalogPricingEntry).isActive !== false,
        );

        const yearlyPrice = Number(catalogPricing?.yearlyPrice);
        const price = Number.isFinite(yearlyPrice) && yearlyPrice > 0
          ? yearlyPrice
          : null;

        if (!cancelled) setCatalogPrice(price);
      } catch (error) {
        console.error("Failed to load catalog pricing:", error);
        if (!cancelled) setCatalogPrice(null);
      } finally {
        if (!cancelled) setCatalogPriceLoading(false);
      }
    }

    void loadCatalogPrice();

    return () => {
      cancelled = true;
    };
  }, [setCatalogPrice, setCatalogPriceLoading]);
}