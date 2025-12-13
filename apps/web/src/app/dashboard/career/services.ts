// Career Planning Module - Service Layer

import {
  CareerLadder, EmployeeCareerPath, MobilityOpportunity, MobilityApplication, MobilityPreference,
  SuccessionPlan, CareerGoal, DevelopmentDiscussion, CareerAspiration, MentorshipRequest,
  SkillAssessment, LearningPathway, CareerSettings
} from './types';

const STORAGE_KEYS = {
  CAREER_LADDERS: 'career_ladders',
  EMPLOYEE_PATHS: 'career_employee_paths',
  MOBILITY_OPPORTUNITIES: 'career_mobility_opportunities',
  MOBILITY_APPLICATIONS: 'career_mobility_applications',
  MOBILITY_PREFERENCES: 'career_mobility_preferences',
  SUCCESSION_PLANS: 'career_succession_plans',
  CAREER_GOALS: 'career_goals',
  DEVELOPMENT_DISCUSSIONS: 'career_development_discussions',
  ASPIRATIONS: 'career_aspirations',
  MENTORSHIP_REQUESTS: 'career_mentorship_requests',
  SKILL_ASSESSMENTS: 'career_skill_assessments',
  LEARNING_PATHWAYS: 'career_learning_pathways',
  SETTINGS: 'career_settings',
};

// ============================================================================
// CAREER LADDERS SERVICES
// ============================================================================

export class CareerLadderService {
  static async getAllLadders(): Promise<CareerLadder[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CAREER_LADDERS);
    return data ? JSON.parse(data) : [];
  }

  static async getLadderById(ladderId: string): Promise<CareerLadder | null> {
    const ladders = await this.getAllLadders();
    return ladders.find(l => l.ladderId === ladderId) || null;
  }

  static async getLaddersByDepartment(department: string): Promise<CareerLadder[]> {
    const ladders = await this.getAllLadders();
    return ladders.filter(l => l.department === department);
  }

  static async createLadder(ladderData: Partial<CareerLadder>): Promise<CareerLadder> {
    const ladders = await this.getAllLadders();
    const newLadder: CareerLadder = {
      ladderId: `ladder-${Date.now()}`,
      ladderName: ladderData.ladderName || 'New Career Ladder',
      department: ladderData.department || '',
      description: ladderData.description || '',
      jobFamily: ladderData.jobFamily || '',
      levels: ladderData.levels || [],
      isActive: true,
      createdBy: 'current-user',
      createdDate: new Date(),
      updatedDate: new Date(),
      ...ladderData,
    };

    ladders.push(newLadder);
    localStorage.setItem(STORAGE_KEYS.CAREER_LADDERS, JSON.stringify(ladders));
    return newLadder;
  }

  static async updateLadder(ladderId: string, updates: Partial<CareerLadder>): Promise<CareerLadder> {
    const ladders = await this.getAllLadders();
    const index = ladders.findIndex(l => l.ladderId === ladderId);
    if (index === -1) throw new Error('Career ladder not found');

    ladders[index] = { ...ladders[index], ...updates, updatedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.CAREER_LADDERS, JSON.stringify(ladders));
    return ladders[index];
  }

  // TODO: Replace with actual API call
  static async deleteLadder(ladderId: string): Promise<void> {
    const ladders = await this.getAllLadders();
    const filtered = ladders.filter(l => l.ladderId !== ladderId);
    localStorage.setItem(STORAGE_KEYS.CAREER_LADDERS, JSON.stringify(filtered));
  }
}

export class EmployeeCareerPathService {
  static async getAllPaths(): Promise<EmployeeCareerPath[]> {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_PATHS);
    return data ? JSON.parse(data) : [];
  }

  static async getPathByEmployeeId(employeeId: string): Promise<EmployeeCareerPath | null> {
    const paths = await this.getAllPaths();
    return paths.find(p => p.employeeId === employeeId) || null;
  }

  static async createPath(pathData: Partial<EmployeeCareerPath>): Promise<EmployeeCareerPath> {
    const paths = await this.getAllPaths();
    const newPath: EmployeeCareerPath = {
      pathId: `path-${Date.now()}`,
      employeeId: pathData.employeeId || '',
      employeeName: pathData.employeeName || '',
      currentLevel: pathData.currentLevel as any,
      ladderId: pathData.ladderId || '',
      ladderName: pathData.ladderName || '',
      progression: pathData.progression || [],
      currentGaps: pathData.currentGaps || [],
      ...pathData,
    };

    paths.push(newPath);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_PATHS, JSON.stringify(paths));
    return newPath;
  }

  static async updatePath(pathId: string, updates: Partial<EmployeeCareerPath>): Promise<EmployeeCareerPath> {
    const paths = await this.getAllPaths();
    const index = paths.findIndex(p => p.pathId === pathId);
    if (index === -1) throw new Error('Career path not found');

    paths[index] = { ...paths[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_PATHS, JSON.stringify(paths));
    return paths[index];
  }
}

