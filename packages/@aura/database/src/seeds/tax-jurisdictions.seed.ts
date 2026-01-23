import { PrismaClient } from '@prisma/client';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxJurisdiction {
  country: string;
  type: string;
  brackets: TaxBracket[];
  year: number;
  filingStatus?: string;
}

export const usFederalIncomeTaxSingle: TaxJurisdiction = {
  country: 'US',
  type: 'federal_income_tax',
  filingStatus: 'single',
  year: 2024,
  brackets: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11601, max: 47150, rate: 0.12 },
    { min: 47151, max: 100525, rate: 0.22 },
    { min: 100526, max: 191950, rate: 0.24 },
    { min: 191951, max: 243725, rate: 0.32 },
    { min: 243726, max: 609350, rate: 0.35 },
    { min: 609351, max: null, rate: 0.37 },
  ],
};

export const usFederalIncomeTaxMarried: TaxJurisdiction = {
  country: 'US',
  type: 'federal_income_tax',
  filingStatus: 'married_filing_jointly',
  year: 2024,
  brackets: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23201, max: 94300, rate: 0.12 },
    { min: 94301, max: 201050, rate: 0.22 },
    { min: 201051, max: 383900, rate: 0.24 },
    { min: 383901, max: 487450, rate: 0.32 },
    { min: 487451, max: 731200, rate: 0.35 },
    { min: 731201, max: null, rate: 0.37 },
  ],
};

export const usFicaRates: TaxJurisdiction = {
  country: 'US',
  type: 'fica',
  year: 2024,
  brackets: [
    { min: 0, max: 168600, rate: 0.062 },       // Social Security 6.2%
    { min: 0, max: null, rate: 0.0145 },         // Medicare 1.45%
    { min: 200000, max: null, rate: 0.009 },     // Additional Medicare 0.9%
  ],
};

export const ukIncomeTax: TaxJurisdiction = {
  country: 'UK',
  type: 'income_tax',
  year: 2024,
  brackets: [
    { min: 0, max: 12570, rate: 0.0 },          // Personal Allowance
    { min: 12571, max: 50270, rate: 0.20 },     // Basic rate
    { min: 50271, max: 125140, rate: 0.40 },    // Higher rate
    { min: 125141, max: null, rate: 0.45 },     // Additional rate
  ],
};

export const ukNationalInsurance: TaxJurisdiction = {
  country: 'UK',
  type: 'national_insurance',
  year: 2024,
  brackets: [
    { min: 0, max: 12570, rate: 0.0 },
    { min: 12571, max: 50270, rate: 0.08 },
    { min: 50271, max: null, rate: 0.02 },
  ],
};

export const indiaIncomeTaxNewRegime: TaxJurisdiction = {
  country: 'IN',
  type: 'income_tax_new_regime',
  year: 2024,
  brackets: [
    { min: 0, max: 300000, rate: 0.0 },
    { min: 300001, max: 700000, rate: 0.05 },
    { min: 700001, max: 1000000, rate: 0.10 },
    { min: 1000001, max: 1200000, rate: 0.15 },
    { min: 1200001, max: 1500000, rate: 0.20 },
    { min: 1500001, max: null, rate: 0.30 },
  ],
};

export const indiaIncomeTaxOldRegime: TaxJurisdiction = {
  country: 'IN',
  type: 'income_tax_old_regime',
  year: 2024,
  brackets: [
    { min: 0, max: 250000, rate: 0.0 },
    { min: 250001, max: 500000, rate: 0.05 },
    { min: 500001, max: 1000000, rate: 0.20 },
    { min: 1000001, max: null, rate: 0.30 },
  ],
};

export const uaeTax: TaxJurisdiction = {
  country: 'AE',
  type: 'vat',
  year: 2024,
  brackets: [
    { min: 0, max: null, rate: 0.05 },  // 5% VAT, no income tax
  ],
};

export const uaeCorporateTax: TaxJurisdiction = {
  country: 'AE',
  type: 'corporate_tax',
  year: 2024,
  brackets: [
    { min: 0, max: 375000, rate: 0.0 },
    { min: 375001, max: null, rate: 0.09 },
  ],
};

export const taxJurisdictions: TaxJurisdiction[] = [
  usFederalIncomeTaxSingle,
  usFederalIncomeTaxMarried,
  usFicaRates,
  ukIncomeTax,
  ukNationalInsurance,
  indiaIncomeTaxNewRegime,
  indiaIncomeTaxOldRegime,
  uaeTax,
  uaeCorporateTax,
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding tax jurisdictions...');

  for (const jurisdiction of taxJurisdictions) {
    const key = `${jurisdiction.country}_${jurisdiction.type}_${jurisdiction.filingStatus ?? 'default'}_${jurisdiction.year}`;
    await prisma.taxJurisdiction.upsert({
      where: { key },
      update: {
        country: jurisdiction.country,
        type: jurisdiction.type,
        filingStatus: jurisdiction.filingStatus ?? null,
        year: jurisdiction.year,
        brackets: JSON.stringify(jurisdiction.brackets),
      },
      create: {
        key,
        country: jurisdiction.country,
        type: jurisdiction.type,
        filingStatus: jurisdiction.filingStatus ?? null,
        year: jurisdiction.year,
        brackets: JSON.stringify(jurisdiction.brackets),
      },
    });
  }

  console.log(`Seeded ${taxJurisdictions.length} tax jurisdictions.`);
}
