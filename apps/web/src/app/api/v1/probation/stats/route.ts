import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ServiceProxy } from '@/lib/services/service-proxy';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('probation:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing probation:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    // Fetch stats from microservice
    const stats = await ServiceProxy.get('employee', '/probation/stats', {
      tenantId: user.tenantId,
    });
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
