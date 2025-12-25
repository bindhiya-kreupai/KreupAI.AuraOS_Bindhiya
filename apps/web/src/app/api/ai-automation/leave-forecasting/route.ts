import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const forecasts = [];
    return NextResponse.json({ forecasts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching leave forecasts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
