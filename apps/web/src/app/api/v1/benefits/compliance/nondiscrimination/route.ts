import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_TEST_TYPES = [
  'ELIGIBILITY',
  'BENEFITS',
  'CONTRIBUTIONS',
  'SECTION_105H',
  'CAFETERIA_PLAN_55_PERCENT',
  'CAFETERIA_PLAN_KEY_EMPLOYEE',
];

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('benefits/compliance:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing benefits/compliance:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { planId, testType } = body;

    if (!planId || !testType) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: planId and testType are required',
          details: { missingFields: ['planId', 'testType'].filter((f) => !body[f]) },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_TEST_TYPES.includes(testType)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid testType. Must be one of: ${VALID_TEST_TYPES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Mock nondiscrimination test result
    const testResult = {
      id: `ndt-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: 'tenant-1',
      planId,
      testType,
      testDate: new Date().toISOString(),
      planYear: new Date().getFullYear(),
      result: 'PASSED',
      summary: {
        totalEmployees: 320,
        eligibleEmployees: 305,
        enrolledEmployees: 248,
        hce: {
          // Highly Compensated Employees
          total: 42,
          eligible: 42,
          enrolled: 40,
          participationRate: 95.24,
        },
        nhce: {
          // Non-Highly Compensated Employees
          total: 263,
          eligible: 263,
          enrolled: 208,
          participationRate: 79.08,
        },
      },
      tests: [
        {
          testName: testType === 'ELIGIBILITY' ? '70% Test' : '55% Average Benefit Test',
          required: testType === 'ELIGIBILITY' ? 70 : 55,
          actual: testType === 'ELIGIBILITY' ? 79.08 : 62.5,
          result: 'PASSED',
          details: 'NHCE participation rate meets the required threshold',
        },
        {
          testName: 'Ratio Percentage Test',
          required: 70,
          actual: 83.1,
          result: 'PASSED',
          details: 'NHCE-to-HCE benefit percentage ratio is within acceptable range',
        },
      ],
      recommendations: [],
      runBy: 'system',
      runAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: testResult,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to run nondiscrimination test',
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
