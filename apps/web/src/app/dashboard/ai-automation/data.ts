// AI Automation Module - Sample Data
// Comprehensive mock data for testing and development

import type {
  OrgHealthPrediction,
  CoachingSession,
  ResumeScreening,
  AttritionPrediction,
  DetectedAnomaly,
  InterviewSchedule,
  AIAutomationSettings} from './types';
import {
  GeneratedWorkflow,
  LeaveForecast,
  ChatbotConversation
} from './types';

// ============================================================================
// ORG HEALTH PREDICTOR SAMPLE DATA
// ============================================================================

export const sampleOrgHealthPredictions: OrgHealthPrediction[] = [
  {
    predictionId: 'pred-001',
    predictionDate: new Date(),
    overallHealthScore: 78,
    healthTrend: 'improving',
    confidenceLevel: 'high',
    dimensionScores: [
      {
        dimensionId: 'dim-001',
        dimensionName: 'Employee Engagement',
        score: 82,
        trend: 'up',
        indicators: [
          {
            indicatorName: 'eNPS Score',
            currentValue: 45,
            benchmarkValue: 40,
            variance: 12.5,
            status: 'good',
          },
          {
            indicatorName: 'Participation Rate',
            currentValue: 88,
            benchmarkValue: 85,
            variance: 3.5,
            status: 'good',
          },
        ],
      },
      {
        dimensionId: 'dim-002',
        dimensionName: 'Retention & Attrition',
        score: 75,
        trend: 'stable',
        indicators: [
          {
            indicatorName: 'Turnover Rate',
            currentValue: 12,
            benchmarkValue: 15,
            variance: -20,
            status: 'good',
          },
          {
            indicatorName: 'High Performer Retention',
            currentValue: 92,
            benchmarkValue: 90,
            variance: 2.2,
            status: 'good',
          },
        ],
      },
      {
        dimensionId: 'dim-003',
        dimensionName: 'Performance',
        score: 80,
        trend: 'up',
        indicators: [
          {
            indicatorName: 'Goal Achievement Rate',
            currentValue: 85,
            benchmarkValue: 80,
            variance: 6.25,
            status: 'good',
          },
        ],
      },
      {
        dimensionId: 'dim-004',
        dimensionName: 'Learning & Development',
        score: 72,
        trend: 'stable',
        indicators: [
          {
            indicatorName: 'Training Completion Rate',
            currentValue: 78,
            benchmarkValue: 85,
            variance: -8.2,
            status: 'warning',
          },
        ],
      },
    ],
    riskAreas: [
      {
        riskId: 'risk-001',
        category: 'Attrition',
        description: 'High attrition risk in Engineering department',
        severity: 'high',
        probability: 75,
        impact: 85,
        affectedDepartments: ['Engineering'],
        affectedEmployeeCount: 45,
        mitigationSuggestions: [
          'Review compensation benchmarking',
          'Implement retention bonuses',
          'Enhance career development programs',
        ],
      },
      {
        riskId: 'risk-002',
        category: 'Engagement',
        description: 'Declining engagement in Sales team',
        severity: 'medium',
        probability: 60,
        impact: 70,
        affectedDepartments: ['Sales'],
        affectedEmployeeCount: 28,
        mitigationSuggestions: [
          'Conduct pulse surveys',
          'Improve manager training',
          'Review workload distribution',
        ],
      },
    ],
    predictions: {
      threeMonthOutlook: {
        projectedScore: 80,
        confidenceInterval: { lower: 76, upper: 84 },
        keyDrivers: [
          'Successful completion of engagement initiatives',
          'Improved manager effectiveness',
          'Stable retention rates',
        ],
        scenarioAnalysis: {
          bestCase: 85,
          worstCase: 72,
          mostLikely: 80,
        },
      },
      sixMonthOutlook: {
        projectedScore: 82,
        confidenceInterval: { lower: 77, upper: 87 },
        keyDrivers: [
          'Career development program impact',
          'Compensation adjustments',
          'Talent acquisition success',
        ],
        scenarioAnalysis: {
          bestCase: 88,
          worstCase: 74,
          mostLikely: 82,
        },
      },
      twelveMonthOutlook: {
        projectedScore: 84,
        confidenceInterval: { lower: 78, upper: 90 },
        keyDrivers: [
          'Cultural transformation initiatives',
          'Leadership development',
          'Technology enablement',
        ],
        scenarioAnalysis: {
          bestCase: 92,
          worstCase: 76,
          mostLikely: 84,
        },
      },
    },
    recommendations: [
      {
        recommendationId: 'rec-001',
        priority: 'high',
        category: 'Retention',
        recommendation:
          'Implement targeted retention program for Engineering high performers',
        expectedImpact: '25% reduction in Engineering attrition',
        estimatedEffort: 'medium',
        timeline: '3 months',
        stakeholders: ['HR', 'Engineering Leadership', 'Compensation'],
      },
      {
        recommendationId: 'rec-002',
        priority: 'medium',
        category: 'Engagement',
        recommendation: 'Launch manager effectiveness training program',
        expectedImpact: '15% improvement in engagement scores',
        estimatedEffort: 'medium',
        timeline: '6 months',
        stakeholders: ['HR', 'L&D', 'All Managers'],
      },
      {
        recommendationId: 'rec-003',
        priority: 'high',
        category: 'Learning',
        recommendation: 'Enhance learning platform and content library',
        expectedImpact: '30% increase in training completion',
        estimatedEffort: 'high',
        timeline: '9 months',
        stakeholders: ['L&D', 'IT', 'HR'],
      },
    ],
    dataSources: [
      'HRIS Employee Data',
      'Performance Management System',
      'Engagement Survey Results',
      'Learning Management System',
      'Exit Interview Data',
    ],
    modelVersion: 'v2.1.0',
    createdDate: new Date(),
  },
];

