/**
 * EPIC-28 — Time / attendance compliance checks.
 *
 * Actions:
 *   { action: 'submitTimesheet' | 'approveTimesheet' | 'rejectTimesheet', ... }
 *   { action: 'getTimesheet', timesheetId }
 *   { action: 'overtimeCap', ... }
 *   { action: 'fraudScan', punches }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectBiometricFraud,
  evaluateOvertimeCap,
  timesheetMakerCheckerService,
} from '@/lib/services/attendance-compliance/time-compliance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const submitSchema = z.object({
  action: z.literal('submitTimesheet'),
  timesheetId: z.string().min(1),
});
const approveSchema = z.object({
  action: z.literal('approveTimesheet'),
  timesheetId: z.string().min(1),
});
const rejectSchema = z.object({
  action: z.literal('rejectTimesheet'),
  timesheetId: z.string().min(1),
  reason: z.string().min(3),
});
const getSchema = z.object({
  action: z.literal('getTimesheet'),
  timesheetId: z.string().min(1),
});
const otSchema = z.object({
  action: z.literal('overtimeCap'),
  window: z.object({
    weekHours: z.number().min(0),
    monthHours: z.number().min(0),
  }),
  caps: z.object({
    weeklySoftHours: z.number().min(0),
    weeklyHardHours: z.number().min(0),
    monthlyHardHours: z.number().min(0),
  }),
});
const fraudSchema = z.object({
  action: z.literal('fraudScan'),
  punches: z
    .array(
      z.object({
        punchId: z.string().min(1),
        employeeId: z.string().min(1),
        capturedAt: z.string(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        deviceId: z.string().optional(),
        matchConfidence: z.number().min(0).max(1).optional(),
      })
    )
    .min(1),
  minMatchConfidence: z.number().min(0).max(1).optional(),
  impossibleSpeedKmh: z.number().min(0).optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  submitSchema,
  approveSchema,
  rejectSchema,
  getSchema,
  otSchema,
  fraudSchema,
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'attendance:read',
      'attendance:manage',
      'tenant:read',
      'dashboard:read'
    )
  ) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
      userEmail: (ctx.user as any).email,
    };
    if (body.action === 'submitTimesheet') {
      const state = await timesheetMakerCheckerService.submit(
        { timesheetId: body.timesheetId },
        auth
      );
      return ok({ state });
    }
    if (body.action === 'approveTimesheet') {
      const state = await timesheetMakerCheckerService.approve(body.timesheetId, auth);
      return ok({ state });
    }
    if (body.action === 'rejectTimesheet') {
      const state = await timesheetMakerCheckerService.reject(body.timesheetId, body.reason, auth);
      return ok({ state });
    }
    if (body.action === 'getTimesheet') {
      const state = await timesheetMakerCheckerService.findOne(body.timesheetId, ctx.user.tenantId);
      return ok({ state });
    }
    if (body.action === 'overtimeCap') {
      const verdict = evaluateOvertimeCap(body.window, body.caps);
      return ok({ verdict });
    }
    const verdict = detectBiometricFraud(
      body.punches.map((p) => ({
        ...p,
        capturedAt: new Date(p.capturedAt),
      })),
      {
        minMatchConfidence: body.minMatchConfidence,
        impossibleSpeedKmh: body.impossibleSpeedKmh,
      }
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate time compliance check', err);
  }
});
