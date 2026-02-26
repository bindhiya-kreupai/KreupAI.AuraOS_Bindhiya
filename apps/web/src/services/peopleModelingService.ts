/**
 * @module peopleModelingService
 * @description People Modeling Service — what-if scenario modeling for headcount,
 *              salary, benefits; cost/productivity/retention impact analysis (Sec 23.3)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type ScenarioType =
  | 'hiring_plan'
  | 'salary_revision'
  | 'benefits_change'
  | 'restructuring'
  | 'attrition';

export interface DepartmentChange {
  departmentId: string;
  departmentName: string;
  currentHeadcount: number;
  headcountChange: number; // +/- employees
  salaryIncreasePct?: number;
  newBenefitsCost?: number;
}

export interface ScenarioParams {
  name: string;
  type: ScenarioType;
  description?: string;
  effectiveDate: string;
  duration: number; // months
  departmentChanges: DepartmentChange[];
  globalSalaryIncreasePct?: number;
  newBenefitItems?: Array<{ name: string; costPerEmployee: number; coverage: 'all' | 'opt_in' }>;
  attritionRatePct?: number;
  recruitmentFillRatePct?: number;
}

export interface ScenarioImpact {
  totalCostImpact: number;
  monthlyCostImpact: number;
  headcountChange: number;
  newHeadcount: number;
  avgSalaryChange: number;
  benefitsCostChange: number;
  recruitmentCost: number;
  trainingCost: number;
  productivityImpactPct: number;
  retentionImpactPct: number;
  breakEvenMonths: number;
  timelineProjection: Array<{ month: string; cumulativeCost: number; headcount: number }>;
}

export interface SavedScenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  params: ScenarioParams;
  impact: ScenarioImpact;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  tags: string[];
}

export interface ScenarioComparison {
  scenarios: SavedScenario[];
  dimensions: string[];
  winner?: { scenarioId: string; reason: string };
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateTimeline = (
  baseCost: number,
  months: number,
  baseHC: number,
  hcChange: number
): ScenarioImpact['timelineProjection'] =>
  Array.from({ length: months }, (_, i) => ({
    month: new Date(2026, 2 + i, 1).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    cumulativeCost: Math.round(baseCost * (i + 1) * (1 + i * 0.02)),
    headcount: baseHC + Math.round(hcChange * ((i + 1) / months)),
  }));

const MOCK_SAVED_SCENARIOS: SavedScenario[] = [
  {
    id: 'scenario-001',
    name: 'Engineering Expansion Q2 2026',
    type: 'hiring_plan',
    description:
      'Hire 25 additional engineers across backend, frontend, and ML teams to support product roadmap.',
    createdBy: 'Sarah Kim',
    createdAt: '2026-02-01',
    lastModified: '2026-02-15',
    status: 'approved',
    tags: ['Engineering', 'Growth', 'Q2'],
    params: {
      name: 'Engineering Expansion Q2 2026',
      type: 'hiring_plan',
      effectiveDate: '2026-04-01',
      duration: 6,
      departmentChanges: [
        {
          departmentId: 'dept-eng',
          departmentName: 'Engineering',
          currentHeadcount: 89,
          headcountChange: 20,
        },
        {
          departmentId: 'dept-data',
          departmentName: 'Data',
          currentHeadcount: 24,
          headcountChange: 5,
        },
      ],
      recruitmentFillRatePct: 85,
    },
    impact: {
      totalCostImpact: 3240000,
      monthlyCostImpact: 540000,
      headcountChange: 25,
      newHeadcount: 312,
      avgSalaryChange: 0,
      benefitsCostChange: 126000,
      recruitmentCost: 112500,
      trainingCost: 62500,
      productivityImpactPct: 18.5,
      retentionImpactPct: 2.1,
      breakEvenMonths: 8,
      timelineProjection: generateTimeline(540000, 6, 287, 25),
    },
  },
  {
    id: 'scenario-002',
    name: 'Annual Salary Revision 2026',
    type: 'salary_revision',
    description: 'Company-wide 8% merit increase with performance-based differentiation (6-12%).',
    createdBy: 'Emily Park',
    createdAt: '2026-01-15',
    lastModified: '2026-02-10',
    status: 'submitted',
    tags: ['Compensation', 'Annual', 'Retention'],
    params: {
      name: 'Annual Salary Revision 2026',
      type: 'salary_revision',
      effectiveDate: '2026-03-01',
      duration: 12,
      departmentChanges: [],
      globalSalaryIncreasePct: 8,
    },
    impact: {
      totalCostImpact: 3876000,
      monthlyCostImpact: 323000,
      headcountChange: 0,
      newHeadcount: 287,
      avgSalaryChange: 8640,
      benefitsCostChange: 48000,
      recruitmentCost: 0,
      trainingCost: 0,
      productivityImpactPct: 5.2,
      retentionImpactPct: 12.4,
      breakEvenMonths: 14,
      timelineProjection: generateTimeline(323000, 12, 287, 0),
    },
  },
  {
    id: 'scenario-003',
    name: 'Enhanced Benefits Package',
    type: 'benefits_change',
    description: 'Add mental health support, enhanced parental leave, and remote work stipend.',
    createdBy: 'Emily Park',
    createdAt: '2026-01-20',
    lastModified: '2026-02-05',
    status: 'draft',
    tags: ['Benefits', 'Retention', 'Wellbeing'],
    params: {
      name: 'Enhanced Benefits Package',
      type: 'benefits_change',
      effectiveDate: '2026-04-01',
      duration: 12,
      departmentChanges: [],
      newBenefitItems: [
        { name: 'Mental Health Support', costPerEmployee: 600, coverage: 'all' },
        { name: 'Remote Work Stipend', costPerEmployee: 1200, coverage: 'opt_in' },
        { name: 'Enhanced Parental Leave (+4 weeks)', costPerEmployee: 4800, coverage: 'opt_in' },
      ],
    },
    impact: {
      totalCostImpact: 820000,
      monthlyCostImpact: 68333,
      headcountChange: 0,
      newHeadcount: 287,
      avgSalaryChange: 0,
      benefitsCostChange: 820000,
      recruitmentCost: 0,
      trainingCost: 0,
      productivityImpactPct: 3.8,
      retentionImpactPct: 18.6,
      breakEvenMonths: 10,
      timelineProjection: generateTimeline(68333, 12, 287, 0),
    },
  },
  {
    id: 'scenario-004',
    name: 'Sales Team Restructuring',
    type: 'restructuring',
    description:
      'Reorganize EMEA sales from geographic to industry vertical structure, net headcount neutral.',
    createdBy: 'Anna Schmidt',
    createdAt: '2026-02-05',
    lastModified: '2026-02-20',
    status: 'draft',
    tags: ['Sales', 'Restructuring', 'EMEA'],
    params: {
      name: 'Sales Team Restructuring',
      type: 'restructuring',
      effectiveDate: '2026-04-01',
      duration: 3,
      departmentChanges: [
        {
          departmentId: 'dept-sales-emea',
          departmentName: 'Sales EMEA',
          currentHeadcount: 18,
          headcountChange: -2,
        },
        {
          departmentId: 'dept-sales-global',
          departmentName: 'Sales Global Accounts',
          currentHeadcount: 8,
          headcountChange: 2,
        },
      ],
    },
    impact: {
      totalCostImpact: 180000,
      monthlyCostImpact: 60000,
      headcountChange: 0,
      newHeadcount: 287,
      avgSalaryChange: 0,
      benefitsCostChange: 0,
      recruitmentCost: 0,
      trainingCost: 80000,
      productivityImpactPct: -2.1,
      retentionImpactPct: -5.4,
      breakEvenMonths: 6,
      timelineProjection: generateTimeline(60000, 3, 287, 0),
    },
  },
  {
    id: 'scenario-005',
    name: 'Natural Attrition Planning 2026',
    type: 'attrition',
    description: 'Model impact of projected 14% voluntary attrition with 70% backfill strategy.',
    createdBy: 'Emily Park',
    createdAt: '2026-01-10',
    lastModified: '2026-01-25',
    status: 'approved',
    tags: ['Attrition', 'Planning', 'Headcount'],
    params: {
      name: 'Natural Attrition Planning 2026',
      type: 'attrition',
      effectiveDate: '2026-01-01',
      duration: 12,
      departmentChanges: [],
      attritionRatePct: 14,
      recruitmentFillRatePct: 70,
    },
    impact: {
      totalCostImpact: 1240000,
      monthlyCostImpact: 103333,
      headcountChange: -12,
      newHeadcount: 275,
      avgSalaryChange: 0,
      benefitsCostChange: -120000,
      recruitmentCost: 280000,
      trainingCost: 168000,
      productivityImpactPct: -4.2,
      retentionImpactPct: -14.0,
      breakEvenMonths: 18,
      timelineProjection: generateTimeline(103333, 12, 287, -12),
    },
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class PeopleModelingService {
  /** Run a scenario and return projected impact */
  static async runScenario(params: ScenarioParams): Promise<ScenarioImpact> {
    await new Promise((r) => setTimeout(r, 800));
    const totalHC = params.departmentChanges.reduce((sum, d) => sum + d.currentHeadcount, 0);
    const hcChange = params.departmentChanges.reduce((sum, d) => sum + d.headcountChange, 0);
    const avgSalary = 120000;
    const salaryIncrease = params.globalSalaryIncreasePct
      ? (totalHC * avgSalary * params.globalSalaryIncreasePct) / 100
      : 0;
    const hireCost = hcChange > 0 ? hcChange * 4500 : 0;
    const trainCost = Math.abs(hcChange) * 2500;
    const benCost =
      params.newBenefitItems?.reduce(
        (s, b) => s + b.costPerEmployee * (b.coverage === 'all' ? 287 : 100),
        0
      ) ?? 0;
    const totalCost = salaryIncrease + hireCost + trainCost + benCost;
    return {
      totalCostImpact: totalCost,
      monthlyCostImpact: totalCost / (params.duration || 12),
      headcountChange: hcChange,
      newHeadcount: 287 + hcChange,
      avgSalaryChange: params.globalSalaryIncreasePct
        ? (avgSalary * params.globalSalaryIncreasePct) / 100
        : 0,
      benefitsCostChange: benCost,
      recruitmentCost: hireCost,
      trainingCost: trainCost,
      productivityImpactPct: hcChange > 0 ? hcChange * 0.8 : hcChange * 0.5,
      retentionImpactPct: params.globalSalaryIncreasePct ? params.globalSalaryIncreasePct * 1.5 : 0,
      breakEvenMonths: Math.round(totalCost / Math.max(totalCost * 0.07, 1)),
      timelineProjection: generateTimeline(totalCost / 12, params.duration, 287, hcChange),
    };
  }

  /** Get all saved scenarios */
  static async getScenarios(): Promise<SavedScenario[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_SAVED_SCENARIOS];
  }

  /** Save a scenario */
  static async saveScenario(
    params: ScenarioParams,
    impact: ScenarioImpact
  ): Promise<SavedScenario> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: `scenario-${Date.now()}`,
      name: params.name,
      type: params.type,
      description: params.description ?? '',
      createdBy: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft',
      tags: [],
      params,
      impact,
    };
  }

  /** Compare multiple scenarios */
  static async compareScenarios(scenarioIds: string[]): Promise<ScenarioComparison> {
    await new Promise((r) => setTimeout(r, 400));
    const scenarios = MOCK_SAVED_SCENARIOS.filter((s) => scenarioIds.includes(s.id));
    const winner = scenarios.reduce((prev, curr) =>
      prev.impact.retentionImpactPct > curr.impact.retentionImpactPct ? prev : curr
    );
    return {
      scenarios,
      dimensions: [
        'Cost Impact',
        'Headcount Change',
        'Productivity Impact',
        'Retention Impact',
        'Break-Even',
      ],
      winner: { scenarioId: winner.id, reason: 'Highest retention impact with acceptable cost' },
    };
  }

  /** Get cost impact of a scenario */
  static async getCostImpact(
    scenarioId: string
  ): Promise<{ annual: number; monthly: number; breakdown: Record<string, number> }> {
    await new Promise((r) => setTimeout(r, 300));
    const sc = MOCK_SAVED_SCENARIOS.find((s) => s.id === scenarioId);
    return {
      annual: sc?.impact.totalCostImpact ?? 0,
      monthly: sc?.impact.monthlyCostImpact ?? 0,
      breakdown: {
        salaries: (sc?.impact.totalCostImpact ?? 0) * 0.65,
        benefits: sc?.impact.benefitsCostChange ?? 0,
        recruitment: sc?.impact.recruitmentCost ?? 0,
        training: sc?.impact.trainingCost ?? 0,
      },
    };
  }

  /** Get productivity impact estimate */
  static async getProductivityImpact(
    scenarioId: string
  ): Promise<{ pct: number; description: string }> {
    await new Promise((r) => setTimeout(r, 250));
    const sc = MOCK_SAVED_SCENARIOS.find((s) => s.id === scenarioId);
    return {
      pct: sc?.impact.productivityImpactPct ?? 0,
      description: 'Estimated output change based on headcount and skill mix',
    };
  }

  /** Get retention impact prediction */
  static async getRetentionImpact(
    scenarioId: string
  ): Promise<{ pct: number; employeesRetained: number }> {
    await new Promise((r) => setTimeout(r, 250));
    const sc = MOCK_SAVED_SCENARIOS.find((s) => s.id === scenarioId);
    return {
      pct: sc?.impact.retentionImpactPct ?? 0,
      employeesRetained: Math.round((287 * (sc?.impact.retentionImpactPct ?? 0)) / 100),
    };
  }
}
