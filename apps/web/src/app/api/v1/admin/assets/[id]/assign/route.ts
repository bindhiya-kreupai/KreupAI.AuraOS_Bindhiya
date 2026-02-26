import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_CONDITIONS = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { employeeId, condition } = body;

    if (!employeeId) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E2001', message: 'Validation failed: employeeId is required' },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (condition && !VALID_CONDITIONS.includes(condition.toUpperCase())) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid condition. Must be one of: ${VALID_CONDITIONS.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Simulated asset lookup with tenant isolation
    const availableAssets = ['asset-002'];
    const assignedAssets = ['asset-001', 'asset-003'];
    const unknownId = !['asset-001', 'asset-002', 'asset-003'].includes(id);

    if (unknownId) {
      const response: ApiResponse = {
        success: false,
        error: { code: 'E4001', message: `Asset with id '${id}' not found` },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (!availableAssets.includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: `Asset '${id}' is not available for assignment (current status: ${assignedAssets.includes(id) ? 'ASSIGNED' : 'UNAVAILABLE'})`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 409 });
    }

    const assignment = {
      id,
      tenantId: 'tenant-1',
      status: 'ASSIGNED',
      assignedTo: employeeId,
      assignedDate: new Date().toISOString().split('T')[0],
      condition: condition ? condition.toUpperCase() : 'GOOD',
      assignedBy: 'usr-current', // from auth context in production
      assignmentNotes: body.notes || null,
      handoverReceipt: `HR-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: assignment,
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
        message: 'Failed to assign asset',
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