// ============================================================================
// INTERNAL MOBILITY SERVICES
// ============================================================================

export class MobilityOpportunityService {
  static async getAllOpportunities(): Promise<MobilityOpportunity[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MOBILITY_OPPORTUNITIES);
    return data ? JSON.parse(data) : [];
  }

  static async getOpportunityById(opportunityId: string): Promise<MobilityOpportunity | null> {
    const opportunities = await this.getAllOpportunities();
    return opportunities.find(o => o.opportunityId === opportunityId) || null;
  }

  static async getOpenOpportunities(): Promise<MobilityOpportunity[]> {
    const opportunities = await this.getAllOpportunities();
    return opportunities.filter(o => o.status === 'open');
  }

  static async createOpportunity(opportunityData: Partial<MobilityOpportunity>): Promise<MobilityOpportunity> {
    const opportunities = await this.getAllOpportunities();
    const newOpportunity: MobilityOpportunity = {
      opportunityId: `opp-${Date.now()}`,
      opportunityType: opportunityData.opportunityType || 'vertical',
      positionId: opportunityData.positionId || '',
      jobTitle: opportunityData.jobTitle || '',
      department: opportunityData.department || '',
      location: opportunityData.location || '',
      hiringManager: opportunityData.hiringManager || '',
      description: opportunityData.description || '',
      responsibilities: opportunityData.responsibilities || [],
      qualifications: opportunityData.qualifications || [],
      preferredSkills: opportunityData.preferredSkills || [],
      applicationDeadline: opportunityData.applicationDeadline || new Date(),
      startDate: opportunityData.startDate || new Date(),
      numberOfOpenings: opportunityData.numberOfOpenings || 1,
      status: 'open',
      postedDate: new Date(),
      postedBy: 'current-user',
      isInternalOnly: opportunityData.isInternalOnly ?? true,
      requiresRelocation: opportunityData.requiresRelocation || false,
      ...opportunityData,
    };

    opportunities.push(newOpportunity);
    localStorage.setItem(STORAGE_KEYS.MOBILITY_OPPORTUNITIES, JSON.stringify(opportunities));
    return newOpportunity;
  }

  static async updateOpportunity(opportunityId: string, updates: Partial<MobilityOpportunity>): Promise<MobilityOpportunity> {
    const opportunities = await this.getAllOpportunities();
    const index = opportunities.findIndex(o => o.opportunityId === opportunityId);
    if (index === -1) throw new Error('Opportunity not found');

    opportunities[index] = { ...opportunities[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MOBILITY_OPPORTUNITIES, JSON.stringify(opportunities));
    return opportunities[index];
  }
}

