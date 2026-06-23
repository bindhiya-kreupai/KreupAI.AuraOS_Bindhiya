/**
 * Authored GCC rule packs (EPIC-36 S02–S04).
 *
 * Values reflect the GCC HR Compliance Handbook (2026) and current statutory
 * positions in each country. Each rule carries its authority + a citation
 * pointer so amendments retain provenance.
 */

export interface SeedRule {
  domain: string; // 'PAYROLL' | 'SOCIAL_INSURANCE' | 'NATIONALIZATION' | 'IMMIGRATION' | 'WORKING_HOURS' | 'LEAVE' | 'EOSB'
  ruleKey: string;
  value: unknown;
  formula?: string;
  authority?: string;
  citation?: string;
}

export interface SeedRulePack {
  countryCode: string;
  title: string;
  summary: string;
  rules: SeedRule[];
}

export const GCC_WIDE_THEMES = [
  {
    code: 'WAGE_PROTECTION',
    name: 'Wage Protection',
    description:
      'Statutory salary payment windows monitored centrally by each labour authority. WPS-like systems exist in all GCC countries.',
    domains: ['PAYROLL'],
  },
  {
    code: 'SOCIAL_INSURANCE',
    name: 'Mandatory Social Insurance',
    description:
      'National pension and social insurance schemes (GOSI, GPSSA, SIO, PASI, PIFSS, GRSIA) require mandatory contributions for nationals (and selected expat schemes).',
    domains: ['SOCIAL_INSURANCE'],
  },
  {
    code: 'NATIONALIZATION',
    name: 'Workforce Nationalization',
    description:
      'All six GCC countries operate nationalization quota programmes targeting private-sector hiring of nationals.',
    domains: ['NATIONALIZATION'],
  },
  {
    code: 'EOSB',
    name: 'End-of-Service Benefits',
    description:
      'Statutory gratuity / EOSB obligations are universal across the GCC, with country-specific accrual formulas.',
    domains: ['EOSB'],
  },
  {
    code: 'IMMIGRATION',
    name: 'Immigration & Work Permits',
    description:
      'Country-specific work permit and residency frameworks (MOHRE/ICP, Qiwa, LMRA, MOL, PAM, PACI) govern expatriate employment.',
    domains: ['IMMIGRATION'],
  },
];

