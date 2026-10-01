"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  activeClassName?: string;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  className = "",
  activeClassName = "border-current bg-current/15 font-bold",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className={`mt-10 flex items-center justify-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-9 min-w-9 items-center justify-center rounded-full border border-current/20 px-3 text-xs font-medium disabled:opacity-30"
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`flex h-9 min-w-9 items-center justify-center rounded-full border border-current/20 px-3 text-xs font-medium ${
            p === page ? activeClassName : ""
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-9 min-w-9 items-center justify-center rounded-full border border-current/20 px-3 text-xs font-medium disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
