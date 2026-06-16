/**
 * EPIC-35 seeds — category taxonomy + recurring-rule templates per domain.
 */

export const CATEGORY_SEEDS = [
  { code: 'PAYROLL', name: 'Payroll', ownerRole: 'PAYROLL_OFFICER', defaultCadence: 'MONTHLY' },
  { code: 'WPS', name: 'Wage Protection', ownerRole: 'PAYROLL_OFFICER', defaultCadence: 'MONTHLY' },
  {
    code: 'SOCIAL_INSURANCE',
    name: 'Social Insurance Filings',
    ownerRole: 'PAYROLL_OFFICER',
    defaultCadence: 'MONTHLY',
  },
  {
    code: 'IMMIGRATION',
    name: 'Visa / Work Permit Renewals',
    ownerRole: 'PRO_OFFICER',
    defaultCadence: 'EVENT',
  },
  {
    code: 'NATIONALIZATION',
    name: 'Nationalization Checkpoints',
    ownerRole: 'HR_MANAGER',
    defaultCadence: 'QUARTERLY',
  },
  {
    code: 'HOLIDAY',
    name: 'Public Holiday / Ramadan',
    ownerRole: 'HR_ADMIN',
    defaultCadence: 'ANNUAL',
  },
  {
    code: 'BENEFITS',
    name: 'Benefits / Insurance Renewals',
    ownerRole: 'HR_ADMIN',
    defaultCadence: 'ANNUAL',
  },
  {
    code: 'HSE',
    name: 'HSE / Training / Drills',
    ownerRole: 'COMPLIANCE_OFFICER',
    defaultCadence: 'QUARTERLY',
  },
  {
    code: 'EMPLOYEE_RELATIONS',
    name: 'Employee Relations Reviews',
    ownerRole: 'HR_MANAGER',
    defaultCadence: 'MONTHLY',
  },
  {
    code: 'DOCUMENT_AUDIT',
    name: 'Personnel-File Audit',
    ownerRole: 'HR_ADMIN',
    defaultCadence: 'QUARTERLY',
  },
];

export interface RecurrenceSeed {
  code: string;
  name: string;
  categoryCode: string;
  countryCode?: string;
  cadence: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  dayOfMonth: number;
  monthOfYear?: number;
  ownerRole: string;
  escalationRole?: string;
  leadDays: number;
  tierAlerts: number[];
}

