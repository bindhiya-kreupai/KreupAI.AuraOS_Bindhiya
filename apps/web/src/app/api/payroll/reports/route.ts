import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Generate payroll reports
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const reportType = searchParams.get('type');
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
      const format = searchParams.get('format') || 'json';

      const reports: Record<string, any> = {
        'salary-register': {
          name: 'Salary Register',
          description: 'Detailed monthly salary breakdown per employee',
          data: {
            month,
            employees: [
              {
                id: 'emp-1',
                name: 'Sarah Jenkins',
                designation: 'Senior Dev',
                basicSalary: 8500,
                allowances: 2000,
                deductions: 1500,
                netPay: 9000,
              },
              {
                id: 'emp-2',
                name: 'Mike Chen',
                designation: 'UX Designer',
                basicSalary: 7200,
                allowances: 1800,
                deductions: 1200,
                netPay: 7800,
              },
            ],
            totals: {
              basicSalary: 15700,
              allowances: 3800,
              deductions: 2700,
              netPay: 16800,
            },
          },
        },
        'tax-liability': {
          name: 'Tax Liability Report',
          description: 'Summary of TDS deducted and liable payments',
          data: {
            month,
            totalTDSDeducted: 12500,
            totalEmployees: 50,
            breakdown: [
              { slab: '0-5L', employees: 10, tds: 0 },
              { slab: '5-10L', employees: 20, tds: 5000 },
              { slab: '10L+', employees: 20, tds: 7500 },
            ],
          },
        },
        variance: {
          name: 'Variance Report',
          description: 'Month-on-month comparison of payroll costs',
          data: {
            currentMonth: month,
            currentTotal: 42000,
            previousTotal: 38500,
            variance: 3500,
            variancePercent: 9.09,
            breakdown: [
              { component: 'Basic Salary', current: 30000, previous: 28000, variance: 2000 },
              { component: 'Allowances', current: 8000, previous: 7500, variance: 500 },
              { component: 'Bonuses', current: 4000, previous: 3000, variance: 1000 },
            ],
          },
        },
        'cost-center': {
          name: 'Cost Center Distribution',
          description: 'Payroll cost allocation by department/project',
          data: {
            month,
            departments: [
              { name: 'Engineering', employees: 25, cost: 21000 },
              { name: 'Sales', employees: 15, cost: 12000 },
              { name: 'Marketing', employees: 10, cost: 9000 },
            ],
            totalCost: 42000,
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
          downloadUrl: `/api/payroll/reports/download/${reportType}?format=${format}&month=${month}`,
        });
      }

      return NextResponse.json({
        success: true,
        data: reportType ? report : reports,
        meta: { month, format },
      });
    } catch (error) {
      logger.error('Error generating report:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate report' },
        { status: 500 }
      );
    }
  }
);
