import { describe, it, expect } from 'vitest';
import { detectDayAbsence, summariseVerdicts, type DayContext } from '../absence-detection.service';

function ctx(overrides: Partial<DayContext> = {}): DayContext {
  return {
    employeeId: 'e1',
    date: new Date('2026-06-17'),
    isScheduled: true,
    isHoliday: false,
    isWeekoff: false,
    hasApprovedLeave: false,
    ...overrides,
  };
}

describe('detectDayAbsence — EPIC-19', () => {
  it('returns HOLIDAY when isHoliday=true (even with leave applied)', () => {
    const v = detectDayAbsence(ctx({ isHoliday: true, hasApprovedLeave: true }));
    expect(v.kind).toBe('HOLIDAY');
  });

  it('returns WEEKOFF when isWeekoff=true', () => {
    const v = detectDayAbsence(ctx({ isWeekoff: true }));
    expect(v.kind).toBe('WEEKOFF');
  });

  it('returns APPROVED_LEAVE on a scheduled day with approved leave', () => {
    const v = detectDayAbsence(ctx({ hasApprovedLeave: true }));
    expect(v.kind).toBe('APPROVED_LEAVE');
  });

  it('returns WEEKOFF for unscheduled day with no other annotation', () => {
    const v = detectDayAbsence(ctx({ isScheduled: false }));
    expect(v.kind).toBe('WEEKOFF');
  });

  it('returns PRESENT when both clockIn + clockOut are set and status=PRESENT', () => {
    const v = detectDayAbsence(
      ctx({
        attendance: {
          status: 'PRESENT',
          clockIn: new Date('2026-06-17T09:00Z'),
          clockOut: new Date('2026-06-17T18:00Z'),
        },
      })
    );
    expect(v.kind).toBe('PRESENT');
  });

  it('returns MISSING_PUNCH NO_CLOCK_OUT when only clockIn is present', () => {
    const v = detectDayAbsence(
      ctx({
        attendance: {
          status: 'PENDING',
          clockIn: new Date('2026-06-17T09:00Z'),
          clockOut: null,
        },
      })
    );
    expect(v.kind).toBe('MISSING_PUNCH');
    if (v.kind === 'MISSING_PUNCH') expect(v.reason).toBe('NO_CLOCK_OUT');
  });

  it('returns MISSING_PUNCH NO_CLOCK_IN when only clockOut is present', () => {
    const v = detectDayAbsence(
      ctx({
        attendance: {
          status: 'PENDING',
          clockIn: null,
          clockOut: new Date('2026-06-17T18:00Z'),
        },
      })
    );
    expect(v.kind).toBe('MISSING_PUNCH');
    if (v.kind === 'MISSING_PUNCH') expect(v.reason).toBe('NO_CLOCK_IN');
  });

  it('returns UNAUTHORISED_ABSENCE on a scheduled day with no attendance record', () => {
    const v = detectDayAbsence(ctx());
    expect(v.kind).toBe('UNAUTHORISED_ABSENCE');
  });
});

describe('summariseVerdicts — EPIC-19', () => {
  it('counts each kind correctly', () => {
    const summary = summariseVerdicts([
      { kind: 'PRESENT' },
      { kind: 'PRESENT' },
      { kind: 'APPROVED_LEAVE' },
      { kind: 'HOLIDAY' },
      { kind: 'WEEKOFF' },
      { kind: 'MISSING_PUNCH', reason: 'NO_CLOCK_OUT' },
      { kind: 'UNAUTHORISED_ABSENCE' },
      { kind: 'UNAUTHORISED_ABSENCE' },
    ]);
    expect(summary).toEqual({
      total: 8,
      present: 2,
      approvedLeave: 1,
      holiday: 1,
      weekoff: 1,
      missingPunch: 1,
      unauthorisedAbsence: 2,
    });
  });
});
