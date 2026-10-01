"use client";

/* =========================================================
   SKELETON PRIMITIVES

   Every placeholder is a white block with a soft band
   sweeping left to right (see the `.skeleton` rules in
   globals.css, which also honour prefers-reduced-motion).

   Skeletons are decorative: the block itself is hidden from
   assistive tech and the surrounding region carries
   aria-busy / role="status" instead.
========================================================= */

export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton rounded-md ${className}`}
    />
  );
}

/* A line of body copy. `w` lets callers vary the run length
   so a paragraph does not look like a stack of bars. */

export function SkeletonText({
  className = "",
  w = "w-full",
}: {
  className?: string;
  w?: string;
}) {
  return <Skeleton className={`h-3 ${w} rounded ${className}`} />;
}

export function SkeletonTitle({
  className = "",
  w = "w-48",
}: {
  className?: string;
  w?: string;
}) {
  return <Skeleton className={`h-6 ${w} rounded-lg ${className}`} />;
}

export function SkeletonAvatar({
  size = "h-11 w-11",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return <Skeleton className={`${size} shrink-0 rounded-full ${className}`} />;
}

export function SkeletonButton({
  className = "",
  w = "w-28",
}: {
  className?: string;
  w?: string;
}) {
  return <Skeleton className={`h-9 ${w} rounded-lg ${className}`} />;
}

/* Generic bordered panel used where a page shows a card with
   a heading and a few lines of content. */

export function SkeletonCard({
  className = "",
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      className={`rounded-xl border border-[#E5E0D9] bg-white p-5 shadow-[0_1px_4px_rgba(21,42,71,0.025)] ${className}`}
    >
      <Skeleton className="h-4 w-36 rounded" />

      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonText
            key={index}
            w={index === lines - 1 ? "w-2/3" : "w-full"}
          />
        ))}
      </div>
    </div>
  );
}

/* Matches the icon + label + value stat cards used on the
   dashboard, projects and analytics pages. */

export function SkeletonStatCard({
  className = "",
  minHeight = "min-h-[103px]",
  helper = false,
}: {
  className?: string;
  minHeight?: string;
  helper?: boolean;
}) {
  return (
    <div
      className={`flex ${minHeight} items-center gap-4 rounded-xl border border-[#E5E0D9] bg-white px-5 py-4 shadow-[0_1px_4px_rgba(21,42,71,0.025)] ${className}`}
    >
      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonText w="w-20" className="h-2.5" />

        <Skeleton className="h-6 w-14 rounded" />

        {helper && <SkeletonText w="w-28" className="h-2" />}
      </div>
    </div>
  );
}

/* One row of a data table. `cols` are Tailwind width classes,
   so each skeleton row lines up with the real columns. */

export function SkeletonTableRow({
  cols,
  className = "",
}: {
  cols: string[];
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 ${className}`}>
      {cols.map((width, index) => (
        <SkeletonText key={index} w={width} />
      ))}
    </div>
  );
}

/* Icon + two stacked lines, for feed and list rows. */

export function SkeletonListItem({
  className = "",
  iconClass = "h-10 w-10 rounded-lg",
  trailing = null,
}: {
  className?: string;
  iconClass?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton className={`${iconClass} shrink-0`} />

      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonText w="w-2/5" />
        <SkeletonText w="w-1/4" className="h-2.5" />
      </div>

      {trailing}
    </div>
  );
}

/* Plot area plus an axis tick row. */

export function SkeletonChart({
  className = "",
  height = "h-48",
  bars = 7,
}: {
  className?: string;
  height?: string;
  bars?: number;
}) {
  return (
    <div className={className}>
      <Skeleton className={`${height} w-full rounded-xl`} />

      <div className="mt-3 flex items-center justify-between">
        {Array.from({ length: bars }).map((_, index) => (
          <Skeleton key={index} className="h-2 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

/* Wraps a loading region so screen readers announce it as
   busy rather than reading out the placeholder blocks. */

export function SkeletonRegion({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={className}
    >
      {children}
    </div>
  );
}

/* =========================================================
   SHARED CHROME

   Card shells reused by the page skeletons below, so a
   skeleton panel keeps the same border, radius and header
   rule as the real one.
========================================================= */

function PanelShell({
  children,
  header,
  className = "",
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#E5E0D9] bg-white shadow-[0_1px_4px_rgba(21,42,71,0.025)] ${className}`}
    >
      {header && (
        <div className="border-b border-[#E5E0D9] px-5 py-4">{header}</div>
      )}

      {children}
    </div>
  );
}

function PanelHeading() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-40 rounded" />
      <SkeletonText w="w-56" className="h-2.5" />
    </div>
  );
}

/* =========================================================
   PAGE SKELETONS

   One per dashboard route, mirroring that page's real
   section order and block sizes so content lands in the
   same place it was outlined.
========================================================= */

