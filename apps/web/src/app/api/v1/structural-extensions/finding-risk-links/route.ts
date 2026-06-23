import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { auditFindingRiskLinkService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await auditFindingRiskLinkService.list(
        ctx.user.tenantId,
        {
          findingRef: url.searchParams.get('findingRef') ?? undefined,
          riskCode: url.searchParams.get('riskCode') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list finding-risk links', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'link') return badRequest('unknown action');
    if (!body.findingRef || !body.domainCode || !body.riskCode) {
      return badRequest('findingRef/domainCode/riskCode required');
    }
    return ok(
      await auditFindingRiskLinkService.link(
        {
          findingRef: body.findingRef,
          domainCode: body.domainCode,
          riskCode: body.riskCode,
          linkType: body.linkType,
          notes: body.notes,
        },
        auth
      ),
      'Linked'
    );
  } catch (err) {
    return serverError('Failed to link finding to risk', err);
  }
});
