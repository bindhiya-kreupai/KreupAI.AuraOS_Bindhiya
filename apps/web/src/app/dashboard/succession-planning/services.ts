/**
 * Succession Planning Module - Service Layer - API Integrated
 *
 * API-ready service classes with APIClient integration.
 */

import { APIClient } from '@/lib/api-client';
import type {
    CriticalPosition,
    SuccessionCandidate,
    SuccessionPool,
    DevelopmentPlan,
    TalentReview,
    CareerPath,
    EmergencySuccession,
    SuccessionMetrics,
    SuccessionRiskAnalysis,
    SuccessionSettings,
    CandidateStatus,
    ReadinessLevel,
} from './types';

export class CriticalPositionService {
    private static endpoint = '/succession-planning/critical-positions';

    static async getPositions(filters?: { departmentId?: string; criticality?: string }): Promise<CriticalPosition[]> {
        try {
            const response = await APIClient.get<{ positions?: CriticalPosition[] }>(this.endpoint, filters);
            return response.positions || [];
        } catch (error) {
            console.error('Error fetching critical positions:', error);
            return [];
        }
    }

    static async createPosition(data: CriticalPosition): Promise<CriticalPosition> {
        const response = await APIClient.post<{ position: CriticalPosition }>(this.endpoint, data);
        return response.position;
    }

    static async updatePosition(id: string, updates: Partial<CriticalPosition>): Promise<CriticalPosition> {
        const response = await APIClient.put<{ position: CriticalPosition }>(`${this.endpoint}/${id}`, updates);
        return response.position;
    }

    static async deletePosition(id: string): Promise<void> {
        await APIClient.delete(`${this.endpoint}/${id}`);
    }
}

export class SuccessionCandidateService {
    private static endpoint = '/succession-planning/candidates';

    static async getCandidates(filters?: { targetPositionId?: string; readinessLevel?: ReadinessLevel; status?: CandidateStatus }): Promise<SuccessionCandidate[]> {
        try {
            const response = await APIClient.get<{ candidates?: SuccessionCandidate[] }>(this.endpoint, filters);
            return response.candidates || [];
        } catch (error) {
            console.error('Error fetching succession candidates:', error);
            return [];
        }
    }

    static async createCandidate(data: SuccessionCandidate): Promise<SuccessionCandidate> {
        const response = await APIClient.post<{ candidate: SuccessionCandidate }>(this.endpoint, data);
        return response.candidate;
    }

    static async updateCandidate(id: string, updates: Partial<SuccessionCandidate>): Promise<SuccessionCandidate> {
        const response = await APIClient.put<{ candidate: SuccessionCandidate }>(`${this.endpoint}/${id}`, updates);
        return response.candidate;
    }

    static async approveCandidate(id: string, approvedBy: string): Promise<SuccessionCandidate> {
        const response = await APIClient.post<{ candidate: SuccessionCandidate }>(`${this.endpoint}/${id}/approve`, { approvedBy });
        return response.candidate;
    }

    private static async updateSuccessionDepth(positionId: string): Promise<void> {
        try {
            await APIClient.post(`${this.endpoint}/update-succession-depth`, { positionId });
        } catch (error) {
            console.error('Error updating succession depth:', error);
        }
    }
}

export class SuccessionPoolService {
    private static endpoint = '/succession-planning/pools';

    static async getPools(filters?: { targetLevel?: string }): Promise<SuccessionPool[]> {
        try {
            const response = await APIClient.get<{ pools?: SuccessionPool[] }>(this.endpoint, filters);
            return response.pools || [];
        } catch (error) {
            console.error('Error fetching succession pools:', error);
            return [];
        }
    }

    static async createPool(data: SuccessionPool): Promise<SuccessionPool> {
        const response = await APIClient.post<{ pool: SuccessionPool }>(this.endpoint, data);
        return response.pool;
    }

    static async updatePool(id: string, updates: Partial<SuccessionPool>): Promise<SuccessionPool> {
        const response = await APIClient.put<{ pool: SuccessionPool }>(`${this.endpoint}/${id}`, updates);
        return response.pool;
    }
}

export class DevelopmentPlanService {
    private static endpoint = '/succession-planning/development-plans';

    static async getPlans(filters?: { employeeId?: string; targetPositionId?: string; status?: string }): Promise<DevelopmentPlan[]> {
        try {
            const response = await APIClient.get<{ plans?: DevelopmentPlan[] }>(this.endpoint, filters);
            return response.plans || [];
        } catch (error) {
            console.error('Error fetching development plans:', error);
            return [];
        }
    }

    static async createPlan(data: DevelopmentPlan): Promise<DevelopmentPlan> {
        const response = await APIClient.post<{ plan: DevelopmentPlan }>(this.endpoint, data);
        return response.plan;
    }

    static async updatePlan(id: string, updates: Partial<DevelopmentPlan>): Promise<DevelopmentPlan> {
        const response = await APIClient.put<{ plan: DevelopmentPlan }>(`${this.endpoint}/${id}`, updates);
        return response.plan;
    }

    static async activatePlan(id: string): Promise<DevelopmentPlan> {
        const response = await APIClient.post<{ plan: DevelopmentPlan }>(`${this.endpoint}/${id}/activate`);
        return response.plan;
    }

