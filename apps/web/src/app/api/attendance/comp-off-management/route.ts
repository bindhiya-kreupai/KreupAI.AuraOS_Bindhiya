import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch comp-off management data (for managers/HR)
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
        where.earnedDate = dateFilter;
      }

      const compOffs = await prisma.compOffRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // Look up employee names and departments
      const employeeIds = [...new Set(compOffs.map(c => c.employeeId))];
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

      const data = compOffs.map((c) => {
        const emp = employeeMap.get(c.employeeId);
        return {
          id: c.id,
          employeeId: c.employeeId,
          employeeName: emp?.name || 'Unknown Employee',
          department: emp?.department || 'Unknown',
          earnedDate: c.earnedDate.toISOString().split('T')[0],
          earnedHours: c.earnedHours,
          status: c.status,
          appliedDate: c.appliedDate ? c.appliedDate.toISOString().split('T')[0] : null,
          expiryDate: c.expiryDate.toISOString().split('T')[0],
          approvedBy: c.approvedBy,
          approvedAt: c.approvedAt ? c.approvedAt.toISOString() : null,
          rejectionReason: c.rejectionReason,
          remarks: c.remarks,
          createdAt: c.createdAt.toISOString(),
        };
      });

      const summary = {
        total: data.length,
        pending: data.filter(c => c.status === 'PENDING' || c.status === 'APPLIED').length,
        approved: data.filter(c => c.status === 'APPROVED' || c.status === 'AVAILED').length,
        rejected: data.filter(c => c.status === 'CANCELLED').length,
        earned: data.filter(c => c.status === 'EARNED').length,
        expired: data.filter(c => c.status === 'EXPIRED').length,
        byDepartment: Object.entries(
          data.reduce((acc, c) => {
            acc[c.department] = (acc[c.department] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([department, count]) => ({ department, count })),
      };

      return NextResponse.json({
        success: true,
        data: { compOffs: data, summary },
        meta: { total: data.length },
      });
    } catch (error) {
      logger.error('Error fetching comp-off management data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch comp-off management data' },
        { status: 500 }
      );
    }
  }
);
