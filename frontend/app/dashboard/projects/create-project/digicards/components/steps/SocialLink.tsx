"use client";

import {
  Send,
  Info,
  Check,
  X,
} from "lucide-react";

import { useDigitalCard } from "../DigitalCardEditor";

export default function SocialLink() {
  const { card, updateCard } = useDigitalCard();

  /*
   * Always use socialLinks from the card.
   * This prevents undefined errors for old MongoDB documents.
   */
  const socialLinks = card.socialLinks ?? {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    telegram: "",
    other: "",
  };

  /*
   * Social toggle states
   *
   * A social link is considered enabled when
   * a value exists.
   */
  const facebookEnabled =
    Boolean(socialLinks.facebook);

  const instagramEnabled =
    Boolean(socialLinks.instagram);

  const linkedinEnabled =
    Boolean(socialLinks.linkedin);

  const youtubeEnabled =
    Boolean(socialLinks.youtube);

  const twitterEnabled =
    Boolean(socialLinks.twitter);

  const telegramEnabled =
    Boolean(socialLinks.telegram);

  /*
   * Update one social link
   *
   * IMPORTANT:
   * We update the complete socialLinks object
   * so the other social links are NOT deleted.
   */
  const updateSocialLink = (
    field:
      | "facebook"
      | "instagram"
      | "linkedin"
      | "youtube"
      | "twitter"
      | "telegram"
      | "other",
    value: string
  ) => {
    updateCard("socialLinks", {
      ...socialLinks,
      [field]: value,
    });
  };

  /*
   * Toggle social media
   *
   * Since enabled/disabled states are not part of
   * DigitalCardData, we use the existence of the URL
   * as the enabled state.
   *
   * Turning OFF removes the saved URL.
   */
  const toggleSocial = (
    field:
      | "facebook"
      | "instagram"
      | "linkedin"
      | "youtube"
      | "twitter"
      | "telegram"
  ) => {
    const currentlyEnabled =
      Boolean(socialLinks[field]);

    updateCard("socialLinks", {
      ...socialLinks,
      [field]: currentlyEnabled
        ? ""
        : socialLinks[field],
    });
  };

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================== */}

      <div className="mb-[20px]">
        <h1 className="text-lg font-semibold leading-[24px] text-[#121212]">
          Step 3 - Social Media
        </h1>

        <p className="mt-[4px] text-[12px] leading-[17px] text-[#77736E]">
          Add your social media profiles which will be shown
          on your card.
        </p>
      </div>

      {/* =================================================
          SOCIAL MEDIA LIST
      ================================================== */}

      <div className="space-y-[20px]">

        {/* =================================================
            FACEBOOK
        ================================================== */}

        <SocialInput
          label="Facebook"
          value={socialLinks.facebook}
          placeholder="https://www.facebook.com/yourusername"
          icon={
            <span className="text-lg font-bold leading-none">
              f
            </span>
          }
          iconClassName="bg-[#1E3A5F]"
          enabled={facebookEnabled}
          onChange={(value) =>
            updateSocialLink(
              "facebook",
              value
            )
          }
          onToggle={() =>
            toggleSocial("facebook")
          }
        />

        {/* =================================================
            INSTAGRAM
        ================================================== */}

        <SocialInput
          label="Instagram"
          value={socialLinks.instagram}
          placeholder="https://www.instagram.com/yourusername"
          icon={
            <span className="text-lg font-bold leading-none">
              ◎
            </span>
          }
          iconClassName="bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#1E3A5F]"
          enabled={instagramEnabled}
          onChange={(value) =>
            updateSocialLink(
              "instagram",
              value
            )
          }
          onToggle={() =>
            toggleSocial("instagram")
          }
        />

        {/* =================================================
            LINKEDIN
        ================================================== */}

        <SocialInput
          label="LinkedIn"
          value={socialLinks.linkedin}
          placeholder="https://www.linkedin.com/in/yourusername"
          icon={
            <span className="text-[13px] font-bold leading-none">
              in
            </span>
          }
          iconClassName="bg-[#1E3A5F]"
          enabled={linkedinEnabled}
          onChange={(value) =>
            updateSocialLink(
              "linkedin",
              value
            )
          }
          onToggle={() =>
            toggleSocial("linkedin")
          }
        />

        {/* =================================================
            YOUTUBE
        ================================================== */}

        <SocialInput
          label="YouTube"
          value={socialLinks.youtube}
          placeholder="https://www.youtube.com/@yourusername"
          icon={
            <span className="text-[13px] font-bold leading-none">
              ▶
            </span>
          }
          iconClassName="bg-[#ff0000]"
          enabled={youtubeEnabled}
          onChange={(value) =>
            updateSocialLink(
              "youtube",
              value
            )
          }
          onToggle={() =>
            toggleSocial("youtube")
          }
        />

        {/* =================================================
            X / TWITTER
        ================================================== */}

        <SocialInput
          label="X (Twitter)"
          value={socialLinks.twitter}
          placeholder="https://x.com/yourusername"
          icon={
            <span className="text-lg font-bold leading-none">
              𝕏
            </span>
          }
          iconClassName="bg-ink"
          enabled={twitterEnabled}
          onChange={(value) =>
            updateSocialLink(
              "twitter",
              value
            )
          }
          onToggle={() =>
            toggleSocial("twitter")
          }
        />

        {/* =================================================
            TELEGRAM
        ================================================== */}

        <SocialInput
          label="Telegram"
          value={socialLinks.telegram}
          placeholder="https://t.me/username"
          icon={
            <Send
              size={18}
              fill="white"
              strokeWidth={2}
            />
          }
          iconClassName="bg-[#1E3A5F]"
          enabled={telegramEnabled}
          onChange={(value) =>
            updateSocialLink(
              "telegram",
              value
            )
          }
          onToggle={() =>
            toggleSocial("telegram")
          }
        />
      </div>

      {/* =================================================
          INFORMATION BOX
      ================================================== */}

      <div className="mt-[18px] rounded-[5px] border border-dashed border-[#E5E0D9] bg-[#E5E0D9] px-[12px] py-[11px]">
        <div className="flex items-start gap-[9px]">

          <Info
            size={16}
            strokeWidth={2.5}
            className="mt-[1px] shrink-0 text-[#1E3A5F]"
          />

          <div>
            <p className="text-[11px] font-medium leading-[15px] text-[#77736E]">
              Add your active social media links.
            </p>

            <p className="mt-[2px] text-[10px] leading-[13px] text-[#77736E]">
              Only added links will be visible on your card.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SOCIAL INPUT COMPONENT
