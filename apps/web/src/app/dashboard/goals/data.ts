// Goal Management Sample Data
import type {
  Goal,
  KeyResult,
  GoalCheckIn,
  GoalCycle,
  GoalTemplate,
  GoalAlignment,
  GoalAnalytics,
  GoalSettings
} from './types';

export const sampleCycles: GoalCycle[] = [
  {
    id: 'cycle-001',
    cycleCode: 'Q4-2024',
    cycleName: 'Q4 2024 Objectives',
    cycleType: 'quarterly',
    fiscalYear: '2024',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    status: 'active',
    description: 'Fourth quarter 2024 company objectives and key results',
    isActive: true,
    goalCount: 45,
    completionRate: 68.5,
    applicableTo: {},
    milestones: [
      {
        id: 'milestone-001',
        title: 'Mid-Quarter Review',
        date: '2024-11-15',
        description: 'Review progress on all Q4 objectives',
        isCompleted: true
      },
      {
        id: 'milestone-002',
        title: 'End of Quarter Close',
        date: '2024-12-31',
        description: 'Final assessment and planning for Q1 2025',
        isCompleted: false
      }
    ],
    createdBy: 'admin',
    createdDate: '2024-09-15',
    lastModified: '2024-12-10'
  }
];

const sampleKeyResults: KeyResult[] = [
  {
    id: 'kr-001',
    goalId: 'goal-001',
    title: 'Increase Monthly Active Users',
    description: 'Grow MAU from 50K to 75K',
    measurementType: 'number',
    startValue: 50000,
    targetValue: 75000,
    currentValue: 68000,
    unit: 'users',
    progress: 72,
    status: 'on_track',
    dueDate: '2024-12-31',
    updates: [
      {
        id: 'kru-001',
        keyResultId: 'kr-001',
        updateDate: '2024-12-01',
        previousValue: 62000,
        currentValue: 68000,
        progress: 72,
        comment: 'Strong growth this month from new marketing campaign',
        updatedBy: 'emp-001',
        updatedByName: 'Jane Doe'
      }
    ],
    lastUpdateDate: '2024-12-01',
    isCompleted: false,
    weight: 40,
    createdDate: '2024-10-01',
    lastModified: '2024-12-01'
  },
  {
    id: 'kr-002',
    goalId: 'goal-001',
    title: 'Improve User Engagement Rate',
    description: 'Increase daily engagement from 35% to 50%',
    measurementType: 'percentage',
    startValue: 35,
    targetValue: 50,
    currentValue: 45,
    unit: '%',
    progress: 66.7,
    status: 'on_track',
    dueDate: '2024-12-31',
    updates: [],
    isCompleted: false,
    weight: 30,
    createdDate: '2024-10-01',
    lastModified: '2024-12-01'
  },
  {
    id: 'kr-003',
    goalId: 'goal-001',
    title: 'Reduce Churn Rate',
    description: 'Decrease monthly churn from 8% to 5%',
    measurementType: 'percentage',
    startValue: 8,
    targetValue: 5,
    currentValue: 6,
    unit: '%',
    progress: 66.7,
    status: 'on_track',
    dueDate: '2024-12-31',
    updates: [],
    isCompleted: false,
    weight: 30,
    createdDate: '2024-10-01',
    lastModified: '2024-12-01'
  }
];

const sampleCheckIns: GoalCheckIn[] = [
  {
    id: 'checkin-001',
    goalId: 'goal-001',
    checkInDate: '2024-12-01',
    status: 'on_track',
    progress: 70,
    confidenceLevel: 85,
    summary: 'Strong progress this week. Marketing campaign driving significant user growth.',
    achievements: [
      'Launched new social media campaign',
      'Improved onboarding flow - 20% increase in completion rate',
      'Released two new features that users love'
    ],
    challenges: [
      'Churn rate still slightly above target',
      'Need more resources for customer support'
    ],
    nextSteps: [
      'Analyze churn reasons and develop retention strategy',
      'Launch targeted re-engagement campaign for inactive users',
      'Gather feedback on new features'
    ],
    supportNeeded: 'Additional budget for customer success team',
    keyResultUpdates: [
      { keyResultId: 'kr-001', value: 68000, comment: 'Exceeded monthly target' },
      { keyResultId: 'kr-002', value: 45 },
      { keyResultId: 'kr-003', value: 6, comment: 'Slight improvement but need more work' }
    ],
    isOnTrack: true,
    blockers: [],
    submittedBy: 'emp-001',
    submittedByName: 'Jane Doe',
    createdDate: '2024-12-01T10:00:00Z'
  }
];