export function DashboardSkeleton() {
  return (
    <SkeletonRegion
      label="Loading dashboard"
      className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-5 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1400px]">

        {/* HEADER */}

        <div className="mb-6 space-y-2">
          <SkeletonTitle w="w-40" />
          <SkeletonText w="w-64" />
        </div>

        {/* STATS */}

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonStatCard key={index} />
          ))}
        </section>

        {/* CREATE BUTTON */}

        <Skeleton className="mb-5 h-12 w-full rounded-md" />

        {/* RECENT PROJECTS + ANALYTICS OVERVIEW */}

        <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <PanelShell header={<PanelHeading />}>
            <div className="px-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonListItem
                  key={index}
                  className={`min-h-[88px] ${
                    index !== 2 ? "border-b border-[#E5E0D9]" : ""
                  }`}
                  trailing={<Skeleton className="h-5 w-16 rounded-full" />}
                />
              ))}
            </div>
          </PanelShell>

          <PanelShell header={<PanelHeading />}>
            <div className="p-5">
              <SkeletonChart />

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#E5E0D9] pt-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <SkeletonText w="w-16" className="h-2.5" />
                    <Skeleton className="h-5 w-12 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </PanelShell>
        </section>

        {/* CATALOG OVERVIEW */}

        <PanelShell
          className="mb-5"
          header={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <PanelHeading />
              <SkeletonButton w="w-32" />
            </div>
          }
        >
          <div className="px-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <SkeletonListItem
                key={index}
                className={`min-h-[80px] ${
                  index !== 1 ? "border-b border-[#E5E0D9]" : ""
                }`}
                trailing={<Skeleton className="h-5 w-20 rounded-full" />}
              />
            ))}
          </div>
        </PanelShell>

        {/* QUICK ACTIONS */}

        <PanelShell header={<Skeleton className="h-4 w-32 rounded" />}>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        </PanelShell>

      </div>
    </SkeletonRegion>
  );
}

/* Rows only — the projects page keeps its own header,
   filters and table head visible while data loads. */

export function ProjectsRowsSkeleton() {
  return (
    <SkeletonRegion label="Loading projects" className="divide-y divide-[#E5E0D9]">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="px-5 py-4">

          {/* DESKTOP: matches the 2fr / 1.25fr / 1fr / 1fr / 1fr / 45px head */}

          <div className="hidden grid-cols-[2fr_1.25fr_1fr_1fr_1fr_45px] items-center gap-3 md:grid">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />

              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonText w="w-3/5" />
                <SkeletonText w="w-2/5" className="h-2.5" />
              </div>
            </div>

            <Skeleton className="h-6 w-28 rounded-full" />

            <Skeleton className="h-6 w-20 rounded-full" />

            <SkeletonText w="w-20" />

            <SkeletonText w="w-20" />

            <Skeleton className="h-8 w-8 justify-self-end rounded-md" />
          </div>

          {/* MOBILE */}

          <div className="md:hidden">
            <SkeletonListItem
              trailing={<Skeleton className="h-8 w-8 rounded-md" />}
            />

            <div className="mt-3 flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

        </div>
      ))}
    </SkeletonRegion>
  );
}

/* Analytics keeps its heading and date-range picker mounted,
   so this covers only the data below them. */

export function AnalyticsBodySkeleton() {
  return (
    <SkeletonRegion label="Loading analytics">

      {/* KPI CARDS */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatCard key={index} minHeight="min-h-[96px]" helper />
        ))}
      </div>

      {/* AUDIENCE ACTIVITY + PROJECT MIX */}

      <div className="mb-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
          <div className="mb-5 flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <SkeletonText w="w-64" className="h-2.5" />
            </div>
          </div>

          <SkeletonChart height="h-44" />

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#E5E0D9] pt-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonText w="w-16" className="h-2.5" />
                <Skeleton className="h-5 w-12 rounded" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
          <div className="mb-5 flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <SkeletonText w="w-40" className="h-2.5" />
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className="mb-2 flex justify-between">
                  <SkeletonText w="w-24" className="h-2.5" />
                  <SkeletonText w="w-16" className="h-2.5" />
                </div>

                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* PROJECT READINESS */}

      <section className="rounded-2xl border border-[#E5E0D9] bg-white shadow-[0_4px_20px_rgba(21,42,71,0.04)]">
        <div className="border-b border-[#E5E0D9] p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <SkeletonText w="w-72" className="h-2.5" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#E5E0D9]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <SkeletonListItem iconClass="h-9 w-9 rounded-lg" />

              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </SkeletonRegion>
  );
}

export function ProfileSkeleton() {
  return (
    <SkeletonRegion
      label="Loading profile"
      className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-5 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1100px]">

        {/* HEADER */}

        <div className="mb-6 space-y-2">
          <SkeletonTitle w="w-36" />
          <SkeletonText w="w-72" />
        </div>

        {/* PROFILE CARD */}

        <div className="overflow-hidden rounded-2xl border border-[#E5E0D9] bg-white">
          <Skeleton className="h-40 rounded-none" />

          <div className="px-6 pb-7">
            <SkeletonAvatar
              size="h-28 w-28"
              className="-mt-14 border-4 border-white"
            />

            <div className="mt-5 space-y-3">
              <Skeleton className="h-6 w-52 rounded" />
              <SkeletonText w="w-40" />
              <SkeletonText w="w-full max-w-[520px]" />
              <SkeletonText w="w-3/5 max-w-[420px]" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-9 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* CONTACT + COMPLETION */}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5">
            <Skeleton className="h-4 w-44 rounded" />

            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonText w="w-16" className="h-2.5" />
                    <SkeletonText w="w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5">
            <Skeleton className="h-4 w-40 rounded" />

            <Skeleton className="mt-5 h-2 w-full rounded-full" />

            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonText key={index} w="w-4/5" />
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <SkeletonButton w="w-28" />
              <SkeletonButton w="w-24" />
            </div>
          </div>
        </div>

      </div>
    </SkeletonRegion>
  );
}

