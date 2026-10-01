"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  FolderOpen,
  Headphones,
  Settings,
  Sparkles,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";

interface UnderConstructionProps {
  title: string;
  description: string;
  icon?:
    | "analytics"
    | "profile"
    | "subscription"
    | "payments"
    | "support"
    | "settings";
}

const iconMap = {
  analytics: BarChart3,
  profile: UserRound,
  subscription: CreditCard,
  payments: WalletCards,
  support: Headphones,
  settings: Settings,
};

export default function UnderConstruction({
  title,
  description,
  icon = "analytics",
}: UnderConstructionProps) {
  const router = useRouter();

  const Icon = iconMap[icon];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-115px)] max-w-[1400px] items-center justify-center">
        <div className="w-full max-w-[720px]">
          {/* Main Card */}
          <div className="rounded-2xl border border-[#E5E0D9] bg-white px-6 py-12 text-center shadow-[0_2px_10px_rgba(21,42,71,0.035)] sm:px-10">
            
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EAF0F6]">
              <Icon
                size={38}
                strokeWidth={1.7}
                className="text-[#1E3A5F]"
              />
            </div>

            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF0F6] px-3 py-1.5 text-xs font-semibold text-[#1E3A5F]">
              <Wrench size={13} />
              Under Development
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212] sm:text-3xl">
              {title}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-[#77736E]">
              {description}
            </p>

            {/* Coming Soon */}
            <div className="mx-auto mt-7 flex max-w-[460px] items-center justify-center gap-3 rounded-xl border border-[#E5E0D9] bg-[#E5E0D9] px-5 py-4">
              <Sparkles
                size={18}
                className="shrink-0 text-[#1E3A5F]"
              />

              <p className="text-left text-xs font-medium leading-5 text-[#77736E]">
                We're working on this section to make your
                experience better. It will be available soon.
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-[#FAF9F6]" />

            {/* My Projects CTA */}
            <div className="rounded-xl border border-[#E5E0D9] bg-gradient-to-br from-[#E5E0D9] to-[#EAF0F6] p-5 sm:p-6">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E3A5F] text-white shadow-sm">
                <FolderOpen size={21} />
              </div>

              <h2 className="mt-4 text-base font-bold text-[#121212]">
                Create Your Project
              </h2>

              <p className="mx-auto mt-2 max-w-[450px] text-xs leading-5 text-[#77736E]">
                You don't need to wait. Visit{" "}
                <span className="font-semibold text-[#1E3A5F]">
                  My Projects
                </span>{" "}
                to create your Digital Visiting Card,
                Resume, or Biography.
              </p>

              <button
                type="button"
                onClick={() => router.push("/dashboard/projects")}
                className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#1E3A5F] px-6 py-3 text-xs font-semibold text-white shadow-[0_5px_14px_rgba(30,58,95,0.22)] transition hover:bg-[#1E3A5F] hover:shadow-[0_7px_18px_rgba(30,58,95,0.28)]"
              >
                <FolderOpen size={16} />

                Go to My Projects

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Available Projects */}
            <div className="mt-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.8px] text-[#77736E]">
                Available in My Projects
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Digital Card */}
                <div className="rounded-xl border border-[#E5E0D9] bg-white p-4">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                    <BriefcaseBusiness
                      size={17}
                      className="text-[#1E3A5F]"
                    />
                  </div>

                  <p className="mt-2 text-xs font-semibold text-[#121212]">
                    Digital Visiting Card
                  </p>
                </div>

                {/* Resume */}
                <div className="rounded-xl border border-[#E5E0D9] bg-white p-4">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                    <FileText
                      size={17}
                      className="text-[#1E3A5F]"
                    />
                  </div>

                  <p className="mt-2 text-xs font-semibold text-[#121212]">
                    Resume
                  </p>
                </div>

                {/* Biography */}
                <div className="rounded-xl border border-[#E5E0D9] bg-white p-4">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                    <UserRound
                      size={17}
                      className="text-[#7A9B7E]"
                    />
                  </div>

                  <p className="mt-2 text-xs font-semibold text-[#121212]">
                    Biography
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="mt-5 text-center text-xs text-[#77736E]">
            More features are being developed for your dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}