export const sampleGoals: Goal[] = [
  {
    id: 'goal-001',
    goalCode: 'GOAL-2024-Q4-001',
    title: 'Accelerate Product Growth',
    description: 'Drive significant user acquisition and engagement to position the product as market leader in our segment',
    goalType: 'company',
    category: 'strategic',
    status: 'active',
    priority: 'critical',
    visibility: 'company',
    ownerId: 'emp-ceo',
    ownerName: 'Sarah Chen',
    ownerEmail: 'sarah.chen@company.com',
    departmentId: 'dept-001',
    departmentName: 'Executive Office',
    childGoals: ['goal-002', 'goal-003'],
    alignedGoals: [],
    cycleId: 'cycle-001',
    cycleName: 'Q4 2024 Objectives',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    targetCompletionDate: '2024-12-31',
    keyResults: sampleKeyResults,
    progress: 70,
    progressStatus: 'on_track',
    milestones: [
      {
        id: 'milestone-g1-001',
        goalId: 'goal-001',
        title: '60K MAU Milestone',
        description: 'Reach 60,000 monthly active users',
        dueDate: '2024-11-15',
        completedDate: '2024-11-12',
        status: 'completed',
        assignedTo: 'emp-001',
        assignedToName: 'Jane Doe',
        deliverables: ['Marketing campaign results', 'User analytics report'],
        isCompleted: true,
        createdDate: '2024-10-01'
      }
    ],
    checkIns: sampleCheckIns,
    lastCheckInDate: '2024-12-01',
    nextCheckInDate: '2024-12-08',
    checkInFrequency: 'weekly',
    metrics: {
      totalKeyResults: 3,
      completedKeyResults: 0,
      keyResultCompletionRate: 0,
      averageProgress: 68.5,
      daysRemaining: 21,
      daysElapsed: 61,
      percentTimeElapsed: 74.4,
      isAhead: false,
      isBehind: false,
      healthScore: 82
    },
    tags: ['growth', 'product', 'q4-2024'],
    collaborators: [
      {
        id: 'collab-001',
        goalId: 'goal-001',
        employeeId: 'emp-001',
        employeeName: 'Jane Doe',
        role: 'contributor',
        permissions: ['edit', 'comment'],
        addedBy: 'emp-ceo',
        addedDate: '2024-10-01'
      }
    ],
    watchers: ['emp-cto', 'emp-cmo'],
    attachments: [],
    comments: [],
    isSMART: true,
    smartCriteria: {
      specific: true,
      measurable: true,
      achievable: true,
      relevant: true,
      timeBound: true,
      score: 100,
      feedback: []
    },
    weight: 40,
    outcomeImpact: {
      impactArea: ['Revenue', 'Market Share', 'Brand Recognition'],
      estimatedImpact: 'high',
      beneficiaries: ['Product Team', 'Sales Team', 'Marketing Team'],
      successMetrics: ['MAU Growth', 'Engagement Rate', 'Revenue Growth']
    },
    risks: [
      {
        id: 'risk-001',
        goalId: 'goal-001',
        riskTitle: 'Competitor Launch',
        riskDescription: 'Major competitor planning to launch similar feature set',
        probability: 'medium',
        impact: 'high',
        severity: 7,
        mitigationPlan: 'Accelerate feature development, strengthen unique value proposition',
        status: 'monitoring',
        identifiedBy: 'emp-001',
        identifiedDate: '2024-11-01'
      }
    ],
    dependencies: [],
    isPrivate: false,
    isArchived: false,
    createdBy: 'emp-ceo',
    createdDate: '2024-10-01',
    lastModified: '2024-12-01',
    lastModifiedBy: 'emp-001'
  },
  {
    id: 'goal-002',
    goalCode: 'GOAL-2024-Q4-002',
    title: 'Launch Mobile App',
    description: 'Successfully launch iOS and Android mobile applications to expand platform reach',
    goalType: 'team',
    category: 'operational',
    status: 'active',
    priority: 'high',
    visibility: 'department',
    ownerId: 'emp-cto',
    ownerName: 'Michael Zhang',
    ownerEmail: 'michael.zhang@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    parentGoalId: 'goal-001',
    parentGoalTitle: 'Accelerate Product Growth',
    childGoals: [],
    alignedGoals: ['goal-001'],
    cycleId: 'cycle-001',
    cycleName: 'Q4 2024 Objectives',
    startDate: '2024-10-01',
    endDate: '2024-12-15',
    targetCompletionDate: '2024-12-15',
    keyResults: [
      {
        id: 'kr-004',
        goalId: 'goal-002',
        title: 'Complete iOS Development',
        description: 'Build and test iOS application',
        measurementType: 'percentage',
        startValue: 0,
        targetValue: 100,
        currentValue: 95,
        unit: '%',
        progress: 95,
        status: 'on_track',
        dueDate: '2024-12-10',
        updates: [],
        isCompleted: false,
        createdDate: '2024-10-01',
        lastModified: '2024-12-01'
      },
      {
        id: 'kr-005',
        goalId: 'goal-002',
        title: 'Complete Android Development',
        description: 'Build and test Android application',
        measurementType: 'percentage',
        startValue: 0,
        targetValue: 100,
        currentValue: 90,
        unit: '%',
        progress: 90,
        status: 'on_track',
        dueDate: '2024-12-10',
        updates: [],
        isCompleted: false,
        createdDate: '2024-10-01',
        lastModified: '2024-12-01'
      },
      {
        id: 'kr-006',
        goalId: 'goal-002',
        title: 'App Store Approval',
        description: 'Get apps approved in both stores',
        measurementType: 'boolean',
        startValue: 0,
        targetValue: 1,
        currentValue: 0,
        progress: 0,
        status: 'in_progress',
        dueDate: '2024-12-15',
        updates: [],
        isCompleted: false,
        createdDate: '2024-10-01',
        lastModified: '2024-12-01'
      }
    ],
    progress: 62,
    progressStatus: 'on_track',
    milestones: [],
    checkIns: [],
    checkInFrequency: 'weekly',
    metrics: {
      totalKeyResults: 3,
      completedKeyResults: 0,
      keyResultCompletionRate: 0,
      averageProgress: 62,
      daysRemaining: 5,
      daysElapsed: 61,
      percentTimeElapsed: 92.4,
      isAhead: false,
      isBehind: true,
      healthScore: 65
    },
    tags: ['mobile', 'product', 'launch'],
    collaborators: [],
    watchers: [],
    attachments: [],
    comments: [],
    isSMART: true,
    smartCriteria: {
      specific: true,
      measurable: true,
      achievable: true,
      relevant: true,
      timeBound: true,
      score: 100,
      feedback: []
    },
    risks: [],
    dependencies: [],
    isPrivate: false,
    isArchived: false,
    createdBy: 'emp-cto',
    createdDate: '2024-10-01',
    lastModified: '2024-12-01',
    lastModifiedBy: 'emp-cto'
  }
];

