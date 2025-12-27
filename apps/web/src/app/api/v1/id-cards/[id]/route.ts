import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { IDCardService } from '@/lib/services/id-card.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;
    const card = await IDCardService.findById(id, user.tenantId);
    if (!card) return NextResponse.json({ success: false, error: { code: 'E4001', message: 'Card not found' } }, { status: 404 });
    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: 'Failed to fetch card' } }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;
    const body = await request.json();
    const card = await IDCardService.update(id, user.tenantId, body);
    if (!card) return NextResponse.json({ success: false, error: { code: 'E4001', message: 'Card not found' } }, { status: 404 });
    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: 'Failed to update card' } }, { status: 500 });
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;
    const card = await IDCardService.delete(id, user.tenantId);
    if (!card) return NextResponse.json({ success: false, error: { code: 'E4001', message: 'Card not found' } }, { status: 404 });
    return NextResponse.json({ success: true, data: { message: 'Card deleted' } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: 'Failed to delete card' } }, { status: 500 });
  }
});
