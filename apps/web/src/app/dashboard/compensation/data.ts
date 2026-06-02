// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
/**
 * Compensation Management Module - Sample Data
 * Comprehensive sample data for immediate testing
 */

import type {
  SalaryComponent,
  Grade,
  SalaryBand,
  SalaryStructure,
  EmployeeCompensation,
  IncrementCycle,
  IncrementProposal,
  BonusScheme,
  BonusPayout,
  StockGrant,
  LoanScheme,
  EmployeeLoan,
  ArrearsRequest,
  TotalRewardsStatement,
  MarketBenchmark,
  CompensationMetrics,
  CompensationSettings
} from './types';

// Sample Salary Components
export const sampleComponents: SalaryComponent[] = [
  {
    id: 'comp-001',
    componentCode: 'BASIC',
    componentName: 'Basic Salary',
    type: 'earning',
    calculationType: 'fixed',
    isStatutory: true,
    isTaxable: true,
    isPartOfCTC: true,
    isPartOfGross: true,
    isPartOfBasic: true,
    displayOrder: 1,
    isActive: true,
    description: 'Base salary component',
    glCode: 'GL-5000',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-002',
    componentCode: 'HRA',
    componentName: 'House Rent Allowance',
    type: 'earning',
    calculationType: 'percentage_of_basic',
    isStatutory: false,
    isTaxable: true,
    isPartOfCTC: true,
    isPartOfGross: true,
    isPartOfBasic: false,
    defaultValue: 40,
    displayOrder: 2,
    isActive: true,
    description: 'Housing allowance - 40% of basic',
    glCode: 'GL-5001',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-003',
    componentCode: 'DA',
    componentName: 'Dearness Allowance',
    type: 'earning',
    calculationType: 'percentage_of_basic',
    isStatutory: false,
    isTaxable: true,
    isPartOfCTC: true,
    isPartOfGross: true,
    isPartOfBasic: false,
    defaultValue: 20,
    displayOrder: 3,
    isActive: true,
    description: 'Cost of living adjustment - 20% of basic',
    glCode: 'GL-5002',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-004',
    componentCode: 'CA',
    componentName: 'Conveyance Allowance',
    type: 'earning',
    calculationType: 'fixed',
    isStatutory: false,
    isTaxable: true,
    isPartOfCTC: true,
    isPartOfGross: true,
    isPartOfBasic: false,
    defaultValue: 1600,
    displayOrder: 4,
    isActive: true,
    description: 'Transport allowance',
    glCode: 'GL-5003',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-005',
    componentCode: 'MA',
    componentName: 'Medical Allowance',
    type: 'earning',
    calculationType: 'fixed',
    isStatutory: false,
    isTaxable: true,
    isPartOfCTC: true,
    isPartOfGross: true,
    isPartOfBasic: false,
    defaultValue: 1250,
    displayOrder: 5,
    isActive: true,
    description: 'Medical reimbursement',
    glCode: 'GL-5004',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-006',
    componentCode: 'PF_EMP',
    componentName: 'Employee PF Contribution',
    type: 'deduction',
    calculationType: 'percentage_of_basic',
    isStatutory: true,
    isTaxable: false,
    isPartOfCTC: false,
    isPartOfGross: false,
    isPartOfBasic: false,
    defaultValue: 12,
    displayOrder: 1,
    isActive: true,
    description: 'Employee provident fund - 12% of basic',
    glCode: 'GL-6000',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'comp-007',
    componentCode: 'PF_EMP',
    componentName: 'Employer PF Contribution',
    type: 'employer_contribution',
    calculationType: 'percentage_of_basic',
    isStatutory: true,
    isTaxable: false,
    isPartOfCTC: true,
    isPartOfGross: false,
    isPartOfBasic: false,
    defaultValue: 12,
    displayOrder: 1,
    isActive: true,
    description: 'Employer provident fund contribution',
    glCode: 'GL-6100',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample Grades
export const sampleGrades: Grade[] = [
  {
    id: 'grade-001',
    gradeCode: 'M3',
    gradeName: 'Senior Manager',
    gradeType: 'management',
    level: 7,
    description: 'Senior management level responsible for strategic initiatives',
    bands: [],
    competencies: ['Strategic thinking', 'Leadership', 'Business acumen', 'Team management'],
    responsibilities: ['Strategic planning', 'P&L ownership', 'Team leadership', 'Stakeholder management'],
    minimumExperience: 10,
    educationRequired: 'Graduate with MBA preferred',
    reportingLevel: 3,
    employeeCount: 24,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'grade-002',
    gradeCode: 'P4',
    gradeName: 'Senior Engineer',
    gradeType: 'professional',
    level: 6,
    description: 'Senior professional contributor role',
    bands: [],
    competencies: ['Technical expertise', 'Problem solving', 'Mentoring', 'Project management'],
    responsibilities: ['Technical leadership', 'Architecture decisions', 'Code reviews', 'Mentoring juniors'],
    minimumExperience: 7,
    educationRequired: 'Graduate in Engineering/Computer Science',
    reportingLevel: 4,
    employeeCount: 56,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'grade-003',
    gradeCode: 'P2',
    gradeName: 'Software Engineer',
    gradeType: 'professional',
    level: 4,
    description: 'Mid-level professional contributor',
    bands: [],
    competencies: ['Technical skills', 'Collaboration', 'Communication', 'Problem solving'],
    responsibilities: ['Feature development', 'Code quality', 'Testing', 'Documentation'],
    minimumExperience: 3,
    educationRequired: 'Graduate in Engineering/Computer Science',
    reportingLevel: 5,
    employeeCount: 142,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample Salary Bands
export const sampleBands: SalaryBand[] = [
  {
    id: 'band-001',
    gradeId: 'grade-001',
    bandName: 'M3 Salary Band',
    currency: 'USD',
    minSalary: 120000,
    midSalary: 150000,
    maxSalary: 180000,
    spreadPercentage: 50,
    market25thPercentile: 125000,
    market50thPercentile: 148000,
    market75thPercentile: 175000,
    effectiveFrom: '2024-01-01T00:00:00Z',
    employeeCount: 24,
    averageSalary: 152000,
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'band-002',
    gradeId: 'grade-002',
    bandName: 'P4 Salary Band',
    currency: 'USD',
    minSalary: 90000,
    midSalary: 110000,
    maxSalary: 130000,
    spreadPercentage: 44.4,
    market25thPercentile: 92000,
    market50thPercentile: 108000,
    market75thPercentile: 128000,
    effectiveFrom: '2024-01-01T00:00:00Z',
    employeeCount: 56,
    averageSalary: 108500,
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'band-003',
    gradeId: 'grade-003',
    bandName: 'P2 Salary Band',
    currency: 'USD',
    minSalary: 60000,
    midSalary: 75000,
    maxSalary: 90000,
    spreadPercentage: 50,
    market25thPercentile: 62000,
    market50thPercentile: 74000,
    market75thPercentile: 88000,
    effectiveFrom: '2024-01-01T00:00:00Z',
    employeeCount: 142,
    averageSalary: 74800,
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample Salary Structures
export const sampleStructures: SalaryStructure[] = [
  {
    id: 'struct-001',
    structureCode: 'STR-M3-2024',
    structureName: 'Senior Manager Structure 2024',
    description: 'Standard salary structure for M3 grade',
    gradeId: 'grade-001',
    gradeName: 'Senior Manager',
    effectiveFrom: '2024-01-01T00:00:00Z',
    currency: 'USD',
    payFrequency: 'monthly',
    components: [
      {
        componentId: 'comp-001',
        componentCode: 'BASIC',
        componentName: 'Basic Salary',
        type: 'earning',
        calculationType: 'fixed',
        value: 90000,
        isMandatory: true,
        displayOrder: 1
      },
      {
        componentId: 'comp-002',
        componentCode: 'HRA',
        componentName: 'House Rent Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        percentage: 40,
        isMandatory: true,
        displayOrder: 2
      },
      {
        componentId: 'comp-003',
        componentCode: 'DA',
        componentName: 'Dearness Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        percentage: 20,
        isMandatory: true,
        displayOrder: 3
      }
    ],
    isTemplate: true,
    isActive: true,
    applicableCount: 24,
    createdBy: 'admin',
    createdAt: '2023-10-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'struct-002',
    structureCode: 'STR-P4-2024',
    structureName: 'Senior Engineer Structure 2024',
    description: 'Standard salary structure for P4 grade',
    gradeId: 'grade-002',
    gradeName: 'Senior Engineer',
    effectiveFrom: '2024-01-01T00:00:00Z',
    currency: 'USD',
    payFrequency: 'monthly',
    components: [
      {
        componentId: 'comp-001',
        componentCode: 'BASIC',
        componentName: 'Basic Salary',
        type: 'earning',
        calculationType: 'fixed',
        value: 66000,
        isMandatory: true,
        displayOrder: 1
      },
      {
        componentId: 'comp-002',
        componentCode: 'HRA',
        componentName: 'House Rent Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        percentage: 40,
        isMandatory: true,
        displayOrder: 2
      },
      {
        componentId: 'comp-003',
        componentCode: 'DA',
        componentName: 'Dearness Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        percentage: 20,
        isMandatory: true,
        displayOrder: 3
      }
    ],
    isTemplate: true,
    isActive: true,
    applicableCount: 56,
    createdBy: 'admin',
    createdAt: '2023-10-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample Employee Compensation
export const sampleEmployeeCompensation: EmployeeCompensation[] = [
  {
    id: 'empcomp-001',
    employeeId: 'emp-001',
    employeeName: 'Sarah Johnson',
    employeeCode: 'EMP-001',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    positionId: 'pos-001',
    positionTitle: 'Senior Engineering Manager',
    gradeId: 'grade-001',
    gradeName: 'Senior Manager',
    structureId: 'struct-001',
    structureName: 'Senior Manager Structure 2024',
    effectiveFrom: '2024-01-01T00:00:00Z',
    currency: 'USD',
    payFrequency: 'monthly',
    annualCTC: 156000,
    monthlyCTC: 13000,
    annualGross: 144000,
    monthlyGross: 12000,
    annualBasic: 90000,
    monthlyBasic: 7500,
    components: [
      {
        componentId: 'comp-001',
        componentCode: 'BASIC',
        componentName: 'Basic Salary',
        type: 'earning',
        calculationType: 'fixed',
        annualAmount: 90000,
        monthlyAmount: 7500,
        isVariable: false,
        isTaxable: true
      },
      {
        componentId: 'comp-002',
        componentCode: 'HRA',
        componentName: 'House Rent Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        annualAmount: 36000,
        monthlyAmount: 3000,
        percentage: 40,
        isVariable: false,
        isTaxable: true
      },
      {
        componentId: 'comp-003',
        componentCode: 'DA',
        componentName: 'Dearness Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        annualAmount: 18000,
        monthlyAmount: 1500,
        percentage: 20,
        isVariable: false,
        isTaxable: true
      },
      {
        componentId: 'comp-007',
        componentCode: 'PF_EMP',
        componentName: 'Employer PF Contribution',
        type: 'employer_contribution',
        calculationType: 'percentage_of_basic',
        annualAmount: 10800,
        monthlyAmount: 900,
        percentage: 12,
        isVariable: false,
        isTaxable: false
      }
    ],
    lastRevisionDate: '2024-01-01T00:00:00Z',
    nextReviewDate: '2025-01-01T00:00:00Z',
    isActive: true,
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'empcomp-002',
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    employeeCode: 'EMP-002',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    positionId: 'pos-002',
    positionTitle: 'Senior Software Engineer',
    gradeId: 'grade-002',
    gradeName: 'Senior Engineer',
    structureId: 'struct-002',
    structureName: 'Senior Engineer Structure 2024',
    effectiveFrom: '2024-01-01T00:00:00Z',
    currency: 'USD',
    payFrequency: 'monthly',
    annualCTC: 115800,
    monthlyCTC: 9650,
    annualGross: 108000,
    monthlyGross: 9000,
    annualBasic: 66000,
    monthlyBasic: 5500,
    components: [
      {
        componentId: 'comp-001',
        componentCode: 'BASIC',
        componentName: 'Basic Salary',
        type: 'earning',
        calculationType: 'fixed',
        annualAmount: 66000,
        monthlyAmount: 5500,
        isVariable: false,
        isTaxable: true
      },
      {
        componentId: 'comp-002',
        componentCode: 'HRA',
        componentName: 'House Rent Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        annualAmount: 26400,
        monthlyAmount: 2200,
        percentage: 40,
        isVariable: false,
        isTaxable: true
      },
      {
        componentId: 'comp-003',
        componentCode: 'DA',
        componentName: 'Dearness Allowance',
        type: 'earning',
        calculationType: 'percentage_of_basic',
        annualAmount: 13200,
        monthlyAmount: 1100,
        percentage: 20,
        isVariable: false,
        isTaxable: true
      }
    ],
    lastRevisionDate: '2024-01-01T00:00:00Z',
    nextReviewDate: '2025-01-01T00:00:00Z',
    isActive: true,
    createdAt: '2022-03-10T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Sample Increment Cycle
export const sampleIncrementCycle: IncrementCycle = {
  id: 'cycle-001',
  cycleCode: 'INC-2024',
  cycleName: 'Annual Increment 2024',
  fiscalYear: '2024',
  incrementType: 'merit',
  effectiveDate: '2024-04-01T00:00:00Z',
  budgetAmount: 5000000,
  budgetPercentage: 8.5,
  currency: 'USD',
  status: 'in_progress',
  eligibilityCriteria: {
    minTenureMonths: 6,
    minPerformanceRating: 'solid',
    excludeProbation: true,
    excludeNotices: true,
    excludePIP: true
  },
  departments: [
    {
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      budgetAmount: 2500000,
      budgetPercentage: 9.0,
      allocatedAmount: 2400000,
      usedAmount: 1200000,
      employeeCount: 198
    },
    {
      departmentId: 'dept-prod',
      departmentName: 'Product',
      budgetAmount: 1500000,
      budgetPercentage: 8.0,
      allocatedAmount: 1450000,
      usedAmount: 720000,
      employeeCount: 89
    }
  ],
  totalAllocated: 3850000,
  totalUsed: 1920000,
  employeesEligible: 287,
  employeesProcessed: 145,
  approvers: [
    {
      level: 1,
      approverId: 'emp-003',
      approverName: 'Robert Taylor',
      role: 'Department Head',
      isRequired: true
    },
    {
      level: 2,
      approverId: 'emp-004',
      approverName: 'Lisa Anderson',
      role: 'VP HR',
      isRequired: true
    }
  ],
  startDate: '2024-02-01T00:00:00Z',
  endDate: '2024-03-15T00:00:00Z',
  createdBy: 'hr-admin',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-02-20T00:00:00Z'
};

// Sample Increment Proposals
export const sampleIncrementProposals: IncrementProposal[] = [
  {
    id: 'incprop-001',
    cycleId: 'cycle-001',
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    employeeCode: 'EMP-002',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    gradeId: 'grade-002',
    gradeName: 'Senior Engineer',
    currentSalary: 108000,
    proposedSalary: 118800,
    incrementAmount: 10800,
    incrementPercentage: 10.0,
    incrementType: 'merit',
    effectiveDate: '2024-04-01T00:00:00Z',
    performanceRating: 'high',
    justification: 'Exceptional performance in Q3-Q4 2023. Led critical architecture redesign that improved system performance by 40%. Mentored 3 junior engineers.',
    status: 'approved',
    submittedBy: 'emp-001',
    submittedDate: '2024-02-10T00:00:00Z',
    approvedBy: 'emp-004',
    approvedDate: '2024-02-15T00:00:00Z',
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'incprop-002',
    cycleId: 'cycle-001',
    employeeId: 'emp-005',
    employeeName: 'Jessica Martinez',
    employeeCode: 'EMP-005',
    departmentId: 'dept-prod',
    departmentName: 'Product',
    gradeId: 'grade-002',
    gradeName: 'Senior Engineer',
    currentSalary: 105000,
    proposedSalary: 113400,
    incrementAmount: 8400,
    incrementPercentage: 8.0,
    incrementType: 'merit',
    effectiveDate: '2024-04-01T00:00:00Z',
    performanceRating: 'solid',
    justification: 'Consistent solid performance. Delivered all projects on time. Good team collaboration.',
    status: 'submitted',
    submittedBy: 'emp-006',
    submittedDate: '2024-02-12T00:00:00Z',
    createdAt: '2024-02-08T00:00:00Z',
    updatedAt: '2024-02-12T00:00:00Z'
  }
];

// Sample Bonus Scheme
export const sampleBonusScheme: BonusScheme = {
  id: 'bonus-001',
  schemeCode: 'PERF-BONUS-2024',
  schemeName: 'Annual Performance Bonus 2024',
  bonusType: 'performance',
  description: 'Annual performance-based bonus for all eligible employees',
  fiscalYear: '2024',
  eligibilityCriteria: {
    minTenureMonths: 6,
    minPerformanceRating: 'solid',
    excludeProbation: true,
    excludeNotices: true,
    excludePIP: true
  },
  payoutCriteria: {
    baseCalculation: 'percentage_of_salary',
    minPayout: 5,
    maxPayout: 25,
    performanceLinkage: true,
    performanceWeightage: 60,
    companyPerformanceWeightage: 20,
    individualPerformanceWeightage: 20
  },
  budgetAmount: 3000000,
  currency: 'USD',
  payoutDate: '2024-12-15T00:00:00Z',
  status: 'active',
  isRecurring: true,
  frequency: 'annual',
  applicableGrades: ['grade-001', 'grade-002', 'grade-003'],
  createdBy: 'hr-admin',
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z'
};

// Sample Bonus Payouts
export const sampleBonusPayouts: BonusPayout[] = [
  {
    id: 'bonuspay-001',
    schemeId: 'bonus-001',
    schemeName: 'Annual Performance Bonus 2024',
    employeeId: 'emp-001',
    employeeName: 'Sarah Johnson',
    employeeCode: 'EMP-001',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    gradeId: 'grade-001',
    gradeName: 'Senior Manager',
    baseSalary: 144000,
    bonusPercentage: 20,
    bonusAmount: 28800,
    performanceRating: 'exceptional',
    performanceMultiplier: 1.25,
    companyPerformanceScore: 92,
    individualPerformanceScore: 95,
    finalBonusAmount: 36000,
    currency: 'USD',
    payoutDate: '2024-12-15T00:00:00Z',
    status: 'approved',
    approvedBy: 'emp-009',
    approvedDate: '2024-12-01T00:00:00Z',
    taxAmount: 12960,
    netPayoutAmount: 23040,
    notes: 'Exceptional performance - exceeded all targets',
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  }
];

// Sample Stock Grant
export const sampleStockGrant: StockGrant = {
  id: 'stock-001',
  grantCode: 'RSU-2024-001',
  employeeId: 'emp-001',
  employeeName: 'Sarah Johnson',
  employeeCode: 'EMP-001',
  stockType: 'RSU',
  grantDate: '2024-01-15T00:00:00Z',
  grantedShares: 1000,
  strikePrice: 0,
  fairMarketValue: 50.00,
  totalValue: 50000,
  currency: 'USD',
  vestingScheduleType: 'graded',
  vestingStartDate: '2024-01-15T00:00:00Z',
  vestingEndDate: '2028-01-15T00:00:00Z',
  vestingPeriodMonths: 48,
  cliffMonths: 12,
  vestingSchedule: [
    {
      vestingDate: '2025-01-15T00:00:00Z',
      sharesVested: 250,
      percentageVested: 25,
      cumulativeVested: 250,
      status: 'pending'
    },
    {
      vestingDate: '2026-01-15T00:00:00Z',
      sharesVested: 250,
      percentageVested: 25,
      cumulativeVested: 500,
      status: 'pending'
    },
    {
      vestingDate: '2027-01-15T00:00:00Z',
      sharesVested: 250,
      percentageVested: 25,
      cumulativeVested: 750,
      status: 'pending'
    },
    {
      vestingDate: '2028-01-15T00:00:00Z',
      sharesVested: 250,
      percentageVested: 25,
      cumulativeVested: 1000,
      status: 'pending'
    }
  ],
  sharesVested: 0,
  sharesExercised: 0,
  sharesForfeited: 0,
  sharesRemaining: 1000,
  status: 'active',
  grantReason: 'New hire equity grant',
  approvedBy: 'emp-009',
  approvedDate: '2024-01-10T00:00:00Z',
  createdAt: '2024-01-05T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z'
};

// Sample Loan Scheme
export const sampleLoanScheme: LoanScheme = {
  id: 'loan-scheme-001',
  schemeCode: 'HOUSING-LOAN-2024',
  schemeName: 'Housing Loan Scheme',
  loanType: 'housing',
  description: 'Employee housing loan with subsidized interest rate',
  maxLoanAmount: 500000,
  minLoanAmount: 50000,
  currency: 'USD',
  interestRate: 6.5,
  maxTenureMonths: 240,
  minTenureMonths: 12,
  processingFeePercentage: 1.0,
  eligibilityCriteria: {
    minTenureMonths: 12,
    minGrade: 'P2',
    maxAge: 58,
    minSalary: 50000,
    requiresGuarantor: true,
    minCreditScore: 650
  },
  repaymentMethod: 'emi',
  prepaymentAllowed: true,
  prepaymentPenalty: 2.0,
  isActive: true,
  approvalLevels: 2,
  createdBy: 'hr-admin',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

// Sample Employee Loan
export const sampleEmployeeLoan: EmployeeLoan = {
  id: 'loan-001',
  loanCode: 'LOAN-2024-001',
  schemeId: 'loan-scheme-001',
  schemeName: 'Housing Loan Scheme',
  employeeId: 'emp-002',
  employeeName: 'Michael Chen',
  employeeCode: 'EMP-002',
  loanType: 'housing',
  loanAmount: 200000,
  interestRate: 6.5,
  tenureMonths: 120,
  processingFee: 2000,
  totalRepayableAmount: 266000,
  emiAmount: 2217,
  currency: 'USD',
  applicationDate: '2024-01-10T00:00:00Z',
  approvedDate: '2024-01-20T00:00:00Z',
  disbursementDate: '2024-02-01T00:00:00Z',
  firstEMIDate: '2024-03-01T00:00:00Z',
  status: 'active',
  principalOutstanding: 195000,
  interestOutstanding: 65000,
  totalOutstanding: 260000,
  principalPaid: 5000,
  interestPaid: 1000,
  totalPaid: 6000,
  emiSchedule: [
    {
      emiNumber: 1,
      dueDate: '2024-03-01T00:00:00Z',
      principalAmount: 1050,
      interestAmount: 1167,
      totalEMI: 2217,
      principalOutstanding: 198950,
      status: 'paid',
      paidDate: '2024-03-01T00:00:00Z'
    },
    {
      emiNumber: 2,
      dueDate: '2024-04-01T00:00:00Z',
      principalAmount: 1056,
      interestAmount: 1161,
      totalEMI: 2217,
      principalOutstanding: 197894,
      status: 'pending'
    }
  ],
  guarantorDetails: {
    guarantorName: 'David Wilson',
    guarantorEmployeeId: 'emp-007',
    relationship: 'colleague',
    approvedDate: '2024-01-18T00:00:00Z'
  },
  approvers: [
    {
      level: 1,
      approverId: 'emp-001',
      approverName: 'Sarah Johnson',
      role: 'Manager',
      isRequired: true
    }
  ],
  notes: 'Loan for house purchase in downtown area',
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-03-01T00:00:00Z'
};

// Sample Arrears Request
export const sampleArrearsRequest: ArrearsRequest = {
  id: 'arrears-001',
  requestCode: 'ARR-2024-001',
  employeeId: 'emp-002',
  employeeName: 'Michael Chen',
  employeeCode: 'EMP-002',
  arrearsType: 'increment',
  reason: 'Increment effective from April 2023, but processed in August 2023',
  periodStart: '2023-04-01T00:00:00Z',
  periodEnd: '2023-07-31T00:00:00Z',
  oldSalary: 100000,
  newSalary: 108000,
  arrearsAmount: 2666.67,
  taxableAmount: 2666.67,
  taxAmount: 960.00,
  netPayableAmount: 1706.67,
  currency: 'USD',
  components: [
    {
      componentId: 'comp-001',
      componentCode: 'BASIC',
      componentName: 'Basic Salary',
      arrearsAmount: 1666.67
    },
    {
      componentId: 'comp-002',
      componentCode: 'HRA',
      componentName: 'House Rent Allowance',
      arrearsAmount: 666.67
    },
    {
      componentId: 'comp-003',
      componentCode: 'DA',
      componentName: 'Dearness Allowance',
      arrearsAmount: 333.33
    }
  ],
  paymentSchedule: [
    {
      installmentNumber: 1,
      paymentDate: '2024-03-31T00:00:00Z',
      amount: 1706.67,
      status: 'pending'
    }
  ],
  requestedBy: 'emp-002',
  requestedDate: '2024-01-15T00:00:00Z',
  status: 'approved',
  approvedBy: 'emp-004',
  approvedDate: '2024-01-20T00:00:00Z',
  notes: 'Delayed increment processing',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z'
};

// Sample Total Rewards Statement
export const sampleTotalRewards: TotalRewardsStatement = {
  id: 'rewards-001',
  employeeId: 'emp-001',
  employeeName: 'Sarah Johnson',
  employeeCode: 'EMP-001',
  fiscalYear: '2024',
  generatedDate: '2024-12-31T00:00:00Z',
  currency: 'USD',
  directCompensation: {
    annualBasicSalary: 90000,
    allowances: 54000,
    variablePay: 36000,
    overtime: 0,
    totalDirectCompensation: 180000
  },
  benefits: {
    healthInsurance: 12000,
    dentalInsurance: 2400,
    lifeInsurance: 1200,
    retirementContributions: 10800,
    paidTimeOff: 8000,
    otherBenefits: 3000,
    totalBenefits: 37400
  },
  stockCompensation: {
    grantedValue: 50000,
    vestedValue: 12500,
    unvestedValue: 37500,
    exercisedValue: 0
  },
  otherCompensation: {
    performanceBonus: 36000,
    retentionBonus: 0,
    signingBonus: 0,
    referralBonus: 0,
    educationReimbursement: 5000,
    wellnessPrograms: 1000,
    totalOther: 42000
  },
  totalRewards: 259400,
  totalCashCompensation: 180000,
  totalNonCashBenefits: 79400,
  employerCosts: 20000,
  grandTotal: 279400,
  generatedBy: 'system',
  notes: 'Annual total rewards statement for fiscal year 2024',
  createdAt: '2024-12-31T00:00:00Z'
};

// Sample Market Benchmark
export const sampleMarketBenchmark: MarketBenchmark = {
  id: 'benchmark-001',
  benchmarkCode: 'MKT-TECH-2024',
  benchmarkName: 'Technology Sector Salary Benchmark 2024',
  source: 'market_survey',
  surveyName: 'Tech Salary Survey 2024',
  region: 'North America',
  industry: 'Technology',
  effectiveDate: '2024-01-01T00:00:00Z',
  currency: 'USD',
  jobFamily: 'Engineering',
  jobTitle: 'Senior Software Engineer',
  gradeEquivalent: 'P4',
  sampleSize: 1250,
  baseSalary25thPercentile: 92000,
  baseSalary50thPercentile: 108000,
  baseSalary75thPercentile: 128000,
  totalComp25thPercentile: 105000,
  totalComp50thPercentile: 125000,
  totalComp75thPercentile: 150000,
  variablePayPercentage: 15,
  equityPercentage: 10,
  benefitsPercentage: 20,
  marketTrend: 'increasing',
  yoyGrowthPercentage: 8.5,
  competitiveAnalysis: {
    numberOfCompetitors: 25,
    ourPosition: 'at_market',
    marketDifferential: 2.5,
    recommendations: [
      'Maintain current positioning',
      'Review equity compensation to remain competitive',
      'Consider adding retention bonuses for top performers'
    ]
  },
  dataPoints: [],
  isActive: true,
  createdBy: 'hr-analyst',
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z'
};

// Sample Compensation Metrics
export const sampleMetrics: CompensationMetrics = {
  totalEmployees: 287,
  totalCompensationCost: 32450000,
  averageSalary: 113066,
  medianSalary: 105000,
  totalBasicSalary: 21500000,
  totalAllowances: 8600000,
  totalBonuses: 2350000,
  totalIncrements: 1920000,
  totalLoansDisbursed: 1500000,
  totalStockValue: 8500000,
  gradeMetrics: [
    {
      gradeId: 'grade-001',
      gradeName: 'Senior Manager',
      employeeCount: 24,
      averageSalary: 152000,
      medianSalary: 150000,
      minSalary: 125000,
      maxSalary: 178000,
      budgetUtilization: 92.5,
      incrementBudget: 245000,
      incrementSpent: 226625
    },
    {
      gradeId: 'grade-002',
      gradeName: 'Senior Engineer',
      employeeCount: 56,
      averageSalary: 108500,
      medianSalary: 108000,
      minSalary: 92000,
      maxSalary: 129000,
      budgetUtilization: 88.3,
      incrementBudget: 534000,
      incrementSpent: 471522
    }
  ],
  departmentMetrics: [
    {
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      employeeCount: 198,
      totalCost: 22000000,
      averageSalary: 111111,
      budgetUtilization: 91.2,
      incrementBudget: 2400000,
      incrementSpent: 2188800
    }
  ],
  payEquityMetrics: {
    genderPayGap: 2.3,
    femaleToMaleRatio: 0.977,
    equityScore: 94.5,
    complianceStatus: 'compliant'
  },
  compaRatioDistribution: {
    belowRange: 12,
    inRange: 245,
    aboveRange: 30,
    averageCompaRatio: 101.2
  },
  incrementMetrics: {
    cyclesProcessed: 1,
    employeesIncremented: 145,
    totalIncrementAmount: 1920000,
    averageIncrementPercentage: 8.5,
    budgetUtilization: 92.3
  },
  bonusMetrics: {
    bonusesPaid: 267,
    totalBonusAmount: 2350000,
    averageBonusAmount: 8801,
    averageBonusPercentage: 12.5
  },
  stockMetrics: {
    activeGrants: 89,
    totalGrantedShares: 125000,
    totalVestedShares: 32000,
    totalExercisedShares: 8000,
    totalUnvestedValue: 4650000
  },
  loanMetrics: {
    activeLoans: 45,
    totalOutstanding: 6750000,
    averageLoanAmount: 150000,
    defaultRate: 0.5
  },
  trends: [
    {
      period: '2024-Q1',
      totalCost: 8000000,
      averageSalary: 112500,
      incrementsProcessed: 145,
      bonusesPaid: 0
    },
    {
      period: '2023-Q4',
      totalCost: 7850000,
      averageSalary: 110000,
      incrementsProcessed: 0,
      bonusesPaid: 267
    }
  ],
  lastUpdated: '2024-03-01T00:00:00Z'
};

// Sample Compensation Settings
export const sampleSettings: CompensationSettings = {
  enableCompensationManagement: true,
  defaultCurrency: 'USD',
  payFrequency: 'monthly',
  fiscalYearStart: '01-01',
  enableIncrementCycles: true,
  defaultIncrementPercentage: 8.0,
  maxIncrementPercentage: 25.0,
  requireApprovalForIncrements: true,
  incrementApprovalLevels: 2,
  enableBonusManagement: true,
  enableStockManagement: true,
  enableLoanManagement: true,
  maxLoanToSalaryRatio: 10,
  enableArrearsProcessing: true,
  enableMarketBenchmarking: true,
  benchmarkUpdateFrequency: 'annually',
  enablePayEquityAnalysis: true,
  payEquityThreshold: 5.0,
  enableGradeBands: true,
  enableCompaRatioAnalysis: true,
  targetCompaRatio: 100,
  compaRatioRange: { min: 80, max: 120 },
  enableBudgetSimulation: true,
  enableTotalRewardsStatements: true,
  rewardsStatementFrequency: 'annually',
  enableSalaryRevision: true,
  revisionApprovalLevels: 2,
  enableComponentManagement: true,
  allowCustomComponents: true,
  taxCalculationMethod: 'progressive',
  enableStatutoryCompliance: true,
  enableNotifications: {
    incrementApprovals: true,
    bonusPayouts: true,
    loanApprovals: true,
    salaryRevisions: true,
    stockVesting: true
  },
  dataRetentionYears: 7,
  auditLogEnabled: true,
  encryptSensitiveData: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};
