import {
  DiversityMetric, DiversityDashboard, InclusionSurvey, SurveyAnalytics, PayEquityAnalysis,
  BiasTraining, EmployeeResourceGroup, MentorshipProgram, MentorProfile, MenteeProfile,
  AccessibilityRequest, DEIGoal, DEISettings
} from './types';

// Sample Diversity Metrics
export const sampleDiversityMetrics: DiversityMetric[] = [
  {
    metricId: 'metric-1',
    metricType: 'representation',
    metricName: 'Gender Diversity - Overall Workforce',
    description: 'Percentage of women in the overall workforce',
    category: 'gender',
    dimensions: [
      {
        dimension: 'gender',
        breakdown: [
          { category: 'Women', count: 450, percentage: 45, target: 50, variance: -5 },
          { category: 'Men', count: 500, percentage: 50, target: 50, variance: 0 },
          { category: 'Non-binary', count: 50, percentage: 5, target: 0, variance: 5 }
        ],
        total: 1000
      }
    ],
    reportingPeriod: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      frequency: 'quarterly'
    },
    calculationMethod: 'percentage',
    targetValue: 50,
    currentValue: 45,
    previousValue: 42,
    trend: 'improving',
    lastCalculated: '2024-12-01T00:00:00Z',
    nextCalculation: '2025-03-01T00:00:00Z',
    status: 'active',
    visibility: 'public',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    metricId: 'metric-2',
    metricType: 'leadership_diversity',
    metricName: 'Women in Leadership',
    description: 'Percentage of women in executive and senior leadership roles',
    category: 'gender',
    dimensions: [
      {
        dimension: 'gender',
        breakdown: [
          { category: 'Women', count: 25, percentage: 35, target: 40, variance: -5 },
          { category: 'Men', count: 45, percentage: 64, target: 60, variance: 4 },
          { category: 'Non-binary', count: 1, percentage: 1, target: 0, variance: 1 }
        ],
        total: 71
      }
    ],
    reportingPeriod: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      frequency: 'quarterly'
    },
    calculationMethod: 'percentage',
    targetValue: 40,
    currentValue: 35,
    previousValue: 32,
    trend: 'improving',
    lastCalculated: '2024-12-01T00:00:00Z',
    nextCalculation: '2025-03-01T00:00:00Z',
    status: 'active',
    visibility: 'internal',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    metricId: 'metric-3',
    metricType: 'representation',
    metricName: 'Ethnic Diversity',
    description: 'Ethnic representation across workforce',
    category: 'ethnicity',
    dimensions: [
      {
        dimension: 'ethnicity',
        breakdown: [
          { category: 'White', count: 500, percentage: 50, target: 45, variance: 5 },
          { category: 'Asian', count: 250, percentage: 25, target: 25, variance: 0 },
          { category: 'Black/African American', count: 150, percentage: 15, target: 18, variance: -3 },
          { category: 'Hispanic/Latino', count: 80, percentage: 8, target: 10, variance: -2 },
          { category: 'Other', count: 20, percentage: 2, target: 2, variance: 0 }
        ],
        total: 1000
      }
    ],
    reportingPeriod: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      frequency: 'quarterly'
    },
    calculationMethod: 'percentage',
    targetValue: 100,
    currentValue: 100,
    trend: 'stable',
    lastCalculated: '2024-12-01T00:00:00Z',
    nextCalculation: '2025-03-01T00:00:00Z',
    status: 'active',
    visibility: 'public',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  }
];

