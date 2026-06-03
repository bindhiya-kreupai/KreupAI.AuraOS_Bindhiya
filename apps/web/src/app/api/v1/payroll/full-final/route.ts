import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { fullFinalService, type FullFinalStatus } from '@/lib/services/full-final.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    try {
      if (!context.permissions.includes('payroll:read')) {
        return NextResponse.json(
          { success: false, error: { code: 'E4030', message: 'missing payroll:read' } },
          { status: 403 }
        );
      }
      const url = new URL(request.url);
      const result = await fullFinalService.list({
        tenantId: context.user.tenantId,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: (url.searchParams.get('status') as FullFinalStatus) ?? undefined,
        countryCode: url.searchParams.get('countryCode') ?? undefined,
        page: Number(url.searchParams.get('page')) || 1,
        limit: Number(url.searchParams.get('limit')) || 20,
      });
      return NextResponse.json({
        success: true,
        ...result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to list full-final settlements',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