export const sampleTemplates: GoalTemplate[] = [
  {
    id: 'template-001',
    templateCode: 'TMPL-GROWTH',
    templateName: 'User Growth Goal',
    description: 'Template for setting user acquisition and growth objectives',
    goalType: 'company',
    category: 'strategic',
    suggestedTitle: 'Grow User Base',
    suggestedDescription: 'Increase monthly active users through targeted marketing and product improvements',
    keyResultTemplates: [
      {
        title: 'Monthly Active Users',
        description: 'Increase MAU by X%',
        measurementType: 'number',
        suggestedTarget: 'Current MAU + 50%',
        unit: 'users'
      },
      {
        title: 'User Engagement Rate',
        description: 'Improve daily active users / monthly active users ratio',
        measurementType: 'percentage',
        suggestedTarget: '40-60%',
        unit: '%'
      },
      {
        title: 'User Retention',
        description: 'Reduce churn rate',
        measurementType: 'percentage',
        suggestedTarget: '< 5%',
        unit: '%'
      }
    ],
    suggestedDuration: 90,
    suggestedCheckInFrequency: 'weekly',
    tags: ['growth', 'product', 'marketing'],
    isPublic: true,
    usageCount: 15,
    rating: 4.5,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'template-002',
    templateCode: 'TMPL-REVENUE',
    templateName: 'Revenue Growth Goal',
    description: 'Template for revenue and sales objectives',
    goalType: 'company',
    category: 'financial',
    suggestedTitle: 'Increase Revenue',
    suggestedDescription: 'Drive revenue growth through new customer acquisition and expansion',
    keyResultTemplates: [
      {
        title: 'Monthly Recurring Revenue',
        description: 'Grow MRR to target amount',
        measurementType: 'currency',
        suggestedTarget: 'Current MRR + 25%',
        unit: '$'
      },
      {
        title: 'New Customer Acquisition',
        description: 'Acquire X new customers',
        measurementType: 'number',
        suggestedTarget: 'Based on sales capacity',
        unit: 'customers'
      },
      {
        title: 'Average Deal Size',
        description: 'Increase average contract value',
        measurementType: 'currency',
        suggestedTarget: 'Current ACV + 15%',
        unit: '$'
      }
    ],
    suggestedDuration: 90,
    suggestedCheckInFrequency: 'bi_weekly',
    tags: ['revenue', 'sales', 'growth'],
    isPublic: true,
    usageCount: 12,
    rating: 4.7,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  }
];

