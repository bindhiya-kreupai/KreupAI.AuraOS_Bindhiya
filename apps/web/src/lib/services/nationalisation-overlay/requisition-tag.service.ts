/**
 * EPIC-16-S07, EPIC-17-S11, EPIC-18-S07 — TA pipeline overlay.
 *
 * Per-requisition tag flagging national preference / mandatory / reserved
 * seat, with optional target share of nationals among hires. Read by
 * recruitment-compliance dashboards to filter pipelines and by the
 * nationalisation services to score requisition coverage.
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export class NationalisationRequisitionTagService {
  async list(
    tenantId: string,
    filter: {
      program?: string;
      eligibility?: string;
      isReservedSeat?: boolean;
      requisitionId?: string;
    } = {}
  ) {
    return (prisma as any).nationalisationRequisitionTag.findMany({
      where: {
        tenantId,
        ...(filter.program ? { program: filter.program } : {}),
        ...(filter.eligibility ? { eligibility: filter.eligibility } : {}),
        ...(filter.isReservedSeat !== undefined ? { isReservedSeat: filter.isReservedSeat } : {}),
        ...(filter.requisitionId ? { requisitionId: filter.requisitionId } : {}),
      },
      orderBy: [{ program: 'asc' }, { eligibility: 'asc' }],
      take: 500,
    });
  }

  async upsert(
    input: {
      requisitionId: string;
      program: string;
      eligibility?: string;
      isReservedSeat?: boolean;
      targetShareNationals?: number;
      sourceChannel?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    if (
      input.targetShareNationals !== undefined &&
      (input.targetShareNationals < 0 || input.targetShareNationals > 100)
    ) {
      throw new Error('targetShareNationals must be between 0 and 100');
    }
    return (prisma as any).nationalisationRequisitionTag.upsert({
      where: {
        aura_nationalisation_requisition_tag_unique: {
          tenantId: auth.tenantId,
          requisitionId: input.requisitionId,
          program: input.program,
        },
      },
      update: {
        eligibility: input.eligibility ?? 'PREFERRED',
        isReservedSeat: input.isReservedSeat ?? false,
        targetShareNationals: input.targetShareNationals ?? null,
        sourceChannel: input.sourceChannel ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        requisitionId: input.requisitionId,
        program: input.program,
        eligibility: input.eligibility ?? 'PREFERRED',
        isReservedSeat: input.isReservedSeat ?? false,
        targetShareNationals: input.targetShareNationals ?? null,
        sourceChannel: input.sourceChannel ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async remove(id: string, auth: AuthContext) {
    return (prisma as any).nationalisationRequisitionTag.deleteMany({
      where: { id, tenantId: auth.tenantId },
    });
  }

  /** Aggregate reserved-seat count per program. */
  async reservedSeatCount(tenantId: string, program: string): Promise<number> {
    return (prisma as any).nationalisationRequisitionTag.count({
      where: { tenantId, program, isReservedSeat: true },
    });
  }
}

export const nationalisationRequisitionTagService = new NationalisationRequisitionTagService();
