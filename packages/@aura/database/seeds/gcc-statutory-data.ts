/**
 * @module GCCStatutoryDataSeed
 * @description GCC statutory rates seed for WPS and GOSI compliance services.
 *              Upserts statutory configuration records into SystemSetting as
 *              namespaced JSON entries (group: 'StatutoryRates').
 *
 * Run via:  ts-node --compiler-options '{"module":"commonjs"}' seeds/gcc-statutory-data.ts
 *
 * @project  AURA HCM Platform
 * @section  Sec 28.2 — GCC Statutory Master Data
 * @reference docs/aura-master-instructions.md
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// UAE WPS Configuration Defaults
// ============================================================================

const UAE_WPS_DEFAULTS = {
  currency: 'AED',
  minSalaryForWPS: 5000,            // AED — employees below this threshold are WPS-exempt
  maxProcessingDays: 10,            // max calendar days after month-end to submit
  sifFileVersion: '2.0',
  mohreSubmissionWindow: { startDay: 1, endDay: 15 }, // of the following month
};

// ============================================================================
// KSA GOSI Rates (2024 — GOSI Circular SS/1451 revised 2024)
// ============================================================================

const KSA_GOSI_RATES = {
  saudi: {
    employeePension: 0.0975,   // 9.75%
    employerPension: 0.0975,   // 9.75%
    employeeSANED:   0.0075,   // 0.75% — Unemployment Insurance (SANED)
    employerSANED:   0.0075,   // 0.75%
    employerHazards: 0.02,     // 2.00% — Occupational Hazards (employer only)
    salaryCap:       45000,    // SAR/month (basic + housing allowance)
  },
  nonSaudi: {
    employeeSANED:   0.02,     // 2.00%
    employerSANED:   0.02,     // 2.00%
    employerHazards: 0.02,     // 2.00%
    salaryCap:       45000,    // SAR/month (for SANED base only)
  },
};

// ============================================================================
// UAE EOSB — End of Service Benefits (Gratuity)
// Labour Law: Federal Decree-Law No. 33 of 2021
// ============================================================================

const UAE_EOSB_RULES = {
  unlimited: {
    year1to5:  21,   // calendar days per year for first 5 years
    year6plus: 30,   // calendar days per year after 5 years
    maxMonths: 24,   // cap: 24 months' basic salary
  },
  limited: {
    year1to5:  21,
    year6plus: 30,
    maxMonths: 24,
    earlyTermination: {  // fraction of entitlement when employee resigns
      under1year: 0,
      year1to3:   0.333, // 1/3
      year3to5:   0.667, // 2/3
      year5plus:  1.0,   // full entitlement
    },
  },
};

// ============================================================================
// KSA EOSB Rules — Saudi Labor Law (Article 84)
// ============================================================================

const KSA_EOSB_RULES = {
  year1to5:  15, // 15 days' basic salary per year (< 5 years)
  year6plus: 30, // 30 days' basic salary per year (>= 5 years, one full month)
  resignation: { // fraction of entitlement on voluntary resignation
    under2years: 0,
    year2to5:    0.333,
    year5to10:   0.667,
    year10plus:  1.0,
  },
};

// ============================================================================
// Bahrain SIO — Social Insurance Organisation Rates
// Social Insurance Law No. 24 of 1976 (amended)
// ============================================================================

const BAHRAIN_SIO_RATES = {
  bahraini: {
    employee: 0.08,   // 8%
    employer: 0.12,   // 12%
    salaryCap: 4000,  // BHD/month
  },
  nonBahraini: {
    employee: 0.01,   // 1% (work injury insurance)
    employer: 0.03,   // 3%
  },
};

// ============================================================================
// Oman PASI — Public Authority for Social Insurance
// Royal Decree No. 72/91 (amended by RD 34/2023)
// ============================================================================

const OMAN_PASI_RATES = {
  omani: {
    employee:   0.07,   // 7%
    employer:   0.115,  // 11.5%
    government: 0.055,  // 5.5% government subsidy
    salaryCap:  3000,   // OMR/month
  },
};

// ============================================================================
// Qatar Social Insurance — Law No. 24 of 2002 (amended)
// ============================================================================

const QATAR_SI_RATES = {
  qatari: {
    employee:   0.05,  // 5%
    employer:   0.10,  // 10%
    government: 0.05,  // 5% government top-up
  },
};

// ============================================================================
// Kuwait Social Insurance — Law No. 61 of 1976 (amended)
// ============================================================================

const KUWAIT_SI_RATES = {
  kuwaiti: {
    employee: 0.105,  // 10.5%
    employer: 0.115,  // 11.5%
    salaryCap: 2750,  // KWD/month
  },
};

// ============================================================================
// Seed payload — maps each statutory config to a SystemSetting key
// The 'group' field uses 'StatutoryRates' so they are easy to query by group.
// ============================================================================

interface StatutorySettingEntry {
  key: string;
  value: string;           // JSON-serialised
  group: string;
  description: string;
}

const STATUTORY_SETTINGS: StatutorySettingEntry[] = [
  // --- UAE WPS ---
  {
    key: 'statutory.uae.wps.defaults',
    value: JSON.stringify(UAE_WPS_DEFAULTS),
    group: 'StatutoryRates',
    description: 'UAE Wage Protection System (WPS) configuration defaults',
  },

  // --- UAE EOSB ---
  {
    key: 'statutory.uae.eosb.unlimited',
    value: JSON.stringify(UAE_EOSB_RULES.unlimited),
    group: 'StatutoryRates',
    description: 'UAE End of Service Benefits — unlimited contract rules',
  },
  {
    key: 'statutory.uae.eosb.limited',
    value: JSON.stringify(UAE_EOSB_RULES.limited),
    group: 'StatutoryRates',
    description: 'UAE End of Service Benefits — limited contract rules (incl. early termination fractions)',
  },

  // --- KSA GOSI ---
  {
    key: 'statutory.ksa.gosi.saudi',
    value: JSON.stringify(KSA_GOSI_RATES.saudi),
    group: 'StatutoryRates',
    description: 'KSA GOSI contribution rates for Saudi nationals (2024)',
  },
  {
    key: 'statutory.ksa.gosi.nonSaudi',
    value: JSON.stringify(KSA_GOSI_RATES.nonSaudi),
    group: 'StatutoryRates',
    description: 'KSA GOSI contribution rates for non-Saudi nationals (SANED only, 2024)',
  },

  // --- KSA EOSB ---
  {
    key: 'statutory.ksa.eosb',
    value: JSON.stringify(KSA_EOSB_RULES),
    group: 'StatutoryRates',
    description: 'KSA End of Service Benefits — Labour Law Article 84 rules',
  },

  // --- Bahrain SIO ---
  {
    key: 'statutory.bh.sio',
    value: JSON.stringify(BAHRAIN_SIO_RATES),
    group: 'StatutoryRates',
    description: 'Bahrain Social Insurance Organisation (SIO) contribution rates',
  },

  // --- Oman PASI ---
  {
    key: 'statutory.om.pasi',
    value: JSON.stringify(OMAN_PASI_RATES),
    group: 'StatutoryRates',
    description: 'Oman PASI social insurance contribution rates (RD 34/2023)',
  },

  // --- Qatar SI ---
  {
    key: 'statutory.qa.si',
    value: JSON.stringify(QATAR_SI_RATES),
    group: 'StatutoryRates',
    description: 'Qatar Social Insurance contribution rates (Law 24/2002)',
  },

  // --- Kuwait SI ---
  {
    key: 'statutory.kw.si',
    value: JSON.stringify(KUWAIT_SI_RATES),
    group: 'StatutoryRates',
    description: 'Kuwait Social Insurance contribution rates (Law 61/1976)',
  },
];

// ============================================================================
// Typed helpers — parse back from SystemSetting
// ============================================================================

/** Retrieve a statutory configuration from the DB and parse it as typed JSON. */
export async function getStatutoryRate<T = unknown>(
  key: string,
  prismaClient = prisma,
): Promise<T | null> {
  const record = await prismaClient.systemSetting.findUnique({ where: { key } });
  if (!record) return null;
  return JSON.parse(record.value) as T;
}

