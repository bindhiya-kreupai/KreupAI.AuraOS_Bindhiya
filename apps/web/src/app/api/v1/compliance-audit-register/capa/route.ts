import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceCorrectiveActionService } from '@/lib/services/compliance-audit-register';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const sourceDomain = url.searchParams.get('sourceDomain') ?? undefined;
    const sourceRef = url.searchParams.get('sourceRef') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;

    const data = await complianceCorrectiveActionService.list(ctx.user.tenantId, {
      sourceDomain,
      sourceRef,
      status,
    });
    return ok(data);
  } catch (err) {
    return serverError('Failed to list CAPA corrective actions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'create') {
      if (!body.sourceDomain || !body.title) {
        return badRequest('sourceDomain and title are required');
      }
      const data = await complianceCorrectiveActionService.create(
        {
          sourceDomain: body.sourceDomain,
          sourceRef: body.sourceRef,
          title: body.title,
          description: body.description,
          rootCause: body.rootCause,
          severity: body.severity,
          priority: body.priority,
          ownerId: body.ownerId,
          dueAt: body.dueAt,
        },
        auth
      );
      return ok(data, 'CAPA Action created');
    }

    if (body.action === 'update') {
      if (!body.id) return badRequest('id is required');
      const data = await complianceCorrectiveActionService.update(
        body.id,
        {
          title: body.title,
          description: body.description,
          rootCause: body.rootCause,
          severity: body.severity,
          priority: body.priority,
          ownerId: body.ownerId,
          dueAt: body.dueAt,
          status: body.status,
          verificationNotes: body.verificationNotes,
        },
        auth
      );
      return ok(data, 'CAPA Action updated');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to manage CAPA corrective action', err);
  }
});
