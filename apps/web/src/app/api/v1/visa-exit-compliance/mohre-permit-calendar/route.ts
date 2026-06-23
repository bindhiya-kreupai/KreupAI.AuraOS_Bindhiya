/**
 * EPIC-14 UAE — MOHRE work-permit expiry calendar API.
 *
 * POST { permits: [...], asOf?, ...overrides } → { verdict: MohrePermitReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { evaluateMohrePermitCalendar } from '@/lib/services/visa-exit-compliance/mohre-permit-calendar.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const inputSchema = z.object({
  permits: z
    .array(
      z.object({
        permitId: z.string().min(1),
        employeeId: z.string().min(1),
        expiresAt: isoDate,
        renewalLodged: z.boolean().optional(),
        cancelled: z.boolean().optional(),
      })
    )
    .min(1)
    .max(10_000),
  asOf: isoDate.optional(),
  renewalWindowDays: z.number().int().positive().max(365).optional(),
  dueSoonWindowDays: z.number().int().positive().max(60).optional(),
  lowBandMaxDays: z.number().int().positive().max(120).optional(),
  mediumBandMaxDays: z.number().int().positive().max(365).optional(),
  highBandMaxDays: z.number().int().positive().max(730).optional(),
  feePerDayAed: z
    .object({
      low: z.number().nonnegative(),
      medium: z.number().nonnegative(),
      high: z.number().nonnegative(),
    })
    .optional(),
  wageProtectionGraceDays: z.number().int().nonnegative().max(60).optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'visa:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const verdict = evaluateMohrePermitCalendar({
      ...parsed.data,
      asOf: parsed.data.asOf ? new Date(parsed.data.asOf) : undefined,
      permits: parsed.data.permits.map((p) => ({
        permitId: p.permitId,
        employeeId: p.employeeId,
        expiresAt: new Date(p.expiresAt),
        renewalLodged: p.renewalLodged,
        cancelled: p.cancelled,
      })),
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate MOHRE permit calendar', err);
  }
});
