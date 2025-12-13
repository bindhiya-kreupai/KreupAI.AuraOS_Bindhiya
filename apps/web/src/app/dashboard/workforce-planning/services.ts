/**
 * Workforce Planning Module - Services
 * API-ready service layer for strategic workforce planning operations
 */

import {
  DemandForecast,
  SupplyAnalysis,
  GapAnalysis,
  ScenarioModel,
  SuccessionReadiness,
  TalentAcquisitionPlan,
  WorkforceAnalytics,
  WorkforcePlanningSettings,
} from './types';

// Storage keys
const STORAGE_KEYS = {
  DEMAND_FORECASTS: 'workforce_demand_forecasts',
  SUPPLY_ANALYSES: 'workforce_supply_analyses',
  GAP_ANALYSES: 'workforce_gap_analyses',
  SCENARIOS: 'workforce_scenarios',
  SUCCESSION: 'workforce_succession',
  ACQUISITION_PLANS: 'workforce_acquisition_plans',
  SETTINGS: 'workforce_settings',
};

// ============================================================================
// Demand Forecast Service
// ============================================================================

export class DemandForecastService {
  static async getForecasts(): Promise<DemandForecast[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.DEMAND_FORECASTS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getForecastById(id: string): Promise<DemandForecast | null> {
    const forecasts = await this.getForecasts();
    return forecasts.find((f) => f.id === id) || null;
  }

  static async createForecast(data: DemandForecast): Promise<DemandForecast> {
    const forecasts = await this.getForecasts();
    forecasts.push(data);
    localStorage.setItem(STORAGE_KEYS.DEMAND_FORECASTS, JSON.stringify(forecasts));
    return data;
  }

  static async updateForecast(id: string, updates: Partial<DemandForecast>): Promise<DemandForecast> {
    const forecasts = await this.getForecasts();
    const index = forecasts.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Forecast not found');
    forecasts[index] = { ...forecasts[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.DEMAND_FORECASTS, JSON.stringify(forecasts));
    return forecasts[index];
  }

  static async deleteForecast(id: string): Promise<void> {
    const forecasts = await this.getForecasts();
    const filtered = forecasts.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.DEMAND_FORECASTS, JSON.stringify(filtered));
  }

  static async approveForecast(id: string, approvedBy: string): Promise<DemandForecast> {
    return this.updateForecast(id, {
      approvalStatus: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
    });
  }

  static async rejectForecast(id: string, reason: string): Promise<DemandForecast> {
    return this.updateForecast(id, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
    });
  }

  static async cloneForecast(id: string, newName: string): Promise<DemandForecast> {
    const forecast = await this.getForecastById(id);
    if (!forecast) throw new Error('Forecast not found');

    const clone: DemandForecast = {
      ...forecast,
      id: `forecast-${Date.now()}`,
      forecastCode: `FC-${Date.now()}`,
      forecastName: newName,
      status: 'draft',
      approvalStatus: 'pending',
      approvedBy: undefined,
      approvedDate: undefined,
      rejectionReason: undefined,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: '1.0',
    };

    return this.createForecast(clone);
  }
}

// ============================================================================
// Supply Analysis Service
// ============================================================================