// Sample Inclusion Surveys
export const sampleInclusionSurveys: InclusionSurvey[] = [
  {
    surveyId: 'survey-1',
    surveyName: '2024 Annual Inclusion Survey',
    description: 'Comprehensive assessment of employee sense of belonging and inclusion',
    surveyType: 'inclusion',
    questions: [
      {
        questionId: 'q1',
        questionText: 'I feel a sense of belonging at this company',
        questionType: 'rating_scale',
        category: 'belonging',
        isRequired: true,
        scale: { min: 1, max: 5, minLabel: 'Strongly Disagree', maxLabel: 'Strongly Agree', step: 1 },
        order: 1
      },
      {
        questionId: 'q2',
        questionText: 'My manager values diverse perspectives',
        questionType: 'rating_scale',
        category: 'leadership_commitment',
        isRequired: true,
        scale: { min: 1, max: 5, minLabel: 'Strongly Disagree', maxLabel: 'Strongly Agree', step: 1 },
        order: 2
      },
      {
        questionId: 'q3',
        questionText: 'I feel comfortable voicing my opinions in meetings',
        questionType: 'rating_scale',
        category: 'psychological_safety',
        isRequired: true,
        scale: { min: 1, max: 5, minLabel: 'Strongly Disagree', maxLabel: 'Strongly Agree', step: 1 },
        order: 3
      },
      {
        questionId: 'q4',
        questionText: 'Decisions are made fairly regardless of background',
        questionType: 'rating_scale',
        category: 'fairness',
        isRequired: true,
        scale: { min: 1, max: 5, minLabel: 'Strongly Disagree', maxLabel: 'Strongly Agree', step: 1 },
        order: 4
      },
      {
        questionId: 'q5',
        questionText: 'What could we do to improve inclusion? (Optional)',
        questionType: 'text',
        category: 'voice',
        isRequired: false,
        order: 5
      }
    ],
    targetAudience: {
      audienceType: 'all',
      estimatedSize: 1000
    },
    schedule: {
      launchDate: '2024-11-01',
      closeDate: '2024-11-30',
      reminders: [
        { reminderDate: '2024-11-15', reminderType: 'first_reminder', sent: true },
        { reminderDate: '2024-11-25', reminderType: 'final_reminder', sent: true }
      ]
    },
    anonymity: 'anonymous',
    status: 'completed',
    responseRate: 78,
    targetResponses: 1000,
    actualResponses: 780,
    launchedDate: '2024-11-01T00:00:00Z',
    closedDate: '2024-11-30T23:59:59Z',
    createdAt: '2024-10-15T00:00:00Z',
    createdBy: 'dei-team'
  }
];

// Sample Survey Analytics
export const sampleSurveyAnalytics: SurveyAnalytics[] = [
  {
    surveyId: 'survey-1',
    overallScore: 4.1,
    categoryScores: [
      { category: 'belonging', score: 4.2, responseCount: 780, trend: 'up', previousScore: 4.0 },
      { category: 'fairness', score: 4.0, responseCount: 780, trend: 'stable', previousScore: 4.0 },
      { category: 'psychological_safety', score: 4.3, responseCount: 780, trend: 'up', previousScore: 4.1 },
      { category: 'voice', score: 3.9, responseCount: 780, trend: 'down', previousScore: 4.1 },
      { category: 'leadership_commitment', score: 4.2, responseCount: 780, trend: 'up', previousScore: 4.0 }
    ],
    demographicBreakdown: [
      {
        dimension: 'gender',
        groups: [
          { group: 'Women', score: 4.0, responseCount: 350, variance: -0.1 },
          { group: 'Men', score: 4.2, responseCount: 400, variance: 0.1 },
          { group: 'Non-binary', score: 3.8, responseCount: 30, variance: -0.3 }
        ],
        significantDifferences: ['Non-binary employees report lower sense of belonging']
      }
    ],
    sentimentAnalysis: {
      positive: 65,
      neutral: 25,
      negative: 10,
      textResponses: 450,
      commonWords: [
        { word: 'inclusive', count: 120, sentiment: 'positive' },
        { word: 'respected', count: 95, sentiment: 'positive' },
        { word: 'isolated', count: 35, sentiment: 'negative' },
        { word: 'valued', count: 110, sentiment: 'positive' },
        { word: 'excluded', count: 28, sentiment: 'negative' }
      ]
    },
    keyThemes: [
      {
        themeId: 'theme-1',
        themeName: 'Strong team collaboration',
        frequency: 185,
        sentiment: 'positive',
        relatedQuestions: ['q1', 'q3'],
        examples: ['My team makes me feel welcome', 'Great collaboration across departments']
      },
      {
        themeId: 'theme-2',
        themeName: 'Need for more diverse leadership',
        frequency: 92,
        sentiment: 'negative',
        relatedQuestions: ['q2', 'q4'],
        examples: ['Leadership lacks diversity', 'Want to see more representation in senior roles']
      }
    ],
    actionableInsights: [
      'Focus on increasing leadership diversity',
      'Create more spaces for underrepresented voices',
      'Strengthen ERG programs',
      'Improve cross-functional collaboration opportunities'
    ],
    benchmarks: {
      industryAverage: 3.8,
      companySize: 3.9,
      topQuartile: 4.5,
      position: 'above'
    }
  }
];

