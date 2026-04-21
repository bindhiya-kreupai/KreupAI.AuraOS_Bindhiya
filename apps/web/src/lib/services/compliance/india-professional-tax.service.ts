/**
 * India Professional Tax (PT) Service
 *
 * Comprehensive state-wise Professional Tax calculation engine for all Indian states
 * that levy Professional Tax. PT is a state-level tax on employment income,
 * constitutionally capped at INR 2,500 per year (Article 276).
 *
 * Key Features:
 * - State-wise slab-based calculation for all PT-levying states
 * - Monthly and annual calculation with February adjustment handling
 * - PT return data generation (tenant-scoped)
 * - Half-yearly basis handling for Tamil Nadu and Kerala higher slabs
 * - Bilingual messages (English + Arabic)
 *
 * Legal Basis:
 * - Article 276 of the Constitution of India
 * - Respective State Professional Tax Acts
 * - Maximum cap: INR 2,500 per annum
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * All Indian states that levy Professional Tax
 */
export type IndiaState =
  | 'MH'   // Maharashtra
  | 'KA'   // Karnataka
  | 'WB'   // West Bengal
  | 'AP'   // Andhra Pradesh
  | 'TS'   // Telangana
  | 'TN'   // Tamil Nadu
  | 'GJ'   // Gujarat
  | 'MP'   // Madhya Pradesh
  | 'KL'   // Kerala
  | 'OR'   // Odisha
  | 'AS'   // Assam
  | 'ML'   // Meghalaya
  | 'TR'   // Tripura
  | 'JH'   // Jharkhand
  | 'BR'   // Bihar
  | 'CG'   // Chhattisgarh
  | 'SK';  // Sikkim

/**
 * Professional Tax slab definition
 */
export interface ProfessionalTaxSlab {
  minSalary: number;
  maxSalary: number | null;
  monthlyTax: number;
  halfYearlyTax?: number;       // For states with half-yearly collection (TN, KL higher slabs)
  isHalfYearlyBasis?: boolean;  // Whether this slab uses half-yearly collection
}

/**
 * State-level PT configuration
 */
export interface StatePTConfig {
  stateCode: IndiaState;
  stateName: string;
  stateNameLocal: string;
  maxAnnualTax: number;
  hasFebruaryAdjustment: boolean;
  februaryAmount?: number;
  februaryMinSalary?: number;
  collectionFrequency: 'MONTHLY' | 'HALF_YEARLY' | 'MIXED';
  slabs: ProfessionalTaxSlab[];
  effectiveFrom: string;  // FY start date (e.g., '2024-04-01')
  ptRegistrationPrefix: string;
}

/**
 * Result of monthly PT calculation
 */
export interface PTCalculationResult {
  stateCode: IndiaState;
  stateName: string;
  grossSalary: number;
  month: number;           // 1-12
  year: number;
  monthlyTax: number;
  isFebruaryAdjustment: boolean;
  isHalfYearlyBasis: boolean;
  halfYearlyAmount: number | null;
  applicableSlab: ProfessionalTaxSlab | null;
  annualCap: number;
  message: string;
  messageAr: string;
}

/**
 * Annual PT summary for an employee
 */
export interface PTAnnualSummary {
  stateCode: IndiaState;
  stateName: string;
  financialYear: string;  // e.g., '2024-25'
  monthlyBreakdown: Array<{
    month: number;
    year: number;
    monthName: string;
    grossSalary: number;
    ptAmount: number;
    isFebruaryAdjustment: boolean;
  }>;
  totalPTDeducted: number;
  annualCap: number;
  isCapReached: boolean;
  excessDeducted: number;
  message: string;
  messageAr: string;
}

/**
 * PT return filing data (tenant-scoped)
 */
export interface PTReturnData {
  tenantId: string;
  stateCode: IndiaState;
  stateName: string;
  returnPeriod: string;           // e.g., '2024-04' or '2024-H1'
  returnType: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';
  filingDueDate: Date;
  employerDetails: {
    ptRegistrationNumber: string;
    establishmentName: string;
    address: string;
    tanNumber?: string;
  };
  employees: Array<{
    employeeId: string;
    employeeName: string;
    designation: string;
    grossSalary: number;
    ptDeducted: number;
  }>;
  summary: {
    totalEmployees: number;
    totalGrossSalary: number;
    totalPTCollected: number;
    totalPTPayable: number;
    interestIfLate: number;
    penaltyIfLate: number;
  };
  generatedAt: Date;
  generatedBy: string;
  status: 'DRAFT' | 'VALIDATED' | 'SUBMITTED' | 'FILED' | 'REJECTED';
  message: string;
  messageAr: string;
}

// ============================================================================
// STATE CONFIGURATIONS
// ============================================================================