export const RULE_PACK_SEEDS: SeedRulePack[] = [
  {
    countryCode: 'AE',
    title: 'UAE — Federal Labour Law (Decree-Law 33/2021) compliance pack',
    summary:
      'UAE labour law governs fixed-term contracts (max 3 years, renewable), WPS payment within 15 days, end-of-service gratuity at 21 days/year for the first 5 years and 30 days/year thereafter (max 2 years salary), Emiratisation quotas for private firms ≥50 employees, and GPSSA contributions for UAE nationals.',
    rules: [
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_SALARY_WINDOW_DAYS',
        value: 15,
        authority: 'MOHRE',
        citation: 'UAE Labour Law Article 22; WPS Ministerial Decree 43/2022',
      },
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_PROTOCOL',
        value: { name: 'UAE WPS', file: 'SIF' },
        authority: 'MOHRE',
        citation: 'WPS Salary Information File format',
      },
      {
        domain: 'EOSB',
        ruleKey: 'GRATUITY_FORMULA',
        value: {
          firstFiveYearsDaysPerYear: 21,
          afterFiveYearsDaysPerYear: 30,
          capYears: 2,
          basisField: 'basicSalary',
        },
        formula: 'min(2*annualBasic, 21d*min(svc,5)*dailyBasic + 30d*max(svc-5,0)*dailyBasic)',
        authority: 'MOHRE',
        citation: 'UAE Labour Law Article 51',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GPSSA_EMPLOYER_PCT',
        value: 12.5,
        authority: 'GPSSA',
        citation: 'Federal Pensions Law 7/1999 (as amended)',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GPSSA_EMPLOYEE_PCT',
        value: 5,
        authority: 'GPSSA',
      },
      // Structured GPSSA rate object (UAE nationals — GPSSA does not
      // cover expats; OH for expats is carried by other insurers).
      // Consumed by GpssaConfigService.resolveRateWithRulePack as the
      // regulatory baseline when tenant config is missing.
      // Federal Pensions Law 7/1999: employer 12.5% + employee 5% +
      // state 2.5% on contribution wage AED 1,000 - 50,000.
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GPSSA_RATES_UAE_NATIONAL',
        value: {
          employerPct: 12.5,
          employeePct: 5,
          governmentPct: 2.5,
          wageFloor: 1000,
          wageCeiling: 50000,
        },
        authority: 'GPSSA',
        citation: 'Federal Pensions Law 7/1999 (as amended)',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'EMIRATISATION_PRIVATE_TARGET',
        value: {
          appliesAt: 50,
          annualGrowthPct: 2,
          finePerMissedHire: 7000,
          currency: 'AED',
        },
        authority: 'MOHRE/NAFIS',
        citation: 'Cabinet Decision 18/2022 + NAFIS',
      },
      {
        domain: 'IMMIGRATION',
        ruleKey: 'WORK_PERMIT_TYPES',
        value: ['MOHRE_STANDARD', 'GOLDEN_VISA', 'GREEN_VISA', 'FREELANCE'],
        authority: 'MOHRE/ICP',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'STANDARD_WEEKLY_HOURS',
        value: 48,
        authority: 'MOHRE',
        citation: 'UAE Labour Law Article 17',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'RAMADAN_WEEKLY_HOURS',
        value: 36,
        authority: 'MOHRE',
        citation: 'UAE Labour Law Article 17',
      },
      {
        domain: 'LEAVE',
        ruleKey: 'ANNUAL_LEAVE_DAYS',
        value: 30,
        authority: 'MOHRE',
        citation: 'UAE Labour Law Article 29',
      },
    ],
  },
  {
    countryCode: 'SA',
    title: 'KSA — Labour Law + Qiwa/Mudad/GOSI/Nitaqat compliance pack',
    summary:
      'Saudi Arabia operates Qiwa contract authentication, Mudad for wage protection (salaries due within 7 days for monthly-paid, 14 days for hourly), GOSI for social insurance, and Nitaqat for Saudization band targets by sector and size.',
    rules: [
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_SALARY_WINDOW_DAYS',
        value: 7,
        authority: 'MHRSD/Mudad',
        citation: 'Labour Law Article 90; Mudad Ministerial Decision',
      },
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_PROTOCOL',
        value: { name: 'Mudad WPS' },
        authority: 'Mudad',
      },
      {
        domain: 'EOSB',
        ruleKey: 'GRATUITY_FORMULA',
        value: {
          firstFiveYearsHalfMonth: true,
          afterFiveYearsFullMonth: true,
          basisField: 'lastBasicPlusAllowances',
        },
        formula: 'svcYears<=5 ? 0.5*lastBasic*svc : 0.5*lastBasic*5 + lastBasic*(svc-5)',
        authority: 'MHRSD',
        citation: 'Saudi Labour Law Article 84',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GOSI_EMPLOYER_PCT_NATIONAL',
        value: 11.75,
        authority: 'GOSI',
        citation: 'Social Insurance Law Article 18',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GOSI_EMPLOYEE_PCT_NATIONAL',
        value: 9.75,
        authority: 'GOSI',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GOSI_EMPLOYER_PCT_EXPAT',
        value: 2,
        authority: 'GOSI',
      },
      // Structured GOSI rate objects keyed by branch + NationalityClass.
      // Consumed by GosiConfigService.resolveRateWithRulePack as the
      // regulatory baseline when tenant config is missing. Per-tenant
      // gosi_contribution_rate rows take precedence; these seeds carry
      // the Social Insurance Law Article 18 figures + Article-18
      // wage floor / ceiling (SAR 1,500 - 45,000).
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GOSI_RATES_ANNUITIES_SAUDI',
        value: {
          employerPct: 11.75,
          employeePct: 9.75,
          wageFloor: 1500,
          wageCeiling: 45000,
        },
        authority: 'GOSI',
        citation: 'Social Insurance Law Article 18 (Annuities branch)',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GOSI_RATES_OCCUPATIONAL_HAZARDS_SAUDI',
        value: {
          employerPct: 2,
          employeePct: 0,
          wageFloor: 1500,
          wageCeiling: 45000,
        },
        authority: 'GOSI',
        citation: 'Social Insurance Law Article 18 (OH branch)',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GOSI_RATES_OCCUPATIONAL_HAZARDS_EXPAT',
        value: {
          employerPct: 2,
          employeePct: 0,
        },
        authority: 'GOSI',
        citation: 'Social Insurance Law — OH branch for expatriate workers',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GOSI_RATES_OCCUPATIONAL_HAZARDS_GCC_NATIONAL_OTHER',
        value: {
          employerPct: 2,
          employeePct: 0,
        },
        authority: 'GOSI',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'NITAQAT_BANDS',
        value: ['PLATINUM', 'GREEN', 'YELLOW', 'RED'],
        authority: 'MHRSD/Qiwa',
        citation: 'Nitaqat programme',
      },
      // Structured Nitaqat band thresholds per sector + size bracket.
      // Consumed by NitaqatConfigService.resolveThresholdWithRulePack
      // as the regulatory baseline when tenant config is missing.
      // Representative figures aligned with DEFAULT_BAND_THRESHOLDS in
      // nitaqat-compliance/index.ts; tenants override per-establishment.
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'NITAQAT_BAND_THRESHOLDS_PRIVATE_SMALL',
        value: { redMaxPct: 4, yellowMaxPct: 7, greenMaxPct: 10 },
        authority: 'MHRSD/Qiwa',
        citation: 'Nitaqat programme — Private sector, small bracket',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'NITAQAT_BAND_THRESHOLDS_PRIVATE_MEDIUM',
        value: { redMaxPct: 6, yellowMaxPct: 9, greenMaxPct: 12 },
        authority: 'MHRSD/Qiwa',
        citation: 'Nitaqat programme — Private sector, medium bracket',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'NITAQAT_BAND_THRESHOLDS_PRIVATE_LARGE',
        value: { redMaxPct: 8, yellowMaxPct: 12, greenMaxPct: 18 },
        authority: 'MHRSD/Qiwa',
        citation: 'Nitaqat programme — Private sector, large bracket',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'NITAQAT_BAND_THRESHOLDS_PRIVATE_GIANT',
        value: { redMaxPct: 10, yellowMaxPct: 15, greenMaxPct: 22 },
        authority: 'MHRSD/Qiwa',
        citation: 'Nitaqat programme — Private sector, giant bracket',
      },
      {
        domain: 'IMMIGRATION',
        ruleKey: 'WORK_PERMIT_TYPES',
        value: ['IQAMA', 'PREMIUM_RESIDENCY'],
        authority: 'MOI/Absher',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'STANDARD_WEEKLY_HOURS',
        value: 48,
        authority: 'MHRSD',
        citation: 'Saudi Labour Law Article 98',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'RAMADAN_WEEKLY_HOURS',
        value: 36,
        authority: 'MHRSD',
        citation: 'Saudi Labour Law Article 98',
      },
      {
        domain: 'LEAVE',
        ruleKey: 'ANNUAL_LEAVE_DAYS',
        value: 21,
        authority: 'MHRSD',
        citation: 'Saudi Labour Law Article 109',
      },
    ],
  },
  {
    countryCode: 'BH',
    title: 'Bahrain — Labour Law + LMRA/SIO/Bahrainization compliance pack',
    summary:
      'Bahrain LMRA issues and monitors work permits with permit fees; SIO covers social insurance for nationals and selected expat schemes; salaries must be paid within statutory window through the Wage Protection System.',
    rules: [
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_SALARY_WINDOW_DAYS',
        value: 7,
        authority: 'MoLSD',
        citation: 'Bahrain Wage Protection System Decree',
      },
      {
        domain: 'EOSB',
        ruleKey: 'GRATUITY_FORMULA',
        value: {
          firstThreeYearsHalfMonth: true,
          afterThreeYearsFullMonth: true,
          basisField: 'lastBasic',
        },
        formula: 'svcYears<=3 ? 0.5*lastBasic*svc : 0.5*lastBasic*3 + lastBasic*(svc-3)',
        authority: 'MoLSD',
        citation: 'Bahrain Labour Law Article 116',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'SIO_EMPLOYER_PCT_NATIONAL',
        value: 12,
        authority: 'SIO',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'SIO_EMPLOYEE_PCT_NATIONAL',
        value: 7,
        authority: 'SIO',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'BAHRAINIZATION_BAND',
        value: { defaultPct: 50, sectorVariesYes: true },
        authority: 'LMRA',
      },
      {
        domain: 'IMMIGRATION',
        ruleKey: 'WORK_PERMIT_TYPES',
        value: ['LMRA_STANDARD', 'FLEXI'],
        authority: 'LMRA',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'STANDARD_WEEKLY_HOURS',
        value: 48,
        authority: 'MoLSD',
      },
      {
        domain: 'LEAVE',
        ruleKey: 'ANNUAL_LEAVE_DAYS',
        value: 30,
        authority: 'MoLSD',
        citation: 'Bahrain Labour Law Article 58',
      },
    ],
  },
  {
    countryCode: 'QA',
    title: 'Qatar — Labour Law + Qatar WPS + GRSIA compliance pack',
    summary:
      'Qatar MoL administers labour; QID issued by MoI. WPS file required monthly within seven days of the due date; Qatarization targets apply in specific sectors (e.g., banking, oil & gas).',
    rules: [
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_SALARY_WINDOW_DAYS',
        value: 7,
        authority: 'MoL',
        citation: 'Qatar Labour Law 14/2004 Article 66 (as amended)',
      },
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_PROTOCOL',
        value: { name: 'Qatar WPS' },
        authority: 'MoL',
      },
      {
        domain: 'EOSB',
        ruleKey: 'GRATUITY_FORMULA',
        value: { perCompletedYearDays: 21, basisField: 'lastBasic' },
        formula: 'svcYears>=1 ? 21d*svcYears*dailyBasic : 0',
        authority: 'MoL',
        citation: 'Qatar Labour Law Article 54',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GRSIA_EMPLOYER_PCT_NATIONAL',
        value: 14,
        authority: 'GRSIA',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'GRSIA_EMPLOYEE_PCT_NATIONAL',
        value: 7,
        authority: 'GRSIA',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'QATARIZATION_SECTOR_TARGET',
        value: { bankingPct: 20, oilAndGasPct: 50 },
        authority: 'MoL',
      },
      {
        domain: 'IMMIGRATION',
        ruleKey: 'WORK_PERMIT_TYPES',
        value: ['QID', 'WORK_PERMIT'],
        authority: 'MoI',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'STANDARD_WEEKLY_HOURS',
        value: 48,
        authority: 'MoL',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'RAMADAN_WEEKLY_HOURS',
        value: 36,
        authority: 'MoL',
      },
      {
        domain: 'LEAVE',
        ruleKey: 'ANNUAL_LEAVE_DAYS',
        value: 21,
        authority: 'MoL',
        citation: 'Qatar Labour Law Article 79',
      },
    ],
  },
  {
    countryCode: 'OM',
    title: 'Oman — Labour Law + PASI/Omanisation compliance pack',
    summary:
      'Oman MoL governs labour; PASI handles social protection. Omanisation has sector-specific quotas enforced via labour clearances.',
    rules: [
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_SALARY_WINDOW_DAYS',
        value: 7,
        authority: 'MoL',
        citation: 'Oman Labour Law 53/2023',
      },
      {
        domain: 'EOSB',
        ruleKey: 'GRATUITY_FORMULA',
        value: { perCompletedYearDays: 30, basisField: 'lastBasic' },
        formula: '30d*svcYears*dailyBasic',
        authority: 'MoL',
        citation: 'Oman Labour Law Article 61',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'PASI_EMPLOYER_PCT_NATIONAL',
        value: 11.5,
        authority: 'PASI',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'PASI_EMPLOYEE_PCT_NATIONAL',
        value: 8,
        authority: 'PASI',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'OMANISATION_SECTOR_TARGET',
        value: { generalPct: 35, sectorVariesYes: true },
        authority: 'MoL',
      },
      {
        domain: 'IMMIGRATION',
        ruleKey: 'WORK_PERMIT_TYPES',
        value: ['LABOUR_CARD', 'INVESTOR_RESIDENCY'],
        authority: 'ROP',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'STANDARD_WEEKLY_HOURS',
        value: 45,
        authority: 'MoL',
      },
      {
        domain: 'LEAVE',
        ruleKey: 'ANNUAL_LEAVE_DAYS',
        value: 30,
        authority: 'MoL',
        citation: 'Oman Labour Law Article 65',
      },
    ],
  },
  {
    countryCode: 'KW',
    title: 'Kuwait — Labour Law + PAM/PIFSS/Kuwaitisation compliance pack',
    summary:
      'Kuwait PAM issues work permits and monitors quotas; PIFSS covers Kuwaiti and GCC-national social insurance. EOSB indemnity at 15 days/year for first 5 years and 1 month/year thereafter.',
    rules: [
      {
        domain: 'PAYROLL',
        ruleKey: 'WPS_SALARY_WINDOW_DAYS',
        value: 7,
        authority: 'MoSAL',
        citation: 'Kuwait Labour Law Article 56',
      },
      {
        domain: 'EOSB',
        ruleKey: 'GRATUITY_FORMULA',
        value: {
          firstFiveYearsDaysPerYear: 15,
          afterFiveYearsDaysPerYear: 30,
          basisField: 'lastFullSalary',
        },
        formula:
          'svcYears<=5 ? 15d*svcYears*dailyWage : 15d*5*dailyWage + 30d*(svcYears-5)*dailyWage',
        authority: 'MoSAL',
        citation: 'Kuwait Labour Law Article 51',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'PIFSS_EMPLOYER_PCT_NATIONAL',
        value: 11.5,
        authority: 'PIFSS',
      },
      {
        domain: 'SOCIAL_INSURANCE',
        ruleKey: 'PIFSS_EMPLOYEE_PCT_NATIONAL',
        value: 10.5,
        authority: 'PIFSS',
      },
      {
        domain: 'NATIONALIZATION',
        ruleKey: 'KUWAITISATION_BAND',
        value: { generalPct: 60, sectorVariesYes: true },
        authority: 'PAM',
      },
      {
        domain: 'IMMIGRATION',
        ruleKey: 'WORK_PERMIT_TYPES',
        value: ['PAM_WORK_PERMIT', 'CIVIL_ID'],
        authority: 'PAM/PACI',
      },
      {
        domain: 'WORKING_HOURS',
        ruleKey: 'STANDARD_WEEKLY_HOURS',
        value: 48,
        authority: 'MoSAL',
      },
      {
        domain: 'LEAVE',
        ruleKey: 'ANNUAL_LEAVE_DAYS',
        value: 30,
        authority: 'MoSAL',
        citation: 'Kuwait Labour Law Article 70',
      },
    ],
  },
];