// Sample Pay Equity Analysis
export const samplePayEquityAnalyses: PayEquityAnalysis[] = [
  {
    analysisId: 'analysis-1',
    analysisName: '2024 Gender Pay Equity Analysis',
    description: 'Comprehensive analysis of gender pay equity across all departments',
    analysisType: 'gender',
    scope: {
      scopeType: 'all_employees',
      employeeCount: 1000,
      excludeExecutives: true,
      excludeCommission: false
    },
    period: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      frequency: 'annual'
    },
    methodology: {
      method: 'regression',
      variables: [
        { variable: 'base_salary', weight: 1.0, included: true },
        { variable: 'bonus', weight: 0.5, included: true },
        { variable: 'equity', weight: 0.3, included: true }
      ],
      controlFactors: ['tenure', 'level', 'department', 'location', 'performance_rating'],
      statisticalThreshold: 0.05
    },
    results: {
      overallGap: 3.2,
      adjustedGap: 1.8,
      medianGap: 2.5,
      meanGap: 3.2,
      statisticalSignificance: 0.03,
      confidenceLevel: 95,
      affectedEmployees: 45,
      totalEmployees: 1000
    },
    gaps: [
      {
        gapId: 'gap-1',
        dimension: 'gender',
        comparisonGroup: 'Women',
        baselineGroup: 'Men',
        rawGap: 3.2,
        adjustedGap: 1.8,
        medianDifference: 4200,
        affectedCount: 45,
        severity: 'medium',
        jobLevel: 'Mid-level',
        department: 'Engineering'
      },
      {
        gapId: 'gap-2',
        dimension: 'gender',
        comparisonGroup: 'Women',
        baselineGroup: 'Men',
        rawGap: 5.1,
        adjustedGap: 2.3,
        medianDifference: 8500,
        affectedCount: 12,
        severity: 'high',
        jobLevel: 'Senior',
        department: 'Sales'
      }
    ],
    recommendations: [
      {
        recommendationId: 'rec-1',
        priority: 'high',
        category: 'immediate_adjustment',
        description: 'Adjust salaries for 45 employees to close identified gaps',
        affectedEmployees: ['emp-101', 'emp-102', 'emp-103'],
        estimatedCost: 189000,
        timeline: 'Q1 2025',
        status: 'approved'
      },
      {
        recommendationId: 'rec-2',
        priority: 'medium',
        category: 'process_improvement',
        description: 'Implement standardized salary bands for all levels',
        affectedEmployees: [],
        timeline: 'Q2 2025',
        status: 'proposed'
      }
    ],
    status: 'reviewed',
    confidentialityLevel: 'high',
    runDate: '2024-12-01T00:00:00Z',
    runBy: 'compensation-team',
    reviewedBy: 'dei-director',
    reviewDate: '2024-12-05T00:00:00Z',
    createdAt: '2024-11-15T00:00:00Z'
  }
];

