/**
 * CostBudgetService — pure forecast + evaluation tests. (#114)
 */

import { describe, it, expect } from 'vitest';
import { CostBudgetService, InvalidThresholdError } from '../cost-budget.service';

const svc = new CostBudgetService();

describe('CostBudgetService.forecastEndOfMonth', () => {
  it('projects $500 spend on day 10/30 to ~$1500', () => {
    expect(svc.forecastEndOfMonth(500, 10, 30)).toBeCloseTo(1500, 0);
  });

  it('returns actualSpend when dayOfMonth is invalid', () => {
    expect(svc.forecastEndOfMonth(500, 0, 30)).toBe(500);
    expect(svc.forecastEndOfMonth(500, 31, 30)).toBe(500);
  });
});

describe('CostBudgetService.evaluate', () => {
  const budget = {
    id: 'b1',
    name: 'Compute',
    monthlyBudget: 1000,
    alertThresholdPct: 80,
    forecastThresholdPct: 100,
  };

  it('reports alert and forecast not tripped when well under budget', () => {
    const e = svc.evaluate(budget, 100, 10, 30);
    expect(e.utilisationPct).toBeCloseTo(10, 1);
    expect(e.alertTripped).toBe(false);
    // forecast = 100/10 * 30 = 300 → 30% of $1000 — under 100% forecast threshold
    expect(e.forecastTripped).toBe(false);
    expect(e.forecastSpend).toBeCloseTo(300, 0);
  });

  it('alert trips at >= alertThresholdPct of actual', () => {
    const e = svc.evaluate(budget, 800, 30, 30);
    expect(e.utilisationPct).toBeCloseTo(80, 1);
    expect(e.alertTripped).toBe(true);
  });

  it('forecast trips when projected spend >= forecastThresholdPct', () => {
    // Day 5/30 with $200 → forecast $1200 → 120% — over 100% threshold
    const e = svc.evaluate(budget, 200, 5, 30);
    expect(e.alertTripped).toBe(false);
    expect(e.forecastTripped).toBe(true);
  });

  it('handles decimal-as-string budgets from Prisma', () => {
    const e = svc.evaluate({ ...budget, monthlyBudget: '1000.00' }, 500, 15, 30);
    expect(e.utilisationPct).toBeCloseTo(50, 1);
  });
});

describe('CostBudgetService threshold validation', () => {
  it('rejects alertThresholdPct out of (0, 200]', async () => {
    await expect(
      svc.create({
        name: 'x',
        scope: 'TENANT',
        monthlyBudget: 100,
        alertThresholdPct: 0,
        actorId: 'a',
      })
    ).rejects.toThrow(InvalidThresholdError);
    await expect(
      svc.create({
        name: 'x',
        scope: 'TENANT',
        monthlyBudget: 100,
        alertThresholdPct: 201,
        actorId: 'a',
      })
    ).rejects.toThrow(InvalidThresholdError);
  });

  it('rejects forecastThresholdPct out of (0, 200]', async () => {
    await expect(
      svc.create({
        name: 'x',
        scope: 'TENANT',
        monthlyBudget: 100,
        forecastThresholdPct: -1,
        actorId: 'a',
      })
    ).rejects.toThrow(InvalidThresholdError);
  });
});
