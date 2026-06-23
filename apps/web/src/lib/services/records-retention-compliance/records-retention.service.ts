/**
 * EPIC-32 — Records Retention evaluators.
 *
 * Closes: S-RR-01 retention-schedule cadence evaluator,
 *         S-RR-02 legal-hold conflict detector,
 *         S-RR-03 destruction-log validator.
 */

// =============================================================================
// S-RR-01 — Retention schedule cadence
// =============================================================================

export interface RetainedRecord {
  recordId: string;
  category: string;
  createdAt: Date;
  /** Days the record must be kept before destruction is allowed. */
  retentionDays: number;
  /** When the record was destroyed (if at all). */
  destroyedAt?: Date;
}

export type RetentionStatus =
  | 'WITHIN_RETENTION'
  | 'DUE_FOR_REVIEW'
  | 'OVERDUE_FOR_DESTRUCTION'
  | 'PROPERLY_DESTROYED'
  | 'PREMATURELY_DESTROYED';

export interface RetentionResult {
  recordId: string;
  category: string;
  status: RetentionStatus;
  ageDays: number;
  reason: { en: string; ar: string };
}

export interface RetentionReport {
  results: RetentionResult[];
  totals: Record<RetentionStatus, number> & { records: number };
}

export function evaluateRetentionSchedule(
  records: RetainedRecord[],
  asOf: Date = new Date()
): RetentionReport {
  const day = 24 * 3600 * 1000;
  const results: RetentionResult[] = records.map((r) => {
    const ageDays = Math.floor((asOf.getTime() - r.createdAt.getTime()) / day);
    if (r.destroyedAt) {
      const destroyedAge = Math.floor((r.destroyedAt.getTime() - r.createdAt.getTime()) / day);
      if (destroyedAge < r.retentionDays) {
        return {
          recordId: r.recordId,
          category: r.category,
          status: 'PREMATURELY_DESTROYED',
          ageDays: destroyedAge,
          reason: {
            en: `Destroyed after ${destroyedAge}d but retention requires ${r.retentionDays}d`,
            ar: `تم الإتلاف بعد ${destroyedAge} يوم ولكن الاحتفاظ يتطلب ${r.retentionDays} يوم`,
          },
        };
      }
      return {
        recordId: r.recordId,
        category: r.category,
        status: 'PROPERLY_DESTROYED',
        ageDays: destroyedAge,
        reason: {
          en: 'Destroyed after retention period elapsed',
          ar: 'تم الإتلاف بعد انتهاء فترة الاحتفاظ',
        },
      };
    }
    if (ageDays > r.retentionDays + 30) {
      return {
        recordId: r.recordId,
        category: r.category,
        status: 'OVERDUE_FOR_DESTRUCTION',
        ageDays,
        reason: {
          en: `Past retention (${ageDays}d vs ${r.retentionDays}d) — not destroyed`,
          ar: `تجاوز فترة الاحتفاظ ولم يتم الإتلاف`,
        },
      };
    }
    if (ageDays > r.retentionDays) {
      return {
        recordId: r.recordId,
        category: r.category,
        status: 'DUE_FOR_REVIEW',
        ageDays,
        reason: { en: 'Eligible for destruction review', ar: 'مؤهل لمراجعة الإتلاف' },
      };
    }
    return {
      recordId: r.recordId,
      category: r.category,
      status: 'WITHIN_RETENTION',
      ageDays,
      reason: { en: 'Within retention window', ar: 'ضمن فترة الاحتفاظ' },
    };
  });
  const counts: Record<RetentionStatus, number> = {
    WITHIN_RETENTION: 0,
    DUE_FOR_REVIEW: 0,
    OVERDUE_FOR_DESTRUCTION: 0,
    PROPERLY_DESTROYED: 0,
    PREMATURELY_DESTROYED: 0,
  };
  for (const r of results) counts[r.status] += 1;
  return { results, totals: { ...counts, records: results.length } };
}

// =============================================================================
// S-RR-02 — Legal-hold conflict detector
// =============================================================================

