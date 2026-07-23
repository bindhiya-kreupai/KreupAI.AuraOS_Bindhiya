/**
 * AI Automation Module - Client Service
 * Centralized API client for all AI Automation features
 */

const API_BASE = '/api/ai';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- HR Coaching Bot API types ---

export type CoachingAutomationAction = {
  id: string;
  type: 'navigate' | 'draft' | 'schedule' | 'execute' | 'workflow';
  label: string;
  description?: string;
  path?: string;
  payload?: Record<string, unknown>;
};

export type CoachingDecisionOption = {
  id: string;
  label: string;
  pros: string[];
  cons: string[];
  recommendation?: boolean;
};

export type CoachingPolicySource = {
  index: number;
  title: string;
  source: string;
  snippet?: string;
  similarity?: number;
  policyId?: string;
  href?: string;
};

export type CoachingCitation = {
  title: string;
  source: string;
  policyId?: string;
  href?: string;
};

export type CoachingEmployeeContext = {
  employeeId: string;
  employeeCode: string;
  name: string;
  department?: string;
  jobTitle?: string;
  managerName?: string;
  tenureMonths?: number;
  pendingLeaveRequests: number;
  approvedLeaveDaysYtd: number;
  latestPerformanceRating?: number;
  performanceReviewStatus?: string;
  directReports: number;
};

export type CoachingChatResponse = {
  messageId: string;
  sessionId: string;
  response: string;
  message?: string;
  suggestions?: string[];
  actions?: CoachingAutomationAction[];
  decisions?: {
    title: string;
    context: string;
    options: CoachingDecisionOption[];
    recommendedAction?: string;
  };
  citations?: CoachingCitation[];
  sources?: CoachingPolicySource[];
  employeeContext?: CoachingEmployeeContext;
  workforce?: {
    pendingLeaveApprovals: number;
    employeesOnLeaveNow: number;
    openPerformanceReviews: number;
    publishedPoliciesCount: number;
  };
  grounded?: boolean;
  retrievalNote?: string;
  automationsQueued?: { task: string; status: 'ready' | 'pending' }[];
  provider?: 'groq' | 'openai' | 'gemini';
  model?: string;
  aiEnabled?: boolean;
  jurisdiction?: CoachingJurisdiction;
  timestamp: string;
};

export type CoachingJurisdiction = {
  countryCode: string;
  countryName: string;
  labourAuthority: string;
  enabledCountries?: string[];
};

export type CoachingConfigResponse = {
  aiEnabled: boolean;
  ragEnabled?: boolean;
  employeeGrounding?: boolean;
  providers?: { groq?: boolean; openai?: boolean; gemini?: boolean };
  primary?: string | null;
  model?: string;
  jurisdiction?: CoachingJurisdiction;
};

export type CoachingRecommendation = {
  type: string;
  title: string;
  action: string;
  relevance: number;
  provider?: string;
  duration?: string;
};

export type CoachingRecommendationsResponse = {
  recommendations: CoachingRecommendation[];
};

export type CoachingAutomateResponse = {
  actionId: string;
  message: string;
  path?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
};

