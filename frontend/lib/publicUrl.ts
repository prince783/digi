/*
 * Single source of truth for building a catalog's canonical public
 * URL. Every place that displays, copies, opens, or QR-encodes a
 * catalog link must go through this — never re-derive the path or
 * the domain independently, or the different surfaces can drift
 * apart (e.g. one place encoding a relative path, another sniffing
 * a request origin, another hardcoding a domain).
 */

/**
 * Resolves the base URL to use: the configured production domain
 * (NEXT_PUBLIC_BASE_URL) when set, otherwise the caller-supplied
 * fallback — the current window/request origin, which is already
 * "http://localhost:3000" in local dev and the real domain in
 * production even without the env var configured.
 */
export function resolveConfiguredBaseUrl(fallbackOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  return (configured || fallbackOrigin || "").replace(/\/+$/, "");
}

/** Builds the canonical public catalog URL for a given username. */
export function buildCatalogPublicUrl(
  username: string,
  baseUrl: string,
): string {
  const cleanUsername = (username || "").trim();
  if (!cleanUsername) return "";

  const cleanBase = (baseUrl || "").replace(/\/+$/, "");
  return `${cleanBase}/catalogs/${encodeURIComponent(cleanUsername)}`;
}
