import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { wpsSubmissionService } from '@/lib/services/wps-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'compliance_kpi:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('submissionId');
    if (id) return ok(await wpsSubmissionService.detail(id));
    return ok(
      await wpsSubmissionService.list(ctx.user.tenantId, {
        period: url.searchParams.get('period') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
        countryCode: url.searchParams.get('countryCode') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list submissions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'compliance_kpi:read')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'build') {
      for (const f of ['countryCode', 'establishmentId', 'period', 'rows']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(await wpsSubmissionService.build(body, auth), 'Built');
    }
    if (body.action === 'generate') {
      for (const f of ['submissionId', 'employerId', 'establishmentName']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await wpsSubmissionService.generate(
          body.submissionId,
          { employerId: body.employerId, establishmentName: body.establishmentName },
          auth
        ),
        'Generated'
      );
    }
    if (body.action === 'validate') {
      if (!body.submissionId) return badRequest('submissionId required');
      return ok(await wpsSubmissionService.validate(body.submissionId, auth), 'Validated');
    }
    if (body.action === 'submit') {
      if (!body.submissionId) return badRequest('submissionId required');
      return ok(
        await wpsSubmissionService.submit(
          body.submissionId,
          body.submittedAt ? new Date(body.submittedAt) : new Date(),
          auth
        ),
        'Submitted'
      );
    }
    if (body.action === 'acknowledge') {
      if (!body.submissionId || !body.ackReference)
        return badRequest('submissionId/ackReference required');
      return ok(
        await wpsSubmissionService.acknowledge(body.submissionId, body.ackReference, auth),
        'Acknowledged'
      );
    }
    if (body.action === 'reconcile') {
      if (!body.submissionId || !Array.isArray(body.paidRows)) {
        return badRequest('submissionId + paidRows[] required');
      }
      return ok(
        await wpsSubmissionService.reconcile(
          body.submissionId,
          body.paidRows.map((r: { employeeCode: string; paidAt: string }) => ({
            employeeCode: r.employeeCode,
            paidAt: new Date(r.paidAt),
          })),
          auth
        ),
        'Reconciled'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update submission', err);
  }
});
