/**
 * EPIC-20 multi-tier leave approval matrix.
 *
 * Closes the audit gap "Single-tier approval only (no matrix)".
 *
 * The LeaveRequest schema already supports a matrix natively:
 *   approvers:            Json   // array of approval levels
 *   currentApproverLevel: Int    // pointer into the chain
 *
 * The previous service only used level 1 and ignored the chain. This
 * service derives the FULL chain from a tier-rule definition keyed by
 * (leaveTypeCode, country, totalDays) and threads the request through
 * each level, finalizing only when every required level has approved.
 *
 * Tier-rule shape (each rule, evaluated in order, first match wins):
 *   {
 *     id: 'ANNUAL_GT_7',
 *     leaveType?: 'ANNUAL',           // optional gate
 *     country?: 'UAE',                // optional gate
 *     minTotalDays?: 7,               // inclusive lower bound
 *     maxTotalDays?: 30,              // inclusive upper bound (omit for unbounded)
 *     levels: [
 *       { level: 1, role: 'LINE_MANAGER', required: true },
 *       { level: 2, role: 'DEPARTMENT_HEAD', required: true },
 *       { level: 3, role: 'HR_DIRECTOR', required: true },
 *     ],
 *   }
 *
 * The service has no opinions about who fills each role — the caller
 * (resolver) maps roles → user IDs based on the org structure. The
 * matrix is policy; the resolver is org.
 *
 * Storage: matrix lives in country rule pack under
 *   ('ER', 'LEAVE_APPROVAL_MATRIX', at)
 * with a hardcoded default fallback exactly like the EPIC-26
 * penalty matrix. No schema change required.
 */

import { prisma } from '@aura/database';
import { resolveRuleValue } from '@/lib/services/gcc-rule-library/rule-value.helper';

export type ApproverRole =
  | 'LINE_MANAGER'
  | 'DEPARTMENT_HEAD'
  | 'BUSINESS_UNIT_HEAD'
  | 'HR_BUSINESS_PARTNER'
  | 'HR_DIRECTOR'
  | 'CFO'
  | 'COO'
  | 'CEO';

export interface ApproverChainLevel {
  level: number;
  role: ApproverRole;
  required: boolean;
  /** Resolved approver — filled by the org-resolver after build. */
  approverId?: string;
}

export interface ApprovalMatrixRule {
  id: string;
  leaveType?: string;
  country?: string;
  minTotalDays?: number;
  maxTotalDays?: number;
  levels: Array<{ level: number; role: ApproverRole; required?: boolean }>;
}

/**
 * Representative DEFAULT_APPROVAL_MATRIX. Most-specific first; the
 * engine returns the first matching rule. Callers can override via the
 * rule pack ('ER', 'LEAVE_APPROVAL_MATRIX') without a deploy.
 */
export const DEFAULT_APPROVAL_MATRIX: ApprovalMatrixRule[] = [
  {
    id: 'SICK_ANY',
    leaveType: 'SICK',
    levels: [{ level: 1, role: 'LINE_MANAGER', required: true }],
  },
  {
    id: 'HAJJ',
    leaveType: 'HAJJ',
    levels: [
      { level: 1, role: 'LINE_MANAGER', required: true },
      { level: 2, role: 'HR_DIRECTOR', required: true },
    ],
  },
  {
    id: 'ANNUAL_GT_15',
    leaveType: 'ANNUAL',
    minTotalDays: 16,
    levels: [
      { level: 1, role: 'LINE_MANAGER', required: true },
      { level: 2, role: 'DEPARTMENT_HEAD', required: true },
      { level: 3, role: 'HR_DIRECTOR', required: true },
    ],
  },
  {
    id: 'ANNUAL_8_15',
    leaveType: 'ANNUAL',
    minTotalDays: 8,
    maxTotalDays: 15,
    levels: [
      { level: 1, role: 'LINE_MANAGER', required: true },
      { level: 2, role: 'DEPARTMENT_HEAD', required: true },
    ],
  },
  {
    id: 'ANNUAL_LE_7',
    leaveType: 'ANNUAL',
    maxTotalDays: 7,
    levels: [{ level: 1, role: 'LINE_MANAGER', required: true }],
  },
  {
    id: 'UNPAID_GT_3',
    leaveType: 'UNPAID',
    minTotalDays: 4,
    levels: [
      { level: 1, role: 'LINE_MANAGER', required: true },
      { level: 2, role: 'HR_DIRECTOR', required: true },
    ],
  },
  // Catch-all.
  {
    id: 'DEFAULT',
    levels: [{ level: 1, role: 'LINE_MANAGER', required: true }],
  },
];

export interface MatchInput {
  leaveType: string;
  country?: string;
  totalDays: number;
}

/**
 * Pure (no IO) evaluator. Walks the matrix and returns the first
 * matching rule. Tests can drive it without prisma / rule pack.
 */
