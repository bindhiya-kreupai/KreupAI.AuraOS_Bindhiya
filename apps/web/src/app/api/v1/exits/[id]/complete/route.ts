import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  exitService,
  ExitNotClearedError,
  InvalidExitTransitionError,
} from '@/lib/services/exit.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('exits:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing exits:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const body = await request.json().catch(() => ({}));
      const result = await exitService.complete({
        id,
        tenantId: user.tenantId,
        actorId: user.id,
        countryCode: body.countryCode,
        basicSalary: body.basicSalary,
        grossSalary: body.grossSalary,
        earnedLeaveBalanceDays: body.earnedLeaveBalanceDays,
        outstandingLoanAmount: body.outstandingLoanAmount,
        unservedNoticeDays: body.unservedNoticeDays,
        proRataBonusBase: body.proRataBonusBase,
        otherEarnings: body.otherEarnings,
        otherDeductions: body.otherDeductions,
        currency: body.currency,
        skipFullFinal: body.skipFullFinal === true,
      });
      if (!result) {
        return NextResponse.json(
          { success: false, error: { code: 'E4040', message: 'Exit request not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      if (error instanceof ExitNotClearedError) {
        return NextResponse.json(
          { success: false, error: { code: 'E4220', message: error.message } },
          { status: 422 }
        );
      }
      if (error instanceof InvalidExitTransitionError) {
        return NextResponse.json(
          { success: false, error: { code: 'E4090', message: error.message } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: { code: 'E3001', message: error.message } },
        { status: 400 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_TERMINATED,
    resourceType: 'exit_request',
    captureRequestBody: true,
  }
);
