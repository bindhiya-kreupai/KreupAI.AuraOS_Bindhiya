import axios from 'axios';

const BASE_PATH = '/api/v1/benefits';

// Types
export interface BenefitPlan {
  id: string;
  name: string;
  type: 'medical' | 'dental' | 'vision' | 'life' | 'disability' | 'other';
  provider: string;
  description: string;
  premium: number;
  employerContribution: number;
  employeeContribution: number;
  coverageLevel: 'individual' | 'individual_spouse' | 'individual_children' | 'family';
  deductible: number;
  outOfPocketMax: number;
  copay: number;
  coinsurance: number;
  features: string[];
  isActive: boolean;
  effectiveDate: string;
  terminationDate?: string;
}

export interface Enrollment {
  id: string;
  planId: string;
  plan: BenefitPlan;
  employeeId: string;
  coverageLevel: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  dependents: Dependent[];
  createdAt: string;
  updatedAt: string;
}

export interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'spouse' | 'child' | 'domestic_partner';
  dateOfBirth: string;
  ssn?: string;
}

export interface EnrollmentRequest {
  planId: string;
  coverageLevel: string;
  startDate: string;
  dependents?: Omit<Dependent, 'id'>[];
}

export interface EnrollmentPeriodStatus {
  isOpen: boolean;
  periodName: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  eligiblePlans: string[];
}

export interface PlanComparison {
  planId: string;
  planName: string;
  type: string;
  monthlyPremium: number;
  annualCost: number;
  employerContribution: number;
  employeeCost: number;
  deductible: number;
  outOfPocketMax: number;
  estimatedTotalCost: number;
  coverageScore: number;
}

export interface HSAFSABalance {
  hsaBalance: number;
  hsaContributionYTD: number;
  hsaContributionLimit: number;
  hsaEmployerContribution: number;
  fsaBalance: number;
  fsaElection: number;
  fsaUsedYTD: number;
  fsaDeadline: string;
}

// Service functions
export async function getAvailablePlans(): Promise<BenefitPlan[]> {
  const response = await axios.get<BenefitPlan[]>(`${BASE_PATH}/plans`);
  return response.data;
}

export async function getPlanDetails(planId: string): Promise<BenefitPlan> {
  const response = await axios.get<BenefitPlan>(
    `${BASE_PATH}/plans/${planId}`
  );
  return response.data;
}

export async function getCurrentEnrollment(): Promise<Enrollment[]> {
  const response = await axios.get<Enrollment[]>(
    `${BASE_PATH}/enrollments/current`
  );
  return response.data;
}

export async function enrollInPlan(
  data: EnrollmentRequest
): Promise<Enrollment> {
  const response = await axios.post<Enrollment>(
    `${BASE_PATH}/enrollments`,
    data
  );
  return response.data;
}

export async function updateEnrollment(
  id: string,
  data: Partial<EnrollmentRequest>
): Promise<Enrollment> {
  const response = await axios.patch<Enrollment>(
    `${BASE_PATH}/enrollments/${id}`,
    data
  );
  return response.data;
}

export async function cancelEnrollment(id: string): Promise<void> {
  await axios.delete(`${BASE_PATH}/enrollments/${id}`);
}

export async function getEnrollmentStatus(): Promise<EnrollmentPeriodStatus> {
  const response = await axios.get<EnrollmentPeriodStatus>(
    `${BASE_PATH}/enrollment-status`
  );
  return response.data;
}

export async function comparePlanCosts(
  planIds: string[]
): Promise<PlanComparison[]> {
  const response = await axios.post<PlanComparison[]>(
    `${BASE_PATH}/plans/compare`,
    { planIds }
  );
  return response.data;
}

export async function getHSAFSABalance(): Promise<HSAFSABalance> {
  const response = await axios.get<HSAFSABalance>(
    `${BASE_PATH}/hsa-fsa/balance`
  );
  return response.data;
}

export async function updateHSAContribution(amount: number): Promise<void> {
  await axios.put(`${BASE_PATH}/hsa-fsa/contribution`, { amount });
}
