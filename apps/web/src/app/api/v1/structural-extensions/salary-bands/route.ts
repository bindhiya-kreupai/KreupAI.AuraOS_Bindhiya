import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { salaryGradeBandService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await salaryGradeBandService.list(
        ctx.user.tenantId,
        {
          country: url.searchParams.get('country') ?? undefined,
          isActive:
            url.searchParams.get('isActive') === null
              ? undefined
              : url.searchParams.get('isActive') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list salary bands', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'upsert') return badRequest('unknown action');
    if (
      !body.gradeCode ||
      !body.label ||
      body.minSalary == null ||
      body.midSalary == null ||
      body.maxSalary == null ||
      !body.effectiveFrom
    ) {
      return badRequest('gradeCode/label/min/mid/max/effectiveFrom required');
    }
    return ok(
      await salaryGradeBandService.upsert(
        {
          gradeCode: body.gradeCode,
          label: body.label,
          country: body.country,
          currency: body.currency,
          minSalary: body.minSalary,
          midSalary: body.midSalary,
          maxSalary: body.maxSalary,
          effectiveFrom: new Date(body.effectiveFrom),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
          isActive: body.isActive,
        },
        auth
      ),
      'Saved'
    );
  } catch (err) {
    return serverError('Failed to update salary band', err);
  }
});
