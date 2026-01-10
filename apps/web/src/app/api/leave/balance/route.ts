import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch leave balance
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const year = searchParams.get('year') || new Date().getFullYear().toString();

      const mockBalance = {
        employeeId,
        year: parseInt(year),
        balances: [
          {
            leaveTypeId: '1',
            leaveType: 'Annual Leave',
            allocated: 20,
            used: 8,
            pending: 2,
            available: 10,
            carryForward: 5,
            expiresOn: `${parseInt(year) + 1}-03-31`,
          },
          {
            leaveTypeId: '2',
            leaveType: 'Sick Leave',
            allocated: 10,
            used: 3,
            pending: 0,
            available: 7,
            carryForward: 0,
            expiresOn: null,
          },
          {
            leaveTypeId: '3',
            leaveType: 'Casual Leave',
            allocated: 7,
            used: 4,
            pending: 1,
            available: 2,
            carryForward: 0,
            expiresOn: `${year}-12-31`,
          },
          {
            leaveTypeId: '4',
            leaveType: 'Comp-off',
            allocated: 0,
            used: 0,
            pending: 0,
            available: 3,
            carryForward: 0,
            expiresOn: `${year}-12-31`,
          },
        ],
        summary: {
          totalAllocated: 37,
          totalUsed: 15,
          totalPending: 3,
          totalAvailable: 22,
        },
      };

      return NextResponse.json({
        success: true,
        data: mockBalance,
      });
    } catch (error) {
      logger.error('Error fetching leave balance:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leave balance' },
        { status: 500 }
      );
    }
  }
);