const STATE_PT_CONFIGS: Record<IndiaState, StatePTConfig> = {
  // -------------------------------------------------------------------
  // MAHARASHTRA
  // -------------------------------------------------------------------
  MH: {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    stateNameLocal: 'महाराष्ट्र',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: true,
    februaryAmount: 300,
    februaryMinSalary: 10001,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 7500, monthlyTax: 0 },
      { minSalary: 7501, maxSalary: 10000, monthlyTax: 175 },
      { minSalary: 10001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTRC',
  },

  // -------------------------------------------------------------------
  // KARNATAKA
  // -------------------------------------------------------------------
  KA: {
    stateCode: 'KA',
    stateName: 'Karnataka',
    stateNameLocal: 'ಕರ್ನಾಟಕ',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 200 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTKA',
  },

  // -------------------------------------------------------------------
  // WEST BENGAL
  // -------------------------------------------------------------------
  WB: {
    stateCode: 'WB',
    stateName: 'West Bengal',
    stateNameLocal: 'পশ্চিমবঙ্গ',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 10000, monthlyTax: 0 },
      { minSalary: 10001, maxSalary: 15000, monthlyTax: 110 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 130 },
      { minSalary: 25001, maxSalary: 40000, monthlyTax: 150 },
      { minSalary: 40001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTWB',
  },

  // -------------------------------------------------------------------
  // ANDHRA PRADESH
  // -------------------------------------------------------------------
  AP: {
    stateCode: 'AP',
    stateName: 'Andhra Pradesh',
    stateNameLocal: 'ఆంధ్ర ప్రదేశ్',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 20000, monthlyTax: 150 },
      { minSalary: 20001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTAP',
  },

  // -------------------------------------------------------------------
  // TELANGANA
  // -------------------------------------------------------------------
  TS: {
    stateCode: 'TS',
    stateName: 'Telangana',
    stateNameLocal: 'తెలంగాణ',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 20000, monthlyTax: 150 },
      { minSalary: 20001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTTS',
  },

  // -------------------------------------------------------------------
  // TAMIL NADU
  // -------------------------------------------------------------------
  TN: {
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    stateNameLocal: 'தமிழ்நாடு',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MIXED',
    slabs: [
      { minSalary: 0, maxSalary: 21000, monthlyTax: 0 },
      { minSalary: 21001, maxSalary: 30000, monthlyTax: 135 },
      { minSalary: 30001, maxSalary: 45000, monthlyTax: 315 },
      { minSalary: 45001, maxSalary: 60000, monthlyTax: 690 },
      { minSalary: 60001, maxSalary: 75000, monthlyTax: 1025 },
      {
        minSalary: 75001,
        maxSalary: null,
        monthlyTax: 1250,
        halfYearlyTax: 1250,
        isHalfYearlyBasis: true,
      },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTTN',
  },

  // -------------------------------------------------------------------
  // GUJARAT
  // -------------------------------------------------------------------
  GJ: {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    stateNameLocal: 'ગુજરાત',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 12000, monthlyTax: 0 },
      { minSalary: 12001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTGJ',
  },

  // -------------------------------------------------------------------
  // MADHYA PRADESH
  // -------------------------------------------------------------------
  MP: {
    stateCode: 'MP',
    stateName: 'Madhya Pradesh',
    stateNameLocal: 'मध्य प्रदेश',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: true,
    februaryAmount: 212,
    februaryMinSalary: 33334,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 18750, monthlyTax: 0 },
      { minSalary: 18751, maxSalary: 25000, monthlyTax: 125 },
      { minSalary: 25001, maxSalary: 33333, monthlyTax: 150 },
      { minSalary: 33334, maxSalary: null, monthlyTax: 208 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTMP',
  },

  // -------------------------------------------------------------------
  // KERALA
  // -------------------------------------------------------------------
  KL: {
    stateCode: 'KL',
    stateName: 'Kerala',
    stateNameLocal: 'കേരള',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MIXED',
    slabs: [
      { minSalary: 0, maxSalary: 11999, monthlyTax: 0 },
      { minSalary: 12000, maxSalary: 17999, monthlyTax: 120 },
      { minSalary: 18000, maxSalary: 24999, monthlyTax: 180 },
      { minSalary: 25000, maxSalary: 29999, monthlyTax: 250 },
      {
        minSalary: 30000,
        maxSalary: null,
        monthlyTax: 208,
        halfYearlyTax: 1250,
        isHalfYearlyBasis: true,
      },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTKL',
  },

  // -------------------------------------------------------------------
  // ODISHA
  // -------------------------------------------------------------------
  OR: {
    stateCode: 'OR',
    stateName: 'Odisha',
    stateNameLocal: 'ଓଡ଼ିଶା',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 13304, monthlyTax: 0 },
      { minSalary: 13305, maxSalary: 25000, monthlyTax: 125 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTOR',
  },

  // -------------------------------------------------------------------
  // ASSAM
  // -------------------------------------------------------------------
  AS: {
    stateCode: 'AS',
    stateName: 'Assam',
    stateNameLocal: 'অসম',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 10000, monthlyTax: 0 },
      { minSalary: 10001, maxSalary: 15000, monthlyTax: 150 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 180 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 208 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTAS',
  },

  // -------------------------------------------------------------------
  // MEGHALAYA
  // -------------------------------------------------------------------
  ML: {
    stateCode: 'ML',
    stateName: 'Meghalaya',
    stateNameLocal: 'मेघालय',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 10000, monthlyTax: 0 },
      { minSalary: 10001, maxSalary: 15000, monthlyTax: 125 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 150 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 208 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTML',
  },

  // -------------------------------------------------------------------
  // TRIPURA
  // -------------------------------------------------------------------
  TR: {
    stateCode: 'TR',
    stateName: 'Tripura',
    stateNameLocal: 'ত্রিপুরা',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 10000, monthlyTax: 0 },
      { minSalary: 10001, maxSalary: 15000, monthlyTax: 110 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 150 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 208 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTTR',
  },

  // -------------------------------------------------------------------
  // JHARKHAND
  // -------------------------------------------------------------------
  JH: {
    stateCode: 'JH',
    stateName: 'Jharkhand',
    stateNameLocal: 'झारखंड',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 150 },
      { minSalary: 25001, maxSalary: 40000, monthlyTax: 175 },
      { minSalary: 40001, maxSalary: null, monthlyTax: 208 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTJH',
  },

  // -------------------------------------------------------------------
  // BIHAR
  // -------------------------------------------------------------------
  BR: {
    stateCode: 'BR',
    stateName: 'Bihar',
    stateNameLocal: 'बिहार',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 10000, monthlyTax: 0 },
      { minSalary: 10001, maxSalary: 15000, monthlyTax: 100 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 150 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTBR',
  },

  // -------------------------------------------------------------------
  // CHHATTISGARH
  // -------------------------------------------------------------------
  CG: {
    stateCode: 'CG',
    stateName: 'Chhattisgarh',
    stateNameLocal: 'छत्तीसगढ़',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 20000, monthlyTax: 125 },
      { minSalary: 20001, maxSalary: 30000, monthlyTax: 150 },
      { minSalary: 30001, maxSalary: null, monthlyTax: 208 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTCG',
  },

  // -------------------------------------------------------------------
  // SIKKIM
  // -------------------------------------------------------------------
  SK: {
    stateCode: 'SK',
    stateName: 'Sikkim',
    stateNameLocal: 'सिक्किम',
    maxAnnualTax: 2500,
    hasFebruaryAdjustment: false,
    collectionFrequency: 'MONTHLY',
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 125 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 200 },
    ],
    effectiveFrom: '2024-04-01',
    ptRegistrationPrefix: 'PTSK',
  },
};

