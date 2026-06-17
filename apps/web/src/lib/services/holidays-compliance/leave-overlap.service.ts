/**
 * EPIC-21 holiday / leave overlap detection + Eid provisional state.
 *
 * Closes two audit gaps for EPIC-21 Public & Religious Holidays:
 *
 *  - "holiday-leave overlap detection missing" — when an employee
 *    applies for annual leave that includes a public holiday, the
 *    payroll/leave engines should NOT consume a leave-balance day
 *    for the holiday. This service surfaces the overlap so the leave
 *    request UI can pre-adjust totalDays.
 *
 *  - "Eid provisional/confirmed state machine missing" — Eid dates
 *    are moon-sighting-dependent: the calendar carries a PROVISIONAL
 *    date which becomes CONFIRMED a few days before. Until the
 *    confirmation arrives, leave + payroll engines must treat the
 *    PROVISIONAL date as a "soft holiday" that is honoured for leave
 *    overlap (so employees don't burn balance) but flagged so the
 *    operations team can rerun the calculation if the moon-sighting
 *    shifts.
 *
 * Pure, no IO. Callers pass the holiday list (already filtered by
 * country / calendar) and the leave-request span; the service
 * returns the typed overlap result. Tests can drive everything
 * without prisma.
 */

export type HolidayState = 'CONFIRMED' | 'PROVISIONAL';

export interface HolidayWindow {
  date: Date;
  label: string;
  labelAr?: string;
  holidayClass: string;
  state: HolidayState;
}

export interface LeaveOverlapInput {
  startDate: Date;
  endDate: Date;
  halfDayStart?: boolean;
  halfDayEnd?: boolean;
}

export interface LeaveOverlapResult {
  /** Number of holiday days that fall inside the leave window. */
  holidayDays: number;
  /** Number of provisional-state holidays inside the window. */
  provisionalDays: number;
  /** Adjusted leave-deduction days (totalDays − confirmed holidayDays). */
  adjustedLeaveDays: number;
  /** Full per-holiday detail for the UI. */
  overlaps: Array<{
    date: Date;
    label: string;
    labelAr?: string;
    state: HolidayState;
  }>;
  /** True when one or more provisional holidays fell inside the window. */
  requiresRerunOnConfirmation: boolean;
}

function dayKey(d: Date): string {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

/**
 * Count calendar days between startDate and endDate (inclusive),
 * applying half-day flags to the boundary days.
 */
export function leaveTotalDays(input: LeaveOverlapInput): number {
  const start = new Date(input.startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(input.endDate);
  end.setUTCHours(0, 0, 0, 0);
  if (end.getTime() < start.getTime()) return 0;
  const days = Math.floor((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1;
  let total = days;
  if (input.halfDayStart) total -= 0.5;
  if (input.halfDayEnd && input.startDate.getTime() !== input.endDate.getTime()) total -= 0.5;
  // If the whole leave is a single half day, halfDayStart wins (already -0.5).
  return Math.max(0, total);
}

/**
 * Detect overlap between a leave window and the holiday list. Returns
 * the typed verdict — does NOT mutate any input.
 */
export function detectLeaveHolidayOverlap(
  leave: LeaveOverlapInput,
  holidays: HolidayWindow[]
): LeaveOverlapResult {
  const start = new Date(leave.startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(leave.endDate);
  end.setUTCHours(0, 0, 0, 0);

  const overlaps: LeaveOverlapResult['overlaps'] = [];
  let confirmedHolidayDays = 0;
  let provisionalDays = 0;

  for (const h of holidays) {
    const k = dayKey(h.date);
    if (k < dayKey(start) || k > dayKey(end)) continue;
    overlaps.push({
      date: new Date(k),
      label: h.label,
      labelAr: h.labelAr,
      state: h.state,
    });
    if (h.state === 'CONFIRMED') confirmedHolidayDays += 1;
    else provisionalDays += 1;
  }

  const total = leaveTotalDays(leave);
  const adjustedLeaveDays = Math.max(0, total - confirmedHolidayDays - provisionalDays);

  return {
    holidayDays: confirmedHolidayDays + provisionalDays,
    provisionalDays,
    adjustedLeaveDays,
    overlaps,
    requiresRerunOnConfirmation: provisionalDays > 0,
  };
}

/**
 * EPIC-21 Eid state machine: given a provisional Eid date and a
 * confirmed date (post moon-sighting), returns the new provisional /
 * confirmed list the calendar should expose. If the dates match,
 * the row's state flips to CONFIRMED; if not, the old PROVISIONAL
 * row is dropped and a new CONFIRMED row at the new date replaces it
 * (so the leave engine can re-run overlap detection).
 */
export function transitionEidConfirmation(
  provisional: HolidayWindow,
  confirmedDate: Date
): HolidayWindow {
  const sameDay = dayKey(provisional.date) === dayKey(confirmedDate);
  return {
    ...provisional,
    date: confirmedDate,
    state: 'CONFIRMED',
    label: sameDay
      ? provisional.label
      : `${provisional.label} (moon-sighting confirmed → ${dayKey(confirmedDate)})`,
  };
}
