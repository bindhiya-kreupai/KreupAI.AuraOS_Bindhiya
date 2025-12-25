/**
 * Manager Self-Service (MSS) Module - Sample Data
 * Comprehensive sample data for immediate testing and development
 */

import type {
  TeamMember,
  TeamMetrics,
  TeamGoal,
  ApprovalRequest,
  DelegationRule,
  TeamReport,
  ManagerSettings,
} from './types';

// ============================================================================
// Sample Team Members
// ============================================================================

export const sampleTeamMembers: TeamMember[] = [
  {
    id: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Sarah Johnson',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0101',
    dateOfJoining: new Date('2021-03-15'),
    status: 'active',
    profilePicture: '/avatars/sarah.jpg',

    location: 'New York, NY',
    reportingTo: 'manager-001',
    workMode: 'hybrid',
    shift: 'Day Shift',

    performanceRating: 4.5,
    lastReviewDate: new Date('2024-10-01'),
    nextReviewDate: new Date('2025-04-01'),
    engagementScore: 85,

    attendanceRate: 98.5,
    leaveBalance: {
      annual: 12,
      sick: 8,
      casual: 5,
      compensatory: 2,
      unpaid: 0,
      total: 27,
    },
    currentStatus: {
      type: 'working',
      statusDate: new Date(),
    },

    skills: [
      {
        skillName: 'React',
        skillCategory: 'Frontend',
        proficiencyLevel: 'expert',
        lastAssessed: new Date('2024-09-01'),
        certificationRequired: false,
      },
      {
        skillName: 'TypeScript',
        skillCategory: 'Programming',
        proficiencyLevel: 'advanced',
        lastAssessed: new Date('2024-09-01'),
        certificationRequired: false,
      },
      {
        skillName: 'AWS',
        skillCategory: 'Cloud',
        proficiencyLevel: 'intermediate',
        lastAssessed: new Date('2024-08-15'),
        certificationRequired: true,
      },
    ],
    certifications: [
      {
        certificationName: 'AWS Solutions Architect Associate',
        issuingOrganization: 'Amazon Web Services',
        issueDate: new Date('2023-06-15'),
        expiryDate: new Date('2026-06-15'),
        credentialId: 'AWS-12345',
        status: 'active',
      },
    ],
    developmentGoals: [
      {
        goalId: 'goal-001',
        goalDescription: 'Complete AWS Solutions Architect Professional certification',
        targetCompletionDate: new Date('2025-06-30'),
        progress: 45,
        status: 'in_progress',
        milestones: [
          {
            milestoneId: 'ms-001',
            description: 'Complete online training course',
            dueDate: new Date('2025-03-31'),
            completed: true,
            completedDate: new Date('2025-02-15'),
          },
          {
            milestoneId: 'ms-002',
            description: 'Pass practice exams',
            dueDate: new Date('2025-05-31'),
            completed: false,
          },
        ],
      },
    ],

    compensationBand: 'Senior IC Level 2',
    lastIncrement: new Date('2024-04-01'),
    nextReviewEligibility: new Date('2025-04-01'),
  },
  {
    id: 'emp-002',
    employeeCode: 'EMP002',
    employeeName: 'Michael Chen',
    designation: 'Software Engineer',
    department: 'Engineering',
    email: 'michael.chen@company.com',
    phone: '+1-555-0102',
    dateOfJoining: new Date('2022-07-01'),
    status: 'active',

    location: 'San Francisco, CA',
    reportingTo: 'manager-001',
    workMode: 'remote',
    shift: 'Day Shift',

    performanceRating: 4.0,
    lastReviewDate: new Date('2024-11-01'),
    nextReviewDate: new Date('2025-05-01'),
    engagementScore: 78,

    attendanceRate: 96.2,
    leaveBalance: {
      annual: 15,
      sick: 10,
      casual: 6,
      compensatory: 0,
      unpaid: 0,
      total: 31,
    },
    currentStatus: {
      type: 'wfh',
      statusDate: new Date(),
    },

    skills: [
      {
        skillName: 'Node.js',
        skillCategory: 'Backend',
        proficiencyLevel: 'advanced',
        lastAssessed: new Date('2024-10-01'),
        certificationRequired: false,
      },
      {
        skillName: 'PostgreSQL',
        skillCategory: 'Database',
        proficiencyLevel: 'intermediate',
        lastAssessed: new Date('2024-10-01'),
        certificationRequired: false,
      },
    ],
    certifications: [],
    developmentGoals: [],

    compensationBand: 'Mid IC Level 1',
    lastIncrement: new Date('2024-07-01'),
    nextReviewEligibility: new Date('2025-07-01'),
  },
  {
    id: 'emp-003',
    employeeCode: 'EMP003',
    employeeName: 'Emily Rodriguez',
    designation: 'Junior Software Engineer',
    department: 'Engineering',
    email: 'emily.rodriguez@company.com',
    phone: '+1-555-0103',
    dateOfJoining: new Date('2024-01-15'),
    status: 'active',

    location: 'Austin, TX',
    reportingTo: 'manager-001',
    workMode: 'office',
    shift: 'Day Shift',

    performanceRating: 3.8,
    lastReviewDate: new Date('2024-07-15'),
    nextReviewDate: new Date('2025-01-15'),
    engagementScore: 92,

    attendanceRate: 99.1,
    leaveBalance: {
      annual: 18,
      sick: 12,
      casual: 8,
      compensatory: 0,
      unpaid: 0,
      total: 38,
    },
    currentStatus: {
      type: 'working',
      statusDate: new Date(),
    },

    skills: [
      {
        skillName: 'JavaScript',
        skillCategory: 'Programming',
        proficiencyLevel: 'intermediate',
        lastAssessed: new Date('2024-11-01'),
        certificationRequired: false,
      },
      {
        skillName: 'React',
        skillCategory: 'Frontend',
        proficiencyLevel: 'beginner',
        lastAssessed: new Date('2024-11-01'),
        certificationRequired: false,
      },
    ],
    certifications: [],
    developmentGoals: [
      {
        goalId: 'goal-002',
        goalDescription: 'Become proficient in React and complete first independent project',
        targetCompletionDate: new Date('2025-06-30'),
        progress: 30,
        status: 'in_progress',
        milestones: [
          {
            milestoneId: 'ms-003',
            description: 'Complete React fundamentals course',
            dueDate: new Date('2025-02-28'),
            completed: false,
          },
        ],
      },
    ],

    compensationBand: 'Junior IC Level 1',
    lastIncrement: new Date('2024-07-15'),
    nextReviewEligibility: new Date('2025-07-15'),
  },
  {
    id: 'emp-004',
    employeeCode: 'EMP004',
    employeeName: 'David Kim',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    email: 'david.kim@company.com',
    phone: '+1-555-0104',
    dateOfJoining: new Date('2020-09-01'),
    status: 'active',

    location: 'Seattle, WA',
    reportingTo: 'manager-001',
    workMode: 'hybrid',
    shift: 'Day Shift',

    performanceRating: 4.8,
    lastReviewDate: new Date('2024-09-01'),
    nextReviewDate: new Date('2025-03-01'),
    engagementScore: 88,

    attendanceRate: 97.3,
    leaveBalance: {
      annual: 10,
      sick: 7,
      casual: 4,
      compensatory: 3,
      unpaid: 0,
      total: 24,
    },
    currentStatus: {
      type: 'on_leave',
      statusDate: new Date(),
      remarks: 'Annual leave - returning Dec 20',
    },

    skills: [
      {
        skillName: 'Python',
        skillCategory: 'Programming',
        proficiencyLevel: 'expert',
        lastAssessed: new Date('2024-08-01'),
        certificationRequired: false,
      },
      {
        skillName: 'Kubernetes',
        skillCategory: 'DevOps',
        proficiencyLevel: 'advanced',
        lastAssessed: new Date('2024-08-01'),
        certificationRequired: true,
      },
    ],
    certifications: [
      {
        certificationName: 'Certified Kubernetes Administrator',
        issuingOrganization: 'CNCF',
        issueDate: new Date('2023-01-15'),
        expiryDate: new Date('2026-01-15'),
        credentialId: 'CKA-67890',
        status: 'active',
      },
    ],
    developmentGoals: [],

    compensationBand: 'Senior IC Level 3',
    lastIncrement: new Date('2024-03-01'),
    nextReviewEligibility: new Date('2025-03-01'),
  },
  {
    id: 'emp-005',
    employeeCode: 'EMP005',
    employeeName: 'Jessica Martinez',
    designation: 'Software Engineer',
    department: 'Engineering',
    email: 'jessica.martinez@company.com',
    phone: '+1-555-0105',
    dateOfJoining: new Date('2023-02-01'),
    status: 'active',

    location: 'Boston, MA',
    reportingTo: 'manager-001',
    workMode: 'office',
    shift: 'Day Shift',

    performanceRating: 3.5,
    lastReviewDate: new Date('2024-08-01'),
    nextReviewDate: new Date('2025-02-01'),
    engagementScore: 65,

    attendanceRate: 94.8,
    leaveBalance: {
      annual: 14,
      sick: 9,
      casual: 7,
      compensatory: 1,
      unpaid: 0,
      total: 31,
    },
    currentStatus: {
      type: 'working',
      statusDate: new Date(),
    },

    skills: [
      {
        skillName: 'Java',
        skillCategory: 'Programming',
        proficiencyLevel: 'intermediate',
        lastAssessed: new Date('2024-09-01'),
        certificationRequired: false,
      },
    ],
    certifications: [],
    developmentGoals: [],

    compensationBand: 'Mid IC Level 1',
    lastIncrement: new Date('2024-02-01'),
    nextReviewEligibility: new Date('2025-02-01'),
  },
];

