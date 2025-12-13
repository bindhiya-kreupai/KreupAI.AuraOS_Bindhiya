/**
 * Succession Planning Module - Service Layer
 * 
 * API-ready service classes with localStorage persistence.
 * Replace localStorage calls with real API endpoints when backend is ready.
 */

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

// Storage keys
const STORAGE_KEYS = {
    CRITICAL_POSITIONS: 'succession_critical_positions',
    SUCCESSION_CANDIDATES: 'succession_candidates',
    SUCCESSION_POOLS: 'succession_pools',
    DEVELOPMENT_PLANS: 'succession_development_plans',
    TALENT_REVIEWS: 'succession_talent_reviews',
    CAREER_PATHS: 'succession_career_paths',
    EMERGENCY_SUCCESSION: 'succession_emergency_succession',
    SETTINGS: 'succession_settings',
};

// Helper for simulating API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage helper
class StorageService {
    static load<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static save<T>(key: string, data: T): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }
}

export class CriticalPositionService {
    static async getPositions(filters?: { departmentId?: string; criticality?: string }): Promise<CriticalPosition[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS);
        let positions = stored || [];
        
        if (filters?.departmentId) {
            positions = positions.filter(p => p.departmentId === filters.departmentId);
        }
        if (filters?.criticality) {
            positions = positions.filter(p => p.criticality === filters.criticality);
        }
        
        return positions;
    }

    static async createPosition(data: CriticalPosition): Promise<CriticalPosition> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.CRITICAL_POSITIONS, stored);
        return data;
    }

    static async updatePosition(id: string, updates: Partial<CriticalPosition>): Promise<CriticalPosition> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS) || [];
        const index = stored.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Critical position not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.CRITICAL_POSITIONS, stored);
        return stored[index];
    }

    static async deletePosition(id: string): Promise<void> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS) || [];
        const filtered = stored.filter(p => p.id !== id);
        StorageService.save(STORAGE_KEYS.CRITICAL_POSITIONS, filtered);
    }
}

export class SuccessionCandidateService {
    static async getCandidates(filters?: { targetPositionId?: string; readinessLevel?: ReadinessLevel; status?: CandidateStatus }): Promise<SuccessionCandidate[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<SuccessionCandidate[]>(STORAGE_KEYS.SUCCESSION_CANDIDATES);
        let candidates = stored || [];
        
        if (filters?.targetPositionId) {
            candidates = candidates.filter(c => c.targetPositionId === filters.targetPositionId);
        }
        if (filters?.readinessLevel) {
            candidates = candidates.filter(c => c.readinessLevel === filters.readinessLevel);
        }
        if (filters?.status) {
            candidates = candidates.filter(c => c.status === filters.status);
        }
        
        return candidates;
    }

    static async createCandidate(data: SuccessionCandidate): Promise<SuccessionCandidate> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<SuccessionCandidate[]>(STORAGE_KEYS.SUCCESSION_CANDIDATES) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.SUCCESSION_CANDIDATES, stored);
        
        // Update critical position succession depth
        await this.updateSuccessionDepth(data.targetPositionId);
        
        return data;
    }

    static async updateCandidate(id: string, updates: Partial<SuccessionCandidate>): Promise<SuccessionCandidate> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<SuccessionCandidate[]>(STORAGE_KEYS.SUCCESSION_CANDIDATES) || [];
        const index = stored.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Succession candidate not found');
        
        const oldTargetPosition = stored[index].targetPositionId;
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.SUCCESSION_CANDIDATES, stored);
        
        // Update succession depth if target position changed
        if (updates.targetPositionId && updates.targetPositionId !== oldTargetPosition) {
            await this.updateSuccessionDepth(oldTargetPosition);
            await this.updateSuccessionDepth(updates.targetPositionId);
        }
        
        return stored[index];
    }

    static async approveCandidate(id: string, approvedBy: string): Promise<SuccessionCandidate> {
        return this.updateCandidate(id, {
            status: 'ready',
            approvedBy,
            approvedDate: new Date().toISOString(),
        });
    }

    private static async updateSuccessionDepth(positionId: string): Promise<void> {
        const candidates = await this.getCandidates({ targetPositionId: positionId });
        const readySuccessors = candidates.filter(c => 
            c.status === 'ready' && 
            (c.readinessLevel === 'ready_now' || c.readinessLevel === 'ready_1_year')
        ).length;
        
        const positions = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS) || [];
        const position = positions.find(p => p.id === positionId);
        if (position) {
            position.successionDepth = readySuccessors;
            StorageService.save(STORAGE_KEYS.CRITICAL_POSITIONS, positions);
        }
    }
}

