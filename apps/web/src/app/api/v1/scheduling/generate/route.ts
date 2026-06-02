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

const VALID_PRIORITIES = [
  'MINIMIZE_OVERTIME',
  'MAXIMIZE_COVERAGE',
  'BALANCE_HOURS',
  'EMPLOYEE_PREFERENCE',
];

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('scheduling:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing scheduling:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { departmentId, startDate, endDate, priority, constraints } = body;

    if (!departmentId || !startDate || !endDate) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: departmentId, startDate, and endDate are required',
          details: {
            missingFields: ['departmentId', 'startDate', 'endDate'].filter((f) => !body[f]),
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E2001', message: 'endDate must be after startDate' },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const scheduleId = `sched-${crypto.randomUUID().slice(0, 8)}`;

    // Mock AI-generated schedule
    const generatedSchedule = {
      id: scheduleId,
      tenantId: 'tenant-1',
      departmentId,
      startDate,
      endDate,
      priority: priority || 'BALANCE_HOURS',
      status: 'DRAFT',
      aiGenerated: true,
      generationModel: 'AuraOS-Scheduler-v2',
      metrics: {
        totalShifts: 42,
        totalHours: 336,
        overtimeHours: 8.5,
        coverageScore: 96.2,
        fairnessScore: 88.5,
        constraintSatisfaction: 94.1,
      },
      constraints: constraints || {},
      shifts: [
        {
          id: `shift-${crypto.randomUUID().slice(0, 6)}`,
          employeeId: 'emp-001',
          employeeName: 'John Smith',
          date: startDate,
          startTime: '08:00',
          endTime: '16:00',
          hours: 8,
          role: 'Senior Engineer',
          type: 'REGULAR',
        },
        {
          id: `shift-${crypto.randomUUID().slice(0, 6)}`,
          employeeId: 'emp-002',
          employeeName: 'Maria Garcia',
          date: startDate,
          startTime: '12:00',
          endTime: '20:00',
          hours: 8,
          role: 'Engineer',
          type: 'REGULAR',
        },
      ],
      warnings: [
        {
          type: 'OVERTIME_RISK',
          message: 'emp-005 is projected at 44 hours if current pattern continues',
          severity: 'LOW',
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: generatedSchedule,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to generate AI schedule',
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
