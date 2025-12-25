/**
 * Gamification Service
 * Points, badges, levels, challenges, and leaderboards for employee engagement
 *
 * Features:
 * - Points system with earning rules
 * - Badge achievements and collections
 * - Level progression
 * - Challenges and quests
 * - Team competitions
 * - Leaderboards
 * - Rewards redemption
 */

// ============================================================================
// TYPES
// ============================================================================

export interface GamificationProfile {
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  totalPoints: number;
  availablePoints: number;
  level: Level;
  badges: EarnedBadge[];
  streaks: Streak[];
  challengeProgress: ChallengeProgress[];
  achievements: Achievement[];
  rank: number;
  joinedAt: Date;
  lastActivityAt: Date;
}

export interface Level {
  id: number;
  name: string;
  nameAr: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  color: string;
  perks: string[];
  perksAr: string[];
}

export interface Badge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
  imageUrl?: string;
  pointsValue: number;
  criteria: BadgeCriteria;
  isSecret: boolean;
  isActive: boolean;
  createdAt: Date;
}

export type BadgeCategory =
  | 'onboarding'
  | 'learning'
  | 'collaboration'
  | 'performance'
  | 'recognition'
  | 'wellness'
  | 'innovation'
  | 'leadership'
  | 'tenure'
  | 'special';

export type BadgeTier =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface BadgeCriteria {
  type: CriteriaType;
  target: number;
  metric?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
}

export type CriteriaType =
  | 'recognition_received'
  | 'recognition_given'
  | 'courses_completed'
  | 'goals_achieved'
  | 'days_logged'
  | 'streak_days'
  | 'points_earned'
  | 'challenges_completed'
  | 'referrals_made'
  | 'surveys_completed'
  | 'tenure_months'
  | 'custom';

export interface EarnedBadge {
  badge: Badge;
  earnedAt: Date;
  progress: number; // 0-100
}

export interface Streak {
  id: string;
  type: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: Date;
  isActive: boolean;
}

export type StreakType =
  | 'daily_login'
  | 'recognition_given'
  | 'learning'
  | 'wellness'
  | 'on_time';

export interface Challenge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: ChallengeType;
  category: BadgeCategory;
  difficulty: ChallengeDifficulty;
  pointsReward: number;
  badgeReward?: string;
  criteria: ChallengeCriteria;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  currentParticipants: number;
  isTeamChallenge: boolean;
  teamSize?: number;
  status: ChallengeStatus;
  createdAt: Date;
}

export type ChallengeType =
  | 'individual'
  | 'team'
  | 'department'
  | 'company_wide';

export type ChallengeDifficulty =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'extreme';

export type ChallengeStatus =
  | 'upcoming'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface ChallengeCriteria {
  metric: string;
  target: number;
  description: string;
  descriptionAr: string;
}

export interface ChallengeProgress {
  challengeId: string;
  challengeName: string;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  rank?: number;
}

export interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: AchievementType;
  icon: string;
  pointsAwarded: number;
  earnedAt: Date;
}

export type AchievementType =
  | 'first_recognition'
  | 'first_badge'
  | 'level_up'
  | 'challenge_complete'
  | 'streak_milestone'
  | 'top_performer'
  | 'perfect_attendance'
  | 'learning_champion';

export interface PointsTransaction {
  id: string;
  employeeId: string;
  amount: number;
  type: TransactionType;
  source: string;
  sourceId?: string;
  description: string;
  descriptionAr: string;
  balanceAfter: number;
  createdAt: Date;
}

export type TransactionType = 'earn' | 'spend' | 'expire' | 'adjust';

export interface Reward {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: RewardCategory;
  pointsCost: number;
  monetaryValue?: number;
  currency?: string;
  imageUrl?: string;
  stock?: number;
  isActive: boolean;
  validUntil?: Date;
  termsAndConditions?: string;
}

export type RewardCategory =
  | 'gift_card'
  | 'merchandise'
  | 'experience'
  | 'time_off'
  | 'donation'
  | 'learning'
  | 'wellness';

export interface RewardRedemption {
  id: string;
  employeeId: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  status: RedemptionStatus;
  redeemedAt: Date;
  fulfilledAt?: Date;
  notes?: string;
}

export type RedemptionStatus =
  | 'pending'
  | 'processing'
  | 'fulfilled'
  | 'cancelled';

