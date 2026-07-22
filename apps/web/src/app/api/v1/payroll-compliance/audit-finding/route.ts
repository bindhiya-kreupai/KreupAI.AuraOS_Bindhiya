import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { payrollAuditFindingService } from '@/lib/services/payroll-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll_compliance:read', 'payroll:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await payrollAuditFindingService.list(
        ctx.user.tenantId,
        {
          period: url.searchParams.get('period') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list audit findings', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'payroll_compliance:manage',
      'payroll:manage',
      'tenant:read',
      'dashboard:read'
    )
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      if (!body.findingNumber || !body.period || !body.category || !body.title)
        return badRequest('findingNumber, period, category, title required');
      return ok(
        await payrollAuditFindingService.raise(
          {
            findingNumber: body.findingNumber,
            period: body.period,
            country: body.country,
            category: body.category,
            controlCode: body.controlCode,
            title: body.title,
            description: body.description,
            severity: body.severity,
            evidence: body.evidence,
            ownerId: body.ownerId,
            dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
          },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'remediate') {
      if (!body.id || !body.remediation) return badRequest('id, remediation required');
      return ok(
        await payrollAuditFindingService.remediate(body.id, body.remediation, auth),
        'Remediated'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update audit finding', err);
  }
});
