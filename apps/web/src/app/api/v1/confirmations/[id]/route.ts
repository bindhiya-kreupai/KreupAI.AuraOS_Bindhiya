import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ConfirmationService } from '@/lib/services/confirmation.service';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('confirmations:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing confirmations:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const confirmation = await ConfirmationService.findById(id, user.tenantId);
    if (!confirmation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Confirmation request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: confirmation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('confirmations:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing confirmations:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;
    const body = await request.json();

    const confirmation = await ConfirmationService.update(id, user.tenantId, body);
    if (!confirmation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Confirmation request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: confirmation });
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
    if (!permissions.includes('confirmations:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing confirmations:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const confirmation = await ConfirmationService.delete(id, user.tenantId);
    if (!confirmation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Confirmation request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: confirmation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