export interface LeaderboardConfig {
  type: 'points' | 'badges' | 'level' | 'challenges';
  scope: 'company' | 'department' | 'team';
  timeframe: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';
  limit: number;
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  value: number;
  change: number; // rank change from previous period
  level: Level;
  topBadges: Badge[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LEVELS: Level[] = [
  { id: 1, name: 'Newcomer', nameAr: 'مبتدئ', minPoints: 0, maxPoints: 99, icon: '🌱', color: '#94A3B8', perks: ['Basic profile'], perksAr: ['ملف تعريف أساسي'] },
  { id: 2, name: 'Contributor', nameAr: 'مساهم', minPoints: 100, maxPoints: 299, icon: '🌿', color: '#22C55E', perks: ['Custom avatar'], perksAr: ['صورة مخصصة'] },
  { id: 3, name: 'Achiever', nameAr: 'منجز', minPoints: 300, maxPoints: 599, icon: '🌳', color: '#3B82F6', perks: ['Badge showcase'], perksAr: ['عرض الشارات'] },
  { id: 4, name: 'Expert', nameAr: 'خبير', minPoints: 600, maxPoints: 999, icon: '⭐', color: '#8B5CF6', perks: ['Priority support'], perksAr: ['دعم أولوية'] },
  { id: 5, name: 'Champion', nameAr: 'بطل', minPoints: 1000, maxPoints: 1999, icon: '🏆', color: '#F59E0B', perks: ['Exclusive rewards'], perksAr: ['مكافآت حصرية'] },
  { id: 6, name: 'Legend', nameAr: 'أسطورة', minPoints: 2000, maxPoints: 4999, icon: '👑', color: '#EF4444', perks: ['VIP status'], perksAr: ['حالة كبار الشخصيات'] },
  { id: 7, name: 'Icon', nameAr: 'أيقونة', minPoints: 5000, maxPoints: Infinity, icon: '💎', color: '#EC4899', perks: ['All perks + mentoring'], perksAr: ['جميع المزايا + التوجيه'] },
];

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    nameAr: 'الخطوات الأولى',
    description: 'Complete your profile setup',
    descriptionAr: 'أكمل إعداد ملفك الشخصي',
    category: 'onboarding',
    tier: 'common',
    icon: '👣',
    pointsValue: 10,
    criteria: { type: 'custom', target: 1 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'team_player',
    name: 'Team Player',
    nameAr: 'لاعب فريق',
    description: 'Give 10 recognitions to colleagues',
    descriptionAr: 'امنح 10 تقديرات للزملاء',
    category: 'collaboration',
    tier: 'uncommon',
    icon: '🤝',
    pointsValue: 50,
    criteria: { type: 'recognition_given', target: 10 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    nameAr: 'نجم صاعد',
    description: 'Receive 25 recognitions',
    descriptionAr: 'احصل على 25 تقدير',
    category: 'recognition',
    tier: 'rare',
    icon: '🌟',
    pointsValue: 100,
    criteria: { type: 'recognition_received', target: 25 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    nameAr: 'باحث عن المعرفة',
    description: 'Complete 5 learning courses',
    descriptionAr: 'أكمل 5 دورات تعليمية',
    category: 'learning',
    tier: 'uncommon',
    icon: '📚',
    pointsValue: 75,
    criteria: { type: 'courses_completed', target: 5 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    nameAr: 'محطم الأهداف',
    description: 'Achieve 10 goals',
    descriptionAr: 'حقق 10 أهداف',
    category: 'performance',
    tier: 'rare',
    icon: '🎯',
    pointsValue: 150,
    criteria: { type: 'goals_achieved', target: 10 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'wellness_warrior',
    name: 'Wellness Warrior',
    nameAr: 'محارب العافية',
    description: 'Complete 30 wellness activities',
    descriptionAr: 'أكمل 30 نشاط صحي',
    category: 'wellness',
    tier: 'rare',
    icon: '💪',
    pointsValue: 100,
    criteria: { type: 'custom', target: 30 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'innovator',
    name: 'Innovator',
    nameAr: 'مبتكر',
    description: 'Submit 5 approved suggestions',
    descriptionAr: 'قدم 5 اقتراحات معتمدة',
    category: 'innovation',
    tier: 'epic',
    icon: '💡',
    pointsValue: 200,
    criteria: { type: 'custom', target: 5 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    nameAr: 'سيد السلسلة',
    description: 'Maintain a 30-day login streak',
    descriptionAr: 'حافظ على سلسلة تسجيل دخول لمدة 30 يوماً',
    category: 'special',
    tier: 'epic',
    icon: '🔥',
    pointsValue: 250,
    criteria: { type: 'streak_days', target: 30 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'veteran',
    name: 'Veteran',
    nameAr: 'مخضرم',
    description: 'Complete 1 year with the company',
    descriptionAr: 'أكمل سنة واحدة مع الشركة',
    category: 'tenure',
    tier: 'rare',
    icon: '🎖️',
    pointsValue: 500,
    criteria: { type: 'tenure_months', target: 12 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'legend',
    name: 'Legend',
    nameAr: 'أسطورة',
    description: 'Reach Level 6 (Legend status)',
    descriptionAr: 'وصول للمستوى 6 (حالة أسطورة)',
    category: 'special',
    tier: 'legendary',
    icon: '👑',
    pointsValue: 1000,
    criteria: { type: 'points_earned', target: 2000 },
    isSecret: false,
    isActive: true,
    createdAt: new Date(),
  },
];

const BADGE_TIER_COLORS: Record<BadgeTier, string> = {
  common: '#94A3B8',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

const DIFFICULTY_LABELS: Record<ChallengeDifficulty, { en: string; ar: string; multiplier: number }> = {
  easy: { en: 'Easy', ar: 'سهل', multiplier: 1 },
  medium: { en: 'Medium', ar: 'متوسط', multiplier: 1.5 },
  hard: { en: 'Hard', ar: 'صعب', multiplier: 2 },
  extreme: { en: 'Extreme', ar: 'شديد', multiplier: 3 },
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class GamificationService {
  private profiles: Map<string, GamificationProfile> = new Map();
  private badges: Map<string, Badge> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private rewards: Map<string, Reward> = new Map();
  private transactions: Map<string, PointsTransaction[]> = new Map();
  private redemptions: Map<string, RewardRedemption[]> = new Map();

  constructor() {
    this.initializeDefaultBadges();
  }

  /**
   * Initialize default badges
   */
  private initializeDefaultBadges(): void {
    DEFAULT_BADGES.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }

  /**
   * Get or create gamification profile
   */
  getProfile(employeeId: string, employeeName: string, department: string): GamificationProfile {
    let profile = this.profiles.get(employeeId);

    if (!profile) {
      profile = {
        employeeId,
        employeeName,
        department,
        totalPoints: 0,
        availablePoints: 0,
        level: LEVELS[0],
        badges: [],
        streaks: this.initializeStreaks(),
        challengeProgress: [],
        achievements: [],
        rank: 0,
        joinedAt: new Date(),
        lastActivityAt: new Date(),
      };
      this.profiles.set(employeeId, profile);
    }

    return profile;
  }

  /**
   * Initialize default streaks
   */
  private initializeStreaks(): Streak[] {
    return [
      { id: 'login', type: 'daily_login', currentCount: 0, longestCount: 0, lastActivityDate: new Date(), isActive: false },
      { id: 'recognition', type: 'recognition_given', currentCount: 0, longestCount: 0, lastActivityDate: new Date(), isActive: false },
      { id: 'learning', type: 'learning', currentCount: 0, longestCount: 0, lastActivityDate: new Date(), isActive: false },
      { id: 'wellness', type: 'wellness', currentCount: 0, longestCount: 0, lastActivityDate: new Date(), isActive: false },
    ];
  }

  /**
   * Award points to employee
   */
  awardPoints(
    employeeId: string,
    amount: number,
    source: string,
    description: string,
    descriptionAr: string,
    sourceId?: string
  ): PointsTransaction {
    const profile = this.profiles.get(employeeId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.totalPoints += amount;
    profile.availablePoints += amount;
    profile.lastActivityAt = new Date();

    // Check for level up
    const newLevel = this.calculateLevel(profile.totalPoints);
    if (newLevel.id > profile.level.id) {
      profile.level = newLevel;
      this.recordAchievement(employeeId, 'level_up', `Reached ${newLevel.name}`, `وصل إلى ${newLevel.nameAr}`);
    }

    const transaction: PointsTransaction = {
      id: this.generateId(),
      employeeId,
      amount,
      type: 'earn',
      source,
      sourceId,
      description,
      descriptionAr,
      balanceAfter: profile.availablePoints,
      createdAt: new Date(),
    };

    const employeeTransactions = this.transactions.get(employeeId) || [];
    employeeTransactions.push(transaction);
    this.transactions.set(employeeId, employeeTransactions);

    // Check for badge eligibility
    this.checkBadgeEligibility(employeeId);

    return transaction;
  }

  /**
   * Spend points
   */
  spendPoints(
    employeeId: string,
    amount: number,
    description: string,
    descriptionAr: string
  ): PointsTransaction | null {
    const profile = this.profiles.get(employeeId);
    if (!profile || profile.availablePoints < amount) {
      return null;
    }

    profile.availablePoints -= amount;

    const transaction: PointsTransaction = {
      id: this.generateId(),
      employeeId,
      amount: -amount,
      type: 'spend',
      source: 'redemption',
      description,
      descriptionAr,
      balanceAfter: profile.availablePoints,
      createdAt: new Date(),
    };

    const employeeTransactions = this.transactions.get(employeeId) || [];
    employeeTransactions.push(transaction);
    this.transactions.set(employeeId, employeeTransactions);

    return transaction;
  }

  /**
   * Calculate level based on points
   */
  calculateLevel(points: number): Level {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].minPoints) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  }

  /**
   * Get all levels
   */
  getLevels(): Level[] {
    return LEVELS;
  }

  /**
   * Award badge to employee
   */
  awardBadge(employeeId: string, badgeId: string): EarnedBadge | null {
    const profile = this.profiles.get(employeeId);
    const badge = this.badges.get(badgeId);

    if (!profile || !badge) return null;

    // Check if already earned
    if (profile.badges.some(b => b.badge.id === badgeId)) {
      return null;
    }

    const earnedBadge: EarnedBadge = {
      badge,
      earnedAt: new Date(),
      progress: 100,
    };

    profile.badges.push(earnedBadge);

    // Award badge points
    this.awardPoints(
      employeeId,
      badge.pointsValue,
      'badge',
      `Earned badge: ${badge.name}`,
      `حصل على شارة: ${badge.nameAr}`,
      badgeId
    );

    // Record achievement for first badge
    if (profile.badges.length === 1) {
      this.recordAchievement(employeeId, 'first_badge', 'Earned first badge', 'حصل على أول شارة');
    }

    return earnedBadge;
  }

  /**
   * Check badge eligibility
   */
  private checkBadgeEligibility(employeeId: string): void {
    const profile = this.profiles.get(employeeId);
    if (!profile) return;

    this.badges.forEach((badge, badgeId) => {
      // Skip if already earned
      if (profile.badges.some(b => b.badge.id === badgeId)) return;

      // Check criteria
      const isEligible = this.checkBadgeCriteria(profile, badge.criteria);
      if (isEligible) {
        this.awardBadge(employeeId, badgeId);
      }
    });
  }

  /**
   * Check badge criteria
   */
  private checkBadgeCriteria(profile: GamificationProfile, criteria: BadgeCriteria): boolean {
    switch (criteria.type) {
      case 'points_earned':
        return profile.totalPoints >= criteria.target;
      case 'streak_days':
        const loginStreak = profile.streaks.find(s => s.type === 'daily_login');
        return loginStreak ? loginStreak.currentCount >= criteria.target : false;
      default:
        return false;
    }
  }

  /**
   * Update streak
   */
  updateStreak(employeeId: string, streakType: StreakType): Streak | null {
    const profile = this.profiles.get(employeeId);
    if (!profile) return null;

    const streak = profile.streaks.find(s => s.type === streakType);
    if (!streak) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(streak.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Already updated today
      return streak;
    } else if (daysDiff === 1) {
      // Consecutive day
      streak.currentCount++;
      streak.isActive = true;
      if (streak.currentCount > streak.longestCount) {
        streak.longestCount = streak.currentCount;
      }
    } else {
      // Streak broken
      streak.currentCount = 1;
      streak.isActive = true;
    }

    streak.lastActivityDate = new Date();

    // Check for streak milestones (7, 14, 30, 60, 90 days)
    const milestones = [7, 14, 30, 60, 90];
    if (milestones.includes(streak.currentCount)) {
      const bonusPoints = streak.currentCount * 5;
      this.awardPoints(
        employeeId,
        bonusPoints,
        'streak_bonus',
        `${streak.currentCount}-day ${streakType} streak!`,
        `سلسلة ${streak.currentCount} يوم ${streakType}!`
      );
    }

    return streak;
  }

  /**
   * Get all badges
   */
  getBadges(category?: BadgeCategory): Badge[] {
    let badges = Array.from(this.badges.values()).filter(b => b.isActive);

    if (category) {
      badges = badges.filter(b => b.category === category);
    }

    return badges.sort((a, b) => {
      const tierOrder: BadgeTier[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
    });
  }

  /**
   * Create a badge
   */
  createBadge(badge: Omit<Badge, 'id' | 'createdAt'>): Badge {
    const newBadge: Badge = {
      ...badge,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.badges.set(newBadge.id, newBadge);
    return newBadge;
  }

  /**
   * Create a challenge
   */
  createChallenge(challenge: Omit<Challenge, 'id' | 'currentParticipants' | 'status' | 'createdAt'>): Challenge {
    const now = new Date();
    const status: ChallengeStatus = challenge.startDate > now ? 'upcoming' : 'active';

    const newChallenge: Challenge = {
      ...challenge,
      id: this.generateId(),
      currentParticipants: 0,
      status,
      createdAt: new Date(),
    };
    this.challenges.set(newChallenge.id, newChallenge);
    return newChallenge;
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(): Challenge[] {
    return Array.from(this.challenges.values())
      .filter(c => c.status === 'active')
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  }

  /**
   * Join a challenge
   */
  joinChallenge(employeeId: string, challengeId: string): ChallengeProgress | null {
    const challenge = this.challenges.get(challengeId);
    const profile = this.profiles.get(employeeId);

    if (!challenge || !profile || challenge.status !== 'active') return null;

    // Check if already joined
    if (profile.challengeProgress.some(cp => cp.challengeId === challengeId)) {
      return null;
    }

    // Check max participants
    if (challenge.maxParticipants && challenge.currentParticipants >= challenge.maxParticipants) {
      return null;
    }

    const progress: ChallengeProgress = {
      challengeId,
      challengeName: challenge.name,
      progress: 0,
      currentValue: 0,
      targetValue: challenge.criteria.target,
      isCompleted: false,
    };

    profile.challengeProgress.push(progress);
    challenge.currentParticipants++;

    return progress;
  }

  /**
   * Update challenge progress
   */
  updateChallengeProgress(
    employeeId: string,
    challengeId: string,
    increment: number
  ): ChallengeProgress | null {
    const profile = this.profiles.get(employeeId);
    const challenge = this.challenges.get(challengeId);

    if (!profile || !challenge) return null;

    const progress = profile.challengeProgress.find(cp => cp.challengeId === challengeId);
    if (!progress || progress.isCompleted) return null;

    progress.currentValue += increment;
    progress.progress = Math.min((progress.currentValue / progress.targetValue) * 100, 100);

    // Check completion
    if (progress.currentValue >= progress.targetValue && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();

      // Award points with difficulty multiplier
      const multiplier = DIFFICULTY_LABELS[challenge.difficulty].multiplier;
      const pointsReward = Math.round(challenge.pointsReward * multiplier);

      this.awardPoints(
        employeeId,
        pointsReward,
        'challenge',
        `Completed challenge: ${challenge.name}`,
        `أكمل التحدي: ${challenge.nameAr}`,
        challengeId
      );

      // Award badge if specified
      if (challenge.badgeReward) {
        this.awardBadge(employeeId, challenge.badgeReward);
      }

      this.recordAchievement(employeeId, 'challenge_complete', `Completed ${challenge.name}`, `أكمل ${challenge.nameAr}`);
    }

    return progress;
  }

  /**
   * Record achievement
   */
  private recordAchievement(
    employeeId: string,
    type: AchievementType,
    description: string,
    descriptionAr: string
  ): void {
    const profile = this.profiles.get(employeeId);
    if (!profile) return;

    const achievement: Achievement = {
      id: this.generateId(),
      name: description,
      nameAr: descriptionAr,
      description,
      descriptionAr,
      type,
      icon: this.getAchievementIcon(type),
      pointsAwarded: 25,
      earnedAt: new Date(),
    };

    profile.achievements.push(achievement);
  }

  /**
   * Get achievement icon
   */
  private getAchievementIcon(type: AchievementType): string {
    const icons: Record<AchievementType, string> = {
      first_recognition: '🎉',
      first_badge: '🏅',
      level_up: '⬆️',
      challenge_complete: '🏆',
      streak_milestone: '🔥',
      top_performer: '⭐',
      perfect_attendance: '📅',
      learning_champion: '🎓',
    };
    return icons[type] || '✨';
  }

  /**
   * Create a reward
   */
  createReward(reward: Omit<Reward, 'id'>): Reward {
    const newReward: Reward = {
      ...reward,
      id: this.generateId(),
    };
    this.rewards.set(newReward.id, newReward);
    return newReward;
  }

  /**
   * Get available rewards
   */
  getRewards(category?: RewardCategory): Reward[] {
    let rewards = Array.from(this.rewards.values())
      .filter(r => r.isActive && (!r.stock || r.stock > 0));

    if (category) {
      rewards = rewards.filter(r => r.category === category);
    }

    return rewards.sort((a, b) => a.pointsCost - b.pointsCost);
  }

  /**
   * Redeem a reward
   */
  redeemReward(employeeId: string, rewardId: string): RewardRedemption | null {
    const profile = this.profiles.get(employeeId);
    const reward = this.rewards.get(rewardId);

    if (!profile || !reward || !reward.isActive) return null;
    if (profile.availablePoints < reward.pointsCost) return null;
    if (reward.stock !== undefined && reward.stock <= 0) return null;

    // Spend points
    this.spendPoints(
      employeeId,
      reward.pointsCost,
      `Redeemed: ${reward.name}`,
      `استبدال: ${reward.nameAr}`
    );

    // Decrease stock
    if (reward.stock !== undefined) {
      reward.stock--;
    }

    const redemption: RewardRedemption = {
      id: this.generateId(),
      employeeId,
      rewardId,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      status: 'pending',
      redeemedAt: new Date(),
    };

    const employeeRedemptions = this.redemptions.get(employeeId) || [];
    employeeRedemptions.push(redemption);
    this.redemptions.set(employeeId, employeeRedemptions);

    return redemption;
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(config: LeaderboardConfig): LeaderboardEntry[] {
    const profiles = Array.from(this.profiles.values());

    // Filter by scope
    if (config.scope === 'department') {
      // Would filter by current user's department
    }

    // Sort by metric
    profiles.sort((a, b) => {
      switch (config.type) {
        case 'points':
          return b.totalPoints - a.totalPoints;
        case 'badges':
          return b.badges.length - a.badges.length;
        case 'level':
          return b.level.id - a.level.id;
        case 'challenges':
          return b.challengeProgress.filter(c => c.isCompleted).length -
                 a.challengeProgress.filter(c => c.isCompleted).length;
        default:
          return 0;
      }
    });

    return profiles.slice(0, config.limit).map((profile, index) => ({
      rank: index + 1,
      employeeId: profile.employeeId,
      employeeName: profile.employeeName,
      employeeAvatar: profile.employeeAvatar,
      department: profile.department,
      value: config.type === 'points' ? profile.totalPoints :
             config.type === 'badges' ? profile.badges.length :
             config.type === 'level' ? profile.level.id :
             profile.challengeProgress.filter(c => c.isCompleted).length,
      change: 0,
      level: profile.level,
      topBadges: profile.badges.slice(0, 3).map(eb => eb.badge),
    }));
  }

  /**
   * Get points history
   */
  getPointsHistory(employeeId: string, limit: number = 50): PointsTransaction[] {
    const transactions = this.transactions.get(employeeId) || [];
    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get badge tier color
   */
  getBadgeTierColor(tier: BadgeTier): string {
    return BADGE_TIER_COLORS[tier];
  }

  /**
   * Get difficulty label
   */
  getDifficultyLabel(difficulty: ChallengeDifficulty, language: 'en' | 'ar' = 'en'): string {
    return DIFFICULTY_LABELS[difficulty][language];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();

// Export types
export type { GamificationService };
