import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch current user's leave requests from database
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, employeeId }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const year = searchParams.get('year') || new Date().getFullYear().toString();

      const tenantId = user.tenantId;
      // Use employeeId from auth context if available, otherwise fall back to userId
      const currentEmployeeId = employeeId || user.userId;

      const yearStart = new Date(parseInt(year), 0, 1);
      const yearEnd = new Date(parseInt(year), 11, 31, 23, 59, 59);

      const where: Record<string, unknown> = {
        tenantId,
        employeeId: currentEmployeeId,
        appliedAt: {
          gte: yearStart,
          lte: yearEnd,
        },
      };
      if (status) where.status = status;

      const leaves = await prisma.leaveRequest.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
      });

      // Calculate summary from real data
      const summary = {
        total: leaves.length,
        approved: leaves.filter(l => l.status === 'APPROVED').length,
        pending: leaves.filter(l => l.status === 'PENDING').length,
        rejected: leaves.filter(l => l.status === 'REJECTED').length,
        cancelled: leaves.filter(l => l.status === 'CANCELLED').length,
        totalDaysUsed: leaves
          .filter(l => l.status === 'APPROVED')
          .reduce((sum, l) => sum + Number(l.totalDays), 0),
      };

      return NextResponse.json({
        success: true,
        data: { leaves, summary },
      });
    } catch (error) {
      logger.error('Error fetching my leaves:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave requests' },
        { status: 500 }
      );
    }
  }
);
