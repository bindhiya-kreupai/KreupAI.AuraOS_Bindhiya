import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrFormSubmissionService } from '@/lib/services/hr-forms-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const submissionStateId = url.searchParams.get('submissionStateId');
    if (!submissionStateId) return badRequest('submissionStateId required');
    return ok(await hrFormSubmissionService.listSignatures(ctx.user.tenantId, submissionStateId));
  } catch (err) {
    return serverError('Failed to list signatures', err);
  }
});
