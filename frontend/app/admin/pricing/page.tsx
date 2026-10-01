"use client";

import { useEffect, useState } from "react";

import {
  Check,
  CreditCard,
  FileText,
  Save,
  ShoppingBag,
  UserRound,
} from "lucide-react";

interface PriceItem {
  projectType: string;
  yearlyPrice: number;
  isActive: boolean;
}

const defaultItems = [
  {
    projectType: "digital-visiting-card",
    yearlyPrice: 999,
    isActive: true,
    title: "Digital Visiting Card",
    description:
      "Create and manage your professional digital identity.",
    icon: CreditCard,
    iconBg: "bg-[#EAF0F6]",
    iconColor: "text-[#1E3A5F]",
  },
  {
    projectType: "resume",
    yearlyPrice: 499,
    isActive: true,
    title: "Resume",
    description:
      "Build and share your professional resume online.",
    icon: FileText,
    iconBg: "bg-[#EAF0F6]",
    iconColor: "text-[#1E3A5F]",
  },
  {
    projectType: "biography",
    yearlyPrice: 799,
    isActive: true,
    title: "Biography",
    description:
      "Create a personalized biography and profile page.",
    icon: UserRound,
    iconBg: "bg-[#EAF0F6]",
    iconColor: "text-[#7A9B7E]",
  },
  {
    projectType: "catalog",
    yearlyPrice: 999,
    isActive: true,
    title: "Product Catalog",
    description:
      "Create and share your product catalog with online ordering.",
    icon: ShoppingBag,
    iconBg: "bg-[#fff5df]",
    iconColor: "text-[#e9a52f]",
  },
];

