/**
 * usePerformance Hook Tests - Production Ready
 * Comprehensive test coverage for performance review management business logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePerformance } from './usePerformance';
import type {
  PerformanceReview,
  ReviewCycle,
  Goal,
  Competency,
  DevelopmentPlan,
  PerformanceStats,
} from '../types';

// ============================================================================
// MOCKS
// ============================================================================

// Mock all performance services
vi.mock('../services', () => ({
  PerformanceReviewService: {
    getReviews: vi.fn(() => Promise.resolve([])),
    createReview: vi.fn((data) => Promise.resolve(data)),
    updateReview: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    submitReview: vi.fn((id) => Promise.resolve({ id, status: 'submitted' })),
    approveReview: vi.fn((id) => Promise.resolve({ id, status: 'approved' })),
  },
  ReviewCycleService: {
    getCycles: vi.fn(() => Promise.resolve([])),
    createCycle: vi.fn((data) => Promise.resolve(data)),
    updateCycle: vi.fn((id, data) => Promise.resolve({ id, ...data })),
  },
  GoalService: {
    getGoals: vi.fn(() => Promise.resolve([])),
    createGoal: vi.fn((data) => Promise.resolve(data)),
    updateGoal: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    deleteGoal: vi.fn(() => Promise.resolve()),
  },
  CompetencyService: {
    getCompetencies: vi.fn(() => Promise.resolve([])),
    createCompetency: vi.fn((data) => Promise.resolve(data)),
    updateCompetency: vi.fn((id, data) => Promise.resolve({ id, ...data })),
  },
  DevelopmentPlanService: {
    getPlans: vi.fn(() => Promise.resolve([])),
    createPlan: vi.fn((data) => Promise.resolve(data)),
    updatePlan: vi.fn((id, data) => Promise.resolve({ id, ...data })),
  },
  PerformanceAnalyticsService: {
    getStats: vi.fn(() => Promise.resolve(null)),
  },
}));

// Mock sample data generators
vi.mock('../data', () => ({
  generateSampleReviews: vi.fn(() => []),
  generateSampleCycles: vi.fn(() => []),
  generateSampleGoals: vi.fn(() => []),
  generateSampleCompetencies: vi.fn(() => []),
  generateSamplePlans: vi.fn(() => []),
}));

// Mock useToast hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('../hooks/useToast', () => ({
  useToast: () => mockToast,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockPerformanceReview: PerformanceReview = {
  id: 'rev-001',
  employeeId: 'emp-001',
  employeeName: 'John Employee',
  reviewerId: 'mgr-001',
  reviewerName: 'Jane Manager',
  cycleId: 'cycle-001',
  cycleName: 'Q1 2024 Review',
  reviewPeriodStart: '2024-01-01',
  reviewPeriodEnd: '2024-03-31',
  status: 'draft',
  overallRating: 0,
  competencyRatings: [],
  goalAchievements: [],
  strengths: [],
  areasForImprovement: [],
  developmentAreas: [],
  reviewerComments: '',
  employeeComments: '',
  createdDate: new Date().toISOString(),
  createdBy: 'mgr-001',
};

const mockReviewCycle: ReviewCycle = {
  id: 'cycle-001',
  name: 'Q1 2024 Review',
  description: 'Quarterly performance review for Q1 2024',
  startDate: '2024-04-01',
  endDate: '2024-04-30',
  reviewPeriodStart: '2024-01-01',
  reviewPeriodEnd: '2024-03-31',
  status: 'active',
  createdDate: new Date().toISOString(),
  createdBy: 'admin-001',
};

const mockGoal: Goal = {
  id: 'goal-001',
  employeeId: 'emp-001',
  employeeName: 'John Employee',
  title: 'Improve code quality',
  description: 'Reduce bug count by 30%',
  category: 'technical',
  priority: 'high',
  targetDate: '2024-06-30',
  progress: 50,
  status: 'in-progress',
  createdDate: new Date().toISOString(),
  createdBy: 'emp-001',
};

const mockCompetency: Competency = {
  id: 'comp-001',
  name: 'Technical Skills',
  description: 'Proficiency in technical areas',
  category: 'technical',
  level: 'intermediate',
  weight: 0.3,
  isActive: true,
  createdDate: new Date().toISOString(),
};

const mockDevelopmentPlan: DevelopmentPlan = {
  id: 'plan-001',
  employeeId: 'emp-001',
  employeeName: 'John Employee',
  title: 'Leadership Development',
  description: 'Develop leadership skills for team lead role',
  objectives: ['Complete leadership training', 'Lead a project team'],
  targetCompetencies: ['Leadership', 'Communication'],
  activities: [
    {
      id: 'act-001',
      title: 'Leadership Training Course',
      description: 'Complete online leadership course',
      targetDate: '2024-06-30',
      status: 'in-progress',
    },
  ],
  startDate: '2024-04-01',
  endDate: '2024-12-31',
  status: 'active',
  createdDate: new Date().toISOString(),
  createdBy: 'mgr-001',
};

const mockPerformanceStats: PerformanceStats = {
  totalReviews: 100,
  completedReviews: 75,
  pendingReviews: 25,
  averageRating: 4.2,
  ratingDistribution: {
    1: 2,
    2: 5,
    3: 20,
    4: 45,
    5: 28,
  },
  totalGoals: 200,
  completedGoals: 150,
  inProgressGoals: 40,
  notStartedGoals: 10,
  goalCompletionRate: 75,
  activeDevelopmentPlans: 30,
};

// ============================================================================
// TESTS
// ============================================================================

describe('usePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  describe('Initialization', () => {
    it('initializes with loading state', () => {
      const { result } = renderHook(() => usePerformance());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.reviews).toEqual([]);
      expect(result.current.cycles).toEqual([]);
      expect(result.current.goals).toEqual([]);
      expect(result.current.competencies).toEqual([]);
      expect(result.current.devPlans).toEqual([]);
    });

    it('loads all performance data on mount', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([mockPerformanceReview]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(PerformanceReviewService.getReviews).toHaveBeenCalled();
      expect(result.current.reviews).toEqual([mockPerformanceReview]);
    });

    it('initializes with sample data when no data exists', async () => {
      const { PerformanceReviewService } = await import('../services');
      const { generateSampleReviews } = await import('../data');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([]);
      vi.mocked(generateSampleReviews).mockReturnValue([mockPerformanceReview]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(generateSampleReviews).toHaveBeenCalled();
    });

    it('handles initialization errors gracefully', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockRejectedValue(
        new Error('Failed to load data')
      );

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // PERFORMANCE REVIEW OPERATIONS
  // ==========================================================================

  describe('Performance Review Operations', () => {
    it('creates review successfully', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([]);
      vi.mocked(PerformanceReviewService.createReview).mockResolvedValue(mockPerformanceReview);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createReview(mockPerformanceReview);
      });

      expect(PerformanceReviewService.createReview).toHaveBeenCalledWith(mockPerformanceReview);
      expect(result.current.reviews).toContainEqual(mockPerformanceReview);
      expect(mockToast.success).toHaveBeenCalledWith('Performance review created successfully!');
    });

    it('updates review successfully', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([mockPerformanceReview]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { overallRating: 4 };

      await act(async () => {
        await result.current.updateReview('rev-001', updates);
      });

      expect(PerformanceReviewService.updateReview).toHaveBeenCalledWith('rev-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Performance review updated successfully!');
    });

    it('submits review successfully', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([mockPerformanceReview]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.submitReview('rev-001');
      });

      expect(PerformanceReviewService.submitReview).toHaveBeenCalledWith('rev-001');
      expect(mockToast.success).toHaveBeenCalledWith('Performance review submitted successfully!');
    });

    it('handles review creation errors', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([]);
      vi.mocked(PerformanceReviewService.createReview).mockRejectedValue(
        new Error('Creation failed')
      );

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createReview(mockPerformanceReview);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  // ==========================================================================
  // REVIEW CYCLE OPERATIONS
  // ==========================================================================

  describe('Review Cycle Operations', () => {
    it('creates cycle successfully', async () => {
      const { ReviewCycleService } = await import('../services');

      vi.mocked(ReviewCycleService.getCycles).mockResolvedValue([]);
      vi.mocked(ReviewCycleService.createCycle).mockResolvedValue(mockReviewCycle);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createCycle(mockReviewCycle);
      });

      expect(ReviewCycleService.createCycle).toHaveBeenCalledWith(mockReviewCycle);
      expect(result.current.cycles).toContainEqual(mockReviewCycle);
      expect(mockToast.success).toHaveBeenCalledWith('Review cycle created successfully!');
    });

    it('updates cycle successfully', async () => {
      const { ReviewCycleService } = await import('../services');

      vi.mocked(ReviewCycleService.getCycles).mockResolvedValue([mockReviewCycle]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { status: 'completed' as const };

      await act(async () => {
        await result.current.updateCycle('cycle-001', updates);
      });

      expect(ReviewCycleService.updateCycle).toHaveBeenCalledWith('cycle-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Review cycle updated successfully!');
    });
  });

  // ==========================================================================
  // GOAL OPERATIONS
  // ==========================================================================

  describe('Goal Operations', () => {
    it('creates goal successfully', async () => {
      const { GoalService } = await import('../services');

      vi.mocked(GoalService.getGoals).mockResolvedValue([]);
      vi.mocked(GoalService.createGoal).mockResolvedValue(mockGoal);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createGoal(mockGoal);
      });

      expect(GoalService.createGoal).toHaveBeenCalledWith(mockGoal);
      expect(result.current.goals).toContainEqual(mockGoal);
      expect(mockToast.success).toHaveBeenCalledWith('Goal created successfully!');
    });

    it('updates goal successfully', async () => {
      const { GoalService } = await import('../services');

      vi.mocked(GoalService.getGoals).mockResolvedValue([mockGoal]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { progress: 75 };

      await act(async () => {
        await result.current.updateGoal('goal-001', updates);
      });

      expect(GoalService.updateGoal).toHaveBeenCalledWith('goal-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Goal updated successfully!');
    });

    it('deletes goal successfully', async () => {
      const { GoalService } = await import('../services');

      vi.mocked(GoalService.getGoals).mockResolvedValue([mockGoal]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteGoal('goal-001');
      });

      expect(GoalService.deleteGoal).toHaveBeenCalledWith('goal-001');
      expect(result.current.goals).not.toContainEqual(mockGoal);
      expect(mockToast.success).toHaveBeenCalledWith('Goal deleted successfully!');
    });

    it('handles goal creation errors', async () => {
      const { GoalService } = await import('../services');

      vi.mocked(GoalService.getGoals).mockResolvedValue([]);
      vi.mocked(GoalService.createGoal).mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createGoal(mockGoal);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  // ==========================================================================
  // COMPETENCY OPERATIONS
  // ==========================================================================

  describe('Competency Operations', () => {
    it('creates competency successfully', async () => {
      const { CompetencyService } = await import('../services');

      vi.mocked(CompetencyService.getCompetencies).mockResolvedValue([]);
      vi.mocked(CompetencyService.createCompetency).mockResolvedValue(mockCompetency);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createCompetency(mockCompetency);
      });

      expect(CompetencyService.createCompetency).toHaveBeenCalledWith(mockCompetency);
      expect(result.current.competencies).toContainEqual(mockCompetency);
      expect(mockToast.success).toHaveBeenCalledWith('Competency created successfully!');
    });

    it('updates competency successfully', async () => {
      const { CompetencyService } = await import('../services');

      vi.mocked(CompetencyService.getCompetencies).mockResolvedValue([mockCompetency]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { weight: 0.4 };

      await act(async () => {
        await result.current.updateCompetency('comp-001', updates);
      });

      expect(CompetencyService.updateCompetency).toHaveBeenCalledWith('comp-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Competency updated successfully!');
    });
  });

  // ==========================================================================
  // DEVELOPMENT PLAN OPERATIONS
  // ==========================================================================

  describe('Development Plan Operations', () => {
    it('creates development plan successfully', async () => {
      const { DevelopmentPlanService } = await import('../services');

      vi.mocked(DevelopmentPlanService.getPlans).mockResolvedValue([]);
      vi.mocked(DevelopmentPlanService.createPlan).mockResolvedValue(mockDevelopmentPlan);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createDevelopmentPlan(mockDevelopmentPlan);
      });

      expect(DevelopmentPlanService.createPlan).toHaveBeenCalledWith(mockDevelopmentPlan);
      expect(result.current.devPlans).toContainEqual(mockDevelopmentPlan);
      expect(mockToast.success).toHaveBeenCalledWith('Development plan created successfully!');
    });

    it('updates development plan successfully', async () => {
      const { DevelopmentPlanService } = await import('../services');

      vi.mocked(DevelopmentPlanService.getPlans).mockResolvedValue([mockDevelopmentPlan]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { status: 'completed' as const };

      await act(async () => {
        await result.current.updateDevelopmentPlan('plan-001', updates);
      });

      expect(DevelopmentPlanService.updatePlan).toHaveBeenCalledWith('plan-001', updates);
      expect(mockToast.success).toHaveBeenCalledWith('Development plan updated successfully!');
    });

    it('handles development plan creation errors', async () => {
      const { DevelopmentPlanService } = await import('../services');

      vi.mocked(DevelopmentPlanService.getPlans).mockResolvedValue([]);
      vi.mocked(DevelopmentPlanService.createPlan).mockRejectedValue(
        new Error('Creation failed')
      );

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createDevelopmentPlan(mockDevelopmentPlan);
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  // ==========================================================================
  // ANALYTICS OPERATIONS
  // ==========================================================================

  describe('Analytics Operations', () => {
    it('refreshes stats successfully', async () => {
      const { PerformanceAnalyticsService } = await import('../services');

      vi.mocked(PerformanceAnalyticsService.getStats).mockResolvedValue(mockPerformanceStats);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(PerformanceAnalyticsService.getStats).toHaveBeenCalled();
      expect(result.current.stats).toEqual(mockPerformanceStats);
    });

    it('handles stats refresh errors', async () => {
      const { PerformanceAnalyticsService } = await import('../services');

      vi.mocked(PerformanceAnalyticsService.getStats).mockRejectedValue(
        new Error('Stats unavailable')
      );

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.refreshStats();
        } catch (error) {
          // Expected error
        }
      });

      expect(mockToast.error).toHaveBeenCalledWith('Stats unavailable');
    });
  });

  // ==========================================================================
  // LOADING STATES
  // ==========================================================================

  describe('Loading States', () => {
    it('sets isSaving during create operations', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([]);
      vi.mocked(PerformanceReviewService.createReview).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockPerformanceReview), 100);
          })
      );

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.createReview(mockPerformanceReview);
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it('resets isSaving after save completes', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([]);
      vi.mocked(PerformanceReviewService.createReview).mockResolvedValue(mockPerformanceReview);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createReview(mockPerformanceReview);
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles empty service responses', async () => {
      const {
        PerformanceReviewService,
        ReviewCycleService,
        GoalService,
        CompetencyService,
        DevelopmentPlanService,
      } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([]);
      vi.mocked(ReviewCycleService.getCycles).mockResolvedValue([]);
      vi.mocked(GoalService.getGoals).mockResolvedValue([]);
      vi.mocked(CompetencyService.getCompetencies).mockResolvedValue([]);
      vi.mocked(DevelopmentPlanService.getPlans).mockResolvedValue([]);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.reviews).toEqual([]);
      expect(result.current.cycles).toEqual([]);
      expect(result.current.goals).toEqual([]);
      expect(result.current.competencies).toEqual([]);
      expect(result.current.devPlans).toEqual([]);
    });

    it('handles concurrent operations', async () => {
      const { GoalService } = await import('../services');

      vi.mocked(GoalService.getGoals).mockResolvedValue([]);
      vi.mocked(GoalService.createGoal).mockResolvedValue(mockGoal);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.createGoal(mockGoal),
          result.current.createGoal({ ...mockGoal, id: 'goal-002' }),
        ]);
      });

      expect(GoalService.createGoal).toHaveBeenCalledTimes(2);
    });

    it('maintains data integrity after failed operations', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([mockPerformanceReview]);
      vi.mocked(PerformanceReviewService.updateReview).mockRejectedValue(
        new Error('Update failed')
      );

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalReviews = result.current.reviews;

      await act(async () => {
        try {
          await result.current.updateReview('rev-001', { overallRating: 5 });
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.reviews).toEqual(originalReviews);
    });

    it('handles null stats gracefully', async () => {
      const { PerformanceAnalyticsService } = await import('../services');

      vi.mocked(PerformanceAnalyticsService.getStats).mockResolvedValue(null);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshStats();
      });

      expect(result.current.stats).toBeNull();
    });
  });

  // ==========================================================================
  // INTEGRATION SCENARIOS
  // ==========================================================================

  describe('Integration Scenarios', () => {
    it('completes full review workflow: create -> update -> submit', async () => {
      const { PerformanceReviewService } = await import('../services');

      vi.mocked(PerformanceReviewService.getReviews).mockResolvedValue([]);
      vi.mocked(PerformanceReviewService.createReview).mockResolvedValue(mockPerformanceReview);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create review
      await act(async () => {
        await result.current.createReview(mockPerformanceReview);
      });

      expect(result.current.reviews).toContainEqual(mockPerformanceReview);

      // Update review
      await act(async () => {
        await result.current.updateReview('rev-001', { overallRating: 4 });
      });

      expect(PerformanceReviewService.updateReview).toHaveBeenCalledWith('rev-001', {
        overallRating: 4,
      });

      // Submit review
      await act(async () => {
        await result.current.submitReview('rev-001');
      });

      expect(PerformanceReviewService.submitReview).toHaveBeenCalledWith('rev-001');
      expect(mockToast.success).toHaveBeenCalledTimes(3);
    });

    it('manages goal lifecycle: create -> update progress -> complete', async () => {
      const { GoalService } = await import('../services');

      vi.mocked(GoalService.getGoals).mockResolvedValue([]);
      vi.mocked(GoalService.createGoal).mockResolvedValue(mockGoal);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create goal
      await act(async () => {
        await result.current.createGoal(mockGoal);
      });

      expect(result.current.goals).toContainEqual(mockGoal);

      // Update progress
      await act(async () => {
        await result.current.updateGoal('goal-001', { progress: 75 });
      });

      expect(GoalService.updateGoal).toHaveBeenCalledWith('goal-001', { progress: 75 });

      // Complete goal
      await act(async () => {
        await result.current.updateGoal('goal-001', {
          progress: 100,
          status: 'completed' as const,
        });
      });

      expect(GoalService.updateGoal).toHaveBeenCalledWith('goal-001', {
        progress: 100,
        status: 'completed',
      });
    });

    it('creates development plan with competencies and goals', async () => {
      const { DevelopmentPlanService, CompetencyService, GoalService } = await import(
        '../services'
      );

      vi.mocked(DevelopmentPlanService.getPlans).mockResolvedValue([]);
      vi.mocked(CompetencyService.getCompetencies).mockResolvedValue([mockCompetency]);
      vi.mocked(GoalService.getGoals).mockResolvedValue([mockGoal]);
      vi.mocked(DevelopmentPlanService.createPlan).mockResolvedValue(mockDevelopmentPlan);

      const { result } = renderHook(() => usePerformance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.competencies).toContainEqual(mockCompetency);
      expect(result.current.goals).toContainEqual(mockGoal);

      await act(async () => {
        await result.current.createDevelopmentPlan(mockDevelopmentPlan);
      });

      expect(DevelopmentPlanService.createPlan).toHaveBeenCalledWith(mockDevelopmentPlan);
      expect(result.current.devPlans).toContainEqual(mockDevelopmentPlan);
    });
  });
});
