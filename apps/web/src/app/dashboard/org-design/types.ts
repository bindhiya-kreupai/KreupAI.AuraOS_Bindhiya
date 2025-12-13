// Org Design Module - Comprehensive Type Definitions

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'pending' | 'archived' | 'draft';

// ============================================================================
// ORG CHART TYPES
// ============================================================================

export interface OrgChart {
  chartId: string;
  chartName: string;
  chartType: OrgChartType;
  effectiveDate: Date;
  expiryDate?: Date;
  status: Status;
  isCurrentChart: boolean;
  rootPosition: string; // Position ID
  nodes: OrgNode[];
  totalPositions: number;
  totalEmployees: number;
  totalVacancies: number;
  createdDate: Date;
  createdBy: string;
  createdByName: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  version: number;
  notes?: string;
}

export type OrgChartType = 'current' | 'proposed' | 'scenario' | 'historical';

export interface OrgNode {
  nodeId: string;
  positionId: string;
  positionTitle: string;
  positionCode: string;
  department: string;
  location: string;

  // Hierarchy
  parentNodeId?: string;
  level: number;
  path: string; // Hierarchical path

  // Occupant
  employeeId?: string;
  employeeName?: string;
  employeePhoto?: string;
  isVacant: boolean;

  // Reporting
  directReports: number;
  totalReports: number;
  spanOfControl: number;

  // Position details
  jobFamily: string;
  jobLevel: string;
  grade: string;
  fte: number;

  // Cost
  budgetedSalary: number;
  actualSalary?: number;
  totalCost: number;

  // Matrix reporting
  matrixReports?: MatrixReport[];

  // Visual
  displayOrder: number;
  isCollapsed: boolean;
  color?: string;
  icon?: string;
}

export interface MatrixReport {
  reportId: string;
  reportType: 'solid_line' | 'dotted_line' | 'functional';
  managerId: string;
  managerName: string;
  managerPosition: string;
  percentage: number;
  startDate: Date;
  endDate?: Date;
}

export interface OrgChartView {
  viewId: string;
  viewName: string;
  chartId: string;
  viewType: 'tree' | 'table' | 'matrix' | 'sunburst' | 'network';
  filters: OrgChartFilter;
  layout: OrgChartLayout;
  isDefault: boolean;
}

export interface OrgChartFilter {
  departments?: string[];
  locations?: string[];
  jobFamilies?: string[];
  levels?: number[];
  showVacant?: boolean;
  showInactive?: boolean;
}

export interface OrgChartLayout {
  orientation: 'vertical' | 'horizontal';
  nodeSpacing: number;
  levelSpacing: number;
  showPhotos: boolean;
  showMetrics: boolean;
  compactMode: boolean;
}

// ============================================================================
// SCENARIO PLANNING TYPES
// ============================================================================

export interface Scenario {
  scenarioId: string;
  scenarioName: string;
  scenarioType: ScenarioType;
  description: string;
  baselineChartId: string;
  effectiveDate: Date;
  status: 'draft' | 'under_review' | 'approved' | 'implemented' | 'rejected';

  // Changes
  changes: ScenarioChange[];
  totalChanges: number;

  // Impact analysis
  impactSummary: ScenarioImpact;

  // Approvals
  approvalWorkflow?: ApprovalWorkflow[];
  approvedBy?: string;
  approvedDate?: Date;

  // Cost impact
  currentCost: number;
  projectedCost: number;
  costDelta: number;
  costDeltaPercentage: number;

  // Headcount impact
  currentHeadcount: number;
  projectedHeadcount: number;
  headcountDelta: number;

  // Metadata
  createdDate: Date;
  createdBy: string;
  createdByName: string;
  lastUpdatedDate: Date;
  notes?: string;
}

export type ScenarioType =
  | 'restructure'
  | 'growth'
  | 'cost_reduction'
  | 'merger'
  | 'divestiture'
  | 'transformation'
  | 'what_if';

export interface ScenarioChange {
  changeId: string;
  changeType: ChangeType;
  changeDescription: string;
  affectedPosition?: string;
  affectedPositionTitle?: string;
  affectedEmployee?: string;
  affectedEmployeeName?: string;

  // Change details
  beforeState: any;
  afterState: any;

  // Impact
  impactLevel: 'low' | 'medium' | 'high';
  impactedEmployees: number;
  costImpact: number;