========================================================= */

function SocialInput({
  label,
  value,
  placeholder,
  icon,
  iconClassName,
  enabled,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  iconClassName: string;
  enabled: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-end gap-[14px]">

      {/* ===============================================
          SOCIAL ICON
      =============================================== */}

      <div
        className={`
          mb-[1px]
          flex
          h-[34px]
          w-[34px]
          shrink-0
          items-center
          justify-center
          rounded-[7px]
          text-white
          text-base
          ${iconClassName}
        `}
      >
        {icon}
      </div>

      {/* ===============================================
          LABEL + INPUT
      =============================================== */}

      <div className="min-w-0 flex-1">

        <label className="block text-[12px] font-medium leading-[15px] text-[#121212]">
          {label}
        </label>

        <input
          type="url"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="
            mt-[6px]
            h-[38px]
            w-full
            rounded-[7px]
            border
            border-[#E5E0D9]
            bg-white
            px-[12px]
            text-[12px]
            text-[#121212]
            outline-none
            transition
            placeholder:text-[#77736E]
            focus:border-[#1E3A5F]
            focus:ring-[2px]
            focus:ring-[#1E3A5F]/10
          "
        />
      </div>

      {/* ===============================================
          TOGGLE
      =============================================== */}

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${label}`}
        aria-pressed={enabled}
        className={`
          relative
          mb-[3px]
          flex
          h-[21px]
          w-[40px]
          shrink-0
          items-center
          rounded-full
          transition-colors
          duration-200
          ${
            enabled
              ? "bg-[#1E3A5F]"
              : "bg-[#E5E0D9]"
          }
        `}
      >
        {/* Toggle Circle */}

        <span
          className={`
            absolute
            top-[2px]
            flex
            h-[17px]
            w-[17px]
            items-center
            justify-center
            rounded-full
            bg-white
            shadow-[0_1px_3px_rgba(18,18,18,0.18)]
            transition-transform
            duration-200
            ${
              enabled
                ? "translate-x-[21px]"
                : "translate-x-[2px]"
            }
          `}
        >
          {enabled ? (
            <Check
              size={10}
              strokeWidth={3}
              className="text-[#1E3A5F]"
            />
          ) : (
            <X
              size={10}
              strokeWidth={3}
              className="text-[#77736E]"
            />
          )}
        </span>
      </button>
    </div>
  );
}