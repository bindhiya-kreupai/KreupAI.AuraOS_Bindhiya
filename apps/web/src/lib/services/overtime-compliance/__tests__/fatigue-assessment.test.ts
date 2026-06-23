import { describe, it, expect } from 'vitest';
import { deriveHistoryMetrics } from '../fatigue-assessment.service';

/**
 * EPIC-12 fatigue-assessment tests — pure evaluator.
 *
 * proposedStart = 2026-06-22T08:00:00Z (Monday)
 * proposedEnd   = 2026-06-22T16:00:00Z
 *
 * "day(offset)" returns an attendance row dated `2026-06-(22+offset)`
 * with the given workHours and a clockOut at start-of-day+H.
 * `offset=-1` is the day before the proposed shift.
 */

const proposedStart = new Date('2026-06-22T08:00:00Z');
const proposedEnd = new Date('2026-06-22T16:00:00Z');

function day(
  offsetDays: number,
  h = 8
): { date: Date; workHours: number; clockOut: Date | null; shiftEndTime: Date | null } {
  const d = new Date(proposedStart);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  d.setUTCHours(0, 0, 0, 0);
  const out = new Date(d);
  out.setUTCHours(h);
  return { date: d, workHours: h, clockOut: out, shiftEndTime: out };
}

describe('deriveHistoryMetrics — EPIC-12 fatigue inputs', () => {
  it('counts 6 consecutive worked days ending the day before the proposed shift', () => {
    const history = [-6, -5, -4, -3, -2, -1].map((o) => day(o));
    const m = deriveHistoryMetrics(history, proposedStart, proposedEnd);
    expect(m.consecutiveDays).toBe(6);
  });

  it('breaks the consecutive streak at the first off-day', () => {
    // -1 worked, -2 OFF, -3 worked, -4 worked → only 1 consecutive
    const history = [day(-4), day(-3), { ...day(-2), workHours: 0 }, day(-1)];
    const m = deriveHistoryMetrics(history, proposedStart, proposedEnd);
    expect(m.consecutiveDays).toBe(1);
  });

  it('computes rest hours since the last clockOut', () => {
    const lastEnd = new Date('2026-06-22T02:00:00Z'); // 6 hours rest before 08:00
    const history = [
      {
        date: new Date('2026-06-21T00:00:00Z'),
        workHours: 8,
        clockOut: lastEnd,
        shiftEndTime: lastEnd,
      },
    ];
    const m = deriveHistoryMetrics(history, proposedStart, proposedEnd);
    expect(m.restHoursBefore).toBe(6);
  });

  it('returns 24h rest when no recent history', () => {
    const m = deriveHistoryMetrics([], proposedStart, proposedEnd);
    expect(m.restHoursBefore).toBe(24);
  });

  it('sums weekly hours over the past 7 days plus the proposed shift', () => {
    // Past 7 days = 2026-06-15T08 .. 2026-06-22T08. Rows -7..-1 dated at
    // midnight UTC of each day. -7 (2026-06-15T00) falls BEFORE the
    // weekStart cutoff (08:00), so it is excluded — leaving 6 days * 9h
    // = 54, plus the 8h proposed shift = 62.
    const history = [-7, -6, -5, -4, -3, -2, -1].map((o) => day(o, 9));
    const m = deriveHistoryMetrics(history, proposedStart, proposedEnd);
    expect(m.weeklyHours).toBe(62);
  });

  it('computes proposedShiftHours from start/end', () => {
    const m = deriveHistoryMetrics([], proposedStart, proposedEnd);
    expect(m.proposedShiftHours).toBe(8);
  });
});

describe('FatigueRuleService.breachesRule integration via verdict shape', () => {
  it('verdict identifies multiple simultaneous breaches', async () => {
    const { FatigueRuleService } = await import('@/lib/services/structural-extensions');
    const result = FatigueRuleService.breachesRule(
      { maxConsecutiveDays: 6, minRestHoursBetweenShifts: 11, maxWeeklyHours: 48 },
      { consecutiveDays: 6, restHoursBefore: 5, weeklyHours: 60 }
    );
    expect(result.breaches).toBe(true);
    expect(result.reasons).toEqual([
      'MAX_CONSECUTIVE_DAYS(6)',
      'MIN_REST_HOURS(11)',
      'MAX_WEEKLY_HOURS(48)',
    ]);
  });

  it('verdict reports no breach when all metrics are within limits', async () => {
    const { FatigueRuleService } = await import('@/lib/services/structural-extensions');
    const result = FatigueRuleService.breachesRule(
      { maxConsecutiveDays: 6, minRestHoursBetweenShifts: 11, maxWeeklyHours: 48 },
      { consecutiveDays: 3, restHoursBefore: 15, weeklyHours: 35 }
    );
    expect(result.breaches).toBe(false);
    expect(result.reasons).toEqual([]);
  });
});
