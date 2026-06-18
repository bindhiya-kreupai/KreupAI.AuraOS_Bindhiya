/**
 * EPIC-31 — Whistleblower / Speak-Up evaluators.
 *
 * Closes the audit gaps for EPIC-31 by shipping:
 *   • S-WB-01 — anonymous report intake (maker-checker via AuditLog)
 *   • S-WB-02 — retaliation correlation detector
 *   • S-WB-03 — case-cycle SLA tracker
 *
 * Persistence reuses AuditLog so we add NO new Prisma models. All
 * tenant scoping is enforced at the service level.
 */

import { randomUUID, createHash } from 'crypto';
import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
}

// =============================================================================
// S-WB-01 — Anonymous report intake (maker-checker)
// =============================================================================

export type ReportStatus =
  | 'INTAKE'
  | 'UNDER_TRIAGE'
  | 'TRIAGED'
  | 'INVESTIGATING'
  | 'CLOSED'
  | 'REJECTED';

export interface ReportState {
  reportId: string;
  status: ReportStatus;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contentHash: string;
  intakeAt: Date;
  triagedBy?: string;
  triagedAt?: Date;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: Date;
}

const RESOURCE_WB = 'whistleblower_report_workflow';

/**
 * Compute a deterministic content hash so the reporter can prove their
 * submission without revealing identity. Includes a tenant salt to
 * prevent cross-tenant lookup attacks.
 */
export function computeReportHash(
  tenantId: string,
  category: string,
  body: string,
  nonce: string
): string {
  return createHash('sha256').update(`${tenantId}|${category}|${body}|${nonce}`).digest('hex');
}

export function reduceReportTrail(
  rows: Array<{ timestamp: Date; metadata: Record<string, unknown> | null }>
): ReportState | null {
  if (rows.length === 0) return null;
  const head = rows[0];
  const tail = rows[rows.length - 1].metadata as Record<string, unknown> | null;
  if (!tail) return null;
  const headMeta = (head.metadata ?? {}) as Record<string, unknown>;
  const state: ReportState = {
    reportId: String(tail.reportId ?? ''),
    status: (headMeta.status as ReportStatus) ?? 'INTAKE',
    category: String(tail.category ?? 'UNCATEGORIZED'),
    severity: (tail.severity as ReportState['severity']) ?? 'MEDIUM',
    contentHash: String(tail.contentHash ?? ''),
    intakeAt: new Date(String(tail.intakeAt ?? rows[rows.length - 1].timestamp)),
  };
  if (state.status === 'TRIAGED' || state.status === 'INVESTIGATING') {
    state.triagedBy = String(headMeta.triagedBy ?? '');
    state.triagedAt = new Date(String(headMeta.triagedAt ?? head.timestamp));
  } else if (state.status === 'REJECTED') {
    state.rejectedBy = String(headMeta.rejectedBy ?? '');
    state.rejectedAt = new Date(String(headMeta.rejectedAt ?? head.timestamp));
    state.rejectionReason =
      typeof headMeta.reason === 'string' ? (headMeta.reason as string) : undefined;
  }
  return state;
}

