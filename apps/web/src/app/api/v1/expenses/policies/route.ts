import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/expenses/policies
 * Get expense policies for the tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('expenses:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing expenses:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'Active';

    const policies = await prisma.expensePolicy.findMany({
      where: {
        tenantId: user.tenantId,
        status,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { reports: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: policies,
      meta: {
        total: policies.length,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Expense Policies API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch expense policies' } },
      { status: 500 }
    );
  }
});
