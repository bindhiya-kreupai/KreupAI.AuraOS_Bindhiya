import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('shift-swaps:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shift-swaps:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const employeeId = context.employeeId || user.userId;

      const swap = await ShiftManagementService.peerApproveSwap(id, user.tenantId, employeeId);
      return NextResponse.json({ success: true, data: swap });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Failed to approve swap request',
            messageAr: 'خطأ في الموافقة على طلب التبادل',
          },
        },
        { status: 400 }
      );
    }
  }),
  {
    // TODO: Add shift-specific AuditAction (SHIFT_SWAP_PEER_APPROVED)
    action: AuditAction.LEAVE_REQUEST_APPROVED,
    resourceType: 'shiftSwap',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
