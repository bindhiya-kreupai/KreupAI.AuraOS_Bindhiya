import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('payroll-runs:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing payroll-runs:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const run = await PayrollService.approveRun(params.id, user.tenantId, user.id);
    return NextResponse.json({
      success: true,
      data: run,
      message: 'Payroll approved successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