export const COMPARISON_DIMENSIONS = {
  PAYROLL: ['WPS_SALARY_WINDOW_DAYS', 'WPS_PROTOCOL'],
  SOCIAL_INSURANCE: [
    'GPSSA_EMPLOYER_PCT',
    'GPSSA_EMPLOYEE_PCT',
    'GOSI_EMPLOYER_PCT_NATIONAL',
    'GOSI_EMPLOYEE_PCT_NATIONAL',
    'GOSI_EMPLOYER_PCT_EXPAT',
    'SIO_EMPLOYER_PCT_NATIONAL',
    'SIO_EMPLOYEE_PCT_NATIONAL',
    'GRSIA_EMPLOYER_PCT_NATIONAL',
    'GRSIA_EMPLOYEE_PCT_NATIONAL',
    'PASI_EMPLOYER_PCT_NATIONAL',
    'PASI_EMPLOYEE_PCT_NATIONAL',
    'PIFSS_EMPLOYER_PCT_NATIONAL',
    'PIFSS_EMPLOYEE_PCT_NATIONAL',
  ],
  NATIONALIZATION: [
    'EMIRATISATION_PRIVATE_TARGET',
    'NITAQAT_BANDS',
    'BAHRAINIZATION_BAND',
    'QATARIZATION_SECTOR_TARGET',
    'OMANISATION_SECTOR_TARGET',
    'KUWAITISATION_BAND',
  ],
  IMMIGRATION: ['WORK_PERMIT_TYPES'],
  EOSB: ['GRATUITY_FORMULA'],
} as const;
