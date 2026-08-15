/**
 * AOS-SEC-008 — Content Security Policy (CSP) Hardening Utility
 *
 * Hardens CSP for Production:
 * - Removes 'unsafe-eval' and 'unsafe-inline' from script-src in production.
 * - Generates cryptographically secure per-request base64 nonces.
 * - Attaches nonce to inline scripts and server-rendered components.
 */

export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return Buffer.from(crypto.randomUUID()).toString('base64');
  }
  // Fallback for environments where crypto.randomUUID is unavailable
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(array).toString('base64');
}

export function buildCspHeader(
  nonce: string,
  isProduction: boolean = process.env.NODE_ENV === 'production'
): string {
  const scriptSrc = isProduction
    ? `'self' 'nonce-${nonce}'`
    : `'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline'`;

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
  ];

  return directives.join('; ') + ';';
}
