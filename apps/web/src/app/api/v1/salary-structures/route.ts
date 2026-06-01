import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('salary-structures:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing salary-structures:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const filter = {
      tenantId: user.tenantId,
      employeeId: searchParams.get('employeeId') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };
    const result = await PayrollService.findAllStructures(filter);
    return NextResponse.json({ success: true, data: result.data, meta: result.meta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('salary-structures:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing salary-structures:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    body.tenantId = user.tenantId;
    body.createdBy = user.id;
    const structure = await PayrollService.createStructure(body);
    return NextResponse.json({ success: true, data: structure }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
