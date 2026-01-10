/**
 * Performance Review Module - Service Layer
 * API-ready service layer following the proven pattern
 */

import { APIClient } from '@/lib/api-client';
import type {
    PerformanceReview, ReviewCycle, Goal, Competency, DevelopmentPlan,
    CalibrationSession, PerformanceStats, Feedback360
} from './types';

export class PerformanceReviewService {
    private static endpoint = '/performance/reviews';

    static async getReviews(filters?: { employeeId?: string; cycleId?: string }): Promise<PerformanceReview[]> {
        try {
            const response = await APIClient.get<{ reviews?: PerformanceReview[] }>(this.endpoint, filters);
            return response.reviews || [];
        } catch (error) {
                        return [];
        }
    }

    static async createReview(review: PerformanceReview): Promise<PerformanceReview> {
        const response = await APIClient.post<{ review: PerformanceReview }>(this.endpoint, review);
        return response.review;
    }

    static async updateReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview> {
        const response = await APIClient.put<{ review: PerformanceReview }>(`${this.endpoint}/${id}`, updates);
        return response.review;
    }

    static async submitReview(id: string): Promise<PerformanceReview> {
        const response = await APIClient.post<{ review: PerformanceReview }>(`${this.endpoint}/${id}/submit`, {});
        return response.review;
    }
}

export class ReviewCycleService {
    private static endpoint = '/performance/cycles';

    static async getCycles(filters?: { isActive?: boolean }): Promise<ReviewCycle[]> {
        try {
            const response = await APIClient.get<{ cycles?: ReviewCycle[] }>(this.endpoint, filters);
            return response.cycles || [];
        } catch (error) {
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
            const response = await APIClient.get<{ goals?: Goal[] }>(this.endpoint, filters);
            return response.goals || [];
        } catch (error) {
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
            const response = await APIClient.get<{ competencies?: Competency[] }>(this.endpoint);
            return response.competencies || [];
        } catch (error) {
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
            const response = await APIClient.get<{ plans?: DevelopmentPlan[] }>(this.endpoint, filters);
            return response.plans || [];
        } catch (error) {
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
            const response = await APIClient.get<{ sessions?: CalibrationSession[] }>(this.endpoint, filters);
            return response.sessions || [];
        } catch (error) {
                        return [];
        }
    }

    static async createSession(session: CalibrationSession): Promise<CalibrationSession> {
        const response = await APIClient.post<{ session: CalibrationSession }>(this.endpoint, session);
        return response.session;
    }
}

export class PerformanceAnalyticsService {
    private static endpoint = '/performance/analytics';

    static async getStats(): Promise<PerformanceStats> {
        try {
            const response = await APIClient.get<{ stats: PerformanceStats }>(this.endpoint);
            return response.stats;
        } catch (error) {
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