export function matchApprovalRule(
  matrix: ApprovalMatrixRule[],
  input: MatchInput
): ApprovalMatrixRule {
  for (const r of matrix) {
    if (r.leaveType && r.leaveType !== input.leaveType) continue;
    if (r.country && input.country && r.country !== input.country) continue;
    if (typeof r.minTotalDays === 'number' && input.totalDays < r.minTotalDays) continue;
    if (typeof r.maxTotalDays === 'number' && input.totalDays > r.maxTotalDays) continue;
    return r;
  }
  // Fallback — guaranteed by DEFAULT row.
  return matrix[matrix.length - 1];
}

export function buildApproverChain(rule: ApprovalMatrixRule): ApproverChainLevel[] {
  return [...rule.levels]
    .sort((a, b) => a.level - b.level)
    .map((lvl) => ({
      level: lvl.level,
      role: lvl.role,
      required: lvl.required !== false,
    }));
}

/**
 * Compute the next approver level given the current pointer and the
 * full chain. Returns:
 *   { final: true }              — every required level has approved.
 *   { final: false, next: L }    — advance to level L.
 */
export function advanceLevel(
  chain: ApproverChainLevel[],
  currentLevel: number
): { final: boolean; next?: number } {
  const sorted = [...chain].sort((a, b) => a.level - b.level);
  const remaining = sorted.filter((l) => l.level > currentLevel && l.required);
  if (remaining.length === 0) return { final: true };
  return { final: false, next: remaining[0].level };
}

export class LeaveApprovalMatrixService {
  /** Resolve the active matrix for a country (rule pack first, fallback default). */
  async resolveMatrix(country: string | undefined, at: Date = new Date()) {
    if (!country) return DEFAULT_APPROVAL_MATRIX;
    const override = await resolveRuleValue<ApprovalMatrixRule[] | null>(
      country,
      'ER',
      'LEAVE_APPROVAL_MATRIX',
      null,
      { at, source: 'LeaveApprovalMatrixService.resolveMatrix' }
    );
    return Array.isArray(override) && override.length > 0 ? override : DEFAULT_APPROVAL_MATRIX;
  }

  /**
   * Build the full chain for a leave-request input and persist it onto
   * the request's `approvers` JSON column. The org-resolver is invoked
   * for each level so the persisted chain already names the user IDs.
   */
  async buildAndPersistChain(
    leaveRequestId: string,
    input: MatchInput,
    orgResolver: (role: ApproverRole) => Promise<string | undefined>
  ): Promise<ApproverChainLevel[]> {
    const matrix = await this.resolveMatrix(input.country);
    const rule = matchApprovalRule(matrix, input);
    const chain = buildApproverChain(rule);

    for (const lvl of chain) {
      lvl.approverId = await orgResolver(lvl.role);
    }

    await (prisma as any).leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        approvers: chain as unknown as object,
        currentApproverLevel: chain[0]?.level ?? 1,
      },
    });

    return chain;
  }

  /**
   * Approve at the current level. If a required level remains the
   * request moves to that level. If every required level is satisfied
   * the request transitions to APPROVED + the final approver/timestamp
   * are stamped.
   */
  async approveAtCurrentLevel(
    leaveRequestId: string,
    approverId: string
  ): Promise<{ final: boolean; nextLevel?: number; status: string }> {
    const req = await (prisma as any).leaveRequest.findUnique({ where: { id: leaveRequestId } });
    if (!req) throw new Error('leave request not found');
    if (req.status !== 'PENDING') throw new Error(`cannot approve a ${req.status} request`);

    const chain = (req.approvers ?? []) as ApproverChainLevel[];
    const current = chain.find((l) => l.level === req.currentApproverLevel);
    if (!current) throw new Error('current level not in chain');
    if (current.approverId && current.approverId !== approverId) {
      throw new Error('only the assigned approver can approve this level');
    }

    const decision = advanceLevel(chain, req.currentApproverLevel);
    if (decision.final) {
      await (prisma as any).leaveRequest.update({
        where: { id: leaveRequestId },
        data: { status: 'APPROVED', approvedBy: approverId, approvedAt: new Date() },
      });
      return { final: true, status: 'APPROVED' };
    }
    await (prisma as any).leaveRequest.update({
      where: { id: leaveRequestId },
      data: { currentApproverLevel: decision.next! },
    });
    return { final: false, nextLevel: decision.next, status: 'PENDING' };
  }

  /**
   * Reject at any level — terminates the chain immediately.
   */
  async rejectAtCurrentLevel(
    leaveRequestId: string,
    approverId: string,
    rejectionReason: string
  ): Promise<{ status: 'REJECTED' }> {
    await (prisma as any).leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: 'REJECTED',
        rejectedBy: approverId,
        rejectedAt: new Date(),
        rejectionReason,
      },
    });
    return { status: 'REJECTED' };
  }
}

export const leaveApprovalMatrixService = new LeaveApprovalMatrixService();
