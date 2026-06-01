/**
 * Gamification Module - Type Definitions
 * Comprehensive types for points, badges, challenges, leaderboards, and rewards
 */

// ============================================================================
// Common Types
// ============================================================================

export type Status = 'active' | 'inactive' | 'pending' | 'archived' | 'expired';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================================================
// Points System Types
// ============================================================================

export interface PointsAccount {
  accountId: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;

  // Points Balance
  totalPoints: number;
  lifetimePoints: number;
  currentBalance: number;
  pendingPoints: number;
  expiredPoints: number;

  // Points by Category
  pointsByCategory: {
    category: string;
    points: number;
    percentage: number;
  }[];

  // Level & Tier
  currentLevel: number;
  currentTier: TierLevel;
  pointsToNextLevel: number;

  // Activity
  lastEarnedDate: Date;
  lastRedeemedDate: Date;
  totalTransactions: number;

  // Streaks
  currentStreak: number; // consecutive days
  longestStreak: number;

  audit: AuditInfo;
}

export interface PointsTransaction {
  transactionId: string;
  userId: string;
  userName: string;
  transactionType: PointsTransactionType;
  transactionDate: Date;

  // Points Details
  pointsAmount: number;
  pointsBalance: number; // Balance after transaction
  category: PointsCategory;

  // Source & Reason
  source: string; // e.g., 'badge_earned', 'challenge_completed', 'manual_award'
  sourceId?: string; // Reference ID
  reason: string;
  description: string;

  // Expiration
  expiryDate?: Date;
  isExpired: boolean;

  // Approval (for manual awards)
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: Date;

  // Metadata
  metadata?: Record<string, any>;

  audit: AuditInfo;
}

export type PointsTransactionType = 'earn' | 'redeem' | 'expire' | 'refund' | 'adjustment' | 'bonus';

export type PointsCategory =
  | 'performance'
  | 'learning'
  | 'collaboration'
  | 'innovation'
  | 'wellness'
  | 'recognition'
  | 'attendance'
  | 'engagement'
  | 'bonus'
  | 'other';

export interface PointsRule {
  ruleId: string;
  ruleName: string;
  ruleCode: string;
  description: string;
  status: Status;

  // Trigger
  triggerEvent: string; // e.g., 'training_completed', 'goal_achieved'
  triggerConditions: TriggerCondition[];

  // Points Award
  pointsAwarded: number;
  category: PointsCategory;
  isRecurring: boolean;
  recurrenceLimit?: number; // Max times rule can trigger per user

  // Validity
  validFrom: Date;
  validTo?: Date;
  expirationDays?: number; // Points expire after X days

  // Restrictions
  eligibleUsers?: string[]; // Empty = all users
  eligibleDepartments?: string[];
  minRequirement?: number;
  maxAwardsPerUser?: number;

  // Multipliers
  multiplier: number; // Default 1.0
  bonusDays?: number[]; // Day of week (0-6) for bonus
  bonusMultiplier?: number;

  // Statistics
  totalAwarded: number;
  totalRecipients: number;
  lastTriggered?: Date;

  audit: AuditInfo;
}

export interface TriggerCondition {
  conditionId: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
  value: any;
  description: string;
}

export interface PointsRedemption {
  redemptionId: string;
  userId: string;
  userName: string;
  redemptionDate: Date;

  // Reward Details
  rewardId: string;
  rewardName: string;
  rewardType: RewardType;
  pointsCost: number;

  // Fulfillment
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';
  fulfillmentDate?: Date;
  fulfillmentNotes?: string;

  // Delivery
  deliveryMethod: 'digital' | 'physical' | 'voucher' | 'instant';
  deliveryDetails?: string;
  trackingNumber?: string;

  audit: AuditInfo;
}

export type RewardType = 'gift_card' | 'merchandise' | 'experience' | 'time_off' | 'donation' | 'perk' | 'voucher';

// ============================================================================
// Badges Types
// ============================================================================

export interface Badge {
  badgeId: string;
  badgeCode: string;
  badgeName: string;
  description: string;
  status: Status;

  // Visual
  iconUrl: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

  // Category
  category: BadgeCategory;
  tags: string[];

  // Earning Criteria
  criteria: BadgeCriteria[];
  isAutoAwarded: boolean;
  requiresNomination: boolean;
  requiresApproval: boolean;

