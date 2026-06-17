/**
 * Default checklist + risk seeds for the 5 Theme C domains.
 *
 * Each seed list is intentionally small (5–8 items per domain) — it
 * represents the minimum bar from the handbook; tenants will customise
 * the lists during go-live via the dashboard.
 */

export interface ChecklistSeed {
  categoryCode: string;
  itemCode: string;
  label: string;
  expectedBehavior: string;
  evidenceRequirement: string;
  ownerRole: string;
  isMandatory: boolean;
}

export interface RiskSeed {
  riskCode: string;
  title: string;
  description: string;
  category: string;
  likelihood: number; // 1–5
  impact: number; // 1–5
  ownerRole: string;
  controlRef: string;
}

export const ER_CHECKLIST: ChecklistSeed[] = [
  {
    categoryCode: 'INTAKE',
    itemCode: 'ER-CHK-01',
    label: 'Multi-channel grievance intake (email, portal, hotline) operational',
    expectedBehavior: 'All 4 intake channels accept submissions and route to triage',
    evidenceRequirement: 'Channel test logs + triage routing screenshot',
    ownerRole: 'ER_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'TRIAGE',
    itemCode: 'ER-CHK-02',
    label: 'Severity & confidentiality classification applied within 24h of intake',
    expectedBehavior: 'Every case has severity + confidentiality set inside SLA',
    evidenceRequirement: 'Case register export with timestamps',
    ownerRole: 'ER_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'WHISTLEBLOWER',
    itemCode: 'ER-CHK-03',
    label: 'Whistleblower confidentiality controls reviewed quarterly',
    expectedBehavior: 'Access list reviewed and signed by HR + Legal each quarter',
    evidenceRequirement: 'Quarterly review attestation',
    ownerRole: 'COMPLIANCE_OFFICER',
    isMandatory: true,
  },
  {
    categoryCode: 'SLA',
    itemCode: 'ER-CHK-04',
    label: 'SLA breach escalation operating without backlog',
    expectedBehavior: 'No open grievance > SLA without explicit escalation note',
    evidenceRequirement: 'SLA breach register',
    ownerRole: 'ER_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'APPEAL',
    itemCode: 'ER-CHK-05',
    label: 'Appeals process documented and accessible to all employees',
    expectedBehavior: 'Policy published, acknowledged ≥ 90%',
    evidenceRequirement: 'Policy acknowledgement report',
    ownerRole: 'HR_HEAD',
    isMandatory: true,
  },
];

export const ER_RISKS: RiskSeed[] = [
  {
    riskCode: 'ER-RSK-01',
    title: 'Retaliation against whistleblowers',
    description:
      'Failure to protect anonymity may discourage reporting and trigger regulator action',
    category: 'CULTURE',
    likelihood: 3,
    impact: 5,
    ownerRole: 'HR_HEAD',
    controlRef: 'Whistleblower policy + confidentiality controls',
  },
  {
    riskCode: 'ER-RSK-02',
    title: 'SLA breaches on high-severity grievances',
    description: 'Missing the labour-court referral window may invalidate employer position',
    category: 'OPERATIONAL',
    likelihood: 3,
    impact: 4,
    ownerRole: 'ER_LEAD',
    controlRef: 'SLA engine + escalation rules',
  },
  {
    riskCode: 'ER-RSK-03',
    title: 'Inconsistent severity classification',
    description: 'Cross-team disparity dilutes risk reporting',
    category: 'GOVERNANCE',
    likelihood: 4,
    impact: 3,
    ownerRole: 'ER_LEAD',
    controlRef: 'Severity matrix + reviewer calibration',
  },
];

export const DISCIPLINARY_CHECKLIST: ChecklistSeed[] = [
  {
    categoryCode: 'INVESTIGATION',
    itemCode: 'DSC-CHK-01',
    label: 'Investigation evidence captured before action issued',
    expectedBehavior: 'No action issued without prior investigation record',
    evidenceRequirement: 'Investigation register link on each action',
    ownerRole: 'ER_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'HEARING',
    itemCode: 'DSC-CHK-02',
    label: 'Pre-action hearing held with employee right-to-respond',
    expectedBehavior: 'Hearing minutes signed by employee or attempted-service evidence',
    evidenceRequirement: 'Signed hearing record',
    ownerRole: 'ER_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'PENALTY_MATRIX',
    itemCode: 'DSC-CHK-03',
    label: 'Penalty matrix consulted; deviation has documented rationale',
    expectedBehavior: 'Action class within matrix unless rationale recorded',
    evidenceRequirement: 'Matrix lookup + rationale field',
    ownerRole: 'HR_HEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'SALARY_DEDUCTION',
    itemCode: 'DSC-CHK-04',
    label: 'Salary deductions stay within country-specific monthly cap',
    expectedBehavior: 'Deduction ≤ statutory % of basic salary',
    evidenceRequirement: 'Payroll deduction report',
    ownerRole: 'PAYROLL_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'NOTIFICATION',
    itemCode: 'DSC-CHK-05',
    label: 'Action notification served bilingually and acknowledged',
    expectedBehavior: 'En + Ar notice delivered with delivery proof',
    evidenceRequirement: 'Delivery receipts on file',
    ownerRole: 'ER_LEAD',
    isMandatory: true,
  },
];

