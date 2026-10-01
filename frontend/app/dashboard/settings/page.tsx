"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SettingsPanelSkeleton } from "../components/Shimmer";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
} from "lucide-react";

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={enabled ? "Disable option" : "Enable option"}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        enabled ? "bg-[#1E3A5F]" : "bg-[#E5E0D9]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition ${
          enabled ? "left-[22px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  /* =========================================================
     ACCOUNT
  ========================================================= */

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     SECURITY
  ========================================================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);
  const [projectNotifications, setProjectNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);

  /* =========================================================
     PRIVACY
  ========================================================= */

  const [profileVisibility, setProfileVisibility] = useState(true);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  /* =========================================================
     UI
  ========================================================= */

  const [activeSection, setActiveSection] = useState("account");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load account details.");
        }

        setFullName(data.user.name || "");
        setEmail(data.user.email || "");
        setMobile(data.user.phone || "");
        setDesignation(data.user.designation || "");
        setCompanyName(data.user.companyName || "");
        setBio(data.user.bio || "");
        setIsVerified(Boolean(data.user.isVerified));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load account details.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  /* =========================================================
     PROJECT COUNTS
     -----------------------------------------------------
     One lightweight, session-scoped endpoint (/api/projects/
     summary) that runs three parallel countDocuments queries
     server-side — not the full digital-cards/catalogs/resumes
     documents the Dashboard -> Projects page fetches. This never
     blocks on the profile fetch (no userId dependency — the
     endpoint resolves the user from the session itself), so it
     starts loading in parallel with everything else on this page
     instead of after it.
  ========================================================= */

  const [projectCounts, setProjectCounts] = useState({
    cards: 0,
    catalogs: 0,
    resumes: 0,
  });

  const [projectCountsStatus, setProjectCountsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const loadProjectCounts = useCallback(async () => {
    setProjectCountsStatus((current) =>
      current === "ready" ? current : "loading",
    );

    try {
      const response = await fetch("/api/projects/summary", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load project summary.");
      }

      setProjectCounts({
        cards: Number(data.cards) || 0,
        catalogs: Number(data.catalogs) || 0,
        resumes: Number(data.resumes) || 0,
      });
      setProjectCountsStatus("ready");
    } catch (loadError) {
      console.error("Unable to load project counts:", loadError);
      setProjectCountsStatus("error");
    }
  }, []);

  // Fires once on mount. The ref guards against React Strict
  // Mode's dev-only double-invoke firing this twice.
  const projectCountsRequestedRef = useRef(false);

  useEffect(() => {
    if (projectCountsRequestedRef.current) return;
    projectCountsRequestedRef.current = true;
    loadProjectCounts();
  }, [loadProjectCounts]);

  // Near-real-time: revalidate when the user comes back to this
  // tab/page (e.g. after creating a project on another tab or
  // navigating back from the project wizard), instead of only
  // on first mount.
  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === "visible") {
        loadProjectCounts();
      }
    };

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);

    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, [loadProjectCounts]);

  const projectsSummary = (() => {
    if (projectCountsStatus === "loading") return "Loading…";
    if (projectCountsStatus === "error") return "Unable to load";

    const { cards, catalogs, resumes } = projectCounts;
    const total = cards + catalogs + resumes;
    const pad = (n: number) => String(n).padStart(2, "0");

    if (total === 0) return "No projects yet";

    const typesUsed = [
      cards > 0,
      catalogs > 0,
      resumes > 0,
    ].filter(Boolean).length;

    if (typesUsed > 1) {
      return `${pad(total)} ${total === 1 ? "Project" : "Projects"}`;
    }

    if (catalogs > 0) {
      return `${pad(catalogs)} ${catalogs === 1 ? "Catalog" : "Catalogs"}`;
    }

    if (cards > 0) {
      return `${pad(cards)} ${cards === 1 ? "Digital Card" : "Digital Cards"}`;
    }

    return `${pad(resumes)} ${resumes === 1 ? "Resume" : "Resumes"}`;
  })();

  const handleSave = async () => {
    setSavingProfile(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          mobile,
          designation,
          companyName,
          bio,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save account details.");
      }

      setFullName(data.user.name || "");
      setEmail(data.user.email || "");
      setMobile(data.user.phone || "");
      setDesignation(data.user.designation || "");
      setCompanyName(data.user.companyName || "");
      setBio(data.user.bio || "");
      setSaved(true);
      setMessage("Account details updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save account details.",
      );
    } finally {
      setSavingProfile(false);
    }

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      setError("Unable to logout. Please try again.");
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    // Connect your delete account API here.
    console.log("Delete account");
  };

  const sections = [
    {
      id: "account",
      title: "Account",
      description: "Personal information",
      icon: UserRound,
    },
    {
      id: "security",
      title: "Security",
      description: "Password and security",
      icon: ShieldCheck,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Email and alerts",
      icon: Bell,
    },
    {
      id: "privacy",
      title: "Privacy",
      description: "Privacy preferences",
      icon: Lock,
    },
  ];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold tracking-[-0.4px] text-[#121212]">
            Settings
          </h1>

          <p className="mt-1 text-xs text-[#77736E]">
            Manage your account, security, notifications, privacy and
            application preferences.
          </p>
        </div>

        {/* =====================================================
            MOBILE HORIZONTAL TABS (LG:HIDDEN)
        ===================================================== */}
        <div className="flex lg:hidden overflow-x-auto hide-scrollbar gap-1.5 pb-2 mb-4 border-b border-[#E5E0D9]">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-[#1E3A5F] text-white shadow-sm"
                    : "bg-white text-[#77736E] border border-[#E5E0D9] hover:bg-[#FAF9F6]"
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {section.title}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            SETTINGS LAYOUT
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[270px_1fr]">
          {/* ===================================================
              SETTINGS SIDEBAR (DESKTOP)
          =================================================== */}

          <aside className="hidden lg:block h-fit rounded-xl border border-[#E5E0D9] bg-white p-2 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition last:mb-0 ${
                    active
                      ? "bg-[#EAF0F6] text-[#1E3A5F]"
                      : "text-[#77736E] hover:bg-[#FAF9F6]"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active ? "bg-white" : "bg-[#FAF9F6]"
                    }`}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                      className={
                        active ? "text-[#1E3A5F]" : "text-[#77736E]"
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold ${
                        active
                          ? "text-[#1E3A5F]"
                          : "text-[#121212]"
                      }`}
                    >
                      {section.title}
                    </p>

                    <p className="mt-0.5 text-xs text-[#77736E]">
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Logout */}
            <div className="mt-2 border-t border-[#E5E0D9] pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-[#fff4f3]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0ef]">
                  <LogOut
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#ef6c67]"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#121212]">
                    Sign Out
                  </p>

                  <p className="mt-0.5 text-xs text-[#77736E]">
                    Sign out of your account
                  </p>
                </div>
              </button>
            </div>
          </aside>

          {/* ===================================================
              SETTINGS CONTENT
          =================================================== */}

          <div className="space-y-5">
            {loadingProfile && <SettingsPanelSkeleton />}

            {/* =================================================
                ACCOUNT SETTINGS
            ================================================= */}

            {!loadingProfile && activeSection === "account" && (
              <>
                <section className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
                  <div className="border-b border-[#E5E0D9] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                        <UserRound
                          size={18}
                          strokeWidth={1.8}
                          className="text-[#1E3A5F]"
                        />
                      </div>

                      <div>
                        <h2 className="text-base font-semibold text-[#121212]">
                          Account Information
                        </h2>

                        <p className="mt-0.5 text-xs text-[#77736E]">
                          Update your basic account information.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#121212]">
                        Full Name
                      </label>

                      <div className="relative">
                        <UserRound
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        />

                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-[42px] w-full rounded-lg border border-[#E5E0D9] bg-white pl-10 pr-3 text-xs text-[#121212] outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#121212]">
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-[42px] w-full rounded-lg border border-[#E5E0D9] bg-white pl-10 pr-3 text-xs text-[#121212] outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10"
                        />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#121212]">
                        Mobile Number
                      </label>

                      <div className="relative">
                        <Smartphone
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        />

                        <input
                          type="text"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          className="h-[42px] w-full rounded-lg border border-[#E5E0D9] bg-white pl-10 pr-3 text-xs text-[#121212] outline-none transition focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10"
                        />
                      </div>
                    </div>

                    {/* Account Status */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#121212]">
                        Account Status
                      </label>

                      <div className="flex h-[42px] items-center gap-2 rounded-lg border border-[#E5E0D9] bg-[#E5E0D9] px-3">
                        <span className="h-2 w-2 rounded-full bg-[#7A9B7E]" />

                        <span className="text-xs font-semibold text-[#7A9B7E]">
                          {loadingProfile ? "Loading..." : "Active"}
                        </span>

                        <span className="ml-auto text-xs text-[#77736E]">
                          {isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-[#E5E0D9] px-5 py-4">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loadingProfile || savingProfile}
                      className="flex h-[38px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-4 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saved ? (
                        <Check size={15} />
                      ) : (
                        <Save size={15} />
                      )}

                      {savingProfile ? "Saving..." : saved ? "Saved" : "Save Changes"}
                    </button>
                  </div>
                  {(message || error) && (
                    <p className={`px-5 pb-4 text-xs font-medium ${error ? "text-red-600" : "text-success"}`}>
                      {error || message}
                    </p>
                  )}
                </section>

                {/* Account Information */}
                <section className="rounded-xl border border-[#E5E0D9] bg-white p-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
                  <h3 className="text-sm font-semibold text-[#121212]">
                    Account Details
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-[#FAF9F6] p-4">
                      <p className="text-xs text-[#77736E]">
                        Account Type
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#121212]">
                        User Account
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#FAF9F6] p-4">
                      <p className="text-xs text-[#77736E]">
                        Verification
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#7A9B7E]">
                        Verified
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#FAF9F6] p-4">
                      <p className="text-xs text-[#77736E]">
                        Projects
                      </p>

                      {projectCountsStatus === "error" ? (
                        <button
                          type="button"
                          onClick={loadProjectCounts}
                          className="mt-1 text-xs font-semibold text-[#1E3A5F] underline underline-offset-2"
                        >
                          {projectsSummary} — Retry
                        </button>
                      ) : (
                        <p className="mt-1 text-xs font-semibold text-[#121212]">
                          {projectsSummary}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* =================================================
                SECURITY
            ================================================= */}

            {!loadingProfile && activeSection === "security" && (
              <section className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
                <div className="border-b border-[#E5E0D9] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                      <ShieldCheck
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#7A9B7E]"
                      />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-[#121212]">
                        Security Settings
                      </h2>

                      <p className="mt-0.5 text-xs text-[#77736E]">
                        Keep your account secure.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-5 rounded-lg border border-[#E5E0D9] bg-[#E5E0D9] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 text-[#7A9B7E]"
                      />

                      <div>
                        <p className="text-xs font-semibold text-[#121212]">
                          Your account is protected
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#77736E]">
                          Your account verification is active. Keep your
                          password private and never share verification
                          codes with anyone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-4 text-xs font-semibold text-[#121212]">
                    Change Password
                  </h3>

                  <div className="space-y-4">
                    {/* Current */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#121212]">
                        Current Password
                      </label>

                      <div className="relative">
                        <KeyRound
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        />

                        <input
                          type={
                            showCurrentPassword ? "text" : "password"
                          }
                          value={currentPassword}
                          onChange={(e) =>
                            setCurrentPassword(e.target.value)
                          }
                          className="h-[42px] w-full rounded-lg border border-[#E5E0D9] pl-10 pr-10 text-xs outline-none focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(
                              !showCurrentPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#121212]">
                        New Password
                      </label>

                      <div className="relative">
                        <KeyRound
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        />

                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(e.target.value)
                          }
                          className="h-[42px] w-full rounded-lg border border-[#E5E0D9] pl-10 pr-10 text-xs outline-none focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(!showNewPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        >
                          {showNewPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#121212]">
                        Confirm New Password
                      </label>

                      <div className="relative">
                        <KeyRound
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        />

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          className="h-[42px] w-full rounded-lg border border-[#E5E0D9] pl-10 pr-10 text-xs outline-none focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736E]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex h-[38px] items-center gap-2 rounded-lg bg-[#1E3A5F] px-4 text-xs font-semibold text-white transition hover:bg-[#1E3A5F]"
                    >
                      <Save size={15} />
                      Update Password
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {!loadingProfile && activeSection === "notifications" && (
              <section className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
                <div className="border-b border-[#E5E0D9] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff5df]">
                      <Bell
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#e6a02b]"
                      />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-[#121212]">
                        Notification Preferences
                      </h2>

                      <p className="mt-0.5 text-xs text-[#77736E]">
                        Choose which notifications you want to receive.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#E5E0D9] px-5">
                  <div className="flex items-center justify-between gap-5 py-5">
                    <div>
                      <p className="text-xs font-semibold text-[#121212]">
                        Email Notifications
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        Receive important account updates by email.
                      </p>
                    </div>

                    <Toggle
                      enabled={emailNotifications}
                      onChange={() =>
                        setEmailNotifications(!emailNotifications)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-5 py-5">
                    <div>
                      <p className="text-xs font-semibold text-[#121212]">
                        Payment Notifications
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        Get notified about payments, invoices and renewals.
                      </p>
                    </div>

                    <Toggle
                      enabled={paymentNotifications}
                      onChange={() =>
                        setPaymentNotifications(
                          !paymentNotifications
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-5 py-5">
                    <div>
                      <p className="text-xs font-semibold text-[#121212]">
                        Project Notifications
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        Receive updates related to your projects.
                      </p>
                    </div>

                    <Toggle
                      enabled={projectNotifications}
                      onChange={() =>
                        setProjectNotifications(
                          !projectNotifications
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-5 py-5">
                    <div>
                      <p className="text-xs font-semibold text-[#121212]">
                        Product & Marketing
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        Receive product updates, offers and announcements.
                      </p>
                    </div>

                    <Toggle
                      enabled={marketingNotifications}
                      onChange={() =>
                        setMarketingNotifications(
                          !marketingNotifications
                        )
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                PRIVACY
            ================================================= */}

            {!loadingProfile && activeSection === "privacy" && (
              <section className="rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
                <div className="border-b border-[#E5E0D9] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                      <Lock
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#7A9B7E]"
                      />
                    </div>

                    <div>
                      <h2 className="text-base font-semibold text-[#121212]">
                        Privacy Settings
                      </h2>

                      <p className="mt-0.5 text-xs text-[#77736E]">
                        Control your profile visibility and data preferences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#E5E0D9] px-5">
                  <div className="flex items-center justify-between gap-5 py-5">
                    <div>
                      <p className="text-xs font-semibold text-[#121212]">
                        Public Profile
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        Allow your published professional profile to be
                        viewed publicly.
                      </p>
                    </div>

                    <Toggle
                      enabled={profileVisibility}
                      onChange={() =>
                        setProfileVisibility(!profileVisibility)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between gap-5 py-5">
                    <div>
                      <p className="text-xs font-semibold text-[#121212]">
                        Analytics Tracking
                      </p>

                      <p className="mt-1 text-xs text-[#77736E]">
                        Allow anonymous usage data to improve the platform.
                      </p>
                    </div>

                    <Toggle
                      enabled={analyticsTracking}
                      onChange={() =>
                        setAnalyticsTracking(!analyticsTracking)
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                DANGER ZONE
            ================================================= */}

            <section className="rounded-xl border border-[#f3d8d5] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)]">
              <div className="border-b border-[#f3e1df] bg-[#E5E0D9] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0ef]">
                    <Trash2
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#ef6c67]"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#b64d47]">
                      Danger Zone
                    </h2>

                    <p className="mt-0.5 text-xs text-[#77736E]">
                      Irreversible account actions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#f4e5e3]">
                {/* Sign Out */}
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#121212]">
                      Sign out from this account
                    </p>

                    <p className="mt-1 text-xs text-[#77736E]">
                      You will need to sign in again to access your
                      dashboard.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-[37px] shrink-0 items-center justify-center gap-2 rounded-lg border border-[#e9bdb9] px-4 text-xs font-semibold text-[#c0524b] transition hover:bg-[#FAF9F6]"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>

                {/* Delete */}
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#121212]">
                      Delete Account
                    </p>

                    <p className="mt-1 max-w-[600px] text-xs leading-5 text-[#77736E]">
                      Permanently delete your account and associated
                      data. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="flex h-[37px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ef6c67] px-4 text-xs font-semibold text-white transition hover:bg-[#db5d58]"
                  >
                    <Trash2 size={15} />
                    Delete Account
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                SAVE BAR
            ================================================= */}

            <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E0D9] bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(21,42,71,0.10)] backdrop-blur">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF0F6]">
                  <ShieldCheck
                    size={14}
                    className="text-[#1E3A5F]"
                  />
                </div>

                <p className="text-xs text-[#77736E]">
                  Your settings are saved securely.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="ml-auto flex h-[38px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] px-5 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(30,58,95,0.18)] transition hover:from-[#1E3A5F] hover:to-[#1E3A5F]"
              >
                {saved ? <Check size={15} /> : <Save size={15} />}

                {saved ? "Changes Saved" : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}