import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  cloudCostService,
  type CloudProvider,
  type CloudService,
} from '@/lib/services/cloud-cost.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('finops:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing finops:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('platformWide') === 'true' ? null : context.user.tenantId;
    if (url.searchParams.get('rollup') === 'true') {
      const now = new Date();
      const year = Number(url.searchParams.get('year')) || now.getUTCFullYear();
      const month = Number(url.searchParams.get('month')) || now.getUTCMonth() + 1;
      const r = await cloudCostService.monthSoFar(tenantId, year, month);
      return NextResponse.json({ success: true, rollup: r });
    }
    const result = await cloudCostService.list({
      tenantId,
      service: (url.searchParams.get('service') as CloudService) ?? undefined,
      provider: (url.searchParams.get('provider') as CloudProvider) ?? undefined,
      region: url.searchParams.get('region') ?? undefined,
      fromDay: url.searchParams.get('fromDay')
        ? new Date(url.searchParams.get('fromDay') as string)
        : undefined,
      toDay: url.searchParams.get('toDay')
        ? new Date(url.searchParams.get('toDay') as string)
        : undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 50,
    });
    return NextResponse.json({ success: true, ...result });
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('finops:write')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing finops:write' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (
          !body?.region ||
          !body?.service ||
          !body?.day ||
          body?.costAmount === undefined ||
          !body?.provider
        ) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'region, service, day, costAmount, provider required',
              },
            },
            { status: 400 }
          );
        }
        const created = await cloudCostService.record({
          tenantId: body.platformWide ? null : context.user.tenantId,
          region: body.region,
          service: body.service,
          resourceTag: body.resourceTag,
          day: new Date(body.day),
          costAmount: Number(body.costAmount),
          currency: body.currency,
          unitsConsumed: body.unitsConsumed,
          unitMeasure: body.unitMeasure,
          provider: body.provider,
          metadata: body.metadata,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Cost recorded' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to record cost',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'cloud_cost', captureRequestBody: true }
);