// ============================================================================
// MONTH NAMES (for display purposes)
// ============================================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// ============================================================================
// INDIA PROFESSIONAL TAX SERVICE
// ============================================================================

export class IndiaProfessionalTaxService {
  // ==========================================================================
  // PRIMARY CALCULATION METHODS
  // ==========================================================================

  /**
   * Calculate monthly Professional Tax for a given state and gross salary.
   *
   * @param state - Indian state code (e.g., 'MH', 'KA', 'WB')
   * @param grossSalary - Monthly gross salary in INR
   * @param month - Month number (1-12, where 2 = February)
   * @param year - Calendar year (optional, defaults to current year)
   * @returns PTCalculationResult with tax amount and details
   */
  static calculateMonthlyPT(
    state: IndiaState,
    grossSalary: number,
    month: number,
    year?: number
  ): PTCalculationResult {
    const config = STATE_PT_CONFIGS[state];

    if (!config) {
      return {
        stateCode: state,
        stateName: 'Unknown',
        grossSalary,
        month,
        year: year || new Date().getFullYear(),
        monthlyTax: 0,
        isFebruaryAdjustment: false,
        isHalfYearlyBasis: false,
        halfYearlyAmount: null,
        applicableSlab: null,
        annualCap: 2500,
        message: `Professional Tax is not applicable or state '${state}' is not recognized.`,
        messageAr: `ضريبة المهنة غير مطبقة أو أن الولاية '${state}' غير معروفة.`,
      };
    }

    const effectiveYear = year || new Date().getFullYear();
    const isFebruary = month === 2;

    // Find applicable slab
    const applicableSlab = this.findApplicableSlab(config.slabs, grossSalary);

    if (!applicableSlab) {
      return {
        stateCode: state,
        stateName: config.stateName,
        grossSalary,
        month,
        year: effectiveYear,
        monthlyTax: 0,
        isFebruaryAdjustment: false,
        isHalfYearlyBasis: false,
        halfYearlyAmount: null,
        applicableSlab: null,
        annualCap: config.maxAnnualTax,
        message: `No Professional Tax applicable for salary INR ${grossSalary.toLocaleString('en-IN')} in ${config.stateName}.`,
        messageAr: `لا تنطبق ضريبة المهنة على الراتب ${grossSalary.toLocaleString('en-IN')} روبية هندية في ${config.stateName}.`,
      };
    }

    let monthlyTax = applicableSlab.monthlyTax;
    let isFebruaryAdjustment = false;
    let isHalfYearlyBasis = applicableSlab.isHalfYearlyBasis || false;
    let halfYearlyAmount: number | null = null;

    // Handle half-yearly basis (TN, KL higher slabs)
    if (isHalfYearlyBasis && applicableSlab.halfYearlyTax) {
      halfYearlyAmount = applicableSlab.halfYearlyTax;
      // For half-yearly, distribute evenly across months or collect at half-year boundary
      monthlyTax = Math.round(applicableSlab.halfYearlyTax / 6);
    }

    // Handle February adjustment for states that do it (MH, MP)
    if (isFebruary && config.hasFebruaryAdjustment) {
      if (config.februaryMinSalary && grossSalary >= config.februaryMinSalary && config.februaryAmount) {
        monthlyTax = config.februaryAmount;
        isFebruaryAdjustment = true;
      }
    }

    // Ensure we never exceed annual cap proportionally in a single month
    const maxMonthlyAllowed = config.maxAnnualTax;
    monthlyTax = Math.min(monthlyTax, maxMonthlyAllowed);

    const monthName = MONTH_NAMES[month - 1] || 'Unknown';

    return {
      stateCode: state,
      stateName: config.stateName,
      grossSalary,
      month,
      year: effectiveYear,
      monthlyTax,
      isFebruaryAdjustment,
      isHalfYearlyBasis,
      halfYearlyAmount,
      applicableSlab,
      annualCap: config.maxAnnualTax,
      message: monthlyTax > 0
        ? `Professional Tax of INR ${monthlyTax} applicable for ${monthName} ${effectiveYear} in ${config.stateName} (Gross: INR ${grossSalary.toLocaleString('en-IN')}).${isFebruaryAdjustment ? ' February adjustment applied.' : ''}${isHalfYearlyBasis ? ' Collected on half-yearly basis.' : ''}`
        : `No Professional Tax applicable for ${monthName} ${effectiveYear} in ${config.stateName} (Gross: INR ${grossSalary.toLocaleString('en-IN')}).`,
      messageAr: monthlyTax > 0
        ? `ضريبة مهنية بقيمة ${monthlyTax} روبية هندية مطبقة لشهر ${MONTH_NAMES_AR[month - 1]} ${effectiveYear} في ${config.stateName} (إجمالي: ${grossSalary.toLocaleString('en-IN')} روبية هندية).${isFebruaryAdjustment ? ' تم تطبيق تعديل فبراير.' : ''}${isHalfYearlyBasis ? ' يتم التحصيل على أساس نصف سنوي.' : ''}`
        : `لا تنطبق ضريبة المهنة لشهر ${MONTH_NAMES_AR[month - 1]} ${effectiveYear} في ${config.stateName} (إجمالي: ${grossSalary.toLocaleString('en-IN')} روبية هندية).`,
    };
  }

