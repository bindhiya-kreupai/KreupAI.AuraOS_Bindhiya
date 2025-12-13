/**
 * Performance Review Module - Service Layer
 * API-ready service layer following the proven pattern
 */

import type {
    PerformanceReview, ReviewCycle, Goal, Competency, DevelopmentPlan,
    CalibrationSession, PerformanceStats, Feedback360
} from './types';

const STORAGE_KEYS = {
    REVIEWS: 'performance_reviews',
    CYCLES: 'performance_cycles',
    GOALS: 'performance_goals',
    COMPETENCIES: 'performance_competencies',
    DEV_PLANS: 'performance_dev_plans',
    CALIBRATIONS: 'performance_calibrations',
} as const;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class StorageService {
    static save<T>(key: string, data: T): void {
        if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(data));
    }
    static load<T>(key: string): T | null {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        return null;
    }
}

export class PerformanceReviewService {
    static async getReviews(filters?: { employeeId?: string; cycleId?: string }): Promise<PerformanceReview[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<PerformanceReview[]>(STORAGE_KEYS.REVIEWS);
        let reviews = stored || [];
        if (filters?.employeeId) reviews = reviews.filter(r => r.employeeId === filters.employeeId);
        if (filters?.cycleId) reviews = reviews.filter(r => r.reviewCycleId === filters.cycleId);
        return reviews;
    }

    static async createReview(review: PerformanceReview): Promise<PerformanceReview> {
        await delay(500);
        // TODO: Replace with real API call
        const reviews = await this.getReviews();
        reviews.push(review);
        StorageService.save(STORAGE_KEYS.REVIEWS, reviews);
        return review;
    }

    static async updateReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview> {
        await delay(500);
        // TODO: Replace with real API call
        const reviews = await this.getReviews();
        const index = reviews.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Review not found');
        reviews[index] = { ...reviews[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.REVIEWS, reviews);
        return reviews[index];
    }

    static async submitReview(id: string): Promise<PerformanceReview> {
        return this.updateReview(id, { status: 'completed', submittedDate: new Date().toISOString() });
    }
}

export class ReviewCycleService {
    static async getCycles(filters?: { isActive?: boolean }): Promise<ReviewCycle[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<ReviewCycle[]>(STORAGE_KEYS.CYCLES);
        let cycles = stored || [];
        if (filters?.isActive !== undefined) cycles = cycles.filter(c => c.isActive === filters.isActive);
        return cycles;
    }

    static async createCycle(cycle: ReviewCycle): Promise<ReviewCycle> {
        await delay(500);
        // TODO: Replace with real API call
        const cycles = await this.getCycles();
        cycles.push(cycle);
        StorageService.save(STORAGE_KEYS.CYCLES, cycles);
        return cycle;
    }
}

export class GoalService {
    static async getGoals(filters?: { employeeId?: string }): Promise<Goal[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<Goal[]>(STORAGE_KEYS.GOALS);
        let goals = stored || [];
        if (filters?.employeeId) goals = goals.filter(g => g.employeeId === filters.employeeId);
        return goals;
    }

    static async createGoal(goal: Goal): Promise<Goal> {
        await delay(500);
        // TODO: Replace with real API call
        const goals = await this.getGoals();
        goals.push(goal);
        StorageService.save(STORAGE_KEYS.GOALS, goals);
        return goal;
    }

    static async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
        await delay(500);
        // TODO: Replace with real API call
        const goals = await this.getGoals();
        const index = goals.findIndex(g => g.id === id);
        if (index === -1) throw new Error('Goal not found');
        goals[index] = { ...goals[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.GOALS, goals);
        return goals[index];
    }
}

export class CompetencyService {
    static async getCompetencies(): Promise<Competency[]> {
        await delay(300);
        // TODO: Replace with real API call
        return StorageService.load<Competency[]>(STORAGE_KEYS.COMPETENCIES) || [];
    }

    static async createCompetency(competency: Competency): Promise<Competency> {
        await delay(500);
        // TODO: Replace with real API call
        const competencies = await this.getCompetencies();
        competencies.push(competency);
        StorageService.save(STORAGE_KEYS.COMPETENCIES, competencies);
        return competency;
    }
}

export class DevelopmentPlanService {
    static async getPlans(filters?: { employeeId?: string }): Promise<DevelopmentPlan[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<DevelopmentPlan[]>(STORAGE_KEYS.DEV_PLANS);
        let plans = stored || [];
        if (filters?.employeeId) plans = plans.filter(p => p.employeeId === filters.employeeId);
        return plans;
    }

    static async createPlan(plan: DevelopmentPlan): Promise<DevelopmentPlan> {
        await delay(500);
        // TODO: Replace with real API call
        const plans = await this.getPlans();
        plans.push(plan);
        StorageService.save(STORAGE_KEYS.DEV_PLANS, plans);
        return plan;
    }
}

export class CalibrationService {
    static async getSessions(filters?: { cycleId?: string }): Promise<CalibrationSession[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<CalibrationSession[]>(STORAGE_KEYS.CALIBRATIONS);
        let sessions = stored || [];
        if (filters?.cycleId) sessions = sessions.filter(s => s.reviewCycleId === filters.cycleId);
        return sessions;
    }

    static async createSession(session: CalibrationSession): Promise<CalibrationSession> {
        await delay(500);
        // TODO: Replace with real API call
        const sessions = await this.getSessions();
        sessions.push(session);
        StorageService.save(STORAGE_KEYS.CALIBRATIONS, sessions);
        return session;
    }
}

export class PerformanceAnalyticsService {
    static async getStats(): Promise<PerformanceStats> {
        await delay(400);
        // TODO: Replace with real API call
        const reviews = await PerformanceReviewService.getReviews();
        const completed = reviews.filter(r => r.status === 'completed');
        const ratings = completed.map(r => r.overallRating).filter(r => r !== undefined) as number[];
        
        return {
            totalReviews: reviews.length,
            completedReviews: completed.length,
            averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            ratingDistribution: {
                1: ratings.filter(r => r === 1).length,
                2: ratings.filter(r => r === 2).length,
                3: ratings.filter(r => r === 3).length,
                4: ratings.filter(r => r === 4).length,
                5: ratings.filter(r => r === 5).length,
            },
            goalAchievementRate: 0,
        };
    }
}
