import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  labourMinistrySubmissionService,
  type Authority,
  type SubmissionStatus,
} from '@/lib/services/labour-ministry-submission.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('compliance/statutory-reports:read')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4030', message: 'missing compliance/statutory-reports:read' },
        },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const result = await labourMinistrySubmissionService.list({
      tenantId: context.user.tenantId,
      authority: (url.searchParams.get('authority') as Authority) ?? undefined,
      countryCode: url.searchParams.get('countryCode') ?? undefined,
      status: (url.searchParams.get('status') as SubmissionStatus) ?? undefined,
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
        if (!context.permissions.includes('compliance:reports:generate')) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4030', message: 'missing compliance:reports:generate' },
            },
            { status: 403 }
          );
        }
        const body = await request.json();
        const required = [
          'countryCode',
          'authority',
          'submissionType',
          'periodStart',
          'periodEnd',
          'payload',
          'format',
        ];
        for (const f of required) {
          if (body[f] === undefined || body[f] === null) {
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `${f} required` } },
              { status: 400 }
            );
          }
        }
        const created = await labourMinistrySubmissionService.createDraft({
          tenantId: context.user.tenantId,
          countryCode: body.countryCode,
          authority: body.authority,
          submissionType: body.submissionType,
          periodStart: new Date(body.periodStart),
          periodEnd: new Date(body.periodEnd),
          payload: body.payload,
          format: body.format,
          notes: body.notes,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Draft submission created' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create ministry submission',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.REPORT_GENERATED,
    resourceType: 'labour_ministry_submission',
    captureRequestBody: true,
  }
);
