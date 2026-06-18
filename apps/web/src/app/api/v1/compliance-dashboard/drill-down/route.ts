/**
 * EPIC-31 drill-down API.
 *
 * Returns the recursive Global → Country → Entity → Department
 * drill-down tree built from the tenant's open RedFlagInstance rows.
 */

import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  aggregateFlagsByCountryEntity,
  type FlagSnapshot,
} from '@/lib/services/executive-compliance/drill-down.service';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

function snapshotFromRow(row: any): FlagSnapshot {
  const details = (row.details ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    domain: row.domain,
    severity: row.severity,
    countryCode:
      (details.countryCode as string | undefined) ??
      (details.country as string | undefined) ??
      'UNASSIGNED',
    legalEntityId: details.legalEntityId as string | undefined,
    departmentId: details.departmentId as string | undefined,
    costCenterId: details.costCenterId as string | undefined,
    status: row.status,
    raisedAt: row.raisedAt,
    label: (details.label as string | undefined) ?? row.ruleCode,
  };
}

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') ?? undefined;
    const rows = await (prisma as any).redFlagInstance.findMany({
      where: {
        tenantId: ctx.user.tenantId,
        ...(status ? { status } : { status: { in: ['OPEN', 'IN_PROGRESS'] } }),
      },
      orderBy: { raisedAt: 'desc' },
      take: 5000,
      select: {
        id: true,
        domain: true,
        severity: true,
        status: true,
        ruleCode: true,
        raisedAt: true,
        details: true,
      },
    });
    const snapshots = rows.map(snapshotFromRow);
    const tree = aggregateFlagsByCountryEntity(snapshots);
    return ok(tree);
  } catch (err) {
    return serverError('Failed to load drill-down tree', err);
  }
});
