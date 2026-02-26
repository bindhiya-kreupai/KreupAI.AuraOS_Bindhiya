import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const mockApprovals = [
  {
    id: 'ota-001',
    tenantId: 'tenant-1',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    managerId: 'mgr-001',
    managerName: 'Robert Chen',
    date: '2026-03-05',
    requestedHours: 4,
    reason: 'Critical product launch deadline',
    businessJustification:
      'Q1 release is at risk; additional hours needed to complete integration testing',
    status: 'PENDING',
    priority: 'HIGH',
    budgetCode: 'ENG-2026-Q1',
    estimatedCost: 216.36, // 4 hrs * base rate * 1.5
    submittedAt: '2026-02-25T16:00:00.000Z',
    updatedAt: '2026-02-25T16:00:00.000Z',
    decisionAt: null,
    decisionNotes: null,
  },
  {
    id: 'ota-002',
    tenantId: 'tenant-1',
    employeeId: 'emp-005',
    employeeName: 'Lisa Park',
    managerId: 'mgr-001',
    managerName: 'Robert Chen',
    date: '2026-03-03',
    requestedHours: 2,
    reason: 'Server migration window',
    businessJustification:
      'Maintenance window requires after-hours work to avoid service disruption',
    status: 'APPROVED',
    priority: 'MEDIUM',
    budgetCode: 'OPS-INFRA-2026',
    estimatedCost: 112.5,
    submittedAt: '2026-02-24T14:00:00.000Z',
    updatedAt: '2026-02-24T17:30:00.000Z',
    decisionAt: '2026-02-24T17:30:00.000Z',
    decisionNotes: 'Approved; please submit time within 48 hours of work completion',
  },
  {
    id: 'ota-003',
    tenantId: 'tenant-1',
    employeeId: 'emp-008',
    employeeName: 'Carlos Mendez',
    managerId: 'mgr-002',
    managerName: 'Sarah Williams',
    date: '2026-03-01',
    requestedHours: 8,
    reason: 'Customer emergency',
    businessJustification: 'Major customer facing production outage',
    status: 'DENIED',
    priority: 'CRITICAL',
    budgetCode: 'OPS-2026-Q1',
    estimatedCost: 384.0,
    submittedAt: '2026-02-28T18:00:00.000Z',
    updatedAt: '2026-02-28T19:00:00.000Z',
    decisionAt: '2026-02-28T19:00:00.000Z',
    decisionNotes: 'Employee already at 60 hours this week; engage on-call backup instead',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || undefined;
    const status = searchParams.get('status') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let approvals = [...mockApprovals];
    if (managerId) approvals = approvals.filter((a) => a.managerId === managerId);
    if (status) approvals = approvals.filter((a) => a.status === status);
    if (employeeId) approvals = approvals.filter((a) => a.employeeId === employeeId);

    const total = approvals.length;
    const paginated = approvals.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to list OT approval requests',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, hours, reason } = body;

    if (!employeeId || !date || !hours || !reason) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: employeeId, date, hours, and reason are required',
          details: {
            missingFields: ['employeeId', 'date', 'hours', 'reason'].filter((f) => !body[f]),
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

    if (typeof hours !== 'number' || hours <= 0 || hours > 24) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: hours must be a positive number not exceeding 24',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const baseRate = 36.06; // would be fetched from employee record in production
    const estimatedCost = Math.round(hours * baseRate * 1.5 * 100) / 100;

    const newRequest = {
      id: `ota-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: 'tenant-1', // from auth context in production
      employeeId,
      date,
      requestedHours: hours,
      reason,
      businessJustification: body.businessJustification || null,
      status: 'PENDING',
      priority: body.priority || 'MEDIUM',
      budgetCode: body.budgetCode || null,
      estimatedCost,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      decisionAt: null,
      decisionNotes: null,
    };

    const response: ApiResponse = {
      success: true,
      data: newRequest,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to request OT pre-approval',
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
