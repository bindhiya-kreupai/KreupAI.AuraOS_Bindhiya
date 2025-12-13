/**
 * Workforce Planning Module - Type Definitions
 * Comprehensive strategic workforce planning including demand forecasting,
 * supply analysis, gap analysis, scenario modeling, and succession readiness
 */

// Common Types
export type Status = 'draft' | 'active' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Demand Forecasting
// ============================================================================

export type ForecastMethod =
  | 'historical_trend'
  | 'business_drivers'
  | 'manager_input'
  | 'strategic_plan'
  | 'statistical_model'
  | 'hybrid';

export type TimeHorizon = 'short_term' | 'medium_term' | 'long_term'; // 1 year, 3 years, 5+ years

export interface DemandForecast {
  id: string;
  forecastCode: string;
  forecastName: string;
  status: Status;
  description: string;

  // Scope
  timeHorizon: TimeHorizon;
  startDate: string;
  endDate: string;
  forecastPeriods: ForecastPeriod[];

  // Method
  forecastMethod: ForecastMethod;
  assumptions: ForecastAssumption[];
  businessDrivers: BusinessDriver[];

  // Coverage
  departments: string[];
  locations: string[];
  jobFamilies: string[];

  // Demand by Role
  roleDemand: RoleDemand[];

  // Total Demand
  totalCurrentHeadcount: number;
  totalForecastedHeadcount: number;
  totalHeadcountChange: number;
  totalHeadcountChangePercentage: number;

  // Approval
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;

  // Meta
  createdBy: string;
  createdByName: string;
  createdDate: string;
  lastModified: string;
  version: string;
}

export interface ForecastPeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  sequence: number;
  assumptions: string[];
}

export interface ForecastAssumption {
  id: string;
  assumptionType: 'growth' | 'attrition' | 'productivity' | 'technology' | 'market' | 'other';
  description: string;
  value?: number;
  unit?: string;
  impact: 'increase' | 'decrease' | 'neutral';
  confidence: 'low' | 'medium' | 'high';
}

export interface BusinessDriver {
  id: string;
  driverName: string;
  driverType: 'revenue' | 'volume' | 'projects' | 'expansion' | 'technology' | 'regulation' | 'custom';
  description: string;
  baselineValue: number;
  forecastedValue: number;
  changePercentage: number;
  impactOnHeadcount: number;
  impactDescription: string;
}

export interface RoleDemand {
  id: string;
  jobFamily: string;
  jobTitle: string;
  jobLevel: string;
  department: string;
  location: string;

  // Current State
  currentHeadcount: number;
  filledPositions: number;
  vacantPositions: number;

  // Forecasted Demand
  forecastedHeadcount: number;
  demandChange: number;
  demandChangePercentage: number;

  // Period Breakdown
  periodDemand: PeriodDemand[];

  // Rationale
  drivers: string[];
  assumptions: string[];
  notes?: string;

  // Priority
  priority: Priority;
  criticality: 'low' | 'medium' | 'high';
}

export interface PeriodDemand {
  periodId: string;
  periodName: string;
  headcount: number;
  newHires: number;
  promotions: number;
  transfers: number;
  attrition: number;
}

// ============================================================================
// Supply Analysis
// ============================================================================

export interface SupplyAnalysis {
  id: string;
  analysisCode: string;
  analysisName: string;
  status: Status;
  description: string;

  // Scope
  asOfDate: string;
  departments: string[];
  locations: string[];
  jobFamilies: string[];

  // Current Supply
  totalHeadcount: number;
  totalFTE: number;
  supplyByRole: RoleSupply[];

  // Supply Characteristics
  demographics: DemographicsAnalysis;
  tenure: TenureAnalysis;
  skills: SkillsInventory;
  performance: PerformanceDistribution;

  // Mobility & Availability
  internalMobility: InternalMobility;
  retirementEligibility: RetirementEligibility;
  attritionRisk: AttritionRisk;

  // Pipeline
  pipeline: TalentPipeline;

