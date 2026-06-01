import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/leaves/balance
 * Get leave balances for the current user (or specified employee)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leaves:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leaves:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employeeId') || user.employeeId;
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year,
      },
      include: {
        leaveType: { select: { id: true, name: true, code: true, isPaid: true } },
      },
      orderBy: { leaveType: { name: 'asc' } },
    });

    return NextResponse.json({
      success: true,
      data: balances,
      meta: {
        employeeId,
        year,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Leave Balance API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch leave balances' } },
      { status: 500 }
    );
  }
});
