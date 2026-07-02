import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrFormTemplateService } from '@/lib/services/hr-forms-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hrFormTemplateService.list(
        ctx.user.tenantId,
        {
          formGroup: url.searchParams.get('formGroup') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list templates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-defaults') {
      return ok(await hrFormTemplateService.seedDefaults(auth));
    }
    if (body.action === 'create') {
      for (const f of ['templateCode', 'formGroup', 'label']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await hrFormTemplateService.create(body, auth), 'Created');
    }
    if (body.action === 'update') {
      if (!body.id) return badRequest('id required');
      return ok(await hrFormTemplateService.update(body.id, body, auth), 'Updated');
    }
    if (body.action === 'publish') {
      if (!body.id) return badRequest('id required');
      return ok(await hrFormTemplateService.publish(body.id, auth), 'Published');
    }
    if (body.action === 'supersede') {
      if (!body.id || !body.supersededById) return badRequest('id and supersededById required');
      return ok(await hrFormTemplateService.supersede(body.id, body.supersededById, auth));
    }
    if (body.action === 'supersede-version') {
      if (!body.id) return badRequest('id required');
      return ok(
        await hrFormTemplateService.createSupersedingVersion(body.id, auth),
        'New draft version created'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update template', err);
  }
});