  // Implementation
  implementationDate?: Date;
  implementationStatus?: 'pending' | 'in_progress' | 'completed';
  implementationNotes?: string;
}

export type ChangeType =
  | 'add_position'
  | 'remove_position'
  | 'move_position'
  | 'change_reporting'
  | 'change_grade'
  | 'change_department'
  | 'change_location'
  | 'split_position'
  | 'merge_positions'
  | 'change_fte';

export interface ScenarioImpact {
  // Organizational impact
  departmentsAffected: number;
  locationsAffected: number;
  levelsAffected: number;

  // People impact
  employeesImpacted: number;
  newHires: number;
  terminations: number;
  relocations: number;
  promotions: number;
  demotions: number;

  // Span of control impact
  averageSpanBefore: number;
  averageSpanAfter: number;
  spanIssues: SpanIssue[];

  // Cost impact breakdown
  salaryImpact: number;
  benefitsImpact: number;
  overheadImpact: number;
  oneTimeCosts: number;
  recurringCosts: number;
}

export interface SpanIssue {
  issueId: string;
  positionId: string;
  positionTitle: string;
  currentSpan: number;
  recommendedSpan: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface ApprovalWorkflow {
  stepId: string;
  stepNumber: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalDate?: Date;
  comments?: string;
}

// ============================================================================
// SPAN OF CONTROL TYPES
// ============================================================================

export interface SpanOfControl {
  analysisId: string;
  analysisName: string;
  chartId: string;
  analysisDate: Date;

  // Overall metrics
  overallMetrics: SpanMetrics;

  // By level
  levelAnalysis: LevelSpanAnalysis[];

  // By department
  departmentAnalysis: DepartmentSpanAnalysis[];

  // Issues
  spanIssues: SpanIssue[];
  totalIssues: number;

  // Recommendations
  recommendations: SpanRecommendation[];
}

export interface SpanMetrics {
  totalManagers: number;
  averageSpan: number;
  medianSpan: number;
  minSpan: number;
  maxSpan: number;
  idealSpanRange: { min: number; max: number };
  withinIdealRange: number;
  withinIdealRangePercentage: number;
  tooNarrow: number;
  tooWide: number;
}

export interface LevelSpanAnalysis {
  level: number;
  levelName: string;
  managerCount: number;
  averageSpan: number;
  minSpan: number;
  maxSpan: number;
  idealRange: { min: number; max: number };
  complianceRate: number;
}

export interface DepartmentSpanAnalysis {
  departmentId: string;
  departmentName: string;
  managerCount: number;
  averageSpan: number;
  totalEmployees: number;
  layers: number;
  complianceRate: number;
}

export interface SpanRecommendation {
  recommendationId: string;
  positionId: string;
  positionTitle: string;
  currentSpan: number;
  recommendedAction: 'add_layer' | 'remove_layer' | 'redistribute' | 'acceptable';
  targetSpan: number;
  rationale: string;
  estimatedCost: number;
  priority: Priority;
}

// ============================================================================
// POSITION HIERARCHY TYPES
// ============================================================================

export interface PositionHierarchy {
  hierarchyId: string;
  hierarchyName: string;
  effectiveDate: Date;
  status: Status;

  positions: Position[];
  levels: HierarchyLevel[];
  totalLevels: number;
  totalPositions: number;

  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
}

export interface Position {
  positionId: string;
  positionCode: string;
  positionTitle: string;
  positionType: 'regular' | 'temporary' | 'project' | 'matrix';

  // Hierarchy
  parentPositionId?: string;
  level: number;
  reportingPath: string[];

  // Classification
  department: string;
  departmentId: string;
  location: string;
  locationId: string;
  businessUnit: string;
  costCenter: string;

  // Job details
  jobFamily: string;
  jobFamilyId: string;
  jobTitle: string;
  jobLevel: string;
  grade: string;
  gradeId: string;

  // Employment
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  fte: number;
  isVacant: boolean;
  incumbentId?: string;
  incumbentName?: string;

  // Budget
  budgetedSalary: number;
  salaryMin: number;
  salaryMax: number;
  salaryMidpoint: number;
  currency: string;
  totalCompensation: number;

  // Dates
  effectiveDate: Date;
  expiryDate?: Date;
  createdDate: Date;
  lastModifiedDate: Date;

