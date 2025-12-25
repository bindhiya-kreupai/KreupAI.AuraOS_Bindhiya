/**
 * AI & Automation Client Service
 * Centralized API calls for all AI features
 */

// ===== Attrition Prediction =====
export const attrition = {
  async predict(employeeData: any) {
    const response = await fetch('/api/ai/attrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'predict', employeeData }),
    });
    return response.json();
  },

  async batchPredict(employees: any[]) {
    const response = await fetch('/api/ai/attrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'batch', employees }),
    });
    return response.json();
  },

  async getAnalytics(employees: any[]) {
    const response = await fetch('/api/ai/attrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analytics', employees }),
    });
    return response.json();
  },
};

// ===== Organization Health =====
export const orgHealth = {
  async getHealth(params?: { tenantId: string; department?: string; timeframe?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/ai/org-health?${query}`);
    return response.json();
  },

  async analyze(tenantId: string) {
    const response = await fetch('/api/ai/org-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', tenantId }),
    });
    return response.json();
  },

  async getRecommendations(metricType: string, currentScore: number, targetScore: number) {
    const response = await fetch('/api/ai/org-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommend', metricType, currentScore, targetScore }),
    });
    return response.json();
  },

  async simulate(baseline: number, interventions: any[]) {
    const response = await fetch('/api/ai/org-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulate', baseline, interventions }),
    });
    return response.json();
  },
};

// ===== Chatbot =====
export const chatbot = {
  async chat(message: string, conversationId?: string) {
    const response = await fetch('/api/ai/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'chat', message, conversationId }),
    });
    return response.json();
  },

  async getHistory(conversationId: string) {
    const response = await fetch('/api/ai/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'history', conversationId }),
    });
    return response.json();
  },

  async submitFeedback(messageId: string, rating: number, feedback?: string) {
    const response = await fetch('/api/ai/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'feedback', messageId, rating, feedback }),
    });
    return response.json();
  },

  async getConfig() {
    const response = await fetch('/api/ai/chatbot?type=config');
    return response.json();
  },
};

// ===== Leave Forecasting =====
export const leaveForecasting = {
  async forecast(tenantId: string, timeframe?: string, department?: string) {
    const response = await fetch('/api/ai/leave-forecasting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'forecast', tenantId, timeframe, department }),
    });
    return response.json();
  },

  async analyze(tenantId: string) {
    const response = await fetch('/api/ai/leave-forecasting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', tenantId }),
    });
    return response.json();
  },

  async getForecast(params?: { department?: string; period?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/ai/leave-forecasting?${query}`);
    return response.json();
  },
};

// ===== AI Coaching =====
export const coaching = {
  async startSession(employeeId: string, focus?: string) {
    const response = await fetch('/api/ai/coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'session', employeeId, focus }),
    });
    return response.json();
  },

  async getRecommendations(employeeId: string) {
    const response = await fetch('/api/ai/coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommend', employeeId }),
    });
    return response.json();
  },

  async analyzeFeedback(employeeId: string, feedback: any) {
    const response = await fetch('/api/ai/coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'feedback', employeeId, feedback }),
    });
    return response.json();
  },

  async getSessions(employeeId: string) {
    const response = await fetch(`/api/ai/coaching?employeeId=${employeeId}`);
    return response.json();
  },
};

// ===== Workflow Generator =====
export const workflow = {
  async generate(name: string, workflowType: string, config?: any) {
    const response = await fetch('/api/ai/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', name, workflowType, ...config }),
    });
    return response.json();
  },

  async optimize(workflowId: string) {
    const response = await fetch('/api/ai/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'optimize', workflowId }),
    });
    return response.json();
  },

  async validate(workflow: any) {
    const response = await fetch('/api/ai/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', workflow }),
    });
    return response.json();
  },

  async getTemplates(category?: string) {
    const query = category ? `?category=${category}` : '';
    const response = await fetch(`/api/ai/workflow${query}`);
    return response.json();
  },
};

