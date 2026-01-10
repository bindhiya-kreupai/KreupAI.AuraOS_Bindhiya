import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch timesheets
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const status = searchParams.get('status');

      const mockTimesheets = [
        {
          id: '1',
          employeeId,
          employeeName: 'John Doe',
          weekEnding: '2024-08-31',
          totalHours: 40,
          regularHours: 40,
          overtimeHours: 0,
          status: 'APPROVED',
          approvedBy: 'manager-1',
          approvedAt: '2024-09-01',
          entries: [
            { date: '2024-08-26', checkIn: '09:00', checkOut: '18:00', hours: 8, status: 'PRESENT' },
            { date: '2024-08-27', checkIn: '09:05', checkOut: '18:10', hours: 8, status: 'PRESENT' },
            { date: '2024-08-28', checkIn: '09:00', checkOut: '18:00', hours: 8, status: 'PRESENT' },
            { date: '2024-08-29', checkIn: '09:00', checkOut: '18:00', hours: 8, status: 'PRESENT' },
            { date: '2024-08-30', checkIn: '09:00', checkOut: '18:00', hours: 8, status: 'PRESENT' },
          ],
        },
        {
          id: '2',
          employeeId,
          employeeName: 'John Doe',
          weekEnding: '2024-08-24',
          totalHours: 45,
          regularHours: 40,
          overtimeHours: 5,
          status: 'PENDING',
          entries: [
            { date: '2024-08-19', checkIn: '09:00', checkOut: '18:00', hours: 8, status: 'PRESENT' },
            { date: '2024-08-20', checkIn: '09:00', checkOut: '20:00', hours: 10, status: 'PRESENT' },
            { date: '2024-08-21', checkIn: '09:00', checkOut: '18:00', hours: 8, status: 'PRESENT' },
            { date: '2024-08-22', checkIn: '09:00', checkOut: '19:00', hours: 9, status: 'PRESENT' },
            { date: '2024-08-23', checkIn: '09:00', checkOut: '19:00', hours: 10, status: 'PRESENT' },
          ],
        },
      ];

      let filteredData = mockTimesheets;
      if (status) {
        filteredData = mockTimesheets.filter(t => t.status === status);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching timesheets:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch timesheets' },
        { status: 500 }
      );
    }
  }
);

// POST - Submit timesheet
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { employeeId, weekEnding, entries } = body;

      if (!employeeId || !weekEnding || !entries) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const totalHours = entries.reduce((sum: number, e: any) => sum + e.hours, 0);
      const regularHours = Math.min(totalHours, 40);
      const overtimeHours = Math.max(totalHours - 40, 0);

      const newTimesheet = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId,
        weekEnding,
        totalHours,
        regularHours,
        overtimeHours,
        status: 'PENDING',
        entries,
        submittedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newTimesheet }, { status: 201 });
    } catch (error) {
      logger.error('Error submitting timesheet:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit timesheet' },
        { status: 500 }
      );
    }
  }
);
