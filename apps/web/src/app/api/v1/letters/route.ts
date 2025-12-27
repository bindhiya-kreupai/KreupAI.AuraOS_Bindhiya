import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LetterService } from '@/lib/services/letter.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const result = await LetterService.findAll({ tenantId: user.tenantId, page: 1, limit: 20 });
    return NextResponse.json({ success: true, data: result.data, meta: { pagination: result.pagination } });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: 'Failed' } }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    body.tenantId = user.tenantId;
    const data = await LetterService.create(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: error.message } }, { status: 500 });
  }
});
