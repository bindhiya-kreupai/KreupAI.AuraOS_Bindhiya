import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  costBudgetService,
  type BudgetScope,
  InvalidThresholdError,
} from '@/lib/services/cost-budget.service';

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
    if (url.searchParams.get('evaluate') === 'true') {
      const evaluations = await costBudgetService.evaluateAll(tenantId);
      return NextResponse.json({ success: true, evaluations });
    }
    const result = await costBudgetService.list({
      tenantId,
      scope: (url.searchParams.get('scope') as BudgetScope) ?? undefined,
      activeOnly: url.searchParams.get('activeOnly') === 'true',
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
        if (!context.permissions.includes('finops:write')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing finops:write' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.name || !body?.scope || body?.monthlyBudget === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'name, scope, monthlyBudget required' },
            },
            { status: 400 }
          );
        }
        const created = await costBudgetService.create({
          tenantId: body.platformWide ? null : context.user.tenantId,
          name: body.name,
          scope: body.scope,
          scopeValue: body.scopeValue,
          monthlyBudget: Number(body.monthlyBudget),
          currency: body.currency,
          alertThresholdPct: body.alertThresholdPct,
          forecastThresholdPct: body.forecastThresholdPct,
          ownerEmail: body.ownerEmail,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Budget created' },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof InvalidThresholdError) {
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
              message: 'Failed to create budget',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'cost_budget', captureRequestBody: true }
);
