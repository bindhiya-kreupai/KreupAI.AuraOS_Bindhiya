import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch attendance exceptions
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const date = searchParams.get('date');
      const type = searchParams.get('type');
      const status = searchParams.get('status');

      const mockExceptions = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          date: '2024-08-20',
          type: 'LATE_ARRIVAL',
          checkIn: '09:45',
          expectedCheckIn: '09:00',
          deviation: 45,
          reason: 'Traffic jam',
          status: 'PENDING',
          createdAt: '2024-08-20T09:45:00',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          date: '2024-08-21',
          type: 'EARLY_DEPARTURE',
          checkOut: '17:00',
          expectedCheckOut: '18:00',
          deviation: 60,
          reason: 'Medical emergency',
          status: 'APPROVED',
          createdAt: '2024-08-21T17:00:00',
          approvedAt: '2024-08-22T09:00:00',
        },
        {
          id: '3',
          employeeId: 'emp-3',
          employeeName: 'Mike Ross',
          date: '2024-08-22',
          type: 'MISSING_PUNCH',
          missingPunch: 'CHECK_OUT',
          expectedCheckOut: '18:00',
          reason: 'Forgot to punch out',
          status: 'PENDING',
          createdAt: '2024-08-23T08:00:00',
        },
        {
          id: '4',
          employeeId: 'emp-4',
          employeeName: 'Alice Brown',
          date: '2024-08-23',
          type: 'SHORT_DURATION',
          totalHours: 6,
          expectedHours: 8,
          deviation: 2,
          reason: 'Half day approved',
          status: 'APPROVED',
          createdAt: '2024-08-23T16:00:00',
        },
      ];

      let filteredData = mockExceptions;
      if (type) filteredData = filteredData.filter(e => e.type === type);
      if (status) filteredData = filteredData.filter(e => e.status === status);
      if (date) filteredData = filteredData.filter(e => e.date === date);

      const summary = {
        total: filteredData.length,
        pending: filteredData.filter(e => e.status === 'PENDING').length,
        approved: filteredData.filter(e => e.status === 'APPROVED').length,
        rejected: filteredData.filter(e => e.status === 'REJECTED').length,
        byType: {
          lateArrival: filteredData.filter(e => e.type === 'LATE_ARRIVAL').length,
          earlyDeparture: filteredData.filter(e => e.type === 'EARLY_DEPARTURE').length,
          missingPunch: filteredData.filter(e => e.type === 'MISSING_PUNCH').length,
          shortDuration: filteredData.filter(e => e.type === 'SHORT_DURATION').length,
        },
      };

      return NextResponse.json({
        success: true,
        data: { exceptions: filteredData, summary },
      });
    } catch (error) {
      logger.error('Error fetching exceptions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exceptions' },
        { status: 500 }
      );
    }
  }
);
