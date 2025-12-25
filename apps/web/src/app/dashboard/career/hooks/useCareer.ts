'use client';

import { useState, useEffect } from 'react';
import {
  CareerLadder, EmployeeCareerPath, MobilityOpportunity, MobilityApplication, MobilityPreference,
  SuccessionPlan, CareerGoal, DevelopmentDiscussion, CareerAspiration, MentorshipRequest,
  SkillAssessment, LearningPathway, CareerSettings, Toast
} from '../types';
import {
  CareerLadderService, EmployeeCareerPathService, MobilityOpportunityService, MobilityApplicationService,
  MobilityPreferenceService, SuccessionPlanService, CareerGoalService, DevelopmentDiscussionService,
  CareerAspirationService, MentorshipRequestService, SkillAssessmentService, LearningPathwayService,
  CareerSettingsService
} from '../services';
import {
import { logger } from '@/lib/logger';
  sampleCareerLadders, sampleEmployeeCareerPaths, sampleMobilityOpportunities, sampleMobilityApplications,
  sampleMobilityPreferences, sampleSuccessionPlans, sampleCareerGoals, sampleDevelopmentDiscussions,
  sampleCareerAspirations, sampleMentorshipRequests, sampleSkillAssessments, sampleLearningPathways,
  sampleCareerSettings
} from '../data';

