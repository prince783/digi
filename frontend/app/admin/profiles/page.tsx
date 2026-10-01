"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  Search,
  Eye,
  Share2,
  BarChart3,
  ExternalLink,
  Users,
  CreditCard,
  FileText,
  UserRound,
  ChevronDown,
  RefreshCw,
  CircleAlert,
  Clock3,
  CheckCircle2,
  Ban,
  CalendarDays,
  ImageIcon,
  ShieldCheck,
  Loader2,
  ShoppingBag,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Download,
  AlertTriangle,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Profile {
  id: string;

  type:
  | "digital-visiting-card"
  | "resume"
  | "biography"
  | "catalog";

  fullName: string;
  username: string;
  email: string;
  mobile: string;
  profilePhoto: string;

  views: number;
  shares: number;

  registrationDate: string;
  paymentDate: string | null;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;

  status:
  | "active"
  | "pending"
  | "expired"
  | "suspended";

  daysOverdue?: number;
  renewalUrl?: string;
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [summary, setSummary] = useState({
    total: 0,
    types: {
      digitalCards: 0,
      catalogs: 0,
      resumes: 0,
      biographies: 0,
    },
    status: {
      all: 0,
      active: 0,
      expired: 0,
      pending: 0,
      suspended: 0,
    },
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);
  const updatingIdRef = useRef<string | null>(null);

  function setUpdating(id: string | null) {
    updatingIdRef.current = id;
    setUpdatingId(id);
  }

  const [silentRefreshing, setSilentRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss toast after 3500ms
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeRequestId = useRef(0);

  /* =========================================================
     READ URL SEARCH PARAMS ON MOUNT
  ========================================================= */

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlType = sp.get("type");
      const urlStatus = sp.get("status");
      const urlSearch = sp.get("search");

      if (urlType) setType(urlType);
      if (urlStatus) setStatus(urlStatus);
      if (urlSearch) {
        setSearch(urlSearch);
        setDebouncedSearch(urlSearch);
      }
    }
  }, []);

  /* =========================================================
     DEBOUNCE SEARCH ONLY (Keystrokes wait 250ms)
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================================================
     LOAD PROFILES ON FILTER/PAGE/DEBOUNCED SEARCH CHANGE
  ========================================================= */

  useEffect(() => {
    loadProfiles(debouncedSearch, type, status, page, false);
  }, [debouncedSearch, type, status, page]);

  /* =========================================================
     SMART AUTO-REVALIDATION & FOCUS RECONNECT
     Keeps table and counts synchronized in near-real-time:
     - Polls every 20s only when the tab is visible and focused
     - Refetches immediately when switching back to tab (focus)
     - Refetches immediately upon network reconnect (online)
     - Prevents excessive requests by pausing when tab is hidden
  ========================================================= */

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let lastFetchTime = Date.now();

    function handleActivityRevalidate() {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        if (updatingIdRef.current) return;
        const now = Date.now();
        // Throttle focus revalidations (min 8s) to avoid spamming on rapid alt-tab
        if (now - lastFetchTime > 8000) {
          lastFetchTime = now;
          loadProfiles(debouncedSearch, type, status, page, true);
        }
      }
    }

    timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        if (updatingIdRef.current) return;
        lastFetchTime = Date.now();
        loadProfiles(debouncedSearch, type, status, page, true);
      }
    }, 20000); // 20 seconds interval

    document.addEventListener("visibilitychange", handleActivityRevalidate);
    window.addEventListener("focus", handleActivityRevalidate);
    window.addEventListener("online", handleActivityRevalidate);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleActivityRevalidate);
      window.removeEventListener("focus", handleActivityRevalidate);
      window.removeEventListener("online", handleActivityRevalidate);
    };
  }, [debouncedSearch, type, status, page]);

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setPage(1);
  }

  function handleTypeChange(newType: string) {
    setType(newType);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
  }

  async function loadProfiles(
    currentSearch = debouncedSearch,
    currentType = type,
    currentStatus = status,
    currentPage = page,
    silent = false,
  ) {
    const reqId = ++activeRequestId.current;

    try {
      if (silent) {
        setSilentRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentType && currentType !== "all") params.set("type", currentType);
      if (currentStatus && currentStatus !== "all") params.set("status", currentStatus);
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));
      params.set("_t", String(Date.now()));

      const response = await fetch(
        `/api/admin/profiles?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      // Ignore response if user switched tabs or initiated newer request
      if (reqId !== activeRequestId.current) return;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load profiles"
        );
      }

      setProfiles(data.profiles || []);
      setTotalFiltered(data.total ?? (data.profiles || []).length);
      if (data.pagination) {
        const pages = data.pagination.totalPages || 1;
        setTotalPages(pages);
        if (currentPage > pages && pages >= 1) {
          setPage(pages);
        }
      }
      if (data.summary) {
        setSummary(data.summary);
      }
      setLastSynced(new Date());
    } catch (error) {
      if (reqId !== activeRequestId.current) return;
      console.error(
        "Failed to load profiles:",
        error
      );
      if (!silent) {
        setProfiles([]);
        setTotalFiltered(0);
        setTotalPages(1);
      }
    } finally {
      if (reqId === activeRequestId.current) {
        setLoading(false);
        setSilentRefreshing(false);
      }
    }
  }

  /* =========================================================
     UPDATE PROFILE STATUS
  ========================================================= */

  async function updateProfileStatus(
    profileId: string,
    newStatus: "active" | "suspended"
  ) {
    const action =
      newStatus === "suspended"
        ? "suspend"
        : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this profile?`
    );

    if (!confirmed) return;

    try {
      setUpdating(profileId);

      const response = await fetch(
        `/api/admin/profiles/${profileId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          `Failed to ${action} profile`
        );
      }

      // Show success feedback
      setToast({
        type: "success",
        message: data.message || `User ${action}ed successfully.`,
      });

      // Update summary counts directly from the backend-verified response
      if (data.summary) {
        setSummary(data.summary);
      }

      // Synchronize table rows immediately according to active status tab
      setProfiles((prevProfiles) => {
        if (status !== "all" && status !== newStatus) {
          // Profile changed away from current tab: remove immediately
          setTotalFiltered((prev) => Math.max(0, prev - 1));
          return prevProfiles.filter((p) => p.id !== profileId);
        } else {
          // In "all" or matching tab: update row status badge and button
          return prevProfiles.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  status: newStatus,
                  accountStatus: newStatus,
                  isPublished: newStatus === "active",
                }
              : p
          );
        }
      });

      // Silently revalidate full table from MongoDB to guarantee pagination & sorting alignment
      await loadProfiles(debouncedSearch, type, status, page, true);
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to update profile status";

      setToast({
        type: "error",
        message: errMsg,
      });
    } finally {
      setUpdating(null);
    }
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  function formatDate(
    value: string | null
  ) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getInitial(name: string) {
    return (
      name?.charAt(0)?.toUpperCase() || "U"
    );
  }

  function getPageNumbers(currentPage: number, total: number) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (currentPage >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total];
  }

  function handleCopyRenewalLink(profile: Profile) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}${profile.renewalUrl || `/payment/${profile.username}`}`;
    navigator.clipboard.writeText(link);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getWhatsAppUrl(profile: Profile) {
    const cleanPhone = (profile.mobile || "").replace(/[^0-9]/g, "");
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}${profile.renewalUrl || `/payment/${profile.username}`}`;
    const prodName =
      profile.type === "digital-visiting-card"
        ? "Digital Visiting Card"
        : profile.type === "catalog"
          ? "Product Catalogue"
          : "Resume";

    const msg = `Hello ${profile.fullName || "User"},\n\nYour DigiProfilo ${prodName} subscription for "${profile.username}" has expired.\n\nRenew your plan now to keep your link and profile active:\n👉 ${link}\n\nThank you,\nDigiProfilo Team`;
    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`;
  }

  function getEmailUrl(profile: Profile) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}${profile.renewalUrl || `/payment/${profile.username}`}`;
    const prodName =
      profile.type === "digital-visiting-card"
        ? "Digital Visiting Card"
        : profile.type === "catalog"
          ? "Product Catalogue"
          : "Resume";

    const subject = `Renewal Notice: Your DigiProfilo ${prodName} has expired`;
    const body = `Hello ${profile.fullName || "User"},\n\nYour DigiProfilo ${prodName} subscription for "${profile.username}" has expired.\n\nPlease complete your renewal to restore your live profile:\n${link}\n\nWarm regards,\nDigiProfilo Team`;
    return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function exportFollowUpCSV() {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (type && type !== "all") params.set("type", type);
      const exportStatus = status === "expired" ? "expired" : status;
      if (exportStatus && exportStatus !== "all") params.set("status", exportStatus);
      params.set("limit", "10000");

      const response = await fetch(`/api/admin/profiles?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();
      const listToExport: Profile[] = data.profiles || [];

      if (listToExport.length === 0) {
        alert("No profiles available to export.");
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const headers = [
        "Full Name",
        "Username",
        "Type",
        "Status",
        "Mobile",
        "Email",
        "Registered Date",
        "Expiry Date",
        "Days Overdue",
        "Renewal Link",
      ];

      const csvRows = listToExport.map((p) => {
        const renewalLink = `${origin}${p.renewalUrl || `/payment/${p.username}`}`;
        return [
          `"${(p.fullName || "").replace(/"/g, '""')}"`,
          `"${(p.username || "").replace(/"/g, '""')}"`,
          `"${p.type}"`,
          `"${p.status}"`,
          `"${(p.mobile || "").replace(/"/g, '""')}"`,
          `"${(p.email || "").replace(/"/g, '""')}"`,
          `"${p.registrationDate ? new Date(p.registrationDate).toLocaleDateString("en-IN") : ""}"`,
          `"${p.subscriptionEnd ? new Date(p.subscriptionEnd).toLocaleDateString("en-IN") : ""}"`,
          `"${p.daysOverdue ?? ""}"`,
          `"${renewalLink}"`,
        ].join(",");
      });

      const csvString =
        "data:text/csv;charset=utf-8," + [headers.join(","), ...csvRows].join("\n");
      const encodedUri = encodeURI(csvString);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const filename =
        status === "expired"
          ? `digiprofilo_expired_not_renewed_${new Date().toISOString().slice(0, 10)}.csv`
          : `digiprofilo_profiles_export_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV failed:", err);
      alert("Failed to export CSV.");
    }
  }

  /* =========================================================
     TYPE CONFIG
  ========================================================= */

  function getTypeConfig(
    profileType: string
  ) {
    switch (profileType) {
      case "digital-visiting-card":
        return {
          label: "Digital Visiting Card",
          icon: CreditCard,
          className:
            "bg-accent text-primary border-line",
        };

      case "resume":
        return {
          label: "Resume",
          icon: FileText,
          className:
            "bg-accent text-primary border-line",
        };

      case "biography":
        return {
          label: "Biography",
          icon: UserRound,
          className:
            "bg-accent text-success border-line",
        };

      case "catalog":
        return {
          label: "Catalog",
          icon: ShoppingBag,
          className:
            "bg-accent text-primary border-line",
        };

      default:
        return {
          label: profileType,
          icon: FileText,
          className:
            "bg-page text-muted border-line",
        };
    }
  }

  /* =========================================================
     STATUS CONFIG
  ========================================================= */

  function getStatusConfig(
    profileStatus: string
  ) {
    switch (profileStatus) {
      case "active":
        return {
          label: "Active",
          icon: CheckCircle2,
          className:
            "bg-accent text-success border-line",
        };

      case "pending":
        return {
          label: "Pending",
          icon: Clock3,
          className:
            "bg-amber-50 text-amber-700 border-amber-100",
        };

      case "expired":
        return {
          label: "Expired",
          icon: CircleAlert,
          className:
            "bg-orange-50 text-orange-700 border-orange-100",
        };

      case "suspended":
        return {
          label: "Suspended",
          icon: Ban,
          className:
            "bg-red-50 text-red-700 border-red-100",
        };

      default:
        return {
          label: profileStatus,
          icon: Clock3,
          className:
            "bg-page text-muted border-line",
        };
    }
  }

  /* =========================================================
     STATS
  ========================================================= */

  const totalProfiles = summary.total;
  const digitalCards = summary.types.digitalCards;
  const resumes = summary.types.resumes;
  const biographies = summary.types.biographies;
  const catalogs = summary.types.catalogs;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* =====================================================
         FLOATING TOAST NOTIFICATION
      ===================================================== */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5"
        >
          {toast.type === "success" ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={18} />
            </div>
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold text-ink">
              {toast.type === "success" ? "Success" : "Error"}
            </p>
            <p className="text-muted">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded p-1 text-muted hover:bg-page hover:text-ink transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-4 md:px-5 lg:px-6">

        {/* =====================================================
           HEADER
        ===================================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Admin Panel
              </p>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
              Profile Management
            </h1>

            <p className="mt-1 text-xs text-muted md:text-sm">
              View, manage and monitor all Digital Visiting
              Cards, Resumes and Biographies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="hidden items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] text-muted shadow-sm sm:flex"
              title="Automatically polling MongoDB every 20 seconds and on tab focus"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  silentRefreshing
                    ? "bg-amber-500 animate-ping"
                    : "bg-emerald-500"
                }`}
              />
              <span className="font-semibold text-ink">Live Sync</span>
              <span className="text-muted/50">•</span>
              <span className="text-[10px] text-muted">
                {lastSynced.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            <button
              onClick={() =>
                loadProfiles(
                  debouncedSearch,
                  type,
                  status,
                  page,
                  false,
                )
              }
              disabled={loading}
              className="
                inline-flex h-9 items-center justify-center gap-1.5
                rounded-lg border border-line bg-white
                px-3 text-xs font-semibold text-ink
                shadow-sm transition
                hover:border-line
                hover:bg-accent
                hover:text-primary
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={14}
                className={
                  loading || silentRefreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* =====================================================
           STATS
        ===================================================== */}

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-5">

          {/* TOTAL */}

          <div
            className="
              relative overflow-hidden rounded-xl
              border border-line
              bg-white p-3.5 shadow-sm
            "
          >
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-accent" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Total Profiles
                </p>

                <p className="mt-1 text-2xl font-bold text-ink">
                  {totalProfiles}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  All registered profiles
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                <Users size={18} />
              </div>
            </div>
          </div>

          {/* DIGITAL CARDS */}

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Digital Visiting Cards
                </p>

                <p className="mt-1 text-2xl font-bold text-ink">
                  {digitalCards}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  Active and inactive cards
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                <CreditCard size={18} />
              </div>
            </div>
          </div>

          {/* RESUMES */}

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Resumes
                </p>

                <p className="mt-1 text-2xl font-bold text-ink">
                  {resumes}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  Resume profiles
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                <FileText size={18} />
              </div>
            </div>
          </div>

          {/* BIOGRAPHIES */}

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Biographies
                </p>

                <p className="mt-1 text-2xl font-bold text-ink">
                  {biographies}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  Biography profiles
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-success">
                <UserRound size={18} />
              </div>
            </div>
          </div>

          {/* CATALOGS */}

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Catalogs
                </p>

                <p className="mt-1 text-2xl font-bold text-ink">
                  {catalogs}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  Product catalog profiles
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                <ShoppingBag size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
           TABLE CONTAINER
        ===================================================== */}

        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">

          {/* ===================================================
             QUICK STATUS TABS & EXPORT ROW
          =================================================== */}

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-[#FAF9F6] p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStatusChange("all")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${status === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "border border-line bg-white text-muted hover:border-line hover:bg-accent hover:text-ink"
                  }`}
              >
                All Profiles
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status === "all"
                      ? "bg-white/20 text-white"
                      : "bg-page text-muted"
                    }`}
                >
                  {summary.status.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("active")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${status === "active"
                    ? "bg-[#1E3A5F] text-white shadow-sm"
                    : "border border-line bg-white text-muted hover:border-line hover:bg-accent hover:text-ink"
                  }`}
              >
                <CheckCircle2 size={12} />
                Active
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status === "active"
                      ? "bg-white/20 text-white"
                      : "bg-page text-muted"
                    }`}
                >
                  {summary.status.active}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("expired")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${status === "expired"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "border border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100"
                  }`}
              >
                <CircleAlert
                  size={13}
                  className={
                    status === "expired" ? "text-white" : "text-amber-600"
                  }
                />
                Expired & Not Renewed
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${status === "expired"
                      ? "bg-white/25 text-white"
                      : "bg-amber-200 text-amber-900"
                    }`}
                >
                  {summary.status.expired}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("pending")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${status === "pending"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "border border-line bg-white text-muted hover:border-line hover:bg-accent hover:text-ink"
                  }`}
              >
                <Clock3 size={12} />
                Pending
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status === "pending"
                      ? "bg-white/20 text-white"
                      : "bg-page text-muted"
                    }`}
                >
                  {summary.status.pending}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("suspended")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${status === "suspended"
                    ? "bg-red-700 text-white shadow-sm"
                    : "border border-line bg-white text-muted hover:border-line hover:bg-accent hover:text-ink"
                  }`}
              >
                <Ban size={12} />
                Suspended
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status === "suspended"
                      ? "bg-white/20 text-white"
                      : "bg-page text-muted"
                    }`}
                >
                  {summary.status.suspended}
                </span>
              </button>
            </div>

            {/* EXPORT CSV BUTTON */}
            <button
              type="button"
              onClick={exportFollowUpCSV}
              className="
                inline-flex items-center gap-1.5
                rounded-lg border border-line bg-white
                px-3 py-1.5 text-xs font-semibold text-ink
                shadow-sm transition
                hover:border-primary-light hover:bg-accent hover:text-primary
              "
              title="Download follow-up CSV file"
            >
              <Download size={13} />
              Export Follow-up List (CSV)
            </button>
          </div>

          {/* ===================================================
             FILTER HEADER
          =================================================== */}

          <div className="border-b border-line p-3">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-[380px]">
                <Search
                  size={15}
                  className="
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    text-muted
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    handleSearchChange(e.target.value)
                  }
                  placeholder="Search name, username, email or mobile..."
                  className="
                    h-9 w-full rounded-lg
                    border border-line
                    bg-page
                    pl-9 pr-3
                    text-xs text-ink
                    outline-none transition
                    placeholder:text-muted
                    focus:border-primary-light
                    focus:bg-white
                    focus:ring-2
                    focus:ring-line
                  "
                />
              </div>

              {/* TYPE */}

              <div className="relative w-full sm:w-auto">
                <select
                  value={type}
                  onChange={(e) =>
                    handleTypeChange(e.target.value)
                  }
                  className="
                    h-9 w-full sm:min-w-[165px]
                    appearance-none rounded-lg
                    border border-line
                    bg-white px-3 pr-8
                    text-xs font-medium text-ink
                    outline-none
                    focus:border-primary-light
                  "
                >
                  <option value="all">
                    All Types
                  </option>

                  <option value="digital-visiting-card">
                    Digital Visiting Card
                  </option>

                  <option value="resume">
                    Resume
                  </option>

                  <option value="biography">
                    Biography
                  </option>

                  <option value="catalog">
                    Catalog
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="
                    pointer-events-none absolute
                    right-2.5 top-1/2
                    -translate-y-1/2
                    text-muted
                  "
                />
              </div>

              {/* STATUS */}

              <div className="relative w-full sm:w-auto">
                <select
                  value={status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value)
                  }
                  className="
                    h-9 w-full sm:min-w-[170px]
                    appearance-none rounded-lg
                    border border-line
                    bg-white px-3 pr-8
                    text-xs font-medium text-ink
                    outline-none
                    focus:border-primary-light
                  "
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="expired">
                    Expired & Not Renewed
                  </option>

                  <option value="suspended">
                    Suspended
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="
                    pointer-events-none absolute
                    right-2.5 top-1/2
                    -translate-y-1/2
                    text-muted
                  "
                />
              </div>

              <div className="hidden flex-1 lg:block" />

              <p className="text-xs text-muted">
                Showing{" "}
                <span className="font-semibold text-ink">
                  {totalFiltered === 0
                    ? 0
                    : `${(page - 1) * pageSize + 1}–${Math.min(
                      page * pageSize,
                      totalFiltered,
                    )}`}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-ink">
                  {totalFiltered}
                </span>{" "}
                profiles
              </p>
            </div>
          </div>

          {/* ===================================================
             MOBILE CARDS (VISIBLE ON SCREENS < MD)
          =================================================== */}

          <div className="block divide-y divide-line md:hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted">
                <RefreshCw size={20} className="animate-spin text-primary" />
                <p className="text-xs">Loading profiles...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-page text-muted">
                  <ImageIcon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-ink">No profiles found</h3>
                <p className="mt-1 text-xs text-muted">Try changing your search or filter.</p>
              </div>
            ) : (
              profiles.map((profile) => {
                const typeConfig = getTypeConfig(profile.type);
                const statusConfig = getStatusConfig(profile.status);
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={profile.id} className="p-4 transition hover:bg-page/60">
                    {/* Top row: Avatar + Name + Status */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {profile.profilePhoto ? (
                          <img
                            src={profile.profilePhoto}
                            alt={profile.fullName}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-line"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-primary ring-1 ring-line">
                            {getInitial(profile.fullName)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {profile.fullName}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {profile.username ? `@${profile.username}` : "—"}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusConfig.className}`}>
                        <StatusIcon size={10} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Details & Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${typeConfig.className}`}>
                        <TypeIcon size={11} />
                        {typeConfig.label}
                      </span>

                      {profile.mobile && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-page px-2 py-0.5 text-[11px] text-muted">
                          📞 {profile.mobile}
                        </span>
                      )}

                      {profile.subscriptionEnd && (
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] ${
                          profile.status === "expired" ? "bg-red-50 text-red-700 font-semibold" : "bg-page text-muted"
                        }`}>
                          📅 Exp: {formatDate(profile.subscriptionEnd)}
                        </span>
                      )}
                    </div>

                    {profile.status === "expired" && profile.daysOverdue !== undefined && (
                      <p className="mt-2 text-xs font-bold text-amber-700">
                        ⚠️ {profile.daysOverdue === 0 ? "Expired today" : `${profile.daysOverdue} days overdue`}
                      </p>
                    )}

                    {/* Views & Shares & Registration */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                      <div className="flex items-center gap-1 font-medium text-ink">
                        <BarChart3 size={13} className="text-muted" />
                        <span>{profile.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-ink">
                        <Share2 size={13} className="text-muted" />
                        <span>{profile.shares || 0} shares</span>
                      </div>
                      <div className="ml-auto text-[11px] text-muted">
                        Reg: {formatDate(profile.registrationDate)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-line/60">
                      {profile.status === "expired" && (
                        <>
                          {profile.mobile && (
                            <a
                              href={getWhatsAppUrl(profile)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <MessageCircle size={13} />
                              WhatsApp
                            </a>
                          )}
                          {profile.email && (
                            <a
                              href={getEmailUrl(profile)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                              <Mail size={13} />
                              Email
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyRenewalLink(profile)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-xs text-muted hover:bg-accent"
                          >
                            {copiedId === profile.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            Copy
                          </button>
                        </>
                      )}

                      <Link
                        href={`/admin/profiles/${profile.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink shadow-sm transition hover:bg-accent hover:text-primary"
                      >
                        <Eye size={13} />
                        Details
                      </Link>

                      {profile.username && (
                        <a
                          href={
                            profile.type === "digital-visiting-card"
                              ? `/digitalvisitingcard/${profile.username}`
                              : profile.type === "catalog"
                                ? `/catalogs/${profile.username}`
                                : profile.type === "resume"
                                  ? `/resume/${profile.username}`
                                  : "#"
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink shadow-sm transition hover:bg-accent hover:text-primary"
                        >
                          <ExternalLink size={13} />
                          Live Link
                        </a>
                      )}

                      {profile.status === "suspended" ? (
                        <button
                          type="button"
                          onClick={() => updateProfileStatus(profile.id, "active")}
                          disabled={updatingId === profile.id}
                          className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg border border-success bg-accent px-2.5 text-xs font-semibold text-success hover:bg-success hover:text-white"
                        >
                          {updatingId === profile.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                          Activate
                        </button>
                      ) : profile.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => updateProfileStatus(profile.id, "suspended")}
                          disabled={updatingId === profile.id}
                          className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-xs font-medium text-muted hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          {updatingId === profile.id ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                          Suspend
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ===================================================
             TABLE (DESKTOP / TABLET >= MD)
          =================================================== */}

          <div className="hidden md:block hide-scrollbar overflow-x-auto">
            <table className="w-full min-w-[1150px]">

              <thead className="border-b border-line bg-page/80">
                <tr>

                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    Profile
                  </th>

                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    Type
                  </th>

                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    Status
                  </th>

                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    Registered
                  </th>

                  <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    Payment
                  </th>

                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted">
                    Views
                  </th>

                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted">
                    Shares
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {/* LOADING */}

                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-16"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-muted">
                        <RefreshCw
                          size={20}
                          className="animate-spin text-primary"
                        />

                        <p className="text-xs">
                          Loading profiles...
                        </p>
                      </div>
                    </td>
                  </tr>

                  /* EMPTY */

                ) : profiles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-16 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">

                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-page text-muted">
                          <ImageIcon size={20} />
                        </div>

                        <h3 className="text-sm font-semibold text-ink">
                          No profiles found
                        </h3>

                        <p className="mt-1 text-xs text-muted">
                          Try changing your search or filter.
                        </p>

                      </div>
                    </td>
                  </tr>

                  /* DATA */

                ) : (
                  profiles.map((profile) => {
                    const typeConfig =
                      getTypeConfig(
                        profile.type
                      );

                    const statusConfig =
                      getStatusConfig(
                        profile.status
                      );

                    const TypeIcon =
                      typeConfig.icon;

                    const StatusIcon =
                      statusConfig.icon;

                    return (
                      <tr
                        key={profile.id}
                        className="
                          border-b border-line
                          transition-colors
                          hover:bg-page/80
                        "
                      >

                        {/* PROFILE */}

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">

                            {profile.profilePhoto ? (
                              <img
                                src={
                                  profile.profilePhoto
                                }
                                alt={
                                  profile.fullName
                                }
                                className="
                                  h-9 w-9 shrink-0
                                  rounded-lg
                                  object-cover
                                  ring-1 ring-line
                                "
                              />
                            ) : (
                              <div
                                className="
                                  flex h-9 w-9 shrink-0
                                  items-center justify-center
                                  rounded-lg
                                  bg-gradient-to-br
                                  from-accent
                                  to-accent
                                  text-xs font-bold
                                  text-primary
                                  ring-1 ring-line
                                "
                              >
                                {getInitial(
                                  profile.fullName
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-ink">
                                {profile.fullName}
                              </p>

                              <div className="mt-0.5 flex items-center gap-1.5">
                                <p className="truncate text-xs text-muted">
                                  {profile.username
                                    ? `@${profile.username}`
                                    : "—"}
                                </p>

                                {profile.mobile && (
                                  <>
                                    <span className="h-0.5 w-0.5 rounded-full bg-line" />

                                    <p className="text-xs text-muted">
                                      {
                                        profile.mobile
                                      }
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* TYPE */}

                        <td className="px-3 py-3">
                          <span
                            className={`
                              inline-flex items-center gap-1
                              rounded-md border px-2 py-1
                              text-xs font-semibold
                              ${typeConfig.className}
                            `}
                          >
                            <TypeIcon size={11} />

                            {typeConfig.label}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-3 py-3">
                          <span
                            className={`
                              inline-flex items-center gap-1
                              rounded-full border px-2 py-1
                              text-xs font-semibold
                              ${statusConfig.className}
                            `}
                          >
                            <StatusIcon size={10} />

                            {statusConfig.label}
                          </span>

                          {profile.status === "expired" && profile.daysOverdue !== undefined && (
                            <p className="mt-1 text-[10px] font-bold text-amber-700">
                              {profile.daysOverdue === 0
                                ? "Expired today"
                                : `${profile.daysOverdue}d overdue`}
                            </p>
                          )}
                        </td>

                        {/* REGISTERED */}

                        <td className="px-3 py-3 text-xs font-medium text-ink">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays
                              size={12}
                              className="text-muted"
                            />

                            {formatDate(
                              profile.registrationDate
                            )}
                          </div>
                        </td>

                        {/* PAYMENT */}

                        <td className="px-3 py-3 text-xs text-muted">
                          <div>
                            <p>{formatDate(profile.paymentDate)}</p>
                            {profile.subscriptionEnd && (
                              <p
                                className={`mt-0.5 text-[10px] ${profile.status === "expired"
                                    ? "font-semibold text-red-600"
                                    : "text-muted"
                                  }`}
                              >
                                Exp: {formatDate(profile.subscriptionEnd)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* VIEWS */}

                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink">
                            <BarChart3
                              size={13}
                              className="text-muted"
                            />

                            {profile.views || 0}
                          </div>
                        </td>

                        {/* SHARES */}

                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink">
                            <Share2
                              size={13}
                              className="text-muted"
                            />

                            {profile.shares || 0}
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">

                            {/* EXPIRED FOLLOW-UP OUTREACH ACTIONS */}
                            {profile.status === "expired" && (
                              <>
                                {profile.mobile && (
                                  <a
                                    href={getWhatsAppUrl(profile)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Send WhatsApp renewal reminder"
                                    className="
                                      flex h-8 w-8
                                      items-center justify-center
                                      rounded-lg
                                      border border-emerald-300
                                      bg-emerald-50
                                      text-emerald-700
                                      transition
                                      hover:border-emerald-400
                                      hover:bg-emerald-100
                                    "
                                  >
                                    <MessageCircle size={14} />
                                  </a>
                                )}

                                {profile.email && (
                                  <a
                                    href={getEmailUrl(profile)}
                                    title="Send Email renewal reminder"
                                    className="
                                      flex h-8 w-8
                                      items-center justify-center
                                      rounded-lg
                                      border border-blue-200
                                      bg-blue-50
                                      text-blue-700
                                      transition
                                      hover:border-blue-300
                                      hover:bg-blue-100
                                    "
                                  >
                                    <Mail size={14} />
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopyRenewalLink(profile)}
                                  title={
                                    copiedId === profile.id
                                      ? "Copied renewal link!"
                                      : "Copy renewal link"
                                  }
                                  className="
                                    flex h-8 w-8
                                    items-center justify-center
                                    rounded-lg
                                    border border-line
                                    bg-white
                                    text-muted
                                    transition
                                    hover:border-line
                                    hover:bg-accent
                                    hover:text-primary
                                  "
                                >
                                  {copiedId === profile.id ? (
                                    <Check
                                      size={14}
                                      className="text-emerald-600"
                                    />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </>
                            )}

                            {/* VIEW */}

                            <Link
                              href={`/admin/profiles/${profile.id}`}
                              title="View profile"
                              className="
                                flex h-8 w-8
                                items-center justify-center
                                rounded-lg
                                border border-line
                                bg-white
                                text-muted
                                transition
                                hover:border-line
                                hover:bg-accent
                                hover:text-primary
                              "
                            >
                              <Eye size={14} />
                            </Link>

                            {/* PUBLIC PROFILE */}

                            {profile.username ? (
                              <a
                                href={
                                  profile.type === "digital-visiting-card"
                                    ? `/digitalvisitingcard/${profile.username}`
                                    : profile.type === "catalog"
                                      ? `/catalogs/${profile.username}`
                                      : profile.type === "resume"
                                        ? `/resume/${profile.username}`
                                        : "#"
                                }
                                target="_blank"
                                rel="noreferrer"
                                title="Open public profile"
                                className="
                                  flex h-8 w-8
                                  items-center justify-center
                                  rounded-lg
                                  border border-line
                                  bg-white
                                  text-muted
                                  transition
                                  hover:border-line
                                  hover:bg-accent
                                  hover:text-primary
                                "
                              >
                                <ExternalLink size={14} />
                              </a>
                            ) : (
                              <button
                                disabled
                                title="Username not configured"
                                className="
                                  flex h-8 w-8
                                  items-center justify-center
                                  rounded-lg
                                  border border-line
                                  bg-white/50
                                  text-muted/40
                                  cursor-not-allowed
                                "
                              >
                                <ExternalLink size={14} />
                              </button>
                            )}

                            {/* ACTIVATE / SUSPEND */}

                            {profile.status ===
                              "suspended" ? (
                              <button
                                onClick={() =>
                                  updateProfileStatus(
                                    profile.id,
                                    "active"
                                  )
                                }
                                disabled={
                                  updatingId ===
                                  profile.id
                                }
                                title="Activate profile"
                                className="
                                  flex h-8 items-center
                                  justify-center gap-1.5
                                  rounded-lg
                                  border border-success
                                  bg-accent
                                  px-2.5
                                  text-xs font-semibold
                                  text-success
                                  transition
                                  hover:bg-accent
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                "
                              >
                                {updatingId ===
                                  profile.id ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <ShieldCheck
                                    size={12}
                                  />
                                )}

                                Activate
                              </button>
                            ) : (
                              /* SUSPEND */

                              <button
                                onClick={() =>
                                  updateProfileStatus(
                                    profile.id,
                                    "suspended"
                                  )
                                }
                                disabled={
                                  updatingId ===
                                  profile.id
                                }
                                title="Suspend profile"
                                className="
                                  flex h-8 items-center
                                  justify-center gap-1.5
                                  rounded-lg
                                  border border-red-200
                                  bg-red-50
                                  px-2.5
                                  text-xs font-semibold
                                  text-red-700
                                  transition
                                  hover:bg-red-100
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                "
                              >
                                {updatingId ===
                                  profile.id ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Ban
                                    size={12}
                                  />
                                )}

                                Suspend
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          </div>

          {/* ===================================================
             FOOTER
          =================================================== */}

          <div
            className="
              flex flex-col gap-3
              border-t border-line
              bg-page/50
              px-4 py-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="text-xs text-muted">
              Showing{" "}
              <span className="font-semibold text-ink">
                {totalFiltered === 0
                  ? 0
                  : `${(page - 1) * pageSize + 1}–${Math.min(
                    page * pageSize,
                    totalFiltered,
                  )}`}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-ink">
                {totalFiltered}
              </span>{" "}
              {totalFiltered === 1 ? "profile" : "profiles"}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="
                  h-8 rounded-lg
                  border border-line
                  bg-white px-2.5
                  text-xs font-medium text-ink transition
                  hover:bg-page
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              {getPageNumbers(page, totalPages).map((item, idx) => {
                if (typeof item === "string") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-xs text-muted select-none"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = item as number;
                const isActive = page === pageNum;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`
                      flex h-8 min-w-[32px] items-center justify-center
                      rounded-lg px-2 text-xs font-semibold transition
                      ${isActive
                        ? "bg-primary text-white shadow-sm"
                        : "border border-line bg-white text-ink hover:bg-page"
                      }
                      disabled:cursor-not-allowed
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="
                  h-8 rounded-lg
                  border border-line
                  bg-white px-2.5
                  text-xs font-medium text-ink transition
                  hover:bg-page
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}