  // Status
  status: Status;
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected';

  // Additional
  requiresBackgroundCheck: boolean;
  isCritical: boolean;
  successionPlanRequired: boolean;
  notes?: string;
}

export interface HierarchyLevel {
  level: number;
  levelName: string;
  levelDescription: string;
  positionCount: number;
  averageSpan: number;
  gradeRange: string[];
  salaryRange: { min: number; max: number };
}

// ============================================================================
// MATRIX STRUCTURE TYPES
// ============================================================================

export interface MatrixStructure {
  matrixId: string;
  matrixName: string;
  matrixType: 'weak' | 'balanced' | 'strong';
  description: string;
  effectiveDate: Date;
  status: Status;

  // Dimensions
  primaryDimension: MatrixDimension;
  secondaryDimension: MatrixDimension;

  // Relationships
  matrixRelationships: MatrixRelationship[];
  totalRelationships: number;

  // Governance
  decisionRights: DecisionRight[];
  escalationPath: EscalationPath[];

  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
}

export interface MatrixDimension {
  dimensionId: string;
  dimensionType: 'functional' | 'product' | 'geography' | 'customer' | 'project';
  dimensionName: string;
  leaders: DimensionLeader[];
  weight: number; // 0-100, indicates strength of dimension
}

export interface DimensionLeader {
  leaderId: string;
  leaderName: string;
  positionId: string;
  positionTitle: string;
  scope: string;
  authority: 'full' | 'shared' | 'advisory';
}

export interface MatrixRelationship {
  relationshipId: string;
  employeeId: string;
  employeeName: string;
  positionId: string;

  // Primary reporting
  primaryManagerId: string;
  primaryManagerName: string;
  primaryManagerPosition: string;
  primaryAllocation: number; // percentage

  // Secondary reporting
  secondaryManagerId: string;
  secondaryManagerName: string;
  secondaryManagerPosition: string;
  secondaryAllocation: number; // percentage

  // Relationship details
  relationshipType: 'solid_line' | 'dotted_line' | 'functional';
  startDate: Date;
  endDate?: Date;
  status: Status;

  // Governance
  performanceReviewOwner: 'primary' | 'secondary' | 'joint';
  approvalAuthority: { [key: string]: 'primary' | 'secondary' | 'joint' };
}

export interface DecisionRight {
  decisionId: string;
  decisionType: string;
  decisionDescription: string;
  owner: 'primary' | 'secondary' | 'joint' | 'escalate';
  requiredConsent?: ('primary' | 'secondary')[];
  escalationTrigger?: string;
}

export interface EscalationPath {
  pathId: string;
  scenario: string;
  steps: EscalationStep[];
}

export interface EscalationStep {
  stepNumber: number;
  escalateTo: string;
  escalateToRole: string;
  conditions: string;
  timeframe: number; // in days
}

// ============================================================================
// SUCCESSION POOL TYPES
// ============================================================================

export interface SuccessionPool {
  poolId: string;
  poolName: string;
  poolType: 'executive' | 'senior_management' | 'management' | 'specialist' | 'high_potential';
  description: string;

  // Criteria
  eligibilityCriteria: EligibilityCriteria;

  // Members
  members: PoolMember[];
  totalMembers: number;

  // Development
  developmentPrograms: DevelopmentProgram[];

  // Readiness
  readinessDistribution: { level: string; count: number }[];

  // Metrics
  averageReadiness: number;
  promotionRate: number;
  retentionRate: number;

  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  status: Status;
}

export interface EligibilityCriteria {
  minPerformanceRating: number;
  minTenure: number;
  minPotentialRating: number;
  requiredCompetencies: string[];
  requiredExperiences: string[];
  excludeRecentPromotion: boolean;
  recentPromotionMonths?: number;
}

export interface PoolMember {
  memberId: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  currentLevel: string;
  department: string;

  // Readiness
  readinessLevel: 'ready_now' | 'ready_1_year' | 'ready_2_3_years' | 'not_ready';
  targetPositions: TargetPosition[];

  // Assessment
  performanceRating: number;
  potentialRating: number;
  riskOfLoss: 'low' | 'medium' | 'high';

  // Development
  developmentPlan: DevelopmentPlan;
  competencyGaps: CompetencyGap[];