export class WhistleblowerIntakeService {
  async submitAnonymous(
    input: { category: string; body: string; severity: ReportState['severity'] },
    tenantId: string
  ): Promise<ReportState> {
    if (!input.body || input.body.trim().length < 10) {
      throw new Error('report body required (min 10 chars)');
    }
    const reportId = randomUUID();
    const nonce = randomUUID();
    const contentHash = computeReportHash(tenantId, input.category, input.body, nonce);
    const intakeAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.HIGH,
      // Intentionally no userId — anonymous intake.
      tenantId,
      resourceType: RESOURCE_WB,
      resourceId: reportId,
      success: true,
      metadata: {
        reportId,
        status: 'INTAKE' as const,
        category: input.category,
        severity: input.severity,
        contentHash,
        intakeAt: intakeAt.toISOString(),
      },
    });
    return {
      reportId,
      status: 'INTAKE',
      category: input.category,
      severity: input.severity,
      contentHash,
      intakeAt,
    };
  }

  async triage(reportId: string, auth: AuthContext): Promise<ReportState> {
    const state = await this.findOne(reportId, auth.tenantId);
    if (!state) throw new Error('report not found');
    if (state.status !== 'INTAKE') throw new Error(`cannot triage a ${state.status} report`);
    const triagedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.HIGH,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_WB,
      resourceId: reportId,
      success: true,
      metadata: {
        reportId,
        status: 'TRIAGED' as const,
        triagedBy: auth.userId,
        triagedAt: triagedAt.toISOString(),
      },
    });
    return { ...state, status: 'TRIAGED', triagedBy: auth.userId, triagedAt };
  }

  async reject(reportId: string, reason: string, auth: AuthContext): Promise<ReportState> {
    const state = await this.findOne(reportId, auth.tenantId);
    if (!state) throw new Error('report not found');
    if (state.status !== 'INTAKE' && state.status !== 'TRIAGED')
      throw new Error(`cannot reject a ${state.status} report`);
    const rejectedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_WB,
      resourceId: reportId,
      success: true,
      metadata: {
        reportId,
        status: 'REJECTED' as const,
        rejectedBy: auth.userId,
        rejectedAt: rejectedAt.toISOString(),
        reason,
      },
    });
    return {
      ...state,
      status: 'REJECTED',
      rejectedBy: auth.userId,
      rejectedAt,
      rejectionReason: reason,
    };
  }

  async findOne(reportId: string, tenantId: string): Promise<ReportState | null> {
    const rows = await (prisma as any).auditLog.findMany({
      where: { tenantId, resourceType: RESOURCE_WB, resourceId: reportId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, metadata: true },
    });
    return reduceReportTrail(rows);
  }
}

export const whistleblowerIntakeService = new WhistleblowerIntakeService();

// =============================================================================
// S-WB-02 — Retaliation correlation detector
// =============================================================================

export interface ReporterContext {
  /** Sealed reporter ID (NOT the natural employee ID — anonymised). */
  sealedId: string;
  /** Date the report was filed. */
  filedAt: Date;
}

export interface ReporterEvent {
  sealedId: string;
  /** What happened to the reporter. */
  eventType:
    | 'DISCIPLINARY'
    | 'TRANSFER'
    | 'TERMINATION'
    | 'DEMOTION'
    | 'PIP'
    | 'OT_CUT'
    | 'SHIFT_CHANGE';
  occurredAt: Date;
  reason?: string;
}

export type RetaliationLikelihood = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface RetaliationFinding {
  sealedId: string;
  likelihood: RetaliationLikelihood;
  signals: number;
  events: ReporterEvent[];
  reason: { en: string; ar: string };
}

export interface RetaliationReport {
  windowDays: number;
  findings: RetaliationFinding[];
  totals: {
    reporters: number;
    flagged: number;
    high: number;
    medium: number;
  };
}

export function detectRetaliation(
  reporters: ReporterContext[],
  events: ReporterEvent[],
  windowDays = 90
): RetaliationReport {
  const findings: RetaliationFinding[] = reporters.map((r) => {
    const within = events.filter(
      (e) =>
        e.sealedId === r.sealedId &&
        e.occurredAt.getTime() >= r.filedAt.getTime() &&
        (e.occurredAt.getTime() - r.filedAt.getTime()) / (24 * 3600 * 1000) <= windowDays
    );
    const signals = within.length;
    const hardSignals = within.filter(
      (e) => e.eventType === 'TERMINATION' || e.eventType === 'DEMOTION' || e.eventType === 'PIP'
    ).length;
    let likelihood: RetaliationLikelihood;
    if (hardSignals >= 1) likelihood = 'HIGH';
    else if (signals >= 2) likelihood = 'MEDIUM';
    else if (signals === 1) likelihood = 'LOW';
    else likelihood = 'NONE';
    return {
      sealedId: r.sealedId,
      likelihood,
      signals,
      events: within,
      reason: {
        en:
          signals === 0
            ? 'No adverse employment events recorded after the report'
            : `${signals} adverse event(s) within ${windowDays}d; ${hardSignals} are hard signals`,
        ar:
          signals === 0
            ? 'لا توجد أحداث عمل سلبية بعد تقديم البلاغ'
            : `${signals} أحداث سلبية خلال ${windowDays} يوم؛ ${hardSignals} منها قوية`,
      },
    };
  });
  return {
    windowDays,
    findings,
    totals: {
      reporters: reporters.length,
      flagged: findings.filter((f) => f.likelihood !== 'NONE').length,
      high: findings.filter((f) => f.likelihood === 'HIGH').length,
      medium: findings.filter((f) => f.likelihood === 'MEDIUM').length,
    },
  };
}

