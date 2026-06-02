import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { fullFinalService } from '@/lib/services/full-final.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (
    _request: NextRequest,
    context: {
      user: { tenantId: string };
      permissions: string[];
      params?: { id?: string };
    }
  ) => {
    try {
      if (!context.permissions.includes('payroll:read')) {
        return NextResponse.json(
          { success: false, error: { code: 'E4030', message: 'missing payroll:read' } },
          { status: 403 }
        );
      }
      const id = context.params?.id;
      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'E4040', message: 'F&F record not found' } },
          { status: 404 }
        );
      }
      const item = await fullFinalService.getById(id, context.user.tenantId);
      if (!item) {
        return NextResponse.json(
          { success: false, error: { code: 'E4040', message: 'F&F record not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: item });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to load F&F record',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
