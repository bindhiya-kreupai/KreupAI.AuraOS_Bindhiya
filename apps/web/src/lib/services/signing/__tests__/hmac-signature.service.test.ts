import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { signWithHmac, verifySignature } from '../hmac-signature.service';

beforeAll(() => {
  // Provide a stable test secret so signatures across runs are deterministic.
  process.env.SIGNATURE_HMAC_SECRET = 'unit-test-secret-with-at-least-32-chars-1234';
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signWithHmac / verifySignature', () => {
  it('round-trips: signed payload verifies back to the same canonical fields', () => {
    const sig = signWithHmac({
      domain: 'hr-forms:approve',
      resourceId: 'submission-42',
      actorId: 'user-7',
      ipAddress: '203.0.113.9',
      timestampMs: 1_700_000_000_000,
      extra: { stage: 2 },
    });
    const r = verifySignature(sig);
    expect(r.valid).toBe(true);
    expect(r.payload?.domain).toBe('hr-forms:approve');
    expect(r.payload?.resourceId).toBe('submission-42');
    expect(r.payload?.actorId).toBe('user-7');
    expect(r.payload?.ipAddress).toBe('203.0.113.9');
    expect(r.payload?.timestampMs).toBe(1_700_000_000_000);
    expect(r.payload?.extra).toEqual({ stage: 2 });
  });

  it('produces v1: prefixed three-part signature strings', () => {
    const sig = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'a' });
    expect(sig.startsWith('v1:')).toBe(true);
    expect(sig.split(':')).toHaveLength(3);
  });

  it('rejects a tampered payload (changed resourceId after signing)', () => {
    const sig = signWithHmac({ domain: 'd', resourceId: 'original', actorId: 'a' });
    const [v, payload, mac] = sig.split(':');

    // Re-encode the payload with a different resourceId but keep the original MAC.
    const tamperedPayload = Buffer.from(
      JSON.stringify({ d: 'd', r: 'TAMPERED', a: 'a', t: 1, i: null, x: null }),
      'utf8'
    )
      .toString('base64')
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const tampered = `${v}:${tamperedPayload}:${mac}`;
    const r = verifySignature(tampered);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('mac_mismatch');
  });

  it('rejects a tampered MAC (random replacement)', () => {
    const sig = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'a' });
    const [v, payload] = sig.split(':');
    const fakeMac = Buffer.from('a'.repeat(32), 'utf8')
      .toString('base64')
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const r = verifySignature(`${v}:${payload}:${fakeMac}`);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('mac_mismatch');
  });

  it('rejects an unsupported version', () => {
    const sig = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'a' });
    const [, payload, mac] = sig.split(':');
    const r = verifySignature(`v2:${payload}:${mac}`);
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('unsupported_version');
  });

  it('rejects a malformed signature (wrong number of parts)', () => {
    expect(verifySignature('not-a-signature').valid).toBe(false);
    expect(verifySignature('v1:onlytwoparts').valid).toBe(false);
    expect(verifySignature('v1:too:many:parts:here').valid).toBe(false);
  });

  it('two signatures over identical inputs (same timestampMs) match', () => {
    const a = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'a', timestampMs: 1 });
    const b = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'a', timestampMs: 1 });
    expect(a).toBe(b);
  });

  it('two signatures over different timestamps differ', () => {
    const a = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'a', timestampMs: 1 });
    const b = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'a', timestampMs: 2 });
    expect(a).not.toBe(b);
  });

  it('signature changes when actorId is different (so role-swapping is detectable)', () => {
    const a = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'alice', timestampMs: 1 });
    const b = signWithHmac({ domain: 'd', resourceId: 'r', actorId: 'mallory', timestampMs: 1 });
    expect(a).not.toBe(b);
  });
});
