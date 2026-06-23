/**
 * EPIC-16-S13, EPIC-18-S15 — national L&D plan tracking per employee
 * per program. Lightweight wrapper: status (PLANNED → ACTIVE → COMPLETED
 * | CANCELLED), milestones JSON, completion percentage. The underlying
 * learning records still live in the LMS / training register; this
 * table is the compliance lens that ties them to the nationalisation
 * program.
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export type DevelopmentPlanStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export class NationalisationDevelopmentPlanService {
  async list(
    tenantId: string,
    filter: { program?: string; employeeId?: string; status?: DevelopmentPlanStatus } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.program ? { program: filter.program } : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).nationalisationDevelopmentPlan.findMany({
        where,
        orderBy: [{ program: 'asc' }, { employeeId: 'asc' }, { planCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).nationalisationDevelopmentPlan.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async upsert(
    input: {
      employeeId: string;
      program: string;
      planCode: string;
      label: string;
      targetCompetencies?: string[];
      milestones?: Array<{ code: string; label: string; weightPct: number; completed?: boolean }>;
      startDate?: Date;
      targetEndDate?: Date;
      ownerRole?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).nationalisationDevelopmentPlan.upsert({
      where: {
        aura_nationalisation_development_plan_unique: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          program: input.program,
          planCode: input.planCode,
        },
      },
      update: {
        label: input.label,
        targetCompetenciesJson: (input.targetCompetencies ?? null) as any,
        milestonesJson: (input.milestones ?? null) as any,
        startDate: input.startDate ?? null,
        targetEndDate: input.targetEndDate ?? null,
        ownerRole: input.ownerRole ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        program: input.program,
        planCode: input.planCode,
        label: input.label,
        status: 'PLANNED' as DevelopmentPlanStatus,
        targetCompetenciesJson: (input.targetCompetencies ?? null) as any,
        milestonesJson: (input.milestones ?? null) as any,
        startDate: input.startDate ?? null,
        targetEndDate: input.targetEndDate ?? null,
        ownerRole: input.ownerRole ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async setStatus(
    id: string,
    input: { status: DevelopmentPlanStatus; completionPct?: number },
    auth: AuthContext
  ) {
    if (
      input.completionPct !== undefined &&
      (input.completionPct < 0 || input.completionPct > 100)
    ) {
      throw new Error('completionPct must be between 0 and 100');
    }
    const completedAt = input.status === 'COMPLETED' ? new Date() : null;
    const completionPct = input.status === 'COMPLETED' ? 100 : (input.completionPct ?? 0);
    const row = await (prisma as any).nationalisationDevelopmentPlan.findUnique({
      where: { id },
    });
    if (!row || row.tenantId !== auth.tenantId) throw new Error('plan not found');
    return (prisma as any).nationalisationDevelopmentPlan.update({
      where: { id },
      data: {
        status: input.status,
        completionPct,
        completedAt,
      },
    });
  }

  async stats(tenantId: string, program: string) {
    const [planned, active, completed, cancelled] = await Promise.all([
      (prisma as any).nationalisationDevelopmentPlan.count({
        where: { tenantId, program, status: 'PLANNED' },
      }),
      (prisma as any).nationalisationDevelopmentPlan.count({
        where: { tenantId, program, status: 'ACTIVE' },
      }),
      (prisma as any).nationalisationDevelopmentPlan.count({
        where: { tenantId, program, status: 'COMPLETED' },
      }),
      (prisma as any).nationalisationDevelopmentPlan.count({
        where: { tenantId, program, status: 'CANCELLED' },
      }),
    ]);
    const total = planned + active + completed + cancelled;
    const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { planned, active, completed, cancelled, total, completionPct };
  }
}

export const nationalisationDevelopmentPlanService = new NationalisationDevelopmentPlanService();
