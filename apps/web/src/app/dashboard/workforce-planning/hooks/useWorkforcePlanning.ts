/**
 * Workforce Planning Module - Custom Hook
 * Centralized state management and business logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  DemandForecast,
  SupplyAnalysis,
  GapAnalysis,
  ScenarioModel,
  SuccessionReadiness,
  TalentAcquisitionPlan,
  WorkforceAnalytics,
  WorkforcePlanningSettings,
} from '../types';
import {
  DemandForecastService,
  SupplyAnalysisService,
  GapAnalysisService,
  ScenarioModelingService,
  SuccessionReadinessService,
  TalentAcquisitionPlanService,
  WorkforceAnalyticsService,
  WorkforcePlanningSettingsService,
} from '../services';

export interface UseWorkforcePlanningReturn {
  // Demand Forecasting
  forecasts: DemandForecast[];
  createForecast: (data: DemandForecast) => Promise<DemandForecast>;
  updateForecast: (id: string, updates: Partial<DemandForecast>) => Promise<DemandForecast>;
  deleteForecast: (id: string) => Promise<void>;
  approveForecast: (id: string, approvedBy: string) => Promise<DemandForecast>;
  rejectForecast: (id: string, reason: string) => Promise<DemandForecast>;
  cloneForecast: (id: string, newName: string) => Promise<DemandForecast>;

  // Supply Analysis
  supplyAnalyses: SupplyAnalysis[];
  createSupplyAnalysis: (data: SupplyAnalysis) => Promise<SupplyAnalysis>;
  updateSupplyAnalysis: (id: string, updates: Partial<SupplyAnalysis>) => Promise<SupplyAnalysis>;
  deleteSupplyAnalysis: (id: string) => Promise<void>;
  runSupplyAnalysis: (id: string) => Promise<SupplyAnalysis>;

  // Gap Analysis
  gapAnalyses: GapAnalysis[];
  createGapAnalysis: (data: GapAnalysis) => Promise<GapAnalysis>;
  updateGapAnalysis: (id: string, updates: Partial<GapAnalysis>) => Promise<GapAnalysis>;
  deleteGapAnalysis: (id: string) => Promise<void>;
  calculateGaps: (demandForecastId: string, supplyAnalysisId: string) => Promise<GapAnalysis>;

  // Scenario Modeling
  scenarios: ScenarioModel[];
  createScenario: (data: ScenarioModel) => Promise<ScenarioModel>;
  updateScenario: (id: string, updates: Partial<ScenarioModel>) => Promise<ScenarioModel>;
  deleteScenario: (id: string) => Promise<void>;
  runScenario: (id: string) => Promise<ScenarioModel>;
  compareScenarios: (scenarioIds: string[]) => Promise<any>;
  cloneScenario: (id: string, newName: string) => Promise<ScenarioModel>;

  // Succession Readiness
  successionAssessments: SuccessionReadiness[];
  createSuccessionAssessment: (data: SuccessionReadiness) => Promise<SuccessionReadiness>;
  updateSuccessionAssessment: (id: string, updates: Partial<SuccessionReadiness>) => Promise<SuccessionReadiness>;
  deleteSuccessionAssessment: (id: string) => Promise<void>;
  assessSuccessionReadiness: (id: string) => Promise<SuccessionReadiness>;

  // Talent Acquisition Plans
  acquisitionPlans: TalentAcquisitionPlan[];
  createAcquisitionPlan: (data: TalentAcquisitionPlan) => Promise<TalentAcquisitionPlan>;
  updateAcquisitionPlan: (id: string, updates: Partial<TalentAcquisitionPlan>) => Promise<TalentAcquisitionPlan>;
  deleteAcquisitionPlan: (id: string) => Promise<void>;
  generateAcquisitionPlan: (gapAnalysisId: string) => Promise<TalentAcquisitionPlan>;
  trackHire: (planId: string, roleId: string) => Promise<void>;

  // Analytics & Settings
  metrics: WorkforceAnalytics | null;
  settings: WorkforcePlanningSettings | null;
  updateSettings: (updates: Partial<WorkforcePlanningSettings>) => Promise<WorkforcePlanningSettings>;

  // Global State
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useWorkforcePlanning(): UseWorkforcePlanningReturn {
  // State
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [supplyAnalyses, setSupplyAnalyses] = useState<SupplyAnalysis[]>([]);
  const [gapAnalyses, setGapAnalyses] = useState<GapAnalysis[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioModel[]>([]);
  const [successionAssessments, setSuccessionAssessments] = useState<SuccessionReadiness[]>([]);
  const [acquisitionPlans, setAcquisitionPlans] = useState<TalentAcquisitionPlan[]>([]);
  const [metrics, setMetrics] = useState<WorkforceAnalytics | null>(null);
  const [settings, setSettings] = useState<WorkforcePlanningSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Data
  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        forecastsData,
        supplyData,
        gapData,
        scenariosData,
        successionData,
        plansData,
        metricsData,
        settingsData,
      ] = await Promise.all([
        DemandForecastService.getForecasts(),
        SupplyAnalysisService.getAnalyses(),
        GapAnalysisService.getAnalyses(),
        ScenarioModelingService.getScenarios(),
        SuccessionReadinessService.getAssessments(),
        TalentAcquisitionPlanService.getPlans(),
        WorkforceAnalyticsService.getMetrics(),
        WorkforcePlanningSettingsService.getSettings(),
      ]);

      setForecasts(forecastsData);
      setSupplyAnalyses(supplyData);
      setGapAnalyses(gapData);
      setScenarios(scenariosData);
      setSuccessionAssessments(successionData);
      setAcquisitionPlans(plansData);
      setMetrics(metricsData);
      setSettings(settingsData);
    } catch (error) {
      setError(err instanceof Error ? err.message : 'Failed to load workforce planning data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ============================================================================
  // Demand Forecasting Methods
  // ============================================================================

  const createForecast = async (data: DemandForecast): Promise<DemandForecast> => {
    const forecast = await DemandForecastService.createForecast(data);
    setForecasts([...forecasts, forecast]);
    return forecast;
  };

  const updateForecast = async (id: string, updates: Partial<DemandForecast>): Promise<DemandForecast> => {
    const updated = await DemandForecastService.updateForecast(id, updates);
    setForecasts(forecasts.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const deleteForecast = async (id: string): Promise<void> => {
    await DemandForecastService.deleteForecast(id);
    setForecasts(forecasts.filter((f) => f.id !== id));
  };

  const approveForecast = async (id: string, approvedBy: string): Promise<DemandForecast> => {
    const approved = await DemandForecastService.approveForecast(id, approvedBy);
    setForecasts(forecasts.map((f) => (f.id === id ? approved : f)));
    return approved;
  };

  const rejectForecast = async (id: string, reason: string): Promise<DemandForecast> => {
    const rejected = await DemandForecastService.rejectForecast(id, reason);
    setForecasts(forecasts.map((f) => (f.id === id ? rejected : f)));
    return rejected;
  };

  const cloneForecast = async (id: string, newName: string): Promise<DemandForecast> => {
    const clone = await DemandForecastService.cloneForecast(id, newName);
    setForecasts([...forecasts, clone]);
    return clone;
  };

  // ============================================================================
  // Supply Analysis Methods
  // ============================================================================

  const createSupplyAnalysis = async (data: SupplyAnalysis): Promise<SupplyAnalysis> => {
    const analysis = await SupplyAnalysisService.createAnalysis(data);
    setSupplyAnalyses([...supplyAnalyses, analysis]);
    return analysis;
  };

  const updateSupplyAnalysis = async (id: string, updates: Partial<SupplyAnalysis>): Promise<SupplyAnalysis> => {
    const updated = await SupplyAnalysisService.updateAnalysis(id, updates);
    setSupplyAnalyses(supplyAnalyses.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const deleteSupplyAnalysis = async (id: string): Promise<void> => {
    await SupplyAnalysisService.deleteAnalysis(id);
    setSupplyAnalyses(supplyAnalyses.filter((a) => a.id !== id));
  };

  const runSupplyAnalysis = async (id: string): Promise<SupplyAnalysis> => {
    const result = await SupplyAnalysisService.runAnalysis(id);
    setSupplyAnalyses(supplyAnalyses.map((a) => (a.id === id ? result : a)));
    return result;
  };

  // ============================================================================
  // Gap Analysis Methods
  // ============================================================================

  const createGapAnalysis = async (data: GapAnalysis): Promise<GapAnalysis> => {
    const analysis = await GapAnalysisService.createAnalysis(data);
    setGapAnalyses([...gapAnalyses, analysis]);
    return analysis;
  };

  const updateGapAnalysis = async (id: string, updates: Partial<GapAnalysis>): Promise<GapAnalysis> => {
    const updated = await GapAnalysisService.updateAnalysis(id, updates);
    setGapAnalyses(gapAnalyses.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const deleteGapAnalysis = async (id: string): Promise<void> => {
    await GapAnalysisService.deleteAnalysis(id);
    setGapAnalyses(gapAnalyses.filter((a) => a.id !== id));
  };

  const calculateGaps = async (demandForecastId: string, supplyAnalysisId: string): Promise<GapAnalysis> => {
    const analysis = await GapAnalysisService.calculateGaps(demandForecastId, supplyAnalysisId);
    setGapAnalyses([...gapAnalyses, analysis]);
    return analysis;
  };

  // ============================================================================
  // Scenario Modeling Methods
  // ============================================================================

  const createScenario = async (data: ScenarioModel): Promise<ScenarioModel> => {
    const scenario = await ScenarioModelingService.createScenario(data);
    setScenarios([...scenarios, scenario]);
    return scenario;
  };

  const updateScenario = async (id: string, updates: Partial<ScenarioModel>): Promise<ScenarioModel> => {
    const updated = await ScenarioModelingService.updateScenario(id, updates);
    setScenarios(scenarios.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteScenario = async (id: string): Promise<void> => {
    await ScenarioModelingService.deleteScenario(id);
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const runScenario = async (id: string): Promise<ScenarioModel> => {
    const result = await ScenarioModelingService.runScenario(id);
    setScenarios(scenarios.map((s) => (s.id === id ? result : s)));
    return result;
  };

  const compareScenarios = async (scenarioIds: string[]): Promise<any> => {
    return ScenarioModelingService.compareScenarios(scenarioIds);
  };

  const cloneScenario = async (id: string, newName: string): Promise<ScenarioModel> => {
    const clone = await ScenarioModelingService.cloneScenario(id, newName);
    setScenarios([...scenarios, clone]);
    return clone;
  };

  // ============================================================================
  // Succession Readiness Methods
  // ============================================================================

  const createSuccessionAssessment = async (data: SuccessionReadiness): Promise<SuccessionReadiness> => {
    const assessment = await SuccessionReadinessService.createAssessment(data);
    setSuccessionAssessments([...successionAssessments, assessment]);
    return assessment;
  };

  const updateSuccessionAssessment = async (
    id: string,
    updates: Partial<SuccessionReadiness>
  ): Promise<SuccessionReadiness> => {
    const updated = await SuccessionReadinessService.updateAssessment(id, updates);
    setSuccessionAssessments(successionAssessments.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const deleteSuccessionAssessment = async (id: string): Promise<void> => {
    await SuccessionReadinessService.deleteAssessment(id);
    setSuccessionAssessments(successionAssessments.filter((a) => a.id !== id));
  };

  const assessSuccessionReadiness = async (id: string): Promise<SuccessionReadiness> => {
    const result = await SuccessionReadinessService.assessSuccessionReadiness(id);
    setSuccessionAssessments(successionAssessments.map((a) => (a.id === id ? result : a)));
    return result;
  };

  // ============================================================================
  // Talent Acquisition Plan Methods
  // ============================================================================

  const createAcquisitionPlan = async (data: TalentAcquisitionPlan): Promise<TalentAcquisitionPlan> => {
    const plan = await TalentAcquisitionPlanService.createPlan(data);
    setAcquisitionPlans([...acquisitionPlans, plan]);
    return plan;
  };

  const updateAcquisitionPlan = async (
    id: string,
    updates: Partial<TalentAcquisitionPlan>
  ): Promise<TalentAcquisitionPlan> => {
    const updated = await TalentAcquisitionPlanService.updatePlan(id, updates);
    setAcquisitionPlans(acquisitionPlans.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteAcquisitionPlan = async (id: string): Promise<void> => {
    await TalentAcquisitionPlanService.deletePlan(id);
    setAcquisitionPlans(acquisitionPlans.filter((p) => p.id !== id));
  };

  const generateAcquisitionPlan = async (gapAnalysisId: string): Promise<TalentAcquisitionPlan> => {
    const plan = await TalentAcquisitionPlanService.generateFromGapAnalysis(gapAnalysisId);
    setAcquisitionPlans([...acquisitionPlans, plan]);
    return plan;
  };

  const trackHire = async (planId: string, roleId: string): Promise<void> => {
    await TalentAcquisitionPlanService.trackHire(planId, roleId);
    const updatedPlans = await TalentAcquisitionPlanService.getPlans();
    setAcquisitionPlans(updatedPlans);
  };

  // ============================================================================
  // Settings Methods
  // ============================================================================

  const updateSettings = async (updates: Partial<WorkforcePlanningSettings>): Promise<WorkforcePlanningSettings> => {
    const updated = await WorkforcePlanningSettingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  return {
    // Demand Forecasting
    forecasts,
    createForecast,
    updateForecast,
    deleteForecast,
    approveForecast,
    rejectForecast,
    cloneForecast,

    // Supply Analysis
    supplyAnalyses,
    createSupplyAnalysis,
    updateSupplyAnalysis,
    deleteSupplyAnalysis,
    runSupplyAnalysis,

    // Gap Analysis
    gapAnalyses,
    createGapAnalysis,
    updateGapAnalysis,
    deleteGapAnalysis,
    calculateGaps,

    // Scenario Modeling
    scenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    runScenario,
    compareScenarios,
    cloneScenario,

    // Succession Readiness
    successionAssessments,
    createSuccessionAssessment,
    updateSuccessionAssessment,
    deleteSuccessionAssessment,
    assessSuccessionReadiness,

    // Talent Acquisition Plans
    acquisitionPlans,
    createAcquisitionPlan,
    updateAcquisitionPlan,
    deleteAcquisitionPlan,
    generateAcquisitionPlan,
    trackHire,

    // Global
    metrics,
    settings,
    updateSettings,
    loading,
    error,
    refreshData: initializeData,
  };
}