  /**
   * Calculate annual Professional Tax based on monthly salary data.
   * Ensures the annual cap of INR 2,500 is not breached.
   *
   * @param state - Indian state code
   * @param monthlySalaries - Array of 12 monthly gross salaries (Apr-Mar)
   * @param startYear - Financial year start year (e.g., 2024 for FY 2024-25)
   * @returns PTAnnualSummary with month-wise breakdown and totals
   */
  static calculateAnnualPT(
    state: IndiaState,
    monthlySalaries: number[],
    startYear?: number
  ): PTAnnualSummary {
    const config = STATE_PT_CONFIGS[state];
    const fyStartYear = startYear || new Date().getFullYear();
    const financialYear = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;

    if (!config) {
      return {
        stateCode: state,
        stateName: 'Unknown',
        financialYear,
        monthlyBreakdown: [],
        totalPTDeducted: 0,
        annualCap: 2500,
        isCapReached: false,
        excessDeducted: 0,
        message: `State '${state}' is not recognized for Professional Tax calculation.`,
        messageAr: `الولاية '${state}' غير معروفة لحساب ضريبة المهنة.`,
      };
    }

    // Financial year months: April (4) to March (3) of next year
    const fyMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
    const monthlyBreakdown: PTAnnualSummary['monthlyBreakdown'] = [];
    let runningTotal = 0;

    for (let i = 0; i < 12; i++) {
      const salary = monthlySalaries[i] || 0;
      const month = fyMonths[i];
      const year = month >= 4 ? fyStartYear : fyStartYear + 1;

      const result = this.calculateMonthlyPT(state, salary, month, year);
      let ptAmount = result.monthlyTax;

      // Enforce annual cap
      if (runningTotal + ptAmount > config.maxAnnualTax) {
        ptAmount = Math.max(0, config.maxAnnualTax - runningTotal);
      }
      runningTotal += ptAmount;

      monthlyBreakdown.push({
        month,
        year,
        monthName: MONTH_NAMES[month - 1],
        grossSalary: salary,
        ptAmount,
        isFebruaryAdjustment: result.isFebruaryAdjustment,
      });
    }

    const totalPTDeducted = monthlyBreakdown.reduce((sum, m) => sum + m.ptAmount, 0);
    const isCapReached = totalPTDeducted >= config.maxAnnualTax;
    const excessDeducted = Math.max(0, totalPTDeducted - config.maxAnnualTax);

    return {
      stateCode: state,
      stateName: config.stateName,
      financialYear,
      monthlyBreakdown,
      totalPTDeducted,
      annualCap: config.maxAnnualTax,
      isCapReached,
      excessDeducted,
      message: `Professional Tax for FY ${financialYear} in ${config.stateName}: Total INR ${totalPTDeducted.toLocaleString('en-IN')} deducted (Cap: INR ${config.maxAnnualTax.toLocaleString('en-IN')}).${isCapReached ? ' Annual cap reached.' : ''}`,
      messageAr: `ضريبة المهنة للسنة المالية ${financialYear} في ${config.stateName}: إجمالي ${totalPTDeducted.toLocaleString('en-IN')} روبية هندية مخصومة (الحد الأقصى: ${config.maxAnnualTax.toLocaleString('en-IN')} روبية هندية).${isCapReached ? ' تم الوصول إلى الحد الأقصى السنوي.' : ''}`,
    };
  }

