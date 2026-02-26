import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: employeeId is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Simulated open shift lookup with tenant isolation
    const openShiftIds = ['open-001', 'open-002'];
    const claimedShiftIds = ['open-003'];

    if (![...openShiftIds, ...claimedShiftIds].includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Open shift with id '${id}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (claimedShiftIds.includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: 'This open shift has already been claimed by another employee',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 409 });
    }

    const claimedShift = {
      id,
      tenantId: 'tenant-1',
      status: 'CLAIMED',
      claimedBy: employeeId,
      claimedAt: new Date().toISOString(),
      requiresManagerApproval: true,
      approvalStatus: 'PENDING',
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: claimedShift,
      meta: {
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
        message: 'Failed to claim open shift',
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