    static async completePlan(id: string): Promise<DevelopmentPlan> {
        const response = await APIClient.post<{ plan: DevelopmentPlan }>(`${this.endpoint}/${id}/complete`);
        return response.plan;
    }
}

export class TalentReviewService {
    private static endpoint = '/succession-planning/talent-reviews';

    static async getTalentReviews(filters?: { fiscalYear?: string; departmentId?: string }): Promise<TalentReview[]> {
        try {
            const response = await APIClient.get<{ reviews?: TalentReview[] }>(this.endpoint, filters);
            return response.reviews || [];
        } catch (error) {
            console.error('Error fetching talent reviews:', error);
            return [];
        }
    }

    static async createTalentReview(data: TalentReview): Promise<TalentReview> {
        const response = await APIClient.post<{ review: TalentReview }>(this.endpoint, data);
        return response.review;
    }

    static async updateTalentReview(id: string, updates: Partial<TalentReview>): Promise<TalentReview> {
        const response = await APIClient.put<{ review: TalentReview }>(`${this.endpoint}/${id}`, updates);
        return response.review;
    }

    static async completeTalentReview(id: string): Promise<TalentReview> {
        const response = await APIClient.post<{ review: TalentReview }>(`${this.endpoint}/${id}/complete`);
        return response.review;
    }
}

export class CareerPathService {
    private static endpoint = '/succession-planning/career-paths';

    static async getCareerPaths(filters?: { isActive?: boolean }): Promise<CareerPath[]> {
        try {
            const response = await APIClient.get<{ paths?: CareerPath[] }>(this.endpoint, filters);
            return response.paths || [];
        } catch (error) {
            console.error('Error fetching career paths:', error);
            return [];
        }
    }

    static async createCareerPath(data: CareerPath): Promise<CareerPath> {
        const response = await APIClient.post<{ path: CareerPath }>(this.endpoint, data);
        return response.path;
    }

    static async updateCareerPath(id: string, updates: Partial<CareerPath>): Promise<CareerPath> {
        const response = await APIClient.put<{ path: CareerPath }>(`${this.endpoint}/${id}`, updates);
        return response.path;
    }
}

export class EmergencySuccessionService {
    private static endpoint = '/succession-planning/emergency-succession';

    static async getEmergencyPlans(filters?: { criticalPositionId?: string }): Promise<EmergencySuccession[]> {
        try {
            const response = await APIClient.get<{ plans?: EmergencySuccession[] }>(this.endpoint, filters);
            return response.plans || [];
        } catch (error) {
            console.error('Error fetching emergency plans:', error);
            return [];
        }
    }

    static async createEmergencyPlan(data: EmergencySuccession): Promise<EmergencySuccession> {
        const response = await APIClient.post<{ plan: EmergencySuccession }>(this.endpoint, data);
        return response.plan;
    }

    static async updateEmergencyPlan(id: string, updates: Partial<EmergencySuccession>): Promise<EmergencySuccession> {
        const response = await APIClient.put<{ plan: EmergencySuccession }>(`${this.endpoint}/${id}`, updates);
        return response.plan;
    }
}

export class SuccessionAnalyticsService {
    private static endpoint = '/succession-planning/analytics';

    static async getMetrics(): Promise<SuccessionMetrics> {
        try {
            const response = await APIClient.get<{ metrics?: SuccessionMetrics }>(`${this.endpoint}/metrics`);
            return response.metrics || {} as SuccessionMetrics;
        } catch (error) {
            console.error('Error fetching succession metrics:', error);
            throw error;
        }
    }

    static async getRiskAnalysis(): Promise<SuccessionRiskAnalysis[]> {
        try {
            const response = await APIClient.get<{ analysis?: SuccessionRiskAnalysis[] }>(`${this.endpoint}/risk-analysis`);
            return response.analysis || [];
        } catch (error) {
            console.error('Error fetching risk analysis:', error);
            return [];
        }
    }

    private static calculateRiskScore(position: CriticalPosition): number {
        let score = 0;

        if (position.successionDepth === 0) score += 40;
        else if (position.successionDepth === 1) score += 25;
        else if (position.successionDepth === 2) score += 10;

        if (position.vacancyRisk === 'high') score += 30;
        else if (position.vacancyRisk === 'medium') score += 15;

        if (position.criticality === 'critical') score += 20;
        else if (position.criticality === 'high') score += 10;

        if (!position.hasEmergencyPlan) score += 10;

        return Math.min(score, 100);
    }
}

export class SuccessionSettingsService {
    private static endpoint = '/succession-planning/settings';

    static async getSettings(): Promise<SuccessionSettings | null> {
        try {
            const response = await APIClient.get<{ settings?: SuccessionSettings }>(this.endpoint);
            return response.settings || null;
        } catch (error) {
            console.error('Error fetching succession settings:', error);
            return null;
        }
    }

    static async updateSettings(updates: Partial<SuccessionSettings>): Promise<SuccessionSettings> {
        const response = await APIClient.put<{ settings: SuccessionSettings }>(this.endpoint, updates);
        return response.settings;
    }
}
