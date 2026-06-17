import { describe, it, expect } from 'vitest';
import {
  detectLeaveHolidayOverlap,
  leaveTotalDays,
  transitionEidConfirmation,
  type HolidayWindow,
} from '../leave-overlap.service';

const HOLIDAY: (
  date: string,
  label: string,
  state?: 'CONFIRMED' | 'PROVISIONAL'
) => HolidayWindow = (date, label, state = 'CONFIRMED') => ({
  date: new Date(date),
  label,
  holidayClass: state === 'PROVISIONAL' ? 'EID_AL_FITR' : 'NATIONAL',
  state,
});

describe('leaveTotalDays', () => {
  it('counts inclusive days', () => {
    expect(
      leaveTotalDays({
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-17'),
      })
    ).toBe(3);
  });

  it('subtracts 0.5 for halfDayStart', () => {
    expect(
      leaveTotalDays({
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-17'),
        halfDayStart: true,
      })
    ).toBe(2.5);
  });

  it('subtracts 0.5 for halfDayEnd when end > start', () => {
    expect(
      leaveTotalDays({
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-17'),
        halfDayEnd: true,
      })
    ).toBe(2.5);
  });

  it('returns 0.5 for a single half-day request', () => {
    expect(
      leaveTotalDays({
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-15'),
        halfDayStart: true,
      })
    ).toBe(0.5);
  });

  it('returns 0 when end < start', () => {
    expect(
      leaveTotalDays({
        startDate: new Date('2026-06-20'),
        endDate: new Date('2026-06-15'),
      })
    ).toBe(0);
  });
});

describe('detectLeaveHolidayOverlap — EPIC-21', () => {
  it('returns no overlap when holiday is outside the window', () => {
    const r = detectLeaveHolidayOverlap(
      { startDate: new Date('2026-06-15'), endDate: new Date('2026-06-17') },
      [HOLIDAY('2026-07-01', 'July Day')]
    );
    expect(r.holidayDays).toBe(0);
    expect(r.adjustedLeaveDays).toBe(3);
    expect(r.requiresRerunOnConfirmation).toBe(false);
  });

  it('subtracts a confirmed holiday from the leave-deduction days', () => {
    const r = detectLeaveHolidayOverlap(
      { startDate: new Date('2026-06-15'), endDate: new Date('2026-06-17') },
      [HOLIDAY('2026-06-16', 'UAE National Day')]
    );
    expect(r.holidayDays).toBe(1);
    expect(r.overlaps).toHaveLength(1);
    expect(r.adjustedLeaveDays).toBe(2);
    expect(r.requiresRerunOnConfirmation).toBe(false);
  });

  it('subtracts a provisional Eid holiday but flags rerun-on-confirmation', () => {
    const r = detectLeaveHolidayOverlap(
      { startDate: new Date('2026-06-15'), endDate: new Date('2026-06-17') },
      [HOLIDAY('2026-06-16', 'Eid Al-Fitr (provisional)', 'PROVISIONAL')]
    );
    expect(r.provisionalDays).toBe(1);
    expect(r.adjustedLeaveDays).toBe(2);
    expect(r.requiresRerunOnConfirmation).toBe(true);
  });

  it('handles multiple holidays inside one leave window', () => {
    const r = detectLeaveHolidayOverlap(
      { startDate: new Date('2026-06-15'), endDate: new Date('2026-06-20') },
      [HOLIDAY('2026-06-16', 'NatDay'), HOLIDAY('2026-06-18', 'EidProv', 'PROVISIONAL')]
    );
    expect(r.holidayDays).toBe(2);
    expect(r.provisionalDays).toBe(1);
    expect(r.adjustedLeaveDays).toBe(4);
    expect(r.requiresRerunOnConfirmation).toBe(true);
  });

  it('does not adjust below zero on a single-day leave that fully overlaps', () => {
    const r = detectLeaveHolidayOverlap(
      {
        startDate: new Date('2026-06-16'),
        endDate: new Date('2026-06-16'),
        halfDayStart: true,
      },
      [HOLIDAY('2026-06-16', 'NatDay')]
    );
    expect(r.adjustedLeaveDays).toBe(0);
  });
});

describe('transitionEidConfirmation — EPIC-21', () => {
  const provisional = HOLIDAY('2026-06-16', 'Eid Al-Fitr', 'PROVISIONAL');

  it('confirms in place when moon-sighting matches the provisional date', () => {
    const out = transitionEidConfirmation(provisional, new Date('2026-06-16'));
    expect(out.state).toBe('CONFIRMED');
    expect(out.label).toBe('Eid Al-Fitr');
  });

  it('shifts the date and annotates the label when moon-sighting moves it', () => {
    const out = transitionEidConfirmation(provisional, new Date('2026-06-17'));
    expect(out.state).toBe('CONFIRMED');
    expect(out.date.toISOString()).toBe('2026-06-17T00:00:00.000Z');
    expect(out.label).toMatch(/moon-sighting confirmed → 2026-06-17/);
  });
});
