/**
 * EPIC-16-S12, EPIC-17-S12, EPIC-18-S14 — retention metrics tied to
 * each nationalisation program. Captures HIRED / CONFIRMED / RESIGNED
 * / TERMINATED events and derives early-attrition flags by comparing
 * eventDate − hireDate against earlyAttritionThresholdDays (default
 * 365). KPIs computable per program over a date range.
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

export interface RetentionEventInput {
  employeeId: string;
  program: string;
  nationalityFlag: 'NATIONAL' | 'EXPAT' | 'MIXED';
  eventType: 'HIRED' | 'CONFIRMED' | 'RESIGNED' | 'TERMINATED' | 'TRANSFERRED';
  eventDate: Date;
  hireDate?: Date;
  earlyAttritionThresholdDays?: number;
  reasonCode?: string;
  notes?: string;
}

export interface RetentionKpis {
  hires: number;
  exits: number;
  earlyAttritionCount: number;
  earlyAttritionPct: number;
  netGrowth: number;
}

const EXIT_EVENTS = new Set(['RESIGNED', 'TERMINATED']);

/** Pure helper: compute days between two dates (rounded down). */
export function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Pure helper: returns true when event ⇒ exit AND days < threshold. */
export function isEarlyAttrition(
  eventType: string,
  daysFromHire: number | null,
  thresholdDays: number
): boolean {
  if (!EXIT_EVENTS.has(eventType)) return false;
  if (daysFromHire === null) return false;
  return daysFromHire >= 0 && daysFromHire < thresholdDays;
}

export class NationalisationRetentionService {
  async record(input: RetentionEventInput, auth: AuthContext) {
    const threshold = input.earlyAttritionThresholdDays ?? 365;
    const daysFromHire = input.hireDate ? daysBetween(input.eventDate, input.hireDate) : null;
    const earlyAttrition = isEarlyAttrition(input.eventType, daysFromHire, threshold);
    return (prisma as any).nationalisationRetentionEvent.create({
      data: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        program: input.program,
        nationalityFlag: input.nationalityFlag,
        eventType: input.eventType,
        eventDate: input.eventDate,
        hireDate: input.hireDate ?? null,
        daysFromHire,
        earlyAttritionThresholdDays: threshold,
        isEarlyAttrition: earlyAttrition,
        reasonCode: input.reasonCode ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async list(
    tenantId: string,
    filter: {
      program?: string;
      eventType?: string;
      isEarlyAttrition?: boolean;
      employeeId?: string;
      from?: Date;
      to?: Date;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.program ? { program: filter.program } : {}),
      ...(filter.eventType ? { eventType: filter.eventType } : {}),
      ...(filter.isEarlyAttrition !== undefined
        ? { isEarlyAttrition: filter.isEarlyAttrition }
        : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.from || filter.to
        ? {
            eventDate: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).nationalisationRetentionEvent.findMany({
        where,
        orderBy: { eventDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).nationalisationRetentionEvent.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async kpis(
    tenantId: string,
    program: string,
    range: { from: Date; to: Date }
  ): Promise<RetentionKpis> {
    const events: Array<{
      eventType: string;
      isEarlyAttrition: boolean;
    }> = await (prisma as any).nationalisationRetentionEvent.findMany({
      where: {
        tenantId,
        program,
        eventDate: { gte: range.from, lte: range.to },
      },
      select: { eventType: true, isEarlyAttrition: true },
    });
    const hires = events.filter((e) => e.eventType === 'HIRED').length;
    const exits = events.filter((e) => EXIT_EVENTS.has(e.eventType)).length;
    const earlyAttritionCount = events.filter((e) => e.isEarlyAttrition).length;
    const earlyAttritionPct = exits === 0 ? 0 : Math.round((earlyAttritionCount / exits) * 100);
    return { hires, exits, earlyAttritionCount, earlyAttritionPct, netGrowth: hires - exits };
  }
}

export const nationalisationRetentionService = new NationalisationRetentionService();
