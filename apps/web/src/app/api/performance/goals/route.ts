import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Mock data - replace with actual database queries
    const goals_UPPER = [];

    return NextResponse.json({ goals: goals_UPPER }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock create - replace with actual database insert
    const goal = {
      id: `goal-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };

    return NextResponse.json({ goal }, { status: 201 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock update - replace with actual database update
    const goal = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ goal }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
