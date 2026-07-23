/**
 * Recruitment Agent Service
 * Phase 4 Sprint 31-32: Autonomous Recruitment Assistant
 *
 * Handles:
 * - Candidate screening and ranking
 * - Resume parsing and skill matching
 * - Interview scheduling
 * - Pipeline analytics
 * - Candidate communication
 */

import type {
  AgentDefinition,
  AgentResponse,
  ConversationContext,
  CandidateScreeningIntent,
  ScreeningCriteria,
  InterviewScheduleIntent,
  CandidateMatch,
} from './types';
import { RecruitmentAgentCapabilities } from './types';
import { AgentFrameworkService } from './agent-framework.service';

/**
 * Candidate Profile
 */
interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  skills: string[];
  experience: number; // years
  currentRole?: string;
  currentCompany?: string;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  location: string;
  expectedSalary?: { min: number; max: number; currency: string };
  noticePeriod?: number; // days
  source: string;
  appliedDate: Date;
  status: CandidateStatus;
  stage: RecruitmentStage;
  score?: number;
  notes?: string;
}

type CandidateStatus =
  | 'NEW'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';
type RecruitmentStage =
  | 'APPLICATION'
  | 'SCREENING'
  | 'PHONE_SCREEN'
  | 'TECHNICAL'
  | 'ONSITE'
  | 'FINAL'
  | 'OFFER'
  | 'HIRED';

/**
 * Job Opening
 */
interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTOR';
  description: string;
  requirements: {
    mustHave: string[];
    niceToHave: string[];
    experienceMin: number;
    experienceMax?: number;
    education?: string;
  };
  salary?: { min: number; max: number; currency: string };
  openings: number;
  filled: number;
  hiringManager: string;
  recruiterId: string;
  status: 'DRAFT' | 'OPEN' | 'ON_HOLD' | 'CLOSED';
  openedDate: Date;
  targetCloseDate?: Date;
}

/**
 * Interview Schedule
 */
interface InterviewSchedule {
  id: string;
  candidateId: string;
  jobId: string;
  type: 'PHONE_SCREEN' | 'TECHNICAL' | 'BEHAVIORAL' | 'PANEL' | 'FINAL';
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  interviewers: {
    id: string;
    name: string;
    role: string;
    email: string;
  }[];
  location?: string;
  meetingLink?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  feedback?: InterviewFeedback;
}

interface InterviewFeedback {
  interviewerId: string;
  rating: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
  comments: string;
  submittedAt: Date;
}

/**
 * Recruitment Agent Service
 */
