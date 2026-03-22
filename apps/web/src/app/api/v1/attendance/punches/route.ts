import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '@/lib/services/time-tracking.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      employeeId: searchParams.get('employeeId') || undefined,
      punchDate: searchParams.get('punchDate') || undefined,
      punchType: searchParams.get('punchType') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 50,
      sortBy: searchParams.get('sortBy') || 'punchTime',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    };

    const result = await TimeTrackingService.findAllPunches(filter);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    body.tenantId = user.tenantId;

    const punch = await TimeTrackingService.createPunch(body);

    return NextResponse.json({ success: true, data: punch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E1001', message: error.message } },
      { status: 400 }
    );
  }
}), {
  action: AuditAction.ATTENDANCE_MARKED,
  resourceType: 'attendance_punch',
  captureRequestBody: true,
});
