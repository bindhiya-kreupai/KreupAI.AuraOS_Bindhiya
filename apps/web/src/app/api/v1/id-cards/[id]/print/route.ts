import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { IDCardService } from '@/lib/services/id-card.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('id-cards:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing id-cards:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const card = await IDCardService.markPrinted(id, user.tenantId);
    return NextResponse.json({ success: true, data: card });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: error.message } },
      { status: 500 }
    );
  }
});
