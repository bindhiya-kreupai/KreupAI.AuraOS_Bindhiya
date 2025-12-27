import { NextRequest, NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth/enhanced-auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      employeeId: searchParams.get('employeeId') || undefined,
      shiftId: searchParams.get('shiftId') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 50,
    };

    const result = await ShiftManagementService.findAllAssignments(filter);

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

    const assignment = await ShiftManagementService.createAssignment(body, user.id);
    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E1001', message: error.message } }, { status: 400 });
  }
});
