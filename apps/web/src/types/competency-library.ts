/**
 * @module CompetencyLibrary Types
 * @description Shared types for Competency Library module
 */

// ============================================================================
// COMPETENCY CATALOG TYPES
// ============================================================================

export type CompetencyCategoryType = 'Technical' | 'Leadership' | 'Behavioral' | 'Functional' | 'Core';
export type CompetencyStatus = 'Active' | 'Draft' | 'Archived' | 'Under Review';
export type ProficiencyLevelName = 'Foundational' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert';

export interface CompetencyCategory {
    id: string;
    code: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    status: string;
}

export interface CompetencySubcategory {
    id: string;
    categoryId: string;
    code: string;
    name: string;
    status: string;
}

export interface ProficiencyDescriptor {
    id: string;
    levelId: string;
    level: ProficiencyLevel;
    description?: string;
    behaviors?: string[];
}

export interface DevelopmentResource {
    id: string;
    title: string;
    type: string;
    url?: string;
    provider?: string;
    duration?: string;
    cost?: number;
}

export interface AssessmentCriteria {
    id: string;
    criteria: string;
    sortOrder: number;
}

export interface Competency {
    id: string;
    code: string;
    name: string;
    categoryId: string;
    category?: CompetencyCategory;
    subcategoryId?: string;
    subcategory?: CompetencySubcategory;
    description?: string;
    status: CompetencyStatus;
    version: string;
    owner?: string;
    usageCount: number;
    proficiencyDescriptors?: ProficiencyDescriptor[];
    applicableRoles?: string[];
    developmentResources?: DevelopmentResource[];
    assessmentCriteria?: AssessmentCriteria[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCompetencyInput {
    code: string;
    name: string;
    categoryId: string;
    subcategoryId?: string;
    description?: string;
    status?: CompetencyStatus;
    version?: string;
    owner?: string;
}

export interface UpdateCompetencyInput extends Partial<CreateCompetencyInput> {
    id: string;
}

// ============================================================================
// PROFICIENCY FRAMEWORK TYPES
// ============================================================================

export interface ProficiencyFramework {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: 'Standard' | 'Custom' | 'Industry';
    isDefault: boolean;
    status: string;
    levels?: ProficiencyLevel[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProficiencyLevel {
    id: string;
    frameworkId: string;
    code: string;
    name: string;
    levelNumber: number;
    description?: string;
    color?: string;
    icon?: string;
}

export interface CreateFrameworkInput {
    code: string;
    name: string;
    description?: string;
    type?: 'Standard' | 'Custom' | 'Industry';
    levels: Omit<ProficiencyLevel, 'id' | 'frameworkId'>[];
}

// ============================================================================
// JOB COMPETENCY MAPPING TYPES
// ============================================================================

export interface JobRole {
    id: string;
    code: string;
    name: string;
    departmentId?: string;
    description?: string;
    level?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    status: string;
    competencyMappings?: JobCompetencyMapping[];
    createdAt: Date;
    updatedAt: Date;
}

export interface JobCompetencyMapping {
    id: string;
    jobRoleId: string;
    jobRole?: JobRole;
    competencyId: string;
    competency?: Competency;
    requiredLevelId: string;
    requiredLevel?: ProficiencyLevel;
    weight: number;
    isRequired: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date;
}

export interface CreateJobMappingInput {
    jobRoleId: string;
    competencies: {
        competencyId: string;
        requiredLevelId: string;
        weight: number;
        isRequired: boolean;
    }[];
}

// ============================================================================
// SKILL ASSESSMENT TYPES
// ============================================================================

export type AssessmentType = 'Self' | 'Manager' | '360' | 'Peer';
export type AssessmentStatus = 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';

export interface SkillAssessment {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: AssessmentType;
    status: AssessmentStatus;
    employeeId?: string;
    jobRoleId?: string;
    jobRole?: JobRole;
    cycleId?: string;
    assessorIds?: string[];
    startDate?: Date;
    endDate?: Date;
    completedAt?: Date;
    competencies?: AssessmentCompetency[];
    results?: AssessmentResult[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AssessmentCompetency {
    id: string;
    assessmentId: string;
    competencyId: string;
    competency?: Competency;
    weight: number;
}

export interface AssessmentResult {
    id: string;
    assessmentId: string;
    competencyId: string;
    assessorId?: string;
    assessorType?: string;
    ratingLevelId: string;
    ratingLevel?: ProficiencyLevel;
    comments?: string;
    evidence?: string;
}

export interface CreateAssessmentInput {
    name: string;
    description?: string;
    type: AssessmentType;
    employeeId?: string;
    jobRoleId?: string;
    cycleId?: string;
    assessorIds?: string[];
    startDate?: string;
    endDate?: string;
    competencyIds: string[];
}

// ============================================================================
// GAP ANALYSIS TYPES
// ============================================================================

export type GapAnalysisType = 'Individual' | 'Team' | 'Department' | 'Organization';
export type GapPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface GapAnalysis {
    id: string;
    code: string;
    name: string;
    type: GapAnalysisType;
    targetType?: string;
    targetId?: string;
    status: string;
    analysisDate: Date;
    items?: GapAnalysisItem[];
    developmentPlan?: DevelopmentPlan;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GapAnalysisItem {
    id: string;
    gapAnalysisId: string;
    competencyId: string;
    competency?: Competency;
    currentLevelId: string;
    currentLevel?: ProficiencyLevel;
    targetLevelId: string;
    targetLevel?: ProficiencyLevel;
    gapScore: number;
    priority: GapPriority;
    notes?: string;
}

// ============================================================================
// DEVELOPMENT PLAN TYPES
// ============================================================================

export type DevelopmentPlanType = 'Individual' | 'Team' | 'Department' | 'Organization';
export type DevelopmentPlanStatus = 'Draft' | 'Active' | 'In Progress' | 'Completed' | 'Cancelled';
export type ActivityType = 'Training' | 'Course' | 'Mentoring' | 'Workshop' | 'Certification' | 'On-the-job';
export type ActivityStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
export type MilestoneStatus = 'Pending' | 'Achieved' | 'Missed';

export interface DevelopmentPlan {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: DevelopmentPlanType;
    targetType?: string;
    targetId?: string;
    gapAnalysisId?: string;
    gapAnalysis?: GapAnalysis;
    status: DevelopmentPlanStatus;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    activities?: DevelopmentActivity[];
    milestones?: DevelopmentMilestone[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DevelopmentActivity {
    id: string;
    developmentPlanId: string;
    name: string;
    type: ActivityType;
    provider?: string;
    description?: string;
    duration?: string;
    estimatedCost?: number;
    actualCost?: number;
    startDate?: Date;
    endDate?: Date;
    completedAt?: Date;
    status: ActivityStatus;
    competencyIds?: string[];
    sortOrder: number;
}

export interface DevelopmentMilestone {
    id: string;
    developmentPlanId: string;
    name: string;
    description?: string;
    targetDate: Date;
    completedAt?: Date;
    status: MilestoneStatus;
    sortOrder: number;
}

export interface CreateDevelopmentPlanInput {
    name: string;
    description?: string;
    type: DevelopmentPlanType;
    targetType?: string;
    targetId?: string;
    gapAnalysisId?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    activities?: Omit<DevelopmentActivity, 'id' | 'developmentPlanId'>[];
    milestones?: Omit<DevelopmentMilestone, 'id' | 'developmentPlanId'>[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
