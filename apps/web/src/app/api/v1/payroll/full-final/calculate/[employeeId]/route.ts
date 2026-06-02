import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { fullFinalService } from '@/lib/services/full-final.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { employeeId?: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('payroll:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing payroll:create' } },
            { status: 403 }
          );
        }
        const employeeId = context.params?.employeeId;
        if (!employeeId) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'employeeId required' } },
            { status: 400 }
          );
        }
        const body = await request.json();
        if (!body.countryCode || !body.lastWorkingDay || !body.joiningDate || !body.basicSalary) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'countryCode, lastWorkingDay, joiningDate, basicSalary required',
              },
            },
            { status: 400 }
          );
        }

        const persist = body.persist !== false; // default true
        const input = {
          tenantId: context.user.tenantId,
          employeeId,
          countryCode: String(body.countryCode),
          lastWorkingDay: new Date(body.lastWorkingDay),
          joiningDate: new Date(body.joiningDate),
          basicSalary: Number(body.basicSalary),
          grossSalary: Number(body.grossSalary ?? body.basicSalary),
          currency: body.currency,
          exitRequestId: body.exitRequestId,
          earnedLeaveBalanceDays: body.earnedLeaveBalanceDays,
          outstandingLoanAmount: body.outstandingLoanAmount,
          unservedNoticeDays: body.unservedNoticeDays,
          proRataBonusBase: body.proRataBonusBase,
          otherEarnings: body.otherEarnings,
          otherDeductions: body.otherDeductions,
          noticePeriodDays: body.noticePeriodDays,
        };

        if (!persist) {
          const calculation = fullFinalService.calculate(input);
          return NextResponse.json({ success: true, data: { calculation }, message: 'Preview' });
        }

        const result = await fullFinalService.recordAndCalculate(input, context.user.id);
        return NextResponse.json(
          {
            success: true,
            data: result,
            message: 'F&F calculated and recorded',
          },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'F&F calculation failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.SALARY_UPDATED,
    resourceType: 'full_final_settlement',
    captureRequestBody: true,
  }
);