export const DISCIPLINARY_RISKS: RiskSeed[] = [
  {
    riskCode: 'DSC-RSK-01',
    title: 'Termination without due-process hearing',
    description: 'Skipping the hearing exposes employer to reinstatement / damages',
    category: 'LEGAL',
    likelihood: 2,
    impact: 5,
    ownerRole: 'HR_HEAD',
    controlRef: 'DRAFT → ISSUED gate requires hearingHeld',
  },
  {
    riskCode: 'DSC-RSK-02',
    title: 'Salary deduction exceeds statutory cap',
    description: 'Breach of labour-law salary protection clauses',
    category: 'COMPLIANCE',
    likelihood: 2,
    impact: 4,
    ownerRole: 'PAYROLL_LEAD',
    controlRef: 'Country-specific deduction cap configured',
  },
];

export const SEPARATION_CHECKLIST: ChecklistSeed[] = [
  {
    categoryCode: 'NOTICE',
    itemCode: 'SEP-CHK-01',
    label: 'Notice period served per contract / labour-law minimum',
    expectedBehavior: 'Notice days served or compensated in lieu',
    evidenceRequirement: 'Notice calculation + acknowledgement',
    ownerRole: 'HR_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'CLEARANCE',
    itemCode: 'SEP-CHK-02',
    label: 'Exit clearance signed by HR / IT / Finance / Security / LM / Admin',
    expectedBehavior: 'All 6 departments signed off before final settlement',
    evidenceRequirement: 'Clearance form copy',
    ownerRole: 'HR_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'ITDP',
    itemCode: 'SEP-CHK-03',
    label: 'IT access fully revoked by separation date',
    expectedBehavior: 'No login activity post separation',
    evidenceRequirement: 'IT access audit log',
    ownerRole: 'IT_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'FINAL_SETTLEMENT',
    itemCode: 'SEP-CHK-04',
    label: 'Final settlement paid within statutory window',
    expectedBehavior: 'Payment date ≤ statutory final-settlement deadline',
    evidenceRequirement: 'Bank payment evidence',
    ownerRole: 'PAYROLL_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'IMMIGRATION_LINK',
    itemCode: 'SEP-CHK-05',
    label: 'Visa cancellation case opened for expat separations',
    expectedBehavior: 'visaExitCaseId set on separation case',
    evidenceRequirement: 'Visa-exit case link',
    ownerRole: 'IMMIGRATION_LEAD',
    isMandatory: true,
  },
];

export const SEPARATION_RISKS: RiskSeed[] = [
  {
    riskCode: 'SEP-RSK-01',
    title: 'Late final settlement triggers statutory penalty',
    description: 'Each country has a final-pay deadline (typically 14 days) — delay carries fines',
    category: 'COMPLIANCE',
    likelihood: 3,
    impact: 4,
    ownerRole: 'PAYROLL_LEAD',
    controlRef: 'Final settlement SLA tracker',
  },
  {
    riskCode: 'SEP-RSK-02',
    title: 'IT access lingering after separation',
    description: 'Open access risks data exfiltration and audit failure',
    category: 'SECURITY',
    likelihood: 3,
    impact: 4,
    ownerRole: 'IT_LEAD',
    controlRef: 'itAccessOpenAfterClose gate',
  },
];

export const EOSB_CHECKLIST: ChecklistSeed[] = [
  {
    categoryCode: 'FORMULA',
    itemCode: 'EOSB-CHK-01',
    label: 'Formula version matches country active rule pack',
    expectedBehavior: 'EOSB calc cites the active rule pack version',
    evidenceRequirement: 'Calc detail showing rule pack version',
    ownerRole: 'COMPLIANCE_OFFICER',
    isMandatory: true,
  },
  {
    categoryCode: 'BASIS',
    itemCode: 'EOSB-CHK-02',
    label: 'Salary basis (basic-only vs total) matches statute',
    expectedBehavior: 'Basis flag matches country rule',
    evidenceRequirement: 'Calc detail basis field',
    ownerRole: 'PAYROLL_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'SI_NETTING',
    itemCode: 'EOSB-CHK-03',
    label: 'Social insurance pension offset applied where required',
    expectedBehavior: 'socialInsuranceOffset captured where SI scheme exists',
    evidenceRequirement: 'Calc detail offset field',
    ownerRole: 'PAYROLL_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'ACCRUAL',
    itemCode: 'EOSB-CHK-04',
    label: 'Monthly accrual posted to GL on cut-off',
    expectedBehavior: 'EosbAccrual snapshot created each month with GL post',
    evidenceRequirement: 'Accrual register + GL post receipt',
    ownerRole: 'FINANCE_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'DISPUTE',
    itemCode: 'EOSB-CHK-05',
    label: 'Disputes investigated within SLA',
    expectedBehavior: 'No open dispute > SLA without escalation',
    evidenceRequirement: 'Dispute register export',
    ownerRole: 'HR_LEAD',
    isMandatory: true,
  },
];