// Sample Bias Training
export const sampleBiasTrainings: BiasTraining[] = [
  {
    trainingId: 'training-1',
    trainingName: 'Unconscious Bias Awareness',
    description: 'Learn to recognize and mitigate unconscious biases in the workplace',
    trainingType: 'unconscious_bias',
    format: 'online',
    duration: 90,
    modules: [
      {
        moduleId: 'mod-1',
        moduleName: 'Understanding Bias',
        description: 'Introduction to types of bias and their impact',
        content: [
          {
            contentId: 'content-1',
            contentType: 'video',
            title: 'What is Unconscious Bias?',
            description: 'Overview of unconscious bias',
            url: '/training/videos/unconscious-bias-intro.mp4',
            duration: 15,
            order: 1
          },
          {
            contentId: 'content-2',
            contentType: 'quiz',
            title: 'Bias Recognition Quiz',
            order: 2,
            questions: [
              {
                questionId: 'quiz-q1',
                question: 'Which of these is an example of affinity bias?',
                options: [
                  'Preferring candidates from your alma mater',
                  'Judging based on first impressions',
                  'Assuming competence based on appearance',
                  'All of the above'
                ],
                correctAnswer: 0,
                explanation: 'Affinity bias is the tendency to favor people similar to ourselves',
                points: 10
              }
            ]
          }
        ],
        duration: 30,
        order: 1,
        isRequired: true,
        passingScore: 80
      },
      {
        moduleId: 'mod-2',
        moduleName: 'Mitigating Bias in Hiring',
        description: 'Strategies for reducing bias in recruitment',
        content: [
          {
            contentId: 'content-3',
            contentType: 'scenario',
            title: 'Resume Review Exercise',
            description: 'Practice identifying bias in resume screening',
            order: 1
          }
        ],
        duration: 30,
        order: 2,
        isRequired: true
      },
      {
        moduleId: 'mod-3',
        moduleName: 'Inclusive Decision Making',
        description: 'Making equitable decisions in the workplace',
        content: [],
        duration: 30,
        order: 3,
        isRequired: true
      }
    ],
    targetAudience: {
      audienceType: 'managers',
      estimatedSize: 150
    },
    isRequired: true,
    completionCriteria: {
      requireAllModules: true,
      minimumScore: 80,
      timeRequirement: 90
    },
    certification: {
      certificateName: 'Unconscious Bias Awareness Certification',
      validityPeriod: 12,
      renewalRequired: true,
      badgeEnabled: true
    },
    status: 'active',
    enrollmentCount: 145,
    completionRate: 87,
    averageScore: 88,
    createdAt: '2024-01-15T00:00:00Z',
    createdBy: 'learning-team'
  }
];

// Sample Employee Resource Groups
export const sampleERGs: EmployeeResourceGroup[] = [
  {
    ergId: 'erg-1',
    ergName: 'Women in Technology',
    acronym: 'WIT',
    description: 'Supporting and advancing women in technology roles',
    mission: 'To create an inclusive environment where women in tech can thrive, grow, and lead',
    focusArea: 'gender',
    status: 'active',
    founded: '2019-03-08',
    leadership: {
      chair: {
        employeeId: 'emp-201',
        employeeName: 'Sarah Martinez',
        role: 'chair',
        joinedDate: '2023-01-01',
        isActive: true
      },
      viceChair: {
        employeeId: 'emp-202',
        employeeName: 'Jennifer Wong',
        role: 'vice_chair',
        joinedDate: '2023-01-01',
        isActive: true
      },
      advisors: [
        {
          employeeId: 'emp-203',
          employeeName: 'Michael Chen',
          role: 'advisor',
          joinedDate: '2023-01-01',
          isActive: true
        }
      ],
      termStart: '2023-01-01',
      termEnd: '2024-12-31'
    },
    membership: {
      totalMembers: 245,
      activeMembers: 230,
      allies: 85,
      pendingRequests: 5,
      membershipType: 'open'
    },
    budget: {
      fiscalYear: 2024,
      allocatedAmount: 10000,
      spentAmount: 6500,
      availableAmount: 3500,
      expenses: [
        {
          expenseId: 'exp-1',
          category: 'Speaker Series',
          description: 'Guest speaker - Tech leadership',
          amount: 2000,
          date: '2024-03-15',
          approvedBy: 'budget-committee',
          status: 'paid'
        },
        {
          expenseId: 'exp-2',
          category: 'Networking Event',
          description: 'Annual WIT conference',
          amount: 4500,
          date: '2024-09-20',
          approvedBy: 'budget-committee',
          status: 'paid'
        }
      ],
      fundingSource: 'company'
    },
    meetings: [
      {
        meetingId: 'meeting-1',
        meetingType: 'general',
        title: 'Monthly All-Hands',
        description: 'Monthly meeting for all WIT members',
        date: '2024-12-15T18:00:00Z',
        duration: 60,
        location: 'Conference Room A / Zoom',
        format: 'hybrid',
        attendees: ['emp-201', 'emp-202'],
        agenda: ['Welcome new members', 'Q1 2025 planning', 'Upcoming events']
      }
    ],
    initiatives: [
      {
        initiativeId: 'init-1',
        initiativeName: 'Mentorship Circles',
        description: 'Peer mentorship program for women in tech',
        type: 'program',
        startDate: '2024-01-15',
        status: 'active',
        goals: ['Connect 50 mentor-mentee pairs', 'Host quarterly workshops'],
        metrics: [
          { metric: 'Pairs formed', target: 50, actual: 48, unit: 'pairs' },
          { metric: 'Workshops held', target: 4, actual: 4, unit: 'events' }
        ]
      }
    ],
    achievements: [
      {
        achievementId: 'ach-1',
        title: 'Best ERG Award 2023',
        description: 'Recognized as most impactful ERG company-wide',
        date: '2023-12-01',
        category: 'award',
        visibility: 'internal'
      }
    ],
    sponsorship: {
      executiveSponsor: {
        employeeId: 'emp-300',
        name: 'Lisa Johnson',
        title: 'VP Engineering',
        since: '2019-03-08'
      },
      supportLevel: 'high',
      meetingFrequency: 'monthly',
      lastMeeting: '2024-11-15'
    },
    visibility: 'open',
    tags: ['technology', 'women', 'mentorship', 'leadership'],
    createdAt: '2019-03-08T00:00:00Z',
    createdBy: 'hr-team'
  }
];

