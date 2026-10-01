"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            LOGO
        ====================================================== */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center"
        >
          <Image
            src="/logo-transparent.png"
            alt="DigiProfilo"
            width={190}
            height={80}
            priority
            className="h-[70px] w-[160px] object-contain sm:h-[80px] sm:w-[190px]"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <nav className="hidden items-center gap-8 md:flex">
            <Link
            href="/"
            className="text-sm font-medium text-muted transition hover:text-primary"
          >
            Home
          </Link>

          {/* Features */}
          <Link
            href="/#features"
            className="text-sm font-medium text-muted transition hover:text-primary"
          >
            Features
          </Link>

          {/* About */}
          <Link
            href="/about"
            className="text-sm font-medium text-muted transition hover:text-primary"
          >
            About
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            className="text-sm font-medium text-muted transition hover:text-primary"
          >
            Contact Us
          </Link>

        </nav>

        {/* =====================================================
            DESKTOP BUTTONS
        ====================================================== */}
        <div className="hidden items-center gap-3 md:flex">

          {/* Login */}
          <Link
            href="/login"
            className="
              rounded-xl
              px-5
              py-2.5
              text-sm
              font-semibold
              text-ink
              transition
              hover:bg-page
            "
          >
            Login
          </Link>

          {/* Get Started */}
          <Link
            href="/register"
            className="
              rounded-xl
              bg-primary
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-accent
              transition
              hover:bg-primary
              hover:shadow-line
            "
          >
            Get Started
          </Link>

        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ====================================================== */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="
            rounded-lg
            p-2
            text-ink
            transition
            hover:bg-page
            md:hidden
          "
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      {open && (
        <div className="border-t border-line bg-white px-5 py-5 shadow-lg md:hidden">

          <div className="flex flex-col gap-2">

            {/* Features */}
            <Link
              href="/#features"
              onClick={closeMenu}
              className="
                rounded-lg
                px-3
                py-3
                text-sm
                font-medium
                text-ink
                transition
                hover:bg-page
                hover:text-primary
              "
            >
              Features
            </Link>

            {/* About */}
            <Link
              href="/about"
              onClick={closeMenu}
              className="
                rounded-lg
                px-3
                py-3
                text-sm
                font-medium
                text-ink
                transition
                hover:bg-page
                hover:text-primary
              "
            >
              About
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={closeMenu}
              className="
                rounded-lg
                px-3
                py-3
                text-sm
                font-medium
                text-ink
                transition
                hover:bg-page
                hover:text-primary
              "
            >
              Contact Us
            </Link>

            {/* =================================================
                MOBILE BUTTONS
            ================================================== */}
            <div className="mt-3 flex gap-3 border-t border-line pt-4">

              {/* Login */}
              <Link
                href="/login"
                onClick={closeMenu}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-line
                  py-3
                  text-center
                  text-sm
                  font-semibold
                  text-ink
                  transition
                  hover:bg-page
                "
              >
                Login
              </Link>

              {/* Register */}
              <Link
                href="/register"
                onClick={closeMenu}
                className="
                  flex-1
                  rounded-xl
                  bg-primary
                  py-3
                  text-center
                  text-sm
                  font-semibold
                  text-white
                  shadow-md
                  shadow-accent
                  transition
                  hover:bg-primary
                "
              >
                Get Started
              </Link>

            </div>

          </div>
        </div>
      )}
    </header>
  );
}