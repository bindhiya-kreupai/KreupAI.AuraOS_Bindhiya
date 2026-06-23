/**
 * EPIC-34 per-domain configuration workspaces (S03–S20, S24).
 *
 * Each workspace is a thin descriptor that the registry uses to expose
 * a typed surface for the dashboard. The actual records live in
 * HrmsConfigObject under a (domainCode, objectKey) pair; the per-domain
 * service simply lists them by `domainCode` and renders the payload.
 *
 * Stories covered (one workspace each):
 *   S03  LEGAL_ENTITY            S13  ATTENDANCE
 *   S04  EMPLOYEE_DATA_DICT      S14  BENEFITS
 *   S05  POSITION_RULES          S15  ACCOMMODATION
 *   S06  CONTRACT_TEMPLATE       S16  HSE
 *   S07a PAYROLL_COMPONENT       S17  ER_MATRIX
 *   S07b PAYROLL_CALENDAR        S18  SEPARATION
 *   S07c PRORATION_RULE          S19  EOSB_FORMULA
 *   S07d GL_MAPPING              S20  DOCUMENT_RETENTION
 *   S08  WPS_MAPPING             S24  RBAC_SCOPE
 *   S09  SOCIAL_INSURANCE
 *   S10  NATIONALISATION
 *   S11  IMMIGRATION
 *   S12  LEAVE
 */

export interface WorkspaceDescriptor {
  storyId: string;
  domainCode: string;
  label: string;
  description: string;
  objectTypes: string[];
  defaultObjectType: string;
  targetModelHint?: string;
}

