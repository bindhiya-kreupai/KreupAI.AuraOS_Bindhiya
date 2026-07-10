/**
 * EPIC-38 — External Reporting evaluators.
 *
 * S-ER-01 — regulator-submission cadence
 * S-ER-02 — file-format validator
 * S-ER-03 — bilingual disclosure-pack checker
 */

// =============================================================================
// S-ER-01 — Regulator submission cadence
// =============================================================================

export interface RegulatorObligation {
  obligationId: string;
  regulator: string;
  /** Days between mandatory submissions. */
  cadenceDays: number;
  lastSubmittedAt?: Date;
  active: boolean;
}

export type SubmissionStatus = 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'NEVER_SUBMITTED' | 'INACTIVE';

export interface SubmissionResult {
  obligationId: string;
  regulator: string;
  status: SubmissionStatus;
  daysSinceSubmission?: number;
  reason: { en: string; ar: string };
}

export interface SubmissionReport {
  results: SubmissionResult[];
  totals: { obligations: number; overdue: number; currentPct: number };
}

export function evaluateSubmissionCadence(
  obligations: RegulatorObligation[],
  asOf: Date = new Date()
): SubmissionReport {
  const day = 24 * 3600 * 1000;
  const results: SubmissionResult[] = obligations.map((o) => {
    if (!o.active) {
      return {
        obligationId: o.obligationId,
        regulator: o.regulator,
        status: 'INACTIVE',
        reason: { en: 'Obligation inactive', ar: 'الالتزام غير نشط' },
      };
    }
    if (!o.lastSubmittedAt) {
      return {
        obligationId: o.obligationId,
        regulator: o.regulator,
        status: 'NEVER_SUBMITTED',
        reason: { en: 'No prior submission on record', ar: 'لا يوجد تقديم سابق' },
      };
    }
    const days = Math.floor((asOf.getTime() - o.lastSubmittedAt.getTime()) / day);
    let status: SubmissionStatus = 'CURRENT';
    if (days > o.cadenceDays) status = 'OVERDUE';
    else if (days > o.cadenceDays * 0.85) status = 'DUE_SOON';
    return {
      obligationId: o.obligationId,
      regulator: o.regulator,
      status,
      daysSinceSubmission: days,
      reason: {
        en: `${days}d since last submission, cadence ${o.cadenceDays}d`,
        ar: `${days} يوم منذ آخر تقديم`,
      },
    };
  });
  const overdue = results.filter(
    (r) => r.status === 'OVERDUE' || r.status === 'NEVER_SUBMITTED'
  ).length;
  const active = results.filter((r) => r.status !== 'INACTIVE').length;
  const current = results.filter((r) => r.status === 'CURRENT').length;
  return {
    results,
    totals: {
      obligations: results.length,
      overdue,
      currentPct: active === 0 ? 100 : Math.round((current / active) * 100),
    },
  };
}

// =============================================================================
// S-ER-02 — File format validator
// =============================================================================

export interface FileFormatSpec {
  schemaId: string;
  /** Required column names (in order). */
  columns: string[];
  /** Max row count (e.g. for a regulator-imposed file cap). */
  maxRows?: number;
  /** Encoding requirement — defaults to UTF-8. */
  encoding?: 'UTF-8' | 'UTF-16LE' | 'CP1252';
}

export interface FileSubmission {
  /** Detected column header row (in submission order). */
  columns: string[];
  rowCount: number;
  encoding?: 'UTF-8' | 'UTF-16LE' | 'CP1252';
  /** Optional preview rows for downstream diagnostics. */
  sampleRows?: Array<Record<string, string>>;
}

export type FormatDefect =
  | 'MISSING_COLUMN'
  | 'EXTRA_COLUMN'
  | 'WRONG_COLUMN_ORDER'
  | 'TOO_MANY_ROWS'
  | 'WRONG_ENCODING';

export interface FormatValidatorResult {
  defects: FormatDefect[];
  missingColumns: string[];
  extraColumns: string[];
  reason: { en: string; ar: string };
}

