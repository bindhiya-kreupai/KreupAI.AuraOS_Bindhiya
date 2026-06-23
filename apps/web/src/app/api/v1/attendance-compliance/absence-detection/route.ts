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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectDayAbsence,
  summariseVerdicts,
} from '@/lib/services/attendance-compliance/absence-detection.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const daySchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().datetime(),
  isScheduled: z.boolean().optional(),
  isHoliday: z.boolean().optional(),
  isWeekoff: z.boolean().optional(),
  hasApprovedLeave: z.boolean().optional(),
  attendance: z
    .object({
      status: z.string().optional(),
      clockIn: z.string().datetime().optional().nullable(),
      clockOut: z.string().datetime().optional().nullable(),
    })
    .optional(),
});

const inputSchema = z.object({
  days: z.array(daySchema).min(1),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'attendance:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const verdicts = body.days.map((d) =>
      detectDayAbsence({
        employeeId: d.employeeId,
        date: new Date(d.date),
        isScheduled: d.isScheduled === true,
        isHoliday: d.isHoliday === true,
        isWeekoff: d.isWeekoff === true,
        hasApprovedLeave: d.hasApprovedLeave === true,
        attendance: d.attendance
          ? {
              status: d.attendance.status ?? '',
              clockIn: d.attendance.clockIn ? new Date(d.attendance.clockIn) : null,
              clockOut: d.attendance.clockOut ? new Date(d.attendance.clockOut) : null,
            }
          : undefined,
      })
    );
    const summary = summariseVerdicts(verdicts);
    return ok({ verdicts, summary });
  } catch (err) {
    return serverError('Failed to evaluate absence detection', err);
  }
});
