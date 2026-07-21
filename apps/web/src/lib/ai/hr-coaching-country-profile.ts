/**
 * Country/jurisdiction profiles for HR Coaching — replaces one-size-fits-all
 * Western frameworks (e.g. SBI) with local labour-law and cultural context.
 */

import { GCC_COUNTRY_DEFAULTS, isGccCountry } from '@/lib/services/gcc-landscape/country-defaults';

export type CoachingCountryProfile = {
  countryCode: string;
  countryName: string;
  labourAuthority: string;
  nationalizationProgramme?: string;
  frameworkGuidance: string;
  complianceGuidance: string;
  feedbackGuidance: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  BH: 'Bahrain',
  QA: 'Qatar',
  OM: 'Oman',
  KW: 'Kuwait',
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
};

function gccProfile(code: keyof typeof GCC_COUNTRY_DEFAULTS): CoachingCountryProfile {
  const d = GCC_COUNTRY_DEFAULTS[code];
  const name = COUNTRY_NAMES[code] || code;
  return {
    countryCode: code,
    countryName: name,
    labourAuthority: d.labourAuthority,
    nationalizationProgramme: d.nationalizationProgramme,
    frameworkGuidance: [
      `Ground HR guidance in ${name} labour law and ${d.labourAuthority} requirements.`,
      `Consider: wage protection (WPS), work permits/residency, ${d.nationalizationProgramme}, and retrieved tenant policies.`,
      'Do not default to US-centric coaching models (e.g. SBI, “at-will” employment) unless the user explicitly asks.',
    ].join(' '),
    complianceGuidance: [
      `For terminations, disputes, or workforce reductions: involve ER/Legal and verify ${d.labourAuthority} procedures, notice periods, and documentation.`,
      d.marketNotes,
    ].join(' '),
    feedbackGuidance: [
      'Use respectful private conversations; avoid public criticism.',
      'Document specific incidents, dates, and impact; set measurable expectations and follow-up.',
      'Align with company policy and applicable federal labour regulations.',
    ].join(' '),
  };
}

const PROFILES: Record<string, CoachingCountryProfile> = {
  AE: {
    ...gccProfile('AE'),
    frameworkGuidance: [
      'Ground guidance in UAE Federal Decree-Law No. 33 of 2021 (Labour Relations) and MOHRE practice.',
      'Consider: probation rules, end-of-service gratuity, WPS, Emiratisation/NAFIS where relevant, and retrieved tenant policies.',
      'Do not use Western-only feedback frameworks (e.g. SBI) by default.',
    ].join(' '),
    feedbackGuidance:
      'Structure manager feedback as: (1) specific observed behaviour/event with dates, (2) business/team impact, (3) clear expectation and support, (4) documented follow-up. Use respectful, private dialogue; offer English/Arabic phrasing when helpful.',
  },
  SA: gccProfile('SA'),
  BH: gccProfile('BH'),
  QA: gccProfile('QA'),
  OM: gccProfile('OM'),
  KW: gccProfile('KW'),
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    labourAuthority: 'Ministry of Labour & Employment / state labour departments',
    frameworkGuidance:
      'Ground guidance in applicable Indian labour codes, Shops & Establishments/state rules, and retrieved tenant policies. Avoid US-centric frameworks by default.',
    complianceGuidance:
      'For termination or disciplinary action: follow documented show-cause, inquiry, and statutory notice requirements; involve ER/Legal.',
    feedbackGuidance:
      'Use clear, documented feedback with specific examples; respect hierarchy and local workplace norms; align with company POSH and conduct policies where relevant.',
  },
  DEFAULT: {
    countryCode: 'DEFAULT',
    countryName: 'Multi-jurisdiction',
    labourAuthority: 'applicable local labour authority',
    frameworkGuidance:
      'Ask which country/jurisdiction applies if unclear. Prefer retrieved tenant policies and local labour law over generic Western HR playbooks.',
    complianceGuidance:
      'For termination, discrimination, or legal risk — always advise ER/Legal consultation first.',
    feedbackGuidance:
      'Use documented, respectful feedback with specific examples and clear expectations; adapt tone to local workplace culture.',
  },
};

export function getCoachingCountryProfile(countryCode?: string): CoachingCountryProfile {
  const code = String(countryCode || '')
    .trim()
    .toUpperCase();
  if (code && PROFILES[code]) return PROFILES[code];
  if (code && isGccCountry(code)) return gccProfile(code as keyof typeof GCC_COUNTRY_DEFAULTS);
  return PROFILES.DEFAULT;
}

export function listSupportedCoachingCountries(): string[] {
  return Object.keys(PROFILES).filter((k) => k !== 'DEFAULT');
}
