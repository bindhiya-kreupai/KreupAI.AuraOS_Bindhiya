import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceChecklistService } from '@/lib/services/compliance-audit-register';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceChecklistService.list(ctx.user.tenantId, {
        domainCode: url.searchParams.get('domainCode') ?? undefined,
        categoryCode: url.searchParams.get('categoryCode') ?? undefined,
        status: (url.searchParams.get('status') as any) ?? undefined,
        isMandatory:
          url.searchParams.get('isMandatory') === null
            ? undefined
            : url.searchParams.get('isMandatory') === 'true',
      })
    );
  } catch (err) {
    return serverError('Failed to list checklist items', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed') {
      if (!body.domainCode) return badRequest('domainCode required');
      return ok(await complianceChecklistService.seed(body.domainCode, auth), 'Seeded');
    }
    if (body.action === 'update') {
      if (!body.itemCode || !body.domainCode) {
        return badRequest('itemCode/domainCode required');
      }
      return ok(
        await complianceChecklistService.update(
          body.itemCode,
          body.domainCode,
          {
            status: body.status,
            owner: body.owner,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            evidenceUrl: body.evidenceUrl,
            notes: body.notes,
          },
          auth
        ),
        'Updated'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update checklist item', err);
  }
});