export default function PricingPage() {
  const [items, setItems] = useState(defaultItems);

  const [saving, setSaving] = useState<string | null>(null);

  const [savedItem, setSavedItem] = useState<string | null>(null);

  useEffect(() => {
    async function loadPricing() {
      try {
        const response = await fetch("/api/admin/pricing", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success && Array.isArray(data.pricing)) {
          setItems((current) =>
            current.map((item) => {
              const found = data.pricing.find(
                (price: PriceItem) =>
                  price.projectType === item.projectType
              );

              return found
                ? {
                    ...item,
                    yearlyPrice: Number(found.yearlyPrice) || 0,
                    isActive: found.isActive,
                  }
                : item;
            })
          );
        }
      } catch (error) {
        console.error(
          "Failed to load pricing:",
          error
        );
      }
    }

    loadPricing();
  }, []);

  function updatePrice(
    projectType: string,
    value: number
  ) {
    setItems((current) =>
      current.map((item) =>
        item.projectType === projectType
          ? {
              ...item,
              yearlyPrice:
                Number.isFinite(value) && value >= 0
                  ? value
                  : 0,
            }
          : item
      )
    );
  }

  function toggleActive(
    projectType: string
  ) {
    setItems((current) =>
      current.map((item) =>
        item.projectType === projectType
          ? {
              ...item,
              isActive: !item.isActive,
            }
          : item
      )
    );
  }

  async function savePrice(
    item: (typeof items)[number]
  ) {
    try {
      setSaving(item.projectType);

      const response = await fetch(
        "/api/admin/pricing",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            projectType:
              item.projectType,

            yearlyPrice:
              Number(item.yearlyPrice),

            isActive:
              item.isActive,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update price"
        );
      }

      setSavedItem(
        item.projectType
      );

      setTimeout(() => {
        setSavedItem(null);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to update price:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update price"
      );
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212]">
            Pricing Management
          </h1>

          <p className="mt-1 text-sm text-[#77736E]">
            Manage yearly subscription pricing for all available products.
          </p>
        </div>

        {/* =========================
            PRICING CARDS
        ========================= */}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;

            const isSaving =
              saving === item.projectType;

            const isSaved =
              savedItem === item.projectType;

            return (
              <div
                key={item.projectType}
                className="group overflow-hidden rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)] transition hover:-translate-y-0.5 hover:border-[#E5E0D9] hover:shadow-md"
              >
                {/* =========================
                    CARD HEADER
                ========================= */}

                <div className="border-b border-[#E5E0D9] px-5 py-5">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
                    >
                      <Icon
                        size={21}
                        strokeWidth={1.8}
                        className={item.iconColor}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleActive(
                          item.projectType
                        )
                      }
                      disabled={isSaving}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        item.isActive
                          ? "bg-[#EAF0F6] text-[#7A9B7E]"
                          : "bg-[#FAF9F6] text-[#77736E]"
                      }`}
                    >
                      {item.isActive
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </div>

                  <h2 className="mt-4 text-base font-semibold text-[#121212]">
                    {item.title}
                  </h2>

                  <p className="mt-1 min-h-[38px] text-xs leading-5 text-[#77736E]">
                    {item.description}
                  </p>
                </div>

                {/* =========================
                    PRICING CONTENT
                ========================= */}

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`price-${item.projectType}`}
                      className="text-xs font-medium text-[#77736E]"
                    >
                      Yearly Price
                    </label>

                    <span className="text-xs text-[#77736E]">
                      Valid for 1 year
                    </span>
                  </div>

                  <div className="relative mt-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#77736E]">
                      ₹
                    </span>

                    <input
                      id={`price-${item.projectType}`}
                      type="number"
                      min="0"
                      value={item.yearlyPrice}
                      onChange={(e) =>
                        updatePrice(
                          item.projectType,
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="h-[52px] w-full rounded-xl border border-[#E5E0D9] bg-[#E5E0D9] pl-9 pr-4 text-lg font-bold tracking-[-0.3px] text-[#121212] outline-none transition placeholder:text-[#77736E] focus:border-[#3D6A9C] focus:bg-white focus:ring-4 focus:ring-[#E5E0D9]"
                    />
                  </div>

                  {/* =========================
                      PRICE INFO
                  ========================= */}

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-[#FAF9F6] px-4 py-3">
                    <span className="text-xs text-[#77736E]">
                      Current subscription price
                    </span>

                    <span className="text-xs font-semibold text-[#121212]">
                      ₹{item.yearlyPrice}/year
                    </span>
                  </div>

                  {/* =========================
                      SAVE BUTTON
                  ========================= */}

                  <button
                    type="button"
                    onClick={() =>
                      savePrice(item)
                    }
                    disabled={isSaving}
                    className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSaved
                        ? "bg-[#EAF0F6] text-[#7A9B7E]"
                        : "bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check size={16} />
                        Price Updated
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Price
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* =========================
            INFORMATION SECTION
        ========================= */}

        <section className="mt-5 rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
          <div className="border-b border-[#E5E0D9] px-5 py-4">
            <h2 className="text-base font-semibold text-[#121212]">
              Subscription Information
            </h2>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#E5E0D9] md:grid-cols-3 md:divide-x md:divide-y-0">

            {/* YEARLY SUBSCRIPTION */}

            <div className="flex items-center gap-3 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <CreditCard
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#1E3A5F]"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#121212]">
                  Yearly Subscription
                </p>

                <p className="mt-1 text-xs text-[#77736E]">
                  Every plan is valid for 12 months.
                </p>
              </div>
            </div>

            {/* AUTOMATIC ACTIVATION */}

            <div className="flex items-center gap-3 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <Check
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#7A9B7E]"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#121212]">
                  Automatic Activation
                </p>

                <p className="mt-1 text-xs text-[#77736E]">
                  Subscription activates after payment.
                </p>
              </div>
            </div>

            {/* INSTANT UPDATES */}

            <div className="flex items-center gap-3 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff5df]">
                <Save
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#e9a52f]"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#121212]">
                  Instant Updates
                </p>

                <p className="mt-1 text-xs text-[#77736E]">
                  Price changes are applied immediately.
                </p>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}