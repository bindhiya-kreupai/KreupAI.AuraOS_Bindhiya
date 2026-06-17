/**
 * EPIC-34-S26: Data migration plan + run + validation tracker.
 *
 * Migration plans (PLANNED → RUNNING → COMPLETED | FAILED | ROLLED_BACK)
 * with per-run counters (inserted / updated / skipped / errors) and a
 * pass/fail validations payload. The go-live certificate refuses to
 * sign while any migration is FAILED or has validationsPassed = false.
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

export type MigrationStatus = 'PLANNED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

export interface RunResultInput {
  status: MigrationStatus;
  inserted?: number;
  updated?: number;
  skipped?: number;
  errors?: number;
  validationsPassed?: boolean;
  validationsJson?: Record<string, unknown>;
  notes?: string;
}

export class HrmsMigrationService {
  async list(
    tenantId: string,
    filter: { domainCode?: string; status?: MigrationStatus } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.domainCode ? { domainCode: filter.domainCode } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).hrmsConfigMigration.findMany({
        where,
        orderBy: [{ domainCode: 'asc' }, { planCode: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).hrmsConfigMigration.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async upsert(
    input: {
      planCode: string;
      label: string;
      domainCode: string;
      sourceSystem: string;
      targetEntity: string;
      expectedRows?: number;
      notes?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hrmsConfigMigration.upsert({
      where: {
        aura_hrms_config_migration_unique: {
          tenantId: auth.tenantId,
          planCode: input.planCode,
        },
      },
      update: {
        label: input.label,
        domainCode: input.domainCode,
        sourceSystem: input.sourceSystem,
        targetEntity: input.targetEntity,
        expectedRows: input.expectedRows ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        planCode: input.planCode,
        label: input.label,
        domainCode: input.domainCode,
        sourceSystem: input.sourceSystem,
        targetEntity: input.targetEntity,
        expectedRows: input.expectedRows ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async recordRun(planCode: string, input: RunResultInput, auth: AuthContext) {
    return (prisma as any).hrmsConfigMigration.update({
      where: {
        aura_hrms_config_migration_unique: {
          tenantId: auth.tenantId,
          planCode,
        },
      },
      data: {
        status: input.status,
        lastRunAt: new Date(),
        lastRunResult: `${input.status} by ${auth.userId}`,
        lastRunInserted: input.inserted ?? 0,
        lastRunUpdated: input.updated ?? 0,
        lastRunSkipped: input.skipped ?? 0,
        lastRunErrors: input.errors ?? 0,
        validationsPassed: input.validationsPassed ?? false,
        validationsJson: (input.validationsJson ?? null) as any,
        notes: input.notes ?? null,
      },
    });
  }

  async failingCount(tenantId: string): Promise<number> {
    return (prisma as any).hrmsConfigMigration.count({
      where: {
        tenantId,
        OR: [{ status: 'FAILED' }, { validationsPassed: false }],
      },
    });
  }
}

export const hrmsMigrationService = new HrmsMigrationService();
