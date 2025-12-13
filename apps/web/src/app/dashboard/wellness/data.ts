/**
 * Employee Wellness Module - Sample Data
 * Comprehensive sample data for immediate testing
 */

import {
  HealthProgram,
  MentalHealthService,
  HealthRiskAssessment,
  WellnessChallenge,
  RewardsCatalog,
  GymProvider,
} from './types';

// ============================================================================
// Health Programs
// ============================================================================

export const sampleHealthPrograms: HealthProgram[] = [
  {
    id: 'prog-001',
    programCode: 'WELLNESS-2024-001',
    programName: 'Diabetes Prevention Program',
    programType: 'chronic_disease',
    status: 'active',
    description: 'Evidence-based program to prevent or delay type 2 diabetes through lifestyle changes',
    objectives: [
      'Achieve 5-7% weight loss',
      'Complete 150 minutes of physical activity per week',
      'Learn healthy eating habits',
      'Develop sustainable lifestyle changes',
    ],
    targetAudience: {
      all: false,
      riskLevels: ['high'],
      customConditions: ['Pre-diabetic', 'BMI > 25'],
    },
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'yearly',
      interval: 1,
    },
    maxParticipants: 50,
    currentParticipants: 32,
    eligibilityCriteria: [
      {
        id: 'crit-001',
        criteriaType: 'health_metric',
        field: 'blood_sugar',
        operator: 'greater_than',
        value: 100,
        description: 'Fasting blood sugar above 100 mg/dL',
      },
    ],
    programModules: [
      {
        id: 'mod-001',
        moduleName: 'Nutrition Fundamentals',
        description: 'Learn the basics of healthy eating and portion control',
        sequence: 1,
        duration: 14,
        activities: [
          {
            id: 'act-001',
            activityName: 'Watch: Understanding Carbohydrates',
            activityType: 'video',
            description: 'Educational video about carbohydrates and blood sugar',
            estimatedTime: 20,
            required: true,
            pointsValue: 10,
            completionCriteria: 'Complete video viewing',
          },
          {
            id: 'act-002',
            activityName: 'Quiz: Nutrition Basics',
            activityType: 'quiz',
            description: 'Test your knowledge of nutrition fundamentals',
            estimatedTime: 10,
            required: true,
            pointsValue: 20,
            completionCriteria: 'Score 80% or higher',
          },
        ],
        required: true,
        pointsValue: 50,
      },
      {
        id: 'mod-002',
        moduleName: 'Physical Activity',
        description: 'Build an exercise routine that works for you',
        sequence: 2,
        duration: 14,
        activities: [],
        required: true,
        pointsValue: 50,
      },
    ],
    resources: [
      {
        id: 'res-001',
        resourceType: 'pdf',
        title: 'Healthy Eating Guide',
        description: 'Comprehensive guide to meal planning and nutrition',
        fileUrl: '/resources/healthy-eating-guide.pdf',
      },
      {
        id: 'res-002',
        resourceType: 'contact',
        title: 'Program Coach',
        description: 'Get support from our wellness coach',
        contactInfo: {
          name: 'Sarah Johnson',
          role: 'Certified Diabetes Educator',
          email: 'sarah.johnson@company.com',
          phone: '+1-555-0123',
          availability: 'Mon-Fri 9AM-5PM',
        },
      },
    ],
    participationRate: 64.0,
    completionRate: 78.5,
    satisfactionScore: 4.6,
    healthOutcomes: [
      {
        id: 'outcome-001',
        outcomeName: 'Average Weight Loss',
        metric: 'weight_kg',
        baselineValue: 85.2,
        targetValue: 79.8,
        currentValue: 81.5,
        improvementPercentage: 68.5,
        measurementDate: '2024-06-15T00:00:00Z',
      },
    ],
    pointsConfiguration: {
      enrollmentPoints: 25,
      completionPoints: 200,
      milestonePoints: {
        'week-4': 50,
        'week-8': 75,
        'week-12': 100,
      },
      activityPoints: {},
    },
    rewards: [
      {
        id: 'reward-001',
        rewardName: 'Completion Certificate',
        rewardType: 'certificate',
        criteria: 'Complete all modules',
        value: 'PDF Certificate',
        description: 'Official program completion certificate',
      },
    ],
    enrollments: [],
    milestones: [],
    createdBy: 'wellness-team',
    createdByName: 'Wellness Team',
    createdDate: '2023-12-01T00:00:00Z',
    lastModified: '2024-01-10T00:00:00Z',
    tags: ['diabetes', 'prevention', 'lifestyle', 'chronic-disease'],
    attachments: [],
  },
];

