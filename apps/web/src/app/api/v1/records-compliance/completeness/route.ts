import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { recordsCompletenessService } from '@/lib/services/records-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const period =
      url.searchParams.get('period') ??
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return ok(
      await recordsCompletenessService.list(ctx.user.tenantId, period, {
        band: (url.searchParams.get('band') as any) ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list completeness', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (
        !body.period ||
        !body.employeeId ||
        body.mandatoryTotal == null ||
        body.mandatoryPresent == null
      )
        return badRequest('period, employeeId, mandatoryTotal, mandatoryPresent required');
      return ok(await recordsCompletenessService.upsert(body, auth), 'Saved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update completeness', err);
  }
});
