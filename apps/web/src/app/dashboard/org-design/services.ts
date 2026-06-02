// Org Design Module - Service Layer - API Integrated
// Handles all business logic and data operations for organizational design

import { APIClient } from '@/lib/api-client';
import type {
  OrgChart,
  OrgNode,
  OrgChartView,
  Scenario,
  ScenarioChange,
  ScenarioImpact,
  SpanOfControl,
  SpanRecommendation,
  PositionHierarchy,
  Position,
  MatrixStructure,
  MatrixRelationship,
  DecisionRight,
  SuccessionPool,
  PoolMember,
  DevelopmentPlan,
  OrgAnalytics,
  ChangeManagement,
  ImpactAssessment,
  AffectedEmployee,
  OrgDesignSettings} from './types';
import {
  OrgChartFilter,
  SpanMetrics,
  HierarchyLevel
} from './types';

// ============================================================================
// ORG CHART SERVICE
// ============================================================================

export class OrgChartService {
  private static endpoint = '/org-design/charts';

  static async getAllOrgCharts(): Promise<OrgChart[]> {
    try {
      const response = await APIClient.get<{ charts?: OrgChart[] }>(this.endpoint);
      return response.charts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getOrgChartById(chartId: string): Promise<OrgChart | null> {
    try {
      const response = await APIClient.get<{ chart?: OrgChart }>(`${this.endpoint}/${chartId}`);
      return response.chart || null;
    } catch (error: any) {
            return null;
    }
  }

  static async getCurrentOrgChart(): Promise<OrgChart | null> {
    try {
      const response = await APIClient.get<{ chart?: OrgChart }>(`${this.endpoint}/current`);
      return response.chart || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createOrgChart(chartData: Partial<OrgChart>): Promise<OrgChart> {
    const response = await APIClient.post<{ chart: OrgChart }>(this.endpoint, chartData);
    return response.chart;
  }

  static async updateOrgChart(chartId: string, updates: Partial<OrgChart>): Promise<OrgChart> {
    const response = await APIClient.put<{ chart: OrgChart }>(`${this.endpoint}/${chartId}`, updates);
    return response.chart;
  }

  static async deleteOrgChart(chartId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${chartId}`);
  }

  static async addNode(chartId: string, node: OrgNode): Promise<OrgChart> {
    const response = await APIClient.post<{ chart: OrgChart }>(`${this.endpoint}/${chartId}/nodes`, node);
    return response.chart;
  }

  static async updateNode(chartId: string, nodeId: string, updates: Partial<OrgNode>): Promise<OrgChart> {
    const response = await APIClient.put<{ chart: OrgChart }>(`${this.endpoint}/${chartId}/nodes/${nodeId}`, updates);
    return response.chart;
  }

  static async deleteNode(chartId: string, nodeId: string): Promise<OrgChart> {
    const response = await APIClient.delete<{ chart: OrgChart }>(`${this.endpoint}/${chartId}/nodes/${nodeId}`);
    return response.chart;
  }

  static async moveNode(chartId: string, nodeId: string, newParentId: string): Promise<OrgChart> {
    const response = await APIClient.put<{ chart: OrgChart }>(`${this.endpoint}/${chartId}/nodes/${nodeId}/move`, { newParentId });
    return response.chart;
  }

  static async getOrgChartViews(chartId: string): Promise<OrgChartView[]> {
    try {
      const response = await APIClient.get<{ views?: OrgChartView[] }>(`${this.endpoint}/${chartId}/views`);
      return response.views || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createOrgChartView(viewData: Partial<OrgChartView>): Promise<OrgChartView> {
    const response = await APIClient.post<{ view: OrgChartView }>(`${this.endpoint}/views`, viewData);
    return response.view;
  }

  static async exportOrgChart(chartId: string, format: 'pdf' | 'png' | 'svg' | 'excel'): Promise<Blob> {
    const response = await APIClient.get<Blob>(`${this.endpoint}/${chartId}/export`, { format });
    return response as unknown as Blob;
  }
}

// ============================================================================
// SCENARIO SERVICE
// ============================================================================

export class ScenarioService {
  private static endpoint = '/org-design/scenarios';

  static async getAllScenarios(): Promise<Scenario[]> {
    try {
      const response = await APIClient.get<{ scenarios?: Scenario[] }>(this.endpoint);
      return response.scenarios || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getScenarioById(scenarioId: string): Promise<Scenario | null> {
    try {
      const response = await APIClient.get<{ scenario?: Scenario }>(`${this.endpoint}/${scenarioId}`);
      return response.scenario || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createScenario(scenarioData: Partial<Scenario>): Promise<Scenario> {
    const response = await APIClient.post<{ scenario: Scenario }>(this.endpoint, scenarioData);
    return response.scenario;
  }

  static async updateScenario(scenarioId: string, updates: Partial<Scenario>): Promise<Scenario> {
    const response = await APIClient.put<{ scenario: Scenario }>(`${this.endpoint}/${scenarioId}`, updates);
    return response.scenario;
  }

  static async deleteScenario(scenarioId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${scenarioId}`);
  }

  static async addChange(scenarioId: string, change: ScenarioChange): Promise<Scenario> {
    const response = await APIClient.post<{ scenario: Scenario }>(`${this.endpoint}/${scenarioId}/changes`, change);
    return response.scenario;
  }

  static async calculateImpact(scenarioId: string): Promise<ScenarioImpact> {
    const response = await APIClient.post<{ impact: ScenarioImpact }>(`${this.endpoint}/${scenarioId}/calculate-impact`);
    return response.impact;
  }

  static async approveScenario(scenarioId: string): Promise<Scenario> {
    const response = await APIClient.post<{ scenario: Scenario }>(`${this.endpoint}/${scenarioId}/approve`);
    return response.scenario;
  }

  static async implementScenario(scenarioId: string): Promise<Scenario> {
    const response = await APIClient.post<{ scenario: Scenario }>(`${this.endpoint}/${scenarioId}/implement`);
    return response.scenario;
  }

  static async compareScenarios(scenarioIds: string[]): Promise<{ scenarios: Scenario[]; comparison: any }> {
    const response = await APIClient.post<{ scenarios: Scenario[]; comparison: any }>(`${this.endpoint}/compare`, { scenarioIds });
    return response;
  }
}

// ============================================================================
// SPAN OF CONTROL SERVICE
// ============================================================================

export class SpanOfControlService {
  private static endpoint = '/org-design/span-analysis';

  static async getAllSpanAnalyses(): Promise<SpanOfControl[]> {
    try {
      const response = await APIClient.get<{ analyses?: SpanOfControl[] }>(this.endpoint);
      return response.analyses || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getSpanAnalysisById(analysisId: string): Promise<SpanOfControl | null> {
    try {
      const response = await APIClient.get<{ analysis?: SpanOfControl }>(`${this.endpoint}/${analysisId}`);
      return response.analysis || null;
    } catch (error: any) {
            return null;
    }
  }

  static async analyzeSpanOfControl(chartId: string): Promise<SpanOfControl> {
    const response = await APIClient.post<{ analysis: SpanOfControl }>(this.endpoint, { chartId });
    return response.analysis;
  }

  private static calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private static analyzeLevelSpan(nodes: OrgNode[], settings: any): any[] {
    const levels = new Map<number, OrgNode[]>();
    nodes.forEach((node) => {
      if (!levels.has(node.level)) {
        levels.set(node.level, []);
      }
      levels.get(node.level)!.push(node);
    });

    return Array.from(levels.entries()).map(([level, levelNodes]) => {
      const managers = levelNodes.filter((n) => n.directReports > 0);
      const spans = managers.map((m) => m.spanOfControl);

      return {
        level,
        levelName: `Level ${level}`,
        managerCount: managers.length,
        averageSpan: spans.reduce((sum, s) => sum + s, 0) / spans.length || 0,
        minSpan: spans.length ? Math.min(...spans) : 0,
        maxSpan: spans.length ? Math.max(...spans) : 0,
        idealRange: {
          min: settings.spanSettings.idealSpanMin,
          max: settings.spanSettings.idealSpanMax,
        },
        complianceRate:
          spans.length > 0
            ? (spans.filter(
                (s) =>
                  s >= settings.spanSettings.idealSpanMin &&
                  s <= settings.spanSettings.idealSpanMax
              ).length /
                spans.length) *
              100
            : 0,
      };
    });
  }

  private static analyzeDepartmentSpan(nodes: OrgNode[]): any[] {
    const departments = new Map<string, OrgNode[]>();
    nodes.forEach((node) => {
      if (!departments.has(node.department)) {
        departments.set(node.department, []);
      }
      departments.get(node.department)!.push(node);
    });

    return Array.from(departments.entries()).map(([dept, deptNodes]) => {
      const managers = deptNodes.filter((n) => n.directReports > 0);
      const spans = managers.map((m) => m.spanOfControl);
      const levels = new Set(deptNodes.map((n) => n.level)).size;

      return {
        departmentId: dept,
        departmentName: dept,
        managerCount: managers.length,
        averageSpan: spans.reduce((sum, s) => sum + s, 0) / spans.length || 0,
        totalEmployees: deptNodes.length,
        layers: levels,
        complianceRate: 85,
      };
    });
  }

  private static identifySpanIssues(nodes: OrgNode[], settings: any): any[] {
    const issues: any[] = [];

    nodes.forEach((node) => {
      if (node.directReports === 0) return;

      if (node.spanOfControl < settings.spanSettings.idealSpanMin) {
        issues.push({
          issueId: `issue-${node.nodeId}`,
          positionId: node.positionId,
          positionTitle: node.positionTitle,
          currentSpan: node.spanOfControl,
          recommendedSpan: settings.spanSettings.idealSpanMin,
          severity: 'medium',
          recommendation: 'Consider consolidating reporting structure',
        });
      } else if (node.spanOfControl > settings.spanSettings.idealSpanMax) {
        issues.push({
          issueId: `issue-${node.nodeId}`,
          positionId: node.positionId,
          positionTitle: node.positionTitle,
          currentSpan: node.spanOfControl,
          recommendedSpan: settings.spanSettings.idealSpanMax,
          severity: 'high',
          recommendation: 'Consider adding management layer',
        });
      }
    });

    return issues;
  }

  private static generateSpanRecommendations(
    nodes: OrgNode[],
    settings: any
  ): SpanRecommendation[] {
    const recommendations: SpanRecommendation[] = [];

    nodes.forEach((node) => {
      if (node.directReports === 0) return;

      let recommendedAction: any = 'acceptable';
      let targetSpan = node.spanOfControl;

      if (node.spanOfControl < settings.spanSettings.idealSpanMin) {
        recommendedAction = 'remove_layer';
        targetSpan = settings.spanSettings.idealSpanMin;
      } else if (node.spanOfControl > settings.spanSettings.idealSpanMax) {
        recommendedAction = 'add_layer';
        targetSpan = settings.spanSettings.idealSpanMax;
      }

      if (recommendedAction !== 'acceptable') {
        recommendations.push({
          recommendationId: `rec-${node.nodeId}`,
          positionId: node.positionId,
          positionTitle: node.positionTitle,
          currentSpan: node.spanOfControl,
          recommendedAction,
          targetSpan,
          rationale:
            recommendedAction === 'add_layer'
              ? 'Span too wide, manager may be overloaded'
              : 'Span too narrow, consider flatter structure',
          estimatedCost: recommendedAction === 'add_layer' ? 150000 : -75000,
          priority: node.spanOfControl > 12 ? 'high' : 'medium',
        });
      }
    });

    return recommendations;
  }
}

// ============================================================================
// POSITION HIERARCHY SERVICE
// ============================================================================

export class PositionHierarchyService {
  private static endpoint = '/org-design/positions';

  static async getAllHierarchies(): Promise<PositionHierarchy[]> {
    try {
      const response = await APIClient.get<{ hierarchies?: PositionHierarchy[] }>('/org-design/hierarchies');
      return response.hierarchies || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getHierarchyById(hierarchyId: string): Promise<PositionHierarchy | null> {
    try {
      const response = await APIClient.get<{ hierarchy?: PositionHierarchy }>(`/org-design/hierarchies/${hierarchyId}`);
      return response.hierarchy || null;
    } catch (error: any) {
            return null;
    }
  }

  static async getAllPositions(): Promise<Position[]> {
    try {
      const response = await APIClient.get<{ positions?: Position[] }>(this.endpoint);
      return response.positions || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getPositionById(positionId: string): Promise<Position | null> {
    try {
      const response = await APIClient.get<{ position?: Position }>(`${this.endpoint}/${positionId}`);
      return response.position || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createPosition(positionData: Partial<Position>): Promise<Position> {
    const response = await APIClient.post<{ position: Position }>(this.endpoint, positionData);
    return response.position;
  }

  static async updatePosition(positionId: string, updates: Partial<Position>): Promise<Position> {
    const response = await APIClient.put<{ position: Position }>(`${this.endpoint}/${positionId}`, updates);
    return response.position;
  }

  static async deletePosition(positionId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${positionId}`);
  }

  static async searchPositions(query: string, filters?: any): Promise<Position[]> {
    try {
      const response = await APIClient.get<{ positions?: Position[] }>(`${this.endpoint}/search`, { query, ...filters });
      return response.positions || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getHierarchyTree(rootPositionId?: string): Promise<Position[]> {
    try {
      const response = await APIClient.get<{ positions?: Position[] }>(`${this.endpoint}/tree`, { rootPositionId });
      return response.positions || [];
    } catch (error: any) {
            return [];
    }
  }
}

// ============================================================================
// MATRIX STRUCTURE SERVICE
// ============================================================================

export class MatrixStructureService {
  private static endpoint = '/org-design/matrix-structures';

  static async getAllMatrixStructures(): Promise<MatrixStructure[]> {
    try {
      const response = await APIClient.get<{ structures?: MatrixStructure[] }>(this.endpoint);
      return response.structures || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getMatrixStructureById(matrixId: string): Promise<MatrixStructure | null> {
    try {
      const response = await APIClient.get<{ structure?: MatrixStructure }>(`${this.endpoint}/${matrixId}`);
      return response.structure || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createMatrixStructure(structureData: Partial<MatrixStructure>): Promise<MatrixStructure> {
    const response = await APIClient.post<{ structure: MatrixStructure }>(this.endpoint, structureData);
    return response.structure;
  }

  static async updateMatrixStructure(matrixId: string, updates: Partial<MatrixStructure>): Promise<MatrixStructure> {
    const response = await APIClient.put<{ structure: MatrixStructure }>(`${this.endpoint}/${matrixId}`, updates);
    return response.structure;
  }

  static async deleteMatrixStructure(matrixId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${matrixId}`);
  }

  static async addMatrixRelationship(matrixId: string, relationship: MatrixRelationship): Promise<MatrixStructure> {
    const response = await APIClient.post<{ structure: MatrixStructure }>(`${this.endpoint}/${matrixId}/relationships`, relationship);
    return response.structure;
  }

  static async addDecisionRight(matrixId: string, decisionRight: DecisionRight): Promise<MatrixStructure> {
    const response = await APIClient.post<{ structure: MatrixStructure }>(`${this.endpoint}/${matrixId}/decision-rights`, decisionRight);
    return response.structure;
  }
}

// ============================================================================
// SUCCESSION POOL SERVICE
// ============================================================================

export class SuccessionPoolService {
  private static endpoint = '/org-design/succession-pools';

  static async getAllSuccessionPools(): Promise<SuccessionPool[]> {
    try {
      const response = await APIClient.get<{ pools?: SuccessionPool[] }>(this.endpoint);
      return response.pools || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getSuccessionPoolById(poolId: string): Promise<SuccessionPool | null> {
    try {
      const response = await APIClient.get<{ pool?: SuccessionPool }>(`${this.endpoint}/${poolId}`);
      return response.pool || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createSuccessionPool(poolData: Partial<SuccessionPool>): Promise<SuccessionPool> {
    const response = await APIClient.post<{ pool: SuccessionPool }>(this.endpoint, poolData);
    return response.pool;
  }

  static async updateSuccessionPool(poolId: string, updates: Partial<SuccessionPool>): Promise<SuccessionPool> {
    const response = await APIClient.put<{ pool: SuccessionPool }>(`${this.endpoint}/${poolId}`, updates);
    return response.pool;
  }

  static async deleteSuccessionPool(poolId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${poolId}`);
  }

  static async addMember(poolId: string, member: PoolMember): Promise<SuccessionPool> {
    const response = await APIClient.post<{ pool: SuccessionPool }>(`${this.endpoint}/${poolId}/members`, member);
    return response.pool;
  }

  static async removeMember(poolId: string, memberId: string): Promise<SuccessionPool> {
    const response = await APIClient.delete<{ pool: SuccessionPool }>(`${this.endpoint}/${poolId}/members/${memberId}`);
    return response.pool;
  }

  static async updateDevelopmentPlan(poolId: string, memberId: string, plan: DevelopmentPlan): Promise<SuccessionPool> {
    const response = await APIClient.put<{ pool: SuccessionPool }>(`${this.endpoint}/${poolId}/members/${memberId}/development-plan`, plan);
    return response.pool;
  }
}

// ============================================================================
// ORG ANALYTICS SERVICE
// ============================================================================

export class OrgAnalyticsService {
  private static endpoint = '/org-design/analytics';

  static async getOrgAnalytics(chartId?: string): Promise<OrgAnalytics> {
    try {
      const response = await APIClient.get<{ analytics?: OrgAnalytics }>(this.endpoint, { chartId });
      return response.analytics || {} as OrgAnalytics;
    } catch (error: any) {
            throw error;
    }
  }

  static async exportAnalyticsReport(format: 'pdf' | 'excel' | 'powerpoint'): Promise<Blob> {
    const response = await APIClient.get<Blob>(`${this.endpoint}/export`, { format });
    return response as unknown as Blob;
  }
}

// ============================================================================
// CHANGE MANAGEMENT SERVICE
// ============================================================================

export class ChangeManagementService {
  private static endpoint = '/org-design/changes';

  static async getAllChanges(): Promise<ChangeManagement[]> {
    try {
      const response = await APIClient.get<{ changes?: ChangeManagement[] }>(this.endpoint);
      return response.changes || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getChangeById(changeId: string): Promise<ChangeManagement | null> {
    try {
      const response = await APIClient.get<{ change?: ChangeManagement }>(`${this.endpoint}/${changeId}`);
      return response.change || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createChange(changeData: Partial<ChangeManagement>): Promise<ChangeManagement> {
    const response = await APIClient.post<{ change: ChangeManagement }>(this.endpoint, changeData);
    return response.change;
  }

  static async updateChange(changeId: string, updates: Partial<ChangeManagement>): Promise<ChangeManagement> {
    const response = await APIClient.put<{ change: ChangeManagement }>(`${this.endpoint}/${changeId}`, updates);
    return response.change;
  }

  static async deleteChange(changeId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${changeId}`);
  }

  static async assessImpact(changeId: string): Promise<ImpactAssessment> {
    const response = await APIClient.post<{ assessment: ImpactAssessment }>(`${this.endpoint}/${changeId}/assess-impact`);
    return response.assessment;
  }

  static async addAffectedEmployee(changeId: string, employee: AffectedEmployee): Promise<ChangeManagement> {
    const response = await APIClient.post<{ change: ChangeManagement }>(`${this.endpoint}/${changeId}/affected-employees`, employee);
    return response.change;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class OrgDesignSettingsService {
  private static endpoint = '/org-design/settings';

  static async getSettings(): Promise<OrgDesignSettings> {
    try {
      const response = await APIClient.get<{ settings?: OrgDesignSettings }>(this.endpoint);
      return response.settings || {} as OrgDesignSettings;
    } catch (error: any) {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<OrgDesignSettings>): Promise<OrgDesignSettings> {
    const response = await APIClient.put<{ settings: OrgDesignSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