// ============================================================================
// Mental Health Services
// ============================================================================

export const sampleMentalHealthServices: MentalHealthService[] = [
  {
    id: 'mh-001',
    serviceCode: 'EAP-001',
    serviceName: 'Employee Assistance Program (EAP)',
    serviceType: 'eap',
    status: 'active',
    description: 'Confidential counseling and support services for employees and their families',
    provider: {
      id: 'prov-001',
      providerName: 'Wellness Corp EAP',
      providerType: 'organization',
      specializations: ['General counseling', 'Stress management', 'Work-life balance', 'Substance abuse'],
      languages: ['English', 'Spanish', 'Mandarin'],
      credentials: ['LCSW', 'LMFT', 'LPC'],
      contactInfo: {
        name: 'EAP Coordinator',
        role: 'Program Director',
        email: 'eap@wellnesscorp.com',
        phone: '1-800-XXX-XXXX',
        availability: '24/7',
      },
      availability: [],
      rating: 4.8,
      reviewCount: 245,
    },
    isConfidential: true,
    requiresApproval: false,
    maxSessionsPerYear: 8,
    sessionDuration: 50,
    availableModes: ['in_person', 'virtual', 'phone'],
    eligibleEmployees: {
      all: true,
    },
    dependentCoverage: true,
    allowSelfBooking: true,
    bookingAdvanceNotice: 24,
    cancellationNotice: 24,
    totalSessions: 1247,
    utilizationRate: 32.4,
    satisfactionScore: 4.7,
    resources: [
      {
        id: 'res-001',
        resourceType: 'link',
        title: 'EAP Portal',
        description: 'Access the EAP online portal to schedule sessions',
        url: 'https://eap.wellnesscorp.com',
      },
    ],
    createdDate: '2023-01-01T00:00:00Z',
    lastModified: '2024-01-05T00:00:00Z',
  },
];

// ============================================================================
// Health Risk Assessments
// ============================================================================

export const sampleHRAs: HealthRiskAssessment[] = [
  {
    id: 'hra-001',
    hraCode: 'HRA-2024',
    hraName: 'Annual Health Risk Assessment',
    version: '2024.1',
    status: 'active',
    description: 'Comprehensive health risk assessment to identify potential health risks and provide personalized recommendations',
    isAnonymous: true,
    isMandatory: false,
    validityPeriod: 365,
    sections: [
      {
        id: 'sec-001',
        sectionName: 'General Health',
        description: 'Basic health information and current conditions',
        sequence: 1,
        questions: [
          {
            id: 'q-001',
            question: 'How would you rate your overall health?',
            questionType: 'scale',
            options: [
              { id: 'opt-1', label: 'Excellent', value: 5, riskScore: 0 },
              { id: 'opt-2', label: 'Very Good', value: 4, riskScore: 5 },
              { id: 'opt-3', label: 'Good', value: 3, riskScore: 10 },
              { id: 'opt-4', label: 'Fair', value: 2, riskScore: 20 },
              { id: 'opt-5', label: 'Poor', value: 1, riskScore: 30 },
            ],
            required: true,
            riskWeight: 1.0,
            relatedConditions: [],
          },
        ],
        weight: 1.0,
      },
    ],
    riskCategories: [
      {
        id: 'cat-001',
        categoryName: 'Cardiovascular Risk',
        description: 'Risk factors related to heart and circulatory system health',
        metrics: [
          {
            metricName: 'Blood Pressure',
            measurementUnit: 'mmHg',
            normalRange: { min: 90, max: 120 },
            riskThresholds: [
              { level: 'low', min: 90, max: 120, description: 'Normal blood pressure' },
              { level: 'moderate', min: 121, max: 139, description: 'Prehypertension' },
              { level: 'high', min: 140, max: 159, description: 'Stage 1 Hypertension' },
              { level: 'critical', min: 160, description: 'Stage 2 Hypertension' },
            ],
          },
        ],
        interventions: [],
      },
    ],
    scoringAlgorithm: {
      type: 'weighted_sum',
      parameters: {},
      riskLevelMapping: [
        { minScore: 0, maxScore: 24, riskLevel: 'low', label: 'Low Risk', color: '#22c55e' },
        { minScore: 25, maxScore: 49, riskLevel: 'moderate', label: 'Moderate Risk', color: '#eab308' },
        { minScore: 50, maxScore: 74, riskLevel: 'high', label: 'High Risk', color: '#f97316' },
        { minScore: 75, maxScore: 100, riskLevel: 'critical', label: 'Critical Risk', color: '#ef4444' },
      ],
    },
    recommendationEngine: {
      rules: [],
      prioritizationLogic: 'severity',
    },
    completionIncentive: {
      pointsForCompletion: 100,
      additionalRewards: [],
      earlyCompletionBonus: 25,
      deadlineForBonus: '2024-03-31T23:59:59Z',
    },
    totalResponses: 342,
    completionRate: 68.4,
    averageRiskScore: 32.5,
    riskDistribution: {
      low: 142,
      moderate: 158,
      high: 35,
      critical: 7,
    },
    effectiveDate: '2024-01-01T00:00:00Z',
    expiryDate: '2024-12-31T23:59:59Z',
    createdBy: 'wellness-team',
    createdDate: '2023-11-15T00:00:00Z',
    lastModified: '2023-12-20T00:00:00Z',
  },
];