// =============================================================================
// S-WB-03 — Case-cycle SLA tracker
// =============================================================================

export interface CaseSlaConfig {
  triageDays: number;
  investigationDays: number;
  closureDays: number;
}

export interface CaseEvent {
  caseId: string;
  intakeAt: Date;
  triagedAt?: Date;
  investigationStartedAt?: Date;
  closedAt?: Date;
}

export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'CLOSED_ON_TIME' | 'CLOSED_LATE';

export interface CaseSlaResult {
  caseId: string;
  triageStatus: SlaStatus;
  investigationStatus: SlaStatus;
  closureStatus: SlaStatus;
  ageDays: number;
  reason: { en: string; ar: string };
}

export interface CaseSlaReport {
  config: CaseSlaConfig;
  results: CaseSlaResult[];
  totals: {
    cases: number;
    breaches: number;
    breachPct: number;
  };
}

function classify(targetDays: number, elapsedDays: number, isFinal: boolean): SlaStatus {
  if (isFinal) {
    return elapsedDays <= targetDays ? 'CLOSED_ON_TIME' : 'CLOSED_LATE';
  }
  if (elapsedDays > targetDays) return 'BREACHED';
  if (elapsedDays > targetDays * 0.75) return 'AT_RISK';
  return 'ON_TRACK';
}

export function evaluateCaseSla(
  cases: CaseEvent[],
  config: CaseSlaConfig,
  asOf: Date = new Date()
): CaseSlaReport {
  const day = 24 * 3600 * 1000;
  const results: CaseSlaResult[] = cases.map((c) => {
    const ageDays = Math.floor((asOf.getTime() - c.intakeAt.getTime()) / day);
    const triageElapsed = c.triagedAt
      ? Math.floor((c.triagedAt.getTime() - c.intakeAt.getTime()) / day)
      : ageDays;
    const triageStatus = classify(config.triageDays, triageElapsed, !!c.triagedAt);
    const invElapsed = c.triagedAt
      ? c.investigationStartedAt
        ? Math.floor((c.investigationStartedAt.getTime() - c.triagedAt.getTime()) / day)
        : Math.floor((asOf.getTime() - c.triagedAt.getTime()) / day)
      : 0;
    const investigationStatus = c.triagedAt
      ? classify(config.investigationDays, invElapsed, !!c.investigationStartedAt)
      : 'ON_TRACK';
    const closureElapsed = c.closedAt
      ? Math.floor((c.closedAt.getTime() - c.intakeAt.getTime()) / day)
      : ageDays;
    const closureStatus = classify(config.closureDays, closureElapsed, !!c.closedAt);
    const breaches = [triageStatus, investigationStatus, closureStatus].filter(
      (s) => s === 'BREACHED' || s === 'CLOSED_LATE'
    ).length;
    return {
      caseId: c.caseId,
      triageStatus,
      investigationStatus,
      closureStatus,
      ageDays,
      reason: {
        en: breaches > 0 ? `${breaches} SLA stage(s) breached` : 'All SLA stages within target',
        ar:
          breaches > 0 ? `${breaches} مراحل تجاوزت اتفاقية مستوى الخدمة` : 'جميع المراحل ضمن الهدف',
      },
    };
  });
  const breaches = results.filter(
    (r) =>
      r.triageStatus === 'BREACHED' ||
      r.investigationStatus === 'BREACHED' ||
      r.closureStatus === 'BREACHED' ||
      r.closureStatus === 'CLOSED_LATE'
  ).length;
  const breachPct = results.length === 0 ? 0 : Math.round((breaches / results.length) * 100);
  return {
    config,
    results,
    totals: { cases: results.length, breaches, breachPct },
  };
}
