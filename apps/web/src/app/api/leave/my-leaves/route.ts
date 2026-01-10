import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch my leave requests
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const year = searchParams.get('year') || new Date().getFullYear().toString();

      const mockLeaves = [
        {
          id: '1',
          employeeId: user.userId,
          leaveTypeId: '1',
          leaveType: 'Annual Leave',
          startDate: `${year}-12-20`,
          endDate: `${year}-12-24`,
          days: 5,
          reason: 'Family vacation',
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approverName: 'Sarah Manager',
          approvedAt: `${year}-12-10`,
          appliedAt: `${year}-12-05`,
        },
        {
          id: '2',
          employeeId: user.userId,
          leaveTypeId: '2',
          leaveType: 'Sick Leave',
          startDate: `${year}-10-15`,
          endDate: `${year}-10-15`,
          days: 1,
          reason: 'Flu',
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approverName: 'Sarah Manager',
          approvedAt: `${year}-10-15`,
          appliedAt: `${year}-10-14`,
        },
        {
          id: '3',
          employeeId: user.userId,
          leaveTypeId: '3',
          leaveType: 'Casual Leave',
          startDate: `${year}-11-05`,
          endDate: `${year}-11-05`,
          days: 1,
          reason: 'Personal work',
          status: 'PENDING',
          appliedAt: `${year}-11-01`,
        },
        {
          id: '4',
          employeeId: user.userId,
          leaveTypeId: '1',
          leaveType: 'Annual Leave',
          startDate: `${year}-09-10`,
          endDate: `${year}-09-12`,
          days: 3,
          reason: 'Weekend trip',
          status: 'REJECTED',
          approvedBy: 'manager-1',
          approverName: 'Sarah Manager',
          rejectionReason: 'Insufficient coverage',
          approvedAt: `${year}-09-08`,
          appliedAt: `${year}-09-05`,
        },
      ];

      let filteredData = mockLeaves;
      if (status) {
        filteredData = mockLeaves.filter(l => l.status === status);
      }

      const summary = {
        total: filteredData.length,
        approved: filteredData.filter(l => l.status === 'APPROVED').length,
        pending: filteredData.filter(l => l.status === 'PENDING').length,
        rejected: filteredData.filter(l => l.status === 'REJECTED').length,
        totalDaysUsed: filteredData.filter(l => l.status === 'APPROVED').reduce((sum, l) => sum + l.days, 0),
      };

      return NextResponse.json({
        success: true,
        data: { leaves: filteredData, summary },
      });
    } catch (error) {
      logger.error('Error fetching my leaves:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave requests' },
        { status: 500 }
      );
    }
  }
);
