// Org Design Module - Custom React Hook
// Manages state and business logic for all organizational design operations

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  OrgChart,
  OrgNode,
  OrgChartView,
  Scenario,
  ScenarioChange,
  SpanOfControl,
  Position,
  MatrixStructure,
  MatrixRelationship,
  DecisionRight,
  SuccessionPool,
  PoolMember,
  DevelopmentPlan,
  OrgAnalytics,
  ChangeManagement,
  AffectedEmployee,
  OrgDesignSettings,
  Toast} from '../types';
import {
  OrgChartFilter,
  ScenarioImpact,
  SpanRecommendation,
  PositionHierarchy,
  ImpactAssessment
} from '../types';
import {
  OrgChartService,
  ScenarioService,
  SpanOfControlService,
  PositionHierarchyService,
  MatrixStructureService,
  SuccessionPoolService,
  OrgAnalyticsService,
  ChangeManagementService,
  OrgDesignSettingsService,
} from '../services';
import {
  sampleOrgCharts,
  sampleScenarios,
  sampleSpanOfControl,
  samplePositions,
  sampleMatrixStructure,
  sampleSuccessionPool,
  sampleOrgAnalytics,
  sampleChangeManagement,
  sampleSettings,
} from '../data';

export const useOrgDesign = () => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Org Charts
  const [orgCharts, setOrgCharts] = useState<OrgChart[]>([]);
  const [currentChart, setCurrentChart] = useState<OrgChart | null>(null);
  const [selectedChart, setSelectedChart] = useState<OrgChart | null>(null);
  const [orgChartViews, setOrgChartViews] = useState<OrgChartView[]>([]);

  // Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Span of Control
  const [spanAnalyses, setSpanAnalyses] = useState<SpanOfControl[]>([]);
  const [currentSpanAnalysis, setCurrentSpanAnalysis] = useState<SpanOfControl | null>(null);

  // Positions
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Matrix
  const [matrixStructures, setMatrixStructures] = useState<MatrixStructure[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<MatrixStructure | null>(null);

  // Succession Pools
  const [successionPools, setSuccessionPools] = useState<SuccessionPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<SuccessionPool | null>(null);

  // Analytics
  const [orgAnalytics, setOrgAnalytics] = useState<OrgAnalytics | null>(null);

  // Change Management
  const [changes, setChanges] = useState<ChangeManagement[]>([]);
  const [selectedChange, setSelectedChange] = useState<ChangeManagement | null>(null);

  // Settings
  const [settings, setSettings] = useState<OrgDesignSettings | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load sample data on first run
      const charts = await OrgChartService.getAllOrgCharts();
      if (charts.length === 0) {
        // Initialize with sample data
        for (const chart of sampleOrgCharts) {
          await OrgChartService.createOrgChart(chart);
        }
        for (const scenario of sampleScenarios) {
          await ScenarioService.createScenario(scenario);
        }
        for (const position of samplePositions) {
          await PositionHierarchyService.createPosition(position);
        }
        await MatrixStructureService.createMatrixStructure(sampleMatrixStructure);
        await SuccessionPoolService.createSuccessionPool(sampleSuccessionPool);
        for (const change of sampleChangeManagement) {
          await ChangeManagementService.createChange(change);
        }
      }

      // Load all data
      await Promise.all([
        loadOrgCharts(),
        loadScenarios(),
        loadPositions(),
        loadMatrixStructures(),
        loadSuccessionPools(),
        loadChanges(),
        loadSettings(),
        loadAnalytics(),
      ]);
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      addToast({
        type: 'error',
        message: 'Failed to load organizational design data',
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ORG CHART OPERATIONS
  // ============================================================================

  const loadOrgCharts = async () => {
    try {
      const charts = await OrgChartService.getAllOrgCharts();
      setOrgCharts(charts);

      const current = await OrgChartService.getCurrentOrgChart();
      setCurrentChart(current);
      setSelectedChart(current);
    } catch (error: any) {
      console.error('Error loading org charts:', error);
      addToast({ type: 'error', message: 'Failed to load org charts' });
    }
  };

  const createOrgChart = async (chartData: Partial<OrgChart>) => {
    setLoading(true);
    try {
      const newChart = await OrgChartService.createOrgChart(chartData);
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: `Org chart "${newChart.chartName}" created successfully`,
      });
      return newChart;
    } catch (error: any) {
      console.error('Error creating org chart:', error);
      addToast({ type: 'error', message: 'Failed to create org chart' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrgChart = async (chartId: string, updates: Partial<OrgChart>) => {
    setLoading(true);
    try {
      const updated = await OrgChartService.updateOrgChart(chartId, updates);
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: 'Org chart updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating org chart:', error);
      addToast({ type: 'error', message: 'Failed to update org chart' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrgChart = async (chartId: string) => {
    setLoading(true);
    try {
      await OrgChartService.deleteOrgChart(chartId);
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: 'Org chart deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting org chart:', error);
      addToast({ type: 'error', message: 'Failed to delete org chart' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addNodeToChart = async (chartId: string, node: OrgNode) => {
    setLoading(true);
    try {
      await OrgChartService.addNode(chartId, node);
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: `Position "${node.positionTitle}" added to org chart`,
      });
    } catch (error: any) {
      console.error('Error adding node:', error);
      addToast({ type: 'error', message: 'Failed to add position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateNode = async (
    chartId: string,
    nodeId: string,
    updates: Partial<OrgNode>
  ) => {
    setLoading(true);
    try {
      await OrgChartService.updateNode(chartId, nodeId, updates);
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: 'Position updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating node:', error);
      addToast({ type: 'error', message: 'Failed to update position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteNode = async (chartId: string, nodeId: string) => {
    setLoading(true);
    try {
      await OrgChartService.deleteNode(chartId, nodeId);
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: 'Position removed from org chart',
      });
    } catch (error: any) {
      console.error('Error deleting node:', error);
      addToast({ type: 'error', message: 'Failed to remove position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const moveNode = async (
    chartId: string,
    nodeId: string,
    newParentId: string
  ) => {
    setLoading(true);
    try {
      await OrgChartService.moveNode(chartId, nodeId, newParentId);
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: 'Position moved successfully',
      });
    } catch (error: any) {
      console.error('Error moving node:', error);
      addToast({ type: 'error', message: 'Failed to move position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportOrgChart = async (
    chartId: string,
    format: 'pdf' | 'png' | 'svg' | 'excel'
  ) => {
    setLoading(true);
    try {
      const blob = await OrgChartService.exportOrgChart(chartId, format);
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `org-chart-${chartId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        message: `Org chart exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error('Error exporting org chart:', error);
      addToast({ type: 'error', message: 'Failed to export org chart' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SCENARIO OPERATIONS
  // ============================================================================

  const loadScenarios = async () => {
    try {
      const scenarioList = await ScenarioService.getAllScenarios();
      setScenarios(scenarioList);
    } catch (error: any) {
      console.error('Error loading scenarios:', error);
      addToast({ type: 'error', message: 'Failed to load scenarios' });
    }
  };

  const createScenario = async (scenarioData: Partial<Scenario>) => {
    setLoading(true);
    try {
      const newScenario = await ScenarioService.createScenario(scenarioData);
      await loadScenarios();
      addToast({
        type: 'success',
        message: `Scenario "${newScenario.scenarioName}" created successfully`,
      });
      return newScenario;
    } catch (error: any) {
      console.error('Error creating scenario:', error);
      addToast({ type: 'error', message: 'Failed to create scenario' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateScenario = async (scenarioId: string, updates: Partial<Scenario>) => {
    setLoading(true);
    try {
      const updated = await ScenarioService.updateScenario(scenarioId, updates);
      await loadScenarios();
      addToast({
        type: 'success',
        message: 'Scenario updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating scenario:', error);
      addToast({ type: 'error', message: 'Failed to update scenario' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteScenario = async (scenarioId: string) => {
    setLoading(true);
    try {
      await ScenarioService.deleteScenario(scenarioId);
      await loadScenarios();
      addToast({
        type: 'success',
        message: 'Scenario deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting scenario:', error);
      addToast({ type: 'error', message: 'Failed to delete scenario' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addChangeToScenario = async (
    scenarioId: string,
    change: ScenarioChange
  ) => {
    setLoading(true);
    try {
      await ScenarioService.addChange(scenarioId, change);
      await loadScenarios();
      addToast({
        type: 'success',
        message: 'Change added to scenario',
      });
    } catch (error: any) {
      console.error('Error adding change:', error);
      addToast({ type: 'error', message: 'Failed to add change' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const calculateScenarioImpact = async (scenarioId: string) => {
    setLoading(true);
    try {
      const impact = await ScenarioService.calculateImpact(scenarioId);
      await loadScenarios();
      addToast({
        type: 'success',
        message: 'Impact analysis completed',
      });
      return impact;
    } catch (error: any) {
      console.error('Error calculating impact:', error);
      addToast({ type: 'error', message: 'Failed to calculate impact' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveScenario = async (scenarioId: string) => {
    setLoading(true);
    try {
      await ScenarioService.approveScenario(scenarioId);
      await loadScenarios();
      addToast({
        type: 'success',
        message: 'Scenario approved successfully',
      });
    } catch (error: any) {
      console.error('Error approving scenario:', error);
      addToast({ type: 'error', message: 'Failed to approve scenario' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const implementScenario = async (scenarioId: string) => {
    setLoading(true);
    try {
      await ScenarioService.implementScenario(scenarioId);
      await loadScenarios();
      await loadOrgCharts();
      addToast({
        type: 'success',
        message: 'Scenario implemented successfully',
      });
    } catch (error: any) {
      console.error('Error implementing scenario:', error);
      addToast({ type: 'error', message: 'Failed to implement scenario' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const compareScenarios = async (scenarioIds: string[]) => {
    setLoading(true);
    try {
      const comparison = await ScenarioService.compareScenarios(scenarioIds);
      addToast({
        type: 'success',
        message: 'Scenario comparison complete',
      });
      return comparison;
    } catch (error: any) {
      console.error('Error comparing scenarios:', error);
      addToast({ type: 'error', message: 'Failed to compare scenarios' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SPAN OF CONTROL OPERATIONS
  // ============================================================================

  const analyzeSpanOfControl = async (chartId: string) => {
    setLoading(true);
    try {
      const analysis = await SpanOfControlService.analyzeSpanOfControl(chartId);
      setCurrentSpanAnalysis(analysis);
      addToast({
        type: 'success',
        message: 'Span of control analysis completed',
      });
      return analysis;
    } catch (error: any) {
      console.error('Error analyzing span:', error);
      addToast({
        type: 'error',
        message: 'Failed to analyze span of control',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // POSITION HIERARCHY OPERATIONS
  // ============================================================================

  const loadPositions = async () => {
    try {
      const positionList = await PositionHierarchyService.getAllPositions();
      setPositions(positionList);
    } catch (error: any) {
      console.error('Error loading positions:', error);
      addToast({ type: 'error', message: 'Failed to load positions' });
    }
  };

  const createPosition = async (positionData: Partial<Position>) => {
    setLoading(true);
    try {
      const newPosition = await PositionHierarchyService.createPosition(
        positionData
      );
      await loadPositions();
      addToast({
        type: 'success',
        message: `Position "${newPosition.positionTitle}" created successfully`,
      });
      return newPosition;
    } catch (error: any) {
      console.error('Error creating position:', error);
      addToast({ type: 'error', message: 'Failed to create position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = async (
    positionId: string,
    updates: Partial<Position>
  ) => {
    setLoading(true);
    try {
      const updated = await PositionHierarchyService.updatePosition(
        positionId,
        updates
      );
      await loadPositions();
      addToast({
        type: 'success',
        message: 'Position updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating position:', error);
      addToast({ type: 'error', message: 'Failed to update position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePosition = async (positionId: string) => {
    setLoading(true);
    try {
      await PositionHierarchyService.deletePosition(positionId);
      await loadPositions();
      addToast({
        type: 'success',
        message: 'Position deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting position:', error);
      addToast({ type: 'error', message: 'Failed to delete position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchPositions = async (query: string, filters?: any) => {
    setLoading(true);
    try {
      const results = await PositionHierarchyService.searchPositions(
        query,
        filters
      );
      return results;
    } catch (error: any) {
      console.error('Error searching positions:', error);
      addToast({ type: 'error', message: 'Failed to search positions' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // MATRIX STRUCTURE OPERATIONS
  // ============================================================================

  const loadMatrixStructures = async () => {
    try {
      const structures = await MatrixStructureService.getAllMatrixStructures();
      setMatrixStructures(structures);
    } catch (error: any) {
      console.error('Error loading matrix structures:', error);
      addToast({ type: 'error', message: 'Failed to load matrix structures' });
    }
  };

  const createMatrixStructure = async (structureData: Partial<MatrixStructure>) => {
    setLoading(true);
    try {
      const newStructure = await MatrixStructureService.createMatrixStructure(
        structureData
      );
      await loadMatrixStructures();
      addToast({
        type: 'success',
        message: `Matrix structure "${newStructure.matrixName}" created successfully`,
      });
      return newStructure;
    } catch (error: any) {
      console.error('Error creating matrix structure:', error);
      addToast({ type: 'error', message: 'Failed to create matrix structure' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMatrixStructure = async (
    matrixId: string,
    updates: Partial<MatrixStructure>
  ) => {
    setLoading(true);
    try {
      const updated = await MatrixStructureService.updateMatrixStructure(
        matrixId,
        updates
      );
      await loadMatrixStructures();
      addToast({
        type: 'success',
        message: 'Matrix structure updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating matrix structure:', error);
      addToast({ type: 'error', message: 'Failed to update matrix structure' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMatrixStructure = async (matrixId: string) => {
    setLoading(true);
    try {
      await MatrixStructureService.deleteMatrixStructure(matrixId);
      await loadMatrixStructures();
      addToast({
        type: 'success',
        message: 'Matrix structure deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting matrix structure:', error);
      addToast({ type: 'error', message: 'Failed to delete matrix structure' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addMatrixRelationship = async (
    matrixId: string,
    relationship: MatrixRelationship
  ) => {
    setLoading(true);
    try {
      await MatrixStructureService.addMatrixRelationship(matrixId, relationship);
      await loadMatrixStructures();
      addToast({
        type: 'success',
        message: 'Matrix relationship added successfully',
      });
    } catch (error: any) {
      console.error('Error adding matrix relationship:', error);
      addToast({ type: 'error', message: 'Failed to add matrix relationship' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addDecisionRight = async (matrixId: string, decisionRight: DecisionRight) => {
    setLoading(true);
    try {
      await MatrixStructureService.addDecisionRight(matrixId, decisionRight);
      await loadMatrixStructures();
      addToast({
        type: 'success',
        message: 'Decision right added successfully',
      });
    } catch (error: any) {
      console.error('Error adding decision right:', error);
      addToast({ type: 'error', message: 'Failed to add decision right' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SUCCESSION POOL OPERATIONS
  // ============================================================================

  const loadSuccessionPools = async () => {
    try {
      const pools = await SuccessionPoolService.getAllSuccessionPools();
      setSuccessionPools(pools);
    } catch (error: any) {
      console.error('Error loading succession pools:', error);
      addToast({ type: 'error', message: 'Failed to load succession pools' });
    }
  };

  const createSuccessionPool = async (poolData: Partial<SuccessionPool>) => {
    setLoading(true);
    try {
      const newPool = await SuccessionPoolService.createSuccessionPool(poolData);
      await loadSuccessionPools();
      addToast({
        type: 'success',
        message: `Succession pool "${newPool.poolName}" created successfully`,
      });
      return newPool;
    } catch (error: any) {
      console.error('Error creating succession pool:', error);
      addToast({ type: 'error', message: 'Failed to create succession pool' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSuccessionPool = async (
    poolId: string,
    updates: Partial<SuccessionPool>
  ) => {
    setLoading(true);
    try {
      const updated = await SuccessionPoolService.updateSuccessionPool(
        poolId,
        updates
      );
      await loadSuccessionPools();
      addToast({
        type: 'success',
        message: 'Succession pool updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating succession pool:', error);
      addToast({ type: 'error', message: 'Failed to update succession pool' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSuccessionPool = async (poolId: string) => {
    setLoading(true);
    try {
      await SuccessionPoolService.deleteSuccessionPool(poolId);
      await loadSuccessionPools();
      addToast({
        type: 'success',
        message: 'Succession pool deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting succession pool:', error);
      addToast({ type: 'error', message: 'Failed to delete succession pool' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPoolMember = async (poolId: string, member: PoolMember) => {
    setLoading(true);
    try {
      await SuccessionPoolService.addMember(poolId, member);
      await loadSuccessionPools();
      addToast({
        type: 'success',
        message: `${member.employeeName} added to succession pool`,
      });
    } catch (error: any) {
      console.error('Error adding pool member:', error);
      addToast({ type: 'error', message: 'Failed to add pool member' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removePoolMember = async (poolId: string, memberId: string) => {
    setLoading(true);
    try {
      await SuccessionPoolService.removeMember(poolId, memberId);
      await loadSuccessionPools();
      addToast({
        type: 'success',
        message: 'Member removed from succession pool',
      });
    } catch (error: any) {
      console.error('Error removing pool member:', error);
      addToast({ type: 'error', message: 'Failed to remove pool member' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDevelopmentPlan = async (
    poolId: string,
    memberId: string,
    plan: DevelopmentPlan
  ) => {
    setLoading(true);
    try {
      await SuccessionPoolService.updateDevelopmentPlan(poolId, memberId, plan);
      await loadSuccessionPools();
      addToast({
        type: 'success',
        message: 'Development plan updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating development plan:', error);
      addToast({ type: 'error', message: 'Failed to update development plan' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  const loadAnalytics = async (chartId?: string) => {
    setLoading(true);
    try {
      const analytics = await OrgAnalyticsService.getOrgAnalytics(chartId);
      setOrgAnalytics(analytics);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      addToast({ type: 'error', message: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsReport = async (
    format: 'pdf' | 'excel' | 'powerpoint'
  ) => {
    setLoading(true);
    try {
      const blob = await OrgAnalyticsService.exportAnalyticsReport(format);
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `org-analytics.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        message: `Analytics report exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error('Error exporting analytics:', error);
      addToast({ type: 'error', message: 'Failed to export analytics report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CHANGE MANAGEMENT OPERATIONS
  // ============================================================================

  const loadChanges = async () => {
    try {
      const changeList = await ChangeManagementService.getAllChanges();
      setChanges(changeList);
    } catch (error: any) {
      console.error('Error loading changes:', error);
      addToast({ type: 'error', message: 'Failed to load changes' });
    }
  };

  const createChange = async (changeData: Partial<ChangeManagement>) => {
    setLoading(true);
    try {
      const newChange = await ChangeManagementService.createChange(changeData);
      await loadChanges();
      addToast({
        type: 'success',
        message: `Change "${newChange.changeTitle}" created successfully`,
      });
      return newChange;
    } catch (error: any) {
      console.error('Error creating change:', error);
      addToast({ type: 'error', message: 'Failed to create change' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateChange = async (
    changeId: string,
    updates: Partial<ChangeManagement>
  ) => {
    setLoading(true);
    try {
      const updated = await ChangeManagementService.updateChange(
        changeId,
        updates
      );
      await loadChanges();
      addToast({
        type: 'success',
        message: 'Change updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating change:', error);
      addToast({ type: 'error', message: 'Failed to update change' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteChange = async (changeId: string) => {
    setLoading(true);
    try {
      await ChangeManagementService.deleteChange(changeId);
      await loadChanges();
      addToast({
        type: 'success',
        message: 'Change deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting change:', error);
      addToast({ type: 'error', message: 'Failed to delete change' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const assessChangeImpact = async (changeId: string) => {
    setLoading(true);
    try {
      const assessment = await ChangeManagementService.assessImpact(changeId);
      await loadChanges();
      addToast({
        type: 'success',
        message: 'Impact assessment completed',
      });
      return assessment;
    } catch (error: any) {
      console.error('Error assessing impact:', error);
      addToast({ type: 'error', message: 'Failed to assess impact' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addAffectedEmployee = async (
    changeId: string,
    employee: AffectedEmployee
  ) => {
    setLoading(true);
    try {
      await ChangeManagementService.addAffectedEmployee(changeId, employee);
      await loadChanges();
      addToast({
        type: 'success',
        message: 'Affected employee added',
      });
    } catch (error: any) {
      console.error('Error adding affected employee:', error);
      addToast({ type: 'error', message: 'Failed to add affected employee' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SETTINGS OPERATIONS
  // ============================================================================

  const loadSettings = async () => {
    try {
      const settingsData = await OrgDesignSettingsService.getSettings();
      setSettings(settingsData);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      addToast({ type: 'error', message: 'Failed to load settings' });
    }
  };

  const updateSettings = async (updates: Partial<OrgDesignSettings>) => {
    setLoading(true);
    try {
      const updated = await OrgDesignSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({
        type: 'success',
        message: 'Settings updated successfully',
      });
      return updated;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TOAST OPERATIONS
  // ============================================================================

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    orgCharts,
    currentChart,
    selectedChart,
    setSelectedChart,
    scenarios,
    selectedScenario,
    setSelectedScenario,
    spanAnalyses,
    currentSpanAnalysis,
    positions,
    selectedPosition,
    setSelectedPosition,
    matrixStructures,
    selectedMatrix,
    setSelectedMatrix,
    successionPools,
    selectedPool,
    setSelectedPool,
    orgAnalytics,
    changes,
    selectedChange,
    setSelectedChange,
    settings,
    loading,
    toasts,

    // Org Chart Operations
    loadOrgCharts,
    createOrgChart,
    updateOrgChart,
    deleteOrgChart,
    addNodeToChart,
    updateNode,
    deleteNode,
    moveNode,
    exportOrgChart,

    // Scenario Operations
    loadScenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    addChangeToScenario,
    calculateScenarioImpact,
    approveScenario,
    implementScenario,
    compareScenarios,

    // Span of Control Operations
    analyzeSpanOfControl,

    // Position Operations
    loadPositions,
    createPosition,
    updatePosition,
    deletePosition,
    searchPositions,

    // Matrix Operations
    loadMatrixStructures,
    createMatrixStructure,
    updateMatrixStructure,
    deleteMatrixStructure,
    addMatrixRelationship,
    addDecisionRight,

    // Succession Pool Operations
    loadSuccessionPools,
    createSuccessionPool,
    updateSuccessionPool,
    deleteSuccessionPool,
    addPoolMember,
    removePoolMember,
    updateDevelopmentPlan,

    // Analytics Operations
    loadAnalytics,
    exportAnalyticsReport,

    // Change Management Operations
    loadChanges,
    createChange,
    updateChange,
    deleteChange,
    assessChangeImpact,
    addAffectedEmployee,

    // Settings Operations
    loadSettings,
    updateSettings,

    // Toast Operations
    addToast,
    removeToast,
  };
};
