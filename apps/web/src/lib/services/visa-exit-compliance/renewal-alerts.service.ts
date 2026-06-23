/**
 * EPIC-29 visa renewal multi-stage alert engine.
 *
 * Closes the audit gap "Comm template dispatch 0% (S12). KPI dashboard
 * 0% (S16)" + "Dependent visa cascade not linked to renewal alerts" for
 * EPIC-29 Visa / Work Permit.
 *
 * The labour-authority compliance bar requires PROACTIVE alerts at
 * multiple horizons before a visa expires. This service produces
 * alerts at 60 / 30 / 15 / 7 / 1 day(s) before expiry, plus a
 * post-expiry escalation. Each alert carries a typed severity and a
 * bilingual message ready for any dispatch channel (email / SMS /
 * push / dashboard).
 *
 * Dependent cascade: when the primary visa is expiring, dependent
 * visas in the same family unit are surfaced alongside the primary
 * so the operations team can renew them as one batch (the labour
 * authorities require it; doing them separately invites mismatched
 * end-dates).
 *
 * Pure deterministic logic; no IO. The DB-driven scanner is the thin
 * wrapper at the bottom (scanTenantForAlerts).
 */

import { prisma } from '@aura/database';

export type AlertSeverity = 'INFO' | 'WARNING' | 'URGENT' | 'CRITICAL' | 'OVERDUE';

export interface AlertWindow {
  daysFromExpiry: number; // negative when after expiry
  severity: AlertSeverity;
  code: string;
  /** Human-friendly EN. */
  message: (label: string, days: number) => string;
  /** Human-friendly AR. */
  messageAr: (label: string, days: number) => string;
}

export const DEFAULT_WINDOWS: AlertWindow[] = [
  {
    daysFromExpiry: 60,
    severity: 'INFO',
    code: 'T-60',
    message: (l, d) => `${l} expires in ${d} days — initiate renewal workflow`,
    messageAr: (l, d) => `${l} ينتهي خلال ${d} يوم - ابدأ عملية التجديد`,
  },
  {
    daysFromExpiry: 30,
    severity: 'WARNING',
    code: 'T-30',
    message: (l, d) => `${l} expires in ${d} days — confirm vendor + documents`,
    messageAr: (l, d) => `${l} ينتهي خلال ${d} يوم - تأكيد المورد والوثائق`,
  },
  {
    daysFromExpiry: 15,
    severity: 'URGENT',
    code: 'T-15',
    message: (l, d) => `${l} expires in ${d} days — must be filed this week`,
    messageAr: (l, d) => `${l} ينتهي خلال ${d} يوم - يجب التقديم هذا الأسبوع`,
  },
  {
    daysFromExpiry: 7,
    severity: 'URGENT',
    code: 'T-7',
    message: (l, d) => `${l} expires in ${d} days — escalate to PRO + supervisor`,
    messageAr: (l, d) => `${l} ينتهي خلال ${d} يوم - تصعيد إلى المسؤول والمشرف`,
  },
  {
    daysFromExpiry: 1,
    severity: 'CRITICAL',
    code: 'T-1',
    message: (l, d) => `${l} expires tomorrow — last-chance escalation to senior management`,
    messageAr: (l, d) => `${l} ينتهي غداً - تصعيد أخير إلى الإدارة العليا`,
  },
  {
    daysFromExpiry: -1,
    severity: 'OVERDUE',
    code: 'T+1',
    message: (l, d) => `${l} EXPIRED ${Math.abs(d)} day(s) ago — penalty risk active`,
    messageAr: (l, d) => `${l} انتهى منذ ${Math.abs(d)} يوم - خطر الغرامة`,
  },
];

export interface VisaSnapshot {
  id: string;
  employeeId: string;
  documentType: string;
  documentNumber: string;
  expiryDate: Date;
  status: string;
  /** Optional family-unit identifier — visas with the same key are dependents. */
  familyUnitId?: string;
  isDependent?: boolean;
  /** Optional bilingual labels — provided by the caller / DB. */
  label?: string;
  labelAr?: string;
}

export interface VisaAlert {
  visaId: string;
  employeeId: string;
  code: string;
  severity: AlertSeverity;
  daysFromExpiry: number;
  message: string;
  messageAr: string;
  /** Family-unit cascade — dependent visas under the same primary. */
  dependents: Array<{ visaId: string; documentType: string; expiryDate: Date }>;
}

const MS_PER_DAY = 24 * 3600 * 1000;

