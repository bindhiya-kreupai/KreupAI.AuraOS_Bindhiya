// ESG Services - API Integrated with Engagement Backend
import { APIClient } from '@/lib/api-client';

const BASE_ENDPOINT = '/engagement/esg';

// Types for ESG data
export interface ESGMetrics {
    carbonFootprint: number;
    renewableEnergy: number;
    wasteReduction: number;
    waterConservation: number;
    communityEngagement: number;
    boardDiversity: number;
    ethicsTraining: number;
    dataPrivacyCompliance: number;
}

export interface ESGInitiative {
    id: string;
    name: string;
    category: 'environmental' | 'social' | 'governance';
    status: 'planned' | 'in_progress' | 'completed';
    impact: string;
    startDate: string;
    targetDate?: string;
    progress: number;
}

export interface ESGGoal {
    id: string;
    name: string;
    target: number;
    current: number;
    unit: string;
    deadline: string;
    category: 'environmental' | 'social' | 'governance';
}

export class ESGMetricsService {
    static async getMetrics(): Promise<ESGMetrics | null> {
        try {
            const response = await APIClient.get<{ metrics?: ESGMetrics }>(BASE_ENDPOINT);
            return response.metrics || null;
        } catch (error: any) {
            console.error('ESG metrics fetch error:', error);
            return null;
        }
    }
}

export class ESGInitiativeService {
    static async getAll(): Promise<ESGInitiative[]> {
        try {
            const response = await APIClient.get<{ initiatives?: ESGInitiative[] }>(BASE_ENDPOINT);
            return response.initiatives || [];
        } catch (error: any) {
            console.error('ESG initiatives fetch error:', error);
            return [];
        }
    }

    static async create(data: Partial<ESGInitiative>): Promise<ESGInitiative> {
        const response = await APIClient.post<{ initiative: ESGInitiative }>(`${BASE_ENDPOINT}`, {
            action: 'createInitiative',
            ...data
        });
        return response.initiative;
    }
}

export class ESGGoalService {
    static async getAll(): Promise<ESGGoal[]> {
        try {
            const response = await APIClient.get<{ goals?: ESGGoal[] }>(BASE_ENDPOINT);
            return response.goals || [];
        } catch (error: any) {
            console.error('ESG goals fetch error:', error);
            return [];
        }
    }
}

export class ESGReportService {
    static async generateReport(params: { year: number; quarter?: number }): Promise<any> {
        try {
            const response = await APIClient.post<{ report: any }>(`${BASE_ENDPOINT}`, {
                action: 'generateReport',
                ...params
            });
            return response.report;
        } catch (error: any) {
            console.error('ESG report generation error:', error);
            throw error;
        }
    }
}
