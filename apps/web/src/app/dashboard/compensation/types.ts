/**
 * Compensation Module - Type Definitions
 * 
 * Comprehensive TypeScript interfaces for compensation management including:
 * - Salary Structures & Components
 * - Grade & Band Management
 * - Increment Planning & Processing
 * - Bonus Management
 * - Stock Options & Equity
 * - Loans & Advances
 * - Arrears Processing
 * - Total Rewards Statements
 * - Market Benchmarking
 * - Budget Simulation
 * - Compensation Analytics
 */

// Core Enums
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'SGD';
export type PayFrequency = 'monthly' | 'bi_weekly' | 'weekly' | 'quarterly' | 'annually';
export type ComponentType = 'earning' | 'deduction' | 'employer_contribution';
export type CalculationType = 'fixed' | 'percentage_of_basic' | 'percentage_of_gross' | 'percentage_of_ctc' | 'formula';
export type GradeType = 'executive' | 'management' | 'professional' | 'operational' | 'entry_level';
export type IncrementType = 'merit' | 'promotion' | 'market_adjustment' | 'cost_of_living' | 'retention';
export type BonusType = 'performance' | 'annual' | 'festival' | 'retention' | 'signing' | 'referral' | 'project';
export type StockType = 'RSU' | 'ESOP' | 'stock_options' | 'phantom_stock' | 'SAR';
export type VestingSchedule = 'immediate' | 'cliff' | 'graded' | 'performance_based';
export type LoanType = 'personal' | 'housing' | 'vehicle' | 'education' | 'emergency';
export type LoanStatus = 'pending' | 'approved' | 'active' | 'rejected' | 'fully_repaid' | 'written_off';
export type ArrearsType = 'salary_revision' | 'increment' | 'promotion' | 'pay_adjustment' | 'correction';
export type BenchmarkSource = 'market_survey' | 'industry_report' | 'government_data' | 'internal_analysis';

// Salary Structure & Components
export interface SalaryComponent {
    id: string;
    componentCode: string;
    componentName: string;
    type: ComponentType;
    calculationType: CalculationType;
    isStatutory: boolean;
    isTaxable: boolean;
    isPartOfCTC: boolean;
    isPartOfGross: boolean;
    isPartOfBasic: boolean;
    defaultValue?: number;
    formula?: string;
    minValue?: number;
    maxValue?: number;
    displayOrder: number;
    isActive: boolean;
    description?: string;
    glCode?: string; // General Ledger code
    createdAt: string;
    updatedAt: string;
}

