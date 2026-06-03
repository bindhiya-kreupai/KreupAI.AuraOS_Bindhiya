/**
 * Request-correlation context — pure helpers + AsyncLocalStorage propagation.
 * Closes the prerequisite code-level deliverable for #82.
 */

import { describe, it, expect } from 'vitest';
import {
  deriveRoutePattern,
  getRequestContext,
  runWithRequestContext,
  sanitiseUrlForLog,
  setAuthIdentifiers,
} from '../request-context';

describe('deriveRoutePattern', () => {
  it('replaces UUIDs with [id]', () => {
    expect(
      deriveRoutePattern('/api/v1/employees/a3f2c4e6-9b8d-4f12-aaaa-bbbbccccdddd/payslips')
    ).toBe('/api/v1/employees/[id]/payslips');
  });

  it('replaces numeric segments with [n]', () => {
    expect(deriveRoutePattern('/api/v1/payroll/runs/2026/06')).toBe('/api/v1/payroll/runs/[n]/[n]');
  });

  it('leaves stable path segments untouched', () => {
    expect(deriveRoutePattern('/api/v1/auth/refresh')).toBe('/api/v1/auth/refresh');
  });

  it('handles mixed segments', () => {
    expect(deriveRoutePattern('/api/v1/tenants/12/users/0e8400-e29b-41d4-a716-446655440000')).toBe(
      '/api/v1/tenants/[n]/users/0e8400-e29b-41d4-a716-446655440000'
    );
    // Above is intentional: 24-char hex is NOT a UUID; only the canonical 8-4-4-4-12 form is recognised.
  });
});

describe('sanitiseUrlForLog', () => {
  it('redacts email-shaped tokens', () => {
    expect(sanitiseUrlForLog('/api/users?email=jane.doe@example.com')).toBe(
      '/api/users?email=[email-redacted]'
    );
  });

  it('leaves UUIDs intact (they are primary keys, not PII)', () => {
    expect(sanitiseUrlForLog('/api/v1/employees/a3f2c4e6-9b8d-4f12-aaaa-bbbbccccdddd')).toBe(
      '/api/v1/employees/a3f2c4e6-9b8d-4f12-aaaa-bbbbccccdddd'
    );
  });
});

describe('runWithRequestContext / getRequestContext', () => {
  it('propagates context across async hops', async () => {
    const result = await runWithRequestContext(
      { requestId: 'req-1', tenantId: 't-1', startedAtMs: 0 },
      async () => {
        await Promise.resolve();
        return getRequestContext();
      }
    );
    expect(result?.requestId).toBe('req-1');
    expect(result?.tenantId).toBe('t-1');
  });

  it('returns null when called outside a request scope', () => {
    expect(getRequestContext()).toBeNull();
  });

  it('isolates contexts between concurrent requests', async () => {
    const a = runWithRequestContext({ requestId: 'A', startedAtMs: 0 }, async () => {
      await new Promise((r) => setTimeout(r, 5));
      return getRequestContext()?.requestId;
    });
    const b = runWithRequestContext({ requestId: 'B', startedAtMs: 0 }, async () => {
      await new Promise((r) => setTimeout(r, 1));
      return getRequestContext()?.requestId;
    });
    const [ra, rb] = await Promise.all([a, b]);
    expect(ra).toBe('A');
    expect(rb).toBe('B');
  });
});

describe('setAuthIdentifiers', () => {
  it('mutates the active context (no-op outside a scope)', async () => {
    // outside any scope — must not throw
    expect(() => setAuthIdentifiers('t-x', 'u-x')).not.toThrow();

    const ctx = await runWithRequestContext({ requestId: 'r-1', startedAtMs: 0 }, async () => {
      setAuthIdentifiers('t-99', 'u-99');
      return getRequestContext();
    });
    expect(ctx?.tenantId).toBe('t-99');
    expect(ctx?.userId).toBe('u-99');
  });
});
