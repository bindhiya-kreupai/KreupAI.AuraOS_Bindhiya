import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { dsarService, type DSARStatus, type DSARRequestType } from '@/lib/services/dsar.service';

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
    const result = await dsarService.list({
      tenantId: context.user.tenantId,
      status: (url.searchParams.get('status') as DSARStatus) ?? undefined,
      requestType: (url.searchParams.get('requestType') as DSARRequestType) ?? undefined,
      overdue: url.searchParams.get('overdue') === 'true',
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
        if (!body?.subjectEmail || !body?.requestType) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'subjectEmail, requestType required' },
            },
            { status: 400 }
          );
        }
        const created = await dsarService.receive({
          tenantId: context.user.tenantId,
          subjectType: body.subjectType,
          subjectId: body.subjectId,
          subjectEmail: body.subjectEmail,
          requestType: body.requestType,
          legalBasis: body.legalBasis,
          notes: body.notes,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'DSAR received' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to receive DSAR',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'dsar_request', captureRequestBody: true }
);
