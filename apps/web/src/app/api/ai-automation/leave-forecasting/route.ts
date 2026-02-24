import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const forecasts: any[] = [];
    return NextResponse.json({ forecasts }, { status: 200 });
  } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
