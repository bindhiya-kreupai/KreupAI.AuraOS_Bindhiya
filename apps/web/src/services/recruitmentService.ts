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

const MOCK_JOB_POSTINGS: JobPosting[] = [
  {
    id: 'job-001',
    jobCode: 'ENG-2026-001',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'San Francisco',
    locationId: 'loc-001',
    employmentType: 'full_time',
    experienceMin: 4,
    experienceMax: 8,
    salaryMin: 130000,
    salaryMax: 180000,
    currency: 'USD',
    description:
      'We are looking for an experienced frontend engineer to join our growing product team.',
    requirements: ['5+ years React', 'TypeScript', 'Next.js', 'GraphQL', 'CI/CD'],
    benefits: ['Equity package', 'Full health coverage', 'Remote-friendly', '401k match'],
    skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Testing'],
    status: 'active',
    hiringManagerId: 'emp-011',
    hiringManagerName: 'Karen White',
    recruiterId: 'rec-001',
    recruiterName: 'Amy Johnson',
    applicantCount: 47,
    openPositions: 2,
    postedDate: '2026-01-15',
    closingDate: '2026-03-31',
    isRemote: true,
  },
  {
    id: 'job-002',
    jobCode: 'SLS-2026-001',
    title: 'Enterprise Account Executive',
    department: 'Sales & Marketing',
    departmentId: 'dept-002',
    location: 'New York',
    locationId: 'loc-002',
    employmentType: 'full_time',
    experienceMin: 3,
    experienceMax: 7,
    salaryMin: 90000,
    salaryMax: 120000,
    currency: 'USD',
    description:
      'Drive enterprise sales growth by managing complex sales cycles with Fortune 500 companies.',
    requirements: [
      '3+ years B2B enterprise sales',
      'Salesforce CRM',
      'Consultative selling',
      'Track record $1M+ deals',
    ],
    benefits: ['Uncapped commission', 'Company car allowance', 'Health insurance', 'Stock options'],
    skills: ['Enterprise Sales', 'Salesforce', 'Negotiation', 'Prospecting'],
    status: 'active',
    hiringManagerId: 'emp-012',
    hiringManagerName: 'Robert Chen',
    recruiterId: 'rec-001',
    recruiterName: 'Amy Johnson',
    applicantCount: 32,
    openPositions: 1,
    postedDate: '2026-01-20',
    closingDate: '2026-03-15',
    isRemote: false,
  },
  {
    id: 'job-003',
    jobCode: 'HR-2026-001',
    title: 'HR Business Partner',
    department: 'Human Resources',
    departmentId: 'dept-003',
    location: 'San Francisco',
    locationId: 'loc-001',
    employmentType: 'full_time',
    experienceMin: 3,
    experienceMax: 6,
    salaryMin: 80000,
    salaryMax: 105000,
    currency: 'USD',
    description:
      'Partner with business leaders to drive people initiatives and organisational effectiveness.',
    requirements: [
      'HRBP experience',
      'Employment law knowledge',
      'Change management',
      'SHRM/CIPD certification preferred',
    ],
    benefits: ['Flexible hours', 'Learning budget', 'Health & wellness', 'Remote option'],
    skills: ['HRBP', 'Employee Relations', 'Talent Management', 'HRIS'],
    status: 'active',
    hiringManagerId: 'emp-013',
    hiringManagerName: 'Diana Foster',
    recruiterId: 'rec-002',
    recruiterName: 'Mark Collins',
    applicantCount: 19,
    openPositions: 1,
    postedDate: '2026-02-01',
    closingDate: '2026-03-20',
    isRemote: true,
  },
  {
    id: 'job-004',
    jobCode: 'PROD-2026-001',
    title: 'Senior Product Manager',
    department: 'Product',
    departmentId: 'dept-006',
    location: 'San Francisco',
    locationId: 'loc-001',
    employmentType: 'full_time',
    experienceMin: 5,
    experienceMax: 10,
    salaryMin: 140000,
    salaryMax: 185000,
    currency: 'USD',
    description: 'Lead product strategy for our enterprise HCM platform features.',
    requirements: [
      '5+ years product management',
      'B2B SaaS',
      'Data-driven decision making',
      'Agile/Scrum',
    ],
    benefits: ['Competitive equity', 'Premium healthcare', 'Parental leave', 'Annual bonus'],
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'UX', 'Stakeholder Management'],
    status: 'active',
    hiringManagerId: 'emp-016',
    hiringManagerName: 'Anna Rodriguez',
    recruiterId: 'rec-001',
    recruiterName: 'Amy Johnson',
    applicantCount: 55,
    openPositions: 1,
    postedDate: '2026-01-10',
    closingDate: '2026-03-10',
    isRemote: true,
  },
  {
    id: 'job-005',
    jobCode: 'OPS-2026-001',
    title: 'DevOps Engineer',
    department: 'Engineering',
    departmentId: 'dept-001',
    location: 'Austin',
    locationId: 'loc-003',
    employmentType: 'full_time',
    experienceMin: 3,
    experienceMax: 7,
    salaryMin: 110000,
    salaryMax: 150000,
    currency: 'USD',
    description: 'Build and maintain robust CI/CD pipelines and cloud infrastructure.',
    requirements: ['AWS/GCP', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux administration'],
    benefits: ['Remote-first', 'Tech stipend', 'Conference budget', 'Full benefits'],
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
    status: 'active',
    hiringManagerId: 'emp-011',
    hiringManagerName: 'Karen White',
    recruiterId: 'rec-002',
    recruiterName: 'Mark Collins',
    applicantCount: 28,
    openPositions: 2,
    postedDate: '2026-02-05',
    closingDate: '2026-04-05',
    isRemote: true,
  },
];

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand-001',
    firstName: 'Alice',
    lastName: 'Foster',
    fullName: 'Alice Foster',
    email: 'alice.foster@email.com',
    phone: '+1 555-100-0001',
    location: 'San Francisco, CA',
    jobPostingId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    currentStage: 'technical',
    source: 'linkedin',
    rating: 4,
    appliedDate: '2026-01-20',
    lastActivityDate: '2026-02-18',
    daysInCurrentStage: 3,
    currentCompany: 'TechCorp',
    currentTitle: 'Frontend Engineer',
    experienceYears: 5,
    skills: ['React', 'TypeScript', 'GraphQL', 'Testing'],
    expectedSalary: 165000,
    noticePeriod: '4 weeks',
    avatarInitials: 'AF',
    avatarColor: AVATAR_COLORS[0],
    tags: ['top-candidate', 'referral'],
    interviews: [],
    notes: 'Strong technical profile. Very positive feedback from phone screen.',
    isArchived: false,
  },
  {
    id: 'cand-002',
    firstName: 'Brian',
    lastName: 'Murphy',
    fullName: 'Brian Murphy',
    email: 'brian.murphy@email.com',
    phone: '+1 555-100-0002',
    location: 'New York, NY',
    jobPostingId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    currentStage: 'phone_screen',
    source: 'job_board',
    rating: 3,
    appliedDate: '2026-01-25',
    lastActivityDate: '2026-02-15',
    daysInCurrentStage: 5,
    currentCompany: 'StartupXY',
    currentTitle: 'React Developer',
    experienceYears: 4,
    skills: ['React', 'JavaScript', 'Redux'],
    expectedSalary: 140000,
    noticePeriod: '2 weeks',
    avatarInitials: 'BM',
    avatarColor: AVATAR_COLORS[1],
    tags: [],
    interviews: [],
    notes: '',
    isArchived: false,
  },
  {
    id: 'cand-003',
    firstName: 'Carol',
    lastName: 'Evans',
    fullName: 'Carol Evans',
    email: 'carol.evans@email.com',
    phone: '+1 555-100-0003',
    location: 'Remote',
    jobPostingId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    currentStage: 'hr_interview',
    source: 'career_site',
    rating: 5,
    appliedDate: '2026-01-18',
    lastActivityDate: '2026-02-20',
    daysInCurrentStage: 2,
    currentCompany: 'MegaTech',
    currentTitle: 'Senior FE Engineer',
    experienceYears: 7,
    skills: ['React', 'TypeScript', 'Next.js', 'AWS', 'Node.js'],
    expectedSalary: 175000,
    noticePeriod: '6 weeks',
    avatarInitials: 'CE',
    avatarColor: AVATAR_COLORS[2],
    tags: ['top-candidate'],
    interviews: [],
    notes: 'Exceptional candidate. Cleared all technical rounds with flying colors.',
    isArchived: false,
  },
  {
    id: 'cand-004',
    firstName: 'David',
    lastName: 'Park',
    fullName: 'David Park',
    email: 'david.park@email.com',
    phone: '+1 555-100-0004',
    location: 'San Francisco, CA',
    jobPostingId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    currentStage: 'offer',
    source: 'referral',
    rating: 5,
    appliedDate: '2026-01-15',
    lastActivityDate: '2026-02-22',
    daysInCurrentStage: 1,
    currentCompany: 'WebAgency',
    currentTitle: 'Tech Lead',
    experienceYears: 8,
    skills: ['React', 'TypeScript', 'Architecture', 'Mentoring'],
    expectedSalary: 180000,
    noticePeriod: '4 weeks',
    avatarInitials: 'DP',
    avatarColor: AVATAR_COLORS[3],
    tags: ['offer-extended'],
    interviews: [],
    notes: 'Offer extended. Awaiting response by Feb 28.',
    isArchived: false,
  },
  {
    id: 'cand-005',
    firstName: 'Emma',
    lastName: 'Walsh',
    fullName: 'Emma Walsh',
    email: 'emma.walsh@email.com',
    phone: '+1 555-100-0005',
    location: 'New York, NY',
    jobPostingId: 'job-002',
    jobTitle: 'Enterprise Account Executive',
    currentStage: 'screening',
    source: 'linkedin',
    rating: 3,
    appliedDate: '2026-01-28',
    lastActivityDate: '2026-02-10',
    daysInCurrentStage: 8,
    currentCompany: 'SalesForce Inc',
    currentTitle: 'Account Executive',
    experienceYears: 4,
    skills: ['Enterprise Sales', 'Salesforce', 'Negotiation'],
    avatarInitials: 'EW',
    avatarColor: AVATAR_COLORS[4],
    tags: [],
    interviews: [],
    notes: '',
    isArchived: false,
  },
  {
    id: 'cand-006',
    firstName: 'Frank',
    lastName: 'Nguyen',
    fullName: 'Frank Nguyen',
    email: 'frank.nguyen@email.com',
    phone: '+1 555-100-0006',
    location: 'New York, NY',
    jobPostingId: 'job-002',
    jobTitle: 'Enterprise Account Executive',
    currentStage: 'technical',
    source: 'agency',
    rating: 4,
    appliedDate: '2026-01-22',
    lastActivityDate: '2026-02-19',
    daysInCurrentStage: 4,
    currentCompany: 'EnterpriseBox',
    currentTitle: 'Senior AE',
    experienceYears: 6,
    skills: ['Enterprise Sales', 'SaaS', 'Executive Engagement'],
    avatarInitials: 'FN',
    avatarColor: AVATAR_COLORS[5],
    tags: [],
    interviews: [],
    notes: 'Strong enterprise background. Cleared initial rounds well.',
    isArchived: false,
  },
  {
    id: 'cand-007',
    firstName: 'Grace',
    lastName: 'Kim',
    fullName: 'Grace Kim',
    email: 'grace.kim@email.com',
    phone: '+1 555-100-0007',
    location: 'San Francisco, CA',
    jobPostingId: 'job-003',
    jobTitle: 'HR Business Partner',
    currentStage: 'applied',
    source: 'career_site',
    rating: 0,
    appliedDate: '2026-02-10',
    lastActivityDate: '2026-02-10',
    daysInCurrentStage: 11,
    currentCompany: 'StartupHR',
    currentTitle: 'HR Generalist',
    experienceYears: 3,
    skills: ['HRBP', 'Recruitment', 'Employee Relations'],
    avatarInitials: 'GK',
    avatarColor: AVATAR_COLORS[6],
    tags: [],
    interviews: [],
    notes: '',
    isArchived: false,
  },
  {
    id: 'cand-008',
    firstName: 'Henry',
    lastName: 'Chang',
    fullName: 'Henry Chang',
    email: 'henry.chang@email.com',
    phone: '+1 555-100-0008',
    location: 'San Francisco, CA',
    jobPostingId: 'job-004',
    jobTitle: 'Senior Product Manager',
    currentStage: 'screening',
    source: 'linkedin',
    rating: 4,
    appliedDate: '2026-01-12',
    lastActivityDate: '2026-02-08',
    daysInCurrentStage: 12,
    currentCompany: 'ProductCo',
    currentTitle: 'Product Manager',
    experienceYears: 6,
    skills: ['Product Management', 'SaaS', 'Analytics', 'Agile'],
    avatarInitials: 'HC',
    avatarColor: AVATAR_COLORS[7],
    tags: [],
    interviews: [],
    notes: '',
    isArchived: false,
  },
  {
    id: 'cand-009',
    firstName: 'Iris',
    lastName: 'Lopez',
    fullName: 'Iris Lopez',
    email: 'iris.lopez@email.com',
    phone: '+1 555-100-0009',
    location: 'Austin, TX',
    jobPostingId: 'job-005',
    jobTitle: 'DevOps Engineer',
    currentStage: 'phone_screen',
    source: 'direct',
    rating: 3,
    appliedDate: '2026-02-08',
    lastActivityDate: '2026-02-18',
    daysInCurrentStage: 5,
    currentCompany: 'CloudOps',
    currentTitle: 'DevOps Engineer',
    experienceYears: 4,
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    avatarInitials: 'IL',
    avatarColor: AVATAR_COLORS[0],
    tags: [],
    interviews: [],
    notes: '',
    isArchived: false,
  },
  {
    id: 'cand-010',
    firstName: 'Jack',
    lastName: 'Robinson',
    fullName: 'Jack Robinson',
    email: 'jack.robinson@email.com',
    phone: '+1 555-100-0010',
    location: 'Remote',
    jobPostingId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    currentStage: 'rejected',
    source: 'job_board',
    rating: 2,
    appliedDate: '2026-01-28',
    lastActivityDate: '2026-02-05',
    daysInCurrentStage: 20,
    currentCompany: 'Agency',
    currentTitle: 'Web Developer',
    experienceYears: 2,
    skills: ['HTML', 'CSS', 'JavaScript'],
    avatarInitials: 'JR',
    avatarColor: AVATAR_COLORS[1],
    tags: ['not-qualified'],
    interviews: [],
    notes: 'Insufficient experience for senior role.',
    isArchived: false,
  },
  {
    id: 'cand-011',
    firstName: 'Kate',
    lastName: 'Brown',
    fullName: 'Kate Brown',
    email: 'kate.brown@email.com',
    phone: '+1 555-100-0011',
    location: 'San Francisco, CA',
    jobPostingId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    currentStage: 'hired',
    source: 'referral',
    rating: 5,
    appliedDate: '2026-01-05',
    lastActivityDate: '2026-02-12',
    daysInCurrentStage: 0,
    currentCompany: '',
    currentTitle: '',
    experienceYears: 6,
    skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
    avatarInitials: 'KB',
    avatarColor: AVATAR_COLORS[2],
    tags: ['hired'],
    interviews: [],
    notes: 'Offer accepted. Starting March 15.',
    isArchived: false,
  },
  {
    id: 'cand-012',
    firstName: 'Liam',
    lastName: 'Taylor',
    fullName: 'Liam Taylor',
    email: 'liam.taylor@email.com',
    phone: '+1 555-100-0012',
    location: 'Austin, TX',
    jobPostingId: 'job-005',
    jobTitle: 'DevOps Engineer',
    currentStage: 'technical',
    source: 'linkedin',
    rating: 4,
    appliedDate: '2026-02-09',
    lastActivityDate: '2026-02-22',
    daysInCurrentStage: 2,
    currentCompany: 'Infrastructure Inc',
    currentTitle: 'Cloud Engineer',
    experienceYears: 5,
    skills: ['GCP', 'Kubernetes', 'Python', 'Monitoring'],
    avatarInitials: 'LT',
    avatarColor: AVATAR_COLORS[3],
    tags: [],
    interviews: [],
    notes: 'Very strong GCP background.',
    isArchived: false,
  },
  {
    id: 'cand-013',
    firstName: 'Maya',
    lastName: 'Patel',
    fullName: 'Maya Patel',
    email: 'maya.patel@email.com',
    phone: '+1 555-100-0013',
    location: 'Remote',
    jobPostingId: 'job-004',
    jobTitle: 'Senior Product Manager',
    currentStage: 'hr_interview',
    source: 'career_site',
    rating: 5,
    appliedDate: '2026-01-11',
    lastActivityDate: '2026-02-21',
    daysInCurrentStage: 3,
    currentCompany: 'Enterprise SaaS Co',
    currentTitle: 'Senior PM',
    experienceYears: 7,
    skills: ['Product Strategy', 'Data Analysis', 'User Research', 'Agile'],
    avatarInitials: 'MP',
    avatarColor: AVATAR_COLORS[4],
    tags: ['top-candidate'],
    interviews: [],
    notes: 'Exceptional strategic thinker with strong SaaS background.',
    isArchived: false,
  },
  {
    id: 'cand-014',
    firstName: 'Noah',
    lastName: 'Wilson',
    fullName: 'Noah Wilson',
    email: 'noah.wilson@email.com',
    phone: '+1 555-100-0014',
    location: 'New York, NY',
    jobPostingId: 'job-002',
    jobTitle: 'Enterprise Account Executive',
    currentStage: 'offer',
    source: 'referral',
    rating: 5,
    appliedDate: '2026-01-19',
    lastActivityDate: '2026-02-23',
    daysInCurrentStage: 1,
    currentCompany: 'BigCorp Sales',
    currentTitle: 'Enterprise AE',
    experienceYears: 7,
    skills: ['Enterprise Sales', 'C-Suite Engagement', 'SaaS'],
    avatarInitials: 'NW',
    avatarColor: AVATAR_COLORS[5],
    tags: ['offer-extended'],
    interviews: [],
    notes: 'Outstanding sales track record. Verbal offer accepted.',
    isArchived: false,
  },
  {
    id: 'cand-015',
    firstName: 'Olivia',
    lastName: 'Davis',
    fullName: 'Olivia Davis',
    email: 'olivia.davis@email.com',
    phone: '+1 555-100-0015',
    location: 'San Francisco, CA',
    jobPostingId: 'job-003',
    jobTitle: 'HR Business Partner',
    currentStage: 'phone_screen',
    source: 'linkedin',
    rating: 4,
    appliedDate: '2026-02-05',
    lastActivityDate: '2026-02-17',
    daysInCurrentStage: 7,
    currentCompany: 'HRTech Co',
    currentTitle: 'People Partner',
    experienceYears: 5,
    skills: ['HRBP', 'L&D', 'Talent Development', 'Performance Management'],
    avatarInitials: 'OD',
    avatarColor: AVATAR_COLORS[6],
    tags: [],
    interviews: [],
    notes: 'Strong L&D background.',
    isArchived: false,
  },
  {
    id: 'cand-016',
    firstName: 'Peter',
    lastName: 'Martin',
    fullName: 'Peter Martin',
    email: 'peter.martin@email.com',
    phone: '+1 555-100-0016',
    location: 'San Francisco, CA',
    jobPostingId: 'job-001',
    jobTitle: 'Senior Frontend Engineer',
    currentStage: 'applied',
    source: 'job_board',
    rating: 0,
    appliedDate: '2026-02-22',
    lastActivityDate: '2026-02-22',
    daysInCurrentStage: 3,
    currentCompany: 'TechStartup',
    currentTitle: 'Frontend Dev',
    experienceYears: 4,
    skills: ['Vue.js', 'JavaScript', 'CSS'],
    avatarInitials: 'PM',
    avatarColor: AVATAR_COLORS[7],
    tags: [],
    interviews: [],
    notes: '',
    isArchived: false,
  },
];

