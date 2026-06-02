import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaPermitService } from '@/lib/services/visa-permit.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/visa-permits/expiring?days=30
 * Returns ACTIVE visa/permit records expiring within the given window. Powers
 * the GCC visa-expiry alert dashboard.
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('employee:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing employee:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const days = Number(url.searchParams.get('days') ?? 30);
    if (!Number.isFinite(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'days must be in [1, 365]' } },
        { status: 400 }
      );
    }
    const items = await visaPermitService.expiringSoon({
      tenantId: context.user.tenantId,
      days,
      employeeId: url.searchParams.get('employeeId') ?? undefined,
    });
    return NextResponse.json({
      success: true,
      items,
      windowDays: days,
      total: items.length,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  }
);
