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
 * GET /api/v1/statutory/pt/calculations
 * Get Professional Tax (PT) calculations for a specific month
 *
 * Query Parameters:
 * - month (required): Month in YYYY-MM format
 * - companyId (required): Company ID
 * - state (required): State code (MH, KA, TN, etc.)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const companyId = searchParams.get('companyId');
    const state = searchParams.get('state');

    if (!month || !companyId || !state) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'month, companyId, and state are required in query parameters',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // TODO: Implement actual PT calculation from database
    // PT rates vary by state
    const ptSlabs: Record<string, any> = {
      MH: [
        { min: 0, max: 10000, amount: 0 },
        { min: 10001, max: 25000, amount: 175 },
        { min: 25001, max: Infinity, amount: 200 },
      ],
      KA: [
        { min: 0, max: 15000, amount: 0 },
        { min: 15001, max: 20000, amount: 150 },
        { min: 20001, max: Infinity, amount: 200 },
      ],
    };

    const mockPTCalculation = {
      month,
      companyId,
      state,
      stateInfo: {
        code: state,
        name: state === 'MH' ? 'Maharashtra' : 'Karnataka',
        ptSlabs: ptSlabs[state] || ptSlabs['MH'],
      },
      summary: {
        totalEmployees: 150,
        employeesLiable: 120, // Only those above exemption limit
        totalPT: 9900,
      },
      employees: [
        {
          employeeCode: 'EMP001',
          employeeName: 'John Doe',
          grossSalary: 6500,
          ptAmount: 175,
          slabApplied: '10001-25000',
        },
        {
          employeeCode: 'EMP002',
          employeeName: 'Jane Smith',
          grossSalary: 30000,
          ptAmount: 200,
          slabApplied: '25001+',
        },
        // ... more employees
      ],
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockPTCalculation,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[PT Calculations API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch PT calculations',
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
