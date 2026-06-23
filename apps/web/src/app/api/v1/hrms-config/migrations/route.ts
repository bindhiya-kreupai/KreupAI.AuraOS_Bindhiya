import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrmsMigrationService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

// EPIC-34-S26 — data migration plan / run / validation registry.

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const domainCode = url.searchParams.get('domainCode') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;
    return ok(
      await hrmsMigrationService.list(
        ctx.user.tenantId,
        {
          domainCode,
          status: status as any,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list migrations', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'upsert') {
      if (
        !body.planCode ||
        !body.label ||
        !body.domainCode ||
        !body.sourceSystem ||
        !body.targetEntity
      ) {
        return badRequest('planCode/label/domainCode/sourceSystem/targetEntity required');
      }
      return ok(
        await hrmsMigrationService.upsert(
          {
            planCode: body.planCode,
            label: body.label,
            domainCode: body.domainCode,
            sourceSystem: body.sourceSystem,
            targetEntity: body.targetEntity,
            expectedRows: body.expectedRows,
            notes: body.notes,
          },
          auth
        ),
        'Plan saved'
      );
    }

    if (body.action === 'record-run') {
      if (!body.planCode || !body.status) return badRequest('planCode/status required');
      return ok(
        await hrmsMigrationService.recordRun(
          body.planCode,
          {
            status: body.status,
            inserted: body.inserted,
            updated: body.updated,
            skipped: body.skipped,
            errors: body.errors,
            validationsPassed: body.validationsPassed,
            validationsJson: body.validationsJson,
            notes: body.notes,
          },
          auth
        ),
        'Run recorded'
      );
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update migration', err);
  }
});
