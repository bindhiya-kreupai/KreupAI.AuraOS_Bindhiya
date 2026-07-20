/**
 * Level-ladder helper tests (AURA-086). Pure functions, no DB — the prisma
 * import is stubbed so the module loads in isolation.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@aura/database', () => ({ prisma: {} }));

import { tierForPoints, pointsToNextLevel, LEVEL_TIERS } from '../points';

describe('tierForPoints', () => {
  it('returns level 1 for zero points', () => {
    expect(tierForPoints(0).level).toBe(1);
  });

  it('returns Champion (level 5) at 1000 points', () => {
    const t = tierForPoints(1000);
    expect(t.level).toBe(5);
    expect(t.tier).toBe('gold');
  });

  it('returns the top tier for very large point totals', () => {
    const t = tierForPoints(999999);
    expect(t.level).toBe(LEVEL_TIERS.length);
    expect(t.tier).toBe('diamond');
  });
});

describe('pointsToNextLevel', () => {
  it('reports the gap to the next threshold', () => {
    // At 50 points the next level (Contributor) needs 100.
    expect(pointsToNextLevel(50)).toBe(50);
  });

  it('returns 0 at the top level', () => {
    expect(pointsToNextLevel(10000)).toBe(0);
  });
});
