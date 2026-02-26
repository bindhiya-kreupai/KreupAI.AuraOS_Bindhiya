/**
 * @module earnedWageService
 * @description Earned Wage Access (EWA) service for AuraOS Compensation.
 *              Employees can access a portion of their earned wages before payday.
 *              Supports eligibility checks, withdrawal requests, and company policy config.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type EWATransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'BANK_TRANSFER' | 'MOBILE_WALLET' | 'CASH_PICKUP';

export interface EWAEligibility {
  employeeId: string;
  employeeName: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  /** Gross earned so far this period */
  grossEarnedToDate: number;
  /** Amount already drawn this period */
  alreadyDrawn: number;
  /** Maximum drawable = min(maxPct * grossEarned, maxAbsoluteAmount) - alreadyDrawn */
  availableAmount: number;
  maxDrawPercentage: number; // e.g., 50 (50% of earned wages)
  currency: string;
  nextPayday: string; // ISO date
  daysUntilPayday: number;
  feePerRequest: number; // flat fee per withdrawal
  feePercentage: number; // percentage fee on withdrawal amount
}

export interface EWATransaction {
  id: string;
  employeeId: string;
  requestedAmount: number;
  feeAmount: number;
  netAmount: number; // requestedAmount - feeAmount
  currency: string;
  status: EWATransactionStatus;
  paymentMethod: PaymentMethod;
  requestedAt: string;
  processedAt?: string;
  payPeriod: string; // YYYY-MM
  notes?: string;
}

export interface EWAPolicy {
  companyId: string;
  isEnabled: boolean;
  maxWithdrawalPercent: number; // % of earned wages
  maxAbsoluteAmount: number; // hard cap per request
  maxRequestsPerPeriod: number; // # requests allowed per pay period
  feeType: 'FLAT' | 'PERCENTAGE' | 'NONE';
  feeAmount: number; // flat fee per withdrawal (if FLAT)
  feePercentage: number; // % of withdrawal amount (if PERCENTAGE)
  eligibleAfterDays: number; // days from hire date to be eligible
  currency: string;
  supportedMethods: PaymentMethod[];
  processingTime: string; // e.g., "Instant" / "1 business day"
}

