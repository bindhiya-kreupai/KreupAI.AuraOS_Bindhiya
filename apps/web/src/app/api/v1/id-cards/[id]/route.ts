import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { IDCardService } from '@/lib/services/id-card.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
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
    const card = await IDCardService.findById(id, user.tenantId);
    if (!card)
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Card not found' } },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: card });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch card' } },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('id-cards:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing id-cards:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const card = await IDCardService.update(id, user.tenantId, body);
    if (!card)
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Card not found' } },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: card });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update card' } },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('id-cards:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing id-cards:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const card = await IDCardService.delete(id, user.tenantId);
    if (!card)
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Card not found' } },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: { message: 'Card deleted' } });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to delete card' } },
      { status: 500 }
    );
  }
});
