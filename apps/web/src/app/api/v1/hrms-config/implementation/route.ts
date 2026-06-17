import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrmsImplementationService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

// EPIC-34-S27 — implementation checklist / control sheet.

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const phase = url.searchParams.get('phase') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;
    return ok(
      await hrmsImplementationService.list(ctx.user.tenantId, {
        phase: phase as any,
        status: status as any,
      })
    );
  } catch (err) {
    return serverError('Failed to list implementation items', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'seed') {
      return ok(await hrmsImplementationService.seed(auth), 'Default checklist seeded');
    }

    if (body.action === 'update') {
      if (!body.code) return badRequest('code required');
      const data = await hrmsImplementationService.update(
        body.code,
        {
          status: body.status,
          owner: body.owner,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          evidenceUrl: body.evidenceUrl,
          notes: body.notes,
        },
        auth
      );
      return ok(data, 'Updated');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update implementation item', err);
  }
});
