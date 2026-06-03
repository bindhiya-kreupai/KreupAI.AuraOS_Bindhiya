import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  consentRecordService,
  ConsentAlreadyRevokedError,
  ConsentNotGrantedError,
} from '@/lib/services/consent-record.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { tenantId: string };
        permissions: string[];
        params: { id: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('privacy:update')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing privacy:update' } },
            { status: 403 }
          );
        }
        const body = await request.json().catch(() => ({}));
        const updated = await consentRecordService.revoke(
          context.params.id,
          context.user.tenantId,
          body.reason
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Consent not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Consent revoked',
        });
      } catch (error) {
        if (error instanceof ConsentAlreadyRevokedError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        if (error instanceof ConsentNotGrantedError) {
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
              message: 'Failed to revoke consent',
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
