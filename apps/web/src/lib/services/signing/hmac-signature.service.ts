/**
 * HMAC-SHA256 signature helper (closes audit 2026-06-17 Pattern 7).
 *
 * Replaces the predictable `hash:${userId}:${Date.now()}` pattern that
 * EPIC-33 HR-forms (and any future signature-bearing surface) used.
 * The audit flagged that pattern as failing GCC evidentiary standards
 * because it carries no authenticity guarantee — anyone with write
 * access to the row can fabricate one.
 *
 * Design:
 *   - HMAC-SHA256 over a canonical tuple
 *     `(domain | resourceId | actorId | timestampMs | optional ipAddress)`.
 *   - Server-only secret read from `SIGNATURE_HMAC_SECRET` env var. In
 *     development without the var set, a deterministic fallback is used
 *     and a warning is logged — production deployments MUST set the
 *     secret.
 *   - The returned signature string is a self-contained
 *     `v1:<base64url(payload)>:<base64url(mac)>` so verification can
 *     happen without an out-of-band lookup of the canonical tuple.
 *   - `verifySignature` recomputes the MAC and compares in constant
 *     time. Tampering with any field invalidates the signature.
 *
 * Usage (one line in the call site):
 *
 *     const sig = signWithHmac({
 *         domain: 'hr-forms:approve',
 *         resourceId: submissionId,
 *         actorId: auth.userId,
 *         ipAddress: req.ipAddress,
 *     });
 *
 * Verification (when reading back):
 *
 *     const result = verifySignature(sig);
 *     if (!result.valid) throw new Error('signature mismatch');
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { logger } from '@/lib/logger';

export interface SignaturePayload {
  /** Identifies what action is being signed (e.g. "hr-forms:approve"). */
  domain: string;
  /** Resource the signature is anchored to (form submission id, offer id, etc.). */
  resourceId: string;
  /** Who is signing. */
  actorId: string;
  /** Optional originating IP (captured into the signed tuple). */
  ipAddress?: string;
  /** Optional millisecond timestamp; defaults to Date.now(). */
  timestampMs?: number;
  /** Optional caller-supplied opaque metadata (folded into the MAC). */
  extra?: Record<string, string | number | boolean>;
}

export interface VerificationResult {
  valid: boolean;
  payload?: Required<Omit<SignaturePayload, 'extra'>> & { extra: Record<string, unknown> };
  reason?: 'malformed' | 'unsupported_version' | 'mac_mismatch' | 'invalid_payload';
}

const VERSION = 'v1';

function getSecret(): Buffer {
  const secret = process.env.SIGNATURE_HMAC_SECRET;
  if (secret && secret.length >= 32) return Buffer.from(secret, 'utf8');
  if (process.env.NODE_ENV === 'production') {
    // In production we MUST refuse to silently fall back to a dev secret.
    throw new Error('SIGNATURE_HMAC_SECRET must be set to a ≥32-char value in production');
  }
  if (!getSecret.warned) {
    logger.warn(
      'SIGNATURE_HMAC_SECRET not set; using a deterministic dev fallback. Set the env var before deploying.'
    );
    getSecret.warned = true;
  }
  return Buffer.from('dev-signature-fallback-secret-DO-NOT-USE-IN-PROD', 'utf8');
}
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace getSecret {
  // eslint-disable-next-line prefer-const
  export let warned = false;
}

function base64url(b: Buffer | string): string {
  const buf = typeof b === 'string' ? Buffer.from(b, 'utf8') : b;
  return buf.toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return Buffer.from(padded, 'base64');
}

/** Produce a tamper-evident signature string. */
export function signWithHmac(input: SignaturePayload): string {
  const ts = input.timestampMs ?? Date.now();
  const canonical = {
    d: input.domain,
    r: input.resourceId,
    a: input.actorId,
    t: ts,
    i: input.ipAddress ?? null,
    x: input.extra ?? null,
  };
  const payloadJson = JSON.stringify(canonical);
  const payloadB64 = base64url(payloadJson);

  const mac = createHmac('sha256', getSecret()).update(payloadB64).digest();
  return `${VERSION}:${payloadB64}:${base64url(mac)}`;
}

/** Constant-time verify a signature produced by `signWithHmac`. */
export function verifySignature(signature: string): VerificationResult {
  const parts = signature.split(':');
  if (parts.length !== 3) return { valid: false, reason: 'malformed' };
  const [version, payloadB64, macB64] = parts;
  if (version !== VERSION) return { valid: false, reason: 'unsupported_version' };

  const expectedMac = createHmac('sha256', getSecret()).update(payloadB64).digest();
  const providedMac = base64urlDecode(macB64);
  if (providedMac.length !== expectedMac.length) return { valid: false, reason: 'mac_mismatch' };
  if (!timingSafeEqual(providedMac, expectedMac)) return { valid: false, reason: 'mac_mismatch' };

  let payload: any;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString('utf8'));
  } catch {
    return { valid: false, reason: 'invalid_payload' };
  }
  if (
    typeof payload?.d !== 'string' ||
    typeof payload?.r !== 'string' ||
    typeof payload?.a !== 'string' ||
    typeof payload?.t !== 'number'
  ) {
    return { valid: false, reason: 'invalid_payload' };
  }
  return {
    valid: true,
    payload: {
      domain: payload.d,
      resourceId: payload.r,
      actorId: payload.a,
      timestampMs: payload.t,
      ipAddress: payload.i ?? undefined,
      extra: payload.x ?? {},
    } as Required<Omit<SignaturePayload, 'extra'>> & { extra: Record<string, unknown> },
  };
}