  // Points & Rewards
  pointsAwarded: number;
  isRecurring: boolean; // Can be earned multiple times

  // Rarity
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  maxAwards?: number; // Limit total awards across all users
  totalAwarded: number;

  // Display
  displayOrder: number;
  isVisible: boolean;
  isSecret: boolean; // Hidden until earned

  // Validity
  validFrom: Date;
  validTo?: Date;
  expiryDays?: number; // Badge expires after X days

  audit: AuditInfo;
}

export type BadgeCategory =
  | 'achievement'
  | 'milestone'
  | 'skill'
  | 'behavior'
  | 'event'
  | 'time'
  | 'special'
  | 'team';

export interface BadgeCriteria {
  criteriaId: string;
  criteriaType: 'points' | 'count' | 'value' | 'time' | 'streak' | 'custom';
  description: string;
  requirement: any;
  operator: string;
  progress?: number; // Current progress (0-100)
}

export interface UserBadge {
  userBadgeId: string;
  userId: string;
  userName: string;
  badgeId: string;
  badge: Badge;

  // Award Details
  awardedDate: Date;
  awardedBy?: string;
  reason?: string;
  occasion?: string;

  // Status
  status: 'active' | 'expired' | 'revoked';
  expiryDate?: Date;
  revokedDate?: Date;
  revokedReason?: string;

  // Display
  isPinned: boolean;
  displayOnProfile: boolean;
  shareOnFeed: boolean;

  // Nomination (if applicable)
  nominatedBy?: string;
  nominationMessage?: string;
  approvedBy?: string;

  // Recurrence
  earnCount: number; // Number of times earned
  firstEarned?: Date;

  audit: AuditInfo;
}

// ============================================================================
// Challenges Types
// ============================================================================

export interface Challenge {
  challengeId: string;
  challengeCode: string;
  challengeName: string;
  description: string;
  status: Status;

  // Type & Category
  challengeType: ChallengeType;
  category: PointsCategory;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';

  // Participation
  participationType: 'individual' | 'team' | 'department';
  isTeamBased: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;

  // Timeline
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  duration: number; // days

  // Goals & Metrics
  goalType: 'target' | 'competition' | 'streak' | 'improvement';
  targetMetric: string;
  targetValue: number;
  targetUnit: string;

  // Tracking
  trackingFrequency: 'daily' | 'weekly' | 'milestone' | 'continuous';
  autoTracking: boolean;
  manualEntry: boolean;

  // Rewards
  pointsReward: number;
  badgeRewards: string[]; // Badge IDs
  additionalRewards: string[];

  // Winner Determination
  winnerDetermination: 'first' | 'top_n' | 'threshold' | 'all_qualified';
  numberOfWinners?: number;

  // Participation
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  eligibleUsers?: string[];
  eligibleDepartments?: string[];

  // Milestones
  milestones: ChallengeMilestone[];

  // Visibility
  isPublic: boolean;
  isFeatured: boolean;
  bannerImageUrl?: string;

  audit: AuditInfo;
}

export type ChallengeType =
  | 'wellness'
  | 'learning'
  | 'productivity'
  | 'collaboration'
  | 'innovation'
  | 'attendance'
  | 'custom';

export interface ChallengeMilestone {
  milestoneId: string;
  milestoneName: string;
  targetValue: number;
  pointsReward: number;
  badgeReward?: string;
  order: number;
}

export interface ChallengeParticipation {
  participationId: string;
  challengeId: string;
  challenge: Challenge;

  // Participant
  userId: string;
  userName: string;
  teamId?: string;
  teamName?: string;

  // Registration
  registrationDate: Date;
  status: 'registered' | 'active' | 'completed' | 'withdrawn' | 'disqualified';

  // Progress
  currentValue: number;
  targetValue: number;
  progress: number; // 0-100
  rank?: number;

  // Milestones
  milestonesAchieved: string[];
  lastMilestoneDate?: Date;

  // Activity
  lastActivityDate: Date;
  totalActivities: number;
  activities: ChallengeActivity[];

  // Completion
  isCompleted: boolean;
  completionDate?: Date;
  isWinner: boolean;
  prizeAwarded?: string;

  // Streaks
  currentStreak: number;
  longestStreak: number;

  audit: AuditInfo;
}

