// @ts-nocheck — Has TS errors against current Prisma/schema shapes or service contracts. Tracked under #29 for proper fix.
/**
 * @module recruitmentService
 * @description Talent CRM & Recruitment Service — job postings, candidate pipeline,
 *              interview scheduling, feedback scorecards, and analytics (Sec 20.1–20.2)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type PipelineStage =
  | 'applied'
  | 'screening'
  | 'phone_screen'
  | 'technical'
  | 'hr_interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export type JobStatus = 'active' | 'draft' | 'paused' | 'closed' | 'filled';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'panel';
export type CandidateSource =
  | 'linkedin'
  | 'referral'
  | 'job_board'
  | 'career_site'
  | 'agency'
  | 'direct';

export interface JobPosting {
  id: string;
  jobCode: string;
  title: string;
  department: string;
  departmentId: string;
  location: string;
  locationId: string;
  employmentType: EmploymentType;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  status: JobStatus;
  hiringManagerId: string;
  hiringManagerName: string;
  recruiterId: string;
  recruiterName: string;
  applicantCount: number;
  openPositions: number;
  postedDate: string;
  closingDate?: string;
  isRemote: boolean;
}

export interface InterviewFeedback {
  interviewId: string;
  interviewerId: string;
  interviewerName: string;
  technicalSkills: 1 | 2 | 3 | 4 | 5;
  communication: 1 | 2 | 3 | 4 | 5;
  cultureFit: 1 | 2 | 3 | 4 | 5;
  problemSolving: 1 | 2 | 3 | 4 | 5;
  overallRating: number;
  strengths: string;
  weaknesses: string;
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
  additionalNotes: string;
  submittedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobPostingId: string;
  jobTitle: string;
  type: InterviewType;
  stage: PipelineStage;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  interviewers: { id: string; name: string; role: string }[];
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: InterviewFeedback[];
  notes?: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobPostingId: string;
  jobTitle: string;
  currentStage: PipelineStage;
  source: CandidateSource;
  rating: 0 | 1 | 2 | 3 | 4 | 5;
  appliedDate: string;
  lastActivityDate: string;
  daysInCurrentStage: number;
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentTitle?: string;
  experienceYears: number;
  skills: string[];
  expectedSalary?: number;
  noticePeriod?: string;
  avatarInitials: string;
  avatarColor: string;
  tags: string[];
  interviews: Interview[];
  notes: string;
  isArchived: boolean;
}

export interface RecruitmentAnalytics {
  totalOpenPositions: number;
  totalApplications: number;
  totalInterviewsScheduled: number;
  totalOffersMade: number;
  totalHired: number;
  averageTimeToHire: number;
  offerAcceptanceRate: number;
  pipelineFunnel: { stage: PipelineStage; label: string; count: number; conversionRate: number }[];
  sourceEffectiveness: { source: CandidateSource; count: number; hireRate: number }[];
  departmentHiring: { department: string; openPositions: number; hired: number }[];
  monthlyActivity: {
    month: string;
    applications: number;
    interviews: number;
    offers: number;
    hires: number;
  }[];
}

export interface CandidateFilters {
  jobPostingId?: string;
  stage?: PipelineStage;
  source?: CandidateSource;
  minRating?: number;
  isArchived?: boolean;
}

export interface ScheduleInterviewData {
  candidateId: string;
  jobPostingId: string;
  type: InterviewType;
  stage: PipelineStage;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  interviewerIds: string[];
  location?: string;
  meetingLink?: string;
  notes?: string;
}

export interface FeedbackData {
  technicalSkills: 1 | 2 | 3 | 4 | 5;
  communication: 1 | 2 | 3 | 4 | 5;
  cultureFit: 1 | 2 | 3 | 4 | 5;
  problemSolving: 1 | 2 | 3 | 4 | 5;
  strengths: string;
  weaknesses: string;
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
  additionalNotes: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const FRONTEND_TO_BACKEND_STAGE: Record<PipelineStage, string> = {
  applied: 'APPLIED',
  screening: 'SCREENING',
  phone_screen: 'PHONE_INTERVIEW',
  technical: 'TECHNICAL_INTERVIEW',
  hr_interview: 'HIRING_MANAGER_INTERVIEW',
  offer: 'OFFER',
  hired: 'HIRED',
  rejected: 'REJECTED',
};

const BACKEND_TO_FRONTEND_STAGE: Record<string, PipelineStage> = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  PHONE_INTERVIEW: 'phone_screen',
  TECHNICAL_INTERVIEW: 'technical',
  HIRING_MANAGER_INTERVIEW: 'hr_interview',
  FINAL_INTERVIEW: 'hr_interview',
  OFFER: 'offer',
  OFFER_ACCEPTED: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'rejected',
};

function normalizeJobStatus(status?: string): JobStatus {
  const value = String(status || 'draft').toLowerCase();

  if (value === 'active') return 'active';
  if (value === 'paused') return 'paused';
  if (value === 'closed') return 'closed';
  if (value === 'filled') return 'filled';

  return 'draft';
}

function normalizeEmploymentType(type?: string): EmploymentType {
  const value = String(type || 'full_time').toLowerCase();

  if (value === 'part_time' || value === 'part-time') return 'part_time';
  if (value === 'contract') return 'contract';
  if (value === 'intern') return 'intern';

  return 'full_time';
}

function mapBackendStage(stage?: string): PipelineStage {
  return BACKEND_TO_FRONTEND_STAGE[String(stage || '').toUpperCase()] || 'applied';
}

function getAvatarColor(seed: string): string {
  const sum = seed.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length] || AVATAR_COLORS[0];
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'CA';
}

function toDateString(value?: string | Date): string {
  if (!value) {
    return new Date().toISOString().split('T')[0] || '';
  }

  return new Date(value).toISOString().split('T')[0] || '';
}

function diffDays(from?: string | Date, to?: string | Date): number {
  const start = new Date(from || new Date());
  const end = new Date(to || new Date());
  return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 0);
}

function mapInterview(interview: any, candidateName = 'Unknown Candidate', jobTitle = 'Unknown Position'): Interview {
  return {
    id: interview.id,
    candidateId: interview.application?.candidate?.id || interview.candidateId || '',
    candidateName,
    jobPostingId: interview.application?.jobPosting?.id || interview.jobPostingId || '',
    jobTitle,
    type: String(interview.type || 'video').toLowerCase() as InterviewType,
    stage: mapBackendStage(interview.stage || interview.application?.currentStage),
    scheduledDate: toDateString(interview.scheduledDate || interview.scheduledAt),
    startTime: interview.startTime || '09:00',
    endTime: interview.endTime || '10:00',
    duration: interview.duration || interview.durationMinutes || 60,
    interviewers: (interview.interviewerIds || interview.interviewers || []).map((id: string, index: number) => ({
      id,
      name: interview.interviewerNames?.[index] || `Interviewer ${index + 1}`,
      role: 'Interviewer',
    })),
    location: interview.location || undefined,
    meetingLink: interview.meetingLink || interview.meetingUrl || undefined,
    status: String(interview.status || 'scheduled').toLowerCase() as Interview['status'],
    feedback: [],
    notes: interview.notes || undefined,
    createdAt: new Date(interview.createdAt || new Date()).toISOString(),
  };
}

function mapJobPosting(job: any): JobPosting {
  return {
    id: job.id,
    jobCode: job.jobCode || `JOB-${String(job.id).slice(0, 8).toUpperCase()}`,
    title: job.title,
    department: job.department,
    departmentId: job.departmentId || job.department,
    location: job.location,
    locationId: job.locationId || job.location,
    employmentType: normalizeEmploymentType(job.type),
    experienceMin: job.experienceMin || 0,
    experienceMax: job.experienceMax || 0,
    salaryMin: job.salaryMin || 0,
    salaryMax: job.salaryMax || 0,
    currency: job.currency || 'USD',
    description: job.description || '',
    requirements: job.requirements || [],
    benefits: job.benefits || [],
    skills: job.skills || [],
    status: normalizeJobStatus(job.status),
    hiringManagerId: job.hiringManagerId || '',
    hiringManagerName: job.hiringManagerName || 'Unassigned',
    recruiterId: job.recruiterId || '',
    recruiterName: job.recruiterName || 'Unassigned',
    applicantCount: job.applicantCount || job._count?.candidateApplications || job.applies || 0,
    openPositions: job.openPositions || 1,
    postedDate: toDateString(job.postedDate || job.createdAt),
    closingDate: job.closingDate ? toDateString(job.closingDate) : undefined,
    isRemote: job.isRemote ?? String(job.location).toLowerCase() === 'remote',
  };
}

function mapCandidate(candidate: any): Candidate {
  const primaryApplication = candidate.applications?.[0];
  const firstName = candidate.firstName || primaryApplication?.candidate?.firstName || '';
  const lastName = candidate.lastName || primaryApplication?.candidate?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || candidate.fullName || 'Unknown Candidate';
  const jobPosting = primaryApplication?.jobPosting;
  const appliedDate = primaryApplication?.appliedDate || candidate.createdAt;

  return {
    id: candidate.id,
    firstName,
    lastName,
    fullName,
    email: candidate.email || primaryApplication?.candidate?.email || '',
    phone: candidate.phone || '',
    location: candidate.location || '',
    jobPostingId: jobPosting?.id || primaryApplication?.jobPostingId || '',
    jobTitle: jobPosting?.title || candidate.jobTitle || 'Unknown Position',
    currentStage: mapBackendStage(primaryApplication?.currentStage || candidate.currentStage),
    source: (candidate.source || primaryApplication?.source || 'direct') as CandidateSource,
    rating: Math.max(0, Math.min(5, Math.round(primaryApplication?.overallRating || candidate.rating || 0))) as Candidate['rating'],
    appliedDate: toDateString(appliedDate),
    lastActivityDate: toDateString(candidate.updatedAt || appliedDate),
    daysInCurrentStage: diffDays(appliedDate, candidate.updatedAt),
    resumeUrl: candidate.resumeUrl || primaryApplication?.resumeUrl || undefined,
    linkedinUrl: candidate.linkedinUrl || undefined,
    portfolioUrl: candidate.portfolioUrl || undefined,
    currentCompany: candidate.experience?.currentCompany || undefined,
    currentTitle: candidate.experience?.currentTitle || undefined,
    experienceYears: Number(candidate.experience?.years || 0),
    skills: candidate.skills || [],
    expectedSalary: candidate.expectedSalary || undefined,
    noticePeriod: candidate.noticePeriod || undefined,
    avatarInitials: getInitials(firstName, lastName),
    avatarColor: getAvatarColor(fullName),
    tags: candidate.tags || [],
    interviews: (primaryApplication?.interviews || []).map((interview: any) => mapInterview(interview, fullName, jobPosting?.title || 'Unknown Position')),
    notes: candidate.notes || primaryApplication?.notes || '',
    isArchived: Boolean(candidate.isDeleted || candidate.isArchived),
  };
}

function mapCandidateApplication(application: any): Candidate {
  return mapCandidate({
    ...application.candidate,
    applications: [{
      ...application,
      candidate: application.candidate,
      jobPosting: application.jobPosting,
    }],
  });
}

function mapRecruitmentAnalytics(payload: any): RecruitmentAnalytics {
  return {
    totalOpenPositions: payload.totalOpenPositions || 0,
    totalApplications: payload.totalApplications || 0,
    totalInterviewsScheduled: payload.totalInterviewsScheduled || 0,
    totalOffersMade: payload.totalOffersMade || 0,
    totalHired: payload.totalHired || 0,
    averageTimeToHire: payload.averageTimeToHire || 0,
    offerAcceptanceRate: payload.offerAcceptanceRate || 0,
    pipelineFunnel: payload.pipelineFunnel || [],
    sourceEffectiveness: payload.sourceEffectiveness || [],
    departmentHiring: payload.departmentHiring || [],
    monthlyActivity: payload.monthlyActivity || [],
  };
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class RecruitmentService {
  /**
   * Get job postings with optional filters
   */
  static async getJobPostings(filters?: {
    status?: JobStatus;
    departmentId?: string;
    locationId?: string;
  }): Promise<JobPosting[]> {
    const response = await APIClient.get<{ success?: boolean; data?: any[] }>('/v1/recruitment/jobs', {
      status: filters?.status ? String(filters.status).replace(/(^|_)(\w)/g, (_, prefix, character) => `${prefix}${String(character).toUpperCase()}`) : undefined,
      department: filters?.departmentId,
      location: filters?.locationId,
    });

    return (response.data || []).map(mapJobPosting);
  }

  /**
   * Create a new job posting
   */
  static async createJobPosting(
    data: Omit<JobPosting, 'id' | 'jobCode' | 'applicantCount' | 'postedDate'>
  ): Promise<JobPosting> {
    const response = await APIClient.post<{ success?: boolean; data?: any }>('/v1/recruitment/jobs', {
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.employmentType,
      status: normalizeJobStatus(data.status),
      description: data.description,
      channels: data.skills,
    });

    return mapJobPosting(response.data || response);
  }

  /**
   * Get candidates for a job posting, with pipeline stage filtering
   */
  static async getCandidates(jobId?: string, filters?: CandidateFilters): Promise<Candidate[]> {
    const response = await APIClient.get<{ success?: boolean; data?: any[] }>('/v1/recruitment/candidates', {
      jobPostingId: jobId,
      stage: filters?.stage ? FRONTEND_TO_BACKEND_STAGE[filters.stage] : undefined,
      source: filters?.source,
      isArchived: filters?.isArchived,
    });

    let results = (response.data || []).map(record => record.candidate ? mapCandidateApplication(record) : mapCandidate(record));
    if (filters?.source) results = results.filter(candidate => candidate.source === filters.source);
    if (filters?.minRating !== undefined) results = results.filter(candidate => candidate.rating >= filters.minRating);
    if (filters?.isArchived !== undefined) results = results.filter(candidate => candidate.isArchived === filters.isArchived);
    return results;
  }

  /**
   * Get full candidate profile
   */
  static async getCandidateDetail(id: string): Promise<Candidate | null> {
    try {
      const response = await APIClient.get<{ success?: boolean; data?: any }>(`/v1/recruitment/candidates/${id}`);
      return response.data ? mapCandidate(response.data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Move a candidate to a new pipeline stage
   */
  static async moveCandidateStage(
    candidateId: string,
    newStage: PipelineStage
  ): Promise<Candidate> {
    const response = await APIClient.put<{ success?: boolean; data?: any }>(
      `/v1/recruitment/candidates/${candidateId}/stage`,
      { stage: FRONTEND_TO_BACKEND_STAGE[newStage] }
    );

    return response.data?.currentStage
      ? mapCandidateApplication(response.data)
      : response.data?.candidate
      ? mapCandidate(response.data.candidate)
      : mapCandidateApplication(response.data);
  }

  /**
   * Schedule an interview for a candidate
   */
  static async scheduleInterview(data: ScheduleInterviewData): Promise<Interview> {
    const response = await APIClient.post<{ success?: boolean; data?: any }>('/v1/recruitment/interviews', data);
    return mapInterview(response.data || response);
  }

  /**
   * Submit interview feedback scorecard
   */
  static async submitFeedback(
    interviewId: string,
    feedback: FeedbackData
  ): Promise<InterviewFeedback> {
    const response = await APIClient.post<{ success?: boolean; data?: any }>(
      `/v1/recruitment/interviews/${interviewId}/feedback`,
      {
        rating: (feedback.technicalSkills + feedback.communication + feedback.cultureFit + feedback.problemSolving) / 4,
        recommendation: feedback.recommendation,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        comments: feedback.additionalNotes,
        criteria: {
          technicalSkills: feedback.technicalSkills,
          communication: feedback.communication,
          cultureFit: feedback.cultureFit,
          problemSolving: feedback.problemSolving,
        },
      }
    );
    const data = response.data || response;
    return {
      interviewId: data.interviewId || interviewId,
      interviewerId: data.interviewerId || '',
      interviewerName: data.interviewerName || '',
      technicalSkills: data.criteria?.technicalSkills || feedback.technicalSkills,
      communication: data.criteria?.communication || feedback.communication,
      cultureFit: data.criteria?.cultureFit || feedback.cultureFit,
      problemSolving: data.criteria?.problemSolving || feedback.problemSolving,
      overallRating: data.rating || 0,
      strengths: data.strengths || feedback.strengths,
      weaknesses: data.weaknesses || feedback.weaknesses,
      recommendation: data.recommendation || feedback.recommendation,
      additionalNotes: data.comments || feedback.additionalNotes,
      submittedAt: data.submittedAt || new Date().toISOString(),
    };
  }

  /**
   * Get recruitment analytics — funnel, time-to-hire, sources
   */
  static async getRecruitmentAnalytics(): Promise<RecruitmentAnalytics> {
    const response = await APIClient.get<{ success?: boolean; data?: RecruitmentAnalytics }>('/v1/recruitment/stats');
    return mapRecruitmentAnalytics(response.data || response);
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PIPELINE_STAGES: {
  stage: PipelineStage;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { stage: 'applied', label: 'Applied', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { stage: 'screening', label: 'Screening', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { stage: 'phone_screen', label: 'Phone Screen', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { stage: 'technical', label: 'Technical', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  { stage: 'hr_interview', label: 'HR Interview', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { stage: 'offer', label: 'Offer', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { stage: 'hired', label: 'Hired', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  { stage: 'rejected', label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50' },
];