export class SupplyAnalysisService {
  static async getAnalyses(): Promise<SupplyAnalysis[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.SUPPLY_ANALYSES);
    return stored ? JSON.parse(stored) : [];
  }

  static async getAnalysisById(id: string): Promise<SupplyAnalysis | null> {
    const analyses = await this.getAnalyses();
    return analyses.find((a) => a.id === id) || null;
  }

  static async createAnalysis(data: SupplyAnalysis): Promise<SupplyAnalysis> {
    const analyses = await this.getAnalyses();
    analyses.push(data);
    localStorage.setItem(STORAGE_KEYS.SUPPLY_ANALYSES, JSON.stringify(analyses));
    return data;
  }

  static async updateAnalysis(id: string, updates: Partial<SupplyAnalysis>): Promise<SupplyAnalysis> {
    const analyses = await this.getAnalyses();
    const index = analyses.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Analysis not found');
    analyses[index] = { ...analyses[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SUPPLY_ANALYSES, JSON.stringify(analyses));
    return analyses[index];
  }

  static async deleteAnalysis(id: string): Promise<void> {
    const analyses = await this.getAnalyses();
    const filtered = analyses.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUPPLY_ANALYSES, JSON.stringify(filtered));
  }

  static async runAnalysis(id: string): Promise<SupplyAnalysis> {
    // TODO: Implement actual supply analysis logic
    // This would typically:
    // 1. Query employee database
    // 2. Calculate demographics, tenure, skills, performance
    // 3. Assess mobility and attrition risk
    // 4. Update the analysis with results

    const analysis = await this.getAnalysisById(id);
    if (!analysis) throw new Error('Analysis not found');

    return this.updateAnalysis(id, {
      status: 'completed',
      asOfDate: new Date().toISOString(),
    });
  }
}

// ============================================================================
// Gap Analysis Service
// ============================================================================

export class GapAnalysisService {
  static async getAnalyses(): Promise<GapAnalysis[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.GAP_ANALYSES);
    return stored ? JSON.parse(stored) : [];
  }

  static async getAnalysisById(id: string): Promise<GapAnalysis | null> {
    const analyses = await this.getAnalyses();
    return analyses.find((a) => a.id === id) || null;
  }

  static async createAnalysis(data: GapAnalysis): Promise<GapAnalysis> {
    const analyses = await this.getAnalyses();
    analyses.push(data);
    localStorage.setItem(STORAGE_KEYS.GAP_ANALYSES, JSON.stringify(analyses));
    return data;
  }

  static async updateAnalysis(id: string, updates: Partial<GapAnalysis>): Promise<GapAnalysis> {
    const analyses = await this.getAnalyses();
    const index = analyses.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Analysis not found');
    analyses[index] = { ...analyses[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GAP_ANALYSES, JSON.stringify(analyses));
    return analyses[index];
  }

  static async deleteAnalysis(id: string): Promise<void> {
    const analyses = await this.getAnalyses();
    const filtered = analyses.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.GAP_ANALYSES, JSON.stringify(filtered));
  }

  static async calculateGaps(
    demandForecastId: string,
    supplyAnalysisId: string
  ): Promise<GapAnalysis> {
    const forecast = await DemandForecastService.getForecastById(demandForecastId);
    const supply = await SupplyAnalysisService.getAnalysisById(supplyAnalysisId);

    if (!forecast) throw new Error('Demand forecast not found');
    if (!supply) throw new Error('Supply analysis not found');

    // TODO: Implement actual gap calculation logic
    // This would calculate gaps by role, period, and category

    const gapAnalysis: GapAnalysis = {
      id: `gap-${Date.now()}`,
      analysisCode: `GAP-${Date.now()}`,
      analysisName: `Gap Analysis - ${forecast.forecastName}`,
      status: 'completed',
      description: `Gap analysis comparing ${forecast.forecastName} with ${supply.analysisName}`,
      demandForecastId,
      supplyAnalysisId,
      analysisDate: new Date().toISOString(),
      forecastPeriodIds: forecast.forecastPeriods.map((p) => p.id),
      totalDemand: forecast.totalForecastedHeadcount,
      totalSupply: supply.totalHeadcount,
      totalGap: forecast.totalForecastedHeadcount - supply.totalHeadcount,
      gapPercentage:
        supply.totalHeadcount > 0
          ? ((forecast.totalForecastedHeadcount - supply.totalHeadcount) / supply.totalHeadcount) * 100
          : 0,
      periodGaps: [],
      roleGaps: [],
      quantitativeGaps: [],
      qualitativeGaps: [],
      closureStrategies: [],
      closureConfidence: 'medium',
      createdBy: 'system',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    return this.createAnalysis(gapAnalysis);
  }
}

// ============================================================================
// Scenario Modeling Service
// ============================================================================

