// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
import type { Ticket, SLAPolicy, Agent, KnowledgeBaseArticle, CannedResponse, EscalationMatrix, HelpdeskSettings } from './types';

export const sampleTickets: Ticket[] = [
  {
    ticketId: 'ticket-001',
    ticketNumber: 'TKT-2024-001',
    subject: 'Cannot access payroll system',
    description: 'I am unable to log into the payroll system. Getting error message "Invalid credentials" even though I am using the correct password.',
    category: 'it_access',
    priority: 'high',
    status: 'open',
    requester: {
      employeeId: 'emp-001',
      employeeName: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Finance',
      phone: '+1-555-0123',
      location: 'Building A, Floor 3'
    },
    assignedAgent: {
      agentId: 'agent-001',
      agentName: 'Mike Chen',
      email: 'mike.chen@company.com',
      department: 'HR IT Support',
      assignedAt: '2024-12-13T09:15:00Z',
      workload: 5,
      skillSet: ['IT Access', 'Payroll Systems', 'Active Directory']
    },
    slaInfo: {
      slaLevel: 'priority',
      firstResponseDue: '2024-12-13T09:30:00Z',
      firstResponseAt: '2024-12-13T09:20:00Z',
      resolutionDue: '2024-12-13T13:00:00Z',
      status: 'met',
      timeRemaining: 180,
      pausedTime: 0
    },
    tags: ['payroll', 'access', 'urgent'],
    attachments: [
      {
        attachmentId: 'att-001',
        fileName: 'error-screenshot.png',
        fileType: 'image/png',
        fileSize: 245678,
        uploadedBy: 'Sarah Johnson',
        uploadedAt: '2024-12-13T09:00:00Z',
        url: '/attachments/error-screenshot.png'
      }
    ],
    comments: [
      {
        commentId: 'comment-001',
        commentType: 'public',
        author: 'Mike Chen',
        authorType: 'agent',
        content: 'Hi Sarah, I am looking into this issue. It appears your account may have been locked due to multiple failed login attempts. I will reset it and send you new credentials shortly.',
        createdAt: '2024-12-13T09:20:00Z'
      }
    ],
    history: [
      {
        historyId: 'hist-001',
        action: 'created',
        performedBy: 'Sarah Johnson',
        performedAt: '2024-12-13T09:00:00Z',
        changes: []
      },
      {
        historyId: 'hist-002',
        action: 'assigned',
        performedBy: 'System',
        performedAt: '2024-12-13T09:15:00Z',
        changes: [
          {
            field: 'assignedAgent',
            oldValue: null,
            newValue: 'Mike Chen'
          },
          {
            field: 'status',
            oldValue: 'new',
            newValue: 'open'
          }
        ]
      }
    ],
    createdAt: '2024-12-13T09:00:00Z',
    updatedAt: '2024-12-13T09:20:00Z'
  }
];

