/**
 * Career Portal Service
 * Manages public job listings, external applications, and candidate pipeline
 * for the career portal (public-facing job board)
 */

import { prisma } from '@aura/database';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const publicJobSearchSchema = z.object({
  keyword: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY']).optional(),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'EXECUTIVE']).optional(),
  postedAfter: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sortBy: z.enum(['postedAt', 'title', 'closingDate']).default('postedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const externalApplicationSchema = z.object({
  jobPostingId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedInUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  coverLetter: z.string().optional(),
  currentCompany: z.string().optional(),
  currentTitle: z.string().optional(),
  totalExperience: z.coerce.number().optional(),
  expectedSalary: z.coerce.number().optional(),
  expectedSalaryCurrency: z.string().default('AED'),
  noticePeriod: z.string().optional(),
  source: z.enum(['CAREER_PORTAL', 'LINKEDIN', 'INDEED', 'BAYT', 'NAUKRI', 'REFERRAL', 'OTHER']).default('CAREER_PORTAL'),
  referredBy: z.string().optional(),
  resumeFileUrl: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })).optional(),
});

const interviewSlotSchema = z.object({
  tenantId: z.string(),
  candidateId: z.string(),
  jobPostingId: z.string(),
  interviewType: z.enum(['PHONE_SCREEN', 'VIDEO', 'IN_PERSON', 'PANEL', 'TECHNICAL', 'HR_ROUND']),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().default(60),
  interviewerIds: z.array(z.string()),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export interface PublicJobListing {
  id: string;
  title: string;
  titleAr?: string;
  department: string;
  departmentAr?: string;
  location: string;
  locationAr?: string;
  employmentType: string;
  experienceLevel: string;
  description: string;
  descriptionAr?: string;
  requirements: string[];
  requirementsAr?: string[];
  benefits?: string[];
  benefitsAr?: string[];
  requiredSkills: string[];
  salaryRange?: { min: number; max: number; currency: string; display: string };
  postedAt: Date;
  closingDate?: Date;
  isUrgent: boolean;
  applicantCount: number;
  companyName: string;
  companyLogo?: string;
}

export interface ApplicationStatus {
  applicationId: string;
  status: ApplicationStatusType;
  statusAr: string;
  currentStage: string;
  currentStageAr: string;
  appliedAt: Date;
  lastUpdated: Date;
  stages: ApplicationStage[];
}

export type ApplicationStatusType =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'ASSESSMENT'
  | 'OFFER_EXTENDED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_DECLINED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationStage {
  stage: string;
  stageAr: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'SKIPPED';
  completedAt?: Date;
}

export interface InterviewSchedule {
  id: string;
  candidateName: string;
  jobTitle: string;
  interviewType: string;
  scheduledAt: Date;
  durationMinutes: number;
  interviewers: Array<{ id: string; name: string; role: string }>;
  location?: string;
  meetingLink?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

export interface OfferLetterData {
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  department: string;
  startDate: Date;
  salary: number;
  currency: string;
  benefits: string[];
  probationDays: number;
  reportingTo: string;
  location: string;
  expiryDate: Date;
  specialTerms?: string[];
}

export interface RecruitmentFunnel {
  jobPostingId: string;
  jobTitle: string;
  stages: FunnelStage[];
  timeToHire?: number;
  conversionRate: number;
}

interface FunnelStage {
  stage: string;
  stageAr: string;
  count: number;
  percentage: number;
  avgDaysInStage: number;
}

const STATUS_AR: Record<ApplicationStatusType, string> = {
  APPLIED: 'تم التقديم',
  SCREENING: 'المراجعة الأولية',
  SHORTLISTED: 'في القائمة المختصرة',
  INTERVIEW_SCHEDULED: 'تم جدولة المقابلة',
  INTERVIEW_COMPLETED: 'تمت المقابلة',
  ASSESSMENT: 'التقييم',
  OFFER_EXTENDED: 'تم تقديم العرض',
  OFFER_ACCEPTED: 'تم قبول العرض',
  OFFER_DECLINED: 'تم رفض العرض',
  HIRED: 'تم التوظيف',
  REJECTED: 'مرفوض',
  WITHDRAWN: 'تم الانسحاب',
};

// ============================================================================
// CAREER PORTAL SERVICE
// ============================================================================

export class CareerPortalService {
  // --------------------------------------------------------------------------
  // Public Job Listings (no auth required)
  // --------------------------------------------------------------------------

  /**
   * Search published job listings for the public career portal
   */
  static async searchPublicJobs(
    tenantId: string,
    params: z.infer<typeof publicJobSearchSchema>
  ): Promise<{ jobs: PublicJobListing[]; total: number; page: number; totalPages: number }> {
    const validated = publicJobSearchSchema.parse(params);
    const { keyword, department, location, employmentType, experienceLevel, postedAfter, page, limit, sortBy, sortOrder } = validated;

    const where: any = {
      tenantId,
      status: 'PUBLISHED',
      isActive: true,
      OR: [
        { closingDate: null },
        { closingDate: { gte: new Date() } },
      ],
    };

    if (keyword) {
      where.AND = [{
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { requiredSkills: { hasSome: [keyword] } },
        ],
      }];
    }
    if (department) where.department = department;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (employmentType) where.employmentType = employmentType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (postedAfter) where.publishedAt = { gte: postedAfter };

    const [total, jobs] = await Promise.all([
      prisma.jobPosting.count({ where }),
      prisma.jobPosting.findMany({
        where,
        orderBy: { [sortBy === 'postedAt' ? 'publishedAt' : sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { applications: true } },
        },
      }),
    ]);

    const publicJobs: PublicJobListing[] = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      titleAr: job.titleAr,
      department: job.department,
      departmentAr: job.departmentAr,
      location: job.location,
      locationAr: job.locationAr,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel || 'MID',
      description: job.description || '',
      descriptionAr: job.descriptionAr,
      requirements: (job.requirements as string[]) || [],
      requirementsAr: (job.requirementsAr as string[]) || [],
      benefits: (job.benefits as string[]) || [],
      benefitsAr: (job.benefitsAr as string[]) || [],
      requiredSkills: (job.requiredSkills as string[]) || [],
      salaryRange: job.salaryMin && job.salaryMax ? {
        min: Number(job.salaryMin),
        max: Number(job.salaryMax),
        currency: job.currency || 'AED',
        display: `${job.currency || 'AED'} ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`,
      } : undefined,
      postedAt: job.publishedAt || job.createdAt,
      closingDate: job.closingDate,
      isUrgent: job.isUrgent || false,
      applicantCount: job._count?.applications || 0,
      companyName: job.companyName || 'Company',
      companyLogo: job.companyLogo,
    }));

    return {
      jobs: publicJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single public job posting by ID
   */
  static async getPublicJob(tenantId: string, jobId: string): Promise<PublicJobListing | null> {
    const job: any = await prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        tenantId,
        status: 'PUBLISHED',
        isActive: true,
      },
      include: {
        _count: { select: { applications: true } },
      },
    });

    if (!job) return null;

    return {
      id: job.id,
      title: job.title,
      titleAr: job.titleAr,
      department: job.department,
      departmentAr: job.departmentAr,
      location: job.location,
      locationAr: job.locationAr,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel || 'MID',
      description: job.description || '',
      descriptionAr: job.descriptionAr,
      requirements: (job.requirements as string[]) || [],
      benefits: (job.benefits as string[]) || [],
      requiredSkills: (job.requiredSkills as string[]) || [],
      salaryRange: job.salaryMin && job.salaryMax ? {
        min: Number(job.salaryMin),
        max: Number(job.salaryMax),
        currency: job.currency || 'AED',
        display: `${job.currency || 'AED'} ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`,
      } : undefined,
      postedAt: job.publishedAt || job.createdAt,
      closingDate: job.closingDate,
      isUrgent: job.isUrgent || false,
      applicantCount: job._count?.applications || 0,
      companyName: job.companyName || 'Company',
      companyLogo: job.companyLogo,
    };
  }

  // --------------------------------------------------------------------------
  // External Applications
  // --------------------------------------------------------------------------

  /**
   * Submit an external application (from career portal)
   */
  static async submitApplication(
    tenantId: string,
    data: z.infer<typeof externalApplicationSchema>
  ): Promise<{ applicationId: string; message: string; messageAr: string }> {
    const validated = externalApplicationSchema.parse(data);

    // Check if job is still open
    const job = await prisma.jobPosting.findFirst({
      where: {
        id: validated.jobPostingId,
        tenantId,
        status: 'PUBLISHED',
        isActive: true,
      },
    });

    if (!job) {
      throw new Error('Job posting not found or no longer accepting applications');
    }

    // Check for duplicate application
    const existing = await prisma.jobApplication.findFirst({
      where: {
        tenantId,
        jobPostingId: validated.jobPostingId,
        email: validated.email,
      },
    });

    if (existing) {
      throw new Error('You have already applied for this position');
    }

    // Create candidate record (or find existing)
    let candidate = await prisma.candidate.findFirst({
      where: { tenantId, email: validated.email },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          tenantId,
          firstName: validated.firstName,
          lastName: validated.lastName,
          email: validated.email,
          phone: validated.phone,
          linkedInUrl: validated.linkedInUrl,
          portfolioUrl: validated.portfolioUrl,
          currentCompany: validated.currentCompany,
          currentTitle: validated.currentTitle,
          totalExperience: validated.totalExperience,
          expectedSalary: validated.expectedSalary,
          expectedSalaryCurrency: validated.expectedSalaryCurrency,
          noticePeriod: validated.noticePeriod,
          source: validated.source,
          referredBy: validated.referredBy,
          resumeUrl: validated.resumeFileUrl,
        },
      });
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        tenantId,
        jobPostingId: validated.jobPostingId,
        candidateId: candidate.id,
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        coverLetter: validated.coverLetter,
        resumeUrl: validated.resumeFileUrl,
        source: validated.source,
        status: 'APPLIED',
        appliedAt: new Date(),
        screeningAnswers: validated.answers || [],
      },
    });

    return {
      applicationId: application.id,
      message: 'Application submitted successfully. We will review your profile and get back to you.',
      messageAr: 'تم تقديم طلبك بنجاح. سنراجع ملفك الشخصي ونتواصل معك.',
    };
  }

  /**
   * Check application status (for candidates)
   */
  static async getApplicationStatus(
    applicationId: string,
    email: string
  ): Promise<ApplicationStatus | null> {
    const application: any = await prisma.jobApplication.findFirst({
      where: { id: applicationId, email },
    });

    if (!application) return null;

    const allStages: Array<{ stage: string; stageAr: string }> = [
      { stage: 'Applied', stageAr: 'تم التقديم' },
      { stage: 'Screening', stageAr: 'المراجعة' },
      { stage: 'Interview', stageAr: 'المقابلة' },
      { stage: 'Assessment', stageAr: 'التقييم' },
      { stage: 'Offer', stageAr: 'العرض' },
      { stage: 'Hired', stageAr: 'التوظيف' },
    ];

    const statusToStage: Record<string, number> = {
      APPLIED: 0, SCREENING: 1, SHORTLISTED: 1,
      INTERVIEW_SCHEDULED: 2, INTERVIEW_COMPLETED: 2,
      ASSESSMENT: 3, OFFER_EXTENDED: 4, OFFER_ACCEPTED: 4,
      HIRED: 5, REJECTED: -1, WITHDRAWN: -1, OFFER_DECLINED: -1,
    };

    const currentStageIndex = statusToStage[application.status] ?? 0;

    const stages: ApplicationStage[] = allStages.map((s, i) => ({
      stage: s.stage,
      stageAr: s.stageAr,
      status: i < currentStageIndex ? 'COMPLETED' :
        i === currentStageIndex ? 'CURRENT' : 'PENDING',
      completedAt: i < currentStageIndex ? application.updatedAt : undefined,
    }));

    return {
      applicationId: application.id,
      status: application.status as ApplicationStatusType,
      statusAr: STATUS_AR[application.status as ApplicationStatusType] || application.status,
      currentStage: allStages[Math.max(0, currentStageIndex)]?.stage || 'Applied',
      currentStageAr: allStages[Math.max(0, currentStageIndex)]?.stageAr || 'تم التقديم',
      appliedAt: application.appliedAt,
      lastUpdated: application.updatedAt,
      stages,
    };
  }

  // --------------------------------------------------------------------------
  // Interview Scheduling
  // --------------------------------------------------------------------------

  /**
   * Schedule an interview for a candidate
   */
  static async scheduleInterview(
    data: z.infer<typeof interviewSlotSchema>
  ): Promise<InterviewSchedule> {
    const validated = interviewSlotSchema.parse(data);

    // Check for interviewer conflicts
    const conflicts = await this.checkInterviewerAvailability(
      validated.interviewerIds,
      validated.scheduledAt,
      validated.durationMinutes
    );

    if (conflicts.length > 0) {
      throw new Error(`Scheduling conflict: ${conflicts.join(', ')}`);
    }

    const interview = await prisma.interview.create({
      data: {
        tenantId: validated.tenantId,
        candidateId: validated.candidateId,
        jobPostingId: validated.jobPostingId,
        interviewType: validated.interviewType,
        scheduledAt: validated.scheduledAt,
        durationMinutes: validated.durationMinutes,
        location: validated.location,
        meetingLink: validated.meetingLink,
        notes: validated.notes,
        status: 'SCHEDULED',
        interviewerIds: validated.interviewerIds,
      },
    });

    // Update application status
    await prisma.jobApplication.updateMany({
      where: {
        candidateId: validated.candidateId,
        jobPostingId: validated.jobPostingId,
      },
      data: { status: 'INTERVIEW_SCHEDULED' },
    });

    return {
      id: interview.id,
      candidateName: '', // Would be populated from join
      jobTitle: '',
      interviewType: interview.interviewType,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      interviewers: [],
      location: interview.location || undefined,
      meetingLink: interview.meetingLink || undefined,
      status: interview.status as InterviewSchedule['status'],
    };
  }

  /**
   * Check interviewer availability
   */
  private static async checkInterviewerAvailability(
    interviewerIds: string[],
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<string[]> {
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

    const conflicts: string[] = [];

    for (const interviewerId of interviewerIds) {
      const existingInterview = await prisma.interview.findFirst({
        where: {
          interviewerIds: { has: interviewerId },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: { lt: endTime },
          AND: {
            scheduledAt: {
              gte: new Date(scheduledAt.getTime() - durationMinutes * 60 * 1000),
            },
          },
        },
      });

      if (existingInterview) {
        conflicts.push(`Interviewer ${interviewerId} has a conflict at ${existingInterview.scheduledAt.toISOString()}`);
      }
    }

    return conflicts;
  }

  // --------------------------------------------------------------------------
  // Offer Letter Generation
  // --------------------------------------------------------------------------

  /**
   * Generate offer letter data for a candidate
   */
  static async generateOfferData(
    tenantId: string,
    candidateId: string,
    jobPostingId: string,
    offerDetails: {
      salary: number;
      currency: string;
      startDate: Date;
      probationDays: number;
      benefits: string[];
      reportingTo: string;
      location: string;
      expiryDays?: number;
      specialTerms?: string[];
    }
  ): Promise<OfferLetterData> {
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });

    const job = await prisma.jobPosting.findFirst({
      where: { id: jobPostingId, tenantId },
    });

    if (!candidate || !job) {
      throw new Error('Candidate or job posting not found');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (offerDetails.expiryDays || 7));

    // Update application status
    await prisma.jobApplication.updateMany({
      where: { candidateId, jobPostingId, tenantId },
      data: { status: 'OFFER_EXTENDED' },
    });

    return {
      candidateId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      jobTitle: job.title,
      department: job.department || '',
      startDate: offerDetails.startDate,
      salary: offerDetails.salary,
      currency: offerDetails.currency,
      benefits: offerDetails.benefits,
      probationDays: offerDetails.probationDays,
      reportingTo: offerDetails.reportingTo,
      location: offerDetails.location,
      expiryDate,
      specialTerms: offerDetails.specialTerms,
    };
  }

  // --------------------------------------------------------------------------
  // Pipeline & Analytics
  // --------------------------------------------------------------------------

  /**
   * Get recruitment funnel analytics for a job
   */
  static async getRecruitmentFunnel(
    tenantId: string,
    jobPostingId: string
  ): Promise<RecruitmentFunnel> {
    const job = await prisma.jobPosting.findFirst({
      where: { id: jobPostingId, tenantId },
    });

    if (!job) throw new Error('Job posting not found');

    const applications = await prisma.jobApplication.findMany({
      where: { tenantId, jobPostingId },
    });

    const stages = [
      { stage: 'Applied', stageAr: 'تم التقديم', statuses: ['APPLIED'] },
      { stage: 'Screening', stageAr: 'المراجعة', statuses: ['SCREENING', 'SHORTLISTED'] },
      { stage: 'Interview', stageAr: 'المقابلة', statuses: ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'] },
      { stage: 'Assessment', stageAr: 'التقييم', statuses: ['ASSESSMENT'] },
      { stage: 'Offer', stageAr: 'العرض', statuses: ['OFFER_EXTENDED', 'OFFER_ACCEPTED', 'OFFER_DECLINED'] },
      { stage: 'Hired', stageAr: 'التوظيف', statuses: ['HIRED'] },
    ];

    const totalApps = applications.length;

    const funnelStages: FunnelStage[] = stages.map(s => {
      const count = applications.filter((a: any) =>
        s.statuses.includes(a.status) ||
        // Include all candidates that reached this stage or beyond
        stages.findIndex(st => st.statuses.includes(a.status)) >=
        stages.findIndex(st => st === s)
      ).length;

      return {
        stage: s.stage,
        stageAr: s.stageAr,
        count,
        percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
        avgDaysInStage: 0, // Would need stage transition timestamps
      };
    });

    const hiredCount = applications.filter((a: any) => a.status === 'HIRED').length;

    return {
      jobPostingId,
      jobTitle: job.title,
      stages: funnelStages,
      conversionRate: totalApps > 0 ? Math.round((hiredCount / totalApps) * 100) : 0,
    };
  }

  /**
   * Update application pipeline stage
   */
  static async updateApplicationStatus(
    tenantId: string,
    applicationId: string,
    newStatus: ApplicationStatusType,
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, tenantId },
    });

    if (!application) throw new Error('Application not found');

    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        statusNotes: notes,
        lastUpdatedBy: updatedBy,
      },
    });

    // Create status history entry
    await prisma.applicationStatusHistory.create({
      data: {
        tenantId,
        applicationId,
        fromStatus: application.status,
        toStatus: newStatus,
        changedBy: updatedBy,
        notes,
        changedAt: new Date(),
      },
    });
  }

  /**
   * Get all applications for a job posting
   */
  static async getJobApplications(
    tenantId: string,
    jobPostingId: string,
    filter?: {
      status?: string;
      source?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;

    const where: any = { tenantId, jobPostingId };
    if (filter?.status) where.status = filter.status;
    if (filter?.source) where.source = filter.source;

    const [total, applications] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        orderBy: { [filter?.sortBy || 'appliedAt']: filter?.sortOrder || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { candidate: true },
      }),
    ]);

    return {
      items: applications,
      total,
      page,
      pageSize: limit,
      hasNextPage: page * limit < total,
    };
  }
}

export default CareerPortalService;
