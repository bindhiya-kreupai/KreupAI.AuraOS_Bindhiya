import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch leave calendar
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
      const departmentId = searchParams.get('departmentId');
      const teamId = searchParams.get('teamId');

      const mockEvents = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          leaveType: 'Annual Leave',
          startDate: `${month}-10`,
          endDate: `${month}-12`,
          days: 3,
          status: 'APPROVED',
          color: '#3b82f6',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          leaveType: 'Sick Leave',
          startDate: `${month}-15`,
          endDate: `${month}-15`,
          days: 1,
          status: 'APPROVED',
          color: '#ef4444',
        },
        {
          id: '3',
          employeeId: 'emp-3',
          employeeName: 'Mike Ross',
          leaveType: 'Casual Leave',
          startDate: `${month}-20`,
          endDate: `${month}-21`,
          days: 2,
          status: 'PENDING',
          color: '#f59e0b',
        },
        {
          id: '4',
          type: 'HOLIDAY',
          name: 'Christmas Day',
          date: `${month}-25`,
          color: '#10b981',
        },
      ];

      const monthStats = {
        totalLeaves: 6,
        approved: 4,
        pending: 2,
        holidays: 1,
        teamAvailability: 85,
      };

      return NextResponse.json({
        success: true,
        data: {
          month,
          events: mockEvents,
          stats: monthStats,
        },
      });
    } catch {
      logger.error('Error fetching leave calendar:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave calendar' },
        { status: 500 }
      );
    }
  }
);
