import { NextRequest, NextResponse } from 'next/server';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withEnhancedAuth } from '@/lib/auth/enhanced-auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      employeeId: searchParams.get('employeeId') || undefined,
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 50,
    };

    const result = await OvertimeService.findAllCompOffs(filter);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: { pagination: result.pagination, timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5000', message: error.message } }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    body.tenantId = user.tenantId;

    const compOff = await OvertimeService.createCompOff(body);
    return NextResponse.json({ success: true, data: compOff }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E1001', message: error.message } }, { status: 400 });
  }
});