export function validateFileFormat(
  spec: FileFormatSpec,
  submission: FileSubmission
): FormatValidatorResult {
  const defects: FormatDefect[] = [];
  const specSet = new Set(spec.columns);
  const subSet = new Set(submission.columns);
  const missingColumns = spec.columns.filter((c) => !subSet.has(c));
  const extraColumns = submission.columns.filter((c) => !specSet.has(c));
  if (missingColumns.length > 0) defects.push('MISSING_COLUMN');
  if (extraColumns.length > 0) defects.push('EXTRA_COLUMN');
  // Order check — compare positions after removing extras and adding missing at the end.
  for (let i = 0; i < spec.columns.length; i++) {
    if (submission.columns[i] !== spec.columns[i]) {
      defects.push('WRONG_COLUMN_ORDER');
      break;
    }
  }
  if (spec.maxRows && submission.rowCount > spec.maxRows) defects.push('TOO_MANY_ROWS');
  const requiredEncoding = spec.encoding ?? 'UTF-8';
  if (submission.encoding && submission.encoding !== requiredEncoding) {
    defects.push('WRONG_ENCODING');
  }
  return {
    defects,
    missingColumns,
    extraColumns,
    reason: {
      en: defects.length === 0 ? 'File matches spec' : `Defects: ${defects.join(', ')}`,
      ar: defects.length === 0 ? 'الملف مطابق' : `عيوب: ${defects.join('، ')}`,
    },
  };
}

// =============================================================================
// S-ER-03 — Bilingual disclosure pack
// =============================================================================

export interface DisclosureSection {
  sectionCode: string;
  en?: string;
  ar?: string;
}

export interface DisclosureRequirement {
  sectionCode: string;
  label: string;
  /** When true the pack MUST include both languages. */
  requireBilingual: boolean;
}

export interface DisclosureResult {
  sectionCode: string;
  status: 'OK' | 'MISSING_EN' | 'MISSING_AR' | 'MISSING_BOTH' | 'MISSING_SECTION';
  reason: { en: string; ar: string };
}

export interface DisclosurePackReport {
  results: DisclosureResult[];
  totals: { required: number; missing: number; complete: number; completePct: number };
}

export function evaluateDisclosurePack(
  requirements: DisclosureRequirement[],
  sections: DisclosureSection[]
): DisclosurePackReport {
  const bySection = new Map<string, DisclosureSection>();
  for (const s of sections) bySection.set(s.sectionCode, s);
  const results: DisclosureResult[] = requirements.map((req) => {
    const s = bySection.get(req.sectionCode);
    if (!s) {
      return {
        sectionCode: req.sectionCode,
        status: 'MISSING_SECTION',
        reason: { en: `Section ${req.label} missing entirely`, ar: 'القسم مفقود' },
      };
    }
    const hasEn = !!s.en && s.en.trim().length > 0;
    const hasAr = !!s.ar && s.ar.trim().length > 0 && /[\u0600-\u06FF]/.test(s.ar);
    if (!req.requireBilingual) {
      if (!hasEn && !hasAr) {
        return {
          sectionCode: req.sectionCode,
          status: 'MISSING_BOTH',
          reason: { en: 'No content provided', ar: 'لا يوجد محتوى' },
        };
      }
      return {
        sectionCode: req.sectionCode,
        status: 'OK',
        reason: { en: 'Section provided', ar: 'تم تقديم القسم' },
      };
    }
    if (!hasEn && !hasAr) {
      return {
        sectionCode: req.sectionCode,
        status: 'MISSING_BOTH',
        reason: { en: 'EN and AR content missing', ar: 'النصان مفقودان' },
      };
    }
    if (!hasEn) {
      return {
        sectionCode: req.sectionCode,
        status: 'MISSING_EN',
        reason: { en: 'EN translation missing', ar: 'الترجمة الإنجليزية مفقودة' },
      };
    }
    if (!hasAr) {
      return {
        sectionCode: req.sectionCode,
        status: 'MISSING_AR',
        reason: {
          en: 'AR translation missing or not in Arabic script',
          ar: 'الترجمة العربية مفقودة أو ليست بالخط العربي',
        },
      };
    }
    return {
      sectionCode: req.sectionCode,
      status: 'OK',
      reason: { en: 'Bilingual pack complete', ar: 'الحزمة كاملة بكلا اللغتين' },
    };
  });
  const complete = results.filter((r) => r.status === 'OK').length;
  return {
    results,
    totals: {
      required: results.length,
      missing: results.length - complete,
      complete,
      completePct: results.length === 0 ? 100 : Math.round((complete / results.length) * 100),
    },
  };
}
