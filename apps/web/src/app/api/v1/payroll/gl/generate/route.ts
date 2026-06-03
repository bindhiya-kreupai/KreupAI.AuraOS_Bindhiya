import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { glPostingService, UnbalancedJournalError } from '@/lib/services/gl-posting.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/payroll/gl/generate
 * Body: { payrollRunId, entryDate, countryCode, currency? }
 *
 * Aggregates payslips on the run by component code, looks up GL account
 * mappings, and emits a balanced DRAFT journal. Returns the journal plus
 * a warnings array surfacing any missing mappings — the caller fixes the
 * mappings, deletes the draft, regenerates.
 */
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
        if (!body?.payrollRunId || !body?.entryDate || !body?.countryCode) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'payrollRunId, entryDate, countryCode required',
              },
            },
            { status: 400 }
          );
        }
        const result = await glPostingService.generatePayrollJournal({
          tenantId: context.user.tenantId,
          payrollRunId: body.payrollRunId,
          entryDate: new Date(body.entryDate),
          countryCode: body.countryCode,
          currency: body.currency,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: result, message: 'Draft journal generated' },
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
              message: 'Journal generation failed',
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
