import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ServiceProxy } from '@/lib/services/service-proxy';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('probation:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing probation:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;
    const body = await request.json();
    const { hrRecommendation } = body;

    // Confirm probation via microservice
    const probation = await ServiceProxy.post('employee', `/probation/${id}/confirm`, {
      hrRecommendation,
      tenantId: user.tenantId,
    });
    return NextResponse.json({ success: true, data: probation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E3001', message: error.message } },
      { status: 400 }
    );
  }
});
