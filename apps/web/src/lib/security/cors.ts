/**
 * AOS-SEC-009 — CORS Allowed Origins Validator Utility
 *
 * Validates CORS_ALLOWED_ORIGINS environment variable entries.
 * Ensures entries are valid URL origins (scheme + host + optional port only,
 * no wildcards '*' and no trailing slashes or paths '/path').
 */

export function isValidCorsOrigin(origin: string): boolean {
  if (!origin || typeof origin !== 'string') return false;
  const trimmed = origin.trim();

  // Reject wildcards or partial wildcard expressions
  if (trimmed.includes('*')) return false;

  try {
    const url = new URL(trimmed);
    // Protocol must be http or https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    // Must match origin exactly (no path like /api, no query string, no trailing slash)
    if (url.origin !== trimmed) return false;
    return true;
  } catch (_err) {
    return false;
  }
}

export function parseAndValidateCorsOrigins(rawOrigins?: string): string[] {
  const envString = rawOrigins ?? process.env.CORS_ALLOWED_ORIGINS ?? '';
  if (!envString.trim()) return [];

  const rawEntries = envString
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const validOrigins: string[] = [];

  for (const entry of rawEntries) {
    if (isValidCorsOrigin(entry)) {
      validOrigins.push(entry);
    } else {
      console.warn(
        `[CORS WARNING] Invalid CORS origin entry "${entry}" in CORS_ALLOWED_ORIGINS env var — skipped. Allowed format: https://app.domain.com (scheme + host + optional port, no paths/wildcards)`
      );
    }
  }

  return validOrigins;
}