export const useCareer = () => {
  // ============================================================================
  // CAREER LADDERS STATE
  // ============================================================================
  const [careerLadders, setCareerLadders] = useState<CareerLadder[]>([]);
  const [employeeCareerPaths, setEmployeeCareerPaths] = useState<EmployeeCareerPath[]>([]);

  // ============================================================================
  // INTERNAL MOBILITY STATE
  // ============================================================================
  const [mobilityOpportunities, setMobilityOpportunities] = useState<MobilityOpportunity[]>([]);
  const [mobilityApplications, setMobilityApplications] = useState<MobilityApplication[]>([]);
  const [mobilityPreferences, setMobilityPreferences] = useState<MobilityPreference[]>([]);
  const [successionPlans, setSuccessionPlans] = useState<SuccessionPlan[]>([]);

  // ============================================================================
  // CAREER GOALS STATE
  // ============================================================================
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);
  const [developmentDiscussions, setDevelopmentDiscussions] = useState<DevelopmentDiscussion[]>([]);

  // ============================================================================
  // ASPIRATIONS STATE
  // ============================================================================
  const [careerAspirations, setCareerAspirations] = useState<CareerAspiration[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);
  const [learningPathways, setLearningPathways] = useState<LearningPathway[]>([]);

  // ============================================================================
  // SHARED STATE
  // ============================================================================
  const [settings, setSettings] = useState<CareerSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Check if data exists, if not initialize with sample data
      const existing = await CareerLadderService.getAllLadders();
      if (existing.length === 0) {
        localStorage.setItem('career_ladders', JSON.stringify(sampleCareerLadders));
        localStorage.setItem('career_employee_paths', JSON.stringify(sampleEmployeeCareerPaths));
        localStorage.setItem('career_mobility_opportunities', JSON.stringify(sampleMobilityOpportunities));
        localStorage.setItem('career_mobility_applications', JSON.stringify(sampleMobilityApplications));
        localStorage.setItem('career_mobility_preferences', JSON.stringify(sampleMobilityPreferences));
        localStorage.setItem('career_succession_plans', JSON.stringify(sampleSuccessionPlans));
        localStorage.setItem('career_goals', JSON.stringify(sampleCareerGoals));
        localStorage.setItem('career_development_discussions', JSON.stringify(sampleDevelopmentDiscussions));
        localStorage.setItem('career_aspirations', JSON.stringify(sampleCareerAspirations));
        localStorage.setItem('career_mentorship_requests', JSON.stringify(sampleMentorshipRequests));
        localStorage.setItem('career_skill_assessments', JSON.stringify(sampleSkillAssessments));
        localStorage.setItem('career_learning_pathways', JSON.stringify(sampleLearningPathways));
      }

      await Promise.all([
        loadCareerLadders(),
        loadEmployeeCareerPaths(),
        loadMobilityOpportunities(),
        loadMobilityApplications(),
        loadMobilityPreferences(),
        loadSuccessionPlans(),
        loadCareerGoals(),
        loadDevelopmentDiscussions(),
        loadCareerAspirations(),
        loadMentorshipRequests(),
        loadSkillAssessments(),
        loadLearningPathways(),
        loadSettings(),
      ]);
    } catch {
      logger.error('Error loading data:', error);
      addToast({ type: 'error', message: 'Failed to load career planning data' });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CAREER LADDERS METHODS
  // ============================================================================
  const loadCareerLadders = async () => {
    try {
      const data = await CareerLadderService.getAllLadders();
      setCareerLadders(data);
    } catch {
      logger.error('Error loading career ladders:', error);
    }
  };

  const createCareerLadder = async (ladderData: Partial<CareerLadder>) => {
    setLoading(true);
    try {
      const ladder = await CareerLadderService.createLadder(ladderData);
      await loadCareerLadders();
      addToast({ type: 'success', message: 'Career ladder created successfully' });
      return ladder;
    } catch {
      logger.error('Error creating career ladder:', error);
      addToast({ type: 'error', message: 'Failed to create career ladder' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCareerLadder = async (ladderId: string, updates: Partial<CareerLadder>) => {
    setLoading(true);
    try {
      const ladder = await CareerLadderService.updateLadder(ladderId, updates);
      await loadCareerLadders();
      addToast({ type: 'success', message: 'Career ladder updated successfully' });
      return ladder;
    } catch {
      logger.error('Error updating career ladder:', error);
      addToast({ type: 'error', message: 'Failed to update career ladder' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCareerLadder = async (ladderId: string) => {
    setLoading(true);
    try {
      await CareerLadderService.deleteLadder(ladderId);
      await loadCareerLadders();
      addToast({ type: 'success', message: 'Career ladder deleted successfully' });
    } catch {
      logger.error('Error deleting career ladder:', error);
      addToast({ type: 'error', message: 'Failed to delete career ladder' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeCareerPaths = async () => {
    try {
      const data = await EmployeeCareerPathService.getAllPaths();
      setEmployeeCareerPaths(data);
    } catch {
      logger.error('Error loading employee career paths:', error);
    }
  };

  const createEmployeeCareerPath = async (pathData: Partial<EmployeeCareerPath>) => {
    setLoading(true);
    try {
      const path = await EmployeeCareerPathService.createPath(pathData);
      await loadEmployeeCareerPaths();
      addToast({ type: 'success', message: 'Career path created successfully' });
      return path;
    } catch {
      logger.error('Error creating career path:', error);
      addToast({ type: 'error', message: 'Failed to create career path' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeCareerPath = async (pathId: string, updates: Partial<EmployeeCareerPath>) => {
    setLoading(true);
    try {
      const path = await EmployeeCareerPathService.updatePath(pathId, updates);
      await loadEmployeeCareerPaths();
      addToast({ type: 'success', message: 'Career path updated successfully' });
      return path;
    } catch {
      logger.error('Error updating career path:', error);
      addToast({ type: 'error', message: 'Failed to update career path' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // INTERNAL MOBILITY METHODS
  // ============================================================================
  const loadMobilityOpportunities = async () => {
    try {
      const data = await MobilityOpportunityService.getAllOpportunities();
      setMobilityOpportunities(data);
    } catch {
      logger.error('Error loading mobility opportunities:', error);
    }
  };

  const createMobilityOpportunity = async (opportunityData: Partial<MobilityOpportunity>) => {
    setLoading(true);
    try {
      const opportunity = await MobilityOpportunityService.createOpportunity(opportunityData);
      await loadMobilityOpportunities();
      addToast({ type: 'success', message: 'Mobility opportunity created successfully' });
      return opportunity;
    } catch {
      logger.error('Error creating mobility opportunity:', error);
      addToast({ type: 'error', message: 'Failed to create mobility opportunity' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMobilityOpportunity = async (opportunityId: string, updates: Partial<MobilityOpportunity>) => {
    setLoading(true);
    try {
      const opportunity = await MobilityOpportunityService.updateOpportunity(opportunityId, updates);
      await loadMobilityOpportunities();
      addToast({ type: 'success', message: 'Mobility opportunity updated successfully' });
      return opportunity;
    } catch {
      logger.error('Error updating mobility opportunity:', error);
      addToast({ type: 'error', message: 'Failed to update mobility opportunity' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadMobilityApplications = async () => {
    try {
      const data = await MobilityApplicationService.getAllApplications();
      setMobilityApplications(data);
    } catch {
      logger.error('Error loading mobility applications:', error);
    }
  };

  const createMobilityApplication = async (applicationData: Partial<MobilityApplication>) => {
    setLoading(true);
    try {
      const application = await MobilityApplicationService.createApplication(applicationData);
      await loadMobilityApplications();
      addToast({ type: 'success', message: 'Application submitted successfully' });
      return application;
    } catch {
      logger.error('Error creating mobility application:', error);
      addToast({ type: 'error', message: 'Failed to submit application' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMobilityApplication = async (applicationId: string, updates: Partial<MobilityApplication>) => {
    setLoading(true);
    try {
      const application = await MobilityApplicationService.updateApplication(applicationId, updates);
      await loadMobilityApplications();
      addToast({ type: 'success', message: 'Application updated successfully' });
      return application;
    } catch {
      logger.error('Error updating mobility application:', error);
      addToast({ type: 'error', message: 'Failed to update application' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadMobilityPreferences = async () => {
    try {
      const data = await MobilityPreferenceService.getAllPreferences();
      setMobilityPreferences(data);
    } catch {
      logger.error('Error loading mobility preferences:', error);
    }
  };

  const createMobilityPreference = async (preferenceData: Partial<MobilityPreference>) => {
    setLoading(true);
    try {
      const preference = await MobilityPreferenceService.createPreference(preferenceData);
      await loadMobilityPreferences();
      addToast({ type: 'success', message: 'Mobility preferences saved successfully' });
      return preference;
    } catch {
      logger.error('Error creating mobility preference:', error);
      addToast({ type: 'error', message: 'Failed to save mobility preferences' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMobilityPreference = async (preferenceId: string, updates: Partial<MobilityPreference>) => {
    setLoading(true);
    try {
      const preference = await MobilityPreferenceService.updatePreference(preferenceId, updates);
      await loadMobilityPreferences();
      addToast({ type: 'success', message: 'Mobility preferences updated successfully' });
      return preference;
    } catch {
      logger.error('Error updating mobility preference:', error);
      addToast({ type: 'error', message: 'Failed to update mobility preferences' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSuccessionPlans = async () => {
    try {
      const data = await SuccessionPlanService.getAllPlans();
      setSuccessionPlans(data);
    } catch {
      logger.error('Error loading succession plans:', error);
    }
  };

  const createSuccessionPlan = async (planData: Partial<SuccessionPlan>) => {
    setLoading(true);
    try {
      const plan = await SuccessionPlanService.createPlan(planData);
      await loadSuccessionPlans();
      addToast({ type: 'success', message: 'Succession plan created successfully' });
      return plan;
    } catch {
      logger.error('Error creating succession plan:', error);
      addToast({ type: 'error', message: 'Failed to create succession plan' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSuccessionPlan = async (planId: string, updates: Partial<SuccessionPlan>) => {
    setLoading(true);
    try {
      const plan = await SuccessionPlanService.updatePlan(planId, updates);
      await loadSuccessionPlans();
      addToast({ type: 'success', message: 'Succession plan updated successfully' });
      return plan;
    } catch {
      logger.error('Error updating succession plan:', error);
      addToast({ type: 'error', message: 'Failed to update succession plan' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CAREER GOALS METHODS
  // ============================================================================
  const loadCareerGoals = async () => {
    try {
      const data = await CareerGoalService.getAllGoals();
      setCareerGoals(data);
    } catch {
      logger.error('Error loading career goals:', error);
    }
  };

  const createCareerGoal = async (goalData: Partial<CareerGoal>) => {
    setLoading(true);
    try {
      const goal = await CareerGoalService.createGoal(goalData);
      await loadCareerGoals();
      addToast({ type: 'success', message: 'Career goal created successfully' });
      return goal;
    } catch {
      logger.error('Error creating career goal:', error);
      addToast({ type: 'error', message: 'Failed to create career goal' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCareerGoal = async (goalId: string, updates: Partial<CareerGoal>) => {
    setLoading(true);
    try {
      const goal = await CareerGoalService.updateGoal(goalId, updates);
      await loadCareerGoals();
      addToast({ type: 'success', message: 'Career goal updated successfully' });
      return goal;
    } catch {
      logger.error('Error updating career goal:', error);
      addToast({ type: 'error', message: 'Failed to update career goal' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCareerGoal = async (goalId: string) => {
    setLoading(true);
    try {
      await CareerGoalService.deleteGoal(goalId);
      await loadCareerGoals();
      addToast({ type: 'success', message: 'Career goal deleted successfully' });
    } catch {
      logger.error('Error deleting career goal:', error);
      addToast({ type: 'error', message: 'Failed to delete career goal' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadDevelopmentDiscussions = async () => {
    try {
      const data = await DevelopmentDiscussionService.getAllDiscussions();
      setDevelopmentDiscussions(data);
    } catch {
      logger.error('Error loading development discussions:', error);
    }
  };

  const createDevelopmentDiscussion = async (discussionData: Partial<DevelopmentDiscussion>) => {
    setLoading(true);
    try {
      const discussion = await DevelopmentDiscussionService.createDiscussion(discussionData);
      await loadDevelopmentDiscussions();
      addToast({ type: 'success', message: 'Development discussion recorded successfully' });
      return discussion;
    } catch {
      logger.error('Error creating development discussion:', error);
      addToast({ type: 'error', message: 'Failed to record development discussion' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDevelopmentDiscussion = async (discussionId: string, updates: Partial<DevelopmentDiscussion>) => {
    setLoading(true);
    try {
      const discussion = await DevelopmentDiscussionService.updateDiscussion(discussionId, updates);
      await loadDevelopmentDiscussions();
      addToast({ type: 'success', message: 'Development discussion updated successfully' });
      return discussion;
    } catch {
      logger.error('Error updating development discussion:', error);
      addToast({ type: 'error', message: 'Failed to update development discussion' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ASPIRATIONS METHODS
  // ============================================================================
  const loadCareerAspirations = async () => {
    try {
      const data = await CareerAspirationService.getAllAspirations();
      setCareerAspirations(data);
    } catch {
      logger.error('Error loading career aspirations:', error);
    }
  };

  const createCareerAspiration = async (aspirationData: Partial<CareerAspiration>) => {
    setLoading(true);
    try {
      const aspiration = await CareerAspirationService.createAspiration(aspirationData);
      await loadCareerAspirations();
      addToast({ type: 'success', message: 'Career aspiration created successfully' });
      return aspiration;
    } catch {
      logger.error('Error creating career aspiration:', error);
      addToast({ type: 'error', message: 'Failed to create career aspiration' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCareerAspiration = async (aspirationId: string, updates: Partial<CareerAspiration>) => {
    setLoading(true);
    try {
      const aspiration = await CareerAspirationService.updateAspiration(aspirationId, updates);
      await loadCareerAspirations();
      addToast({ type: 'success', message: 'Career aspiration updated successfully' });
      return aspiration;
    } catch {
      logger.error('Error updating career aspiration:', error);
      addToast({ type: 'error', message: 'Failed to update career aspiration' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCareerAspiration = async (aspirationId: string) => {
    setLoading(true);
    try {
      await CareerAspirationService.deleteAspiration(aspirationId);
      await loadCareerAspirations();
      addToast({ type: 'success', message: 'Career aspiration deleted successfully' });
    } catch {
      logger.error('Error deleting career aspiration:', error);
      addToast({ type: 'error', message: 'Failed to delete career aspiration' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadMentorshipRequests = async () => {
    try {
      const data = await MentorshipRequestService.getAllRequests();
      setMentorshipRequests(data);
    } catch {
      logger.error('Error loading mentorship requests:', error);
    }
  };

  const createMentorshipRequest = async (requestData: Partial<MentorshipRequest>) => {
    setLoading(true);
    try {
      const request = await MentorshipRequestService.createRequest(requestData);
      await loadMentorshipRequests();
      addToast({ type: 'success', message: 'Mentorship request submitted successfully' });
      return request;
    } catch {
      logger.error('Error creating mentorship request:', error);
      addToast({ type: 'error', message: 'Failed to submit mentorship request' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMentorshipRequest = async (requestId: string, updates: Partial<MentorshipRequest>) => {
    setLoading(true);
    try {
      const request = await MentorshipRequestService.updateRequest(requestId, updates);
      await loadMentorshipRequests();
      addToast({ type: 'success', message: 'Mentorship request updated successfully' });
      return request;
    } catch {
      logger.error('Error updating mentorship request:', error);
      addToast({ type: 'error', message: 'Failed to update mentorship request' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSkillAssessments = async () => {
    try {
      const data = await SkillAssessmentService.getAllAssessments();
      setSkillAssessments(data);
    } catch {
      logger.error('Error loading skill assessments:', error);
    }
  };

  const createSkillAssessment = async (assessmentData: Partial<SkillAssessment>) => {
    setLoading(true);
    try {
      const assessment = await SkillAssessmentService.createAssessment(assessmentData);
      await loadSkillAssessments();
      addToast({ type: 'success', message: 'Skill assessment created successfully' });
      return assessment;
    } catch {
      logger.error('Error creating skill assessment:', error);
      addToast({ type: 'error', message: 'Failed to create skill assessment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadLearningPathways = async () => {
    try {
      const data = await LearningPathwayService.getAllPathways();
      setLearningPathways(data);
    } catch {
      logger.error('Error loading learning pathways:', error);
    }
  };

  const createLearningPathway = async (pathwayData: Partial<LearningPathway>) => {
    setLoading(true);
    try {
      const pathway = await LearningPathwayService.createPathway(pathwayData);
      await loadLearningPathways();
      addToast({ type: 'success', message: 'Learning pathway created successfully' });
      return pathway;
    } catch {
      logger.error('Error creating learning pathway:', error);
      addToast({ type: 'error', message: 'Failed to create learning pathway' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLearningPathway = async (pathwayId: string, updates: Partial<LearningPathway>) => {
    setLoading(true);
    try {
      const pathway = await LearningPathwayService.updatePathway(pathwayId, updates);
      await loadLearningPathways();
      addToast({ type: 'success', message: 'Learning pathway updated successfully' });
      return pathway;
    } catch {
      logger.error('Error updating learning pathway:', error);
      addToast({ type: 'error', message: 'Failed to update learning pathway' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SETTINGS METHODS
  // ============================================================================
  const loadSettings = async () => {
    try {
      const data = await CareerSettingsService.getSettings();
      setSettings(data);
    } catch {
      logger.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<CareerSettings>) => {
    setLoading(true);
    try {
      const updated = await CareerSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated successfully' });
      return updated;
    } catch {
      logger.error('Error updating settings:', error);
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TOAST METHODS
  // ============================================================================
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Career Ladders
    careerLadders,
    employeeCareerPaths,
    loadCareerLadders,
    createCareerLadder,
    updateCareerLadder,
    deleteCareerLadder,
    loadEmployeeCareerPaths,
    createEmployeeCareerPath,
    updateEmployeeCareerPath,

    // Internal Mobility
    mobilityOpportunities,
    mobilityApplications,
    mobilityPreferences,
    successionPlans,
    loadMobilityOpportunities,
    createMobilityOpportunity,
    updateMobilityOpportunity,
    loadMobilityApplications,
    createMobilityApplication,
    updateMobilityApplication,
    loadMobilityPreferences,
    createMobilityPreference,
    updateMobilityPreference,
    loadSuccessionPlans,
    createSuccessionPlan,
    updateSuccessionPlan,

    // Career Goals
    careerGoals,
    developmentDiscussions,
    loadCareerGoals,
    createCareerGoal,
    updateCareerGoal,
    deleteCareerGoal,
    loadDevelopmentDiscussions,
    createDevelopmentDiscussion,
    updateDevelopmentDiscussion,

    // Aspirations
    careerAspirations,
    mentorshipRequests,
    skillAssessments,
    learningPathways,
    loadCareerAspirations,
    createCareerAspiration,
    updateCareerAspiration,
    deleteCareerAspiration,
    loadMentorshipRequests,
    createMentorshipRequest,
    updateMentorshipRequest,
    loadSkillAssessments,
    createSkillAssessment,
    loadLearningPathways,
    createLearningPathway,
    updateLearningPathway,

    // Shared
    settings,
    loading,
    toasts,
    loadSettings,
    updateSettings,
    addToast,
    removeToast,
  };
};