// ============================================================================
// Sample Team Metrics
// ============================================================================

export const sampleTeamMetrics: TeamMetrics = {
  teamId: 'team-001',
  teamName: 'Engineering Team Alpha',
  managerId: 'manager-001',
  managerName: 'John Manager',
  period: 'monthly',
  periodStart: new Date('2024-12-01'),
  periodEnd: new Date('2024-12-31'),

  totalHeadcount: 15,
  activeEmployees: 14,
  newJoiners: 1,
  separations: 0,

  averageAttendance: 97.2,
  totalAbsences: 8,
  totalLateComings: 3,

  averagePerformanceRating: 4.1,
  highPerformers: 6,
  lowPerformers: 1,

  averageEngagementScore: 81.5,
  atRiskEmployees: 2,

  totalLeavesTaken: 28,
  averageLeaveUtilization: 42.5,
  pendingLeaveRequests: 5,

  goalsOnTrack: 18,
  goalsOverdue: 2,
  totalActiveGoals: 25,

  pendingApprovals: 12,
  pendingReviews: 3,
};

// ============================================================================
// Sample Team Goals
// ============================================================================

export const sampleTeamGoals: TeamGoal[] = [
  {
    goalId: 'team-goal-001',
    goalCode: 'TG-2024-Q4-001',
    goalName: 'Migrate Legacy Systems to Microservices',
    description: 'Complete migration of 5 legacy monolithic services to microservices architecture',
    goalType: 'project',
    priority: 'high',
    status: 'active',

    startDate: new Date('2024-10-01'),
    targetDate: new Date('2025-03-31'),

    progress: 60,
    progressUpdates: [
      {
        updateId: 'update-001',
        updateDate: new Date('2024-11-15'),
        updatedBy: 'manager-001',
        previousValue: 2,
        currentValue: 3,
        progress: 60,
        remarks: 'Completed user service migration',
      },
    ],

    measurementCriteria: 'Number of services migrated',
    targetValue: 5,
    currentValue: 3,
    unit: 'services',

    assignedTo: ['emp-001', 'emp-002', 'emp-004'],
    champion: 'emp-004',

    dependencies: [],
    milestones: [
      {
        milestoneId: 'ms-tg-001',
        description: 'Complete architecture design',
        dueDate: new Date('2024-10-31'),
        completed: true,
        completedDate: new Date('2024-10-28'),
      },
      {
        milestoneId: 'ms-tg-002',
        description: 'Migrate authentication service',
        dueDate: new Date('2024-11-30'),
        completed: true,
        completedDate: new Date('2024-11-25'),
      },
      {
        milestoneId: 'ms-tg-003',
        description: 'Migrate user service',
        dueDate: new Date('2024-12-31'),
        completed: true,
        completedDate: new Date('2024-12-10'),
      },
      {
        milestoneId: 'ms-tg-004',
        description: 'Migrate payment service',
        dueDate: new Date('2025-01-31'),
        completed: false,
      },
      {
        milestoneId: 'ms-tg-005',
        description: 'Migrate notification service',
        dueDate: new Date('2025-02-28'),
        completed: false,
      },
    ],

    alignedToCompanyGoal: 'Digital Transformation Initiative',
    alignedToDepartmentGoal: 'Modernize Technology Stack',

    audit: {
      createdAt: new Date('2024-10-01'),
      createdBy: 'manager-001',
      updatedAt: new Date('2024-12-10'),
      updatedBy: 'manager-001',
    },
  },
  {
    goalId: 'team-goal-002',
    goalCode: 'TG-2024-Q4-002',
    goalName: 'Improve Code Quality Metrics',
    description: 'Increase code coverage to 85% and reduce technical debt by 30%',
    goalType: 'operational',
    priority: 'medium',
    status: 'active',

    startDate: new Date('2024-11-01'),
    targetDate: new Date('2025-02-28'),

    progress: 35,
    progressUpdates: [],

    measurementCriteria: 'Code coverage percentage',
    targetValue: 85,
    currentValue: 68,
    unit: 'percentage',

    assignedTo: ['emp-001', 'emp-002', 'emp-003', 'emp-005'],

    dependencies: [],
    milestones: [
      {
        milestoneId: 'ms-tg-006',
        description: 'Establish baseline metrics',
        dueDate: new Date('2024-11-15'),
        completed: true,
        completedDate: new Date('2024-11-12'),
      },
      {
        milestoneId: 'ms-tg-007',
        description: 'Achieve 75% code coverage',
        dueDate: new Date('2024-12-31'),
        completed: false,
      },
    ],

    audit: {
      createdAt: new Date('2024-11-01'),
      createdBy: 'manager-001',
      updatedAt: new Date('2024-11-12'),
      updatedBy: 'manager-001',
    },
  },
];

