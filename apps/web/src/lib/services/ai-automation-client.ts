/**
 * AI Automation Module - Client Service
 * Centralized API client for all AI Automation features
 */

const API_BASE = '/api/ai';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to handle API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return data;
  } catch (error) {
        return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Workflow Generator
export const workflowGenerator = {
  generateWorkflow: async (prompt: string) =>
    apiCall('/workflow/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }),

  getWorkflows: async () => apiCall('/workflow'),

  saveWorkflow: async (workflow: any) =>
    apiCall('/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    }),
};

// Org Health Predictor
export const orgHealthPredictor = {
  getHealthMetrics: async () => apiCall('/org-health'),

  getPredictions: async () => apiCall('/org-health/predictions'),

  getRecommendations: async () => apiCall('/org-health/recommendations'),
};

// AI Coaching Bot
export const aiCoachingBot = {
  sendMessage: async (message: string, sessionId?: string) =>
    apiCall('/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
    }),

  getSessions: async () => apiCall('/chatbot/sessions'),

  getSessionHistory: async (sessionId: string) => apiCall(`/chatbot/sessions/${sessionId}`),
};

// L&D Recommendation
export const ldRecommendation = {
  getRecommendations: async () => apiCall('/learning'),

  getSkillGaps: async () => apiCall('/learning/skill-gaps'),

  enrollCourse: async (courseId: string) =>
    apiCall('/learning/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
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

  scheduleInterview: async (interviewData: any) =>
    apiCall('/interview/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interviewData),
    }),

  getSuggestedSlots: async (candidateId: string) => apiCall(`/interview/suggest-slots/${candidateId}`),
};

// Resume Parsing
export const resumeParsing = {
  parseResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiCall('/resume/parse', {
      method: 'POST',
      body: formData,
    });
  },

  getParsedResumes: async () => apiCall('/resume'),

  updateParsedData: async (resumeId: string, data: any) =>
    apiCall(`/resume/${resumeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

// Job Matching
export const jobMatching = {
  getMatches: async () => apiCall('/job-matching'),

  matchCandidates: async (jobId: string) => apiCall(`/job-matching/job/${jobId}`),

  matchJobs: async (candidateId: string) => apiCall(`/job-matching/candidate/${candidateId}`),
};

// Email Parser
export const emailParser = {
  parseEmails: async () => apiCall('/email-parser'),

  processEmail: async (emailId: string, action: string) =>
    apiCall('/email-parser/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, action }),
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

  getPeakPeriods: async () => apiCall('/leave-forecasting/peak-periods'),

  getRecommendations: async () => apiCall('/leave-forecasting/recommendations'),
};

// Job Boards Integration
export const jobBoards = {
  getJobBoards: async () => apiCall('/job-boards'),

  postJob: async (jobData: any, boards: string[]) =>
    apiCall('/job-boards/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobData, boards }),
    }),

  syncCandidates: async () => apiCall('/job-boards/sync'),
};

// Sentiment Analysis
export const sentimentAnalysis = {
  getSentiment: async () => apiCall('/sentiment'),

  analyzeFeedback: async (feedbackId: string) => apiCall(`/sentiment/analyze/${feedbackId}`),

  getTrends: async () => apiCall('/sentiment/trends'),
};

// Predictive Attrition
export const predictiveAttrition = {
  getRiskScores: async () => apiCall('/attrition'),

  getAtRiskEmployees: async () => apiCall('/attrition/at-risk'),

  getRetentionActions: async (employeeId: string) => apiCall(`/attrition/actions/${employeeId}`),
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

  getEmployeeInsights: async (employeeId: string) => apiCall(`/performance/${employeeId}`),

  getTeamInsights: async (teamId: string) => apiCall(`/performance/team/${teamId}`),
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
