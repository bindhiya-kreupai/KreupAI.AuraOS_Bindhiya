import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Mock data - replace with actual database queries
    const sequences_UPPER = [];

    return NextResponse.json({ sequences: sequences_UPPER }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sequences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock create - replace with actual database insert
    const sequence = {
      id: `sequence-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };

    return NextResponse.json({ sequence }, { status: 201 });
  } catch (error) {
    console.error('Error creating sequence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Mock update - replace with actual database update
    const sequence = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ sequence }, { status: 200 });
  } catch (error) {
    console.error('Error updating sequence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