// (Continued in next message due to length...)

// ============================================================================
// AI COACHING BOT SAMPLE DATA
// ============================================================================

export const sampleCoachingSessions: CoachingSession[] = [
  {
    sessionId: 'session-001',
    employeeId: 'emp-001',
    employeeName: 'Sarah Johnson',
    sessionType: 'career',
    startTime: new Date('2024-04-15T10:00:00'),
    endTime: new Date('2024-04-15T10:45:00'),
    duration: 45,
    messages: [
      {
        messageId: 'msg-001',
        sender: 'user',
        message: 'I want to discuss my career growth opportunities',
        timestamp: new Date('2024-04-15T10:00:00'),
      },
      {
        messageId: 'msg-002',
        sender: 'bot',
        message:
          "I'd be happy to help you explore career growth opportunities! Can you tell me more about what aspects you're most interested in - skill development, new roles, leadership, or something else?",
        timestamp: new Date('2024-04-15T10:00:30'),
      },
    ],
    sentimentAnalysis: {
      overallSentiment: 'positive',
      sentimentScore: 0.65,
      emotionalTone: ['hopeful', 'curious', 'engaged'],
      concernLevel: 'low',
    },
    topics: ['career development', 'skill growth', 'advancement'],
    keyInsights: [
      'Employee seeking clear career path',
      'Interested in leadership development',
      'Strong motivation for growth',
    ],
    actionItems: [
      {
        actionId: 'action-001',
        description: 'Complete leadership assessment',
        category: 'development',
        priority: 'high',
        dueDate: new Date('2024-04-30'),
        completed: false,
      },
      {
        actionId: 'action-002',
        description: 'Schedule mentor meeting',
        category: 'networking',
        priority: 'medium',
        completed: false,
      },
    ],
    resources: [
      {
        resourceId: 'res-001',
        resourceType: 'course',
        title: 'Leadership Fundamentals',
        description: 'Core leadership skills development program',
        url: '/learning/leadership-fundamentals',
        relevanceScore: 92,
      },
      {
        resourceId: 'res-002',
        resourceType: 'article',
        title: 'Career Planning Guide',
        description: 'Step-by-step career planning framework',
        url: '/resources/career-planning',
        relevanceScore: 88,
      },
    ],
    followUpScheduled: true,
    followUpDate: new Date('2024-05-15'),
    satisfactionRating: 5,
    helpfulnessRating: 5,
    status: 'completed',
    createdDate: new Date('2024-04-15T10:00:00'),
  },
];

