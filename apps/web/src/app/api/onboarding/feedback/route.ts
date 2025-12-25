import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Mock data - replace with actual database queries
    const feedback_UPPER = [];

    return NextResponse.json({ feedback: feedback_UPPER }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock create - replace with actual database insert
    const feedback = {
      id: `feedback-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };

    return NextResponse.json({ feedback }, { status: 201 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock update - replace with actual database update
    const feedback = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ feedback }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
