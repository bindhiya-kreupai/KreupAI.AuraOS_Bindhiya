import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  expenseService,
  InvalidExpenseTransitionError,
  PolicyViolationError,
} from '@/lib/services/expense.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      _request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params: { id: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('expenses:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing expenses:create' } },
            { status: 403 }
          );
        }
        const updated = await expenseService.submit(
          context.params.id,
          context.user.tenantId,
          context.user.id
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Expense claim not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Submitted' });
      } catch (error) {
        if (error instanceof InvalidExpenseTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        if (error instanceof PolicyViolationError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E4220',
                message: error.message,
                details: { failures: error.failures },
              },
            },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Submit failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'expense_claim' }
);
