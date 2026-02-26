/**
 * @module internalMobilityService
 * @description Internal Mobility Service — internal job postings, career paths,
 *              skill matching, gig opportunities, mentor matching (Sec 20.6)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';
export type GigStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ProgressionType = 'promotion' | 'lateral' | 'stretch' | 'rotation';

export interface InternalPosting {
  id: string;
  jobTitle: string;
  department: string;
  location: string;
  isRemote: boolean;
  type: 'full_time' | 'part_time' | 'temp_assignment';
  level: string;
  salaryRange: { min: number; max: number; currency: string };
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  hiringManagerName: string;
  postedDate: string;
  closingDate: string;
  applicantsCount: number;
  isNew: boolean;
  teamSize: number;
  tags: string[];
}

export interface InternalApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  appliedDate: string;
  status: ApplicationStatus;
  skillMatchPercent: number;
  nextStep?: string;
  notes?: string;
  interviewDate?: string;
  feedback?: string;
}

export interface CareerPathNode {
  roleId: string;
  title: string;
  level: string;
  department: string;
  avgTimeInRole: number; // months
  avgSalary: number;
  requiredSkills: string[];
  openings: number;
}

export interface CareerPath {
  id: string;
  name: string;
  fromRole: string;
  targetRole: string;
  progression: CareerPathNode[];
  type: ProgressionType;
  avgTimeToTarget: number; // months
  successRate: number;
  employeesOnPath: number;
  keySkillsToAcquire: string[];
}

export interface SkillMatch {
  employeeId: string;
  jobId: string;
  overallMatchPercent: number;
  matchedSkills: Array<{ skill: string; proficiency: string; required: string }>;
  missingSkills: Array<{ skill: string; required: string; learningTime: string }>;
  niceToHaveMatched: string[];
  developmentPlan: string[];
  timeToReadiness: string;
}

export interface GigOpportunity {
  id: string;
  title: string;
  description: string;
  hostDepartment: string;
  hostTeam: string;
  duration: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
  location: string;
  isRemote: boolean;
  requiredSkills: string[];
  status: GigStatus;
  applicantsCount: number;
  maxParticipants: number;
  benefits: string[];
  contactName: string;
  skillsGained: string[];
}

export interface MentorProfile {
  id: string;
  employeeId: string;
  name: string;
  title: string;
  department: string;
  expertise: string[];
  yearsExperience: number;
  bio: string;
  focusAreas: string[];
  menteeCount: number;
  maxMentees: number;
  isAvailable: boolean;
  meetingFrequency: string;
  rating: number;
  reviewCount: number;
  linkedCareerPaths: string[];
}

export interface MentorMatch {
  mentor: MentorProfile;
  compatibilityScore: number;
  matchReasons: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_INTERNAL_POSTINGS: InternalPosting[] = [
  {
    id: 'int-001',
    jobTitle: 'Senior Product Manager — Platform',
    department: 'Product',
    location: 'Dubai, UAE',
    isRemote: true,
    type: 'full_time',
    level: 'Senior',
    salaryRange: { min: 180000, max: 220000, currency: 'USD' },
    description:
      'Lead the platform product strategy, working closely with engineering and design to deliver best-in-class developer experience.',
    requiredSkills: [
      'Product Strategy',
      'Roadmapping',
      'Stakeholder Management',
      'Data Analysis',
      'API Design',
    ],
    niceToHaveSkills: ['Developer Tools Experience', 'B2B SaaS', 'SQL'],
    hiringManagerName: 'James Liu',
    postedDate: '2026-02-01',
    closingDate: '2026-03-01',
    applicantsCount: 5,
    isNew: true,
    teamSize: 8,
    tags: ['Product', 'Platform', 'Remote-Friendly'],
  },
  {
    id: 'int-002',
    jobTitle: 'Engineering Manager — Mobile',
    department: 'Engineering',
    location: 'Riyadh, Saudi Arabia',
    isRemote: false,
    type: 'full_time',
    level: 'Manager',
    salaryRange: { min: 200000, max: 250000, currency: 'USD' },
    description:
      'Manage and grow the mobile engineering team, driving technical excellence and delivery across iOS and Android platforms.',
    requiredSkills: ['People Management', 'iOS', 'Android', 'Agile', 'React Native'],
    niceToHaveSkills: ['Performance Optimization', 'CI/CD', 'Security'],
    hiringManagerName: 'Sarah Chen',
    postedDate: '2026-01-28',
    closingDate: '2026-02-28',
    applicantsCount: 3,
    isNew: false,
    teamSize: 12,
    tags: ['Management', 'Mobile', 'Leadership'],
  },
  {
    id: 'int-003',
    jobTitle: 'Data Scientist — People Analytics',
    department: 'HR Analytics',
    location: 'Global (Remote)',
    isRemote: true,
    type: 'full_time',
    level: 'Mid-Senior',
    salaryRange: { min: 140000, max: 170000, currency: 'USD' },
    description:
      'Apply advanced statistical modeling and ML to drive HR insights including turnover prediction, performance forecasting, and workforce planning.',
    requiredSkills: [
      'Python',
      'Statistical Modeling',
      'Machine Learning',
      'SQL',
      'Data Visualization',
    ],
    niceToHaveSkills: ['HR Domain Knowledge', 'NLP', 'Causal Inference'],
    hiringManagerName: 'Carlos Mendez',
    postedDate: '2026-02-05',
    closingDate: '2026-03-05',
    applicantsCount: 8,
    isNew: true,
    teamSize: 5,
    tags: ['Analytics', 'HR', 'Remote'],
  },
  {
    id: 'int-004',
    jobTitle: 'Senior DevOps Engineer',
    department: 'Infrastructure',
    location: 'Bangalore, India',
    isRemote: true,
    type: 'full_time',
    level: 'Senior',
    salaryRange: { min: 120000, max: 150000, currency: 'USD' },
    description:
      'Own the cloud infrastructure, CI/CD pipelines, and observability stack. Drive reliability engineering practices.',
    requiredSkills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Prometheus'],
    niceToHaveSkills: ['FinOps', 'Security', 'Platform Engineering'],
    hiringManagerName: 'Tom Baker',
    postedDate: '2026-02-10',
    closingDate: '2026-03-10',
    applicantsCount: 4,
    isNew: true,
    teamSize: 7,
    tags: ['DevOps', 'Cloud', 'Infrastructure'],
  },
  {
    id: 'int-005',
    jobTitle: 'Sales Manager — EMEA',
    department: 'Sales',
    location: 'London, UK',
    isRemote: false,
    type: 'full_time',
    level: 'Manager',
    salaryRange: { min: 160000, max: 200000, currency: 'USD' },
    description:
      'Lead the EMEA sales team to exceed revenue targets, develop key enterprise accounts, and build a high-performance sales culture.',
    requiredSkills: [
      'B2B Sales',
      'Team Leadership',
      'Forecasting',
      'Salesforce',
      'Enterprise Accounts',
    ],
    niceToHaveSkills: ['HCM / HR Tech Experience', 'Arabic Language'],
    hiringManagerName: 'Anna Schmidt',
    postedDate: '2026-01-15',
    closingDate: '2026-02-28',
    applicantsCount: 6,
    isNew: false,
    teamSize: 10,
    tags: ['Sales', 'EMEA', 'Leadership'],
  },
  {
    id: 'int-006',
    jobTitle: 'UX Designer — Enterprise Products',
    department: 'Design',
    location: 'Dubai, UAE',
    isRemote: true,
    type: 'full_time',
    level: 'Mid-Senior',
    salaryRange: { min: 110000, max: 140000, currency: 'USD' },
    description:
      'Design intuitive enterprise UX experiences for our HCM platform, conducting user research and building design systems.',
    requiredSkills: ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Accessibility'],
    niceToHaveSkills: ['Enterprise UX', 'HR Domain', 'Animation'],
    hiringManagerName: 'Nina Okonkwo',
    postedDate: '2026-02-12',
    closingDate: '2026-03-12',
    applicantsCount: 7,
    isNew: true,
    teamSize: 6,
    tags: ['Design', 'UX', 'Enterprise'],
  },
  {
    id: 'int-007',
    jobTitle: 'L&D Program Manager',
    department: 'Learning & Development',
    location: 'Riyadh, Saudi Arabia',
    isRemote: false,
    type: 'full_time',
    level: 'Mid-Senior',
    salaryRange: { min: 95000, max: 120000, currency: 'USD' },
    description:
      'Design and execute learning programs across the organization, partnering with business leaders to identify development needs.',
    requiredSkills: [
      'L&D Program Design',
      'Facilitation',
      'Needs Analysis',
      'LMS Administration',
      'Stakeholder Management',
    ],
    niceToHaveSkills: ['E-learning Development', 'Data Analysis', 'Coaching'],
    hiringManagerName: 'Emily Park',
    postedDate: '2026-01-20',
    closingDate: '2026-02-25',
    applicantsCount: 9,
    isNew: false,
    teamSize: 4,
    tags: ['L&D', 'HR', 'Training'],
  },
  {
    id: 'int-008',
    jobTitle: 'Finance Business Partner',
    department: 'Finance',
    location: 'Dubai, UAE',
    isRemote: false,
    type: 'full_time',
    level: 'Senior',
    salaryRange: { min: 130000, max: 160000, currency: 'USD' },
    description:
      'Partner with business leaders to provide financial insight, planning, and analysis to support strategic decision-making.',
    requiredSkills: [
      'Financial Modeling',
      'Business Partnering',
      'FP&A',
      'Excel/Power BI',
      'Storytelling with Data',
    ],
    niceToHaveSkills: ['SAP', 'Tech Industry', 'Budgeting'],
    hiringManagerName: 'Jake Wilson',
    postedDate: '2026-02-08',
    closingDate: '2026-03-08',
    applicantsCount: 3,
    isNew: true,
    teamSize: 5,
    tags: ['Finance', 'FP&A', 'Analytics'],
  },
];

const MOCK_CAREER_PATHS: CareerPath[] = [
  {
    id: 'path-001',
    name: 'IC to Engineering Manager',
    fromRole: 'Senior Software Engineer',
    targetRole: 'Engineering Manager',
    type: 'promotion',
    avgTimeToTarget: 24,
    successRate: 72,
    employeesOnPath: 14,
    keySkillsToAcquire: [
      'People Management',
      'Performance Reviews',
      'Hiring',
      'Cross-functional Collaboration',
      'Strategic Thinking',
    ],
    progression: [
      {
        roleId: 'r-001',
        title: 'Senior Software Engineer',
        level: 'Senior IC',
        department: 'Engineering',
        avgTimeInRole: 18,
        avgSalary: 150000,
        requiredSkills: ['Software Architecture', 'Mentoring', 'Technical Leadership'],
        openings: 12,
      },
      {
        roleId: 'r-002',
        title: 'Staff Engineer / Tech Lead',
        level: 'Staff',
        department: 'Engineering',
        avgTimeInRole: 12,
        avgSalary: 180000,
        requiredSkills: ['Technical Strategy', 'Cross-team Influence', 'Project Leadership'],
        openings: 4,
      },
      {
        roleId: 'r-003',
        title: 'Engineering Manager',
        level: 'Manager',
        department: 'Engineering',
        avgTimeInRole: 36,
        avgSalary: 220000,
        requiredSkills: ['People Management', 'OKR Setting', 'Hiring'],
        openings: 2,
      },
    ],
  },
  {
    id: 'path-002',
    name: 'Data Analyst to Data Scientist',
    fromRole: 'Data Analyst',
    targetRole: 'Senior Data Scientist',
    type: 'promotion',
    avgTimeToTarget: 30,
    successRate: 65,
    employeesOnPath: 8,
    keySkillsToAcquire: [
      'Machine Learning',
      'Python Advanced',
      'MLOps',
      'Statistical Modeling',
      'Causal Inference',
    ],
    progression: [
      {
        roleId: 'r-010',
        title: 'Data Analyst',
        level: 'Mid',
        department: 'Analytics',
        avgTimeInRole: 18,
        avgSalary: 90000,
        requiredSkills: ['SQL', 'Visualization', 'Excel'],
        openings: 6,
      },
      {
        roleId: 'r-011',
        title: 'Data Scientist',
        level: 'Mid-Senior',
        department: 'Analytics',
        avgTimeInRole: 18,
        avgSalary: 130000,
        requiredSkills: ['Python', 'ML Models', 'A/B Testing'],
        openings: 3,
      },
      {
        roleId: 'r-012',
        title: 'Senior Data Scientist',
        level: 'Senior',
        department: 'Analytics',
        avgTimeInRole: 24,
        avgSalary: 165000,
        requiredSkills: ['MLOps', 'Research', 'Business Impact'],
        openings: 2,
      },
    ],
  },
  {
    id: 'path-003',
    name: 'HR BP to HR Director',
    fromRole: 'HR Business Partner',
    targetRole: 'HR Director',
    type: 'promotion',
    avgTimeToTarget: 48,
    successRate: 55,
    employeesOnPath: 5,
    keySkillsToAcquire: [
      'Organizational Design',
      'Executive Coaching',
      'Board Relations',
      'M&A HR',
      'P&L Accountability',
    ],
    progression: [
      {
        roleId: 'r-020',
        title: 'HR Business Partner',
        level: 'Senior',
        department: 'HR',
        avgTimeInRole: 24,
        avgSalary: 120000,
        requiredSkills: ['Employee Relations', 'Coaching', 'Analytics'],
        openings: 4,
      },
      {
        roleId: 'r-021',
        title: 'Senior HR Business Partner',
        level: 'Senior+',
        department: 'HR',
        avgTimeInRole: 12,
        avgSalary: 145000,
        requiredSkills: ['Org Design', 'Senior Stakeholders', 'Change Management'],
        openings: 2,
      },
      {
        roleId: 'r-022',
        title: 'HR Director',
        level: 'Director',
        department: 'HR',
        avgTimeInRole: 36,
        avgSalary: 200000,
        requiredSkills: ['Team Leadership', 'Strategy', 'Executive Presence'],
        openings: 1,
      },
    ],
  },
  {
    id: 'path-004',
    name: 'Product Manager — Growth Track',
    fromRole: 'Associate Product Manager',
    targetRole: 'Director of Product',
    type: 'promotion',
    avgTimeToTarget: 60,
    successRate: 40,
    employeesOnPath: 9,
    keySkillsToAcquire: [
      'Product Vision',
      'Revenue Ownership',
      'Team Building',
      'Market Positioning',
      'Executive Communication',
    ],
    progression: [
      {
        roleId: 'r-030',
        title: 'Associate PM',
        level: 'Junior',
        department: 'Product',
        avgTimeInRole: 18,
        avgSalary: 95000,
        requiredSkills: ['Product Sense', 'Data Analysis', 'Communication'],
        openings: 3,
      },
      {
        roleId: 'r-031',
        title: 'Product Manager',
        level: 'Mid',
        department: 'Product',
        avgTimeInRole: 24,
        avgSalary: 140000,
        requiredSkills: ['Roadmapping', 'Stakeholder Management', 'Metrics'],
        openings: 5,
      },
      {
        roleId: 'r-032',
        title: 'Senior PM',
        level: 'Senior',
        department: 'Product',
        avgTimeInRole: 18,
        avgSalary: 185000,
        requiredSkills: ['Strategy', 'Cross-functional Leadership', 'OKRs'],
        openings: 3,
      },
      {
        roleId: 'r-033',
        title: 'Director of Product',
        level: 'Director',
        department: 'Product',
        avgTimeInRole: 36,
        avgSalary: 250000,
        requiredSkills: ['Vision', 'Portfolio Management', 'P&L'],
        openings: 1,
      },
    ],
  },
  {
    id: 'path-005',
    name: 'Sales IC to Sales Leadership',
    fromRole: 'Account Executive',
    targetRole: 'VP of Sales',
    type: 'promotion',
    avgTimeToTarget: 72,
    successRate: 35,
    employeesOnPath: 11,
    keySkillsToAcquire: [
      'Sales Leadership',
      'Team Coaching',
      'Revenue Forecasting',
      'GTM Strategy',
      'Board Reporting',
    ],
    progression: [
      {
        roleId: 'r-040',
        title: 'Account Executive',
        level: 'Senior',
        department: 'Sales',
        avgTimeInRole: 24,
        avgSalary: 140000,
        requiredSkills: ['Enterprise Sales', 'Negotiation', 'CRM'],
        openings: 8,
      },
      {
        roleId: 'r-041',
        title: 'Sales Manager',
        level: 'Manager',
        department: 'Sales',
        avgTimeInRole: 24,
        avgSalary: 180000,
        requiredSkills: ['Team Management', 'Coaching', 'Pipeline Management'],
        openings: 3,
      },
      {
        roleId: 'r-042',
        title: 'Regional Sales Director',
        level: 'Director',
        department: 'Sales',
        avgTimeInRole: 24,
        avgSalary: 230000,
        requiredSkills: ['Regional Strategy', 'Executive Relationships', 'P&L'],
        openings: 2,
      },
    ],
  },
];

const MOCK_SKILL_MATCH: Record<string, SkillMatch> = {
  'emp-current-int-003': {
    employeeId: 'emp-current',
    jobId: 'int-003',
    overallMatchPercent: 78,
    matchedSkills: [
      { skill: 'Python', proficiency: 'Advanced', required: 'Advanced' },
      { skill: 'Statistical Modeling', proficiency: 'Intermediate', required: 'Intermediate' },
      { skill: 'SQL', proficiency: 'Advanced', required: 'Intermediate' },
      { skill: 'Data Visualization', proficiency: 'Advanced', required: 'Intermediate' },
    ],
    missingSkills: [
      { skill: 'Machine Learning', required: 'Intermediate', learningTime: '3-4 months' },
    ],
    niceToHaveMatched: ['HR Domain Knowledge'],
    developmentPlan: [
      'Complete ML course on internal LMS',
      'Shadow current data scientist for 1 month',
      'Lead a small analytics project',
    ],
    timeToReadiness: '4-6 months',
  },
};

const MOCK_GIG_OPPORTUNITIES: GigOpportunity[] = [
  {
    id: 'gig-001',
    title: 'AI Product Discovery Sprint',
    description:
      'Join the AI team for a 4-week discovery sprint to define the next generation of AI-powered HR features.',
    hostDepartment: 'Product',
    hostTeam: 'AI Innovation Lab',
    duration: '4 weeks',
    hoursPerWeek: 10,
    startDate: '2026-03-01',
    endDate: '2026-03-28',
    location: 'Dubai, UAE',
    isRemote: true,
    requiredSkills: ['Product Thinking', 'AI/ML Awareness', 'Research'],
    status: 'open',
    applicantsCount: 8,
    maxParticipants: 3,
    benefits: ['Networking', 'AI exposure', 'Cross-functional experience'],
    contactName: 'James Liu',
    skillsGained: ['AI Product Management', 'Design Thinking', 'ML Prototyping'],
  },
  {
    id: 'gig-002',
    title: 'Sales Enablement Content Creator',
    description:
      'Help create compelling sales collateral, case studies, and product demos for the EMEA sales team.',
    hostDepartment: 'Sales',
    hostTeam: 'Sales Enablement',
    duration: '6 weeks',
    hoursPerWeek: 8,
    startDate: '2026-03-15',
    endDate: '2026-04-25',
    location: 'Remote',
    isRemote: true,
    requiredSkills: ['Writing', 'Presentation', 'Communication'],
    status: 'open',
    applicantsCount: 4,
    maxParticipants: 2,
    benefits: ['Sales perspective', 'Customer insight', 'Content portfolio'],
    contactName: 'Anna Schmidt',
    skillsGained: ['Storytelling', 'Sales Process', 'Customer Empathy'],
  },
  {
    id: 'gig-003',
    title: 'Data Quality Initiative',
    description:
      'Lead a cross-functional data quality project to improve data accuracy across HR systems.',
    hostDepartment: 'HR Analytics',
    hostTeam: 'Data Governance',
    duration: '8 weeks',
    hoursPerWeek: 15,
    startDate: '2026-03-10',
    endDate: '2026-05-05',
    location: 'Remote',
    isRemote: true,
    requiredSkills: ['Data Analysis', 'SQL', 'Project Coordination'],
    status: 'open',
    applicantsCount: 3,
    maxParticipants: 4,
    benefits: ['Data governance exposure', 'Leadership opportunity', 'Organization-wide impact'],
    contactName: 'Carlos Mendez',
    skillsGained: ['Data Governance', 'Stakeholder Management', 'SQL Advanced'],
  },
  {
    id: 'gig-004',
    title: 'New Office Setup Coordinator',
    description:
      'Help coordinate the setup of our new Riyadh office including vendor management and onboarding logistics.',
    hostDepartment: 'Operations',
    hostTeam: 'Workplace',
    duration: '3 months',
    hoursPerWeek: 5,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    location: 'Riyadh, Saudi Arabia',
    isRemote: false,
    requiredSkills: ['Project Management', 'Vendor Relations', 'Communication'],
    status: 'open',
    applicantsCount: 2,
    maxParticipants: 2,
    benefits: ['Saudi Arabia experience', 'Operational insight', 'C-suite visibility'],
    contactName: 'Tom Baker',
    skillsGained: ['Real Estate / Workplace', 'Operations', 'Project Management'],
  },
  {
    id: 'gig-005',
    title: 'Hackathon Mentor — Tech',
    description:
      'Mentor teams at our internal engineering hackathon. Share your technical expertise and coach participants.',
    hostDepartment: 'Engineering',
    hostTeam: 'Engineering Culture',
    duration: '3 days',
    hoursPerWeek: 40,
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    location: 'Dubai, UAE',
    isRemote: false,
    requiredSkills: ['Software Engineering', 'Mentoring', 'Technical Communication'],
    status: 'open',
    applicantsCount: 12,
    maxParticipants: 10,
    benefits: ['Mentoring experience', 'Recognition', 'Networking'],
    contactName: 'Sarah Chen',
    skillsGained: ['Mentoring', 'Leadership', 'Judging'],
  },
  {
    id: 'gig-006',
    title: 'Customer Advisory Board Liaison',
    description:
      'Be the internal point of contact for our Customer Advisory Board, gathering product feedback and coordinating sessions.',
    hostDepartment: 'Customer Success',
    hostTeam: 'Strategic Accounts',
    duration: '6 months',
    hoursPerWeek: 4,
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    location: 'Remote',
    isRemote: true,
    requiredSkills: ['Customer Facing', 'Communication', 'Product Knowledge'],
    status: 'open',
    applicantsCount: 5,
    maxParticipants: 1,
    benefits: ['Customer exposure', 'Executive networking', 'Product strategy influence'],
    contactName: 'Nina Okonkwo',
    skillsGained: ['Customer Success', 'Relationship Management', 'Strategic Planning'],
  },
];

const MOCK_MENTORS: MentorProfile[] = [
  {
    id: 'mentor-001',
    employeeId: 'emp-100',
    name: 'Sarah Chen',
    title: 'VP Engineering',
    department: 'Engineering',
    expertise: [
      'Engineering Leadership',
      'Technical Architecture',
      'Team Building',
      'Career Growth',
    ],
    yearsExperience: 15,
    bio: 'VP Engineering with 15 years scaling engineering teams at startups and enterprise companies. Passionate about technical leadership development.',
    focusAreas: ['Engineering Management', 'Technical Strategy', 'Career Transitions'],
    menteeCount: 3,
    maxMentees: 5,
    isAvailable: true,
    meetingFrequency: 'Bi-weekly',
    rating: 4.9,
    reviewCount: 24,
    linkedCareerPaths: ['path-001'],
  },
  {
    id: 'mentor-002',
    employeeId: 'emp-101',
    name: 'Carlos Mendez',
    title: 'Director of Analytics',
    department: 'Data',
    expertise: ['Data Science', 'ML Engineering', 'Analytics Strategy', 'Python'],
    yearsExperience: 12,
    bio: 'Transitioned from academic research to data science leadership. Expert in building data science capabilities from scratch.',
    focusAreas: ['Data Science Career', 'ML Engineering', 'Research to Industry'],
    menteeCount: 2,
    maxMentees: 4,
    isAvailable: true,
    meetingFrequency: 'Monthly',
    rating: 4.8,
    reviewCount: 18,
    linkedCareerPaths: ['path-002'],
  },
  {
    id: 'mentor-003',
    employeeId: 'emp-102',
    name: 'Emily Park',
    title: 'Chief People Officer',
    department: 'HR',
    expertise: ['HR Leadership', 'Organizational Design', 'Executive Presence', 'DEI Strategy'],
    yearsExperience: 20,
    bio: 'CPO with global HR leadership experience across tech and consulting. Specialized in scaling HR for hypergrowth companies.',
    focusAreas: ['HR Career Development', 'Leadership', 'Executive Coaching'],
    menteeCount: 4,
    maxMentees: 5,
    isAvailable: true,
    meetingFrequency: 'Monthly',
    rating: 4.9,
    reviewCount: 31,
    linkedCareerPaths: ['path-003'],
  },
  {
    id: 'mentor-004',
    employeeId: 'emp-103',
    name: 'James Liu',
    title: 'Chief Product Officer',
    department: 'Product',
    expertise: ['Product Strategy', 'Product-Market Fit', 'Roadmapping', 'GTM'],
    yearsExperience: 18,
    bio: 'Built and scaled product teams at multiple unicorn startups. Expertise in B2B enterprise products and developer tools.',
    focusAreas: ['Product Management Career', 'Senior PM Development', 'Enterprise Products'],
    menteeCount: 5,
    maxMentees: 5,
    isAvailable: false,
    meetingFrequency: 'Monthly',
    rating: 4.7,
    reviewCount: 29,
    linkedCareerPaths: ['path-004'],
  },
  {
    id: 'mentor-005',
    employeeId: 'emp-104',
    name: 'Anna Schmidt',
    title: 'SVP Sales — EMEA & APAC',
    department: 'Sales',
    expertise: ['Enterprise Sales', 'Sales Strategy', 'Team Building', 'International Markets'],
    yearsExperience: 16,
    bio: 'Built sales organizations from 0 to $100M+ ARR in EMEA and APAC. Expert in enterprise sales motion and cultural adaptation.',
    focusAreas: ['Sales Leadership', 'International Expansion', 'Sales Career'],
    menteeCount: 3,
    maxMentees: 5,
    isAvailable: true,
    meetingFrequency: 'Bi-weekly',
    rating: 4.8,
    reviewCount: 22,
    linkedCareerPaths: ['path-005'],
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class InternalMobilityService {
  /** Get internal job postings */
  static async getInternalPostings(): Promise<InternalPosting[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_INTERNAL_POSTINGS];
  }

  /** Apply to an internal job */
  static async applyInternal(
    jobId: string,
    employeeId: string,
    notes?: string
  ): Promise<InternalApplication> {
    await new Promise((r) => setTimeout(r, 400));
    const posting = MOCK_INTERNAL_POSTINGS.find((p) => p.id === jobId);
    return {
      id: `app-${Date.now()}`,
      jobId,
      jobTitle: posting?.jobTitle ?? 'Position',
      department: posting?.department ?? '',
      employeeId,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      skillMatchPercent: 75,
      notes,
    };
  }

  /** Get internal applications for an employee */
  static async getInternalApplications(employeeId: string): Promise<InternalApplication[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [
      {
        id: 'app-001',
        jobId: 'int-003',
        jobTitle: 'Data Scientist — People Analytics',
        department: 'HR Analytics',
        employeeId,
        appliedDate: '2026-02-14',
        status: 'under_review',
        skillMatchPercent: 78,
        nextStep: 'Hiring manager review',
      },
      {
        id: 'app-002',
        jobId: 'int-001',
        jobTitle: 'Senior Product Manager',
        department: 'Product',
        employeeId,
        appliedDate: '2026-01-20',
        status: 'rejected',
        skillMatchPercent: 62,
        feedback: 'Strong candidate but requires more product management experience.',
      },
    ];
  }

  /** Get career paths, optionally filtered by starting role */
  static async getCareerPaths(_roleId?: string): Promise<CareerPath[]> {
    await new Promise((r) => setTimeout(r, 350));
    return [...MOCK_CAREER_PATHS];
  }

  /** Get skill match percentage between employee and a job */
  static async getSkillMatch(employeeId: string, jobId: string): Promise<SkillMatch> {
    await new Promise((r) => setTimeout(r, 400));
    const key = `${employeeId}-${jobId}`;
    return (
      MOCK_SKILL_MATCH[key] ?? {
        employeeId,
        jobId,
        overallMatchPercent: Math.floor(Math.random() * 30) + 55,
        matchedSkills: [
          { skill: 'Communication', proficiency: 'Advanced', required: 'Intermediate' },
        ],
        missingSkills: [
          { skill: 'Domain Expertise', required: 'Advanced', learningTime: '6-12 months' },
        ],
        niceToHaveMatched: [],
        developmentPlan: ['Take relevant courses', 'Seek stretch project'],
        timeToReadiness: '6-9 months',
      }
    );
  }

  /** Get gig opportunities */
  static async getGigOpportunities(): Promise<GigOpportunity[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_GIG_OPPORTUNITIES];
  }

  /** Apply for a gig */
  static async applyForGig(
    _gigId: string,
    _employeeId: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 300));
    return {
      success: true,
      message: 'Application submitted! The host team will reach out within 3 business days.',
    };
  }

  /** Get mentor matches for an employee */
  static async getMentorMatches(_employeeId: string): Promise<MentorMatch[]> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_MENTORS.filter((m) => m.isAvailable).map((mentor, i) => ({
      mentor,
      compatibilityScore: [94, 87, 82, 78][i] ?? 70,
      matchReasons: [
        `Expertise in ${mentor.focusAreas[0]}`,
        `${mentor.yearsExperience} years of relevant experience`,
        'Aligned career interests',
      ],
    }));
  }

  /** Get all mentors */
  static async getMentors(): Promise<MentorProfile[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_MENTORS];
  }
}
