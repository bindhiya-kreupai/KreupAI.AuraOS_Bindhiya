/**
 * EPIC-33 — Data Privacy (PDPL / GDPR) evaluators.
 *
 * S-DP-01 — subject-access-request SLA tracker
 * S-DP-02 — cross-border-transfer eligibility checker
 * S-DP-03 — consent-cadence audit
 */

// =============================================================================
// S-DP-01 — Subject access request SLA
// =============================================================================

export interface DsarRequest {
  requestId: string;
  receivedAt: Date;
  acknowledgedAt?: Date;
  fulfilledAt?: Date;
  /** Jurisdiction code drives the SLA window. */
  jurisdiction: 'SAU' | 'ARE' | 'BHR' | 'KWT' | 'OMN' | 'QAT' | 'EU' | 'OTHER';
  /** Optional override of legal SLA in days. */
  overrideSlaDays?: number;
}

export type DsarStatus = 'ACK_PENDING' | 'FULFILLED_ON_TIME' | 'FULFILLED_LATE' | 'BREACHED';

export interface DsarResult {
  requestId: string;
  status: DsarStatus;
  ageDays: number;
  slaDays: number;
  reason: { en: string; ar: string };
}

export interface DsarReport {
  results: DsarResult[];
  totals: {
    requests: number;
    breached: number;
    breachPct: number;
  };
}

/** Default SLA windows per GCC + EU (days). */
export const DSAR_DEFAULT_SLA: Record<DsarRequest['jurisdiction'], number> = {
  SAU: 30,
  ARE: 30,
  BHR: 30,
  KWT: 30,
  OMN: 30,
  QAT: 30,
  EU: 30,
  OTHER: 45,
};

export function evaluateDsarSla(requests: DsarRequest[], asOf: Date = new Date()): DsarReport {
  const day = 24 * 3600 * 1000;
  const results: DsarResult[] = requests.map((r) => {
    const slaDays = r.overrideSlaDays ?? DSAR_DEFAULT_SLA[r.jurisdiction];
    const ageDays = Math.floor(((r.fulfilledAt ?? asOf).getTime() - r.receivedAt.getTime()) / day);
    if (r.fulfilledAt) {
      const status: DsarStatus = ageDays <= slaDays ? 'FULFILLED_ON_TIME' : 'FULFILLED_LATE';
      return {
        requestId: r.requestId,
        status,
        ageDays,
        slaDays,
        reason: {
          en:
            status === 'FULFILLED_ON_TIME'
              ? `Fulfilled in ${ageDays}d (SLA ${slaDays}d)`
              : `Fulfilled late after ${ageDays}d (SLA ${slaDays}d)`,
          ar:
            status === 'FULFILLED_ON_TIME' ? `تم في ${ageDays} يوم` : `تأخر التنفيذ ${ageDays} يوم`,
        },
      };
    }
    const elapsed = Math.floor((asOf.getTime() - r.receivedAt.getTime()) / day);
    const status: DsarStatus = elapsed > slaDays ? 'BREACHED' : 'ACK_PENDING';
    return {
      requestId: r.requestId,
      status,
      ageDays: elapsed,
      slaDays,
      reason: {
        en:
          status === 'BREACHED'
            ? `Open ${elapsed}d — SLA ${slaDays}d breached`
            : `Open ${elapsed}d — within SLA ${slaDays}d`,
        ar:
          status === 'BREACHED'
            ? `مفتوح ${elapsed} يوم - تم تجاوز الموعد`
            : `مفتوح ${elapsed} يوم - ضمن الموعد`,
      },
    };
  });
  const breached = results.filter(
    (r) => r.status === 'BREACHED' || r.status === 'FULFILLED_LATE'
  ).length;
  return {
    results,
    totals: {
      requests: results.length,
      breached,
      breachPct: results.length === 0 ? 0 : Math.round((breached / results.length) * 100),
    },
  };
}

// =============================================================================
// S-DP-02 — Cross-border transfer eligibility
// =============================================================================

export type CountryCode =
  | 'SAU'
  | 'ARE'
  | 'BHR'
  | 'KWT'
  | 'OMN'
  | 'QAT'
  | 'EU'
  | 'US'
  | 'IND'
  | 'OTHER';

export interface TransferRequest {
  transferId: string;
  fromCountry: CountryCode;
  toCountry: CountryCode;
  dataCategory: 'GENERIC' | 'SENSITIVE' | 'SPECIAL_CATEGORY' | 'HEALTH' | 'BIOMETRIC';
  legalBasis?:
    | 'ADEQUACY_DECISION'
    | 'SCC'
    | 'BCR'
    | 'CONSENT'
    | 'CONTRACT'
    | 'PUBLIC_INTEREST'
    | 'NONE';
  hasDpia: boolean;
  hasDataSubjectConsent: boolean;
}

export interface TransferEligibilityResult {
  transferId: string;
  allowed: boolean;
  blockers: string[];
  reason: { en: string; ar: string };
}

export interface TransferEligibilityReport {
  results: TransferEligibilityResult[];
  totals: { requests: number; allowed: number; blocked: number };
}

/**
 * Adequacy whitelist — pure heuristic mirroring the GCC PDPLs' published
 * adequacy lists. Configurable for production. The intent here is a
 * deterministic evaluator the inspector page can rely on.
 */