export class MobilityApplicationService {
  static async getAllApplications(): Promise<MobilityApplication[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MOBILITY_APPLICATIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getApplicationsByEmployeeId(employeeId: string): Promise<MobilityApplication[]> {
    const applications = await this.getAllApplications();
    return applications.filter(a => a.employeeId === employeeId);
  }

  static async getApplicationsByOpportunityId(opportunityId: string): Promise<MobilityApplication[]> {
    const applications = await this.getAllApplications();
    return applications.filter(a => a.opportunityId === opportunityId);
  }

  static async createApplication(applicationData: Partial<MobilityApplication>): Promise<MobilityApplication> {
    const applications = await this.getAllApplications();
    const newApplication: MobilityApplication = {
      applicationId: `app-${Date.now()}`,
      opportunityId: applicationData.opportunityId || '',
      opportunityTitle: applicationData.opportunityTitle || '',
      employeeId: applicationData.employeeId || '',
      employeeName: applicationData.employeeName || '',
      currentPosition: applicationData.currentPosition || '',
      currentDepartment: applicationData.currentDepartment || '',
      applicationDate: new Date(),
      motivation: applicationData.motivation || '',
      relevantExperience: applicationData.relevantExperience || [],
      relevantSkills: applicationData.relevantSkills || [],
      applicationStatus: 'submitted',
      ...applicationData,
    };

    applications.push(newApplication);
    localStorage.setItem(STORAGE_KEYS.MOBILITY_APPLICATIONS, JSON.stringify(applications));
    return newApplication;
  }

  static async updateApplication(applicationId: string, updates: Partial<MobilityApplication>): Promise<MobilityApplication> {
    const applications = await this.getAllApplications();
    const index = applications.findIndex(a => a.applicationId === applicationId);
    if (index === -1) throw new Error('Application not found');

    applications[index] = { ...applications[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MOBILITY_APPLICATIONS, JSON.stringify(applications));
    return applications[index];
  }
}

export class MobilityPreferenceService {
  static async getAllPreferences(): Promise<MobilityPreference[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MOBILITY_PREFERENCES);
    return data ? JSON.parse(data) : [];
  }

  static async getPreferenceByEmployeeId(employeeId: string): Promise<MobilityPreference | null> {
    const preferences = await this.getAllPreferences();
    return preferences.find(p => p.employeeId === employeeId) || null;
  }

  static async createPreference(preferenceData: Partial<MobilityPreference>): Promise<MobilityPreference> {
    const preferences = await this.getAllPreferences();
    const newPreference: MobilityPreference = {
      preferenceId: `pref-${Date.now()}`,
      employeeId: preferenceData.employeeId || '',
      employeeName: preferenceData.employeeName || '',
      preferredDepartments: preferenceData.preferredDepartments || [],
      preferredLocations: preferenceData.preferredLocations || [],
      preferredMobilityTypes: preferenceData.preferredMobilityTypes || [],
      willingToRelocate: preferenceData.willingToRelocate || false,
      preferredRoles: preferenceData.preferredRoles || [],
      availabilityDate: preferenceData.availabilityDate || new Date(),
      mobilityReadiness: preferenceData.mobilityReadiness || 'interested',
      careerInterests: preferenceData.careerInterests || [],
      developmentNeeds: preferenceData.developmentNeeds || [],
      lastUpdatedDate: new Date(),
      ...preferenceData,
    };

    preferences.push(newPreference);
    localStorage.setItem(STORAGE_KEYS.MOBILITY_PREFERENCES, JSON.stringify(preferences));
    return newPreference;
  }

  static async updatePreference(preferenceId: string, updates: Partial<MobilityPreference>): Promise<MobilityPreference> {
    const preferences = await this.getAllPreferences();
    const index = preferences.findIndex(p => p.preferenceId === preferenceId);
    if (index === -1) throw new Error('Preference not found');

    preferences[index] = { ...preferences[index], ...updates, lastUpdatedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.MOBILITY_PREFERENCES, JSON.stringify(preferences));
    return preferences[index];
  }
}

export class SuccessionPlanService {
  static async getAllPlans(): Promise<SuccessionPlan[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SUCCESSION_PLANS);
    return data ? JSON.parse(data) : [];
  }

  static async getPlanById(planId: string): Promise<SuccessionPlan | null> {
    const plans = await this.getAllPlans();
    return plans.find(p => p.planId === planId) || null;
  }

  static async createPlan(planData: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
    const plans = await this.getAllPlans();
    const newPlan: SuccessionPlan = {
      planId: `plan-${Date.now()}`,
      criticalPosition: planData.criticalPosition || '',
      department: planData.department || '',
      retirementRisk: planData.retirementRisk || 'low',
      successors: planData.successors || [],
      developmentPipeline: planData.developmentPipeline || [],
      riskMitigation: planData.riskMitigation || [],
      lastReviewDate: new Date(),
      nextReviewDate: planData.nextReviewDate || new Date(),
      status: 'active',
      ...planData,
    };

    plans.push(newPlan);
    localStorage.setItem(STORAGE_KEYS.SUCCESSION_PLANS, JSON.stringify(plans));
    return newPlan;
  }

  static async updatePlan(planId: string, updates: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
    const plans = await this.getAllPlans();
    const index = plans.findIndex(p => p.planId === planId);
    if (index === -1) throw new Error('Succession plan not found');

    plans[index] = { ...plans[index], ...updates, lastReviewDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.SUCCESSION_PLANS, JSON.stringify(plans));
    return plans[index];
  }
}

