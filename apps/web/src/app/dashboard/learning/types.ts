/**
 * Learning Management System - Type Definitions
 * 
 * Comprehensive TypeScript interfaces for learning and development including:
 * - Courses & Learning Paths
 * - Enrollments & Progress Tracking
 * - Assessments & Certifications
 * - Training Calendar & Attendance
 * - Skill Gap Analysis
 * - Training Budget & External Training
 * - Mentoring & Knowledge Repository
 * - Compliance Training & Analytics
 */

// Course & Content Types
export type CourseType = 'e_learning' | 'instructor_led' | 'virtual_classroom' | 'blended' | 'self_paced' | 'on_the_job';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type CourseStatus = 'draft' | 'published' | 'archived' | 'under_review';
export type ContentType = 'video' | 'document' | 'quiz' | 'assignment' | 'scorm' | 'interactive' | 'article';

// Enrollment Types
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'withdrawn' | 'waitlisted' | 'expired';
export type EnrollmentType = 'mandatory' | 'optional' | 'recommended' | 'self_enrolled';

// Assessment Types
export type AssessmentType = 'quiz' | 'exam' | 'assignment' | 'practical' | 'project' | 'certification';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'file_upload';

// Training Session Types
export type SessionType = 'classroom' | 'virtual' | 'workshop' | 'webinar' | 'conference' | 'seminar';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Certification Types
export type CertificationStatus = 'active' | 'expired' | 'revoked' | 'pending_renewal';

