// AI Automation Module - Service Layer
// Handles all business logic and data operations for AI/ML features

import { APIClient } from '@/lib/api-client';
import type {
  OrgHealthPrediction,
  CoachingSession,
  GeneratedWorkflow,
  ResumeScreening,
  AttritionPrediction,
  LeaveForecast,
  DetectedAnomaly,
  ChatbotConversation,
  InterviewSchedule,
  PerformanceAnalysis,
  LDRecommendation,
  JobMatch,
  EmailParsing,
  AutoAccrual,
  NLPInsight,
  AIAutomationSettings,
} from './types';

// ============================================================================
// ORG HEALTH PREDICTOR SERVICE
// ============================================================================

export class OrgHealthPredictorService {
  private static endpoint = '/ai-automation/org-health';

  static async getAllPredictions(): Promise<OrgHealthPrediction[]> {
    try {
      const response = await APIClient.get<{ predictions?: OrgHealthPrediction[] }>(this.endpoint);
      return response.predictions || [];
    } catch {
            return [];
    }
  }

  static async getLatestPrediction(): Promise<OrgHealthPrediction | null> {
    try {
      const response = await APIClient.get<{ prediction?: OrgHealthPrediction }>(`${this.endpoint}/latest`);
      return response.prediction || null;
    } catch {
            return null;
    }
  }

