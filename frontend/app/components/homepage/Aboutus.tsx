"use client";

import Link from "next/link";
import CTA from "./CTA";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Link2,
  MonitorSmartphone,
  Palette,
  Share2,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

export default function About() {
  return (
    <section className="bg-white text-ink">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent via-white to-white">

        {/* Background decorations */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">

          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm">
              <Sparkles size={16} />
              About Our Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Your Identity.
              <span className="block bg-gradient-to-r from-primary via-primary to-primary-light bg-clip-text text-transparent">
                Your Story. Your Profile.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted sm:text-lg">
              At DigiProfilo, our mission is to empower professionals, creators,
              and growing businesses with modern digital presence tools. We
              replace static paper cards and fragmented links with unified,
              interactive digital identities that build credibility and open new
              opportunities.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/register"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary
                  px-7
                  py-3.5
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
                Create Your Profile
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/contact"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-line
                  bg-white
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-ink
                  shadow-sm
                  transition
                  hover:border-line
                  hover:bg-accent
                  hover:text-primary
                "
              >
                Contact Us
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          INTRODUCTION
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">

        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          {/* LEFT */}
          <div>

            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-px w-8 bg-primary" />
              Who We Are
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              A Smarter Way to Build Your
              <span className="block text-primary">
                Digital Identity
              </span>
            </h2>

            <p className="mt-6 text-base leading-8 text-muted">
              Your professional identity is more than just a name and phone
              number. It is your experience, your skills, your story, and the
              way you present yourself to the world.
            </p>

            <p className="mt-4 text-base leading-8 text-muted">
              Our platform gives you the tools to create a complete digital
              profile without needing to build a website or manage complicated
              technology. Everything you need can be managed from one simple
              dashboard.
            </p>

            <p className="mt-4 text-base leading-8 text-muted">
              Whether you are a professional, business owner, freelancer,
              student, creator, consultant, or job seeker, you can create a
              profile that represents you and share it whenever and wherever
              you need.
            </p>

          </div>

          {/* RIGHT - PRODUCT VISUAL */}
          <div className="relative">

            <div className="absolute -inset-5 rounded-3xl bg-gradient-to-r from-accent to-accent blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-2xl shadow-line/70">

              {/* Fake dashboard header */}
              <div className="border-b border-line bg-page px-6 py-4">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="h-9 w-9 rounded-lg bg-primary" />

                    <div>
                      <div className="h-2.5 w-24 rounded-full bg-line" />
                      <div className="mt-2 h-2 w-16 rounded-full bg-line" />
                    </div>

                  </div>

                  <div className="h-8 w-8 rounded-full bg-line" />

                </div>

              </div>

              {/* Dashboard body */}
              <div className="p-6">

                <div className="grid grid-cols-3 gap-3">

                  <DashboardCard
                    icon={<UserRound size={18} />}
                    title="Profile"
                    color="indigo"
                  />

                  <DashboardCard
                    icon={<FileText size={18} />}
                    title="Resume"
                    color="sky"
                  />

                  <DashboardCard
                    icon={<BarChart3 size={18} />}
                    title="Analytics"
                    color="emerald"
                  />

                </div>

                <div className="mt-5 rounded-2xl border border-line bg-page p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-medium text-muted">
                        Digital Profile
                      </p>

                      <p className="mt-1 text-lg font-bold text-ink">
                        Your Name
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
                      <UserRound size={20} />
                    </div>

                  </div>

                  <div className="mt-5 space-y-3">

                    <div className="h-2.5 w-full rounded-full bg-line" />

                    <div className="h-2.5 w-4/5 rounded-full bg-line" />

                    <div className="h-2.5 w-3/5 rounded-full bg-line" />

                  </div>

                  <div className="mt-5 flex gap-2">

                    <div className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-primary">
                      <Link2 size={13} />
                      Share Profile
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-page px-3 py-2 text-xs font-medium text-muted">
                      <BarChart3 size={13} />
                      Analytics
                    </div>

                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          WHAT YOU CAN CREATE
      ====================================================== */}
      <section className="bg-page">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Everything In One Place
            </p>

            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
              Build More Than Just a Profile
            </h2>

            <p className="mt-4 leading-7 text-muted">
              Create and manage the important parts of your professional
              identity from one powerful and easy-to-use platform.
            </p>

          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <ProductCard
              icon={<MonitorSmartphone size={24} />}
              title="Digital Visiting Card"
              description="Create an interactive digital visiting card you can share via QR code or contactless link."
              color="indigo"
            />

            <ProductCard
              icon={<ShoppingBag size={24} />}
              title="Product Catalog"
              description="Showcase your products, services, and pricing with instant WhatsApp order inquiries."
              color="sky"
            />

            <ProductCard
              icon={<BriefcaseBusiness size={24} />}
              title="Professional Resume"
              description="Build and host a modern, ATS-friendly digital CV highlighting your career expertise."
              color="emerald"
            />

            <ProductCard
              icon={<BookOpen size={24} />}
              title="Biography & Profile"
              description="Tell your career story with a personal brand biography and custom portfolio links."
              color="purple"
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          HOW IT HELPS
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

          {/* LEFT */}
          <div>

            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-px w-8 bg-primary" />
              Why We Built It
            </div>

            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              Your Professional Identity
              <span className="block text-primary-light">
                Should Be Easy to Share
              </span>
            </h2>

            <p className="mt-5 leading-8 text-muted">
              Traditional visiting cards can get lost. Resumes can become
              outdated. Important information can be scattered across
              different platforms.
            </p>

            <p className="mt-4 leading-8 text-muted">
              We wanted to bring everything together into a single digital
              identity that you can update whenever you want and share with
              just one link.
            </p>

          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            <Benefit
              icon={<Share2 size={21} />}
              title="Share Instantly"
              text="Share your digital profile through a simple link, QR code, or wherever you connect with people."
            />

            <Benefit
              icon={<Palette size={21} />}
              title="Look Professional"
              text="Present your information in a clean and modern format designed to create a strong first impression."
            />

            <Benefit
              icon={<BarChart3 size={21} />}
              title="Understand Your Reach"
              text="Use dashboard insights to understand how your digital profile is being viewed and shared."
            />

            <Benefit
              icon={<Link2 size={21} />}
              title="One Link, Everything"
              text="Bring your visiting cards, product catalogs, professional resumes, personal biographies, and contact details together."
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          VALUES
      ====================================================== */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary-light">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">

          <div className="mx-auto max-w-3xl text-center text-white">

            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Our Approach
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Simple. Professional. Personal.
            </h2>

            <p className="mt-4 leading-7 text-accent">
              We believe technology should simplify the way you present
              yourself, not make it more complicated.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <ValueCard
              icon={<Sparkles size={24} />}
              title="Simple"
              text="Everything is designed to be easy to understand and simple to manage."
            />

            <ValueCard
              icon={<Users size={24} />}
              title="Personal"
              text="Your profile belongs to you. Customize it to reflect your personality, career, and story."
            />

            <ValueCard
              icon={<CheckCircle2 size={24} />}
              title="Professional"
              text="Create a polished digital presence that you can confidently share with clients and connections."
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="mx-auto max-w-7xl lg:px-8 lg:py-24">
        <CTA />
      </section>

    </section>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

type DashboardCardColor =
  | "indigo"
  | "sky"
  | "emerald";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  color: DashboardCardColor;
}

function DashboardCard({
  icon,
  title,
  color,
}: DashboardCardProps) {
  const colors: Record<
    DashboardCardColor,
    string
  > = {
    indigo:
      "bg-accent text-primary",
    sky:
      "bg-accent text-primary",
    emerald:
      "bg-accent text-success",
  };

  return (
    <div className="rounded-xl border border-line bg-white p-3 shadow-sm">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[color]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-xs font-semibold text-ink">
        {title}
      </p>

    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

type ProductCardColor =
  | "indigo"
  | "sky"
  | "purple"
  | "emerald";

interface ProductCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: ProductCardColor;
}

function ProductCard({
  icon,
  title,
  description,
  color,
}: ProductCardProps) {
  const colors: Record<
    ProductCardColor,
    string
  > = {
    indigo:
      "bg-accent text-primary",
    sky:
      "bg-accent text-primary",
    purple:
      "bg-accent text-primary",
    emerald:
      "bg-accent text-success",
  };

  return (
    <div
      className="
        rounded-2xl
        border
        border-line
        bg-white
        p-6
        shadow-sm
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}
      >
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-ink">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

interface BenefitProps {
  icon: ReactNode;
  title: string;
  text: string;
}

function Benefit({
  icon,
  title,
  text,
}: BenefitProps) {
  return (
    <div
      className="
        flex
        gap-4
        rounded-2xl
        border
        border-line
        bg-white
        p-5
        shadow-sm
        transition
        hover:border-line
        hover:shadow-md
      "
    >

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        {icon}
      </div>

      <div>

        <h3 className="font-bold text-ink">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-muted">
          {text}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   VALUE CARD
========================================================= */

interface ValueCardProps {
  icon: ReactNode;
  title: string;
  text: string;
}

function ValueCard({
  icon,
  title,
  text,
}: ValueCardProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/10
        p-7
        backdrop-blur-sm
        transition
        hover:bg-white/15
      "
    >

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-accent">
        {text}
      </p>

    </div>
  );
}