export interface LegalHold {
  holdId: string;
  /** Record ID under hold. */
  recordId: string;
  startedAt: Date;
  releasedAt?: Date;
  reason: string;
}

export interface DestructionRequest {
  recordId: string;
  requestedAt: Date;
  requestedBy?: string;
}

export interface LegalHoldConflict {
  recordId: string;
  holdId: string;
  destructionRequestedAt: Date;
  reason: { en: string; ar: string };
}

export interface LegalHoldReport {
  conflicts: LegalHoldConflict[];
  totals: { records: number; conflicts: number };
}

export function detectLegalHoldConflicts(
  holds: LegalHold[],
  requests: DestructionRequest[]
): LegalHoldReport {
  const conflicts: LegalHoldConflict[] = [];
  for (const req of requests) {
    const activeHold = holds.find(
      (h) =>
        h.recordId === req.recordId &&
        h.startedAt.getTime() <= req.requestedAt.getTime() &&
        (!h.releasedAt || h.releasedAt.getTime() >= req.requestedAt.getTime())
    );
    if (activeHold) {
      conflicts.push({
        recordId: req.recordId,
        holdId: activeHold.holdId,
        destructionRequestedAt: req.requestedAt,
        reason: {
          en: `Destruction requested while legal hold ${activeHold.holdId} is active: ${activeHold.reason}`,
          ar: `طلب إتلاف بينما يوجد تعليق قانوني نشط: ${activeHold.reason}`,
        },
      });
    }
  }
  return {
    conflicts,
    totals: { records: requests.length, conflicts: conflicts.length },
  };
}

// =============================================================================
// S-RR-03 — Destruction log validator
// =============================================================================

export interface DestructionLogEntry {
  recordId: string;
  destroyedAt: Date;
  destroyedBy?: string;
  method?: 'SHRED' | 'WIPE' | 'DEGAUSS' | 'INCINERATE';
  witnessId?: string;
  certificateRef?: string;
}

export type DestructionDefect =
  | 'MISSING_OPERATOR'
  | 'MISSING_METHOD'
  | 'MISSING_WITNESS'
  | 'MISSING_CERTIFICATE'
  | 'DUPLICATE_ENTRY'
  | 'BACKDATED_ENTRY';

export interface DestructionLogResult {
  recordId: string;
  destroyedAt: Date;
  defects: DestructionDefect[];
  reason: { en: string; ar: string };
}

export interface DestructionLogReport {
  results: DestructionLogResult[];
  totals: {
    entries: number;
    valid: number;
    defective: number;
    validityPct: number;
  };
}

export function validateDestructionLog(
  entries: DestructionLogEntry[],
  asOf: Date = new Date()
): DestructionLogReport {
  const seen = new Map<string, number>();
  const results: DestructionLogResult[] = entries.map((e) => {
    const defects: DestructionDefect[] = [];
    if (!e.destroyedBy) defects.push('MISSING_OPERATOR');
    if (!e.method) defects.push('MISSING_METHOD');
    if (!e.witnessId) defects.push('MISSING_WITNESS');
    if (!e.certificateRef) defects.push('MISSING_CERTIFICATE');
    const count = (seen.get(e.recordId) ?? 0) + 1;
    seen.set(e.recordId, count);
    if (count > 1) defects.push('DUPLICATE_ENTRY');
    if (e.destroyedAt.getTime() > asOf.getTime()) defects.push('BACKDATED_ENTRY');
    return {
      recordId: e.recordId,
      destroyedAt: e.destroyedAt,
      defects,
      reason: {
        en: defects.length === 0 ? 'Entry is valid' : `Defects: ${defects.join(', ')}`,
        ar: defects.length === 0 ? 'سجل صحيح' : `عيوب: ${defects.join('، ')}`,
      },
    };
  });
  const valid = results.filter((r) => r.defects.length === 0).length;
  const validityPct = results.length === 0 ? 100 : Math.round((valid / results.length) * 100);
  return {
    results,
    totals: {
      entries: results.length,
      valid,
      defective: results.length - valid,
      validityPct,
    },
  };
}
