/**
 * DEI (Diversity, Equity & Inclusion) Module Services
 * Handles all business logic for DEI operations
 */

import { APIClient } from '@/lib/api-client';
import type {
  DiversityMetric, DiversityDashboard, DiversityReport, InclusionSurvey, SurveyResponse,
  SurveyAnalytics, PayEquityAnalysis, PayAdjustment, BiasTraining, TrainingEnrollment,
  TrainingAnalytics, EmployeeResourceGroup, MentorshipProgram, MentorProfile, MenteeProfile,
  MentorshipPair, AccessibilityRequest, AccessibilityAssessment, AccessibilityResource,
  DEIGoal, DEIInitiative, DEISettings
} from './types';

// ============================================================================
// 1. DIVERSITY METRICS SERVICE
// ============================================================================

export class DiversityMetricsService {
  private static endpoint = '/dei/metrics';

  static async getAllMetrics(): Promise<DiversityMetric[]> {
    try {
      return await APIClient.get<DiversityMetric[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getMetricById(metricId: string): Promise<DiversityMetric | null> {
    try {
      return await APIClient.get<DiversityMetric>(`${this.endpoint}/${metricId}`);
    } catch {
            throw error;
    }
  }

  static async createMetric(metricData: Partial<DiversityMetric>): Promise<DiversityMetric> {
    try {
      return await APIClient.post<DiversityMetric>(this.endpoint, metricData);
    } catch {
            throw error;
    }
  }

  static async updateMetric(metricId: string, updates: Partial<DiversityMetric>): Promise<DiversityMetric> {
    try {
      return await APIClient.put<DiversityMetric>(`${this.endpoint}/${metricId}`, updates);
    } catch {
            throw error;
    }
  }

  static async calculateMetric(metricId: string): Promise<DiversityMetric> {
    try {
      return await APIClient.post<DiversityMetric>(`${this.endpoint}/${metricId}/calculate`);
    } catch {
            throw error;
    }
  }

  static async getDashboards(): Promise<DiversityDashboard[]> {
    try {
      return await APIClient.get<DiversityDashboard[]>(`${this.endpoint}/dashboards`);
    } catch {
            throw error;
    }
  }

  static async generateReport(reportData: Partial<DiversityReport>): Promise<DiversityReport> {
    try {
      return await APIClient.post<DiversityReport>(`${this.endpoint}/reports`, reportData);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// 2. INCLUSION SURVEY SERVICE
// ============================================================================

export class InclusionSurveyService {
  private static endpoint = '/dei/surveys';

  static async getAllSurveys(): Promise<InclusionSurvey[]> {
    try {
      return await APIClient.get<InclusionSurvey[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getSurveyById(surveyId: string): Promise<InclusionSurvey | null> {
    try {
      return await APIClient.get<InclusionSurvey>(`${this.endpoint}/${surveyId}`);
    } catch {
            throw error;
    }
  }

  static async createSurvey(surveyData: Partial<InclusionSurvey>): Promise<InclusionSurvey> {
    try {
      return await APIClient.post<InclusionSurvey>(this.endpoint, surveyData);
    } catch {
            throw error;
    }
  }

  static async updateSurvey(surveyId: string, updates: Partial<InclusionSurvey>): Promise<InclusionSurvey> {
    try {
      return await APIClient.put<InclusionSurvey>(`${this.endpoint}/${surveyId}`, updates);
    } catch {
            throw error;
    }
  }

  static async launchSurvey(surveyId: string): Promise<InclusionSurvey> {
    try {
      return await APIClient.post<InclusionSurvey>(`${this.endpoint}/${surveyId}/launch`);
    } catch {
            throw error;
    }
  }

  static async submitResponse(responseData: Partial<SurveyResponse>): Promise<SurveyResponse> {
    try {
      return await APIClient.post<SurveyResponse>(`${this.endpoint}/responses`, responseData);
    } catch {
            throw error;
    }
  }

  static async getAnalytics(surveyId: string): Promise<SurveyAnalytics | null> {
    try {
      return await APIClient.get<SurveyAnalytics>(`${this.endpoint}/${surveyId}/analytics`);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// 3. PAY EQUITY ANALYSIS SERVICE
// ============================================================================

export class PayEquityService {
  private static endpoint = '/dei/pay-equity';

  static async getAllAnalyses(): Promise<PayEquityAnalysis[]> {
    try {
      return await APIClient.get<PayEquityAnalysis[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getAnalysisById(analysisId: string): Promise<PayEquityAnalysis | null> {
    try {
      return await APIClient.get<PayEquityAnalysis>(`${this.endpoint}/${analysisId}`);
    } catch {
            throw error;
    }
  }

  static async createAnalysis(analysisData: Partial<PayEquityAnalysis>): Promise<PayEquityAnalysis> {
    try {
      return await APIClient.post<PayEquityAnalysis>(this.endpoint, analysisData);
    } catch {
            throw error;
    }
  }

  static async runAnalysis(analysisId: string): Promise<PayEquityAnalysis> {
    try {
      return await APIClient.post<PayEquityAnalysis>(`${this.endpoint}/${analysisId}/run`);
    } catch {
            throw error;
    }
  }

  static async getAllAdjustments(): Promise<PayAdjustment[]> {
    try {
      return await APIClient.get<PayAdjustment[]>(`${this.endpoint}/adjustments`);
    } catch {
            throw error;
    }
  }

  static async createAdjustment(adjustmentData: Partial<PayAdjustment>): Promise<PayAdjustment> {
    try {
      return await APIClient.post<PayAdjustment>(`${this.endpoint}/adjustments`, adjustmentData);
    } catch {
            throw error;
    }
  }

  static async approveAdjustment(adjustmentId: string, approvedBy: string): Promise<PayAdjustment> {
    try {
      return await APIClient.post<PayAdjustment>(`${this.endpoint}/adjustments/${adjustmentId}/approve`, { approvedBy });
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// 4. BIAS TRAINING SERVICE
// ============================================================================

export class BiasTrainingService {
  private static endpoint = '/dei/training';

  static async getAllTrainings(): Promise<BiasTraining[]> {
    try {
      return await APIClient.get<BiasTraining[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getTrainingById(trainingId: string): Promise<BiasTraining | null> {
    try {
      return await APIClient.get<BiasTraining>(`${this.endpoint}/${trainingId}`);
    } catch {
            throw error;
    }
  }

  static async createTraining(trainingData: Partial<BiasTraining>): Promise<BiasTraining> {
    try {
      return await APIClient.post<BiasTraining>(this.endpoint, trainingData);
    } catch {
            throw error;
    }
  }

  static async updateTraining(trainingId: string, updates: Partial<BiasTraining>): Promise<BiasTraining> {
    try {
      return await APIClient.put<BiasTraining>(`${this.endpoint}/${trainingId}`, updates);
    } catch {
            throw error;
    }
  }

  static async enrollEmployee(enrollmentData: Partial<TrainingEnrollment>): Promise<TrainingEnrollment> {
    try {
      return await APIClient.post<TrainingEnrollment>(`${this.endpoint}/enrollments`, enrollmentData);
    } catch {
            throw error;
    }
  }

  static async updateEnrollment(enrollmentId: string, updates: Partial<TrainingEnrollment>): Promise<TrainingEnrollment> {
    try {
      return await APIClient.put<TrainingEnrollment>(`${this.endpoint}/enrollments/${enrollmentId}`, updates);
    } catch {
            throw error;
    }
  }

  static async getTrainingAnalytics(trainingId: string): Promise<TrainingAnalytics | null> {
    try {
      return await APIClient.get<TrainingAnalytics>(`${this.endpoint}/${trainingId}/analytics`);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// 5. ERG MANAGEMENT SERVICE
// ============================================================================

export class ERGService {
  private static endpoint = '/dei/ergs';

  static async getAllERGs(): Promise<EmployeeResourceGroup[]> {
    try {
      return await APIClient.get<EmployeeResourceGroup[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getERGById(ergId: string): Promise<EmployeeResourceGroup | null> {
    try {
      return await APIClient.get<EmployeeResourceGroup>(`${this.endpoint}/${ergId}`);
    } catch {
            throw error;
    }
  }

  static async createERG(ergData: Partial<EmployeeResourceGroup>): Promise<EmployeeResourceGroup> {
    try {
      return await APIClient.post<EmployeeResourceGroup>(this.endpoint, ergData);
    } catch {
            throw error;
    }
  }

  static async updateERG(ergId: string, updates: Partial<EmployeeResourceGroup>): Promise<EmployeeResourceGroup> {
    try {
      return await APIClient.put<EmployeeResourceGroup>(`${this.endpoint}/${ergId}`, updates);
    } catch {
            throw error;
    }
  }

  static async addMember(ergId: string, employeeId: string, employeeName: string, role: string): Promise<EmployeeResourceGroup> {
    try {
      return await APIClient.post<EmployeeResourceGroup>(`${this.endpoint}/${ergId}/members`, { employeeId, employeeName, role });
    } catch {
            throw error;
    }
  }

  static async recordMeeting(ergId: string, meetingData: any): Promise<EmployeeResourceGroup> {
    try {
      return await APIClient.post<EmployeeResourceGroup>(`${this.endpoint}/${ergId}/meetings`, meetingData);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// 6. MENTORSHIP PROGRAM SERVICE
// ============================================================================

export class MentorshipService {
  private static endpoint = '/dei/mentorship';

  static async getAllPrograms(): Promise<MentorshipProgram[]> {
    try {
      return await APIClient.get<MentorshipProgram[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getProgramById(programId: string): Promise<MentorshipProgram | null> {
    try {
      return await APIClient.get<MentorshipProgram>(`${this.endpoint}/${programId}`);
    } catch {
            throw error;
    }
  }

  static async createProgram(programData: Partial<MentorshipProgram>): Promise<MentorshipProgram> {
    try {
      return await APIClient.post<MentorshipProgram>(this.endpoint, programData);
    } catch {
            throw error;
    }
  }

  static async updateProgram(programId: string, updates: Partial<MentorshipProgram>): Promise<MentorshipProgram> {
    try {
      return await APIClient.put<MentorshipProgram>(`${this.endpoint}/${programId}`, updates);
    } catch {
            throw error;
    }
  }

  static async getAllMentors(): Promise<MentorProfile[]> {
    try {
      return await APIClient.get<MentorProfile[]>(`${this.endpoint}/mentors`);
    } catch {
            throw error;
    }
  }

  static async createMentorProfile(profileData: Partial<MentorProfile>): Promise<MentorProfile> {
    try {
      return await APIClient.post<MentorProfile>(`${this.endpoint}/mentors`, profileData);
    } catch {
            throw error;
    }
  }

  static async getAllMentees(): Promise<MenteeProfile[]> {
    try {
      return await APIClient.get<MenteeProfile[]>(`${this.endpoint}/mentees`);
    } catch {
            throw error;
    }
  }

  static async createMenteeProfile(profileData: Partial<MenteeProfile>): Promise<MenteeProfile> {
    try {
      return await APIClient.post<MenteeProfile>(`${this.endpoint}/mentees`, profileData);
    } catch {
            throw error;
    }
  }

  static async createPair(pairData: Partial<MentorshipPair>): Promise<MentorshipPair> {
    try {
      return await APIClient.post<MentorshipPair>(`${this.endpoint}/pairs`, pairData);
    } catch {
            throw error;
    }
  }

  static async updatePair(pairId: string, updates: Partial<MentorshipPair>): Promise<MentorshipPair> {
    try {
      return await APIClient.put<MentorshipPair>(`${this.endpoint}/pairs/${pairId}`, updates);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// 7. ACCESSIBILITY SERVICE
// ============================================================================

export class AccessibilityService {
  private static endpoint = '/dei/accessibility';

  static async getAllRequests(): Promise<AccessibilityRequest[]> {
    try {
      return await APIClient.get<AccessibilityRequest[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getRequestById(requestId: string): Promise<AccessibilityRequest | null> {
    try {
      return await APIClient.get<AccessibilityRequest>(`${this.endpoint}/${requestId}`);
    } catch {
            throw error;
    }
  }

  static async createRequest(requestData: Partial<AccessibilityRequest>): Promise<AccessibilityRequest> {
    try {
      return await APIClient.post<AccessibilityRequest>(this.endpoint, requestData);
    } catch {
            throw error;
    }
  }

  static async updateRequest(requestId: string, updates: Partial<AccessibilityRequest>): Promise<AccessibilityRequest> {
    try {
      return await APIClient.put<AccessibilityRequest>(`${this.endpoint}/${requestId}`, updates);
    } catch {
            throw error;
    }
  }

  static async approveRequest(requestId: string, approvedBy: string): Promise<AccessibilityRequest> {
    try {
      return await APIClient.post<AccessibilityRequest>(`${this.endpoint}/${requestId}/approve`, { approvedBy });
    } catch {
            throw error;
    }
  }

  static async getAllAssessments(): Promise<AccessibilityAssessment[]> {
    try {
      return await APIClient.get<AccessibilityAssessment[]>(`${this.endpoint}/assessments`);
    } catch {
            throw error;
    }
  }

  static async createAssessment(assessmentData: Partial<AccessibilityAssessment>): Promise<AccessibilityAssessment> {
    try {
      return await APIClient.post<AccessibilityAssessment>(`${this.endpoint}/assessments`, assessmentData);
    } catch {
            throw error;
    }
  }

  static async getAllResources(): Promise<AccessibilityResource[]> {
    try {
      return await APIClient.get<AccessibilityResource[]>(`${this.endpoint}/resources`);
    } catch {
            throw error;
    }
  }

  static async createResource(resourceData: Partial<AccessibilityResource>): Promise<AccessibilityResource> {
    try {
      return await APIClient.post<AccessibilityResource>(`${this.endpoint}/resources`, resourceData);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// 8. DEI GOALS SERVICE
// ============================================================================

export class DEIGoalsService {
  private static endpoint = '/dei/goals';

  static async getAllGoals(): Promise<DEIGoal[]> {
    try {
      return await APIClient.get<DEIGoal[]>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async getGoalById(goalId: string): Promise<DEIGoal | null> {
    try {
      return await APIClient.get<DEIGoal>(`${this.endpoint}/${goalId}`);
    } catch {
            throw error;
    }
  }

  static async createGoal(goalData: Partial<DEIGoal>): Promise<DEIGoal> {
    try {
      return await APIClient.post<DEIGoal>(this.endpoint, goalData);
    } catch {
            throw error;
    }
  }

  static async updateGoal(goalId: string, updates: Partial<DEIGoal>): Promise<DEIGoal> {
    try {
      return await APIClient.put<DEIGoal>(`${this.endpoint}/${goalId}`, updates);
    } catch {
            throw error;
    }
  }

  static async addUpdate(goalId: string, updateData: any): Promise<DEIGoal> {
    try {
      return await APIClient.post<DEIGoal>(`${this.endpoint}/${goalId}/updates`, updateData);
    } catch {
            throw error;
    }
  }

  static async getAllInitiatives(): Promise<DEIInitiative[]> {
    try {
      return await APIClient.get<DEIInitiative[]>(`${this.endpoint}/initiatives`);
    } catch {
            throw error;
    }
  }

  static async createInitiative(initiativeData: Partial<DEIInitiative>): Promise<DEIInitiative> {
    try {
      return await APIClient.post<DEIInitiative>(`${this.endpoint}/initiatives`, initiativeData);
    } catch {
            throw error;
    }
  }

  static async updateInitiative(initiativeId: string, updates: Partial<DEIInitiative>): Promise<DEIInitiative> {
    try {
      return await APIClient.put<DEIInitiative>(`${this.endpoint}/initiatives/${initiativeId}`, updates);
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class DEISettingsService {
  private static endpoint = '/dei/settings';

  static async getSettings(): Promise<DEISettings> {
    try {
      return await APIClient.get<DEISettings>(this.endpoint);
    } catch {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<DEISettings>): Promise<DEISettings> {
    try {
      return await APIClient.put<DEISettings>(this.endpoint, updates);
    } catch {
            throw error;
    }
  }
}
