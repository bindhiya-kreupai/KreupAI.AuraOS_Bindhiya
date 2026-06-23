import { prisma } from '@aura/database';
import type { AuthContext, ItemStatus, Severity } from './types';
import { checklistTemplateService } from './template.service';

export interface StartRunInput {
  templateCode: string;
  period: string;
  countryCode?: string;
  legalEntityId?: string;
  employeeId?: string;
}

export interface AssessInput {
  runId: string;
  itemCode: string;
  status: ItemStatus;
  evidenceUrl?: string;
  reason?: string;
}

/**
 * EPIC-37-S02: Checklist run + status workflow + evidence + scoring.
 * EPIC-37-S03: Hooks for the red-flag rule engine — runItem.autoEvaluated
 * indicates a value derived from a red-flag evaluation.
 *
 * Workflow:
 *   start() -> assess() per item -> submit() -> approve() (preparer != approver).
 */
export class ChecklistRunService {
  async start(input: StartRunInput, auth: AuthContext) {
    const template = await checklistTemplateService.getActiveByCode(
      auth.tenantId,
      input.templateCode
    );
    if (!template) throw new Error(`no ACTIVE template ${input.templateCode}`);
    return prisma.$transaction(async (tx) => {
      const run = await (tx as any).checklistRun.create({
        data: {
          tenantId: auth.tenantId,
          templateId: template.id,
          templateCode: template.code,
          period: input.period,
          countryCode: input.countryCode,
          legalEntityId: input.legalEntityId,
          employeeId: input.employeeId,
          ownerRole: template.ownerRole,
          preparerId: auth.userId,
          status: 'OPEN',
          totalItems: template.items.length,
        },
      });
      for (const item of template.items as Array<{
        code: string;
        controlObjective: string;
        weighting: number;
      }>) {
        await (tx as any).checklistRunItem.create({
          data: {
            runId: run.id,
            itemCode: item.code,
            controlObjective: item.controlObjective,
            weighting: item.weighting,
            status: 'PENDING',
          },
        });
      }
      return run;
    });
  }

  async assess(input: AssessInput, auth: AuthContext) {
    const runItem = await (prisma as any).checklistRunItem.findUnique({
      where: { aura_checklist_run_item_unique: { runId: input.runId, itemCode: input.itemCode } },
    });
    if (!runItem) throw new Error('run item not found');
    const run = await (prisma as any).checklistRun.findUnique({ where: { id: input.runId } });
    if (!run) throw new Error('run not found');

    // Mandatory + evidenceRequired guard
    const template = await (prisma as any).checklistTemplate.findUnique({
      where: { id: run.templateId },
      include: { items: true },
    });
    const def = (
      template.items as Array<{ code: string; isMandatory: boolean; evidenceRequired: boolean }>
    ).find((i) => i.code === input.itemCode);
    if (def?.isMandatory && input.status === 'PENDING') {
      throw new Error('mandatory items cannot be left pending');
    }
    if (def?.evidenceRequired && input.status === 'COMPLIANT' && !input.evidenceUrl) {
      throw new Error('evidence URL required for compliant status');
    }

    return prisma.$transaction(async (tx) => {
      await (tx as any).checklistRunItem.update({
        where: { id: runItem.id },
        data: {
          status: input.status,
          evidenceUrl: input.evidenceUrl,
          reason: input.reason,
          reviewerId: auth.userId,
          reviewedAt: new Date(),
        },
      });
      await this.recomputeRunCounters(tx, input.runId);
      return (tx as any).checklistRun.findUnique({ where: { id: input.runId } });
    });
  }

  async recordAutoEvaluation(
    runId: string,
    itemCode: string,
    redFlagId: string | null,
    status: ItemStatus
  ) {
    const runItem = await (prisma as any).checklistRunItem.findUnique({
      where: { aura_checklist_run_item_unique: { runId, itemCode } },
    });
    if (!runItem) throw new Error('run item not found');
    return prisma.$transaction(async (tx) => {
      await (tx as any).checklistRunItem.update({
        where: { id: runItem.id },
        data: {
          status,
          autoEvaluated: true,
          redFlagId,
          reviewedAt: new Date(),
        },
      });
      await this.recomputeRunCounters(tx, runId);
      return (tx as any).checklistRun.findUnique({ where: { id: runId } });
    });
  }

  private async recomputeRunCounters(tx: any, runId: string) {
    const items = await (tx as any).checklistRunItem.findMany({ where: { runId } });
    let compliant = 0;
    let nc = 0;
    let na = 0;
    let weightedSum = 0;
    let weightTotal = 0;
    for (const i of items as Array<{ status: string; weighting: number }>) {
      if (i.status === 'COMPLIANT') compliant += 1;
      else if (i.status === 'NON_COMPLIANT') nc += 1;
      else if (i.status === 'NA') na += 1;
      const w = i.weighting ?? 1;
      if (i.status !== 'PENDING') {
        const pts = i.status === 'COMPLIANT' ? 100 : i.status === 'NA' ? 100 : 0;
        weightedSum += pts * w;
        weightTotal += w;
      }
    }
    const score = weightTotal === 0 ? null : Math.round((weightedSum / weightTotal) * 100) / 100;
    await (tx as any).checklistRun.update({
      where: { id: runId },
      data: {
        compliantItems: compliant,
        nonCompliantItems: nc,
        naItems: na,
        weightedScore: score,
      },
    });
  }

  async submit(runId: string, auth: AuthContext) {
    const run = await (prisma as any).checklistRun.findUnique({
      where: { id: runId },
      include: { items: true },
    });
    if (!run) throw new Error('run not found');
    if (run.preparerId && run.preparerId !== auth.userId) {
      // Preparer is also acceptable, but allow only the preparer to submit
      throw new Error('only the preparer may submit');
    }
    const pending = (run.items as Array<{ status: string }>).filter((i) => i.status === 'PENDING');
    if (pending.length > 0) {
      throw new Error(`cannot submit: ${pending.length} item(s) still PENDING`);
    }
    return (prisma as any).checklistRun.update({
      where: { id: runId },
      data: { status: 'SUBMITTED', submittedAt: new Date(), preparerId: auth.userId },
    });
  }

  async approveRun(runId: string, auth: AuthContext) {
    const run = await (prisma as any).checklistRun.findUnique({ where: { id: runId } });
    if (!run) throw new Error('run not found');
    if (run.status !== 'SUBMITTED') throw new Error(`status ${run.status} not approvable`);
    if (run.preparerId === auth.userId) {
      throw new Error('approver must differ from preparer (maker-checker)');
    }
    return (prisma as any).checklistRun.update({
      where: { id: runId },
      data: {
        status: 'APPROVED',
        approverId: auth.userId,
        approvedAt: new Date(),
      },
    });
  }

  async list(
    tenantId: string,
    filter: { period?: string; templateCode?: string; status?: string } = {}
  ) {
    return (prisma as any).checklistRun.findMany({
      where: {
        tenantId,
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.templateCode ? { templateCode: filter.templateCode } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ period: 'desc' }, { templateCode: 'asc' }],
    });
  }

  async detail(runId: string) {
    return (prisma as any).checklistRun.findUnique({
      where: { id: runId },
      include: { items: { orderBy: { itemCode: 'asc' } } },
    });
  }
}

export const checklistRunService = new ChecklistRunService();
