/**
 * Performance Review Module - Service Layer
 * API-ready service layer following the proven pattern
 */

import { APIClient } from '@/lib/api-client';
import type {
  PerformanceReview,
  ReviewCycle,
  Goal,
  Competency,
  DevelopmentPlan,
  CalibrationSession,
  PerformanceStats,
  Feedback360,
} from './types';

export class PerformanceReviewService {
  private static endpoint = '/performance/reviews';

  static async getReviews(filters?: {
    employeeId?: string;
    cycleId?: string;
  }): Promise<PerformanceReview[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<PerformanceReview>(response, 'reviews');
    } catch (error: any) {
      return [];
    }
  }

  static async createReview(review: PerformanceReview): Promise<PerformanceReview> {
    const response = await APIClient.post<{ review: PerformanceReview }>(this.endpoint, review);
    return response.review;
  }

  static async updateReview(
    id: string,
    updates: Partial<PerformanceReview>
  ): Promise<PerformanceReview> {
    const response = await APIClient.put<{ review: PerformanceReview }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.review;
  }

  static async submitReview(id: string): Promise<PerformanceReview> {
    const response = await APIClient.post<{ review: PerformanceReview }>(
      `${this.endpoint}/${id}/submit`,
      {}
    );
    return response.review;
  }
}

export class ReviewCycleService {
  private static endpoint = '/performance/cycles';

  static async getCycles(filters?: { isActive?: boolean }): Promise<ReviewCycle[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<ReviewCycle>(response, 'cycles');
    } catch (error: any) {
      return [];
    }
  }

  static async createCycle(cycle: ReviewCycle): Promise<ReviewCycle> {
    const response = await APIClient.post<{ cycle: ReviewCycle }>(this.endpoint, cycle);
    return response.cycle;
  }
}

export class GoalService {
  private static endpoint = '/performance/goals';

  static async getGoals(filters?: { employeeId?: string }): Promise<Goal[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<Goal>(response, 'goals');
    } catch (error: any) {
      return [];
    }
  }

  static async createGoal(goal: Goal): Promise<Goal> {
    const response = await APIClient.post<{ goal: Goal }>(this.endpoint, goal);
    return response.goal;
  }

  static async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const response = await APIClient.put<{ goal: Goal }>(`${this.endpoint}/${id}`, updates);
    return response.goal;
  }
}

export class CompetencyService {
  private static endpoint = '/performance/competencies';

  static async getCompetencies(): Promise<Competency[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<Competency>(response, 'competencies');
    } catch (error: any) {
      return [];
    }
  }

  static async createCompetency(competency: Competency): Promise<Competency> {
    const response = await APIClient.post<{ competency: Competency }>(this.endpoint, competency);
    return response.competency;
  }
}

export class DevelopmentPlanService {
  private static endpoint = '/performance/development-plans';

  static async getPlans(filters?: { employeeId?: string }): Promise<DevelopmentPlan[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<DevelopmentPlan>(response, 'plans');
    } catch (error: any) {
      return [];
    }
  }

  static async createPlan(plan: DevelopmentPlan): Promise<DevelopmentPlan> {
    const response = await APIClient.post<{ plan: DevelopmentPlan }>(this.endpoint, plan);
    return response.plan;
  }
}

export class CalibrationService {
  private static endpoint = '/performance/calibrations';

  static async getSessions(filters?: { cycleId?: string }): Promise<CalibrationSession[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<CalibrationSession>(response, 'sessions');
    } catch (error: any) {
      return [];
    }
  }

  static async createSession(session: CalibrationSession): Promise<CalibrationSession> {
    const response = await APIClient.post<{ session: CalibrationSession }>(this.endpoint, session);
    return response.session;
  }

  /**
   * Create a raw calibration session (used by the 9-box grid, which persists a
   * `sessionName` + `adjustments` payload that is looser than the strict
   * CalibrationSession type). Returns the created row.
   */
  static async createRaw(payload: Record<string, unknown>): Promise<any> {
    const response = await APIClient.post<{ session: any }>(this.endpoint, payload);
    return response.session;
  }

  /**
   * Update an existing calibration session (e.g. persist adjustments/status).
   */
  static async updateSession(id: string, updates: Record<string, unknown>): Promise<any> {
    const response = await APIClient.put<{ session: any }>(this.endpoint, { id, ...updates });
    return response.session;
  }
}

export class PerformanceAnalyticsService {
  private static endpoint = '/performance/analytics';

  static async getStats(): Promise<PerformanceStats> {
    try {
      const response = await APIClient.get<{ stats: PerformanceStats }>(this.endpoint);
      return response.stats;
    } catch (error: any) {
      return {
        totalReviews: 0,
        completedReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        goalAchievementRate: 0,
      };
    }
  }
}

export class OneOnOneMeetingService {
  private static endpoint = '/performance/one-on-one';

  static async getMeetings(filters?: {
    employeeId?: string;
    managerId?: string;
    status?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<any>(response, 'meetings');
    } catch (error: any) {
      return [];
    }
  }

  static async createMeeting(meeting: any): Promise<any> {
    const response = await APIClient.post<{ meeting: any }>(this.endpoint, meeting);
    return response.meeting;
  }

  static async updateMeeting(id: string, updates: any): Promise<any> {
    const response = await APIClient.put<{ meeting: any }>(this.endpoint, { id, ...updates });
    return response.meeting;
  }

  static async deleteMeeting(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}?id=${id}`);
  }
}