// Sample Mentorship Programs
export const sampleMentorshipPrograms: MentorshipProgram[] = [
  {
    programId: 'program-1',
    programName: 'Leadership Development Mentorship',
    description: 'Connecting emerging leaders with senior executives',
    programType: 'leadership',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    duration: 6,
    matchingCriteria: {
      method: 'automatic',
      factors: [
        { factor: 'career_goals', weight: 0.4, required: true },
        { factor: 'expertise', weight: 0.3, required: true },
        { factor: 'department', weight: 0.2, required: false },
        { factor: 'location', weight: 0.1, required: false }
      ],
      maxMatches: 2,
      allowCrossDepartment: true,
      allowCrossLocation: true
    },
    requirements: {
      mentorCriteria: {
        minTenure: 5,
        minLevel: 'Senior',
        availability: 'Minimum 2 hours per month'
      },
      menteeCriteria: {
        maxTenure: 7,
        careerStage: ['mid', 'senior'],
        goals: ['Leadership development', 'Executive presence']
      },
      commitmentLevel: '2 hours per month for 6 months',
      meetingFrequency: 'Bi-weekly minimum'
    },
    structure: {
      phases: [
        {
          phaseId: 'phase-1',
          phaseName: 'Getting Started',
          description: 'Initial connection and goal setting',
          duration: 2,
          activities: ['Kickoff meeting', 'Goal alignment', 'Expectation setting'],
          deliverables: ['Development plan', 'Meeting schedule'],
          order: 1
        },
        {
          phaseId: 'phase-2',
          phaseName: 'Active Development',
          description: 'Regular meetings and skill building',
          duration: 16,
          activities: ['Regular 1:1s', 'Skill workshops', 'Project shadowing'],
          deliverables: ['Progress reviews', 'Skill assessments'],
          order: 2
        },
        {
          phaseId: 'phase-3',
          phaseName: 'Wrap-up & Evaluation',
          description: 'Final review and next steps',
          duration: 4,
          activities: ['Final review', 'Goal achievement assessment', 'Next steps planning'],
          deliverables: ['Final evaluation', 'Recommendations'],
          order: 3
        }
      ],
      checkpoints: [
        {
          checkpointId: 'cp-1',
          name: 'Month 2 Check-in',
          date: '2024-03-15',
          type: 'survey',
          required: true
        },
        {
          checkpointId: 'cp-2',
          name: 'Mid-point Review',
          date: '2024-04-15',
          type: 'review',
          required: true
        }
      ],
      supportProvided: ['Monthly group sessions', 'Resource library', 'Program coordinator support']
    },
    resources: [
      {
        resourceId: 'res-1',
        resourceType: 'guide',
        title: 'Mentorship Best Practices Guide',
        description: 'Comprehensive guide for effective mentorship',
        url: '/resources/mentorship-guide.pdf',
        category: 'Getting Started'
      }
    ],
    metrics: {
      completionRate: 85,
      satisfactionScore: 4.6,
      goalAchievementRate: 78,
      retentionImprovement: 15,
      promotionRate: 22
    },
    enrollment: {
      mentors: 45,
      mentees: 82,
      activePairs: 75,
      completions: 10
    },
    createdAt: '2023-12-01T00:00:00Z',
    createdBy: 'learning-team'
  }
];

