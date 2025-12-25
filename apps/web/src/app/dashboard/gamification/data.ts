/**
 * Gamification Module - Sample Data
 * Comprehensive sample data for immediate testing and development
 */

import type {
  PointsAccount,
  PointsTransaction,
  PointsRule,
  Badge,
  UserBadge,
  Challenge,
  ChallengeParticipation,
  Leaderboard,
  LevelDefinition,
  Mission,
  VirtualCurrency,
  Achievement,
  GamificationSettings,
} from './types';

// ============================================================================
// Sample Points Accounts
// ============================================================================

export const samplePointsAccounts: PointsAccount[] = [
  {
    accountId: 'acc-001',
    userId: 'user-001',
    userName: 'Sarah Mitchell',
    userEmail: 'sarah.mitchell@company.com',
    department: 'Engineering',

    totalPoints: 8750,
    lifetimePoints: 12500,
    currentBalance: 8750,
    pendingPoints: 250,
    expiredPoints: 500,

    pointsByCategory: [
      { category: 'performance', points: 3200, percentage: 36.6 },
      { category: 'learning', points: 2100, percentage: 24.0 },
      { category: 'collaboration', points: 1800, percentage: 20.6 },
      { category: 'innovation', points: 950, percentage: 10.9 },
      { category: 'recognition', points: 700, percentage: 8.0 },
    ],

    currentLevel: 7,
    currentTier: 'gold',
    pointsToNextLevel: 1250,

    lastEarnedDate: new Date('2024-12-12'),
    lastRedeemedDate: new Date('2024-12-05'),
    totalTransactions: 87,

    currentStreak: 12,
    longestStreak: 18,

    audit: {
      createdAt: new Date('2024-01-15'),
      createdBy: 'system',
      updatedAt: new Date('2024-12-12'),
      updatedBy: 'system',
    },
  },
  {
    accountId: 'acc-002',
    userId: 'user-002',
    userName: 'James Rodriguez',
    userEmail: 'james.rodriguez@company.com',
    department: 'Marketing',

    totalPoints: 6540,
    lifetimePoints: 9200,
    currentBalance: 6540,
    pendingPoints: 0,
    expiredPoints: 100,

    pointsByCategory: [
      { category: 'collaboration', points: 2400, percentage: 36.7 },
      { category: 'performance', points: 2100, percentage: 32.1 },
      { category: 'engagement', points: 1200, percentage: 18.3 },
      { category: 'learning', points: 840, percentage: 12.8 },
    ],

    currentLevel: 6,
    currentTier: 'silver',
    pointsToNextLevel: 460,

    lastEarnedDate: new Date('2024-12-13'),
    lastRedeemedDate: new Date('2024-11-28'),
    totalTransactions: 64,

    currentStreak: 8,
    longestStreak: 15,

    audit: {
      createdAt: new Date('2024-02-01'),
      createdBy: 'system',
      updatedAt: new Date('2024-12-13'),
      updatedBy: 'system',
    },
  },
  {
    accountId: 'acc-003',
    userId: 'user-003',
    userName: 'Emily Chen',
    userEmail: 'emily.chen@company.com',
    department: 'Product',

    totalPoints: 11250,
    lifetimePoints: 15800,
    currentBalance: 11250,
    pendingPoints: 500,
    expiredPoints: 300,

    pointsByCategory: [
      { category: 'innovation', points: 4200, percentage: 37.3 },
      { category: 'performance', points: 3500, percentage: 31.1 },
      { category: 'learning', points: 2100, percentage: 18.7 },
      { category: 'collaboration', points: 1450, percentage: 12.9 },
    ],

    currentLevel: 9,
    currentTier: 'platinum',
    pointsToNextLevel: 750,

    lastEarnedDate: new Date('2024-12-13'),
    lastRedeemedDate: new Date('2024-12-08'),
    totalTransactions: 112,

    currentStreak: 21,
    longestStreak: 25,

    audit: {
      createdAt: new Date('2023-11-10'),
      createdBy: 'system',
      updatedAt: new Date('2024-12-13'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Points Transactions
// ============================================================================

export const samplePointsTransactions: PointsTransaction[] = [
  {
    transactionId: 'trans-001',
    userId: 'user-001',
    userName: 'Sarah Mitchell',
    transactionType: 'earn',
    transactionDate: new Date('2024-12-12'),

    pointsAmount: 250,
    pointsBalance: 8750,
    category: 'learning',

    source: 'training_completed',
    sourceId: 'training-123',
    reason: 'Completed AWS Certification Training',
    description: 'Successfully completed AWS Solutions Architect certification training',

    isExpired: false,
    requiresApproval: false,

    audit: {
      createdAt: new Date('2024-12-12'),
      createdBy: 'system',
      updatedAt: new Date('2024-12-12'),
      updatedBy: 'system',
    },
  },
  {
    transactionId: 'trans-002',
    userId: 'user-001',
    userName: 'Sarah Mitchell',
    transactionType: 'earn',
    transactionDate: new Date('2024-12-10'),

    pointsAmount: 500,
    pointsBalance: 8500,
    category: 'performance',

    source: 'goal_achieved',
    sourceId: 'goal-456',
    reason: 'Achieved Q4 Performance Goal',
    description: 'Exceeded quarterly performance target by 20%',

    isExpired: false,
    requiresApproval: false,

    audit: {
      createdAt: new Date('2024-12-10'),
      createdBy: 'system',
      updatedAt: new Date('2024-12-10'),
      updatedBy: 'system',
    },
  },
  {
    transactionId: 'trans-003',
    userId: 'user-003',
    userName: 'Emily Chen',
    transactionType: 'redeem',
    transactionDate: new Date('2024-12-08'),

    pointsAmount: -2000,
    pointsBalance: 11250,
    category: 'other',

    source: 'redemption',
    sourceId: 'reward-789',
    reason: 'Redeemed for $50 Amazon Gift Card',
    description: 'Points redeemed for reward',

    isExpired: false,
    requiresApproval: false,

    audit: {
      createdAt: new Date('2024-12-08'),
      createdBy: 'user-003',
      updatedAt: new Date('2024-12-08'),
      updatedBy: 'user-003',
    },
  },
];

// ============================================================================
// Sample Points Rules
// ============================================================================

export const samplePointsRules: PointsRule[] = [
  {
    ruleId: 'rule-001',
    ruleName: 'Training Completion Reward',
    ruleCode: 'TRAIN-COMPLETE',
    description: 'Award points when an employee completes a training course',
    status: 'active',

    triggerEvent: 'training_completed',
    triggerConditions: [
      {
        conditionId: 'cond-001',
        field: 'completion_status',
        operator: 'equals',
        value: 'passed',
        description: 'Training must be passed',
      },
    ],

    pointsAwarded: 250,
    category: 'learning',
    isRecurring: true,

    validFrom: new Date('2024-01-01'),

    multiplier: 1.0,

    totalAwarded: 18750,
    totalRecipients: 75,
    lastTriggered: new Date('2024-12-12'),

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin-001',
      updatedAt: new Date('2024-12-12'),
      updatedBy: 'system',
    },
  },
  {
    ruleId: 'rule-002',
    ruleName: 'Perfect Attendance Monthly',
    ruleCode: 'ATTEND-PERFECT',
    description: 'Reward for perfect attendance in a month',
    status: 'active',

    triggerEvent: 'month_end',
    triggerConditions: [
      {
        conditionId: 'cond-002',
        field: 'attendance_percentage',
        operator: 'equals',
        value: 100,
        description: '100% attendance required',
      },
    ],

    pointsAwarded: 500,
    category: 'attendance',
    isRecurring: true,
    recurrenceLimit: 12, // Once per month max

    validFrom: new Date('2024-01-01'),

    multiplier: 1.0,

    totalAwarded: 42500,
    totalRecipients: 85,

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin-001',
      updatedAt: new Date('2024-12-01'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Badges
// ============================================================================

export const sampleBadges: Badge[] = [
  {
    badgeId: 'badge-001',
    badgeCode: 'INNOVATION-CHAMPION',
    badgeName: 'Innovation Champion',
    description: 'Awarded for submitting 5 approved innovative ideas',
    status: 'active',

    iconUrl: '/badges/innovation-champion.svg',
    color: '#FFD700',
    tier: 'gold',

    category: 'achievement',
    tags: ['innovation', 'ideas', 'creativity'],

    criteria: [
      {
        criteriaId: 'crit-001',
        criteriaType: 'count',
        description: 'Submit 5 approved ideas',
        requirement: 5,
        operator: 'greater_than_or_equal',
      },
    ],
    isAutoAwarded: true,
    requiresNomination: false,
    requiresApproval: false,

    pointsAwarded: 1000,
    isRecurring: false,

    rarity: 'rare',
    totalAwarded: 23,

    displayOrder: 1,
    isVisible: true,
    isSecret: false,

    validFrom: new Date('2024-01-01'),

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin-001',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'admin-001',
    },
  },
  {
    badgeId: 'badge-002',
    badgeCode: 'LEARNING-PRO',
    badgeName: 'Learning Pro',
    description: 'Complete 10 training courses in a year',
    status: 'active',

    iconUrl: '/badges/learning-pro.svg',
    color: '#4169E1',
    tier: 'silver',

    category: 'milestone',
    tags: ['learning', 'training', 'development'],

    criteria: [
      {
        criteriaId: 'crit-002',
        criteriaType: 'count',
        description: 'Complete 10 training courses',
        requirement: 10,
        operator: 'greater_than_or_equal',
      },
    ],
    isAutoAwarded: true,
    requiresNomination: false,
    requiresApproval: false,

    pointsAwarded: 750,
    isRecurring: true,

    rarity: 'uncommon',
    totalAwarded: 67,

    displayOrder: 2,
    isVisible: true,
    isSecret: false,

    validFrom: new Date('2024-01-01'),

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin-001',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'admin-001',
    },
  },
  {
    badgeId: 'badge-003',
    badgeCode: 'TEAM-PLAYER',
    badgeName: 'Team Player',
    description: 'Collaborate on 20 cross-functional projects',
    status: 'active',

    iconUrl: '/badges/team-player.svg',
    color: '#32CD32',
    tier: 'bronze',

    category: 'behavior',
    tags: ['collaboration', 'teamwork', 'cross-functional'],

    criteria: [
      {
        criteriaId: 'crit-003',
        criteriaType: 'count',
        description: 'Participate in 20 cross-functional projects',
        requirement: 20,
        operator: 'greater_than_or_equal',
      },
    ],
    isAutoAwarded: true,
    requiresNomination: false,
    requiresApproval: false,

    pointsAwarded: 500,
    isRecurring: false,

    rarity: 'common',
    totalAwarded: 145,

    displayOrder: 3,
    isVisible: true,
    isSecret: false,

    validFrom: new Date('2024-01-01'),

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin-001',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'admin-001',
    },
  },
];

// ============================================================================
// Sample User Badges
// ============================================================================

export const sampleUserBadges: UserBadge[] = [
  {
    userBadgeId: 'ub-001',
    userId: 'user-001',
    userName: 'Sarah Mitchell',
    badgeId: 'badge-002',
    badge: sampleBadges[1],

    awardedDate: new Date('2024-11-15'),
    reason: 'Completed 10th training course of the year',

    status: 'active',

    isPinned: true,
    displayOnProfile: true,
    shareOnFeed: true,

    earnCount: 1,
    firstEarned: new Date('2024-11-15'),

    audit: {
      createdAt: new Date('2024-11-15'),
      createdBy: 'system',
      updatedAt: new Date('2024-11-15'),
      updatedBy: 'system',
    },
  },
  {
    userBadgeId: 'ub-002',
    userId: 'user-003',
    userName: 'Emily Chen',
    badgeId: 'badge-001',
    badge: sampleBadges[0],

    awardedDate: new Date('2024-10-20'),
    reason: 'Submitted 5th approved innovative idea',

    status: 'active',

    isPinned: true,
    displayOnProfile: true,
    shareOnFeed: true,

    earnCount: 1,
    firstEarned: new Date('2024-10-20'),

    audit: {
      createdAt: new Date('2024-10-20'),
      createdBy: 'system',
      updatedAt: new Date('2024-10-20'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Challenges
// ============================================================================

export const sampleChallenges: Challenge[] = [
  {
    challengeId: 'challenge-001',
    challengeCode: 'WELLNESS-DEC-2024',
    challengeName: 'December Wellness Challenge',
    description: 'Walk 10,000 steps every day for the entire month of December',
    status: 'active',

    challengeType: 'wellness',
    category: 'wellness',
    difficulty: 'medium',

    participationType: 'individual',
    isTeamBased: false,

    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    duration: 31,

    goalType: 'target',
    targetMetric: 'daily_steps',
    targetValue: 10000,
    targetUnit: 'steps',

    trackingFrequency: 'daily',
    autoTracking: false,
    manualEntry: true,

    pointsReward: 1500,
    badgeRewards: [],
    additionalRewards: ['$25 fitness store gift card', 'Wellness kit'],

    winnerDetermination: 'all_qualified',

    totalParticipants: 127,
    activeParticipants: 98,
    completedParticipants: 12,

    milestones: [
      {
        milestoneId: 'ms-001',
        milestoneName: 'Week 1 Completed',
        targetValue: 70000,
        pointsReward: 200,
        order: 1,
      },
      {
        milestoneId: 'ms-002',
        milestoneName: 'Week 2 Completed',
        targetValue: 140000,
        pointsReward: 200,
        order: 2,
      },
      {
        milestoneId: 'ms-003',
        milestoneName: 'Halfway There',
        targetValue: 155000,
        pointsReward: 300,
        order: 3,
      },
    ],

    isPublic: true,
    isFeatured: true,
    bannerImageUrl: '/challenges/wellness-december.jpg',

    audit: {
      createdAt: new Date('2024-11-15'),
      createdBy: 'hr-admin-001',
      updatedAt: new Date('2024-12-01'),
      updatedBy: 'system',
    },
  },
  {
    challengeId: 'challenge-002',
    challengeCode: 'LEARN-SPRINT-Q4',
    challengeName: 'Q4 Learning Sprint',
    description: 'Complete 5 courses before year-end',
    status: 'active',

    challengeType: 'learning',
    category: 'learning',
    difficulty: 'easy',

    participationType: 'individual',
    isTeamBased: false,

    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    duration: 92,

    goalType: 'target',
    targetMetric: 'courses_completed',
    targetValue: 5,
    targetUnit: 'courses',

    trackingFrequency: 'continuous',
    autoTracking: true,
    manualEntry: false,

    pointsReward: 2000,
    badgeRewards: ['badge-002'],
    additionalRewards: ['Professional development budget bonus'],

    winnerDetermination: 'all_qualified',

    totalParticipants: 245,
    activeParticipants: 198,
    completedParticipants: 87,

    milestones: [
      {
        milestoneId: 'ms-004',
        milestoneName: 'First Course',
        targetValue: 1,
        pointsReward: 100,
        order: 1,
      },
      {
        milestoneId: 'ms-005',
        milestoneName: 'Third Course',
        targetValue: 3,
        pointsReward: 300,
        order: 2,
      },
    ],

    isPublic: true,
    isFeatured: true,

    audit: {
      createdAt: new Date('2024-09-15'),
      createdBy: 'learning-admin-001',
      updatedAt: new Date('2024-10-01'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Challenge Participation
// ============================================================================

export const sampleChallengeParticipation: ChallengeParticipation[] = [
  {
    participationId: 'part-001',
    challengeId: 'challenge-001',
    challenge: sampleChallenges[0],

    userId: 'user-001',
    userName: 'Sarah Mitchell',

    registrationDate: new Date('2024-11-25'),
    status: 'active',

    currentValue: 156000,
    targetValue: 310000,
    progress: 50.3,

    milestonesAchieved: ['ms-001', 'ms-002'],
    lastMilestoneDate: new Date('2024-12-08'),

    lastActivityDate: new Date('2024-12-12'),
    totalActivities: 12,
    activities: [
      {
        activityId: 'act-001',
        activityDate: new Date('2024-12-01'),
        activityType: 'daily_steps',
        value: 12500,
        isVerified: true,
      },
      {
        activityId: 'act-002',
        activityDate: new Date('2024-12-02'),
        activityType: 'daily_steps',
        value: 11800,
        isVerified: true,
      },
    ],

    isCompleted: false,
    isWinner: false,

    currentStreak: 12,
    longestStreak: 12,

    audit: {
      createdAt: new Date('2024-11-25'),
      createdBy: 'user-001',
      updatedAt: new Date('2024-12-12'),
      updatedBy: 'user-001',
    },
  },
];

// ============================================================================
// Sample Leaderboards
// ============================================================================

export const sampleLeaderboards: Leaderboard[] = [
  {
    leaderboardId: 'lb-001',
    leaderboardName: 'Top Point Earners - Monthly',
    description: 'Top employees by points earned this month',
    status: 'active',

    leaderboardType: 'points',
    scope: 'global',

    metricType: 'points',
    metricName: 'Monthly Points',
    metricUnit: 'points',

    period: 'monthly',
    periodStart: new Date('2024-12-01'),
    periodEnd: new Date('2024-12-31'),

    displayLimit: 10,
    showRankBeyondLimit: true,
    updateFrequency: 15,

    rankings: [
      {
        rank: 1,
        userId: 'user-003',
        userName: 'Emily Chen',
        department: 'Product',
        score: 2450,
        scoreChange: 450,
        previousRank: 2,
        rankChange: 1,
        tier: 'platinum',
        badges: 8,
        challenges: 3,
      },
      {
        rank: 2,
        userId: 'user-001',
        userName: 'Sarah Mitchell',
        department: 'Engineering',
        score: 2150,
        scoreChange: 380,
        previousRank: 1,
        rankChange: -1,
        tier: 'gold',
        badges: 5,
        challenges: 2,
      },
      {
        rank: 3,
        userId: 'user-002',
        userName: 'James Rodriguez',
        department: 'Marketing',
        score: 1820,
        scoreChange: 320,
        previousRank: 4,
        rankChange: 1,
        tier: 'silver',
        badges: 4,
        challenges: 2,
      },
    ],
    lastUpdated: new Date('2024-12-13'),

    isPublic: true,
    isFeatured: true,
    displayOrder: 1,

    hasRewards: true,
    rewardTiers: [
      {
        tierId: 'tier-001',
        tierName: 'Gold Tier',
        rankFrom: 1,
        rankTo: 3,
        pointsReward: 1000,
        description: 'Top 3 winners',
      },
      {
        tierId: 'tier-002',
        tierName: 'Silver Tier',
        rankFrom: 4,
        rankTo: 10,
        pointsReward: 500,
        description: 'Top 4-10',
      },
    ],

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin-001',
      updatedAt: new Date('2024-12-13'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Level Definitions
// ============================================================================

export const sampleLevelDefinitions: LevelDefinition[] = [
  {
    level: 1,
    levelName: 'Beginner',
    tier: 'bronze',
    pointsRequired: 0,
    pointsRange: { min: 0, max: 999 },
    nextLevel: 2,
    progressionRate: 1.0,
    perks: [],
    featuresUnlocked: ['Basic profile', 'Points tracking'],
    iconUrl: '/levels/bronze-1.svg',
    color: '#CD7F32',
    description: 'Welcome to the gamification journey!',
    totalUsers: 45,
    percentageOfUsers: 15.0,
    displayOrder: 1,
  },
  {
    level: 5,
    levelName: 'Intermediate',
    tier: 'silver',
    pointsRequired: 5000,
    pointsRange: { min: 5000, max: 7999 },
    previousLevel: 4,
    nextLevel: 6,
    progressionRate: 1.1,
    perks: [
      {
        perkId: 'perk-001',
        perkName: '10% Points Bonus',
        perkType: 'multiplier',
        description: 'Earn 10% bonus on all point activities',
        value: 1.1,
        isActive: true,
      },
    ],
    featuresUnlocked: ['Custom avatar', 'Badge showcase', 'Leaderboard display'],
    iconUrl: '/levels/silver-5.svg',
    color: '#C0C0C0',
    description: 'You\'re making great progress!',
    totalUsers: 72,
    percentageOfUsers: 24.0,
    displayOrder: 5,
  },
  {
    level: 7,
    levelName: 'Advanced',
    tier: 'gold',
    pointsRequired: 8000,
    pointsRange: { min: 8000, max: 9999 },
    previousLevel: 6,
    nextLevel: 8,
    progressionRate: 1.15,
    perks: [
      {
        perkId: 'perk-002',
        perkName: '15% Points Bonus',
        perkType: 'multiplier',
        description: 'Earn 15% bonus on all point activities',
        value: 1.15,
        isActive: true,
      },
      {
        perkId: 'perk-003',
        perkName: 'Priority Support',
        perkType: 'access',
        description: 'Get priority support for all requests',
        value: 'enabled',
        isActive: true,
      },
    ],
    featuresUnlocked: ['Mission creation', 'Team challenges', 'Advanced analytics'],
    iconUrl: '/levels/gold-7.svg',
    color: '#FFD700',
    description: 'Elite performer!',
    totalUsers: 38,
    percentageOfUsers: 12.7,
    displayOrder: 7,
  },
];

// ============================================================================
// Sample Missions
// ============================================================================

export const sampleMissions: Mission[] = [
  {
    missionId: 'mission-001',
    missionCode: 'DAILY-CONNECT',
    missionName: 'Daily Connection',
    description: 'Check in daily and connect with your team',
    status: 'active',

    missionType: 'daily',
    category: 'engagement',
    difficulty: 'easy',

    startDate: new Date('2024-12-13'),
    endDate: new Date('2024-12-13'),
    duration: 24,
    isRecurring: true,
    recurrencePattern: 'daily',

    isPartOfQuest: false,

    tasks: [
      {
        taskId: 'task-001',
        taskName: 'Morning Check-in',
        description: 'Log in to the platform',
        taskType: 'action',
        targetAction: 'login',
        autoVerify: true,
        requiresProof: false,
        requiresApproval: false,
        taskPoints: 50,
        order: 1,
        isOptional: false,
      },
      {
        taskId: 'task-002',
        taskName: 'Team Interaction',
        description: 'Send a message or comment on a post',
        taskType: 'action',
        targetAction: 'interact',
        autoVerify: true,
        requiresProof: false,
        requiresApproval: false,
        taskPoints: 50,
        order: 2,
        isOptional: false,
      },
    ],
    totalTasks: 2,
    completionRequirement: 'all',

    pointsReward: 100,
    bonusRewards: [
      {
        bonusId: 'bonus-001',
        bonusType: 'streak',
        description: '7-day streak bonus',
        condition: 'complete_7_days_in_row',
        pointsBonus: 500,
      },
    ],

    totalCompletions: 1247,

    priority: 'low',
    isFeatured: false,

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'system',
      updatedAt: new Date('2024-12-13'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Virtual Currency
// ============================================================================

export const sampleVirtualCurrencies: VirtualCurrency[] = [
  {
    currencyId: 'curr-001',
    currencyCode: 'STARS',
    currencyName: 'Star Credits',
    symbol: '⭐',
    description: 'Premium currency for exclusive rewards',
    status: 'active',

    conversionRate: 0.1, // 10 points = 1 star
    isConvertibleToPoints: false,
    isConvertibleFromPoints: true,

    minBalance: 0,
    maxBalance: 10000,
    dailyEarnLimit: 50,
    dailySpendLimit: 100,

    hasExpiration: false,

    iconUrl: '/currency/stars.svg',
    color: '#FFD700',

    totalIssued: 45680,
    totalInCirculation: 32140,
    totalRedeemed: 13540,

    audit: {
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin-001',
      updatedAt: new Date('2024-12-13'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Achievements
// ============================================================================

export const sampleAchievements: Achievement[] = [
  {
    achievementId: 'ach-001',
    userId: 'user-003',
    userName: 'Emily Chen',
    department: 'Product',

    achievementType: 'badge_earned',
    achievementDate: new Date('2024-10-20'),
    title: 'Earned Innovation Champion Badge',
    description: 'Emily has been awarded the Innovation Champion badge for submitting 5 approved innovative ideas!',

    sourceType: 'badge',
    sourceId: 'badge-001',
    sourceName: 'Innovation Champion',

    iconUrl: '/badges/innovation-champion.svg',
    color: '#FFD700',
    isPinned: true,
    isPublic: true,
    displayOrder: 1,

    likes: 47,
    comments: [
      {
        commentId: 'comment-001',
        userId: 'user-001',
        userName: 'Sarah Mitchell',
        commentText: 'Congratulations Emily! Well deserved!',
        commentDate: new Date('2024-10-20'),
      },
    ],
    shares: 12,

    celebrationMessage: '🎉 Congratulations on this amazing achievement!',
    celebratedBy: ['user-001', 'user-002', 'user-004', 'user-005'],

    audit: {
      createdAt: new Date('2024-10-20'),
      createdBy: 'system',
      updatedAt: new Date('2024-10-21'),
      updatedBy: 'system',
    },
  },
  {
    achievementId: 'ach-002',
    userId: 'user-001',
    userName: 'Sarah Mitchell',
    department: 'Engineering',

    achievementType: 'level_up',
    achievementDate: new Date('2024-11-28'),
    title: 'Leveled Up to Gold Tier!',
    description: 'Sarah has reached Level 7 and entered the Gold tier!',

    sourceType: 'level',
    sourceName: 'Level 7 - Advanced',

    iconUrl: '/levels/gold-7.svg',
    color: '#FFD700',
    isPinned: false,
    isPublic: true,
    displayOrder: 2,

    likes: 35,
    comments: [],
    shares: 8,

    celebrationMessage: '🏆 Amazing progress!',
    celebratedBy: ['user-002', 'user-003'],

    audit: {
      createdAt: new Date('2024-11-28'),
      createdBy: 'system',
      updatedAt: new Date('2024-11-28'),
      updatedBy: 'system',
    },
  },
];

// ============================================================================
// Sample Settings
// ============================================================================

export const sampleGamificationSettings: GamificationSettings = {
  settingsId: 'settings-001',

  pointsEnabled: true,
  pointsExpirationEnabled: false,
  defaultExpirationDays: 365,
  pointsTransferEnabled: false,
  manualAwardsRequireApproval: true,

  badgesEnabled: true,
  badgeNominationsEnabled: true,
  badgeRevocationEnabled: false,

  challengesEnabled: true,
  teamChallengesEnabled: true,
  challengeCreationOpen: false,

  leaderboardsEnabled: true,
  leaderboardsPublic: true,
  realTimeUpdates: true,
  anonymousLeaderboard: false,

  levelsEnabled: true,
  maxLevel: 100,
  levelDowngradeEnabled: false,

  missionsEnabled: true,
  dailyMissionsEnabled: true,
  questChainsEnabled: true,

  virtualCurrencyEnabled: true,
  currencyConversionEnabled: true,

  achievementWallEnabled: true,
  achievementCommentsEnabled: true,
  achievementLikesEnabled: true,

  notifyOnBadgeEarned: true,
  notifyOnLevelUp: true,
  notifyOnChallengeComplete: true,
  notifyOnLeaderboardRank: true,

  audit: {
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
    updatedAt: new Date('2024-11-15'),
    updatedBy: 'admin-001',
  },
};

// Initialize localStorage with sample data
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('gamification_points_accounts')) {
    localStorage.setItem('gamification_points_accounts', JSON.stringify(samplePointsAccounts));
  }
  if (!localStorage.getItem('gamification_points_transactions')) {
    localStorage.setItem('gamification_points_transactions', JSON.stringify(samplePointsTransactions));
  }
  if (!localStorage.getItem('gamification_points_rules')) {
    localStorage.setItem('gamification_points_rules', JSON.stringify(samplePointsRules));
  }
  if (!localStorage.getItem('gamification_badges')) {
    localStorage.setItem('gamification_badges', JSON.stringify(sampleBadges));
  }
  if (!localStorage.getItem('gamification_user_badges')) {
    localStorage.setItem('gamification_user_badges', JSON.stringify(sampleUserBadges));
  }
  if (!localStorage.getItem('gamification_challenges')) {
    localStorage.setItem('gamification_challenges', JSON.stringify(sampleChallenges));
  }
  if (!localStorage.getItem('gamification_challenge_participation')) {
    localStorage.setItem('gamification_challenge_participation', JSON.stringify(sampleChallengeParticipation));
  }
  if (!localStorage.getItem('gamification_leaderboards')) {
    localStorage.setItem('gamification_leaderboards', JSON.stringify(sampleLeaderboards));
  }
  if (!localStorage.getItem('gamification_levels')) {
    localStorage.setItem('gamification_levels', JSON.stringify(sampleLevelDefinitions));
  }
  if (!localStorage.getItem('gamification_missions')) {
    localStorage.setItem('gamification_missions', JSON.stringify(sampleMissions));
  }
  if (!localStorage.getItem('gamification_currencies')) {
    localStorage.setItem('gamification_currencies', JSON.stringify(sampleVirtualCurrencies));
  }
  if (!localStorage.getItem('gamification_achievements')) {
    localStorage.setItem('gamification_achievements', JSON.stringify(sampleAchievements));
  }
  if (!localStorage.getItem('gamification_settings')) {
    localStorage.setItem('gamification_settings', JSON.stringify(sampleGamificationSettings));
  }
}
