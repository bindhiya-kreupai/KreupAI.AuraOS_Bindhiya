import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    return NextResponse.json({
      success: true,
      data: {
        policies: [],
        tenantId: user.tenantId,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const policy = {
      ...body,
      policyId: `pol-${Date.now()}`,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      status: body.status || 'draft',
    };

    return NextResponse.json({ success: true, data: { policy } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create policy' },
      { status: 500 }
    );
  }
});
