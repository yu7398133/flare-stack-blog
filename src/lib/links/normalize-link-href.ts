/**
 * Normalize a user-input href into a safe, clickable URL.
 *
 * Key behavior:
 * - Keeps absolute URLs as-is for allowlisted schemes only (http/https/mailto/tel/sms).
 * - Keeps site-relative paths (/foo) and hash links (#foo) as-is.
 * - For "example.com" / "www.example.com" / "localhost:3000" style inputs, prefixes https://
 *   to avoid the browser treating them as relative paths under the current site.
 *
 * Security note: the scheme check is an **allowlist**, not a pattern match.
 * An earlier version accepted any `scheme://`, which let `javascript://alert(1)`
 * through and produced a stored XSS (the value is rendered as `<a href>` with
 * `target="_blank"`, and React does not strip `javascript:`). Dangerous schemes
 * such as javascript:/data:/vbscript:/file: must be rejected, so anything not
 * explicitly allowed falls back to being treated as a host.
 */

/** Schemes we are willing to emit verbatim. */
const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:", "sms:"]);

/**
 * Extract the scheme of a potential absolute URL.
 *
 * Returns null when the input is not a `scheme:` form — e.g. a bare host
 * ("example.com") or a port-like input ("localhost:3000", where "3000" is
 * digits and therefore cannot be a scheme).
 */
function extractScheme(input: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(input);
  if (!match) return null;

  const scheme = match[1];
  // "localhost:3000" — digits after the colon mean this is host:port, not a scheme.
  if (/^[0-9]/.test(input.slice(match[0].length))) return null;

  return `${scheme.toLowerCase()}:`;
}

export function normalizeLinkHref(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  // Allow same-page anchors and site-relative URLs.
  if (input.startsWith("#") || input.startsWith("/")) return input;

  // Protocol-relative URLs (rare but valid).
  if (input.startsWith("//")) return input;

  const scheme = extractScheme(input);

  // Explicit but disallowed scheme (javascript:, data:, vbscript:, file:, …):
  // treat as a host so it becomes an inert https:// URL rather than a live
  // script-bearing href.
  if (scheme && ALLOWED_SCHEMES.has(scheme)) return input;

  // Otherwise, treat as a host/path and default to https. This covers bare
  // hosts ("example.com"), host:port ("localhost:3000"), and anything carrying
  // a rejected scheme — which lands on "https://javascript://alert(1)", a
  // harmless (non-resolving) URL rather than executable script.
  return `https://${input}`;
}
