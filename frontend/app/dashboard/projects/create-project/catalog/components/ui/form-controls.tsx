"use client";

export function FormInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  icon,
  prefix,
  type = "text",
  inputMode,
  error,
  maxLength,
  counterMax,
  compact,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  prefix?: string;
  type?: string;
  inputMode?:
    | "text"
    | "none"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  error?: string;
  maxLength?: number;
  counterMax?: number;
  // Shorter box height + tighter label spacing, opt-in per usage so
  // other forms sharing this component keep their current size.
  compact?: boolean;
}) {
  return (
    <label className="block">
      <div
        className={`flex items-center justify-between ${
          compact ? "mb-1" : "mb-2"
        }`}
      >
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {counterMax && (
          <span className="text-xs font-medium text-muted">
            {value.length}/{counterMax}
          </span>
        )}
      </div>

      <div
        className={`flex overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 ${
          error
            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
            : "border-line focus-within:border-muted focus-within:ring-line"
        }`}
      >
        {prefix && (
          <div className="flex items-center border-r border-line bg-page px-3 text-xs font-bold text-muted">
            {prefix}
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-line ${
            compact ? "h-9" : "h-11"
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </label>
  );
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  required,
  rows = 4,
  error,
  maxLength,
  counterMax,
  counterMode,
  compact,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  rows?: number;
  error?: string;
  maxLength?: number;
  counterMax?: number;
  counterMode?: "characters" | "words";
  // Shorter padding + tighter label spacing, opt-in per usage so
  // other forms sharing this component keep their current size.
  compact?: boolean;
}) {
  return (
    <label className="block">
      <div
        className={`flex items-center justify-between gap-1.5 ${
          compact ? "mb-1" : "mb-2"
        }`}
      >
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {counterMax && (
          <span className="text-xs font-medium text-muted">
            {counterMode === "words"
              ? value.trim().split(/\s+/).filter(Boolean).length
              : value.length}
            /{counterMax}
          </span>
        )}
      </div>

      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`block w-full resize-none rounded-xl border bg-white text-sm leading-5 text-ink outline-none transition placeholder:text-line ${
          compact ? "px-3 py-2" : "px-3 py-3"
        } ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-line focus:border-muted focus:ring-line"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </label>
  );
}
