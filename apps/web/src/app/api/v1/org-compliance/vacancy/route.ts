import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { orgVacancyService } from '@/lib/services/org-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org_compliance:read', 'organization:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await orgVacancyService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list vacancies', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org_compliance:manage', 'organization:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      if (!body.vacancyNumber) return badRequest('vacancyNumber required');
      return ok(await orgVacancyService.raise(body, auth), 'Raised');
    }
    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(await orgVacancyService.approve(body.id, auth), 'Approved');
    }
    if (body.action === 'fill') {
      if (!body.id) return badRequest('id required');
      return ok(await orgVacancyService.fill(body.id, body.candidateId, auth), 'Filled');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update vacancy', err);
  }
});
