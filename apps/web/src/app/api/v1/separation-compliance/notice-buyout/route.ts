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
import { withEnhancedAuth } from '@/lib/auth';
import { noticeBuyoutService } from '@/lib/services/separation-compliance/notice-calculator.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const VALID_DIRECTIONS = new Set(['EMPLOYER_BUYOUT', 'EMPLOYEE_RECOVERY']);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll:read', 'employee:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const direction = body.direction ?? 'EMPLOYER_BUYOUT';
    if (!VALID_DIRECTIONS.has(direction)) {
      return badRequest('direction must be one of ' + [...VALID_DIRECTIONS].join(', '));
    }
    if (!body.salary || typeof body.salary.basicSalary !== 'number') {
      return badRequest('salary.basicSalary (number) required');
    }
    if (!body.salary.currency) return badRequest('salary.currency required');
    if (typeof body.noticeRequiredDays !== 'number') {
      return badRequest('noticeRequiredDays (number) required');
    }
    if (typeof body.noticeServedDays !== 'number') {
      return badRequest('noticeServedDays (number) required');
    }

    const input = {
      salary: {
        basicSalary: body.salary.basicSalary,
        housingAllowance: body.salary.housingAllowance,
        transportAllowance: body.salary.transportAllowance,
        currency: String(body.salary.currency),
      },
      noticeRequiredDays: body.noticeRequiredDays,
      noticeServedDays: body.noticeServedDays,
      countryCode: body.countryCode,
      formulaOverride: body.formulaOverride,
    };

    const verdict =
      direction === 'EMPLOYEE_RECOVERY'
        ? await noticeBuyoutService.employeeRecovery(input)
        : await noticeBuyoutService.employerBuyout(input);

    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to compute notice buyout', err);
  }
});