  // Tracking
  joinedPoolDate: Date;
  lastReviewDate: Date;
  nextReviewDate: Date;
  status: 'active' | 'promoted' | 'exited' | 'on_hold';
}

export interface TargetPosition {
  positionId: string;
  positionTitle: string;
  positionLevel: string;
  readinessForPosition: 'ready_now' | 'ready_1_year' | 'ready_2_3_years';
  gapAnalysis: string;
  priority: number;
}

export interface DevelopmentPlan {
  planId: string;
  objectives: string[];
  actions: DevelopmentAction[];
  completionPercentage: number;
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
}

export interface DevelopmentAction {
  actionId: string;
  actionType: 'training' | 'stretch_assignment' | 'mentoring' | 'coaching' | 'job_rotation' | 'certification';
  description: string;
  targetCompetency: string;
  startDate: Date;
  endDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  completionPercentage: number;
}

export interface CompetencyGap {
  competencyId: string;
  competencyName: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: Priority;
  developmentActions: string[];
}

export interface DevelopmentProgram {
  programId: string;
  programName: string;
  programType: string;
  targetAudience: string[];
  duration: number;
  participants: number;
  completionRate: number;
  effectivenessRating: number;
}

// ============================================================================
// ORG ANALYTICS TYPES
// ============================================================================

export interface OrgAnalytics {
  // Structure metrics
  totalEmployees: number;
  totalPositions: number;
  vacancyRate: number;
  averageTenure: number;
  totalLevels: number;
  averageSpanOfControl: number;

  // Cost metrics
  totalCompensationCost: number;
  averageCompensation: number;
  compensationByLevel: { level: string; average: number; total: number }[];
  compensationByDepartment: { department: string; average: number; total: number }[];

  // Distribution
  employeesByLevel: { level: string; count: number; percentage: number }[];
  employeesByDepartment: { department: string; count: number; percentage: number }[];
  employeesByLocation: { location: string; count: number; percentage: number }[];
  employeesByGrade: { grade: string; count: number; percentage: number }[];

  // Demographics
  averageAge: number;
  genderDistribution: { gender: string; count: number; percentage: number }[];
  generationDistribution: { generation: string; count: number; percentage: number }[];

  // Movement
  internalMobility: InternalMobility;
  promotionMetrics: PromotionMetrics;
  attritionMetrics: AttritionMetrics;

  // Efficiency
  layerMetrics: LayerMetrics;
  spanMetrics: SpanMetrics;

  // Trends
  headcountTrend: { month: string; count: number }[];
  costTrend: { month: string; cost: number }[];
}

export interface InternalMobility {
  totalMoves: number;
  lateralMoves: number;
  promotions: number;
  demotions: number;
  crossFunctionalMoves: number;
  crossLocationMoves: number;
  mobilityRate: number;
}

export interface PromotionMetrics {
  totalPromotions: number;
  promotionRate: number;
  averageTimeToPromotion: number;
  promotionsByLevel: { level: string; count: number }[];
  promotionsByDepartment: { department: string; count: number }[];
}

export interface AttritionMetrics {
  totalAttrition: number;
  attritionRate: number;
  voluntaryAttrition: number;
  involuntaryAttrition: number;
  attritionByLevel: { level: string; count: number; rate: number }[];
  attritionByDepartment: { department: string; count: number; rate: number }[];
  averageTerminationReason: { reason: string; count: number }[];
}

export interface LayerMetrics {
  totalLayers: number;
  averageLayers: number;
  maxLayers: number;
  layersByDepartment: { department: string; layers: number }[];
  excessiveLayers: { department: string; layers: number; recommended: number }[];
}

// ============================================================================
// CHANGE MANAGEMENT TYPES
// ============================================================================

export interface ChangeManagement {
  changeId: string;
  changeTitle: string;
  changeType: 'restructure' | 'merger' | 'acquisition' | 'divestiture' | 'transformation' | 'other';
  changeScope: 'organization' | 'department' | 'team' | 'role';
  description: string;

  // Timeline
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;

  // Status
  status: 'planning' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  completionPercentage: number;

  // Impact
  impactAssessment: ImpactAssessment;
  affectedEmployees: AffectedEmployee[];
  totalAffected: number;

  // Stakeholders
  changeOwner: string;
  changeOwnerName: string;
  stakeholders: Stakeholder[];

