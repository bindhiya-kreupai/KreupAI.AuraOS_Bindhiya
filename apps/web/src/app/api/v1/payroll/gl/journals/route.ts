import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  glPostingService,
  type GLEntryStatus,
  type GLSourceType,
  UnbalancedJournalError,
} from '@/lib/services/gl-posting.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('payroll:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing payroll:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const result = await glPostingService.list({
      tenantId: context.user.tenantId,
      status: (url.searchParams.get('status') as GLEntryStatus) ?? undefined,
      sourceType: (url.searchParams.get('sourceType') as GLSourceType) ?? undefined,
      sourceId: url.searchParams.get('sourceId') ?? undefined,
      countryCode: url.searchParams.get('countryCode') ?? undefined,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
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
        if (!context.permissions.includes('payroll:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing payroll:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const required = [
          'countryCode',
          'entryDate',
          'reference',
          'sourceType',
          'sourceId',
          'lines',
        ];
        for (const f of required) {
          if (!body[f]) {
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `${f} required` } },
              { status: 400 }
            );
          }
        }
        const draft = await glPostingService.createDraft({
          tenantId: context.user.tenantId,
          countryCode: body.countryCode,
          currency: body.currency,
          entryDate: new Date(body.entryDate),
          reference: body.reference,
          description: body.description,
          sourceType: body.sourceType,
          sourceId: body.sourceId,
          lines: body.lines,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: draft, message: 'Journal entry created' },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof UnbalancedJournalError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4220', message: error.message } },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create journal entry',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.PAYROLL_RUN_INITIATED,
    resourceType: 'gl_journal',
    captureRequestBody: true,
  }
);
