/**
 * Onboarding Module - Type Definitions
 *
 * Comprehensive TypeScript interfaces for employee onboarding including:
 * - Pre-boarding Management
 * - Onboarding Programs & Templates
 * - Checklist & Task Management
 * - First Day Experience
 * - Induction Programs
 * - Buddy Assignment
 * - Document Collection
 * - Equipment & Access Provisioning
 * - Training Schedules
 * - 30-60-90 Day Plans
 * - Feedback & Surveys
 * - Onboarding Analytics
 */

// Core Enums
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'skipped' | 'not_applicable';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskCategory = 'documentation' | 'equipment' | 'access' | 'training' | 'orientation' | 'compliance' | 'administrative' | 'social';
export type ResponsibleParty = 'hr' | 'it' | 'manager' | 'buddy' | 'new_hire' | 'admin' | 'facilities';
export type OnboardingPhase = 'pre_boarding' | 'first_day' | 'first_week' | 'first_month' | 'day_30' | 'day_60' | 'day_90';
export type DocumentStatus = 'pending' | 'submitted' | 'verified' | 'approved' | 'rejected' | 'expired';
export type EquipmentStatus = 'requested' | 'approved' | 'ordered' | 'received' | 'assigned' | 'returned';
export type AccessStatus = 'pending' | 'requested' | 'granted' | 'revoked' | 'expired';
export type BuddyStatus = 'assigned' | 'active' | 'completed' | 'unassigned';
export type FeedbackType = 'new_hire' | 'manager' | 'buddy' | 'hr' | 'exit_survey';
export type SurveyFrequency = 'day_1' | 'week_1' | 'day_30' | 'day_60' | 'day_90' | 'day_180';

