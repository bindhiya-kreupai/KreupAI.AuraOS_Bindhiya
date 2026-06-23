/**
 * EPIC-30-S02 document classification engine.
 *
 * Closes the audit gap "classification engine missing (S02)" for
 * EPIC-30 Document Retention.
 *
 * Documents in an HR system fall into a small set of categories
 * that drive retention policy, ACL, and PII masking:
 *
 *   EMPLOYEE_CONTRACT           — retain 30 years post-separation
 *   PAYROLL_PAYSLIP             — retain 5 years
 *   PAYROLL_TAX_FILING          — retain 7 years
 *   IDENTITY_DOCUMENT           — retain until 2 years post-separation, PII-restricted
 *   MEDICAL_DOCUMENT            — retain 5 years, restricted
 *   PERFORMANCE_REVIEW          — retain 3 years
 *   GRIEVANCE_DISCIPLINARY      — retain 7 years post-event
 *   POLICY_ACKNOWLEDGEMENT      — retain 7 years
 *   STATUTORY_FILING            — retain 10 years
 *   OTHER                       — retain 3 years
 *
 * This service classifies a document by mime-type + filename +
 * caller-supplied hints, then returns the typed category and the
 * matching RetentionPolicy. Pure logic, no IO — DB-driven helpers
 * (e.g. classifyAndPersist) are thin wrappers.
 */

export type DocumentCategory =
  | 'EMPLOYEE_CONTRACT'
  | 'PAYROLL_PAYSLIP'
  | 'PAYROLL_TAX_FILING'
  | 'IDENTITY_DOCUMENT'
  | 'MEDICAL_DOCUMENT'
  | 'PERFORMANCE_REVIEW'
  | 'GRIEVANCE_DISCIPLINARY'
  | 'POLICY_ACKNOWLEDGEMENT'
  | 'STATUTORY_FILING'
  | 'OTHER';

export interface RetentionPolicy {
  category: DocumentCategory;
  retentionYears: number;
  /** True when retention starts on separation, not on creation. */
  retainFromSeparation: boolean;
  /** Recommended ACL for the document. */
  acl: 'PUBLIC' | 'EMPLOYEE_OWNED' | 'HR_RESTRICTED' | 'LEGAL_RESTRICTED';
  /** Whether PII masking should be applied for non-owner viewers. */
  piiMasked: boolean;
}

export const RETENTION_POLICIES: Record<DocumentCategory, RetentionPolicy> = {
  EMPLOYEE_CONTRACT: {
    category: 'EMPLOYEE_CONTRACT',
    retentionYears: 30,
    retainFromSeparation: true,
    acl: 'HR_RESTRICTED',
    piiMasked: true,
  },
  PAYROLL_PAYSLIP: {
    category: 'PAYROLL_PAYSLIP',
    retentionYears: 5,
    retainFromSeparation: false,
    acl: 'EMPLOYEE_OWNED',
    piiMasked: true,
  },
  PAYROLL_TAX_FILING: {
    category: 'PAYROLL_TAX_FILING',
    retentionYears: 7,
    retainFromSeparation: false,
    acl: 'HR_RESTRICTED',
    piiMasked: true,
  },
  IDENTITY_DOCUMENT: {
    category: 'IDENTITY_DOCUMENT',
    retentionYears: 2,
    retainFromSeparation: true,
    acl: 'LEGAL_RESTRICTED',
    piiMasked: true,
  },
  MEDICAL_DOCUMENT: {
    category: 'MEDICAL_DOCUMENT',
    retentionYears: 5,
    retainFromSeparation: false,
    acl: 'LEGAL_RESTRICTED',
    piiMasked: true,
  },
  PERFORMANCE_REVIEW: {
    category: 'PERFORMANCE_REVIEW',
    retentionYears: 3,
    retainFromSeparation: false,
    acl: 'HR_RESTRICTED',
    piiMasked: false,
  },
  GRIEVANCE_DISCIPLINARY: {
    category: 'GRIEVANCE_DISCIPLINARY',
    retentionYears: 7,
    retainFromSeparation: false,
    acl: 'LEGAL_RESTRICTED',
    piiMasked: true,
  },
  POLICY_ACKNOWLEDGEMENT: {
    category: 'POLICY_ACKNOWLEDGEMENT',
    retentionYears: 7,
    retainFromSeparation: false,
    acl: 'HR_RESTRICTED',
    piiMasked: false,
  },
  STATUTORY_FILING: {
    category: 'STATUTORY_FILING',
    retentionYears: 10,
    retainFromSeparation: false,
    acl: 'HR_RESTRICTED',
    piiMasked: false,
  },
  OTHER: {
    category: 'OTHER',
    retentionYears: 3,
    retainFromSeparation: false,
    acl: 'HR_RESTRICTED',
    piiMasked: false,
  },
};