// ============================================================================
// CAREER GOALS SERVICES
// ============================================================================

export class CareerGoalService {
  static async getAllGoals(): Promise<CareerGoal[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CAREER_GOALS);
    return data ? JSON.parse(data) : [];
  }

  static async getGoalsByEmployeeId(employeeId: string): Promise<CareerGoal[]> {
    const goals = await this.getAllGoals();
    return goals.filter(g => g.employeeId === employeeId);
  }

  static async getGoalById(goalId: string): Promise<CareerGoal | null> {
    const goals = await this.getAllGoals();
    return goals.find(g => g.goalId === goalId) || null;
  }

  static async createGoal(goalData: Partial<CareerGoal>): Promise<CareerGoal> {
    const goals = await this.getAllGoals();
    const newGoal: CareerGoal = {
      goalId: `goal-${Date.now()}`,
      employeeId: goalData.employeeId || '',
      employeeName: goalData.employeeName || '',
      goalType: goalData.goalType || 'skill_development',
      goalTitle: goalData.goalTitle || 'New Career Goal',
      description: goalData.description || '',
      targetDate: goalData.targetDate || new Date(),
      priority: goalData.priority || 'medium',
      alignedToCompanyGoals: goalData.alignedToCompanyGoals || false,
      milestones: goalData.milestones || [],
      requiredActions: goalData.requiredActions || [],
      progressPercentage: 0,
      status: 'not_started',
      managerSupport: false,
      resources: goalData.resources || [],
      successCriteria: goalData.successCriteria || [],
      createdDate: new Date(),
      lastUpdatedDate: new Date(),
      ...goalData,
    };

    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.CAREER_GOALS, JSON.stringify(goals));
    return newGoal;
  }

  static async updateGoal(goalId: string, updates: Partial<CareerGoal>): Promise<CareerGoal> {
    const goals = await this.getAllGoals();
    const index = goals.findIndex(g => g.goalId === goalId);
    if (index === -1) throw new Error('Career goal not found');

    goals[index] = { ...goals[index], ...updates, lastUpdatedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.CAREER_GOALS, JSON.stringify(goals));
    return goals[index];
  }

  // TODO: Replace with actual API call
  static async deleteGoal(goalId: string): Promise<void> {
    const goals = await this.getAllGoals();
    const filtered = goals.filter(g => g.goalId !== goalId);
    localStorage.setItem(STORAGE_KEYS.CAREER_GOALS, JSON.stringify(filtered));
  }
}

