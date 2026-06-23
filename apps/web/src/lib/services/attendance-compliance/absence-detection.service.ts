/**
 * EPIC-19 attendance absence-detection + missing-punch workflow.
 *
 * Closes the audit gaps for EPIC-19 Attendance:
 *   - "Absence-detection job missing"
 *   - "Missing-punch workflow missing"
 *
 * The classic flow:
 *   For every scheduled employee × date in the window:
 *     - If an AttendanceRecord exists with status=PRESENT → OK
 *     - Else if the date is approved leave / holiday / weekoff → OK
 *     - Else if the date has clockIn but no clockOut (or vice
 *       versa) → MISSING_PUNCH (raise regularization workflow)
 *     - Else → UNAUTHORISED_ABSENCE (raise red-flag)
 *
 * Pure detection logic lives in `detectAbsencesForDay()` so unit
 * tests can drive it without prisma. The DB-driven scanner is
 * `scanAndPersistAbsences()` (thin wrapper).
 *
 * No schema change required.
 */

export type AbsenceVerdict =
  | { kind: 'PRESENT' }
  | { kind: 'APPROVED_LEAVE' }
  | { kind: 'HOLIDAY' }
  | { kind: 'WEEKOFF' }
  | { kind: 'MISSING_PUNCH'; reason: 'NO_CLOCK_IN' | 'NO_CLOCK_OUT' }
  | { kind: 'UNAUTHORISED_ABSENCE' };

export interface DayContext {
  employeeId: string;
  date: Date;
  isScheduled: boolean;
  isHoliday: boolean;
  isWeekoff: boolean;
  hasApprovedLeave: boolean;
  attendance?: {
    status: string;
    clockIn?: Date | null;
    clockOut?: Date | null;
  };
}

export function detectDayAbsence(ctx: DayContext): AbsenceVerdict {
  // Day-off categories are checked first (rate-of-pay rules differ).
  if (ctx.isHoliday) return { kind: 'HOLIDAY' };
  if (ctx.isWeekoff) return { kind: 'WEEKOFF' };
  if (ctx.hasApprovedLeave) return { kind: 'APPROVED_LEAVE' };

  if (!ctx.isScheduled) {
    // Off-schedule day without leave/holiday — treat as weekoff for
    // detection purposes (no liability).
    return { kind: 'WEEKOFF' };
  }

  const att = ctx.attendance;
  if (att && att.status === 'PRESENT' && att.clockIn && att.clockOut) {
    return { kind: 'PRESENT' };
  }
  if (att && att.clockIn && !att.clockOut) {
    return { kind: 'MISSING_PUNCH', reason: 'NO_CLOCK_OUT' };
  }
  if (att && !att.clockIn && att.clockOut) {
    return { kind: 'MISSING_PUNCH', reason: 'NO_CLOCK_IN' };
  }
  // Scheduled, no attendance record at all → unauthorised.
  return { kind: 'UNAUTHORISED_ABSENCE' };
}

export interface DetectionSummary {
  total: number;
  present: number;
  approvedLeave: number;
  holiday: number;
  weekoff: number;
  missingPunch: number;
  unauthorisedAbsence: number;
}

export function summariseVerdicts(verdicts: AbsenceVerdict[]): DetectionSummary {
  const out: DetectionSummary = {
    total: verdicts.length,
    present: 0,
    approvedLeave: 0,
    holiday: 0,
    weekoff: 0,
    missingPunch: 0,
    unauthorisedAbsence: 0,
  };
  for (const v of verdicts) {
    switch (v.kind) {
      case 'PRESENT':
        out.present += 1;
        break;
      case 'APPROVED_LEAVE':
        out.approvedLeave += 1;
        break;
      case 'HOLIDAY':
        out.holiday += 1;
        break;
      case 'WEEKOFF':
        out.weekoff += 1;
        break;
      case 'MISSING_PUNCH':
        out.missingPunch += 1;
        break;
      case 'UNAUTHORISED_ABSENCE':
        out.unauthorisedAbsence += 1;
        break;
    }
  }
  return out;
}