export interface ChallengeActivity {
  activityId: string;
  activityDate: Date;
  activityType: string;
  value: number;
  notes?: string;
  verifiedBy?: string;
  isVerified: boolean;
}

// ============================================================================
// Leaderboards Types
// ============================================================================

export interface Leaderboard {
  leaderboardId: string;
  leaderboardName: string;
  description: string;
  status: Status;

  // Type & Scope
  leaderboardType: LeaderboardType;
  scope: 'global' | 'department' | 'location' | 'team' | 'custom';
  scopeFilter?: string;

  // Metric
  metricType: 'points' | 'badges' | 'challenges' | 'custom';
  metricName: string;
  metricUnit: string;

  // Time Period
  period: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';
  periodStart?: Date;
  periodEnd?: Date;

  // Display
  displayLimit: number; // Top N entries to show
  showRankBeyondLimit: boolean; // Show user's rank even if outside top N
  updateFrequency: number; // minutes

  // Rankings
  rankings: LeaderboardEntry[];
  lastUpdated: Date;

  // Visibility
  isPublic: boolean;
  isFeatured: boolean;
  displayOrder: number;

  // Rewards
  hasRewards: boolean;
  rewardTiers: LeaderboardRewardTier[];

  audit: AuditInfo;
}

export type LeaderboardType = 'points' | 'badges' | 'challenges' | 'level' | 'streak' | 'custom';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  department: string;

  // Score
  score: number;
  scoreChange: number; // Change since last period
  previousRank?: number;
  rankChange?: number;

  // Additional Metrics
  secondaryMetrics?: {
    metricName: string;
    value: number;
  }[];

  // Tier
  tier?: TierLevel;
  badges?: number;
  challenges?: number;
}

export interface LeaderboardRewardTier {
  tierId: string;
  tierName: string;
  rankFrom: number;
  rankTo: number;
  pointsReward: number;
  badgeReward?: string;
  description: string;
}

// ============================================================================
// Levels & Tiers Types
// ============================================================================

export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LevelDefinition {
  level: number;
  levelName: string;
  tier: TierLevel;

  // Requirements
  pointsRequired: number;
  pointsRange: {
    min: number;
    max: number;
  };

  // Progression
  nextLevel?: number;
  previousLevel?: number;
  progressionRate: number; // Multiplier for points earned

  // Perks & Benefits
  perks: LevelPerk[];
  badgeUnlocked?: string;
  featuresUnlocked: string[];

  // Visual
  iconUrl: string;
  color: string;
  description: string;

  // Statistics
  totalUsers: number;
  percentageOfUsers: number;

  displayOrder: number;
}

export interface LevelPerk {
  perkId: string;
  perkName: string;
  perkType: 'multiplier' | 'discount' | 'access' | 'priority' | 'custom';
  description: string;
  value: number | string;
  isActive: boolean;
}

export interface UserLevel {
  userId: string;
  userName: string;

  // Current Level
  currentLevel: number;
  currentTier: TierLevel;
  levelDefinition: LevelDefinition;

  // Points
  totalPoints: number;
  pointsInCurrentLevel: number;
  pointsToNextLevel: number;
  levelProgress: number; // 0-100

  // History
  levelHistory: LevelChange[];
  tierHistory: TierChange[];
  highestLevelAchieved: number;
  highestTierAchieved: TierLevel;

  // Activity
  lastLevelUpDate?: Date;
  averagePointsPerDay: number;
  projectedNextLevelDate?: Date;

  audit: AuditInfo;
}

export interface LevelChange {
  changeId: string;
  changeDate: Date;
  fromLevel: number;
  toLevel: number;
  pointsAtChange: number;
  reason: string;
}

export interface TierChange {
  changeId: string;
  changeDate: Date;
  fromTier: TierLevel;
  toTier: TierLevel;
  level: number;
}

// ============================================================================
// Missions Types
// ============================================================================

export interface Mission {
  missionId: string;
  missionCode: string;
  missionName: string;
  description: string;
  status: Status;

  // Type & Category
  missionType: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'event' | 'quest';
  category: PointsCategory;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';

  // Timeline
  startDate: Date;
  endDate: Date;
  duration: number; // hours
  isRecurring: boolean;
  recurrencePattern?: string;

  // Quest Chain
  isPartOfQuest: boolean;
  questId?: string;
  questStep?: number;
  prerequisiteMissions?: string[]; // Must complete these first

