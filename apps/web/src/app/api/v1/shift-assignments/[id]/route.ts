import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('shift-assignments:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shift-assignments:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;
    const body = await request.json();

    const assignment = await ShiftManagementService.updateAssignment(id, user.tenantId, body);
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Assignment not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('shift-assignments:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shift-assignments:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const assignment = await ShiftManagementService.deleteAssignment(id, user.tenantId);
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Assignment not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