export const sampleSLAPolicies: SLAPolicy[] = [
  {
    policyId: 'policy-001',
    policyName: 'Standard SLA',
    description: 'Default SLA policy for regular priority tickets',
    priority: 'medium',
    categories: ['payroll', 'benefits', 'time_off', 'policy'],
    firstResponseTime: 240,
    resolutionTime: 1440,
    businessHoursOnly: true,
    escalationRules: [
      {
        ruleId: 'rule-001',
        triggerCondition: 'sla_breach',
        escalateTo: 'supervisor',
        escalationLevel: 1,
        notificationTemplate: 'sla_breach_notification'
      }
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    policyId: 'policy-002',
    policyName: 'Priority SLA',
    description: 'SLA policy for high priority tickets',
    priority: 'high',
    categories: ['it_access', 'onboarding', 'offboarding'],
    firstResponseTime: 30,
    resolutionTime: 240,
    businessHoursOnly: false,
    escalationRules: [
      {
        ruleId: 'rule-002',
        triggerCondition: 'time_threshold',
        thresholdMinutes: 15,
        escalateTo: 'senior_agent',
        escalationLevel: 1,
        notificationTemplate: 'high_priority_escalation'
      },
      {
        ruleId: 'rule-003',
        triggerCondition: 'sla_breach',
        escalateTo: 'manager',
        escalationLevel: 2,
        notificationTemplate: 'manager_escalation'
      }
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const sampleAgents: Agent[] = [
  {
    agentId: 'agent-001',
    employeeId: 'emp-101',
    employeeName: 'Mike Chen',
    email: 'mike.chen@company.com',
    department: 'HR IT Support',
    role: 'senior_agent',
    skillSet: [
      {
        skillId: 'skill-001',
        skillName: 'IT Access Management',
        proficiencyLevel: 'expert',
        certifiedDate: '2023-06-15'
      },
      {
        skillId: 'skill-002',
        skillName: 'Payroll Systems',
        proficiencyLevel: 'advanced',
        certifiedDate: '2023-08-20'
      },
      {
        skillId: 'skill-003',
        skillName: 'Benefits Administration',
        proficiencyLevel: 'intermediate'
      }
    ],
    availability: {
      schedule: [
        {
          dayOfWeek: 'monday',
          startTime: '08:00',
          endTime: '17:00'
        },
        {
          dayOfWeek: 'tuesday',
          startTime: '08:00',
          endTime: '17:00'
        },
        {
          dayOfWeek: 'wednesday',
          startTime: '08:00',
          endTime: '17:00'
        },
        {
          dayOfWeek: 'thursday',
          startTime: '08:00',
          endTime: '17:00'
        },
        {
          dayOfWeek: 'friday',
          startTime: '08:00',
          endTime: '17:00'
        }
      ],
      timeZone: 'America/New_York',
      outOfOffice: false
    },
    performance: {
      averageResponseTime: 15,
      averageResolutionTime: 180,
      ticketsResolved: 145,
      ticketsAssigned: 150,
      slaComplianceRate: 96.7,
      averageSatisfactionRating: 4.6,
      firstContactResolutionRate: 78.5,
      period: {
        startDate: '2024-11-01',
        endDate: '2024-11-30'
      }
    },
    currentWorkload: 5,
    maxCapacity: 15,
    status: 'available',
    createdAt: '2023-01-15T00:00:00Z'
  }
];

export const sampleKnowledgeBaseArticles: KnowledgeBaseArticle[] = [
  {
    articleId: 'article-001',
    title: 'How to Reset Your Password',
    content: `# Password Reset Instructions\n\n## For Active Directory Accounts\n\n1. Navigate to the password reset portal at https://password.company.com\n2. Enter your employee ID and email address\n3. Answer your security questions\n4. Enter your new password (must meet complexity requirements)\n5. Confirm the new password\n6. Click "Reset Password"\n\nYour new password will be active immediately.\n\n## Password Requirements\n\n- Minimum 12 characters\n- At least one uppercase letter\n- At least one lowercase letter\n- At least one number\n- At least one special character (!@#$%^&*)\n- Cannot reuse last 12 passwords\n\n## Troubleshooting\n\nIf you cannot reset your password using the portal, please submit a helpdesk ticket.`,
    summary: 'Step-by-step guide for resetting Active Directory passwords',
    category: 'IT Access',
    tags: ['password', 'reset', 'active-directory', 'security'],
    author: 'Mike Chen',
    status: 'published',
    visibility: 'public',
    relatedArticles: ['article-002', 'article-003'],
    attachments: [],
    views: 1245,
    helpful: 1120,
    notHelpful: 15,
    linkedTickets: ['ticket-001'],
    version: 3,
    versionHistory: [
      {
        versionNumber: 1,
        content: 'Initial version',
        changedBy: 'Mike Chen',
        changedAt: '2024-01-15T00:00:00Z',
        changeNotes: 'Initial article creation'
      },
      {
        versionNumber: 2,
        content: 'Updated with new password requirements',
        changedBy: 'Mike Chen',
        changedAt: '2024-06-20T00:00:00Z',
        changeNotes: 'Updated password complexity requirements'
      }
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-06-20T00:00:00Z',
    publishedAt: '2024-01-15T00:00:00Z'
  }
];

export const sampleCannedResponses: CannedResponse[] = [
  {
    responseId: 'response-001',
    title: 'Welcome and First Response',
    shortcut: '/welcome',
    content: `Thank you for contacting HR Helpdesk. We have received your ticket and are reviewing it now.\n\nYour ticket number is {{ticket_number}} and has been assigned priority {{priority}}.\n\nWe will respond with more information shortly.\n\nBest regards,\n{{agent_name}}\nHR Helpdesk`,
    category: 'General',
    tags: ['first-response', 'welcome', 'acknowledgment'],
    visibility: 'global',
    createdBy: 'System Administrator',
    usageCount: 487,
    lastUsed: '2024-12-13T09:15:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    responseId: 'response-002',
    title: 'Password Reset Instructions',
    shortcut: '/password-reset',
    content: `I can help you reset your password. Please follow these steps:\n\n1. Go to https://password.company.com\n2. Enter your employee ID and email\n3. Answer your security questions\n4. Create a new password meeting the requirements\n\nIf you continue to experience issues, please let me know.\n\nRegards,\n{{agent_name}}`,
    category: 'IT Access',
    tags: ['password', 'reset', 'instructions'],
    visibility: 'team',
    createdBy: 'Mike Chen',
    usageCount: 234,
    lastUsed: '2024-12-13T08:45:00Z',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const sampleEscalationMatrices: EscalationMatrix[] = [
  {
    matrixId: 'matrix-001',
    matrixName: 'Standard Escalation Matrix',
    description: 'Default escalation matrix for all helpdesk tickets',
    levels: [
      {
        level: 1,
        levelName: 'Senior Agent',
        assignedTo: ['agent-002', 'agent-003'],
        autoAssign: true,
        notifyManagement: false,
        timeThreshold: 120
      },
      {
        level: 2,
        levelName: 'Supervisor',
        assignedTo: ['supervisor-001'],
        autoAssign: true,
        notifyManagement: true,
        timeThreshold: 240
      },
      {
        level: 3,
        levelName: 'Manager',
        assignedTo: ['manager-001'],
        autoAssign: false,
        notifyManagement: true,
        timeThreshold: 480
      }
    ],
    triggers: [
      {
        triggerId: 'trigger-001',
        triggerType: 'sla_breach',
        condition: 'SLA response time exceeded',
        targetLevel: 1,
        enabled: true
      },
      {
        triggerId: 'trigger-002',
        triggerType: 'priority',
        condition: 'Priority = critical',
        targetLevel: 2,
        enabled: true
      }
    ],
    notifications: [
      {
        ruleId: 'notif-001',
        eventType: 'escalated',
        recipients: ['manager-001', 'supervisor-001'],
        notificationMethod: 'email',
        template: 'escalation_notification',
        enabled: true
      }
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const sampleHelpdeskSettings: HelpdeskSettings = {
  settingsId: 'settings-001',
  organizationId: 'org-001',
  ticketSettings: {
    autoAssignment: true,
    assignmentMethod: 'skill_based',
    allowSelfAssignment: true,
    requireCategorySelection: true,
    defaultPriority: 'medium'
  },
  slaSettings: {
    enabled: true,
    businessHours: {
      monday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      thursday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      friday: { enabled: true, startTime: '08:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '', endTime: '' },
      sunday: { enabled: false, startTime: '', endTime: '' }
    },
    holidays: ['2024-12-25', '2025-01-01'],
    pauseOnPending: true
  },
  satisfactionSettings: {
    enabled: true,
    surveyTrigger: 'on_resolution',
    followUpEnabled: true,
    lowRatingThreshold: 3
  },
  escalationSettings: {
    autoEscalation: true,
    escalationThreshold: 120,
    notifyManagement: true
  },
  notifications: {
    newTicketAssigned: true,
    slaWarning: true,
    escalationAlert: true,
    satisfactionSurveyReady: true
  },
  updatedAt: '2024-01-01T00:00:00Z'
};