export class SuccessionPoolService {
    static async getPools(filters?: { targetLevel?: string }): Promise<SuccessionPool[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<SuccessionPool[]>(STORAGE_KEYS.SUCCESSION_POOLS);
        let pools = stored || [];
        
        if (filters?.targetLevel) {
            pools = pools.filter(p => p.targetLevel === filters.targetLevel);
        }
        
        return pools;
    }

    static async createPool(data: SuccessionPool): Promise<SuccessionPool> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<SuccessionPool[]>(STORAGE_KEYS.SUCCESSION_POOLS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.SUCCESSION_POOLS, stored);
        return data;
    }

    static async updatePool(id: string, updates: Partial<SuccessionPool>): Promise<SuccessionPool> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<SuccessionPool[]>(STORAGE_KEYS.SUCCESSION_POOLS) || [];
        const index = stored.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Succession pool not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.SUCCESSION_POOLS, stored);
        return stored[index];
    }
}

export class DevelopmentPlanService {
    static async getPlans(filters?: { employeeId?: string; targetPositionId?: string; status?: string }): Promise<DevelopmentPlan[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<DevelopmentPlan[]>(STORAGE_KEYS.DEVELOPMENT_PLANS);
        let plans = stored || [];
        
        if (filters?.employeeId) {
            plans = plans.filter(p => p.employeeId === filters.employeeId);
        }
        if (filters?.targetPositionId) {
            plans = plans.filter(p => p.targetPositionId === filters.targetPositionId);
        }
        if (filters?.status) {
            plans = plans.filter(p => p.status === filters.status);
        }
        
        return plans;
    }

    static async createPlan(data: DevelopmentPlan): Promise<DevelopmentPlan> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<DevelopmentPlan[]>(STORAGE_KEYS.DEVELOPMENT_PLANS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.DEVELOPMENT_PLANS, stored);
        return data;
    }

    static async updatePlan(id: string, updates: Partial<DevelopmentPlan>): Promise<DevelopmentPlan> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<DevelopmentPlan[]>(STORAGE_KEYS.DEVELOPMENT_PLANS) || [];
        const index = stored.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Development plan not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.DEVELOPMENT_PLANS, stored);
        return stored[index];
    }

    static async activatePlan(id: string): Promise<DevelopmentPlan> {
        return this.updatePlan(id, { status: 'active' });
    }

    static async completePlan(id: string): Promise<DevelopmentPlan> {
        return this.updatePlan(id, { 
            status: 'completed',
            progress: 100,
        });
    }
}

export class TalentReviewService {
    static async getTalentReviews(filters?: { fiscalYear?: string; departmentId?: string }): Promise<TalentReview[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<TalentReview[]>(STORAGE_KEYS.TALENT_REVIEWS);
        let reviews = stored || [];
        
        if (filters?.fiscalYear) {
            reviews = reviews.filter(r => r.fiscalYear === filters.fiscalYear);
        }
        if (filters?.departmentId) {
            reviews = reviews.filter(r => r.departmentId === filters.departmentId);
        }
        
        return reviews;
    }

