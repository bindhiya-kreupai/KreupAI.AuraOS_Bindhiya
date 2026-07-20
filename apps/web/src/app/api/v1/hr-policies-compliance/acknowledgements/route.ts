import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrPolicyAcknowledgementService } from '@/lib/services/hr-policies-compliance';
import {
  badRequest,
  created,
  forbidden,
  hasAny,
  ok,
  serverError,
  type RouteContext,
} from '../_shared';

export const dynamic = 'force-dynamic';

/**
 * S08 — dedicated acknowledgement API.
 *
 *   GET ?policyId=…          → per-employee ack rows for one policy (paginated)
 *   GET ?view=coverage       → per-policy coverage summary (published policies)
 *   GET ?view=mine           → policies the current employee must acknowledge
 *   POST { action:'acknowledge', policyId } → self-acknowledge (employee)
 */
export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const view = url.searchParams.get('view');
    const employeeId = (ctx as unknown as { employeeId?: string }).employeeId;

    if (view === 'mine') {
      if (!employeeId) return badRequest('no employee linked to user', 'لا يوجد موظف مرتبط');
      return ok(
        await hrPolicyAcknowledgementService.pendingForEmployee(ctx.user.tenantId, employeeId)
      );
    }
    if (view === 'coverage') {
      const totalEmployees = Number(url.searchParams.get('totalEmployees') ?? '100');
      return ok(
        await hrPolicyAcknowledgementService.coverageByPolicy(ctx.user.tenantId, totalEmployees)
      );
    }
    const policyId = url.searchParams.get('policyId');
    if (!policyId) return badRequest('policyId required', 'معرّف السياسة مطلوب');
    return ok(
      await hrPolicyAcknowledgementService.listForPolicy(ctx.user.tenantId, policyId, {
        page: Number(url.searchParams.get('page') ?? '1'),
        pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
      })
    );
  } catch (err) {
    return serverError('Failed to list acknowledgements', err, 'فشل في جلب الإقرارات');
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  // Any authenticated user may acknowledge policies that apply to them.
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    const employeeId = (ctx as unknown as { employeeId?: string }).employeeId;
    if (body.action === 'acknowledge') {
      if (!employeeId) return badRequest('no employee linked to user', 'لا يوجد موظف مرتبط');
      if (!body.policyId) return badRequest('policyId required', 'معرّف السياسة مطلوب');
      return created(
        await hrPolicyAcknowledgementService.acknowledge(
          {
            policyId: body.policyId,
            employeeId,
            ipAddress:
              req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
            userAgent: req.headers.get('user-agent') ?? undefined,
          },
          auth
        ),
        'Acknowledged'
      );
    }
    return badRequest('unknown action', 'إجراء غير معروف');
  } catch (err) {
    return serverError('Failed to acknowledge policy', err, 'فشل في تسجيل الإقرار');
  }
});
