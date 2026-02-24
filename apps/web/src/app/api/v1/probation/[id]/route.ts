import { NextRequest, NextResponse } from 'next/server';
import { ServiceProxy } from '@/lib/services/service-proxy';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    // Fetch probation from microservice
    const probation = await ServiceProxy.get('employee', `/probation/${id}`, { tenantId: user.tenantId });
    if (!probation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Probation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: probation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;
    const body = await request.json();

    // Update probation via microservice
    const probation = await ServiceProxy.put('employee', `/probation/${id}`, { ...body, tenantId: user.tenantId });
    if (!probation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Probation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: probation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    // Delete probation via microservice
    const probation = await ServiceProxy.delete('employee', `/probation/${id}?tenantId=${user.tenantId}`);
    if (!probation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Probation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: probation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
