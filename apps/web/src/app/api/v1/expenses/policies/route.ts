import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { expenseService } from '@/lib/services/expense.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (_request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('expenses:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing expenses:read' } },
        { status: 403 }
      );
    }
    const policies = await expenseService.listPolicies(context.user.tenantId);
    return NextResponse.json({ success: true, data: policies });
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('expenses:admin')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing expenses:admin' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.name) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'name required' } },
            { status: 400 }
          );
        }
        const created = await expenseService.createPolicy({
          tenantId: context.user.tenantId,
          name: body.name,
          description: body.description,
          countryCode: body.countryCode,
          categoryCaps: body.categoryCaps,
          receiptRequiredOver: body.receiptRequiredOver,
          requiresManagerOver: body.requiresManagerOver,
          requiresFinanceOver: body.requiresFinanceOver,
          perDiemRates: body.perDiemRates,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Policy created' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Policy create failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'expense_policy', captureRequestBody: true }
);