export function SubscriptionSkeleton() {
  return (
    <SkeletonRegion
      label="Loading subscription"
      className="min-h-[calc(100vh-64px)] bg-[#FAF9F6] px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1200px]">

        <div className="mb-6 space-y-2">
          <SkeletonTitle w="w-48" />
          <SkeletonText w="w-72" />
        </div>

        {/* CURRENT PLAN + STATUS */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 rounded" />
                <SkeletonText w="w-56" />
              </div>

              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E5E0D9] pt-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonText w="w-20" className="h-2.5" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <SkeletonButton w="w-32" />
              <SkeletonButton w="w-28" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5">
            <Skeleton className="h-4 w-32 rounded" />

            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                  <SkeletonText w="w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUBSCRIPTION LIST */}

        <div className="mt-5 rounded-2xl border border-[#E5E0D9] bg-white">
          <div className="border-b border-[#E5E0D9] p-5">
            <PanelHeading />
          </div>

          <div className="divide-y divide-[#E5E0D9]">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <SkeletonListItem iconClass="h-10 w-10 rounded-lg" />

                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <SkeletonText w="w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SkeletonRegion>
  );
}

/* Payment summary tiles — the page keeps its heading and
   filters mounted while the history loads. */

export function PaymentsSummarySkeleton() {
  return (
    <SkeletonRegion
      label="Loading payment summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonStatCard key={index} minHeight="min-h-[96px]" helper />
      ))}
    </SkeletonRegion>
  );
}

export function PaymentsHistorySkeleton() {
  return (
    <SkeletonRegion
      label="Loading payment history"
      className="divide-y divide-[#E5E0D9]"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />

              <div className="space-y-2">
                <SkeletonText w="w-36" />
                <SkeletonText w="w-52 max-w-[55vw]" className="h-2.5" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <div className="space-y-2 sm:text-right">
                <Skeleton className="ml-auto h-3 w-20 rounded" />
                <Skeleton className="ml-auto h-5 w-16 rounded-full" />
              </div>

              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/* Settings keeps its page heading and section nav mounted;
   this stands in for the active panel. */

export function SettingsPanelSkeleton() {
  return (
    <SkeletonRegion label="Loading settings" className="space-y-5">

      {/* PRIMARY PANEL — fields + save */}

      <PanelShell
        header={
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-44 rounded" />
              <SkeletonText w="w-60" className="h-2.5" />
            </div>
          </div>
        }
      >
        <div className="p-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonText w="w-24" className="h-2.5" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#E5E0D9] pt-5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <SkeletonButton w="w-32" />
          </div>
        </div>
      </PanelShell>

      {/* SECONDARY PANEL — toggle rows / detail rows */}

      <PanelShell
        header={
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <SkeletonText w="w-56" className="h-2.5" />
            </div>
          </div>
        }
      >
        <div className="divide-y divide-[#E5E0D9]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonText w="w-40" />
                <SkeletonText w="w-64 max-w-full" className="h-2.5" />
              </div>

              {/* Same footprint as the real switch, so nothing
                  looks like it is mid-toggle while loading. */}
              <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </PanelShell>

      {/* DANGER ZONE */}

      <PanelShell header={<Skeleton className="h-4 w-28 rounded" />}>
        <div className="flex flex-col gap-3 p-5 sm:flex-row">
          <SkeletonButton w="w-full sm:w-32" />
          <SkeletonButton w="w-full sm:w-40" />
        </div>
      </PanelShell>

    </SkeletonRegion>
  );
}

export function SupportContactSkeleton() {
  return (
    <SkeletonRegion
      label="Loading your contact information"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonText w="w-16" className="h-2.5" />
          <SkeletonText w="w-4/5" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export function SupportTicketsSkeleton() {
  return (
    <SkeletonRegion
      label="Loading support tickets"
      className="divide-y divide-[#E5E0D9]"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-4">
          <SkeletonText w="w-24" />
          <SkeletonText w="flex-1" />
          <SkeletonText w="w-28" className="hidden sm:block" />
          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <SkeletonText w="w-24" className="hidden md:block" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/* =========================================================
   BACK-COMPAT

   Older call sites imported these names. They now render the
   white-shimmer skeletons above.
========================================================= */

export function Shimmer({ className = "" }: { className?: string }) {
  return <Skeleton className={className} />;
}

export function DashboardShimmer() {
  return <DashboardSkeleton />;
}

export function ProjectsShimmer() {
  return <ProjectsRowsSkeleton />;
}
