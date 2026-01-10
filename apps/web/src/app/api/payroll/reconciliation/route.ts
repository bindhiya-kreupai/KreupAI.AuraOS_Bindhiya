import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch payroll reconciliation data
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

      const mockReconciliation = {
        month,
        summary: {
          totalEmployees: 50,
          processedPayroll: 420000,
          actualDisbursed: 418500,
          variance: 1500,
          variancePercentage: 0.36,
        },
        discrepancies: [
          {
            id: '1',
            employeeId: 'emp-1',
            employeeName: 'John Doe',
            expectedAmount: 9000,
            actualAmount: 8500,
            difference: 500,
            reason: 'Additional deduction not processed',
            status: 'INVESTIGATING',
          },
          {
            id: '2',
            employeeId: 'emp-2',
            employeeName: 'Jane Smith',
            expectedAmount: 7500,
            actualAmount: 6500,
            difference: 1000,
            reason: 'Loan recovery amount mismatch',
            status: 'RESOLVED',
          },
        ],
        byCategory: {
          basicSalary: { expected: 300000, actual: 300000, variance: 0 },
          allowances: { expected: 80000, actual: 80000, variance: 0 },
          deductions: { expected: 42000, actual: 43500, variance: -1500 },
          bonuses: { expected: 40000, actual: 40000, variance: 0 },
        },
      };

      return NextResponse.json({
        success: true,
        data: mockReconciliation,
      });
    } catch (error) {
      logger.error('Error fetching reconciliation data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reconciliation data' },
        { status: 500 }
      );
    }
  }
);

// POST - Run reconciliation
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { month, payrollRunId } = body;

      if (!month && !payrollRunId) {
        return NextResponse.json(
          { success: false, error: 'Either month or payrollRunId is required' },
          { status: 400 }
        );
      }

      const result = {
        reconciliationId: Math.random().toString(36).substr(2, 9),
        month: month || new Date().toISOString().slice(0, 7),
        status: 'COMPLETED',
        totalDiscrepancies: 2,
        totalVariance: 1500,
        completedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error running reconciliation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to run reconciliation' },
        { status: 500 }
      );
    }
  }
);
