/**
 * EPIC-21 holiday-leave overlap API.
 *
 * POST {
 *   leave: { startDate, endDate, halfDayStart?, halfDayEnd? },
 *   holidays: [{ date, label, labelAr?, holidayClass, state }]
 * } → { result: LeaveOverlapResult, totalDays }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectLeaveHolidayOverlap,
  leaveTotalDays,
} from '@/lib/services/holidays-compliance/leave-overlap.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  leave: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    halfDayStart: z.boolean().optional(),
    halfDayEnd: z.boolean().optional(),
  }),
  holidays: z.array(
    z.object({
      date: z.string().datetime(),
      label: z.string().optional(),
      labelAr: z.string().optional(),
      holidayClass: z.string().optional(),
      state: z.enum(['CONFIRMED', 'PROVISIONAL']).optional(),
    })
  ),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'leave:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const leave = {
      startDate: new Date(body.leave.startDate),
      endDate: new Date(body.leave.endDate),
      halfDayStart: body.leave.halfDayStart === true,
      halfDayEnd: body.leave.halfDayEnd === true,
    };
    const holidays = body.holidays.map((h) => ({
      date: new Date(h.date),
      label: h.label ?? '',
      labelAr: h.labelAr,
      holidayClass: h.holidayClass ?? 'PUBLIC',
      state: h.state === 'PROVISIONAL' ? ('PROVISIONAL' as const) : ('CONFIRMED' as const),
    }));
    const totalDays = leaveTotalDays(leave);
    const result = detectLeaveHolidayOverlap(leave, holidays);
    return ok({ result, totalDays });
  } catch (err) {
    return serverError('Failed to evaluate leave-holiday overlap', err);
  }
});
