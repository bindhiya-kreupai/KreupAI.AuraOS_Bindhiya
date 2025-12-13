/**
 * Succession Planning Module - Type Definitions
 * 
 * Comprehensive TypeScript interfaces for succession planning including:
 * - Critical Positions & Identification
 * - Succession Candidates & Pools
 * - Readiness Assessment
 * - Development Plans
 * - Talent Review & 9-Box Matrix
 * - Career Paths
 * - Emergency Succession
 * - Succession Analytics
 */

// Position & Role Types
export type PositionCriticality = 'critical' | 'high' | 'medium' | 'low';
export type PositionStatus = 'active' | 'vacant' | 'filled' | 'planned';
export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

// Candidate & Readiness Types
export type ReadinessLevel = 'ready_now' | 'ready_1_year' | 'ready_2_3_years' | 'ready_4_plus_years' | 'not_ready';
export type CandidateStatus = 'active' | 'ready' | 'in_development' | 'not_suitable' | 'declined' | 'exited';
export type SuccessorType = 'primary' | 'backup' | 'emergency' | 'long_term';

// Performance & Potential Types
export type PerformanceRating = 'exceptional' | 'high' | 'solid' | 'developing' | 'low';
export type PotentialRating = 'high' | 'medium' | 'low';

// Talent Review Types
export type TalentCategory = 'star' | 'high_potential' | 'core_contributor' | 'solid_performer' | 
                           'emerging_talent' | 'inconsistent' | 'development_needed' | 'low_performer' | 'question_mark';

// Development Types
export type DevelopmentActivityType = 'training' | 'mentoring' | 'stretch_assignment' | 'job_rotation' | 
                                     'shadowing' | 'coaching' | 'formal_education' | 'project_leadership';