export const sampleAlignments: GoalAlignment[] = [
  {
    id: 'align-001',
    sourceGoalId: 'goal-002',
    sourceGoalTitle: 'Launch Mobile App',
    targetGoalId: 'goal-001',
    targetGoalTitle: 'Accelerate Product Growth',
    alignmentType: 'cascaded',
    alignmentStrength: 'strong',
    description: 'Mobile app launch supports overall product growth strategy',
    createdBy: 'emp-cto',
    createdDate: '2024-10-01'
  }
];

export const sampleAnalytics: GoalAnalytics = {
  totalGoals: 45,
  activeGoals: 38,
  completedGoals: 7,
  onTrackGoals: 28,
  atRiskGoals: 7,
  behindGoals: 3,
  averageProgress: 68.5,
  completionRate: 15.6,
  averageHealthScore: 76,
  goalsByType: [
    { type: 'company', count: 8, completionRate: 25 },
    { type: 'department', count: 15, completionRate: 20 },
    { type: 'team', count: 12, completionRate: 16.7 },
    { type: 'individual', count: 10, completionRate: 10 }
  ],
  goalsByCategory: [
    { category: 'strategic', count: 12, completionRate: 25 },
    { category: 'operational', count: 15, completionRate: 20 },
    { category: 'financial', count: 8, completionRate: 12.5 },
    { category: 'performance', count: 10, completionRate: 10 }
  ],
  goalsByStatus: [
    { status: 'active', count: 38 },
    { status: 'on_track', count: 28 },
    { status: 'at_risk', count: 7 },
    { status: 'behind', count: 3 },
    { status: 'completed', count: 7 }
  ],
  goalsByDepartment: [
    { departmentId: 'dept-001', departmentName: 'Executive Office', goals: 8, completionRate: 25 },
    { departmentId: 'dept-002', departmentName: 'Engineering', goals: 15, completionRate: 20 },
    { departmentId: 'dept-005', departmentName: 'Sales & Marketing', goals: 12, completionRate: 16.7 }
  ],
  topPerformers: [
    { employeeId: 'emp-001', employeeName: 'Jane Doe', goals: 5, completionRate: 40, averageProgress: 82 },
    { employeeId: 'emp-cto', employeeName: 'Michael Zhang', goals: 6, completionRate: 33.3, averageProgress: 75 }
  ],
  alignmentScore: 85,
  checkInCompliance: 78,
  averageCheckInFrequency: 7.2,
  cycleProgress: [
    { cycleId: 'cycle-001', cycleName: 'Q4 2024 Objectives', progress: 68.5, goals: 45 }
  ],
  keyResultMetrics: {
    totalKeyResults: 135,
    completedKeyResults: 28,
    completionRate: 20.7,
    averageProgress: 65
  },
  trends: [
    { period: '2024-10', goalsCreated: 45, goalsCompleted: 2, averageProgress: 25 },
    { period: '2024-11', goalsCreated: 3, goalsCompleted: 3, averageProgress: 55 },
    { period: '2024-12', goalsCreated: 2, goalsCompleted: 2, averageProgress: 68.5 }
  ]
};

export const sampleSettings: GoalSettings = {
  enableGoalManagement: true,
  enableOKRs: true,
  enableGoalAlignment: true,
  enableGoalTemplates: true,
  requireGoalApproval: false,
  approvalRequired: false,
  approvalLevels: 1,
  defaultCycleDuration: 90,
  defaultCheckInFrequency: 'weekly',
  mandatoryCheckIns: false,
  checkInReminderDays: 1,
  enablePrivateGoals: true,
  enableGoalCollaboration: true,
  enableGoalComments: true,
  enableGoalReviews: true,
  enableSMARTValidation: true,
  minKeyResults: 1,
  maxKeyResults: 5,
  defaultGoalVisibility: 'team',
  allowCascading: true,
  maxGoalDepth: 5,
  enableNotifications: true,
  notifyOnCheckInDue: true,
  notifyOnGoalDue: true,
  notifyOnFeedback: true,
  goalDueSoonDays: 7,
  enableGoalWeighting: false,
  enableRiskTracking: true,
  enableDependencyTracking: true,
  fiscalYearStart: '01-01',
  defaultCurrency: 'USD'
};

export const goalData = {
  goals: sampleGoals,
  cycles: sampleCycles,
  templates: sampleTemplates,
  alignments: sampleAlignments,
  analytics: sampleAnalytics,
  settings: sampleSettings
};