// ===== Anomaly Detection =====
export const anomaly = {
  async detect(tenantId: string, dataType?: string) {
    const response = await fetch('/api/ai/anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'detect', tenantId, dataType }),
    });
    return response.json();
  },

  async analyze(tenantId: string, timeRange?: string) {
    const response = await fetch('/api/ai/anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', tenantId, timeRange }),
    });
    return response.json();
  },

  async configure(tenantId: string, thresholds: any) {
    const response = await fetch('/api/ai/anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'configure', tenantId, thresholds }),
    });
    return response.json();
  },

  async getAnomalies(params?: { severity?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/ai/anomaly?${query}`);
    return response.json();
  },
};

// ===== Interview Scheduling =====
export const interview = {
  async schedule(candidateId: string, interviewers: string[], preferences?: any) {
    const response = await fetch('/api/ai/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'schedule', candidateId, interviewers, ...preferences }),
    });
    return response.json();
  },

  async optimize(currentSchedule: any[]) {
    const response = await fetch('/api/ai/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'optimize', currentSchedule }),
    });
    return response.json();
  },

  async getAvailability(interviewerId: string) {
    const response = await fetch('/api/ai/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'availability', interviewerId }),
    });
    return response.json();
  },

  async reschedule(interviewId: string, newSlot: any) {
    const response = await fetch('/api/ai/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reschedule', interviewId, newSlot }),
    });
    return response.json();
  },

  async getInterviews(period?: string) {
    const query = period ? `?period=${period}` : '';
    const response = await fetch(`/api/ai/interview${query}`);
    return response.json();
  },
};

// ===== Learning & Development =====
export const learning = {
  async getRecommendations(employeeId: string) {
    const response = await fetch('/api/ai/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommend', employeeId }),
    });
    return response.json();
  },

  async analyzeSkills(employeeId: string) {
    const response = await fetch('/api/ai/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', employeeId }),
    });
    return response.json();
  },

  async enroll(employeeId: string, courseId: string) {
    const response = await fetch('/api/ai/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enroll', employeeId, courseId }),
    });
    return response.json();
  },

  async getLearningData(employeeId: string) {
    const response = await fetch(`/api/ai/learning?employeeId=${employeeId}`);
    return response.json();
  },
};

// ===== Job Matching =====
export const jobMatching = {
  async matchJobsForCandidate(candidateId: string) {
    const response = await fetch('/api/ai/job-matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'match', candidateId }),
    });
    return response.json();
  },

  async matchCandidatesForJob(jobId: string) {
    const response = await fetch('/api/ai/job-matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'match', jobId }),
    });
    return response.json();
  },

  async analyzeMarket(jobId: string) {
    const response = await fetch('/api/ai/job-matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', jobId }),
    });
    return response.json();
  },

  async getRecommendations(jobId: string) {
    const response = await fetch('/api/ai/job-matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommend', jobId }),
    });
    return response.json();
  },

  async getStats(jobId?: string) {
    const query = jobId ? `?jobId=${jobId}` : '';
    const response = await fetch(`/api/ai/job-matching${query}`);
    return response.json();
  },
};

// ===== Job Boards =====
export const jobBoards = {
  async postJob(jobId: string, boards: string[]) {
    const response = await fetch('/api/ai/job-boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'post', jobId, boards }),
    });
    return response.json();
  },

  async syncBoards() {
    const response = await fetch('/api/ai/job-boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync' }),
    });
    return response.json();
  },

  async analyzePerformance() {
    const response = await fetch('/api/ai/job-boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze' }),
    });
    return response.json();
  },

  async removePosting(postingId: string) {
    const response = await fetch(`/api/ai/job-boards?postingId=${postingId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getConnectedBoards(board?: string) {
    const query = board ? `?board=${board}` : '';
    const response = await fetch(`/api/ai/job-boards${query}`);
    return response.json();
  },
};

// ===== Email Parser =====
export const emailParser = {
  async parse(email: string | { subject: string; body: string; from: string }) {
    const response = await fetch('/api/ai/email-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'parse', email }),
    });
    return response.json();
  },

  async classify(emailContent: string) {
    const response = await fetch('/api/ai/email-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'classify', emailContent }),
    });
    return response.json();
  },

  async extractEntities(emailContent: string) {
    const response = await fetch('/api/ai/email-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extract', emailContent }),
    });
    return response.json();
  },

  async generateResponse(emailId: string) {
    const response = await fetch('/api/ai/email-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'respond', emailId }),
    });
    return response.json();
  },

  async getStats(period?: string) {
    const query = period ? `?period=${period}` : '';
    const response = await fetch(`/api/ai/email-parser${query}`);
    return response.json();
  },
};

// ===== Auto Accruals =====
export const autoAccruals = {
  async calculate(tenantId: string, employeeIds?: string[]) {
    const response = await fetch('/api/ai/auto-accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'calculate', tenantId, employeeIds }),
    });
    return response.json();
  },

  async process(tenantId: string, employeeIds?: string[]) {
    const response = await fetch('/api/ai/auto-accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'process', tenantId, employeeIds }),
    });
    return response.json();
  },

  async configure(tenantId: string, schedule: string, accrualRules: any) {
    const response = await fetch('/api/ai/auto-accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'configure', tenantId, schedule, accrualRules }),
    });
    return response.json();
  },

  async simulate(tenantId: string, timeframe: string) {
    const response = await fetch('/api/ai/auto-accruals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulate', tenantId, timeframe }),
    });
    return response.json();
  },

  async getStatus(period?: string) {
    const query = period ? `?period=${period}` : '';
    const response = await fetch(`/api/ai/auto-accruals${query}`);
    return response.json();
  },
};

// ===== Resume Screening =====
export const resume = {
  async screen(resumeData: any) {
    const response = await fetch('/api/ai/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'screen', resumeData }),
    });
    return response.json();
  },

  async batchScreen(resumes: any[]) {
    const response = await fetch('/api/ai/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'batch', resumes }),
    });
    return response.json();
  },
};

// ===== Performance Analysis =====
export const performance = {
  async analyze(employeeId: string, period?: string) {
    const response = await fetch('/api/ai/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', employeeId, period }),
    });
    return response.json();
  },

  async predict(employeeData: any) {
    const response = await fetch('/api/ai/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'predict', employeeData }),
    });
    return response.json();
  },
};

// ===== Sentiment Analysis =====
export const sentiment = {
  async analyze(text: string) {
    const response = await fetch('/api/ai/sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', text }),
    });
    return response.json();
  },

  async batchAnalyze(texts: string[]) {
    const response = await fetch('/api/ai/sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'batch', texts }),
    });
    return response.json();
  },
};

// ===== Workforce Analytics =====
export const workforce = {
  async analyze(tenantId: string, params?: any) {
    const response = await fetch('/api/ai/workforce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'analyze', tenantId, ...params }),
    });
    return response.json();
  },

  async forecast(tenantId: string, timeframe: string) {
    const response = await fetch('/api/ai/workforce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'forecast', tenantId, timeframe }),
    });
    return response.json();
  },
};
