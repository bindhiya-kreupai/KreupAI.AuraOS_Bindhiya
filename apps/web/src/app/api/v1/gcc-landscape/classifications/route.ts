import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { workforceClassificationService } from '@/lib/services/gcc-landscape';
import {
  badRequest,
  forbidden,
  hasAny,
  ok,
  created,
  serverError,
  type RouteContext,
} from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:read', 'employee:update', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('employeeId');
    const action = url.searchParams.get('action');
    if (action === 'data-quality') {
      return ok(await workforceClassificationService.findDataQualityIssues(ctx.user.tenantId));
    }
    if (!employeeId) return badRequest('employeeId is required');
    if (url.searchParams.get('history') === 'true') {
      return ok(await workforceClassificationService.listHistory(ctx.user.tenantId, employeeId));
    }
    return ok(await workforceClassificationService.getCurrent(ctx.user.tenantId, employeeId));
  } catch (err) {
    return serverError('Failed to load workforce classification', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:update', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const field of ['employeeId', 'nationality', 'countryOfEmployment']) {
      if (!body[field]) return badRequest(`${field} is required`);
    }
    const data = await workforceClassificationService.classify(
      {
        employeeId: body.employeeId,
        nationality: body.nationality,
        countryOfEmployment: body.countryOfEmployment,
        reason: body.reason,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
      },
      { tenantId: ctx.user.tenantId, userId: ctx.user.id }
    );
    return created(data, 'Classification recorded');
  } catch (err) {
    return serverError('Failed to classify employee', err);
  }
});
