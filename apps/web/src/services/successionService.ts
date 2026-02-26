/**
 * @module successionService
 * @description Succession Planning — 9-box grid, succession pipelines, readiness tracking,
 *   bench strength analytics, key position management
 * @project AURA HCM Platform
 * @section 10.1 — Succession Planning
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ReadinessLevel = 'Ready Now' | '1-2 Years' | '3-5 Years' | 'Not Ready';
export type PerformanceRating = 'Low' | 'Medium' | 'High';
export type PotentialRating = 'Low' | 'Medium' | 'High';
export type PositionCriticality = 'Critical' | 'Key' | 'Important';

export interface KeyPosition {
  id: string;
  title: string;
  department: string;
  departmentId: string;
  grade: string;
  incumbentId: string | null;
  incumbentName: string | null;
  criticality: PositionCriticality;
  successorCount: number;
  hasReadyNow: boolean;
  riskLevel: 'High' | 'Medium' | 'Low';
  lastReviewed: string;
  nextReviewDate: string;
}

export interface SuccessionCandidate {
  id: string;
  employeeId: string;
  employeeCode: string;
  name: string;
  currentTitle: string;
  department: string;
  grade: string;
  performanceRating: PerformanceRating;
  potentialRating: PotentialRating;
  nineBoxCell: string; // e.g. "H-H", "M-M", "L-H"
  age: number;
  yearsInRole: number;
  keyStrengths: string[];
  developmentAreas: string[];
  mobilityPreference: 'Local' | 'Regional' | 'Global';
  retentionRisk: 'High' | 'Medium' | 'Low';
  avatarInitials: string;
}

export interface SuccessionPlan {
  id: string;
  positionId: string;
  positionTitle: string;
  department: string;
  incumbentName: string | null;
  successors: SuccessionEntry[];
  createdAt: string;
  updatedAt: string;
  reviewedBy: string;
  status: 'Active' | 'Draft' | 'Under Review';
}

export interface SuccessionEntry {
  id: string;
  planId: string;
  candidateId: string;
  candidateName: string;
  candidateTitle: string;
  readiness: ReadinessLevel;
  notes: string;
  addedDate: string;
  developmentActions: string[];
  targetDate: string | null;
}

export interface NineBoxData {
  cells: NineBoxCell[];
  totalEmployees: number;
  departmentId?: string;
}

export interface NineBoxCell {
  performanceLevel: PerformanceRating;
  potentialLevel: PotentialRating;
  cellKey: string; // "H-H", "H-M", etc.
  label: string;
  description: string;
  colorClass: string;
  employees: NineBoxEmployee[];
  count: number;
}

export interface NineBoxEmployee {
  id: string;
  name: string;
  initials: string;
  title: string;
  department: string;
  performanceRating: PerformanceRating;
  potentialRating: PotentialRating;
}

export interface DevelopmentPlan {
  candidateId: string;
  candidateName: string;
  targetPosition: string;
  readiness: ReadinessLevel;
  actions: DevelopmentAction[];
  completionPercentage: number;
  lastUpdated: string;
}

export interface DevelopmentAction {
  id: string;
  type: 'Training' | 'Mentoring' | 'Stretch Assignment' | 'Rotation' | 'Certification' | 'Coaching';
  title: string;
  description: string;
  targetDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  owner: string;
}

export interface SuccessionAnalytics {
  totalKeyPositions: number;
  positionsWithSuccessors: number;
  positionsWithReadyNow: number;
  coverageRate: number; // % positions with at least 1 successor
  readyNowRate: number; // % positions with Ready Now successor
  readinessDistribution: { level: ReadinessLevel; count: number; percentage: number }[];
  benchStrength: number; // avg successors per position
  criticalGaps: number; // positions with 0 successors
  retentionRiskCount: number;
  departmentCoverage: { department: string; coverage: number; gap: number }[];
  pipelineByLevel: { grade: string; count: number }[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_KEY_POSITIONS: KeyPosition[] = [
  {
    id: 'pos-001',
    title: 'Chief Technology Officer',
    department: 'Technology',
    departmentId: 'dept-001',
    grade: 'E1',
    incumbentId: 'emp-001',
    incumbentName: 'Rahul Mehta',
    criticality: 'Critical',
    successorCount: 2,
    hasReadyNow: true,
    riskLevel: 'Low',
    lastReviewed: '2025-12-01',
    nextReviewDate: '2026-06-01',
  },
  {
    id: 'pos-002',
    title: 'VP Human Resources',
    department: 'Human Resources',
    departmentId: 'dept-002',
    grade: 'E2',
    incumbentId: 'emp-002',
    incumbentName: 'Priya Sharma',
    criticality: 'Critical',
    successorCount: 1,
    hasReadyNow: false,
    riskLevel: 'Medium',
    lastReviewed: '2025-11-15',
    nextReviewDate: '2026-05-15',
  },
  {
    id: 'pos-003',
    title: 'Director of Finance',
    department: 'Finance',
    departmentId: 'dept-003',
    grade: 'D1',
    incumbentId: 'emp-003',
    incumbentName: 'Ahmed Al-Rashid',
    criticality: 'Critical',
    successorCount: 0,
    hasReadyNow: false,
    riskLevel: 'High',
    lastReviewed: '2025-10-01',
    nextReviewDate: '2026-04-01',
  },
  {
    id: 'pos-004',
    title: 'Head of Engineering',
    department: 'Technology',
    departmentId: 'dept-001',
    grade: 'D2',
    incumbentId: 'emp-004',
    incumbentName: 'David Chen',
    criticality: 'Key',
    successorCount: 3,
    hasReadyNow: true,
    riskLevel: 'Low',
    lastReviewed: '2026-01-10',
    nextReviewDate: '2026-07-10',
  },
  {
    id: 'pos-005',
    title: 'Chief Marketing Officer',
    department: 'Marketing',
    departmentId: 'dept-004',
    grade: 'E2',
    incumbentId: 'emp-005',
    incumbentName: 'Fatima Al-Hassan',
    criticality: 'Critical',
    successorCount: 1,
    hasReadyNow: true,
    riskLevel: 'Low',
    lastReviewed: '2026-01-20',
    nextReviewDate: '2026-07-20',
  },
  {
    id: 'pos-006',
    title: 'Director of Operations',
    department: 'Operations',
    departmentId: 'dept-005',
    grade: 'D1',
    incumbentId: 'emp-006',
    incumbentName: 'Suresh Kumar',
    criticality: 'Key',
    successorCount: 2,
    hasReadyNow: false,
    riskLevel: 'Medium',
    lastReviewed: '2025-12-15',
    nextReviewDate: '2026-06-15',
  },
  {
    id: 'pos-007',
    title: 'Head of Legal',
    department: 'Legal',
    departmentId: 'dept-006',
    grade: 'D2',
    incumbentId: null,
    incumbentName: null,
    criticality: 'Key',
    successorCount: 0,
    hasReadyNow: false,
    riskLevel: 'High',
    lastReviewed: '2025-09-01',
    nextReviewDate: '2026-03-01',
  },
  {
    id: 'pos-008',
    title: 'VP Product Management',
    department: 'Product',
    departmentId: 'dept-007',
    grade: 'E2',
    incumbentId: 'emp-007',
    incumbentName: 'Kavita Singh',
    criticality: 'Critical',
    successorCount: 2,
    hasReadyNow: false,
    riskLevel: 'Medium',
    lastReviewed: '2026-02-01',
    nextReviewDate: '2026-08-01',
  },
  {
    id: 'pos-009',
    title: 'Director of Sales',
    department: 'Sales',
    departmentId: 'dept-008',
    grade: 'D1',
    incumbentId: 'emp-008',
    incumbentName: 'Anita Nair',
    criticality: 'Key',
    successorCount: 1,
    hasReadyNow: true,
    riskLevel: 'Low',
    lastReviewed: '2026-01-05',
    nextReviewDate: '2026-07-05',
  },
  {
    id: 'pos-010',
    title: 'Head of Customer Success',
    department: 'Operations',
    departmentId: 'dept-005',
    grade: 'D3',
    incumbentId: 'emp-009',
    incumbentName: 'Meera Pillai',
    criticality: 'Important',
    successorCount: 1,
    hasReadyNow: false,
    riskLevel: 'Medium',
    lastReviewed: '2025-11-20',
    nextReviewDate: '2026-05-20',
  },
];

const MOCK_CANDIDATES: SuccessionCandidate[] = [
  {
    id: 'cand-001',
    employeeId: 'emp-011',
    employeeCode: 'EMP011',
    name: 'Arun Krishnan',
    currentTitle: 'Sr. Software Architect',
    department: 'Technology',
    grade: 'M3',
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxCell: 'H-H',
    age: 38,
    yearsInRole: 3,
    keyStrengths: ['Technical Leadership', 'System Design', 'Team Building'],
    developmentAreas: ['Executive Presence', 'Business Strategy'],
    mobilityPreference: 'Global',
    retentionRisk: 'Medium',
    avatarInitials: 'AK',
  },
  {
    id: 'cand-002',
    employeeId: 'emp-012',
    employeeCode: 'EMP012',
    name: 'Sara Mohammed',
    currentTitle: 'Senior HR Business Partner',
    department: 'Human Resources',
    grade: 'M2',
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxCell: 'H-H',
    age: 35,
    yearsInRole: 4,
    keyStrengths: ['Employee Relations', 'Change Management', 'Coaching'],
    developmentAreas: ['Financial Acumen', 'M&A Experience'],
    mobilityPreference: 'Regional',
    retentionRisk: 'Low',
    avatarInitials: 'SM',
  },
  {
    id: 'cand-003',
    employeeId: 'emp-013',
    employeeCode: 'EMP013',
    name: 'Omar Al-Fayyad',
    currentTitle: 'Finance Manager',
    department: 'Finance',
    grade: 'M1',
    performanceRating: 'High',
    potentialRating: 'Medium',
    nineBoxCell: 'H-M',
    age: 42,
    yearsInRole: 6,
    keyStrengths: ['Financial Planning', 'Risk Management', 'Compliance'],
    developmentAreas: ['Digital Finance', 'Leadership Breadth'],
    mobilityPreference: 'Local',
    retentionRisk: 'Low',
    avatarInitials: 'OF',
  },
  {
    id: 'cand-004',
    employeeId: 'emp-014',
    employeeCode: 'EMP014',
    name: 'Natasha Ivanova',
    currentTitle: 'Engineering Manager',
    department: 'Technology',
    grade: 'M2',
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxCell: 'H-H',
    age: 36,
    yearsInRole: 2,
    keyStrengths: ['Agile Delivery', 'Cross-functional Collaboration', 'Hiring'],
    developmentAreas: ['Strategic Planning', 'P&L Management'],
    mobilityPreference: 'Global',
    retentionRisk: 'High',
    avatarInitials: 'NI',
  },
  {
    id: 'cand-005',
    employeeId: 'emp-015',
    employeeCode: 'EMP015',
    name: 'Ravi Shankar',
    currentTitle: 'Product Manager',
    department: 'Product',
    grade: 'M1',
    performanceRating: 'Medium',
    potentialRating: 'High',
    nineBoxCell: 'M-H',
    age: 31,
    yearsInRole: 2,
    keyStrengths: ['Product Vision', 'Customer Insight', 'Data Analysis'],
    developmentAreas: ['Sales Acumen', 'Stakeholder Management'],
    mobilityPreference: 'Global',
    retentionRisk: 'Medium',
    avatarInitials: 'RS',
  },
  {
    id: 'cand-006',
    employeeId: 'emp-016',
    employeeCode: 'EMP016',
    name: 'Layla Hassan',
    currentTitle: 'Marketing Manager',
    department: 'Marketing',
    grade: 'M2',
    performanceRating: 'High',
    potentialRating: 'Medium',
    nineBoxCell: 'H-M',
    age: 39,
    yearsInRole: 5,
    keyStrengths: ['Brand Strategy', 'Digital Marketing', 'Campaign Management'],
    developmentAreas: ['Global Market Strategy', 'Board Presentations'],
    mobilityPreference: 'Regional',
    retentionRisk: 'Low',
    avatarInitials: 'LH',
  },
  {
    id: 'cand-007',
    employeeId: 'emp-017',
    employeeCode: 'EMP017',
    name: 'James Wilson',
    currentTitle: 'Operations Manager',
    department: 'Operations',
    grade: 'M2',
    performanceRating: 'Medium',
    potentialRating: 'Medium',
    nineBoxCell: 'M-M',
    age: 44,
    yearsInRole: 7,
    keyStrengths: ['Process Improvement', 'Cost Management', 'Vendor Relations'],
    developmentAreas: ['Innovation Mindset', 'Digital Transformation'],
    mobilityPreference: 'Local',
    retentionRisk: 'Low',
    avatarInitials: 'JW',
  },
  {
    id: 'cand-008',
    employeeId: 'emp-018',
    employeeCode: 'EMP018',
    name: 'Divya Menon',
    currentTitle: 'Sales Manager',
    department: 'Sales',
    grade: 'M1',
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxCell: 'H-H',
    age: 33,
    yearsInRole: 3,
    keyStrengths: ['Enterprise Sales', 'CRM Expertise', 'Deal Negotiation'],
    developmentAreas: ['Team Management Scale', 'Strategic Accounts'],
    mobilityPreference: 'Regional',
    retentionRisk: 'Medium',
    avatarInitials: 'DM',
  },
  {
    id: 'cand-009',
    employeeId: 'emp-019',
    employeeCode: 'EMP019',
    name: 'Thomas Adeyemi',
    currentTitle: 'Senior Engineer',
    department: 'Technology',
    grade: 'IC4',
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxCell: 'H-H',
    age: 29,
    yearsInRole: 2,
    keyStrengths: ['Cloud Architecture', 'AI/ML', 'Open Source'],
    developmentAreas: ['People Management', 'Business Communication'],
    mobilityPreference: 'Global',
    retentionRisk: 'High',
    avatarInitials: 'TA',
  },
  {
    id: 'cand-010',
    employeeId: 'emp-020',
    employeeCode: 'EMP020',
    name: 'Hina Baig',
    currentTitle: 'HR Manager',
    department: 'Human Resources',
    grade: 'M1',
    performanceRating: 'Medium',
    potentialRating: 'Medium',
    nineBoxCell: 'M-M',
    age: 37,
    yearsInRole: 5,
    keyStrengths: ['Talent Acquisition', 'L&D Program Design', 'Policy Development'],
    developmentAreas: ['Strategic HR', 'Data-Driven HR'],
    mobilityPreference: 'Local',
    retentionRisk: 'Low',
    avatarInitials: 'HB',
  },
  {
    id: 'cand-011',
    employeeId: 'emp-021',
    employeeCode: 'EMP021',
    name: 'Carlos Rodriguez',
    currentTitle: 'Product Lead',
    department: 'Product',
    grade: 'M2',
    performanceRating: 'High',
    potentialRating: 'Medium',
    nineBoxCell: 'H-M',
    age: 40,
    yearsInRole: 4,
    keyStrengths: ['UX Strategy', 'Product Roadmapping', 'Agile'],
    developmentAreas: ['Executive Communication', 'Revenue Ownership'],
    mobilityPreference: 'Global',
    retentionRisk: 'Medium',
    avatarInitials: 'CR',
  },
  {
    id: 'cand-012',
    employeeId: 'emp-022',
    employeeCode: 'EMP022',
    name: 'Zainab Al-Sayed',
    currentTitle: 'Finance Analyst',
    department: 'Finance',
    grade: 'IC3',
    performanceRating: 'Medium',
    potentialRating: 'High',
    nineBoxCell: 'M-H',
    age: 27,
    yearsInRole: 1,
    keyStrengths: ['Financial Modeling', 'Analytics', 'Reporting'],
    developmentAreas: ['Leadership', 'Broader Finance Exposure'],
    mobilityPreference: 'Regional',
    retentionRisk: 'Low',
    avatarInitials: 'ZA',
  },
  {
    id: 'cand-013',
    employeeId: 'emp-023',
    employeeCode: 'EMP023',
    name: 'Patrick Osei',
    currentTitle: 'Customer Success Manager',
    department: 'Operations',
    grade: 'M1',
    performanceRating: 'Medium',
    potentialRating: 'High',
    nineBoxCell: 'M-H',
    age: 32,
    yearsInRole: 2,
    keyStrengths: ['Client Relationships', 'Problem Solving', 'Product Knowledge'],
    developmentAreas: ['Operational Scale', 'Revenue Management'],
    mobilityPreference: 'Global',
    retentionRisk: 'Medium',
    avatarInitials: 'PO',
  },
  {
    id: 'cand-014',
    employeeId: 'emp-024',
    employeeCode: 'EMP024',
    name: 'Elena Petrova',
    currentTitle: 'Legal Manager',
    department: 'Legal',
    grade: 'M2',
    performanceRating: 'High',
    potentialRating: 'Medium',
    nineBoxCell: 'H-M',
    age: 41,
    yearsInRole: 6,
    keyStrengths: ['Contract Law', 'Regulatory Compliance', 'IP Protection'],
    developmentAreas: ['International Law', 'Board Advisory'],
    mobilityPreference: 'Regional',
    retentionRisk: 'Low',
    avatarInitials: 'EP',
  },
  {
    id: 'cand-015',
    employeeId: 'emp-025',
    employeeCode: 'EMP025',
    name: 'Nikhil Joshi',
    currentTitle: 'DevOps Lead',
    department: 'Technology',
    grade: 'IC5',
    performanceRating: 'High',
    potentialRating: 'Medium',
    nineBoxCell: 'H-M',
    age: 34,
    yearsInRole: 3,
    keyStrengths: ['Cloud Infrastructure', 'CI/CD', 'Security'],
    developmentAreas: ['People Leadership', 'Business Strategy'],
    mobilityPreference: 'Local',
    retentionRisk: 'Low',
    avatarInitials: 'NJ',
  },
  {
    id: 'cand-016',
    employeeId: 'emp-026',
    employeeCode: 'EMP026',
    name: 'Amy Tan',
    currentTitle: 'Sales Executive',
    department: 'Sales',
    grade: 'IC3',
    performanceRating: 'Low',
    potentialRating: 'High',
    nineBoxCell: 'L-H',
    age: 26,
    yearsInRole: 1,
    keyStrengths: ['Prospecting', 'Relationship Building', 'Learning Agility'],
    developmentAreas: ['Closing Skills', 'Account Management', 'Product Expertise'],
    mobilityPreference: 'Global',
    retentionRisk: 'Medium',
    avatarInitials: 'AT',
  },
  {
    id: 'cand-017',
    employeeId: 'emp-027',
    employeeCode: 'EMP027',
    name: 'Bilal Chaudhry',
    currentTitle: 'Marketing Analyst',
    department: 'Marketing',
    grade: 'IC2',
    performanceRating: 'Medium',
    potentialRating: 'Medium',
    nineBoxCell: 'M-M',
    age: 28,
    yearsInRole: 2,
    keyStrengths: ['Data Analytics', 'SEO', 'Content Strategy'],
    developmentAreas: ['Leadership', 'Cross-Channel Marketing'],
    mobilityPreference: 'Local',
    retentionRisk: 'Low',
    avatarInitials: 'BC',
  },
  {
    id: 'cand-018',
    employeeId: 'emp-028',
    employeeCode: 'EMP028',
    name: 'Sophie Laurent',
    currentTitle: 'HR Business Partner',
    department: 'Human Resources',
    grade: 'IC4',
    performanceRating: 'High',
    potentialRating: 'Medium',
    nineBoxCell: 'H-M',
    age: 35,
    yearsInRole: 4,
    keyStrengths: ['HRBP', 'Performance Management', 'Conflict Resolution'],
    developmentAreas: ['Strategic HR', 'Global HR Experience'],
    mobilityPreference: 'Global',
    retentionRisk: 'Medium',
    avatarInitials: 'SL',
  },
  {
    id: 'cand-019',
    employeeId: 'emp-029',
    employeeCode: 'EMP029',
    name: 'Raj Patel',
    currentTitle: 'Operations Analyst',
    department: 'Operations',
    grade: 'IC2',
    performanceRating: 'Low',
    potentialRating: 'Medium',
    nineBoxCell: 'L-M',
    age: 25,
    yearsInRole: 1,
    keyStrengths: ['Process Documentation', 'Data Entry Accuracy', 'Compliance'],
    developmentAreas: ['Leadership Initiative', 'Project Ownership', 'Communication'],
    mobilityPreference: 'Local',
    retentionRisk: 'Low',
    avatarInitials: 'RP',
  },
  {
    id: 'cand-020',
    employeeId: 'emp-030',
    employeeCode: 'EMP030',
    name: 'Maria Gonzalez',
    currentTitle: 'Software Engineer',
    department: 'Technology',
    grade: 'IC3',
    performanceRating: 'Low',
    potentialRating: 'Low',
    nineBoxCell: 'L-L',
    age: 30,
    yearsInRole: 2,
    keyStrengths: ['Frontend Development', 'React'],
    developmentAreas: ['Code Quality', 'Ownership', 'Communication', 'Delivery Reliability'],
    mobilityPreference: 'Local',
    retentionRisk: 'High',
    avatarInitials: 'MG',
  },
  {
    id: 'cand-021',
    employeeId: 'emp-031',
    employeeCode: 'EMP031',
    name: 'Yusuf Ibrahim',
    currentTitle: 'Senior Product Manager',
    department: 'Product',
    grade: 'M1',
    performanceRating: 'Medium',
    potentialRating: 'Medium',
    nineBoxCell: 'M-M',
    age: 38,
    yearsInRole: 3,
    keyStrengths: ['Product Strategy', 'Customer Discovery', 'Stakeholder Management'],
    developmentAreas: ['Executive Storytelling', 'Growth Marketing'],
    mobilityPreference: 'Regional',
    retentionRisk: 'Low',
    avatarInitials: 'YI',
  },
  {
    id: 'cand-022',
    employeeId: 'emp-032',
    employeeCode: 'EMP032',
    name: 'Keiko Tanaka',
    currentTitle: 'Data Scientist',
    department: 'Technology',
    grade: 'IC4',
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxCell: 'H-H',
    age: 32,
    yearsInRole: 2,
    keyStrengths: ['AI/ML', 'Python', 'Statistical Analysis', 'Storytelling with Data'],
    developmentAreas: ['Product Thinking', 'Stakeholder Influence'],
    mobilityPreference: 'Global',
    retentionRisk: 'High',
    avatarInitials: 'KT',
  },
  {
    id: 'cand-023',
    employeeId: 'emp-033',
    employeeCode: 'EMP033',
    name: 'Abdulaziz Al-Otaibi',
    currentTitle: 'Business Development Manager',
    department: 'Sales',
    grade: 'M1',
    performanceRating: 'Medium',
    potentialRating: 'Low',
    nineBoxCell: 'M-L',
    age: 45,
    yearsInRole: 8,
    keyStrengths: ['GCC Market Knowledge', 'Government Relations', 'Networking'],
    developmentAreas: ['Innovation Adoption', 'Digital Sales'],
    mobilityPreference: 'Local',
    retentionRisk: 'Low',
    avatarInitials: 'AA',
  },
  {
    id: 'cand-024',
    employeeId: 'emp-034',
    employeeCode: 'EMP034',
    name: 'Preethi Reddy',
    currentTitle: 'Finance Manager',
    department: 'Finance',
    grade: 'M2',
    performanceRating: 'High',
    potentialRating: 'High',
    nineBoxCell: 'H-H',
    age: 37,
    yearsInRole: 5,
    keyStrengths: ['FP&A', 'Treasury Management', 'IFRS Reporting'],
    developmentAreas: ['Strategic Finance', 'Executive Presence'],
    mobilityPreference: 'Regional',
    retentionRisk: 'Low',
    avatarInitials: 'PR',
  },
  {
    id: 'cand-025',
    employeeId: 'emp-035',
    employeeCode: 'EMP035',
    name: 'Hamza Malik',
    currentTitle: 'Customer Success Lead',
    department: 'Operations',
    grade: 'IC4',
    performanceRating: 'Medium',
    potentialRating: 'High',
    nineBoxCell: 'M-H',
    age: 30,
    yearsInRole: 2,
    keyStrengths: ['Client Retention', 'Onboarding', 'Product Expertise'],
    developmentAreas: ['Revenue Expansion', 'Team Leadership'],
    mobilityPreference: 'Global',
    retentionRisk: 'Medium',
    avatarInitials: 'HM',
  },
];

const MOCK_SUCCESSION_PLANS: SuccessionPlan[] = [
  {
    id: 'sp-001',
    positionId: 'pos-001',
    positionTitle: 'Chief Technology Officer',
    department: 'Technology',
    incumbentName: 'Rahul Mehta',
    reviewedBy: 'Priya Sharma',
    status: 'Active',
    createdAt: '2025-06-01',
    updatedAt: '2025-12-01',
    successors: [
      {
        id: 'se-001',
        planId: 'sp-001',
        candidateId: 'cand-001',
        candidateName: 'Arun Krishnan',
        candidateTitle: 'Sr. Software Architect',
        readiness: 'Ready Now',
        notes: 'Strong technical and leadership capabilities. Complete P&L exposure needed.',
        addedDate: '2025-06-01',
        developmentActions: ['Board presentation skills', 'P&L ownership for one product line'],
        targetDate: '2026-06-01',
      },
      {
        id: 'se-002',
        planId: 'sp-001',
        candidateId: 'cand-004',
        candidateName: 'Natasha Ivanova',
        candidateTitle: 'Engineering Manager',
        readiness: '1-2 Years',
        notes: 'High performer with strong team leadership. Needs broader strategic exposure.',
        addedDate: '2025-06-01',
        developmentActions: ['Executive MBA sponsorship', 'Shadow CTO in strategy sessions'],
        targetDate: '2027-06-01',
      },
    ],
  },
  {
    id: 'sp-002',
    positionId: 'pos-004',
    positionTitle: 'Head of Engineering',
    department: 'Technology',
    incumbentName: 'David Chen',
    reviewedBy: 'Priya Sharma',
    status: 'Active',
    createdAt: '2025-01-10',
    updatedAt: '2026-01-10',
    successors: [
      {
        id: 'se-003',
        planId: 'sp-002',
        candidateId: 'cand-004',
        candidateName: 'Natasha Ivanova',
        candidateTitle: 'Engineering Manager',
        readiness: 'Ready Now',
        notes: 'Proven track record in managing 40+ engineers.',
        addedDate: '2025-01-10',
        developmentActions: ['Exposure to M&A technical due diligence'],
        targetDate: '2026-01-01',
      },
      {
        id: 'se-004',
        planId: 'sp-002',
        candidateId: 'cand-001',
        candidateName: 'Arun Krishnan',
        candidateTitle: 'Sr. Software Architect',
        readiness: '1-2 Years',
        notes: 'Strong technical skills. Developing leadership breadth.',
        addedDate: '2025-01-10',
        developmentActions: ['Manage a cross-functional initiative'],
        targetDate: '2027-01-01',
      },
      {
        id: 'se-005',
        planId: 'sp-002',
        candidateId: 'cand-009',
        candidateName: 'Thomas Adeyemi',
        candidateTitle: 'Senior Engineer',
        readiness: '3-5 Years',
        notes: 'High potential IC. Long-term pipeline.',
        addedDate: '2026-01-10',
        developmentActions: ['Tech lead role', 'Mentorship program'],
        targetDate: '2029-01-01',
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const NINE_BOX_META: Record<string, { label: string; description: string; colorClass: string }> = {
  'H-H': {
    label: 'Star',
    description: 'High performer, high potential — future leaders',
    colorClass: 'bg-emerald-100 border-emerald-400 text-emerald-800',
  },
  'H-M': {
    label: 'High Performer',
    description: 'Excels now, moderate future potential',
    colorClass: 'bg-green-100 border-green-400 text-green-800',
  },
  'H-L': {
    label: 'Solid Contributor',
    description: 'High performer, limited growth trajectory',
    colorClass: 'bg-lime-100 border-lime-400 text-lime-800',
  },
  'M-H': {
    label: 'High Potential',
    description: 'Needs development, high growth potential',
    colorClass: 'bg-sky-100 border-sky-400 text-sky-800',
  },
  'M-M': {
    label: 'Core Player',
    description: 'Consistent performer, meets expectations',
    colorClass: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  },
  'M-L': {
    label: 'Effective Specialist',
    description: 'Good performer in current role, limited potential',
    colorClass: 'bg-orange-100 border-orange-400 text-orange-800',
  },
  'L-H': {
    label: 'Enigma',
    description: 'Low performance but high potential — needs coaching',
    colorClass: 'bg-purple-100 border-purple-400 text-purple-800',
  },
  'L-M': {
    label: 'Inconsistent',
    description: 'Below expectations, some growth potential',
    colorClass: 'bg-red-100 border-red-300 text-red-700',
  },
  'L-L': {
    label: 'Risk',
    description: 'Low performance and potential — action required',
    colorClass: 'bg-rose-100 border-rose-500 text-rose-800',
  },
};

// ── Service ────────────────────────────────────────────────────────────────────

export class SuccessionService {
  /**
   * Get succession plan for a given position.
   */
  static async getSuccessionPlan(positionId: string): Promise<SuccessionPlan | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SUCCESSION_PLANS.find((p) => p.positionId === positionId) ?? null;
  }

  /**
   * Get 9-box grid data.
   * Optionally filter by departmentId.
   */
  static async getNineBoxGrid(departmentId?: string): Promise<NineBoxData> {
    await new Promise((r) => setTimeout(r, 200));

    const filtered = departmentId
      ? MOCK_CANDIDATES.filter((c) => {
          const dept = MOCK_KEY_POSITIONS.find((p) => p.departmentId === departmentId);
          return dept ? c.department === dept.department : true;
        })
      : MOCK_CANDIDATES;

    const performanceLevels: PerformanceRating[] = ['High', 'Medium', 'Low'];
    const potentialLevels: PotentialRating[] = ['High', 'Medium', 'Low'];

    const cells: NineBoxCell[] = [];
    for (const perf of performanceLevels) {
      for (const pot of potentialLevels) {
        const key = `${perf.charAt(0)}-${pot.charAt(0)}`;
        const meta = NINE_BOX_META[key];
        const employees = filtered
          .filter((c) => c.nineBoxCell === key)
          .map((c) => ({
            id: c.id,
            name: c.name,
            initials: c.avatarInitials,
            title: c.currentTitle,
            department: c.department,
            performanceRating: c.performanceRating,
            potentialRating: c.potentialRating,
          }));
        cells.push({
          performanceLevel: perf,
          potentialLevel: pot,
          cellKey: key,
          label: meta.label,
          description: meta.description,
          colorClass: meta.colorClass,
          employees,
          count: employees.length,
        });
      }
    }

    return { cells, totalEmployees: filtered.length, departmentId };
  }

  /**
   * Add a successor to a position's succession plan.
   */
  static async addSuccessor(
    positionId: string,
    candidateId: string,
    readiness: ReadinessLevel
  ): Promise<SuccessionEntry> {
    await new Promise((r) => setTimeout(r, 200));
    const candidate = MOCK_CANDIDATES.find((c) => c.id === candidateId);
    const entry: SuccessionEntry = {
      id: `se-${Date.now()}`,
      planId: `sp-${positionId}`,
      candidateId,
      candidateName: candidate?.name ?? 'Unknown',
      candidateTitle: candidate?.currentTitle ?? '',
      readiness,
      notes: '',
      addedDate: new Date().toISOString().slice(0, 10),
      developmentActions: [],
      targetDate: null,
    };

    let plan = MOCK_SUCCESSION_PLANS.find((p) => p.positionId === positionId);
    if (!plan) {
      const position = MOCK_KEY_POSITIONS.find((p) => p.id === positionId);
      plan = {
        id: `sp-${Date.now()}`,
        positionId,
        positionTitle: position?.title ?? '',
        department: position?.department ?? '',
        incumbentName: position?.incumbentName ?? null,
        successors: [],
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        reviewedBy: 'HR Admin',
        status: 'Draft',
      };
      MOCK_SUCCESSION_PLANS.push(plan);
    }
    plan.successors.push(entry);
    return entry;
  }

  /**
   * Update readiness level and notes for a succession entry.
   */
  static async updateReadiness(
    planId: string,
    readiness: ReadinessLevel,
    notes: string
  ): Promise<SuccessionEntry> {
    await new Promise((r) => setTimeout(r, 200));
    for (const plan of MOCK_SUCCESSION_PLANS) {
      const entry = plan.successors.find((e) => e.id === planId);
      if (entry) {
        entry.readiness = readiness;
        entry.notes = notes;
        return entry;
      }
    }
    throw new Error(`Succession entry ${planId} not found`);
  }

  /**
   * List all key/critical positions.
   */
  static async getKeyPositions(): Promise<KeyPosition[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_KEY_POSITIONS];
  }

  /**
   * Return aggregated succession analytics.
   */
  static async getSuccessionAnalytics(): Promise<SuccessionAnalytics> {
    await new Promise((r) => setTimeout(r, 200));

    const positions = MOCK_KEY_POSITIONS;
    const withSuccessors = positions.filter((p) => p.successorCount > 0);
    const withReadyNow = positions.filter((p) => p.hasReadyNow);
    const criticalGaps = positions.filter((p) => p.successorCount === 0);

    const allEntries = MOCK_SUCCESSION_PLANS.flatMap((p) => p.successors);
    const readinessCounts: Record<ReadinessLevel, number> = {
      'Ready Now': allEntries.filter((e) => e.readiness === 'Ready Now').length,
      '1-2 Years': allEntries.filter((e) => e.readiness === '1-2 Years').length,
      '3-5 Years': allEntries.filter((e) => e.readiness === '3-5 Years').length,
      'Not Ready': allEntries.filter((e) => e.readiness === 'Not Ready').length,
    };
    const totalEntries = allEntries.length;

    const readinessDistribution = (Object.keys(readinessCounts) as ReadinessLevel[]).map(
      (level) => ({
        level,
        count: readinessCounts[level],
        percentage: totalEntries ? Math.round((readinessCounts[level] / totalEntries) * 100) : 0,
      })
    );

    const deptMap: Record<string, { total: number; covered: number }> = {};
    for (const p of positions) {
      if (!deptMap[p.department]) deptMap[p.department] = { total: 0, covered: 0 };
      deptMap[p.department].total += 1;
      if (p.successorCount > 0) deptMap[p.department].covered += 1;
    }
    const departmentCoverage = Object.entries(deptMap).map(([department, v]) => ({
      department,
      coverage: Math.round((v.covered / v.total) * 100),
      gap: v.total - v.covered,
    }));

    const gradeMap: Record<string, number> = {};
    for (const c of MOCK_CANDIDATES) {
      gradeMap[c.grade] = (gradeMap[c.grade] ?? 0) + 1;
    }
    const pipelineByLevel = Object.entries(gradeMap).map(([grade, count]) => ({ grade, count }));

    return {
      totalKeyPositions: positions.length,
      positionsWithSuccessors: withSuccessors.length,
      positionsWithReadyNow: withReadyNow.length,
      coverageRate: Math.round((withSuccessors.length / positions.length) * 100),
      readyNowRate: Math.round((withReadyNow.length / positions.length) * 100),
      readinessDistribution,
      benchStrength:
        totalEntries > 0 ? parseFloat((totalEntries / positions.length).toFixed(1)) : 0,
      criticalGaps: criticalGaps.length,
      retentionRiskCount: MOCK_CANDIDATES.filter((c) => c.retentionRisk === 'High').length,
      departmentCoverage,
      pipelineByLevel,
    };
  }

  /**
   * Get individual development plan for a succession candidate.
   */
  static async getDevelopmentPlan(candidateId: string): Promise<DevelopmentPlan | null> {
    await new Promise((r) => setTimeout(r, 200));
    const candidate = MOCK_CANDIDATES.find((c) => c.id === candidateId);
    if (!candidate) return null;

    const actions: DevelopmentAction[] = candidate.developmentAreas.map((area, i) => ({
      id: `da-${candidateId}-${i}`,
      type: (
        [
          'Training',
          'Mentoring',
          'Stretch Assignment',
          'Coaching',
          'Rotation',
          'Certification',
        ] as const
      )[i % 6],
      title: area,
      description: `Development activity to build capability in: ${area}`,
      targetDate: new Date(Date.now() + (i + 1) * 90 * 86400000).toISOString().slice(0, 10),
      status: i === 0 ? 'In Progress' : 'Pending',
      owner: 'Line Manager',
    }));

    const entryReadiness =
      MOCK_SUCCESSION_PLANS.flatMap((p) => p.successors).find((e) => e.candidateId === candidateId)
        ?.readiness ?? 'Not Ready';

    return {
      candidateId,
      candidateName: candidate.name,
      targetPosition: 'TBD',
      readiness: entryReadiness,
      actions,
      completionPercentage: Math.round(
        (actions.filter((a) => a.status === 'Completed').length / actions.length) * 100
      ),
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
  }

  /**
   * Get all succession candidates.
   */
  static async getCandidates(): Promise<SuccessionCandidate[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_CANDIDATES];
  }
}