    static async createTalentReview(data: TalentReview): Promise<TalentReview> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<TalentReview[]>(STORAGE_KEYS.TALENT_REVIEWS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.TALENT_REVIEWS, stored);
        return data;
    }

    static async updateTalentReview(id: string, updates: Partial<TalentReview>): Promise<TalentReview> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<TalentReview[]>(STORAGE_KEYS.TALENT_REVIEWS) || [];
        const index = stored.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Talent review not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.TALENT_REVIEWS, stored);
        return stored[index];
    }

    static async completeTalentReview(id: string): Promise<TalentReview> {
        return this.updateTalentReview(id, { status: 'completed' });
    }
}

export class CareerPathService {
    static async getCareerPaths(filters?: { isActive?: boolean }): Promise<CareerPath[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<CareerPath[]>(STORAGE_KEYS.CAREER_PATHS);
        let paths = stored || [];
        
        if (filters?.isActive !== undefined) {
            paths = paths.filter(p => p.isActive === filters.isActive);
        }
        
        return paths;
    }

    static async createCareerPath(data: CareerPath): Promise<CareerPath> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<CareerPath[]>(STORAGE_KEYS.CAREER_PATHS) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.CAREER_PATHS, stored);
        return data;
    }

    static async updateCareerPath(id: string, updates: Partial<CareerPath>): Promise<CareerPath> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<CareerPath[]>(STORAGE_KEYS.CAREER_PATHS) || [];
        const index = stored.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Career path not found');
        
        stored[index] = { ...stored[index], ...updates, updatedAt: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.CAREER_PATHS, stored);
        return stored[index];
    }
}

export class EmergencySuccessionService {
    static async getEmergencyPlans(filters?: { criticalPositionId?: string }): Promise<EmergencySuccession[]> {
        await delay(300);
        // TODO: Replace with real API call
        const stored = StorageService.load<EmergencySuccession[]>(STORAGE_KEYS.EMERGENCY_SUCCESSION);
        let plans = stored || [];
        
        if (filters?.criticalPositionId) {
            plans = plans.filter(p => p.criticalPositionId === filters.criticalPositionId);
        }
        
        return plans;
    }

    static async createEmergencyPlan(data: EmergencySuccession): Promise<EmergencySuccession> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<EmergencySuccession[]>(STORAGE_KEYS.EMERGENCY_SUCCESSION) || [];
        stored.push(data);
        StorageService.save(STORAGE_KEYS.EMERGENCY_SUCCESSION, stored);
        
        // Update critical position to mark it has emergency plan
        const positions = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS) || [];
        const position = positions.find(p => p.id === data.criticalPositionId);
        if (position) {
            position.hasEmergencyPlan = true;
            StorageService.save(STORAGE_KEYS.CRITICAL_POSITIONS, positions);
        }
        
        return data;
    }

    static async updateEmergencyPlan(id: string, updates: Partial<EmergencySuccession>): Promise<EmergencySuccession> {
        await delay(500);
        // TODO: Replace with real API call
        const stored = StorageService.load<EmergencySuccession[]>(STORAGE_KEYS.EMERGENCY_SUCCESSION) || [];
        const index = stored.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Emergency succession plan not found');
        
        stored[index] = { ...stored[index], ...updates, lastUpdated: new Date().toISOString() };
        StorageService.save(STORAGE_KEYS.EMERGENCY_SUCCESSION, stored);
        return stored[index];
    }
}

export class SuccessionAnalyticsService {
    static async getMetrics(): Promise<SuccessionMetrics> {
        await delay(300);
        // TODO: Replace with real API call
        const positions = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS) || [];
        const candidates = StorageService.load<SuccessionCandidate[]>(STORAGE_KEYS.SUCCESSION_CANDIDATES) || [];
        const plans = StorageService.load<DevelopmentPlan[]>(STORAGE_KEYS.DEVELOPMENT_PLANS) || [];
        const pools = StorageService.load<SuccessionPool[]>(STORAGE_KEYS.SUCCESSION_POOLS) || [];