export interface Course {
    id: string;
    courseCode: string;
    title: string;
    description: string;
    type: CourseType;
    level: CourseLevel;
    status: CourseStatus;
    categoryId: string;
    categoryName: string;
    instructorId?: string;
    instructorName?: string;
    duration: number; // Hours
    durationUnit: 'hours' | 'days' | 'weeks';
    thumbnailUrl?: string;
    objectives: string[];
    prerequisites: string[];
    targetAudience: string;
    skills: string[];
    competencies: string[];
    maxParticipants?: number;
    currentEnrollments: number;
    passingScore?: number; // Percentage
    credits?: number;
    ceus?: number; // Continuing Education Units
    cost?: number;
    currency?: string;
    tags: string[];
    isComplianceTraining: boolean;
    validityPeriod?: number; // Days
    modules: CourseModule[];
    publishedDate?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CourseModule {
    id: string;
    courseId: string;
    title: string;
    description: string;
    order: number;
    duration: number; // Minutes
    isRequired: boolean;
    content: ModuleContent[];
}

export interface ModuleContent {
    id: string;
    moduleId: string;
    title: string;
    type: ContentType;
    order: number;
    url?: string;
    fileUrl?: string;
    embedCode?: string;
    duration?: number; // Minutes
    isRequired: boolean;
    completionCriteria?: string;
}

export interface LearningPath {
    id: string;
    pathCode: string;
    title: string;
    description: string;
    level: CourseLevel;
    categoryId: string;
    categoryName: string;
    duration: number; // Total hours
    courses: LearningPathCourse[];
    skills: string[];
    competencies: string[];
    isActive: boolean;
    enrollmentCount: number;
    completionRate: number;
    thumbnailUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LearningPathCourse {
    courseId: string;
    courseTitle: string;
    order: number;
    isRequired: boolean;
    prerequisites?: string[]; // Other course IDs that must be completed first
}

export interface Enrollment {
    id: string;
    enrollmentNumber: string;
    courseId: string;
    courseTitle: string;
    learningPathId?: string;
    learningPathTitle?: string;
    learnerId: string;
    learnerName: string;
    learnerEmail: string;
    enrollmentType: EnrollmentType;
    status: EnrollmentStatus;
    enrolledDate: string;
    startDate?: string;
    dueDate?: string;
    completedDate?: string;
    progress: number; // Percentage
    timeSpent: number; // Minutes
    score?: number; // Percentage
    passingScore: number;
    attempts: number;
    maxAttempts?: number;
    certificateId?: string;
    assignedBy?: string;
    completionPercentage: number;
    lastAccessedDate?: string;
    modules: EnrollmentModuleProgress[];
    createdAt: string;
    updatedAt: string;
}

export interface EnrollmentModuleProgress {
    moduleId: string;
    moduleTitle: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number; // Percentage
    timeSpent: number; // Minutes
    lastAccessedDate?: string;
    completedDate?: string;
}

export interface Assessment {
    id: string;
    assessmentCode: string;
    title: string;
    description: string;
    type: AssessmentType;
    courseId?: string;
    courseTitle?: string;
    duration: number; // Minutes
    passingScore: number; // Percentage
    maxAttempts: number;
    questions: AssessmentQuestion[];
    isRandomized: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AssessmentQuestion {
    id: string;
    assessmentId: string;
    questionText: string;
    type: QuestionType;
    order: number;
    points: number;
    options?: QuestionOption[];
    correctAnswer?: string | string[];
    explanation?: string;
    mediaUrl?: string;
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface AssessmentAttempt {
    id: string;
    assessmentId: string;
    assessmentTitle: string;
    enrollmentId: string;
    learnerId: string;
    learnerName: string;
    attemptNumber: number;
    startedAt: string;
    submittedAt?: string;
    timeSpent: number; // Minutes
    score?: number; // Percentage
    passed: boolean;
    answers: AssessmentAnswer[];
    feedback?: string;
    createdAt: string;
}

export interface AssessmentAnswer {
    questionId: string;
    answer: string | string[];
    isCorrect?: boolean;
    pointsEarned: number;
}

export interface Certification {
    id: string;
    certificateNumber: string;
    certificateName: string;
    courseId?: string;
    courseTitle?: string;
    learningPathId?: string;
    learningPathTitle?: string;
    learnerId: string;
    learnerName: string;
    issuedDate: string;
    expiryDate?: string;
    status: CertificationStatus;
    score?: number;
    credits?: number;
    ceus?: number;
    certificateUrl?: string;
    issuedBy: string;
    verificationCode: string;
    renewalRequired: boolean;
    renewalReminderSent?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TrainingSession {
    id: string;
    sessionCode: string;
    courseId: string;
    courseTitle: string;
    type: SessionType;
    status: SessionStatus;
    instructorId: string;
    instructorName: string;
    startDate: string;
    endDate: string;
    location?: string;
    virtualMeetingLink?: string;
    maxParticipants: number;
    enrolledCount: number;
    waitlistCount: number;
    cost?: number;
    currency?: string;
    materials?: string[];
    agenda?: SessionAgendaItem[];
    attendees: SessionAttendee[];
    createdAt: string;
    updatedAt: string;
}

export interface SessionAgendaItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
}

export interface SessionAttendee {
    learnerId: string;
    learnerName: string;
    enrollmentId: string;
    attendanceStatus: AttendanceStatus;
    attendanceMarkedAt?: string;
    markedBy?: string;
    notes?: string;
}

export interface ExternalTraining {
    id: string;
    trainingCode: string;
    title: string;
    provider: string;
    learnerId: string;
    learnerName: string;
    category: string;
    startDate: string;
    endDate: string;
    duration: number; // Hours
    cost: number;
    currency: string;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'completed';
    approvedBy?: string;
    approvedDate?: string;
    completionStatus: 'not_started' | 'in_progress' | 'completed';
    completionDate?: string;
    certificateUrl?: string;
    skills: string[];
    reimbursementAmount?: number;
    reimbursementStatus?: 'pending' | 'approved' | 'paid';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SkillGapAnalysis {
    id: string;
    employeeId: string;
    employeeName: string;
    jobRoleId: string;
    jobRoleTitle: string;
    assessmentDate: string;
    skills: SkillGap[];
    recommendedCourses: string[];
    developmentPlan?: string;
    reviewedBy?: string;
    reviewedDate?: string;
    status: 'draft' | 'completed' | 'under_review';
    createdAt: string;
    updatedAt: string;
}

export interface SkillGap {
    skillId: string;
    skillName: string;
    requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    gap: number; // Numeric gap (e.g., 2 levels)
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MentoringProgram {
    id: string;
    programName: string;
    description: string;
    mentorId: string;
    mentorName: string;
    menteeId: string;
    menteeName: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'cancelled';
    objectives: string[];
    meetingFrequency: string;
    sessions: MentoringSession[];
    createdAt: string;
    updatedAt: string;
}

export interface MentoringSession {
    id: string;
    programId: string;
    sessionDate: string;
    duration: number; // Minutes
    topics: string[];
    notes?: string;
    actionItems?: string[];
    nextSessionDate?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TrainingBudget {
    id: string;
    fiscalYear: string;
    departmentId: string;
    departmentName: string;
    totalBudget: number;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    currency: string;
    allocations: BudgetAllocation[];
    createdAt: string;
    updatedAt: string;
}

export interface BudgetAllocation {
    categoryId: string;
    categoryName: string;
    allocatedAmount: number;
    spentAmount: number;
}

export interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    categoryName: string;
    authorId: string;
    authorName: string;
    tags: string[];
    attachments?: string[];
    viewCount: number;
    likeCount: number;
    isPublished: boolean;
    publishedDate?: string;
    lastUpdatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface TrainingFeedback {
    id: string;
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    sessionId?: string;
    learnerId: string;
    learnerName: string;
    overallRating: number; // 1-5
    contentQuality: number; // 1-5
    instructorRating?: number; // 1-5
    relevance: number; // 1-5
    difficultyLevel: 'too_easy' | 'appropriate' | 'too_difficult';
    paceRating: 'too_slow' | 'appropriate' | 'too_fast';
    strengths: string;
    improvements: string;
    wouldRecommend: boolean;
    additionalComments?: string;
    submittedDate: string;
}

export interface LearningAnalytics {
    totalCourses: number;
    activeCourses: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageCompletionRate: number;
    averageScore: number;
    totalCertificationsIssued: number;
    totalTrainingHours: number;
    trainingBudgetUtilization: number;
    topCourses: TopCourseMetric[];
    enrollmentsByCategory: Record<string, number>;
    completionTrend: TrendData[];
}

export interface TopCourseMetric {
    courseId: string;
    courseTitle: string;
    enrollments: number;
    completionRate: number;
    averageRating: number;
}

export interface TrendData {
    period: string; // e.g., "2025-01", "Q1 2025"
    value: number;
}

export interface LearningSettings {
    defaultPassingScore: number;
    maxAttemptsDefault: number;
    certificateExpiryDays: number;
    reminderDaysBeforeExpiry: number;
    autoEnrollCompliance: boolean;
    allowSelfEnrollment: boolean;
    requireManagerApproval: boolean;
    enableWaitlist: boolean;
    emailNotifications: LearningEmailSettings;
}

export interface LearningEmailSettings {
    enrollmentConfirmation: boolean;
    courseCompletion: boolean;
    certificateIssued: boolean;
    sessionReminder: boolean;
    deadlineReminder: boolean;
    certificationExpiry: boolean;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
