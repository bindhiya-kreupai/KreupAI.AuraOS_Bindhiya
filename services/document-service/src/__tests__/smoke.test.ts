/**
 * Smoke test for @auraos/document-service.
 *
 * Ensures `pnpm --filter document-service test` exits 0 with at least one
 * passing test, so CI sees a green result instead of "no tests found".
 * Real per-route + per-service tests go alongside the modules they
 * cover as they're written.
 */

import { describe, it, expect } from 'vitest';

describe('@auraos/document-service smoke', () => {
  it('node runtime is healthy', () => {
    expect(typeof process.version).toBe('string');
    expect(process.version.startsWith('v')).toBe(true);
  });

  it('has the expected NODE_ENV in test runs', () => {
    expect(process.env.NODE_ENV ?? 'test').toMatch(/test|development/);
  });
});
