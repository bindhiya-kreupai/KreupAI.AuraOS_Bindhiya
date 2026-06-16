import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceCalendarService } from '@/lib/services/compliance-calendar';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceCalendarService.listRules(ctx.user.tenantId, {
        categoryCode: url.searchParams.get('categoryCode') ?? undefined,
        countryCode: url.searchParams.get('countryCode') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list rules', err);
  }
});
