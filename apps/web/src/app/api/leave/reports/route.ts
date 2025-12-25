import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Generate leave reports
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const reportType = searchParams.get('type');
      const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
      const format = searchParams.get('format') || 'json';

      const reports: Record<string, any> = {
        'leave-summary': {
          name: 'Leave Summary Report',
          description: 'Overall leave statistics and trends',
          data: {
            period: { startDate, endDate },
            totals: {
              totalEmployees: 50,
              totalLeavesTaken: 245,
              totalDays: 980,
              averageDaysPerEmployee: 19.6,
            },
            byType: [
              { leaveType: 'Annual Leave', count: 150, days: 600, percentage: 61.2 },
              { leaveType: 'Sick Leave', count: 50, days: 150, percentage: 20.4 },
              { leaveType: 'Casual Leave', count: 35, days: 140, percentage: 14.3 },
              { leaveType: 'Comp-off', count: 10, days: 90, percentage: 4.1 },
            ],
            byDepartment: [
              { department: 'Engineering', employees: 20, leaveDays: 420, avgPerEmployee: 21 },
              { department: 'Sales', employees: 15, leaveDays: 285, avgPerEmployee: 19 },
              { department: 'Marketing', employees: 15, leaveDays: 275, avgPerEmployee: 18.3 },
            ],
          },
        },
        'leave-balance': {
          name: 'Leave Balance Report',
          description: 'Current leave balances for all employees',
          data: {
            asOfDate: endDate,
            employees: [
              {
                employeeId: 'emp-1',
                employeeName: 'John Doe',
                department: 'Engineering',
                annualLeave: { allocated: 20, used: 8, available: 12 },
                sickLeave: { allocated: 10, used: 3, available: 7 },
                casualLeave: { allocated: 7, used: 4, available: 3 },
              },
              {
                employeeId: 'emp-2',
                employeeName: 'Jane Smith',
                department: 'Sales',
                annualLeave: { allocated: 20, used: 12, available: 8 },
                sickLeave: { allocated: 10, used: 2, available: 8 },
                casualLeave: { allocated: 7, used: 5, available: 2 },
              },
            ],
          },
        },
        'leave-trends': {
          name: 'Leave Trends Report',
          description: 'Month-wise leave patterns and analysis',
          data: {
            period: { startDate, endDate },
            monthlyData: [
              { month: 'Jan', leaves: 45, days: 180, avgDuration: 4.0 },
              { month: 'Feb', leaves: 38, days: 152, avgDuration: 4.0 },
              { month: 'Mar', leaves: 42, days: 168, avgDuration: 4.0 },
              { month: 'Apr', leaves: 35, days: 140, avgDuration: 4.0 },
              { month: 'May', leaves: 50, days: 200, avgDuration: 4.0 },
              { month: 'Jun', leaves: 35, days: 140, avgDuration: 4.0 },
            ],
            peakMonths: ['May', 'December'],
            leastBusyMonths: ['February', 'September'],
          },
        },
        'absence-analysis': {
          name: 'Absence Analysis Report',
          description: 'Detailed absence patterns and insights',
          data: {
            period: { startDate, endDate },
            absenceRate: 4.2,
            industryAverage: 3.8,
            departmentAnalysis: [
              { department: 'Engineering', absenceRate: 4.5, trend: 'INCREASING' },
              { department: 'Sales', absenceRate: 3.8, trend: 'STABLE' },
              { department: 'Marketing', absenceRate: 4.1, trend: 'DECREASING' },
            ],
            frequentAbsentees: [
              { employeeId: 'emp-5', name: 'Alice Brown', absences: 12, days: 48 },
              { employeeId: 'emp-8', name: 'Bob Wilson', absences: 10, days: 40 },
            ],
          },
        },
      };

      const report = reportType ? reports[reportType] : null;

      if (!report && reportType) {
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
      }

      if (format === 'pdf' || format === 'excel') {
        return NextResponse.json({
          success: true,
          message: `${format.toUpperCase()} generation not implemented yet`,
          downloadUrl: `/api/leave/reports/download/${reportType}?format=${format}&startDate=${startDate}&endDate=${endDate}`,
        });
      }

      return NextResponse.json({
        success: true,
        data: reportType ? report : reports,
        meta: { startDate, endDate, format },
      });
    } catch {
      logger.error('Error generating leave report:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate report' },
        { status: 500 }
      );
    }
  }
);