// ============================================================================
// Sample Approval Requests
// ============================================================================

export const sampleApprovalRequests: ApprovalRequest[] = [
  {
    requestId: 'req-001',
    requestCode: 'LEAVE-2024-12-001',
    requestType: 'leave',
    requestTitle: 'Annual Leave Request - Sarah Johnson',
    requestDate: new Date('2024-12-08'),

    requestedBy: 'emp-001',
    requestedByName: 'Sarah Johnson',
    requestedByDepartment: 'Engineering',

    approvalStatus: 'pending',
    priority: 'medium',
    dueDate: new Date('2024-12-15'),

    currentApproverId: 'manager-001',
    currentApproverLevel: 1,

    approvalWorkflow: [
      {
        stepNumber: 1,
        stepName: 'Manager Approval',
        approverId: 'manager-001',
        approverName: 'John Manager',
        approverRole: 'Engineering Manager',
        status: 'pending',
        escalated: false,
      },
      {
        stepNumber: 2,
        stepName: 'HR Approval',
        approverId: 'hr-001',
        approverName: 'HR Manager',
        approverRole: 'HR Manager',
        status: 'pending',
        escalated: false,
      },
    ],

    details: {
      leaveId: 'leave-001',
      leaveType: 'Annual Leave',
      fromDate: new Date('2024-12-23'),
      toDate: new Date('2024-12-27'),
      totalDays: 5,
      reason: 'Family vacation during holidays',
      contactDuringLeave: '+1-555-9999',
      workHandoverTo: 'emp-002',
      emergencyContact: '+1-555-8888',
      leaveBalance: {
        annual: 12,
        sick: 8,
        casual: 5,
        compensatory: 2,
        unpaid: 0,
        total: 27,
      },
    },

    comments: [],
    history: [
      {
        historyId: 'hist-001',
        action: 'submitted',
        actionBy: 'emp-001',
        actionByName: 'Sarah Johnson',
        actionDate: new Date('2024-12-08'),
        toStatus: 'pending',
        remarks: 'Leave request submitted',
      },
    ],

    attachments: [],

    audit: {
      createdAt: new Date('2024-12-08'),
      createdBy: 'emp-001',
      updatedAt: new Date('2024-12-08'),
      updatedBy: 'emp-001',
    },
  },
  {
    requestId: 'req-002',
    requestCode: 'EXP-2024-12-002',
    requestType: 'expense',
    requestTitle: 'Conference Expenses - Michael Chen',
    requestDate: new Date('2024-12-10'),

    requestedBy: 'emp-002',
    requestedByName: 'Michael Chen',
    requestedByDepartment: 'Engineering',

    approvalStatus: 'pending',
    priority: 'high',
    dueDate: new Date('2024-12-17'),

    currentApproverId: 'manager-001',
    currentApproverLevel: 1,

    approvalWorkflow: [
      {
        stepNumber: 1,
        stepName: 'Manager Approval',
        approverId: 'manager-001',
        approverName: 'John Manager',
        approverRole: 'Engineering Manager',
        status: 'pending',
        escalated: false,
      },
      {
        stepNumber: 2,
        stepName: 'Finance Approval',
        approverId: 'fin-001',
        approverName: 'Finance Manager',
        approverRole: 'Finance Manager',
        status: 'pending',
        escalated: false,
      },
    ],

    details: {
      expenseId: 'exp-001',
      expenseCategory: 'Travel & Conference',
      totalAmount: 2850.50,
      currency: 'USD',
      expenseDate: new Date('2024-12-05'),
      businessPurpose: 'Attendance at AWS re:Invent 2024 conference',
      project: 'Cloud Migration Project',
      costCenter: 'ENG-001',
      lineItems: [
        {
          lineNumber: 1,
          description: 'Conference registration fee',
          category: 'Registration',
          amount: 1799.00,
          taxAmount: 0,
          totalAmount: 1799.00,
          receiptNumber: 'AWS-REG-12345',
        },
        {
          lineNumber: 2,
          description: 'Hotel accommodation (3 nights)',
          category: 'Accommodation',
          amount: 750.00,
          taxAmount: 101.50,
          totalAmount: 851.50,
          receiptNumber: 'HTL-98765',
        },
        {
          lineNumber: 3,
          description: 'Airfare',
          category: 'Transportation',
          amount: 450.00,
          taxAmount: 0,
          totalAmount: 450.00,
          receiptNumber: 'AIR-54321',
        },
      ],
      receiptAvailable: true,
      budgetImpact: {
        budgetId: 'budget-001',
        budgetName: 'Training & Development Budget 2024',
        budgetedAmount: 50000,
        spentAmount: 32500,
        thisExpense: 2850.50,
        remainingAfterApproval: 14649.50,
        utilizationPercentage: 70.7,
      },
    },

    comments: [
      {
        commentId: 'comment-001',
        commentedBy: 'emp-002',
        commentedByName: 'Michael Chen',
        commentDate: new Date('2024-12-10'),
        commentText: 'All receipts attached. Conference was highly relevant to our cloud migration project.',
        isInternal: false,
      },
    ],
    history: [
      {
        historyId: 'hist-002',
        action: 'submitted',
        actionBy: 'emp-002',
        actionByName: 'Michael Chen',
        actionDate: new Date('2024-12-10'),
        toStatus: 'pending',
        remarks: 'Expense claim submitted',
      },
    ],

    attachments: [
      {
        attachmentId: 'att-001',
        fileName: 'conference-registration.pdf',
        fileType: 'application/pdf',
        fileSize: 245678,
        uploadedBy: 'emp-002',
        uploadedDate: new Date('2024-12-10'),
        fileUrl: '/documents/att-001.pdf',
      },
      {
        attachmentId: 'att-002',
        fileName: 'hotel-receipt.pdf',
        fileType: 'application/pdf',
        fileSize: 189234,
        uploadedBy: 'emp-002',
        uploadedDate: new Date('2024-12-10'),
        fileUrl: '/documents/att-002.pdf',
      },
    ],

    audit: {
      createdAt: new Date('2024-12-10'),
      createdBy: 'emp-002',
      updatedAt: new Date('2024-12-10'),
      updatedBy: 'emp-002',
    },
  },
  {
    requestId: 'req-003',
    requestCode: 'REQ-2024-12-003',
    requestType: 'requisition',
    requestTitle: 'New Hire Requisition - Senior Backend Engineer',
    requestDate: new Date('2024-12-09'),

    requestedBy: 'manager-001',
    requestedByName: 'John Manager',
    requestedByDepartment: 'Engineering',

    approvalStatus: 'pending',
    priority: 'critical',
    dueDate: new Date('2024-12-16'),

    currentApproverId: 'director-001',
    currentApproverLevel: 1,

    approvalWorkflow: [
      {
        stepNumber: 1,
        stepName: 'Director Approval',
        approverId: 'director-001',
        approverName: 'Director of Engineering',
        approverRole: 'Director',
        status: 'pending',
        escalated: false,
      },
      {
        stepNumber: 2,
        stepName: 'VP Approval',
        approverId: 'vp-001',
        approverName: 'VP of Engineering',
        approverRole: 'VP',
        status: 'pending',
        escalated: false,
      },
      {
        stepNumber: 3,
        stepName: 'Finance Approval',
        approverId: 'cfo-001',
        approverName: 'CFO',
        approverRole: 'CFO',
        status: 'pending',
        escalated: false,
      },
    ],

    details: {
      requisitionId: 'req-hr-001',
      requisitionType: 'employee',
      positionTitle: 'Senior Backend Engineer',
      department: 'Engineering',
      location: 'Remote (US)',
      headcount: 1,
      employmentType: 'full_time',

      businessJustification: 'Team workload has increased by 40% due to new product initiatives. Current team is at capacity and we need additional backend expertise to support microservices migration.',
      isReplacement: false,

      requestedStartDate: new Date('2025-02-01'),
      urgency: 'critical',

      budgetedSalaryRange: {
        min: 140000,
        max: 180000,
        currency: 'USD',
      },
      additionalCosts: 35000,
      totalCost: 215000,
      budgetApproved: true,

      requiredSkills: ['Node.js', 'Python', 'PostgreSQL', 'Microservices', 'Kubernetes', 'AWS'],
      experienceRequired: '5+ years in backend development',
      qualifications: ["Bachelor's degree in Computer Science or related field", 'Strong system design skills'],
    },

    comments: [],
    history: [
      {
        historyId: 'hist-003',
        action: 'submitted',
        actionBy: 'manager-001',
        actionByName: 'John Manager',
        actionDate: new Date('2024-12-09'),
        toStatus: 'pending',
        remarks: 'Requisition submitted',
      },
    ],

    attachments: [
      {
        attachmentId: 'att-003',
        fileName: 'headcount-justification.pdf',
        fileType: 'application/pdf',
        fileSize: 324567,
        uploadedBy: 'manager-001',
        uploadedDate: new Date('2024-12-09'),
        fileUrl: '/documents/att-003.pdf',
      },
    ],

    audit: {
      createdAt: new Date('2024-12-09'),
      createdBy: 'manager-001',
      updatedAt: new Date('2024-12-09'),
      updatedBy: 'manager-001',
    },
  },
];