// ============================================================================
// Wellness Challenges
// ============================================================================

export const sampleChallenges: WellnessChallenge[] = [
  {
    id: 'chal-001',
    challengeCode: 'STEPS-2024-Q1',
    challengeName: '10,000 Steps Daily Challenge',
    challengeType: 'steps',
    format: 'individual',
    status: 'active',
    description: 'Walk 10,000 steps every day for 30 days and earn rewards!',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    registrationDeadline: '2024-01-03T23:59:59Z',
    goalMetric: 'daily_steps',
    goalValue: 10000,
    goalUnit: 'steps',
    allowLateRegistration: true,
    maxParticipants: 500,
    leaderboard: {
      enabled: true,
      updateFrequency: 'daily',
      showRankings: true,
      anonymousMode: false,
      topPerformers: [],
    },
    badges: [
      {
        id: 'badge-001',
        badgeName: 'Week 1 Warrior',
        description: 'Completed first week of the challenge',
        iconUrl: '/badges/week-1.png',
        criteria: '7 consecutive days of 10K steps',
        pointsValue: 50,
        earnedBy: [],
      },
      {
        id: 'badge-002',
        badgeName: 'Challenge Champion',
        description: 'Completed the entire 30-day challenge',
        iconUrl: '/badges/champion.png',
        criteria: 'Complete all 30 days',
        pointsValue: 200,
        earnedBy: [],
      },
    ],
    milestones: [
      {
        id: 'mile-001',
        milestoneName: '100,000 Steps',
        description: 'Walk your first 100K steps',
        targetValue: 100000,
        pointsReward: 25,
      },
      {
        id: 'mile-002',
        milestoneName: '200,000 Steps',
        description: 'Walk 200K total steps',
        targetValue: 200000,
        pointsReward: 50,
      },
    ],
    prizes: [
      {
        id: 'prize-001',
        prizeName: 'Fitness Tracker',
        description: 'Premium fitness tracker for top performer',
        prizeValue: 150,
        prizeType: 'gift',
        eligibility: 'top_1',
        winnersCount: 1,
        winners: [],
      },
      {
        id: 'prize-002',
        prizeName: 'Wellness Gift Card',
        description: '$50 gift card for sporting goods',
        prizeValue: 50,
        prizeType: 'voucher',
        eligibility: 'top_10',
        winnersCount: 10,
        winners: [],
      },
    ],
    pointsConfiguration: {
      dailyActivityPoints: 10,
      milestonePoints: 25,
      completionPoints: 200,
      leaderboardBonusPoints: 50,
    },
    participants: [],
    totalParticipants: 287,
    activeParticipants: 241,
    completionRate: 62.3,
    averageProgress: 78.5,
    updates: [],
    discussions: [],
    rules: 'Participants must log their steps daily. Steps can be tracked via fitness tracker, smartphone app, or manual entry. Late entries accepted within 24 hours.',
    faq: [
      {
        question: 'How do I track my steps?',
        answer: 'You can sync your fitness tracker, use a smartphone app, or manually enter your daily step count.',
      },
      {
        question: 'What if I miss a day?',
        answer: 'You can still participate! While consistent participation is encouraged, missing a day won\'t disqualify you from earning rewards.',
      },
    ],
    resources: [
      {
        id: 'res-001',
        resourceType: 'article',
        title: 'Walking for Health',
        description: 'Benefits of daily walking and tips to reach 10K steps',
        url: 'https://wellness.company.com/walking-guide',
      },
    ],
    createdBy: 'wellness-team',
    createdDate: '2023-12-01T00:00:00Z',
    lastModified: '2023-12-15T00:00:00Z',
  },
];

