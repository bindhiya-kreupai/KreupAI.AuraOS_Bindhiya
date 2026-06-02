import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch leave calendar from database
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM
      const departmentId = searchParams.get('departmentId');
      const employeeId = searchParams.get('employeeId');

      const tenantId = user.tenantId;

      // Parse month to get date range
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0, 23, 59, 59); // Last day of month

      // Get approved and pending leave requests overlapping with the month
      const leaveWhere: Record<string, unknown> = {
        tenantId,
        status: { in: ['APPROVED', 'PENDING'] },
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      };
      if (employeeId) leaveWhere.employeeId = employeeId;

      const leaveRequests = await prisma.leaveRequest.findMany({
        where: leaveWhere,
        orderBy: { startDate: 'asc' },
      });

      // Format leave requests as calendar events
      const leaveEvents = leaveRequests.map(lr => ({
        id: lr.id,
        employeeId: lr.employeeId,
        leaveTypeId: lr.leaveTypeId,
        startDate: lr.startDate.toISOString().split('T')[0],
        endDate: lr.endDate.toISOString().split('T')[0],
        days: Number(lr.totalDays),
        status: lr.status,
        reason: lr.reason,
      }));

      // Get holidays for this month (Holiday dates are stored as YYYY-MM-DD strings)
      const holidays = await prisma.holiday.findMany({
        where: {
          date: {
            startsWith: month,
          },
          status: 'Active',
        },
        orderBy: { date: 'asc' },
      });

      const holidayEvents = holidays.map(h => ({
        id: h.id,
        type: 'HOLIDAY' as const,
        name: h.name,
        date: h.date,
      }));

      // Combine events
      const events = [...leaveEvents, ...holidayEvents];

      // Calculate stats
      const approvedLeaves = leaveRequests.filter(lr => lr.status === 'APPROVED');
      const pendingLeaves = leaveRequests.filter(lr => lr.status === 'PENDING');
      const totalLeaveDays = approvedLeaves.reduce((sum, lr) => sum + Number(lr.totalDays), 0);

      const monthStats = {
        totalLeaves: totalLeaveDays,
        approved: approvedLeaves.length,
        pending: pendingLeaves.length,
        holidays: holidays.length,
      };

      return NextResponse.json({
        success: true,
        data: {
          month,
          events,
          stats: monthStats,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching leave calendar:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave calendar' },
        { status: 500 }
      );
    }
  }
);