// ============================================================================
// Sample Delegation Rules
// ============================================================================

export const sampleDelegationRules: DelegationRule[] = [
  {
    delegationId: 'del-001',
    delegationCode: 'DEL-2024-12-001',
    delegationName: 'Holiday Delegation to Sarah Johnson',
    status: 'active',

    startDate: new Date('2024-12-23'),
    endDate: new Date('2024-12-27'),
    isTemporary: true,

    delegatorId: 'manager-001',
    delegatorName: 'John Manager',
    delegateId: 'emp-001',
    delegateName: 'Sarah Johnson',

    delegationType: 'approvals_only',
    delegationScope: [
      {
        scopeId: 'scope-001',
        scopeType: 'approval_type',
        scopeValue: 'leave',
        scopeDescription: 'Leave approvals',
        included: true,
      },
      {
        scopeId: 'scope-002',
        scopeType: 'approval_type',
        scopeValue: 'timesheet',
        scopeDescription: 'Timesheet approvals',
        included: true,
      },
    ],

    limits: [
      {
        limitType: 'amount',
        limitValue: 5000,
        limitUnit: 'USD',
        limitDescription: 'Maximum expense approval limit',
      },
    ],

    conditions: [],
    autoActivate: true,
    requiresApproval: false,

    notifyDelegator: true,
    notifyDelegate: true,
    escalationRules: [],

    activations: [
      {
        activationId: 'act-001',
        activationDate: new Date('2024-12-23'),
        reason: 'Manager on annual leave',
        triggeredBy: 'auto',
        isActive: false,
      },
    ],
    actionsPerformed: [],

    audit: {
      createdAt: new Date('2024-12-15'),
      createdBy: 'manager-001',
      updatedAt: new Date('2024-12-15'),
      updatedBy: 'manager-001',
    },
    approvedBy: 'director-001',
    approvalDate: new Date('2024-12-16'),
  },
];

