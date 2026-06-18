/**
 * EPIC-21 holiday-leave overlap API.
 *
 * POST {
 *   leave: { startDate, endDate, halfDayStart?, halfDayEnd? },
 *   holidays: [{ date, label, labelAr?, holidayClass, state }]
 * } → { result: LeaveOverlapResult, totalDays }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectLeaveHolidayOverlap,
  leaveTotalDays,
} from '@/lib/services/holidays-compliance/leave-overlap.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'leave:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.leave?.startDate || !body.leave?.endDate) {
      return badRequest('leave.startDate and leave.endDate required');
    }
    if (!Array.isArray(body.holidays)) return badRequest('holidays (array) required');
    const leave = {
      startDate: new Date(body.leave.startDate),
      endDate: new Date(body.leave.endDate),
      halfDayStart: body.leave.halfDayStart === true,
      halfDayEnd: body.leave.halfDayEnd === true,
    };
    const holidays = body.holidays.map((h: any) => ({
      date: new Date(h.date),
      label: String(h.label ?? ''),
      labelAr: h.labelAr,
      holidayClass: String(h.holidayClass ?? 'PUBLIC'),
      state: h.state === 'PROVISIONAL' ? 'PROVISIONAL' : 'CONFIRMED',
    }));
    const totalDays = leaveTotalDays(leave);
    const result = detectLeaveHolidayOverlap(leave, holidays);
    return ok({ result, totalDays });
  } catch (err) {
    return serverError('Failed to evaluate leave-holiday overlap', err);
  }
});