// Helper function to handle API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      ...options,
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Request failed (${response.status})`,
      };
    }
    return data;
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export type WorkflowGeneratedStep = {
  id: string;
  type: 'trigger' | 'action' | 'approval' | 'condition' | 'notification' | 'wait' | 'integration';
  label: string;
  description?: string;
  timing?: string;
  config?: Record<string, unknown>;
};

export type WorkflowGenerateResponse = {
  name: string;
  description: string;
  trigger: string;
  triggerEvent?: string;
  steps: WorkflowGeneratedStep[];
  nodes: Array<{
    id: string;
    type?: string;
    data: { label: string; stepType?: string; description?: string };
    position: { x: number; y: number };
    style?: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    markerEnd?: { type: string };
  }>;
  efficiencyScore: number;
  estimatedHoursSaved: number;
  estimatedDurationMinutes: number;
  confidenceScore: number;
  suggestions: string[];
  provider?: string;
  model?: string;
  aiEnabled: boolean;
  timestamp?: string;
};

export type SavedWorkflow = {
  id: string;
  name: string;
  description?: string | null;
  trigger: string;
  triggerEvent?: string | null;
  nodes: unknown;
  edges: unknown;
  isActive: boolean;
  version: number;
  executionCount?: number;
  updatedAt: string;
};

// Workflow Generator
export const workflowGenerator = {
  generateWorkflow: async (prompt: string) =>
    apiCall<WorkflowGenerateResponse>('/workflow/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }),

  getWorkflows: async () => apiCall<{ workflows: SavedWorkflow[]; total: number }>('/workflow'),

  saveWorkflow: async (payload: {
    name: string;
    description?: string;
    trigger?: string;
    triggerEvent?: string;
    nodes: unknown;
    edges: unknown;
    steps?: WorkflowGeneratedStep[];
    prompt?: string;
    activate?: boolean;
  }) =>
    apiCall<{ workflow: SavedWorkflow; message: string; workflowEnginePath?: string }>(
      '/workflow',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    ),

  getConfig: async () =>
    apiCall<{ aiEnabled: boolean; providers: Record<string, boolean>; primary: string | null }>(
      '/workflow?type=config'
    ),
};

// Org Health Predictor
export const orgHealthPredictor = {
  getHealthMetrics: async () => apiCall('/org-health'),

  getPredictions: async () => apiCall('/org-health/predictions'),

  getRecommendations: async () => apiCall('/org-health/recommendations'),
};

// AI HR Coaching Bot — decision support & task automation
export const aiCoachingBot = {
  sendMessage: async (
    message: string,
    sessionId?: string,
    history?: { role: 'user' | 'assistant'; content: string }[],
    employeeId?: string,
    countryCode?: string
  ): Promise<ApiResponse<CoachingChatResponse>> =>
    apiCall<CoachingChatResponse>('/coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        message,
        sessionId,
        history,
        employeeId,
        countryCode,
      }),
    }),

  runAutomation: async (
    actionId: string,
    payload?: Record<string, unknown>
  ): Promise<ApiResponse<CoachingAutomateResponse>> =>
    apiCall<CoachingAutomateResponse>('/coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'automate', actionId, payload }),
    }),

  getRecommendations: async (): Promise<ApiResponse<CoachingRecommendationsResponse>> =>
    apiCall<CoachingRecommendationsResponse>('/coaching?type=recommendations'),

  getConfig: async (): Promise<ApiResponse<CoachingConfigResponse>> =>
    apiCall<CoachingConfigResponse>('/coaching?type=config'),

  getStats: async (): Promise<ApiResponse<Record<string, unknown>>> =>
    apiCall<Record<string, unknown>>('/coaching'),

  submitFeedback: async (
    messageId: string,
    helpful: boolean
  ): Promise<ApiResponse<{ message: string }>> =>
    apiCall<{ message: string }>('/coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'feedback', messageId, helpful }),
    }),

  getSessions: async () => apiCall('/coaching?type=sessions'),

  getSessionHistory: async (sessionId: string) =>
    apiCall(`/coaching?type=session&sessionId=${encodeURIComponent(sessionId)}`),
};

/** Candidate chatbot flow builder + runtime (distinct from HR coaching) */
export const candidateChatbot = {
  getFlow: async () =>
    apiCall<{ nodes: unknown[]; edges: unknown[]; updatedAt?: string }>('/chatbot'),

  saveFlow: async (payload: { nodes: unknown[]; edges: unknown[]; name?: string }) =>
    apiCall('/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save-flow', ...payload }),
    }),

  chat: async (message: string, sessionId?: string) =>
    apiCall('/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'chat', message, sessionId }),
    }),

  getSessions: async () => apiCall('/chatbot?view=sessions'),
};

// L&D Recommendation
export const ldRecommendation = {
  getRecommendations: async () => apiCall('/learning'),

  getSkillGaps: async () => apiCall('/learning?view=skill-gaps'),

  enrollCourse: async (courseId: string) =>
    apiCall('/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enroll', courseId }),
    }),
};

// Anomaly Detection
export const anomalyDetection = {
  getAnomalies: async () => apiCall('/anomaly'),

  getAnomalyDetails: async (anomalyId: string) => apiCall(`/anomaly/${anomalyId}`),

  resolveAnomaly: async (anomalyId: string, resolution: string) =>
    apiCall(`/anomaly/${anomalyId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution }),
    }),
};