// ============================================================================
// Sample Reports
// ============================================================================

export const sampleReports: TeamReport[] = [
  {
    reportId: 'report-001',
    reportCode: 'PERF-2024-11-001',
    reportName: 'November 2024 Performance Report',
    reportType: 'performance',
    description: 'Monthly team performance report for November 2024',

    generatedFor: 'manager-001',
    generatedForName: 'John Manager',
    period: 'monthly',
    periodStart: new Date('2024-11-01'),
    periodEnd: new Date('2024-11-30'),

    reportData: {
      teamId: 'team-001',
      teamName: 'Engineering Team Alpha',
      totalEmployees: 15,
      performanceDistribution: [
        { rating: 5, count: 3, percentage: 20 },
        { rating: 4, count: 6, percentage: 40 },
        { rating: 3, count: 4, percentage: 26.7 },
        { rating: 2, count: 2, percentage: 13.3 },
        { rating: 1, count: 0, percentage: 0 },
      ],
      employeePerformance: [],
      averageRating: 4.1,
      topPerformers: ['emp-001', 'emp-004'],
      needsImprovement: ['emp-005'],
      totalTeamGoals: 25,
      goalsCompleted: 18,
      goalsOnTrack: 5,
      goalsAtRisk: 1,
      goalsOverdue: 1,
    },

    charts: [
      {
        chartId: 'chart-001',
        chartType: 'bar',
        chartTitle: 'Performance Rating Distribution',
        chartData: {},
        position: 1,
      },
    ],

    status: 'published',
    generatedDate: new Date('2024-12-01'),
    generatedBy: 'manager-001',
    sharedWith: ['director-001', 'hr-001'],
    isConfidential: false,
    exportFormats: ['pdf', 'excel'],

    audit: {
      createdAt: new Date('2024-12-01'),
      createdBy: 'manager-001',
      updatedAt: new Date('2024-12-01'),
      updatedBy: 'manager-001',
    },
  },
];

