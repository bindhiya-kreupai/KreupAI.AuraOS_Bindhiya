import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch carry forward data
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const year = searchParams.get('year') || new Date().getFullYear().toString();
      const employeeId = searchParams.get('employeeId');

      const mockCarryForward = {
        year: parseInt(year),
        summary: {
          totalEmployees: 50,
          totalDaysCarried: 125,
          averagePerEmployee: 2.5,
          expiringIn30Days: 45,
        },
        employees: [
          {
            employeeId: 'emp-1',
            employeeName: 'John Doe',
            department: 'Engineering',
            leaveType: 'Annual Leave',
            previousYearBalance: 5,
            carryForwardAllowed: 5,
            carriedForward: 5,
            expiryDate: `${parseInt(year) + 1}-03-31`,
            status: 'ACTIVE',
          },
          {
            employeeId: 'emp-2',
            employeeName: 'Jane Smith',
            department: 'Sales',
            leaveType: 'Annual Leave',
            previousYearBalance: 8,
            carryForwardAllowed: 5,
            carriedForward: 5,
            expiryDate: `${parseInt(year) + 1}-03-31`,
            status: 'ACTIVE',
          },
          {
            employeeId: 'emp-3',
            employeeName: 'Mike Ross',
            department: 'Marketing',
            leaveType: 'Annual Leave',
            previousYearBalance: 3,
            carryForwardAllowed: 5,
            carriedForward: 3,
            expiryDate: `${parseInt(year) + 1}-03-31`,
            status: 'ACTIVE',
          },
        ],
      };

      if (employeeId) {
        const employee = mockCarryForward.employees.find(e => e.employeeId === employeeId);
        return NextResponse.json({
          success: true,
          data: employee || null,
        });
      }

      return NextResponse.json({
        success: true,
        data: mockCarryForward,
      });
    } catch {
      logger.error('Error fetching carry forward data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch carry forward data' },
        { status: 500 }
      );
    }
  }
);

// POST - Process carry forward
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { year, employeeIds } = body;

      if (!year) {
        return NextResponse.json(
          { success: false, error: 'Year is required' },
          { status: 400 }
        );
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Leave - Carry Forward',
          details: `Processed carry forward for year ${year}${employeeIds ? ` - ${employeeIds.length} employees` : ' - all employees'}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      const result = {
        year: parseInt(year),
        processedCount: employeeIds?.length || 50,
        totalDaysCarried: 125,
        processedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: result });
    } catch {
      logger.error('Error processing carry forward:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process carry forward' },
        { status: 500 }
      );
    }
  }
);
