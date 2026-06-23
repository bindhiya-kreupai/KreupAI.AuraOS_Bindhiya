/**
 * GCC country reference defaults used by tenancy, country-profile,
 * classification, and risk-register seeds. Single source of truth.
 */

export const GCC_COUNTRY_CODES = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'] as const;
export type GccCountryCode = (typeof GCC_COUNTRY_CODES)[number];

export const isGccCountry = (code: string): code is GccCountryCode =>
  GCC_COUNTRY_CODES.includes(code.toUpperCase() as GccCountryCode);

export interface GccCountryDefaults {
  countryCode: GccCountryCode;
  defaultCurrency: string;
  defaultTimezone: string;
  weekendPattern: string;
  labourAuthority: string;
  socialInsuranceAuthority: string;
  nationalizationProgramme: string;
  expatProfile: 'HIGH' | 'MEDIUM' | 'LOW';
  marketNotes: string;
  registrationType: string;
  authorities: Record<string, string>;
}

export const GCC_COUNTRY_DEFAULTS: Record<GccCountryCode, GccCountryDefaults> = {
  AE: {
    countryCode: 'AE',
    defaultCurrency: 'AED',
    defaultTimezone: 'Asia/Dubai',
    weekendPattern: 'SAT_SUN',
    labourAuthority: 'MOHRE',
    socialInsuranceAuthority: 'GPSSA',
    nationalizationProgramme: 'Emiratisation',
    expatProfile: 'HIGH',
    marketNotes:
      'UAE workforce is ~88% expatriate; MOHRE, ICP and GDRFA govern work permits and residency. WPS is enforced; Emiratisation targets apply to private-sector entities ≥50 employees.',
    registrationType: 'MOHRE_ESTABLISHMENT',
    authorities: {
      labour: 'MOHRE',
      immigration: 'ICP/GDRFA',
      socialInsurance: 'GPSSA',
      wageProtection: 'WPS',
      nationalization: 'NAFIS',
    },
  },
  SA: {
    countryCode: 'SA',
    defaultCurrency: 'SAR',
    defaultTimezone: 'Asia/Riyadh',
    weekendPattern: 'FRI_SAT',
    labourAuthority: 'MHRSD',
    socialInsuranceAuthority: 'GOSI',
    nationalizationProgramme: 'Nitaqat',
    expatProfile: 'HIGH',
    marketNotes:
      'Saudi Arabia operates Qiwa for contract authentication, Mudad for WPS, and GOSI for social insurance. Nitaqat applies Saudization bands by sector and size.',
    registrationType: 'QIWA_ENTITY',
    authorities: {
      labour: 'MHRSD/Qiwa',
      immigration: 'Absher/MOI',
      socialInsurance: 'GOSI',
      wageProtection: 'Mudad/WPS',
      nationalization: 'Nitaqat',
    },
  },
  BH: {
    countryCode: 'BH',
    defaultCurrency: 'BHD',
    defaultTimezone: 'Asia/Bahrain',
    weekendPattern: 'FRI_SAT',
    labourAuthority: 'LMRA',
    socialInsuranceAuthority: 'SIO',
    nationalizationProgramme: 'Bahrainization',
    expatProfile: 'HIGH',
    marketNotes:
      'Bahrain LMRA issues and monitors work permits with fees. SIO covers social insurance for nationals and selected expat schemes; WPS via central bank wage protection.',
    registrationType: 'CR',
    authorities: {
      labour: 'MoLSD/LMRA',
      immigration: 'NPRA',
      socialInsurance: 'SIO',
      wageProtection: 'BH_WPS',
      nationalization: 'Bahrainization',
    },
  },
  QA: {
    countryCode: 'QA',
    defaultCurrency: 'QAR',
    defaultTimezone: 'Asia/Qatar',
    weekendPattern: 'FRI_SAT',
    labourAuthority: 'MOLSA',
    socialInsuranceAuthority: 'GRSIA',
    nationalizationProgramme: 'Qatarization',
    expatProfile: 'HIGH',
    marketNotes:
      'Qatar MoL administers labour; QID issued by MOI. WPS file required monthly within statutory window; Qatarization targets apply to specific sectors.',
    registrationType: 'CR',
    authorities: {
      labour: 'MoL',
      immigration: 'MOI/QID',
      socialInsurance: 'GRSIA',
      wageProtection: 'QATAR_WPS',
      nationalization: 'Qatarization',
    },
  },
  OM: {
    countryCode: 'OM',
    defaultCurrency: 'OMR',
    defaultTimezone: 'Asia/Muscat',
    weekendPattern: 'FRI_SAT',
    labourAuthority: 'MOL',
    socialInsuranceAuthority: 'PASI',
    nationalizationProgramme: 'Omanisation',
    expatProfile: 'MEDIUM',
    marketNotes:
      'Oman MoL governs labour; PASI handles social protection. Omanisation has sector-specific quotas and is enforced via labour clearances.',
    registrationType: 'CR',
    authorities: {
      labour: 'MoL',
      immigration: 'ROP',
      socialInsurance: 'PASI',
      wageProtection: 'WPS_OM',
      nationalization: 'Omanisation',
    },
  },
  KW: {
    countryCode: 'KW',
    defaultCurrency: 'KWD',
    defaultTimezone: 'Asia/Kuwait',
    weekendPattern: 'FRI_SAT',
    labourAuthority: 'PAM',
    socialInsuranceAuthority: 'PIFSS',
    nationalizationProgramme: 'Kuwaitization',
    expatProfile: 'HIGH',
    marketNotes:
      'Kuwait PAM issues work permits and monitors quotas; PIFSS covers Kuwaiti and GCC-national social insurance.',
    registrationType: 'CR',
    authorities: {
      labour: 'PAM/MOSAL',
      immigration: 'PACI',
      socialInsurance: 'PIFSS',
      wageProtection: 'KW_WPS',
      nationalization: 'Kuwaitization',
    },
  },
};

export const GCC_NATIONALITY_CODES = new Set(GCC_COUNTRY_CODES.map((c) => c.toUpperCase()));

export type WorkforceClass = 'NATIONAL' | 'GCC_NATIONAL_OTHER' | 'EXPAT';

export function deriveWorkforceClass(
  nationality: string,
  countryOfEmployment: string
): WorkforceClass {
  const nat = nationality.toUpperCase();
  const country = countryOfEmployment.toUpperCase();
  if (!nat) throw new Error('nationality required for classification');
  if (!isGccCountry(country)) {
    throw new Error(`countryOfEmployment ${country} is not a GCC country`);
  }
  if (nat === country) return 'NATIONAL';
  if (GCC_NATIONALITY_CODES.has(nat)) return 'GCC_NATIONAL_OTHER';
  return 'EXPAT';
}
