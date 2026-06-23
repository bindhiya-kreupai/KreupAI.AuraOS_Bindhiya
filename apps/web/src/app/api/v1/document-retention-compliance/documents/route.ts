import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrDocumentService } from '@/lib/services/document-retention-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hrDocumentService.list(
        ctx.user.tenantId,
        {
          employeeId: url.searchParams.get('employeeId') ?? undefined,
          recordType: url.searchParams.get('recordType') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
          expiringSoon: url.searchParams.get('expiringSoon') === 'true',
          onLitigationHold: url.searchParams.get('onLitigationHold') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list documents', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.recordType || !body.title) return badRequest('recordType and title required');
      return ok(
        await hrDocumentService.upsert(
          {
            ...body,
            issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          },
          auth
        ),
        'Saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update document', err);
  }
});