export class ScenarioModelingService {
  static async getScenarios(): Promise<ScenarioModel[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getScenarioById(id: string): Promise<ScenarioModel | null> {
    const scenarios = await this.getScenarios();
    return scenarios.find((s) => s.id === id) || null;
  }

  static async createScenario(data: ScenarioModel): Promise<ScenarioModel> {
    const scenarios = await this.getScenarios();
    scenarios.push(data);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    return data;
  }

  static async updateScenario(id: string, updates: Partial<ScenarioModel>): Promise<ScenarioModel> {
    const scenarios = await this.getScenarios();
    const index = scenarios.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Scenario not found');
    scenarios[index] = { ...scenarios[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    return scenarios[index];
  }

  static async deleteScenario(id: string): Promise<void> {
    const scenarios = await this.getScenarios();
    const filtered = scenarios.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(filtered));
  }

  static async runScenario(id: string): Promise<ScenarioModel> {
    const scenario = await this.getScenarioById(id);
    if (!scenario) throw new Error('Scenario not found');

    // TODO: Implement actual scenario modeling logic
    // This would:
    // 1. Apply scenario variables to base forecast
    // 2. Project headcount by period
    // 3. Calculate costs
    // 4. Generate outcomes

    return this.updateScenario(id, {
      status: 'completed',
    });
  }

  static async compareScenarios(scenarioIds: string[]): Promise<any> {
    const scenarios = await Promise.all(scenarioIds.map((id) => this.getScenarioById(id)));

    // TODO: Implement scenario comparison logic
    // This would compare key metrics across scenarios

    return {
      scenarios: scenarios.filter((s) => s !== null),
      comparison: {
        headcountComparison: [],
        costComparison: [],
        recommendations: [],
      },
    };
  }

  static async cloneScenario(id: string, newName: string): Promise<ScenarioModel> {
    const scenario = await this.getScenarioById(id);
    if (!scenario) throw new Error('Scenario not found');

    const clone: ScenarioModel = {
      ...scenario,
      id: `scenario-${Date.now()}`,
      scenarioCode: `SC-${Date.now()}`,
      scenarioName: newName,
      status: 'draft',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: '1.0',
    };

    return this.createScenario(clone);
  }
}

// ============================================================================
// Succession Readiness Service
// ============================================================================

export class SuccessionReadinessService {
  static async getAssessments(): Promise<SuccessionReadiness[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.SUCCESSION);
    return stored ? JSON.parse(stored) : [];
  }

  static async getAssessmentById(id: string): Promise<SuccessionReadiness | null> {
    const assessments = await this.getAssessments();
    return assessments.find((a) => a.id === id) || null;
  }

  static async createAssessment(data: SuccessionReadiness): Promise<SuccessionReadiness> {
    const assessments = await this.getAssessments();
    assessments.push(data);
    localStorage.setItem(STORAGE_KEYS.SUCCESSION, JSON.stringify(assessments));
    return data;
  }

  static async updateAssessment(id: string, updates: Partial<SuccessionReadiness>): Promise<SuccessionReadiness> {
    const assessments = await this.getAssessments();
    const index = assessments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Assessment not found');
    assessments[index] = { ...assessments[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SUCCESSION, JSON.stringify(assessments));
    return assessments[index];
  }

  static async deleteAssessment(id: string): Promise<void> {
    const assessments = await this.getAssessments();
    const filtered = assessments.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUCCESSION, JSON.stringify(filtered));
  }

  static async assessSuccessionReadiness(id: string): Promise<SuccessionReadiness> {
    const assessment = await this.getAssessmentById(id);
    if (!assessment) throw new Error('Assessment not found');

    // TODO: Implement actual succession readiness assessment
    // This would:
    // 1. Identify critical positions
    // 2. Assess successor readiness
    // 3. Calculate coverage rates
    // 4. Identify development needs

    const positionsWithSuccessors = assessment.criticalPositions.filter(
      (p) => p.successors.length > 0
    ).length;

    return this.updateAssessment(id, {
      status: 'completed',
      positionsWithSuccessors,
      successionCoverageRate:
        assessment.totalCriticalPositions > 0
          ? (positionsWithSuccessors / assessment.totalCriticalPositions) * 100
          : 0,
    });
  }
}

// ============================================================================
// Talent Acquisition Plan Service
// ============================================================================

export class TalentAcquisitionPlanService {
  static async getPlans(): Promise<TalentAcquisitionPlan[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.ACQUISITION_PLANS);
    return stored ? JSON.parse(stored) : [];
  }

