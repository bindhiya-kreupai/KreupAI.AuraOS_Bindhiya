/**
 * EPIC-28 Time-and-attendance compliance — three audit-flagged 🟡 sub-stories:
 *
 *  S-MC      — timesheet-approval maker-checker (state machine + AuditLog trail)
 *  S-OT      — overtime cap evaluator (weekly + monthly + statutory hard-cap)
 *  S-FRAUD   — biometric fraud-pattern detection (impossible-travel,
 *              cluster-punch, identical-second flags)
 *
 * Pure logic + a single class for the maker-checker which writes to
 * AuditLog (reusing the existing AuditService — no new Prisma models).
 */

import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export type ComplianceOutcome = 'PASS' | 'WARN' | 'FAIL';

export interface BilingualReason {
  code: string;
  en: string;
  ar: string;
}

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
}

// =============================================================================
// S-MC — Timesheet maker-checker
// =============================================================================

export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface TimesheetState {
  timesheetId: string;
  status: TimesheetStatus;
  proposedBy?: string;
  proposedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}

const RESOURCE_TS = 'timesheet_approval_workflow';

/** Pure reducer over an AuditLog trail (most-recent first). */
export function reduceTimesheetTrail(
  rows: Array<{ timestamp: Date; metadata: Record<string, unknown> | null }>
): TimesheetState | null {
  if (rows.length === 0) return null;
  const head = rows[0];
  const tail = rows[rows.length - 1].metadata as Record<string, unknown> | null;
  if (!tail) return null;
  const headMeta = head.metadata as Record<string, unknown>;
  const out: TimesheetState = {
    timesheetId: String(tail.timesheetId ?? ''),
    status: (headMeta.status as TimesheetStatus) ?? 'DRAFT',
    proposedBy: String(tail.proposedBy ?? ''),
    proposedAt: new Date(String(tail.proposedAt ?? rows[rows.length - 1].timestamp)),
  };
  if (out.status === 'APPROVED') {
    out.approvedBy = String(headMeta.approvedBy ?? '');
    out.approvedAt = new Date(String(headMeta.approvedAt ?? head.timestamp));
  } else if (out.status === 'REJECTED') {
    out.rejectedBy = String(headMeta.rejectedBy ?? '');
    out.rejectedAt = new Date(String(headMeta.rejectedAt ?? head.timestamp));
    out.rejectionReason =
      typeof headMeta.reason === 'string' ? (headMeta.reason as string) : undefined;
  }
  return out;
}

