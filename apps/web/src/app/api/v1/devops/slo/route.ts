import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  sloService,
  type SLOIndicatorType,
  InvalidSLOTargetError,
} from '@/lib/services/slo.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('devops:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing devops:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const result = await sloService.list({
      tenantId: url.searchParams.get('platformWide') === 'true' ? null : context.user.tenantId,
      serviceName: url.searchParams.get('serviceName') ?? undefined,
      indicatorType: (url.searchParams.get('indicatorType') as SLOIndicatorType) ?? undefined,
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
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('devops:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing devops:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (
          !body?.serviceName ||
          !body?.indicatorType ||
          body?.targetValue === undefined ||
          !body?.unit ||
          !body?.ownerTeam
        ) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'serviceName, indicatorType, targetValue, unit, ownerTeam required',
              },
            },
            { status: 400 }
          );
        }
        const created = await sloService.create({
          tenantId: body.platformWide ? null : context.user.tenantId,
          serviceName: body.serviceName,
          indicatorType: body.indicatorType,
          routePattern: body.routePattern,
          targetValue: Number(body.targetValue),
          unit: body.unit,
          errorBudgetWindow: body.errorBudgetWindow,
          ownerTeam: body.ownerTeam,
          runbookUrl: body.runbookUrl,
          alertChannel: body.alertChannel,
          description: body.description,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'SLO created' },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof InvalidSLOTargetError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4220', message: error.message } },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create SLO',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'slo', captureRequestBody: true }
);