  // ==========================================================================
  // RETURN GENERATION
  // ==========================================================================

  /**
   * Generate Professional Tax return data for filing.
   * This is tenant-scoped and includes all employee details for the period.
   *
   * @param tenantId - Tenant identifier for multi-tenancy
   * @param state - Indian state code
   * @param month - Month number (1-12)
   * @param year - Calendar year
   * @param employees - Employee data for the period
   * @param employerDetails - Employer/establishment registration details
   * @returns PTReturnData ready for filing
   */
  static generatePTReturn(
    tenantId: string,
    state: IndiaState,
    month: number,
    year?: number,
    employees?: Array<{
      employeeId: string;
      employeeName: string;
      designation: string;
      grossSalary: number;
    }>,
    employerDetails?: {
      ptRegistrationNumber: string;
      establishmentName: string;
      address: string;
      tanNumber?: string;
    }
  ): PTReturnData {
    const config = STATE_PT_CONFIGS[state];
    const effectiveYear = year || new Date().getFullYear();
    const returnPeriod = `${effectiveYear}-${month.toString().padStart(2, '0')}`;

    if (!config) {
      return {
        tenantId,
        stateCode: state,
        stateName: 'Unknown',
        returnPeriod,
        returnType: 'MONTHLY',
        filingDueDate: new Date(),
        employerDetails: employerDetails || {
          ptRegistrationNumber: '',
          establishmentName: '',
          address: '',
        },
        employees: [],
        summary: {
          totalEmployees: 0,
          totalGrossSalary: 0,
          totalPTCollected: 0,
          totalPTPayable: 0,
          interestIfLate: 0,
          penaltyIfLate: 0,
        },
        generatedAt: new Date(),
        generatedBy: 'system',
        status: 'DRAFT',
        message: `Invalid state code '${state}' for PT return generation.`,
        messageAr: `رمز الولاية '${state}' غير صالح لإنشاء إقرار ضريبة المهنة.`,
      };
    }

    // Calculate PT for each employee
    const employeeRecords = (employees || []).map(emp => {
      const ptResult = this.calculateMonthlyPT(state, emp.grossSalary, month, effectiveYear);
      return {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        designation: emp.designation,
        grossSalary: emp.grossSalary,
        ptDeducted: ptResult.monthlyTax,
      };
    });

    const totalGrossSalary = employeeRecords.reduce((sum, e) => sum + e.grossSalary, 0);
    const totalPTCollected = employeeRecords.reduce((sum, e) => sum + e.ptDeducted, 0);

    // Filing due date: typically 15th or 21st of the following month (varies by state)
    const filingDueDate = this.getFilingDueDate(state, month, effectiveYear);

    // Calculate late filing interest and penalty
    const now = new Date();
    const isLate = now > filingDueDate;
    const interestIfLate = isLate ? Math.round(totalPTCollected * 0.0125) : 0; // 1.25% per month
    const penaltyIfLate = isLate ? Math.round(totalPTCollected * 0.10) : 0;    // 10% penalty

    // Determine return type based on state collection frequency
    let returnType: PTReturnData['returnType'] = 'MONTHLY';
    if (config.collectionFrequency === 'HALF_YEARLY') {
      returnType = 'HALF_YEARLY';
    }

    const monthName = MONTH_NAMES[month - 1];

    return {
      tenantId,
      stateCode: state,
      stateName: config.stateName,
      returnPeriod,
      returnType,
      filingDueDate,
      employerDetails: employerDetails || {
        ptRegistrationNumber: `${config.ptRegistrationPrefix}-PENDING`,
        establishmentName: '',
        address: '',
      },
      employees: employeeRecords,
      summary: {
        totalEmployees: employeeRecords.length,
        totalGrossSalary,
        totalPTCollected,
        totalPTPayable: totalPTCollected,
        interestIfLate,
        penaltyIfLate,
      },
      generatedAt: new Date(),
      generatedBy: 'system',
      status: 'DRAFT',
      message: `PT Return for ${config.stateName} - ${monthName} ${effectiveYear}: ${employeeRecords.length} employees, Total PT: INR ${totalPTCollected.toLocaleString('en-IN')}.${isLate ? ` LATE FILING: Interest INR ${interestIfLate}, Penalty INR ${penaltyIfLate}.` : ` Due by: ${filingDueDate.toLocaleDateString('en-IN')}.`}`,
      messageAr: `إقرار ضريبة المهنة لـ ${config.stateName} - ${MONTH_NAMES_AR[month - 1]} ${effectiveYear}: ${employeeRecords.length} موظف، إجمالي الضريبة: ${totalPTCollected.toLocaleString('en-IN')} روبية هندية.${isLate ? ` تأخر التقديم: فائدة ${interestIfLate} روبية هندية، غرامة ${penaltyIfLate} روبية هندية.` : ` الموعد النهائي: ${filingDueDate.toLocaleDateString('ar-EG')}.`}`,
    };
  }

