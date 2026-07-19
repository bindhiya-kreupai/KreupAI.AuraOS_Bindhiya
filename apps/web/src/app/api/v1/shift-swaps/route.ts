import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('shift-swaps:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shift-swaps:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      requestorId: searchParams.get('requestorId') || undefined,
      swapWithId: searchParams.get('swapWithId') || undefined,
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    };

    const result = await ShiftManagementService.findAllSwaps(filter);

    const data = result.data.map((swap: any) => ({
      id: swap.id,
      requestorId: swap.requestorId,
      swapWithId: swap.swapWithId,
      requestorDate:
        swap.requestorDate instanceof Date ? swap.requestorDate.toISOString() : swap.requestorDate,
      requestorShiftId: swap.requestorShiftId,
      swapWithDate:
        swap.swapWithDate instanceof Date ? swap.swapWithDate.toISOString() : swap.swapWithDate,
      swapWithShiftId: swap.swapWithShiftId,
      reason: swap.reason,
      status: swap.status,
      swapWithApproval: swap.swapWithApproval,
      managerApproval: swap.managerApproval,
      approvedBy: swap.approvedBy,
      approvedAt: swap.approvedAt instanceof Date ? swap.approvedAt.toISOString() : swap.approvedAt,
      rejectionReason: swap.rejectionReason,
      createdAt: swap.createdAt instanceof Date ? swap.createdAt.toISOString() : swap.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5000', message: 'Internal server error', messageAr: 'خطأ في الخادم' },
      },
      { status: 500 }
    );
  }
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('shift-swaps:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shift-swaps:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();
      body.tenantId = user.tenantId;

      const swap = await ShiftManagementService.createSwap(body);
      return NextResponse.json({ success: true, data: swap }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E1001', message: 'Invalid input', messageAr: 'خطأ في الإدخال' },
        },
        { status: 400 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shiftSwap',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
