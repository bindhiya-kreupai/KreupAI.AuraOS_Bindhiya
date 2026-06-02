import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    return NextResponse.json(
      { success: true, data: { acknowledgements: [] }, tenantId: user.tenantId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching acknowledgements:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const acknowledgement = {
      ...body,
      id: `ack-${Date.now()}`,
      tenantId: user.tenantId,
      acknowledgedDate: new Date().toISOString(),
      status: 'acknowledged',
    };

    return NextResponse.json(
      { success: true, data: { acknowledgement } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating acknowledgement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
