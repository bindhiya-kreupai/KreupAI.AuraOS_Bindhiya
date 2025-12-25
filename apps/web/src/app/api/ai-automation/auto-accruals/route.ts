import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const accruals = [];
    return NextResponse.json({ accruals }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
