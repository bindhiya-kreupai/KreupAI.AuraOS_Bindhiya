/**
 * Recruitment Module - Type Definitions
 * 
 * Comprehensive TypeScript interfaces for recruitment and applicant tracking including:
 * - Job Requisitions & Postings
 * - Candidate Applications
 * - Interview Scheduling & Feedback
 * - Offer Management
 * - Hiring Workflows
 * - Background Checks
 * - Recruitment Analytics
 */

// Job Requisition & Posting Types
export type RequisitionStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'open' | 'on_hold' | 'filled' | 'cancelled';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';
export type ExperienceLevel = 'entry_level' | 'mid_level' | 'senior_level' | 'executive';
export type EmploymentMode = 'onsite' | 'remote' | 'hybrid';

// Application & Candidate Types
export type ApplicationStatus = 'new' | 'screening' | 'phone_screen' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
export type ApplicationSource = 'career_site' | 'linkedin' | 'indeed' | 'referral' | 'agency' | 'campus' | 'other';
export type RejectionReason = 'underqualified' | 'overqualified' | 'compensation_mismatch' | 'skills_mismatch' | 'culture_fit' | 'other';

// Interview Types
export type InterviewType = 'phone_screen' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'panel' | 'culture_fit';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type InterviewRating = 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';

// Offer Types
export type OfferStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'declined' | 'withdrawn' | 'expired';

// Background Check Types
export type BackgroundCheckStatus = 'not_started' | 'in_progress' | 'clear' | 'flagged' | 'failed';
export type BackgroundCheckType = 'criminal' | 'employment' | 'education' | 'credit' | 'drug_test' | 'reference';

export interface JobRequisition {
    id: string;
    requisitionNumber: string;
    jobTitle: string;
    departmentId: string;
    departmentName: string;
    locationId: string;
    locationName: string;
    hiringManagerId: string;
    hiringManagerName: string;
    recruiterId?: string;
    recruiterName?: string;
    jobType: JobType;
    experienceLevel: ExperienceLevel;
    employmentMode: EmploymentMode;
    numberOfPositions: number;
    positionsFilled: number;
    status: RequisitionStatus;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    jobDescription: string;
    responsibilities: string[];
    qualifications: string[];
    preferredQualifications?: string[];
    skills: string[];
    salaryRange: {
        min: number;
        max: number;
        currency: string;
    };
    benefits?: string[];
    targetStartDate?: string;
    requestedDate: string;
    approvedDate?: string;
    approvedBy?: string;
    rejectionReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface JobPosting {
    id: string;
    requisitionId: string;
    jobTitle: string;
    departmentName: string;
    locationName: string;
    jobType: JobType;
    experienceLevel: ExperienceLevel;
    employmentMode: EmploymentMode;
    description: string;
    responsibilities: string[];
    qualifications: string[];
    skills: string[];
    salaryRange?: {
        min: number;
        max: number;
        currency: string;
        displaySalary: boolean;
    };
    benefits?: string[];
    publishedDate?: string;
    expiryDate?: string;
    isActive: boolean;
    isExternal: boolean; // Posted on external job boards
    externalBoards?: string[]; // LinkedIn, Indeed, etc.
    applicationCount: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CandidateApplication {
    id: string;
    applicationNumber: string;
    jobPostingId: string;
    jobTitle: string;
    candidateId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    portfolioUrl?: string;
    linkedInUrl?: string;
    source: ApplicationSource;
    referredBy?: string;
    status: ApplicationStatus;
    currentStage: string;
    rating?: number; // 1-5
    experience: number; // Years
    currentCompany?: string;
    currentTitle?: string;
    expectedSalary?: number;
    noticePeriod?: number; // Days
    skills: string[];
    education: Education[];
    workExperience: WorkExperience[];
    screeningAnswers?: ScreeningAnswer[];
    appliedDate: string;
    lastActivityDate: string;
    rejectionReason?: RejectionReason;
    rejectionNotes?: string;
    notes?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Education {
    id: string;
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
    gpa?: number;
}

export interface WorkExperience {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
}

export interface ScreeningAnswer {
    questionId: string;
    question: string;
    answer: string;
    isRequired: boolean;
    isDisqualifying?: boolean;
}

export interface Interview {
    id: string;
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    type: InterviewType;
    status: InterviewStatus;
    scheduledDate: string;
    duration: number; // Minutes
    location?: string;
    meetingLink?: string;
    interviewers: Interviewer[];
    feedback?: InterviewFeedback[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Interviewer {
    id: string;
    name: string;
    email: string;
    role: string;
    isPrimary: boolean;
}

export interface InterviewFeedback {
    id: string;
    interviewId: string;
    interviewerId: string;
    interviewerName: string;
    rating: InterviewRating;
    technicalSkills?: number; // 1-5
    communicationSkills?: number; // 1-5
    problemSolving?: number; // 1-5
    cultureFit?: number; // 1-5
    strengths: string;
    concerns: string;
    recommendation: 'hire' | 'no_hire' | 'undecided';
    notes?: string;
    submittedDate: string;
}

export interface JobOffer {
    id: string;
    offerNumber: string;
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    departmentName: string;
    status: OfferStatus;
    jobType: JobType;
    startDate: string;
    salary: number;
    currency: string;
    bonus?: number;
    equity?: string;
    benefits: string[];
    relocationAssistance?: boolean;
    signingBonus?: number;
    probationPeriod?: number; // Months
    offerLetterUrl?: string;
    sentDate?: string;
    expiryDate?: string;
    acceptedDate?: string;
    declinedDate?: string;
    declineReason?: string;
    approvedBy?: string;
    approvedDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BackgroundCheck {
    id: string;
    applicationId: string;
    candidateName: string;
    status: BackgroundCheckStatus;
    checks: BackgroundCheckItem[];
    vendorName?: string;
    requestedDate: string;
    completedDate?: string;
    overallResult?: 'clear' | 'flagged' | 'failed';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BackgroundCheckItem {
    id: string;
    type: BackgroundCheckType;
    status: BackgroundCheckStatus;
    result?: string;
    notes?: string;
}

export interface HiringPipeline {
    id: string;
    name: string;
    stages: PipelineStage[];
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PipelineStage {
    id: string;
    name: string;
    order: number;
    isRequired: boolean;
    averageDuration?: number; // Days
}

export interface RecruitmentSettings {
    defaultPipelineId: string;
    applicationExpiryDays: number;
    offerExpiryDays: number;
    requireBackgroundCheck: boolean;
    requireReferenceCheck: boolean;
    autoRejectAfterDays?: number;
    emailTemplates: EmailTemplate[];
    screeningQuestions: ScreeningQuestion[];
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    type: 'application_received' | 'interview_scheduled' | 'offer_sent' | 'rejection' | 'other';
}

export interface ScreeningQuestion {
    id: string;
    question: string;
    isRequired: boolean;
    isDisqualifying: boolean;
    expectedAnswer?: string;
}

export interface RecruitmentStats {
    totalRequisitions: number;
    openRequisitions: number;
    totalApplications: number;
    applicationsBySource: Record<ApplicationSource, number>;
    applicationsByStatus: Record<ApplicationStatus, number>;
    averageTimeToHire: number; // Days
    averageTimeToInterview: number; // Days
    offerAcceptanceRate: number; // Percentage
    interviewsScheduled: number;
    offersExtended: number;
    hires: number;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