  // Tasks
  tasks: MissionTask[];
  totalTasks: number;
  completionRequirement: 'all' | 'any' | 'minimum';
  minimumTasksRequired?: number;

  // Rewards
  pointsReward: number;
  badgeReward?: string;
  bonusRewards: MissionBonus[];

  // Availability
  maxCompletions?: number; // Per user
  totalCompletions: number;
  eligibleUsers?: string[];

  // Display
  priority: Priority;
  isFeatured: boolean;
  bannerImageUrl?: string;

  audit: AuditInfo;
}

export interface MissionTask {
  taskId: string;
  taskName: string;
  description: string;
  taskType: 'action' | 'count' | 'value' | 'time' | 'streak' | 'approval';

  // Requirements
  targetAction?: string;
  targetCount?: number;
  targetValue?: number;
  targetUnit?: string;

  // Verification
  autoVerify: boolean;
  requiresProof: boolean;
  requiresApproval: boolean;

  // Rewards
  taskPoints: number;

  // Order
  order: number;
  isOptional: boolean;
}

export interface MissionBonus {
  bonusId: string;
  bonusType: 'speed' | 'perfect' | 'first' | 'streak' | 'custom';
  description: string;
  condition: string;
  pointsBonus: number;
}

export interface UserMission {
  userMissionId: string;
  userId: string;
  userName: string;
  missionId: string;
  mission: Mission;

  // Status
  status: 'available' | 'active' | 'completed' | 'expired' | 'abandoned';
  startDate?: Date;
  completionDate?: Date;
  expiryDate?: Date;

  // Progress
  totalTasks: number;
  completedTasks: number;
  progress: number; // 0-100
  taskProgress: MissionTaskProgress[];

  // Rewards
  pointsEarned: number;
  bonusPointsEarned: number;
  badgeEarned?: string;

  // Timing
  timeSpent: number; // minutes
  completedWithinTime: boolean;
  speedBonus?: number;

  // Attempts
  attemptNumber: number;
  maxAttempts?: number;

  audit: AuditInfo;
}

export interface MissionTaskProgress {
  taskId: string;
  taskName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  currentValue: number;
  targetValue: number;
  progress: number; // 0-100
  completedDate?: Date;
  proofUrl?: string;
  verifiedBy?: string;
}

// ============================================================================
// Virtual Currency Types
// ============================================================================

export interface VirtualCurrency {
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  description: string;
  status: Status;

  // Exchange
  conversionRate: number; // Points to currency ratio
  isConvertibleToPoints: boolean;
  isConvertibleFromPoints: boolean;

  // Limits
  minBalance: number;
  maxBalance?: number;
  dailyEarnLimit?: number;
  dailySpendLimit?: number;

  // Expiration
  hasExpiration: boolean;
  expirationDays?: number;

  // Display
  iconUrl?: string;
  color: string;

  // Statistics
  totalIssued: number;
  totalInCirculation: number;
  totalRedeemed: number;

  audit: AuditInfo;
}

export interface CurrencyAccount {
  accountId: string;
  userId: string;
  userName: string;
  currencyId: string;
  currency: VirtualCurrency;

  // Balance
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  pendingBalance: number;

  // Activity
  lastEarnedDate?: Date;
  lastSpentDate?: Date;
  totalTransactions: number;

  // Limits
  dailyEarnedToday: number;
  dailySpentToday: number;

  audit: AuditInfo;
}

export interface CurrencyTransaction {
  transactionId: string;
  accountId: string;
  userId: string;
  currencyId: string;
  transactionDate: Date;

  // Transaction Details
  transactionType: 'earn' | 'spend' | 'transfer' | 'refund' | 'adjustment' | 'conversion';
  amount: number;
  balanceAfter: number;

  // Source
  source: string;
  sourceId?: string;
  description: string;

  // Transfer (if applicable)
  fromUserId?: string;
  toUserId?: string;

  // Conversion (if applicable)
  convertedFrom?: {
    currency: string;
    amount: number;
    rate: number;
  };

  // Expiration
  expiryDate?: Date;

  audit: AuditInfo;
}

// ============================================================================
// Achievement Wall Types
// ============================================================================

export interface Achievement {
  achievementId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  department: string;

  // Achievement Details
  achievementType: AchievementType;
  achievementDate: Date;
  title: string;
  description: string;

