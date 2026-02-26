/**
 * @module gamificationService
 * @description Gamification Service — points, levels, badges, leaderboard,
 *              streaks, quests for learning engagement (Sec 21.5)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type BadgeCategory =
  | 'learning'
  | 'collaboration'
  | 'leadership'
  | 'achievement'
  | 'milestone';
export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'expired';
export type StreakType = 'daily_login' | 'weekly_learning' | 'course_completion' | 'quiz_streak';

export interface PlayerProfile {
  employeeId: string;
  name: string;
  title: string;
  department: string;
  avatarInitials: string;
  level: number;
  levelTitle: string;
  totalXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  rank: number;
  totalRank: number;
  badgeCount: number;
  courseCompleted: number;
  streakDays: number;
}

export interface PointTransaction {
  id: string;
  employeeId: string;
  points: number;
  reason: string;
  category: BadgeCategory | 'xp';
  date: string;
  relatedItem?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockCriteria: string;
  earnedDate?: string;
  isEarned: boolean;
  earnedByPercent: number; // what % of employees have earned it
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  employeeId: string;
  name: string;
  department: string;
  avatarInitials: string;
  level: number;
  totalXP: number;
  badgeCount: number;
  courseCompleted: number;
  isCurrentUser: boolean;
}

export interface LevelDefinition {
  level: number;
  title: string;
  xpRequired: number;
  xpMax: number;
  color: string;
  perks: string[];
}

export interface Streak {
  type: StreakType;
  label: string;
  emoji: string;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  lastActivity: string;
  nextMilestone: number;
  xpPerDay: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: QuestStatus;
  progress: number;
  target: number;
  unit: string;
  xpReward: number;
  badgeReward?: string;
  expiresAt?: string;
  category: BadgeCategory;
  tasks: Array<{ label: string; done: boolean }>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_LEVELS: LevelDefinition[] = [
  {
    level: 1,
    title: 'Newcomer',
    xpRequired: 0,
    xpMax: 500,
    color: '#9ca3af',
    perks: ['Access to basic courses'],
  },
  {
    level: 2,
    title: 'Learner',
    xpRequired: 500,
    xpMax: 1500,
    color: '#3b82f6',
    perks: ['Peer mentoring access'],
  },
  {
    level: 3,
    title: 'Explorer',
    xpRequired: 1500,
    xpMax: 3000,
    color: '#10b981',
    perks: ['Gig opportunity access'],
  },
  {
    level: 4,
    title: 'Contributor',
    xpRequired: 3000,
    xpMax: 5500,
    color: '#f59e0b',
    perks: ['Course creation access', 'Learning stipend +$200'],
  },
  {
    level: 5,
    title: 'Expert',
    xpRequired: 5500,
    xpMax: 9000,
    color: '#8b5cf6',
    perks: ['Conference access', 'Mentee allocation'],
  },
  {
    level: 6,
    title: 'Champion',
    xpRequired: 9000,
    xpMax: 14000,
    color: '#ef4444',
    perks: ['Speaking opportunities', 'Learning stipend +$500'],
  },
  {
    level: 7,
    title: 'Mentor',
    xpRequired: 14000,
    xpMax: 20000,
    color: '#f97316',
    perks: ['Program design access', 'Mentor bonus'],
  },
  {
    level: 8,
    title: 'Guru',
    xpRequired: 20000,
    xpMax: 28000,
    color: '#ec4899',
    perks: ['External training budget', 'VIP events'],
  },
  {
    level: 9,
    title: 'Legend',
    xpRequired: 28000,
    xpMax: 40000,
    color: '#06b6d4',
    perks: ['Custom learning plan', 'Executive mentoring'],
  },
  {
    level: 10,
    title: 'Visionary',
    xpRequired: 40000,
    xpMax: 999999,
    color: '#eab308',
    perks: ['All perks', 'Annual recognition award'],
  },
];

const MOCK_PLAYER: PlayerProfile = {
  employeeId: 'emp-current',
  name: 'Sarah Chen',
  title: 'Senior Software Engineer',
  department: 'Engineering',
  avatarInitials: 'SC',
  level: 5,
  levelTitle: 'Expert',
  totalXP: 7240,
  xpForCurrentLevel: 5500,
  xpForNextLevel: 9000,
  rank: 12,
  totalRank: 287,
  badgeCount: 9,
  courseCompleted: 14,
  streakDays: 23,
};

const ALL_BADGES: Badge[] = [
  {
    id: 'badge-001',
    name: 'First Steps',
    description: 'Complete your first course',
    emoji: '👣',
    category: 'learning',
    rarity: 'common',
    xpReward: 100,
    unlockCriteria: 'Complete 1 course',
    earnedDate: '2025-09-01',
    isEarned: true,
    earnedByPercent: 92,
  },
  {
    id: 'badge-002',
    name: 'Knowledge Seeker',
    description: 'Complete 5 courses',
    emoji: '📚',
    category: 'learning',
    rarity: 'common',
    xpReward: 250,
    unlockCriteria: 'Complete 5 courses',
    earnedDate: '2025-10-15',
    isEarned: true,
    earnedByPercent: 68,
  },
  {
    id: 'badge-003',
    name: 'Quiz Master',
    description: 'Score 100% on 3 quizzes',
    emoji: '🎯',
    category: 'achievement',
    rarity: 'uncommon',
    xpReward: 500,
    unlockCriteria: 'Perfect score on 3 quizzes',
    earnedDate: '2025-11-01',
    isEarned: true,
    earnedByPercent: 28,
  },
  {
    id: 'badge-004',
    name: 'Streak Champion',
    description: 'Maintain a 7-day learning streak',
    emoji: '🔥',
    category: 'milestone',
    rarity: 'uncommon',
    xpReward: 300,
    unlockCriteria: '7-day streak',
    earnedDate: '2025-09-15',
    isEarned: true,
    earnedByPercent: 45,
  },
  {
    id: 'badge-005',
    name: 'Mentor',
    description: 'Help 3 colleagues complete a course',
    emoji: '🤝',
    category: 'collaboration',
    rarity: 'rare',
    xpReward: 750,
    unlockCriteria: 'Help 3 colleagues',
    earnedDate: '2025-12-01',
    isEarned: true,
    earnedByPercent: 15,
  },
  {
    id: 'badge-006',
    name: 'Certified Pro',
    description: 'Earn your first professional certification',
    emoji: '🏆',
    category: 'achievement',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Earn 1 certification',
    earnedDate: '2026-01-10',
    isEarned: true,
    earnedByPercent: 22,
  },
  {
    id: 'badge-007',
    name: 'Deep Diver',
    description: 'Complete a course over 50 hours',
    emoji: '🤿',
    category: 'learning',
    rarity: 'uncommon',
    xpReward: 400,
    unlockCriteria: 'Complete 50h+ course',
    earnedDate: '2026-01-20',
    isEarned: true,
    earnedByPercent: 18,
  },
  {
    id: 'badge-008',
    name: '30-Day Streak',
    description: 'Maintain a 30-day learning streak',
    emoji: '⚡',
    category: 'milestone',
    rarity: 'epic',
    xpReward: 1500,
    unlockCriteria: '30-day streak',
    isEarned: false,
    earnedByPercent: 8,
  },
  {
    id: 'badge-009',
    name: 'Course Creator',
    description: 'Build and publish an internal course',
    emoji: '✍️',
    category: 'leadership',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Publish 1 course',
    isEarned: false,
    earnedByPercent: 5,
  },
  {
    id: 'badge-010',
    name: 'Polyglot Learner',
    description: 'Complete courses in 3 different topics',
    emoji: '🌐',
    category: 'learning',
    rarity: 'uncommon',
    xpReward: 500,
    unlockCriteria: 'Complete courses in 3 topics',
    earnedDate: '2025-12-20',
    isEarned: true,
    earnedByPercent: 32,
  },
  {
    id: 'badge-011',
    name: 'Speed Learner',
    description: 'Complete 3 courses in one month',
    emoji: '⚡',
    category: 'learning',
    rarity: 'uncommon',
    xpReward: 400,
    unlockCriteria: '3 courses in 30 days',
    isEarned: false,
    earnedByPercent: 20,
  },
  {
    id: 'badge-012',
    name: 'Team Player',
    description: 'Participate in 5 group learning sessions',
    emoji: '👥',
    category: 'collaboration',
    rarity: 'common',
    xpReward: 200,
    unlockCriteria: '5 group sessions',
    isEarned: false,
    earnedByPercent: 40,
  },
  {
    id: 'badge-013',
    name: 'Legend',
    description: 'Reach Level 10',
    emoji: '👑',
    category: 'milestone',
    rarity: 'legendary',
    xpReward: 5000,
    unlockCriteria: 'Reach Level 10',
    isEarned: false,
    earnedByPercent: 0.5,
  },
  {
    id: 'badge-014',
    name: '100 Hours',
    description: 'Spend 100 hours learning on the platform',
    emoji: '💯',
    category: 'milestone',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: '100 learning hours',
    isEarned: false,
    earnedByPercent: 10,
  },
  {
    id: 'badge-015',
    name: 'Innovation Leader',
    description: 'Apply a learning to solve a real business problem',
    emoji: '💡',
    category: 'leadership',
    rarity: 'epic',
    xpReward: 2000,
    unlockCriteria: 'Submit learning impact story',
    isEarned: false,
    earnedByPercent: 3,
  },
];

const MOCK_POINT_HISTORY: PointTransaction[] = [
  {
    id: 'tx-001',
    employeeId: 'emp-current',
    points: 500,
    reason: 'Completed Machine Learning Specialization (Coursera)',
    category: 'learning',
    date: '2026-01-15',
    relatedItem: 'ec-001',
  },
  {
    id: 'tx-002',
    employeeId: 'emp-current',
    points: 250,
    reason: 'Perfect quiz score in Python Fundamentals',
    category: 'achievement',
    date: '2026-01-12',
    relatedItem: 'quiz-003',
  },
  {
    id: 'tx-003',
    employeeId: 'emp-current',
    points: 100,
    reason: '7-day learning streak bonus',
    category: 'milestone',
    date: '2026-01-10',
  },
  {
    id: 'tx-004',
    employeeId: 'emp-current',
    points: 300,
    reason: 'Helped colleague complete React course',
    category: 'collaboration',
    date: '2026-01-08',
  },
  {
    id: 'tx-005',
    employeeId: 'emp-current',
    points: 200,
    reason: 'Completed React — The Complete Guide',
    category: 'learning',
    date: '2025-12-28',
  },
  {
    id: 'tx-006',
    employeeId: 'emp-current',
    points: 1000,
    reason: 'AWS Solutions Architect certification earned',
    category: 'achievement',
    date: '2025-12-20',
  },
  {
    id: 'tx-007',
    employeeId: 'emp-current',
    points: 150,
    reason: 'Daily login streak (14 days)',
    category: 'milestone',
    date: '2025-12-18',
  },
  {
    id: 'tx-008',
    employeeId: 'emp-current',
    points: 400,
    reason: 'Completed Docker and Kubernetes course',
    category: 'learning',
    date: '2025-12-10',
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    previousRank: 1,
    employeeId: 'emp-201',
    name: 'Carlos Mendez',
    department: 'Data',
    avatarInitials: 'CM',
    level: 8,
    totalXP: 24500,
    badgeCount: 18,
    courseCompleted: 42,
    isCurrentUser: false,
  },
  {
    rank: 2,
    previousRank: 3,
    employeeId: 'emp-202',
    name: 'Priya Patel',
    department: 'Engineering',
    avatarInitials: 'PP',
    level: 7,
    totalXP: 18200,
    badgeCount: 14,
    courseCompleted: 31,
    isCurrentUser: false,
  },
  {
    rank: 3,
    previousRank: 2,
    employeeId: 'emp-203',
    name: 'David Kim',
    department: 'Product',
    avatarInitials: 'DK',
    level: 7,
    totalXP: 16800,
    badgeCount: 13,
    courseCompleted: 28,
    isCurrentUser: false,
  },
  {
    rank: 4,
    previousRank: 5,
    employeeId: 'emp-204',
    name: 'Lisa Wang',
    department: 'Marketing',
    avatarInitials: 'LW',
    level: 6,
    totalXP: 14200,
    badgeCount: 11,
    courseCompleted: 24,
    isCurrentUser: false,
  },
  {
    rank: 5,
    previousRank: 4,
    employeeId: 'emp-205',
    name: 'Aisha Johnson',
    department: 'Finance',
    avatarInitials: 'AJ',
    level: 6,
    totalXP: 13800,
    badgeCount: 10,
    courseCompleted: 22,
    isCurrentUser: false,
  },
  {
    rank: 6,
    previousRank: 6,
    employeeId: 'emp-206',
    name: 'James Liu',
    department: 'Product',
    avatarInitials: 'JL',
    level: 6,
    totalXP: 12400,
    badgeCount: 9,
    courseCompleted: 20,
    isCurrentUser: false,
  },
  {
    rank: 7,
    previousRank: 8,
    employeeId: 'emp-207',
    name: 'Nina Okonkwo',
    department: 'Sales',
    avatarInitials: 'NO',
    level: 6,
    totalXP: 11900,
    badgeCount: 8,
    courseCompleted: 19,
    isCurrentUser: false,
  },
  {
    rank: 8,
    previousRank: 7,
    employeeId: 'emp-208',
    name: 'Tom Baker',
    department: 'Engineering',
    avatarInitials: 'TB',
    level: 5,
    totalXP: 10500,
    badgeCount: 8,
    courseCompleted: 17,
    isCurrentUser: false,
  },
  {
    rank: 9,
    previousRank: 10,
    employeeId: 'emp-209',
    name: 'Maria Gonzalez',
    department: 'HR',
    avatarInitials: 'MG',
    level: 5,
    totalXP: 9800,
    badgeCount: 7,
    courseCompleted: 16,
    isCurrentUser: false,
  },
  {
    rank: 10,
    previousRank: 9,
    employeeId: 'emp-210',
    name: 'Jake Wilson',
    department: 'Operations',
    avatarInitials: 'JW',
    level: 5,
    totalXP: 9200,
    badgeCount: 7,
    courseCompleted: 15,
    isCurrentUser: false,
  },
  {
    rank: 11,
    previousRank: 12,
    employeeId: 'emp-211',
    name: 'Emily Park',
    department: 'HR',
    avatarInitials: 'EP',
    level: 5,
    totalXP: 8100,
    badgeCount: 6,
    courseCompleted: 14,
    isCurrentUser: false,
  },
  {
    rank: 12,
    previousRank: 14,
    employeeId: 'emp-current',
    name: 'Sarah Chen',
    department: 'Engineering',
    avatarInitials: 'SC',
    level: 5,
    totalXP: 7240,
    badgeCount: 9,
    courseCompleted: 14,
    isCurrentUser: true,
  },
];

const MOCK_STREAKS: Streak[] = [
  {
    type: 'daily_login',
    label: 'Daily Login',
    emoji: '🔥',
    currentStreak: 23,
    longestStreak: 31,
    isActive: true,
    lastActivity: '2026-02-24',
    nextMilestone: 30,
    xpPerDay: 10,
  },
  {
    type: 'weekly_learning',
    label: 'Weekly Learning',
    emoji: '📖',
    currentStreak: 8,
    longestStreak: 12,
    isActive: true,
    lastActivity: '2026-02-24',
    nextMilestone: 10,
    xpPerDay: 50,
  },
  {
    type: 'course_completion',
    label: 'Course Completion',
    emoji: '🎓',
    currentStreak: 3,
    longestStreak: 5,
    isActive: true,
    lastActivity: '2026-01-20',
    nextMilestone: 5,
    xpPerDay: 200,
  },
  {
    type: 'quiz_streak',
    label: 'Quiz Perfect Scores',
    emoji: '💯',
    currentStreak: 2,
    longestStreak: 4,
    isActive: false,
    lastActivity: '2026-01-12',
    nextMilestone: 3,
    xpPerDay: 100,
  },
];

const MOCK_QUESTS: Quest[] = [
  {
    id: 'quest-001',
    title: 'Data Science Bootcamp',
    description: 'Complete 3 data science courses and pass all quizzes with at least 80%.',
    emoji: '🔬',
    status: 'in_progress',
    progress: 2,
    target: 3,
    unit: 'courses',
    xpReward: 1500,
    badgeReward: 'badge-011',
    expiresAt: '2026-03-31',
    category: 'learning',
    tasks: [
      { label: 'Complete Machine Learning Specialization', done: true },
      { label: 'Complete Python for Data Science', done: true },
      { label: 'Complete Statistics Fundamentals', done: false },
    ],
  },
  {
    id: 'quest-002',
    title: 'Leadership Foundations',
    description: 'Complete 2 leadership courses and participate in 1 mentoring session.',
    emoji: '👑',
    status: 'available',
    progress: 0,
    target: 3,
    unit: 'activities',
    xpReward: 1200,
    expiresAt: '2026-04-30',
    category: 'leadership',
    tasks: [
      { label: 'Complete "Transitioning to People Manager"', done: false },
      { label: 'Complete "Communication Foundations"', done: false },
      { label: 'Participate in 1 mentoring session', done: false },
    ],
  },
  {
    id: 'quest-003',
    title: 'Cloud Champion',
    description: 'Complete AWS and GCP courses to build multi-cloud expertise.',
    emoji: '☁️',
    status: 'available',
    progress: 1,
    target: 2,
    unit: 'certifications',
    xpReward: 2000,
    badgeReward: 'badge-006',
    expiresAt: '2026-06-30',
    category: 'achievement',
    tasks: [
      { label: 'Complete AWS Solutions Architect course', done: true },
      { label: 'Complete Google Cloud Professional exam', done: false },
    ],
  },
  {
    id: 'quest-004',
    title: '30-Day Streak Master',
    description: 'Log into the learning platform every day for 30 consecutive days.',
    emoji: '🔥',
    status: 'in_progress',
    progress: 23,
    target: 30,
    unit: 'days',
    xpReward: 1500,
    badgeReward: 'badge-008',
    category: 'milestone',
    tasks: [{ label: 'Log in every day for 30 days', done: false }],
  },
  {
    id: 'quest-005',
    title: 'Knowledge Sharer',
    description: 'Help 3 colleagues by sharing course recommendations and study tips.',
    emoji: '🤝',
    status: 'available',
    progress: 0,
    target: 3,
    unit: 'colleagues helped',
    xpReward: 800,
    category: 'collaboration',
    tasks: [
      { label: 'Share a course recommendation', done: false },
      { label: "Review a colleague's learning plan", done: false },
      { label: 'Lead a peer learning session', done: false },
    ],
  },
];

const WEEKLY_XP = [120, 340, 280, 450, 390, 520, 680];

// ============================================================================
// SERVICE
// ============================================================================

export class GamificationService {
  /** Get player profile and XP data */
  static async getPoints(employeeId: string): Promise<PlayerProfile> {
    await new Promise((r) => setTimeout(r, 300));
    return { ...MOCK_PLAYER, employeeId };
  }

  /** Get point transaction history */
  static async getPointsHistory(_employeeId: string): Promise<PointTransaction[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_POINT_HISTORY];
  }

  /** Get badges earned by employee */
  static async getBadges(_employeeId: string): Promise<Badge[]> {
    await new Promise((r) => setTimeout(r, 300));
    return ALL_BADGES.filter((b) => b.isEarned);
  }

  /** Get all available badges */
  static async getAvailableBadges(): Promise<Badge[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...ALL_BADGES];
  }

  /** Get leaderboard for period */
  static async getLeaderboard(
    _period: 'week' | 'month' | 'quarter' | 'all_time',
    _scope?: string
  ): Promise<LeaderboardEntry[]> {
    await new Promise((r) => setTimeout(r, 350));
    return [...MOCK_LEADERBOARD];
  }

  /** Get level definitions */
  static async getLevelDefinitions(): Promise<LevelDefinition[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_LEVELS];
  }

  /** Get active streaks for employee */
  static async getStreaks(_employeeId: string): Promise<Streak[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_STREAKS];
  }

  /** Get available quests */
  static async getQuests(): Promise<Quest[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_QUESTS];
  }

  /** Complete a quest */
  static async completeQuest(questId: string): Promise<{ xpEarned: number; badgeEarned?: Badge }> {
    await new Promise((r) => setTimeout(r, 400));
    const quest = MOCK_QUESTS.find((q) => q.id === questId);
    const badge = quest?.badgeReward
      ? ALL_BADGES.find((b) => b.id === quest.badgeReward)
      : undefined;
    return { xpEarned: quest?.xpReward ?? 0, badgeEarned: badge };
  }

  /** Get weekly XP chart data */
  static async getWeeklyXP(_employeeId: string): Promise<number[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...WEEKLY_XP];
  }
}
