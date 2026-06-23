import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceRiskService } from '@/lib/services/compliance-audit-register';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceRiskService.list(
        ctx.user.tenantId,
        {
          domainCode: url.searchParams.get('domainCode') ?? undefined,
          band: (url.searchParams.get('band') as any) ?? undefined,
          status: (url.searchParams.get('status') as any) ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list risks', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed') {
      if (!body.domainCode) return badRequest('domainCode required');
      return ok(await complianceRiskService.seed(body.domainCode, auth), 'Seeded');
    }
    if (body.action === 'upsert') {
      if (
        !body.domainCode ||
        !body.riskCode ||
        !body.title ||
        body.likelihood == null ||
        body.impact == null
      ) {
        return badRequest('domainCode/riskCode/title/likelihood/impact required');
      }
      return ok(
        await complianceRiskService.upsert(
          {
            domainCode: body.domainCode,
            riskCode: body.riskCode,
            title: body.title,
            description: body.description,
            category: body.category,
            likelihood: body.likelihood,
            impact: body.impact,
            ownerRole: body.ownerRole,
            controlRef: body.controlRef,
            mitigationPlan: body.mitigationPlan,
            status: body.status,
          },
          auth
        ),
        'Risk saved'
      );
    }
    if (body.action === 'review') {
      if (!body.domainCode || !body.riskCode) return badRequest('domainCode/riskCode required');
      return ok(
        await complianceRiskService.review(
          body.riskCode,
          body.domainCode,
          { mitigationPlan: body.mitigationPlan, status: body.status },
          auth
        ),
        'Reviewed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update risk', err);
  }
});
