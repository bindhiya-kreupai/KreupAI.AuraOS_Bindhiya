import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { IDCardService } from '@/lib/services/id-card.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('id-cards:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing id-cards:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const stats = await IDCardService.getStatistics(user.tenantId);
    return NextResponse.json({ success: true, data: stats });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch statistics' } },
      { status: 500 }
    );
  }
});
