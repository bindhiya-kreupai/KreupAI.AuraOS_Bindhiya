import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { dashboardSummary, SUPPORTED_DOMAINS } from '@/lib/services/compliance-audit-register';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const perDomain = await dashboardSummary(ctx.user.tenantId);
    return ok({ supportedDomains: SUPPORTED_DOMAINS, perDomain });
  } catch (err) {
    return serverError('Failed to load dashboard', err);
  }
});
