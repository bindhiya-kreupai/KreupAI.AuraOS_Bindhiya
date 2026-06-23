import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nitaqatConfigService } from '@/lib/services/nitaqat-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await nitaqatConfigService.listConfigs(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to load configs', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const f of [
      'establishmentName',
      'sector',
      'sizeBracket',
      'saudiHeadcount',
      'totalHeadcount',
    ]) {
      if (body[f] == null) return badRequest(`${f} required`);
    }
    return ok(
      await nitaqatConfigService.upsertConfig(body, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      }),
      'Config saved'
    );
  } catch (err) {
    return serverError('Failed to update config', err);
  }
});
