import axios from 'axios';

const BASE_PATH = '/api/v1/compensation';

// ============================================================================
// TYPES
// ============================================================================

export interface TotalCompensation {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  bonus: BonusBreakdown;
  equity: EquitySummary;
  benefits: BenefitsValue;
  perks: PerksValue;
  total: number;
  currency: string;
  effectiveDate: string;
  nextReviewDate?: string;
}

export interface BonusBreakdown {
  targetAmount: number;
  actualAmount: number;
  targetPercentage: number;
  performanceMultiplier: number;
  components: BonusComponent[];
}

export interface BonusComponent {
  name: string;
  amount: number;
  type: 'annual' | 'quarterly' | 'spot' | 'signing' | 'retention';
  paidDate?: string;
}

export interface EquitySummary {
  totalGrantValue: number;
  vestedValue: number;
  unvestedValue: number;
  grantCount: number;
}

export interface BenefitsValue {
  totalAnnualValue: number;
  healthInsurance: number;
  retirement401k: number;
  lifeInsurance: number;
  disability: number;
  otherBenefits: number;
}

export interface PerksValue {
  totalAnnualValue: number;
  items: PerkItem[];
}

export interface PerkItem {
  name: string;
  value: number;
  category: string;
}

export interface SalaryBenchmark {
  jobId: string;
  jobTitle: string;
  location: string;
  currency: string;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  currentPosition: number;
  marketDataSource: string;
  lastUpdated: string;
  sampleSize: number;
  competitiveRange: CompetitiveRange;
}

export interface CompetitiveRange {
  min: number;
  max: number;
  midpoint: number;
  spread: number;
}

export interface EquityDetails {
  employeeId: string;
  grants: EquityGrant[];
  totalVested: number;
  totalUnvested: number;
  currentValue: number;
  currency: string;
  vestingScheduleSummary: VestingScheduleSummary;
}

export interface EquityGrant {
  id: string;
  grantDate: string;
  grantType: 'RSU' | 'ISO' | 'NSO' | 'SAR';
  totalShares: number;
  vestedShares: number;
  unvestedShares: number;
  exercisePrice?: number;
  currentSharePrice: number;
  vestingStartDate: string;
  vestingEndDate: string;
  cliffDate?: string;
  vestingSchedule: VestingEvent[];
  status: 'active' | 'fully_vested' | 'cancelled' | 'expired';
}

export interface VestingEvent {
  date: string;
  shares: number;
  status: 'vested' | 'upcoming' | 'cancelled';
}

export interface VestingScheduleSummary {
  nextVestingDate: string;
  nextVestingShares: number;
  remainingVestingMonths: number;
  monthlyVestingRate: number;
}

export interface CompReviewRequest {
  employeeIds?: string[];
  departmentId?: string;
  reviewType: 'annual' | 'promotion' | 'market_adjustment' | 'equity_refresh';
  effectiveDate: string;
  budgetAmount?: number;
  guidelines?: CompReviewGuidelines;
}

export interface CompReviewGuidelines {
  minIncreasePercent: number;
  maxIncreasePercent: number;
  targetBudgetUtilization: number;
  performanceWeighting: number;
  marketDataWeighting: number;
  tenureWeighting: number;
}

export interface CompReviewResult {
  id: string;
  status: 'draft' | 'in_review' | 'approved' | 'applied';
  reviewType: string;
  effectiveDate: string;
  totalBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
  employeeCount: number;
  recommendations: CompReviewRecommendation[];
  summary: CompReviewSummary;
  createdAt: string;
}

export interface CompReviewRecommendation {
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  recommendedSalary: number;
  increaseAmount: number;
  increasePercentage: number;
  reason: string;
  compaRatioBefore: number;
  compaRatioAfter: number;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
}

export interface CompReviewSummary {
  averageIncreasePercent: number;
  medianIncreasePercent: number;
  totalCost: number;
  affectedEmployees: number;
  promotionCount: number;
  marketAdjustmentCount: number;
}

export interface BudgetAllocation {
  totalBudget: number;
  allocatedAmount: number;
  remainingAmount: number;
  utilizationRate: number;
  currency: string;
  fiscalYear: string;
  departmentAllocations: DepartmentBudget[];
  categoryBreakdown: BudgetCategory[];
}

export interface DepartmentBudget {
  departmentId: string;
  departmentName: string;
  allocatedBudget: number;
  spentAmount: number;
  remainingAmount: number;
  headcount: number;
  averagePerEmployee: number;
}

export interface BudgetCategory {
  category: 'base_salary' | 'bonus' | 'equity' | 'benefits' | 'merit_increase' | 'promotion';
  allocatedAmount: number;
  spentAmount: number;
  percentage: number;
}

export interface BonusCalcRequest {
  employeeId: string;
  targetPercentage: number;
  performanceMultiplier: number;
  prorationDays?: number;
}

export interface BonusResult {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  targetPercentage: number;
  targetAmount: number;
  performanceMultiplier: number;
  prorationFactor: number;
  prorationDays: number;
  calculatedBonus: number;
  breakdown: BonusCalcBreakdown;
  effectiveDate: string;
}

export interface BonusCalcBreakdown {
  baseAmount: number;
  performanceAdjustment: number;
  prorationAdjustment: number;
  finalAmount: number;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Fetch total compensation details for a specific employee
 */
export async function getTotalCompensation(employeeId: string): Promise<TotalCompensation> {
  const response = await axios.get<TotalCompensation>(`${BASE_PATH}/employees/${employeeId}/total`);
  return response.data;
}

/**
 * Fetch salary benchmark data for a job role and optional location
 */
export async function getSalaryBenchmark(jobId: string, location?: string): Promise<SalaryBenchmark> {
  const params: Record<string, string> = {};
  if (location) {
    params.location = location;
  }
  const response = await axios.get<SalaryBenchmark>(`${BASE_PATH}/benchmarks/${jobId}`, { params });
  return response.data;
}

/**
 * Fetch equity grant details for a specific employee
 */
export async function getEquityDetails(employeeId: string): Promise<EquityDetails> {
  const response = await axios.get<EquityDetails>(`${BASE_PATH}/employees/${employeeId}/equity`);
  return response.data;
}

/**
 * Run a compensation review cycle
 */
export async function runCompensationReview(data: CompReviewRequest): Promise<CompReviewResult> {
  const response = await axios.post<CompReviewResult>(`${BASE_PATH}/reviews`, data);
  return response.data;
}

/**
 * Fetch budget allocation data, optionally filtered by department
 */
export async function getBudgetAllocation(departmentId?: string): Promise<BudgetAllocation> {
  const params: Record<string, string> = {};
  if (departmentId) {
    params.departmentId = departmentId;
  }
  const response = await axios.get<BudgetAllocation>(`${BASE_PATH}/budget`, { params });
  return response.data;
}

/**
 * Calculate bonus for an employee based on performance and proration
 */
export async function calculateBonus(data: BonusCalcRequest): Promise<BonusResult> {
  const response = await axios.post<BonusResult>(`${BASE_PATH}/bonus/calculate`, data);
  return response.data;
}
