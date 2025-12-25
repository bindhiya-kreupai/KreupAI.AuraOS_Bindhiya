import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Mock data - replace with actual database queries
    const letters_UPPER = [];

    return NextResponse.json({ letters: letters_UPPER }, { status: 200 });
  } catch (error) {
    console.error('Error fetching letters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock create - replace with actual database insert
    const letter = {
      id: `letter-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    console.error('Error creating letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock update - replace with actual database update
    const letter = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ letter }, { status: 200 });
  } catch (error) {
    console.error('Error updating letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
