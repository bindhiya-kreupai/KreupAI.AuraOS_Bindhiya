/**
 * Workforce Planning Module - Services - API Integrated
 * API-ready service layer for strategic workforce planning operations
 */

import { APIClient } from '@/lib/api-client';
import type {
  DemandForecast,
  SupplyAnalysis,
  GapAnalysis,
  ScenarioModel,
  SuccessionReadiness,
  TalentAcquisitionPlan,
  WorkforceAnalytics,
  WorkforcePlanningSettings,
} from './types';

// ============================================================================
// Demand Forecast Service
// ============================================================================

export class DemandForecastService {
  private static endpoint = '/workforce-planning/demand-forecasts';

  static async getForecasts(): Promise<DemandForecast[]> {
    try {
      const response = await APIClient.get<{ forecasts?: DemandForecast[] }>(this.endpoint);
      return response.forecasts || [];
    } catch {
            return [];
    }
  }

  static async getForecastById(id: string): Promise<DemandForecast | null> {
    try {
      const response = await APIClient.get<{ forecast?: DemandForecast }>(`${this.endpoint}/${id}`);
      return response.forecast || null;
    } catch {
            return null;
    }
  }

  static async createForecast(data: DemandForecast): Promise<DemandForecast> {
    const response = await APIClient.post<{ forecast: DemandForecast }>(this.endpoint, data);
    return response.forecast;
  }

  static async updateForecast(id: string, updates: Partial<DemandForecast>): Promise<DemandForecast> {
    const response = await APIClient.put<{ forecast: DemandForecast }>(`${this.endpoint}/${id}`, updates);
    return response.forecast;
  }

  static async deleteForecast(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async approveForecast(id: string, approvedBy: string): Promise<DemandForecast> {
    const response = await APIClient.post<{ forecast: DemandForecast }>(`${this.endpoint}/${id}/approve`, { approvedBy });
    return response.forecast;
  }

  static async rejectForecast(id: string, reason: string): Promise<DemandForecast> {
    const response = await APIClient.post<{ forecast: DemandForecast }>(`${this.endpoint}/${id}/reject`, { reason });
    return response.forecast;
  }

  static async cloneForecast(id: string, newName: string): Promise<DemandForecast> {
    const response = await APIClient.post<{ forecast: DemandForecast }>(`${this.endpoint}/${id}/clone`, { newName });
    return response.forecast;
  }
}

// ============================================================================
// Supply Analysis Service
// ============================================================================

export class SupplyAnalysisService {
  private static endpoint = '/workforce-planning/supply-analyses';

  static async getAnalyses(): Promise<SupplyAnalysis[]> {
    try {
      const response = await APIClient.get<{ analyses?: SupplyAnalysis[] }>(this.endpoint);
      return response.analyses || [];
    } catch {
            return [];
    }
  }

  static async getAnalysisById(id: string): Promise<SupplyAnalysis | null> {
    try {
      const response = await APIClient.get<{ analysis?: SupplyAnalysis }>(`${this.endpoint}/${id}`);
      return response.analysis || null;
    } catch {
            return null;
    }
  }

  static async createAnalysis(data: SupplyAnalysis): Promise<SupplyAnalysis> {
    const response = await APIClient.post<{ analysis: SupplyAnalysis }>(this.endpoint, data);
    return response.analysis;
  }

  static async updateAnalysis(id: string, updates: Partial<SupplyAnalysis>): Promise<SupplyAnalysis> {
    const response = await APIClient.put<{ analysis: SupplyAnalysis }>(`${this.endpoint}/${id}`, updates);
    return response.analysis;
  }

  static async deleteAnalysis(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async runAnalysis(id: string): Promise<SupplyAnalysis> {
    const response = await APIClient.post<{ analysis: SupplyAnalysis }>(`${this.endpoint}/${id}/run`);
    return response.analysis;
  }
}

// ============================================================================
// Gap Analysis Service
// ============================================================================

export class GapAnalysisService {
  private static endpoint = '/workforce-planning/gap-analyses';

  static async getAnalyses(): Promise<GapAnalysis[]> {
    try {
      const response = await APIClient.get<{ analyses?: GapAnalysis[] }>(this.endpoint);
      return response.analyses || [];
    } catch {
            return [];
    }
  }

  static async getAnalysisById(id: string): Promise<GapAnalysis | null> {
    try {
      const response = await APIClient.get<{ analysis?: GapAnalysis }>(`${this.endpoint}/${id}`);
      return response.analysis || null;
    } catch {
            return null;
    }
  }

  static async createAnalysis(data: GapAnalysis): Promise<GapAnalysis> {
    const response = await APIClient.post<{ analysis: GapAnalysis }>(this.endpoint, data);
    return response.analysis;
  }

  static async updateAnalysis(id: string, updates: Partial<GapAnalysis>): Promise<GapAnalysis> {
    const response = await APIClient.put<{ analysis: GapAnalysis }>(`${this.endpoint}/${id}`, updates);
    return response.analysis;
  }

  static async deleteAnalysis(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async calculateGaps(demandForecastId: string, supplyAnalysisId: string): Promise<GapAnalysis> {
    const response = await APIClient.post<{ analysis: GapAnalysis }>(`${this.endpoint}/calculate`, {
      demandForecastId,
      supplyAnalysisId
    });
    return response.analysis;
  }
}

// ============================================================================
// Scenario Modeling Service
// ============================================================================

export class ScenarioModelingService {
  private static endpoint = '/workforce-planning/scenarios';