  // Source
  sourceType: 'badge' | 'challenge' | 'mission' | 'level' | 'leaderboard' | 'points' | 'custom';
  sourceId?: string;
  sourceName: string;

  // Display
  iconUrl?: string;
  color?: string;
  isPinned: boolean;
  isPublic: boolean;
  displayOrder: number;

  // Social
  likes: number;
  comments: AchievementComment[];
  shares: number;

  // Celebration
  celebrationMessage?: string;
  celebratedBy: string[];

  audit: AuditInfo;
}

export type AchievementType =
  | 'badge_earned'
  | 'challenge_completed'
  | 'mission_completed'
  | 'level_up'
  | 'milestone'
  | 'leaderboard_top'
  | 'streak'
  | 'first'
  | 'team'
  | 'special';

export interface AchievementComment {
  commentId: string;
  userId: string;
  userName: string;
  commentText: string;
  commentDate: Date;
}

export interface AchievementWall {
  wallId: string;
  wallName: string;
  wallType: 'global' | 'department' | 'team' | 'personal';
  scope?: string;

  // Display Settings
  displayLimit: number;
  sortBy: 'date' | 'likes' | 'importance';
  filterTypes?: AchievementType[];

  // Achievements
  achievements: Achievement[];
  lastUpdated: Date;

  // Statistics
  totalAchievements: number;
  mostCelebrated?: Achievement;
  topContributors: {
    userId: string;
    userName: string;
    achievementCount: number;
  }[];
}

// ============================================================================
// Gamification Analytics
// ============================================================================

export interface GamificationAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  periodStart: Date;
  periodEnd: Date;

  // Overall Engagement
  totalActiveUsers: number;
  newUsers: number;
  engagementRate: number; // %

  // Points
  totalPointsAwarded: number;
  totalPointsRedeemed: number;
  averagePointsPerUser: number;
  topPointEarners: LeaderboardEntry[];

  // Badges
  totalBadgesAwarded: number;
  uniqueBadgesAwarded: number;
  topBadges: {
    badgeId: string;
    badgeName: string;
    timesAwarded: number;
  }[];

  // Challenges
  activeChallenges: number;
  challengeParticipationRate: number;
  challengeCompletionRate: number;
  topChallenges: {
    challengeId: string;
    challengeName: string;
    participants: number;
  }[];

  // Missions
  missionsCompleted: number;
  missionCompletionRate: number;
  averageMissionsPerUser: number;

  // Levels
  levelDistribution: {
    level: number;
    tier: TierLevel;
    userCount: number;
  }[];
  averageLevel: number;

  // Leaderboards
  leaderboardViews: number;
  leaderboardEngagement: number;

  // Trends
  pointsTrend: { date: Date; points: number }[];
  engagementTrend: { date: Date; activeUsers: number }[];
}

// ============================================================================
// Gamification Settings
// ============================================================================

export interface GamificationSettings {
  settingsId: string;

  // Points System
  pointsEnabled: boolean;
  pointsExpirationEnabled: boolean;
  defaultExpirationDays: number;
  pointsTransferEnabled: boolean;
  manualAwardsRequireApproval: boolean;

  // Badges
  badgesEnabled: boolean;
  badgeNominationsEnabled: boolean;
  badgeRevocationEnabled: boolean;

  // Challenges
  challengesEnabled: boolean;
  teamChallengesEnabled: boolean;
  challengeCreationOpen: boolean; // Users can create challenges

  // Leaderboards
  leaderboardsEnabled: boolean;
  leaderboardsPublic: boolean;
  realTimeUpdates: boolean;
  anonymousLeaderboard: boolean;

  // Levels
  levelsEnabled: boolean;
  maxLevel: number;
  levelDowngradeEnabled: boolean;

  // Missions
  missionsEnabled: boolean;
  dailyMissionsEnabled: boolean;
  questChainsEnabled: boolean;

  // Currency
  virtualCurrencyEnabled: boolean;
  currencyConversionEnabled: boolean;

  // Achievement Wall
  achievementWallEnabled: boolean;
  achievementCommentsEnabled: boolean;
  achievementLikesEnabled: boolean;

  // Notifications
  notifyOnBadgeEarned: boolean;
  notifyOnLevelUp: boolean;
  notifyOnChallengeComplete: boolean;
  notifyOnLeaderboardRank: boolean;

  audit: AuditInfo;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
