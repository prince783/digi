import Link from "next/link";
import Image from "next/image";
import {
  FaLinkedinIn,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";

/* =========================================================
   SOCIAL PROFILES

   Digiprofilo has no brand social accounts wired up yet, so
   these point at the platform home pages. Swap each href for
   the real profile URL when the accounts exist.
========================================================= */

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: FaLinkedinIn },
  { label: "X", href: "https://x.com", icon: FaXTwitter },
  { label: "Instagram", href: "https://www.instagram.com", icon: FaInstagram },
  { label: "YouTube", href: "https://www.youtube.com", icon: FaYoutube },
];

/* =========================================================
   FOOTER LINK COLUMNS

   "Pricing" points at /dashboard/subscription (plans live
   behind auth; there is no public pricing page yet) and
   "Cookie Policy" at the cookies section of the privacy
   policy, which is where that content actually lives.
========================================================= */

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Cookie Policy", href: "/privacy-policy#cookies" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const BOTTOM_LINKS = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-and-conditions" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-page text-ink">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-12 sm:px-6 lg:px-8 lg:py-14">

        {/* =====================================================
            BRAND + LINK COLUMNS + SUPPORT
        ===================================================== */}

        <div
          className="
            grid grid-cols-2 gap-x-8 gap-y-10
            md:grid-cols-3
            lg:grid-cols-[1.6fr_1fr_1fr_1fr]
            lg:gap-x-12
          "
        >
          {/* BRAND */}

          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="DigiProfilo home"
            >
              <Image
                src="/logo-transparent.png"
                alt="DigiProfilo"
                width={190}
                height={80}
                className="h-12 w-auto object-contain object-left"
              />
            </Link>

            <p className="mt-4 max-w-[300px] text-sm leading-6 text-muted">
              The modern digital identity suite empowering professionals and
              businesses worldwide to connect, showcase, and grow.
            </p>

            {/* SOCIAL ICONS */}

            <div className="mt-5 flex items-center gap-2.5">
              {SOCIALS.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="
                      flex h-9 w-9 items-center justify-center rounded-lg
                      border border-line bg-white text-muted
                      transition-colors duration-200
                      hover:border-primary-light hover:bg-accent hover:text-primary
                      focus-visible:border-primary-light focus-visible:text-primary
                      focus-visible:outline-none
                    "
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* LINK COLUMNS */}

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="text-sm font-semibold text-ink">
                {column.heading}
              </h3>

              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="
                        inline-block whitespace-nowrap text-sm
                        text-muted transition-colors duration-200
                        hover:text-primary
                        focus-visible:text-primary focus-visible:outline-none
                      "
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

        </div>

        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}

        <div className="mt-10 border-t border-line pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <p className="text-xs text-muted">
              © {new Date().getFullYear()} DigiProfilo. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {BOTTOM_LINKS.map((link, index) => (
                <div key={link.label} className="flex items-center gap-x-4">
                  {index > 0 && (
                    <span aria-hidden className="text-line">
                      |
                    </span>
                  )}

                  <Link
                    href={link.href}
                    className="
                      text-xs text-muted transition-colors duration-200
                      hover:text-primary
                      focus-visible:text-primary focus-visible:outline-none
                    "
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}
