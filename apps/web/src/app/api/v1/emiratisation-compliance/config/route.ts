import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { emiratisationConfigService } from '@/lib/services/emiratisation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await emiratisationConfigService.listConfigs(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to load configs', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    for (const f of ['establishmentName', 'skilledWorkforceCount']) {
      if (body[f] == null) return badRequest(`${f} required`);
    }
    return ok(await emiratisationConfigService.upsertConfig(body, auth), 'Config saved');
  } catch (err) {
    return serverError('Failed to update config', err);
  }
});
