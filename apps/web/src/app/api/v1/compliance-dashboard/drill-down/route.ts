/**
 * EPIC-31 drill-down API.
 *
 * Returns the recursive Global → Country → Entity → Department
 * drill-down tree built from the tenant's open RedFlagInstance rows.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  aggregateFlagsByCountryEntity,
  type FlagSnapshot,
} from '@/lib/services/executive-compliance/drill-down.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  status: z.string().optional().nullable(),
});

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
    const parsed = querySchema.safeParse({ status: url.searchParams.get('status') });
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const { status } = parsed.data;
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

    const [entities, depts] = await Promise.all([
      (prisma as any).gccLegalEntity.findMany({
        where: { tenantId: ctx.user.tenantId },
        select: { id: true, legalName: true },
      }),
      (prisma as any).department.findMany({
        where: { company: { tenantId: ctx.user.tenantId } },
        select: { id: true, name: true },
      }),
    ]);

    const entityMap = new Map<string, string>(entities.map((e: any) => [e.id, e.legalName]));
    const deptMap = new Map<string, string>(depts.map((d: any) => [d.id, d.name]));

    function mapTreeLabels(node: any): any {
      let label = node.label;
      if (node.level === 'ENTITY') {
        label = entityMap.get(node.key) ?? node.label;
      } else if (node.level === 'DEPARTMENT') {
        label = deptMap.get(node.key) ?? node.label;
      }
      return {
        ...node,
        label,
        children: node.children ? node.children.map((c: any) => mapTreeLabels(c)) : undefined,
      };
    }

    const snapshots = rows.map(snapshotFromRow);
    const rawTree = aggregateFlagsByCountryEntity(snapshots);
    const mappedTree = mapTreeLabels(rawTree);

    return ok(mappedTree);
  } catch (err) {
    return serverError('Failed to load drill-down tree', err);
  }
});
