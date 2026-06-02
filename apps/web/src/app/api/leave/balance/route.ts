import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch leave balances from database
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const year = searchParams.get('year') || new Date().getFullYear().toString();
      const policyId = searchParams.get('policyId');

      const tenantId = user.tenantId;

      const where: Record<string, unknown> = {
        tenantId,
        employeeId,
        leaveYear: parseInt(year),
      };
      if (policyId) where.policyId = policyId;

      const balances = await prisma.leaveBalance.findMany({
        where,
        include: { policy: true },
        orderBy: { lastUpdated: 'desc' },
      });

      // Calculate summary from real data
      const summary = {
        totalAllocated: balances.reduce((sum, b) => sum + Number(b.openingBalance) + Number(b.accrued) + Number(b.carriedForward), 0),
        totalUsed: balances.reduce((sum, b) => sum + Number(b.taken), 0),
        totalPending: 0, // Would require counting pending leave requests
        totalAvailable: balances.reduce((sum, b) => sum + Number(b.currentBalance), 0),
      };

      return NextResponse.json({
        success: true,
        balances,
        leaveBalances: balances,
        data: {
          employeeId,
          year: parseInt(year),
          balances,
          summary,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching leave balance:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave balance' },
        { status: 500 }
      );
    }
  }
);
