import { NextRequest, NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      requestorId: searchParams.get('requestorId') || undefined,
      swapWithId: searchParams.get('swapWithId') || undefined,
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Math.min(Number(searchParams.get('limit')) || 20, 100),
    };

    const result = await ShiftManagementService.findAllSwaps(filter);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: error.message } },
      { status: 500 }
    );
  }
});

export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const { requestorId, swapWithId, requestorDate, requestorShiftId, swapWithDate, swapWithShiftId, reason } = body;

    if (!requestorId || !swapWithId || !requestorDate || !requestorShiftId || !swapWithDate || !swapWithShiftId || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed: requestorId, swapWithId, requestorDate, requestorShiftId, swapWithDate, swapWithShiftId, and reason are required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    if (requestorId === swapWithId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'requestorId and swapWithId must be different employees',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    const swap = await ShiftManagementService.createSwap({
      tenantId: user.tenantId,
      requestorId,
      swapWithId,
      requestorDate,
      requestorShiftId,
      swapWithDate,
      swapWithShiftId,
      reason,
    });

    return NextResponse.json(
      {
        success: true,
        data: swap,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: error.message } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.EMPLOYEE_UPDATED,
  resourceType: 'shift_swap_request',
  captureRequestBody: true,
});
