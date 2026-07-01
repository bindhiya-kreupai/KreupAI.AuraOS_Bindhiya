/**
 * DEI Module — lean, typed client for the real /api/dei/* surface.
 * All calls go through APIClient (credentialed fetch). Every function returns
 * the exact shape the pages render, so pages carry no mock fallbacks.
 */
import { APIClient } from '@/lib/api-client';

// ----- Diversity metrics -----
export interface DiversityMetrics {
  generatedAt: string;
  totalEmployees: number;
  nationalities: number;
  diversityScore: number;
  avgTenure: number;
  departmentDistribution: { name: string; value: number; percentage: number }[];
  gradeDistribution: { name: string; value: number; percentage: number }[];
  tenureDistribution: { name: string; value: number }[];
}

export async function getDiversityMetrics(departmentId?: string): Promise<DiversityMetrics> {
  const res = await APIClient.get<{ success: boolean; data: DiversityMetrics }>(
    '/dei/metrics',
    departmentId ? { departmentId } : undefined
  );
  return res.data;
}

// ----- Surveys -----
export interface DeiSurvey {
  id: string;
  title: string;
  titleAr?: string | null;
  surveyType: string;
  status: string;
  responseCount: number;
  targetCount: number;
  sentimentScore?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export async function listSurveys(): Promise<DeiSurvey[]> {
  const res = await APIClient.get<{ items: DeiSurvey[] }>('/dei/surveys');
  return res.items ?? [];
}

export async function createSurvey(payload: {
  title: string;
  surveyType?: string;
  description?: string;
  targetCount?: number;
}): Promise<DeiSurvey> {
  const res = await APIClient.post<{ data: DeiSurvey }>('/dei/surveys', payload);
  return res.data;
}

// ----- ERGs -----
export interface DeiErg {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  colorClass?: string | null;
  memberCount: number;
  nextEvent?: string | null;
  status: string;
  isMember: boolean;
}

export async function listErgs(): Promise<DeiErg[]> {
  const res = await APIClient.get<{ items: DeiErg[] }>('/dei/ergs');
  return res.items ?? [];
}

export async function createErg(payload: {
  name: string;
  category?: string;
  description?: string;
  colorClass?: string;
}): Promise<DeiErg> {
  const res = await APIClient.post<{ data: DeiErg }>('/dei/ergs', payload);
  return res.data;
}

export async function joinErg(ergId: string): Promise<DeiErg> {
  const res = await APIClient.post<{ data: DeiErg }>(`/dei/ergs/${ergId}/members`);
  return res.data;
}

export async function leaveErg(ergId: string): Promise<DeiErg> {
  const res = await APIClient.delete<{ data: DeiErg }>(`/dei/ergs/${ergId}/members`);
  return res.data;
}

// ----- Goals -----
export interface DeiGoal {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  targetDate?: string | null;
  keyResults?: unknown;
}

export async function listGoals(): Promise<DeiGoal[]> {
  const res = await APIClient.get<{ items: DeiGoal[] }>('/dei/goals');
  return res.items ?? [];
}

export async function createGoal(payload: {
  title: string;
  category?: string;
  targetValue: number;
  currentValue?: number;
  unit?: string;
  targetDate?: string;
  description?: string;
}): Promise<DeiGoal> {
  const res = await APIClient.post<{ data: DeiGoal }>('/dei/goals', payload);
  return res.data;
}

// ----- Bias training -----
export interface DeiTraining {
  id: string;
  title: string;
  duration: string;
  thumb: string;
  category: string;
  isMandatory: boolean;
  status: string;
  progress: number;
}

export async function listTrainings(): Promise<DeiTraining[]> {
  const res = await APIClient.get<{ items: DeiTraining[] }>('/dei/training');
  return res.items ?? [];
}

export async function updateTrainingProgress(trainingId: string, progress: number): Promise<void> {
  await APIClient.post(`/dei/training/${trainingId}/enroll`, { progress });
}

// ----- Accessibility -----
export interface AccessibilityRequest {
  id: string;
  employeeId: string;
  requestType: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
}

export interface AccessibilityResponse {
  items: AccessibilityRequest[];
  counts: Record<string, number>;
}

export async function listAccessibility(): Promise<AccessibilityResponse> {
  const res = await APIClient.get<AccessibilityResponse>('/dei/accessibility');
  return { items: res.items ?? [], counts: res.counts ?? {} };
}

export async function createAccessibilityRequest(payload: {
  title: string;
  requestType?: string;
  description?: string;
}): Promise<AccessibilityRequest> {
  const res = await APIClient.post<{ data: AccessibilityRequest }>('/dei/accessibility', payload);
  return res.data;
}

export async function reviewAccessibilityRequest(
  id: string,
  status: string,
  reviewNote?: string
): Promise<AccessibilityRequest> {
  const res = await APIClient.patch<{ data: AccessibilityRequest }>(`/dei/accessibility/${id}`, {
    status,
    reviewNote,
  });
  return res.data;
}

// ----- Pay equity -----
export interface PayEquityData {
  generatedAt: string;
  chartData: { role: string; avg: number; male: number; female: number; headcount: number }[];
  summary: { overallGap: number; adjustedGap: number; budgetRequired: number; note: string };
  analysedEmployees: number;
}

export async function getPayEquity(): Promise<PayEquityData> {
  const res = await APIClient.get<{ success: boolean; data: PayEquityData }>('/dei/pay-equity');
  return res.data;
}

// ----- Mentorship -----
export interface MentorshipMatch {
  id: string;
  name: string;
  mentorId: string;
  menteeId: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  goals?: unknown;
  meetingFrequency?: string | null;
}

export interface MentorshipData {
  userId: string;
  activeMatches: MentorshipMatch[];
  pastMatches: MentorshipMatch[];
  total: number;
}

export async function getMentorship(scope?: 'mine'): Promise<MentorshipData> {
  const res = await APIClient.get<{ success: boolean; data: MentorshipData }>(
    '/dei/mentorship',
    scope ? { scope } : undefined
  );
  return res.data;
}

export async function requestMentorship(payload: {
  mentorId: string;
  message?: string;
  goals?: unknown;
}): Promise<MentorshipMatch> {
  const res = await APIClient.post<{ data: MentorshipMatch }>('/dei/mentorship', payload);
  return res.data;
}
