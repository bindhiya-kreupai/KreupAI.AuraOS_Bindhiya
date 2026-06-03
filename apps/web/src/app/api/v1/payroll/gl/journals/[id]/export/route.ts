import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  glPostingService,
  InvalidGLTransitionError,
  type AccountingSystem,
} from '@/lib/services/gl-posting.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/payroll/gl/journals/[id]/export
 * Body: { system: "QUICKBOOKS"|"XERO"|"SAP"|"TALLY"|"ZOHO_BOOKS", exportReference: string }
 *
 * Marks POSTED → EXPORTED with the real downstream-system reference.
 * Placeholder references (< 3 chars) are rejected — mirrors the #85
 * contract used by statutory reports / expense pay / COBRA notice.
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
      try {
        if (!context.permissions.includes('payroll:process')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing payroll:process' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.system || !body?.exportReference) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'system and exportReference required' },
            },
            { status: 400 }
          );
        }
        const updated = await glPostingService.markExported(
          context.params.id,
          context.user.tenantId,
          context.user.id,
          body.system as AccountingSystem,
          String(body.exportReference)
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Journal entry not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Exported' });
      } catch (error) {
        if (error instanceof InvalidGLTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Export failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.PAYROLL_RUN_APPROVED, resourceType: 'gl_journal', captureRequestBody: true }
);
