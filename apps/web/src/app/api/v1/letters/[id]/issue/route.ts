import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { LetterService } from '@/lib/services/letter.service';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('letters:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing letters:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const letter = await LetterService.issue(id, user.tenantId);
    if (!letter) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Letter not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: letter });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
