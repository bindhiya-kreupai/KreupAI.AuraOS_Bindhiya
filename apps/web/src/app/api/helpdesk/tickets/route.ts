import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;

    return NextResponse.json({
      success: true,
      data: {
        tickets: [],
        tenantId: user.tenantId,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch helpdesk tickets' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const ticket = {
      ...body,
      ticketId: `ticket-${Date.now()}`,
      ticketNumber: `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      status: body.status || 'new',
    };

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create helpdesk ticket' },
      { status: 500 }
    );
  }
});
