import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ConfirmationService } from '@/lib/services/confirmation.service';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
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
    const stats = await ConfirmationService.getStatistics(user.tenantId);
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