const MOCK_ANALYTICS: RecruitmentAnalytics = {
  totalOpenPositions: 7,
  totalApplications: 181,
  totalInterviewsScheduled: 48,
  totalOffersMade: 6,
  totalHired: 3,
  averageTimeToHire: 28,
  offerAcceptanceRate: 83.3,
  pipelineFunnel: [
    { stage: 'applied', label: 'Applied', count: 181, conversionRate: 100 },
    { stage: 'screening', label: 'Screening', count: 89, conversionRate: 49.2 },
    { stage: 'phone_screen', label: 'Phone Screen', count: 52, conversionRate: 58.4 },
    { stage: 'technical', label: 'Technical', count: 28, conversionRate: 53.8 },
    { stage: 'hr_interview', label: 'HR Interview', count: 15, conversionRate: 53.6 },
    { stage: 'offer', label: 'Offer', count: 6, conversionRate: 40.0 },
    { stage: 'hired', label: 'Hired', count: 3, conversionRate: 50.0 },
  ],
  sourceEffectiveness: [
    { source: 'linkedin', count: 72, hireRate: 4.2 },
    { source: 'referral', count: 31, hireRate: 12.9 },
    { source: 'career_site', count: 38, hireRate: 5.3 },
    { source: 'job_board', count: 24, hireRate: 0 },
    { source: 'agency', count: 10, hireRate: 10.0 },
    { source: 'direct', count: 6, hireRate: 16.7 },
  ],
  departmentHiring: [
    { department: 'Engineering', openPositions: 4, hired: 2 },
    { department: 'Sales & Marketing', openPositions: 1, hired: 1 },
    { department: 'Human Resources', openPositions: 1, hired: 0 },
    { department: 'Product', openPositions: 1, hired: 0 },
  ],
  monthlyActivity: [
    { month: '2025-11', applications: 32, interviews: 12, offers: 1, hires: 1 },
    { month: '2025-12', applications: 28, interviews: 8, offers: 2, hires: 1 },
    { month: '2026-01', applications: 55, interviews: 18, offers: 2, hires: 1 },
    { month: '2026-02', applications: 66, interviews: 10, offers: 1, hires: 0 },
  ],
};

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
    try {
      return await APIClient.get<JobPosting[]>('/v1/recruitment/jobs', filters);
    } catch {
      let results = [...MOCK_JOB_POSTINGS];
      if (filters?.status) results = results.filter((j) => j.status === filters.status);
      if (filters?.departmentId)
        results = results.filter((j) => j.departmentId === filters.departmentId);
      if (filters?.locationId) results = results.filter((j) => j.locationId === filters.locationId);
      return results;
    }
  }

  /**
   * Create a new job posting
   */
  static async createJobPosting(
    data: Omit<JobPosting, 'id' | 'jobCode' | 'applicantCount' | 'postedDate'>
  ): Promise<JobPosting> {
    try {
      return await APIClient.post<JobPosting>('/v1/recruitment/jobs', data);
    } catch {
      const newJob: JobPosting = {
        ...data,
        id: `job-${Date.now()}`,
        jobCode: `${data.department.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(MOCK_JOB_POSTINGS.length + 1).padStart(3, '0')}`,
        applicantCount: 0,
        postedDate: new Date().toISOString().split('T')[0],
      };
      MOCK_JOB_POSTINGS.push(newJob);
      return newJob;
    }
  }

  /**
   * Get candidates for a job posting, with pipeline stage filtering
   */
  static async getCandidates(jobId?: string, filters?: CandidateFilters): Promise<Candidate[]> {
    try {
      return await APIClient.get<Candidate[]>('/v1/recruitment/candidates', { jobId, ...filters });
    } catch {
      let results = [...MOCK_CANDIDATES];
      if (jobId) results = results.filter((c) => c.jobPostingId === jobId);
      if (filters?.stage) results = results.filter((c) => c.currentStage === filters.stage);
      if (filters?.source) results = results.filter((c) => c.source === filters.source);
      if (filters?.minRating !== undefined)
        results = results.filter((c) => c.rating >= filters.minRating!);
      if (filters?.isArchived !== undefined)
        results = results.filter((c) => c.isArchived === filters.isArchived);
      return results;
    }
  }

  /**
   * Get full candidate profile
   */
  static async getCandidateDetail(id: string): Promise<Candidate | null> {
    try {
      return await APIClient.get<Candidate>(`/v1/recruitment/candidates/${id}`);
    } catch {
      return MOCK_CANDIDATES.find((c) => c.id === id) ?? null;
    }
  }

  /**
   * Move a candidate to a new pipeline stage
   */
  static async moveCandidateStage(
    candidateId: string,
    newStage: PipelineStage
  ): Promise<Candidate> {
    try {
      return await APIClient.post<Candidate>(
        `/v1/recruitment/candidates/${candidateId}/move-stage`,
        { newStage }
      );
    } catch {
      const candidate = MOCK_CANDIDATES.find((c) => c.id === candidateId);
      if (!candidate) throw new Error(`Candidate ${candidateId} not found`);
      candidate.currentStage = newStage;
      candidate.daysInCurrentStage = 0;
      candidate.lastActivityDate = new Date().toISOString().split('T')[0];
      return candidate;
    }
  }

  /**
   * Schedule an interview for a candidate
   */
  static async scheduleInterview(data: ScheduleInterviewData): Promise<Interview> {
    try {
      return await APIClient.post<Interview>('/v1/recruitment/interviews', data);
    } catch {
      const candidate = MOCK_CANDIDATES.find((c) => c.id === data.candidateId);
      const job = MOCK_JOB_POSTINGS.find((j) => j.id === data.jobPostingId);
      const newInterview: Interview = {
        id: `int-${Date.now()}`,
        candidateId: data.candidateId,
        candidateName: candidate?.fullName ?? 'Unknown',
        jobPostingId: data.jobPostingId,
        jobTitle: job?.title ?? 'Unknown Position',
        type: data.type,
        stage: data.stage,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: 60,
        interviewers: data.interviewerIds.map((id, i) => ({
          id,
          name: `Interviewer ${i + 1}`,
          role: 'Interviewer',
        })),
        location: data.location,
        meetingLink: data.meetingLink,
        status: 'scheduled',
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };
      if (candidate) {
        candidate.interviews.push(newInterview);
      }
      return newInterview;
    }
  }

  /**
   * Submit interview feedback scorecard
   */
  static async submitFeedback(
    interviewId: string,
    feedback: FeedbackData
  ): Promise<InterviewFeedback> {
    try {
      return await APIClient.post<InterviewFeedback>(
        `/v1/recruitment/interviews/${interviewId}/feedback`,
        feedback
      );
    } catch {
      const overallRating =
        (feedback.technicalSkills +
          feedback.communication +
          feedback.cultureFit +
          feedback.problemSolving) /
        4;
      return {
        interviewId,
        interviewerId: 'emp-current',
        interviewerName: 'Current User',
        ...feedback,
        overallRating: Math.round(overallRating * 10) / 10,
        submittedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get recruitment analytics — funnel, time-to-hire, sources
   */
  static async getRecruitmentAnalytics(): Promise<RecruitmentAnalytics> {
    try {
      return await APIClient.get<RecruitmentAnalytics>('/v1/recruitment/analytics');
    } catch {
      return {
        ...MOCK_ANALYTICS,
        totalOpenPositions: MOCK_JOB_POSTINGS.filter((j) => j.status === 'active').length,
        totalApplications: MOCK_CANDIDATES.length,
      };
    }
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
