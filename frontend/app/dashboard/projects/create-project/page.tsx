"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  CreditCard,
  FileText,
  UserRound,
  ShoppingBag,
} from "lucide-react";

type ProjectType =
  | "visiting-card"
  | "resume"
  | "biography"
  | "catalog";

const projectTypes = [
  {
    id: "visiting-card" as ProjectType,
    title: "Digital Visiting Card",
    description:
      "Create your professional digital identity and share instantly.",
    icon: CreditCard,
    iconColor: "#1E3A5F",
    iconBg: "#EAF0F6",
    border: "#1E3A5F",
    features: [
      "Contact details",
      "Social media links",
      "Services / Business info",
      "Gallery (Images & Videos)",
      "QR Code & Shareable link",
      "Beautiful themes & templates",
    ],
  },

  {
    id: "resume" as ProjectType,
    title: "Resume",
    description:
      "Create a professional resume and stand out in your career.",
    icon: FileText,
    iconColor: "#7A9B7E",
    iconBg: "#EAF0F6",
    border: "#E5E0D9",
    features: [
      "Professional templates",
      "Personal information",
      "Education & Experience",
      "Skills & Achievements",
      "Projects",
      "Download & Share",
    ],
  },

  {
    id: "biography" as ProjectType,
    title: "Biography",
    description:
      "Create your personal or professional biography and share your story.",
    icon: UserRound,
    iconColor: "#f2a51b",
    iconBg: "#fff5df",
    border: "#f4dba6",
    features: [
      "About you",
      "Career & Experience",
      "Achievements",
      "Gallery (Images & Videos)",
      "Social Profiles",
      "Beautiful themes & templates",
    ],
  },

  {
    id: "catalog" as ProjectType,
    title: "Catalog",
    description:
      "Create a professional product catalog and showcase your products online.",
    icon: ShoppingBag,
    iconColor: "#e77925",
    iconBg: "#fff1e7",
    border: "#e77925",
    features: [
      "Company / Store details",
      "Product images",
      "Product description",
      "Selling price & MRP",
      "Add to Cart",
      "Publish & Shareable catalog",
    ],
  },
];

const COMING_SOON_TYPES = new Set<ProjectType>([
  "visiting-card",
  "resume",
  "biography",
]);

export default function CreateProjectPage() {
  const router = useRouter();

  const [selectedType, setSelectedType] =
    useState<ProjectType>("catalog");

  const handleContinue = () => {
    if (COMING_SOON_TYPES.has(selectedType)) {
      return;
    }

    switch (selectedType) {
      case "visiting-card":
        router.push(
          "/dashboard/projects/create-project/digicards"
        );
        break;

      case "resume":
        router.push(
          "/dashboard/projects/create-project/resume"
        );
        break;

      case "catalog":
        router.push(
          "/dashboard/projects/create-project/catalog"
        );
        break;

      default:
        break;
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#121212]">
      <section className="px-3.5 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-[1180px]">

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-[-0.6px] text-[#152A47] sm:text-2xl">
              Create New Project
            </h1>

            <p className="mt-1.5 text-xs text-[#77736E]">
              Select the type of project you want to create.
            </p>
          </div>

          {/* =====================================================
              PROJECT CARDS
          ====================================================== */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {projectTypes.map((project) => {
              const Icon = project.icon;
              const selected = selectedType === project.id;

              return (
                <button
                  key={project.id}
                  type="button"
                  disabled={COMING_SOON_TYPES.has(project.id)}
                  onClick={() => setSelectedType(project.id)}
                  className={`relative text-left ${
                    COMING_SOON_TYPES.has(project.id)
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  <div
                    className={`relative flex h-full min-h-[360px] sm:min-h-[418px] flex-col rounded-lg bg-white px-5 pb-5 pt-7 transition-all duration-200 ${
                      selected
                        ? "border-[1.5px] shadow-[0_5px_18px_rgba(30,58,95,0.09)]"
                        : "border border-[#E5E0D9] shadow-[0_1px_5px_rgba(21,42,71,0.025)] hover:-translate-y-[1px] hover:border-[#E5E0D9] hover:shadow-md"
                    }`}
                    style={{
                      borderColor: selected
                        ? project.border
                        : undefined,
                    }}
                  >
                    {COMING_SOON_TYPES.has(project.id) && (
                      <span className="absolute left-1/2 top-4 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#fff1cf] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#8f5d00] shadow-sm">
                        Coming Soon
                      </span>
                    )}

                    {/* Selection */}

                    <div className="absolute right-4 top-4">
                      {selected ? (
                        <div
                          className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                          style={{
                            backgroundColor:
                              project.iconColor,
                          }}
                        >
                          <Check
                            size={11}
                            strokeWidth={3}
                            className="text-white"
                          />
                        </div>
                      ) : (
                        <Circle
                          size={18}
                          strokeWidth={1.6}
                          className="text-[#77736E]"
                        />
                      )}
                    </div>

                    {/* Icon */}

                    <div className="mb-4 flex h-[115px] items-center justify-center">
                      <div
                        className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full"
                        style={{
                          backgroundColor:
                            project.iconBg,
                        }}
                      >
                        <Icon
                          size={52}
                          strokeWidth={1.5}
                          style={{
                            color: project.iconColor,
                          }}
                        />
                      </div>
                    </div>

                    {/* Title */}

                    <h2
                      className={`text-center text-base font-bold ${
                        selected
                          ? "text-[#1E3A5F]"
                          : "text-[#121212]"
                      }`}
                      style={{
                        color: selected
                          ? project.iconColor
                          : undefined,
                      }}
                    >
                      {project.title}
                    </h2>

                    {/* Description */}

                    <p className="mx-auto mt-2 min-h-[42px] max-w-[245px] text-center text-xs leading-[1.55] text-[#77736E]">
                      {project.description}
                    </p>

                    <div className="my-3.5 h-px bg-[#FAF9F6]" />

                    {/* Features */}

                    <div className="space-y-2.5">
                      {project.features.map(
                        (feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-2 text-xs text-[#121212]"
                          >
                            <span
                              className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full"
                              style={{
                                backgroundColor:
                                  project.iconBg,
                              }}
                            >
                              <Check
                                size={10}
                                strokeWidth={2.7}
                                style={{
                                  color:
                                    project.iconColor,
                                }}
                              />
                            </span>

                            <span>{feature}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* =====================================================
              ACTIONS
          ====================================================== */}

          <div className="mt-8 flex flex-col items-center">
            <div className="flex w-full max-w-[340px] gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E0D9] bg-white text-xs font-semibold text-[#121212] transition hover:bg-[#FAF9F6]"
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.8}
                />

                Back
              </button>

              <button
                type="button"
                onClick={handleContinue}
                disabled={COMING_SOON_TYPES.has(selectedType)}
                className={`flex h-[42px] flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] text-xs font-semibold text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F] ${
                  COMING_SOON_TYPES.has(selectedType)
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                Continue

                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <p className="mt-4 text-xs text-[#77736E]">
              You can manage and update your project anytime
              from your dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}