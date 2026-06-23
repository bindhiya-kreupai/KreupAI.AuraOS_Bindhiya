/**
 * EPIC-16-S08, EPIC-18-S08 — eligible-role tagging on Position / JobProfile.
 *
 * Per-(targetType, targetId, program) tag declaring whether the seat is
 * mandatory / preferred / neutral / excluded for the nationalisation
 * program. `reservedSeats` lets the workforce planner reserve N seats
 * at the position level so the recruitment dashboard can pre-flag them.
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

export class NationalisationJobTagService {
  async list(
    tenantId: string,
    filter: {
      program?: string;
      eligibility?: string;
      targetType?: string;
      targetId?: string;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.program ? { program: filter.program } : {}),
      ...(filter.eligibility ? { eligibility: filter.eligibility } : {}),
      ...(filter.targetType ? { targetType: filter.targetType } : {}),
      ...(filter.targetId ? { targetId: filter.targetId } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).nationalisationJobTag.findMany({
        where,
        orderBy: [{ program: 'asc' }, { targetType: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).nationalisationJobTag.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async upsert(
    input: {
      targetType: string;
      targetId: string;
      program: string;
      eligibility?: string;
      reservedSeats?: number;
      professionCode?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    if (input.reservedSeats !== undefined && input.reservedSeats < 0) {
      throw new Error('reservedSeats cannot be negative');
    }
    return (prisma as any).nationalisationJobTag.upsert({
      where: {
        aura_nationalisation_job_tag_unique: {
          tenantId: auth.tenantId,
          targetType: input.targetType,
          targetId: input.targetId,
          program: input.program,
        },
      },
      update: {
        eligibility: input.eligibility ?? 'PREFERRED',
        reservedSeats: input.reservedSeats ?? 0,
        professionCode: input.professionCode ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        targetType: input.targetType,
        targetId: input.targetId,
        program: input.program,
        eligibility: input.eligibility ?? 'PREFERRED',
        reservedSeats: input.reservedSeats ?? 0,
        professionCode: input.professionCode ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async remove(id: string, auth: AuthContext) {
    return (prisma as any).nationalisationJobTag.deleteMany({
      where: { id, tenantId: auth.tenantId },
    });
  }

  async reservedSeatTotal(tenantId: string, program: string): Promise<number> {
    const rows = await (prisma as any).nationalisationJobTag.findMany({
      where: { tenantId, program },
      select: { reservedSeats: true },
    });
    return (rows as Array<{ reservedSeats: number }>).reduce(
      (s, r) => s + (r.reservedSeats ?? 0),
      0
    );
  }
}

export const nationalisationJobTagService = new NationalisationJobTagService();
