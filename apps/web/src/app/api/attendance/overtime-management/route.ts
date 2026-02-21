import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch overtime management data (for managers/HR)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const employeeId = searchParams.get('employeeId');
      const month = searchParams.get('month');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const where: Record<string, unknown> = { tenantId: user.tenantId };

      if (status) {
        where.status = status;
      }

      if (employeeId) {
        where.employeeId = employeeId;
      }

      if (month) {
        // month format: YYYY-MM
        const monthStart = new Date(`${month}-01`);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        where.overtimeDate = {
          gte: monthStart,
          lt: monthEnd,
        };
      } else if (startDate || endDate) {
        const dateFilter: Record<string, Date> = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);
        where.overtimeDate = dateFilter;
      }

      const overtimeRecords = await prisma.overtimeRequest.findMany({
        where,
        orderBy: { overtimeDate: 'desc' },
      });

      // Look up employee names and departments
      const employeeIds = [...new Set(overtimeRecords.map(o => o.employeeId))];
      const employees = employeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: employeeIds } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
            },
          })
        : [];
      const employeeMap = new Map(employees.map(e => [e.id, {
        name: `${e.firstName} ${e.lastName}`,
        department: e.department?.name || 'Unknown',
      }]));

      const data = overtimeRecords.map((o) => {
        const emp = employeeMap.get(o.employeeId);
        return {
          id: o.id,
          employeeId: o.employeeId,
          employeeName: emp?.name || 'Unknown Employee',
          department: emp?.department || 'Unknown',
          date: o.overtimeDate.toISOString().split('T')[0],
          startTime: o.startTime.toISOString(),
          endTime: o.endTime.toISOString(),
          totalHours: o.totalHours,
          actualHours: o.actualHours,
          overtimeType: o.overtimeType,
          reason: o.reason,
          workDescription: o.workDescription,
          project: o.project,
          status: o.status,
          compensationType: o.compensationType,
          isCompensated: o.isCompensated,
          approvedBy: o.approvedBy,
          approvedAt: o.approvedAt ? o.approvedAt.toISOString() : null,
          rejectionReason: o.rejectionReason,
          verifiedBy: o.verifiedBy,
          verifiedAt: o.verifiedAt ? o.verifiedAt.toISOString() : null,
          createdAt: o.createdAt.toISOString(),
        };
      });

      const summary = {
        total: data.length,
        pending: data.filter(o => o.status === 'PENDING').length,
        approved: data.filter(o => o.status === 'APPROVED').length,
        rejected: data.filter(o => o.status === 'REJECTED').length,
        completed: data.filter(o => o.status === 'COMPLETED').length,
        totalHours: data.reduce((sum, o) => sum + o.totalHours, 0),
        approvedHours: data
          .filter(o => o.status === 'APPROVED' || o.status === 'COMPLETED')
          .reduce((sum, o) => sum + o.totalHours, 0),
        byType: {
          regular: data.filter(o => o.overtimeType === 'REGULAR').reduce((sum, o) => sum + o.totalHours, 0),
          holiday: data.filter(o => o.overtimeType === 'HOLIDAY').reduce((sum, o) => sum + o.totalHours, 0),
          weekend: data.filter(o => o.overtimeType === 'WEEKEND').reduce((sum, o) => sum + o.totalHours, 0),
        },
        byDepartment: Object.entries(
          data.reduce((acc, o) => {
            if (!acc[o.department]) {
              acc[o.department] = { count: 0, hours: 0 };
            }
            acc[o.department].count++;
            acc[o.department].hours += o.totalHours;
            return acc;
          }, {} as Record<string, { count: number; hours: number }>)
        ).map(([department, stats]) => ({ department, ...stats })),
      };

      return NextResponse.json({
        success: true,
        data: { overtime: data, summary },
        meta: { total: data.length },
      });
    } catch (error) {
      logger.error('Error fetching overtime management data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch overtime management data' },
        { status: 500 }
      );
    }
  }
);
