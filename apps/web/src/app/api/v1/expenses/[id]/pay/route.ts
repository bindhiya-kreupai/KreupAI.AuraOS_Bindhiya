import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { expenseService, InvalidExpenseTransitionError } from '@/lib/services/expense.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/expenses/[id]/pay
 * Body: { paidReference }
 * Marks an APPROVED claim PAID. Rejects placeholder references (< 3 chars) —
 * mirrors the statutory-reports submission-reference contract that closes #85.
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
        if (!context.permissions.includes('expenses:pay')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing expenses:pay' } },
            { status: 403 }
          );
        }
        const body = await request.json().catch(() => ({}));
        if (!body?.paidReference) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'paidReference required' } },
            { status: 400 }
          );
        }
        const updated = await expenseService.markPaid(
          context.params.id,
          context.user.tenantId,
          context.user.id,
          String(body.paidReference)
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Expense claim not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Paid' });
      } catch (error) {
        if (error instanceof InvalidExpenseTransitionError) {
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
              message: 'Pay failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'expense_claim', captureRequestBody: true }
);
