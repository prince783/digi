"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Eye,
  Share2,
  ExternalLink,
} from "lucide-react";

export default function AdminProfileDetailsPage() {
  const params = useParams();

  const id = params.id;

  const [profile, setProfile] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response =
          await fetch(
            `/api/admin/profiles/${id}`
          );

        const data =
          await response.json();

        if (data.success) {
          setProfile(
            data.profile
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 py-20 text-center sm:px-6 lg:px-8">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 py-20 text-center sm:px-6 lg:px-8">
        Profile not found
      </div>
    );
  }

  function formatDate(
    date?: string
  ) {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
      <Link
        href="/admin/profiles"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"
      >
        <ArrowLeft size={17} />

        Back to Profiles
      </Link>

      {/* PROFILE HEADER */}

      <div className="rounded-2xl border border-line bg-white p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4 sm:gap-5">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.fullName}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-primary sm:h-24 sm:w-24 sm:text-3xl">
                {profile.fullName
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-ink sm:text-3xl">
                {profile.fullName}
              </h1>

              <p className="mt-1 text-muted">
                {profile.designation}
              </p>

              <p className="mt-1 text-sm text-primary">
                @{profile.username}
              </p>
            </div>
          </div>

          <a
            href={profile.publicUrl}
            target="_blank"
            className="inline-flex h-fit items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary md:w-fit"
          >
            <ExternalLink size={17} />

            View Public Profile
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-lg text-ink font-bold">
              Contact Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Info
                icon={<Phone size={18} />}
                label="Mobile"
                value={profile.mobile}
              />

              <Info
                icon={<Mail size={18} />}
                label="Email"
                value={profile.email}
              />

              <Info
                icon={<Globe size={18} />}
                label="Website"
                value={profile.website}
              />

              <Info
                icon={<MapPin size={18} />}
                label="Address"
                value={profile.address}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-lg text-ink font-bold">
              Profile Analytics
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div className="rounded-xl bg-page p-5">
                <Eye className="text-primary" />

                <p className="mt-4 text-sm text-muted">
                  Total Views
                </p>

                <p className="text-3xl  text-ink font-bold">
                  {profile.views || 0}
                </p>
              </div>

              <div className="rounded-xl bg-page p-5">
                <Share2 className="text-primary" />

                <p className="mt-4 text-sm text-muted">
                  Total Shares
                </p>

                <p className="text-3xl text-ink font-bold">
                  {profile.shares || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg  text-ink font-bold">
            Subscription Details
          </h2>

          <div className="mt-6 space-y-5">
            <Info
              icon={<Calendar size={18} />}
              label="Registration Date"
              value={formatDate(
                profile.createdAt
              )}
            />

            <Info
              icon={<Calendar size={18} />}
              label="Payment Date"
              value={formatDate(
                profile.paymentDate
              )}
            />

            <Info
              icon={<Calendar size={18} />}
              label="Subscription Start"
              value={formatDate(
                profile.subscriptionStart
              )}
            />

            <div>
              <p className="text-xs text-muted">
                Subscription Status
              </p>

              {(() => {
                const s = (profile.subscriptionStatus || "Pending").toLowerCase();
                const badgeClass =
                  s === "active"
                    ? "bg-accent text-success border border-line"
                    : s === "suspended"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : s === "expired"
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200";

                return (
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                    {profile.subscriptionStatus || "Pending"}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-primary">
        {icon}
      </div>

      <div>
        <p className="text-xs text-muted">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-medium text-ink">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}