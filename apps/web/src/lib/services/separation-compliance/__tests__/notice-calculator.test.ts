import { describe, it, expect } from 'vitest';
import {
  DEFAULT_BUYOUT_FORMULA,
  computeBuyoutForUnservedDays,
  computeRecoveryForShortNotice,
} from '../notice-calculator.service';

const SALARY = { basicSalary: 9000, currency: 'AED' };

describe('computeBuyoutForUnservedDays — EPIC-27 employer buyout', () => {
  it('values 30 unserved days at one monthly basic when daysPerMonth=30', () => {
    const v = computeBuyoutForUnservedDays(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 0 },
      DEFAULT_BUYOUT_FORMULA
    );
    expect(v.unservedDays).toBe(30);
    expect(v.dailyRate).toBe(300);
    expect(v.amount).toBe(9000);
    expect(v.currency).toBe('AED');
  });

  it('halves the value when half the notice was served', () => {
    const v = computeBuyoutForUnservedDays(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 15 },
      DEFAULT_BUYOUT_FORMULA
    );
    expect(v.unservedDays).toBe(15);
    expect(v.amount).toBe(4500);
  });

  it('returns 0 when the full notice was served', () => {
    const v = computeBuyoutForUnservedDays(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 30 },
      DEFAULT_BUYOUT_FORMULA
    );
    expect(v.unservedDays).toBe(0);
    expect(v.amount).toBe(0);
  });

  it('clamps unservedDays to >= 0 when employee over-served', () => {
    const v = computeBuyoutForUnservedDays(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 60 },
      DEFAULT_BUYOUT_FORMULA
    );
    expect(v.unservedDays).toBe(0);
    expect(v.amount).toBe(0);
  });

  it('honours the includeFixedAllowances override', () => {
    const v = computeBuyoutForUnservedDays(
      {
        salary: { ...SALARY, housingAllowance: 3000, transportAllowance: 1500 },
        noticeRequiredDays: 30,
        noticeServedDays: 0,
        formulaOverride: { includeFixedAllowances: true },
      },
      DEFAULT_BUYOUT_FORMULA
    );
    // (9000 + 3000 + 1500) / 30 = 450/day; 30d = 13500.
    expect(v.dailyRate).toBe(450);
    expect(v.amount).toBe(13500);
  });

  it('emits a bilingual formula string', () => {
    const v = computeBuyoutForUnservedDays(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 10 },
      DEFAULT_BUYOUT_FORMULA
    );
    expect(v.formula.length).toBeGreaterThan(0);
    expect(v.formulaAr.length).toBeGreaterThan(0);
    expect(v.formula).not.toBe(v.formulaAr);
  });

  it('produces a breakdown with notice / served / unserved / daily / amount', () => {
    const v = computeBuyoutForUnservedDays(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 10 },
      DEFAULT_BUYOUT_FORMULA
    );
    expect(v.breakdown.map((b) => b.label)).toEqual(
      expect.arrayContaining([
        'Notice required (days)',
        'Notice served (days)',
        'Unserved (days)',
        'Daily rate',
        'Buyout amount',
      ])
    );
  });
});

describe('computeRecoveryForShortNotice — EPIC-27 employee recovery cap', () => {
  it('returns uncapped when amount fits within the 50% basic cap', () => {
    const v = computeRecoveryForShortNotice(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 20 },
      DEFAULT_BUYOUT_FORMULA
    );
    // 10 unserved * 300 = 3000; cap = 50% of 9000 = 4500 → not capped.
    expect(v.amount).toBe(3000);
    expect(v.cappedByLaw).toBe(false);
    expect(v.uncappedAmount).toBe(3000);
  });

  it('caps at 50% of monthly basic when amount exceeds cap', () => {
    const v = computeRecoveryForShortNotice(
      { salary: SALARY, noticeRequiredDays: 30, noticeServedDays: 0 },
      DEFAULT_BUYOUT_FORMULA
    );
    // 30 * 300 = 9000; cap = 4500 → capped.
    expect(v.amount).toBe(4500);
    expect(v.cappedByLaw).toBe(true);
    expect(v.uncappedAmount).toBe(9000);
  });

  it('honours a country override of maxDeductionPerMonthPct', () => {
    const v = computeRecoveryForShortNotice(
      {
        salary: SALARY,
        noticeRequiredDays: 30,
        noticeServedDays: 0,
        formulaOverride: { maxDeductionPerMonthPct: 0.25 },
      },
      DEFAULT_BUYOUT_FORMULA
    );
    expect(v.amount).toBe(2250); // 25% of 9000
    expect(v.cappedByLaw).toBe(true);
  });
});
