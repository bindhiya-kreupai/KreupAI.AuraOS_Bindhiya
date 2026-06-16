/**
 * EPIC-37 seed templates — materializes the A3–A6 handbook checklist suite
 * as configurable templates. Each template covers a domain with its items;
 * red-flag rule bindings make items auto-evaluable.
 */

export interface ItemSeed {
  code: string;
  controlObjective: string;
  description: string;
  evidenceRequired?: boolean;
  isMandatory?: boolean;
  weighting?: number;
  redFlagRuleCode?: string;
}

export interface TemplateSeed {
  code: string;
  name: string;
  domain: string;
  appendixRef: string;
  description: string;
  ownerRole: string;
  approverRole: string;
  reviewCadence: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  items: ItemSeed[];
}

export const TEMPLATE_SEEDS: TemplateSeed[] = [
  // ---- A3.4 Employee File ----
  {
    code: 'CHK_EMPLOYEE_FILE',
    name: 'Employee File Compliance Checklist',
    domain: 'HR_RECORDS',
    appendixRef: 'A3.4',
    description: 'Verifies completeness of personnel file documents.',
    ownerRole: 'HR_ADMIN',
    approverRole: 'COMPLIANCE_OFFICER',
    reviewCadence: 'QUARTERLY',
    items: [
      {
        code: 'EF_CONTRACT',
        controlObjective: 'Signed employment contract on file',
        description: 'Original / e-signed contract retained.',
        weighting: 3,
        redFlagRuleCode: 'RF_MISSING_CONTRACT',
      },
      {
        code: 'EF_PASSPORT_COPY',
        controlObjective: 'Valid passport copy on file',
        description: 'Passport copy with > 6 months validity.',
        redFlagRuleCode: 'RF_PASSPORT_EXPIRING',
      },
      {
        code: 'EF_VISA_COPY',
        controlObjective: 'Valid visa / residence permit',
        description: 'Visa / residence permit copy current.',
        weighting: 3,
        redFlagRuleCode: 'RF_VISA_EXPIRING',
      },
      {
        code: 'EF_EMIRATES_ID',
        controlObjective: 'National ID / Emirates ID on file',
        description: 'National ID copy current.',
        redFlagRuleCode: 'RF_NATIONAL_ID_EXPIRING',
      },
      {
        code: 'EF_OFFER_ACCEPTANCE',
        controlObjective: 'Offer-letter acceptance evidence',
        description: 'Signed acceptance archived.',
      },
      {
        code: 'EF_MEDICAL_CERT',
        controlObjective: 'Medical fitness certificate',
        description: 'Pre-employment medical certificate.',
      },
    ],
  },
  // ---- A3.7 Payroll Master ----
  {
    code: 'CHK_PAYROLL_MASTER',
    name: 'Monthly Payroll Master Checklist',
    domain: 'PAYROLL',
    appendixRef: 'A3.7 / A4.3',
    description: 'Master payroll-cycle pre-lock checklist.',
    ownerRole: 'PAYROLL_OFFICER',
    approverRole: 'HR_MANAGER',
    reviewCadence: 'MONTHLY',
    items: [
      {
        code: 'PAY_INPUTS_LOCKED',
        controlObjective: 'All payroll inputs locked',
        description: 'Earnings, deductions, advances locked.',
        weighting: 3,
      },
      {
        code: 'PAY_NEW_JOINERS_PROCESSED',
        controlObjective: 'New joiners processed',
        description: 'All in-period new joiners on payroll.',
      },
      {
        code: 'PAY_EXITS_SETTLED',
        controlObjective: 'Exits final-settled',
        description: 'EOSB and dues calculated.',
        redFlagRuleCode: 'RF_FINAL_SETTLEMENT_LATE',
      },
      {
        code: 'PAY_ON_TIME',
        controlObjective: 'Salary credited within statutory window',
        description: 'Country WPS / payment window respected.',
        weighting: 3,
        redFlagRuleCode: 'RF_SALARY_DELAY',
      },
      {
        code: 'PAY_RECONCILED',
        controlObjective: 'Payroll-to-GL reconciliation complete',
        description: 'Run total reconciled to GL.',
        weighting: 2,
        redFlagRuleCode: 'RF_RECON_BREAK',
      },
    ],
  },
  // ---- A3.8 WPS / Mudad ----
  {
    code: 'CHK_WPS',
    name: 'Wage Protection / WPS Checklist',
    domain: 'WPS',
    appendixRef: 'A3.8 / A4.15 / A4.16',
    description: 'WPS / Mudad submission readiness.',
    ownerRole: 'PAYROLL_OFFICER',
    approverRole: 'COMPLIANCE_OFFICER',
    reviewCadence: 'MONTHLY',
    items: [
      {
        code: 'WPS_FILE_GENERATED',
        controlObjective: 'WPS file generated',
        description: 'Country-correct SIF / Mudad file produced.',
        weighting: 3,
      },
      {
        code: 'WPS_FILE_SUBMITTED',
        controlObjective: 'WPS file submitted within statutory window',
        description: 'Acknowledgement from authority on file.',
        weighting: 3,
        redFlagRuleCode: 'RF_WPS_LATE',
      },
      {
        code: 'WPS_IBANS_VALID',
        controlObjective: 'All IBANs / bank accounts valid',
        description: 'No rejected entries.',
        redFlagRuleCode: 'RF_IBAN_REJECTION',
      },
    ],
  },
  // ---- A3.9 Social Insurance ----
  {
    code: 'CHK_SOCIAL_INSURANCE',
    name: 'Social Insurance Compliance Checklist',
    domain: 'SOCIAL_INSURANCE',
    appendixRef: 'A3.9 / A4.17',
    description: 'GOSI / GPSSA / SIO / PASI / PIFSS / GRSIA monthly verification.',
    ownerRole: 'PAYROLL_OFFICER',
    approverRole: 'COMPLIANCE_OFFICER',
    reviewCadence: 'MONTHLY',
    items: [
      {
        code: 'SI_REGISTRATIONS_CURRENT',
        controlObjective: 'All eligible employees registered',
        description: 'New joiners enrolled within statutory window.',
        weighting: 3,
        redFlagRuleCode: 'RF_SI_REGISTRATION_GAP',
      },
      {
        code: 'SI_FILING_FILED',
        controlObjective: 'Monthly SI filing submitted on time',
        description: 'Authority acknowledgement obtained.',
        weighting: 3,
        redFlagRuleCode: 'RF_SI_FILING_LATE',
      },
      {
        code: 'SI_RECONCILED',
        controlObjective: 'Contribution amounts reconciled',
        description: 'Payroll vs authority match.',
        redFlagRuleCode: 'RF_SI_MISMATCH',
      },
    ],
  },
  // ---- A3.10 Nationalization ----
  {
    code: 'CHK_NATIONALIZATION',
    name: 'Nationalization Compliance Checklist',
    domain: 'NATIONALIZATION',
    appendixRef: 'A3.10',
    description: 'Emiratisation / Nitaqat / Bahrainization / Omanisation status.',
    ownerRole: 'HR_MANAGER',
    approverRole: 'COMPLIANCE_OFFICER',
    reviewCadence: 'QUARTERLY',
    items: [
      {
        code: 'NAT_RATE_VS_TARGET',
        controlObjective: 'National rate at/above target',
        description: 'Programme target met for the period.',
        weighting: 3,
        redFlagRuleCode: 'RF_NATIONALIZATION_SHORTFALL',
      },
      {
        code: 'NAT_QUOTA_PLAN',
        controlObjective: 'Quota plan documented',
        description: 'Forward hiring plan against quota.',
        weighting: 2,
      },
    ],
  },
  // ---- A3.11 Immigration ----
  {
    code: 'CHK_IMMIGRATION',
    name: 'Immigration Compliance Checklist',
    domain: 'IMMIGRATION',
    appendixRef: 'A3.11 / A5.3',
    description: 'Visa, permit, ID and passport validity across the workforce.',
    ownerRole: 'PRO_OFFICER',
    approverRole: 'COMPLIANCE_OFFICER',
    reviewCadence: 'MONTHLY',
    items: [
      {
        code: 'IMM_VISA_VALID',
        controlObjective: 'All visas valid',
        description: 'No expired residence visa for active employees.',
        weighting: 3,
        redFlagRuleCode: 'RF_VISA_EXPIRED',
      },
      {
        code: 'IMM_WORK_PERMIT_VALID',
        controlObjective: 'All work permits valid',
        description: 'No expired permits for active staff.',
        weighting: 3,
        redFlagRuleCode: 'RF_WORK_PERMIT_EXPIRED',
      },
      {
        code: 'IMM_RENEWALS_TRACKED',
        controlObjective: 'Renewals scheduled ≥60 days ahead',
        description: 'PRO tracker maintained.',
        redFlagRuleCode: 'RF_RENEWAL_OVERDUE',
      },
      {
        code: 'IMM_PASSPORT_VALIDITY',
        controlObjective: 'Passport validity ≥ 6 months',
        description: 'No passport breaching min validity.',
        redFlagRuleCode: 'RF_PASSPORT_EXPIRING',
      },
    ],
  },
  // ---- A3.12 Leave ----
  {
    code: 'CHK_LEAVE',
    name: 'Leave Compliance Checklist',
    domain: 'LEAVE',
    appendixRef: 'A3.12',
    description: 'Annual leave entitlement and encashment compliance.',
    ownerRole: 'HR_ADMIN',
    approverRole: 'HR_MANAGER',
    reviewCadence: 'QUARTERLY',
    items: [
      {
        code: 'LV_STATUTORY_MIN',
        controlObjective: 'Entitlement ≥ statutory minimum',
        description: 'Country labour law minimum met.',
        weighting: 3,
        redFlagRuleCode: 'RF_LEAVE_BELOW_STATUTORY',
      },
      {
        code: 'LV_ENCASHMENT_ACCURATE',
        controlObjective: 'Encashment calculation accurate',
        description: 'Daily wage and accrual formula correct.',
      },
    ],
  },
  // ---- A3.13 Attendance / OT ----
  {
    code: 'CHK_ATTENDANCE_OT',
    name: 'Attendance and Overtime Compliance Checklist',
    domain: 'ATTENDANCE_OT',
    appendixRef: 'A3.13 / A4.10',
    description: 'Overtime cap and attendance integrity.',
    ownerRole: 'HR_MANAGER',
    approverRole: 'COMPLIANCE_OFFICER',
    reviewCadence: 'MONTHLY',
    items: [
      {
        code: 'AT_OT_WITHIN_CAP',
        controlObjective: 'No employee exceeded statutory OT cap',
        description: 'Country OT-cap respected.',
        weighting: 3,
        redFlagRuleCode: 'RF_OT_OVER_CAP',
      },
      {
        code: 'AT_MISSING_PUNCH_RESOLVED',
        controlObjective: 'Missing punches resolved',
        description: 'No unresolved missing punches at close.',
      },
    ],
  },
  // ---- A3.16 HSE ----
  {
    code: 'CHK_HSE',
    name: 'HSE Compliance Checklist',
    domain: 'HSE',
    appendixRef: 'A3.16',
    description: 'Health, safety and welfare basics.',
    ownerRole: 'COMPLIANCE_OFFICER',
    approverRole: 'COMPLIANCE_OFFICER',
    reviewCadence: 'QUARTERLY',
    items: [
      {
        code: 'HSE_TRAINING_COMPLETE',
        controlObjective: 'Mandatory HSE training complete',
        description: 'In-scope employees have current training.',
        weighting: 2,
        redFlagRuleCode: 'RF_HSE_TRAINING_OVERDUE',
      },
      {
        code: 'HSE_DRILLS',
        controlObjective: 'Required drills run on schedule',
        description: 'Fire / evacuation drills logged.',
      },
      {
        code: 'HSE_HEAT_STRESS',
        controlObjective: 'Heat-stress / midday-break compliance',
        description: 'Country regulations followed.',
      },
    ],
  },
  // ---- A3.19 Separation ----
  {
    code: 'CHK_SEPARATION',
    name: 'Separation Compliance Checklist',
    domain: 'SEPARATION',
    appendixRef: 'A3.19 / A4.18',
    description: 'Exit clearance and EOSB.',
    ownerRole: 'HR_ADMIN',
    approverRole: 'PAYROLL_OFFICER',
    reviewCadence: 'MONTHLY',
    items: [
      {
        code: 'SEP_EOSB_CALCULATED',
        controlObjective: 'EOSB calculated per country rule',
        description: 'Formula matches country rule-pack.',
        weighting: 3,
      },
      {
        code: 'SEP_FINAL_SETTLEMENT_TIMELY',
        controlObjective: 'Final settlement within statutory window',
        description: 'Country window respected.',
        weighting: 3,
        redFlagRuleCode: 'RF_FINAL_SETTLEMENT_LATE',
      },
      {
        code: 'SEP_VISA_CANCELLED',
        controlObjective: 'Visa cancellation actioned',
        description: 'PRO cancellation done within grace period.',
        redFlagRuleCode: 'RF_VISA_CANCELLATION_LATE',
      },
    ],
  },
  // ---- A6.3 Master HR Audit ----
  {
    code: 'CHK_MASTER_HR_AUDIT',
    name: 'Master HR Audit Checklist',
    domain: 'AUDIT',
    appendixRef: 'A6.3',
    description: 'Overall annual HR-compliance audit master.',
    ownerRole: 'INTERNAL_AUDITOR',
    approverRole: 'INTERNAL_AUDITOR',
    reviewCadence: 'ANNUAL',
    items: [
      {
        code: 'AUD_FILE',
        controlObjective: 'Employee files audited',
        description: 'Sample of files reviewed.',
      },
      {
        code: 'AUD_PAYROLL',
        controlObjective: 'Payroll audited',
        description: 'Pay run sample reviewed.',
      },
      {
        code: 'AUD_IMMIG',
        controlObjective: 'Immigration audited',
        description: 'Visas / permits sample reviewed.',
      },
      {
        code: 'AUD_NATIONALIZATION',
        controlObjective: 'Nationalization audited',
        description: 'Programme compliance verified.',
      },
    ],
  },
];