// Onboarding Program & Template
export interface OnboardingProgram {
    id: string;
    programCode: string;
    programName: string;
    description: string;
    department?: string;
    position?: string;
    grade?: string;
    employeeType?: string;
    isTemplate: boolean;
    durationDays: number;
    phases: OnboardingPhaseConfig[];
    checklistTemplate: ChecklistTemplate;
    documentsRequired: DocumentRequirement[];
    equipmentRequired: EquipmentRequirement[];
    accessRequired: AccessRequirement[];
    trainingModules: TrainingModule[];
    buddyRequired: boolean;
    surveySchedule: SurveySchedule[];
    isActive: boolean;
    usageCount: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardingPhaseConfig {
    phase: OnboardingPhase;
    name: string;
    startDayOffset: number; // Days from hire date
    durationDays: number;
    description: string;
    goals: string[];
    keyActivities: string[];
}

export interface ChecklistTemplate {
    id: string;
    templateName: string;
    categories: ChecklistCategory[];
    totalTasks: number;
}

export interface ChecklistCategory {
    categoryId: string;
    categoryName: string;
    category: TaskCategory;
    description: string;
    displayOrder: number;
    tasks: TaskTemplate[];
}

export interface TaskTemplate {
    taskId: string;
    taskName: string;
    description: string;
    category: TaskCategory;
    phase: OnboardingPhase;
    responsibleParty: ResponsibleParty;
    priority: TaskPriority;
    dueInDays: number; // Days from hire date
    estimatedHours?: number;
    instructions?: string;
    resources?: string[];
    isMandatory: boolean;
    requiresApproval: boolean;
    dependencies?: string[]; // Task IDs that must be completed first
    displayOrder: number;
}

// Onboarding Instance
export interface OnboardingInstance {
    id: string;
    onboardingCode: string;
    programId: string;
    programName: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    email: string;
    phone: string;
    departmentId: string;
    departmentName: string;
    positionId: string;
    positionTitle: string;
    managerId: string;
    managerName: string;
    buddyId?: string;
    buddyName?: string;
    hireDate: string;
    startDate: string;
    expectedCompletionDate: string;
    actualCompletionDate?: string;
    status: OnboardingStatus;
    currentPhase: OnboardingPhase;
    progress: number; // Percentage
    tasks: OnboardingTask[];
    documents: OnboardingDocument[];
    equipment: OnboardingEquipment[];
    access: OnboardingAccess[];
    training: OnboardingTraining[];
    surveys: OnboardingSurvey[];
    notes: OnboardingNote[];
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardingTask {
    id: string;
    taskId: string;
    taskName: string;
    description: string;
    category: TaskCategory;
    phase: OnboardingPhase;
    responsibleParty: ResponsibleParty;
    assignedTo?: string;
    assignedToName?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    completedDate?: string;
    completedBy?: string;
    completedByName?: string;
    estimatedHours?: number;
    actualHours?: number;
    instructions?: string;
    resources?: string[];
    isMandatory: boolean;
    requiresApproval: boolean;
    approvedBy?: string;
    approvedDate?: string;
    comments?: string;
    attachments?: string[];
    dependencies?: string[];
    displayOrder: number;
}

// Document Management
export interface DocumentRequirement {
    documentId: string;
    documentType: string;
    documentName: string;
    description: string;
    isMandatory: boolean;
    phase: OnboardingPhase;
    dueInDays: number;
    validityDays?: number;
    requiresVerification: boolean;
    verifier?: ResponsibleParty;
    sampleDocument?: string;
    instructions?: string;
}

export interface OnboardingDocument {
    id: string;
    documentId: string;
    documentType: string;
    documentName: string;
    description: string;
    isMandatory: boolean;
    status: DocumentStatus;
    uploadedDate?: string;
    uploadedBy?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    verifiedBy?: string;
    verifiedDate?: string;
    approvedBy?: string;
    approvedDate?: string;
    rejectedBy?: string;
    rejectionReason?: string;
    expiryDate?: string;
    comments?: string;
}

// Equipment Provisioning
export interface EquipmentRequirement {
    equipmentId: string;
    equipmentType: string;
    equipmentName: string;
    description: string;
    isMandatory: boolean;
    quantity: number;
    specifications?: string;
    requestedBy?: ResponsibleParty;
    approver?: ResponsibleParty;
}

export interface OnboardingEquipment {
    id: string;
    equipmentId: string;
    equipmentType: string;
    equipmentName: string;
    description: string;
    quantity: number;
    status: EquipmentStatus;
    requestedDate: string;
    requestedBy: string;
    approvedBy?: string;
    approvedDate?: string;
    orderedDate?: string;
    receivedDate?: string;
    assignedDate?: string;
    assetTag?: string;
    serialNumber?: string;
    vendor?: string;
    cost?: number;
    returnDate?: string;
    condition?: string;
    notes?: string;
}

// Access Provisioning
export interface AccessRequirement {
    accessId: string;
    accessType: string;
    accessName: string;
    description: string;
    isMandatory: boolean;
    systems: string[];
    permissions: string[];
    requestedBy?: ResponsibleParty;
    approver?: ResponsibleParty;
}

export interface OnboardingAccess {
    id: string;
    accessId: string;
    accessType: string;
    accessName: string;
    description: string;
    systems: string[];
    permissions: string[];
    status: AccessStatus;
    requestedDate: string;
    requestedBy: string;
    approvedBy?: string;
    approvedDate?: string;
    grantedDate?: string;
    grantedBy?: string;
    username?: string;
    accountId?: string;
    expiryDate?: string;
    revokedDate?: string;
    revokedBy?: string;
    notes?: string;
}

// Training & Induction
export interface TrainingModule {
    moduleId: string;
    moduleName: string;
    description: string;
    type: 'orientation' | 'compliance' | 'technical' | 'soft_skills' | 'safety' | 'product';
    phase: OnboardingPhase;
    isMandatory: boolean;
    durationHours: number;
    deliveryMode: 'in_person' | 'virtual' | 'e_learning' | 'self_paced' | 'hybrid';
    instructor?: string;
    materials?: string[];
    completionCriteria: string;
    assessmentRequired: boolean;
}

export interface OnboardingTraining {
    id: string;
    moduleId: string;
    moduleName: string;
    description: string;
    type: string;
    phase: OnboardingPhase;
    status: TaskStatus;
    scheduledDate?: string;
    completedDate?: string;
    durationHours: number;
    deliveryMode: string;
    instructor?: string;
    location?: string;
    meetingLink?: string;
    materials?: string[];
    attendanceMarked: boolean;
    assessmentScore?: number;
    assessmentPassed?: boolean;
    feedback?: string;
    certificate?: string;
}

// Buddy Program
export interface BuddyAssignment {
    id: string;
    onboardingId: string;
    newHireId: string;
    newHireName: string;
    buddyId: string;
    buddyName: string;
    buddyEmail: string;
    buddyPhone: string;
    assignedDate: string;
    status: BuddyStatus;
    assignedBy: string;
    responsibilities: string[];
    meetingSchedule: BuddyMeeting[];
    feedback: BuddyFeedback[];
    completionDate?: string;
    notes?: string;
}

export interface BuddyMeeting {
    meetingId: string;
    title: string;
    scheduledDate: string;
    durationMinutes: number;
    agenda: string[];
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    completedDate?: string;
    notes?: string;
    actionItems?: string[];
}

export interface BuddyFeedback {
    feedbackId: string;
    providedDate: string;
    providedBy: 'buddy' | 'new_hire';
    rating: number; // 1-5
    comments: string;
    concerns?: string[];
    highlights?: string[];
}

// 30-60-90 Day Plan
export interface Day30_60_90Plan {
    id: string;
    onboardingId: string;
    employeeId: string;
    employeeName: string;
    managerId: string;
    managerName: string;
    createdDate: string;
    day30Goals: PlanMilestone;
    day60Goals: PlanMilestone;
    day90Goals: PlanMilestone;
    status: OnboardingStatus;
    lastReviewDate?: string;
    nextReviewDate?: string;
    notes?: string;
}

export interface PlanMilestone {
    milestoneId: string;
    phase: 'day_30' | 'day_60' | 'day_90';
    targetDate: string;
    goals: Goal[];
    competencies: string[];
    keyActivities: string[];
    successCriteria: string[];
    reviewDate?: string;
    reviewedBy?: string;
    status: OnboardingStatus;
    achievementPercentage: number;
    managerFeedback?: string;
    employeeFeedback?: string;
}

export interface Goal {
    goalId: string;
    description: string;
    category: 'learning' | 'performance' | 'relationships' | 'projects';
    priority: TaskPriority;
    status: TaskStatus;
    completedDate?: string;
    notes?: string;
}

// Surveys & Feedback
export interface SurveySchedule {
    surveyId: string;
    surveyName: string;
    frequency: SurveyFrequency;
    dayOffset: number;
    questions: SurveyQuestion[];
}

export interface SurveyQuestion {
    questionId: string;
    question: string;
    type: 'rating' | 'text' | 'yes_no' | 'multiple_choice';
    options?: string[];
    isMandatory: boolean;
}

export interface OnboardingSurvey {
    id: string;
    surveyId: string;
    surveyName: string;
    frequency: SurveyFrequency;
    scheduledDate: string;
    status: 'scheduled' | 'sent' | 'completed' | 'overdue';
    sentDate?: string;
    completedDate?: string;
    responses: SurveyResponse[];
    overallRating?: number;
    comments?: string;
}

export interface SurveyResponse {
    questionId: string;
    question: string;
    type: string;
    answer: string | number | boolean;
}

export interface NewHireFeedback {
    id: string;
    onboardingId: string;
    employeeId: string;
    employeeName: string;
    feedbackType: FeedbackType;
    providedDate: string;
    providedBy: string;
    providedByName: string;
    phase: OnboardingPhase;
    overallRating: number; // 1-5
    experienceRating: number;
    supportRating: number;
    clarityRating: number;
    readinessRating: number;
    strengths: string[];
    improvements: string[];
    challenges: string[];
    recommendations: string[];
    comments: string;
    isAnonymous: boolean;
}

// Notes & Communication
export interface OnboardingNote {
    id: string;
    noteType: 'general' | 'issue' | 'escalation' | 'achievement' | 'concern';
    subject: string;
    content: string;
    createdBy: string;
    createdByName: string;
    createdDate: string;
    visibility: 'private' | 'manager' | 'hr' | 'all';
    priority: TaskPriority;
    isResolved: boolean;
    resolvedDate?: string;
    attachments?: string[];
}

// Pre-boarding
export interface PreBoardingPackage {
    id: string;
    onboardingId: string;
    employeeId: string;
    employeeName: string;
    sentDate: string;
    status: 'draft' | 'sent' | 'acknowledged' | 'completed';
    acknowledgedDate?: string;
    completedDate?: string;
    welcomeMessage: string;
    materials: PreBoardingMaterial[];
    forms: PreBoardingForm[];
    contacts: PreBoardingContact[];
    firstDayInfo: FirstDayInformation;
}

export interface PreBoardingMaterial {
    materialId: string;
    title: string;
    description: string;
    type: 'video' | 'document' | 'link' | 'handbook';
    url: string;
    isRequired: boolean;
    viewed: boolean;
    viewedDate?: string;
}

export interface PreBoardingForm {
    formId: string;
    formName: string;
    description: string;
    fields: FormField[];
    isRequired: boolean;
    status: DocumentStatus;
    submittedDate?: string;
}

export interface FormField {
    fieldId: string;
    fieldName: string;
    fieldType: 'text' | 'email' | 'phone' | 'date' | 'select' | 'file';
    isRequired: boolean;
    value?: string;
    options?: string[];
}

export interface PreBoardingContact {
    contactType: 'hr' | 'manager' | 'buddy' | 'it';
    name: string;
    email: string;
    phone: string;
    role: string;
}

export interface FirstDayInformation {
    reportingTime: string;
    location: string;
    address: string;
    parkingInfo?: string;
    dressCode: string;
    whatToBring: string[];
    agenda: FirstDayAgendaItem[];
    emergencyContact: string;
}

export interface FirstDayAgendaItem {
    time: string;
    activity: string;
    location: string;
    attendees?: string[];
    duration: number; // minutes
}

// Analytics & Metrics
export interface OnboardingMetrics {
    totalOnboardings: number;
    activeOnboardings: number;
    completedOnboardings: number;
    averageDuration: number; // days
    completionRate: number; // percentage
    onTimeCompletionRate: number; // percentage
    averageTaskCompletionRate: number;
    averageSatisfactionScore: number;
    byPhase: PhaseMetrics[];
    byDepartment: DepartmentOnboardingMetrics[];
    commonChallenges: ChallengeMetric[];
    topPerformingBuddies: BuddyMetric[];
    documentCompletionRate: number;
    equipmentDeliveryTime: number; // average days
    accessProvisioningTime: number; // average days
    trainingCompletionRate: number;
}

export interface PhaseMetrics {
    phase: OnboardingPhase;
    phaseName: string;
    averageDuration: number;
    completionRate: number;
    commonIssues: string[];
}

export interface DepartmentOnboardingMetrics {
    departmentId: string;
    departmentName: string;
    onboardings: number;
    averageDuration: number;
    completionRate: number;
    satisfactionScore: number;
}

export interface ChallengeMetric {
    challenge: string;
    frequency: number;
    impact: 'high' | 'medium' | 'low';
    phase: OnboardingPhase;
}

export interface BuddyMetric {
    buddyId: string;
    buddyName: string;
    assignmentsCompleted: number;
    averageRating: number;
    successRate: number;
}

// Settings
export interface OnboardingSettings {
    defaultProgramId?: string;
    autoAssignBuddy: boolean;
    buddyMatchingCriteria: 'department' | 'role' | 'random' | 'manual';
    autoSendPreBoarding: boolean;
    preBoardingDaysBeforeStart: number;
    autoCreateTasks: boolean;
    sendTaskReminders: boolean;
    reminderDaysBefore: number;
    enableSurveys: boolean;
    enable30_60_90Plan: boolean;
    requireManagerReview: boolean;
    managerReviewFrequency: 'weekly' | 'biweekly' | 'monthly';
    autoNotifications: OnboardingNotifications;
}

export interface OnboardingNotifications {
    newHireWelcome: boolean;
    preBoardingPackage: boolean;
    taskAssigned: boolean;
    taskDue: boolean;
    taskOverdue: boolean;
    documentPending: boolean;
    equipmentReady: boolean;
    accessGranted: boolean;
    surveyDue: boolean;
    buddyAssigned: boolean;
    milestoneReached: boolean;
    completionCertificate: boolean;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
