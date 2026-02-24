import { NextRequest, NextResponse } from 'next/server';
import { ServiceProxy } from '@/lib/services/service-proxy';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    // Fetch exit request from microservice
    const exitRequest = await ServiceProxy.get('employee', `/exits/${id}`, { tenantId: user.tenantId });
    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exitRequest });
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

    // Update exit request via microservice
    const exitRequest = await ServiceProxy.put('employee', `/exits/${id}`, { ...body, tenantId: user.tenantId });
    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exitRequest });
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

    // Delete exit request via microservice
    const exitRequest = await ServiceProxy.delete('employee', `/exits/${id}?tenantId=${user.tenantId}`);
    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exitRequest });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
