import { NextRequest, NextResponse } from 'next/server';
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
      const department = searchParams.get('department');
      const status = searchParams.get('status');
      const month = searchParams.get('month');

      const mockOvertimeData = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          department: 'Engineering',
          date: '2024-08-26',
          regularHours: 8,
          overtimeHours: 2.5,
          overtimeType: 'WEEKDAY',
          rate: 1.5,
          amount: 750,
          status: 'PENDING',
          requestedAt: '2024-08-26T20:30:00',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          department: 'Engineering',
          date: '2024-08-17',
          regularHours: 0,
          overtimeHours: 8,
          overtimeType: 'WEEKEND',
          rate: 2.0,
          amount: 3200,
          status: 'APPROVED',
          requestedAt: '2024-08-18T09:00:00',
          approvedBy: 'manager-1',
          approvedAt: '2024-08-19T10:00:00',
        },
        {
          id: '3',
          employeeId: 'emp-3',
          employeeName: 'Mike Ross',
          department: 'Operations',
          date: '2024-08-15',
          regularHours: 0,
          overtimeHours: 8,
          overtimeType: 'HOLIDAY',
          rate: 2.5,
          amount: 5000,
          status: 'APPROVED',
          requestedAt: '2024-08-16T09:00:00',
          approvedBy: 'manager-2',
          approvedAt: '2024-08-16T14:00:00',
        },
        {
          id: '4',
          employeeId: 'emp-4',
          employeeName: 'Alice Brown',
          department: 'Support',
          date: '2024-08-27',
          regularHours: 8,
          overtimeHours: 1,
          overtimeType: 'WEEKDAY',
          rate: 1.5,
          amount: 300,
          status: 'REJECTED',
          requestedAt: '2024-08-27T19:00:00',
          rejectedBy: 'manager-3',
          rejectedAt: '2024-08-28T09:00:00',
          rejectionReason: 'Not pre-approved',
        },
      ];

      let filteredData = mockOvertimeData;
      if (department) filteredData = filteredData.filter(o => o.department === department);
      if (status) filteredData = filteredData.filter(o => o.status === status);
      if (month) filteredData = filteredData.filter(o => o.date.startsWith(month));

      const summary = {
        total: filteredData.length,
        pending: filteredData.filter(o => o.status === 'PENDING').length,
        approved: filteredData.filter(o => o.status === 'APPROVED').length,
        rejected: filteredData.filter(o => o.status === 'REJECTED').length,
        totalHours: filteredData.reduce((sum, o) => sum + o.overtimeHours, 0),
        totalAmount: filteredData.filter(o => o.status === 'APPROVED').reduce((sum, o) => sum + o.amount, 0),
        byType: {
          weekday: filteredData.filter(o => o.overtimeType === 'WEEKDAY').reduce((sum, o) => sum + o.overtimeHours, 0),
          weekend: filteredData.filter(o => o.overtimeType === 'WEEKEND').reduce((sum, o) => sum + o.overtimeHours, 0),
          holiday: filteredData.filter(o => o.overtimeType === 'HOLIDAY').reduce((sum, o) => sum + o.overtimeHours, 0),
        },
        byDepartment: Object.entries(
          filteredData.reduce((acc, o) => {
            if (!acc[o.department]) {
              acc[o.department] = { count: 0, hours: 0, amount: 0 };
            }
            acc[o.department].count++;
            acc[o.department].hours += o.overtimeHours;
            acc[o.department].amount += o.status === 'APPROVED' ? o.amount : 0;
            return acc;
          }, {} as Record<string, { count: number; hours: number; amount: number }>)
        ).map(([department, stats]) => ({ department, ...stats })),
      };

      return NextResponse.json({
        success: true,
        data: { overtime: filteredData, summary },
        meta: { total: filteredData.length },
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
