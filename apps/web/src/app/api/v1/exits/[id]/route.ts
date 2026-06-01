import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ServiceProxy } from '@/lib/services/service-proxy';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('exits:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing exits:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    // Fetch exit request from microservice
    const exitRequest = await ServiceProxy.get('employee', `/exits/${id}`, {
      tenantId: user.tenantId,
    });
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
    const { user, params, permissions } = context;
    if (!permissions.includes('exits:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing exits:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;
    const body = await request.json();

    // Update exit request via microservice
    const exitRequest = await ServiceProxy.put('employee', `/exits/${id}`, {
      ...body,
      tenantId: user.tenantId,
    });
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
    const { user, params, permissions } = context;
    if (!permissions.includes('exits:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing exits:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    // Delete exit request via microservice
    const exitRequest = await ServiceProxy.delete(
      'employee',
      `/exits/${id}?tenantId=${user.tenantId}`
    );
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
