import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Generate leave reports from database
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const reportType = searchParams.get('type');
      const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
      const format = searchParams.get('format') || 'json';

      const tenantId = user.tenantId;

      if (format === 'pdf' || format === 'excel') {
        return NextResponse.json({
          success: true,
          message: `${format.toUpperCase()} generation not implemented yet`,
          downloadUrl: `/api/leave/reports/download/${reportType}?format=${format}&startDate=${startDate}&endDate=${endDate}`,
        });
      }

      // Build real report data from database
      const dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };

      // Get leave requests in date range
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
          tenantId,
          appliedAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      });

      // Get leave types for grouping
      const leaveTypes = await prisma.leaveType.findMany();
      const leaveTypeMap = new Map(leaveTypes.map(lt => [lt.id, lt]));

      // Get leave balances
      const leaveYear = new Date().getFullYear();
      const balances = await prisma.leaveBalance.findMany({
        where: {
          tenantId,
          leaveYear,
        },
        include: { policy: true },
      });

      // Calculate statistics
      const uniqueEmployees = new Set(leaveRequests.map(r => r.employeeId));
      const approvedRequests = leaveRequests.filter(r => r.status === 'APPROVED');
      const totalDays = approvedRequests.reduce((sum, r) => sum + Number(r.totalDays), 0);

      // Group by leave type
      const byTypeMap = new Map<string, { count: number; days: number; name: string }>();
      for (const req of approvedRequests) {
        const lt = leaveTypeMap.get(req.leaveTypeId);
        const name = lt?.name || 'Unknown';
        const existing = byTypeMap.get(req.leaveTypeId) || { count: 0, days: 0, name };
        existing.count++;
        existing.days += Number(req.totalDays);
        byTypeMap.set(req.leaveTypeId, existing);
      }

      const byType = Array.from(byTypeMap.values()).map(item => ({
        leaveType: item.name,
        count: item.count,
        days: item.days,
        percentage: totalDays > 0 ? Math.round((item.days / totalDays) * 1000) / 10 : 0,
      }));

      // Count pending requests (useful for stats)
      const pendingCount = leaveRequests.filter(r => r.status === 'PENDING').length;

      // Find employees on leave today
      const today = new Date();
      const onLeaveToday = await prisma.leaveRequest.count({
        where: {
          tenantId,
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      });

      // Upcoming leaves
      const upcomingLeaves = await prisma.leaveRequest.count({
        where: {
          tenantId,
          status: 'APPROVED',
          startDate: { gt: today },
        },
      });

      // Balance summaries
      const totalAccrued = balances.reduce((sum, b) => sum + Number(b.accrued), 0);
      const totalTaken = balances.reduce((sum, b) => sum + Number(b.taken), 0);
      const totalLapsed = balances.reduce((sum, b) => sum + Number(b.lapsed), 0);
      const totalAvailable = balances.reduce((sum, b) => sum + Number(b.currentBalance), 0);
      const uniqueBalanceEmployees = new Set(balances.map(b => b.employeeId));

      const reports: Record<string, unknown> = {
        'leave-summary': {
          name: 'Leave Summary Report',
          description: 'Overall leave statistics and trends',
          data: {
            period: { startDate, endDate },
            totals: {
              totalEmployees: uniqueEmployees.size,
              totalLeavesTaken: approvedRequests.length,
              totalDays,
              averageDaysPerEmployee: uniqueEmployees.size > 0
                ? Math.round((totalDays / uniqueEmployees.size) * 10) / 10
                : 0,
            },
            byType,
          },
        },
        'leave-balance': {
          name: 'Leave Balance Report',
          description: 'Current leave balances for all employees',
          data: {
            asOfDate: endDate,
            balances,
            summary: {
              totalEmployees: uniqueBalanceEmployees.size,
              totalAccrued,
              totalTaken,
              totalAvailable,
              totalLapsed,
            },
          },
        },
      };

      // Build the stats response that the frontend LeaveAnalyticsService expects
      const stats = {
        totalEmployees: uniqueBalanceEmployees.size,
        onLeaveToday,
        pendingRequests: pendingCount,
        upcomingLeaves,
        leaveTypeUsage: byType,
        departmentLeaveUsage: [],
        monthlyLeaveTrend: [],
        averageLeaveBalance: uniqueBalanceEmployees.size > 0
          ? Math.round((totalAvailable / uniqueBalanceEmployees.size) * 10) / 10
          : 0,
        totalAccruedDays: totalAccrued,
        totalAvailedDays: totalTaken,
        totalLapsedDays: totalLapsed,
      };

      const report = reportType ? reports[reportType] : null;

      if (!report && reportType) {
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        stats,
        analytics: stats,
        data: reportType ? report : reports,
        meta: { startDate, endDate, format },
      });
    } catch (error) {
      logger.error('Error generating leave report:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate report' },
        { status: 500 }
      );
    }
  }
);