export const EOSB_RISKS: RiskSeed[] = [
  {
    riskCode: 'EOSB-RSK-01',
    title: 'Wrong salary basis (basic-only vs total)',
    description: 'Country rules differ — using the wrong basis under/overpays the EOSB',
    category: 'COMPLIANCE',
    likelihood: 3,
    impact: 5,
    ownerRole: 'PAYROLL_LEAD',
    controlRef: 'Per-country formula registry',
  },
  {
    riskCode: 'EOSB-RSK-02',
    title: 'GL accrual gap',
    description: 'Missing monthly accrual creates settlement-month spike and audit finding',
    category: 'FINANCIAL',
    likelihood: 2,
    impact: 4,
    ownerRole: 'FINANCE_LEAD',
    controlRef: 'Monthly accrual job',
  },
];

export const VISA_EXIT_CHECKLIST: ChecklistSeed[] = [
  {
    categoryCode: 'SCENARIO',
    itemCode: 'VEX-CHK-01',
    label: 'Correct exit scenario picked (CANCEL / TRANSFER / ABSCONDING etc.)',
    expectedBehavior: 'Scenario drives the PRO action set',
    evidenceRequirement: 'Case open log',
    ownerRole: 'IMMIGRATION_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'PRO_ACTIONS',
    itemCode: 'VEX-CHK-02',
    label: 'PRO actions completed in sequence',
    expectedBehavior: 'No action skipped without rationale',
    evidenceRequirement: 'PRO action register',
    ownerRole: 'PRO_OFFICER',
    isMandatory: true,
  },
  {
    categoryCode: 'GRACE',
    itemCode: 'VEX-CHK-03',
    label: 'Grace period started & monitored',
    expectedBehavior: 'Grace period record opened on cancellation',
    evidenceRequirement: 'Grace register entry',
    ownerRole: 'IMMIGRATION_LEAD',
    isMandatory: true,
  },
  {
    categoryCode: 'EVIDENCE',
    itemCode: 'VEX-CHK-04',
    label: 'Authority portal evidence captured',
    expectedBehavior: 'Cancellation receipts on file for every closed case',
    evidenceRequirement: 'Portal evidence URL',
    ownerRole: 'PRO_OFFICER',
    isMandatory: true,
  },
  {
    categoryCode: 'DEPENDENTS',
    itemCode: 'VEX-CHK-05',
    label: 'Dependents cascade closed',
    expectedBehavior: 'Each dependent visa cancellation recorded',
    evidenceRequirement: 'Dependent register',
    ownerRole: 'IMMIGRATION_LEAD',
    isMandatory: true,
  },
];

export const VISA_EXIT_RISKS: RiskSeed[] = [
  {
    riskCode: 'VEX-RSK-01',
    title: 'Grace period expiry without closure',
    description: 'Lapsed visa exposes employer to fines and individual deportation risk',
    category: 'COMPLIANCE',
    likelihood: 3,
    impact: 4,
    ownerRole: 'IMMIGRATION_LEAD',
    controlRef: 'Grace register + ladder alerts',
  },
  {
    riskCode: 'VEX-RSK-02',
    title: 'Authority evidence gaps',
    description: 'Without receipts the cancellation cannot be evidenced in audit',
    category: 'COMPLIANCE',
    likelihood: 2,
    impact: 4,
    ownerRole: 'PRO_OFFICER',
    controlRef: 'Evidence vault',
  },
];

export const DEFAULT_SEEDS: Record<string, { checklist: ChecklistSeed[]; risks: RiskSeed[] }> = {
  ER: { checklist: ER_CHECKLIST, risks: ER_RISKS },
  DISCIPLINARY: { checklist: DISCIPLINARY_CHECKLIST, risks: DISCIPLINARY_RISKS },
  SEPARATION: { checklist: SEPARATION_CHECKLIST, risks: SEPARATION_RISKS },
  EOSB: { checklist: EOSB_CHECKLIST, risks: EOSB_RISKS },
  VISA_EXIT: { checklist: VISA_EXIT_CHECKLIST, risks: VISA_EXIT_RISKS },
};

export const SUPPORTED_DOMAINS = Object.keys(DEFAULT_SEEDS);