  static async generatePrediction(): Promise<OrgHealthPrediction | null> {
    try {
      const response = await APIClient.post<{ prediction: OrgHealthPrediction }>(`${this.endpoint}/generate`);
      return response.prediction;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// AI COACHING BOT SERVICE
// ============================================================================

export class AICoachingBotService {
  private static endpoint = '/ai-automation/coaching';

  static async getAllSessions(): Promise<CoachingSession[]> {
    try {
      const response = await APIClient.get<{ sessions?: CoachingSession[] }>(this.endpoint);
      return response.sessions || [];
    } catch {
            return [];
    }
  }

  static async getSessionById(sessionId: string): Promise<CoachingSession | null> {
    try {
      const response = await APIClient.get<{ session?: CoachingSession }>(`${this.endpoint}/${sessionId}`);
      return response.session || null;
    } catch {
            return null;
    }
  }

  static async startSession(sessionData: Partial<CoachingSession>): Promise<CoachingSession | null> {
    try {
      const response = await APIClient.post<{ session: CoachingSession }>(this.endpoint, sessionData);
      return response.session;
    } catch {
            return null;
    }
  }

  static async sendMessage(sessionId: string, message: string, sender: 'user' | 'bot'): Promise<CoachingSession | null> {
    try {
      const response = await APIClient.post<{ session: CoachingSession }>(`${this.endpoint}/${sessionId}/message`, { message, sender });
      return response.session;
    } catch {
            return null;
    }
  }

  static async endSession(sessionId: string): Promise<CoachingSession | null> {
    try {
      const response = await APIClient.put<{ session: CoachingSession }>(`${this.endpoint}/${sessionId}/end`);
      return response.session;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// WORKFLOW GENERATOR SERVICE
// ============================================================================

export class WorkflowGeneratorService {
  private static endpoint = '/ai-automation/workflows';

  static async getAllWorkflows(): Promise<GeneratedWorkflow[]> {
    try {
      const response = await APIClient.get<{ workflows?: GeneratedWorkflow[] }>(this.endpoint);
      return response.workflows || [];
    } catch {
            return [];
    }
  }

  static async getWorkflowById(workflowId: string): Promise<GeneratedWorkflow | null> {
    try {
      const response = await APIClient.get<{ workflow?: GeneratedWorkflow }>(`${this.endpoint}/${workflowId}`);
      return response.workflow || null;
    } catch {
            return null;
    }
  }

  static async generateWorkflow(description: string): Promise<GeneratedWorkflow | null> {
    try {
      const response = await APIClient.post<{ workflow: GeneratedWorkflow }>(`${this.endpoint}/generate`, { description });
      return response.workflow;
    } catch {
            return null;
    }
  }

  static async updateWorkflow(workflowId: string, updates: Partial<GeneratedWorkflow>): Promise<GeneratedWorkflow | null> {
    try {
      const response = await APIClient.put<{ workflow: GeneratedWorkflow }>(`${this.endpoint}/${workflowId}`, updates);
      return response.workflow;
    } catch {
            return null;
    }
  }

  static async deployWorkflow(workflowId: string): Promise<GeneratedWorkflow | null> {
    try {
      const response = await APIClient.post<{ workflow: GeneratedWorkflow }>(`${this.endpoint}/${workflowId}/deploy`);
      return response.workflow;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// RESUME SCREENING SERVICE
// ============================================================================

export class ResumeScreeningService {
  private static endpoint = '/ai-automation/resume-screening';

  static async getAllScreenings(): Promise<ResumeScreening[]> {
    try {
      const response = await APIClient.get<{ screenings?: ResumeScreening[] }>(this.endpoint);
      return response.screenings || [];
    } catch {
            return [];
    }
  }

  static async screenResume(screeningData: Partial<ResumeScreening>): Promise<ResumeScreening | null> {
    try {
      const response = await APIClient.post<{ screening: ResumeScreening }>(this.endpoint, screeningData);
      return response.screening;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// ATTRITION PREDICTION SERVICE
// ============================================================================

export class AttritionPredictionService {
  private static endpoint = '/ai-automation/attrition';

  static async getAllPredictions(): Promise<AttritionPrediction[]> {
    try {
      const response = await APIClient.get<{ predictions?: AttritionPrediction[] }>(this.endpoint);
      return response.predictions || [];
    } catch {
            return [];
    }
  }

  static async predictAttrition(employeeId: string): Promise<AttritionPrediction | null> {
    try {
      const response = await APIClient.post<{ prediction: AttritionPrediction }>(`${this.endpoint}/predict`, { employeeId });
      return response.prediction;
    } catch {
            return null;
    }
  }

  static async getHighRiskEmployees(): Promise<AttritionPrediction[]> {
    try {
      const response = await APIClient.get<{ predictions?: AttritionPrediction[] }>(`${this.endpoint}/high-risk`);
      return response.predictions || [];
    } catch {
            return [];
    }
  }
}

// ============================================================================
// LEAVE FORECASTING SERVICE
// ============================================================================

export class LeaveForecastingService {
  private static endpoint = '/ai-automation/leave-forecasting';

  static async getAllForecasts(): Promise<LeaveForecast[]> {
    try {
      const response = await APIClient.get<{ forecasts?: LeaveForecast[] }>(this.endpoint);
      return response.forecasts || [];
    } catch {
            return [];
    }
  }

  static async generateForecast(startDate: Date, endDate: Date, department?: string): Promise<LeaveForecast | null> {
    try {
      const response = await APIClient.post<{ forecast: LeaveForecast }>(`${this.endpoint}/generate`, { startDate, endDate, department });
      return response.forecast;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// ANOMALY DETECTION SERVICE
// ============================================================================

export class AnomalyDetectionService {
  private static endpoint = '/ai-automation/anomalies';

  static async getAllAnomalies(): Promise<DetectedAnomaly[]> {
    try {
      const response = await APIClient.get<{ anomalies?: DetectedAnomaly[] }>(this.endpoint);
      return response.anomalies || [];
    } catch {
            return [];
    }
  }

  static async getActiveAnomalies(): Promise<DetectedAnomaly[]> {
    try {
      const response = await APIClient.get<{ anomalies?: DetectedAnomaly[] }>(`${this.endpoint}/active`);
      return response.anomalies || [];
    } catch {
            return [];
    }
  }

  static async updateAnomaly(anomalyId: string, updates: Partial<DetectedAnomaly>): Promise<DetectedAnomaly | null> {
    try {
      const response = await APIClient.put<{ anomaly: DetectedAnomaly }>(`${this.endpoint}/${anomalyId}`, updates);
      return response.anomaly;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// CHATBOT SERVICE
// ============================================================================

export class ChatbotService {
  private static endpoint = '/ai-automation/chatbot';

  static async getAllConversations(): Promise<ChatbotConversation[]> {
    try {
      const response = await APIClient.get<{ conversations?: ChatbotConversation[] }>(this.endpoint);
      return response.conversations || [];
    } catch {
            return [];
    }
  }

  static async startConversation(employeeId: string, employeeName: string): Promise<ChatbotConversation | null> {
    try {
      const response = await APIClient.post<{ conversation: ChatbotConversation }>(this.endpoint, { employeeId, employeeName });
      return response.conversation;
    } catch {
            return null;
    }
  }

  static async sendChatMessage(conversationId: string, message: string, sender: 'user' | 'bot'): Promise<ChatbotConversation | null> {
    try {
      const response = await APIClient.post<{ conversation: ChatbotConversation }>(`${this.endpoint}/${conversationId}/message`, { message, sender });
      return response.conversation;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// INTERVIEW SCHEDULING SERVICE
// ============================================================================

export class InterviewSchedulingService {
  private static endpoint = '/ai-automation/interview-scheduling';

  static async getAllSchedules(): Promise<InterviewSchedule[]> {
    try {
      const response = await APIClient.get<{ schedules?: InterviewSchedule[] }>(this.endpoint);
      return response.schedules || [];
    } catch {
            return [];
    }
  }

  static async createSchedule(scheduleData: Partial<InterviewSchedule>): Promise<InterviewSchedule | null> {
    try {
      const response = await APIClient.post<{ schedule: InterviewSchedule }>(this.endpoint, scheduleData);
      return response.schedule;
    } catch {
            return null;
    }
  }

  static async confirmSchedule(scheduleId: string, slotId: string): Promise<InterviewSchedule | null> {
    try {
      const response = await APIClient.put<{ schedule: InterviewSchedule }>(`${this.endpoint}/${scheduleId}/confirm`, { slotId });
      return response.schedule;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// ADDITIONAL SERVICES
// ============================================================================

export class PerformanceAnalysisService {
  private static endpoint = '/ai-automation/performance-analysis';

  static async analyzePerformance(employeeId: string): Promise<PerformanceAnalysis | null> {
    try {
      const response = await APIClient.post<{ analysis: PerformanceAnalysis }>(`${this.endpoint}/analyze`, { employeeId });
      return response.analysis;
    } catch {
            return null;
    }
  }
}

export class LDRecommendationService {
  private static endpoint = '/ai-automation/ld-recommendations';

  static async getRecommendations(employeeId: string): Promise<LDRecommendation | null> {
    try {
      const response = await APIClient.get<{ recommendation: LDRecommendation }>(`${this.endpoint}/${employeeId}`);
      return response.recommendation;
    } catch {
            return null;
    }
  }
}

export class JobMatchingService {
  private static endpoint = '/ai-automation/job-matching';

  static async findMatches(employeeId: string): Promise<JobMatch[]> {
    try {
      const response = await APIClient.get<{ matches?: JobMatch[] }>(`${this.endpoint}/${employeeId}`);
      return response.matches || [];
    } catch {
            return [];
    }
  }
}

export class EmailParsingService {
  private static endpoint = '/ai-automation/email-parsing';

  static async parseEmail(emailId: string): Promise<EmailParsing | null> {
    try {
      const response = await APIClient.post<{ parsing: EmailParsing }>(`${this.endpoint}/parse`, { emailId });
      return response.parsing;
    } catch {
            return null;
    }
  }
}

export class AutoAccrualService {
  private static endpoint = '/ai-automation/auto-accruals';

  static async calculateAccruals(): Promise<AutoAccrual[]> {
    try {
      const response = await APIClient.post<{ accruals?: AutoAccrual[] }>(`${this.endpoint}/calculate`);
      return response.accruals || [];
    } catch {
            return [];
    }
  }
}

export class NLPInsightsService {
  private static endpoint = '/ai-automation/nlp-insights';

  static async extractInsights(text: string, sourceType: string): Promise<NLPInsight | null> {
    try {
      const response = await APIClient.post<{ insight: NLPInsight }>(`${this.endpoint}/extract`, { text, sourceType });
      return response.insight;
    } catch {
            return null;
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AIAutomationSettingsService {
  private static endpoint = '/ai-automation/settings';

  static async getSettings(): Promise<AIAutomationSettings | null> {
    try {
      const response = await APIClient.get<{ settings: AIAutomationSettings }>(this.endpoint);
      return response.settings;
    } catch {
            return null;
    }
  }

  static async updateSettings(updates: Partial<AIAutomationSettings>): Promise<AIAutomationSettings | null> {
    try {
      const response = await APIClient.put<{ settings: AIAutomationSettings }>(this.endpoint, updates);
      return response.settings;
    } catch {
            return null;
    }
  }
}
