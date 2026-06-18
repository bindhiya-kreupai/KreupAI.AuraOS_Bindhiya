/**
 * EPIC-19 absence-detection API.
 *
 * POST {
 *   days: [{ employeeId, date, isScheduled, isHoliday, isWeekoff,
 *            hasApprovedLeave, attendance? }]
 * } → { verdicts: AbsenceVerdict[], summary: DetectionSummary }
 *
 * Single-day callers can pass a one-element array.
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectDayAbsence,
  summariseVerdicts,
} from '@/lib/services/attendance-compliance/absence-detection.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'attendance:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.days) || body.days.length === 0) {
      return badRequest('days (non-empty array) required');
    }
    const verdicts = body.days.map((d: any) => {
      if (!d.employeeId) throw new Error('day.employeeId required');
      if (!d.date) throw new Error('day.date required');
      return detectDayAbsence({
        employeeId: String(d.employeeId),
        date: new Date(d.date),
        isScheduled: d.isScheduled === true,
        isHoliday: d.isHoliday === true,
        isWeekoff: d.isWeekoff === true,
        hasApprovedLeave: d.hasApprovedLeave === true,
        attendance: d.attendance
          ? {
              status: String(d.attendance.status ?? ''),
              clockIn: d.attendance.clockIn ? new Date(d.attendance.clockIn) : null,
              clockOut: d.attendance.clockOut ? new Date(d.attendance.clockOut) : null,
            }
          : undefined,
      });
    });
    const summary = summariseVerdicts(verdicts);
    return ok({ verdicts, summary });
  } catch (err) {
    return serverError('Failed to evaluate absence detection', err);
  }
});