// ============================================================================
// Rewards Catalog
// ============================================================================

export const sampleRewards: RewardsCatalog[] = [
  {
    id: 'rew-001',
    rewardName: 'Amazon Gift Card - $25',
    description: 'Digital gift card delivered via email',
    category: 'gift_card',
    pointsCost: 2500,
    available: true,
    stockQuantity: 100,
    maxRedemptionsPerEmployee: 4,
    imageUrl: '/rewards/amazon-gc.png',
    termsAndConditions: 'Gift card code will be sent via email within 5 business days. Non-refundable.',
    validityPeriod: 365,
    totalRedemptions: 42,
    averageRating: 4.8,
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rew-002',
    rewardName: 'Extra Paid Day Off',
    description: 'One additional paid day off to use within the year',
    category: 'extra_leave',
    pointsCost: 5000,
    available: true,
    maxRedemptionsPerEmployee: 2,
    imageUrl: '/rewards/day-off.png',
    termsAndConditions: 'Subject to manager approval and blackout dates. Must be used within calendar year.',
    totalRedemptions: 18,
    averageRating: 5.0,
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rew-003',
    rewardName: 'Premium Parking Spot - 1 Month',
    description: 'Reserved parking spot near building entrance for one month',
    category: 'parking',
    pointsCost: 1500,
    available: true,
    stockQuantity: 5,
    maxRedemptionsPerEmployee: 12,
    imageUrl: '/rewards/parking.png',
    termsAndConditions: 'Parking spot assignment based on availability. Must be redeemed at least 1 week in advance.',
    totalRedemptions: 24,
    averageRating: 4.5,
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
  },
];

// ============================================================================
// Gym Providers
// ============================================================================

export const sampleGymProviders: GymProvider[] = [
  {
    id: 'gym-001',
    providerName: 'FitLife Fitness Centers',
    providerType: 'gym',
    description: 'Full-service fitness centers with state-of-the-art equipment and group classes',
    logo: '/providers/fitlife-logo.png',
    website: 'https://www.fitlife.com',
    locations: [
      {
        id: 'loc-001',
        locationName: 'FitLife Downtown',
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        phone: '+1-555-0100',
        facilities: ['Cardio equipment', 'Weight room', 'Group classes', 'Pool', 'Sauna'],
        operatingHours: [
          { dayOfWeek: 1, openTime: '05:00', closeTime: '22:00', is24Hours: false },
          { dayOfWeek: 2, openTime: '05:00', closeTime: '22:00', is24Hours: false },
          { dayOfWeek: 3, openTime: '05:00', closeTime: '22:00', is24Hours: false },
          { dayOfWeek: 4, openTime: '05:00', closeTime: '22:00', is24Hours: false },
          { dayOfWeek: 5, openTime: '05:00', closeTime: '22:00', is24Hours: false },
          { dayOfWeek: 6, openTime: '07:00', closeTime: '20:00', is24Hours: false },
          { dayOfWeek: 0, openTime: '07:00', closeTime: '20:00', is24Hours: false },
        ],
      },
    ],
    membershipPlans: [
      {
        id: 'plan-001',
        planName: 'Individual Membership',
        description: 'Full access to all facilities and group classes',
        type: 'individual',
        monthlyFee: 79.99,
        setupFee: 50.0,
        features: [
          'Unlimited facility access',
          'All group classes included',
          'Guest passes: 2 per month',
          'Personal training discount',
        ],
        available: true,
      },
      {
        id: 'plan-002',
        planName: 'Family Membership',
        description: 'Membership for employee and up to 4 family members',
        type: 'family',
        monthlyFee: 149.99,
        setupFee: 75.0,
        features: [
          'Unlimited facility access for all',
          'All group classes included',
          'Kids club access',
          'Family training sessions',
        ],
        available: true,
      },
    ],
    corporateRate: true,
    discountPercentage: 25,
    subsidyArrangement: 'Company pays 50% of monthly membership fee',
    totalEmployeeMembers: 142,
    averageUtilization: 78.5,
    contractStartDate: '2024-01-01T00:00:00Z',
    contractEndDate: '2026-12-31T23:59:59Z',
    contactPerson: {
      name: 'Michael Chen',
      role: 'Corporate Sales Manager',
      email: 'michael.chen@fitlife.com',
      phone: '+1-555-0101',
      availability: 'Mon-Fri 9AM-6PM',
    },
    status: 'active',
    createdDate: '2023-12-01T00:00:00Z',
    lastModified: '2024-01-05T00:00:00Z',
  },
];