// ============================================================================
// Exported constants (for use by services without a DB round-trip)
// ============================================================================

export {
  UAE_WPS_DEFAULTS,
  UAE_EOSB_RULES,
  KSA_GOSI_RATES,
  KSA_EOSB_RULES,
  BAHRAIN_SIO_RATES,
  OMAN_PASI_RATES,
  QATAR_SI_RATES,
  KUWAIT_SI_RATES,
  STATUTORY_SETTINGS,
};

// ============================================================================
// Seed function
// ============================================================================

export async function seedGCCStatutoryData(
  prismaClient: PrismaClient = prisma,
): Promise<void> {
  console.log('\n[GCC Statutory Data] Starting seed...');

  let upserted = 0;

  for (const entry of STATUTORY_SETTINGS) {
    await prismaClient.systemSetting.upsert({
      where: { key: entry.key },
      update: {
        value:       entry.value,
        group:       entry.group,
        description: entry.description,
      },
      create: {
        key:         entry.key,
        value:       entry.value,
        group:       entry.group,
        description: entry.description,
      },
    });
    upserted++;
    console.log(`  [upsert] ${entry.key}`);
  }

  console.log(`[GCC Statutory Data] Done — ${upserted} records upserted.\n`);
}

// ============================================================================
// Standalone entry-point (ts-node direct execution)
// ============================================================================

async function main() {
  try {
    await seedGCCStatutoryData();
  } catch (err) {
    console.error('[GCC Statutory Data] Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run when executed directly (not when imported)
if (require.main === module) {
  main();
}
