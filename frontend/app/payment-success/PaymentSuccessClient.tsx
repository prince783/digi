"use client";

import {
  Check,
  Copy,
  Download,
  Eye,
  FolderOpen,
  LayoutDashboard,
  Pencil,
  QrCode,
  Share2,
} from "lucide-react";

import { useState } from "react";

import Link from "next/link";

interface Props {
  card: any;
}

export default function PaymentSuccessClient({
  card,
}: Props) {
  const [copied, setCopied] =
    useState(false);

  const username =
    card.username || "your-card";

  const cardLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/digitalvisitingcard/${username}`
      : `/digitalvisitingcard/${username}`;

  const cardName =
    card.name ||
    card.fullName ||
    "Your Name";

  const designation =
    card.designation ||
    card.jobTitle ||
    "Your Designation";

  const company =
    card.company ||
    card.companyName ||
    "Your Company";

  /*
   * 1 year validity
   */

  const validUntil =
    new Date(
      card.paidAt || new Date()
    );

  validUntil.setFullYear(
    validUntil.getFullYear() + 1
  );

  const validDate =
    validUntil.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  /*
   * Copy card link
   */

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        cardLink
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Share card
   */

  const shareCard = async () => {
    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            `${cardName} - Digital Visiting Card`,
          text:
            `View ${cardName}'s digital visiting card`,
          url: cardLink,
        });
      } else {
        await copyLink();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      {/* HEADER */}

      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3D6A9C] to-[#1E3A5F] text-white font-bold">
              SF
            </div>

            <div>
              <div className="text-base font-bold leading-none text-ink">
                DigiProfilo
              </div>

              <div className="text-[9px] font-semibold tracking-[1.5px] text-muted">
                TECHNOLOGIES
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-xs font-semibold text-ink hover:bg-page"
          >
            <LayoutDashboard
              size={14}
            />

            Go to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1000px] px-4 py-10">
        {/* SUCCESS */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success shadow-lg shadow-accent">
            <Check
              size={35}
              strokeWidth={3}
              className="text-white"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-success">
            Payment Successful!
          </h1>

          <p className="mt-2 text-sm text-muted">
            Congratulations! Your Digital
            Visiting Card is now LIVE.
          </p>
        </div>

        {/* CARD INFORMATION */}

        <div className="mt-8 grid gap-5 md:grid-cols-[1fr_1fr]">
          {/* DIGITAL CARD */}

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-bold text-ink">
              Your Digital Card
            </h2>

            <div className="flex justify-center">
              <div
                className="relative h-[330px] w-[220px] overflow-hidden rounded-[24px] border-[4px] border-ink shadow-xl"
                style={{
                  background:
                    card.backgroundColor ||
                    "#152A47",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-ink/20" />

                <div className="relative flex h-full flex-col items-center px-5 pt-10 text-center text-white">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-xl font-bold text-ink shadow-lg">
                    {card.profileImage ||
                    card.profilePhoto ||
                    card.image ? (
                      <img
                        src={
                          card.profileImage ||
                          card.profilePhoto ||
                          card.image
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      cardName
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {cardName}
                  </h3>

                  <p className="mt-1 text-xs opacity-80">
                    {designation}
                  </p>

                  <p className="mt-1 text-xs opacity-70">
                    {company}
                  </p>

                  <div className="mt-6 h-px w-28 bg-white/70" />

                  <p className="mt-4 text-xs opacity-80">
                    Digital Visiting Card
                  </p>

                  <div className="mt-auto mb-7 flex gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1E3A5F]">
                      ☎
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1E3A5F]">
                      ✉
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1E3A5F]">
                      ◉
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS */}

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">
                Card Status
              </h2>

              <span className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-success">
                Active
              </span>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <p className="text-xs text-muted">
                  Valid Until
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">
                  {validDate}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Your Card Link
                </p>

                <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-page p-3">
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#1E3A5F]">
                    {cardLink}
                  </span>

                  <button
                    type="button"
                    onClick={
                      copyLink
                    }
                    className="shrink-0 text-muted hover:text-ink"
                  >
                    {copied ? (
                      <Check
                        size={15}
                      />
                    ) : (
                      <Copy
                        size={15}
                      />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-muted">
                  Share your card link
                  with anyone.
                </p>
              </div>

              {/* QR */}

              <div>
                <div className="flex items-center gap-2">
                  <QrCode
                    size={15}
                    className="text-[#1E3A5F]"
                  />

                  <p className="text-xs font-semibold text-ink">
                    QR Code
                  </p>
                </div>

                <img
                  src={`/api/qr/card/${card._id}`}
                  alt="QR code for your digital card"
                  className="mt-3 h-28 w-28 border border-line bg-white object-cover"
                />

                <p className="mt-2 text-xs text-muted">
                  Scan to view your
                  card.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/digitalvisitingcard/${username}`}
            target="_blank"
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-4 text-xs font-semibold text-ink shadow-sm hover:bg-page"
          >
            <Eye
              size={16}
              className="text-[#1E3A5F]"
            />

            View My Card
          </Link>

          <button
            type="button"
            onClick={shareCard}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-4 text-xs font-semibold text-ink shadow-sm hover:bg-page"
          >
            <Share2
              size={16}
              className="text-[#1E3A5F]"
            />

            Share Card
          </button>

          <a
            href={`/api/qr/card/${card._id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-4 text-xs font-semibold text-ink shadow-sm hover:bg-page"
          >
            <Download
              size={16}
              className="text-[#1E3A5F]"
            />

            Download QR
          </a>

          <button
            type="button"
            onClick={() => {
              alert(
                "Add to Wallet can be connected later."
              );
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-4 text-xs font-semibold text-ink shadow-sm hover:bg-page"
          >
            <FolderOpen
              size={16}
              className="text-[#1E3A5F]"
            />

            Add to Wallet
          </button>
        </div>

        {/* UPGRADE */}

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#1E3A5F] to-[#1E3A5F] p-5 text-white">
          <div>
            <p className="text-sm font-bold">
              Want More Power?
            </p>

            <p className="mt-1 text-xs text-white/80">
              Upgrade your plan and unlock
              premium templates, custom
              domains and analytics.
            </p>
          </div>

          <button className="rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-[#1E3A5F]">
            Upgrade Now
          </button>
        </div>

        {/* WHAT'S NEXT */}

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-bold text-ink">
            What's Next?
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href={`/dashboard/projects/create-project/digicards?edit=${card._id}`}
              className="rounded-xl border border-line bg-white p-4 shadow-sm hover:bg-page"
            >
              <Pencil
                size={18}
                className="text-[#1E3A5F]"
              />

              <p className="mt-3 text-xs font-bold text-ink">
                Edit Card
              </p>

              <p className="mt-1 text-xs text-muted">
                Make changes anytime
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-line bg-white p-4 shadow-sm hover:bg-page"
            >
              <LayoutDashboard
                size={18}
                className="text-[#1E3A5F]"
              />

              <p className="mt-3 text-xs font-bold text-ink">
                Analytics
              </p>

              <p className="mt-1 text-xs text-muted">
                Track views & clicks
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-line bg-white p-4 shadow-sm hover:bg-page"
            >
              <FolderOpen
                size={18}
                className="text-[#1E3A5F]"
              />

              <p className="mt-3 text-xs font-bold text-ink">
                My Projects
              </p>

              <p className="mt-1 text-xs text-muted">
                Manage all cards
              </p>
            </Link>
          </div>
        </div>

        {/* DASHBOARD */}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E3A5F]"
          >
            Go to Dashboard

            <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}