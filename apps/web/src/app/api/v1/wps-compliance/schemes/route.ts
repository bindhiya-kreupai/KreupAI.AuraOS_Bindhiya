import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { wpsSchemeService } from '@/lib/services/wps-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'compliance_kpi:read'))
    return forbidden();
  try {
    return ok(await wpsSchemeService.listSchemes());
  } catch (err) {
    return serverError('Failed to list schemes', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed') return ok(await wpsSchemeService.seedSchemes(), 'Schemes seeded');
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update schemes', err);
  }
});
