import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { countryRulePackService } from './rule-pack.service';

/**
 * EPIC-02-S02: Rule pack change governance — maker-checker workflow.
 *
 * Wraps the existing CountryRulePack DRAFT -> ACTIVE -> RETIRED lifecycle
 * with an approval gate that enforces:
 *   - preparer (requestedBy) MUST differ from approver (approvedBy)
 *   - rationale + sourceReference are mandatory and trimmed-non-empty
 *   - rollback restores the previous ACTIVE version and records the action
 *     on the same change-request audit table
 *
 * Persistence: aura_rule_change_request (migration
 * 20260703000000_add_rule_change_request).
 */

export type RuleChangeAction = 'PUBLISH' | 'RETIRE' | 'ROLLBACK';
export type RuleChangeStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ROLLED_BACK';

export interface RequestChangeInput {
  rulePackId: string;
  action: RuleChangeAction;
  rationale: string;
  sourceReference: string; // statute citation, gazette URL, internal RFC, etc.
  diffSummary?: Record<string, unknown>;
  effectiveFrom?: Date;
}

function assertNonEmpty(value: string, field: string): void {
  if (!value || !value.trim()) {
    throw new Error(`${field} is required`);
  }
}

export class RuleChangeRequestService {
  async list(
    tenantId: string,
    filter: { status?: RuleChangeStatus; rulePackId?: string; action?: RuleChangeAction } = {}
  ) {
    return (prisma as any).ruleChangeRequest.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.rulePackId ? { rulePackId: filter.rulePackId } : {}),
        ...(filter.action ? { action: filter.action } : {}),
      },
      orderBy: { requestedAt: 'desc' },
      take: 200,
    });
  }

  async request(input: RequestChangeInput, auth: AuthContext) {
    assertNonEmpty(input.rationale, 'rationale');
    assertNonEmpty(input.sourceReference, 'sourceReference');

    const pack = await (prisma as any).countryRulePack.findUnique({
      where: { id: input.rulePackId },
    });
    if (!pack) throw new Error(`rule pack ${input.rulePackId} not found`);

    if (input.action === 'PUBLISH' && pack.status !== 'DRAFT') {
      throw new Error(`cannot request PUBLISH on pack with status ${pack.status}`);
    }
    if (input.action === 'RETIRE' && pack.status !== 'ACTIVE') {
      throw new Error(`cannot request RETIRE on pack with status ${pack.status}`);
    }

    return (prisma as any).ruleChangeRequest.create({
      data: {
        tenantId: auth.tenantId,
        rulePackId: input.rulePackId,
        action: input.action,
        status: 'PENDING_APPROVAL' as RuleChangeStatus,
        rationale: input.rationale.trim(),
        sourceReference: input.sourceReference.trim(),
        diffSummary: input.diffSummary ?? null,
        effectiveFrom: input.effectiveFrom ?? null,
        requestedBy: auth.userId,
      },
    });
  }

  async approve(requestId: string, auth: AuthContext) {
    const req = await (prisma as any).ruleChangeRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new Error(`rule change request ${requestId} not found`);
    if (req.status !== 'PENDING_APPROVAL') {
      throw new Error(`cannot approve request in status ${req.status}`);
    }
    if (req.requestedBy === auth.userId) {
      // Maker-checker hard gate (EPIC-02-S02 AC).
      throw new Error('approver must differ from requester (maker-checker)');
    }

    const now = new Date();
    if (req.action === 'PUBLISH') {
      const effectiveFrom = req.effectiveFrom ?? now;
      await countryRulePackService.publish(req.rulePackId, effectiveFrom, auth);
    } else if (req.action === 'RETIRE') {
      await (prisma as any).countryRulePack.update({
        where: { id: req.rulePackId },
        data: { status: 'RETIRED', effectiveTo: now, updatedBy: auth.userId },
      });
    }

    return (prisma as any).ruleChangeRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED' as RuleChangeStatus,
        approvedBy: auth.userId,
        approvedAt: now,
      },
    });
  }

  async reject(requestId: string, reason: string, auth: AuthContext) {
    assertNonEmpty(reason, 'rejectionReason');
    const req = await (prisma as any).ruleChangeRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new Error(`rule change request ${requestId} not found`);
    if (req.status !== 'PENDING_APPROVAL') {
      throw new Error(`cannot reject request in status ${req.status}`);
    }
    if (req.requestedBy === auth.userId) {
      throw new Error('rejecter must differ from requester (maker-checker)');
    }
    return (prisma as any).ruleChangeRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED' as RuleChangeStatus,
        rejectedBy: auth.userId,
        rejectedAt: new Date(),
        rejectionReason: reason.trim(),
      },
    });
  }

  /**
   * Rollback the currently ACTIVE rule pack for a country to its
   * immediately preceding RETIRED version. Records the rollback as a
   * separate change-request row so the audit history is single-table.
   */
  async rollback(
    input: { countryCode: string; rationale: string; sourceReference: string },
    auth: AuthContext
  ) {
    assertNonEmpty(input.rationale, 'rationale');
    assertNonEmpty(input.sourceReference, 'sourceReference');

    const country = input.countryCode.toUpperCase();
    const active = await (prisma as any).countryRulePack.findFirst({
      where: { countryCode: country, status: 'ACTIVE' },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (!active) {
      throw new Error(`no ACTIVE rule pack for ${country} to roll back`);
    }

    const previous = await (prisma as any).countryRulePack.findFirst({
      where: {
        countryCode: country,
        status: 'RETIRED',
        version: { lt: active.version },
      },
      orderBy: { version: 'desc' },
    });
    if (!previous) {
      throw new Error(`no prior RETIRED pack exists for ${country} — cannot rollback`);
    }

    const now = new Date();
    return prisma.$transaction(async (tx) => {
      await (tx as any).countryRulePack.update({
        where: { id: active.id },
        data: { status: 'RETIRED', effectiveTo: now, updatedBy: auth.userId },
      });
      await (tx as any).countryRulePack.update({
        where: { id: previous.id },
        data: {
          status: 'ACTIVE',
          effectiveFrom: now,
          effectiveTo: null,
          updatedBy: auth.userId,
        },
      });
      return (tx as any).ruleChangeRequest.create({
        data: {
          tenantId: auth.tenantId,
          rulePackId: previous.id,
          action: 'ROLLBACK' as RuleChangeAction,
          status: 'ROLLED_BACK' as RuleChangeStatus,
          rationale: input.rationale.trim(),
          sourceReference: input.sourceReference.trim(),
          requestedBy: auth.userId,
          rolledBackBy: auth.userId,
          rolledBackAt: now,
          rollbackReason: input.rationale.trim(),
          previousVersion: active.version,
        },
      });
    });
  }
}

export const ruleChangeRequestService = new RuleChangeRequestService();