  static async getScenarios(): Promise<ScenarioModel[]> {
    try {
      const response = await APIClient.get<{ scenarios?: ScenarioModel[] }>(this.endpoint);
      return response.scenarios || [];
    } catch {
            return [];
    }
  }

  static async getScenarioById(id: string): Promise<ScenarioModel | null> {
    try {
      const response = await APIClient.get<{ scenario?: ScenarioModel }>(`${this.endpoint}/${id}`);
      return response.scenario || null;
    } catch {
            return null;
    }
  }

  static async createScenario(data: ScenarioModel): Promise<ScenarioModel> {
    const response = await APIClient.post<{ scenario: ScenarioModel }>(this.endpoint, data);
    return response.scenario;
  }

  static async updateScenario(id: string, updates: Partial<ScenarioModel>): Promise<ScenarioModel> {
    const response = await APIClient.put<{ scenario: ScenarioModel }>(`${this.endpoint}/${id}`, updates);
    return response.scenario;
  }

  static async deleteScenario(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async runScenario(id: string): Promise<ScenarioModel> {
    const response = await APIClient.post<{ scenario: ScenarioModel }>(`${this.endpoint}/${id}/run`);
    return response.scenario;
  }

  static async compareScenarios(scenarioIds: string[]): Promise<any> {
    const response = await APIClient.post<any>(`${this.endpoint}/compare`, { scenarioIds });
    return response;
  }

  static async cloneScenario(id: string, newName: string): Promise<ScenarioModel> {
    const response = await APIClient.post<{ scenario: ScenarioModel }>(`${this.endpoint}/${id}/clone`, { newName });
    return response.scenario;
  }
}

// ============================================================================
// Succession Readiness Service
// ============================================================================

export class SuccessionReadinessService {
  private static endpoint = '/workforce-planning/succession';

  static async getAssessments(): Promise<SuccessionReadiness[]> {
    try {
      const response = await APIClient.get<{ assessments?: SuccessionReadiness[] }>(this.endpoint);
      return response.assessments || [];
    } catch {
            return [];
    }
  }

  static async getAssessmentById(id: string): Promise<SuccessionReadiness | null> {
    try {
      const response = await APIClient.get<{ assessment?: SuccessionReadiness }>(`${this.endpoint}/${id}`);
      return response.assessment || null;
    } catch {
            return null;
    }
  }

  static async createAssessment(data: SuccessionReadiness): Promise<SuccessionReadiness> {
    const response = await APIClient.post<{ assessment: SuccessionReadiness }>(this.endpoint, data);
    return response.assessment;
  }

  static async updateAssessment(id: string, updates: Partial<SuccessionReadiness>): Promise<SuccessionReadiness> {
    const response = await APIClient.put<{ assessment: SuccessionReadiness }>(`${this.endpoint}/${id}`, updates);
    return response.assessment;
  }

  static async deleteAssessment(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async assessSuccessionReadiness(id: string): Promise<SuccessionReadiness> {
    const response = await APIClient.post<{ assessment: SuccessionReadiness }>(`${this.endpoint}/${id}/assess`);
    return response.assessment;
  }
}

// ============================================================================
// Talent Acquisition Plan Service
// ============================================================================

export class TalentAcquisitionPlanService {
  private static endpoint = '/workforce-planning/acquisition-plans';

  static async getPlans(): Promise<TalentAcquisitionPlan[]> {
    try {
      const response = await APIClient.get<{ plans?: TalentAcquisitionPlan[] }>(this.endpoint);
      return response.plans || [];
    } catch {
            return [];
    }
  }

  static async getPlanById(id: string): Promise<TalentAcquisitionPlan | null> {
    try {
      const response = await APIClient.get<{ plan?: TalentAcquisitionPlan }>(`${this.endpoint}/${id}`);
      return response.plan || null;
    } catch {
            return null;
    }
  }

  static async createPlan(data: TalentAcquisitionPlan): Promise<TalentAcquisitionPlan> {
    const response = await APIClient.post<{ plan: TalentAcquisitionPlan }>(this.endpoint, data);
    return response.plan;
  }

  static async updatePlan(id: string, updates: Partial<TalentAcquisitionPlan>): Promise<TalentAcquisitionPlan> {
    const response = await APIClient.put<{ plan: TalentAcquisitionPlan }>(`${this.endpoint}/${id}`, updates);
    return response.plan;
  }

  static async deletePlan(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async generateFromGapAnalysis(gapAnalysisId: string): Promise<TalentAcquisitionPlan> {
    const response = await APIClient.post<{ plan: TalentAcquisitionPlan }>(`${this.endpoint}/generate`, { gapAnalysisId });
    return response.plan;
  }

  static async trackHire(planId: string, roleId: string): Promise<void> {
    await APIClient.post(`${this.endpoint}/${planId}/track-hire`, { roleId });
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WorkforceAnalyticsService {
  private static endpoint = '/workforce-planning/analytics';

  static async getMetrics(): Promise<WorkforceAnalytics> {
    try {
      const response = await APIClient.get<{ metrics?: WorkforceAnalytics }>(this.endpoint);
      return response.metrics || {} as WorkforceAnalytics;
    } catch {
            throw error;
    }
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WorkforcePlanningSettingsService {
  private static endpoint = '/workforce-planning/settings';

  static async getSettings(): Promise<WorkforcePlanningSettings> {
    try {
      const response = await APIClient.get<{ settings?: WorkforcePlanningSettings }>(this.endpoint);
      return response.settings || {} as WorkforcePlanningSettings;
    } catch {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<WorkforcePlanningSettings>): Promise<WorkforcePlanningSettings> {
    const response = await APIClient.put<{ settings: WorkforcePlanningSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
