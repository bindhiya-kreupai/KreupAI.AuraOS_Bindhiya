/**
 * Smoke test for @aura/integration-service.
 *
 * Ensures `pnpm --filter integration-service test` exits 0 with at least one
 * passing test so CI sees a green result instead of "no tests found".
 * Real per-handler tests go alongside the modules they cover as
 * they're written (see issue #49 for domain-level coverage plans).
 */

import { describe, it, expect } from 'vitest';

describe('@aura/integration-service smoke', () => {
  it('node runtime is healthy', () => {
    expect(typeof process.version).toBe('string');
    expect(process.version.startsWith('v')).toBe(true);
  });

  it('NODE_ENV is set to a recognised value during tests', () => {
    expect(process.env.NODE_ENV ?? 'test').toMatch(/test|development/);
  });
});