// Sample Mentor Profiles
export const sampleMentorProfiles: MentorProfile[] = [
  {
    profileId: 'mentor-1',
    employeeId: 'emp-501',
    employeeName: 'David Thompson',
    department: 'Engineering',
    jobTitle: 'Senior Engineering Manager',
    location: 'San Francisco',
    tenure: 8,
    expertise: ['Technical Leadership', 'Team Building', 'System Architecture', 'Career Development'],
    interests: ['AI/ML', 'Cloud Infrastructure', 'Open Source'],
    languages: ['English', 'Spanish'],
    mentoringAreas: ['Technical leadership', 'Career progression', 'Work-life balance'],
    availability: 'high',
    maxMentees: 3,
    currentMentees: 2,
    pastMentees: 5,
    rating: 4.8,
    bio: 'Passionate about developing the next generation of tech leaders. 8 years at the company, mentored 5 engineers to senior positions.',
    status: 'available',
    joinedDate: '2023-01-15T00:00:00Z'
  }
];

// Sample Mentee Profiles
export const sampleMenteeProfiles: MenteeProfile[] = [
  {
    profileId: 'mentee-1',
    employeeId: 'emp-601',
    employeeName: 'Alex Rivera',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    location: 'New York',
    careerStage: 'mid',
    goals: [
      {
        goalId: 'goal-1',
        goal: 'Develop technical leadership skills',
        category: 'leadership',
        priority: 'high',
        targetDate: '2024-12-31'
      },
      {
        goalId: 'goal-2',
        goal: 'Build public speaking confidence',
        category: 'skill_development',
        priority: 'medium',
        targetDate: '2024-06-30'
      }
    ],
    interests: ['System design', 'Mentoring others', 'Conference speaking'],
    preferredMentorTraits: ['Technical depth', 'Strong communicator', 'Empathetic'],
    availability: 'Flexible, prefer evenings',
    status: 'matched',
    joinedDate: '2024-01-20T00:00:00Z'
  }
];

// Sample Accessibility Requests
export const sampleAccessibilityRequests: AccessibilityRequest[] = [
  {
    requestId: 'req-1',
    requestNumber: 'ACC-2024-001',
    employeeId: 'emp-701',
    employeeName: 'Maria Santos',
    requestType: 'workplace_modification',
    category: 'mobility',
    description: 'Need height-adjustable desk and ergonomic chair due to back condition',
    accommodation: {
      specificNeeds: ['Height-adjustable standing desk', 'Ergonomic chair with lumbar support', 'Footrest'],
      currentBarriers: ['Standard desk causes back strain', 'Current chair lacks proper support'],
      proposedSolutions: ['Electric standing desk', 'Herman Miller Aeron chair', 'Adjustable footrest'],
      medicalDocumentation: true
    },
    status: 'approved',
    priority: 'high',
    confidential: true,
    requestDate: '2024-11-01T00:00:00Z',
    requiredBy: '2024-11-15',
    reviewedBy: 'hr-accessibility',
    reviewDate: '2024-11-02T00:00:00Z',
    approvedBy: 'facilities-director',
    approvalDate: '2024-11-03T00:00:00Z',
    implementedDate: '2024-11-10T00:00:00Z',
    cost: 2500,
    fundingSource: 'Accessibility budget',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-10T00:00:00Z'
  },
  {
    requestId: 'req-2',
    requestNumber: 'ACC-2024-002',
    employeeId: 'emp-702',
    employeeName: 'James Wilson',
    requestType: 'assistive_technology',
    category: 'vision',
    description: 'Screen reader software and large monitors for low vision',
    accommodation: {
      specificNeeds: ['JAWS screen reader', '27-inch monitors (2)', 'High contrast keyboard'],
      currentBarriers: ['Difficulty reading standard monitor', 'Standard keyboard hard to see'],
      proposedSolutions: ['JAWS Professional license', 'Dell UltraSharp 27" monitors', 'Large print keyboard'],
      medicalDocumentation: true,
      renewalRequired: false
    },
    status: 'implemented',
    priority: 'urgent',
    confidential: true,
    requestDate: '2024-10-15T00:00:00Z',
    requiredBy: '2024-10-22',
    reviewedBy: 'hr-accessibility',
    reviewDate: '2024-10-16T00:00:00Z',
    approvedBy: 'it-director',
    approvalDate: '2024-10-16T00:00:00Z',
    implementedDate: '2024-10-20T00:00:00Z',
    cost: 1800,
    fundingSource: 'IT budget',
    createdAt: '2024-10-15T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z'
  }
];

