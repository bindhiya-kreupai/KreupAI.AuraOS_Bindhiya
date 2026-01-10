/**
 * Career Planning Module - Service Layer
 *
 * API-integrated service layer using APIClient.
 */

import { APIClient } from '@/lib/api-client';
import type {
  CareerLadder, EmployeeCareerPath, MobilityOpportunity, MobilityApplication, MobilityPreference,
  SuccessionPlan, CareerGoal, DevelopmentDiscussion, CareerAspiration, MentorshipRequest,
  SkillAssessment, LearningPathway, CareerSettings
} from './types';

// ============================================================================
// CAREER LADDERS SERVICES
// ============================================================================

export class CareerLadderService {
  static async getAllLadders(filters?: { department?: string; isActive?: boolean }): Promise<CareerLadder[]> {
    try {
      return await APIClient.get<CareerLadder[]>('/career/ladders', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getLadderById(ladderId: string): Promise<CareerLadder | null> {
    try {
      return await APIClient.get<CareerLadder>(`/career/ladders/${ladderId}`);
    } catch (error) {
            throw error;
    }
  }

  static async getLaddersByDepartment(department: string): Promise<CareerLadder[]> {
    try {
      return await APIClient.get<CareerLadder[]>('/career/ladders', { department });
    } catch (error) {
            throw error;
    }
  }

  static async createLadder(ladderData: Partial<CareerLadder>): Promise<CareerLadder> {
    try {
      return await APIClient.post<CareerLadder>('/career/ladders', ladderData);
    } catch (error) {
            throw error;
    }
  }

  static async updateLadder(ladderId: string, updates: Partial<CareerLadder>): Promise<CareerLadder> {
    try {
      return await APIClient.put<CareerLadder>(`/career/ladders/${ladderId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteLadder(ladderId: string): Promise<void> {
    try {
      return await APIClient.delete(`/career/ladders/${ladderId}`);
    } catch (error) {
            throw error;
    }
  }
}

export class EmployeeCareerPathService {
  static async getAllPaths(filters?: { employeeId?: string; ladderId?: string }): Promise<EmployeeCareerPath[]> {
    try {
      return await APIClient.get<EmployeeCareerPath[]>('/career/paths', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getPathByEmployeeId(employeeId: string): Promise<EmployeeCareerPath | null> {
    try {
      return await APIClient.get<EmployeeCareerPath>(`/career/paths/employee/${employeeId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createPath(pathData: Partial<EmployeeCareerPath>): Promise<EmployeeCareerPath> {
    try {
      return await APIClient.post<EmployeeCareerPath>('/career/paths', pathData);
    } catch (error) {
            throw error;
    }
  }

  static async updatePath(pathId: string, updates: Partial<EmployeeCareerPath>): Promise<EmployeeCareerPath> {
    try {
      return await APIClient.put<EmployeeCareerPath>(`/career/paths/${pathId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// INTERNAL MOBILITY SERVICES
// ============================================================================

export class MobilityOpportunityService {
  static async getAllOpportunities(filters?: { status?: string; department?: string; location?: string }): Promise<MobilityOpportunity[]> {
    try {
      return await APIClient.get<MobilityOpportunity[]>('/career/mobility-opportunities', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getOpportunityById(opportunityId: string): Promise<MobilityOpportunity | null> {
    try {
      return await APIClient.get<MobilityOpportunity>(`/career/mobility-opportunities/${opportunityId}`);
    } catch (error) {
            throw error;
    }
  }

  static async getOpenOpportunities(): Promise<MobilityOpportunity[]> {
    try {
      return await APIClient.get<MobilityOpportunity[]>('/career/mobility-opportunities', { status: 'open' });
    } catch (error) {
            throw error;
    }
  }

  static async createOpportunity(opportunityData: Partial<MobilityOpportunity>): Promise<MobilityOpportunity> {
    try {
      return await APIClient.post<MobilityOpportunity>('/career/mobility-opportunities', opportunityData);
    } catch (error) {
            throw error;
    }
  }

  static async updateOpportunity(opportunityId: string, updates: Partial<MobilityOpportunity>): Promise<MobilityOpportunity> {
    try {
      return await APIClient.put<MobilityOpportunity>(`/career/mobility-opportunities/${opportunityId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

export class MobilityApplicationService {
  static async getAllApplications(filters?: { employeeId?: string; opportunityId?: string; status?: string }): Promise<MobilityApplication[]> {
    try {
      return await APIClient.get<MobilityApplication[]>('/career/mobility-applications', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getApplicationsByEmployeeId(employeeId: string): Promise<MobilityApplication[]> {
    try {
      return await APIClient.get<MobilityApplication[]>('/career/mobility-applications', { employeeId });
    } catch (error) {
            throw error;
    }
  }

  static async getApplicationsByOpportunityId(opportunityId: string): Promise<MobilityApplication[]> {
    try {
      return await APIClient.get<MobilityApplication[]>('/career/mobility-applications', { opportunityId });
    } catch (error) {
            throw error;
    }
  }

  static async createApplication(applicationData: Partial<MobilityApplication>): Promise<MobilityApplication> {
    try {
      return await APIClient.post<MobilityApplication>('/career/mobility-applications', applicationData);
    } catch (error) {
            throw error;
    }
  }

  static async updateApplication(applicationId: string, updates: Partial<MobilityApplication>): Promise<MobilityApplication> {
    try {
      return await APIClient.put<MobilityApplication>(`/career/mobility-applications/${applicationId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

export class MobilityPreferenceService {
  static async getAllPreferences(filters?: { employeeId?: string; mobilityReadiness?: string }): Promise<MobilityPreference[]> {
    try {
      return await APIClient.get<MobilityPreference[]>('/career/mobility-preferences', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getPreferenceByEmployeeId(employeeId: string): Promise<MobilityPreference | null> {
    try {
      return await APIClient.get<MobilityPreference>(`/career/mobility-preferences/employee/${employeeId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createPreference(preferenceData: Partial<MobilityPreference>): Promise<MobilityPreference> {
    try {
      return await APIClient.post<MobilityPreference>('/career/mobility-preferences', preferenceData);
    } catch (error) {
            throw error;
    }
  }

  static async updatePreference(preferenceId: string, updates: Partial<MobilityPreference>): Promise<MobilityPreference> {
    try {
      return await APIClient.put<MobilityPreference>(`/career/mobility-preferences/${preferenceId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

export class SuccessionPlanService {
  static async getAllPlans(filters?: { department?: string; status?: string; retirementRisk?: string }): Promise<SuccessionPlan[]> {
    try {
      return await APIClient.get<SuccessionPlan[]>('/career/succession-plans', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getPlanById(planId: string): Promise<SuccessionPlan | null> {
    try {
      return await APIClient.get<SuccessionPlan>(`/career/succession-plans/${planId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createPlan(planData: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
    try {
      return await APIClient.post<SuccessionPlan>('/career/succession-plans', planData);
    } catch (error) {
            throw error;
    }
  }

  static async updatePlan(planId: string, updates: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
    try {
      return await APIClient.put<SuccessionPlan>(`/career/succession-plans/${planId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// CAREER GOALS SERVICES
// ============================================================================

export class CareerGoalService {
  static async getAllGoals(filters?: { employeeId?: string; status?: string; priority?: string }): Promise<CareerGoal[]> {
    try {
      return await APIClient.get<CareerGoal[]>('/career/goals', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getGoalsByEmployeeId(employeeId: string): Promise<CareerGoal[]> {
    try {
      return await APIClient.get<CareerGoal[]>('/career/goals', { employeeId });
    } catch (error) {
            throw error;
    }
  }

  static async getGoalById(goalId: string): Promise<CareerGoal | null> {
    try {
      return await APIClient.get<CareerGoal>(`/career/goals/${goalId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createGoal(goalData: Partial<CareerGoal>): Promise<CareerGoal> {
    try {
      return await APIClient.post<CareerGoal>('/career/goals', goalData);
    } catch (error) {
            throw error;
    }
  }

  static async updateGoal(goalId: string, updates: Partial<CareerGoal>): Promise<CareerGoal> {
    try {
      return await APIClient.put<CareerGoal>(`/career/goals/${goalId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteGoal(goalId: string): Promise<void> {
    try {
      return await APIClient.delete(`/career/goals/${goalId}`);
    } catch (error) {
            throw error;
    }
  }
}

export class DevelopmentDiscussionService {
  static async getAllDiscussions(filters?: { employeeId?: string; managerId?: string; discussionType?: string }): Promise<DevelopmentDiscussion[]> {
    try {
      return await APIClient.get<DevelopmentDiscussion[]>('/career/development-discussions', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getDiscussionsByEmployeeId(employeeId: string): Promise<DevelopmentDiscussion[]> {
    try {
      return await APIClient.get<DevelopmentDiscussion[]>('/career/development-discussions', { employeeId });
    } catch (error) {
            throw error;
    }
  }

  static async createDiscussion(discussionData: Partial<DevelopmentDiscussion>): Promise<DevelopmentDiscussion> {
    try {
      return await APIClient.post<DevelopmentDiscussion>('/career/development-discussions', discussionData);
    } catch (error) {
            throw error;
    }
  }

  static async updateDiscussion(discussionId: string, updates: Partial<DevelopmentDiscussion>): Promise<DevelopmentDiscussion> {
    try {
      return await APIClient.put<DevelopmentDiscussion>(`/career/development-discussions/${discussionId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// ASPIRATIONS SERVICES
// ============================================================================

export class CareerAspirationService {
  static async getAllAspirations(filters?: { employeeId?: string; status?: string; aspirationType?: string }): Promise<CareerAspiration[]> {
    try {
      return await APIClient.get<CareerAspiration[]>('/career/aspirations', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getAspirationsByEmployeeId(employeeId: string): Promise<CareerAspiration[]> {
    try {
      return await APIClient.get<CareerAspiration[]>('/career/aspirations', { employeeId });
    } catch (error) {
            throw error;
    }
  }

  static async createAspiration(aspirationData: Partial<CareerAspiration>): Promise<CareerAspiration> {
    try {
      return await APIClient.post<CareerAspiration>('/career/aspirations', aspirationData);
    } catch (error) {
            throw error;
    }
  }

  static async updateAspiration(aspirationId: string, updates: Partial<CareerAspiration>): Promise<CareerAspiration> {
    try {
      return await APIClient.put<CareerAspiration>(`/career/aspirations/${aspirationId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteAspiration(aspirationId: string): Promise<void> {
    try {
      return await APIClient.delete(`/career/aspirations/${aspirationId}`);
    } catch (error) {
            throw error;
    }
  }
}

export class MentorshipRequestService {
  static async getAllRequests(filters?: { menteeId?: string; status?: string }): Promise<MentorshipRequest[]> {
    try {
      return await APIClient.get<MentorshipRequest[]>('/career/mentorship-requests', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getRequestsByMenteeId(menteeId: string): Promise<MentorshipRequest[]> {
    try {
      return await APIClient.get<MentorshipRequest[]>('/career/mentorship-requests', { menteeId });
    } catch (error) {
            throw error;
    }
  }

  static async createRequest(requestData: Partial<MentorshipRequest>): Promise<MentorshipRequest> {
    try {
      return await APIClient.post<MentorshipRequest>('/career/mentorship-requests', requestData);
    } catch (error) {
            throw error;
    }
  }

  static async updateRequest(requestId: string, updates: Partial<MentorshipRequest>): Promise<MentorshipRequest> {
    try {
      return await APIClient.put<MentorshipRequest>(`/career/mentorship-requests/${requestId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

export class SkillAssessmentService {
  static async getAllAssessments(filters?: { employeeId?: string; assessmentType?: string }): Promise<SkillAssessment[]> {
    try {
      return await APIClient.get<SkillAssessment[]>('/career/skill-assessments', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getAssessmentsByEmployeeId(employeeId: string): Promise<SkillAssessment[]> {
    try {
      return await APIClient.get<SkillAssessment[]>('/career/skill-assessments', { employeeId });
    } catch (error) {
            throw error;
    }
  }

  static async createAssessment(assessmentData: Partial<SkillAssessment>): Promise<SkillAssessment> {
    try {
      return await APIClient.post<SkillAssessment>('/career/skill-assessments', assessmentData);
    } catch (error) {
            throw error;
    }
  }
}

export class LearningPathwayService {
  static async getAllPathways(filters?: { status?: string; difficulty?: string; isRecommended?: boolean }): Promise<LearningPathway[]> {
    try {
      return await APIClient.get<LearningPathway[]>('/career/learning-pathways', filters);
    } catch (error) {
            throw error;
    }
  }

  static async getPathwayById(pathwayId: string): Promise<LearningPathway | null> {
    try {
      return await APIClient.get<LearningPathway>(`/career/learning-pathways/${pathwayId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createPathway(pathwayData: Partial<LearningPathway>): Promise<LearningPathway> {
    try {
      return await APIClient.post<LearningPathway>('/career/learning-pathways', pathwayData);
    } catch (error) {
            throw error;
    }
  }

  static async updatePathway(pathwayId: string, updates: Partial<LearningPathway>): Promise<LearningPathway> {
    try {
      return await APIClient.put<LearningPathway>(`/career/learning-pathways/${pathwayId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class CareerSettingsService {
  static async getSettings(): Promise<CareerSettings> {
    try {
      return await APIClient.get<CareerSettings>('/career/settings');
    } catch (error) {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<CareerSettings>): Promise<CareerSettings> {
    try {
      return await APIClient.put<CareerSettings>('/career/settings', updates);
    } catch (error) {
            throw error;
    }
  }
}