export interface SalaryStructure {
    id: string;
    structureCode: string;
    structureName: string;
    description: string;
    gradeId: string;
    gradeName: string;
    effectiveFrom: string;
    effectiveTo?: string;
    currency: CurrencyCode;
    payFrequency: PayFrequency;
    components: StructureComponent[];
    isTemplate: boolean;
    isActive: boolean;
    applicableCount: number; // Number of employees using this structure
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface StructureComponent {
    componentId: string;
    componentCode: string;
    componentName: string;
    type: ComponentType;
    calculationType: CalculationType;
    value?: number;
    percentage?: number;
    formula?: string;
    isMandatory: boolean;
    displayOrder: number;
}

export interface EmployeeCompensation {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentId: string;
    departmentName: string;
    positionId: string;
    positionTitle: string;
    gradeId: string;
    gradeName: string;
    structureId: string;
    structureName: string;
    effectiveFrom: string;
    effectiveTo?: string;
    currency: CurrencyCode;
    payFrequency: PayFrequency;
    annualCTC: number;
    monthlyCTC: number;
    annualGross: number;
    monthlyGross: number;
    annualBasic: number;
    monthlyBasic: number;
    components: CompensationComponent[];
    lastRevisionDate?: string;
    nextReviewDate?: string;
    isActive: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CompensationComponent {
    componentId: string;
    componentCode: string;
    componentName: string;
    type: ComponentType;
    calculationType: CalculationType;
    annualAmount: number;
    monthlyAmount: number;
    percentage?: number;
    isVariable: boolean;
    isTaxable: boolean;
}

// Grade & Band Management
export interface Grade {
    id: string;
    gradeCode: string;
    gradeName: string;
    gradeType: GradeType;
    level: number;
    description: string;
    bands: SalaryBand[];
    competencies: string[];
    responsibilities: string[];
    minimumExperience: number; // Years
    educationRequired: string;
    reportingLevel: number;
    employeeCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SalaryBand {
    id: string;
    gradeId: string;
    bandName: string;
    currency: CurrencyCode;
    minSalary: number;
    midSalary: number;
    maxSalary: number;
    spreadPercentage: number; // (max - min) / min * 100
    market25thPercentile?: number;
    market50thPercentile?: number;
    market75thPercentile?: number;
    effectiveFrom: string;
    effectiveTo?: string;
    employeeCount: number;
    averageSalary: number;
    createdAt: string;
    updatedAt: string;
}

export interface CompaRatio {
    employeeId: string;
    employeeName: string;
    gradeId: string;
    gradeName: string;
    actualSalary: number;
    midpoint: number;
    compaRatio: number; // actualSalary / midpoint
    position: 'below_range' | 'in_range' | 'above_range';
    percentile: number;
}

// Increment Planning
export interface IncrementCycle {
    id: string;
    cycleCode: string;
    cycleName: string;
    fiscalYear: string;
    incrementType: IncrementType;
    effectiveDate: string;
    budgetAmount: number;
    budgetPercentage: number;
    currency: CurrencyCode;
    status: 'draft' | 'in_progress' | 'pending_approval' | 'approved' | 'processed' | 'cancelled';
    eligibilityCriteria: EligibilityCriteria;
    departments: DepartmentBudget[];
    totalAllocated: number;
    totalUsed: number;
    employeesEligible: number;
    employeesProcessed: number;
    approvers: Approver[];
    startDate: string;
    endDate: string;
    processedDate?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface EligibilityCriteria {
    minTenureMonths: number;
    minPerformanceRating?: 'exceptional' | 'high' | 'solid' | 'developing';
    excludeProbation: boolean;
    excludeNotices: boolean;
    excludePIP: boolean;
    specificGrades?: string[];
    specificDepartments?: string[];
}

export interface DepartmentBudget {
    departmentId: string;
    departmentName: string;
    budgetAmount: number;
    budgetPercentage: number;
    allocatedAmount: number;
    usedAmount: number;
    employeeCount: number;
}

export interface IncrementProposal {
    id: string;
    cycleId: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentId: string;
    departmentName: string;
    gradeId: string;
    gradeName: string;
    currentSalary: number;
    proposedSalary: number;
    incrementAmount: number;
    incrementPercentage: number;
    incrementType: IncrementType;
    effectiveDate: string;
    performanceRating?: string;
    justification: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'processed';
    submittedBy: string;
    submittedDate?: string;
    approvedBy?: string;
    approvedDate?: string;
    rejectionReason?: string;
    processedDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Bonus Management
export interface BonusScheme {
    id: string;
    schemeCode: string;
    schemeName: string;
    bonusType: BonusType;
    description: string;
    fiscalYear: string;
    eligibilityCriteria: EligibilityCriteria;
    payoutCriteria: PayoutCriteria;
    budgetAmount: number;
    currency: CurrencyCode;
    payoutDate: string;
    status: 'draft' | 'active' | 'in_review' | 'approved' | 'processed' | 'cancelled';
    isRecurring: boolean;
    frequency?: 'quarterly' | 'biannual' | 'annual';
    applicableGrades: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface PayoutCriteria {
    baseCalculation: 'percentage_of_salary' | 'fixed_amount' | 'formula' | 'performance_multiplier';
    minPayout: number;
    maxPayout: number;
    performanceLinkage: boolean;
    performanceWeightage?: number;
    companyPerformanceWeightage?: number;
    individualPerformanceWeightage?: number;
}

export interface BonusPayout {
    id: string;
    schemeId: string;
    schemeName: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentId: string;
    departmentName: string;
    gradeId: string;
    gradeName: string;
    targetAmount: number;
    achievedAmount: number;
    payoutAmount: number;
    payoutPercentage: number;
    performanceScore?: number;
    companyPerformanceScore?: number;
    individualPerformanceScore?: number;
    calculation: string;
    payoutDate: string;
    status: 'draft' | 'approved' | 'processed' | 'paid' | 'rejected';
    approvedBy?: string;
    approvedDate?: string;
    processedDate?: string;
    paymentReference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Stock Options & Equity
export interface StockGrant {
    id: string;
    grantCode: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    stockType: StockType;
    grantDate: string;
    numberOfUnits: number;
    grantPrice: number;
    fairMarketValue: number;
    totalValue: number;
    currency: CurrencyCode;
    vestingSchedule: VestingSchedule;
    vestingStartDate: string;
    vestingEndDate: string;
    vestingPeriodYears: number;
    cliffPeriodMonths?: number;
    vestingScheduleDetails: VestingScheduleDetail[];
    exercisePrice?: number;
    expirationDate?: string;
    status: 'granted' | 'vesting' | 'vested' | 'exercised' | 'forfeited' | 'expired';
    vestedUnits: number;
    unvestedUnits: number;
    exercisedUnits: number;
    forfeitedUnits: number;
    reason?: string;
    grantedBy: string;
    approvedBy?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface VestingScheduleDetail {
    vestingDate: string;
    units: number;
    percentage: number;
    cumulativePercentage: number;
    status: 'pending' | 'vested' | 'forfeited';
}

export interface StockExercise {
    id: string;
    grantId: string;
    employeeId: string;
    employeeName: string;
    exerciseDate: string;
    unitsExercised: number;
    exercisePrice: number;
    fairMarketValue: number;
    totalCost: number;
    totalValue: number;
    gain: number;
    tax: number;
    netProceeds: number;
    currency: CurrencyCode;
    paymentMethod: 'cash' | 'cashless' | 'stock_swap';
    status: 'requested' | 'approved' | 'executed' | 'rejected';
    approvedBy?: string;
    approvedDate?: string;
    executedDate?: string;
    createdAt: string;
    updatedAt: string;
}

// Loans & Advances
export interface LoanScheme {
    id: string;
    schemeCode: string;
    schemeName: string;
    loanType: LoanType;
    description: string;
    maxAmount: number;
    minAmount: number;
    maxTenureMonths: number;
    minTenureMonths: number;
    interestRate: number;
    isInterestBearing: boolean;
    eligibilityCriteria: LoanEligibilityCriteria;
    currency: CurrencyCode;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoanEligibilityCriteria {
    minTenureMonths: number;
    minGrade?: string;
    maxOutstandingLoans: number;
    minCreditScore?: number;
    requiresGuarantor: boolean;
    requiresCollateral: boolean;
}

export interface EmployeeLoan {
    id: string;
    loanCode: string;
    schemeId: string;
    schemeName: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    loanType: LoanType;
    applicationDate: string;
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    emiAmount: number;
    totalRepayable: number;
    disbursementDate?: string;
    currency: CurrencyCode;
    purpose: string;
    status: LoanStatus;
    outstandingPrincipal: number;
    outstandingInterest: number;
    totalOutstanding: number;
    principalPaid: number;
    interestPaid: number;
    totalPaid: number;
    emiSchedule: EMISchedule[];
    guarantorId?: string;
    guarantorName?: string;
    collateralDetails?: string;
    approvers: Approver[];
    submittedBy: string;
    submittedDate?: string;
    approvedBy?: string;
    approvedDate?: string;
    rejectedBy?: string;
    rejectedDate?: string;
    rejectionReason?: string;
    closedDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EMISchedule {
    installmentNumber: number;
    dueDate: string;
    principalAmount: number;
    interestAmount: number;
    emiAmount: number;
    outstandingBalance: number;
    status: 'pending' | 'paid' | 'overdue' | 'waived';
    paidDate?: string;
    paidAmount?: number;
}

// Arrears Processing
export interface ArrearsRequest {
    id: string;
    requestCode: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    arrearsType: ArrearsType;
    reason: string;
    effectiveFrom: string;
    effectiveTo: string;
    oldSalary: number;
    newSalary: number;
    difference: number;
    numberOfMonths: number;
    totalArrears: number;
    currency: CurrencyCode;
    paymentMode: 'lumpsum' | 'installments';
    numberOfInstallments?: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'processed';
    submittedBy: string;
    submittedDate?: string;
    approvedBy?: string;
    approvedDate?: string;
    rejectedBy?: string;
    rejectionReason?: string;
    processedDate?: string;
    paymentSchedule: PaymentSchedule[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentSchedule {
    installmentNumber: number;
    paymentDate: string;
    amount: number;
    status: 'pending' | 'paid';
    paidDate?: string;
}

// Total Rewards
export interface TotalRewardsStatement {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    fiscalYear: string;
    generatedDate: string;
    directCompensation: DirectCompensation;
    benefits: BenefitsSummary;
    stockCompensation: StockSummary;
    otherCompensation: OtherCompensation;
    totalRewards: number;
    currency: CurrencyCode;
    createdAt: string;
}

export interface DirectCompensation {
    baseSalary: number;
    allowances: number;
    bonus: number;
    incentives: number;
    overtime: number;
    total: number;
}

export interface BenefitsSummary {
    healthInsurance: number;
    lifeInsurance: number;
    retirementContributions: number;
    paidTimeOff: number;
    otherBenefits: number;
    total: number;
}

export interface StockSummary {
    stockGrantsValue: number;
    vestedValue: number;
    unvestedValue: number;
    total: number;
}

export interface OtherCompensation {
    loans: number;
    advances: number;
    reimbursements: number;
    perquisites: number;
    total: number;
}

// Market Benchmarking
export interface MarketBenchmark {
    id: string;
    benchmarkCode: string;
    jobTitle: string;
    jobFamily: string;
    jobLevel: string;
    geography: string;
    industry: string;
    source: BenchmarkSource;
    sourceName: string;
    surveyDate: string;
    currency: CurrencyCode;
    sampleSize: number;
    percentile10: number;
    percentile25: number;
    percentile50: number; // Median
    percentile75: number;
    percentile90: number;
    average: number;
    standardDeviation: number;
    effectiveFrom: string;
    effectiveTo?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CompetitiveAnalysis {
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    currentSalary: number;
    marketMedian: number;
    marketP25: number;
    marketP75: number;
    marketRatio: number; // currentSalary / marketMedian
    competitivePosition: 'leading' | 'competitive' | 'lagging';
    gap: number;
    recommendation: string;
}

// Budget Simulation
export interface BudgetSimulation {
    id: string;
    simulationCode: string;
    simulationName: string;
    description: string;
    fiscalYear: string;
    createdBy: string;
    scenarios: BudgetScenario[];
    comparison: ScenarioComparison;
    createdAt: string;
    updatedAt: string;
}

export interface BudgetScenario {
    scenarioName: string;
    description: string;
    assumptions: Assumptions;
    projectedCosts: ProjectedCosts;
    impactAnalysis: ImpactAnalysis;
}

export interface Assumptions {
    averageIncrement: number;
    headcountGrowth: number;
    attritionRate: number;
    bonusPoolPercentage: number;
    benefitsCostInflation: number;
    newHiresPlanned: number;
    averageNewHireSalary: number;
}

export interface ProjectedCosts {
    currentYearCost: number;
    projectedYearCost: number;
    salaryIncrements: number;
    newHiresCost: number;
    bonusCost: number;
    benefitsCost: number;
    totalCostIncrease: number;
    percentageIncrease: number;
}

export interface ImpactAnalysis {
    headcountChange: number;
    averageSalaryChange: number;
    costPerEmployee: number;
    budgetVariance: number;
    riskFactors: string[];
    recommendations: string[];
}

export interface ScenarioComparison {
    baseScenario: string;
    comparisonMetrics: ComparisonMetric[];
}

export interface ComparisonMetric {
    metric: string;
    scenarios: { [scenarioName: string]: number };
}

// Analytics
export interface CompensationMetrics {
    totalEmployees: number;
    totalCompensationCost: number;
    averageCompensation: number;
    medianCompensation: number;
    compensationByGrade: GradeMetrics[];
    compensationByDepartment: DepartmentMetrics[];
    payEquityMetrics: PayEquityMetrics;
    incrementMetrics: IncrementMetrics;
    bonusMetrics: BonusMetrics;
    stockMetrics: StockMetrics;
    loanMetrics: LoanMetrics;
}

export interface GradeMetrics {
    gradeId: string;
    gradeName: string;
    employeeCount: number;
    totalCost: number;
    averageSalary: number;
    medianSalary: number;
    minSalary: number;
    maxSalary: number;
}

export interface DepartmentMetrics {
    departmentId: string;
    departmentName: string;
    employeeCount: number;
    totalCost: number;
    averageSalary: number;
    budgetUtilization: number;
}

export interface PayEquityMetrics {
    genderPayGap: number;
    ethnicityPayGap: number;
    ageGroupAnalysis: AgeGroupAnalysis[];
    compaRatioDistribution: CompaRatioDistribution;
}

export interface AgeGroupAnalysis {
    ageGroup: string;
    employeeCount: number;
    averageSalary: number;
    medianSalary: number;
}

export interface CompaRatioDistribution {
    belowRange: number; // < 0.8
    lowerQuartile: number; // 0.8 - 0.95
    midRange: number; // 0.95 - 1.05
    upperQuartile: number; // 1.05 - 1.2
    aboveRange: number; // > 1.2
}

export interface IncrementMetrics {
    totalIncrements: number;
    totalIncrementsAmount: number;
    averageIncrementPercentage: number;
    incrementsByType: { [type: string]: number };
    incrementsByGrade: { [grade: string]: number };
}

export interface BonusMetrics {
    totalBonuses: number;
    totalBonusAmount: number;
    averageBonusPercentage: number;
    bonusByType: { [type: string]: number };
    bonusByGrade: { [grade: string]: number };
}

export interface StockMetrics {
    totalGrants: number;
    totalGrantValue: number;
    totalVestedValue: number;
    unvestedValue: number;
    exercisedValue: number;
}

export interface LoanMetrics {
    totalLoans: number;
    totalLoanAmount: number;
    activeLoans: number;
    outstandingAmount: number;
    repaymentRate: number;
}

// Settings
export interface CompensationSettings {
    currency: CurrencyCode;
    fiscalYearStart: string; // MM-DD format
    fiscalYearEnd: string;
    defaultPayFrequency: PayFrequency;
    incrementCycleFrequency: 'annual' | 'biannual';
    incrementReviewMonth: number;
    bonusReviewMonth: number;
    enableMarketBenchmarking: boolean;
    enableStockGrants: boolean;
    enableLoans: boolean;
    autoNotifications: CompensationNotifications;
}

export interface CompensationNotifications {
    incrementCycleStart: boolean;
    incrementProposalSubmitted: boolean;
    incrementApproved: boolean;
    bonusProcessed: boolean;
    stockGrantVested: boolean;
    loanDisbursed: boolean;
    emiDue: boolean;
    salaryRevisionDue: boolean;
}

// Supporting Types
export interface Approver {
    employeeId: string;
    employeeName: string;
    role: string;
    level: number;
    status: 'pending' | 'approved' | 'rejected';
    approvedDate?: string;
    comments?: string;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
