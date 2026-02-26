import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const mockSwapRequests = [
  {
    id: 'swap-001',
    tenantId: 'tenant-1',
    requesterId: 'emp-001',
    requesterName: 'John Smith',
    targetEmployeeId: 'emp-002',
    targetEmployeeName: 'Maria Garcia',
    requesterShift: { date: '2026-03-05', startTime: '08:00', endTime: '16:00', hours: 8 },
    targetShift: { date: '2026-03-07', startTime: '12:00', endTime: '20:00', hours: 8 },
    reason: 'Family appointment',
    status: 'PENDING_TARGET',
    managerApproval: null,
    departmentId: 'dept-engineering',
    createdAt: '2026-02-20T10:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'swap-002',
    tenantId: 'tenant-1',
    requesterId: 'emp-003',
    requesterName: 'David Lee',
    targetEmployeeId: 'emp-004',
    targetEmployeeName: 'Sarah Johnson',
    requesterShift: { date: '2026-03-10', startTime: '14:00', endTime: '22:00', hours: 8 },
    targetShift: { date: '2026-03-12', startTime: '06:00', endTime: '14:00', hours: 8 },
    reason: 'Personal event',
    status: 'APPROVED',
    managerApproval: {
      approved: true,
      approvedBy: 'mgr-001',
      approvedAt: '2026-02-21T08:30:00.000Z',
    },
    departmentId: 'dept-operations',
    createdAt: '2026-02-19T14:00:00.000Z',
    updatedAt: '2026-02-21T08:30:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let swaps = [...mockSwapRequests];
    if (status) swaps = swaps.filter((s) => s.status === status);
    if (departmentId) swaps = swaps.filter((s) => s.departmentId === departmentId);

    const total = swaps.length;
    const paginated = swaps.slice((page - 1) * limit, page * limit);

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
        message: 'Failed to list swap requests',
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
    const { requesterId, targetEmployeeId, requesterDate, targetDate } = body;

    if (!requesterId || !targetEmployeeId || !requesterDate || !targetDate) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message:
            'Validation failed: requesterId, targetEmployeeId, requesterDate, and targetDate are required',
          details: {
            missingFields: [
              'requesterId',
              'targetEmployeeId',
              'requesterDate',
              'targetDate',
            ].filter((f) => !body[f]),
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

    if (requesterId === targetEmployeeId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'requesterId and targetEmployeeId must be different employees',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newSwap = {
      id: `swap-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: 'tenant-1', // from auth context in production
      requesterId,
      targetEmployeeId,
      requesterShift: {
        date: requesterDate,
        startTime: body.requesterStartTime || '08:00',
        endTime: body.requesterEndTime || '16:00',
        hours: 8,
      },
      targetShift: {
        date: targetDate,
        startTime: body.targetStartTime || '08:00',
        endTime: body.targetEndTime || '16:00',
        hours: 8,
      },
      reason: body.reason || null,
      status: 'PENDING_TARGET',
      managerApproval: null,
      departmentId: body.departmentId || null,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: newSwap,
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
        message: 'Failed to request shift swap',
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