export const HRMS_WORKSPACES: WorkspaceDescriptor[] = [
  {
    storyId: 'EPIC-34-S03',
    domainCode: 'LEGAL_ENTITY',
    label: 'Legal Entity Config',
    description:
      'Per-entity overrides for currency, fiscal year, statutory IDs, base country, default GL.',
    objectTypes: ['LEGAL_ENTITY_PROFILE'],
    defaultObjectType: 'LEGAL_ENTITY_PROFILE',
    targetModelHint: 'GccLegalEntity',
  },
  {
    storyId: 'EPIC-34-S04',
    domainCode: 'EMPLOYEE_DATA_DICTIONARY',
    label: 'Employee Master Data Dictionary',
    description:
      'Field-level governance: required, sensitive, regex, allowed values, retention, audit category.',
    objectTypes: ['FIELD_DEFINITION', 'PII_CATEGORY'],
    defaultObjectType: 'FIELD_DEFINITION',
  },
  {
    storyId: 'EPIC-34-S05',
    domainCode: 'POSITION_RULES',
    label: 'Position / Org Rule Config',
    description: 'Headcount control rules, position approval gates, grade-to-position mapping.',
    objectTypes: ['POSITION_RULE'],
    defaultObjectType: 'POSITION_RULE',
    targetModelHint: 'OrgPositionControl',
  },
  {
    storyId: 'EPIC-34-S06',
    domainCode: 'CONTRACT_TEMPLATE',
    label: 'Contract Template Library',
    description: 'Country-aware contract clauses, mandatory sections, e-sign template links.',
    objectTypes: ['CLAUSE', 'TEMPLATE'],
    defaultObjectType: 'TEMPLATE',
  },
  {
    storyId: 'EPIC-34-S07a',
    domainCode: 'PAYROLL_COMPONENT',
    label: 'Pay Component Catalogue',
    description: 'Pay components with statutory base inclusion, taxability, GL hint, country flag.',
    objectTypes: ['EARNING', 'DEDUCTION', 'STATUTORY'],
    defaultObjectType: 'EARNING',
  },
  {
    storyId: 'EPIC-34-S07b',
    domainCode: 'PAYROLL_CALENDAR',
    label: 'Payroll Calendar',
    description: 'Per-country payroll periods, cut-off dates, lock dates, off-cycle policy.',
    objectTypes: ['PERIOD', 'CUTOFF'],
    defaultObjectType: 'PERIOD',
  },
  {
    storyId: 'EPIC-34-S07c',
    domainCode: 'PRORATION_RULE',
    label: 'Proration Rule',
    description: 'Joiner / leaver / mid-period change proration formula per pay component.',
    objectTypes: ['PRORATION_FORMULA'],
    defaultObjectType: 'PRORATION_FORMULA',
  },
  {
    storyId: 'EPIC-34-S07d',
    domainCode: 'GL_MAPPING',
    label: 'GL Account Mapping',
    description: 'Pay component → GL account & cost-centre, per legal entity.',
    objectTypes: ['GL_MAP'],
    defaultObjectType: 'GL_MAP',
  },
  {
    storyId: 'EPIC-34-S08',
    domainCode: 'WPS_MAPPING',
    label: 'WPS / Mudad File Mapping',
    description: 'SIF column → pay component mapping, fixed-width offsets, header / trailer rules.',
    objectTypes: ['SIF_LAYOUT', 'MUDAD_LAYOUT'],
    defaultObjectType: 'SIF_LAYOUT',
  },
  {
    storyId: 'EPIC-34-S09',
    domainCode: 'SOCIAL_INSURANCE',
    label: 'Social Insurance Config',
    description: 'Unified GOSI / GPSSA / SIO contribution bases, ceilings, branch flags.',
    objectTypes: ['GOSI', 'GPSSA', 'SIO'],
    defaultObjectType: 'GOSI',
  },
  {
    storyId: 'EPIC-34-S10',
    domainCode: 'NATIONALISATION',
    label: 'Nationalisation Targets',
    description: 'Unified Nitaqat / Emiratisation / Bahrainisation / Omanisation target & quota.',
    objectTypes: ['NITAQAT', 'EMIRATISATION', 'BAHRAINISATION', 'OMANISATION'],
    defaultObjectType: 'NITAQAT',
  },
  {
    storyId: 'EPIC-34-S11',
    domainCode: 'IMMIGRATION',
    label: 'Immigration Config',
    description: 'Visa categories, permit rules, sponsor matrix, document validity per country.',
    objectTypes: ['VISA_CATEGORY', 'PERMIT_RULE', 'SPONSOR'],
    defaultObjectType: 'PERMIT_RULE',
  },
  {
    storyId: 'EPIC-34-S12',
    domainCode: 'LEAVE',
    label: 'Leave Config',
    description: 'Country-aware leave policies, entitlement rules, accrual schedules.',
    objectTypes: ['POLICY', 'ENTITLEMENT_RULE'],
    defaultObjectType: 'POLICY',
    targetModelHint: 'LeavePolicy',
  },
  {
    storyId: 'EPIC-34-S13',
    domainCode: 'ATTENDANCE',
    label: 'Attendance / OT Config',
    description: 'Attendance + overtime policies with grade & country variants.',
    objectTypes: ['ATTENDANCE_POLICY', 'OT_POLICY'],
    defaultObjectType: 'ATTENDANCE_POLICY',
    targetModelHint: 'AttendancePolicy',
  },
  {
    storyId: 'EPIC-34-S14',
    domainCode: 'BENEFITS',
    label: 'Benefits Config',
    description: 'Benefit plan eligibility, coverage tiers, accrual rules.',
    objectTypes: ['PLAN', 'ELIGIBILITY'],
    defaultObjectType: 'PLAN',
  },
  {
    storyId: 'EPIC-34-S15',
    domainCode: 'ACCOMMODATION',
    label: 'Accommodation Config',
    description: 'Housing categories, allowances, occupancy limits per site type.',
    objectTypes: ['HOUSING_CATEGORY', 'ALLOWANCE'],
    defaultObjectType: 'HOUSING_CATEGORY',
  },
  {
    storyId: 'EPIC-34-S16',
    domainCode: 'HSE',
    label: 'HSE Config',
    description: 'Incident categories, PPE matrix, training cadence.',
    objectTypes: ['INCIDENT_CATEGORY', 'PPE_MATRIX', 'TRAINING_CADENCE'],
    defaultObjectType: 'INCIDENT_CATEGORY',
  },
  {
    storyId: 'EPIC-34-S17',
    domainCode: 'ER_MATRIX',
    label: 'ER / Disciplinary Matrix',
    description: 'Offence → disciplinary action mapping with escalation tiers.',
    objectTypes: ['OFFENCE_ACTION', 'ESCALATION'],
    defaultObjectType: 'OFFENCE_ACTION',
  },
  {
    storyId: 'EPIC-34-S18',
    domainCode: 'SEPARATION',
    label: 'Separation / Final Settlement Config',
    description: 'Reason codes, clearance steps, gating rules per separation type.',
    objectTypes: ['REASON_CODE', 'CLEARANCE_STEP'],
    defaultObjectType: 'REASON_CODE',
  },
  {
    storyId: 'EPIC-34-S19',
    domainCode: 'EOSB_FORMULA',
    label: 'EOSB Formula Registry',
    description: 'Per-country EOSB formula with effective-date and citation.',
    objectTypes: ['FORMULA'],
    defaultObjectType: 'FORMULA',
  },
  {
    storyId: 'EPIC-34-S20',
    domainCode: 'DOCUMENT_RETENTION',
    label: 'Document Retention Config',
    description: 'Per record type × country retention years, classification, disposal workflow.',
    objectTypes: ['RETENTION_RULE'],
    defaultObjectType: 'RETENTION_RULE',
    targetModelHint: 'DocRetentionSchedule',
  },
  {
    storyId: 'EPIC-34-S24',
    domainCode: 'RBAC_SCOPE',
    label: 'RBAC Scope Config',
    description: 'GccRoleScope → data-row filter binding (entity / country / department).',
    objectTypes: ['SCOPE_BINDING'],
    defaultObjectType: 'SCOPE_BINDING',
  },
];

export function findWorkspaceByDomain(domainCode: string): WorkspaceDescriptor | null {
  return HRMS_WORKSPACES.find((w) => w.domainCode === domainCode) ?? null;
}
