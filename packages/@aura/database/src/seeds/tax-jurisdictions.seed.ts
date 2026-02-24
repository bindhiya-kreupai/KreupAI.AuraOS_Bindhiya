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

export const usFederalIncomeTaxHeadOfHousehold: TaxJurisdiction = {
  country: 'US',
  type: 'federal_income_tax',
  filingStatus: 'head_of_household',
  year: 2024,
  brackets: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16551, max: 63100, rate: 0.12 },
    { min: 63101, max: 100500, rate: 0.22 },
    { min: 100501, max: 191950, rate: 0.24 },
    { min: 191951, max: 243700, rate: 0.32 },
    { min: 243701, max: 609350, rate: 0.35 },
    { min: 609351, max: null, rate: 0.37 },
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

export const usFutaRate: TaxJurisdiction = {
  country: 'US',
  type: 'futa',
  year: 2024,
  brackets: [
    { min: 0, max: 7000, rate: 0.06 },   // 6% on first $7,000 (before credit)
  ],
};

export interface StateTaxRate {
  state: string;
  stateCode: string;
  hasIncomeTax: boolean;
  topRate: number;
  brackets: TaxBracket[];
}

export const usStateIncomeTaxRates: StateTaxRate[] = [
  { state: 'Alabama', stateCode: 'AL', hasIncomeTax: true, topRate: 0.05, brackets: [{ min: 0, max: 500, rate: 0.02 }, { min: 501, max: 3000, rate: 0.04 }, { min: 3001, max: null, rate: 0.05 }] },
  { state: 'Alaska', stateCode: 'AK', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'Arizona', stateCode: 'AZ', hasIncomeTax: true, topRate: 0.025, brackets: [{ min: 0, max: null, rate: 0.025 }] },
  { state: 'Arkansas', stateCode: 'AR', hasIncomeTax: true, topRate: 0.044, brackets: [{ min: 0, max: 4400, rate: 0.02 }, { min: 4401, max: 8800, rate: 0.04 }, { min: 8801, max: null, rate: 0.044 }] },
  { state: 'California', stateCode: 'CA', hasIncomeTax: true, topRate: 0.133, brackets: [{ min: 0, max: 10412, rate: 0.01 }, { min: 10413, max: 24684, rate: 0.02 }, { min: 24685, max: 38959, rate: 0.04 }, { min: 38960, max: 54081, rate: 0.06 }, { min: 54082, max: 68350, rate: 0.08 }, { min: 68351, max: 349137, rate: 0.093 }, { min: 349138, max: 418961, rate: 0.103 }, { min: 418962, max: 698271, rate: 0.113 }, { min: 698272, max: null, rate: 0.133 }] },
  { state: 'Colorado', stateCode: 'CO', hasIncomeTax: true, topRate: 0.044, brackets: [{ min: 0, max: null, rate: 0.044 }] },
  { state: 'Connecticut', stateCode: 'CT', hasIncomeTax: true, topRate: 0.0699, brackets: [{ min: 0, max: 10000, rate: 0.03 }, { min: 10001, max: 50000, rate: 0.05 }, { min: 50001, max: 100000, rate: 0.055 }, { min: 100001, max: 200000, rate: 0.06 }, { min: 200001, max: 250000, rate: 0.065 }, { min: 250001, max: 500000, rate: 0.069 }, { min: 500001, max: null, rate: 0.0699 }] },
  { state: 'Delaware', stateCode: 'DE', hasIncomeTax: true, topRate: 0.066, brackets: [{ min: 0, max: 2000, rate: 0.022 }, { min: 2001, max: 5000, rate: 0.039 }, { min: 5001, max: 10000, rate: 0.048 }, { min: 10001, max: 20000, rate: 0.052 }, { min: 20001, max: 25000, rate: 0.0555 }, { min: 25001, max: 60000, rate: 0.066 }, { min: 60001, max: null, rate: 0.066 }] },
  { state: 'Florida', stateCode: 'FL', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'Georgia', stateCode: 'GA', hasIncomeTax: true, topRate: 0.0549, brackets: [{ min: 0, max: 7000, rate: 0.01 }, { min: 7001, max: 10000, rate: 0.02 }, { min: 10001, max: null, rate: 0.0549 }] },
  { state: 'Hawaii', stateCode: 'HI', hasIncomeTax: true, topRate: 0.11, brackets: [{ min: 0, max: 2400, rate: 0.014 }, { min: 2401, max: 4800, rate: 0.032 }, { min: 4801, max: 9600, rate: 0.055 }, { min: 9601, max: 14400, rate: 0.064 }, { min: 14401, max: 19200, rate: 0.068 }, { min: 19201, max: 24000, rate: 0.072 }, { min: 24001, max: 36000, rate: 0.076 }, { min: 36001, max: 48000, rate: 0.079 }, { min: 48001, max: 150000, rate: 0.0825 }, { min: 150001, max: 175000, rate: 0.09 }, { min: 175001, max: 200000, rate: 0.10 }, { min: 200001, max: null, rate: 0.11 }] },
  { state: 'Idaho', stateCode: 'ID', hasIncomeTax: true, topRate: 0.058, brackets: [{ min: 0, max: null, rate: 0.058 }] },
  { state: 'Illinois', stateCode: 'IL', hasIncomeTax: true, topRate: 0.0495, brackets: [{ min: 0, max: null, rate: 0.0495 }] },
  { state: 'Indiana', stateCode: 'IN', hasIncomeTax: true, topRate: 0.0305, brackets: [{ min: 0, max: null, rate: 0.0305 }] },
  { state: 'Iowa', stateCode: 'IA', hasIncomeTax: true, topRate: 0.057, brackets: [{ min: 0, max: 6210, rate: 0.044 }, { min: 6211, max: 31050, rate: 0.0482 }, { min: 31051, max: null, rate: 0.057 }] },
  { state: 'Kansas', stateCode: 'KS', hasIncomeTax: true, topRate: 0.057, brackets: [{ min: 0, max: 15000, rate: 0.031 }, { min: 15001, max: 30000, rate: 0.0525 }, { min: 30001, max: null, rate: 0.057 }] },
  { state: 'Kentucky', stateCode: 'KY', hasIncomeTax: true, topRate: 0.04, brackets: [{ min: 0, max: null, rate: 0.04 }] },
  { state: 'Louisiana', stateCode: 'LA', hasIncomeTax: true, topRate: 0.0425, brackets: [{ min: 0, max: 12500, rate: 0.0185 }, { min: 12501, max: 50000, rate: 0.035 }, { min: 50001, max: null, rate: 0.0425 }] },
  { state: 'Maine', stateCode: 'ME', hasIncomeTax: true, topRate: 0.0715, brackets: [{ min: 0, max: 24500, rate: 0.058 }, { min: 24501, max: 58050, rate: 0.0675 }, { min: 58051, max: null, rate: 0.0715 }] },
  { state: 'Maryland', stateCode: 'MD', hasIncomeTax: true, topRate: 0.0575, brackets: [{ min: 0, max: 1000, rate: 0.02 }, { min: 1001, max: 2000, rate: 0.03 }, { min: 2001, max: 3000, rate: 0.04 }, { min: 3001, max: 100000, rate: 0.0475 }, { min: 100001, max: 125000, rate: 0.05 }, { min: 125001, max: 150000, rate: 0.0525 }, { min: 150001, max: 250000, rate: 0.055 }, { min: 250001, max: null, rate: 0.0575 }] },
  { state: 'Massachusetts', stateCode: 'MA', hasIncomeTax: true, topRate: 0.09, brackets: [{ min: 0, max: 1000000, rate: 0.05 }, { min: 1000001, max: null, rate: 0.09 }] },
  { state: 'Michigan', stateCode: 'MI', hasIncomeTax: true, topRate: 0.0405, brackets: [{ min: 0, max: null, rate: 0.0405 }] },
  { state: 'Minnesota', stateCode: 'MN', hasIncomeTax: true, topRate: 0.0985, brackets: [{ min: 0, max: 30070, rate: 0.0535 }, { min: 30071, max: 98760, rate: 0.068 }, { min: 98761, max: 183340, rate: 0.0785 }, { min: 183341, max: null, rate: 0.0985 }] },
  { state: 'Mississippi', stateCode: 'MS', hasIncomeTax: true, topRate: 0.05, brackets: [{ min: 0, max: 10000, rate: 0.04 }, { min: 10001, max: null, rate: 0.05 }] },
  { state: 'Missouri', stateCode: 'MO', hasIncomeTax: true, topRate: 0.048, brackets: [{ min: 0, max: 1207, rate: 0.02 }, { min: 1208, max: 2414, rate: 0.025 }, { min: 2415, max: 3621, rate: 0.03 }, { min: 3622, max: 4828, rate: 0.035 }, { min: 4829, max: 6035, rate: 0.04 }, { min: 6036, max: 7242, rate: 0.045 }, { min: 7243, max: null, rate: 0.048 }] },
  { state: 'Montana', stateCode: 'MT', hasIncomeTax: true, topRate: 0.059, brackets: [{ min: 0, max: 20500, rate: 0.047 }, { min: 20501, max: null, rate: 0.059 }] },
  { state: 'Nebraska', stateCode: 'NE', hasIncomeTax: true, topRate: 0.0564, brackets: [{ min: 0, max: 3700, rate: 0.0246 }, { min: 3701, max: 22170, rate: 0.0351 }, { min: 22171, max: 35730, rate: 0.0501 }, { min: 35731, max: null, rate: 0.0564 }] },
  { state: 'Nevada', stateCode: 'NV', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'New Hampshire', stateCode: 'NH', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'New Jersey', stateCode: 'NJ', hasIncomeTax: true, topRate: 0.1075, brackets: [{ min: 0, max: 20000, rate: 0.014 }, { min: 20001, max: 35000, rate: 0.0175 }, { min: 35001, max: 40000, rate: 0.035 }, { min: 40001, max: 75000, rate: 0.05525 }, { min: 75001, max: 500000, rate: 0.0637 }, { min: 500001, max: 1000000, rate: 0.0897 }, { min: 1000001, max: null, rate: 0.1075 }] },
  { state: 'New Mexico', stateCode: 'NM', hasIncomeTax: true, topRate: 0.059, brackets: [{ min: 0, max: 5500, rate: 0.017 }, { min: 5501, max: 11000, rate: 0.032 }, { min: 11001, max: 16000, rate: 0.047 }, { min: 16001, max: 210000, rate: 0.049 }, { min: 210001, max: null, rate: 0.059 }] },
  { state: 'New York', stateCode: 'NY', hasIncomeTax: true, topRate: 0.109, brackets: [{ min: 0, max: 8500, rate: 0.04 }, { min: 8501, max: 11700, rate: 0.045 }, { min: 11701, max: 13900, rate: 0.0525 }, { min: 13901, max: 80650, rate: 0.0585 }, { min: 80651, max: 215400, rate: 0.0625 }, { min: 215401, max: 1077550, rate: 0.0685 }, { min: 1077551, max: 5000000, rate: 0.0965 }, { min: 5000001, max: 25000000, rate: 0.103 }, { min: 25000001, max: null, rate: 0.109 }] },
  { state: 'North Carolina', stateCode: 'NC', hasIncomeTax: true, topRate: 0.045, brackets: [{ min: 0, max: null, rate: 0.045 }] },
  { state: 'North Dakota', stateCode: 'ND', hasIncomeTax: true, topRate: 0.029, brackets: [{ min: 0, max: null, rate: 0.029 }] },
  { state: 'Ohio', stateCode: 'OH', hasIncomeTax: true, topRate: 0.035, brackets: [{ min: 0, max: 26050, rate: 0.0 }, { min: 26051, max: 100000, rate: 0.028 }, { min: 100001, max: null, rate: 0.035 }] },
  { state: 'Oklahoma', stateCode: 'OK', hasIncomeTax: true, topRate: 0.0475, brackets: [{ min: 0, max: 1000, rate: 0.0025 }, { min: 1001, max: 2500, rate: 0.0075 }, { min: 2501, max: 3750, rate: 0.0175 }, { min: 3751, max: 4900, rate: 0.0275 }, { min: 4901, max: 7200, rate: 0.0375 }, { min: 7201, max: null, rate: 0.0475 }] },
  { state: 'Oregon', stateCode: 'OR', hasIncomeTax: true, topRate: 0.099, brackets: [{ min: 0, max: 4050, rate: 0.0475 }, { min: 4051, max: 10200, rate: 0.0675 }, { min: 10201, max: 125000, rate: 0.0875 }, { min: 125001, max: null, rate: 0.099 }] },
  { state: 'Pennsylvania', stateCode: 'PA', hasIncomeTax: true, topRate: 0.0307, brackets: [{ min: 0, max: null, rate: 0.0307 }] },
  { state: 'Rhode Island', stateCode: 'RI', hasIncomeTax: true, topRate: 0.0599, brackets: [{ min: 0, max: 73450, rate: 0.0375 }, { min: 73451, max: 166950, rate: 0.0475 }, { min: 166951, max: null, rate: 0.0599 }] },
  { state: 'South Carolina', stateCode: 'SC', hasIncomeTax: true, topRate: 0.064, brackets: [{ min: 0, max: 3460, rate: 0.0 }, { min: 3461, max: 17330, rate: 0.03 }, { min: 17331, max: null, rate: 0.064 }] },
  { state: 'South Dakota', stateCode: 'SD', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'Tennessee', stateCode: 'TN', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'Texas', stateCode: 'TX', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'Utah', stateCode: 'UT', hasIncomeTax: true, topRate: 0.0465, brackets: [{ min: 0, max: null, rate: 0.0465 }] },
  { state: 'Vermont', stateCode: 'VT', hasIncomeTax: true, topRate: 0.0875, brackets: [{ min: 0, max: 45400, rate: 0.0335 }, { min: 45401, max: 110050, rate: 0.066 }, { min: 110051, max: 229550, rate: 0.076 }, { min: 229551, max: null, rate: 0.0875 }] },
  { state: 'Virginia', stateCode: 'VA', hasIncomeTax: true, topRate: 0.0575, brackets: [{ min: 0, max: 3000, rate: 0.02 }, { min: 3001, max: 5000, rate: 0.03 }, { min: 5001, max: 17000, rate: 0.05 }, { min: 17001, max: null, rate: 0.0575 }] },
  { state: 'Washington', stateCode: 'WA', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'West Virginia', stateCode: 'WV', hasIncomeTax: true, topRate: 0.0512, brackets: [{ min: 0, max: 10000, rate: 0.0236 }, { min: 10001, max: 25000, rate: 0.0315 }, { min: 25001, max: 40000, rate: 0.0354 }, { min: 40001, max: 60000, rate: 0.0472 }, { min: 60001, max: null, rate: 0.0512 }] },
  { state: 'Wisconsin', stateCode: 'WI', hasIncomeTax: true, topRate: 0.0765, brackets: [{ min: 0, max: 14320, rate: 0.0354 }, { min: 14321, max: 28640, rate: 0.0465 }, { min: 28641, max: 315310, rate: 0.053 }, { min: 315311, max: null, rate: 0.0765 }] },
  { state: 'Wyoming', stateCode: 'WY', hasIncomeTax: false, topRate: 0, brackets: [] },
  { state: 'District of Columbia', stateCode: 'DC', hasIncomeTax: true, topRate: 0.1075, brackets: [{ min: 0, max: 10000, rate: 0.04 }, { min: 10001, max: 40000, rate: 0.06 }, { min: 40001, max: 60000, rate: 0.065 }, { min: 60001, max: 250000, rate: 0.085 }, { min: 250001, max: 500000, rate: 0.0925 }, { min: 500001, max: 1000000, rate: 0.0975 }, { min: 1000001, max: null, rate: 0.1075 }] },
];

