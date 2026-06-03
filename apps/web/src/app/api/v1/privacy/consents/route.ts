import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { consentRecordService, type ConsentPurpose } from '@/lib/services/consent-record.service';

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
    const result = await consentRecordService.list({
      tenantId: context.user.tenantId,
      subjectId: url.searchParams.get('subjectId') ?? undefined,
      purpose: (url.searchParams.get('purpose') as ConsentPurpose) ?? undefined,
      policyVersion: url.searchParams.get('policyVersion') ?? undefined,
      activeOnly: url.searchParams.get('activeOnly') === 'true',
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
      context: { user: { tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('privacy:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing privacy:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.subjectId || !body?.purpose || !body?.policyVersion || !body?.legalBasis) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'subjectId, purpose, policyVersion, legalBasis required',
              },
            },
            { status: 400 }
          );
        }
        const ipAddress =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          request.headers.get('x-real-ip') ??
          undefined;
        const created = await consentRecordService.grant({
          tenantId: context.user.tenantId,
          subjectId: body.subjectId,
          subjectType: body.subjectType,
          purpose: body.purpose,
          policyVersion: body.policyVersion,
          legalBasis: body.legalBasis,
          ipAddress,
          userAgent: request.headers.get('user-agent') ?? undefined,
          notes: body.notes,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Consent granted' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to record consent',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'consent_record', captureRequestBody: true }
);
