import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { documentPhysicalLocationService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await documentPhysicalLocationService.list(ctx.user.tenantId, {
        warehouseCode: url.searchParams.get('warehouseCode') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list physical locations', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.documentRef || !body.warehouseCode) {
        return badRequest('documentRef/warehouseCode required');
      }
      return ok(
        await documentPhysicalLocationService.upsert(
          {
            documentRef: body.documentRef,
            warehouseCode: body.warehouseCode,
            boxCode: body.boxCode,
            shelfCode: body.shelfCode,
            fileCode: body.fileCode,
            notes: body.notes,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'check-out') {
      if (!body.documentRef) return badRequest('documentRef required');
      return ok(
        await documentPhysicalLocationService.checkOut(body.documentRef, auth),
        'Checked out'
      );
    }
    if (body.action === 'check-in') {
      if (!body.documentRef) return badRequest('documentRef required');
      return ok(
        await documentPhysicalLocationService.checkIn(body.documentRef, auth),
        'Checked in'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update physical location', err);
  }
});
