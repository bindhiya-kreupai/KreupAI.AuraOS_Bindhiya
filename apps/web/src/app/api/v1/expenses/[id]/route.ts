import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { expenseService } from '@/lib/services/expense.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (
    _request: NextRequest,
    context: {
      user: { tenantId: string };
      permissions: string[];
      params: { id: string };
    }
  ) => {
    if (!context.permissions.includes('expenses:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing expenses:read' } },
        { status: 403 }
      );
    }
    const item = await expenseService.getById(context.params.id, context.user.tenantId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'E4040', message: 'Expense claim not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: item });
  }
);