export class RecruitmentAgentService {
  private static agentDefinition: AgentDefinition = {
    id: 'recruitment_agent_v1',
    type: 'RECRUITMENT_AGENT',
    name: 'Recruitment Assistant',
    description:
      'AI-powered recruitment assistant for candidate screening, scheduling, and pipeline management',
    capabilities: [
      {
        id: 'candidate_screening',
        name: 'Candidate Screening',
        description: 'AI-powered resume screening and candidate ranking',
        intents: ['SCREEN_CANDIDATES', 'RANK_CANDIDATES', 'MATCH_SKILLS', 'SHORTLIST'],
        actions: ['QUERY_DATA', 'UPDATE_RECORD', 'GENERATE_REPORT'],
        requiredPermissions: ['candidates:read', 'candidates:write'],
      },
      {
        id: 'interview_management',
        name: 'Interview Management',
        description: 'Schedule, reschedule, and manage interviews',
        intents: [
          'SCHEDULE_INTERVIEW',
          'RESCHEDULE_INTERVIEW',
          'CANCEL_INTERVIEW',
          'VIEW_SCHEDULE',
        ],
        actions: ['QUERY_DATA', 'SCHEDULE_MEETING', 'SEND_NOTIFICATION'],
        requiredPermissions: ['interviews:read', 'interviews:write', 'calendar:write'],
      },
      {
        id: 'pipeline_analytics',
        name: 'Pipeline Analytics',
        description: 'Recruitment pipeline metrics and analytics',
        intents: ['PIPELINE_STATUS', 'SOURCE_ANALYTICS', 'TIME_TO_HIRE', 'FUNNEL_ANALYSIS'],
        actions: ['QUERY_DATA', 'GENERATE_REPORT'],
        requiredPermissions: ['analytics:read'],
      },
      {
        id: 'candidate_communication',
        name: 'Candidate Communication',
        description: 'Automated candidate status updates and communication',
        intents: ['SEND_UPDATE', 'BULK_COMMUNICATION', 'REJECTION_EMAIL'],
        actions: ['SEND_NOTIFICATION', 'CREATE_RECORD'],
        requiredPermissions: ['communication:write'],
      },
    ],
    permissions: [
      { resource: 'candidates', actions: ['read', 'write'] },
      { resource: 'jobs', actions: ['read'] },
      { resource: 'interviews', actions: ['read', 'write'] },
      { resource: 'calendar', actions: ['read', 'write'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'communication', actions: ['write'] },
    ],
    configuration: {
      maxConcurrentTasks: 10,
      taskTimeout: 60000,
      retryAttempts: 3,
      retryDelay: 2000,
      autonomyLevel: 'SUPERVISED',
      escalationRules: [
        {
          condition: 'interview.schedule.conflict',
          action: 'NOTIFY',
          target: 'recruiter',
          message: 'Interview scheduling conflict detected',
        },
        {
          condition: 'candidate.high_value',
          action: 'ESCALATE',
          target: 'hiring_manager',
          message: 'High-value candidate requires immediate attention',
        },
      ],
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /**
   * Initialize Recruitment Agent
   */
  static initialize(): void {
    AgentFrameworkService.registerAgent(this.agentDefinition);
  }

  /**
   * Get agent definition
   */
  static getDefinition(): AgentDefinition {
    return this.agentDefinition;
  }

  // ============================================================================
  // CANDIDATE SCREENING
  // ============================================================================

  /**
   * Screen candidates for a job
   */
  static async screenCandidates(
    jobId: string,
    tenantId: string,
    criteria?: ScreeningCriteria
  ): Promise<CandidateMatch[]> {
    // Get job details
    const job = await this.getJobOpening(jobId, tenantId);
    if (!job) {
      throw new Error('Job opening not found');
    }

    // Get candidates
    const candidates = await this.getCandidates(jobId, tenantId, { status: 'NEW' });

    // Apply screening criteria
    const screeningCriteria = criteria || {
      requiredSkills: job.requirements.mustHave,
      preferredSkills: job.requirements.niceToHave,
      experienceMin: job.requirements.experienceMin,
      experienceMax: job.requirements.experienceMax,
    };

    // Score and rank candidates
    const matches: CandidateMatch[] = candidates.map((candidate) => {
      const scores = this.calculateCandidateScore(candidate, screeningCriteria, job);
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        overallScore: scores.overall,
        skillMatch: scores.skills,
        experienceMatch: scores.experience,
        educationMatch: scores.education,
        cultureFitScore: scores.cultureFit,
        ranking: 0,
        highlights: scores.highlights,
        concerns: scores.concerns,
        recommendation: this.getRecommendation(scores.overall),
      };
    });

    // Sort by score and assign rankings
    matches.sort((a, b) => b.overallScore - a.overallScore);
    matches.forEach((m, i) => {
      m.ranking = i + 1;
    });

    return matches;
  }

  /**
   * Calculate candidate score
   */
  private static calculateCandidateScore(
    candidate: CandidateProfile,
    criteria: ScreeningCriteria,
    job: JobOpening
  ): {
    overall: number;
    skills: number;
    experience: number;
    education: number;
    cultureFit: number;
    highlights: string[];
    concerns: string[];
  } {
    const highlights: string[] = [];
    const concerns: string[] = [];

    // Skill matching
    const requiredMatches = criteria.requiredSkills.filter((skill) =>
      candidate.skills.some((cs) => cs.toLowerCase().includes(skill.toLowerCase()))
    );
    const preferredMatches = (criteria.preferredSkills || []).filter((skill) =>
      candidate.skills.some((cs) => cs.toLowerCase().includes(skill.toLowerCase()))
    );

    const requiredTotal = criteria.requiredSkills.length || 1;
    const preferredTotal = criteria.preferredSkills?.length || 1;
    const skillScore =
      (requiredMatches.length / requiredTotal) * 70 +
      (preferredMatches.length / preferredTotal) * 30;

    if (
      criteria.requiredSkills.length === 0 ||
      requiredMatches.length === criteria.requiredSkills.length
    ) {
      if (criteria.requiredSkills.length > 0) {
        highlights.push('All required skills matched');
      }
    } else {
      const missing = criteria.requiredSkills.filter((s) => !requiredMatches.includes(s));
      concerns.push(`Missing skills: ${missing.join(', ')}`);
    }

    // Experience matching
    let experienceScore = 0;
    if (criteria.experienceMin !== undefined) {
      if (candidate.experience >= criteria.experienceMin) {
        experienceScore = 80;
        if (criteria.experienceMax && candidate.experience <= criteria.experienceMax) {
          experienceScore = 100;
          highlights.push(`${candidate.experience} years experience (ideal range)`);
        } else if (criteria.experienceMax && candidate.experience > criteria.experienceMax) {
          experienceScore = 70;
          concerns.push('Overqualified for the position');
        }
      } else {
        experienceScore = (candidate.experience / criteria.experienceMin) * 60;
        concerns.push(
          `Experience below minimum (${candidate.experience} vs ${criteria.experienceMin} years)`
        );
      }
    }

    // Education matching
    let educationScore = 70; // Default
    if (criteria.educationLevel) {
      const educationLevels = ['HIGH_SCHOOL', 'BACHELORS', 'MASTERS', 'PHD'];
      const requiredLevel = educationLevels.indexOf(criteria.educationLevel.toUpperCase());
      // Simplified - check if candidate has required education
      const hasRequiredEducation = candidate.education.some(
        (e) =>
          e.degree.toLowerCase().includes('bachelor') ||
          e.degree.toLowerCase().includes('master') ||
          e.degree.toLowerCase().includes('phd')
      );
      educationScore = hasRequiredEducation ? 90 : 60;
    }

    // Location matching
    if (criteria.location && candidate.location.toLowerCase() !== criteria.location.toLowerCase()) {
      concerns.push(`Location mismatch: ${candidate.location}`);
    }

    // Notice period
    if (
      criteria.noticePeriod &&
      candidate.noticePeriod &&
      candidate.noticePeriod > criteria.noticePeriod
    ) {
      concerns.push(`Long notice period: ${candidate.noticePeriod} days`);
    }

    // Salary expectation
    if (criteria.salaryRange && candidate.expectedSalary) {
      if (candidate.expectedSalary.min > criteria.salaryRange.max) {
        concerns.push('Salary expectation above budget');
      }
    }

    const cultureFitScore = 75;

    // Calculate overall score
    const overall =
      skillScore * 0.4 + experienceScore * 0.3 + educationScore * 0.15 + cultureFitScore * 0.15;

    return {
      overall: Math.round(overall),
      skills: Math.round(skillScore),
      experience: Math.round(experienceScore),
      education: Math.round(educationScore),
      cultureFit: Math.round(cultureFitScore),
      highlights,
      concerns,
    };
  }

  /**
   * Get recommendation based on score
   */
  private static getRecommendation(score: number): CandidateMatch['recommendation'] {
    if (score >= 85) return 'STRONG_HIRE';
    if (score >= 70) return 'HIRE';
    if (score >= 50) return 'MAYBE';
    return 'NO_HIRE';
  }

  /**
   * Shortlist candidates
   */
  static async shortlistCandidates(
    jobId: string,
    tenantId: string,
    candidateIds: string[]
  ): Promise<{ shortlisted: number; errors: { id: string; error: string }[] }> {
    const errors: { id: string; error: string }[] = [];
    let shortlisted = 0;

    for (const candidateId of candidateIds) {
      try {
        await this.updateCandidateStatus(candidateId, tenantId, 'SHORTLISTED', 'SCREENING');
        shortlisted++;
      } catch (error: any) {
        errors.push({
          id: candidateId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { shortlisted, errors };
  }

  // ============================================================================
  // INTERVIEW SCHEDULING
  // ============================================================================

  /**
   * Schedule interview
   */
  static async scheduleInterview(
    intent: InterviewScheduleIntent,
    tenantId: string
  ): Promise<InterviewSchedule> {
    const candidate = await this.getCandidateById(intent.candidateId, tenantId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const availableSlot = await this.findAvailableSlot(
      intent.interviewers,
      intent.preferredSlots || [],
      intent.duration
    );

    if (!availableSlot) {
      throw new Error('No available slots found for the selected interviewers');
    }

    const { prisma } = await import('@aura/database');
    const application = await prisma.candidateApplication.findFirst({
      where: { candidateId: intent.candidateId, isDeleted: false },
      orderBy: { appliedDate: 'desc' },
    });
    if (!application) {
      throw new Error('Candidate application not found');
    }

    const scheduledDate = new Date(availableSlot.date);
    const [startH, startM] = availableSlot.startTime.split(':').map(Number);
    scheduledDate.setHours(startH || 0, startM || 0, 0, 0);

    const created = await prisma.interview.create({
      data: {
        applicationId: application.id,
        title: `${intent.interviewType} Interview`,
        type: intent.interviewType,
        scheduledDate,
        duration: intent.duration,
        interviewerIds: intent.interviewers,
        interviewerNames: intent.interviewers,
        status: 'scheduled',
      },
      include: {
        application: {
          select: { candidateId: true, jobPostingId: true },
        },
      },
    });

    return this.mapInterviewToSchedule(created);
  }

  /**
   * Find available slot
   */
  private static async findAvailableSlot(
    interviewerIds: string[],
    preferredSlots: { date: Date; startTime: string; endTime: string }[],
    duration: number
  ): Promise<{ date: Date; startTime: string; endTime: string } | null> {
    void interviewerIds;
    if (preferredSlots.length > 0) {
      return preferredSlots[0];
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const endHour = 10 + Math.ceil(duration / 60);

    return {
      date: tomorrow,
      startTime: '10:00',
      endTime: `${String(endHour).padStart(2, '0')}:00`,
    };
  }

  /**
   * Reschedule interview
   */
  static async rescheduleInterview(
    interviewId: string,
    tenantId: string,
    newSlot: { date: Date; startTime: string; endTime: string },
    reason?: string
  ): Promise<InterviewSchedule> {
    void reason;
    const interview = await this.getInterviewById(interviewId, tenantId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    const { prisma } = await import('@aura/database');
    const scheduledDate = new Date(newSlot.date);
    const [startH, startM] = newSlot.startTime.split(':').map(Number);
    scheduledDate.setHours(startH || 0, startM || 0, 0, 0);

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        scheduledDate,
        status: 'rescheduled',
      },
      include: {
        application: {
          select: { candidateId: true, jobPostingId: true },
        },
      },
    });

    return this.mapInterviewToSchedule(updated);
  }

  /**
   * Cancel interview
   */
  static async cancelInterview(
    interviewId: string,
    tenantId: string,
    reason: string
  ): Promise<InterviewSchedule> {
    void reason;
    const interview = await this.getInterviewById(interviewId, tenantId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    const { prisma } = await import('@aura/database');
    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'cancelled' },
      include: {
        application: {
          select: { candidateId: true, jobPostingId: true },
        },
      },
    });

    return this.mapInterviewToSchedule(updated);
  }

  /**
   * Get upcoming interviews
   */
  static async getUpcomingInterviews(
    tenantId: string,
    filters?: {
      interviewerId?: string;
      candidateId?: string;
      jobId?: string;
      days?: number;
    }
  ): Promise<InterviewSchedule[]> {
    const { prisma } = await import('@aura/database');
    const now = new Date();
    const upperBound = filters?.days
      ? new Date(now.getTime() + filters.days * 24 * 60 * 60 * 1000)
      : undefined;

    const rows = await prisma.interview.findMany({
      where: {
        isDeleted: false,
        scheduledDate: {
          gte: now,
          ...(upperBound ? { lte: upperBound } : {}),
        },
        ...(filters?.interviewerId ? { interviewerIds: { has: filters.interviewerId } } : {}),
        ...(filters?.candidateId || filters?.jobId
          ? {
              application: {
                isDeleted: false,
                ...(filters.candidateId ? { candidateId: filters.candidateId } : {}),
                ...(filters.jobId ? { jobPostingId: filters.jobId } : {}),
              },
            }
          : {}),
      },
      include: {
        application: {
          select: { candidateId: true, jobPostingId: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return rows.map((row) => this.mapInterviewToSchedule(row));
  }

  // ============================================================================
  // PIPELINE ANALYTICS
  // ============================================================================

  /**
   * Get pipeline statistics
   */
  static async getPipelineStats(
    tenantId: string,
    filters?: {
      jobId?: string;
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<{
    totalCandidates: number;
    byStage: { stage: RecruitmentStage; count: number; percentage: number }[];
    bySource: { source: string; count: number; qualityScore: number }[];
    timeToHire: { average: number; min: number; max: number };
    offerAcceptanceRate: number;
    conversionRates: { stage: string; rate: number }[];
  }> {
    const { prisma } = await import('@aura/database');

    const where = {
      isDeleted: false,
      ...(filters?.jobId ? { jobPostingId: filters.jobId } : {}),
      ...(filters?.dateRange
        ? { appliedDate: { gte: filters.dateRange.start, lte: filters.dateRange.end } }
        : {}),
    };

    const applications = await prisma.candidateApplication.findMany({
      where,
      include: {
        candidate: { select: { source: true, isDeleted: true } },
      },
    });

    if (applications.length === 0) {
      return {
        totalCandidates: 0,
        byStage: [],
        bySource: [],
        timeToHire: { average: 0, min: 0, max: 0 },
        offerAcceptanceRate: 0,
        conversionRates: [],
      };
    }

    const totalCandidates = applications.length;
    const stageCounts = new Map<RecruitmentStage, number>();
    const sourceCounts = new Map<string, { count: number; hired: number }>();

    for (const app of applications) {
      const stage = this.mapToRecruitmentStage(app.currentStage || app.status);
      stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1);

      const source = app.source || app.candidate?.source || 'Unknown';
      const entry = sourceCounts.get(source) || { count: 0, hired: 0 };
      entry.count += 1;
      if (this.mapToCandidateStatus(app.status) === 'HIRED') {
        entry.hired += 1;
      }
      sourceCounts.set(source, entry);
    }

    const byStage = Array.from(stageCounts.entries()).map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / totalCandidates) * 1000) / 10,
    }));

    const bySource = Array.from(sourceCounts.entries()).map(([source, data]) => ({
      source,
      count: data.count,
      qualityScore: data.count > 0 ? Math.round((data.hired / data.count) * 100) : 0,
    }));

    const hiredApps = applications.filter((a) => this.mapToCandidateStatus(a.status) === 'HIRED');
    const hireDays = hiredApps.map((a) => {
      const days = Math.max(
        0,
        Math.round((a.updatedAt.getTime() - a.appliedDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      return days;
    });

    const timeToHire =
      hireDays.length === 0
        ? { average: 0, min: 0, max: 0 }
        : {
            average: Math.round(hireDays.reduce((s, d) => s + d, 0) / hireDays.length),
            min: Math.min(...hireDays),
            max: Math.max(...hireDays),
          };

    const offered = applications.filter((a) => {
      const s = this.mapToCandidateStatus(a.status);
      return s === 'OFFERED' || s === 'HIRED';
    }).length;
    const offerAcceptanceRate = offered > 0 ? Math.round((hiredApps.length / offered) * 100) : 0;

    const funnelOrder: RecruitmentStage[] = [
      'APPLICATION',
      'SCREENING',
      'PHONE_SCREEN',
      'TECHNICAL',
      'ONSITE',
      'OFFER',
      'HIRED',
    ];
    const stageLabels: Record<string, string> = {
      APPLICATION: 'Application',
      SCREENING: 'Screening',
      PHONE_SCREEN: 'Phone Screen',
      TECHNICAL: 'Technical',
      ONSITE: 'Onsite',
      OFFER: 'Offer',
      HIRED: 'Hire',
    };
    const conversionRates: { stage: string; rate: number }[] = [];
    for (let i = 0; i < funnelOrder.length - 1; i++) {
      const from = funnelOrder[i];
      const to = funnelOrder[i + 1];
      const fromCount = stageCounts.get(from) || 0;
      const toCount = stageCounts.get(to) || 0;
      if (fromCount === 0 && toCount === 0) continue;
      conversionRates.push({
        stage: `${stageLabels[from]} → ${stageLabels[to]}`,
        rate: fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0,
      });
    }

    return {
      totalCandidates,
      byStage,
      bySource,
      timeToHire,
      offerAcceptanceRate,
      conversionRates,
    };
  }

  /**
   * Get open positions
   */
  static async getOpenPositions(
    tenantId: string,
    filters?: {
      department?: string;
      status?: JobOpening['status'];
    }
  ): Promise<{
    total: number;
    positions: {
      id: string;
      title: string;
      department: string;
      candidates: number;
      daysOpen: number;
      urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
  }> {
    const { prisma } = await import('@aura/database');
    const openStatuses = ['OPEN', 'Open', 'Published', 'ACTIVE', 'Active'];
    const statusFilter = filters?.status
      ? [
          filters.status,
          filters.status.toLowerCase(),
          filters.status.charAt(0) + filters.status.slice(1).toLowerCase(),
        ]
      : openStatuses;

    const jobs = await prisma.jobPosting.findMany({
      where: {
        isDeleted: false,
        status: { in: statusFilter },
        ...(filters?.department ? { department: filters.department } : {}),
      },
      include: {
        _count: {
          select: {
            candidateApplications: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    const positions = jobs.map((job) => {
      const opened = job.postedDate || job.createdAt;
      const daysOpen = Math.max(0, Math.floor((now - opened.getTime()) / (1000 * 60 * 60 * 24)));
      const urgency: 'LOW' | 'MEDIUM' | 'HIGH' =
        daysOpen >= 21 ? 'HIGH' : daysOpen >= 14 ? 'MEDIUM' : 'LOW';
      return {
        id: job.id,
        title: job.title,
        department: job.department,
        candidates: job._count.candidateApplications,
        daysOpen,
        urgency,
      };
    });

    return { total: positions.length, positions };
  }

  // ============================================================================
  // CANDIDATE COMMUNICATION
  // ============================================================================

  /**
   * Send candidate update (draft-only; no outbound delivery)
   */
  static async sendCandidateUpdate(
    candidateId: string,
    tenantId: string,
    templateType:
      'APPLICATION_RECEIVED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'REJECTED' | 'OFFER',
    additionalData?: Record<string, unknown>
  ): Promise<{ sent: boolean; draft: boolean; messageId: string }> {
    const candidate = await this.getCandidateById(candidateId, tenantId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    void templateType;
    void additionalData;

    return {
      sent: false,
      draft: true,
      messageId: `draft_${candidateId}_${Date.now()}`,
    };
  }

  /**
   * Send bulk communication (draft-only; verifies candidates exist)
   */
  static async sendBulkCommunication(
    candidateIds: string[],
    tenantId: string,
    template: { subject: string; body: string }
  ): Promise<{ sent: number; failed: number; errors: { id: string; error: string }[] }> {
    void template;
    let sent = 0;
    const errors: { id: string; error: string }[] = [];

    for (const id of candidateIds) {
      try {
        const result = await this.sendCandidateUpdate(id, tenantId, 'APPLICATION_RECEIVED');
        if (result.sent) {
          sent++;
        }
      } catch (error: unknown) {
        errors.push({
          id,
          error: error instanceof Error ? error.message : 'Failed to send',
        });
      }
    }

    return {
      sent,
      failed: errors.length,
      errors,
    };
  }

  // ============================================================================
  // DATA ACCESS
  // ============================================================================

  private static async getJobOpening(jobId: string, tenantId: string): Promise<JobOpening | null> {
    void tenantId;
    const { prisma } = await import('@aura/database');

    const job = await prisma.jobPosting.findFirst({
      where: { id: jobId, isDeleted: false },
      include: {
        _count: {
          select: {
            candidateApplications: {
              where: {
                isDeleted: false,
                status: { in: ['hired', 'HIRED', 'Hired'] },
              },
            },
          },
        },
      },
    });

    if (!job) return null;

    const requirements = this.extractRequirements(job.description, undefined);
    const statusUpper = (job.status || '').toUpperCase();
    const mappedStatus: JobOpening['status'] =
      statusUpper === 'OPEN' || statusUpper === 'PUBLISHED' || statusUpper === 'ACTIVE'
        ? 'OPEN'
        : statusUpper === 'ON_HOLD' || statusUpper === 'ONHOLD'
          ? 'ON_HOLD'
          : statusUpper === 'CLOSED'
            ? 'CLOSED'
            : 'DRAFT';

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: this.mapJobType(job.type),
      level: 'MID',
      description: job.description || '',
      requirements,
      openings: 1,
      filled: job._count.candidateApplications,
      hiringManager: job.createdBy || '',
      recruiterId: job.updatedBy || job.createdBy || '',
      status: mappedStatus,
      openedDate: job.postedDate || job.createdAt,
    };
  }

  private static async getCandidates(
    jobId: string,
    tenantId: string,
    filters?: { status?: CandidateStatus }
  ): Promise<CandidateProfile[]> {
    void tenantId;
    const { prisma } = await import('@aura/database');

    const applications = await prisma.candidateApplication.findMany({
      where: {
        jobPostingId: jobId,
        isDeleted: false,
        candidate: { isDeleted: false },
      },
      include: { candidate: true },
      orderBy: { appliedDate: 'desc' },
    });

    const profiles = applications.map((app) => this.mapApplicationToProfile(app));

    if (filters?.status) {
      return profiles.filter((c) => c.status === filters.status);
    }
    return profiles;
  }

  private static async getCandidateById(
    candidateId: string,
    tenantId: string
  ): Promise<CandidateProfile | null> {
    void tenantId;
    const { prisma } = await import('@aura/database');

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, isDeleted: false },
      include: {
        applications: {
          where: { isDeleted: false },
          orderBy: { appliedDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!candidate) return null;

    const latestApp = candidate.applications[0];
    return this.mapCandidateRecord(candidate, latestApp);
  }

  private static async updateCandidateStatus(
    candidateId: string,
    tenantId: string,
    status: CandidateStatus,
    stage: RecruitmentStage
  ): Promise<void> {
    void tenantId;
    const { prisma } = await import('@aura/database');

    const result = await prisma.candidateApplication.updateMany({
      where: { candidateId, isDeleted: false },
      data: {
        status: status.toLowerCase(),
        currentStage: stage.toLowerCase(),
      },
    });

    if (result.count === 0) {
      throw new Error('Candidate application not found');
    }
  }

  private static async getInterviewById(
    interviewId: string,
    tenantId: string
  ): Promise<InterviewSchedule | null> {
    void tenantId;
    const { prisma } = await import('@aura/database');

    const row = await prisma.interview.findFirst({
      where: { id: interviewId, isDeleted: false },
      include: {
        application: {
          select: { candidateId: true, jobPostingId: true },
        },
      },
    });

    if (!row) return null;
    return this.mapInterviewToSchedule(row);
  }

  private static mapInterviewToSchedule(row: {
    id: string;
    type: string;
    scheduledDate: Date;
    duration: number;
    location: string | null;
    meetingLink: string | null;
    interviewerIds: string[];
    interviewerNames: string[];
    status: string;
    application?: { candidateId: string; jobPostingId: string } | null;
  }): InterviewSchedule {
    const start = new Date(row.scheduledDate);
    const end = new Date(start.getTime() + row.duration * 60 * 1000);
    const formatTime = (d: Date) =>
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    const interviewers = (row.interviewerIds || []).map((id, index) => ({
      id,
      name: row.interviewerNames?.[index] || id,
      role: 'Interviewer',
      email: '',
    }));

    return {
      id: row.id,
      candidateId: row.application?.candidateId || '',
      jobId: row.application?.jobPostingId || '',
      type: this.mapInterviewType(row.type),
      scheduledDate: row.scheduledDate,
      startTime: formatTime(start),
      endTime: formatTime(end),
      duration: row.duration,
      interviewers,
      location: row.location || undefined,
      meetingLink: row.meetingLink || undefined,
      status: this.mapInterviewStatus(row.status),
    };
  }

  private static mapApplicationToProfile(app: {
    status: string;
    currentStage?: string | null;
    appliedDate: Date;
    source?: string | null;
    notes?: string | null;
    resumeUrl?: string | null;
    overallRating?: number | null;
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      location?: string | null;
      resumeUrl?: string | null;
      source?: string | null;
      skills: string[];
      experience?: unknown;
      education?: unknown;
      notes?: string | null;
    };
  }): CandidateProfile {
    return this.mapCandidateRecord(app.candidate, app);
  }

  private static mapCandidateRecord(
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      location?: string | null;
      resumeUrl?: string | null;
      source?: string | null;
      skills: string[];
      experience?: unknown;
      education?: unknown;
      notes?: string | null;
    },
    application?: {
      status: string;
      currentStage?: string | null;
      appliedDate: Date;
      source?: string | null;
      notes?: string | null;
      resumeUrl?: string | null;
      overallRating?: number | null;
    } | null
  ): CandidateProfile {
    const experienceInfo = this.parseExperience(candidate.experience);
    return {
      id: candidate.id,
      name: `${candidate.firstName} ${candidate.lastName}`.trim(),
      email: candidate.email,
      phone: candidate.phone || undefined,
      resumeUrl: application?.resumeUrl || candidate.resumeUrl || undefined,
      skills: candidate.skills || [],
      experience: experienceInfo.years,
      currentRole: experienceInfo.currentRole,
      currentCompany: experienceInfo.currentCompany,
      education: this.parseEducation(candidate.education),
      location: candidate.location || '',
      source: application?.source || candidate.source || 'Unknown',
      appliedDate: application?.appliedDate || new Date(),
      status: application ? this.mapToCandidateStatus(application.status) : 'NEW',
      stage: application
        ? this.mapToRecruitmentStage(application.currentStage || application.status)
        : 'APPLICATION',
      score: application?.overallRating ?? undefined,
      notes: application?.notes || candidate.notes || undefined,
    };
  }

  private static parseExperience(experience: unknown): {
    years: number;
    currentRole?: string;
    currentCompany?: string;
  } {
    if (experience == null) return { years: 0 };
    if (typeof experience === 'number') return { years: experience };
    if (typeof experience === 'string') {
      const n = parseFloat(experience);
      return { years: Number.isFinite(n) ? n : 0 };
    }
    if (Array.isArray(experience)) {
      let years = 0;
      let currentRole: string | undefined;
      let currentCompany: string | undefined;
      for (const item of experience) {
        if (!item || typeof item !== 'object') continue;
        const row = item as Record<string, unknown>;
        const y = Number(row.years ?? row.yearsOfExperience ?? row.durationYears ?? 0);
        if (Number.isFinite(y)) years += y;
        if (!currentRole && (row.title || row.role || row.position)) {
          currentRole = String(row.title || row.role || row.position);
          currentCompany = row.company ? String(row.company) : undefined;
        }
      }
      if (years === 0 && experience.length > 0) {
        years = experience.length * 2;
      }
      return { years, currentRole, currentCompany };
    }
    if (typeof experience === 'object') {
      const obj = experience as Record<string, unknown>;
      const years = Number(
        obj.years ?? obj.totalYears ?? obj.yearsOfExperience ?? obj.totalExperienceYears ?? 0
      );
      return {
        years: Number.isFinite(years) ? years : 0,
        currentRole:
          obj.currentRole || obj.title || obj.role
            ? String(obj.currentRole || obj.title || obj.role)
            : undefined,
        currentCompany:
          obj.currentCompany || obj.company ? String(obj.currentCompany || obj.company) : undefined,
      };
    }
    return { years: 0 };
  }

  private static parseEducation(
    education: unknown
  ): { degree: string; institution: string; year: number }[] {
    if (!education) return [];
    const list = Array.isArray(education) ? education : [education];
    return list
      .filter((e) => e && typeof e === 'object')
      .map((e) => {
        const row = e as Record<string, unknown>;
        return {
          degree: String(row.degree || row.qualification || ''),
          institution: String(row.institution || row.school || row.university || ''),
          year: Number(row.year || row.graduationYear || 0) || 0,
        };
      })
      .filter((e) => e.degree || e.institution);
  }

  private static extractRequirements(
    description: string | null | undefined,
    skills?: string[]
  ): JobOpening['requirements'] {
    const mustHave: string[] = skills?.length ? [...skills] : [];
    if (description) {
      const skillLine = description.match(
        /(?:required|must[- ]have|requirements?)[:\s]+([^\n.]+)/i
      );
      if (skillLine?.[1] && mustHave.length === 0) {
        mustHave.push(
          ...skillLine[1]
            .split(/[,;/|]/)
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }
    }
    const expMatch = description?.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
    return {
      mustHave,
      niceToHave: [],
      experienceMin: expMatch ? parseInt(expMatch[1], 10) : 0,
    };
  }

  private static mapJobType(type: string): JobOpening['type'] {
    const t = (type || '').toUpperCase().replace(/[-\s]/g, '_');
    if (t.includes('PART')) return 'PART_TIME';
    if (t.includes('CONTRACT')) return 'CONTRACT';
    if (t.includes('INTERN')) return 'INTERNSHIP';
    return 'FULL_TIME';
  }

  private static mapInterviewType(type: string): InterviewSchedule['type'] {
    const t = (type || '').toUpperCase().replace(/[-\s]/g, '_');
    if (t.includes('PHONE')) return 'PHONE_SCREEN';
    if (t.includes('TECH')) return 'TECHNICAL';
    if (t.includes('BEHAV')) return 'BEHAVIORAL';
    if (t.includes('PANEL')) return 'PANEL';
    if (t.includes('FINAL')) return 'FINAL';
    return 'TECHNICAL';
  }

  private static mapInterviewStatus(status: string): InterviewSchedule['status'] {
    const s = (status || '').toUpperCase().replace(/[-\s]/g, '_');
    if (s === 'CONFIRMED') return 'CONFIRMED';
    if (s === 'COMPLETED') return 'COMPLETED';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'CANCELLED';
    if (s === 'RESCHEDULED') return 'RESCHEDULED';
    return 'SCHEDULED';
  }

  private static mapToCandidateStatus(status: string): CandidateStatus {
    const s = (status || '').toUpperCase().replace(/[-\s]/g, '_');
    if (s === 'NEW' || s === 'APPLIED' || s === 'APPLICATION') return 'NEW';
    if (s === 'SCREENING' || s === 'SCREEN') return 'SCREENING';
    if (s === 'SHORTLISTED' || s === 'SHORTLIST') return 'SHORTLISTED';
    if (s.includes('INTERVIEW')) return 'INTERVIEWING';
    if (s === 'OFFERED' || s === 'OFFER') return 'OFFERED';
    if (s === 'HIRED') return 'HIRED';
    if (s === 'REJECTED' || s === 'REJECT') return 'REJECTED';
    if (s === 'WITHDRAWN' || s === 'WITHDRAW') return 'WITHDRAWN';
    return 'NEW';
  }

  private static mapToRecruitmentStage(stage: string): RecruitmentStage {
    const s = (stage || '').toUpperCase().replace(/[-\s]/g, '_');
    if (s === 'APPLICATION' || s === 'APPLIED' || s === 'NEW') return 'APPLICATION';
    if (s === 'SCREENING' || s === 'SCREEN') return 'SCREENING';
    if (s.includes('PHONE')) return 'PHONE_SCREEN';
    if (s.includes('TECH')) return 'TECHNICAL';
    if (s.includes('ONSITE') || s.includes('ON_SITE')) return 'ONSITE';
    if (s === 'FINAL') return 'FINAL';
    if (s === 'OFFER' || s === 'OFFERED') return 'OFFER';
    if (s === 'HIRED') return 'HIRED';
    if (s.includes('INTERVIEW')) return 'TECHNICAL';
    if (s === 'SHORTLISTED') return 'SCREENING';
    return 'APPLICATION';
  }

  // ============================================================================
  // CONVERSATION HANDLING
  // ============================================================================

  /**
   * Handle screening intent
   */
  static async handleScreeningIntent(
    intent: CandidateScreeningIntent,
    context: ConversationContext
  ): Promise<AgentResponse> {
    let content = '';

    switch (intent.type) {
      case 'SCREEN': {
        const matches = await this.screenCandidates(
          intent.jobId,
          context.tenantId,
          intent.criteria
        );
        content = this.formatScreeningResults(matches.slice(0, intent.limit || 10));
        break;
      }

      case 'RANK': {
        const matches = await this.screenCandidates(intent.jobId, context.tenantId);
        content = this.formatRankings(matches.slice(0, intent.limit || 5));
        break;
      }

      case 'MATCH': {
        const matches = await this.screenCandidates(
          intent.jobId,
          context.tenantId,
          intent.criteria
        );
        const qualified = matches.filter((m) => m.overallScore >= 70);
        content =
          `Found **${qualified.length}** candidates matching your criteria.\n\n` +
          this.formatScreeningResults(qualified.slice(0, 5));
        break;
      }

      case 'SHORTLIST': {
        content =
          'Please specify which candidates you would like to shortlist by their ranking numbers.';
        break;
      }
    }

    return {
      sessionId: context.sessionId,
      messageId: `msg_${Date.now()}`,
      agentType: 'RECRUITMENT_AGENT',
      content,
      contentType: 'markdown',
      suggestions: [
        {
          id: '1',
          type: 'quick_reply',
          label: 'Schedule interviews',
          value: 'Schedule interviews for top candidates',
        },
        {
          id: '2',
          type: 'quick_reply',
          label: 'View pipeline',
          value: 'Show recruitment pipeline',
        },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Format screening results
   */
  private static formatScreeningResults(matches: CandidateMatch[]): string {
    let result = '**🔍 Candidate Screening Results**\n\n';

    for (const match of matches) {
      const emoji =
        match.recommendation === 'STRONG_HIRE'
          ? '🌟'
          : match.recommendation === 'HIRE'
            ? '✅'
            : match.recommendation === 'MAYBE'
              ? '🤔'
              : '❌';

      result += `**#${match.ranking}** ${match.candidateName} ${emoji}\n`;
      result += `- Overall Score: **${match.overallScore}%**\n`;
      result += `- Skills: ${match.skillMatch}% | Experience: ${match.experienceMatch}%\n`;

      if (match.highlights.length > 0) {
        result += `- 💪 ${match.highlights.join(', ')}\n`;
      }
      if (match.concerns.length > 0) {
        result += `- ⚠️ ${match.concerns.join(', ')}\n`;
      }

      result += `- Recommendation: **${match.recommendation.replace('_', ' ')}**\n\n`;
    }

    return result;
  }

  /**
   * Format rankings
   */
  private static formatRankings(matches: CandidateMatch[]): string {
    let result = '**🏆 Top Candidates**\n\n';
    result += '| Rank | Candidate | Score | Recommendation |\n';
    result += '|------|-----------|-------|----------------|\n';

    for (const match of matches) {
      result += `| ${match.ranking} | ${match.candidateName} | ${match.overallScore}% | ${match.recommendation} |\n`;
    }

    return result;
  }
}

// Initialize on module load
RecruitmentAgentService.initialize();