  // ==========================================================================
  // SLAB & STATE INFORMATION METHODS
  // ==========================================================================

  /**
   * Get Professional Tax slabs for a given state.
   *
   * @param state - Indian state code
   * @returns Array of ProfessionalTaxSlab for the state, or empty array if not found
   */
  static getSlabs(state: IndiaState): ProfessionalTaxSlab[] {
    const config = STATE_PT_CONFIGS[state];
    if (!config) {
      return [];
    }
    return [...config.slabs];
  }

  /**
   * Get full PT configuration for a state.
   *
   * @param state - Indian state code
   * @returns StatePTConfig or null if state not found
   */
  static getStateConfig(state: IndiaState): StatePTConfig | null {
    return STATE_PT_CONFIGS[state] ? { ...STATE_PT_CONFIGS[state] } : null;
  }

  /**
   * Get all supported states that levy Professional Tax.
   *
   * @returns Array of state info objects with code, name, and local name
   */
  static getSupportedStates(): Array<{
    code: IndiaState;
    name: string;
    nameLocal: string;
    maxAnnualTax: number;
    collectionFrequency: string;
  }> {
    return Object.values(STATE_PT_CONFIGS).map(config => ({
      code: config.stateCode,
      name: config.stateName,
      nameLocal: config.stateNameLocal,
      maxAnnualTax: config.maxAnnualTax,
      collectionFrequency: config.collectionFrequency,
    }));
  }

  /**
   * Check if a state levies Professional Tax.
   *
   * @param state - Indian state code
   * @returns true if the state levies PT
   */
  static isStatePTApplicable(state: string): boolean {
    return state in STATE_PT_CONFIGS;
  }

  // ==========================================================================
  // UTILITY & VALIDATION METHODS
  // ==========================================================================