// ============================================================================
// RESUME SCREENING SAMPLE DATA
// ============================================================================

export const sampleResumeScreenings: ResumeScreening[] = [
  {
    screeningId: 'screen-001',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    candidateId: 'cand-001',
    candidateName: 'Alex Martinez',
    resumeUrl: '/resumes/alex-martinez.pdf',
    overallScore: 88,
    overallRanking: 1,
    recommendation: 'strong_match',
    skillsMatch: {
      requiredSkills: [
        {
          skillName: 'React',
          required: true,
          found: true,
          proficiencyLevel: 'advanced',
          yearsOfExperience: 5,
          matchScore: 95,
        },
        {
          skillName: 'TypeScript',
          required: true,
          found: true,
          proficiencyLevel: 'expert',
          yearsOfExperience: 4,
          matchScore: 92,
        },
        {
          skillName: 'Node.js',
          required: true,
          found: true,
          proficiencyLevel: 'advanced',
          yearsOfExperience: 5,
          matchScore: 90,
        },
      ],
      preferredSkills: [
        {
          skillName: 'AWS',
          required: false,
          found: true,
          proficiencyLevel: 'intermediate',
          yearsOfExperience: 3,
          matchScore: 85,
        },
      ],
      additionalSkills: ['Python', 'Docker', 'Kubernetes', 'GraphQL'],
      overallMatchPercentage: 92,
      topMatchingSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      missingCriticalSkills: [],
    },
    experienceMatch: {
      totalYearsRequired: 5,
      totalYearsFound: 7,
      relevantExperienceYears: 6,
      industryMatch: true,
      seniorityMatch: true,
      careerProgression: 'excellent',
      relevantCompanies: ['Tech Startup Inc', 'Enterprise Solutions Ltd'],
    },
    educationMatch: {
      degreeRequired: "Bachelor's in Computer Science",
      degreeFound: "Bachelor's in Computer Science",
      degreeMismatch: false,
      institutions: ['State University'],
      certifications: ['AWS Certified Solutions Architect', 'React Advanced'],
      continualLearning: true,
    },
    cultureFitScore: 85,
    extractedData: {
      contactInfo: {
        email: 'alex.martinez@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        linkedIn: 'linkedin.com/in/alexmartinez',
        portfolio: 'alexmartinez.dev',
      },
      summary:
        'Experienced full-stack engineer with 7 years building scalable web applications...',
      workHistory: [
        {
          company: 'Tech Startup Inc',
          title: 'Senior Software Engineer',
          startDate: '2020-01',
          endDate: 'Present',
          duration: '4+ years',
          responsibilities: [
            'Led development of customer-facing React applications',
            'Architected microservices backend with Node.js',
            'Mentored junior developers',
          ],
          achievements: [
            'Reduced page load time by 60%',
            'Implemented CI/CD pipeline reducing deployment time by 80%',
          ],
        },
      ],
      education: [
        {
          institution: 'State University',
          degree: "Bachelor's",
          field: 'Computer Science',
          graduationYear: '2017',
          gpa: '3.8',
          honors: ['Summa Cum Laude', "Dean's List"],
        },
      ],
      skills: [
        'React',
        'TypeScript',
        'Node.js',
        'AWS',
        'Python',
        'Docker',
        'Kubernetes',
      ],
      certifications: [
        'AWS Certified Solutions Architect',
        'React Advanced Certification',
      ],
      languages: ['English (Native)', 'Spanish (Fluent)'],
      achievements: [
        'Published 3 open-source libraries with 10k+ downloads',
        'Speaker at React Conference 2023',
      ],
    },
    redFlags: [],
    strengths: [
      'Strong technical skills matching all requirements',
      'Excellent career progression',
      'Active in open-source community',
      'Strong educational background',
    ],
    interviewRecommended: true,
    interviewType: 'technical',
    suggestedInterviewers: ['Senior Tech Lead', 'Engineering Manager'],
    interviewFocusAreas: [
      'System design capabilities',
      'Leadership potential',
      'Team collaboration',
    ],
    modelVersion: 'v1.5.0',
    confidenceLevel: 'very_high',
    processingTime: 1250,
    screeningDate: new Date(),
    reviewedByHuman: false,
  },
];

