/**
 * EPIC-16 Emiratisation — fake-risk clustering (multi-signal).
 *
 * Closes the audit gap "Fake-risk detection has only 3 signals (need
 * clustering)" for EPIC-16. The existing detector flags fictitious
 * Emiratisation hires when a single signal trips. Inspectors expect a
 * RISK SCORE built from many weak signals and cluster-level groupings
 * (multiple hires on the same date from the same recruiter to the same
 * cost centre, with overlapping addresses, etc.).
 *
 * This service produces a typed risk profile per UAE-national hire:
 *
 *   {
 *     employeeId, riskScore (0..100), riskBand (LOW/MEDIUM/HIGH/CRITICAL),
 *     signals: [{ code, weight, evidence }, ...],
 *     cluster: { recruiterId?, costCenterId?, hiredOn?, size },
 *   }
 *
 * Pure helpers, no IO — DB-driven wrapper is the thin shell on top.
 *
 * Signals (weights tuned so any 3 medium-weight signals push to HIGH):
 *   ABSENT_FROM_ROSTER         (20)
 *   LOW_PAYROLL_AMOUNT          (15) basicSalary < threshold
 *   NO_ATTENDANCE_LAST_30D      (20)
 *   SHARED_BANK_ACCOUNT         (25) bankAccountIban shared with 2+ others
 *   SHARED_ADDRESS              (10) permanentAddress shared with 3+ others
 *   HIRED_SAME_DAY_SAME_RECRUITER (10) cluster signal
 *   SAME_COST_CENTER_SPIKE      (10) > N hires in a day to same CC
 *   NO_VISA_ON_FILE             (15)
 *   SALARY_BELOW_MIN_WAGE       (20)
 *   FAMILY_RELATION_TO_HR       (15)
 */

export interface HireSnapshot {
  employeeId: string;
  basicSalary: number;
  currency: string;
  bankAccountIban?: string;
  permanentAddress?: string;
  hiredOn: Date;
  recruiterId?: string;
  costCenterId?: string;
  hasVisaOnFile: boolean;
  isOnRoster: boolean;
  attendanceDaysLast30: number;
  /** True when HR-flagged familial link to a manager / HR / approver. */
  familyLinkedToHr: boolean;
}

export interface SignalEvidence {
  code: string;
  weight: number;
  evidence: string;
}

export interface RiskProfile {
  employeeId: string;
  riskScore: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signals: SignalEvidence[];
  cluster: {
    recruiterId?: string;
    costCenterId?: string;
    hiredOn?: Date;
    sameDaySameRecruiter: number;
    sameDaySameCostCenter: number;
  };
}

export interface ClusteringConfig {
  /** basicSalary below this counts as LOW_PAYROLL_AMOUNT. */
  lowPayrollAmount: number;
  /** Minimum legal monthly wage. */
  minMonthlyWage: number;
  /** Same-recruiter same-day cluster threshold. */
  sameDayRecruiterThreshold: number;
  /** Same-cost-center same-day cluster threshold. */
  sameDayCostCenterThreshold: number;
  /** Shared-bank-account threshold (others sharing the same iban). */
  sharedBankAccountMin: number;
  /** Shared-address threshold. */
  sharedAddressMin: number;
}

export const DEFAULT_CLUSTERING_CONFIG: ClusteringConfig = {
  lowPayrollAmount: 4000, // AED
  minMonthlyWage: 3000,
  sameDayRecruiterThreshold: 3,
  sameDayCostCenterThreshold: 5,
  sharedBankAccountMin: 2,
  sharedAddressMin: 3,
};

const WEIGHTS = {
  ABSENT_FROM_ROSTER: 20,
  LOW_PAYROLL_AMOUNT: 15,
  NO_ATTENDANCE_LAST_30D: 20,
  SHARED_BANK_ACCOUNT: 25,
  SHARED_ADDRESS: 10,
  HIRED_SAME_DAY_SAME_RECRUITER: 10,
  SAME_COST_CENTER_SPIKE: 10,
  NO_VISA_ON_FILE: 15,
  SALARY_BELOW_MIN_WAGE: 20,
  FAMILY_RELATION_TO_HR: 15,
} as const;