export class TimesheetMakerCheckerService {
  async submit(input: { timesheetId: string }, auth: AuthContext): Promise<TimesheetState> {
    const proposedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.LOW,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_TS,
      resourceId: input.timesheetId,
      success: true,
      metadata: {
        timesheetId: input.timesheetId,
        status: 'SUBMITTED' as const,
        proposedBy: auth.userId,
        proposedAt: proposedAt.toISOString(),
      },
    });
    return {
      timesheetId: input.timesheetId,
      status: 'SUBMITTED',
      proposedBy: auth.userId,
      proposedAt,
    };
  }

  async approve(timesheetId: string, auth: AuthContext): Promise<TimesheetState> {
    const state = await this.findOne(timesheetId, auth.tenantId);
    if (!state) throw new Error('timesheet workflow not found');
    if (state.status !== 'SUBMITTED') throw new Error(`cannot approve a ${state.status} timesheet`);
    if (state.proposedBy === auth.userId) {
      throw new Error('maker-checker violation: proposer cannot self-approve');
    }
    const approvedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_TS,
      resourceId: timesheetId,
      success: true,
      metadata: {
        timesheetId,
        status: 'APPROVED' as const,
        approvedBy: auth.userId,
        approvedAt: approvedAt.toISOString(),
      },
    });
    return { ...state, status: 'APPROVED', approvedBy: auth.userId, approvedAt };
  }

  async reject(timesheetId: string, reason: string, auth: AuthContext): Promise<TimesheetState> {
    const state = await this.findOne(timesheetId, auth.tenantId);
    if (!state) throw new Error('timesheet workflow not found');
    if (state.status !== 'SUBMITTED') throw new Error(`cannot reject a ${state.status} timesheet`);
    const rejectedAt = new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RESOURCE_TS,
      resourceId: timesheetId,
      success: true,
      metadata: {
        timesheetId,
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

  async findOne(timesheetId: string, tenantId: string): Promise<TimesheetState | null> {
    const rows = await (prisma as any).auditLog.findMany({
      where: { tenantId, resourceType: RESOURCE_TS, resourceId: timesheetId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, metadata: true },
    });
    return reduceTimesheetTrail(rows);
  }
}

export const timesheetMakerCheckerService = new TimesheetMakerCheckerService();

// =============================================================================
// S-OT — Overtime cap evaluator
// =============================================================================

export interface OvertimeCaps {
  /** Soft weekly target (e.g. 8h) — WARN above. */
  weeklySoftHours: number;
  /** Hard weekly statutory ceiling (e.g. 12h) — FAIL above. */
  weeklyHardHours: number;
  /** Monthly statutory ceiling. */
  monthlyHardHours: number;
}

export interface OvertimeWindow {
  weekHours: number;
  monthHours: number;
}

export interface OvertimeVerdict {
  outcome: ComplianceOutcome;
  reasons: BilingualReason[];
  utilisationWeeklyPct: number;
  utilisationMonthlyPct: number;
}

export function evaluateOvertimeCap(window: OvertimeWindow, caps: OvertimeCaps): OvertimeVerdict {
  const reasons: BilingualReason[] = [];
  const weekly = window.weekHours;
  const monthly = window.monthHours;
  const utilisationWeeklyPct =
    caps.weeklyHardHours > 0 ? Math.round((weekly / caps.weeklyHardHours) * 1000) / 10 : 0;
  const utilisationMonthlyPct =
    caps.monthlyHardHours > 0 ? Math.round((monthly / caps.monthlyHardHours) * 1000) / 10 : 0;

  if (weekly > caps.weeklyHardHours) {
    reasons.push({
      code: 'OT_WEEKLY_HARD_BREACH',
      en: `Overtime ${weekly}h exceeds statutory weekly cap ${caps.weeklyHardHours}h.`,
      ar: `الساعات الإضافية ${weekly} ساعة تتجاوز الحد الأسبوعي القانوني ${caps.weeklyHardHours} ساعة.`,
    });
  } else if (weekly > caps.weeklySoftHours) {
    reasons.push({
      code: 'OT_WEEKLY_SOFT_BREACH',
      en: `Overtime ${weekly}h exceeds policy soft cap ${caps.weeklySoftHours}h — manager review needed.`,
      ar: `الساعات الإضافية ${weekly} ساعة تتجاوز الحد المرن للسياسة ${caps.weeklySoftHours} ساعة — يلزم مراجعة المدير.`,
    });
  }

  if (monthly > caps.monthlyHardHours) {
    reasons.push({
      code: 'OT_MONTHLY_HARD_BREACH',
      en: `Monthly overtime ${monthly}h exceeds statutory monthly cap ${caps.monthlyHardHours}h.`,
      ar: `الساعات الإضافية الشهرية ${monthly} ساعة تتجاوز الحد القانوني الشهري ${caps.monthlyHardHours} ساعة.`,
    });
  }

  const outcome: ComplianceOutcome = reasons.some(
    (r) => r.code === 'OT_WEEKLY_HARD_BREACH' || r.code === 'OT_MONTHLY_HARD_BREACH'
  )
    ? 'FAIL'
    : reasons.length > 0
      ? 'WARN'
      : 'PASS';
  if (outcome === 'PASS') {
    reasons.push({
      code: 'OT_WITHIN_CAPS',
      en: `Overtime within caps (${weekly}h/week, ${monthly}h/month).`,
      ar: `الساعات الإضافية ضمن الحدود (${weekly} ساعة/أسبوع، ${monthly} ساعة/شهر).`,
    });
  }
  return { outcome, reasons, utilisationWeeklyPct, utilisationMonthlyPct };
}

// =============================================================================
// S-FRAUD — Biometric fraud-pattern detection
// =============================================================================

export interface BiometricPunch {
  punchId: string;
  employeeId: string;
  capturedAt: Date;
  /** Lat/lng if geofence is enforced. */
  lat?: number;
  lng?: number;
  /** Device that captured the punch — anomalies across devices flag review. */
  deviceId?: string;
  /** Confidence score for the biometric match (0..1). */
  matchConfidence?: number;
}

export interface FraudFlag {
  code: string;
  punchIds: string[];
  reason: BilingualReason;
}

export interface FraudDetectionVerdict {
  outcome: ComplianceOutcome;
  flags: FraudFlag[];
  summary: BilingualReason;
}

const EARTH_KM = 6371;
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(x));
}

/**
 * Detect three signal classes:
 *
 *   1. IMPOSSIBLE_TRAVEL  — two punches in < N minutes more than M km apart.
 *   2. IDENTICAL_SECOND   — two distinct employees punching at the same
 *                           second on the same device (buddy-punching tell).
 *   3. LOW_CONFIDENCE     — match score below the configured floor.
 *   4. CLUSTER_PUNCH      — same employee, 3+ punches within 60 seconds on
 *                           different device IDs (rotating tokens).
 */
