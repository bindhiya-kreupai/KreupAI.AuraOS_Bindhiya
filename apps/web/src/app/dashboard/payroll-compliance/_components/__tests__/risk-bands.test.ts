import { describe, it, expect } from 'vitest';
import { bandForScore, reviewCadenceDays, isControlOverdue } from '../risk-bands';

describe('bandForScore', () => {
  it('bands at the documented thresholds (matches service riskBand)', () => {
    expect(bandForScore(1)).toBe('LOW');
    expect(bandForScore(5)).toBe('LOW');
    expect(bandForScore(6)).toBe('MEDIUM');
    expect(bandForScore(11)).toBe('MEDIUM');
    expect(bandForScore(12)).toBe('HIGH');
    expect(bandForScore(19)).toBe('HIGH');
    expect(bandForScore(20)).toBe('CRITICAL');
    expect(bandForScore(25)).toBe('CRITICAL');
  });
});

describe('reviewCadenceDays', () => {
  it('returns cadence per frequency with monthly default', () => {
    expect(reviewCadenceDays('WEEKLY')).toBe(7);
    expect(reviewCadenceDays('MONTHLY')).toBe(35);
    expect(reviewCadenceDays('QUARTERLY')).toBe(95);
    expect(reviewCadenceDays('ANNUAL')).toBe(370);
    expect(reviewCadenceDays('UNKNOWN')).toBe(35);
  });
});

describe('isControlOverdue', () => {
  const now = new Date('2026-07-02T00:00:00Z').getTime();

  it('treats never-reviewed controls as overdue', () => {
    expect(isControlOverdue(null, 'MONTHLY', now)).toBe(true);
  });

  it('is not overdue when reviewed within cadence', () => {
    const tenDaysAgo = new Date(now - 10 * 86_400_000).toISOString();
    expect(isControlOverdue(tenDaysAgo, 'MONTHLY', now)).toBe(false);
  });

  it('is overdue when reviewed beyond cadence', () => {
    const fortyDaysAgo = new Date(now - 40 * 86_400_000).toISOString();
    expect(isControlOverdue(fortyDaysAgo, 'MONTHLY', now)).toBe(true);
  });

  it('honours weekly cadence', () => {
    const eightDaysAgo = new Date(now - 8 * 86_400_000).toISOString();
    expect(isControlOverdue(eightDaysAgo, 'WEEKLY', now)).toBe(true);
  });
});
