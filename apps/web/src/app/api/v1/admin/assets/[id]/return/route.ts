import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST'];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { condition, notes } = body;

    if (!condition) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: condition is required upon asset return',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_CONDITIONS.includes(condition.toUpperCase())) {
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
    const assignedAssets = ['asset-001', 'asset-003'];
    const availableAssets = ['asset-002'];
    const allAssets = [...assignedAssets, ...availableAssets];

    if (!allAssets.includes(id)) {
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

    if (!assignedAssets.includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: `Asset '${id}' is not currently assigned and cannot be returned`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 409 });
    }

    const returnedCondition = condition.toUpperCase();
    const needsRepair = ['POOR', 'DAMAGED'].includes(returnedCondition);
    const isLost = returnedCondition === 'LOST';

    const returnRecord = {
      id,
      tenantId: 'tenant-1',
      status: isLost ? 'LOST' : needsRepair ? 'IN_REPAIR' : 'AVAILABLE',
      condition: returnedCondition,
      returnedDate: new Date().toISOString().split('T')[0],
      returnedBy: 'usr-current', // from auth context in production
      returnNotes: notes || null,
      assignedTo: null,
      assignedToName: null,
      repairRequired: needsRepair,
      returnReceiptId: `RET-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: returnRecord,
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
        message: 'Failed to return asset',
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