export type ActivityStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export interface CriticalPosition {
    id: string;
    positionCode: string;
    title: string;
    departmentId: string;
    departmentName: string;
    divisionId?: string;
    divisionName?: string;
    level: string;
    criticality: PositionCriticality;
    status: PositionStatus;
    currentIncumbentId?: string;
    currentIncumbentName?: string;
    reportingToId?: string;
    reportingToTitle?: string;
    keyResponsibilities: string[];
    criticalCompetencies: string[];
    requiredSkills: string[];
    yearsExperienceRequired: number;
    educationRequired: string;
    certificationRequired?: string[];
    vacancyRisk: RiskLevel;
    retirementDate?: string;
    expectedVacancyDate?: string;
    businessImpact: string;
    successionDepth: number; // Number of ready successors
    hasEmergencyPlan: boolean;
    lastReviewDate?: string;
    nextReviewDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SuccessionCandidate {
    id: string;
    candidateId: string;
    candidateName: string;
    currentPositionId: string;
    currentPositionTitle: string;
    targetPositionId: string;
    targetPositionTitle: string;
    successorType: SuccessorType;
    readinessLevel: ReadinessLevel;
    status: CandidateStatus;
    readinessDate?: string;
    performanceRating: PerformanceRating;
    potentialRating: PotentialRating;
    talentCategory: TalentCategory;
    currentExperience: number; // Years
    gapAnalysis: CompetencyGap[];
    developmentPlanId?: string;
    strengths: string[];
    developmentNeeds: string[];
    riskFactors: string[];
    mobilityWillingness: 'high' | 'medium' | 'low';
    relocationWillingness: boolean;
    retentionRisk: RiskLevel;
    nominatedBy: string;
    nominatedDate: string;
    approvedBy?: string;
    approvedDate?: string;
    lastAssessmentDate?: string;
    nextAssessmentDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CompetencyGap {
    competencyId: string;
    competencyName: string;
    requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    gap: number;
    developmentActions: string[];
}

export interface SuccessionPool {
    id: string;
    poolName: string;
    description: string;
    targetLevel: string;
    targetDepartment?: string;
    criteria: PoolCriteria;
    candidates: PoolCandidate[];
    isActive: boolean;
    reviewFrequency: 'quarterly' | 'biannual' | 'annual';
    lastReviewDate?: string;
    nextReviewDate?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface PoolCriteria {
    minPerformanceRating: PerformanceRating;
    minPotentialRating: PotentialRating;
    minYearsExperience: number;
    requiredCompetencies: string[];
    educationLevel?: string;
}

export interface PoolCandidate {
    employeeId: string;
    employeeName: string;
    currentPosition: string;
    addedDate: string;
    performanceRating: PerformanceRating;
    potentialRating: PotentialRating;
    readinessLevel: ReadinessLevel;
}

export interface DevelopmentPlan {
    id: string;
    planCode: string;
    employeeId: string;
    employeeName: string;
    currentPositionId: string;
    currentPositionTitle: string;
    targetPositionId: string;
    targetPositionTitle: string;
    readinessGoal: ReadinessLevel;
    targetDate: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    competencyGaps: CompetencyGap[];
    developmentActivities: DevelopmentActivity[];
    milestones: DevelopmentMilestone[];
    budget?: number;
    currency?: string;
    progress: number; // Percentage
    lastReviewDate?: string;
    reviewedBy?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface DevelopmentActivity {
    id: string;
    planId: string;
    activityType: DevelopmentActivityType;
    title: string;
    description: string;
    targetCompetencies: string[];
    startDate: string;
    endDate: string;
    status: ActivityStatus;
    cost?: number;
    provider?: string;
    completionPercentage: number;
    completedDate?: string;
    outcome?: string;
    notes?: string;
}

export interface DevelopmentMilestone {
    id: string;
    title: string;
    targetDate: string;
    status: 'pending' | 'achieved' | 'missed';
    achievedDate?: string;
    description: string;
}

export interface TalentReview {
    id: string;
    reviewCode: string;
    reviewName: string;
    reviewDate: string;
    fiscalYear: string;
    departmentId?: string;
    departmentName?: string;
    reviewers: Reviewer[];
    participants: TalentReviewParticipant[];
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    agenda: string[];
    keyDecisions: string[];
    actionItems: ActionItem[];
    nextReviewDate?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Reviewer {
    employeeId: string;
    employeeName: string;
    role: string;
    isPrimary: boolean;
}

export interface TalentReviewParticipant {
    employeeId: string;
    employeeName: string;
    currentPosition: string;
    performanceRating: PerformanceRating;
    potentialRating: PotentialRating;
    talentCategory: TalentCategory;
    nineBoxPosition: NineBoxPosition;
    discussionPoints: string[];
    decisions: string[];
}

export interface NineBoxPosition {
    x: number; // 1-3 (Performance: Low, Medium, High)
    y: number; // 1-3 (Potential: Low, Medium, High)
    category: TalentCategory;
}

export interface ActionItem {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    completedDate?: string;
}

export interface CareerPath {
    id: string;
    pathName: string;
    description: string;
    startPositionId: string;
    startPositionTitle: string;
    endPositionId: string;
    endPositionTitle: string;
    positions: CareerPathPosition[];
    estimatedDuration: number; // Years
    requiredExperience: number; // Years
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CareerPathPosition {
    order: number;
    positionId: string;
    positionTitle: string;
    level: string;
    typicalDuration: number; // Years
    requiredCompetencies: string[];
    developmentActivities: string[];
}

export interface EmergencySuccession {
    id: string;
    criticalPositionId: string;
    criticalPositionTitle: string;
    triggerEvents: string[];
    emergencySuccessors: EmergencySuccessor[];
    interimActions: string[];
    communicationPlan: string;
    approvedBy: string;
    approvedDate: string;
    lastUpdated: string;
    lastTestedDate?: string;
    nextTestDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EmergencySuccessor {
    priority: number;
    employeeId: string;
    employeeName: string;
    currentPosition: string;
    readinessLevel: ReadinessLevel;
    contactInfo: string;
    limitationsOnRole?: string;
    expectedDuration: string; // e.g., "Until permanent replacement found"
}

export interface SuccessionMetrics {
    totalCriticalPositions: number;
    positionsWithSuccessors: number;
    positionsCoverage: number; // Percentage
    readyNowSuccessors: number;
    avgSuccessionDepth: number;
    highRiskPositions: number;
    avgTimeToReadiness: number; // Months
    developmentPlansActive: number;
    talentPoolSize: number;
    retentionRiskCount: number;
}

export interface SuccessionRiskAnalysis {
    positionId: string;
    positionTitle: string;
    riskScore: number; // 0-100
    riskLevel: RiskLevel;
    factors: RiskFactor[];
    mitigationActions: string[];
    lastAssessed: string;
}

export interface RiskFactor {
    factor: string;
    impact: 'high' | 'medium' | 'low';
    likelihood: 'high' | 'medium' | 'low';
    description: string;
}

export interface SuccessionSettings {
    reviewFrequency: 'quarterly' | 'biannual' | 'annual';
    mandatorySuccessionDepth: number;
    retirementNoticeMonths: number;
    talentReviewCalendar: string[];
    nineBoxEnabled: boolean;
    emergencyPlanRequired: boolean;
    autoNotifications: SuccessionNotifications;
}

export interface SuccessionNotifications {
    vacancyRiskAlert: boolean;
    developmentPlanDue: boolean;
    talentReviewReminder: boolean;
    readinessDateApproaching: boolean;
    retirementAlert: boolean;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
