/**
 * EPIC-17-S09 — Saudi profession-localisation code table.
 *
 * Saudi-specific reference register: profession code, English/Arabic
 * labels, `reservedForSaudis` flag, minimum nationalisation % per
 * profession. Effective-dated so MHRSD updates (e.g. additions to the
 * reserved list each year) are captured with citation.
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export class SaudiProfessionService {
  async list(
    tenantId: string,
    filter: { reservedForSaudis?: boolean; isicCode?: string; at?: Date } = {}
  ) {
    const at = filter.at;
    return (prisma as any).saudiProfessionLocalization.findMany({
      where: {
        tenantId,
        ...(filter.reservedForSaudis !== undefined
          ? { reservedForSaudis: filter.reservedForSaudis }
          : {}),
        ...(filter.isicCode ? { isicCode: filter.isicCode } : {}),
        ...(at
          ? {
              effectiveFrom: { lte: at },
              OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }],
            }
          : {}),
      },
      orderBy: [{ professionCode: 'asc' }, { effectiveFrom: 'desc' }],
      take: 1000,
    });
  }

  async upsert(
    input: {
      professionCode: string;
      professionNameEn: string;
      professionNameAr?: string;
      isicCode?: string;
      reservedForSaudis?: boolean;
      minimumNationalisationPct?: number;
      effectiveFrom: Date;
      effectiveTo?: Date;
      regulatorRef?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    if (
      input.minimumNationalisationPct !== undefined &&
      (input.minimumNationalisationPct < 0 || input.minimumNationalisationPct > 100)
    ) {
      throw new Error('minimumNationalisationPct must be between 0 and 100');
    }
    return (prisma as any).saudiProfessionLocalization.upsert({
      where: {
        aura_saudi_profession_localization_unique: {
          tenantId: auth.tenantId,
          professionCode: input.professionCode,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: {
        professionNameEn: input.professionNameEn,
        professionNameAr: input.professionNameAr ?? null,
        isicCode: input.isicCode ?? null,
        reservedForSaudis: input.reservedForSaudis ?? false,
        minimumNationalisationPct: input.minimumNationalisationPct ?? null,
        effectiveTo: input.effectiveTo ?? null,
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        professionCode: input.professionCode,
        professionNameEn: input.professionNameEn,
        professionNameAr: input.professionNameAr ?? null,
        isicCode: input.isicCode ?? null,
        reservedForSaudis: input.reservedForSaudis ?? false,
        minimumNationalisationPct: input.minimumNationalisationPct ?? null,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async resolve(tenantId: string, professionCode: string, at: Date = new Date()) {
    const rows: any[] = await (prisma as any).saudiProfessionLocalization.findMany({
      where: {
        tenantId,
        professionCode,
        effectiveFrom: { lte: at },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    return rows[0] ?? null;
  }

  async reservedCount(tenantId: string): Promise<number> {
    return (prisma as any).saudiProfessionLocalization.count({
      where: { tenantId, reservedForSaudis: true },
    });
  }
}

export const saudiProfessionService = new SaudiProfessionService();
