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
 * GET /api/v1/payslips/detail/:id
 * Get detailed payslip information including all earnings and deductions breakdown
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      // TODO: Implement actual database query
      const mockPayslip = {
        id,
        payrollRunId: crypto.randomUUID(),
        employeeId: crypto.randomUUID(),
        employeeCode: 'EMP001',
        employeeName: 'John Doe',
        month: '2024-12',

        // Salary Structure
        basicSalary: 5000,

        // Earnings breakdown
        earnings: [
          { code: 'HRA', name: 'House Rent Allowance', amount: 1000 },
          { code: 'TA', name: 'Transport Allowance', amount: 300 },
          { code: 'MA', name: 'Medical Allowance', amount: 200 },
        ],
        totalEarnings: 1500,

        // Deductions breakdown
        deductions: [
          { code: 'PF', name: 'Provident Fund', amount: 600 },
          { code: 'ESI', name: 'Employee State Insurance', amount: 97.5 },
          { code: 'PT', name: 'Professional Tax', amount: 82.5 },
        ],
        totalDeductions: 780,

        // Statutory contributions
        employeePF: 600,
        employeeESI: 97.5,
        employeePT: 82.5,
        employeeTDS: 0,
        totalStatutoryEmployee: 780,

        employerPF: 600,
        employerESI: 162.5,
        totalStatutoryEmployer: 762.5,

        // Calculations
        grossSalary: 6500,
        netSalary: 5720,

        // Attendance & overtime
        workingDays: 30,
        paidDays: 30,
        lopDays: 0,
        overtimeHours: 0,
        overtimeAmount: 0,

        // Status & metadata
        status: 'PAID',
        pdfUrl: `/payslips/${id}.pdf`,
        paidAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: mockPayslip,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Payslip Detail API] GET Error:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Payslip not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch payslip',
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
