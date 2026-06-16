import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { countryRulePackService } from '@/lib/services/gcc-rule-library';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    return ok(await countryRulePackService.listThemes());
  } catch (err) {
    return serverError('Failed to list themes', err);
  }
});
