/**
 * @module loanService
 * @description Salary Advance & Loan Service — application, eligibility, EMI calculator,
 *              repayment schedule, approval workflow, and loan policies (Sec 17.5)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type LoanType = 'salary_advance' | 'personal_loan' | 'emergency_loan';
export type LoanStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'completed'
  | 'rejected'
  | 'cancelled';
export type EMIStatus = 'upcoming' | 'paid' | 'overdue' | 'processing';

export interface LoanEMI {
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalEMI: number;
  balance: number;
  status: EMIStatus;
  paidDate?: string;
  paidAmount?: number;
}

export interface Loan {
  id: string;
  loanNumber: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeeDesignation: string;
  monthlySalary: number;
  type: LoanType;
  status: LoanStatus;
  amount: number;
  disbursedAmount?: number;
  tenure: number;
  interestRate: number;
  emiAmount: number;
  totalInterest: number;
  totalRepayable: number;
  disbursedDate?: string;
  firstEMIDate?: string;
  reason: string;
  approvedBy?: string;
  approverName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  repaymentSchedule: LoanEMI[];
  emisPaid: number;
  outstandingBalance: number;
  nextEMIDate?: string;
  nextEMIAmount?: number;
  completedDate?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanEligibility {
  employeeId: string;
  loanType: LoanType;
  isEligible: boolean;
  maxAmount: number;
  maxTenure: number;
  reasons: string[];
  existingLoanBalance: number;
  monthlySalary: number;
  deductionCapacity: number;
}

export interface LoanPolicy {
  loanType: LoanType;
  label: string;
  description: string;
  maxAmountMultiplier: number;
  maxAmountAbsolute: number;
  maxTenureMonths: number;
  minTenureMonths: number;
  interestRate: number;
  processingFeePercent: number;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  approvalLevels: string[];
}

export interface ApplyLoanData {
  employeeId: string;
  type: LoanType;
  amount: number;
  tenure: number;
  reason: string;
  documents?: string[];
}

export interface LoanFilters {
  status?: LoanStatus;
  type?: LoanType;
  employeeId?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_LOANS: Loan[] = [
  {
    id: 'loan-001',
    loanNumber: 'LN-2026-0021',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeDepartment: 'Engineering',
    employeeDesignation: 'Senior Software Engineer',
    monthlySalary: 12000,
    type: 'personal_loan',
    status: 'active',
    amount: 30000,
    disbursedAmount: 30000,
    tenure: 24,
    interestRate: 6,
    emiAmount: 1329.6,
    totalInterest: 1910.4,
    totalRepayable: 31910.4,
    disbursedDate: '2025-10-01',
    firstEMIDate: '2025-11-01',
    reason: 'Home renovation',
    approvedBy: 'mgr-001',
    approverName: 'Karen White',
    approvedDate: '2025-09-28',
    emisPaid: 4,
    outstandingBalance: 24681.6,
    nextEMIDate: '2026-03-01',
    nextEMIAmount: 1329.6,
    documents: ['salary_slip.pdf', 'reason_letter.pdf'],
    repaymentSchedule: generateEMISchedule(30000, 24, 6, '2025-11-01', 4),
    createdAt: '2025-09-25T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'loan-002',
    loanNumber: 'LN-2026-0018',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    employeeDepartment: 'Sales & Marketing',
    employeeDesignation: 'Sales Manager',
    monthlySalary: 15000,
    type: 'salary_advance',
    status: 'completed',
    amount: 10000,
    disbursedAmount: 10000,
    tenure: 6,
    interestRate: 0,
    emiAmount: 1666.67,
    totalInterest: 0,
    totalRepayable: 10000,
    disbursedDate: '2025-08-01',
    firstEMIDate: '2025-09-01',
    reason: 'Medical emergency - family member hospitalization',
    approvedBy: 'mgr-002',
    approverName: 'Robert Chen',
    approvedDate: '2025-07-30',
    emisPaid: 6,
    outstandingBalance: 0,
    completedDate: '2026-02-01',
    documents: ['medical_bills.pdf'],
    repaymentSchedule: generateEMISchedule(10000, 6, 0, '2025-09-01', 6),
    createdAt: '2025-07-28T09:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'loan-003',
    loanNumber: 'LN-2026-0025',
    employeeId: 'emp-003',
    employeeName: 'Sarah Lee',
    employeeDepartment: 'Human Resources',
    employeeDesignation: 'HR Business Partner',
    monthlySalary: 9000,
    type: 'emergency_loan',
    status: 'pending_approval',
    amount: 15000,
    tenure: 12,
    interestRate: 4,
    emiAmount: 1291.27,
    totalInterest: 495.24,
    totalRepayable: 15495.24,
    reason: 'Emergency car repair - primary commute vehicle',
    documents: ['repair_estimate.pdf'],
    repaymentSchedule: [],
    emisPaid: 0,
    outstandingBalance: 15000,
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'loan-004',
    loanNumber: 'LN-2025-0098',
    employeeId: 'emp-004',
    employeeName: 'Michael Zhang',
    employeeDepartment: 'Finance',
    employeeDesignation: 'Senior Financial Analyst',
    monthlySalary: 11000,
    type: 'personal_loan',
    status: 'active',
    amount: 20000,
    disbursedAmount: 20000,
    tenure: 18,
    interestRate: 5.5,
    emiAmount: 1175.44,
    totalInterest: 1157.92,
    totalRepayable: 21157.92,
    disbursedDate: '2025-07-01',
    firstEMIDate: '2025-08-01',
    reason: 'Child education expenses',
    approvedBy: 'mgr-004',
    approverName: 'Patricia Moore',
    approvedDate: '2025-06-28',
    emisPaid: 7,
    outstandingBalance: 12227.92,
    nextEMIDate: '2026-03-01',
    nextEMIAmount: 1175.44,
    documents: ['education_fee_receipt.pdf'],
    repaymentSchedule: generateEMISchedule(20000, 18, 5.5, '2025-08-01', 7),
    createdAt: '2025-06-25T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'loan-005',
    loanNumber: 'LN-2026-0001',
    employeeId: 'emp-005',
    employeeName: 'Priya Patel',
    employeeDepartment: 'Operations',
    employeeDesignation: 'Operations Analyst',
    monthlySalary: 8500,
    type: 'salary_advance',
    status: 'rejected',
    amount: 20000,
    tenure: 10,
    interestRate: 0,
    emiAmount: 2000,
    totalInterest: 0,
    totalRepayable: 20000,
    reason: 'Down payment for vehicle purchase',
    rejectionReason:
      'Requested amount exceeds maximum eligible salary advance (3x monthly salary = $25,500). Also, existing financial commitments detected.',
    documents: [],
    repaymentSchedule: [],
    emisPaid: 0,
    outstandingBalance: 0,
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-12T15:00:00Z',
  },
];

const MOCK_POLICIES: LoanPolicy[] = [
  {
    loanType: 'salary_advance',
    label: 'Salary Advance',
    description:
      'Interest-free advance on upcoming salary, repaid within 6 months via payroll deductions.',
    maxAmountMultiplier: 3,
    maxAmountAbsolute: 25000,
    maxTenureMonths: 6,
    minTenureMonths: 1,
    interestRate: 0,
    processingFeePercent: 0,
    eligibilityCriteria: [
      'Minimum 1 year of service',
      'No existing salary advance',
      'Good disciplinary record',
      'Manager approval required',
    ],
    requiredDocuments: ['Reason letter', 'Bank statement (last 3 months)'],
    approvalLevels: ['Direct Manager', 'HR Manager'],
  },
  {
    loanType: 'personal_loan',
    label: 'Personal Loan',
    description:
      'Company-assisted personal loan at preferential interest rate for qualified employees.',
    maxAmountMultiplier: 6,
    maxAmountAbsolute: 60000,
    maxTenureMonths: 36,
    minTenureMonths: 6,
    interestRate: 6,
    processingFeePercent: 1,
    eligibilityCriteria: [
      'Minimum 2 years of service',
      'No existing personal loan with company',
      'EMI not to exceed 30% of net salary',
      'Performance rating of 3 or above',
    ],
    requiredDocuments: ['Reason letter', 'Bank statement (last 6 months)', 'ID proof'],
    approvalLevels: ['Direct Manager', 'HR Manager', 'Finance Manager'],
  },
  {
    loanType: 'emergency_loan',
    label: 'Emergency Loan',
    description:
      'Fast-tracked loan for genuine emergencies. Processed within 24 hours with minimal documentation.',
    maxAmountMultiplier: 4,
    maxAmountAbsolute: 30000,
    maxTenureMonths: 18,
    minTenureMonths: 3,
    interestRate: 4,
    processingFeePercent: 0,
    eligibilityCriteria: [
      'Minimum 6 months of service',
      'Documented emergency situation',
      'No more than 1 emergency loan per year',
    ],
    requiredDocuments: [
      'Emergency proof documents',
      'Medical reports / repair estimates if applicable',
    ],
    approvalLevels: ['HR Manager (expedited)'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateEMISchedule(
  principal: number,
  tenure: number,
  annualRate: number,
  firstEMIDate: string,
  paidCount: number
): LoanEMI[] {
  const monthlyRate = annualRate / 12 / 100;
  const emi =
    annualRate === 0
      ? principal / tenure
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1);

  const schedule: LoanEMI[] = [];
  let balance = principal;
  const startDate = new Date(firstEMIDate);

  for (let i = 1; i <= tenure; i++) {
    const interest = balance * monthlyRate;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);

    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i - 1);

    let status: EMIStatus = 'upcoming';
    let paidDate: string | undefined;
    if (i <= paidCount) {
      status = 'paid';
      const pd = new Date(dueDate);
      pd.setDate(pd.getDate() - 2);
      paidDate = pd.toISOString().split('T')[0];
    } else if (dueDate < new Date() && i > paidCount) {
      status = 'overdue';
    }

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      totalEMI: Math.round(emi * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      status,
      paidDate,
      paidAmount: status === 'paid' ? Math.round(emi * 100) / 100 : undefined,
    });
  }
  return schedule;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class LoanService {
  /**
   * Apply for a new loan or salary advance
   */
  static async applyForLoan(data: ApplyLoanData): Promise<Loan> {
    try {
      return await APIClient.post<Loan>('/v1/loans/apply', data);
    } catch {
      const policy = MOCK_POLICIES.find((p) => p.loanType === data.type)!;
      const emi = calculateEMIHelper(data.amount, data.tenure, policy.interestRate);
      const totalInterest = emi * data.tenure - data.amount;

      const newLoan: Loan = {
        id: `loan-${Date.now()}`,
        loanNumber: `LN-${new Date().getFullYear()}-${String(MOCK_LOANS.length + 30).padStart(4, '0')}`,
        employeeId: data.employeeId,
        employeeName: 'Current User',
        employeeDepartment: 'Your Department',
        employeeDesignation: 'Your Designation',
        monthlySalary: 10000,
        type: data.type,
        status: 'pending_approval',
        amount: data.amount,
        tenure: data.tenure,
        interestRate: policy.interestRate,
        emiAmount: Math.round(emi * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalRepayable: Math.round(emi * data.tenure * 100) / 100,
        reason: data.reason,
        documents: data.documents ?? [],
        repaymentSchedule: [],
        emisPaid: 0,
        outstandingBalance: data.amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_LOANS.push(newLoan);
      return newLoan;
    }
  }

  /**
   * Get all loans for an employee
   */
  static async getLoans(filters?: LoanFilters): Promise<Loan[]> {
    try {
      return await APIClient.get<Loan[]>('/v1/loans', filters);
    } catch {
      let results = [...MOCK_LOANS];
      if (filters?.status) results = results.filter((l) => l.status === filters.status);
      if (filters?.type) results = results.filter((l) => l.type === filters.type);
      if (filters?.employeeId) results = results.filter((l) => l.employeeId === filters.employeeId);
      return results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  /**
   * Get full loan detail with EMI schedule
   */
  static async getLoanDetails(loanId: string): Promise<Loan | null> {
    try {
      return await APIClient.get<Loan>(`/v1/loans/${loanId}`);
    } catch {
      return MOCK_LOANS.find((l) => l.id === loanId) ?? null;
    }
  }

  /**
   * Check eligibility for a loan type
   */
  static async getEligibility(employeeId: string, type: LoanType): Promise<LoanEligibility> {
    try {
      return await APIClient.get<LoanEligibility>(`/v1/loans/eligibility`, { employeeId, type });
    } catch {
      const policy = MOCK_POLICIES.find((p) => p.loanType === type)!;
      const emp = MOCK_LOANS.filter(
        (l) => l.employeeId === employeeId && ['active', 'approved'].includes(l.status)
      );
      const existingBalance = emp.reduce((sum, l) => sum + l.outstandingBalance, 0);
      const monthlySalary = 10000;
      const maxAmount = Math.min(
        policy.maxAmountMultiplier * monthlySalary,
        policy.maxAmountAbsolute
      );
      const hasExistingOfSameType = MOCK_LOANS.some(
        (l) =>
          l.employeeId === employeeId &&
          l.type === type &&
          ['active', 'approved', 'pending_approval'].includes(l.status)
      );
      const reasons: string[] = [];
      let isEligible = true;
      if (hasExistingOfSameType) {
        isEligible = false;
        reasons.push(`You already have an active ${type.replace('_', ' ')}`);
      }
      if (existingBalance > monthlySalary * 3) {
        isEligible = false;
        reasons.push('Existing loan balance too high relative to salary');
      }
      return {
        employeeId,
        loanType: type,
        isEligible,
        maxAmount: isEligible ? maxAmount : 0,
        maxTenure: policy.maxTenureMonths,
        reasons,
        existingLoanBalance: existingBalance,
        monthlySalary,
        deductionCapacity: Math.round(monthlySalary * 0.3),
      };
    }
  }

  /**
   * Calculate EMI for given parameters
   */
  static calculateEMI(
    amount: number,
    tenureMonths: number,
    annualInterestRate: number
  ): {
    emiAmount: number;
    totalInterest: number;
    totalRepayable: number;
    takeHomeSalaryImpact: number;
    monthlySalary: number;
  } {
    const emi = calculateEMIHelper(amount, tenureMonths, annualInterestRate);
    const totalRepayable = emi * tenureMonths;
    const monthlySalary = 10000;
    return {
      emiAmount: Math.round(emi * 100) / 100,
      totalInterest: Math.round((totalRepayable - amount) * 100) / 100,
      totalRepayable: Math.round(totalRepayable * 100) / 100,
      takeHomeSalaryImpact: Math.round(emi * 100) / 100,
      monthlySalary,
    };
  }

  /**
   * Get all loan policies
   */
  static async getLoanPolicies(): Promise<LoanPolicy[]> {
    try {
      return await APIClient.get<LoanPolicy[]>('/v1/loans/policies');
    } catch {
      return MOCK_POLICIES;
    }
  }

  /**
   * Approve a pending loan
   */
  static async approveLoan(loanId: string, comments?: string): Promise<Loan> {
    try {
      return await APIClient.post<Loan>(`/v1/loans/${loanId}/approve`, { comments });
    } catch {
      const loan = MOCK_LOANS.find((l) => l.id === loanId);
      if (!loan) throw new Error(`Loan ${loanId} not found`);
      loan.status = 'approved';
      loan.approvedBy = 'mgr-current';
      loan.approverName = 'Current Manager';
      loan.approvedDate = new Date().toISOString();
      loan.updatedAt = new Date().toISOString();
      const firstEMIDate = new Date();
      firstEMIDate.setMonth(firstEMIDate.getMonth() + 1);
      loan.disbursedDate = new Date().toISOString().split('T')[0];
      loan.firstEMIDate = firstEMIDate.toISOString().split('T')[0];
      loan.repaymentSchedule = generateEMISchedule(
        loan.amount,
        loan.tenure,
        loan.interestRate,
        loan.firstEMIDate,
        0
      );
      return loan;
    }
  }

  /**
   * Reject a pending loan
   */
  static async rejectLoan(loanId: string, reason: string): Promise<Loan> {
    try {
      return await APIClient.post<Loan>(`/v1/loans/${loanId}/reject`, { reason });
    } catch {
      const loan = MOCK_LOANS.find((l) => l.id === loanId);
      if (!loan) throw new Error(`Loan ${loanId} not found`);
      loan.status = 'rejected';
      loan.rejectionReason = reason;
      loan.updatedAt = new Date().toISOString();
      return loan;
    }
  }

  /**
   * Get repayment schedule for a loan
   */
  static async getRepaymentSchedule(loanId: string): Promise<LoanEMI[]> {
    try {
      return await APIClient.get<LoanEMI[]>(`/v1/loans/${loanId}/repayment-schedule`);
    } catch {
      const loan = MOCK_LOANS.find((l) => l.id === loanId);
      return loan?.repaymentSchedule ?? [];
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateEMIHelper(principal: number, tenureMonths: number, annualRate: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const LOAN_STATUS_META: Record<
  LoanStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Draft', color: 'text-slate-500', bgColor: 'bg-slate-100' },
  pending_approval: { label: 'Pending Approval', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  approved: { label: 'Approved', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  active: { label: 'Active', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  completed: { label: 'Completed', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bgColor: 'bg-gray-50' },
};

export const LOAN_TYPE_META: Record<LoanType, { label: string; icon: string; color: string }> = {
  salary_advance: { label: 'Salary Advance', icon: 'Banknote', color: 'text-blue-600' },
  personal_loan: { label: 'Personal Loan', icon: 'Wallet', color: 'text-violet-600' },
  emergency_loan: { label: 'Emergency Loan', icon: 'Zap', color: 'text-amber-600' },
};
