"use client";

export default function SmallSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-ink">{value}</p>
    </div>
  );
}