export interface RedFlagRuleSeed {
  code: string;
  name: string;
  domain: string;
  expression: string;
  thresholdJson?: Record<string, unknown>;
  countryCode?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const RED_FLAG_RULE_SEEDS: RedFlagRuleSeed[] = [
  {
    code: 'RF_MISSING_CONTRACT',
    name: 'Missing employment contract',
    domain: 'HR_RECORDS',
    expression: 'employee.documents.contract == null',
    severity: 'HIGH',
  },
  {
    code: 'RF_PASSPORT_EXPIRING',
    name: 'Passport expiring within 6 months',
    domain: 'IMMIGRATION',
    expression: 'employee.passport.expiry < today + 180d',
    thresholdJson: { daysAhead: 180 },
    severity: 'HIGH',
  },
  {
    code: 'RF_VISA_EXPIRING',
    name: 'Visa expiring within 60 days',
    domain: 'IMMIGRATION',
    expression: 'employee.visa.expiry < today + 60d',
    thresholdJson: { daysAhead: 60 },
    severity: 'HIGH',
  },
  {
    code: 'RF_VISA_EXPIRED',
    name: 'Visa expired',
    domain: 'IMMIGRATION',
    expression: 'employee.visa.expiry < today',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_WORK_PERMIT_EXPIRED',
    name: 'Work permit expired',
    domain: 'IMMIGRATION',
    expression: 'employee.workPermit.expiry < today',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_RENEWAL_OVERDUE',
    name: 'Renewal not scheduled ≥60 days ahead',
    domain: 'IMMIGRATION',
    expression: 'no renewal task within 60 days of expiry',
    thresholdJson: { daysAhead: 60 },
    severity: 'MEDIUM',
  },
  {
    code: 'RF_NATIONAL_ID_EXPIRING',
    name: 'National ID expiring within 60 days',
    domain: 'IMMIGRATION',
    expression: 'employee.nationalId.expiry < today + 60d',
    thresholdJson: { daysAhead: 60 },
    severity: 'HIGH',
  },
  {
    code: 'RF_SALARY_DELAY',
    name: 'Salary delay beyond statutory window',
    domain: 'WPS',
    expression: 'payslip.creditedAt > payslip.dueDate',
    thresholdJson: { statutoryRef: 'WPS_SALARY_WINDOW_DAYS' },
    severity: 'CRITICAL',
  },
  {
    code: 'RF_WPS_LATE',
    name: 'WPS file submitted late',
    domain: 'WPS',
    expression: 'wpsSubmission.submittedAt > wpsSubmission.dueDate',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_IBAN_REJECTION',
    name: 'IBAN rejection from authority',
    domain: 'WPS',
    expression: 'wpsResponse.rejectedCount > 0',
    severity: 'HIGH',
  },
  {
    code: 'RF_RECON_BREAK',
    name: 'Payroll-to-GL reconciliation break',
    domain: 'PAYROLL',
    expression: 'abs(payroll.runTotal - gl.posted) > 0.01',
    severity: 'HIGH',
  },
  {
    code: 'RF_SI_REGISTRATION_GAP',
    name: 'Social insurance registration gap',
    domain: 'SOCIAL_INSURANCE',
    expression: 'eligibleEmployees with no SI enrolment within window',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_SI_FILING_LATE',
    name: 'Social insurance filing late',
    domain: 'SOCIAL_INSURANCE',
    expression: 'siFiling.submittedAt > siFiling.dueDate',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_SI_MISMATCH',
    name: 'SI contribution mismatch',
    domain: 'SOCIAL_INSURANCE',
    expression: 'payrollSi - authoritySi != 0',
    severity: 'HIGH',
  },
  {
    code: 'RF_NATIONALIZATION_SHORTFALL',
    name: 'Nationalization target shortfall',
    domain: 'NATIONALIZATION',
    expression: 'nationalRate < target.rate',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_LEAVE_BELOW_STATUTORY',
    name: 'Leave entitlement below statutory minimum',
    domain: 'LEAVE',
    expression: 'leaveEntitlement < country.minDays',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_OT_OVER_CAP',
    name: 'Overtime exceeded statutory cap',
    domain: 'ATTENDANCE_OT',
    expression: 'employee.monthlyOTHours > country.OTCap',
    severity: 'HIGH',
  },
  {
    code: 'RF_HSE_TRAINING_OVERDUE',
    name: 'HSE training overdue',
    domain: 'HSE',
    expression: 'training.nextDueDate < today',
    severity: 'MEDIUM',
  },
  {
    code: 'RF_FINAL_SETTLEMENT_LATE',
    name: 'Final settlement late',
    domain: 'SEPARATION',
    expression: 'separation.settlementDate > separation.statutoryDueDate',
    severity: 'CRITICAL',
  },
  {
    code: 'RF_VISA_CANCELLATION_LATE',
    name: 'Visa cancellation past grace period',
    domain: 'IMMIGRATION',
    expression: 'separation.visaCancellationDate > separation.gracePeriodEnd',
    severity: 'HIGH',
  },
];