export interface EWAWithdrawalRequest {
  employeeId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface EWAAnalytics {
  adoptionRate: number; // % of eligible employees who used EWA
  avgWithdrawalAmount: number;
  totalWithdrawals: number;
  totalAmount: number;
  totalFees: number;
  byMonth: Array<{ month: string; count: number; amount: number }>;
  topDepartments: Array<{ department: string; count: number; amount: number }>;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_POLICY: EWAPolicy = {
  companyId: 'kreup_001',
  isEnabled: true,
  maxWithdrawalPercent: 50,
  maxAbsoluteAmount: 5_000,
  maxRequestsPerPeriod: 2,
  feeType: 'FLAT',
  feeAmount: 15,
  feePercentage: 0,
  eligibleAfterDays: 90,
  currency: 'AED',
  supportedMethods: ['BANK_TRANSFER', 'MOBILE_WALLET'],
  processingTime: 'Instant',
};

const MOCK_TRANSACTIONS: EWATransaction[] = [
  {
    id: 'ewa_001',
    employeeId: 'emp_001',
    requestedAmount: 1_500,
    feeAmount: 15,
    netAmount: 1_485,
    currency: 'AED',
    status: 'COMPLETED',
    paymentMethod: 'BANK_TRANSFER',
    requestedAt: '2025-01-20T09:12:00Z',
    processedAt: '2025-01-20T09:12:31Z',
    payPeriod: '2025-01',
  },
  {
    id: 'ewa_002',
    employeeId: 'emp_001',
    requestedAmount: 800,
    feeAmount: 15,
    netAmount: 785,
    currency: 'AED',
    status: 'COMPLETED',
    paymentMethod: 'MOBILE_WALLET',
    requestedAt: '2025-02-05T14:33:00Z',
    processedAt: '2025-02-05T14:33:18Z',
    payPeriod: '2025-02',
  },
  {
    id: 'ewa_003',
    employeeId: 'emp_002',
    requestedAmount: 2_000,
    feeAmount: 15,
    netAmount: 1_985,
    currency: 'AED',
    status: 'COMPLETED',
    paymentMethod: 'BANK_TRANSFER',
    requestedAt: '2025-01-18T07:55:00Z',
    processedAt: '2025-01-18T07:55:22Z',
    payPeriod: '2025-01',
  },
  {
    id: 'ewa_004',
    employeeId: 'emp_003',
    requestedAmount: 500,
    feeAmount: 15,
    netAmount: 485,
    currency: 'AED',
    status: 'PROCESSING',
    paymentMethod: 'BANK_TRANSFER',
    requestedAt: '2025-02-22T11:00:00Z',
    payPeriod: '2025-02',
  },
  {
    id: 'ewa_005',
    employeeId: 'emp_004',
    requestedAmount: 3_000,
    feeAmount: 15,
    netAmount: 2_985,
    currency: 'AED',
    status: 'FAILED',
    paymentMethod: 'MOBILE_WALLET',
    requestedAt: '2025-02-10T16:44:00Z',
    payPeriod: '2025-02',
    notes: 'Payment gateway timeout — please retry',
  },
  {
    id: 'ewa_006',
    employeeId: 'emp_005',
    requestedAmount: 1_200,
    feeAmount: 15,
    netAmount: 1_185,
    currency: 'AED',
    status: 'COMPLETED',
    paymentMethod: 'BANK_TRANSFER',
    requestedAt: '2025-01-25T08:20:00Z',
    processedAt: '2025-01-25T08:20:15Z',
    payPeriod: '2025-01',
  },
  {
    id: 'ewa_007',
    employeeId: 'emp_001',
    requestedAmount: 700,
    feeAmount: 15,
    netAmount: 685,
    currency: 'AED',
    status: 'COMPLETED',
    paymentMethod: 'BANK_TRANSFER',
    requestedAt: '2024-12-19T10:05:00Z',
    processedAt: '2024-12-19T10:05:20Z',
    payPeriod: '2024-12',
  },
  {
    id: 'ewa_008',
    employeeId: 'emp_006',
    requestedAmount: 2_500,
    feeAmount: 15,
    netAmount: 2_485,
    currency: 'AED',
    status: 'COMPLETED',
    paymentMethod: 'BANK_TRANSFER',
    requestedAt: '2025-02-12T13:30:00Z',
    processedAt: '2025-02-12T13:30:28Z',
    payPeriod: '2025-02',
  },
];

const MOCK_ANALYTICS: EWAAnalytics = {
  adoptionRate: 18.5,
  avgWithdrawalAmount: 1_430,
  totalWithdrawals: 156,
  totalAmount: 223_080,
  totalFees: 2_340,
  byMonth: [
    { month: '2024-09', count: 18, amount: 22_500 },
    { month: '2024-10', count: 22, amount: 29_800 },
    { month: '2024-11', count: 25, amount: 34_200 },
    { month: '2024-12', count: 28, amount: 40_100 },
    { month: '2025-01', count: 33, amount: 48_600 },
    { month: '2025-02', count: 30, amount: 47_880 },
  ],
  topDepartments: [
    { department: 'Engineering', count: 45, amount: 64_350 },
    { department: 'Operations', count: 32, amount: 42_560 },
    { department: 'Finance', count: 22, amount: 35_200 },
    { department: 'HR', count: 18, amount: 25_740 },
    { department: 'Sales', count: 15, amount: 24_900 },
  ],
};

// ── Service Functions ──────────────────────────────────────────────────────

/**
 * Check EWA eligibility and available amount for an employee.
 */
export async function getEWAEligibility(employeeId: string): Promise<EWAEligibility> {
  await _delay();

  // Simulate: some employees are ineligible
  const ineligibleIds = ['emp_015', 'emp_016'];
  const isIneligible = ineligibleIds.includes(employeeId);

  // Calculate earned wages based on days elapsed in current month
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const earnedFraction = dayOfMonth / daysInMonth;

  const grossMonthly = 12_500; // mock monthly salary
  const grossEarned = Math.floor(grossMonthly * earnedFraction);
  const maxDrawable = Math.min(
    grossEarned * (MOCK_POLICY.maxWithdrawalPercent / 100),
    MOCK_POLICY.maxAbsoluteAmount
  );
  const alreadyDrawn = MOCK_TRANSACTIONS.filter(
    (t) =>
      t.employeeId === employeeId &&
      t.status !== 'FAILED' &&
      t.status !== 'REFUNDED' &&
      t.payPeriod === '2025-02'
  ).reduce((sum, t) => sum + t.requestedAmount, 0);
  const available = Math.max(0, maxDrawable - alreadyDrawn);

  const nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, 26); // 26th of next month
  const daysUntil = Math.ceil((nextPayday.getTime() - today.getTime()) / 86_400_000);

  return {
    employeeId,
    employeeName: 'Employee ' + employeeId,
    isEligible: !isIneligible && available > 0,
    ineligibilityReason: isIneligible
      ? 'Employee does not meet eligibility criteria (< 90 days tenure or on PIP)'
      : available <= 0
        ? 'Maximum withdrawal limit reached for this pay period'
        : undefined,
    grossEarnedToDate: grossEarned,
    alreadyDrawn,
    availableAmount: available,
    maxDrawPercentage: MOCK_POLICY.maxWithdrawalPercent,
    currency: MOCK_POLICY.currency,
    nextPayday: nextPayday.toISOString().slice(0, 10),
    daysUntilPayday: daysUntil,
    feePerRequest: MOCK_POLICY.feeAmount,
    feePercentage: MOCK_POLICY.feePercentage,
  };
}

/**
 * Request an early pay withdrawal.
 */
export async function requestEarlyPay(
  employeeId: string,
  amount: number,
  paymentMethod: PaymentMethod = 'BANK_TRANSFER'
): Promise<EWATransaction> {
  await _delay(300);

  const eligibility = await getEWAEligibility(employeeId);

  if (!eligibility.isEligible) {
    throw new Error(`Employee not eligible: ${eligibility.ineligibilityReason}`);
  }

  if (amount > eligibility.availableAmount) {
    throw new Error(
      `Requested amount AED ${amount} exceeds available AED ${eligibility.availableAmount}`
    );
  }

  if (amount < 100) {
    throw new Error('Minimum withdrawal amount is AED 100');
  }

  const feeAmount =
    MOCK_POLICY.feeType === 'FLAT'
      ? MOCK_POLICY.feeAmount
      : MOCK_POLICY.feeType === 'PERCENTAGE'
        ? Math.round((amount * MOCK_POLICY.feePercentage) / 100)
        : 0;

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const transaction: EWATransaction = {
    id: `ewa_${Date.now()}`,
    employeeId,
    requestedAmount: amount,
    feeAmount,
    netAmount: amount - feeAmount,
    currency: MOCK_POLICY.currency,
    status: 'COMPLETED', // mock: instant
    paymentMethod,
    requestedAt: now.toISOString(),
    processedAt: now.toISOString(),
    payPeriod: period,
  };

  MOCK_TRANSACTIONS.push(transaction);
  return transaction;
}

/**
 * Get EWA transaction history for an employee.
 */
export async function getEWAHistory(employeeId: string): Promise<EWATransaction[]> {
  await _delay();
  return MOCK_TRANSACTIONS.filter((t) => t.employeeId === employeeId).sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt)
  );
}

/**
 * Get company EWA policy settings.
 */
export async function getEWASettings(): Promise<EWAPolicy> {
  await _delay();
  return { ...MOCK_POLICY };
}

/**
 * Calculate the available EWA amount for an employee.
 */
export async function calculateAvailableAmount(employeeId: string): Promise<number> {
  const elig = await getEWAEligibility(employeeId);
  return elig.availableAmount;
}

/**
 * Process a pending EWA payment (admin / finance action).
 */
export async function processEWAPayment(requestId: string): Promise<EWATransaction | null> {
  await _delay(500);
  const idx = MOCK_TRANSACTIONS.findIndex((t) => t.id === requestId);
  if (idx === -1) return null;

  MOCK_TRANSACTIONS[idx] = {
    ...MOCK_TRANSACTIONS[idx],
    status: 'COMPLETED',
    processedAt: new Date().toISOString(),
  };

  return MOCK_TRANSACTIONS[idx];
}

/**
 * Get HR analytics for EWA program.
 */
export async function getEWAAnalytics(): Promise<EWAAnalytics> {
  await _delay();
  return { ...MOCK_ANALYTICS };
}

// ── Private helpers ────────────────────────────────────────────────────────

function _delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
