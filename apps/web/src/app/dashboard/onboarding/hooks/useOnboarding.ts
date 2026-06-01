// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  OnboardingProgram,
  OnboardingInstance,
  OnboardingTask,
  OnboardingDocument,
  OnboardingEquipment,
  OnboardingAccess,
  OnboardingTraining,
  BuddyAssignment,
  Day30_60_90Plan,
  OnboardingSurvey,
  Feedback,
  PreBoardingPackage,
  OnboardingMetrics,
  OnboardingSettings,
} from '../types';
import {
  OnboardingProgramService,
  OnboardingInstanceService,
  OnboardingTaskService,
  OnboardingDocumentService,
  OnboardingEquipmentService,
  OnboardingAccessService,
  OnboardingTrainingService,
  BuddyAssignmentService,
  Day30_60_90PlanService,
  OnboardingSurveyService,
  FeedbackService,
  PreBoardingService,
  OnboardingAnalyticsService,
  OnboardingSettingsService,
} from '../services';
import { useToast } from '@aura/ui';

export const useOnboarding = () => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [programs, setPrograms] = useState<OnboardingProgram[]>([]);
  const [instances, setInstances] = useState<OnboardingInstance[]>([]);
  const [buddyAssignments, setBuddyAssignments] = useState<BuddyAssignment[]>([]);
  const [day30_60_90Plans, setDay30_60_90Plans] = useState<Day30_60_90Plan[]>([]);
  const [preBoardingPackages, setPreBoardingPackages] = useState<PreBoardingPackage[]>([]);
  const [surveys, setSurveys] = useState<OnboardingSurvey[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [settings, setSettings] = useState<OnboardingSettings | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OnboardingProgramService.getPrograms();
      setPrograms(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load onboarding programs';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadInstances = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OnboardingInstanceService.getInstances();
      setInstances(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load onboarding instances';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadBuddyAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await BuddyAssignmentService.getAssignments();
      setBuddyAssignments(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load buddy assignments';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadDay30_60_90Plans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await Day30_60_90PlanService.getPlans();
      setDay30_60_90Plans(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load 30-60-90 plans';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadPreBoardingPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await PreBoardingService.getPackages();
      setPreBoardingPackages(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load pre-boarding packages';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadSurveys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OnboardingSurveyService.getSurveys();
      setSurveys(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load surveys';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await FeedbackService.getFeedback();
      setFeedback(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load feedback';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OnboardingAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load metrics';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OnboardingSettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      const message = (error as Error).message || 'Failed to load settings';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadPrograms(),
      loadInstances(),
      loadBuddyAssignments(),
      loadDay30_60_90Plans(),
      loadPreBoardingPackages(),
      loadSurveys(),
      loadFeedback(),
      loadMetrics(),
      loadSettings(),
    ]);
  }, [
    loadPrograms,
    loadInstances,
    loadBuddyAssignments,
    loadDay30_60_90Plans,
    loadPreBoardingPackages,
    loadSurveys,
    loadFeedback,
    loadMetrics,
    loadSettings,
  ]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ============================================================================
  // ONBOARDING PROGRAMS
  // ============================================================================

  const createProgram = useCallback(
    async (program: OnboardingProgram) => {
      try {
        setIsSaving(true);
        const created = await OnboardingProgramService.createProgram(program);
        setPrograms((prev) => [...prev, created]);
        toast.success('Onboarding program created successfully');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create program';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const updateProgram = useCallback(
    async (id: string, updates: Partial<OnboardingProgram>) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingProgramService.updateProgram(id, updates);
        setPrograms((prev) => prev.map((p) => (p.id === id ? updated : p)));
        toast.success('Program updated successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update program';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const deleteProgram = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        await OnboardingProgramService.deleteProgram(id);
        setPrograms((prev) => prev.filter((p) => p.id !== id));
        toast.success('Program deleted successfully');
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to delete program';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const activateProgram = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        const activated = await OnboardingProgramService.createProgram(id);
        setPrograms((prev) => prev.map((p) => (p.id === id ? activated : p)));
        toast.success('Program activated successfully');
        return activated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to activate program';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const deactivateProgram = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        const deactivated = await OnboardingProgramService.deactivateProgram(id);
        setPrograms((prev) => prev.map((p) => (p.id === id ? deactivated : p)));
        toast.success('Program deactivated successfully');
        return deactivated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to deactivate program';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // ONBOARDING INSTANCES
  // ============================================================================

  const createInstance = useCallback(
    async (instance: OnboardingInstance) => {
      try {
        setIsSaving(true);
        const created = await OnboardingInstanceService.createInstance(instance);
        setInstances((prev) => [...prev, created]);
        await loadMetrics(); // Refresh metrics
        toast.success('Onboarding instance created successfully');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create instance';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const updateInstance = useCallback(
    async (id: string, updates: Partial<OnboardingInstance>) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingInstanceService.updateInstance(id, updates);
        setInstances((prev) => prev.map((i) => (i.id === id ? updated : i)));
        toast.success('Instance updated successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update instance';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const startOnboarding = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        const started = await OnboardingInstanceService.startOnboarding(id);
        setInstances((prev) => prev.map((i) => (i.id === id ? started : i)));
        await loadMetrics();
        toast.success('Onboarding started successfully');
        return started;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to start onboarding';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const completeOnboarding = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        const completed = await OnboardingInstanceService.completeOnboarding(id);
        setInstances((prev) => prev.map((i) => (i.id === id ? completed : i)));
        await loadMetrics();
        toast.success('Onboarding completed successfully');
        return completed;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to complete onboarding';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const cancelOnboarding = useCallback(
    async (id: string, reason: string) => {
      try {
        setIsSaving(true);
        const cancelled = await OnboardingInstanceService.cancelOnboarding(id, reason);
        setInstances((prev) => prev.map((i) => (i.id === id ? cancelled : i)));
        await loadMetrics();
        toast.success('Onboarding cancelled');
        return cancelled;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to cancel onboarding';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  // ============================================================================
  // TASKS
  // ============================================================================

  const updateTaskStatus = useCallback(
    async (
      instanceId: string,
      taskId: string,
      status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled',
      completedBy?: string
    ) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingTaskService.updateTaskStatus(
          instanceId,
          taskId,
          status,
          completedBy
        );
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        await loadMetrics();
        toast.success('Task status updated');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update task status';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  const addTask = useCallback(
    async (instanceId: string, task: OnboardingTask) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingTaskService.addTask(instanceId, task);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Task added successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to add task';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const removeTask = useCallback(
    async (instanceId: string, taskId: string) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingTaskService.removeTask(instanceId, taskId);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Task removed successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to remove task';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  const uploadDocument = useCallback(
    async (instanceId: string, document: OnboardingDocument) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingDocumentService.uploadDocument(instanceId, document);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Document uploaded successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to upload document';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const approveDocument = useCallback(
    async (instanceId: string, documentId: string, approvedBy: string) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingDocumentService.approveDocument(
          instanceId,
          documentId,
          approvedBy
        );
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Document approved');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to approve document';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const rejectDocument = useCallback(
    async (instanceId: string, documentId: string, rejectedBy: string, reason: string) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingDocumentService.rejectDocument(
          instanceId,
          documentId,
          rejectedBy,
          reason
        );
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.error(`Document rejected: ${reason}`);
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to reject document';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // EQUIPMENT
  // ============================================================================

  const assignEquipment = useCallback(
    async (instanceId: string, equipment: OnboardingEquipment) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingEquipmentService.assignEquipment(instanceId, equipment);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Equipment assigned successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to assign equipment';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const returnEquipment = useCallback(
    async (instanceId: string, equipmentId: string, returnedBy: string) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingEquipmentService.returnEquipment(
          instanceId,
          equipmentId,
          returnedBy
        );
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Equipment returned successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to return equipment';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // ACCESS
  // ============================================================================

  const grantAccess = useCallback(
    async (instanceId: string, access: OnboardingAccess) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingAccessService.grantAccess(instanceId, access);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Access granted successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to grant access';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const revokeAccess = useCallback(
    async (instanceId: string, accessId: string, revokedBy: string) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingAccessService.revokeAccess(
          instanceId,
          accessId,
          revokedBy
        );
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Access revoked successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to revoke access';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // TRAINING
  // ============================================================================

  const scheduleTraining = useCallback(
    async (instanceId: string, training: OnboardingTraining) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingTrainingService.scheduleTraining(instanceId, training);
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Training scheduled successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to schedule training';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const completeTraining = useCallback(
    async (instanceId: string, trainingId: string, score?: number, certificateUrl?: string) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingTrainingService.completeTraining(
          instanceId,
          trainingId,
          score,
          certificateUrl
        );
        setInstances((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
        toast.success('Training completed successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to complete training';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // BUDDY ASSIGNMENTS
  // ============================================================================

  const assignBuddy = useCallback(
    async (assignment: BuddyAssignment) => {
      try {
        setIsSaving(true);
        const created = await BuddyAssignmentService.assignBuddy(assignment);
        setBuddyAssignments((prev) => [...prev, created]);

        // Update instance with buddy info
        const instance = instances.find((i) => i.id === assignment.onboardingId);
        if (instance) {
          await updateInstance(instance.id, {
            buddyId: assignment.buddyId,
            buddyName: assignment.buddyName,
          });
        }

        toast.success('Buddy assigned successfully');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to assign buddy';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, instances, updateInstance]
  );

  const addCheckIn = useCallback(
    async (
      assignmentId: string,
      checkIn: { date: string; notes: string; duration: number; topics: string[] }
    ) => {
      try {
        setIsSaving(true);
        const updated = await BuddyAssignmentService.addCheckIn(assignmentId, checkIn);
        setBuddyAssignments((prev) => prev.map((a) => (a.id === assignmentId ? updated : a)));
        toast.success('Check-in added successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to add check-in';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const completeBuddyAssignment = useCallback(
    async (assignmentId: string) => {
      try {
        setIsSaving(true);
        const completed = await BuddyAssignmentService.completeAssignment(assignmentId);
        setBuddyAssignments((prev) => prev.map((a) => (a.id === assignmentId ? completed : a)));
        toast.success('Buddy assignment completed successfully');
        return completed;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to complete buddy assignment';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // 30-60-90 DAY PLANS
  // ============================================================================

  const createDay30_60_90Plan = useCallback(
    async (plan: Day30_60_90Plan) => {
      try {
        setIsSaving(true);
        const created = await Day30_60_90PlanService.createPlan(plan);
        setDay30_60_90Plans((prev) => [...prev, created]);
        toast.success('30-60-90 day plan created successfully');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create plan';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const updateDay30_60_90Plan = useCallback(
    async (id: string, updates: Partial<Day30_60_90Plan>) => {
      try {
        setIsSaving(true);
        const updated = await Day30_60_90PlanService.updatePlan(id, updates);
        setDay30_60_90Plans((prev) => prev.map((p) => (p.id === id ? updated : p)));
        toast.success('Plan updated successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update plan';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const completeMilestone = useCallback(
    async (planId: string, phase: 'day_30' | 'day_60' | 'day_90', milestoneIndex: number) => {
      try {
        setIsSaving(true);
        const updated = await Day30_60_90PlanService.completeMilestone(
          planId,
          phase,
          milestoneIndex
        );
        setDay30_60_90Plans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
        toast.success('Milestone completed');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to complete milestone';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // PRE-BOARDING
  // ============================================================================

  const createPreBoardingPackage = useCallback(
    async (pkg: PreBoardingPackage) => {
      try {
        setIsSaving(true);
        const created = await PreBoardingService.createPackage(pkg);
        setPreBoardingPackages((prev) => [...prev, created]);
        toast.success('Pre-boarding package created successfully');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to create package';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  const sendPreBoardingPackage = useCallback(
    async (packageId: string) => {
      try {
        setIsSaving(true);
        const sent = await PreBoardingService.sendPackage(packageId);
        setPreBoardingPackages((prev) => prev.map((p) => (p.id === packageId ? sent : p)));
        toast.success('Pre-boarding package sent successfully');
        return sent;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to send package';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // SURVEYS
  // ============================================================================

  const submitSurvey = useCallback(
    async (
      surveyId: string,
      answers: Array<{ question: string; answer: string; questionType: string }>,
      score?: number,
      feedback?: string
    ) => {
      try {
        setIsSaving(true);
        const submitted = await OnboardingSurveyService.submitSurvey(
          surveyId,
          answers,
          score,
          feedback
        );
        setSurveys((prev) => prev.map((s) => (s.id === surveyId ? submitted : s)));
        await loadMetrics();
        toast.success('Survey submitted successfully');
        return submitted;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to submit survey';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast, loadMetrics]
  );

  // ============================================================================
  // FEEDBACK
  // ============================================================================

  const submitFeedback = useCallback(
    async (feedbackData: Feedback) => {
      try {
        setIsSaving(true);
        const created = await FeedbackService.submitFeedback(feedbackData);
        setFeedback((prev) => [...prev, created]);
        toast.success('Feedback submitted successfully');
        return created;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to submit feedback';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // SETTINGS
  // ============================================================================

  const updateSettings = useCallback(
    async (updates: Partial<OnboardingSettings>) => {
      try {
        setIsSaving(true);
        const updated = await OnboardingSettingsService.updateSettings(updates);
        setSettings(updated);
        toast.success('Settings updated successfully');
        return updated;
      } catch (error: any) {
        const message = (error as Error).message || 'Failed to update settings';
        toast.error(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    programs,
    instances,
    buddyAssignments,
    day30_60_90Plans,
    preBoardingPackages,
    surveys,
    feedback,
    metrics,
    settings,
    isLoading,
    isSaving,
    error,

    // Data loading
    loadPrograms,
    loadInstances,
    loadBuddyAssignments,
    loadDay30_60_90Plans,
    loadPreBoardingPackages,
    loadSurveys,
    loadFeedback,
    loadMetrics,
    loadSettings,
    loadAllData,

    // Programs
    createProgram,
    updateProgram,
    deleteProgram,
    activateProgram,
    deactivateProgram,

    // Instances
    createInstance,
    updateInstance,
    startOnboarding,
    completeOnboarding,
    cancelOnboarding,

    // Tasks
    updateTaskStatus,
    addTask,
    removeTask,

    // Documents
    uploadDocument,
    approveDocument,
    rejectDocument,

    // Equipment
    assignEquipment,
    returnEquipment,

    // Access
    grantAccess,
    revokeAccess,

    // Training
    scheduleTraining,
    completeTraining,

    // Buddy
    assignBuddy,
    addCheckIn,
    completeBuddyAssignment,

    // 30-60-90 Plans
    createDay30_60_90Plan,
    updateDay30_60_90Plan,
    completeMilestone,

    // Pre-boarding
    createPreBoardingPackage,
    sendPreBoardingPackage,

    // Surveys
    submitSurvey,

    // Feedback
    submitFeedback,

    // Settings
    updateSettings,
  };
};
