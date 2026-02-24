import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultCheckups = [
      {
        id: 'chk-001',
        type: 'General Checkup',
        date: new Date().toISOString(),
        doctor: 'Dr. General',
        clinic: 'City General Hospital',
        status: 'Completed',
        tenantId: user.tenantId,
      },
    ];

    return NextResponse.json(
      { success: true, data: defaultCheckups },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching checkups:', error);
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

    const checkup = {
      ...body,
      id: `chk-${Date.now()}`,
      tenantId: user.tenantId,
      date: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: checkup },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating checkup:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