  // Communication
  communicationPlan: CommunicationPlan;
  announcements: Announcement[];

  // Resistance
  resistanceLevel: 'low' | 'medium' | 'high';
  risks: ChangeRisk[];
  mitigationActions: MitigationAction[];

  // Progress
  milestones: ChangeMilestone[];
  tasks: ChangeTask[];

  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
}

export interface ImpactAssessment {
  assessmentDate: Date;
  assessedBy: string;

  // People impact
  totalAffected: number;
  highImpact: number;
  mediumImpact: number;
  lowImpact: number;

  // Process impact
  processesAffected: number;
  systemsAffected: number;
  policiesAffected: number;

  // Change readiness
  readinessScore: number; // 0-100
  readinessLevel: 'low' | 'medium' | 'high';
  readinessFactors: { factor: string; score: number }[];
}

export interface AffectedEmployee {
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  department: string;

  impactType: 'role_change' | 'reporting_change' | 'location_change' | 'redundancy' | 'other';
  impactLevel: 'low' | 'medium' | 'high';
  impactDescription: string;

  newPosition?: string;
  newDepartment?: string;
  newLocation?: string;
  newManager?: string;

  communicationStatus: 'not_informed' | 'informed' | 'engaged';
  acceptanceLevel: 'resistant' | 'neutral' | 'supportive';
  supportRequired: string[];
}

export interface Stakeholder {
  stakeholderId: string;
  stakeholderName: string;
  stakeholderType: 'sponsor' | 'champion' | 'influencer' | 'impacted';
  role: string;
  influence: 'low' | 'medium' | 'high';
  support: 'opponent' | 'neutral' | 'supporter';
  engagementLevel: 'unaware' | 'aware' | 'understanding' | 'committed';
}

export interface CommunicationPlan {
  planId: string;
  activities: CommunicationActivity[];
  channels: string[];
  frequency: string;
}

export interface CommunicationActivity {
  activityId: string;
  activityType: 'announcement' | 'town_hall' | 'workshop' | 'training' | 'one_on_one';
  title: string;
  audience: string[];
  channel: string;
  scheduledDate: Date;
  status: 'planned' | 'completed' | 'cancelled';
  attendees?: number;
  feedback?: string;
}

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  audience: string[];
  publishDate: Date;
  channel: string[];
  views: number;
  acknowledgements: number;
}

export interface ChangeRisk {
  riskId: string;
  riskDescription: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'closed';
}

export interface MitigationAction {
  actionId: string;
  action: string;
  owner: string;
  dueDate: Date;
  status: 'not_started' | 'in_progress' | 'completed';
  effectiveness?: 'low' | 'medium' | 'high';
}

export interface ChangeMilestone {
  milestoneId: string;
  milestoneName: string;
  milestoneDate: Date;
  status: 'pending' | 'achieved' | 'missed';
  description: string;
}

export interface ChangeTask {
  taskId: string;
  taskName: string;
  taskType: string;
  assignedTo: string;
  dueDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: Priority;
  dependencies: string[];
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface OrgDesignSettings {
  settingsId: string;

  // Org chart settings
  orgChartSettings: {
    defaultView: 'tree' | 'table' | 'matrix';
    allowExport: boolean;
    exportFormats: string[];
    showPhotos: boolean;
    showVacancies: boolean;
    colorScheme: string;
  };

  // Span of control settings
  spanSettings: {
    idealSpanMin: number;
    idealSpanMax: number;
    executiveSpanMin: number;
    executiveSpanMax: number;
    managerSpanMin: number;
    managerSpanMax: number;
    enableAlerts: boolean;
  };

  // Position hierarchy settings
  hierarchySettings: {
    maxLevels: number;
    requireApprovalForNewPositions: boolean;
    approvalWorkflow: string[];
    enforceGradeProgression: boolean;
  };

  // Scenario planning settings
  scenarioSettings: {
    allowMultipleScenarios: boolean;
    requireApprovalForImplementation: boolean;
    retentionPeriod: number; // in days
  };

  // Succession planning settings
  successionSettings: {
    minReadyNowCoverage: number; // percentage
    minPipelineCoverage: number; // percentage
    reviewFrequency: 'quarterly' | 'semi_annually' | 'annually';
    enableAlerts: boolean;
  };

  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
}
