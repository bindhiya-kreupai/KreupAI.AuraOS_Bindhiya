/**
 * Performance Review Module - Type Definitions
 * 
 * Comprehensive TypeScript interfaces for performance management including:
 * - Performance Reviews & Cycles
 * - Goals & Objectives
 * - Ratings & Feedback
 * - Competencies & Skills
 * - Development Plans
 * - Calibration & Analytics
 */

// Review Cycles & Periods
export type ReviewCycleType = 'annual' | 'mid_year' | 'quarterly' | 'probation' | 'project_based';
export type ReviewStatus = 'not_started' | 'self_assessment' | 'manager_review' | '360_feedback' | 'calibration' | 'completed' | 'cancelled';
export type RatingScale = 1 | 2 | 3 | 4 | 5;

// Goals & Objectives  
export type GoalType = 'individual' | 'team' | 'organizational';
export type GoalCategory = 'performance' | 'development' | 'behavior' | 'project';
export type GoalStatus = 'draft' | 'active' | 'achieved' | 'not_achieved' | 'cancelled';

// Feedback Types
export type FeedbackType = 'self' | 'manager' | 'peer' | 'subordinate' | 'stakeholder';
export type CompetencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface PerformanceReview {
    id: string;
    reviewNumber: string;
    employeeId: string;
    employeeName: string;
    reviewerId: string;
    reviewerName: string;
    reviewCycleId: string;
    reviewCycleName: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    status: ReviewStatus;
    selfAssessment?: SelfAssessment;
    managerAssessment?: ManagerAssessment;
    feedback360?: Feedback360[];
    goals: GoalReview[];
    competencies: CompetencyReview[];
    overallRating?: RatingScale;
    overallComments?: string;
    strengths: string[];
    areasForImprovement: string[];
    developmentPlan?: DevelopmentPlan;
    calibrationScore?: number;
    submittedDate?: string;
    approvedDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewCycle {
    id: string;
    name: string;
    type: ReviewCycleType;
    fiscalYear: string;
    periodStart: string;
    periodEnd: string;
    selfAssessmentDeadline: string;
    managerReviewDeadline: string;
    calibrationDate?: string;
    isActive: boolean;
    participantCount: number;
    completionRate: number;
    createdAt: string;
    updatedAt: string;
}

export interface Goal {
    id: string;
    employeeId: string;
    title: string;
    description: string;
    type: GoalType;
    category: GoalCategory;
    status: GoalStatus;
    priority: 'low' | 'medium' | 'high' | 'critical';
    targetDate: string;
    progress: number;
    weight: number;
    metrics: GoalMetric[];
    alignedGoals?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface GoalMetric {
    id: string;
    name: string;
    target: number;
    current: number;
    unit: string;
}

export interface GoalReview {
    goalId: string;
    goalTitle: string;
    targetValue: string;
    achievedValue: string;
    rating: RatingScale;
    comments: string;
}

export interface SelfAssessment {
    overallRating: RatingScale;
    achievements: string;
    challenges: string;
    learnings: string;
    submittedDate: string;
}

export interface ManagerAssessment {
    overallRating: RatingScale;
    strengths: string;
    improvements: string;
    recommendations: string;
    submittedDate: string;
}

export interface Feedback360 {
    id: string;
    reviewId: string;
    feedbackProviderId: string;
    feedbackProviderName: string;
    feedbackType: FeedbackType;
    overallRating: RatingScale;
    comments: string;
    submittedDate: string;
}

export interface Competency {
    id: string;
    name: string;
    description: string;
    category: string;
    level: CompetencyLevel;
    behaviors: string[];
}

export interface CompetencyReview {
    competencyId: string;
    competencyName: string;
    expectedLevel: CompetencyLevel;
    actualLevel: CompetencyLevel;
    rating: RatingScale;
    comments: string;
}

export interface DevelopmentPlan {
    id: string;
    employeeId: string;
    reviewId?: string;
    objectives: DevelopmentObjective[];
    timeline: string;
    createdAt: string;
    updatedAt: string;
}

export interface DevelopmentObjective {
    id: string;
    description: string;
    actions: string[];
    resources: string[];
    targetDate: string;
    status: 'pending' | 'in_progress' | 'completed';
}

export interface CalibrationSession {
    id: string;
    reviewCycleId: string;
    date: string;
    participants: string[];
    reviews: string[];
    adjustments: CalibrationAdjustment[];
    status: 'scheduled' | 'in_progress' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface CalibrationAdjustment {
    reviewId: string;
    originalRating: RatingScale;
    calibratedRating: RatingScale;
    reason: string;
}

export interface PerformanceStats {
    totalReviews: number;
    completedReviews: number;
    averageRating: number;
    ratingDistribution: Record<RatingScale, number>;
    goalAchievementRate: number;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