  // Meta
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface RoleSupply {
  id: string;
  jobFamily: string;
  jobTitle: string;
  jobLevel: string;
  department: string;
  location: string;

  // Current Supply
  headcount: number;
  fte: number;

  // Characteristics
  averageTenure: number;
  averageAge: number;
  averagePerformanceRating: number;

  // Availability
  promotionReady: number;
  lateralMoveReady: number;
  retirementEligible: number;
  flightRisk: number;

  // Skills
  criticalSkillsCoverage: number;
  skillGaps: SkillGap[];
}

export interface DemographicsAnalysis {
  ageDistribution: AgeGroup[];
  genderDistribution: GenderBreakdown;
  diversityMetrics: DiversityMetrics;
  generationDistribution: GenerationBreakdown;
}

export interface AgeGroup {
  ageRange: string;
  count: number;
  percentage: number;
}

export interface GenderBreakdown {
  male: number;
  female: number;
  nonBinary: number;
  notSpecified: number;
}

export interface DiversityMetrics {
  underrepresentedMinorities: number;
  underrepresentedMinoritiesPercentage: number;
  veterans: number;
  veteransPercentage: number;
  disabilities: number;
  disabilitiesPercentage: number;
}

export interface GenerationBreakdown {
  babyBoomers: number; // Born 1946-1964
  genX: number; // Born 1965-1980
  millennials: number; // Born 1981-1996
  genZ: number; // Born 1997-2012
}

export interface TenureAnalysis {
  averageTenure: number; // years
  medianTenure: number;
  tenureDistribution: TenureGroup[];
  newHiresLast12Months: number;
}

export interface TenureGroup {
  tenureRange: string; // e.g., "0-1 years", "1-3 years"
  count: number;
  percentage: number;
}

export interface SkillsInventory {
  totalSkills: number;
  criticalSkills: SkillCoverage[];
  emergingSkills: SkillCoverage[];
  skillGaps: SkillGap[];
  overallSkillCoverage: number; // percentage
}

export interface SkillCoverage {
  skillName: string;
  skillCategory: string;
  requiredProficiency: number;
  currentCoverage: number; // number of employees with skill
  averageProficiency: number;
  gap: number;
  priority: Priority;
}

export interface SkillGap {
  skillName: string;
  requiredCount: number;
  currentCount: number;
  gap: number;
  impactOnBusiness: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceDistribution {
  topPerformers: number; // percentage
  solidPerformers: number;
  needsImprovement: number;
  newEmployees: number; // not yet rated
  averageRating: number;
}

export interface InternalMobility {
  promotionReadyCount: number;
  lateralMoveReadyCount: number;
  mobilityRate: number; // percentage who moved in last 12 months
  averageTimeToPromote: number; // months
  successorsCovered: number; // percentage of key positions with successors
}

export interface RetirementEligibility {
  eligibleNow: number;
  eligibleIn1Year: number;
  eligibleIn3Years: number;
  eligibleIn5Years: number;
  retirementRisk: 'low' | 'medium' | 'high';
}

export interface AttritionRisk {
  totalAttrition12Months: number;
  attritionRate: number; // percentage
  voluntaryAttrition: number;
  involuntaryAttrition: number;
  highRiskEmployees: number;
  criticalRoleAttrition: number;
  predictedAttritionNext12Months: number;
}

export interface TalentPipeline {
  activeCandidates: number;
  offersPending: number;
  hiresPending: number;
  internsPipeline: number;
  returnBoomerangs: number;
  alumnniNetwork: number;
}

// ============================================================================
// Gap Analysis
// ============================================================================

export interface GapAnalysis {
  id: string;
  analysisCode: string;
  analysisName: string;
  status: Status;
  description: string;

  // Linked Analyses
  demandForecastId: string;
  supplyAnalysisId: string;

  // Time Period
  analysisDate: string;
  forecastPeriodIds: string[];

  // Overall Gap
  totalDemand: number;
  totalSupply: number;
  totalGap: number;
  gapPercentage: number;

  // Gap by Period
  periodGaps: PeriodGap[];

  // Gap by Role
  roleGaps: RoleGap[];

