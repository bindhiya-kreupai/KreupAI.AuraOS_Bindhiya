/**
 * @module complianceTrainingService
 * @description Compliance Training Engine — SOX/HIPAA/OSHA mandatory training assignments,
 *              certifications, department-level compliance rates, and auto-assignment (Sec 21.3)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type TrainingStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'overdue'
  | 'waived';

export type TrainingFrequency = 'on_hire' | 'annual' | 'quarterly' | 'bi_annual' | 'one_time';

export type TrainingCategory =
  | 'regulatory'
  | 'safety'
  | 'privacy'
  | 'security'
  | 'ethics'
  | 'anti_harassment'
  | 'financial'
  | 'environmental';

export type ContentType = 'video' | 'slides' | 'document' | 'quiz' | 'interactive' | 'webinar';

// ── Training Module ───────────────────────────────────────────────────────────

export interface TrainingModule {
  id: string;
  moduleCode: string;
  title: string;
  description: string;
  category: TrainingCategory;
  frequency: TrainingFrequency;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  contentType: ContentType[];
  isActive: boolean;
  isMandatory: boolean;
  applicableRoles?: string[];
  applicableDepartments?: string[];
  applicableLocations?: string[];
  regulatoryFramework?: string[];
  version: string;
  createdDate: string;
  lastUpdated: string;
  thumbnailUrl?: string;
  tags: string[];
}

// ── Training Assignment ───────────────────────────────────────────────────────

export interface TrainingAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentId: string;
  departmentName: string;
  moduleId: string;
  moduleTitle: string;
  moduleCode: string;
  category: TrainingCategory;
  status: TrainingStatus;
  assignedDate: string;
  dueDate: string;
  startedDate?: string;
  completedDate?: string;
  expiryDate?: string;
  score?: number;
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  progress: number;
  certificateId?: string;
  isOverdue: boolean;
  remindersSent: number;
  assignedBy?: string;
  notes?: string;
}

// ── Certification ─────────────────────────────────────────────────────────────

export interface Certification {
  id: string;
  certificationCode: string;
  employeeId: string;
  employeeName: string;
  moduleId: string;
  moduleTitle: string;
  moduleCode: string;
  issuedDate: string;
  expiryDate: string;
  score: number;
  isValid: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
  pdfUrl?: string;
}

// ── Department Compliance ─────────────────────────────────────────────────────

export interface DepartmentCompliance {
  departmentId: string;
  departmentName: string;
  totalEmployees: number;
  compliantEmployees: number;
  complianceRate: number;
  overdueCount: number;
  expiringCount: number;
  notStartedCount: number;
  inProgressCount: number;
  trainings: {
    moduleId: string;
    moduleTitle: string;
    compliantCount: number;
    overdueCount: number;
    complianceRate: number;
  }[];
}

// ── Auto-assign criteria ──────────────────────────────────────────────────────

export interface AutoAssignCriteria {
  roles?: string[];
  departments?: string[];
  locations?: string[];
  employmentTypes?: ('full_time' | 'part_time' | 'contractor' | 'intern')[];
  onHire?: boolean;
  effectiveDate?: string;
  dueDays?: number;
}

// ── Filters ───────────────────────────────────────────────────────────────────

export interface TrainingFilters {
  employeeId?: string;
  departmentId?: string;
  status?: TrainingStatus;
  category?: TrainingCategory;
  moduleId?: string;
  isOverdue?: boolean;
  page?: number;
  pageSize?: number;
}

// ── Training Content (for player) ─────────────────────────────────────────────

export interface TrainingContent {
  assignmentId: string;
  moduleId: string;
  title: string;
  description: string;
  sections: TrainingSection[];
  totalSections: number;
  currentSection: number;
  progress: number;
  quiz?: TrainingQuiz;
}

export interface TrainingSection {
  id: string;
  order: number;
  title: string;
  type: ContentType;
  contentUrl?: string;
  duration: number;
  isCompleted: boolean;
  slides?: TrainingSlide[];
}

export interface TrainingSlide {
  id: string;
  order: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export interface TrainingQuiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MODULES: TrainingModule[] = [
  {
    id: 'mod-001',
    moduleCode: 'CT-SOX-001',
    title: 'SOX Compliance Training',
    description:
      'Sarbanes-Oxley Act compliance training covering internal controls, financial reporting, and audit requirements.',
    category: 'financial',
    frequency: 'annual',
    durationMinutes: 90,
    passingScore: 80,
    maxAttempts: 3,
    contentType: ['video', 'quiz'],
    isActive: true,
    isMandatory: true,
    applicableDepartments: ['Finance', 'Accounting', 'IT', 'Internal Audit'],
    regulatoryFramework: ['SOX'],
    version: '3.2',
    createdDate: '2024-01-01',
    lastUpdated: '2025-12-15',
    tags: ['sox', 'financial', 'internal-controls', 'mandatory'],
  },
  {
    id: 'mod-002',
    moduleCode: 'CT-HIPAA-001',
    title: 'HIPAA Privacy & Security',
    description:
      'Health Insurance Portability and Accountability Act training covering patient data privacy, security rules, and breach notification.',
    category: 'privacy',
    frequency: 'annual',
    durationMinutes: 60,
    passingScore: 85,
    maxAttempts: 3,
    contentType: ['video', 'slides', 'quiz'],
    isActive: true,
    isMandatory: true,
    applicableDepartments: ['Healthcare', 'HR', 'IT'],
    regulatoryFramework: ['HIPAA'],
    version: '2.1',
    createdDate: '2024-01-01',
    lastUpdated: '2025-11-01',
    tags: ['hipaa', 'privacy', 'healthcare', 'mandatory'],
  },
  {
    id: 'mod-003',
    moduleCode: 'CT-OSHA-001',
    title: 'OSHA Workplace Safety',
    description:
      'Occupational Safety and Health Administration training covering hazard identification, PPE, emergency procedures, and incident reporting.',
    category: 'safety',
    frequency: 'annual',
    durationMinutes: 120,
    passingScore: 80,
    maxAttempts: 3,
    contentType: ['video', 'interactive', 'quiz'],
    isActive: true,
    isMandatory: true,
    regulatoryFramework: ['OSHA'],
    version: '4.0',
    createdDate: '2024-01-01',
    lastUpdated: '2025-10-01',
    tags: ['osha', 'safety', 'workplace', 'mandatory'],
  },
  {
    id: 'mod-004',
    moduleCode: 'CT-AH-001',
    title: 'Anti-Harassment & Discrimination',
    description:
      'Understanding workplace harassment, discrimination, reporting procedures, bystander intervention, and creating an inclusive workplace.',
    category: 'anti_harassment',
    frequency: 'annual',
    durationMinutes: 75,
    passingScore: 80,
    maxAttempts: 2,
    contentType: ['video', 'interactive', 'quiz'],
    isActive: true,
    isMandatory: true,
    version: '2.3',
    createdDate: '2024-01-01',
    lastUpdated: '2025-09-15',
    tags: ['harassment', 'discrimination', 'dei', 'mandatory'],
  },
  {
    id: 'mod-005',
    moduleCode: 'CT-GDPR-001',
    title: 'Data Protection & GDPR Awareness',
    description:
      'General Data Protection Regulation training covering data rights, lawful processing, consent management, and breach response.',
    category: 'privacy',
    frequency: 'annual',
    durationMinutes: 60,
    passingScore: 75,
    maxAttempts: 3,
    contentType: ['slides', 'quiz'],
    isActive: true,
    isMandatory: true,
    regulatoryFramework: ['GDPR'],
    version: '1.8',
    createdDate: '2024-01-01',
    lastUpdated: '2025-11-20',
    tags: ['gdpr', 'data-protection', 'privacy', 'mandatory'],
  },
  {
    id: 'mod-006',
    moduleCode: 'CT-ISA-001',
    title: 'Information Security Awareness',
    description:
      'Phishing awareness, password security, data handling, incident reporting, and social engineering defense.',
    category: 'security',
    frequency: 'quarterly',
    durationMinutes: 30,
    passingScore: 70,
    maxAttempts: 3,
    contentType: ['interactive', 'quiz'],
    isActive: true,
    isMandatory: true,
    version: '5.1',
    createdDate: '2024-01-01',
    lastUpdated: '2025-12-01',
    tags: ['security', 'phishing', 'password', 'mandatory'],
  },
  {
    id: 'mod-007',
    moduleCode: 'CT-COC-001',
    title: 'Code of Conduct',
    description:
      'Company values, ethical decision-making, conflict of interest, gifts policy, whistleblower protections, and reporting channels.',
    category: 'ethics',
    frequency: 'annual',
    durationMinutes: 45,
    passingScore: 80,
    maxAttempts: 2,
    contentType: ['slides', 'quiz'],
    isActive: true,
    isMandatory: true,
    version: '3.0',
    createdDate: '2024-01-01',
    lastUpdated: '2025-08-01',
    tags: ['ethics', 'conduct', 'values', 'on-hire', 'mandatory'],
  },
  {
    id: 'mod-008',
    moduleCode: 'CT-AML-001',
    title: 'Anti-Money Laundering (AML)',
    description:
      'Know Your Customer requirements, suspicious transaction reporting, AML policies, and regulatory obligations for financial sector employees.',
    category: 'financial',
    frequency: 'annual',
    durationMinutes: 90,
    passingScore: 85,
    maxAttempts: 3,
    contentType: ['video', 'quiz'],
    isActive: true,
    isMandatory: true,
    applicableDepartments: ['Finance', 'Banking', 'Compliance', 'Risk'],
    regulatoryFramework: ['BSA', 'FinCEN', 'FATF'],
    version: '2.0',
    createdDate: '2024-01-01',
    lastUpdated: '2025-10-15',
    tags: ['aml', 'financial', 'banking', 'mandatory'],
  },
];

const MOCK_ASSIGNMENTS: TrainingAssignment[] = [
  {
    id: 'asgn-001',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    moduleId: 'mod-001',
    moduleTitle: 'SOX Compliance Training',
    moduleCode: 'CT-SOX-001',
    category: 'financial',
    status: 'in_progress',
    assignedDate: '2026-01-01',
    dueDate: '2026-03-01',
    startedDate: '2026-02-10',
    passingScore: 80,
    attempts: 0,
    maxAttempts: 3,
    progress: 45,
    isOverdue: false,
    remindersSent: 1,
  },
  {
    id: 'asgn-002',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    moduleId: 'mod-006',
    moduleTitle: 'Information Security Awareness',
    moduleCode: 'CT-ISA-001',
    category: 'security',
    status: 'completed',
    assignedDate: '2026-01-01',
    dueDate: '2026-02-01',
    startedDate: '2026-01-15',
    completedDate: '2026-01-18',
    expiryDate: '2026-04-01',
    score: 92,
    passingScore: 70,
    attempts: 1,
    maxAttempts: 3,
    progress: 100,
    certificateId: 'cert-001',
    isOverdue: false,
    remindersSent: 0,
  },
  {
    id: 'asgn-003',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    moduleId: 'mod-004',
    moduleTitle: 'Anti-Harassment & Discrimination',
    moduleCode: 'CT-AH-001',
    category: 'anti_harassment',
    status: 'overdue',
    assignedDate: '2025-12-01',
    dueDate: '2026-01-31',
    passingScore: 80,
    attempts: 0,
    maxAttempts: 2,
    progress: 0,
    isOverdue: true,
    remindersSent: 3,
  },
  {
    id: 'asgn-004',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    moduleId: 'mod-007',
    moduleTitle: 'Code of Conduct',
    moduleCode: 'CT-COC-001',
    category: 'ethics',
    status: 'not_started',
    assignedDate: '2026-01-15',
    dueDate: '2026-04-15',
    passingScore: 80,
    attempts: 0,
    maxAttempts: 2,
    progress: 0,
    isOverdue: false,
    remindersSent: 0,
  },
  {
    id: 'asgn-005',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    employeeEmail: 'john.smith@company.com',
    departmentId: 'dept-005',
    departmentName: 'Sales & Marketing',
    moduleId: 'mod-004',
    moduleTitle: 'Anti-Harassment & Discrimination',
    moduleCode: 'CT-AH-001',
    category: 'anti_harassment',
    status: 'completed',
    assignedDate: '2026-01-01',
    dueDate: '2026-02-28',
    startedDate: '2026-01-20',
    completedDate: '2026-01-22',
    expiryDate: '2027-01-22',
    score: 88,
    passingScore: 80,
    attempts: 1,
    maxAttempts: 2,
    progress: 100,
    certificateId: 'cert-002',
    isOverdue: false,
    remindersSent: 0,
  },
];

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-001',
    certificationCode: 'CERT-2026-ISA-001',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    moduleId: 'mod-006',
    moduleTitle: 'Information Security Awareness',
    moduleCode: 'CT-ISA-001',
    issuedDate: '2026-01-18',
    expiryDate: '2026-04-18',
    score: 92,
    isValid: true,
    isExpiringSoon: true,
    daysUntilExpiry: 52,
    pdfUrl: '/certs/cert-001.pdf',
  },
  {
    id: 'cert-002',
    certificationCode: 'CERT-2026-AH-002',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    moduleId: 'mod-004',
    moduleTitle: 'Anti-Harassment & Discrimination',
    moduleCode: 'CT-AH-001',
    issuedDate: '2025-02-15',
    expiryDate: '2026-02-15',
    score: 85,
    isValid: false,
    isExpiringSoon: false,
    daysUntilExpiry: -10,
    pdfUrl: '/certs/cert-002.pdf',
  },
];

const MOCK_DEPARTMENT_COMPLIANCE: DepartmentCompliance[] = [
  {
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    totalEmployees: 45,
    compliantEmployees: 38,
    complianceRate: 84.4,
    overdueCount: 5,
    expiringCount: 8,
    notStartedCount: 12,
    inProgressCount: 10,
    trainings: [
      {
        moduleId: 'mod-001',
        moduleTitle: 'SOX Compliance',
        compliantCount: 40,
        overdueCount: 2,
        complianceRate: 88.9,
      },
      {
        moduleId: 'mod-006',
        moduleTitle: 'InfoSec Awareness',
        compliantCount: 38,
        overdueCount: 5,
        complianceRate: 84.4,
      },
      {
        moduleId: 'mod-004',
        moduleTitle: 'Anti-Harassment',
        compliantCount: 35,
        overdueCount: 3,
        complianceRate: 77.8,
      },
    ],
  },
  {
    departmentId: 'dept-005',
    departmentName: 'Sales & Marketing',
    totalEmployees: 30,
    compliantEmployees: 28,
    complianceRate: 93.3,
    overdueCount: 1,
    expiringCount: 3,
    notStartedCount: 4,
    inProgressCount: 6,
    trainings: [
      {
        moduleId: 'mod-004',
        moduleTitle: 'Anti-Harassment',
        compliantCount: 28,
        overdueCount: 1,
        complianceRate: 93.3,
      },
      {
        moduleId: 'mod-006',
        moduleTitle: 'InfoSec Awareness',
        compliantCount: 27,
        overdueCount: 2,
        complianceRate: 90.0,
      },
    ],
  },
  {
    departmentId: 'dept-003',
    departmentName: 'Human Resources',
    totalEmployees: 15,
    compliantEmployees: 15,
    complianceRate: 100,
    overdueCount: 0,
    expiringCount: 2,
    notStartedCount: 0,
    inProgressCount: 1,
    trainings: [
      {
        moduleId: 'mod-004',
        moduleTitle: 'Anti-Harassment',
        compliantCount: 15,
        overdueCount: 0,
        complianceRate: 100,
      },
      {
        moduleId: 'mod-007',
        moduleTitle: 'Code of Conduct',
        compliantCount: 14,
        overdueCount: 0,
        complianceRate: 93.3,
      },
    ],
  },
  {
    departmentId: 'dept-004',
    departmentName: 'Finance',
    totalEmployees: 20,
    compliantEmployees: 17,
    complianceRate: 85.0,
    overdueCount: 3,
    expiringCount: 4,
    notStartedCount: 6,
    inProgressCount: 3,
    trainings: [
      {
        moduleId: 'mod-001',
        moduleTitle: 'SOX Compliance',
        compliantCount: 19,
        overdueCount: 1,
        complianceRate: 95.0,
      },
      {
        moduleId: 'mod-008',
        moduleTitle: 'AML',
        compliantCount: 15,
        overdueCount: 3,
        complianceRate: 75.0,
      },
    ],
  },
];

const MOCK_CONTENT: TrainingContent = {
  assignmentId: 'asgn-001',
  moduleId: 'mod-001',
  title: 'SOX Compliance Training',
  description: 'This training covers the key requirements of the Sarbanes-Oxley Act.',
  totalSections: 4,
  currentSection: 0,
  progress: 0,
  sections: [
    {
      id: 'sec-001',
      order: 1,
      title: 'Introduction to SOX',
      type: 'video',
      contentUrl: 'https://example.com/sox-intro.mp4',
      duration: 15,
      isCompleted: false,
      slides: [],
    },
    {
      id: 'sec-002',
      order: 2,
      title: 'Internal Controls Framework',
      type: 'slides',
      duration: 25,
      isCompleted: false,
      slides: [
        {
          id: 'sl-001',
          order: 1,
          title: 'What are Internal Controls?',
          content:
            'Internal controls are processes implemented by management to provide reasonable assurance about achieving objectives in operations, reporting, and compliance.',
        },
        {
          id: 'sl-002',
          order: 2,
          title: 'COSO Framework',
          content:
            'The Committee of Sponsoring Organizations (COSO) framework provides guidance on internal control design and implementation.',
        },
        {
          id: 'sl-003',
          order: 3,
          title: 'Key Control Activities',
          content:
            'Control activities include authorizations, verifications, reconciliations, reviews of operating performance, and segregation of duties.',
        },
      ],
    },
    {
      id: 'sec-003',
      order: 3,
      title: 'Financial Reporting Requirements',
      type: 'slides',
      duration: 20,
      isCompleted: false,
      slides: [
        {
          id: 'sl-004',
          order: 1,
          title: 'Section 302 Certification',
          content:
            'CEOs and CFOs must personally certify the accuracy of financial reports filed with the SEC.',
        },
        {
          id: 'sl-005',
          order: 2,
          title: 'Section 404 Requirements',
          content:
            'Management must assess the effectiveness of internal controls over financial reporting annually.',
        },
      ],
    },
    {
      id: 'sec-004',
      order: 4,
      title: 'Assessment Quiz',
      type: 'quiz',
      duration: 15,
      isCompleted: false,
    },
  ],
  quiz: {
    id: 'quiz-001',
    passingScore: 80,
    timeLimit: 20,
    questions: [
      {
        id: 'q-001',
        question: 'What does SOX stand for?',
        options: [
          { id: 'a', text: 'Securities and Options Exchange Act' },
          { id: 'b', text: 'Sarbanes-Oxley Act' },
          { id: 'c', text: 'Standard Operating Excellence Act' },
          { id: 'd', text: 'Systems Operations Exchange Act' },
        ],
        correctOptionId: 'b',
        explanation:
          'SOX stands for the Sarbanes-Oxley Act, enacted in 2002 in response to major corporate accounting scandals.',
      },
      {
        id: 'q-002',
        question: 'Under SOX Section 302, who must certify the accuracy of financial reports?',
        options: [
          { id: 'a', text: 'External auditors' },
          { id: 'b', text: 'Board of Directors' },
          { id: 'c', text: 'CEO and CFO' },
          { id: 'd', text: 'Controller and Treasurer' },
        ],
        correctOptionId: 'c',
        explanation:
          'Section 302 requires the CEO and CFO to personally certify the accuracy and completeness of financial reports.',
      },
      {
        id: 'q-003',
        question: 'What is the primary purpose of internal controls?',
        options: [
          { id: 'a', text: 'To maximize profit' },
          { id: 'b', text: 'To reduce employee workload' },
          {
            id: 'c',
            text: 'To provide reasonable assurance about achieving operational, reporting, and compliance objectives',
          },
          { id: 'd', text: 'To replace external audits' },
        ],
        correctOptionId: 'c',
        explanation:
          'Internal controls are designed to provide reasonable assurance that an organization achieves its objectives across operations, reporting, and compliance.',
      },
      {
        id: 'q-004',
        question:
          'Which framework is commonly used for evaluating internal control effectiveness under SOX?',
        options: [
          { id: 'a', text: 'ISO 27001' },
          { id: 'b', text: 'COSO Framework' },
          { id: 'c', text: 'ITIL Framework' },
          { id: 'd', text: 'COBIT Framework' },
        ],
        correctOptionId: 'b',
        explanation:
          'The COSO (Committee of Sponsoring Organizations) framework is the most widely used standard for evaluating internal controls under SOX Section 404.',
      },
      {
        id: 'q-005',
        question: 'What must happen if a material weakness in internal controls is identified?',
        options: [
          { id: 'a', text: 'It can be kept confidential' },
          { id: 'b', text: 'It must be reported to external auditors only' },
          { id: 'c', text: 'It must be disclosed in the annual report' },
          { id: 'd', text: 'It only needs to be addressed within 5 years' },
        ],
        correctOptionId: 'c',
        explanation:
          "Material weaknesses in internal controls must be publicly disclosed in the company's annual report (10-K), along with management's assessment.",
      },
    ],
  },
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ComplianceTrainingService {
  /**
   * Get all assigned trainings for an employee
   */
  static async getAssignedTrainings(
    employeeId: string,
    filters?: TrainingFilters
  ): Promise<TrainingAssignment[]> {
    try {
      return await APIClient.get<TrainingAssignment[]>(`/v1/compliance-training/assignments`, {
        employeeId,
        ...filters,
      });
    } catch {
      let results = MOCK_ASSIGNMENTS.filter((a) => a.employeeId === employeeId);
      if (filters?.status) results = results.filter((a) => a.status === filters.status);
      if (filters?.category) results = results.filter((a) => a.category === filters.category);
      if (filters?.isOverdue !== undefined)
        results = results.filter((a) => a.isOverdue === filters.isOverdue);
      return results;
    }
  }

  /**
   * Get all available compliance training modules
   */
  static async getTrainingModules(filters?: {
    category?: TrainingCategory;
    isMandatory?: boolean;
    isActive?: boolean;
  }): Promise<TrainingModule[]> {
    try {
      return await APIClient.get<TrainingModule[]>('/v1/compliance-training/modules', filters);
    } catch {
      let results = [...MOCK_MODULES];
      if (filters?.category) results = results.filter((m) => m.category === filters.category);
      if (filters?.isMandatory !== undefined)
        results = results.filter((m) => m.isMandatory === filters.isMandatory);
      if (filters?.isActive !== undefined)
        results = results.filter((m) => m.isActive === filters.isActive);
      return results;
    }
  }

  /**
   * Mark a training assignment as in-progress / start the training
   */
  static async startTraining(assignmentId: string): Promise<TrainingAssignment> {
    try {
      return await APIClient.post<TrainingAssignment>(
        `/v1/compliance-training/assignments/${assignmentId}/start`,
        {}
      );
    } catch {
      const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);
      assignment.status = 'in_progress';
      assignment.startedDate = new Date().toISOString();
      return assignment;
    }
  }

  /**
   * Mark training as complete with a score
   */
  static async completeTraining(assignmentId: string, score: number): Promise<TrainingAssignment> {
    try {
      return await APIClient.post<TrainingAssignment>(
        `/v1/compliance-training/assignments/${assignmentId}/complete`,
        { score }
      );
    } catch {
      const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);
      assignment.status = score >= assignment.passingScore ? 'completed' : 'in_progress';
      assignment.score = score;
      assignment.attempts += 1;
      assignment.progress = 100;
      if (assignment.status === 'completed') {
        assignment.completedDate = new Date().toISOString();
        // Set expiry 1 year from now for annual trainings
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        assignment.expiryDate = expiry.toISOString();
        assignment.certificateId = `cert-${Date.now()}`;
      }
      return assignment;
    }
  }

  /**
   * Update progress within a training session
   */
  static async updateProgress(
    assignmentId: string,
    progress: number,
    sectionId?: string
  ): Promise<TrainingAssignment> {
    try {
      return await APIClient.put<TrainingAssignment>(
        `/v1/compliance-training/assignments/${assignmentId}/progress`,
        { progress, sectionId }
      );
    } catch {
      const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);
      assignment.progress = progress;
      return assignment;
    }
  }

  /**
   * Get certifications for an employee
   */
  static async getCertifications(employeeId: string): Promise<Certification[]> {
    try {
      return await APIClient.get<Certification[]>(`/v1/compliance-training/certifications`, {
        employeeId,
      });
    } catch {
      return MOCK_CERTIFICATIONS.filter((c) => c.employeeId === employeeId);
    }
  }

  /**
   * Get department-level compliance rates
   */
  static async getComplianceStatus(departmentId?: string): Promise<DepartmentCompliance[]> {
    try {
      return await APIClient.get<DepartmentCompliance[]>(
        '/v1/compliance-training/compliance-status',
        {
          departmentId,
        }
      );
    } catch {
      if (departmentId) {
        return MOCK_DEPARTMENT_COMPLIANCE.filter((d) => d.departmentId === departmentId);
      }
      return MOCK_DEPARTMENT_COMPLIANCE;
    }
  }

  /**
   * Auto-assign a training module to employees matching criteria
   */
  static async autoAssignTraining(
    trainingId: string,
    criteria: AutoAssignCriteria
  ): Promise<{ assigned: number; skipped: number; errors: number }> {
    try {
      return await APIClient.post<{ assigned: number; skipped: number; errors: number }>(
        `/v1/compliance-training/auto-assign`,
        { trainingId, criteria }
      );
    } catch {
      // Simulate assignment
      return {
        assigned: Math.floor(Math.random() * 50) + 10,
        skipped: Math.floor(Math.random() * 5),
        errors: 0,
      };
    }
  }

  /**
   * Get training content for the player
   */
  static async getTrainingContent(assignmentId: string): Promise<TrainingContent> {
    try {
      return await APIClient.get<TrainingContent>(
        `/v1/compliance-training/assignments/${assignmentId}/content`
      );
    } catch {
      return { ...MOCK_CONTENT, assignmentId };
    }
  }

  /**
   * Get all assignments (admin view) with optional filters
   */
  static async getAllAssignments(filters?: TrainingFilters): Promise<TrainingAssignment[]> {
    try {
      return await APIClient.get<TrainingAssignment[]>(
        '/v1/compliance-training/assignments/all',
        filters
      );
    } catch {
      let results = [...MOCK_ASSIGNMENTS];
      if (filters?.status) results = results.filter((a) => a.status === filters.status);
      if (filters?.category) results = results.filter((a) => a.category === filters.category);
      if (filters?.departmentId)
        results = results.filter((a) => a.departmentId === filters.departmentId);
      if (filters?.isOverdue !== undefined)
        results = results.filter((a) => a.isOverdue === filters.isOverdue);
      return results;
    }
  }

  /**
   * Create a manual training assignment
   */
  static async createAssignment(data: {
    employeeIds: string[];
    moduleId: string;
    dueDate: string;
    notes?: string;
  }): Promise<{ created: number; errors: string[] }> {
    try {
      return await APIClient.post<{ created: number; errors: string[] }>(
        '/v1/compliance-training/assignments',
        data
      );
    } catch {
      return { created: data.employeeIds.length, errors: [] };
    }
  }

  /**
   * Send reminder for overdue or upcoming trainings
   */
  static async sendReminder(assignmentIds: string[]): Promise<{ sent: number }> {
    try {
      return await APIClient.post<{ sent: number }>('/v1/compliance-training/reminders', {
        assignmentIds,
      });
    } catch {
      return { sent: assignmentIds.length };
    }
  }
}