// Interview Scheduling
export const interviewScheduling = {
  getSchedules: async () => apiCall('/interview'),

  scheduleInterview: async (interviewData: Record<string, unknown>) =>
    apiCall('/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'schedule', ...interviewData }),
    }),

  getSuggestedSlots: async (candidateId: string) =>
    apiCall(`/interview?view=suggest-slots&candidateId=${encodeURIComponent(candidateId)}`),

  confirmSchedule: async (proposalId: string) =>
    apiCall('/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm', proposalId }),
    }),
};

// Resume Screening (Phase 3 Recruitment AI)
export type ResumeScreeningListItem = {
  id: string;
  candidateName: string;
  jobTitle: string;
  overallScore: number;
  recommendation: string;
  skills: string[];
  biasFlagged: boolean;
  biasReasons: string[];
  interviewRecommended: boolean;
  provider: string;
  screenedAt: string;
};

export type ResumeScreeningJobOption = {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  location?: string | null;
  source: string;
};

export type ResumeScreeningResult = {
  screeningId: string;
  overallScore: number;
  recommendation: string;
  skillsMatchPercentage: number;
  experienceMatchPercentage: number;
  educationMatchPercentage: number;
  cultureFitScore: number;
  matchedSkills: string[];
  missingCriticalSkills: string[];
  strengths: string[];
  redFlags: string[];
  interviewRecommended: boolean;
  interviewFocusAreas: string[];
  bias: { flagged: boolean; reasons: string[]; fairnessNotes: string };
  extracted: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    summary: string | null;
    skills: string[];
    yearsExperience: number;
    education: string[];
    certifications: string[];
    rawConfidence: number;
  };
  job: { jobTitle: string; requiredSkills: string[]; jobId?: string };
  provider: string;
  model?: string;
  aiEnabled: boolean;
  confidenceScore: number;
  processingTimeMs: number;
  screenedAt: string;
  fileName?: string;
  rank?: number;
};

export type BulkScreeningResult = {
  batchId: string;
  job: { jobTitle: string; requiredSkills: string[]; jobId?: string };
  total: number;
  succeeded: number;
  failed: number;
  rankings: ResumeScreeningResult[];
  failures: { fileName?: string; error: string }[];
  processingTimeMs: number;
  screenedAt: string;
};

