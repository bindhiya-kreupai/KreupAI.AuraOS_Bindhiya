import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrPolicyService } from '@/lib/services/hr-policies-compliance';
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

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (id) {
      const policy = await hrPolicyService.getById(id, ctx.user.tenantId);
      if (!policy) return badRequest('policy not found', 'لم يتم العثور على السياسة');
      return ok(policy);
    }
    return ok(
      await hrPolicyService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list policies', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create') {
      if (!body.title?.trim() || !body.category?.trim())
        return badRequest('title and category required', 'العنوان والفئة مطلوبان');
      return created(
        await hrPolicyService.create(
          {
            title: body.title,
            category: body.category,
            version: body.version,
            applicableTo: body.applicableTo,
            summary: body.summary,
            contentMarkdown: body.contentMarkdown,
            acknowledgementsRequired: body.acknowledgementsRequired,
            effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
            ownerName: body.ownerName,
          },
          auth
        ),
        'Created'
      );
    }
    if (body.action === 'update') {
      if (!body.policyId) return badRequest('policyId required', 'معرّف السياسة مطلوب');
      return ok(
        await hrPolicyService.update(
          body.policyId,
          {
            title: body.title,
            category: body.category,
            version: body.version,
            applicableTo: body.applicableTo,
            summary: body.summary,
            contentMarkdown: body.contentMarkdown,
            acknowledgementsRequired: body.acknowledgementsRequired,
            effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
            ownerName: body.ownerName,
          },
          auth
        ),
        'Updated'
      );
    }
    if (body.action === 'publish') {
      if (!body.policyId) return badRequest('policyId required');
      return ok(
        await hrPolicyService.publish(
          { policyId: body.policyId, intervalMonths: body.intervalMonths },
          auth
        ),
        'Published'
      );
    }
    if (body.action === 'archive') {
      if (!body.policyId) return badRequest('policyId required');
      return ok(await hrPolicyService.archive(body.policyId, auth), 'Archived');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update policy', err);
  }
});