  /**
   * Validate PT registration number format for a given state.
   *
   * @param state - Indian state code
   * @param registrationNumber - PT registration number to validate
   * @returns Validation result with bilingual messages
   */
  static validatePTRegistration(
    state: IndiaState,
    registrationNumber: string
  ): { isValid: boolean; message: string; messageAr: string } {
    const config = STATE_PT_CONFIGS[state];

    if (!config) {
      return {
        isValid: false,
        message: `State '${state}' is not recognized for PT registration validation.`,
        messageAr: `الولاية '${state}' غير معروفة للتحقق من تسجيل ضريبة المهنة.`,
      };
    }

    if (!registrationNumber || registrationNumber.trim().length === 0) {
      return {
        isValid: false,
        message: 'PT registration number is required.',
        messageAr: 'رقم تسجيل ضريبة المهنة مطلوب.',
      };
    }

    // Basic format validation (state-specific prefixes)
    const isValidFormat = registrationNumber.length >= 8 && registrationNumber.length <= 20;

    if (!isValidFormat) {
      return {
        isValid: false,
        message: `Invalid PT registration number format for ${config.stateName}. Expected 8-20 characters.`,
        messageAr: `تنسيق رقم تسجيل ضريبة المهنة غير صالح لـ ${config.stateName}. يجب أن يكون 8-20 حرفاً.`,
      };
    }

    return {
      isValid: true,
      message: `PT registration number validated for ${config.stateName}.`,
      messageAr: `تم التحقق من رقم تسجيل ضريبة المهنة لـ ${config.stateName}.`,
    };
  }

  /**
   * Calculate the effective date range for a financial year.
   *
   * @param financialYear - FY string (e.g., '2024-25') or start year
   * @returns Object with start and end dates
   */
  static getFinancialYearRange(financialYear: string | number): { start: Date; end: Date } {
    let startYear: number;

    if (typeof financialYear === 'string') {
      startYear = parseInt(financialYear.split('-')[0], 10);
    } else {
      startYear = financialYear;
    }

    return {
      start: new Date(startYear, 3, 1),     // April 1
      end: new Date(startYear + 1, 2, 31),  // March 31
    };
  }

  /**
   * Get the states that have a February adjustment in PT collection.
   * (States where a different amount is deducted in February to match the annual cap)
   *
   * @returns Array of state codes with February adjustment details
   */
  static getFebruaryAdjustmentStates(): Array<{
    stateCode: IndiaState;
    stateName: string;
    februaryAmount: number;
    regularAmount: number;
    message: string;
    messageAr: string;
  }> {
    return Object.values(STATE_PT_CONFIGS)
      .filter(config => config.hasFebruaryAdjustment)
      .map(config => {
        const highestSlab = config.slabs[config.slabs.length - 1];
        return {
          stateCode: config.stateCode,
          stateName: config.stateName,
          februaryAmount: config.februaryAmount || 0,
          regularAmount: highestSlab.monthlyTax,
          message: `${config.stateName}: Regular INR ${highestSlab.monthlyTax}/month, February INR ${config.februaryAmount} (to achieve annual cap of INR ${config.maxAnnualTax}).`,
          messageAr: `${config.stateName}: العادي ${highestSlab.monthlyTax} روبية هندية/شهر، فبراير ${config.februaryAmount} روبية هندية (لتحقيق الحد الأقصى السنوي ${config.maxAnnualTax} روبية هندية).`,
        };
      });
  }

  /**
   * Get states that collect PT on a half-yearly basis for higher salary slabs.
   *
   * @returns Array of states with half-yearly collection details
   */
  static getHalfYearlyStates(): Array<{
    stateCode: IndiaState;
    stateName: string;
    thresholdSalary: number;
    halfYearlyAmount: number;
    message: string;
    messageAr: string;
  }> {
    const results: Array<{
      stateCode: IndiaState;
      stateName: string;
      thresholdSalary: number;
      halfYearlyAmount: number;
      message: string;
      messageAr: string;
    }> = [];

    Object.values(STATE_PT_CONFIGS).forEach(config => {
      const halfYearlySlab = config.slabs.find(slab => slab.isHalfYearlyBasis);
      if (halfYearlySlab) {
        results.push({
          stateCode: config.stateCode,
          stateName: config.stateName,
          thresholdSalary: halfYearlySlab.minSalary,
          halfYearlyAmount: halfYearlySlab.halfYearlyTax || 0,
          message: `${config.stateName}: Salary above INR ${halfYearlySlab.minSalary.toLocaleString('en-IN')} - PT collected half-yearly at INR ${halfYearlySlab.halfYearlyTax}.`,
          messageAr: `${config.stateName}: الراتب أعلى من ${halfYearlySlab.minSalary.toLocaleString('en-IN')} روبية هندية - يتم تحصيل ضريبة المهنة نصف سنوياً بمبلغ ${halfYearlySlab.halfYearlyTax} روبية هندية.`,
        });
      }
    });

    return results;
  }

