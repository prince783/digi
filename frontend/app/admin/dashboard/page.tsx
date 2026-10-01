"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Activity,
  ArrowRight,
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  MoreVertical,
  Plus,
  QrCode,
  Share2,
  ShoppingBag,
  Sparkles,
  UserRound,
  UserX,
  Users,
  UsersRound,
  Clock3,
  ShieldCheck,
} from "lucide-react";

interface ProductBreakdown {
  total: number;
  paid: number;
  active: number;
  expired?: number;
  suspended?: number;
}

interface DashboardStats {
  totalUsers: number;
  digitalCards: ProductBreakdown;
  catalogs: ProductBreakdown;
  resumes: Omit<ProductBreakdown, "active">;
  activePlans: number;
  expiredPlans: number;
  suspendedUsers: number;
}

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  digitalCards: { total: 0, paid: 0, active: 0, expired: 0, suspended: 0 },
  catalogs: { total: 0, paid: 0, active: 0, expired: 0 },
  resumes: { total: 0, paid: 0 },
  activePlans: 0,
  expiredPlans: 0,
  suspendedUsers: 0,
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard");

        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      detail: null,
      icon: Users,
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#1E3A5F]",
    },
    {
      title: "Digital Cards",
      value: stats.digitalCards.total,
      detail: `${stats.digitalCards.paid} paid · ${stats.digitalCards.active} active · ${stats.digitalCards.expired} expired`,
      icon: CreditCard,
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#7A9B7E]",
    },
    {
      title: "Catalogs",
      value: stats.catalogs.total,
      detail: `${stats.catalogs.paid} paid · ${stats.catalogs.active} active · ${stats.catalogs.expired} expired`,
      icon: ShoppingBag,
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#1E3A5F]",
    },
    {
      title: "Active Plans",
      value: stats.activePlans,
      detail: `${stats.digitalCards.active} cards · ${stats.catalogs.active} catalogs · ${stats.resumes.paid} resumes`,
      icon: ShieldCheck,
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#7A9B7E]",
    },
    {
      title: "Expired Plans",
      value: stats.expiredPlans,
      detail: `${stats.digitalCards.expired} cards · ${stats.catalogs.expired} catalogs`,
      icon: Clock3,
      iconBg: "bg-[#fff5df]",
      iconColor: "text-[#e9a52f]",
    },
    {
      title: "Suspended Users",
      value: stats.suspendedUsers,
      detail: `${stats.digitalCards.suspended || 0} cards · ${stats.catalogs.suspended || 0} catalogs · ${stats.resumes.suspended || 0} resumes`,
      icon: UserX,
      iconBg: "bg-[#fff0ef]",
      iconColor: "text-[#f26b67]",
    },
  ];

  const profileManagement = [
    {
      name: "Digital Visiting Cards",
      description: "Manage all digital visiting cards",
      icon: CreditCard,
      href: "/admin/profiles?type=digital-visiting-card",
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#3D6A9C]",
    },
    {
      name: "Catalogs",
      description: "Manage product catalogs & digital stores",
      icon: ShoppingBag,
      href: "/admin/profiles?type=catalog",
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#1E3A5F]",
    },
    {
      name: "Resumes",
      description: "Manage user resumes",
      icon: FileText,
      href: "/admin/profiles?type=resume",
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#1E3A5F]",
    },
    {
      name: "Biographies",
      description: "Manage user biographies",
      icon: UserRound,
      href: "/admin/profiles?type=biography",
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#7A9B7E]",
    },
  ];

  const quickActions = [
    {
      // /admin/users was never built - only ever a dangling link
      // to a 404. Profile Management already covers every
      // registered user's profile (search by name/username/
      // email/mobile across all product types), so it's the
      // real equivalent today rather than a separate page.
      title: "Manage Users",
      description: "View and manage all users",
      icon: Users,
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#1E3A5F]",
      href: "/admin/profiles",
    },
    {
      title: "Manage Profiles",
      description: "View all user profiles",
      icon: UserRound,
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#1E3A5F]",
      href: "/admin/profiles",
    },
    {
      title: "Subscriptions",
      description: "Manage user subscriptions",
      icon: CreditCard,
      iconBg: "bg-[#EAF0F6]",
      iconColor: "text-[#7A9B7E]",
      href: "/admin/profiles",
    },
    {
      title: "Pricing Plans",
      description: "Configure platform plans",
      icon: Sparkles,
      iconBg: "bg-[#fff5df]",
      iconColor: "text-[#e9a52f]",
      href: "/admin/pricing",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-[-0.5px] text-[#121212] sm:text-2xl">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-xs text-[#77736E] sm:text-sm">
            Manage users, profiles, subscriptions and platform activity.
          </p>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="flex min-h-[112px] items-start gap-4 rounded-xl border border-[#E5E0D9] bg-white px-5 py-4 shadow-[0_1px_4px_rgba(21,42,71,0.025)]"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                    className={card.iconColor}
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#77736E]">
                    {card.title}
                  </p>

                  <p className="mt-1 text-2xl font-bold leading-none tracking-[-0.5px] text-[#121212]">
                    {loading ? "..." : card.value}
                  </p>

                  {card.detail && (
                    <p className="mt-1.5 text-[11px] leading-snug text-[#77736E]">
                      {loading ? "" : card.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* =====================================================
            PROFILE MANAGEMENT + SYSTEM OVERVIEW
        ====================================================== */}

        <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          {/* PROFILE MANAGEMENT */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
            <div className="flex items-center justify-between border-b border-[#E5E0D9] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#121212]">
                  Profile Management
                </h2>

                <p className="mt-1 text-xs text-[#77736E]">
                  Manage all user profile types
                </p>
              </div>
            </div>

            <div className="px-5">
              {profileManagement.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={`group flex min-h-[78px] w-full items-center gap-3 text-left transition ${
                      index !== profileManagement.length - 1
                        ? "border-b border-[#E5E0D9]"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        className={item.iconColor}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#121212]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        {item.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      strokeWidth={1.8}
                      className="text-[#77736E] transition group-hover:translate-x-1 group-hover:text-[#3D6A9C]"
                    />
                  </button>
                );
              })}
            </div>

            <div className="px-5 pb-4 pt-3">
              <button
                type="button"
                onClick={() => router.push("/admin/profiles")}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-[#E5E0D9] text-xs font-semibold text-[#1E3A5F] transition hover:bg-[#FAF9F6]"
              >
                View All Profiles
              </button>
            </div>
          </div>

          {/* SYSTEM OVERVIEW */}

          <div className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
            <div className="flex items-center justify-between border-b border-[#E5E0D9] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#121212]">
                  System Overview
                </h2>

                <p className="mt-1 text-xs text-[#77736E]">
                  Current platform configuration
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <LayoutDashboard
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#1E3A5F]"
                />
              </div>
            </div>

            <div className="divide-y divide-[#E5E0D9] px-5">
              <div className="flex min-h-[70px] items-center justify-between">
                <span className="text-xs text-[#77736E]">
                  Platform Status
                </span>

                <span className="rounded-full bg-[#EAF0F6] px-3 py-1 text-xs font-semibold text-[#7A9B7E]">
                  Operational
                </span>
              </div>

              <div className="flex min-h-[70px] items-center justify-between">
                <span className="text-xs text-[#77736E]">
                  Subscription Duration
                </span>

                <span className="text-xs font-semibold text-[#121212]">
                  1 Year
                </span>
              </div>

              <div className="flex min-h-[70px] items-center justify-between">
                <span className="text-xs text-[#77736E]">
                  Auto Expiry
                </span>

                <span className="rounded-full bg-[#EAF0F6] px-3 py-1 text-xs font-semibold text-[#7A9B7E]">
                  Enabled
                </span>
              </div>

              <div className="flex min-h-[70px] items-center justify-between">
                <span className="text-xs text-[#77736E]">
                  Admin Access
                </span>

                <span className="rounded-full bg-[#EAF0F6] px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
                  Secure
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
          <div className="border-b border-[#E5E0D9] px-5 py-4">
            <h2 className="text-base font-semibold text-[#121212]">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="group flex min-h-[78px] items-center gap-3 rounded-xl border border-[#E5E0D9] bg-white px-4 text-left transition hover:-translate-y-0.5 hover:border-[#E5E0D9] hover:shadow-sm"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className={action.iconColor}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#121212]">
                      {action.title}
                    </p>

                    <p className="mt-1 text-xs text-[#77736E]">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    strokeWidth={1.8}
                    className="ml-auto hidden text-[#77736E] transition group-hover:translate-x-1 group-hover:text-[#3D6A9C] sm:block"
                  />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}