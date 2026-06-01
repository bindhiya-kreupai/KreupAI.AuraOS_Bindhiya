/**
 * Smoke test for @aura/shared-services.
 *
 * Exists primarily so `pnpm test` exits 0 on this package — without
 * at least one test, vitest exits with code 1 ("no tests found") and
 * any CI workflow that runs all-tests-in-monorepo treats the package
 * as failed. The real per-method tests live alongside their modules
 * as they're written.
 */

import { describe, it, expect } from 'vitest';

describe('@aura/shared-services smoke', () => {
  it('is the expected package', async () => {
    const pkg = await import('../../package.json');
    expect(pkg.default?.name ?? pkg.name).toBe('@aura/shared-services');
  });

  it('node runtime is healthy', () => {
    expect(typeof process.version).toBe('string');
    expect(process.version.startsWith('v')).toBe(true);
  });
});