  /**
   * Compare PT liability across multiple states for a given salary.
   * Useful for employees who may relocate.
   *
   * @param grossSalary - Monthly gross salary
   * @param states - Array of states to compare (defaults to all)
   * @returns Comparison array sorted by PT amount (ascending)
   */
  static comparePTAcrossStates(
    grossSalary: number,
    states?: IndiaState[]
  ): Array<{
    stateCode: IndiaState;
    stateName: string;
    monthlyPT: number;
    annualPT: number;
    message: string;
    messageAr: string;
  }> {
    const statesToCompare = states || (Object.keys(STATE_PT_CONFIGS) as IndiaState[]);

    const results = statesToCompare.map(state => {
      const config = STATE_PT_CONFIGS[state];
      if (!config) {
        return {
          stateCode: state,
          stateName: 'Unknown',
          monthlyPT: 0,
          annualPT: 0,
          message: `State '${state}' not found.`,
          messageAr: `الولاية '${state}' غير موجودة.`,
        };
      }

      const result = this.calculateMonthlyPT(state, grossSalary, 6); // June as neutral month
      const annualPT = Math.min(result.monthlyTax * 12, config.maxAnnualTax);

      return {
        stateCode: state,
        stateName: config.stateName,
        monthlyPT: result.monthlyTax,
        annualPT,
        message: `${config.stateName}: INR ${result.monthlyTax}/month, INR ${annualPT}/year for salary INR ${grossSalary.toLocaleString('en-IN')}.`,
        messageAr: `${config.stateName}: ${result.monthlyTax} روبية هندية/شهر، ${annualPT} روبية هندية/سنة لراتب ${grossSalary.toLocaleString('en-IN')} روبية هندية.`,
      };
    });

    // Sort by monthly PT ascending
    return results.sort((a, b) => a.monthlyPT - b.monthlyPT);
  }

  /**
   * Calculate PT deduction schedule for an employee joining mid-year.
   *
   * @param state - Indian state code
   * @param grossSalary - Monthly gross salary
   * @param joiningMonth - Month of joining (1-12)
   * @param joiningYear - Year of joining
   * @returns Annual summary from joining month to March
   */
  static calculateProRataPT(
    state: IndiaState,
    grossSalary: number,
    joiningMonth: number,
    joiningYear: number
  ): PTAnnualSummary {
    // Determine FY start year
    const fyStartYear = joiningMonth >= 4 ? joiningYear : joiningYear - 1;

    // Create salary array: 0 for months before joining, grossSalary after
    const fyMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
    const monthlySalaries: number[] = [];

    for (let i = 0; i < 12; i++) {
      const month = fyMonths[i];
      const year = month >= 4 ? fyStartYear : fyStartYear + 1;

      // Check if this month is on or after joining
      const monthDate = new Date(year, month - 1, 1);
      const joiningDate = new Date(joiningYear, joiningMonth - 1, 1);

      monthlySalaries.push(monthDate >= joiningDate ? grossSalary : 0);
    }

    return this.calculateAnnualPT(state, monthlySalaries, fyStartYear);
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Find the applicable slab for a given salary amount.
   */
  private static findApplicableSlab(
    slabs: ProfessionalTaxSlab[],
    grossSalary: number
  ): ProfessionalTaxSlab | null {
    for (const slab of slabs) {
      const matchesMin = grossSalary >= slab.minSalary;
      const matchesMax = slab.maxSalary === null || grossSalary <= slab.maxSalary;

      if (matchesMin && matchesMax) {
        return slab;
      }
    }
    return null;
  }

  /**
   * Get the filing due date for PT return based on state and period.
   * Most states require filing by the 15th or 21st of the following month.
   */
  private static getFilingDueDate(state: IndiaState, month: number, year: number): Date {
    // Default: due by 15th of the following month
    let dueDayOfMonth = 15;

    // State-specific due dates
    switch (state) {
      case 'MH':
        dueDayOfMonth = 21; // Maharashtra: 21st of following month
        break;
      case 'KA':
        dueDayOfMonth = 20; // Karnataka: 20th of following month
        break;
      case 'WB':
        dueDayOfMonth = 21; // West Bengal: 21st of following month
        break;
      case 'TN':
        dueDayOfMonth = 15; // Tamil Nadu: 15th of following month
        break;
      case 'GJ':
        dueDayOfMonth = 15; // Gujarat: 15th of following month
        break;
      case 'AP':
      case 'TS':
        dueDayOfMonth = 15; // AP/Telangana: 15th of following month
        break;
      case 'MP':
        dueDayOfMonth = 15; // Madhya Pradesh: 15th of following month
        break;
      case 'KL':
        dueDayOfMonth = 15; // Kerala: 15th of following month
        break;
      case 'OR':
        dueDayOfMonth = 15; // Odisha: 15th of following month
        break;
      default:
        dueDayOfMonth = 15;
    }

    // Next month calculation
    let dueMonth = month + 1;
    let dueYear = year;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }

    return new Date(dueYear, dueMonth - 1, dueDayOfMonth);
  }
}

export default IndiaProfessionalTaxService;
