import { prisma } from '@aura/database';
import type { AuthContext, Severity } from './types';
import { checklistRunService } from './run.service';

export interface RaiseFlagInput {
  ruleCode: string;
  domain: string;
  severity: Severity;
  sourceType: string;
  sourceId: string;
  checklistRunId?: string;
  itemCode?: string;
  details?: Record<string, unknown>;
}

/**
 * EPIC-37-S03 / S04 / S05 / S06 / S07 / S08: red-flag rule engine.
 *
 * raiseFlag() — idempotent on (rule, source). If a checklistRunId+itemCode
 * is provided, the corresponding run item is auto-set to NON_COMPLIANT and
 * linked to the flag.
 */
export class RedFlagService {
  async raiseFlag(input: RaiseFlagInput, auth: AuthContext) {
    const now = new Date();
    let instance: any = null;
    try {
      instance = await (prisma as any).redFlagInstance.create({
        data: {
          tenantId: auth.tenantId,
          ruleCode: input.ruleCode,
          domain: input.domain,
          severity: input.severity,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          checklistRunId: input.checklistRunId,
          details: input.details ?? {},
          raisedAt: now,
          status: 'OPEN',
        },
      });
    } catch (err) {
      if (!String(err).includes('Unique')) throw err;
      // Already raised — fetch existing
      instance = await (prisma as any).redFlagInstance.findFirst({
        where: {
          tenantId: auth.tenantId,
          ruleCode: input.ruleCode,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          status: 'OPEN',
        },
      });
    }
    if (input.checklistRunId && input.itemCode && instance) {
      await checklistRunService.recordAutoEvaluation(
        input.checklistRunId,
        input.itemCode,
        instance.id,
        'NON_COMPLIANT'
      );
    }
    return instance;
  }

  async clearFlag(flagId: string) {
    return (prisma as any).redFlagInstance.update({
      where: { id: flagId },
      data: { status: 'CLEARED', clearedAt: new Date() },
    });
  }

  async list(
    tenantId: string,
    filter: { domain?: string; severity?: string; status?: string; sourceId?: string } = {}
  ) {
    return (prisma as any).redFlagInstance.findMany({
      where: {
        tenantId,
        ...(filter.domain ? { domain: filter.domain } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.sourceId ? { sourceId: filter.sourceId } : {}),
      },
      orderBy: { raisedAt: 'desc' },
      take: 500,
    });
  }
}

export const redFlagService = new RedFlagService();
