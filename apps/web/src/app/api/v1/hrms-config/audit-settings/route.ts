import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { auditTrailSettingService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');
    if (domain) return ok(await auditTrailSettingService.policy(ctx.user.tenantId, domain));
    return ok(await auditTrailSettingService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list audit settings', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.domain) return badRequest('domain required');
      return ok(
        await auditTrailSettingService.upsert(
          {
            domain: body.domain,
            captureReads: body.captureReads,
            captureWrites: body.captureWrites,
            captureExports: body.captureExports,
            retentionYears: body.retentionYears,
            piiClassification: body.piiClassification,
            isActive: body.isActive,
          },
          auth
        ),
        'Saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update audit setting', err);
  }
});
