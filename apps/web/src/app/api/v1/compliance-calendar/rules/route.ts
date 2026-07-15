import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceCalendarService } from '@/lib/services/compliance-calendar';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceCalendarService.listRules(ctx.user.tenantId, {
        categoryCode: url.searchParams.get('categoryCode') ?? undefined,
        countryCode: url.searchParams.get('countryCode') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list rules', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const { prisma } = require('@aura/database');

    if (body.action === 'toggle') {
      if (!body.ruleId) return badRequest('ruleId required');
      const updated = await (prisma as any).recurrenceRule.update({
        where: { id: body.ruleId },
        data: { isActive: body.isActive ?? true },
      });
      return ok(updated);
    }

    if (body.action === 'delete') {
      if (!body.ruleId) return badRequest('ruleId required');
      const deleted = await (prisma as any).recurrenceRule.update({
        where: { id: body.ruleId },
        data: { isDeleted: true, deletedAt: new Date(), isActive: false },
      });
      return ok(deleted);
    }

    // Default: Create
    for (const f of ['code', 'name', 'categoryCode', 'cadence', 'ownerRole']) {
      if (!body[f]) return badRequest(`${f} required`);
    }

    const rule = await (prisma as any).recurrenceRule.create({
      data: {
        tenantId: ctx.user.tenantId,
        code: body.code,
        name: body.name,
        categoryCode: body.categoryCode,
        countryCode: body.countryCode || null,
        legalEntityId: body.legalEntityId || null,
        cadence: body.cadence,
        dayOfMonth: body.dayOfMonth ? Number(body.dayOfMonth) : null,
        monthOfYear: body.monthOfYear ? Number(body.monthOfYear) : null,
        ownerRole: body.ownerRole,
        escalationRole: body.escalationRole || null,
        leadDays: body.leadDays ? Number(body.leadDays) : 7,
        tierAlerts: body.tierAlerts || [],
        isActive: true,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
      },
    });
    return ok(rule);
  } catch (err) {
    return serverError('Failed to manage recurrence rule', err);
  }
});
