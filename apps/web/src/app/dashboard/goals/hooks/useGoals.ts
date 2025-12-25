// Goal Management Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type {
  Goal,
  KeyResult,
  GoalCheckIn,
  GoalCycle,
  GoalTemplate,
  GoalAlignment,
  GoalReview,
  GoalAnalytics,
  GoalSettings
} from '../types';
import {
  GoalService,
  GoalCheckInService,
  GoalCycleService,
  GoalTemplateService,
  GoalAlignmentService,
  GoalReviewService,
  GoalAnalyticsService,
  GoalSettingsService
} from '../services';
import { goalData } from '../data';
import { useToast } from '../../components/Toast';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cycles, setCycles] = useState<GoalCycle[]>([]);
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [alignments, setAlignments] = useState<GoalAlignment[]>([]);
  const [reviews, setReviews] = useState<GoalReview[]>([]);
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);
  const [settings, setSettings] = useState<GoalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  // Goal operations
  const loadGoals = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await GoalService.getGoals(filters);
      setGoals(data);
    } catch {
      toast.error(`Failed to load goals: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createGoal = useCallback(async (goal: Goal) => {
    try {
      setIsSaving(true);
      const created = await GoalService.createGoal(goal);
      setGoals(prev => [...prev, created]);
      toast.success('Goal created successfully');
      return created;
    } catch {
      toast.error(`Failed to create goal: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      setIsSaving(true);
      const updated = await GoalService.updateGoal(id, updates);
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
      toast.success('Goal updated successfully');
      return updated;
    } catch {
      toast.error(`Failed to update goal: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await GoalService.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted successfully');
    } catch {
      toast.error(`Failed to delete goal: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const completeGoal = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      const completed = await GoalService.completeGoal(id);
      setGoals(prev => prev.map(g => g.id === id ? completed : g));
      toast.success('Goal marked as completed!');
      return completed;
    } catch {
      toast.error(`Failed to complete goal: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Key result operations
  const addKeyResult = useCallback(async (goalId: string, keyResult: KeyResult) => {
    try {
      setIsSaving(true);
      const updated = await GoalService.addKeyResult(goalId, keyResult);
      setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
      toast.success('Key result added');
      return updated;
    } catch {
      toast.error(`Failed to add key result: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateKeyResult = useCallback(async (goalId: string, keyResultId: string, updates: Partial<KeyResult>) => {
    try {
      setIsSaving(true);
      const updated = await GoalService.updateKeyResult(goalId, keyResultId, updates);
      setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
      toast.success('Key result updated');
      return updated;
    } catch {
      toast.error(`Failed to update key result: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateKeyResultValue = useCallback(async (goalId: string, keyResultId: string, newValue: number, comment?: string, updatedBy?: string) => {
    try {
      setIsSaving(true);
      const updated = await GoalService.updateKeyResultValue(goalId, keyResultId, newValue, comment, updatedBy);
      setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
      toast.success('Progress updated successfully');
      return updated;
    } catch {
      toast.error(`Failed to update progress: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Check-in operations
  const createCheckIn = useCallback(async (checkIn: GoalCheckIn) => {
    try {
      setIsSaving(true);
      const created = await GoalCheckInService.createCheckIn(checkIn);

      // Reload the goal to get updated data
      const goal = await GoalService.getGoalById(checkIn.goalId);
      if (goal) {
        setGoals(prev => prev.map(g => g.id === checkIn.goalId ? goal : g));
      }

      toast.success('Check-in submitted successfully');
      return created;
    } catch {
      toast.error(`Failed to submit check-in: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const addCheckInFeedback = useCallback(async (checkInId: string, feedback: any) => {
    try {
      setIsSaving(true);
      const updated = await GoalCheckInService.addFeedback(checkInId, feedback);
      toast.success('Feedback added successfully');
      return updated;
    } catch {
      toast.error(`Failed to add feedback: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Cycle operations
  const loadCycles = useCallback(async (filters?: any) => {
    try {
      const data = await GoalCycleService.getCycles(filters);
      setCycles(data);
    } catch {
      toast.error(`Failed to load cycles: ${(err as Error).message}`);
    }
  }, [toast]);

  const createCycle = useCallback(async (cycle: GoalCycle) => {
    try {
      setIsSaving(true);
      const created = await GoalCycleService.createCycle(cycle);
      setCycles(prev => [...prev, created]);
      toast.success('Cycle created successfully');
      return created;
    } catch {
      toast.error(`Failed to create cycle: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateCycle = useCallback(async (id: string, updates: Partial<GoalCycle>) => {
    try {
      setIsSaving(true);
      const updated = await GoalCycleService.updateCycle(id, updates);
      setCycles(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Cycle updated successfully');
      return updated;
    } catch {
      toast.error(`Failed to update cycle: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteCycle = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await GoalCycleService.deleteCycle(id);
      setCycles(prev => prev.filter(c => c.id !== id));
      toast.success('Cycle deleted successfully');
    } catch {
      toast.error(`Failed to delete cycle: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const activateCycle = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      const activated = await GoalCycleService.activateCycle(id);

      // Reload all cycles to update status
      await loadCycles();

      toast.success('Cycle activated successfully');
      return activated;
    } catch {
      toast.error(`Failed to activate cycle: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast, loadCycles]);

  // Template operations
  const loadTemplates = useCallback(async (filters?: any) => {
    try {
      const data = await GoalTemplateService.getTemplates(filters);
      setTemplates(data);
    } catch {
      toast.error(`Failed to load templates: ${(err as Error).message}`);
    }
  }, [toast]);

  const createTemplate = useCallback(async (template: GoalTemplate) => {
    try {
      setIsSaving(true);
      const created = await GoalTemplateService.createTemplate(template);
      setTemplates(prev => [...prev, created]);
      toast.success('Template created successfully');
      return created;
    } catch {
      toast.error(`Failed to create template: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<GoalTemplate>) => {
    try {
      setIsSaving(true);
      const updated = await GoalTemplateService.updateTemplate(id, updates);
      setTemplates(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Template updated successfully');
      return updated;
    } catch {
      toast.error(`Failed to update template: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await GoalTemplateService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch {
      toast.error(`Failed to delete template: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Alignment operations
  const loadAlignments = useCallback(async (filters?: any) => {
    try {
      const data = await GoalAlignmentService.getAlignments(filters);
      setAlignments(data);
    } catch {
      toast.error(`Failed to load alignments: ${(err as Error).message}`);
    }
  }, [toast]);

  const createAlignment = useCallback(async (alignment: GoalAlignment) => {
    try {
      setIsSaving(true);
      const created = await GoalAlignmentService.createAlignment(alignment);
      setAlignments(prev => [...prev, created]);
      toast.success('Goals aligned successfully');
      return created;
    } catch {
      toast.error(`Failed to create alignment: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteAlignment = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await GoalAlignmentService.deleteAlignment(id);
      setAlignments(prev => prev.filter(a => a.id !== id));
      toast.success('Alignment removed');
    } catch {
      toast.error(`Failed to delete alignment: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const cascadeGoal = useCallback(async (parentGoalId: string, childGoal: Partial<Goal>) => {
    try {
      setIsSaving(true);
      const cascaded = await GoalAlignmentService.cascadeGoal(parentGoalId, childGoal);
      setGoals(prev => [...prev, cascaded]);
      toast.success('Goal cascaded successfully');
      return cascaded;
    } catch {
      toast.error(`Failed to cascade goal: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Review operations
  const loadReviews = useCallback(async (filters?: any) => {
    try {
      const data = await GoalReviewService.getReviews(filters);
      setReviews(data);
    } catch {
      toast.error(`Failed to load reviews: ${(err as Error).message}`);
    }
  }, [toast]);

  const createReview = useCallback(async (review: GoalReview) => {
    try {
      setIsSaving(true);
      const created = await GoalReviewService.createReview(review);
      setReviews(prev => [...prev, created]);
      toast.success('Review submitted successfully');
      return created;
    } catch {
      toast.error(`Failed to create review: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const acknowledgeReview = useCallback(async (id: string, acknowledgedBy: string) => {
    try {
      setIsSaving(true);
      const acknowledged = await GoalReviewService.acknowledgeReview(id, acknowledgedBy);
      setReviews(prev => prev.map(r => r.id === id ? acknowledged : r));
      toast.success('Review acknowledged');
      return acknowledged;
    } catch {
      toast.error(`Failed to acknowledge review: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const data = await GoalAnalyticsService.getAnalytics();
      setAnalytics(data);
    } catch {
      toast.error(`Failed to load analytics: ${(err as Error).message}`);
    }
  }, [toast]);

  // Settings
  const loadSettings = useCallback(async () => {
    try {
      const data = await GoalSettingsService.getSettings();
      setSettings(data);
    } catch {
      toast.error(`Failed to load settings: ${(err as Error).message}`);
    }
  }, [toast]);

  const updateSettings = useCallback(async (updates: Partial<GoalSettings>) => {
    try {
      setIsSaving(true);
      const updated = await GoalSettingsService.updateSettings(updates);
      setSettings(updated);
      toast.success('Settings updated successfully');
      return updated;
    } catch {
      toast.error(`Failed to update settings: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Initialize sample data
  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);

      // Create cycles
      for (const cycle of goalData.cycles) {
        await GoalCycleService.createCycle(cycle);
      }

      // Create templates
      for (const template of goalData.templates) {
        await GoalTemplateService.createTemplate(template);
      }

      // Create goals
      for (const goal of goalData.goals) {
        await GoalService.createGoal(goal);
      }

      // Create alignments
      for (const alignment of goalData.alignments) {
        await GoalAlignmentService.createAlignment(alignment);
      }

      await loadGoals();
      await loadCycles();
      await loadTemplates();
      await loadAlignments();
      await loadAnalytics();

      toast.success('Sample data initialized');
    } catch {
      toast.error(`Failed to initialize data: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [loadGoals, loadCycles, loadTemplates, loadAlignments, loadAnalytics, toast]);

  useEffect(() => {
    loadGoals();
    loadCycles();
    loadTemplates();
    loadAlignments();
    loadReviews();
    loadAnalytics();
    loadSettings();
  }, []);

  return {
    // State
    goals,
    cycles,
    templates,
    alignments,
    reviews,
    analytics,
    settings,
    isLoading,
    isSaving,
    error,

    // Goal operations
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,

    // Key result operations
    addKeyResult,
    updateKeyResult,
    updateKeyResultValue,

    // Check-in operations
    createCheckIn,
    addCheckInFeedback,

    // Cycle operations
    loadCycles,
    createCycle,
    updateCycle,
    deleteCycle,
    activateCycle,

    // Template operations
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Alignment operations
    loadAlignments,
    createAlignment,
    deleteAlignment,
    cascadeGoal,

    // Review operations
    loadReviews,
    createReview,
    acknowledgeReview,

    // Analytics & Settings
    loadAnalytics,
    loadSettings,
    updateSettings,
    initializeSampleData
  };
};
