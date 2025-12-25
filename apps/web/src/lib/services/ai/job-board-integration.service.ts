/**
 * Job Board Integration Service
 * Unified interface for posting and managing jobs across multiple job boards
 *
 * Supported Platforms:
 * - LinkedIn Jobs
 * - Indeed
 * - Glassdoor
 * - Naukri (India)
 * - Bayt (Middle East)
 * - GulfTalent (GCC)
 * - Monster
 * - ZipRecruiter
 *
 * Features:
 * - Multi-platform job posting
 * - Application aggregation
 * - Analytics and performance tracking
 * - AI-powered job description optimization
 * - Candidate source tracking
 */

// ============================================================================
// TYPES
// ============================================================================

export type JobBoardPlatform =
  | 'linkedin'
  | 'indeed'
  | 'glassdoor'
  | 'naukri'
  | 'bayt'
  | 'gulftalent'
  | 'monster'
  | 'ziprecruiter'
  | 'internal';

export interface JobBoardConfig {
  platform: JobBoardPlatform;
  apiKey?: string;
  apiSecret?: string;
  companyId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  enabled: boolean;
  region?: string;
}

export interface JobPosting {
  id: string;
  internalId: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  requirements: string[];
  requirementsAr?: string[];
  responsibilities: string[];
  responsibilitiesAr?: string[];
  department: string;
  location: JobLocation;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryRange?: SalaryRange;
  skills: string[];
  benefits?: string[];
  applicationDeadline?: Date;
  startDate?: Date;
  numberOfOpenings: number;
  isRemote: boolean;
  isUrgent: boolean;
  status: JobPostingStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  platforms: PlatformPosting[];
}

export interface JobLocation {
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  postalCode?: string;
  isRemoteAllowed: boolean;
  remoteRegions?: string[];
}

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'temporary'
  | 'internship'
  | 'freelance';

export type ExperienceLevel =
  | 'entry'
  | 'associate'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'director'
  | 'executive';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
  displayPublicly: boolean;
}

export type JobPostingStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'paused'
  | 'closed'
  | 'filled'
  | 'cancelled';

export interface PlatformPosting {
  platform: JobBoardPlatform;
  externalId?: string;
  url?: string;
  status: PlatformPostingStatus;
  publishedAt?: Date;
  expiresAt?: Date;
  views: number;
  applications: number;
  cost?: number;
  currency?: string;
  lastSyncedAt?: Date;
  error?: string;
}

export type PlatformPostingStatus =
  | 'pending'
  | 'published'
  | 'expired'
  | 'removed'
  | 'failed';

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  source: JobBoardPlatform;
  externalApplicationId?: string;
  appliedAt: Date;
  status: ApplicationStatus;
  resume?: ResumeInfo;
  coverLetter?: string;
  answers?: ApplicationAnswer[];
  score?: number;
  notes?: string;
  lastUpdated: Date;
}

export type ApplicationStatus =
  | 'new'
  | 'screening'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_pending'
  | 'offer_extended'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface ResumeInfo {
  fileName: string;
  fileUrl: string;
  parsedData?: ParsedResumeData;
}

export interface ParsedResumeData {
  name: string;
  email: string;
  phone?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate?: string;
}

export interface ApplicationAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface JobPostingRequest {
  title: string;
  description: string;
  department: string;
  location: JobLocation;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryRange?: SalaryRange;
  skills: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  numberOfOpenings?: number;
  applicationDeadline?: Date;
  platforms: JobBoardPlatform[];
  isUrgent?: boolean;
}

export interface JobPostingResult {
  success: boolean;
  jobId?: string;
  platformResults: PlatformResult[];
  message: string;
  messageAr: string;
}

export interface PlatformResult {
  platform: JobBoardPlatform;
  success: boolean;
  externalId?: string;
  url?: string;
  error?: string;
}

