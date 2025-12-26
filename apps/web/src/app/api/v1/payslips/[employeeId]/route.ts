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
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/payslips/:employeeId
 * Get payslips for a specific employee
 *
 * Query Parameters:
 * - limit (optional): Number of records (default: 12, max: 24)
 * - month (optional): Specific month in YYYY-MM format
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { employeeId: string } }) => {
    try {
      const { employeeId } = params;
      const { searchParams } = new URL(request.url);
      const limit = Math.min(
        parseInt(searchParams.get('limit') || '12'),
        24
      );
      const month = searchParams.get('month');

      // TODO: Implement actual database query
      const mockPayslips = Array.from({ length: Math.min(limit, 12) }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const payrollMonth = date.toISOString().slice(0, 7);

        return {
          id: crypto.randomUUID(),
          payrollRunId: crypto.randomUUID(),
          employeeId,
          employeeCode: 'EMP001',
          employeeName: 'John Doe',
          month: payrollMonth,
          basicSalary: 5000,
          totalEarnings: 6500,
          totalDeductions: 780,
          grossSalary: 6500,
          netSalary: 5720,
          status: i === 0 ? 'CALCULATED' : 'PAID',
          pdfUrl: i === 0 ? null : `/payslips/${crypto.randomUUID()}.pdf`,
          createdAt: new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        };
      });

      const filteredPayslips = month
        ? mockPayslips.filter((p) => p.month === month)
        : mockPayslips;

      const response: ApiResponse = {
        success: true,
        data: filteredPayslips,
        meta: {
          pagination: {
            page: 1,
            limit,
            total: filteredPayslips.length,
            totalPages: 1,
          },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Payslips API] GET Error:', error);

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch payslips',
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
  }
);