// ============================================================================
// ATTRITION PREDICTION SAMPLE DATA
// ============================================================================

export const sampleAttritionPredictions: AttritionPrediction[] = [
  {
    predictionId: 'attrition-001',
    employeeId: 'emp-101',
    employeeName: 'Jennifer Lee',
    department: 'Engineering',
    position: 'Software Engineer',
    attritionRisk: 'high',
    attritionProbability: 75,
    predictedTimeframe: '3_months',
    confidenceLevel: 'high',
    riskFactors: [
      {
        factorName: 'Below Market Compensation',
        category: 'compensation',
        impact: 85,
        trend: 'increasing',
        description: 'Salary 15% below market average for role and experience',
        dataPoints: ['Market benchmarking data', 'Compensation review history'],
      },
      {
        factorName: 'Low Engagement Score',
        category: 'engagement',
        impact: 70,
        trend: 'decreasing',
        description: 'Engagement score declined from 82 to 55 over 6 months',
        dataPoints: ['Quarterly engagement surveys', 'Pulse survey responses'],
      },
      {
        factorName: 'No Promotion in 3 Years',
        category: 'career',
        impact: 65,
        trend: 'stable',
        description: 'No career advancement despite strong performance',
        dataPoints: ['Performance review history', 'Career progression data'],
      },
      {
        factorName: 'High Workload',
        category: 'workload',
        impact: 60,
        trend: 'increasing',
        description: 'Consistently working 20% over standard hours',
        dataPoints: ['Timesheet data', 'Project allocation records'],
      },
    ],
    topRiskFactors: [
      'Below Market Compensation',
      'Low Engagement Score',
      'No Promotion in 3 Years',
    ],
    employeeMetrics: {
      tenure: 36,
      performanceRating: 4.2,
      engagementScore: 55,
      satisfactionScore: 60,
      lastPromotionMonths: 36,
      compensationPercentile: 35,
      workloadScore: 85,
      managerRelationshipScore: 65,
    },
    retentionStrategies: [
      {
        strategyId: 'strat-001',
        strategyName: 'Competitive Compensation Adjustment',
        category: 'Compensation',
        description: 'Adjust salary to 75th percentile of market rate',
        priority: 'critical',
        estimatedImpact: 40,
        estimatedCost: 15000,
        timeline: 'Immediate',
        owner: 'Compensation Team',
        status: 'proposed',
      },
      {
        strategyId: 'strat-002',
        strategyName: 'Career Development Plan',
        category: 'Career Growth',
        description:
          'Create clear path to Senior Engineer with defined milestones',
        priority: 'high',
        estimatedImpact: 25,
        estimatedCost: 5000,
        timeline: '1 month',
        owner: 'Manager',
        status: 'proposed',
      },
      {
        strategyId: 'strat-003',
        strategyName: 'Workload Rebalancing',
        category: 'Work-Life Balance',
        description: 'Redistribute projects and add team member',
        priority: 'high',
        estimatedImpact: 20,
        estimatedCost: 80000,
        timeline: '2 months',
        owner: 'Engineering Manager',
        status: 'proposed',
      },
    ],
    similarCases: 42,
    actualAttritionRate: 68,
    lastUpdated: new Date(),
    nextReviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    alertsEnabled: true,
    predictionDate: new Date(),
    modelVersion: 'v2.0.0',
  },
];

// ============================================================================
// DETECTED ANOMALY SAMPLE DATA
// ============================================================================

