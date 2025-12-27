import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { IDCardService } from '@/lib/services/id-card.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const stats = await IDCardService.getStatistics(user.tenantId);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: 'Failed to fetch statistics' } }, { status: 500 });
  }
});
