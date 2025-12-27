import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/middleware/enhanced-auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const declaration = await PayrollService.verifyDeclaration(params.id, user.tenantId, user.id);
    return NextResponse.json({ success: true, data: declaration, message: 'Declaration verified' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