export const RECURRENCE_RULE_SEEDS: RecurrenceSeed[] = [
  // Payroll cut-off + WPS submission per country
  {
    code: 'PAYROLL_CUTOFF_AE',
    name: 'UAE payroll cut-off',
    categoryCode: 'PAYROLL',
    countryCode: 'AE',
    cadence: 'MONTHLY',
    dayOfMonth: 25,
    ownerRole: 'PAYROLL_OFFICER',
    escalationRole: 'HR_MANAGER',
    leadDays: 5,
    tierAlerts: [5, 2],
  },
  {
    code: 'WPS_SUBMIT_AE',
    name: 'UAE WPS submission',
    categoryCode: 'WPS',
    countryCode: 'AE',
    cadence: 'MONTHLY',
    dayOfMonth: 14,
    ownerRole: 'PAYROLL_OFFICER',
    escalationRole: 'COMPLIANCE_OFFICER',
    leadDays: 7,
    tierAlerts: [7, 3, 1],
  },
  {
    code: 'WPS_SUBMIT_SA',
    name: 'KSA Mudad WPS submission',
    categoryCode: 'WPS',
    countryCode: 'SA',
    cadence: 'MONTHLY',
    dayOfMonth: 7,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 5,
    tierAlerts: [5, 2, 1],
  },
  {
    code: 'WPS_SUBMIT_BH',
    name: 'Bahrain WPS submission',
    categoryCode: 'WPS',
    countryCode: 'BH',
    cadence: 'MONTHLY',
    dayOfMonth: 7,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 5,
    tierAlerts: [5, 2, 1],
  },
  {
    code: 'WPS_SUBMIT_QA',
    name: 'Qatar WPS submission',
    categoryCode: 'WPS',
    countryCode: 'QA',
    cadence: 'MONTHLY',
    dayOfMonth: 7,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 5,
    tierAlerts: [5, 2, 1],
  },
  {
    code: 'WPS_SUBMIT_OM',
    name: 'Oman WPS submission',
    categoryCode: 'WPS',
    countryCode: 'OM',
    cadence: 'MONTHLY',
    dayOfMonth: 7,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 5,
    tierAlerts: [5, 2, 1],
  },
  {
    code: 'WPS_SUBMIT_KW',
    name: 'Kuwait WPS submission',
    categoryCode: 'WPS',
    countryCode: 'KW',
    cadence: 'MONTHLY',
    dayOfMonth: 7,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 5,
    tierAlerts: [5, 2, 1],
  },
  // Social insurance filings
  {
    code: 'GPSSA_FILING_AE',
    name: 'GPSSA monthly filing',
    categoryCode: 'SOCIAL_INSURANCE',
    countryCode: 'AE',
    cadence: 'MONTHLY',
    dayOfMonth: 15,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 7,
    tierAlerts: [7, 3],
  },
  {
    code: 'GOSI_FILING_SA',
    name: 'GOSI monthly filing',
    categoryCode: 'SOCIAL_INSURANCE',
    countryCode: 'SA',
    cadence: 'MONTHLY',
    dayOfMonth: 15,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 7,
    tierAlerts: [7, 3],
  },
  {
    code: 'SIO_FILING_BH',
    name: 'SIO monthly filing',
    categoryCode: 'SOCIAL_INSURANCE',
    countryCode: 'BH',
    cadence: 'MONTHLY',
    dayOfMonth: 15,
    ownerRole: 'PAYROLL_OFFICER',
    leadDays: 7,
    tierAlerts: [7, 3],
  },
  // Nationalization checkpoints
  {
    code: 'EMIRATISATION_MIDYEAR_AE',
    name: 'Emiratisation mid-year checkpoint',
    categoryCode: 'NATIONALIZATION',
    countryCode: 'AE',
    cadence: 'ANNUAL',
    dayOfMonth: 30,
    monthOfYear: 6,
    ownerRole: 'HR_MANAGER',
    escalationRole: 'EXECUTIVE_LEADERSHIP',
    leadDays: 30,
    tierAlerts: [30, 15, 7],
  },
  {
    code: 'EMIRATISATION_YEAREND_AE',
    name: 'Emiratisation year-end checkpoint',
    categoryCode: 'NATIONALIZATION',
    countryCode: 'AE',
    cadence: 'ANNUAL',
    dayOfMonth: 31,
    monthOfYear: 12,
    ownerRole: 'HR_MANAGER',
    escalationRole: 'EXECUTIVE_LEADERSHIP',
    leadDays: 30,
    tierAlerts: [30, 15, 7, 1],
  },
  {
    code: 'NITAQAT_QUARTERLY_SA',
    name: 'Nitaqat quarterly checkpoint',
    categoryCode: 'NATIONALIZATION',
    countryCode: 'SA',
    cadence: 'QUARTERLY',
    dayOfMonth: 1,
    ownerRole: 'HR_MANAGER',
    leadDays: 14,
    tierAlerts: [14, 7],
  },
  // Document audit
  {
    code: 'FILE_AUDIT_QUARTERLY',
    name: 'Quarterly personnel-file audit',
    categoryCode: 'DOCUMENT_AUDIT',
    cadence: 'QUARTERLY',
    dayOfMonth: 1,
    ownerRole: 'HR_ADMIN',
    leadDays: 7,
    tierAlerts: [7, 3],
  },
  // HSE
  {
    code: 'FIRE_DRILL_QUARTERLY',
    name: 'Quarterly fire drill',
    categoryCode: 'HSE',
    cadence: 'QUARTERLY',
    dayOfMonth: 15,
    ownerRole: 'COMPLIANCE_OFFICER',
    leadDays: 14,
    tierAlerts: [14, 7],
  },
];