export class DevelopmentDiscussionService {
  static async getAllDiscussions(): Promise<DevelopmentDiscussion[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DEVELOPMENT_DISCUSSIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getDiscussionsByEmployeeId(employeeId: string): Promise<DevelopmentDiscussion[]> {
    const discussions = await this.getAllDiscussions();
    return discussions.filter(d => d.employeeId === employeeId);
  }

  static async createDiscussion(discussionData: Partial<DevelopmentDiscussion>): Promise<DevelopmentDiscussion> {
    const discussions = await this.getAllDiscussions();
    const newDiscussion: DevelopmentDiscussion = {
      discussionId: `disc-${Date.now()}`,
      employeeId: discussionData.employeeId || '',
      employeeName: discussionData.employeeName || '',
      managerId: discussionData.managerId || '',
      managerName: discussionData.managerName || '',
      discussionDate: discussionData.discussionDate || new Date(),
      discussionType: discussionData.discussionType || 'check_in',
      topics: discussionData.topics || [],
      careerGoalsDiscussed: discussionData.careerGoalsDiscussed || [],
      strengthsIdentified: discussionData.strengthsIdentified || [],
      areasForDevelopment: discussionData.areasForDevelopment || [],
      actionItems: discussionData.actionItems || [],
      managerCommitments: discussionData.managerCommitments || [],
      employeeCommitments: discussionData.employeeCommitments || [],
      summary: discussionData.summary || '',
      ...discussionData,
    };

    discussions.push(newDiscussion);
    localStorage.setItem(STORAGE_KEYS.DEVELOPMENT_DISCUSSIONS, JSON.stringify(discussions));
    return newDiscussion;
  }

  static async updateDiscussion(discussionId: string, updates: Partial<DevelopmentDiscussion>): Promise<DevelopmentDiscussion> {
    const discussions = await this.getAllDiscussions();
    const index = discussions.findIndex(d => d.discussionId === discussionId);
    if (index === -1) throw new Error('Discussion not found');

    discussions[index] = { ...discussions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.DEVELOPMENT_DISCUSSIONS, JSON.stringify(discussions));
    return discussions[index];
  }
}

// ============================================================================
// ASPIRATIONS SERVICES
// ============================================================================

export class CareerAspirationService {
  static async getAllAspirations(): Promise<CareerAspiration[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ASPIRATIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getAspirationsByEmployeeId(employeeId: string): Promise<CareerAspiration[]> {
    const aspirations = await this.getAllAspirations();
    return aspirations.filter(a => a.employeeId === employeeId);
  }

  static async createAspiration(aspirationData: Partial<CareerAspiration>): Promise<CareerAspiration> {
    const aspirations = await this.getAllAspirations();
    const newAspiration: CareerAspiration = {
      aspirationId: `asp-${Date.now()}`,
      employeeId: aspirationData.employeeId || '',
      employeeName: aspirationData.employeeName || '',
      aspirationType: aspirationData.aspirationType || 'role',
      aspirationTitle: aspirationData.aspirationTitle || 'New Career Aspiration',
      description: aspirationData.description || '',
      desiredSkills: aspirationData.desiredSkills || [],
      desiredExperience: aspirationData.desiredExperience || [],
      timeframe: aspirationData.timeframe || '3_years',
      isSharedWithManager: aspirationData.isSharedWithManager || false,
      pathwayRecommendations: aspirationData.pathwayRecommendations || [],
      relatedOpportunities: aspirationData.relatedOpportunities || [],
      inspirations: aspirationData.inspirations || [],
      barriers: aspirationData.barriers || [],
      supportNeeded: aspirationData.supportNeeded || [],
      createdDate: new Date(),
      lastUpdatedDate: new Date(),
      status: 'exploring',
      ...aspirationData,
    };

    aspirations.push(newAspiration);
    localStorage.setItem(STORAGE_KEYS.ASPIRATIONS, JSON.stringify(aspirations));
    return newAspiration;
  }

  static async updateAspiration(aspirationId: string, updates: Partial<CareerAspiration>): Promise<CareerAspiration> {
    const aspirations = await this.getAllAspirations();
    const index = aspirations.findIndex(a => a.aspirationId === aspirationId);
    if (index === -1) throw new Error('Aspiration not found');

    aspirations[index] = { ...aspirations[index], ...updates, lastUpdatedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.ASPIRATIONS, JSON.stringify(aspirations));
    return aspirations[index];
  }

  // TODO: Replace with actual API call
  static async deleteAspiration(aspirationId: string): Promise<void> {
    const aspirations = await this.getAllAspirations();
    const filtered = aspirations.filter(a => a.aspirationId !== aspirationId);
    localStorage.setItem(STORAGE_KEYS.ASPIRATIONS, JSON.stringify(filtered));
  }
}

export class MentorshipRequestService {
  static async getAllRequests(): Promise<MentorshipRequest[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MENTORSHIP_REQUESTS);
    return data ? JSON.parse(data) : [];
  }

  static async getRequestsByMenteeId(menteeId: string): Promise<MentorshipRequest[]> {
    const requests = await this.getAllRequests();
    return requests.filter(r => r.menteeId === menteeId);
  }

  static async createRequest(requestData: Partial<MentorshipRequest>): Promise<MentorshipRequest> {
    const requests = await this.getAllRequests();
    const newRequest: MentorshipRequest = {
      requestId: `mentor-${Date.now()}`,
      menteeId: requestData.menteeId || '',
      menteeName: requestData.menteeName || '',
      menteePosition: requestData.menteePosition || '',
      desiredMentorProfile: requestData.desiredMentorProfile || { preferredSeniority: [], preferredExpertise: [] },
      areasForGuidance: requestData.areasForGuidance || [],
      careerAspirations: requestData.careerAspirations || [],
      preferredMeetingFrequency: requestData.preferredMeetingFrequency || 'monthly',
      commitmentDuration: requestData.commitmentDuration || 6,
      status: 'pending',
      requestDate: new Date(),
      ...requestData,
    };

    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.MENTORSHIP_REQUESTS, JSON.stringify(requests));
    return newRequest;
  }