  static async getPlanById(id: string): Promise<TalentAcquisitionPlan | null> {
    const plans = await this.getPlans();
    return plans.find((p) => p.id === id) || null;
  }

  static async createPlan(data: TalentAcquisitionPlan): Promise<TalentAcquisitionPlan> {
    const plans = await this.getPlans();
    plans.push(data);
    localStorage.setItem(STORAGE_KEYS.ACQUISITION_PLANS, JSON.stringify(plans));
    return data;
  }

  static async updatePlan(id: string, updates: Partial<TalentAcquisitionPlan>): Promise<TalentAcquisitionPlan> {
    const plans = await this.getPlans();
    const index = plans.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Plan not found');
    plans[index] = { ...plans[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ACQUISITION_PLANS, JSON.stringify(plans));
    return plans[index];
  }

  static async deletePlan(id: string): Promise<void> {
    const plans = await this.getPlans();
    const filtered = plans.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACQUISITION_PLANS, JSON.stringify(filtered));
  }

  static async generateFromGapAnalysis(gapAnalysisId: string): Promise<TalentAcquisitionPlan> {
    const gapAnalysis = await GapAnalysisService.getAnalysisById(gapAnalysisId);
    if (!gapAnalysis) throw new Error('Gap analysis not found');

    // TODO: Implement logic to convert gap analysis to acquisition plan
    // This would:
    // 1. Identify roles needing external hiring
    // 2. Set hiring targets by role
    // 3. Allocate budget
    // 4. Define sourcing strategy

    const plan: TalentAcquisitionPlan = {
      id: `plan-${Date.now()}`,
      planCode: `TAP-${Date.now()}`,
      planName: `Acquisition Plan - ${new Date().getFullYear()}`,
      status: 'draft',
      description: `Talent acquisition plan generated from ${gapAnalysis.analysisName}`,
      gapAnalysisId,
      planYear: new Date().getFullYear(),
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().getFullYear(), 11, 31).toISOString(),
      totalHiringTarget: Math.abs(gapAnalysis.totalGap),
      hiringByRole: [],
      hiringByPeriod: [],
      sourcingChannels: [],
      diversityTargets: [],
      totalRecruitingBudget: 0,
      budgetByCategory: [],
      milestones: [],
      actualHires: 0,
      hiringProgress: 0,
      budgetSpent: 0,
      budgetRemaining: 0,
      createdBy: 'system',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    return this.createPlan(plan);
  }

  static async trackHire(planId: string, roleId: string): Promise<void> {
    const plan = await this.getPlanById(planId);
    if (!plan) throw new Error('Plan not found');

    const role = plan.hiringByRole.find((r) => r.id === roleId);
    if (!role) throw new Error('Role not found in plan');

    role.actualHires += 1;
    role.remainingHires = role.hiringTarget - role.actualHires;

    const totalActualHires = plan.hiringByRole.reduce((sum, r) => sum + r.actualHires, 0);
    const hiringProgress = plan.totalHiringTarget > 0 ? (totalActualHires / plan.totalHiringTarget) * 100 : 0;

    await this.updatePlan(planId, {
      hiringByRole: plan.hiringByRole,
      actualHires: totalActualHires,
      hiringProgress,
    });
  }
}

// ============================================================================
// Analytics Service
// ============================================================================

