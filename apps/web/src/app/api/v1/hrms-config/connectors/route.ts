import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrmsConnectorService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

// EPIC-34-S25 — connector / integration endpoint registry.

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const kind = url.searchParams.get('kind') ?? undefined;
    const isActiveParam = url.searchParams.get('isActive');
    const health = url.searchParams.get('health') ?? undefined;
    return ok(
      await hrmsConnectorService.list(ctx.user.tenantId, {
        kind: kind as any,
        isActive: isActiveParam == null ? undefined : isActiveParam === 'true',
        health: health as any,
      })
    );
  } catch (err) {
    return serverError('Failed to list connectors', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'upsert') {
      if (!body.connectorCode || !body.label || !body.kind) {
        return badRequest('connectorCode/label/kind required');
      }
      return ok(
        await hrmsConnectorService.upsert(
          {
            connectorCode: body.connectorCode,
            label: body.label,
            kind: body.kind,
            direction: body.direction,
            endpointUrl: body.endpointUrl,
            authType: body.authType,
            secretRef: body.secretRef,
            configJson: body.configJson,
            isActive: body.isActive,
          },
          auth
        ),
        'Connector saved'
      );
    }

    if (body.action === 'mark-rotated') {
      if (!body.connectorCode) return badRequest('connectorCode required');
      return ok(
        await hrmsConnectorService.markRotated(body.connectorCode, auth),
        'Rotation recorded'
      );
    }

    if (body.action === 'record-health') {
      if (!body.connectorCode || !body.status) {
        return badRequest('connectorCode/status required');
      }
      return ok(
        await hrmsConnectorService.recordHealth(
          body.connectorCode,
          { status: body.status, message: body.message },
          auth
        ),
        'Health recorded'
      );
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update connector', err);
  }
});