export interface SutaRate {
  state: string;
  stateCode: string;
  newEmployerRate: number;
  minRate: number;
  maxRate: number;
  wageBase: number;
}

export const usStateSutaRates: SutaRate[] = [
  { state: 'Alabama', stateCode: 'AL', newEmployerRate: 0.027, minRate: 0.0065, maxRate: 0.068, wageBase: 8000 },
  { state: 'Alaska', stateCode: 'AK', newEmployerRate: 0.021, minRate: 0.01, maxRate: 0.054, wageBase: 47100 },
  { state: 'Arizona', stateCode: 'AZ', newEmployerRate: 0.02, minRate: 0.0008, maxRate: 0.204, wageBase: 8000 },
  { state: 'Arkansas', stateCode: 'AR', newEmployerRate: 0.032, minRate: 0.001, maxRate: 0.14, wageBase: 7000 },
  { state: 'California', stateCode: 'CA', newEmployerRate: 0.034, minRate: 0.015, maxRate: 0.062, wageBase: 7000 },
  { state: 'Colorado', stateCode: 'CO', newEmployerRate: 0.0171, minRate: 0.0, maxRate: 0.1212, wageBase: 20400 },
  { state: 'Connecticut', stateCode: 'CT', newEmployerRate: 0.03, minRate: 0.01, maxRate: 0.105, wageBase: 15000 },
  { state: 'Delaware', stateCode: 'DE', newEmployerRate: 0.018, minRate: 0.001, maxRate: 0.08, wageBase: 10500 },
  { state: 'Florida', stateCode: 'FL', newEmployerRate: 0.027, minRate: 0.001, maxRate: 0.054, wageBase: 7000 },
  { state: 'Georgia', stateCode: 'GA', newEmployerRate: 0.027, minRate: 0.0004, maxRate: 0.086, wageBase: 9500 },
  { state: 'Hawaii', stateCode: 'HI', newEmployerRate: 0.03, minRate: 0.0, maxRate: 0.056, wageBase: 56700 },
  { state: 'Idaho', stateCode: 'ID', newEmployerRate: 0.01, minRate: 0.0022, maxRate: 0.052, wageBase: 49900 },
  { state: 'Illinois', stateCode: 'IL', newEmployerRate: 0.0345, minRate: 0.0025, maxRate: 0.0725, wageBase: 13590 },
  { state: 'Indiana', stateCode: 'IN', newEmployerRate: 0.025, minRate: 0.005, maxRate: 0.074, wageBase: 9500 },
  { state: 'Iowa', stateCode: 'IA', newEmployerRate: 0.01, minRate: 0.0, maxRate: 0.07, wageBase: 36100 },
  { state: 'Kansas', stateCode: 'KS', newEmployerRate: 0.027, minRate: 0.0016, maxRate: 0.076, wageBase: 14000 },
  { state: 'Kentucky', stateCode: 'KY', newEmployerRate: 0.027, minRate: 0.003, maxRate: 0.09, wageBase: 11100 },
  { state: 'Louisiana', stateCode: 'LA', newEmployerRate: 0.0159, minRate: 0.006, maxRate: 0.062, wageBase: 7700 },
  { state: 'Maine', stateCode: 'ME', newEmployerRate: 0.0254, minRate: 0.0024, maxRate: 0.0554, wageBase: 12000 },
  { state: 'Maryland', stateCode: 'MD', newEmployerRate: 0.023, minRate: 0.003, maxRate: 0.075, wageBase: 8500 },
  { state: 'Massachusetts', stateCode: 'MA', newEmployerRate: 0.027, minRate: 0.0056, maxRate: 0.089, wageBase: 15000 },
  { state: 'Michigan', stateCode: 'MI', newEmployerRate: 0.027, minRate: 0.0006, maxRate: 0.1078, wageBase: 9500 },
  { state: 'Minnesota', stateCode: 'MN', newEmployerRate: 0.01, minRate: 0.001, maxRate: 0.09, wageBase: 40000 },
  { state: 'Mississippi', stateCode: 'MS', newEmployerRate: 0.027, minRate: 0.0, maxRate: 0.054, wageBase: 14000 },
  { state: 'Missouri', stateCode: 'MO', newEmployerRate: 0.0275, minRate: 0.0, maxRate: 0.09, wageBase: 10500 },
  { state: 'Montana', stateCode: 'MT', newEmployerRate: 0.013, minRate: 0.0, maxRate: 0.062, wageBase: 40500 },
  { state: 'Nebraska', stateCode: 'NE', newEmployerRate: 0.012, minRate: 0.0, maxRate: 0.054, wageBase: 9000 },
  { state: 'Nevada', stateCode: 'NV', newEmployerRate: 0.0275, minRate: 0.0025, maxRate: 0.054, wageBase: 40100 },
  { state: 'New Hampshire', stateCode: 'NH', newEmployerRate: 0.025, minRate: 0.001, maxRate: 0.075, wageBase: 14000 },
  { state: 'New Jersey', stateCode: 'NJ', newEmployerRate: 0.028, minRate: 0.004, maxRate: 0.0595, wageBase: 42300 },
  { state: 'New Mexico', stateCode: 'NM', newEmployerRate: 0.02, minRate: 0.0033, maxRate: 0.058, wageBase: 30600 },
  { state: 'New York', stateCode: 'NY', newEmployerRate: 0.04025, minRate: 0.013, maxRate: 0.092, wageBase: 12300 },
  { state: 'North Carolina', stateCode: 'NC', newEmployerRate: 0.01, minRate: 0.0006, maxRate: 0.0584, wageBase: 29600 },
  { state: 'North Dakota', stateCode: 'ND', newEmployerRate: 0.0107, minRate: 0.0008, maxRate: 0.0941, wageBase: 40800 },
  { state: 'Ohio', stateCode: 'OH', newEmployerRate: 0.027, minRate: 0.003, maxRate: 0.09, wageBase: 9000 },
  { state: 'Oklahoma', stateCode: 'OK', newEmployerRate: 0.017, minRate: 0.001, maxRate: 0.055, wageBase: 27000 },
  { state: 'Oregon', stateCode: 'OR', newEmployerRate: 0.021, minRate: 0.007, maxRate: 0.054, wageBase: 50900 },
  { state: 'Pennsylvania', stateCode: 'PA', newEmployerRate: 0.034, minRate: 0.015, maxRate: 0.102, wageBase: 10000 },
  { state: 'Rhode Island', stateCode: 'RI', newEmployerRate: 0.011, minRate: 0.009, maxRate: 0.093, wageBase: 29200 },
  { state: 'South Carolina', stateCode: 'SC', newEmployerRate: 0.027, minRate: 0.0006, maxRate: 0.054, wageBase: 14000 },
  { state: 'South Dakota', stateCode: 'SD', newEmployerRate: 0.012, minRate: 0.0, maxRate: 0.09, wageBase: 15000 },
  { state: 'Tennessee', stateCode: 'TN', newEmployerRate: 0.027, minRate: 0.001, maxRate: 0.10, wageBase: 7000 },
  { state: 'Texas', stateCode: 'TX', newEmployerRate: 0.027, minRate: 0.001, maxRate: 0.062, wageBase: 9000 },
  { state: 'Utah', stateCode: 'UT', newEmployerRate: 0.012, minRate: 0.001, maxRate: 0.074, wageBase: 44800 },
  { state: 'Vermont', stateCode: 'VT', newEmployerRate: 0.01, minRate: 0.005, maxRate: 0.055, wageBase: 14300 },
  { state: 'Virginia', stateCode: 'VA', newEmployerRate: 0.025, minRate: 0.0005, maxRate: 0.064, wageBase: 8000 },
  { state: 'Washington', stateCode: 'WA', newEmployerRate: 0.019, minRate: 0.002, maxRate: 0.055, wageBase: 67600 },
  { state: 'West Virginia', stateCode: 'WV', newEmployerRate: 0.027, minRate: 0.015, maxRate: 0.085, wageBase: 9000 },
  { state: 'Wisconsin', stateCode: 'WI', newEmployerRate: 0.029, minRate: 0.0, maxRate: 0.12, wageBase: 14000 },
  { state: 'Wyoming', stateCode: 'WY', newEmployerRate: 0.0185, minRate: 0.001, maxRate: 0.089, wageBase: 30900 },
  { state: 'District of Columbia', stateCode: 'DC', newEmployerRate: 0.027, minRate: 0.016, maxRate: 0.07, wageBase: 9000 },
];

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
  usFederalIncomeTaxHeadOfHousehold,
  usFicaRates,
  usFutaRate,
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

  // Seed US state income tax rates (all 50 states + DC)
  for (const stateRate of usStateIncomeTaxRates) {
    const key = `US_state_income_tax_${stateRate.stateCode}_2024`;
    await prisma.taxJurisdiction.upsert({
      where: { key },
      update: {
        country: 'US',
        type: `state_income_tax`,
        filingStatus: stateRate.stateCode,
        year: 2024,
        brackets: JSON.stringify(stateRate.brackets),
      },
      create: {
        key,
        country: 'US',
        type: `state_income_tax`,
        filingStatus: stateRate.stateCode,
        year: 2024,
        brackets: JSON.stringify(stateRate.brackets),
      },
    });
  }

  // Seed US state unemployment (SUTA) rates
  for (const sutaRate of usStateSutaRates) {
    const key = `US_suta_${sutaRate.stateCode}_2024`;
    await prisma.taxJurisdiction.upsert({
      where: { key },
      update: {
        country: 'US',
        type: 'suta',
        filingStatus: sutaRate.stateCode,
        year: 2024,
        brackets: JSON.stringify([
          { min: 0, max: sutaRate.wageBase, rate: sutaRate.newEmployerRate },
        ]),
      },
      create: {
        key,
        country: 'US',
        type: 'suta',
        filingStatus: sutaRate.stateCode,
        year: 2024,
        brackets: JSON.stringify([
          { min: 0, max: sutaRate.wageBase, rate: sutaRate.newEmployerRate },
        ]),
      },
    });
  }

  const totalSeeded = taxJurisdictions.length + usStateIncomeTaxRates.length + usStateSutaRates.length;
  console.log(`Seeded ${totalSeeded} tax jurisdictions (${taxJurisdictions.length} federal/international + ${usStateIncomeTaxRates.length} state income tax + ${usStateSutaRates.length} SUTA rates).`);
}
