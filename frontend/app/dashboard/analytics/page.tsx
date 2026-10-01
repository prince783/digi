"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FileText,
  RefreshCw,
  Share2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AnalyticsBodySkeleton } from "../components/Shimmer";

type Period = "7" | "30" | "90";

interface CardRecord {
  _id?: string;
  username?: string;
  fullName?: string;
  companyName?: string;
  views?: number;
  shares?: number;
  isPublished?: boolean;
  paymentStatus?: string;
  createdAt?: string;
}

interface CatalogRecord {
  _id?: string;
  username?: string;
  company?: { companyName?: string; fullName?: string };
  products?: unknown[];
  isPublished?: boolean;
  paymentStatus?: string;
  createdAt?: string;
}

interface ResumeRecord {
  username?: string;
  resume?: { fullName?: string };
  isPublished?: boolean;
  paymentStatus?: string;
  createdAt?: string;
}

interface SubscriptionRecord {
  product?: string;
  paymentStatus?: string;
  amount?: number;
  paidAt?: string;
}

function number(value: unknown) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: value > 9999 ? "compact" : "standard" }).format(value);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#77736E]">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#121212]">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      </div>
      <p className="mt-3 text-xs text-[#77736E]">{helper}</p>
    </div>
  );
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF0F6] text-[#1E3A5F]">{icon}</div>
      <div>
        <h2 className="text-sm font-bold text-[#121212]">{title}</h2>
        <p className="mt-1 text-xs text-[#77736E]">{description}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogRecord[]>([]);
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [period, setPeriod] = useState<Period>("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const authResponse = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const authData = await authResponse.json();
      const userId = authData?.user?.id || authData?.user?._id;
      if (!authResponse.ok || !userId) throw new Error("Please log in to view your analytics.");

      const [cardResponse, catalogResponse, resumeResponse, subscriptionResponse] = await Promise.all([
        fetch("/api/digital-cards/me", { credentials: "include", cache: "no-store" }),
        fetch(`/api/catalogs/me?userId=${encodeURIComponent(userId)}`, { credentials: "include", cache: "no-store" }),
        fetch("/api/resumes/me", { credentials: "include", cache: "no-store" }),
        fetch(`/api/subscription?userId=${encodeURIComponent(userId)}`, { credentials: "include", cache: "no-store" }),
      ]);

      const [cardData, catalogData, resumeData, subscriptionData] = await Promise.all([
        cardResponse.json(),
        catalogResponse.json(),
        resumeResponse.json(),
        subscriptionResponse.json(),
      ]);

      setCards(Array.isArray(cardData?.cards) ? cardData.cards : []);
      const loadedCatalogs = catalogData?.catalogs ?? catalogData?.data ?? [];
      setCatalogs(Array.isArray(loadedCatalogs) ? loadedCatalogs : []);
      setResume(resumeData?.resume || null);
      setSubscriptions(Array.isArray(subscriptionData?.subscriptions) ? subscriptionData.subscriptions : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAnalytics(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const metrics = useMemo(() => {
    const views = cards.reduce((total, card) => total + number(card.views), 0);
    const shares = cards.reduce((total, card) => total + number(card.shares), 0);
    const published = cards.filter((card) => card.isPublished && card.paymentStatus === "paid").length
      + catalogs.filter((catalog) => catalog.isPublished && catalog.paymentStatus === "paid").length
      + (resume?.isPublished && resume.paymentStatus === "paid" ? 1 : 0);
    const paid = subscriptions.filter((item) => item.paymentStatus === "paid");
    const topCard = [...cards].sort((a, b) => number(b.views) - number(a.views))[0];
    return {
      views,
      shares,
      published,
      projects: cards.length + catalogs.length + (resume ? 1 : 0),
      paidAmount: paid.reduce((total, item) => total + number(item.amount), 0),
      engagement: views ? ((shares / views) * 100).toFixed(1) : "0.0",
      averageViews: cards.length ? Math.round(views / cards.length) : 0,
      topCardName: topCard?.fullName || topCard?.username || "No card data",
      topCardViews: number(topCard?.views),
    };
  }, [cards, catalogs, resume, subscriptions]);

  const projectRows = useMemo(() => {
    return [
      ...cards.map((card) => ({
        id: card._id || card.username || "card",
        name: card.fullName ? `${card.fullName}'s Digital Card` : "Digital Visiting Card",
        type: "Digital Visiting Card",
        views: number(card.views),
        shares: number(card.shares),
        published: Boolean(card.isPublished && card.paymentStatus === "paid"),
        paymentStatus: card.paymentStatus || "pending",
        url: card.username ? `/digitalvisitingcard/${encodeURIComponent(card.username)}` : "",
      })),
      ...catalogs.map((catalog) => ({
        id: catalog._id || catalog.username || "catalog",
        name: catalog.company?.companyName ? `${catalog.company.companyName} Catalog` : "Product Catalog",
        type: "Product Catalog",
        views: 0,
        shares: 0,
        published: Boolean(catalog.isPublished && catalog.paymentStatus === "paid"),
        paymentStatus: catalog.paymentStatus || "pending",
        url: catalog.username ? `/catalogs/${encodeURIComponent(catalog.username)}` : "",
      })),
      ...(resume ? [{
        id: "resume",
        name: resume.resume?.fullName ? `${resume.resume.fullName}'s Resume` : "My Resume",
        type: "Resume",
        views: 0,
        shares: 0,
        published: Boolean(resume.isPublished && resume.paymentStatus === "paid"),
        paymentStatus: resume.paymentStatus || "pending",
        url: resume.username ? `/resume/${encodeURIComponent(resume.username)}` : "",
      }] : []),
    ];
  }, [cards, catalogs, resume]);

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-3.5 py-4 text-[#121212] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1E3A5F]">Performance overview</p>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-1 text-xs text-[#77736E]">Understand how your digital presence is performing.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 sm:h-10 items-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-3 text-xs text-[#121212]">
              <CalendarDays size={14} className="text-[#1E3A5F]" />
              <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="bg-transparent outline-none">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <ChevronDown size={13} />
            </div>
            <button type="button" onClick={() => void loadAnalytics()} className="flex h-9 sm:h-10 items-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-3 text-xs font-semibold text-[#121212] hover:border-[#1E3A5F] hover:text-[#1E3A5F]">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}

        {loading ? <AnalyticsBodySkeleton /> : <>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active subscriptions" value={`${metrics.published}/${metrics.projects}`} helper="Paid products currently published" icon={<CheckCircle2 size={18} />} tone="bg-[#EAF0F6] text-[#1E3A5F]" />
          <MetricCard label="Total shares" value={formatNumber(metrics.shares)} helper="Times your cards were shared" icon={<Share2 size={18} />} tone="bg-[#EAF0F6] text-[#7A9B7E]" />
          <MetricCard label="Engagement rate" value={`${metrics.engagement}%`} helper="Shares compared with total views" icon={<Activity size={18} />} tone="bg-[#fff5df] text-[#d38a12]" />
          <MetricCard label="Published projects" value={`${metrics.published}/${metrics.projects}`} helper="Active paid projects" icon={<CheckCircle2 size={18} />} tone="bg-[#EAF0F6] text-[#1E3A5F]" />
        </div>

        <div className="mb-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
            <SectionTitle icon={<BarChart3 size={18} />} title="Audience activity" description="Your current audience reach and sharing behaviour" />
            <div className="relative h-52 overflow-hidden rounded-xl bg-gradient-to-b from-[#FAF9F6] to-white">
              <div className="absolute inset-0 flex flex-col justify-between py-3">
                {[0, 1, 2, 3].map((line) => <div key={line} className="border-t border-dashed border-[#E5E0D9]" />)}
              </div>
              <div className="absolute inset-x-4 bottom-5 top-5 flex items-end gap-2">
                {Array.from({ length: 12 }, (_, index) => {
                  const base = metrics.views ? Math.max(12, Math.round((metrics.views / 12) * (0.45 + ((index * 13) % 55) / 100))) : 0;
                  const height = metrics.views ? Math.min(94, Math.max(8, (base / Math.max(metrics.views / 5, 1)) * 100)) : 8;
                  return <div key={index} className="group flex h-full flex-1 items-end"><div className="relative w-full rounded-t-md bg-gradient-to-t from-[#1E3A5F] to-[#3D6A9C] opacity-80 transition hover:opacity-100" style={{ height: `${height}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#121212] px-1.5 py-1 text-[9px] text-white group-hover:block">{formatNumber(base)} views</span></div></div>;
                })}
              </div>
              <div className="absolute bottom-1.5 left-4 right-4 flex justify-between text-[9px] text-[#77736E]"><span>Earlier</span><span>Today</span></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-xs text-[#77736E]"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#1E3A5F]" />Profile views</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#7A9B7E]" />Shares tracked on cards</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#E5E0D9] pt-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-[#77736E]">Total reach</p>
                <p className="mt-1 text-sm font-bold">{formatNumber(metrics.views)}</p>
                <p className="mt-1 text-[9px] text-[#77736E]">all tracked views</p>
              </div>
              <div>
                <p className="text-xs text-[#77736E]">Avg. views/card</p>
                <p className="mt-1 text-sm font-bold">{formatNumber(metrics.averageViews)}</p>
                <p className="mt-1 text-[9px] text-[#77736E]">across {cards.length} card{cards.length === 1 ? "" : "s"}</p>
              </div>
              <div>
                <p className="text-xs text-[#77736E]">Share conversion</p>
                <p className="mt-1 text-sm font-bold text-[#7A9B7E]">{metrics.engagement}%</p>
                <p className="mt-1 text-[9px] text-[#77736E]">views becoming shares</p>
              </div>
              <div>
                <p className="text-xs text-[#77736E]">Top profile</p>
                <p className="mt-1 truncate text-sm font-bold">{metrics.topCardName}</p>
                <p className="mt-1 text-[9px] text-[#77736E]">{formatNumber(metrics.topCardViews)} views</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
            <SectionTitle icon={<Sparkles size={18} />} title="Portfolio health" description="A quick view of your account readiness" />
            <div className="space-y-5">
              {[
                ["Digital Visiting Cards", cards.length, cards.filter((card) => card.isPublished && card.paymentStatus === "paid").length, "#1E3A5F"],
                ["Product Catalogs", catalogs.length, catalogs.filter((catalog) => catalog.isPublished && catalog.paymentStatus === "paid").length, "#7A9B7E"],
                ["Resume", resume ? 1 : 0, resume?.isPublished && resume.paymentStatus === "paid" ? 1 : 0, "#d38a12"],
              ].map(([label, total, active, color]) => {
                const percentage = number(total) ? (number(active) / number(total)) * 100 : 0;
                return <div key={String(label)}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold">{label}</span><span className="text-[#77736E]">{active}/{total} active</span></div><div className="h-2 overflow-hidden rounded-full bg-[#FAF9F6]"><div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color as string }} /></div></div>;
              })}
              <div className="rounded-xl bg-[#FAF9F6] p-3"><p className="text-xs font-semibold">Lifetime payments</p><p className="mt-1 text-lg font-bold text-[#1E3A5F]">{formatAmount(metrics.paidAmount)}</p><p className="mt-1 text-xs text-[#77736E]">Across all paid subscriptions</p></div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
          <div className="border-b border-[#E5E0D9] p-5"><SectionTitle icon={<CreditCard size={18} />} title="Project readiness" description="Check payment, publication, and launch status for every project" /></div>
          {projectRows.length === 0 ? <div className="p-10 text-center text-xs text-[#77736E]">Create a digital project to start seeing its readiness status.</div> : <div className="divide-y divide-[#E5E0D9]">{projectRows.map((project) => { const paid = project.paymentStatus === "paid"; return <div key={`${project.type}-${project.id}`} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6] text-[#1E3A5F]">{project.type === "Resume" ? <FileText size={17} /> : project.type === "Product Catalog" ? <Wallet size={17} /> : <CreditCard size={17} />}</div><div><p className="text-xs font-semibold">{project.name}</p><p className="mt-1 text-xs text-[#77736E]">{project.type} {project.published ? "• Published" : "• Draft"}</p></div></div><div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs"><span className={`rounded-full px-2.5 py-1 font-semibold ${paid ? "bg-accent text-success" : "bg-amber-50 text-amber-700"}`}>{paid ? "Payment complete" : "Payment pending"}</span><span className={`rounded-full px-2.5 py-1 font-semibold ${project.published ? "bg-accent text-primary" : "bg-page text-muted"}`}>{project.published ? "Published" : "Draft"}</span>{project.url && <Link href={project.url} target="_blank" className="text-[#1E3A5F] hover:text-[#1E3A5F]" aria-label={`Open ${project.name}`}><ExternalLink size={15} /></Link>}</div></div>; })}</div>}
        </section>

        </>}

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#E5E0D9] bg-[#E5E0D9] p-4 text-xs text-[#77736E]"><Activity size={16} className="mt-0.5 shrink-0 text-[#1E3A5F]" /><p><strong className="text-[#1E3A5F]">Analytics note:</strong> View and share metrics are currently tracked for digital visiting cards. Catalogs and resumes are included in portfolio and publication analytics until dedicated visit tracking is enabled.</p></div>
      </div>
    </main>
  );
}