export class WorkforceAnalyticsService {
  static async getMetrics(): Promise<WorkforceAnalytics> {
    const forecasts = await DemandForecastService.getForecasts();
    const supplyAnalyses = await SupplyAnalysisService.getAnalyses();
    const gapAnalyses = await GapAnalysisService.getAnalyses();
    const scenarios = await ScenarioModelingService.getScenarios();
    const successionAssessments = await SuccessionReadinessService.getAssessments();
    const acquisitionPlans = await TalentAcquisitionPlanService.getPlans();

    const activeForecasts = forecasts.filter((f) => f.status === 'active');
    const activeScenarios = scenarios.filter((s) => s.status === 'active');
    const completedGaps = gapAnalyses.filter((g) => g.status === 'completed');
    const activePlans = acquisitionPlans.filter((p) => p.status === 'active');

    // Calculate succession coverage
    const latestSuccession = successionAssessments
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())[0];

    // Calculate overall gap from latest gap analysis
    const latestGap = completedGaps.sort(
      (a, b) => new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    )[0];

    return {
      activeForecast: activeForecasts.length,
      activeScenarios: activeScenarios.length,
      gapAnalysesCompleted: completedGaps.length,
      successionCoverage: latestSuccession?.successionCoverageRate || 0,

      overallGap: latestGap?.totalGap || 0,
      surplusPositions: latestGap?.roleGaps.filter((r) => r.gapType === 'surplus').length || 0,
      shortagePositions: latestGap?.roleGaps.filter((r) => r.gapType === 'shortage').length || 0,
      criticalGaps: latestGap?.roleGaps.filter((r) => r.businessImpact === 'critical').length || 0,

      activeHiringPlans: activePlans.length,
      totalHiringTarget: activePlans.reduce((sum, p) => sum + p.totalHiringTarget, 0),
      actualHires: activePlans.reduce((sum, p) => sum + p.actualHires, 0),
      hiringProgress: activePlans.length > 0
        ? activePlans.reduce((sum, p) => sum + p.hiringProgress, 0) / activePlans.length
        : 0,

      criticalPositionsCovered: latestSuccession?.positionsWithSuccessors || 0,
      criticalPositionsAtRisk: latestSuccession
        ? latestSuccession.totalCriticalPositions - latestSuccession.positionsWithSuccessors
        : 0,
      successorsPipeline: latestSuccession?.criticalPositions.reduce((sum, p) => sum + p.successors.length, 0) || 0,
      averageSuccessionDepth: latestSuccession
        ? latestSuccession.criticalPositions.reduce((sum, p) => sum + p.successionDepth, 0) /
          latestSuccession.totalCriticalPositions
        : 0,

      currentWorkforceCost: 0, // TODO: Calculate from actual data
      projectedWorkforceCost: 0, // TODO: Calculate from scenario projections
      costIncrease: 0,
      costIncreasePercentage: 0,

      forecastAccuracy: 85.5, // Placeholder
      planExecutionRate: 78.3, // Placeholder

      lastUpdated: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Settings Service
// ============================================================================

export class WorkforcePlanningSettingsService {
  static async getSettings(): Promise<WorkforcePlanningSettings> {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return JSON.parse(stored);

    const defaultSettings: WorkforcePlanningSettings = {
      defaultForecastMethod: 'hybrid',
      defaultTimeHorizon: 'medium_term',
      forecastingCycle: 'annual',
      requireApprovalForForecast: true,

      gapThresholdPercentage: 10,
      criticalGapThreshold: 5,
      autoGenerateActionPlans: true,

      successionDepthTarget: 2,
      criticalPositionCriteria: ['Executive', 'Director', 'Key Technical'],
      mandatorySuccessionReview: true,
      successionReviewCycle: 'annual',

      defaultSalaryIncreaseRate: 3.5,
      defaultBenefitsRate: 30,
      defaultAttritionRate: 12,
      defaultRecruitingCostPerHire: 5000,

      enableNotifications: true,
      notifyGapIdentified: true,
      notifySuccessionRisk: true,
      notifyHiringMilestone: true,

      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<WorkforcePlanningSettings>): Promise<WorkforcePlanningSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
