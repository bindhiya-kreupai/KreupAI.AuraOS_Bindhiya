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
  CandidateMatch} from './types';
import {
  RecruitmentAgentCapabilities,
} from './types';
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

type CandidateStatus = 'NEW' | 'SCREENING' | 'SHORTLISTED' | 'INTERVIEWING' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
type RecruitmentStage = 'APPLICATION' | 'SCREENING' | 'PHONE_SCREEN' | 'TECHNICAL' | 'ONSITE' | 'FINAL' | 'OFFER' | 'HIRED';

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
    description: 'AI-powered recruitment assistant for candidate screening, scheduling, and pipeline management',
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
        intents: ['SCHEDULE_INTERVIEW', 'RESCHEDULE_INTERVIEW', 'CANCEL_INTERVIEW', 'VIEW_SCHEDULE'],
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
    const matches: CandidateMatch[] = candidates.map(candidate => {
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
    matches.forEach((m, i) => { m.ranking = i + 1; });

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
    const requiredMatches = criteria.requiredSkills.filter(skill =>
      candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    );
    const preferredMatches = (criteria.preferredSkills || []).filter(skill =>
      candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    );

    const skillScore = (requiredMatches.length / criteria.requiredSkills.length) * 70 +
      (preferredMatches.length / (criteria.preferredSkills?.length || 1)) * 30;

    if (requiredMatches.length === criteria.requiredSkills.length) {
      highlights.push('All required skills matched');
    } else {
      const missing = criteria.requiredSkills.filter(s => !requiredMatches.includes(s));
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
        concerns.push(`Experience below minimum (${candidate.experience} vs ${criteria.experienceMin} years)`);
      }
    }

    // Education matching
    let educationScore = 70; // Default
    if (criteria.educationLevel) {
      const educationLevels = ['HIGH_SCHOOL', 'BACHELORS', 'MASTERS', 'PHD'];
      const requiredLevel = educationLevels.indexOf(criteria.educationLevel.toUpperCase());
      // Simplified - check if candidate has required education
      const hasRequiredEducation = candidate.education.some(e =>
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
    if (criteria.noticePeriod && candidate.noticePeriod && candidate.noticePeriod > criteria.noticePeriod) {
      concerns.push(`Long notice period: ${candidate.noticePeriod} days`);
    }

    // Salary expectation
    if (criteria.salaryRange && candidate.expectedSalary) {
      if (candidate.expectedSalary.min > criteria.salaryRange.max) {
        concerns.push('Salary expectation above budget');
      }
    }

    // Culture fit (placeholder - in production, use ML model)
    const cultureFitScore = 75;

    // Calculate overall score
    const overall = skillScore * 0.4 + experienceScore * 0.3 + educationScore * 0.15 + cultureFitScore * 0.15;

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
      } catch (error) {
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

    // Check interviewer availability
    const availableSlot = await this.findAvailableSlot(
      intent.interviewers,
      intent.preferredSlots || [],
      intent.duration
    );

    if (!availableSlot) {
      throw new Error('No available slots found for the selected interviewers');
    }

    const schedule: InterviewSchedule = {
      id: `int_${Date.now()}`,
      candidateId: intent.candidateId,
      jobId: candidate.status === 'INTERVIEWING' ? 'job_current' : 'job_pending',
      type: intent.interviewType as InterviewSchedule['type'],
      scheduledDate: availableSlot.date,
      startTime: availableSlot.startTime,
      endTime: availableSlot.endTime,
      duration: intent.duration,
      interviewers: intent.interviewers.map(id => ({
        id,
        name: `Interviewer ${id}`,
        role: 'Interviewer',
        email: `${id}@company.com`,
      })),
      meetingLink: `https://meet.company.com/${Date.now()}`,
      status: 'SCHEDULED',
    };

    // In production, save to database and send calendar invites

    return schedule;
  }

  /**
   * Find available slot
   */
  private static async findAvailableSlot(
    interviewerIds: string[],
    preferredSlots: { date: Date; startTime: string; endTime: string }[],
    duration: number
  ): Promise<{ date: Date; startTime: string; endTime: string } | null> {
    // In production, check calendar availability
    // For now, return first preferred slot or generate one
    if (preferredSlots.length > 0) {
      return preferredSlots[0];
    }

    // Generate next available slot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    return {
      date: tomorrow,
      startTime: '10:00',
      endTime: `${10 + Math.ceil(duration / 60)}:00`,
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
    const interview = await this.getInterviewById(interviewId, tenantId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    interview.scheduledDate = newSlot.date;
    interview.startTime = newSlot.startTime;
    interview.endTime = newSlot.endTime;
    interview.status = 'RESCHEDULED';

    // In production, update calendar and send notifications

    return interview;
  }

  /**
   * Cancel interview
   */
  static async cancelInterview(
    interviewId: string,
    tenantId: string,
    reason: string
  ): Promise<InterviewSchedule> {
    const interview = await this.getInterviewById(interviewId, tenantId);
    if (!interview) {
      throw new Error('Interview not found');
    }

    interview.status = 'CANCELLED';

    // In production, cancel calendar events and notify participants

    return interview;
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
    // In production, fetch from database
    const mockInterviews: InterviewSchedule[] = [
      {
        id: 'int_001',
        candidateId: 'cand_001',
        jobId: 'job_001',
        type: 'TECHNICAL',
        scheduledDate: new Date(Date.now() + 86400000),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        interviewers: [
          { id: 'emp_001', name: 'Tech Lead', role: 'Engineering', email: 'techlead@company.com' },
        ],
        meetingLink: 'https://meet.company.com/abc123',
        status: 'CONFIRMED',
      },
      {
        id: 'int_002',
        candidateId: 'cand_002',
        jobId: 'job_001',
        type: 'PHONE_SCREEN',
        scheduledDate: new Date(Date.now() + 172800000),
        startTime: '14:00',
        endTime: '14:30',
        duration: 30,
        interviewers: [
          { id: 'emp_002', name: 'Recruiter', role: 'HR', email: 'recruiter@company.com' },
        ],
        meetingLink: 'https://meet.company.com/xyz789',
        status: 'SCHEDULED',
      },
    ];

    return mockInterviews;
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
    const totalCandidates = 156;

    return {
      totalCandidates,
      byStage: [
        { stage: 'APPLICATION', count: 45, percentage: 28.8 },
        { stage: 'SCREENING', count: 32, percentage: 20.5 },
        { stage: 'PHONE_SCREEN', count: 28, percentage: 17.9 },
        { stage: 'TECHNICAL', count: 22, percentage: 14.1 },
        { stage: 'ONSITE', count: 15, percentage: 9.6 },
        { stage: 'OFFER', count: 8, percentage: 5.1 },
        { stage: 'HIRED', count: 6, percentage: 3.8 },
      ],
      bySource: [
        { source: 'LinkedIn', count: 52, qualityScore: 72 },
        { source: 'Employee Referral', count: 28, qualityScore: 85 },
        { source: 'Job Portal', count: 45, qualityScore: 58 },
        { source: 'Direct Apply', count: 31, qualityScore: 65 },
      ],
      timeToHire: { average: 28, min: 14, max: 45 },
      offerAcceptanceRate: 75,
      conversionRates: [
        { stage: 'Application → Screening', rate: 71 },
        { stage: 'Screening → Phone Screen', rate: 87 },
        { stage: 'Phone Screen → Technical', rate: 78 },
        { stage: 'Technical → Onsite', rate: 68 },
        { stage: 'Onsite → Offer', rate: 53 },
        { stage: 'Offer → Hire', rate: 75 },
      ],
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
    const positions = [
      { id: 'job_001', title: 'Senior Software Engineer', department: 'Engineering', candidates: 45, daysOpen: 21, urgency: 'HIGH' as const },
      { id: 'job_002', title: 'Product Manager', department: 'Product', candidates: 28, daysOpen: 14, urgency: 'MEDIUM' as const },
      { id: 'job_003', title: 'UX Designer', department: 'Design', candidates: 32, daysOpen: 7, urgency: 'LOW' as const },
      { id: 'job_004', title: 'Data Analyst', department: 'Analytics', candidates: 19, daysOpen: 30, urgency: 'HIGH' as const },
      { id: 'job_005', title: 'DevOps Engineer', department: 'Engineering', candidates: 22, daysOpen: 18, urgency: 'MEDIUM' as const },
    ];

    return {
      total: positions.length,
      positions,
    };
  }

  // ============================================================================
  // CANDIDATE COMMUNICATION
  // ============================================================================

  /**
   * Send candidate update
   */
  static async sendCandidateUpdate(
    candidateId: string,
    tenantId: string,
    templateType: 'APPLICATION_RECEIVED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'REJECTED' | 'OFFER',
    additionalData?: Record<string, unknown>
  ): Promise<{ sent: boolean; messageId: string }> {
    const candidate = await this.getCandidateById(candidateId, tenantId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const templates: Record<string, { subject: string; body: string }> = {
      APPLICATION_RECEIVED: {
        subject: 'Application Received - {{jobTitle}}',
        body: 'Dear {{name}}, Thank you for applying...',
      },
      SHORTLISTED: {
        subject: 'Great News! You\'ve Been Shortlisted',
        body: 'Dear {{name}}, We\'re pleased to inform you...',
      },
      INTERVIEW_SCHEDULED: {
        subject: 'Interview Scheduled - {{jobTitle}}',
        body: 'Dear {{name}}, Your interview has been scheduled...',
      },
      REJECTED: {
        subject: 'Update on Your Application',
        body: 'Dear {{name}}, Thank you for your interest...',
      },
      OFFER: {
        subject: 'Offer Letter - {{jobTitle}}',
        body: 'Dear {{name}}, We\'re excited to offer you...',
      },
    };

    const template = templates[templateType];

    // In production, send email using email service

    return {
      sent: true,
      messageId: `msg_${Date.now()}`,
    };
  }

  /**
   * Send bulk communication
   */
  static async sendBulkCommunication(
    candidateIds: string[],
    tenantId: string,
    template: { subject: string; body: string }
  ): Promise<{ sent: number; failed: number; errors: { id: string; error: string }[] }> {
    let sent = 0;
    const errors: { id: string; error: string }[] = [];

    for (const id of candidateIds) {
      try {
        await this.sendCandidateUpdate(id, tenantId, 'APPLICATION_RECEIVED');
        sent++;
      } catch (error) {
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
  // DATA ACCESS (Mock implementations)
  // ============================================================================

  private static async getJobOpening(jobId: string, tenantId: string): Promise<JobOpening | null> {
    return {
      id: jobId,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Bangalore',
      type: 'FULL_TIME',
      level: 'SENIOR',
      description: 'We are looking for a senior software engineer...',
      requirements: {
        mustHave: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        niceToHave: ['AWS', 'Docker', 'GraphQL'],
        experienceMin: 5,
        experienceMax: 10,
        education: 'BACHELORS',
      },
      salary: { min: 2000000, max: 3500000, currency: 'INR' },
      openings: 3,
      filled: 1,
      hiringManager: 'John Manager',
      recruiterId: 'Jane Recruiter',
      status: 'OPEN',
      openedDate: new Date(2024, 10, 1),
    };
  }

  private static async getCandidates(
    jobId: string,
    tenantId: string,
    filters?: { status?: CandidateStatus }
  ): Promise<CandidateProfile[]> {
    const mockCandidates: CandidateProfile[] = [
      {
        id: 'cand_001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
        experience: 7,
        currentRole: 'Software Engineer',
        currentCompany: 'Tech Corp',
        education: [{ degree: 'B.Tech Computer Science', institution: 'IIT Delhi', year: 2017 }],
        location: 'Bangalore',
        expectedSalary: { min: 2500000, max: 3000000, currency: 'INR' },
        noticePeriod: 30,
        source: 'LinkedIn',
        appliedDate: new Date(),
        status: 'NEW',
        stage: 'APPLICATION',
      },
      {
        id: 'cand_002',
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        skills: ['JavaScript', 'React', 'Python', 'Docker'],
        experience: 5,
        currentRole: 'Full Stack Developer',
        currentCompany: 'StartupXYZ',
        education: [{ degree: 'M.Tech', institution: 'NIT Warangal', year: 2019 }],
        location: 'Hyderabad',
        expectedSalary: { min: 2200000, max: 2800000, currency: 'INR' },
        noticePeriod: 60,
        source: 'Employee Referral',
        appliedDate: new Date(),
        status: 'NEW',
        stage: 'APPLICATION',
      },
      {
        id: 'cand_003',
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'GraphQL'],
        experience: 8,
        currentRole: 'Lead Developer',
        currentCompany: 'Enterprise Inc',
        education: [{ degree: 'B.E. Computer Science', institution: 'VIT', year: 2016 }],
        location: 'Bangalore',
        expectedSalary: { min: 3000000, max: 3500000, currency: 'INR' },
        noticePeriod: 90,
        source: 'Direct Apply',
        appliedDate: new Date(),
        status: 'NEW',
        stage: 'APPLICATION',
      },
    ];

    if (filters?.status) {
      return mockCandidates.filter(c => c.status === filters.status);
    }

    return mockCandidates;
  }

  private static async getCandidateById(candidateId: string, tenantId: string): Promise<CandidateProfile | null> {
    const candidates = await this.getCandidates('', tenantId);
    return candidates.find(c => c.id === candidateId) || null;
  }

  private static async updateCandidateStatus(
    candidateId: string,
    tenantId: string,
    status: CandidateStatus,
    stage: RecruitmentStage
  ): Promise<void> {
    // In production, update in database
  }

  private static async getInterviewById(interviewId: string, tenantId: string): Promise<InterviewSchedule | null> {
    const interviews = await this.getUpcomingInterviews(tenantId);
    return interviews.find(i => i.id === interviewId) || null;
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
        const qualified = matches.filter(m => m.overallScore >= 70);
        content = `Found **${qualified.length}** candidates matching your criteria.\n\n` +
          this.formatScreeningResults(qualified.slice(0, 5));
        break;
      }

      case 'SHORTLIST': {
        content = 'Please specify which candidates you would like to shortlist by their ranking numbers.';
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
        { id: '1', type: 'quick_reply', label: 'Schedule interviews', value: 'Schedule interviews for top candidates' },
        { id: '2', type: 'quick_reply', label: 'View pipeline', value: 'Show recruitment pipeline' },
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
      const emoji = match.recommendation === 'STRONG_HIRE' ? '🌟' :
                    match.recommendation === 'HIRE' ? '✅' :
                    match.recommendation === 'MAYBE' ? '🤔' : '❌';

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
