import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/middleware/enhanced-auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const stats = await PayrollService.getRunStatistics(user.tenantId);
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
