/**
 * EPIC-36 — Policy Lifecycle evaluators.
 *
 * S-PL-01 — policy-review cadence
 * S-PL-02 — server-side policy version diff
 * S-PL-03 — acknowledgement coverage
 */

import { createHash } from 'crypto';

// =============================================================================
// S-PL-01 — Policy review cadence
// =============================================================================

export interface PolicyRecord {
  policyId: string;
  title: string;
  /** Days between mandatory reviews. */
  reviewCadenceDays: number;
  lastReviewedAt?: Date;
  /** Whether the policy is currently active. */
  active: boolean;
}

export type PolicyReviewStatus = 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'NEVER_REVIEWED' | 'INACTIVE';

export interface PolicyReviewResult {
  policyId: string;
  title: string;
  status: PolicyReviewStatus;
  daysSinceReview?: number;
  reason: { en: string; ar: string };
}

export interface PolicyReviewReport {
  results: PolicyReviewResult[];
  totals: { policies: number; overdue: number; currentPct: number };
}

export function evaluatePolicyReviewCadence(
  policies: PolicyRecord[],
  asOf: Date = new Date()
): PolicyReviewReport {
  const day = 24 * 3600 * 1000;
  const results: PolicyReviewResult[] = policies.map((p) => {
    if (!p.active) {
      return {
        policyId: p.policyId,
        title: p.title,
        status: 'INACTIVE',
        reason: { en: 'Policy not active', ar: 'السياسة غير نشطة' },
      };
    }
    if (!p.lastReviewedAt) {
      return {
        policyId: p.policyId,
        title: p.title,
        status: 'NEVER_REVIEWED',
        reason: { en: 'Policy has never been reviewed', ar: 'لم تتم مراجعة السياسة' },
      };
    }
    const days = Math.floor((asOf.getTime() - p.lastReviewedAt.getTime()) / day);
    let status: PolicyReviewStatus = 'CURRENT';
    if (days > p.reviewCadenceDays) status = 'OVERDUE';
    else if (days > p.reviewCadenceDays * 0.85) status = 'DUE_SOON';
    return {
      policyId: p.policyId,
      title: p.title,
      status,
      daysSinceReview: days,
      reason: {
        en: `${days}d since last review, cadence ${p.reviewCadenceDays}d`,
        ar: `${days} يوم منذ آخر مراجعة`,
      },
    };
  });
  const overdue = results.filter(
    (r) => r.status === 'OVERDUE' || r.status === 'NEVER_REVIEWED'
  ).length;
  const active = results.filter((r) => r.status !== 'INACTIVE').length;
  const current = results.filter((r) => r.status === 'CURRENT').length;
  return {
    results,
    totals: {
      policies: results.length,
      overdue,
      currentPct: active === 0 ? 100 : Math.round((current / active) * 100),
    },
  };
}

// =============================================================================
// S-PL-02 — Version diff (server-side)
// =============================================================================

export interface PolicyDiffInput {
  policyId: string;
  /** Previous version body (markdown / text). */
  previous: string;
  /** Next version body. */
  next: string;
  previousVersion?: string;
  nextVersion?: string;
}

export interface DiffSegment {
  type: 'EQUAL' | 'ADDED' | 'REMOVED';
  line: string;
}

export interface PolicyDiffReport {
  policyId: string;
  previousVersion?: string;
  nextVersion?: string;
  previousHash: string;
  nextHash: string;
  changed: boolean;
  addedLines: number;
  removedLines: number;
  segments: DiffSegment[];
}

function hashBody(body: string): string {
  return createHash('sha256').update(body).digest('hex');
}

/**
 * Line-oriented diff (LCS via simple DP). Pure function — no IO.
 * For policies, line granularity is enough; we deliberately avoid
 * char-level diff so the output is auditable.
 */
export function diffPolicyVersions(input: PolicyDiffInput): PolicyDiffReport {
  const a = input.previous.split(/\r?\n/);
  const b = input.next.split(/\r?\n/);
  const m = a.length;
  const n = b.length;
  // DP table for longest common subsequence (LCS).
  const lcs: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      lcs[i][j] =
        a[i - 1] === b[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }
  // Backtrack.
  const segments: DiffSegment[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      segments.unshift({ type: 'EQUAL', line: a[i - 1] });
      i--;
      j--;
    } else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
      segments.unshift({ type: 'REMOVED', line: a[i - 1] });
      i--;
    } else {
      segments.unshift({ type: 'ADDED', line: b[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    segments.unshift({ type: 'REMOVED', line: a[--i] });
  }
  while (j > 0) {
    segments.unshift({ type: 'ADDED', line: b[--j] });
  }
  const addedLines = segments.filter((s) => s.type === 'ADDED').length;
  const removedLines = segments.filter((s) => s.type === 'REMOVED').length;
  const previousHash = hashBody(input.previous);
  const nextHash = hashBody(input.next);
  return {
    policyId: input.policyId,
    previousVersion: input.previousVersion,
    nextVersion: input.nextVersion,
    previousHash,
    nextHash,
    changed: previousHash !== nextHash,
    addedLines,
    removedLines,
    segments,
  };
}

// =============================================================================
// S-PL-03 — Acknowledgement coverage
// =============================================================================

export interface AckRequirement {
  policyId: string;
  publishedAt: Date;
  /** Days the workforce has to acknowledge before the policy is "out of compliance". */
  ackWindowDays: number;
  /** Employee IDs who must acknowledge. */
  audience: string[];
}

export interface AckRecord {
  policyId: string;
  employeeId: string;
  acknowledgedAt: Date;
}

export interface AckCoverageResult {
  policyId: string;
  audience: number;
  acknowledged: number;
  pendingWithinWindow: number;
  overdue: number;
  coveragePct: number;
}

export interface AckCoverageReport {
  results: AckCoverageResult[];
  totals: { policies: number; fullyCovered: number; overdue: number };
}

export function evaluateAckCoverage(
  requirements: AckRequirement[],
  records: AckRecord[],
  asOf: Date = new Date()
): AckCoverageReport {
  const day = 24 * 3600 * 1000;
  const results: AckCoverageResult[] = requirements.map((req) => {
    const ackedSet = new Set(
      records.filter((r) => r.policyId === req.policyId).map((r) => r.employeeId)
    );
    const overdueAge = (asOf.getTime() - req.publishedAt.getTime()) / day > req.ackWindowDays;
    let acknowledged = 0;
    let overdue = 0;
    let pendingWithinWindow = 0;
    for (const empId of req.audience) {
      if (ackedSet.has(empId)) acknowledged += 1;
      else if (overdueAge) overdue += 1;
      else pendingWithinWindow += 1;
    }
    return {
      policyId: req.policyId,
      audience: req.audience.length,
      acknowledged,
      pendingWithinWindow,
      overdue,
      coveragePct:
        req.audience.length === 0 ? 100 : Math.round((acknowledged / req.audience.length) * 100),
    };
  });
  return {
    results,
    totals: {
      policies: results.length,
      fullyCovered: results.filter((r) => r.coveragePct === 100).length,
      overdue: results.reduce((sum, r) => sum + r.overdue, 0),
    },
  };
}
