import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { LetterService } from '@/lib/services/letter.service';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('letters:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing letters:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const letter = await LetterService.findById(id, user.tenantId);
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

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('letters:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing letters:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;
    const body = await request.json();

    const letter = await LetterService.update(id, user.tenantId, body);
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

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('letters:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing letters:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const letter = await LetterService.delete(id, user.tenantId);
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
