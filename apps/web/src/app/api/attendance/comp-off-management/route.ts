import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
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
      const department = searchParams.get('department');
      const status = searchParams.get('status');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const mockCompOffData = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          department: 'Engineering',
          workDate: '2024-08-17',
          workHours: 8,
          reason: 'Weekend project work',
          status: 'PENDING',
          requestedAt: '2024-08-18T09:00:00',
          balance: 1,
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          department: 'Engineering',
          workDate: '2024-08-24',
          workHours: 8,
          reason: 'Public holiday deployment',
          status: 'APPROVED',
          requestedAt: '2024-08-25T09:00:00',
          approvedBy: 'manager-1',
          approvedAt: '2024-08-25T14:00:00',
          balance: 1,
        },
        {
          id: '3',
          employeeId: 'emp-3',
          employeeName: 'Mike Ross',
          department: 'Operations',
          workDate: '2024-08-20',
          workHours: 4,
          reason: 'Weekend shift coverage',
          status: 'REJECTED',
          requestedAt: '2024-08-21T09:00:00',
          rejectedBy: 'manager-2',
          rejectedAt: '2024-08-21T16:00:00',
          rejectionReason: 'Not pre-approved',
          balance: 0,
        },
      ];

      let filteredData = mockCompOffData;
      if (department) filteredData = filteredData.filter(c => c.department === department);
      if (status) filteredData = filteredData.filter(c => c.status === status);
      if (startDate) filteredData = filteredData.filter(c => c.workDate >= startDate);
      if (endDate) filteredData = filteredData.filter(c => c.workDate <= endDate);

      const summary = {
        total: filteredData.length,
        pending: filteredData.filter(c => c.status === 'PENDING').length,
        approved: filteredData.filter(c => c.status === 'APPROVED').length,
        rejected: filteredData.filter(c => c.status === 'REJECTED').length,
        totalBalance: filteredData.reduce((sum, c) => sum + c.balance, 0),
        byDepartment: Object.entries(
          filteredData.reduce((acc, c) => {
            acc[c.department] = (acc[c.department] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([department, count]) => ({ department, count })),
      };

      return NextResponse.json({
        success: true,
        data: { compOffs: filteredData, summary },
        meta: { total: filteredData.length },
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
