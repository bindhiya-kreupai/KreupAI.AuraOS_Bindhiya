import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { glPostingService, InvalidGLTransitionError } from '@/lib/services/gl-posting.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/payroll/gl/journals/[id]/reverse
 * Body: { reason: string }
 *
 * Creates an offsetting reversal entry (debit/credit flipped) and marks the
 * original journal REVERSED. Transitions {DRAFT|POSTED|EXPORTED} → REVERSED.
 * Permission: payroll:approve.
 */
export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params: { id: string };
      }
    ) => {
      const meta = {
        timestamp: new Date().toISOString(),
        requestId: request.headers.get('x-request-id') ?? crypto.randomUUID(),
        apiVersion: 'v1',
      };
      try {
        if (!context.permissions.includes('payroll:approve')) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E4030',
                message: 'missing payroll:approve',
                messageAr: 'صلاحية الموافقة على الرواتب مفقودة',
              },
              meta,
            },
            { status: 403 }
          );
        }

        const body = await request.json().catch(() => ({}));
        const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
        if (reason.length < 3) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'A reversal reason is required (min 3 characters)',
                messageAr: 'سبب عكس القيد مطلوب (٣ أحرف على الأقل)',
              },
              meta,
            },
            { status: 400 }
          );
        }

        const reversal = await glPostingService.reverse(
          context.params.id,
          context.user.tenantId,
          context.user.id
        );
        if (!reversal) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E4040',
                message: 'Journal entry not found',
                messageAr: 'قيد اليومية غير موجود',
              },
              meta,
            },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: reversal, message: 'Reversed', meta });
      } catch (error) {
        if (error instanceof InvalidGLTransitionError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E4090',
                message: error.message,
                messageAr: 'انتقال حالة قيد اليومية غير صالح',
              },
              meta,
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Reverse failed',
              messageAr: 'فشل عكس القيد',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
            meta,
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.PAYROLL_RUN_APPROVED, resourceType: 'gl_journal', captureRequestBody: true }
);