export function detectBiometricFraud(
  punches: BiometricPunch[],
  opts: {
    minMatchConfidence?: number;
    impossibleSpeedKmh?: number;
  } = {}
): FraudDetectionVerdict {
  const minConf = opts.minMatchConfidence ?? 0.65;
  const speedThreshold = opts.impossibleSpeedKmh ?? 250; // typical commercial flight floor

  const flags: FraudFlag[] = [];

  // 1 + 4 — group by employee, sort by time, scan windows.
  const byEmp = new Map<string, BiometricPunch[]>();
  for (const p of punches) {
    if (!byEmp.has(p.employeeId)) byEmp.set(p.employeeId, []);
    byEmp.get(p.employeeId)!.push(p);
  }
  for (const [empId, rows] of byEmp) {
    rows.sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime());
    // impossible-travel pairwise
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1];
      const b = rows[i];
      if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
        const km = haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
        const hours = Math.max(0.0001, (b.capturedAt.getTime() - a.capturedAt.getTime()) / 3600000);
        const speed = km / hours;
        if (speed > speedThreshold && km > 5) {
          flags.push({
            code: 'IMPOSSIBLE_TRAVEL',
            punchIds: [a.punchId, b.punchId],
            reason: {
              code: 'IMPOSSIBLE_TRAVEL',
              en: `Employee ${empId} punches ${km.toFixed(1)} km apart in ${hours.toFixed(2)}h (~${speed.toFixed(0)} km/h).`,
              ar: `الموظف ${empId} سجل حضوراً بمسافة ${km.toFixed(1)} كم خلال ${hours.toFixed(2)} ساعة (~${speed.toFixed(0)} كم/س).`,
            },
          });
        }
      }
    }
    // cluster punch — 3+ punches within 60s on >1 device
    for (let i = 0; i < rows.length; i++) {
      const window = rows.filter(
        (r) => Math.abs(r.capturedAt.getTime() - rows[i].capturedAt.getTime()) <= 60000
      );
      const uniqueDevices = new Set(window.map((w) => w.deviceId).filter(Boolean));
      if (window.length >= 3 && uniqueDevices.size >= 2) {
        const ids = window.map((w) => w.punchId);
        if (!flags.some((f) => f.code === 'CLUSTER_PUNCH' && f.punchIds.join() === ids.join())) {
          flags.push({
            code: 'CLUSTER_PUNCH',
            punchIds: ids,
            reason: {
              code: 'CLUSTER_PUNCH',
              en: `Employee ${empId} has ${window.length} punches within 60s across ${uniqueDevices.size} devices.`,
              ar: `الموظف ${empId} سجل ${window.length} حضور خلال 60 ثانية عبر ${uniqueDevices.size} أجهزة.`,
            },
          });
        }
        break;
      }
    }
    // low confidence
    for (const r of rows) {
      if (r.matchConfidence != null && r.matchConfidence < minConf) {
        flags.push({
          code: 'LOW_CONFIDENCE',
          punchIds: [r.punchId],
          reason: {
            code: 'LOW_CONFIDENCE',
            en: `Biometric match confidence ${r.matchConfidence.toFixed(2)} below threshold ${minConf}.`,
            ar: `ثقة التطابق البيومتري ${r.matchConfidence.toFixed(2)} أقل من الحد ${minConf}.`,
          },
        });
      }
    }
  }

  // 2 — identical-second across employees on same device
  const byKey = new Map<string, BiometricPunch[]>();
  for (const p of punches) {
    if (!p.deviceId) continue;
    const k = `${p.deviceId}|${Math.floor(p.capturedAt.getTime() / 1000)}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(p);
  }
  for (const [, rows] of byKey) {
    const distinctEmps = new Set(rows.map((r) => r.employeeId));
    if (distinctEmps.size >= 2) {
      flags.push({
        code: 'IDENTICAL_SECOND',
        punchIds: rows.map((r) => r.punchId),
        reason: {
          code: 'IDENTICAL_SECOND',
          en: `${distinctEmps.size} employees punched at the same second on device ${rows[0].deviceId}.`,
          ar: `${distinctEmps.size} موظفين سجلوا حضوراً في الثانية نفسها على الجهاز ${rows[0].deviceId}.`,
        },
      });
    }
  }

  const hard = flags.filter(
    (f) => f.code === 'IMPOSSIBLE_TRAVEL' || f.code === 'IDENTICAL_SECOND'
  ).length;
  const outcome: ComplianceOutcome = hard > 0 ? 'FAIL' : flags.length > 0 ? 'WARN' : 'PASS';
  const summary: BilingualReason =
    outcome === 'PASS'
      ? {
          code: 'NO_FRAUD',
          en: 'No fraud patterns detected.',
          ar: 'لا توجد أنماط احتيال.',
        }
      : outcome === 'WARN'
        ? {
            code: 'FRAUD_REVIEW',
            en: `${flags.length} soft-signal(s) detected — manager review recommended.`,
            ar: `تم رصد ${flags.length} إشارة ضعيفة — يُوصى بمراجعة المدير.`,
          }
        : {
            code: 'FRAUD_HARD_SIGNAL',
            en: `${hard} hard fraud signal(s) — escalate to investigation.`,
            ar: `${hard} إشارة احتيال صريحة — يلزم التصعيد للتحقيق.`,
          };
  return { outcome, flags, summary };
}
