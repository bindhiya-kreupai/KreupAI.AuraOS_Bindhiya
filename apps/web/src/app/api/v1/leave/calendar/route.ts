import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// API Response Standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/leave/calendar
 * Get leave calendar showing all approved leaves for team/company
 *
 * Query Parameters:
 * - companyId (required): Company ID
 * - departmentId (optional): Filter by department
 * - startDate (required): Start date in YYYY-MM-DD format
 * - endDate (required): End date in YYYY-MM-DD format
 * - view (optional): 'team' or 'company' (defaults to 'team')
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const departmentId = searchParams.get('departmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const view = searchParams.get('view') || 'team';

    if (!companyId || !startDate || !endDate) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'companyId, startDate, and endDate are required in query parameters',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Invalid date format. Use YYYY-MM-DD',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // TODO: Implement actual leave calendar query
    // 1. Get all approved leaves in date range
    // 2. Filter by company/department based on view
    // 3. Group by date and employee
    // 4. Include public holidays
    // 5. Calculate team strength for each day

    const mockLeaveCalendar = {
      companyId,
      departmentId,
      startDate,
      endDate,
      view,
      leaves: [
        {
          date: '2024-12-27',
          employees: [
            {
              employeeId: crypto.randomUUID(),
              employeeCode: 'EMP001',
              employeeName: 'John Doe',
              department: 'Engineering',
              leaveType: 'Annual Leave',
              leaveTypeCode: 'AL',
              duration: 'FULL_DAY',
              status: 'APPROVED',
            },
            {
              employeeId: crypto.randomUUID(),
              employeeCode: 'EMP015',
              employeeName: 'Sarah Wilson',
              department: 'Engineering',
              leaveType: 'Sick Leave',
              leaveTypeCode: 'SL',
              duration: 'HALF_DAY',
              halfDayPeriod: 'FIRST_HALF',
              status: 'APPROVED',
            },
          ],
          publicHoliday: null,
          teamStrength: {
            total: 50,
            present: 48,
            onLeave: 2,
            percentage: 96,
          },
        },
        {
          date: '2024-12-28',
          employees: [
            {
              employeeId: crypto.randomUUID(),
              employeeCode: 'EMP001',
              employeeName: 'John Doe',
              department: 'Engineering',
              leaveType: 'Annual Leave',
              leaveTypeCode: 'AL',
              duration: 'FULL_DAY',
              status: 'APPROVED',
            },
          ],
          publicHoliday: null,
          teamStrength: {
            total: 50,
            present: 49,
            onLeave: 1,
            percentage: 98,
          },
        },
        {
          date: '2024-12-25',
          employees: [],
          publicHoliday: {
            name: 'Christmas Day',
            type: 'NATIONAL',
            isOptional: false,
          },
          teamStrength: {
            total: 50,
            present: 0,
            onLeave: 0,
            percentage: 0,
          },
        },
      ],
      summary: {
        totalDays: 7,
        workingDays: 5,
        publicHolidays: 1,
        weekendDays: 1,
        averageTeamStrength: 94.2,
        peakAbsenceDate: '2024-12-27',
        peakAbsenceCount: 2,
      },
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockLeaveCalendar,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Leave Calendar API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch leave calendar',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
