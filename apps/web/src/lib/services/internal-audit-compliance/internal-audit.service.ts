/**
 * EPIC-37 — Internal Audit evaluators.
 *
 * S-IA-01 — control-test cadence
 * S-IA-02 — finding-closure SLA
 * S-IA-03 — repeat-finding detector
 */

// =============================================================================
// S-IA-01 — Control-test cadence
// =============================================================================

export interface InternalControl {
  controlId: string;
  name: string;
  testCadenceDays: number;
  lastTestedAt?: Date;
  /** True if the control is currently in scope. */
  inScope: boolean;
}

export type ControlTestStatus =
  | 'CURRENT'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'NEVER_TESTED'
  | 'OUT_OF_SCOPE';

export interface ControlTestResult {
  controlId: string;
  name: string;
  status: ControlTestStatus;
  daysSinceTest?: number;
  reason: { en: string; ar: string };
}

export interface ControlTestReport {
  results: ControlTestResult[];
  totals: { controls: number; overdue: number; currentPct: number };
}

export function evaluateControlTestCadence(
  controls: InternalControl[],
  asOf: Date = new Date()
): ControlTestReport {
  const day = 24 * 3600 * 1000;
  const results: ControlTestResult[] = controls.map((c) => {
    if (!c.inScope) {
      return {
        controlId: c.controlId,
        name: c.name,
        status: 'OUT_OF_SCOPE',
        reason: { en: 'Control not in scope', ar: 'الضابط خارج النطاق' },
      };
    }
    if (!c.lastTestedAt) {
      return {
        controlId: c.controlId,
        name: c.name,
        status: 'NEVER_TESTED',
        reason: { en: 'Control has never been tested', ar: 'لم يتم اختبار الضابط' },
      };
    }
    const days = Math.floor((asOf.getTime() - c.lastTestedAt.getTime()) / day);
    let status: ControlTestStatus = 'CURRENT';
    if (days > c.testCadenceDays) status = 'OVERDUE';
    else if (days > c.testCadenceDays * 0.85) status = 'DUE_SOON';
    return {
      controlId: c.controlId,
      name: c.name,
      status,
      daysSinceTest: days,
      reason: {
        en: `${days}d since last test, cadence ${c.testCadenceDays}d`,
        ar: `${days} يوم منذ آخر اختبار`,
      },
    };
  });
  const overdue = results.filter(
    (r) => r.status === 'OVERDUE' || r.status === 'NEVER_TESTED'
  ).length;
  const inScope = results.filter((r) => r.status !== 'OUT_OF_SCOPE').length;
  const current = results.filter((r) => r.status === 'CURRENT').length;
  return {
    results,
    totals: {
      controls: results.length,
      overdue,
      currentPct: inScope === 0 ? 100 : Math.round((current / inScope) * 100),
    },
  };
}

// =============================================================================
// S-IA-02 — Finding closure SLA
// =============================================================================

export interface AuditFinding {
  findingId: string;
  controlId?: string;
  /** When the finding was raised. */
  raisedAt: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  closedAt?: Date;
  /** Override the default SLA days for this severity. */
  overrideSlaDays?: number;
}

export type FindingStatus = 'OPEN_ON_TRACK' | 'OPEN_BREACHED' | 'CLOSED_ON_TIME' | 'CLOSED_LATE';

const SEVERITY_SLA: Record<AuditFinding['severity'], number> = {
  CRITICAL: 30,
  HIGH: 60,
  MEDIUM: 90,
  LOW: 180,
};

export interface FindingSlaResult {
  findingId: string;
  status: FindingStatus;
  ageDays: number;
  slaDays: number;
  reason: { en: string; ar: string };
}

export interface FindingSlaReport {
  results: FindingSlaResult[];
  totals: {
    findings: number;
    breached: number;
    breachPct: number;
  };
}

export function evaluateFindingClosureSla(
  findings: AuditFinding[],
  asOf: Date = new Date()
): FindingSlaReport {
  const day = 24 * 3600 * 1000;
  const results: FindingSlaResult[] = findings.map((f) => {
    const slaDays = f.overrideSlaDays ?? SEVERITY_SLA[f.severity];
    if (f.closedAt) {
      const ageDays = Math.floor((f.closedAt.getTime() - f.raisedAt.getTime()) / day);
      const status: FindingStatus = ageDays <= slaDays ? 'CLOSED_ON_TIME' : 'CLOSED_LATE';
      return {
        findingId: f.findingId,
        status,
        ageDays,
        slaDays,
        reason: {
          en:
            status === 'CLOSED_ON_TIME' ? `Closed in ${ageDays}d` : `Closed late after ${ageDays}d`,
          ar: status === 'CLOSED_ON_TIME' ? 'أُغلق في الوقت' : 'إغلاق متأخر',
        },
      };
    }
    const ageDays = Math.floor((asOf.getTime() - f.raisedAt.getTime()) / day);
    const status: FindingStatus = ageDays > slaDays ? 'OPEN_BREACHED' : 'OPEN_ON_TRACK';
    return {
      findingId: f.findingId,
      status,
      ageDays,
      slaDays,
      reason: {
        en:
          status === 'OPEN_BREACHED'
            ? `Open ${ageDays}d — past SLA ${slaDays}d`
            : `Open ${ageDays}d — within SLA`,
        ar: status === 'OPEN_BREACHED' ? 'مفتوح وتجاوز الموعد' : 'مفتوح ضمن الموعد',
      },
    };
  });
  const breached = results.filter(
    (r) => r.status === 'OPEN_BREACHED' || r.status === 'CLOSED_LATE'
  ).length;
  return {
    results,
    totals: {
      findings: results.length,
      breached,
      breachPct: results.length === 0 ? 0 : Math.round((breached / results.length) * 100),
    },
  };
}

// =============================================================================
// S-IA-03 — Repeat finding detector
// =============================================================================

export interface FindingHistoryEntry {
  findingId: string;
  controlId: string;
  /** Free-form classification — used to spot recurrence. */
  category: string;
  raisedAt: Date;
}

export interface RepeatGroup {
  controlId: string;
  category: string;
  occurrences: number;
  findingIds: string[];
  reason: { en: string; ar: string };
}

export interface RepeatFindingReport {
  groups: RepeatGroup[];
  totals: { repeats: number; controls: number };
}

export function detectRepeatFindings(
  history: FindingHistoryEntry[],
  minOccurrences = 2
): RepeatFindingReport {
  const buckets = new Map<string, FindingHistoryEntry[]>();
  for (const h of history) {
    const key = `${h.controlId}::${h.category}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(h);
  }
  const groups: RepeatGroup[] = [];
  for (const [, items] of buckets) {
    if (items.length >= minOccurrences) {
      const [first] = items;
      groups.push({
        controlId: first.controlId,
        category: first.category,
        occurrences: items.length,
        findingIds: items.map((x) => x.findingId),
        reason: {
          en: `${items.length} findings under control ${first.controlId} category ${first.category}`,
          ar: `${items.length} ملاحظات متكررة`,
        },
      });
    }
  }
  return {
    groups,
    totals: {
      repeats: groups.length,
      controls: new Set(groups.map((g) => g.controlId)).size,
    },
  };
}