// Sample DEI Goals
export const sampleDEIGoals: DEIGoal[] = [
  {
    goalId: 'goal-1',
    goalName: 'Achieve 50% Women in Leadership by 2026',
    description: 'Increase representation of women in director-level and above positions',
    category: 'leadership_diversity',
    goalType: 'representation',
    level: 'company',
    owner: 'Jennifer Adams',
    ownerEmployeeId: 'emp-800',
    targetMetric: {
      metric: 'Women in Leadership',
      baseline: 35,
      target: 50,
      current: 38,
      unit: 'percentage',
      measurementMethod: 'Quarterly headcount analysis',
      dataSource: 'HRIS'
    },
    timeline: {
      startDate: '2024-01-01',
      targetDate: '2026-12-31',
      reviewFrequency: 'quarterly',
      lastReviewed: '2024-12-01',
      nextReview: '2025-03-01'
    },
    status: 'active',
    progress: 25,
    milestones: [
      {
        milestoneId: 'milestone-1',
        milestoneName: 'Reach 40% by end of 2024',
        description: 'First milestone toward 50% goal',
        targetDate: '2024-12-31',
        targetValue: 40,
        actualValue: 38,
        status: 'missed',
        dependencies: []
      },
      {
        milestoneId: 'milestone-2',
        milestoneName: 'Reach 45% by end of 2025',
        description: 'Second milestone',
        targetDate: '2025-12-31',
        targetValue: 45,
        status: 'in_progress',
        dependencies: []
      },
      {
        milestoneId: 'milestone-3',
        milestoneName: 'Reach 50% by end of 2026',
        description: 'Final goal achievement',
        targetDate: '2026-12-31',
        targetValue: 50,
        status: 'not_started',
        dependencies: []
      }
    ],
    initiatives: ['leadership-pipeline', 'inclusive-hiring'],
    budget: 500000,
    stakeholders: [
      { employeeId: 'emp-800', name: 'Jennifer Adams', role: 'owner', responsibility: 'Overall goal ownership and execution' },
      { employeeId: 'emp-801', name: 'Michael Lee', role: 'sponsor', responsibility: 'Executive sponsorship' },
      { employeeId: 'emp-802', name: 'Sarah Kim', role: 'contributor', responsibility: 'Talent acquisition support' }
    ],
    updates: [
      {
        updateId: 'update-1',
        updateDate: '2024-12-01',
        updatedBy: 'Jennifer Adams',
        progressChange: 3,
        achievements: [
          'Promoted 3 women to director level',
          'Hired 2 women VPs'
        ],
        challenges: [
          'Slower progress than anticipated',
          'Pipeline development takes time'
        ],
        nextSteps: [
          'Accelerate leadership development program',
          'Increase external recruiting efforts',
          'Launch sponsorship program'
        ],
        risksIdentified: ['Economic slowdown may reduce promotion opportunities'],
        supportNeeded: ['Additional recruiting budget', 'Executive buy-in for accelerated promotions']
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'dei-team',
    updatedAt: '2024-12-01T00:00:00Z'
  }
];

// Sample DEI Settings
export const sampleDEISettings: DEISettings = {
  metricsSettings: {
    trackingEnabled: true,
    reportingFrequency: 'quarterly',
    publicDashboard: true,
    benchmarkingEnabled: true
  },
  surveySettings: {
    defaultAnonymity: 'anonymous',
    minimumResponses: 30,
    autoReminders: true,
    reminderFrequency: 7
  },
  payEquitySettings: {
    analysisFrequency: 'annual',
    requireApproval: true,
    confidentialityLevel: 'high'
  },
  trainingSettings: {
    requiredForAll: false,
    requiredForManagers: true,
    recertificationPeriod: 12,
    trackingEnabled: true
  },
  ergSettings: {
    allowNewERGs: true,
    minimumMembers: 10,
    budgetPerERG: 10000,
    executiveSponsorRequired: true
  },
  mentorshipSettings: {
    matchingMethod: 'automatic',
    maxMenteesPerMentor: 3,
    programDuration: 6,
    checkpointFrequency: 'monthly'
  },
  accessibilitySettings: {
    requestApprovalRequired: true,
    defaultPriority: 'high',
    budgetAllocated: 100000,
    assessmentFrequency: 'annual'
  },
  goalSettings: {
    publicGoals: true,
    progressReporting: 'quarterly',
    stakeholderUpdates: true
  }
};
