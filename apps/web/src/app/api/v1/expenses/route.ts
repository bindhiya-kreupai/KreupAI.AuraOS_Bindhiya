import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { expenseService, type ExpenseStatus } from '@/lib/services/expense.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (
    request: NextRequest,
    context: { user: { id: string; tenantId: string }; permissions: string[] }
  ) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('expenses:read')) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E4030', message: 'missing expenses:read', messageAr: 'ممنوع' },
          },
          { status: 403 }
        );
      }
      const url = new URL(request.url);
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const result = await expenseService.listClaims({
        tenantId: user.tenantId,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: (url.searchParams.get('status') as ExpenseStatus) ?? undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        search: url.searchParams.get('search') ?? undefined,
        page: Number(url.searchParams.get('page')) || 1,
        limit: Number(url.searchParams.get('limit')) || 20,
      });
      return NextResponse.json({
        success: true,
        ...result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to list expense claims',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string; employeeId?: string };
        permissions: string[];
      }
    ) => {
      try {
        const { user, permissions } = context;
        if (!permissions.includes('expenses:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing expenses:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.title) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'title required' } },
            { status: 400 }
          );
        }

        const items = Array.isArray(body.items)
          ? body.items.map((i: any) => ({
              category: i.category,
              description: i.description,
              amount: Number(i.amount),
              currency: i.currency,
              expenseDate: new Date(i.expenseDate),
              receiptUrl: i.receiptUrl,
              merchant: i.merchant,
            }))
          : undefined;

        const created = await expenseService.createDraft({
          tenantId: user.tenantId,
          employeeId: body.employeeId ?? user.employeeId ?? user.id,
          title: body.title,
          description: body.description,
          currency: body.currency,
          policyId: body.policyId,
          items,
          actorId: user.id,
        });

        return NextResponse.json(
          { success: true, data: created, message: 'Draft expense claim created' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create expense claim',
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