export interface ClassificationInput {
  filename: string;
  mimeType?: string;
  /** Caller-supplied hint about provenance — typically the upload widget context. */
  source?: string;
}

export interface ClassificationResult {
  category: DocumentCategory;
  retention: RetentionPolicy;
  /** Source signal that won — for telemetry / explainability. */
  matchedOn: 'source' | 'filename' | 'mimeType' | 'fallback';
}

const FILENAME_RULES: Array<{ re: RegExp; category: DocumentCategory }> = [
  { re: /payslip|pay[-_]slip|salary[-_]slip|wage[-_]statement/i, category: 'PAYROLL_PAYSLIP' },
  { re: /contract|employment[-_]agreement|offer[-_]letter/i, category: 'EMPLOYEE_CONTRACT' },
  {
    re: /passport|emirates[-_]?id|national[-_]?id|iqama|residence[-_]permit/i,
    category: 'IDENTITY_DOCUMENT',
  },
  {
    re: /medical|fitness[-_]certificate|sick[-_]note|health[-_]check/i,
    category: 'MEDICAL_DOCUMENT',
  },
  { re: /appraisal|performance[-_]review|kpi[-_]review|pmcycle/i, category: 'PERFORMANCE_REVIEW' },
  {
    re: /grievance|disciplinary|warning[-_]letter|investigation/i,
    category: 'GRIEVANCE_DISCIPLINARY',
  },
  { re: /policy[-_]ack|policy[-_]acknowledg/i, category: 'POLICY_ACKNOWLEDGEMENT' },
  {
    re: /wps|gosi|gpssa|pasi|nitaqat|statutory[-_]filing|tax[-_]return/i,
    category: 'STATUTORY_FILING',
  },
  { re: /tax[-_]filing|annual[-_]return|w2|p60/i, category: 'PAYROLL_TAX_FILING' },
];

const SOURCE_RULES: Record<string, DocumentCategory> = {
  PAYROLL_PAYSLIP_UPLOAD: 'PAYROLL_PAYSLIP',
  EMPLOYEE_CONTRACT_UPLOAD: 'EMPLOYEE_CONTRACT',
  WPS_SUBMISSION: 'STATUTORY_FILING',
  GOSI_FILING: 'STATUTORY_FILING',
  GPSSA_FILING: 'STATUTORY_FILING',
  POLICY_ACK_UPLOAD: 'POLICY_ACKNOWLEDGEMENT',
  IDENTITY_DOC_UPLOAD: 'IDENTITY_DOCUMENT',
  MEDICAL_FITNESS_UPLOAD: 'MEDICAL_DOCUMENT',
};

export function classifyDocument(input: ClassificationInput): ClassificationResult {
  if (input.source && SOURCE_RULES[input.source]) {
    const category = SOURCE_RULES[input.source];
    return { category, retention: RETENTION_POLICIES[category], matchedOn: 'source' };
  }
  const name = input.filename ?? '';
  for (const r of FILENAME_RULES) {
    if (r.re.test(name)) {
      return {
        category: r.category,
        retention: RETENTION_POLICIES[r.category],
        matchedOn: 'filename',
      };
    }
  }
  // mimeType heuristic — PDFs default to OTHER unless a more specific rule matched.
  return {
    category: 'OTHER',
    retention: RETENTION_POLICIES.OTHER,
    matchedOn: 'fallback',
  };
}

/**
 * Compute when this document becomes eligible for retention-policy-
 * driven deletion. Inputs are the create / separation dates the
 * caller has on hand.
 */
export function retentionExpiryDate(
  result: ClassificationResult,
  input: { createdAt: Date; separationDate?: Date }
): Date {
  const start =
    result.retention.retainFromSeparation && input.separationDate
      ? input.separationDate
      : input.createdAt;
  const expiry = new Date(start);
  expiry.setFullYear(expiry.getFullYear() + result.retention.retentionYears);
  return expiry;
}