        const totalCriticalPositions = positions.length;
        const positionsWithSuccessors = positions.filter(p => p.successionDepth > 0).length;
        const readyNowSuccessors = candidates.filter(c => c.readinessLevel === 'ready_now').length;
        const highRiskPositions = positions.filter(p => p.vacancyRisk === 'high').length;
        const retentionRiskCount = candidates.filter(c => c.retentionRisk === 'high').length;
        const totalPoolSize = pools.reduce((sum, pool) => sum + pool.candidates.length, 0);

        return {
            totalCriticalPositions,
            positionsWithSuccessors,
            positionsCoverage: totalCriticalPositions > 0 ? (positionsWithSuccessors / totalCriticalPositions) * 100 : 0,
            readyNowSuccessors,
            avgSuccessionDepth: totalCriticalPositions > 0 ? 
                positions.reduce((sum, p) => sum + p.successionDepth, 0) / totalCriticalPositions : 0,
            highRiskPositions,
            avgTimeToReadiness: 18, // TODO: Calculate from actual candidate data
            developmentPlansActive: plans.filter(p => p.status === 'active').length,
            talentPoolSize: totalPoolSize,
            retentionRiskCount,
        };
    }

    static async getRiskAnalysis(): Promise<SuccessionRiskAnalysis[]> {
        await delay(300);
        // TODO: Replace with real API call and actual risk calculation
        const positions = StorageService.load<CriticalPosition[]>(STORAGE_KEYS.CRITICAL_POSITIONS) || [];
        
        return positions.map(position => ({
            positionId: position.id,
            positionTitle: position.title,
            riskScore: this.calculateRiskScore(position),
            riskLevel: position.vacancyRisk,
            factors: [
                {
                    factor: 'Succession Depth',
                    impact: position.successionDepth < 2 ? 'high' : 'low',
                    likelihood: 'medium',
                    description: `Only ${position.successionDepth} ready successor(s)`,
                },
                {
                    factor: 'Vacancy Risk',
                    impact: position.vacancyRisk === 'high' ? 'high' : 'medium',
                    likelihood: position.vacancyRisk === 'high' ? 'high' : 'medium',
                    description: position.retirementDate ? `Retirement planned: ${position.retirementDate}` : 'No retirement date set',
                },
            ],
            mitigationActions: [
                'Identify additional succession candidates',
                'Accelerate development plans',
                'Consider external hiring',
            ],
            lastAssessed: new Date().toISOString(),
        }));
    }

    private static calculateRiskScore(position: CriticalPosition): number {
        let score = 0;
        
        // Succession depth risk
        if (position.successionDepth === 0) score += 40;
        else if (position.successionDepth === 1) score += 25;
        else if (position.successionDepth === 2) score += 10;
        
        // Vacancy risk
        if (position.vacancyRisk === 'high') score += 30;
        else if (position.vacancyRisk === 'medium') score += 15;
        
        // Criticality
        if (position.criticality === 'critical') score += 20;
        else if (position.criticality === 'high') score += 10;
        
        // Emergency plan
        if (!position.hasEmergencyPlan) score += 10;
        
        return Math.min(score, 100);
    }
}

export class SuccessionSettingsService {
    static async getSettings(): Promise<SuccessionSettings | null> {
        await delay(300);
        // TODO: Replace with real API call
        return StorageService.load<SuccessionSettings>(STORAGE_KEYS.SETTINGS);
    }

    static async updateSettings(updates: Partial<SuccessionSettings>): Promise<SuccessionSettings> {
        await delay(500);
        // TODO: Replace with real API call
        const current = StorageService.load<SuccessionSettings>(STORAGE_KEYS.SETTINGS);
        const updated = { ...current, ...updates } as SuccessionSettings;
        StorageService.save(STORAGE_KEYS.SETTINGS, updated);
        return updated;
    }
}
