"use client";

import { useEffect, useState } from "react";

import { ProfileSkeleton } from "../components/Shimmer";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Edit3,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  profilePhoto: string;
  companyName: string;
  designation: string;
  bio: string;
  isVerified: boolean;
}

type ProfileForm = Pick<
  UserProfile,
  "name" | "phone" | "email" | "companyName" | "designation" | "bio"
>;

export default function ProfileContent({
  variant = "client",
}: {
  /** "admin" hides the client-only "My Projects" CTA, since
      admin accounts don't have projects. */
  variant?: "client" | "admin";
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    designation: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error(
            "Invalid server response. Please check the profile API route."
          );
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load profile information."
          );
        }

        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || data.user.mobile || "",
          email: data.user.email || "",
          companyName: data.user.companyName || "",
          designation: data.user.designation || "",
          bio: data.user.bio || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const openEditor = () => {
    if (!user) return;

    setForm({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      companyName: user.companyName || "",
      designation: user.designation || "",
      bio: user.bio || "",
    });
    setSaveError("");
    setEditing(true);
  };

  const updateForm = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mobile: form.phone,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setUser(data.user);
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <UserRound size={25} className="text-red-500" />
          </div>

          <h1 className="mt-5 text-lg font-bold text-[#121212]">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#77736E]">
            {error || "User profile could not be found."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E3A5F]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-3.5 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-[-0.5px] text-[#121212]">
            My Profile
          </h1>

          <p className="mt-1 text-xs text-[#77736E]">
            Manage and view your personal and professional information.
          </p>
        </div>

        {/* =====================================================
            PROFILE HERO
        ====================================================== */}
        <section className="overflow-hidden rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_8px_rgba(21,42,71,0.03)]">

          {/* Cover */}
          <div className="relative h-[130px] bg-gradient-to-r from-[#1E3A5F] via-[#1E3A5F] to-[#3D6A9C] sm:h-[175px]">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[35px] border-white" />
              <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full border-[35px] border-white" />
            </div>
          </div>

          <div className="relative px-4 pb-6 sm:px-8 sm:pb-7">

            {/* Profile Image & CTA */}
            <div className="-mt-12 flex flex-col gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#E5E0D9] shadow-md">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-[#1E3A5F]">
                    {initials}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={openEditor}
                className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[#E5E0D9] bg-white px-4 text-xs font-semibold text-[#121212] transition hover:border-[#E5E0D9] hover:bg-[#E5E0D9] hover:text-[#1E3A5F]"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            </div>

            {/* Name */}
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-[-0.4px] text-[#121212]">
                  {user.name || "User"}
                </h2>

                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF0F6] px-2.5 py-1 text-xs font-semibold text-[#7A9B7E]">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                )}
              </div>

              {user.designation && (
                <p className="mt-1 text-sm font-medium text-[#77736E]">
                  {user.designation}
                </p>
              )}

              {user.companyName && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#77736E]">
                  <Building2 size={14} />
                  {user.companyName}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            INFORMATION CARDS
        ====================================================== */}
        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Personal Information */}
          <div className="rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_8px_rgba(21,42,71,0.03)]">

            <div className="flex items-center gap-3 border-b border-[#E5E0D9] px-5 py-4 sm:px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <UserRound
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#1E3A5F]"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#121212]">
                  Personal Information
                </h3>

                <p className="mt-0.5 text-xs text-[#77736E]">
                  Your basic account information
                </p>
              </div>
            </div>

            <div className="space-y-1 px-5 py-3 sm:px-6">

              {/* Name */}
              <InfoRow
                icon={<UserRound size={17} />}
                label="Full Name"
                value={user.name || "Not provided"}
              />

              {/* Phone */}
              <InfoRow
                icon={<Phone size={17} />}
                label="Mobile Number"
                value={user.phone || "Not provided"}
              />

              {/* Email */}
              <InfoRow
                icon={<Mail size={17} />}
                label="Email Address"
                value={user.email || "Not provided"}
              />

              {/* Verification */}
              <InfoRow
                icon={<ShieldCheck size={17} />}
                label="Account Status"
                value={user.isVerified ? "Verified Account" : "Not Verified"}
                valueClass={
                  user.isVerified
                    ? "text-[#7A9B7E]"
                    : "text-[#e59a27]"
                }
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_8px_rgba(21,42,71,0.03)]">

            <div className="flex items-center gap-3 border-b border-[#E5E0D9] px-5 py-4 sm:px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
                <BriefcaseBusiness
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#1E3A5F]"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#121212]">
                  Professional Information
                </h3>

                <p className="mt-0.5 text-xs text-[#77736E]">
                  Your professional details
                </p>
              </div>
            </div>

            <div className="space-y-1 px-5 py-3 sm:px-6">

              {/* Company */}
              <InfoRow
                icon={<Building2 size={17} />}
                label="Company"
                value={user.companyName || "Not provided"}
              />

              {/* Designation */}
              <InfoRow
                icon={<BriefcaseBusiness size={17} />}
                label="Designation"
                value={user.designation || "Not provided"}
              />

              {/* Email */}
              <InfoRow
                icon={<Mail size={17} />}
                label="Professional Email"
                value={user.email || "Not provided"}
              />

              {/* Phone */}
              <InfoRow
                icon={<Phone size={17} />}
                label="Contact Number"
                value={user.phone || "Not provided"}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            ABOUT
        ====================================================== */}
        <section className="mt-5 rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_8px_rgba(21,42,71,0.03)]">

          <div className="flex items-center gap-3 border-b border-[#E5E0D9] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F6]">
              <BriefcaseBusiness
                size={18}
                strokeWidth={1.8}
                className="text-[#7A9B7E]"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#121212]">
                About Me
              </h3>

              <p className="mt-0.5 text-xs text-[#77736E]">
                Professional introduction
              </p>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            {user.bio ? (
              <p className="whitespace-pre-wrap text-xs leading-7 text-[#77736E]">
                {user.bio}
              </p>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5E0D9] bg-[#E5E0D9] px-5 py-6 text-center">
                <p className="text-xs font-medium text-[#77736E]">
                  No professional bio added yet.
                </p>

                <p className="mt-1 text-xs text-[#77736E]">
                  Add your professional information to make your profile
                  complete.
                </p>

                <button
                  type="button"
                  onClick={openEditor}
                  className="mt-4 rounded-lg bg-[#1E3A5F] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1E3A5F]"
                >
                  Add Bio
                </button>
              </div>
            )}
          </div>
        </section>

        {editing && (
          <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-ink/40 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#121212]">
                    Edit Profile
                  </h2>
                  <p className="mt-1 text-xs text-[#77736E]">
                    Update your personal and professional information.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-page"
                  aria-label="Close edit profile"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["name", "Full Name"],
                    ["phone", "Mobile Number"],
                    ["email", "Email Address"],
                    ["companyName", "Company"],
                    ["designation", "Designation"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-ink">
                      {label}
                    </span>
                    <input
                      value={form[field]}
                      onChange={(event) => updateForm(field, event.target.value)}
                      type={field === "email" ? "email" : "text"}
                      className="h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-[#1E3A5F]"
                    />
                  </label>
                ))}

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold text-ink">
                    Professional Bio
                  </span>
                  <textarea
                    value={form.bio}
                    onChange={(event) => updateForm("bio", event.target.value)}
                    maxLength={1000}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-line px-3 py-3 text-sm outline-none focus:border-[#1E3A5F]"
                  />
                  <span className="mt-1 block text-right text-xs text-muted">
                    {form.bio.length} / 1000
                  </span>
                </label>
              </div>

              {saveError && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {saveError}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="w-full sm:w-auto rounded-lg border border-line px-4 py-2.5 text-xs font-semibold text-muted text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full sm:w-auto rounded-lg bg-[#1E3A5F] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 text-center"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            ACCOUNT STATUS
        ====================================================== */}
        <section className="mt-5 rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_2px_8px_rgba(21,42,71,0.03)]">

          <div className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF0F6]">
                  <ShieldCheck
                    size={19}
                    className="text-[#1E3A5F]"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#121212]">
                    Account Verification
                  </p>

                  <p className="mt-1 text-xs text-[#77736E]">
                    Your account verification status
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${user.isVerified
                  ? "bg-[#EAF0F6] text-[#7A9B7E]"
                  : "bg-[#fff5df] text-[#d58d1e]"
                  }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${user.isVerified
                    ? "bg-[#7A9B7E]"
                    : "bg-[#e6a02e]"
                    }`}
                />

                {user.isVerified
                  ? "Account Verified"
                  : "Verification Pending"}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MY PROJECTS CTA (client accounts only — admins
            don't have a projects list)
        ====================================================== */}
        {variant === "client" && (
          <section className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] shadow-[0_4px_15px_rgba(30,58,95,0.16)]">

            <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">

              <div>
                <h3 className="text-base font-bold text-white">
                  Create Your Professional Profile
                </h3>

                <p className="mt-1.5 max-w-[600px] text-xs leading-5 text-white/80">
                  Create your digital visiting card, product catalog, resume, or biography
                  from the My Projects section.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  window.location.href = "/dashboard/projects"
                }
                className="flex h-10 w-full sm:w-auto shrink-0 items-center justify-center rounded-lg bg-white px-5 text-xs font-semibold text-[#1E3A5F] transition hover:bg-[#EAF0F6]"
              >
                Go to My Projects
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   INFO ROW COMPONENT
========================================================= */

function InfoRow({
  icon,
  label,
  value,
  valueClass = "text-[#121212]",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex min-h-[62px] items-center gap-3 border-b border-[#E5E0D9] last:border-b-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF9F6] text-[#77736E]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.3px] text-[#77736E]">
          {label}
        </p>

        <p
          className={`mt-1 truncate text-xs font-semibold ${valueClass}`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}