export function daysBetween(asOf: Date, expiry: Date): number {
  const a = new Date(asOf);
  a.setHours(0, 0, 0, 0);
  const e = new Date(expiry);
  e.setHours(0, 0, 0, 0);
  return Math.round((e.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * Pure helper: given a visa and the active alert windows, find the
 * single window the visa currently sits in (the tightest match).
 */
export function selectAlertWindow(
  visa: VisaSnapshot,
  asOf: Date,
  windows: AlertWindow[] = DEFAULT_WINDOWS
): AlertWindow | null {
  const dfe = daysBetween(asOf, visa.expiryDate);
  // Pick the tightest window — for future expiry, the window with the
  // smallest non-negative daysFromExpiry ≤ dfe and ≥ ... so that as
  // expiry approaches, the severity escalates.
  const sortedFuture = windows
    .filter((w) => w.daysFromExpiry >= 0)
    .sort((a, b) => a.daysFromExpiry - b.daysFromExpiry);
  for (const w of sortedFuture) {
    if (dfe <= w.daysFromExpiry && dfe >= 0) {
      // tightest applicable
      return w;
    }
  }
  if (dfe < 0) {
    // Use the first overdue window for any expired visa.
    return windows.find((w) => w.daysFromExpiry < 0) ?? null;
  }
  return null;
}

/**
 * Pure helper: bundle the alert with its dependent-cascade detail.
 */
export function buildAlert(
  primary: VisaSnapshot,
  asOf: Date,
  dependents: VisaSnapshot[],
  windows: AlertWindow[] = DEFAULT_WINDOWS
): VisaAlert | null {
  const window = selectAlertWindow(primary, asOf, windows);
  if (!window) return null;
  const label = primary.label ?? `${primary.documentType} ${primary.documentNumber}`;
  const days = daysBetween(asOf, primary.expiryDate);
  return {
    visaId: primary.id,
    employeeId: primary.employeeId,
    code: window.code,
    severity: window.severity,
    daysFromExpiry: days,
    message: window.message(label, days),
    messageAr: window.messageAr(primary.labelAr ?? label, days),
    dependents: dependents.map((d) => ({
      visaId: d.id,
      documentType: d.documentType,
      expiryDate: d.expiryDate,
    })),
  };
}

export class VisaRenewalAlertService {
  /**
   * Scan a tenant's ACTIVE visas at `asOf` and return all visas
   * currently sitting in an alert window. Dependent visas are
   * grouped under their primary by familyUnitId; dependents alone
   * do NOT produce an alert (the primary's alert lists them).
   */
  async scanTenantForAlerts(
    tenantId: string,
    asOf: Date = new Date(),
    windows: AlertWindow[] = DEFAULT_WINDOWS
  ): Promise<VisaAlert[]> {
    const horizon = new Date(asOf);
    horizon.setDate(horizon.getDate() + 90);
    const rows = await (prisma as any).visaPermit.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: 'ACTIVE',
        expiryDate: { lte: horizon },
      },
      select: {
        id: true,
        employeeId: true,
        documentType: true,
        documentNumber: true,
        expiryDate: true,
        status: true,
        metadata: true,
      },
    });

    // Split into primaries / dependents using metadata.familyUnitId +
    // metadata.isDependent (defaults: every visa is a primary).
    const primaries: VisaSnapshot[] = [];
    const dependentsByUnit = new Map<string, VisaSnapshot[]>();
    for (const r of rows) {
      const meta = (r.metadata ?? {}) as Record<string, unknown>;
      const familyUnitId =
        typeof meta.familyUnitId === 'string' ? (meta.familyUnitId as string) : undefined;
      const isDep = !!meta.isDependent;
      const snap: VisaSnapshot = {
        id: r.id,
        employeeId: r.employeeId,
        documentType: r.documentType,
        documentNumber: r.documentNumber,
        expiryDate: r.expiryDate,
        status: r.status,
        familyUnitId,
        isDependent: isDep,
        label: `${r.documentType} ${r.documentNumber}`,
      };
      if (isDep && familyUnitId) {
        if (!dependentsByUnit.has(familyUnitId)) dependentsByUnit.set(familyUnitId, []);
        dependentsByUnit.get(familyUnitId)!.push(snap);
      } else {
        primaries.push(snap);
      }
    }

    const out: VisaAlert[] = [];
    for (const p of primaries) {
      const deps = (p.familyUnitId && dependentsByUnit.get(p.familyUnitId)) || [];
      const alert = buildAlert(p, asOf, deps, windows);
      if (alert) out.push(alert);
    }
    return out;
  }
}

export const visaRenewalAlertService = new VisaRenewalAlertService();
