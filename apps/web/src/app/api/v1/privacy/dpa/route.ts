import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { dpaService, type DPAStatus } from '@/lib/services/dpa.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('privacy:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing privacy:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    if (url.searchParams.get('expiryWatch') === 'true') {
      const within = Number(url.searchParams.get('withinDays')) || 60;
      const items = await dpaService.expiryWatch(context.user.tenantId, within);
      return NextResponse.json({ success: true, items, total: items.length });
    }
    const result = await dpaService.list({
      tenantId: context.user.tenantId,
      status: (url.searchParams.get('status') as DPAStatus) ?? undefined,
      vendorName: url.searchParams.get('vendorName') ?? undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 50,
    });
    return NextResponse.json({ success: true, ...result });
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('privacy:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing privacy:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.vendorName || !body?.scope || !body?.effectiveFrom) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'vendorName, scope, effectiveFrom required' },
            },
            { status: 400 }
          );
        }
        const created = await dpaService.create({
          tenantId: context.user.tenantId,
          vendorName: body.vendorName,
          vendorCountry: body.vendorCountry,
          scope: body.scope,
          effectiveFrom: new Date(body.effectiveFrom),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
          isSubProcessor: body.isSubProcessor,
          jurisdiction: body.jurisdiction,
          transferMechanism: body.transferMechanism,
          documentUrl: body.documentUrl,
          notes: body.notes,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'DPA draft created' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create DPA',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'dpa', captureRequestBody: true }
);
