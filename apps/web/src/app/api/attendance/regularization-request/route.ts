import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch regularization requests (for managers/HR)
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const employeeId = searchParams.get('employeeId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const where: Record<string, unknown> = { tenantId: user.tenantId };

      if (status) {
        where.status = status;
      }

      if (employeeId) {
        where.employeeId = employeeId;
      }

      if (startDate || endDate) {
        const dateFilter: Record<string, Date> = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);
        where.date = dateFilter;
      }

      const regularizations = await prisma.attendanceRegularization.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // Look up employee names and departments
      const employeeIds = [...new Set(regularizations.map(r => r.employeeId))];
      const employees = employeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: employeeIds } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
              jobProfile: { select: { title: true } },
            },
          })
        : [];
      const employeeMap = new Map(employees.map(e => [e.id, {
        name: `${e.firstName} ${e.lastName}`,
        department: e.department?.name || 'Unknown',
        designation: e.jobProfile?.title || 'Unknown',
      }]));

      const data = regularizations.map((r) => {
        const emp = employeeMap.get(r.employeeId);
        return {
          id: r.id,
          employeeId: r.employeeId,
          employeeName: emp?.name || 'Unknown Employee',
          department: emp?.department || 'Unknown',
          designation: emp?.designation || 'Unknown',
          date: r.date.toISOString().split('T')[0],
          type: r.regularizationType,
          requestedClockIn: r.requestedClockIn ? r.requestedClockIn.toISOString() : null,
          requestedClockOut: r.requestedClockOut ? r.requestedClockOut.toISOString() : null,
          reason: r.reason,
          attachments: r.attachments,
          status: r.status,
          approvedBy: r.approvedBy,
          approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
          rejectionReason: r.rejectionReason,
          createdAt: r.createdAt.toISOString(),
        };
      });

      const summary = {
        total: data.length,
        pending: data.filter(r => r.status === 'PENDING').length,
        approved: data.filter(r => r.status === 'APPROVED').length,
        rejected: data.filter(r => r.status === 'REJECTED').length,
        byType: {
          missedPunch: data.filter(r => r.type === 'MISSED_PUNCH').length,
          lateIn: data.filter(r => r.type === 'LATE_IN').length,
          earlyOut: data.filter(r => r.type === 'EARLY_OUT').length,
          wrongPunch: data.filter(r => r.type === 'WRONG_PUNCH').length,
        },
        byDepartment: Object.entries(
          data.reduce((acc, r) => {
            acc[r.department] = (acc[r.department] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([department, count]) => ({ department, count })),
      };

      return NextResponse.json({
        success: true,
        data: { requests: data, summary },
        meta: { total: data.length },
      });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch regularization requests' },
        { status: 500 }
      );
    }
  }
);
