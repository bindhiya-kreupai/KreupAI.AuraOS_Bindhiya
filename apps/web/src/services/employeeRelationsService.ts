/**
 * @module employeeRelationsService
 * @description Employee Relations (ER) case management — grievances, disciplinary actions,
 *   harassment investigations, policy violations, workplace conflicts.
 *   Confidentiality controls are critical: case details should only be visible to
 *   HR, assigned investigator, and parties (with appropriate masking).
 * @project AURA HCM Platform
 * @section 10.3 — Employee Relations
 * @legal Complies with UAE Labour Law (Federal Decree-Law No. 33 of 2021) and
 *   KSA Labour Law regarding grievance procedures, disciplinary policies, and
 *   anti-harassment regulations.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ERCaseType =
  | 'Grievance'
  | 'Disciplinary'
  | 'Harassment'
  | 'Discrimination'
  | 'Policy Violation'
  | 'Workplace Conflict'
  | 'Whistleblower'
  | 'Performance Improvement';

export type ERCaseSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type ERCaseStatus =
  | 'Open'
  | 'Under Investigation'
  | 'Pending Review'
  | 'Resolved'
  | 'Closed'
  | 'Escalated'
  | 'Withdrawn';

export interface ERCase {
  id: string;
  caseNumber: string;
  type: ERCaseType;
  severity: ERCaseSeverity;
  status: ERCaseStatus;
  title: string;
  description: string;
  complainantId: string;
  complainantName: string;
  complainantDepartment: string;
  respondentId: string | null;
  respondentName: string | null;
  respondentDepartment: string | null;
  assignedInvestigatorId: string | null;
  assignedInvestigatorName: string | null;
  openedDate: string;
  targetResolutionDate: string;
  resolvedDate: string | null;
  closedDate: string | null;
  daysOpen: number;
  isAnonymous: boolean;
  isConfidential: boolean;
  tags: string[];
  location: string;
  relatedCaseIds: string[];
  actionItems: ActionItem[];
  timeline: TimelineEvent[];
  documents: CaseDocument[];
  resolution: CaseResolution | null;
}

export interface ActionItem {
  id: string;
  caseId: string;
  title: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
  completedDate: string | null;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  eventType:
    | 'Case Opened'
    | 'Note Added'
    | 'Status Changed'
    | 'Investigator Assigned'
    | 'Document Added'
    | 'Interview Conducted'
    | 'Action Item Created'
    | 'Resolution Submitted'
    | 'Case Closed'
    | 'Escalated';
  description: string;
  performedBy: string;
  isConfidential: boolean;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  type: 'Statement' | 'Evidence' | 'Policy' | 'Communication' | 'Resolution Letter' | 'Other';
  uploadedBy: string;
  uploadedDate: string;
  isConfidential: boolean;
  sizeKb: number;
}

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  addedBy: string;
  addedDate: string;
  isConfidential: boolean;
}

export interface CaseResolution {
  findings: string;
  outcomeType:
    | 'Substantiated'
    | 'Partially Substantiated'
    | 'Unsubstantiated'
    | 'Inconclusive'
    | 'Withdrawn';
  actionsTaken: string[];
  followUpRequired: boolean;
  followUpDate: string | null;
  followUpNotes: string;
  resolvedBy: string;
  resolvedDate: string;
}

export interface ERCaseAnalytics {
  totalCases: number;
  openCases: number;
  resolvedThisMonth: number;
  avgResolutionDays: number;
  byType: { type: ERCaseType; count: number; percentage: number }[];
  bySeverity: { severity: ERCaseSeverity; count: number }[];
  byStatus: { status: ERCaseStatus; count: number }[];
  monthlyTrend: { month: string; opened: number; resolved: number }[];
  overdueActionItems: number;
  escalatedCases: number;
}

export interface ERFilters {
  status?: ERCaseStatus[];
  type?: ERCaseType[];
  severity?: ERCaseSeverity[];
  investigatorId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_CASES: ERCase[] = [
  {
    id: 'erc-001',
    caseNumber: 'ER-2026-001',
    type: 'Grievance',
    severity: 'Medium',
    status: 'Under Investigation',
    title: 'Salary Increase Grievance — Q4 2025 Review',
    description:
      'Employee disputes the outcome of the Q4 2025 performance review, claiming the pay increase was below market rate and inconsistent with peer increases.',
    complainantId: 'emp-015',
    complainantName: 'Ravi Shankar',
    complainantDepartment: 'Product',
    respondentId: 'emp-007',
    respondentName: 'Kavita Singh',
    respondentDepartment: 'Product',
    assignedInvestigatorId: 'emp-012',
    assignedInvestigatorName: 'Sara Mohammed',
    openedDate: '2026-01-10',
    targetResolutionDate: '2026-02-10',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 46,
    isAnonymous: false,
    isConfidential: true,
    tags: ['Performance Review', 'Compensation', 'Equity'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [
      {
        id: 'ai-001',
        caseId: 'erc-001',
        title: 'Conduct salary benchmarking review',
        assignedTo: 'emp-012',
        assignedToName: 'Sara Mohammed',
        dueDate: '2026-01-25',
        status: 'Completed',
        priority: 'High',
        completedDate: '2026-01-24',
        notes: 'Benchmarking completed. Findings shared with HRBP.',
      },
      {
        id: 'ai-002',
        caseId: 'erc-001',
        title: 'Interview complainant',
        assignedTo: 'emp-012',
        assignedToName: 'Sara Mohammed',
        dueDate: '2026-01-20',
        status: 'Completed',
        priority: 'High',
        completedDate: '2026-01-19',
        notes: 'Statement recorded.',
      },
      {
        id: 'ai-003',
        caseId: 'erc-001',
        title: 'Interview manager/respondent',
        assignedTo: 'emp-012',
        assignedToName: 'Sara Mohammed',
        dueDate: '2026-01-28',
        status: 'In Progress',
        priority: 'High',
        completedDate: null,
        notes: '',
      },
      {
        id: 'ai-004',
        caseId: 'erc-001',
        title: 'Prepare resolution recommendation',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-02-05',
        status: 'Pending',
        priority: 'Medium',
        completedDate: null,
        notes: '',
      },
    ],
    timeline: [
      {
        id: 'tl-001',
        caseId: 'erc-001',
        timestamp: '2026-01-10T10:00:00Z',
        eventType: 'Case Opened',
        description: 'Grievance filed by Ravi Shankar via HR portal.',
        performedBy: 'Ravi Shankar',
        isConfidential: false,
      },
      {
        id: 'tl-002',
        caseId: 'erc-001',
        timestamp: '2026-01-10T14:00:00Z',
        eventType: 'Investigator Assigned',
        description: 'Sara Mohammed assigned as investigating HRBP.',
        performedBy: 'Priya Sharma',
        isConfidential: false,
      },
      {
        id: 'tl-003',
        caseId: 'erc-001',
        timestamp: '2026-01-19T11:30:00Z',
        eventType: 'Interview Conducted',
        description: 'Initial interview with complainant completed.',
        performedBy: 'Sara Mohammed',
        isConfidential: true,
      },
      {
        id: 'tl-004',
        caseId: 'erc-001',
        timestamp: '2026-01-24T09:00:00Z',
        eventType: 'Document Added',
        description: 'Salary benchmarking report added to case file.',
        performedBy: 'Sara Mohammed',
        isConfidential: true,
      },
    ],
    documents: [
      {
        id: 'doc-001',
        caseId: 'erc-001',
        name: 'Grievance Form - Ravi Shankar.pdf',
        type: 'Statement',
        uploadedBy: 'Ravi Shankar',
        uploadedDate: '2026-01-10',
        isConfidential: false,
        sizeKb: 245,
      },
      {
        id: 'doc-002',
        caseId: 'erc-001',
        name: 'Salary Benchmarking Report Q4 2025.xlsx',
        type: 'Evidence',
        uploadedBy: 'Sara Mohammed',
        uploadedDate: '2026-01-24',
        isConfidential: true,
        sizeKb: 890,
      },
    ],
    resolution: null,
  },
  {
    id: 'erc-002',
    caseNumber: 'ER-2026-002',
    type: 'Harassment',
    severity: 'High',
    status: 'Under Investigation',
    title: 'Workplace Harassment Complaint',
    description:
      'Complaint regarding repeated inappropriate comments and behavior in the workplace creating a hostile work environment.',
    complainantId: 'emp-016',
    complainantName: '[Confidential]',
    complainantDepartment: 'Marketing',
    respondentId: 'emp-017',
    respondentName: '[Confidential]',
    respondentDepartment: 'Operations',
    assignedInvestigatorId: 'emp-002',
    assignedInvestigatorName: 'Priya Sharma',
    openedDate: '2026-01-20',
    targetResolutionDate: '2026-03-20',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 36,
    isAnonymous: false,
    isConfidential: true,
    tags: ['Harassment', 'Hostile Work Environment', 'Urgent'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [
      {
        id: 'ai-005',
        caseId: 'erc-002',
        title: 'Interim separation of parties',
        assignedTo: 'emp-001',
        assignedToName: 'Rahul Mehta',
        dueDate: '2026-01-21',
        status: 'Completed',
        priority: 'High',
        completedDate: '2026-01-21',
        notes: 'Temporary workspace reallocation arranged.',
      },
      {
        id: 'ai-006',
        caseId: 'erc-002',
        title: 'Collect witness statements',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-02-05',
        status: 'In Progress',
        priority: 'High',
        completedDate: null,
        notes: '3 of 5 witnesses interviewed.',
      },
    ],
    timeline: [
      {
        id: 'tl-005',
        caseId: 'erc-002',
        timestamp: '2026-01-20T09:00:00Z',
        eventType: 'Case Opened',
        description: 'Harassment complaint received via anonymous HR hotline.',
        performedBy: 'HR System',
        isConfidential: false,
      },
      {
        id: 'tl-006',
        caseId: 'erc-002',
        timestamp: '2026-01-20T11:00:00Z',
        eventType: 'Escalated',
        description: 'Case escalated to VP HR due to severity.',
        performedBy: 'HR System',
        isConfidential: false,
      },
    ],
    documents: [],
    resolution: null,
  },
  {
    id: 'erc-003',
    caseNumber: 'ER-2025-048',
    type: 'Disciplinary',
    severity: 'Medium',
    status: 'Resolved',
    title: 'Repeated Late Attendance — Final Warning',
    description:
      'Employee has been late 8 times in 3 months despite verbal and written warnings. Final written warning issued.',
    complainantId: 'emp-004',
    complainantName: 'David Chen',
    complainantDepartment: 'Technology',
    respondentId: 'emp-029',
    respondentName: 'Raj Patel',
    respondentDepartment: 'Operations',
    assignedInvestigatorId: 'emp-012',
    assignedInvestigatorName: 'Sara Mohammed',
    openedDate: '2025-11-15',
    targetResolutionDate: '2025-12-15',
    resolvedDate: '2025-12-10',
    closedDate: '2025-12-20',
    daysOpen: 25,
    isAnonymous: false,
    isConfidential: true,
    tags: ['Attendance', 'Disciplinary', 'Final Warning'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [],
    timeline: [
      {
        id: 'tl-007',
        caseId: 'erc-003',
        timestamp: '2025-11-15T09:00:00Z',
        eventType: 'Case Opened',
        description: 'Disciplinary case raised by manager David Chen.',
        performedBy: 'David Chen',
        isConfidential: false,
      },
      {
        id: 'tl-008',
        caseId: 'erc-003',
        timestamp: '2025-12-10T14:00:00Z',
        eventType: 'Resolution Submitted',
        description: 'Final written warning issued. 90-day PIP commenced.',
        performedBy: 'Sara Mohammed',
        isConfidential: false,
      },
      {
        id: 'tl-009',
        caseId: 'erc-003',
        timestamp: '2025-12-20T10:00:00Z',
        eventType: 'Case Closed',
        description: 'Case closed after resolution acceptance.',
        performedBy: 'Priya Sharma',
        isConfidential: false,
      },
    ],
    documents: [
      {
        id: 'doc-003',
        caseId: 'erc-003',
        name: 'Final Written Warning Letter.pdf',
        type: 'Resolution Letter',
        uploadedBy: 'Sara Mohammed',
        uploadedDate: '2025-12-10',
        isConfidential: false,
        sizeKb: 128,
      },
    ],
    resolution: {
      findings:
        'Employee confirmed to have been late 8 times. Pattern established despite prior warnings.',
      outcomeType: 'Substantiated',
      actionsTaken: [
        'Final written warning issued',
        '90-day Performance Improvement Plan commenced',
        'Monthly check-in scheduled with HR',
      ],
      followUpRequired: true,
      followUpDate: '2026-03-10',
      followUpNotes: 'Review PIP progress at 90-day mark.',
      resolvedBy: 'Sara Mohammed',
      resolvedDate: '2025-12-10',
    },
  },
  {
    id: 'erc-004',
    caseNumber: 'ER-2026-003',
    type: 'Policy Violation',
    severity: 'Low',
    status: 'Open',
    title: 'Unauthorized Use of Company IT Resources',
    description:
      'IT audit flagged employee using company devices for personal cryptocurrency mining during business hours.',
    complainantId: 'emp-050',
    complainantName: 'IT Security Team',
    complainantDepartment: 'Technology',
    respondentId: 'emp-020',
    respondentName: 'Maria Gonzalez',
    respondentDepartment: 'Technology',
    assignedInvestigatorId: null,
    assignedInvestigatorName: null,
    openedDate: '2026-02-10',
    targetResolutionDate: '2026-03-10',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 15,
    isAnonymous: false,
    isConfidential: false,
    tags: ['IT Policy', 'Acceptable Use', 'Security'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [
      {
        id: 'ai-007',
        caseId: 'erc-004',
        title: 'Assign HR investigator',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-02-12',
        status: 'Overdue',
        priority: 'Medium',
        completedDate: null,
        notes: '',
      },
    ],
    timeline: [
      {
        id: 'tl-010',
        caseId: 'erc-004',
        timestamp: '2026-02-10T16:00:00Z',
        eventType: 'Case Opened',
        description: 'Case raised following IT audit findings.',
        performedBy: 'IT Security Team',
        isConfidential: false,
      },
    ],
    documents: [
      {
        id: 'doc-004',
        caseId: 'erc-004',
        name: 'IT Audit Report Feb 2026.pdf',
        type: 'Evidence',
        uploadedBy: 'IT Security',
        uploadedDate: '2026-02-10',
        isConfidential: false,
        sizeKb: 340,
      },
    ],
    resolution: null,
  },
  {
    id: 'erc-005',
    caseNumber: 'ER-2026-004',
    type: 'Workplace Conflict',
    severity: 'Medium',
    status: 'Open',
    title: 'Team Conflict — Engineering Department',
    description:
      'Ongoing conflict between two senior engineers affecting team morale and project delivery.',
    complainantId: 'emp-004',
    complainantName: 'David Chen',
    complainantDepartment: 'Technology',
    respondentId: null,
    respondentName: null,
    respondentDepartment: null,
    assignedInvestigatorId: 'emp-012',
    assignedInvestigatorName: 'Sara Mohammed',
    openedDate: '2026-02-01',
    targetResolutionDate: '2026-02-28',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 24,
    isAnonymous: false,
    isConfidential: false,
    tags: ['Team Conflict', 'Mediation'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [
      {
        id: 'ai-008',
        caseId: 'erc-005',
        title: 'Schedule mediation session',
        assignedTo: 'emp-012',
        assignedToName: 'Sara Mohammed',
        dueDate: '2026-02-20',
        status: 'In Progress',
        priority: 'High',
        completedDate: null,
        notes: 'Both parties agreed to attend.',
      },
    ],
    timeline: [
      {
        id: 'tl-011',
        caseId: 'erc-005',
        timestamp: '2026-02-01T10:00:00Z',
        eventType: 'Case Opened',
        description: 'Manager escalated team conflict to HR for mediation.',
        performedBy: 'David Chen',
        isConfidential: false,
      },
      {
        id: 'tl-012',
        caseId: 'erc-005',
        timestamp: '2026-02-05T14:00:00Z',
        eventType: 'Investigator Assigned',
        description: 'Sara Mohammed assigned as mediator/investigator.',
        performedBy: 'Priya Sharma',
        isConfidential: false,
      },
    ],
    documents: [],
    resolution: null,
  },
  {
    id: 'erc-006',
    caseNumber: 'ER-2025-032',
    type: 'Grievance',
    severity: 'Low',
    status: 'Closed',
    title: 'Overtime Pay Dispute — November 2025',
    description: 'Employee disputed overtime hours not reflected in November payslip.',
    complainantId: 'emp-029',
    complainantName: 'Raj Patel',
    complainantDepartment: 'Operations',
    respondentId: 'emp-050',
    respondentName: 'Payroll Team',
    respondentDepartment: 'Finance',
    assignedInvestigatorId: 'emp-012',
    assignedInvestigatorName: 'Sara Mohammed',
    openedDate: '2025-12-01',
    targetResolutionDate: '2025-12-20',
    resolvedDate: '2025-12-15',
    closedDate: '2025-12-18',
    daysOpen: 14,
    isAnonymous: false,
    isConfidential: false,
    tags: ['Payroll', 'Overtime', 'Grievance'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [],
    timeline: [
      {
        id: 'tl-013',
        caseId: 'erc-006',
        timestamp: '2025-12-01T09:00:00Z',
        eventType: 'Case Opened',
        description: 'Grievance submitted.',
        performedBy: 'Raj Patel',
        isConfidential: false,
      },
      {
        id: 'tl-014',
        caseId: 'erc-006',
        timestamp: '2025-12-15T10:00:00Z',
        eventType: 'Resolution Submitted',
        description: 'Payroll correction processed. AED 1,200 credited to December payroll.',
        performedBy: 'Sara Mohammed',
        isConfidential: false,
      },
      {
        id: 'tl-015',
        caseId: 'erc-006',
        timestamp: '2025-12-18T09:00:00Z',
        eventType: 'Case Closed',
        description: 'Grievance resolved. Employee satisfied with outcome.',
        performedBy: 'Sara Mohammed',
        isConfidential: false,
      },
    ],
    documents: [],
    resolution: {
      findings: 'Payroll system error caused 4.5 OT hours to be omitted from November payslip.',
      outcomeType: 'Substantiated',
      actionsTaken: [
        'Payroll correction processed for December',
        'Payroll team notified to review OT upload process',
      ],
      followUpRequired: false,
      followUpDate: null,
      followUpNotes: '',
      resolvedBy: 'Sara Mohammed',
      resolvedDate: '2025-12-15',
    },
  },
  {
    id: 'erc-007',
    caseNumber: 'ER-2026-005',
    type: 'Discrimination',
    severity: 'Critical',
    status: 'Escalated',
    title: 'Discrimination Complaint — Promotion Decision',
    description:
      'Employee alleges discriminatory practices in promotion decisions based on nationality.',
    complainantId: 'emp-025',
    complainantName: '[Confidential]',
    complainantDepartment: 'Technology',
    respondentId: 'emp-001',
    respondentName: '[Confidential — Senior Leader]',
    respondentDepartment: 'Technology',
    assignedInvestigatorId: 'emp-002',
    assignedInvestigatorName: 'Priya Sharma',
    openedDate: '2026-02-15',
    targetResolutionDate: '2026-04-15',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 10,
    isAnonymous: true,
    isConfidential: true,
    tags: ['Discrimination', 'Nationality', 'Critical', 'Escalated'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [
      {
        id: 'ai-009',
        caseId: 'erc-007',
        title: 'Engage external legal counsel',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-02-20',
        status: 'Pending',
        priority: 'High',
        completedDate: null,
        notes: '',
      },
      {
        id: 'ai-010',
        caseId: 'erc-007',
        title: 'Review last 12 months promotion data',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-03-01',
        status: 'Pending',
        priority: 'High',
        completedDate: null,
        notes: '',
      },
    ],
    timeline: [
      {
        id: 'tl-016',
        caseId: 'erc-007',
        timestamp: '2026-02-15T08:00:00Z',
        eventType: 'Case Opened',
        description: 'Anonymous complaint received via HR confidential channel.',
        performedBy: 'HR System',
        isConfidential: false,
      },
      {
        id: 'tl-017',
        caseId: 'erc-007',
        timestamp: '2026-02-15T10:00:00Z',
        eventType: 'Escalated',
        description:
          'Escalated to CHRO and Legal due to critical severity and potential regulatory implications.',
        performedBy: 'Priya Sharma',
        isConfidential: false,
      },
    ],
    documents: [],
    resolution: null,
  },
  {
    id: 'erc-008',
    caseNumber: 'ER-2026-006',
    type: 'Performance Improvement',
    severity: 'Low',
    status: 'Open',
    title: 'PIP Review — 30 Day Check-in',
    description:
      '30-day PIP check-in for employee on performance improvement plan. Reviewing progress against KPIs.',
    complainantId: 'emp-004',
    complainantName: 'David Chen',
    complainantDepartment: 'Technology',
    respondentId: 'emp-020',
    respondentName: 'Maria Gonzalez',
    respondentDepartment: 'Technology',
    assignedInvestigatorId: 'emp-012',
    assignedInvestigatorName: 'Sara Mohammed',
    openedDate: '2026-02-01',
    targetResolutionDate: '2026-05-01',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 24,
    isAnonymous: false,
    isConfidential: true,
    tags: ['PIP', 'Performance'],
    location: 'Dubai HQ',
    relatedCaseIds: ['erc-004'],
    actionItems: [
      {
        id: 'ai-011',
        caseId: 'erc-008',
        title: '30-day PIP review meeting',
        assignedTo: 'emp-012',
        assignedToName: 'Sara Mohammed',
        dueDate: '2026-03-01',
        status: 'Pending',
        priority: 'Medium',
        completedDate: null,
        notes: '',
      },
    ],
    timeline: [
      {
        id: 'tl-018',
        caseId: 'erc-008',
        timestamp: '2026-02-01T09:00:00Z',
        eventType: 'Case Opened',
        description: 'PIP monitoring case opened.',
        performedBy: 'Sara Mohammed',
        isConfidential: false,
      },
    ],
    documents: [
      {
        id: 'doc-005',
        caseId: 'erc-008',
        name: 'PIP Plan - Maria Gonzalez.pdf',
        type: 'Policy',
        uploadedBy: 'Sara Mohammed',
        uploadedDate: '2026-02-01',
        isConfidential: true,
        sizeKb: 215,
      },
    ],
    resolution: null,
  },
  {
    id: 'erc-009',
    caseNumber: 'ER-2025-061',
    type: 'Whistleblower',
    severity: 'High',
    status: 'Pending Review',
    title: 'Financial Irregularity Report',
    description: 'Confidential report of potential financial irregularity in expense claims.',
    complainantId: 'emp-ANON',
    complainantName: '[Anonymous]',
    complainantDepartment: 'Finance',
    respondentId: null,
    respondentName: '[Confidential]',
    respondentDepartment: 'Finance',
    assignedInvestigatorId: 'emp-002',
    assignedInvestigatorName: 'Priya Sharma',
    openedDate: '2025-12-10',
    targetResolutionDate: '2026-02-28',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 77,
    isAnonymous: true,
    isConfidential: true,
    tags: ['Whistleblower', 'Financial', 'Audit'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [
      {
        id: 'ai-012',
        caseId: 'erc-009',
        title: 'Internal audit review of expense claims',
        assignedTo: 'emp-003',
        assignedToName: 'Ahmed Al-Rashid',
        dueDate: '2026-01-31',
        status: 'Completed',
        priority: 'High',
        completedDate: '2026-01-28',
        notes: 'Audit findings submitted.',
      },
      {
        id: 'ai-013',
        caseId: 'erc-009',
        title: 'Prepare final investigation report',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-02-25',
        status: 'In Progress',
        priority: 'High',
        completedDate: null,
        notes: '',
      },
    ],
    timeline: [],
    documents: [],
    resolution: null,
  },
  {
    id: 'erc-010',
    caseNumber: 'ER-2025-044',
    type: 'Grievance',
    severity: 'Low',
    status: 'Closed',
    title: 'Annual Leave Accrual Discrepancy',
    description:
      'Employee reported mismatch between HRMS leave balance and approved carry-forward.',
    complainantId: 'emp-013',
    complainantName: 'Omar Al-Fayyad',
    complainantDepartment: 'Finance',
    respondentId: 'emp-050',
    respondentName: 'HR Operations',
    respondentDepartment: 'Human Resources',
    assignedInvestigatorId: 'emp-012',
    assignedInvestigatorName: 'Sara Mohammed',
    openedDate: '2025-11-01',
    targetResolutionDate: '2025-11-20',
    resolvedDate: '2025-11-15',
    closedDate: '2025-11-17',
    daysOpen: 14,
    isAnonymous: false,
    isConfidential: false,
    tags: ['Leave', 'HRMS', 'Correction'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [],
    timeline: [],
    documents: [],
    resolution: {
      findings:
        'HRMS carry-forward rule was not applied correctly due to a system configuration issue.',
      outcomeType: 'Substantiated',
      actionsTaken: ['Leave balance corrected in HRMS', 'System configuration reviewed by IT'],
      followUpRequired: false,
      followUpDate: null,
      followUpNotes: '',
      resolvedBy: 'Sara Mohammed',
      resolvedDate: '2025-11-15',
    },
  },
  {
    id: 'erc-011',
    caseNumber: 'ER-2026-007',
    type: 'Disciplinary',
    severity: 'High',
    status: 'Under Investigation',
    title: 'Social Media Policy Violation',
    description:
      'Employee posted confidential company information on personal LinkedIn account, violating NDA and Social Media Policy.',
    complainantId: 'emp-002',
    complainantName: 'Priya Sharma',
    complainantDepartment: 'Human Resources',
    respondentId: 'emp-011',
    respondentName: 'Arun Krishnan',
    respondentDepartment: 'Technology',
    assignedInvestigatorId: 'emp-002',
    assignedInvestigatorName: 'Priya Sharma',
    openedDate: '2026-02-18',
    targetResolutionDate: '2026-03-18',
    resolvedDate: null,
    closedDate: null,
    daysOpen: 7,
    isAnonymous: false,
    isConfidential: true,
    tags: ['Social Media', 'NDA', 'Disciplinary', 'IP'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [
      {
        id: 'ai-014',
        caseId: 'erc-011',
        title: 'Document post and preserve evidence',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-02-19',
        status: 'Completed',
        priority: 'High',
        completedDate: '2026-02-19',
        notes: 'Screenshots and LinkedIn links captured and stored.',
      },
      {
        id: 'ai-015',
        caseId: 'erc-011',
        title: 'Involve Legal for NDA breach review',
        assignedTo: 'emp-002',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-02-21',
        status: 'In Progress',
        priority: 'High',
        completedDate: null,
        notes: '',
      },
    ],
    timeline: [],
    documents: [],
    resolution: null,
  },
  {
    id: 'erc-012',
    caseNumber: 'ER-2026-008',
    type: 'Workplace Conflict',
    severity: 'Low',
    status: 'Resolved',
    title: 'Interdepartmental Communication Dispute',
    description:
      'Conflict between Sales and Marketing over lead attribution process causing friction.',
    complainantId: 'emp-008',
    complainantName: 'Anita Nair',
    complainantDepartment: 'Sales',
    respondentId: 'emp-005',
    respondentName: 'Fatima Al-Hassan',
    respondentDepartment: 'Marketing',
    assignedInvestigatorId: 'emp-012',
    assignedInvestigatorName: 'Sara Mohammed',
    openedDate: '2026-01-25',
    targetResolutionDate: '2026-02-15',
    resolvedDate: '2026-02-12',
    closedDate: null,
    daysOpen: 18,
    isAnonymous: false,
    isConfidential: false,
    tags: ['Interdepartmental', 'Process', 'Mediation'],
    location: 'Dubai HQ',
    relatedCaseIds: [],
    actionItems: [],
    timeline: [],
    documents: [],
    resolution: {
      findings:
        'Process ambiguity caused attribution disputes. Both parties agreed process clarification was needed.',
      outcomeType: 'Partially Substantiated',
      actionsTaken: [
        'Lead attribution SOP updated',
        'Joint Sales-Marketing process workshop scheduled',
        'Monthly alignment meeting added to calendar',
      ],
      followUpRequired: false,
      followUpDate: null,
      followUpNotes: '',
      resolvedBy: 'Sara Mohammed',
      resolvedDate: '2026-02-12',
    },
  },
];

const MOCK_NOTES: CaseNote[] = [
  {
    id: 'cn-001',
    caseId: 'erc-001',
    content:
      'Benchmarking data shows complainant salary is 8% below P50 for comparable roles in UAE market.',
    addedBy: 'Sara Mohammed',
    addedDate: '2026-01-24',
    isConfidential: true,
  },
  {
    id: 'cn-002',
    caseId: 'erc-002',
    content: 'Three witnesses corroborated complainant account. Respondent denies allegations.',
    addedBy: 'Priya Sharma',
    addedDate: '2026-01-28',
    isConfidential: true,
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

export class EmployeeRelationsService {
  /**
   * Create a new ER case.
   */
  static async createCase(data: Partial<ERCase>): Promise<ERCase> {
    await new Promise((r) => setTimeout(r, 200));
    const newCase: ERCase = {
      id: `erc-${Date.now()}`,
      caseNumber: `ER-${new Date().getFullYear()}-${String(MOCK_CASES.length + 1).padStart(3, '0')}`,
      type: data.type ?? 'Grievance',
      severity: data.severity ?? 'Low',
      status: 'Open',
      title: data.title ?? '',
      description: data.description ?? '',
      complainantId: data.complainantId ?? '',
      complainantName: data.complainantName ?? '',
      complainantDepartment: data.complainantDepartment ?? '',
      respondentId: data.respondentId ?? null,
      respondentName: data.respondentName ?? null,
      respondentDepartment: data.respondentDepartment ?? null,
      assignedInvestigatorId: null,
      assignedInvestigatorName: null,
      openedDate: new Date().toISOString().slice(0, 10),
      targetResolutionDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      resolvedDate: null,
      closedDate: null,
      daysOpen: 0,
      isAnonymous: data.isAnonymous ?? false,
      isConfidential: data.isConfidential ?? true,
      tags: data.tags ?? [],
      location: data.location ?? '',
      relatedCaseIds: [],
      actionItems: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          caseId: `erc-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'Case Opened',
          description: 'Case opened via HR portal.',
          performedBy: data.complainantName ?? 'HR Admin',
          isConfidential: false,
        },
      ],
      documents: [],
      resolution: null,
    };
    MOCK_CASES.push(newCase);
    return newCase;
  }

  /**
   * Get filtered list of ER cases.
   */
  static async getCases(filters?: ERFilters): Promise<ERCase[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result = [...MOCK_CASES];

    if (filters?.status?.length) {
      result = result.filter((c) => filters.status!.includes(c.status));
    }
    if (filters?.type?.length) {
      result = result.filter((c) => filters.type!.includes(c.type));
    }
    if (filters?.severity?.length) {
      result = result.filter((c) => filters.severity!.includes(c.severity));
    }
    if (filters?.investigatorId) {
      result = result.filter((c) => c.assignedInvestigatorId === filters.investigatorId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.complainantName.toLowerCase().includes(q)
      );
    }

    return result.sort(
      (a, b) => new Date(b.openedDate).getTime() - new Date(a.openedDate).getTime()
    );
  }

  /**
   * Get full case detail.
   */
  static async getCase(id: string): Promise<ERCase | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_CASES.find((c) => c.id === id) ?? null;
  }

  /**
   * Add a confidential note to a case.
   */
  static async addNote(caseId: string, note: Partial<CaseNote>): Promise<CaseNote> {
    await new Promise((r) => setTimeout(r, 200));
    const newNote: CaseNote = {
      id: `cn-${Date.now()}`,
      caseId,
      content: note.content ?? '',
      addedBy: note.addedBy ?? 'HR Admin',
      addedDate: new Date().toISOString().slice(0, 10),
      isConfidential: note.isConfidential ?? true,
    };
    MOCK_NOTES.push(newNote);

    const erCase = MOCK_CASES.find((c) => c.id === caseId);
    if (erCase) {
      erCase.timeline.push({
        id: `tl-${Date.now()}`,
        caseId,
        timestamp: new Date().toISOString(),
        eventType: 'Note Added',
        description: `Confidential note added by ${newNote.addedBy}.`,
        performedBy: newNote.addedBy,
        isConfidential: true,
      });
    }
    return newNote;
  }

  /**
   * Transition case status.
   */
  static async updateCaseStatus(caseId: string, status: ERCaseStatus): Promise<ERCase> {
    await new Promise((r) => setTimeout(r, 200));
    const erCase = MOCK_CASES.find((c) => c.id === caseId);
    if (!erCase) throw new Error(`Case ${caseId} not found`);

    const prevStatus = erCase.status;
    erCase.status = status;

    if (status === 'Resolved') erCase.resolvedDate = new Date().toISOString().slice(0, 10);
    if (status === 'Closed') erCase.closedDate = new Date().toISOString().slice(0, 10);

    erCase.timeline.push({
      id: `tl-${Date.now()}`,
      caseId,
      timestamp: new Date().toISOString(),
      eventType: 'Status Changed',
      description: `Status changed from "${prevStatus}" to "${status}".`,
      performedBy: 'HR Admin',
      isConfidential: false,
    });

    return erCase;
  }

  /**
   * Assign an investigator to a case.
   */
  static async assignInvestigator(
    caseId: string,
    investigatorId: string,
    investigatorName: string
  ): Promise<ERCase> {
    await new Promise((r) => setTimeout(r, 200));
    const erCase = MOCK_CASES.find((c) => c.id === caseId);
    if (!erCase) throw new Error(`Case ${caseId} not found`);

    erCase.assignedInvestigatorId = investigatorId;
    erCase.assignedInvestigatorName = investigatorName;
    erCase.status = 'Under Investigation';

    erCase.timeline.push({
      id: `tl-${Date.now()}`,
      caseId,
      timestamp: new Date().toISOString(),
      eventType: 'Investigator Assigned',
      description: `${investigatorName} assigned as investigator.`,
      performedBy: 'HR Admin',
      isConfidential: false,
    });

    return erCase;
  }

  /**
   * Aggregate case analytics.
   */
  static async getCaseAnalytics(): Promise<ERCaseAnalytics> {
    await new Promise((r) => setTimeout(r, 200));

    const cases = MOCK_CASES;
    const open = cases.filter((c) => !['Closed', 'Withdrawn'].includes(c.status));
    const resolvedThisMonth = cases.filter(
      (c) => c.resolvedDate && c.resolvedDate.startsWith(new Date().toISOString().slice(0, 7))
    );

    const resolved = cases.filter((c) => c.resolvedDate);
    const avgResolutionDays =
      resolved.length > 0
        ? Math.round(resolved.reduce((s, c) => s + c.daysOpen, 0) / resolved.length)
        : 0;

    const typeCounts: Record<string, number> = {};
    for (const c of cases) {
      typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1;
    }
    const byType = Object.entries(typeCounts).map(([type, count]) => ({
      type: type as ERCaseType,
      count,
      percentage: Math.round((count / cases.length) * 100),
    }));

    const severityCounts: Record<string, number> = {};
    for (const c of cases) {
      severityCounts[c.severity] = (severityCounts[c.severity] ?? 0) + 1;
    }
    const bySeverity = Object.entries(severityCounts).map(([severity, count]) => ({
      severity: severity as ERCaseSeverity,
      count,
    }));

    const statusCounts: Record<string, number> = {};
    for (const c of cases) {
      statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;
    }
    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as ERCaseStatus,
      count,
    }));

    const overdueActionItems = cases
      .flatMap((c) => c.actionItems)
      .filter(
        (ai) =>
          ai.status === 'Overdue' ||
          (ai.status !== 'Completed' && ai.dueDate < new Date().toISOString().slice(0, 10))
      ).length;

    return {
      totalCases: cases.length,
      openCases: open.length,
      resolvedThisMonth: resolvedThisMonth.length,
      avgResolutionDays,
      byType,
      bySeverity,
      byStatus,
      monthlyTrend: [
        { month: 'Oct 2025', opened: 3, resolved: 2 },
        { month: 'Nov 2025', opened: 4, resolved: 3 },
        { month: 'Dec 2025', opened: 2, resolved: 4 },
        { month: 'Jan 2026', opened: 5, resolved: 2 },
        { month: 'Feb 2026', opened: 4, resolved: 1 },
      ],
      overdueActionItems,
      escalatedCases: cases.filter((c) => c.status === 'Escalated').length,
    };
  }

  /**
   * Get action items for a case.
   */
  static async getActionItems(caseId: string): Promise<ActionItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    const erCase = MOCK_CASES.find((c) => c.id === caseId);
    return erCase?.actionItems ?? [];
  }

  /**
   * Get notes for a case.
   */
  static async getNotes(caseId: string): Promise<CaseNote[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_NOTES.filter((n) => n.caseId === caseId);
  }
}
