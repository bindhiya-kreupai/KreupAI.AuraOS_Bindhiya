import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const accruals: any[] = [];
    return NextResponse.json({ accruals }, { status: 200 });
  } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
