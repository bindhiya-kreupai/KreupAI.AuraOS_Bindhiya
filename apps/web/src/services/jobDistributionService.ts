/**
 * @module jobDistributionService
 * @description Job Distribution Service — multi-board posting, source analytics,
 *              employee referral programs, cost-per-hire tracking (Sec 20.3)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type BoardStatus = 'connected' | 'disconnected' | 'pending' | 'error';
export type PostingStatus = 'active' | 'pending' | 'failed' | 'expired' | 'paused';
export type ReferralStatus =
  | 'submitted'
  | 'screening'
  | 'interviewing'
  | 'hired'
  | 'rejected'
  | 'withdrawn';
export type RewardStatus = 'pending' | 'approved' | 'paid' | 'forfeited';

export interface JobBoard {
  id: string;
  name: string;
  logo: string;
  region: string[];
  status: BoardStatus;
  isInternal: boolean;
  monthlyCost: number;
  currency: string;
  activePostings: number;
  totalApplications: number;
  avgTimeToFill: number; // days
  contractExpiry?: string;
  features: string[];
}

export interface BoardPosting {
  boardId: string;
  boardName: string;
  status: PostingStatus;
  postedDate?: string;
  expiryDate?: string;
  views: number;
  applications: number;
  clicks: number;
  costPerClick: number;
  error?: string;
}

export interface DistributionStatus {
  jobId: string;
  jobTitle: string;
  postings: BoardPosting[];
  totalApplications: number;
  lastUpdated: string;
}

export interface ApplicationSource {
  sourceId: string;
  sourceName: string;
  boardId?: string;
  applications: number;
  screeningPassed: number;
  interviewed: number;
  offered: number;
  hired: number;
  conversionRate: number;
  costPerHire: number;
  avgTimeToHire: number; // days
  qualityScore: number; // 1-10
}

export interface SourceEffectiveness {
  period: string;
  sources: ApplicationSource[];
  totalApplications: number;
  totalHires: number;
  avgCostPerHire: number;
  bestSource: string;
  mostCostEffective: string;
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  bonusAmount: number;
  currency: string;
  bonusTrigger: 'hire' | 'probation_complete' | '6_months' | '1_year';
  eligibleRoles: string[];
  maxReferralsPerEmployee: number;
  totalReferrals: number;
  totalHires: number;
  totalPaid: number;
  createdAt: string;
}

export interface Referral {
  id: string;
  programId: string;
  referrerId: string;
  referrerName: string;
  referrerDepartment: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobId: string;
  jobTitle: string;
  status: ReferralStatus;
  submittedDate: string;
  hireDate?: string;
  rewardStatus?: RewardStatus;
  rewardAmount?: number;
  notes?: string;
}

export interface ReferralReward {
  referralId: string;
  candidateName: string;
  referrerId: string;
  referrerName: string;
  amount: number;
  currency: string;
  status: RewardStatus;
  earnedDate: string;
  paidDate?: string;
  transactionId?: string;
}

export interface PublishRequest {
  jobId: string;
  boardIds: string[];
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface PublishResult {
  jobId: string;
  results: Array<{
    boardId: string;
    boardName: string;
    success: boolean;
    postingId?: string;
    error?: string;
  }>;
  publishedAt: string;
}

export interface ReferralSubmission {
  programId: string;
  referrerId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobId: string;
  notes?: string;
}

export interface ReferralProgramData {
  name: string;
  description: string;
  bonusAmount: number;
  currency: string;
  bonusTrigger: ReferralProgram['bonusTrigger'];
  eligibleRoles: string[];
  maxReferralsPerEmployee: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_JOB_BOARDS: JobBoard[] = [
  {
    id: 'board-linkedin',
    name: 'LinkedIn',
    logo: '🔵',
    region: ['Global'],
    status: 'connected',
    isInternal: false,
    monthlyCost: 1500,
    currency: 'USD',
    activePostings: 12,
    totalApplications: 847,
    avgTimeToFill: 28,
    contractExpiry: '2026-12-31',
    features: ['AI matching', 'InMail', 'Analytics', 'Sponsored jobs'],
  },
  {
    id: 'board-indeed',
    name: 'Indeed',
    logo: '🟦',
    region: ['Global'],
    status: 'connected',
    isInternal: false,
    monthlyCost: 800,
    currency: 'USD',
    activePostings: 15,
    totalApplications: 1123,
    avgTimeToFill: 22,
    contractExpiry: '2026-06-30',
    features: ['Resume database', 'Sponsored', 'Analytics'],
  },
  {
    id: 'board-glassdoor',
    name: 'Glassdoor',
    logo: '🟩',
    region: ['US', 'UK', 'Canada', 'Australia'],
    status: 'connected',
    isInternal: false,
    monthlyCost: 600,
    currency: 'USD',
    activePostings: 8,
    totalApplications: 342,
    avgTimeToFill: 35,
    contractExpiry: '2026-09-30',
    features: ['Company reviews', 'Salary insights', 'Brand pages'],
  },
  {
    id: 'board-naukri',
    name: 'Naukri',
    logo: '🟠',
    region: ['India'],
    status: 'connected',
    isInternal: false,
    monthlyCost: 400,
    currency: 'USD',
    activePostings: 6,
    totalApplications: 512,
    avgTimeToFill: 18,
    contractExpiry: '2027-03-31',
    features: ['Resume database', 'Resdex', 'Recruiter tools'],
  },
  {
    id: 'board-bayt',
    name: 'Bayt',
    logo: '🟡',
    region: ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
    status: 'connected',
    isInternal: false,
    monthlyCost: 350,
    currency: 'USD',
    activePostings: 4,
    totalApplications: 198,
    avgTimeToFill: 30,
    contractExpiry: '2026-08-31',
    features: ['MENA focus', 'Arabic language', 'Assessment tools'],
  },
  {
    id: 'board-monster',
    name: 'Monster',
    logo: '🟣',
    region: ['US', 'Europe'],
    status: 'disconnected',
    isInternal: false,
    monthlyCost: 500,
    currency: 'USD',
    activePostings: 0,
    totalApplications: 0,
    avgTimeToFill: 32,
    features: ['Resume database', 'AI matching'],
  },
  {
    id: 'board-ziprecruiter',
    name: 'ZipRecruiter',
    logo: '🔴',
    region: ['US', 'UK', 'Canada'],
    status: 'pending',
    isInternal: false,
    monthlyCost: 700,
    currency: 'USD',
    activePostings: 0,
    totalApplications: 0,
    avgTimeToFill: 20,
    features: ['AI invitations', 'Mobile app', 'ATS integrations'],
  },
  {
    id: 'board-internal',
    name: 'Internal Career Site',
    logo: '🏢',
    region: ['Global'],
    status: 'connected',
    isInternal: true,
    monthlyCost: 0,
    currency: 'USD',
    activePostings: 18,
    totalApplications: 267,
    avgTimeToFill: 15,
    features: ['Internal mobility', 'Employee referral', 'Custom branding'],
  },
];

const MOCK_DISTRIBUTION_STATUS: DistributionStatus[] = [
  {
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    postings: [
      {
        boardId: 'board-linkedin',
        boardName: 'LinkedIn',
        status: 'active',
        postedDate: '2026-02-01',
        expiryDate: '2026-03-01',
        views: 1248,
        applications: 87,
        clicks: 342,
        costPerClick: 2.4,
      },
      {
        boardId: 'board-indeed',
        boardName: 'Indeed',
        status: 'active',
        postedDate: '2026-02-01',
        expiryDate: '2026-03-01',
        views: 892,
        applications: 64,
        clicks: 215,
        costPerClick: 1.8,
      },
      {
        boardId: 'board-internal',
        boardName: 'Internal',
        status: 'active',
        postedDate: '2026-02-01',
        views: 124,
        applications: 12,
        clicks: 78,
        costPerClick: 0,
      },
    ],
    totalApplications: 163,
    lastUpdated: '2026-02-24T10:30:00Z',
  },
  {
    jobId: 'job-002',
    jobTitle: 'Product Manager',
    postings: [
      {
        boardId: 'board-linkedin',
        boardName: 'LinkedIn',
        status: 'active',
        postedDate: '2026-02-05',
        expiryDate: '2026-03-05',
        views: 654,
        applications: 43,
        clicks: 187,
        costPerClick: 2.6,
      },
      {
        boardId: 'board-glassdoor',
        boardName: 'Glassdoor',
        status: 'active',
        postedDate: '2026-02-05',
        expiryDate: '2026-03-05',
        views: 321,
        applications: 28,
        clicks: 98,
        costPerClick: 2.1,
      },
    ],
    totalApplications: 71,
    lastUpdated: '2026-02-24T09:15:00Z',
  },
];

const MOCK_SOURCE_EFFECTIVENESS: SourceEffectiveness = {
  period: 'Q1 2026',
  sources: [
    {
      sourceId: 'src-linkedin',
      sourceName: 'LinkedIn',
      boardId: 'board-linkedin',
      applications: 847,
      screeningPassed: 423,
      interviewed: 189,
      offered: 42,
      hired: 34,
      conversionRate: 4.0,
      costPerHire: 3421,
      avgTimeToHire: 28,
      qualityScore: 8.2,
    },
    {
      sourceId: 'src-indeed',
      sourceName: 'Indeed',
      boardId: 'board-indeed',
      applications: 1123,
      screeningPassed: 512,
      interviewed: 198,
      offered: 45,
      hired: 38,
      conversionRate: 3.4,
      costPerHire: 1842,
      avgTimeToHire: 22,
      qualityScore: 7.1,
    },
    {
      sourceId: 'src-referral',
      sourceName: 'Employee Referral',
      applications: 234,
      screeningPassed: 187,
      interviewed: 142,
      offered: 58,
      hired: 52,
      conversionRate: 22.2,
      costPerHire: 1200,
      avgTimeToHire: 15,
      qualityScore: 9.1,
    },
    {
      sourceId: 'src-glassdoor',
      sourceName: 'Glassdoor',
      boardId: 'board-glassdoor',
      applications: 342,
      screeningPassed: 178,
      interviewed: 67,
      offered: 18,
      hired: 14,
      conversionRate: 4.1,
      costPerHire: 3214,
      avgTimeToHire: 35,
      qualityScore: 7.8,
    },
    {
      sourceId: 'src-naukri',
      sourceName: 'Naukri',
      boardId: 'board-naukri',
      applications: 512,
      screeningPassed: 214,
      interviewed: 89,
      offered: 22,
      hired: 19,
      conversionRate: 3.7,
      costPerHire: 1421,
      avgTimeToHire: 18,
      qualityScore: 7.4,
    },
    {
      sourceId: 'src-bayt',
      sourceName: 'Bayt',
      boardId: 'board-bayt',
      applications: 198,
      screeningPassed: 87,
      interviewed: 42,
      offered: 12,
      hired: 10,
      conversionRate: 5.1,
      costPerHire: 2100,
      avgTimeToHire: 30,
      qualityScore: 7.9,
    },
    {
      sourceId: 'src-internal',
      sourceName: 'Internal Career Site',
      boardId: 'board-internal',
      applications: 267,
      screeningPassed: 224,
      interviewed: 178,
      offered: 64,
      hired: 58,
      conversionRate: 21.7,
      costPerHire: 400,
      avgTimeToHire: 15,
      qualityScore: 8.8,
    },
    {
      sourceId: 'src-agency',
      sourceName: 'Recruitment Agency',
      applications: 89,
      screeningPassed: 72,
      interviewed: 48,
      offered: 16,
      hired: 13,
      conversionRate: 14.6,
      costPerHire: 8200,
      avgTimeToHire: 38,
      qualityScore: 8.0,
    },
  ],
  totalApplications: 3612,
  totalHires: 238,
  avgCostPerHire: 2974,
  bestSource: 'Employee Referral',
  mostCostEffective: 'Internal Career Site',
};

const MOCK_REFERRAL_PROGRAMS: ReferralProgram[] = [
  {
    id: 'prog-001',
    name: 'Standard Referral Program',
    description:
      'Refer qualified candidates and earn a bonus when they are successfully hired and complete probation.',
    isActive: true,
    bonusAmount: 2000,
    currency: 'USD',
    bonusTrigger: 'probation_complete',
    eligibleRoles: ['All'],
    maxReferralsPerEmployee: 5,
    totalReferrals: 234,
    totalHires: 52,
    totalPaid: 84000,
    createdAt: '2024-01-01',
  },
  {
    id: 'prog-002',
    name: 'Tech Talent Bonus',
    description:
      'Extra bonus for referring engineers, data scientists, and product managers to hard-to-fill roles.',
    isActive: true,
    bonusAmount: 5000,
    currency: 'USD',
    bonusTrigger: '6_months',
    eligibleRoles: ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer'],
    maxReferralsPerEmployee: 3,
    totalReferrals: 67,
    totalHires: 18,
    totalPaid: 72000,
    createdAt: '2024-06-01',
  },
];

const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref-001',
    programId: 'prog-001',
    referrerId: 'emp-001',
    referrerName: 'Sarah Chen',
    referrerDepartment: 'Engineering',
    candidateName: 'Michael Torres',
    candidateEmail: 'michael.torres@email.com',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    status: 'hired',
    submittedDate: '2026-01-10',
    hireDate: '2026-02-01',
    rewardStatus: 'approved',
    rewardAmount: 2000,
  },
  {
    id: 'ref-002',
    programId: 'prog-002',
    referrerId: 'emp-002',
    referrerName: 'James Liu',
    referrerDepartment: 'Product',
    candidateName: 'Priya Patel',
    candidateEmail: 'priya.patel@email.com',
    jobId: 'job-003',
    jobTitle: 'Data Scientist',
    status: 'interviewing',
    submittedDate: '2026-01-20',
    rewardStatus: 'pending',
    rewardAmount: 5000,
  },
  {
    id: 'ref-003',
    programId: 'prog-001',
    referrerId: 'emp-003',
    referrerName: 'Anna Schmidt',
    referrerDepartment: 'Sales',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@email.com',
    jobId: 'job-005',
    jobTitle: 'Sales Manager',
    status: 'screening',
    submittedDate: '2026-01-25',
  },
  {
    id: 'ref-004',
    programId: 'prog-001',
    referrerId: 'emp-001',
    referrerName: 'Sarah Chen',
    referrerDepartment: 'Engineering',
    candidateName: 'Lisa Wang',
    candidateEmail: 'lisa.wang@email.com',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    status: 'hired',
    submittedDate: '2025-11-15',
    hireDate: '2025-12-10',
    rewardStatus: 'paid',
    rewardAmount: 2000,
  },
  {
    id: 'ref-005',
    programId: 'prog-002',
    referrerId: 'emp-004',
    referrerName: 'Carlos Mendez',
    referrerDepartment: 'Data',
    candidateName: 'Aisha Johnson',
    candidateEmail: 'aisha.j@email.com',
    jobId: 'job-003',
    jobTitle: 'Data Scientist',
    status: 'rejected',
    submittedDate: '2025-12-01',
  },
  {
    id: 'ref-006',
    programId: 'prog-001',
    referrerId: 'emp-005',
    referrerName: 'Emily Park',
    referrerDepartment: 'HR',
    candidateName: 'Robert Brown',
    candidateEmail: 'r.brown@email.com',
    jobId: 'job-007',
    jobTitle: 'HR Business Partner',
    status: 'hired',
    submittedDate: '2025-10-20',
    hireDate: '2025-11-15',
    rewardStatus: 'paid',
    rewardAmount: 2000,
  },
  {
    id: 'ref-007',
    programId: 'prog-001',
    referrerId: 'emp-002',
    referrerName: 'James Liu',
    referrerDepartment: 'Product',
    candidateName: 'Nakamura Yuki',
    candidateEmail: 'n.yuki@email.com',
    jobId: 'job-002',
    jobTitle: 'Product Manager',
    status: 'submitted',
    submittedDate: '2026-02-10',
  },
  {
    id: 'ref-008',
    programId: 'prog-002',
    referrerId: 'emp-006',
    referrerName: 'Tom Baker',
    referrerDepartment: 'Engineering',
    candidateName: 'Maria Gonzalez',
    candidateEmail: 'maria.g@email.com',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    status: 'interviewing',
    submittedDate: '2026-02-05',
  },
  {
    id: 'ref-009',
    programId: 'prog-001',
    referrerId: 'emp-007',
    referrerName: 'Nina Okonkwo',
    referrerDepartment: 'Finance',
    candidateName: 'Jake Wilson',
    candidateEmail: 'jake.w@email.com',
    jobId: 'job-008',
    jobTitle: 'Financial Analyst',
    status: 'screening',
    submittedDate: '2026-02-12',
  },
  {
    id: 'ref-010',
    programId: 'prog-002',
    referrerId: 'emp-003',
    referrerName: 'Anna Schmidt',
    referrerDepartment: 'Sales',
    candidateName: 'Alex Chen',
    candidateEmail: 'alex.chen@email.com',
    jobId: 'job-003',
    jobTitle: 'Data Scientist',
    status: 'hired',
    submittedDate: '2025-12-10',
    hireDate: '2026-01-15',
    rewardStatus: 'approved',
    rewardAmount: 5000,
  },
];

const MOCK_REFERRAL_REWARDS: ReferralReward[] = [
  {
    referralId: 'ref-001',
    candidateName: 'Michael Torres',
    referrerId: 'emp-001',
    referrerName: 'Sarah Chen',
    amount: 2000,
    currency: 'USD',
    status: 'approved',
    earnedDate: '2026-02-01',
  },
  {
    referralId: 'ref-004',
    candidateName: 'Lisa Wang',
    referrerId: 'emp-001',
    referrerName: 'Sarah Chen',
    amount: 2000,
    currency: 'USD',
    status: 'paid',
    earnedDate: '2026-01-10',
    paidDate: '2026-01-15',
    transactionId: 'TXN-2026-001',
  },
  {
    referralId: 'ref-006',
    candidateName: 'Robert Brown',
    referrerId: 'emp-005',
    referrerName: 'Emily Park',
    amount: 2000,
    currency: 'USD',
    status: 'paid',
    earnedDate: '2025-12-15',
    paidDate: '2025-12-20',
    transactionId: 'TXN-2025-098',
  },
  {
    referralId: 'ref-010',
    candidateName: 'Alex Chen',
    referrerId: 'emp-003',
    referrerName: 'Anna Schmidt',
    amount: 5000,
    currency: 'USD',
    status: 'approved',
    earnedDate: '2026-02-15',
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class JobDistributionService {
  /** Get all available job boards with connection status */
  static async getJobBoards(): Promise<JobBoard[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_JOB_BOARDS];
  }

  /** Publish a job to multiple boards */
  static async publishToBoards(request: PublishRequest): Promise<PublishResult> {
    await new Promise((r) => setTimeout(r, 600));
    const results = request.boardIds.map((boardId) => {
      const board = MOCK_JOB_BOARDS.find((b) => b.id === boardId);
      const success = board?.status === 'connected';
      return {
        boardId,
        boardName: board?.name ?? boardId,
        success,
        postingId: success ? `post-${Date.now()}-${boardId}` : undefined,
        error: !success
          ? board?.status === 'disconnected'
            ? 'Board not connected'
            : 'Connection pending'
          : undefined,
      };
    });
    return {
      jobId: request.jobId,
      results,
      publishedAt: new Date().toISOString(),
    };
  }

  /** Get distribution status for a specific job */
  static async getDistributionStatus(jobId: string): Promise<DistributionStatus | null> {
    await new Promise((r) => setTimeout(r, 250));
    return MOCK_DISTRIBUTION_STATUS.find((d) => d.jobId === jobId) ?? null;
  }

  /** Get application sources for a job */
  static async getApplicationSources(_jobId: string): Promise<ApplicationSource[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_SOURCE_EFFECTIVENESS.sources.slice(0, 5);
  }

  /** Get source effectiveness metrics */
  static async getSourceEffectiveness(): Promise<SourceEffectiveness> {
    await new Promise((r) => setTimeout(r, 350));
    return { ...MOCK_SOURCE_EFFECTIVENESS };
  }

  /** Create a referral program */
  static async createReferralProgram(data: ReferralProgramData): Promise<ReferralProgram> {
    await new Promise((r) => setTimeout(r, 400));
    const program: ReferralProgram = {
      id: `prog-${Date.now()}`,
      ...data,
      isActive: true,
      totalReferrals: 0,
      totalHires: 0,
      totalPaid: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return program;
  }

  /** Submit an employee referral */
  static async submitReferral(data: ReferralSubmission): Promise<Referral> {
    await new Promise((r) => setTimeout(r, 400));
    const referral: Referral = {
      id: `ref-${Date.now()}`,
      ...data,
      status: 'submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      jobTitle: 'Target Role',
    };
    return referral;
  }

  /** Get referrals with optional filters */
  static async getReferrals(filters?: {
    status?: ReferralStatus;
    referrerId?: string;
    jobId?: string;
    programId?: string;
  }): Promise<Referral[]> {
    await new Promise((r) => setTimeout(r, 300));
    let result = [...MOCK_REFERRALS];
    if (filters?.status) result = result.filter((r) => r.status === filters.status);
    if (filters?.referrerId) result = result.filter((r) => r.referrerId === filters.referrerId);
    if (filters?.jobId) result = result.filter((r) => r.jobId === filters.jobId);
    if (filters?.programId) result = result.filter((r) => r.programId === filters.programId);
    return result;
  }

  /** Get referral reward tracking */
  static async getReferralRewards(): Promise<ReferralReward[]> {
    await new Promise((r) => setTimeout(r, 250));
    return [...MOCK_REFERRAL_REWARDS];
  }

  /** Get all referral programs */
  static async getReferralPrograms(): Promise<ReferralProgram[]> {
    await new Promise((r) => setTimeout(r, 250));
    return [...MOCK_REFERRAL_PROGRAMS];
  }
}