function band(score: number): RiskProfile['riskBand'] {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function dayKey(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

/**
 * Pure helper. Given the snapshot of one hire plus the cohort
 * (used to compute shared / cluster signals), returns the risk
 * profile.
 */
export function profileHireRisk(
  hire: HireSnapshot,
  cohort: HireSnapshot[],
  config: ClusteringConfig = DEFAULT_CLUSTERING_CONFIG
): RiskProfile {
  const signals: SignalEvidence[] = [];

  if (!hire.isOnRoster) {
    signals.push({
      code: 'ABSENT_FROM_ROSTER',
      weight: WEIGHTS.ABSENT_FROM_ROSTER,
      evidence: 'Hire is not present on the active employee roster',
    });
  }
  if (hire.basicSalary < config.minMonthlyWage) {
    signals.push({
      code: 'SALARY_BELOW_MIN_WAGE',
      weight: WEIGHTS.SALARY_BELOW_MIN_WAGE,
      evidence: `basicSalary ${hire.basicSalary} ${hire.currency} below min wage ${config.minMonthlyWage}`,
    });
  } else if (hire.basicSalary < config.lowPayrollAmount) {
    signals.push({
      code: 'LOW_PAYROLL_AMOUNT',
      weight: WEIGHTS.LOW_PAYROLL_AMOUNT,
      evidence: `basicSalary ${hire.basicSalary} ${hire.currency} below the cohort floor ${config.lowPayrollAmount}`,
    });
  }
  if (hire.attendanceDaysLast30 < 5) {
    signals.push({
      code: 'NO_ATTENDANCE_LAST_30D',
      weight: WEIGHTS.NO_ATTENDANCE_LAST_30D,
      evidence: `Only ${hire.attendanceDaysLast30} attendance days in the last 30`,
    });
  }
  if (!hire.hasVisaOnFile) {
    signals.push({
      code: 'NO_VISA_ON_FILE',
      weight: WEIGHTS.NO_VISA_ON_FILE,
      evidence: 'No visa / work permit document on file',
    });
  }
  if (hire.familyLinkedToHr) {
    signals.push({
      code: 'FAMILY_RELATION_TO_HR',
      weight: WEIGHTS.FAMILY_RELATION_TO_HR,
      evidence: 'Documented familial link to an HR / manager / approver',
    });
  }

  if (hire.bankAccountIban) {
    const sharedBank = cohort.filter(
      (h) => h.bankAccountIban === hire.bankAccountIban && h.employeeId !== hire.employeeId
    ).length;
    if (sharedBank >= config.sharedBankAccountMin) {
      signals.push({
        code: 'SHARED_BANK_ACCOUNT',
        weight: WEIGHTS.SHARED_BANK_ACCOUNT,
        evidence: `${sharedBank} other hires share the same IBAN`,
      });
    }
  }
  if (hire.permanentAddress) {
    const sharedAddr = cohort.filter(
      (h) => h.permanentAddress === hire.permanentAddress && h.employeeId !== hire.employeeId
    ).length;
    if (sharedAddr >= config.sharedAddressMin) {
      signals.push({
        code: 'SHARED_ADDRESS',
        weight: WEIGHTS.SHARED_ADDRESS,
        evidence: `${sharedAddr} other hires share the same permanent address`,
      });
    }
  }

  // Cluster signals.
  const hd = dayKey(hire.hiredOn);
  const sameDayRecruiter = cohort.filter(
    (h) =>
      h.recruiterId &&
      h.recruiterId === hire.recruiterId &&
      dayKey(h.hiredOn) === hd &&
      h.employeeId !== hire.employeeId
  ).length;
  const sameDayCostCenter = cohort.filter(
    (h) =>
      h.costCenterId &&
      h.costCenterId === hire.costCenterId &&
      dayKey(h.hiredOn) === hd &&
      h.employeeId !== hire.employeeId
  ).length;

  if (sameDayRecruiter >= config.sameDayRecruiterThreshold - 1) {
    signals.push({
      code: 'HIRED_SAME_DAY_SAME_RECRUITER',
      weight: WEIGHTS.HIRED_SAME_DAY_SAME_RECRUITER,
      evidence: `${sameDayRecruiter + 1} hires by recruiter ${hire.recruiterId} on ${hd}`,
    });
  }
  if (sameDayCostCenter >= config.sameDayCostCenterThreshold - 1) {
    signals.push({
      code: 'SAME_COST_CENTER_SPIKE',
      weight: WEIGHTS.SAME_COST_CENTER_SPIKE,
      evidence: `${sameDayCostCenter + 1} hires to cost-centre ${hire.costCenterId} on ${hd}`,
    });
  }

  const riskScore = Math.min(
    100,
    signals.reduce((acc, s) => acc + s.weight, 0)
  );

  return {
    employeeId: hire.employeeId,
    riskScore,
    riskBand: band(riskScore),
    signals,
    cluster: {
      recruiterId: hire.recruiterId,
      costCenterId: hire.costCenterId,
      hiredOn: hire.hiredOn,
      sameDaySameRecruiter: sameDayRecruiter,
      sameDaySameCostCenter: sameDayCostCenter,
    },
  };
}

/**
 * Pure helper. Bulk-profile a cohort. Each profile sees the rest of
 * the cohort for clustering signals.
 */
export function profileCohort(
  cohort: HireSnapshot[],
  config: ClusteringConfig = DEFAULT_CLUSTERING_CONFIG
): RiskProfile[] {
  return cohort.map((h) => profileHireRisk(h, cohort, config));
}