export const resumeParsing = {
  /** @deprecated use resumeScreening.screenBulk */
  parseResume: async (file: File) => {
    return resumeScreening.screenBulk({
      files: [file],
    });
  },

  getParsedResumes: async () => resumeScreening.list(),

  updateParsedData: async (resumeId: string, data: any) =>
    apiCall(`/resume/${resumeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

export const resumeScreening = {
  list: async () =>
    apiCall<{
      screenings: ResumeScreeningListItem[];
      jobs: ResumeScreeningJobOption[];
      stats: {
        processed: number;
        avgMatchScore: number;
        biasFlags: number;
        interviewReady: number;
        fairnessStatus: string;
      };
      config: { aiEnabled: boolean; providers: Record<string, boolean>; primary: string | null };
    }>('/resume'),

  getConfig: async () =>
    apiCall<{ aiEnabled: boolean; providers: Record<string, boolean>; primary: string | null }>(
      '/resume?type=config'
    ),

  screen: async (payload: {
    resumeText: string;
    jobId?: string;
    jobTitle?: string;
    requiredSkills?: string[];
    preferredSkills?: string[];
    minYearsExperience?: number;
    educationLevel?: string;
    description?: string;
    fileName?: string;
  }) =>
    apiCall<BulkScreeningResult>('/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  /** Upload one or many resume files and rank them against a role */
  screenBulk: async (payload: {
    files: File[];
    resumeText?: string;
    jobId?: string;
    jobTitle?: string;
    requiredSkills?: string | string[];
    preferredSkills?: string | string[];
    minYearsExperience?: number;
    educationLevel?: string;
    description?: string;
  }) => {
    const form = new FormData();
    for (const file of payload.files) {
      form.append('files', file);
    }
    if (payload.resumeText) form.append('resumeText', payload.resumeText);
    if (payload.jobId) form.append('jobId', payload.jobId);
    if (payload.jobTitle) form.append('jobTitle', payload.jobTitle);
    if (payload.requiredSkills) {
      form.append(
        'requiredSkills',
        Array.isArray(payload.requiredSkills)
          ? payload.requiredSkills.join(',')
          : payload.requiredSkills
      );
    }
    if (payload.preferredSkills) {
      form.append(
        'preferredSkills',
        Array.isArray(payload.preferredSkills)
          ? payload.preferredSkills.join(',')
          : payload.preferredSkills
      );
    }
    if (payload.minYearsExperience != null) {
      form.append('minYearsExperience', String(payload.minYearsExperience));
    }
    if (payload.educationLevel) form.append('educationLevel', payload.educationLevel);
    if (payload.description) form.append('description', payload.description);

    return apiCall<BulkScreeningResult>('/resume', {
      method: 'POST',
      body: form,
    });
  },
};

// Job Matching
export const jobMatching = {
  getMatches: async () => apiCall('/job-matching'),

  matchCandidates: async (jobId: string) =>
    apiCall(`/job-matching?view=job&jobId=${encodeURIComponent(jobId)}`),

  matchJobs: async (candidateId: string) =>
    apiCall(`/job-matching?view=candidate&candidateId=${encodeURIComponent(candidateId)}`),
};

// Email Parser
export const emailParser = {
  parseEmails: async () => apiCall('/email-parser'),

  processEmail: async (emailId: string, processAction: string, rawEmail?: string) =>
    apiCall('/email-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: processAction || 'parse', emailId, rawEmail }),
    }),

  commitParsed: async (parseId: string) =>
    apiCall('/email-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'commit', parseId }),
    }),
};

// Workforce Planning
export const workforcePlanning = {
  getForecast: async () => apiCall('/workforce'),

  getHeadcountPlan: async () => apiCall('/workforce/headcount'),

  updatePlan: async (planData: any) =>
    apiCall('/workforce/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    }),
};

// Leave Forecasting
export const leaveForecasting = {
  getForecast: async () => apiCall('/leave-forecasting'),

  getPeakPeriods: async () => apiCall('/leave-forecasting?view=peak-periods'),

  getRecommendations: async () => apiCall('/leave-forecasting?view=recommendations'),

  recompute: async () =>
    apiCall('/leave-forecasting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recompute' }),
    }),
};

// Job Boards Integration
export const jobBoards = {
  getJobBoards: async () => apiCall('/job-boards'),

  postJob: async (jobData: Record<string, unknown>, boards: string[]) =>
    apiCall('/job-boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'post', jobData, boards }),
    }),

  syncCandidates: async () =>
    apiCall('/job-boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync' }),
    }),
};

// Sentiment Analysis / NLP Insights
export const sentimentAnalysis = {
  getSentiment: async () => apiCall('/sentiment'),

  analyzeFeedback: async (feedbackId: string) =>
    apiCall(`/sentiment?view=analyze&feedbackId=${encodeURIComponent(feedbackId)}`),

  getTrends: async () => apiCall('/sentiment?view=trends'),

  recompute: async () =>
    apiCall('/sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recompute' }),
    }),
};

// Predictive Attrition
export type AttritionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AttritionEmployeeRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  role?: string;
  riskScore: number;
  riskLevel: AttritionRiskLevel;
  primaryFactor: string;
  factors?: Array<{ name: string; impact: number; category: string }>;
  recommendations?: Array<{
    action: string;
    priority: string;
    estimatedImpact: number;
  }>;
  modelVersion?: string;
  predictedAt?: string;
};

export type AttritionDashboardResponse = {
  summary: {
    totalEmployees: number;
    atRiskCount: number;
    atRiskPercentage: number;
    replacementCostEstimate: number;
    modelAccuracy: number | null;
    modelVersion: string;
    lastRunAt: string | null;
    byRiskLevel: Record<AttritionRiskLevel, number>;
    horizonDays: number;
  };
  distribution: Array<{ name: string; value: number; color?: string }>;
  drivers: Array<{ factor: string; count: number; impact: string }>;
  stale?: boolean;
  needsRecompute?: boolean;
};

export type AttritionSimulationResponse = {
  salaryBoostPercent: number;
  projectedRiskReductionPct: number;
  estimatedSavedHeadcount: number;
  projectedAtRiskCount: number;
  message: string;
};

export const predictiveAttrition = {
  getRiskScores: async (opts?: { horizonDays?: number; autoRecompute?: boolean }) => {
    const params = new URLSearchParams();
    if (opts?.horizonDays) params.set('horizonDays', String(opts.horizonDays));
    if (opts?.autoRecompute === false) params.set('autoRecompute', 'false');
    const qs = params.toString();
    return apiCall<AttritionDashboardResponse>(`/attrition${qs ? `?${qs}` : ''}`);
  },

  getAtRiskEmployees: async (opts?: {
    limit?: number;
    page?: number;
    departmentId?: string;
    riskLevel?: AttritionRiskLevel;
    horizonDays?: number;
  }) => {
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.departmentId) params.set('departmentId', opts.departmentId);
    if (opts?.riskLevel) params.set('riskLevel', opts.riskLevel);
    if (opts?.horizonDays) params.set('horizonDays', String(opts.horizonDays));
    const qs = params.toString();
    return apiCall<{
      employees: AttritionEmployeeRow[];
      total: number;
      page: number;
      limit: number;
    }>(`/attrition/at-risk${qs ? `?${qs}` : ''}`);
  },

  getRetentionActions: async (employeeId: string) => apiCall(`/attrition/actions/${employeeId}`),

  getEmployeeDetail: async (employeeId: string) =>
    apiCall<AttritionEmployeeRow>(`/attrition/employees/${employeeId}`),

  recompute: async (opts?: { horizonDays?: number; departmentId?: string }) =>
    apiCall('/attrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recompute', ...opts }),
    }),

  simulate: async (salaryBoostPercent: number, horizonDays?: number) =>
    apiCall<AttritionSimulationResponse>('/attrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'simulate',
        salaryBoostPercent,
        horizonDays,
      }),
    }),
};

// Smart Onboarding
export const smartOnboarding = {
  getOnboardingPlan: async (employeeId: string) => apiCall(`/onboarding/${employeeId}`),

  generateOnboardingPlan: async (employeeData: any) =>
    apiCall('/onboarding/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    }),

  updateProgress: async (employeeId: string, taskId: string, status: string) =>
    apiCall('/onboarding/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, taskId, status }),
    }),
};

// Performance Insights
export const performanceInsights = {
  getInsights: async () => apiCall('/performance'),

  getEmployeeInsights: async (employeeId: string) =>
    apiCall(`/performance?view=employee&employeeId=${encodeURIComponent(employeeId)}`),

  getTeamInsights: async (teamId: string) =>
    apiCall(`/performance?view=team&teamId=${encodeURIComponent(teamId)}`),

  recompute: async () =>
    apiCall('/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recompute' }),
    }),
};

// Auto Accruals (rules engine — not LLM)
export const autoAccruals = {
  getRulesAndProjections: async () =>
    apiCall<{
      rules: Array<{ id: string; name: string; logic: string }>;
      projections: Array<Record<string, unknown>>;
      summary?: Record<string, unknown>;
    }>('/auto-accruals'),

  dryRun: async () =>
    apiCall<{
      rules: Array<{ id: string; name: string; logic: string }>;
      projections: Array<Record<string, unknown>>;
      summary?: Record<string, unknown>;
      runId?: string;
    }>('/auto-accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dry-run' }),
    }),

  commitCycle: async () =>
    apiCall<{ runId?: string; committed?: boolean; message?: string }>('/auto-accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'commit' }),
    }),
};

// Auto Compliance Checker
export const autoComplianceChecker = {
  runCheck: async () => apiCall('/compliance/check', { method: 'POST' }),

  getViolations: async () => apiCall('/compliance/violations'),

  resolveViolation: async (violationId: string, resolution: string) =>
    apiCall(`/compliance/violations/${violationId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution }),
    }),
};

// Smart Document Generator
export const smartDocumentGenerator = {
  generateDocument: async (type: string, data: any) =>
    apiCall('/document/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    }),

  getTemplates: async () => apiCall('/document/templates'),

  saveTemplate: async (template: any) =>
    apiCall('/document/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    }),
};

// Payroll Anomaly Detector
export const payrollAnomalyDetector = {
  detectAnomalies: async () => apiCall('/payroll/anomalies', { method: 'POST' }),

  getAnomalies: async () => apiCall('/payroll/anomalies'),

  resolveAnomaly: async (anomalyId: string, resolution: string) =>
    apiCall(`/payroll/anomalies/${anomalyId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution }),
    }),
};