// ============================================================================
// Sample Manager Settings
// ============================================================================

export const sampleManagerSettings: ManagerSettings = {
  settingsId: 'settings-manager-001',
  managerId: 'manager-001',

  dashboardLayout: [
    {
      widgetId: 'widget-001',
      widgetType: 'team_metrics',
      widgetTitle: 'Team Overview',
      position: { row: 0, col: 0, width: 2, height: 1 },
      visible: true,
      configuration: {},
    },
    {
      widgetId: 'widget-002',
      widgetType: 'pending_approvals',
      widgetTitle: 'Pending Approvals',
      position: { row: 0, col: 2, width: 1, height: 1 },
      visible: true,
      configuration: {},
    },
    {
      widgetId: 'widget-003',
      widgetType: 'performance_chart',
      widgetTitle: 'Team Performance',
      position: { row: 1, col: 0, width: 2, height: 1 },
      visible: true,
      configuration: {},
    },
  ],
  defaultView: 'overview',
  refreshInterval: 5,

  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyOnNewApproval: true,
    notifyOnApprovalOverdue: true,
    notifyOnTeamMilestone: true,
    notifyOnPerformanceAlert: true,
    dailyDigest: true,
    weeklyDigest: false,
  },

  approvalSettings: {
    autoApproveUnder: 1000,
    requireCommentsOnRejection: true,
    allowBulkApproval: true,
    escalationTimeout: 48,
  },

  reportSettings: {
    favoriteReports: ['performance', 'attendance'],
    autoGenerateReports: true,
    reportFrequency: 'monthly',
    reportDeliveryEmail: 'john.manager@company.com',
  },

  delegationSettings: {
    settingsId: 'del-settings-001',
    managerId: 'manager-001',
    enableAutoDelegation: true,
    autoDelegateOnLeave: true,
    autoDelegateOnTravel: false,
    defaultDelegateId: 'emp-001',
    notifyOnDelegation: true,
    notifyOnDelegateAction: true,
    dailyDigest: true,
    requireApprovalForDelegation: false,
    maxDelegationDuration: 90,
    allowChainDelegation: false,
    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'system',
      updatedAt: new Date('2024-11-15'),
      updatedBy: 'manager-001',
    },
  },

  audit: {
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
    updatedAt: new Date('2024-11-15'),
    updatedBy: 'manager-001',
  },
};

// Initialize localStorage with sample data
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('mss_team_members')) {
    localStorage.setItem('mss_team_members', JSON.stringify(sampleTeamMembers));
  }
  if (!localStorage.getItem('mss_team_metrics')) {
    localStorage.setItem('mss_team_metrics', JSON.stringify([sampleTeamMetrics]));
  }
  if (!localStorage.getItem('mss_team_goals')) {
    localStorage.setItem('mss_team_goals', JSON.stringify(sampleTeamGoals));
  }
  if (!localStorage.getItem('mss_approval_requests')) {
    localStorage.setItem('mss_approval_requests', JSON.stringify(sampleApprovalRequests));
  }
  if (!localStorage.getItem('mss_delegations')) {
    localStorage.setItem('mss_delegations', JSON.stringify(sampleDelegationRules));
  }
  if (!localStorage.getItem('mss_team_reports')) {
    localStorage.setItem('mss_team_reports', JSON.stringify(sampleReports));
  }
  if (!localStorage.getItem('mss_manager_settings')) {
    localStorage.setItem('mss_manager_settings', JSON.stringify([sampleManagerSettings]));
  }
}
