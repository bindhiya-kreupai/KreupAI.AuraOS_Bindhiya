import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    return NextResponse.json({
      success: true,
      data: {
        incidents: [],
        tenantId: user.tenantId,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const incident = {
      ...body,
      id: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      tenantId: user.tenantId,
      reportedAt: new Date().toISOString(),
      status: body.status || 'Open',
    };

    return NextResponse.json({ success: true, data: incident }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create incident' },
      { status: 500 }
    );
  }
});