export const sampleDetectedAnomalies: DetectedAnomaly[] = [
  {
    anomalyId: 'anom-001',
    detectedDate: new Date(),
    category: 'timesheet',
    severity: 'high',
    status: 'new',
    anomalyType: 'Unusual overtime pattern',
    description:
      'Employee logging 80+ hours per week for 4 consecutive weeks',
    entityType: 'employee',
    entityId: 'emp-205',
    entityName: 'Michael Chen',
    expectedValue: 40,
    actualValue: 82,
    deviation: 42,
    deviationPercentage: 105,
    anomalyScore: 92,
    pattern: 'Sustained high overtime',
    frequency: 'recurring',
    relatedAnomalies: [],
    potentialImpact: 'Burnout risk, compliance issues, potential data error',
    affectedProcesses: ['Time & Attendance', 'Payroll', 'Resource Planning'],
    estimatedCost: 5000,
    modelVersion: 'v1.2.0',
    confidenceLevel: 'very_high',
  },
  {
    anomalyId: 'anom-002',
    detectedDate: new Date(),
    category: 'attendance',
    severity: 'medium',
    status: 'investigating',
    anomalyType: 'Unusual absence pattern',
    description: 'Consistent Monday absences over 6 weeks',
    entityType: 'employee',
    entityId: 'emp-312',
    entityName: 'Lisa Wang',
    expectedValue: 5,
    actualValue: 0.8,
    deviation: 4.2,
    deviationPercentage: 84,
    anomalyScore: 78,
    pattern: 'Day-of-week pattern',
    frequency: 'recurring',
    relatedAnomalies: [],
    potentialImpact: 'Potential engagement issue or health concern',
    affectedProcesses: ['Attendance Management', 'Team Capacity Planning'],
    investigationNotes: 'Manager notified, investigating potential causes',
    assignedTo: 'HR Business Partner',
    modelVersion: 'v1.2.0',
    confidenceLevel: 'high',
  },
];

// ============================================================================
// INTERVIEW SCHEDULE SAMPLE DATA
// ============================================================================

export const sampleInterviewSchedules: InterviewSchedule[] = [
  {
    scheduleId: 'sched-001',
    candidateId: 'cand-001',
    candidateName: 'Alex Martinez',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    interviewType: 'technical',
    interviewRound: 1,
    proposedSlots: [
      {
        slotId: 'slot-001',
        startTime: new Date('2024-05-10T10:00:00'),
        endTime: new Date('2024-05-10T11:00:00'),
        availabilityScore: 100,
        preferenceScore: 90,
        conflictCount: 0,
        timezone: 'PST',
      },
      {
        slotId: 'slot-002',
        startTime: new Date('2024-05-10T14:00:00'),
        endTime: new Date('2024-05-10T15:00:00'),
        availabilityScore: 100,
        preferenceScore: 85,
        conflictCount: 0,
        timezone: 'PST',
      },
    ],
    interviewers: [
      {
        interviewerId: 'int-001',
        interviewerName: 'Sarah Kim',
        role: 'Senior Tech Lead',
        availability: [],
        preferences: {
          preferredDays: ['Tuesday', 'Wednesday', 'Thursday'],
          preferredTimes: ['10:00 AM', '2:00 PM'],
          blackoutDates: [],
        },
        isRequired: true,
      },
    ],
    meetingLink: 'https://zoom.us/j/12345',
    duration: 60,
    optimizationScore: 95,
    conflictsResolved: 2,
    preferenceScore: 92,
    status: 'proposing',
    confirmationSent: false,
    remindersSent: 0,
    scheduledDate: new Date(),
    createdDate: new Date(),
  },
];

// ============================================================================
// SETTINGS SAMPLE DATA
// ============================================================================

export const sampleAIAutomationSettings: AIAutomationSettings = {
  settingsId: 'settings-001',
  modelSettings: {
    enableAutoRetraining: true,
    retrainingFrequency: 'monthly',
    minimumConfidenceThreshold: 0.75,
    enableExplainability: true,
  },
  features: {
    orgHealthPredictor: true,
    aiCoachingBot: true,
    workflowGenerator: true,
    resumeScreening: true,
    attritionPrediction: true,
    leaveForecasting: true,
    anomalyDetection: true,
    chatbot: true,
    interviewScheduling: true,
    performanceAnalysis: true,
    ldRecommendation: true,
    jobMatching: true,
    emailParsing: true,
    autoAccruals: true,
    nlpInsights: true,
  },
  notifications: {
    enableAlerts: true,
    alertThresholds: {
      attritionRisk: 70,
      orgHealthScore: 75,
      anomalySeverity: 80,
    },
    notificationChannels: ['email', 'slack', 'teams'],
  },
  lastUpdatedDate: new Date(),
  lastUpdatedBy: 'admin',
  lastUpdatedByName: 'Admin User',
};