// ============================================================================
// CONSTANTS / META
// ============================================================================

export const TRAINING_STATUS_META: Record<
  TrainingStatus,
  { label: string; color: string; bgColor: string }
> = {
  not_started: { label: 'Not Started', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  completed: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  expired: { label: 'Expired', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  overdue: { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50' },
  waived: { label: 'Waived', color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

export const TRAINING_CATEGORY_META: Record<
  TrainingCategory,
  { label: string; icon: string; color: string }
> = {
  regulatory: { label: 'Regulatory', icon: 'Scale', color: 'text-blue-600' },
  safety: { label: 'Safety', icon: 'HardHat', color: 'text-yellow-600' },
  privacy: { label: 'Privacy', icon: 'Lock', color: 'text-violet-600' },
  security: { label: 'Security', icon: 'Shield', color: 'text-indigo-600' },
  ethics: { label: 'Ethics', icon: 'BookOpen', color: 'text-teal-600' },
  anti_harassment: { label: 'Anti-Harassment', icon: 'Users', color: 'text-rose-600' },
  financial: { label: 'Financial', icon: 'DollarSign', color: 'text-emerald-600' },
  environmental: { label: 'Environmental', icon: 'Leaf', color: 'text-green-600' },
};

export const FREQUENCY_META: Record<TrainingFrequency, { label: string; daysValid: number }> = {
  on_hire: { label: 'On Hire', daysValid: 365 },
  annual: { label: 'Annual', daysValid: 365 },
  bi_annual: { label: 'Bi-Annual', daysValid: 180 },
  quarterly: { label: 'Quarterly', daysValid: 90 },
  one_time: { label: 'One Time', daysValid: 9999 },
};
