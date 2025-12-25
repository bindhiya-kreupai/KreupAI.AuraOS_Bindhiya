import { NextRequest, NextResponse } from 'next/server';
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
      const department = searchParams.get('department');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const mockRequests = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          department: 'Engineering',
          designation: 'Senior Developer',
          date: '2024-08-20',
          type: 'MISSING_PUNCH',
          missingPunch: 'CHECK_OUT',
          checkIn: '09:00',
          checkOut: '18:00',
          reason: 'Forgot to punch out',
          status: 'PENDING',
          requestedAt: '2024-08-21T08:00:00',
          priority: 'MEDIUM',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          department: 'Engineering',
          designation: 'Team Lead',
          date: '2024-08-22',
          type: 'LATE_ARRIVAL',
          checkIn: '09:45',
          expectedCheckIn: '09:00',
          deviation: 45,
          reason: 'Traffic jam due to heavy rain',
          attachments: ['proof.jpg'],
          status: 'APPROVED',
          requestedAt: '2024-08-22T10:00:00',
          approvedAt: '2024-08-23T09:00:00',
          approvedBy: 'manager-1',
          approverName: 'Mike Manager',
          priority: 'LOW',
        },
        {
          id: '3',
          employeeId: 'emp-3',
          employeeName: 'Mike Ross',
          department: 'Operations',
          designation: 'Operator',
          date: '2024-08-23',
          type: 'EARLY_DEPARTURE',
          checkOut: '16:00',
          expectedCheckOut: '18:00',
          deviation: 120,
          reason: 'Medical emergency',
          attachments: ['medical-cert.pdf'],
          status: 'PENDING',
          requestedAt: '2024-08-23T16:05:00',
          priority: 'HIGH',
        },
        {
          id: '4',
          employeeId: 'emp-4',
          employeeName: 'Alice Brown',
          department: 'Support',
          designation: 'Support Executive',
          date: '2024-08-24',
          type: 'MANUAL_ENTRY',
          checkIn: '09:00',
          checkOut: '18:00',
          reason: 'Biometric system was down',
          status: 'REJECTED',
          requestedAt: '2024-08-24T18:30:00',
          rejectedAt: '2024-08-25T09:00:00',
          rejectedBy: 'manager-3',
          rejectionReason: 'No supporting documentation',
          priority: 'MEDIUM',
        },
      ];

      let filteredData = mockRequests;
      if (status) filteredData = filteredData.filter(r => r.status === status);
      if (department) filteredData = filteredData.filter(r => r.department === department);
      if (startDate) filteredData = filteredData.filter(r => r.date >= startDate);
      if (endDate) filteredData = filteredData.filter(r => r.date <= endDate);

      const summary = {
        total: filteredData.length,
        pending: filteredData.filter(r => r.status === 'PENDING').length,
        approved: filteredData.filter(r => r.status === 'APPROVED').length,
        rejected: filteredData.filter(r => r.status === 'REJECTED').length,
        byType: {
          missingPunch: filteredData.filter(r => r.type === 'MISSING_PUNCH').length,
          lateArrival: filteredData.filter(r => r.type === 'LATE_ARRIVAL').length,
          earlyDeparture: filteredData.filter(r => r.type === 'EARLY_DEPARTURE').length,
          manualEntry: filteredData.filter(r => r.type === 'MANUAL_ENTRY').length,
        },
        byPriority: {
          high: filteredData.filter(r => r.priority === 'HIGH').length,
          medium: filteredData.filter(r => r.priority === 'MEDIUM').length,
          low: filteredData.filter(r => r.priority === 'LOW').length,
        },
        byDepartment: Object.entries(
          filteredData.reduce((acc, r) => {
            acc[r.department] = (acc[r.department] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([department, count]) => ({ department, count })),
      };

      return NextResponse.json({
        success: true,
        data: { requests: filteredData, summary },
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching regularization requests:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch regularization requests' },
        { status: 500 }
      );
    }
  }
);