const ADEQUACY: Record<CountryCode, CountryCode[]> = {
  SAU: ['ARE', 'BHR', 'KWT', 'OMN', 'QAT', 'EU'],
  ARE: ['SAU', 'BHR', 'KWT', 'OMN', 'QAT', 'EU'],
  BHR: ['SAU', 'ARE', 'KWT', 'OMN', 'QAT', 'EU'],
  KWT: ['SAU', 'ARE', 'BHR', 'OMN', 'QAT', 'EU'],
  OMN: ['SAU', 'ARE', 'BHR', 'KWT', 'QAT', 'EU'],
  QAT: ['SAU', 'ARE', 'BHR', 'KWT', 'OMN', 'EU'],
  EU: ['SAU', 'ARE', 'BHR', 'KWT', 'OMN', 'QAT'],
  US: [],
  IND: [],
  OTHER: [],
};

export function checkCrossBorderTransfer(requests: TransferRequest[]): TransferEligibilityReport {
  const results: TransferEligibilityResult[] = requests.map((req) => {
    const blockers: string[] = [];
    const adequate = (ADEQUACY[req.fromCountry] ?? []).includes(req.toCountry);
    if (req.fromCountry === req.toCountry) {
      // intra-country — no transfer.
      return {
        transferId: req.transferId,
        allowed: true,
        blockers,
        reason: { en: 'Intra-country processing — no cross-border transfer', ar: 'معالجة محلية' },
      };
    }
    if (!adequate) {
      if (req.legalBasis !== 'SCC' && req.legalBasis !== 'BCR' && req.legalBasis !== 'CONSENT') {
        blockers.push('NO_ADEQUACY_AND_NO_FALLBACK_BASIS');
      }
    }
    if (req.dataCategory === 'SENSITIVE' || req.dataCategory === 'SPECIAL_CATEGORY') {
      if (!req.hasDpia) blockers.push('SENSITIVE_DATA_REQUIRES_DPIA');
      if (!req.hasDataSubjectConsent && req.legalBasis !== 'CONTRACT') {
        blockers.push('SENSITIVE_DATA_REQUIRES_CONSENT_OR_CONTRACT');
      }
    }
    if (req.dataCategory === 'HEALTH' || req.dataCategory === 'BIOMETRIC') {
      if (!req.hasDpia) blockers.push('SPECIAL_CATEGORY_REQUIRES_DPIA');
      if (!req.hasDataSubjectConsent) blockers.push('SPECIAL_CATEGORY_REQUIRES_EXPLICIT_CONSENT');
    }
    if (req.legalBasis === 'NONE' || !req.legalBasis) {
      blockers.push('NO_LEGAL_BASIS');
    }
    const allowed = blockers.length === 0;
    return {
      transferId: req.transferId,
      allowed,
      blockers,
      reason: {
        en: allowed
          ? `Transfer ${req.fromCountry}→${req.toCountry} allowed under ${req.legalBasis}`
          : `Transfer blocked: ${blockers.join(', ')}`,
        ar: allowed ? 'التحويل مسموح' : `التحويل ممنوع: ${blockers.join('، ')}`,
      },
    };
  });
  const allowed = results.filter((r) => r.allowed).length;
  return {
    results,
    totals: {
      requests: results.length,
      allowed,
      blocked: results.length - allowed,
    },
  };
}

// =============================================================================
// S-DP-03 — Consent cadence audit
// =============================================================================

export interface ConsentRecord {
  subjectId: string;
  purpose: string;
  grantedAt: Date;
  withdrawnAt?: Date;
  /** Re-confirmation cadence in days (e.g. 365). */
  reconfirmDays?: number;
}

export type ConsentStatus = 'ACTIVE' | 'STALE' | 'WITHDRAWN' | 'NEVER_GRANTED';

export interface ConsentResult {
  subjectId: string;
  purpose: string;
  status: ConsentStatus;
  ageDays?: number;
  reason: { en: string; ar: string };
}

export interface ConsentReport {
  results: ConsentResult[];
  totals: {
    records: number;
    active: number;
    stale: number;
    withdrawn: number;
    activePct: number;
  };
}

export function evaluateConsentCadence(
  records: ConsentRecord[],
  asOf: Date = new Date()
): ConsentReport {
  const day = 24 * 3600 * 1000;
  const results: ConsentResult[] = records.map((c) => {
    if (c.withdrawnAt && c.withdrawnAt.getTime() <= asOf.getTime()) {
      return {
        subjectId: c.subjectId,
        purpose: c.purpose,
        status: 'WITHDRAWN',
        reason: { en: 'Consent withdrawn', ar: 'تم سحب الموافقة' },
      };
    }
    const ageDays = Math.floor((asOf.getTime() - c.grantedAt.getTime()) / day);
    if (c.reconfirmDays && ageDays > c.reconfirmDays) {
      return {
        subjectId: c.subjectId,
        purpose: c.purpose,
        status: 'STALE',
        ageDays,
        reason: {
          en: `Consent older than ${c.reconfirmDays}d cadence`,
          ar: `الموافقة أقدم من المدة المسموحة`,
        },
      };
    }
    return {
      subjectId: c.subjectId,
      purpose: c.purpose,
      status: 'ACTIVE',
      ageDays,
      reason: { en: 'Consent active and current', ar: 'الموافقة سارية وحالية' },
    };
  });
  const active = results.filter((r) => r.status === 'ACTIVE').length;
  const stale = results.filter((r) => r.status === 'STALE').length;
  const withdrawn = results.filter((r) => r.status === 'WITHDRAWN').length;
  const activePct = results.length === 0 ? 0 : Math.round((active / results.length) * 100);
  return {
    results,
    totals: {
      records: results.length,
      active,
      stale,
      withdrawn,
      activePct,
    },
  };
}