  static async updateRequest(requestId: string, updates: Partial<MentorshipRequest>): Promise<MentorshipRequest> {
    const requests = await this.getAllRequests();
    const index = requests.findIndex(r => r.requestId === requestId);
    if (index === -1) throw new Error('Mentorship request not found');

    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MENTORSHIP_REQUESTS, JSON.stringify(requests));
    return requests[index];
  }
}

export class SkillAssessmentService {
  static async getAllAssessments(): Promise<SkillAssessment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SKILL_ASSESSMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getAssessmentsByEmployeeId(employeeId: string): Promise<SkillAssessment[]> {
    const assessments = await this.getAllAssessments();
    return assessments.filter(a => a.employeeId === employeeId);
  }

  static async createAssessment(assessmentData: Partial<SkillAssessment>): Promise<SkillAssessment> {
    const assessments = await this.getAllAssessments();
    const newAssessment: SkillAssessment = {
      assessmentId: `assess-${Date.now()}`,
      employeeId: assessmentData.employeeId || '',
      employeeName: assessmentData.employeeName || '',
      assessmentDate: new Date(),
      assessmentType: assessmentData.assessmentType || 'self_assessment',
      skills: assessmentData.skills || [],
      overallScore: assessmentData.overallScore || 0,
      strengthAreas: assessmentData.strengthAreas || [],
      developmentAreas: assessmentData.developmentAreas || [],
      recommendations: assessmentData.recommendations || [],
      linkedToGoals: assessmentData.linkedToGoals || [],
      ...assessmentData,
    };

    assessments.push(newAssessment);
    localStorage.setItem(STORAGE_KEYS.SKILL_ASSESSMENTS, JSON.stringify(assessments));
    return newAssessment;
  }
}

export class LearningPathwayService {
  static async getAllPathways(): Promise<LearningPathway[]> {
    const data = localStorage.getItem(STORAGE_KEYS.LEARNING_PATHWAYS);
    return data ? JSON.parse(data) : [];
  }

  static async getPathwayById(pathwayId: string): Promise<LearningPathway | null> {
    const pathways = await this.getAllPathways();
    return pathways.find(p => p.pathwayId === pathwayId) || null;
  }

  static async createPathway(pathwayData: Partial<LearningPathway>): Promise<LearningPathway> {
    const pathways = await this.getAllPathways();
    const newPathway: LearningPathway = {
      pathwayId: `pathway-${Date.now()}`,
      pathwayName: pathwayData.pathwayName || 'New Learning Pathway',
      description: pathwayData.description || '',
      targetSkills: pathwayData.targetSkills || [],
      duration: pathwayData.duration || 6,
      difficulty: pathwayData.difficulty || 'intermediate',
      modules: pathwayData.modules || [],
      enrolledEmployees: 0,
      completionRate: 0,
      isRecommended: false,
      createdBy: 'current-user',
      createdDate: new Date(),
      lastUpdatedDate: new Date(),
      status: 'active',
      estimatedTimeCommitment: pathwayData.estimatedTimeCommitment || 5,
      ...pathwayData,
    };

    pathways.push(newPathway);
    localStorage.setItem(STORAGE_KEYS.LEARNING_PATHWAYS, JSON.stringify(pathways));
    return newPathway;
  }

  static async updatePathway(pathwayId: string, updates: Partial<LearningPathway>): Promise<LearningPathway> {
    const pathways = await this.getAllPathways();
    const index = pathways.findIndex(p => p.pathwayId === pathwayId);
    if (index === -1) throw new Error('Learning pathway not found');

    pathways[index] = { ...pathways[index], ...updates, lastUpdatedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.LEARNING_PATHWAYS, JSON.stringify(pathways));
    return pathways[index];
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class CareerSettingsService {
  static async getSettings(): Promise<CareerSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return JSON.parse(data);

    const defaultSettings: CareerSettings = {
      settingsId: 'settings-1',
      enableCareerLadders: true,
      enableInternalMobility: true,
      enableMentorship: true,
      requireManagerApprovalForMobility: true,
      minimumTenureForMobility: 6,
      noticePeriodrequired: 2,
      allowCrossDepartmentMobility: true,
      allowCrossLocationMobility: true,
      enableSuccessionPlanning: true,
      enableSkillAssessments: true,
      assessmentFrequency: 12,
      enableCareerGoals: true,
      maxActiveGoalsPerEmployee: 5,
      goalReviewFrequency: 3,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'system',
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<CareerSettings>): Promise<CareerSettings> {
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'current-user',
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
