/**
 * EPIC-27 notice buyout calculator API.
 *
 * POST {
 *   direction: 'EMPLOYER_BUYOUT' | 'EMPLOYEE_RECOVERY',
 *   salary: { basicSalary, housingAllowance?, transportAllowance?, currency },
 *   noticeRequiredDays, noticeServedDays,
 *   countryCode?, formulaOverride?
 * } → { verdict: BuyoutVerdict }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { noticeBuyoutService } from '@/lib/services/separation-compliance/notice-calculator.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  direction: z.enum(['EMPLOYER_BUYOUT', 'EMPLOYEE_RECOVERY']).default('EMPLOYER_BUYOUT'),
  salary: z.object({
    basicSalary: z.number(),
    housingAllowance: z.number().optional(),
    transportAllowance: z.number().optional(),
    currency: z.string().min(1),
  }),
  noticeRequiredDays: z.number(),
  noticeServedDays: z.number(),
  countryCode: z.string().optional(),
  formulaOverride: z.unknown().optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll:read', 'employee:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;

    const input = {
      salary: {
        basicSalary: body.salary.basicSalary,
        housingAllowance: body.salary.housingAllowance,
        transportAllowance: body.salary.transportAllowance,
        currency: body.salary.currency,
      },
      noticeRequiredDays: body.noticeRequiredDays,
      noticeServedDays: body.noticeServedDays,
      countryCode: body.countryCode,
      formulaOverride: body.formulaOverride as any,
    };

    const verdict =
      body.direction === 'EMPLOYEE_RECOVERY'
        ? await noticeBuyoutService.employeeRecovery(input)
        : await noticeBuyoutService.employerBuyout(input);

    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to compute notice buyout', err);
  }
});