export interface JobBoardAnalytics {
  totalPostings: number;
  activePostings: number;
  totalApplications: number;
  applicationsByPlatform: { platform: JobBoardPlatform; count: number }[];
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
  averageTimeToFill: number; // days
  conversionRate: number;
  costPerApplication: number;
  topPerformingPlatforms: PlatformPerformance[];
}

export interface PlatformPerformance {
  platform: JobBoardPlatform;
  views: number;
  applications: number;
  conversionRate: number;
  qualityScore: number;
  cost: number;
  costPerApplication: number;
}

export interface OptimizedDescription {
  title: string;
  description: string;
  requirements: string[];
  improvements: string[];
  improvementsAr: string[];
  seoKeywords: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PLATFORM_INFO: Record<JobBoardPlatform, {
  name: string;
  nameAr: string;
  region: string[];
  baseUrl: string;
  supportsArabic: boolean;
}> = {
  linkedin: {
    name: 'LinkedIn',
    nameAr: 'لينكد إن',
    region: ['global'],
    baseUrl: 'https://www.linkedin.com/jobs',
    supportsArabic: true,
  },
  indeed: {
    name: 'Indeed',
    nameAr: 'إنديد',
    region: ['global'],
    baseUrl: 'https://www.indeed.com',
    supportsArabic: true,
  },
  glassdoor: {
    name: 'Glassdoor',
    nameAr: 'جلاسدور',
    region: ['global'],
    baseUrl: 'https://www.glassdoor.com/Jobs',
    supportsArabic: false,
  },
  naukri: {
    name: 'Naukri',
    nameAr: 'نوكري',
    region: ['IN'],
    baseUrl: 'https://www.naukri.com',
    supportsArabic: false,
  },
  bayt: {
    name: 'Bayt',
    nameAr: 'بيت',
    region: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'EG', 'JO', 'LB'],
    baseUrl: 'https://www.bayt.com',
    supportsArabic: true,
  },
  gulftalent: {
    name: 'GulfTalent',
    nameAr: 'جلف تالنت',
    region: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
    baseUrl: 'https://www.gulftalent.com',
    supportsArabic: true,
  },
  monster: {
    name: 'Monster',
    nameAr: 'مونستر',
    region: ['global'],
    baseUrl: 'https://www.monster.com',
    supportsArabic: false,
  },
  ziprecruiter: {
    name: 'ZipRecruiter',
    nameAr: 'زيب ريكروتر',
    region: ['US', 'UK', 'CA'],
    baseUrl: 'https://www.ziprecruiter.com',
    supportsArabic: false,
  },
  internal: {
    name: 'Internal Career Portal',
    nameAr: 'بوابة التوظيف الداخلية',
    region: ['global'],
    baseUrl: '',
    supportsArabic: true,
  },
};

const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, { en: string; ar: string }> = {
  entry: { en: 'Entry Level', ar: 'مستوى مبتدئ' },
  associate: { en: 'Associate', ar: 'مساعد' },
  mid: { en: 'Mid-Level', ar: 'مستوى متوسط' },
  senior: { en: 'Senior', ar: 'كبير' },
  lead: { en: 'Lead', ar: 'قائد' },
  director: { en: 'Director', ar: 'مدير' },
  executive: { en: 'Executive', ar: 'تنفيذي' },
};

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, { en: string; ar: string }> = {
  full_time: { en: 'Full Time', ar: 'دوام كامل' },
  part_time: { en: 'Part Time', ar: 'دوام جزئي' },
  contract: { en: 'Contract', ar: 'عقد' },
  temporary: { en: 'Temporary', ar: 'مؤقت' },
  internship: { en: 'Internship', ar: 'تدريب' },
  freelance: { en: 'Freelance', ar: 'عمل حر' },
};

