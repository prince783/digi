"use client";

import {
  PhoneCall,
  MessageCircle,
  Mail,
  Globe2,
  MapPin,
  Plus,
  Copy,
  LockKeyhole,
  Check,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useDigitalCard } from "../DigitalCardEditor";

export default function ActionSettings() {
  const { card, updateCard } = useDigitalCard();

  /* =====================================================
     EXTRA ACTION SETTINGS
  ===================================================== */

  const settings = card as typeof card & {
    _id?: string;
    id?: string;

    showCall?: boolean;
    showWhatsapp?: boolean;
    showEmail?: boolean;
    showWebsite?: boolean;
    showLocation?: boolean;
    showCustomButton?: boolean;

    customButtonLabel?: string;
    customButtonLink?: string;

    username?: string;

    /* OLD CARD LINK - kept for compatibility */
    cardLink?: string;

    seoVisible?: boolean;

    passwordProtection?: boolean;
    cardPassword?: string;
  };

  /* =====================================================
     CURRENT CARD ID
  ===================================================== */

  const currentCardId =
    settings._id ||
    settings.id ||
    "";

  /* =====================================================
     USERNAME STATE
  ===================================================== */

  const [username, setUsername] =
    useState<string>(
      settings.username ?? ""
    );

  const [usernameStatus, setUsernameStatus] =
    useState<
      | "idle"
      | "checking"
      | "available"
      | "taken"
      | "invalid"
    >("idle");

  const [usernameMessage, setUsernameMessage] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  /* =====================================================
     UPDATE ADDITIONAL SETTINGS
  ===================================================== */

  const setSetting = (
    key: string,
    value: unknown
  ) => {
    (
      updateCard as (
        key: string,
        value: unknown
      ) => void
    )(key, value);
  };

  /* =====================================================
     NORMALIZE USERNAME
  ===================================================== */

  const normalizeUsername = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 30);
  };

  /* =====================================================
     SYNC USERNAME WHEN CARD LOADS
  ===================================================== */

  useEffect(() => {
    const cardUsername =
      settings.username ?? "";

    setUsername(cardUsername);
  }, [settings.username]);

  /* =====================================================
     PUBLIC CARD URL
  ===================================================== */

  const getPublicCardUrl = (
    value: string
  ) => {
    if (!value) {
      return "";
    }

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    return `${origin}/digitalvisitingcard/${value}`;
  };

  const cardUrl =
    getPublicCardUrl(username);

  /* =====================================================
     USERNAME CHECK
  ===================================================== */

  useEffect(() => {
    const cleanUsername =
      normalizeUsername(username);

    /* ===================================================
       EMPTY
    =================================================== */

    if (!cleanUsername) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    /* ===================================================
       INVALID LENGTH
    =================================================== */

    if (
      cleanUsername.length < 3 ||
      cleanUsername.length > 30
    ) {
      setUsernameStatus("invalid");
      setUsernameMessage(
        "Username must be 3-30 characters."
      );
      return;
    }

    /* ===================================================
       INVALID CHARACTERS
    =================================================== */

    if (
      !/^[a-z0-9_-]{3,30}$/.test(
        cleanUsername
      )
    ) {
      setUsernameStatus("invalid");
      setUsernameMessage(
        "Only letters, numbers, hyphens and underscores are allowed."
      );
      return;
    }

    /* ===================================================
       START CHECKING
    =================================================== */

    setUsernameStatus("checking");
    setUsernameMessage(
      "Checking username..."
    );

    const controller =
      new AbortController();

    const timeout = setTimeout(
      async () => {
        try {
          /* =================================================
             BUILD API URL
          ================================================= */

          const params =
            new URLSearchParams();

          params.set(
            "username",
            cleanUsername
          );

          /*
           * IMPORTANT:
           * Send current card ID when editing.
           *
           * This allows backend to exclude the
           * current card from duplicate checking.
           */

          if (currentCardId) {
            params.set(
              "cardId",
              currentCardId
            );
          }

          const response =
            await fetch(
              `/api/digital-cards/check-username?${params.toString()}`,
              {
                method: "GET",
                signal:
                  controller.signal,
                cache: "no-store",
              }
            );

          const data =
            await response.json();

          /* =================================================
             API ERROR
          ================================================= */

          if (!response.ok) {
            setUsernameStatus(
              "invalid"
            );

            setUsernameMessage(
              data?.message ||
                "Unable to check username."
            );

            return;
          }

          /* =================================================
             USERNAME AVAILABLE
          ================================================= */

          if (data?.available === true) {
            setUsernameStatus(
              "available"
            );

            setUsernameMessage(
              "Username is available"
            );

            return;
          }

          /* =================================================
             USERNAME TAKEN
          ================================================= */

          setUsernameStatus("taken");

          setUsernameMessage(
            data?.message ||
              "Username is already taken"
          );
        } catch (error) {
          /* ===============================================
             ABORTED REQUEST
          =============================================== */

          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          console.error(
            "Username check error:",
            error
          );

          setUsernameStatus(
            "invalid"
          );

          setUsernameMessage(
            "Unable to check username."
          );
        }
      },
      500
    );

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    username,
    currentCardId,
  ]);

  /* =====================================================
     USERNAME CHANGE
  ===================================================== */

  const handleUsernameChange = (
    value: string
  ) => {
    const cleanUsername =
      normalizeUsername(value);

    setUsername(cleanUsername);

    /*
     * Immediately reset status.
     *
     * This prevents the previous
     * "available" / "taken" status
     * from showing for the new username.
     */

    if (!cleanUsername) {
      setUsernameStatus("idle");
      setUsernameMessage("");
    } else {
      setUsernameStatus("checking");
      setUsernameMessage(
        "Checking username..."
      );
    }

    setCopied(false);
  };

  /* =====================================================
     AUTO-SUGGEST USERNAME FROM BUSINESS/FULL NAME
  ===================================================== */

  const suggestSource =
    card.businessDetails?.businessName ||
    card.companyName ||
    card.fullName ||
    "";

  const suggestUsername = useCallback(
    async (force = false) => {
      const raw = (
        card.businessDetails?.businessName ||
        card.companyName ||
        card.fullName ||
        ""
      ).trim();
      if (!raw) return;
      if (username && !force) return;

      const base = normalizeUsername(
        raw.toLowerCase().replace(/\s+/g, "-")
      );
      if (base.length < 3) return;

      setUsernameStatus("checking");
      setUsernameMessage("Finding an available username...");

      for (let suffix = 0; suffix <= 99; suffix += 1) {
        const candidate = normalizeUsername(
          suffix === 0 ? base : `${base}-${suffix}`
        );
        if (candidate.length < 3 || candidate.length > 30) continue;

        try {
          const params = new URLSearchParams();
          params.set("username", candidate);
          if (currentCardId) params.set("cardId", currentCardId);

          const res = await fetch(
            `/api/digital-cards/check-username?${params.toString()}`,
            { cache: "no-store" }
          );
          const data = await res.json();
          if (res.ok && data?.available === true) {
            handleUsernameChange(candidate);
            setUsernameStatus("available");
            setUsernameMessage("Username is available");
            return;
          }
        } catch (err) {
          console.error("Auto suggest digital card username error:", err);
          break;
        }
      }
      setUsernameStatus("idle");
      setUsernameMessage("");
    },
    [card, username, currentCardId]
  );

  useEffect(() => {
    if (!settings.username && !username && suggestSource) {
      void suggestUsername(false);
    }
  }, [suggestSource, settings.username, username, suggestUsername]);

  /* =====================================================
     SAVE USERNAME (DEBOUNCED)

     Mirrors the availability-check debounce above.
     Only persists once the value is empty or a full,
     valid username — never a mid-typing fragment like
     "b" or "bi", which the server rejects as too short
     and previously surfaced as an unhandled save error
     on every keystroke.
  ===================================================== */

  useEffect(() => {
    const cleanUsername =
      normalizeUsername(username);

    if (
      cleanUsername &&
      (cleanUsername.length < 3 ||
        cleanUsername.length > 30)
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      setSetting(
        "username",
        cleanUsername
      );

      setSetting(
        "cardLink",
        cleanUsername
          ? getPublicCardUrl(
              cleanUsername
            )
          : ""
      );
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [username]);

  /* =====================================================
     COPY URL
  ===================================================== */

  const handleCopyUrl = async () => {
    if (!cardUrl) {
      return;
    }

    if (
      typeof navigator ===
        "undefined" ||
      !navigator.clipboard
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        cardUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-[20px]">
        <h1 className="text-sm font-semibold leading-[20px] text-[#121212]">
          Step 6 - Contact & Action Settings
        </h1>

        <p className="mt-[4px] text-[12px] leading-[14px] text-[#77736E]">
          Choose the actions you want to show and how
          people can connect with you.
        </p>
      </div>

      {/* ================================================= */}
      {/* PRIMARY ACTIONS */}
      {/* ================================================= */}

      <div className="mb-[20px]">
        <h2 className="text-xs font-semibold leading-[14px] text-[#121212]">
          Primary Actions
        </h2>

        <p className="mt-[3px] text-[11px] leading-[12px] text-[#77736E]">
          Select the main actions to display on your
          card.
        </p>

        <div className="mt-[12px] grid grid-cols-2 gap-x-[12px] gap-y-[12px]">
          <ActionToggle
            icon={
              <PhoneCall
                size={14}
                strokeWidth={2}
              />
            }
            label="Call"
            enabled={
              settings.showCall ?? true
            }
            onChange={(value) =>
              setSetting(
                "showCall",
                value
              )
            }
          />

          <ActionToggle
            icon={
              <MessageCircle
                size={14}
                strokeWidth={2}
              />
            }
            label="WhatsApp"
            enabled={
              settings.showWhatsapp ??
              true
            }
            onChange={(value) =>
              setSetting(
                "showWhatsapp",
                value
              )
            }
          />

          <ActionToggle
            icon={
              <Mail
                size={14}
                strokeWidth={2}
              />
            }
            label="Email"
            enabled={
              settings.showEmail ?? true
            }
            onChange={(value) =>
              setSetting(
                "showEmail",
                value
              )
            }
          />

          <ActionToggle
            icon={
              <Globe2
                size={14}
                strokeWidth={2}
              />
            }
            label="Website"
            enabled={
              settings.showWebsite ??
              true
            }
            onChange={(value) =>
              setSetting(
                "showWebsite",
                value
              )
            }
          />

          <ActionToggle
            icon={
              <MapPin
                size={14}
                strokeWidth={2}
              />
            }
            label="Location"
            enabled={
              settings.showLocation ??
              true
            }
            onChange={(value) =>
              setSetting(
                "showLocation",
                value
              )
            }
          />

          <ActionToggle
            icon={
              <Plus
                size={14}
                strokeWidth={2}
              />
            }
            label="Custom Button"
            enabled={
              settings.showCustomButton ??
              false
            }
            onChange={(value) =>
              setSetting(
                "showCustomButton",
                value
              )
            }
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* CUSTOM BUTTON SETTINGS */}
      {/* ================================================= */}

      {settings.showCustomButton && (
        <div className="mb-[20px]">
          <h2 className="text-xs font-semibold leading-[14px] text-[#121212]">
            Custom Button{" "}
            <span className="font-normal text-[#77736E]">
              (Optional)
            </span>
          </h2>

          <p className="mt-[3px] text-[11px] leading-[12px] text-[#77736E]">
            Add a custom button with your own label
            and link.
          </p>

          <div className="mt-[12px] space-y-[13px]">
            <SmallInput
              label="Button Label"
              placeholder="e.g. Book Appointment"
              value={
                settings.customButtonLabel ??
                ""
              }
              onChange={(value) =>
                setSetting(
                  "customButtonLabel",
                  value
                )
              }
            />

            <SmallInput
              label="Button Link"
              type="url"
              placeholder="https://yourlink.com"
              value={
                settings.customButtonLink ??
                ""
              }
              onChange={(value) =>
                setSetting(
                  "customButtonLink",
                  value
                )
              }
            />
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* CARD SETTINGS */}
      {/* ================================================= */}

      <div className="mb-[20px]">
        <h2 className="text-xs font-semibold leading-[14px] text-[#121212]">
          Card Settings
        </h2>

        <p className="mt-[3px] text-[11px] leading-[12px] text-[#77736E]">
          Configure your username and visibility
          settings.
        </p>

        {/* =================================================
            USERNAME
        ================================================= */}

        <div className="mt-[12px]">
          <div className="flex items-center justify-between">
            <label
              htmlFor="username"
              className="block text-[11px] font-medium leading-[10px] text-[#121212]"
            >
              Choose Your Username
            </label>
            {suggestSource && (
              <button
                type="button"
                onClick={() => void suggestUsername(true)}
                className="text-[10px] font-semibold text-[#1E3A5F] hover:underline"
              >
                ✨ Suggest from name
              </button>
            )}
          </div>

          <p className="mt-[3px] text-[10px] leading-[10px] text-[#77736E]">
            Your username will be used to create your
            digital visiting card URL.
          </p>

          {/* USERNAME INPUT */}

          <div
            className={`
              mt-[7px]
              flex
              h-[30px]
              w-full
              items-center
              overflow-hidden
              rounded-[5px]
              border
              bg-white
              transition
              ${
                usernameStatus ===
                "taken"
                  ? "border-[#ef4444]"
                  : usernameStatus ===
                    "available"
                  ? "border-[#7A9B7E]"
                  : usernameStatus ===
                    "invalid"
                  ? "border-[#ef4444]"
                  : "border-[#E5E0D9]"
              }
            `}
          >
            {/* FIXED PREFIX */}

            <div className="flex h-full shrink-0 items-center border-r border-[#E5E0D9] bg-[#E5E0D9] px-[7px]">
              <span className="text-[10px] font-medium text-[#77736E]">
                /digitalvisitingcard/
              </span>
            </div>

            {/* USERNAME */}

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                handleUsernameChange(
                  e.target.value
                )
              }
              placeholder="yourname"
              autoComplete="off"
              spellCheck={false}
              className="
                min-w-0
                flex-1
                bg-transparent
                px-[7px]
                text-[11px]
                text-[#121212]
                outline-none
                placeholder:text-[#77736E]
              "
            />

            {/* STATUS ICON */}

            <div className="mr-[7px] flex shrink-0 items-center">
              {usernameStatus ===
                "checking" && (
                <span className="h-[11px] w-[11px] animate-spin rounded-full border-2 border-[#E5E0D9] border-t-[#1E3A5F]" />
              )}

              {usernameStatus ===
                "available" && (
                <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#7A9B7E]">
                  <Check
                    size={13}
                    strokeWidth={3}
                    className="text-white"
                  />
                </div>
              )}

              {usernameStatus ===
                "taken" && (
                <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#ef4444]">
                  <X
                    size={13}
                    strokeWidth={3}
                    className="text-white"
                  />
                </div>
              )}

              {usernameStatus ===
                "invalid" && (
                <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#ef4444]">
                  <X
                    size={13}
                    strokeWidth={3}
                    className="text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* USERNAME STATUS */}

          {usernameMessage && (
            <p
              className={`
                mt-[4px]
                text-[10px]
                leading-[10px]
                ${
                  usernameStatus ===
                  "available"
                    ? "text-[#7A9B7E]"
                    : usernameStatus ===
                        "checking"
                    ? "text-[#77736E]"
                    : "text-[#ef4444]"
                }
              `}
            >
              {usernameStatus ===
                "available" && "✓ "}

              {usernameStatus ===
                "taken" && "✕ "}

              {usernameStatus ===
                "invalid" && "✕ "}

              {usernameMessage}
            </p>
          )}

          {/* =================================================
              GENERATED CARD URL
          ================================================= */}

          {username &&
            usernameStatus ===
              "available" && (
              <div className="mt-[9px]">
                <label className="block text-[11px] font-medium leading-[10px] text-[#121212]">
                  Your Card URL
                </label>

                <div className="mt-[5px] flex h-[38px] w-full items-center rounded-[5px] border border-[#E5E0D9] bg-[#E5E0D9] px-[8px]">
                  <span className="min-w-0 flex-1 truncate text-[10px] text-[#1E3A5F]">
                    {cardUrl}
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleCopyUrl
                    }
                    className="
                      ml-[5px]
                      flex
                      shrink-0
                      items-center
                      gap-[4px]
                      rounded-[4px]
                      px-[5px]
                      py-[3px]
                      text-[10px]
                      font-medium
                      text-[#1E3A5F]
                      transition
                      hover:bg-[#EAF0F6]
                    "
                  >
                    {copied ? (
                      <>
                        <Check
                          size={14}
                          strokeWidth={2.5}
                        />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy
                          size={14}
                          strokeWidth={2}
                        />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          {/* =================================================
              TAKEN MESSAGE
          ================================================= */}

          {usernameStatus ===
            "taken" && (
            <div className="mt-[8px] rounded-[5px] border border-[#fee2e2] bg-[#E5E0D9] px-[8px] py-[6px]">
              <p className="text-[10px] leading-[10px] text-[#dc2626]">
                This username is already being used.
                Please choose another username.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* SEO SETTINGS */}
      {/* ================================================= */}

      <div className="mb-[20px]">
        <h2 className="text-xs font-semibold leading-[14px] text-[#121212]">
          SEO / Search Engine Visibility
        </h2>

        <p className="mt-[3px] text-[11px] leading-[12px] text-[#77736E]">
          Do you want your card to be visible on search
          engines?
        </p>

        <div className="mt-[12px] flex gap-[25px]">
          <RadioOption
            selected={
              settings.seoVisible !==
              false
            }
            onClick={() =>
              setSetting(
                "seoVisible",
                true
              )
            }
            title="Yes, make it visible"
            subtitle="Recommended"
          />

          <RadioOption
            selected={
              settings.seoVisible ===
              false
            }
            onClick={() =>
              setSetting(
                "seoVisible",
                false
              )
            }
            title="No, keep it private"
            subtitle="Only shareable via link"
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* PASSWORD PROTECTION */}
      {/* ================================================= */}

      <div className="mb-[20px]">
        <h2 className="text-xs font-semibold leading-[14px] text-[#121212]">
          Password Protection{" "}
          <span className="font-normal text-[#77736E]">
            (Optional)
          </span>
        </h2>

        <p className="mt-[3px] text-[11px] leading-[12px] text-[#77736E]">
          Do you want to protect your card with a
          password?
        </p>

        <div className="mt-[12px]">
          <ActionToggle
            icon={
              <LockKeyhole
                size={14}
                strokeWidth={2}
              />
            }
            label="Enable Password Protection"
            enabled={
              settings.passwordProtection ??
              false
            }
            onChange={(value) =>
              setSetting(
                "passwordProtection",
                value
              )
            }
          />
        </div>

        {settings.passwordProtection && (
          <div className="mt-[13px]">
            <SmallInput
              label="Card Password"
              type="password"
              placeholder="Enter password"
              value={
                settings.cardPassword ??
                ""
              }
              onChange={(value) =>
                setSetting(
                  "cardPassword",
                  value
                )
              }
            />
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* INFORMATION BOX */}
      {/* ================================================= */}

      <div className="mt-[18px] rounded-[5px] border border-dashed border-[#E5E0D9] bg-[#E5E0D9] px-[9px] py-[8px]">
        <div className="flex items-start gap-[7px]">
          <LockKeyhole
            size={16}
            strokeWidth={2.5}
            className="mt-[1px] shrink-0 text-[#1E3A5F]"
          />

          <div>
            <p className="text-[11px] font-medium leading-[11px] text-[#77736E]">
              Configure the actions shown on your
              card.
            </p>

            <p className="mt-[2px] text-[10px] leading-[10px] text-[#77736E]">
              Only enabled actions will be visible to
              visitors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* ACTION TOGGLE */
/* ========================================================= */

function ActionToggle({
  icon,
  label,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className="
        flex
        h-[42px]
        w-full
        items-center
        justify-between
        rounded-[7px]
        border
        border-[#E5E0D9]
        bg-white
        px-[10px]
      "
    >
      <div className="flex items-center gap-[10px]">
        <div
          className={`
            flex
            h-[32px]
            w-[32px]
            items-center
            justify-center
            rounded-[6px]
            ${
              enabled
                ? "bg-[#1E3A5F] text-white"
                : "bg-[#FAF9F6] text-[#77736E]"
            }
          `}
        >
          {icon}
        </div>

        <span className="text-[12px] font-medium text-[#121212]">
          {label}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!enabled)
        }
        aria-label={`Toggle ${label}`}
        aria-pressed={enabled}
        className={`
          relative
          flex
          h-[27px]
          w-[46px]
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
        <span
          className={`
            absolute
            top-[3px]
            flex
            h-[21px]
            w-[21px]
            items-center
            justify-center
            rounded-full
            bg-white
            shadow-[0_1px_3px_rgba(18,18,18,0.18)]
            transition-transform
            duration-200
            ${
              enabled
                ? "translate-x-[22px]"
                : "translate-x-[3px]"
            }
          `}
        >
          {enabled ? (
            <Check
              size={12}
              strokeWidth={3}
              className="text-[#1E3A5F]"
            />
          ) : (
            <X
              size={12}
              strokeWidth={3}
              className="text-[#77736E]"
            />
          )}
        </span>
      </button>
    </div>
  );
}

/* ========================================================= */
/* SMALL INPUT */
/* ========================================================= */

function SmallInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium leading-[10px] text-[#121212]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="
          mt-[5px]
          h-[38px]
          w-full
          rounded-[5px]
          border
          border-[#E5E0D9]
          bg-white
          px-[8px]
          text-[11px]
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
  );
}

/* ========================================================= */
/* RADIO OPTION */
/* ========================================================= */

function RadioOption({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-[7px] text-left"
    >
      <span
        className={`
          mt-[1px]
          flex
          h-[12px]
          w-[12px]
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          ${
            selected
              ? "border-[#1E3A5F]"
              : "border-[#E5E0D9]"
          }
        `}
      >
        {selected && (
          <span className="h-[6px] w-[6px] rounded-full bg-[#1E3A5F]" />
        )}
      </span>

      <span>
        <span className="block text-[11px] font-medium leading-[10px] text-[#121212]">
          {title}
        </span>

        <span
          className={`
            mt-[2px]
            block
            text-[10px]
            leading-[10px]
            ${
              selected
                ? "text-[#1E3A5F]"
                : "text-[#77736E]"
            }
          `}
        >
          {subtitle}
        </span>
      </span>
    </button>
  );
}