  // Gap Categories
  quantitativeGaps: QuantitativeGap[];
  qualitativeGaps: QualitativeGap[];

  // Action Plan
  closureStrategies: GapClosureStrategy[];
  estimatedClosureDate?: string;
  closureConfidence: 'low' | 'medium' | 'high';

  // Meta
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface PeriodGap {
  periodId: string;
  periodName: string;
  demand: number;
  supply: number;
  gap: number;
  gapType: 'surplus' | 'shortage' | 'balanced';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RoleGap {
  id: string;
  jobFamily: string;
  jobTitle: string;
  jobLevel: string;
  department: string;
  location: string;

  // Gap Metrics
  demand: number;
  supply: number;
  gap: number;
  gapType: 'surplus' | 'shortage' | 'balanced';

  // Impact
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  urgency: Priority;
  difficulty: 'easy' | 'moderate' | 'difficult' | 'very_difficult';

  // Closure Plan
  recommendedActions: string[];
  estimatedTimeToClose: number; // months
  estimatedCost: number;
}

export interface QuantitativeGap {
  category: string;
  description: string;
  currentCount: number;
  requiredCount: number;
  gap: number;
  priority: Priority;
}

export interface QualitativeGap {
  category: 'skills' | 'competencies' | 'experience' | 'leadership' | 'culture';
  description: string;
  currentState: string;
  desiredState: string;
  gapSeverity: 'low' | 'medium' | 'high';
  priority: Priority;
}

export interface GapClosureStrategy {
  id: string;
  strategyType:
    | 'external_hire'
    | 'internal_promotion'
    | 'lateral_transfer'
    | 'upskilling'
    | 'reskilling'
    | 'contractor'
    | 'outsource'
    | 'automation'
    | 'restructure';
  description: string;
  targetRoles: string[];
  estimatedImpact: number; // number of positions addressed
  timeline: number; // months
  estimatedCost: number;
  feasibility: 'low' | 'medium' | 'high';
  priority: Priority;
  owner?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
}

// ============================================================================
// Scenario Modeling
// ============================================================================

export interface ScenarioModel {
  id: string;
  scenarioCode: string;
  scenarioName: string;
  scenarioType: 'baseline' | 'optimistic' | 'pessimistic' | 'custom';
  status: Status;
  description: string;

  // Base Forecast
  baseForecastId?: string;

  // Time Period
  startDate: string;
  endDate: string;
  modelingPeriods: string[];

  // Scenario Variables
  variables: ScenarioVariable[];

  // Workforce Model
  headcountProjection: HeadcountProjection[];
  costProjection: CostProjection[];

  // Outcomes
  totalHeadcountEnd: number;
  totalCostEnd: number;
  totalHeadcountChange: number;
  totalCostChange: number;

  // Comparison
  comparisonScenarios?: string[]; // IDs of scenarios to compare

  // Meta
  createdBy: string;
  createdDate: string;
  lastModified: string;
  version: string;
}

export interface ScenarioVariable {
  id: string;
  variableName: string;
  variableType:
    | 'growth_rate'
    | 'attrition_rate'
    | 'promotion_rate'
    | 'salary_increase'
    | 'hiring_rate'
    | 'productivity'
    | 'custom';
  baselineValue: number;
  scenarioValue: number;
  unit: string;
  description: string;
  impactDescription: string;
}

export interface HeadcountProjection {
  periodId: string;
  periodName: string;
  startDate: string;
  endDate: string;

  // Headcount
  startingHeadcount: number;
  hires: number;
  promotions: number;
  lateralMoves: number;
  attrition: number;
  retirements: number;
  endingHeadcount: number;
  netChange: number;

  // By Department/Role
  departmentBreakdown: DepartmentHeadcount[];
  roleBreakdown: RoleHeadcount[];
}

export interface DepartmentHeadcount {
  department: string;
  headcount: number;
  change: number;
}

export interface RoleHeadcount {
  jobFamily: string;
  jobTitle: string;
  headcount: number;
  change: number;
}

export interface CostProjection {
  periodId: string;
  periodName: string;

  // Salary & Wages
  baseSalary: number;
  bonuses: number;
  overtimePay: number;

  // Benefits
  healthInsurance: number;
  retirementContributions: number;
  otherBenefits: number;

  // Other Costs
  recruiting: number;
  training: number;
  severance: number;

  // Totals
  totalCompensation: number;
  totalBenefits: number;
  totalOtherCosts: number;
  totalWorkforceCost: number;

  // Per Employee
  costPerEmployee: number;
}

// ============================================================================
// Succession Readiness
// ============================================================================

export interface SuccessionReadiness {
  id: string;
  assessmentCode: string;
  assessmentName: string;
  status: Status;
  description: string;

  // Scope
  assessmentDate: string;
  criticalPositions: CriticalPosition[];

  // Overall Metrics
  totalCriticalPositions: number;
  positionsWithSuccessors: number;
  successionCoverageRate: number; // percentage
  averageReadyNow: number;
  averageReady1to2Years: number;
  averageReady3to5Years: number;

  // Risk Assessment
  highRiskPositions: number;
  mediumRiskPositions: number;
  lowRiskPositions: number;

  // Action Plan
  developmentNeeds: DevelopmentNeed[];
  accelerationPrograms: AccelerationProgram[];

  // Meta
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface CriticalPosition {
  id: string;
  positionTitle: string;
  department: string;
  location: string;
  currentIncumbent: string;
  currentIncumbentId: string;

  // Criticality
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  difficultyToReplace: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  vacancyRisk: 'low' | 'medium' | 'high';

  // Succession Plan
  successors: Successor[];
  successionDepth: number; // number of qualified successors
  readinessLevel: 'none' | 'low' | 'medium' | 'high';

  // Incumbent
  incumbentRetirementEligible: boolean;
  incumbentRetirementDate?: string;
  incumbentFlightRisk: 'low' | 'medium' | 'high';
  incumbentTenure: number; // years

  // Development Plan
  developmentActions: string[];
  timeline?: string;
}

export interface Successor {
  id: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  currentDepartment: string;

  // Readiness
  readinessLevel: 'ready_now' | 'ready_1_to_2_years' | 'ready_3_to_5_years' | 'not_ready';
  readinessPercentage: number;
  readinessAssessment: ReadinessAssessment;

  // Development
  developmentNeeds: string[];
  developmentPlan?: string;
  mentorAssigned?: string;

  // Performance & Potential
  performanceRating: number;
  potentialRating: number;
  is9BoxHiPo: boolean;

  // Engagement
  retentionRisk: 'low' | 'medium' | 'high';
  careerAspiration: string;
}

export interface ReadinessAssessment {
  technicalSkills: number; // percentage
  leadershipSkills: number;
  businessAcumen: number;
  culturalFit: number;
  overallReadiness: number;
  assessmentDate: string;
  assessedBy: string;
  notes?: string;
}

export interface DevelopmentNeed {
  id: string;
  employeeId: string;
  employeeName: string;
  targetPosition: string;
  developmentArea: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: Priority;
  recommendedActions: string[];
  estimatedCompletion: string;
}

export interface AccelerationProgram {
  id: string;
  programName: string;
  programType: 'leadership' | 'technical' | 'functional' | 'executive';
  description: string;
  targetPositions: string[];
  participants: string[];
  duration: number; // months
  startDate: string;
  endDate: string;
  status: Status;
  successMetrics: SuccessMetric[];
}

export interface SuccessMetric {
  metricName: string;
  target: number;
  actual?: number;
  unit: string;
}

// ============================================================================
// Talent Acquisition Plan
// ============================================================================

export interface TalentAcquisitionPlan {
  id: string;
  planCode: string;
  planName: string;
  status: Status;
  description: string;

  // Linked Gap Analysis
  gapAnalysisId: string;

  // Time Period
  planYear: number;
  startDate: string;
  endDate: string;

  // Hiring Targets
  totalHiringTarget: number;
  hiringByRole: RoleHiringPlan[];
  hiringByPeriod: PeriodHiringPlan[];

  // Sourcing Strategy
  sourcingChannels: SourcingChannel[];
  diversityTargets: DiversityTarget[];

  // Budget
  totalRecruitingBudget: number;
  budgetByCategory: BudgetCategory[];

  // Timeline
  milestones: HiringMilestone[];

  // Tracking
  actualHires: number;
  hiringProgress: number; // percentage
  budgetSpent: number;
  budgetRemaining: number;

  // Meta
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface RoleHiringPlan {
  id: string;
  jobFamily: string;
  jobTitle: string;
  jobLevel: string;
  department: string;
  location: string;

  // Targets
  hiringTarget: number;
  actualHires: number;
  remainingHires: number;

  // Priority
  priority: Priority;
  urgency: 'immediate' | 'near_term' | 'medium_term' | 'long_term';

  // Sourcing
  primarySourcingChannel: string;
  estimatedTimeToHire: number; // days
  estimatedCostPerHire: number;

  // Status
  requisitionsOpen: number;
  activelyRecruiting: number;
  offersExtended: number;
  offersPending: number;
}

export interface PeriodHiringPlan {
  periodId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  targetHires: number;
  actualHires: number;
  progress: number; // percentage
}

export interface SourcingChannel {
  channelName: string;
  channelType: 'internal' | 'referral' | 'job_board' | 'agency' | 'campus' | 'social' | 'other';
  targetHires: number;
  actualHires: number;
  costPerHire: number;
  timeToHire: number; // days
  qualityScore: number; // 1-5
  diversityScore: number; // percentage
}

export interface DiversityTarget {
  diversityCategory: string;
  targetPercentage: number;
  currentPercentage: number;
  gap: number;
  actions: string[];
}

export interface BudgetCategory {
  categoryName: string;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  utilizationRate: number; // percentage
}

export interface HiringMilestone {
  id: string;
  milestoneName: string;
  description: string;
  targetDate: string;
  completionDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  owner: string;
}

// ============================================================================
// Workforce Analytics
// ============================================================================

export interface WorkforceAnalytics {
  // Planning Metrics
  activeForecast: number;
  activeScenarios: number;
  gapAnalysesCompleted: number;
  successionCoverage: number; // percentage

  // Demand-Supply Balance
  overallGap: number;
  surplusPositions: number;
  shortagePositions: number;
  criticalGaps: number;

  // Hiring Metrics
  activeHiringPlans: number;
  totalHiringTarget: number;
  actualHires: number;
  hiringProgress: number; // percentage

  // Succession Metrics
  criticalPositionsCovered: number;
  criticalPositionsAtRisk: number;
  successorsPipeline: number;
  averageSuccessionDepth: number;

  // Cost Projections
  currentWorkforceCost: number;
  projectedWorkforceCost: number;
  costIncrease: number;
  costIncreasePercentage: number;

  // Trends
  forecastAccuracy: number; // percentage
  planExecutionRate: number; // percentage

  lastUpdated: string;
}

// ============================================================================
// Settings
// ============================================================================

export interface WorkforcePlanningSettings {
  // Forecasting Settings
  defaultForecastMethod: ForecastMethod;
  defaultTimeHorizon: TimeHorizon;
  forecastingCycle: 'annual' | 'biannual' | 'quarterly';
  requireApprovalForForecast: boolean;

  // Gap Analysis Settings
  gapThresholdPercentage: number;
  criticalGapThreshold: number;
  autoGenerateActionPlans: boolean;

  // Succession Planning Settings
  successionDepthTarget: number;
  criticalPositionCriteria: string[];
  mandatorySuccessionReview: boolean;
  successionReviewCycle: 'annual' | 'biannual' | 'quarterly';

  // Cost Settings
  defaultSalaryIncreaseRate: number;
  defaultBenefitsRate: number;
  defaultAttritionRate: number;
  defaultRecruitingCostPerHire: number;

  // Notifications
  enableNotifications: boolean;
  notifyGapIdentified: boolean;
  notifySuccessionRisk: boolean;
  notifyHiringMilestone: boolean;

  createdDate: string;
  lastModified: string;
}