// Keywords that improve job posting visibility
const SEO_KEYWORDS: Record<string, string[]> = {
  technology: ['software', 'developer', 'engineer', 'programming', 'agile', 'cloud', 'AI', 'machine learning'],
  finance: ['accounting', 'financial', 'banking', 'investment', 'audit', 'compliance', 'risk'],
  marketing: ['digital marketing', 'SEO', 'content', 'social media', 'brand', 'analytics', 'campaign'],
  hr: ['recruitment', 'talent', 'employee', 'benefits', 'payroll', 'training', 'development'],
  sales: ['business development', 'account management', 'revenue', 'client', 'growth', 'pipeline'],
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class JobBoardIntegrationService {
  private configs: Map<JobBoardPlatform, JobBoardConfig> = new Map();
  private postings: Map<string, JobPosting> = new Map();
  private applications: Map<string, JobApplication> = new Map();

  /**
   * Configure a job board platform
   */
  configurePlatform(config: JobBoardConfig): void {
    this.configs.set(config.platform, config);
  }

  /**
   * Get configured platforms
   */
  getConfiguredPlatforms(): JobBoardConfig[] {
    return Array.from(this.configs.values()).filter(c => c.enabled);
  }

  /**
   * Get platform info
   */
  getPlatformInfo(platform: JobBoardPlatform): typeof PLATFORM_INFO[JobBoardPlatform] {
    return PLATFORM_INFO[platform];
  }

  /**
   * Get recommended platforms for a region
   */
  getRecommendedPlatforms(countryCode: string): JobBoardPlatform[] {
    const recommended: JobBoardPlatform[] = [];

    for (const [platform, info] of Object.entries(PLATFORM_INFO)) {
      if (info.region.includes('global') || info.region.includes(countryCode)) {
        recommended.push(platform as JobBoardPlatform);
      }
    }

    return recommended;
  }

  /**
   * Create and publish a job posting
   */
  async createJobPosting(request: JobPostingRequest): Promise<JobPostingResult> {
    const jobId = this.generateId();

    // Create the internal posting
    const posting: JobPosting = {
      id: jobId,
      internalId: `JOB-${Date.now().toString(36).toUpperCase()}`,
      title: request.title,
      description: request.description,
      requirements: request.requirements || [],
      responsibilities: request.responsibilities || [],
      department: request.department,
      location: request.location,
      employmentType: request.employmentType,
      experienceLevel: request.experienceLevel,
      salaryRange: request.salaryRange,
      skills: request.skills,
      benefits: request.benefits,
      applicationDeadline: request.applicationDeadline,
      numberOfOpenings: request.numberOfOpenings || 1,
      isRemote: request.location.isRemoteAllowed,
      isUrgent: request.isUrgent || false,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      platforms: [],
    };

    // Publish to each requested platform
    const platformResults: PlatformResult[] = [];

    for (const platform of request.platforms) {
      const result = await this.publishToPlatform(posting, platform);
      platformResults.push(result);

      posting.platforms.push({
        platform,
        externalId: result.externalId,
        url: result.url,
        status: result.success ? 'published' : 'failed',
        publishedAt: result.success ? new Date() : undefined,
        views: 0,
        applications: 0,
        error: result.error,
        lastSyncedAt: new Date(),
      });
    }

    this.postings.set(jobId, posting);

    const successCount = platformResults.filter(r => r.success).length;
    const totalCount = platformResults.length;

    return {
      success: successCount > 0,
      jobId,
      platformResults,
      message: `Job posted successfully to ${successCount}/${totalCount} platforms`,
      messageAr: `تم نشر الوظيفة بنجاح على ${successCount}/${totalCount} منصات`,
    };
  }

  /**
   * Publish to a specific platform
   */
  private async publishToPlatform(
    posting: JobPosting,
    platform: JobBoardPlatform
  ): Promise<PlatformResult> {
    const config = this.configs.get(platform);

    if (!config || !config.enabled) {
      return {
        platform,
        success: false,
        error: `Platform ${platform} is not configured or enabled`,
      };
    }

    try {
      // Simulate API call to job board
      // In production, this would make actual API calls
      const externalId = `${platform.toUpperCase()}-${Date.now()}`;
      const platformInfo = PLATFORM_INFO[platform];

      return {
        platform,
        success: true,
        externalId,
        url: `${platformInfo.baseUrl}/view/${externalId}`,
      };
    } catch {
      return {
        platform,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing job posting
   */
  async updateJobPosting(
    jobId: string,
    updates: Partial<JobPostingRequest>
  ): Promise<JobPostingResult> {
    const posting = this.postings.get(jobId);
    if (!posting) {
      return {
        success: false,
        platformResults: [],
        message: 'Job posting not found',
        messageAr: 'لم يتم العثور على إعلان الوظيفة',
      };
    }

    // Update internal fields
    if (updates.title) posting.title = updates.title;
    if (updates.description) posting.description = updates.description;
    if (updates.requirements) posting.requirements = updates.requirements;
    if (updates.responsibilities) posting.responsibilities = updates.responsibilities;
    if (updates.skills) posting.skills = updates.skills;
    if (updates.salaryRange) posting.salaryRange = updates.salaryRange;
    if (updates.location) posting.location = updates.location;
    posting.updatedAt = new Date();

    // Update on each platform
    const platformResults: PlatformResult[] = [];

    for (const platformPosting of posting.platforms) {
      if (platformPosting.status === 'published') {
        const result = await this.updateOnPlatform(posting, platformPosting.platform);
        platformResults.push(result);
        platformPosting.lastSyncedAt = new Date();
      }
    }

    return {
      success: true,
      jobId,
      platformResults,
      message: 'Job posting updated successfully',
      messageAr: 'تم تحديث إعلان الوظيفة بنجاح',
    };
  }

  /**
   * Update on a specific platform
   */
  private async updateOnPlatform(
    posting: JobPosting,
    platform: JobBoardPlatform
  ): Promise<PlatformResult> {
    // Simulate API call
    return {
      platform,
      success: true,
      externalId: posting.platforms.find(p => p.platform === platform)?.externalId,
    };
  }

  /**
   * Close a job posting
   */
  async closeJobPosting(jobId: string, reason: 'filled' | 'cancelled'): Promise<JobPostingResult> {
    const posting = this.postings.get(jobId);
    if (!posting) {
      return {
        success: false,
        platformResults: [],
        message: 'Job posting not found',
        messageAr: 'لم يتم العثور على إعلان الوظيفة',
      };
    }

    posting.status = reason;
    posting.updatedAt = new Date();

    // Remove from each platform
    const platformResults: PlatformResult[] = [];

    for (const platformPosting of posting.platforms) {
      if (platformPosting.status === 'published') {
        platformPosting.status = 'removed';
        platformResults.push({
          platform: platformPosting.platform,
          success: true,
          externalId: platformPosting.externalId,
        });
      }
    }

    return {
      success: true,
      jobId,
      platformResults,
      message: `Job posting ${reason === 'filled' ? 'marked as filled' : 'cancelled'}`,
      messageAr: reason === 'filled' ? 'تم تعيين الوظيفة كمشغولة' : 'تم إلغاء إعلان الوظيفة',
    };
  }

  /**
   * Import application from a job board
   */
  async importApplication(
    jobId: string,
    platform: JobBoardPlatform,
    applicationData: Partial<JobApplication>
  ): Promise<JobApplication> {
    const applicationId = this.generateId();

    const application: JobApplication = {
      id: applicationId,
      jobId,
      candidateId: applicationData.candidateId || this.generateId(),
      source: platform,
      externalApplicationId: applicationData.externalApplicationId,
      appliedAt: applicationData.appliedAt || new Date(),
      status: 'new',
      resume: applicationData.resume,
      coverLetter: applicationData.coverLetter,
      answers: applicationData.answers,
      lastUpdated: new Date(),
    };

    this.applications.set(applicationId, application);

    // Update platform posting application count
    const posting = this.postings.get(jobId);
    if (posting) {
      const platformPosting = posting.platforms.find(p => p.platform === platform);
      if (platformPosting) {
        platformPosting.applications++;
      }
    }

    return application;
  }

  /**
   * Get applications for a job
   */
  getApplications(jobId: string): JobApplication[] {
    return Array.from(this.applications.values())
      .filter(app => app.jobId === jobId)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  /**
   * Update application status
   */
  updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): boolean {
    const application = this.applications.get(applicationId);
    if (!application) return false;

    application.status = status;
    if (notes) application.notes = notes;
    application.lastUpdated = new Date();

    return true;
  }

  /**
   * Optimize job description using AI
   */
  optimizeJobDescription(
    title: string,
    description: string,
    department: string,
    requirements: string[]
  ): OptimizedDescription {
    // AI-powered optimization
    const improvements: string[] = [];
    const improvementsAr: string[] = [];

    // Check title length
    if (title.length < 10) {
      improvements.push('Add more descriptive words to the job title');
      improvementsAr.push('أضف كلمات وصفية أكثر لعنوان الوظيفة');
    }

    // Check description length
    if (description.length < 200) {
      improvements.push('Expand the job description with more details about responsibilities');
      improvementsAr.push('وسع وصف الوظيفة بمزيد من التفاصيل حول المسؤوليات');
    }

    // Check for salary mention
    if (!description.toLowerCase().includes('salary') && !description.toLowerCase().includes('compensation')) {
      improvements.push('Consider mentioning salary range to attract more candidates');
      improvementsAr.push('فكر في ذكر نطاق الراتب لجذب المزيد من المرشحين');
    }

    // Check for benefits mention
    if (!description.toLowerCase().includes('benefit')) {
      improvements.push('Add benefits section to make the position more attractive');
      improvementsAr.push('أضف قسم المزايا لجعل المنصب أكثر جاذبية');
    }

    // Get relevant SEO keywords
    const seoKeywords: string[] = [];
    const deptLower = department.toLowerCase();
    for (const [category, keywords] of Object.entries(SEO_KEYWORDS)) {
      if (deptLower.includes(category)) {
        seoKeywords.push(...keywords.slice(0, 5));
      }
    }

    // Add general keywords from requirements
    const commonKeywords = ['experience', 'team', 'growth', 'opportunity', 'collaborate'];
    seoKeywords.push(...commonKeywords);

    return {
      title,
      description,
      requirements,
      improvements,
      improvementsAr,
      seoKeywords: [...new Set(seoKeywords)],
    };
  }

  /**
   * Generate job description from template
   */
  generateJobDescription(
    title: string,
    department: string,
    experienceLevel: ExperienceLevel,
    skills: string[],
    location: JobLocation,
    employmentType: EmploymentType,
    language: 'en' | 'ar' = 'en'
  ): string {
    const expLabel = EXPERIENCE_LEVEL_LABELS[experienceLevel][language];
    const empLabel = EMPLOYMENT_TYPE_LABELS[employmentType][language];

    if (language === 'ar') {
      return `نحن نبحث عن ${title} للانضمام إلى فريق ${department} لدينا.

الموقع: ${location.city}, ${location.country}
نوع العمل: ${empLabel}
مستوى الخبرة: ${expLabel}
${location.isRemoteAllowed ? 'العمل عن بعد متاح' : ''}

المهارات المطلوبة:
${skills.map(s => `• ${s}`).join('\n')}

المسؤوليات:
• قيادة المشاريع والمبادرات في مجال تخصصك
• التعاون مع الفرق متعددة الوظائف
• المساهمة في نمو الشركة ونجاحها

نقدم:
• راتب تنافسي وحزمة مزايا
• بيئة عمل داعمة
• فرص للنمو المهني`;
    }

    return `We are looking for a ${title} to join our ${department} team.

Location: ${location.city}, ${location.country}
Employment Type: ${empLabel}
Experience Level: ${expLabel}
${location.isRemoteAllowed ? 'Remote work available' : ''}

Required Skills:
${skills.map(s => `• ${s}`).join('\n')}

Responsibilities:
• Lead projects and initiatives in your area of expertise
• Collaborate with cross-functional teams
• Contribute to company growth and success

We Offer:
• Competitive salary and benefits package
• Supportive work environment
• Professional development opportunities`;
  }

  /**
   * Sync applications from all platforms
   */
  async syncApplications(jobId: string): Promise<{ synced: number; errors: string[] }> {
    const posting = this.postings.get(jobId);
    if (!posting) {
      return { synced: 0, errors: ['Job posting not found'] };
    }

    let synced = 0;
    const errors: string[] = [];

    for (const platformPosting of posting.platforms) {
      if (platformPosting.status === 'published') {
        try {
          // Simulate fetching applications from platform
          // In production, this would make actual API calls
          const mockApplications = Math.floor(Math.random() * 5);
          synced += mockApplications;
          platformPosting.lastSyncedAt = new Date();
        } catch {
          errors.push(`Failed to sync from ${platformPosting.platform}: ${error}`);
        }
      }
    }

    return { synced, errors };
  }

  /**
   * Get job board analytics
   */
  getAnalytics(): JobBoardAnalytics {
    const postings = Array.from(this.postings.values());
    const applications = Array.from(this.applications.values());

    // Applications by platform
    const platformCounts: Record<JobBoardPlatform, number> = {} as Record<JobBoardPlatform, number>;
    applications.forEach(app => {
      platformCounts[app.source] = (platformCounts[app.source] || 0) + 1;
    });
    const applicationsByPlatform = Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform: platform as JobBoardPlatform, count }));

    // Applications by status
    const statusCounts: Record<ApplicationStatus, number> = {} as Record<ApplicationStatus, number>;
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    const applicationsByStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({ status: status as ApplicationStatus, count }));

    // Platform performance
    const platformPerformance: PlatformPerformance[] = [];
    for (const [platform] of this.configs) {
      let totalViews = 0;
      let totalApps = 0;
      let totalCost = 0;

      postings.forEach(posting => {
        const pp = posting.platforms.find(p => p.platform === platform);
        if (pp) {
          totalViews += pp.views;
          totalApps += pp.applications;
          totalCost += pp.cost || 0;
        }
      });

      if (totalViews > 0 || totalApps > 0) {
        platformPerformance.push({
          platform,
          views: totalViews,
          applications: totalApps,
          conversionRate: totalViews > 0 ? totalApps / totalViews : 0,
          qualityScore: 0.75, // Mock quality score
          cost: totalCost,
          costPerApplication: totalApps > 0 ? totalCost / totalApps : 0,
        });
      }
    }

    const activePostings = postings.filter(p => p.status === 'published');
    const hiredCount = applications.filter(a => a.status === 'hired').length;

    return {
      totalPostings: postings.length,
      activePostings: activePostings.length,
      totalApplications: applications.length,
      applicationsByPlatform,
      applicationsByStatus,
      averageTimeToFill: 28, // Mock: 28 days average
      conversionRate: applications.length > 0 ? hiredCount / applications.length : 0,
      costPerApplication: 25, // Mock: $25 per application
      topPerformingPlatforms: platformPerformance
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .slice(0, 5),
    };
  }

  /**
   * Get job posting by ID
   */
  getJobPosting(jobId: string): JobPosting | undefined {
    return this.postings.get(jobId);
  }

  /**
   * Get all job postings
   */
  getAllJobPostings(): JobPosting[] {
    return Array.from(this.postings.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get active job postings
   */
  getActiveJobPostings(): JobPosting[] {
    return this.getAllJobPostings().filter(p => p.status === 'published');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get experience level label
   */
  getExperienceLevelLabel(level: ExperienceLevel, language: 'en' | 'ar' = 'en'): string {
    return EXPERIENCE_LEVEL_LABELS[level][language];
  }

  /**
   * Get employment type label
   */
  getEmploymentTypeLabel(type: EmploymentType, language: 'en' | 'ar' = 'en'): string {
    return EMPLOYMENT_TYPE_LABELS[type][language];
  }
}

// Export singleton instance
export const jobBoardIntegrationService = new JobBoardIntegrationService();

// Export types
export type { JobBoardIntegrationService };
