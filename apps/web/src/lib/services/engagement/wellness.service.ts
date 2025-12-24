/**
 * Wellness Service
 * Employee wellness programs, health challenges, mental health support
 *
 * Features:
 * - Wellness programs and initiatives
 * - Health challenges and goals
 * - Activity tracking
 * - Mental health resources
 * - Wellness assessments
 * - Health metrics dashboard
 * - Rewards integration
 */

// ============================================================================
// TYPES
// ============================================================================

export interface WellnessProgram {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: WellnessCategory;
  type: ProgramType;
  duration: ProgramDuration;
  startDate: Date;
  endDate?: Date;
  pointsReward: number;
  maxParticipants?: number;
  currentParticipants: number;
  activities: WellnessActivity[];
  resources: WellnessResource[];
  isActive: boolean;
  createdAt: Date;
}

export type WellnessCategory =
  | 'physical_fitness'
  | 'mental_health'
  | 'nutrition'
  | 'sleep'
  | 'stress_management'
  | 'work_life_balance'
  | 'financial_wellness'
  | 'social_wellness';

export type ProgramType =
  | 'challenge'
  | 'workshop'
  | 'coaching'
  | 'self_paced'
  | 'group_activity';

export type ProgramDuration =
  | 'one_time'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'ongoing';

export interface WellnessActivity {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: WellnessCategory;
  type: ActivityType;
  points: number;
  duration: number; // minutes
  frequency: ActivityFrequency;
  trackingMethod: TrackingMethod;
  icon: string;
  isActive: boolean;
}

export type ActivityType =
  | 'exercise'
  | 'meditation'
  | 'healthy_eating'
  | 'hydration'
  | 'sleep_tracking'
  | 'step_count'
  | 'stretch_break'
  | 'mindfulness'
  | 'social_connection'
  | 'learning'
  | 'gratitude'
  | 'outdoor_time';

export type ActivityFrequency =
  | 'daily'
  | 'weekly'
  | 'as_needed';

export type TrackingMethod =
  | 'self_report'
  | 'device_sync'
  | 'photo_proof'
  | 'check_in';

export interface WellnessResource {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: ResourceType;
  category: WellnessCategory;
  url?: string;
  content?: string;
  duration?: number; // minutes
  author?: string;
  isExternal: boolean;
  createdAt: Date;
}

export type ResourceType =
  | 'article'
  | 'video'
  | 'podcast'
  | 'guide'
  | 'app'
  | 'webinar'
  | 'ebook';

export interface WellnessChallenge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: WellnessCategory;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  goal: ChallengeGoal;
  startDate: Date;
  endDate: Date;
  pointsReward: number;
  badgeId?: string;
  isTeamChallenge: boolean;
  teamSize?: number;
  participants: ChallengeParticipant[];
  leaderboard: ChallengeLeaderboardEntry[];
  status: ChallengeStatus;
  createdAt: Date;
}

export type ChallengeType =
  | 'individual'
  | 'team'
  | 'department'
  | 'company';

export type ChallengeDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export type ChallengeStatus =
  | 'upcoming'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface ChallengeGoal {
  metric: string;
  target: number;
  unit: string;
  description: string;
  descriptionAr: string;
}

export interface ChallengeParticipant {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  teamId?: string;
  teamName?: string;
  progress: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  joinedAt: Date;
}

export interface ChallengeLeaderboardEntry {
  rank: number;
  participantId: string;
  participantName: string;
  value: number;
  progress: number;
  isCompleted: boolean;
}

export interface EmployeeWellnessProfile {
  employeeId: string;
  employeeName: string;
  department: string;
  wellnessScore: number;
  categoryScores: CategoryScore[];
  activeChallenges: string[];
  completedChallenges: number;
  totalPoints: number;
  streaks: WellnessStreak[];
  activityLog: ActivityLogEntry[];
  assessments: WellnessAssessment[];
  goals: WellnessGoal[];
  createdAt: Date;
  lastActivityAt: Date;
}

export interface CategoryScore {
  category: WellnessCategory;
  score: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export interface WellnessStreak {
  activityType: ActivityType;
  currentDays: number;
  longestDays: number;
  lastActivityDate: Date;
}

export interface ActivityLogEntry {
  id: string;
  activityId: string;
  activityName: string;
  category: WellnessCategory;
  points: number;
  duration?: number;
  value?: number;
  unit?: string;
  notes?: string;
  loggedAt: Date;
}

export interface WellnessAssessment {
  id: string;
  type: AssessmentType;
  score: number;
  maxScore: number;
  percentile?: number;
  responses: AssessmentResponse[];
  recommendations: string[];
  recommendationsAr: string[];
  completedAt: Date;
  nextDueDate?: Date;
}

export type AssessmentType =
  | 'overall_wellness'
  | 'stress_level'
  | 'work_life_balance'
  | 'mental_health'
  | 'physical_health'
  | 'burnout_risk';

export interface AssessmentResponse {
  questionId: string;
  question: string;
  answer: string | number;
}

export interface WellnessGoal {
  id: string;
  category: WellnessCategory;
  description: string;
  descriptionAr: string;
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  status: GoalStatus;
  milestones: GoalMilestone[];
}

export type GoalStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'missed';

export interface GoalMilestone {
  percentage: number;
  reached: boolean;
  reachedAt?: Date;
  reward?: number;
}

export interface WellnessInsight {
  type: InsightType;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: WellnessCategory;
  createdAt: Date;
}

export type InsightType =
  | 'achievement'
  | 'recommendation'
  | 'reminder'
  | 'alert'
  | 'milestone';

export interface WellnessStats {
  totalParticipants: number;
  activeParticipants: number;
  participationRate: number;
  averageWellnessScore: number;
  topCategories: { category: WellnessCategory; score: number }[];
  challengeCompletionRate: number;
  totalPointsAwarded: number;
  monthlyTrend: { month: string; score: number }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_LABELS: Record<WellnessCategory, { en: string; ar: string; icon: string; color: string }> = {
  physical_fitness: { en: 'Physical Fitness', ar: 'اللياقة البدنية', icon: '🏃', color: '#EF4444' },
  mental_health: { en: 'Mental Health', ar: 'الصحة النفسية', icon: '🧠', color: '#8B5CF6' },
  nutrition: { en: 'Nutrition', ar: 'التغذية', icon: '🥗', color: '#22C55E' },
  sleep: { en: 'Sleep', ar: 'النوم', icon: '😴', color: '#3B82F6' },
  stress_management: { en: 'Stress Management', ar: 'إدارة الإجهاد', icon: '🧘', color: '#EC4899' },
  work_life_balance: { en: 'Work-Life Balance', ar: 'التوازن بين العمل والحياة', icon: '⚖️', color: '#F59E0B' },
  financial_wellness: { en: 'Financial Wellness', ar: 'الصحة المالية', icon: '💰', color: '#10B981' },
  social_wellness: { en: 'Social Wellness', ar: 'الصحة الاجتماعية', icon: '👥', color: '#6366F1' },
};

const DEFAULT_ACTIVITIES: WellnessActivity[] = [
  {
    id: 'steps',
    name: '10,000 Steps',
    nameAr: '10,000 خطوة',
    description: 'Walk 10,000 steps today',
    descriptionAr: 'امشِ 10,000 خطوة اليوم',
    category: 'physical_fitness',
    type: 'step_count',
    points: 20,
    duration: 0,
    frequency: 'daily',
    trackingMethod: 'device_sync',
    icon: '👟',
    isActive: true,
  },
  {
    id: 'meditation',
    name: '10-Minute Meditation',
    nameAr: 'تأمل 10 دقائق',
    description: 'Complete a 10-minute meditation session',
    descriptionAr: 'أكمل جلسة تأمل لمدة 10 دقائق',
    category: 'mental_health',
    type: 'meditation',
    points: 15,
    duration: 10,
    frequency: 'daily',
    trackingMethod: 'self_report',
    icon: '🧘',
    isActive: true,
  },
  {
    id: 'hydration',
    name: 'Stay Hydrated',
    nameAr: 'حافظ على رطوبتك',
    description: 'Drink 8 glasses of water',
    descriptionAr: 'اشرب 8 أكواب من الماء',
    category: 'nutrition',
    type: 'hydration',
    points: 10,
    duration: 0,
    frequency: 'daily',
    trackingMethod: 'self_report',
    icon: '💧',
    isActive: true,
  },
  {
    id: 'sleep',
    name: '7+ Hours Sleep',
    nameAr: '7+ ساعات نوم',
    description: 'Get at least 7 hours of sleep',
    descriptionAr: 'احصل على 7 ساعات نوم على الأقل',
    category: 'sleep',
    type: 'sleep_tracking',
    points: 20,
    duration: 0,
    frequency: 'daily',
    trackingMethod: 'device_sync',
    icon: '😴',
    isActive: true,
  },
  {
    id: 'stretch',
    name: 'Stretch Break',
    nameAr: 'استراحة تمدد',
    description: 'Take a 5-minute stretch break',
    descriptionAr: 'خذ استراحة تمدد لمدة 5 دقائق',
    category: 'physical_fitness',
    type: 'stretch_break',
    points: 5,
    duration: 5,
    frequency: 'as_needed',
    trackingMethod: 'self_report',
    icon: '🙆',
    isActive: true,
  },
  {
    id: 'gratitude',
    name: 'Gratitude Journal',
    nameAr: 'يوميات الامتنان',
    description: 'Write 3 things you are grateful for',
    descriptionAr: 'اكتب 3 أشياء تشكرها',
    category: 'mental_health',
    type: 'gratitude',
    points: 10,
    duration: 5,
    frequency: 'daily',
    trackingMethod: 'self_report',
    icon: '📝',
    isActive: true,
  },
  {
    id: 'workout',
    name: '30-Minute Workout',
    nameAr: 'تمرين 30 دقيقة',
    description: 'Complete a 30-minute workout session',
    descriptionAr: 'أكمل جلسة تمرين لمدة 30 دقيقة',
    category: 'physical_fitness',
    type: 'exercise',
    points: 30,
    duration: 30,
    frequency: 'daily',
    trackingMethod: 'self_report',
    icon: '💪',
    isActive: true,
  },
  {
    id: 'outdoor',
    name: 'Outdoor Time',
    nameAr: 'وقت في الهواء الطلق',
    description: 'Spend 20 minutes outdoors',
    descriptionAr: 'اقضِ 20 دقيقة في الهواء الطلق',
    category: 'mental_health',
    type: 'outdoor_time',
    points: 15,
    duration: 20,
    frequency: 'daily',
    trackingMethod: 'self_report',
    icon: '🌳',
    isActive: true,
  },
];

const ASSESSMENT_QUESTIONS: Record<AssessmentType, { question: string; questionAr: string }[]> = {
  stress_level: [
    { question: 'How often do you feel overwhelmed at work?', questionAr: 'كم مرة تشعر بالإرهاق في العمل؟' },
    { question: 'How well do you sleep at night?', questionAr: 'ما مدى جودة نومك في الليل؟' },
    { question: 'How often do you take breaks during work?', questionAr: 'كم مرة تأخذ استراحات أثناء العمل؟' },
    { question: 'How satisfied are you with your work-life balance?', questionAr: 'ما مدى رضاك عن التوازن بين العمل والحياة؟' },
    { question: 'How often do you exercise?', questionAr: 'كم مرة تمارس الرياضة؟' },
  ],
  burnout_risk: [
    { question: 'Do you feel exhausted at the end of the workday?', questionAr: 'هل تشعر بالإرهاق في نهاية يوم العمل؟' },
    { question: 'Do you find it hard to concentrate on tasks?', questionAr: 'هل تجد صعوبة في التركيز على المهام؟' },
    { question: 'Do you feel disconnected from your work?', questionAr: 'هل تشعر بالانفصال عن عملك؟' },
    { question: 'Do you have trouble sleeping due to work stress?', questionAr: 'هل تعاني من صعوبة في النوم بسبب ضغط العمل؟' },
    { question: 'Do you feel supported by your manager?', questionAr: 'هل تشعر بدعم مديرك؟' },
  ],
  overall_wellness: [
    { question: 'How would you rate your overall health?', questionAr: 'كيف تقيم صحتك العامة؟' },
    { question: 'How satisfied are you with your energy levels?', questionAr: 'ما مدى رضاك عن مستويات طاقتك؟' },
    { question: 'How often do you feel happy and positive?', questionAr: 'كم مرة تشعر بالسعادة والإيجابية؟' },
    { question: 'How connected do you feel to your colleagues?', questionAr: 'ما مدى ارتباطك بزملائك؟' },
    { question: 'How confident are you about your financial future?', questionAr: 'ما مدى ثقتك بمستقبلك المالي؟' },
  ],
  mental_health: [
    { question: 'How often do you feel anxious?', questionAr: 'كم مرة تشعر بالقلق؟' },
    { question: 'How often do you feel sad or down?', questionAr: 'كم مرة تشعر بالحزن أو الإحباط؟' },
    { question: 'How well can you manage your emotions?', questionAr: 'ما مدى قدرتك على إدارة مشاعرك؟' },
    { question: 'Do you have people you can talk to about your feelings?', questionAr: 'هل لديك أشخاص يمكنك التحدث معهم عن مشاعرك؟' },
    { question: 'How satisfied are you with your mental well-being?', questionAr: 'ما مدى رضاك عن صحتك النفسية؟' },
  ],
  physical_health: [
    { question: 'How many days per week do you exercise?', questionAr: 'كم يوماً في الأسبوع تمارس الرياضة؟' },
    { question: 'How would you rate your eating habits?', questionAr: 'كيف تقيم عاداتك الغذائية؟' },
    { question: 'How many hours of sleep do you get on average?', questionAr: 'كم ساعة نوم تحصل عليها في المتوسط؟' },
    { question: 'Do you have any chronic health conditions?', questionAr: 'هل لديك أي حالات صحية مزمنة؟' },
    { question: 'When was your last health checkup?', questionAr: 'متى كان آخر فحص صحي لك؟' },
  ],
  work_life_balance: [
    { question: 'How often do you work beyond regular hours?', questionAr: 'كم مرة تعمل بعد ساعات العمل العادية؟' },
    { question: 'Do you have enough time for family and friends?', questionAr: 'هل لديك وقت كافٍ للعائلة والأصدقاء؟' },
    { question: 'Can you disconnect from work during off-hours?', questionAr: 'هل يمكنك الانفصال عن العمل خارج ساعات العمل؟' },
    { question: 'Do you have hobbies or activities outside work?', questionAr: 'هل لديك هوايات أو أنشطة خارج العمل؟' },
    { question: 'How often do you take vacation days?', questionAr: 'كم مرة تأخذ أيام إجازة؟' },
  ],
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class WellnessService {
  private programs: Map<string, WellnessProgram> = new Map();
  private challenges: Map<string, WellnessChallenge> = new Map();
  private profiles: Map<string, EmployeeWellnessProfile> = new Map();
  private activities: Map<string, WellnessActivity> = new Map();
  private resources: Map<string, WellnessResource> = new Map();

  constructor() {
    this.initializeDefaultActivities();
  }

  /**
   * Initialize default activities
   */
  private initializeDefaultActivities(): void {
    DEFAULT_ACTIVITIES.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
  }

  /**
   * Get or create wellness profile
   */
  getProfile(employeeId: string, employeeName: string, department: string): EmployeeWellnessProfile {
    let profile = this.profiles.get(employeeId);

    if (!profile) {
      profile = {
        employeeId,
        employeeName,
        department,
        wellnessScore: 50,
        categoryScores: this.initializeCategoryScores(),
        activeChallenges: [],
        completedChallenges: 0,
        totalPoints: 0,
        streaks: [],
        activityLog: [],
        assessments: [],
        goals: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      this.profiles.set(employeeId, profile);
    }

    return profile;
  }

  /**
   * Initialize category scores
   */
  private initializeCategoryScores(): CategoryScore[] {
    return Object.keys(CATEGORY_LABELS).map(cat => ({
      category: cat as WellnessCategory,
      score: 50,
      trend: 'stable' as const,
      lastUpdated: new Date(),
    }));
  }

  /**
   * Create a wellness program
   */
  createProgram(program: Omit<WellnessProgram, 'id' | 'currentParticipants' | 'createdAt'>): WellnessProgram {
    const newProgram: WellnessProgram = {
      ...program,
      id: this.generateId(),
      currentParticipants: 0,
      createdAt: new Date(),
    };
    this.programs.set(newProgram.id, newProgram);
    return newProgram;
  }

  /**
   * Get active programs
   */
  getActivePrograms(category?: WellnessCategory): WellnessProgram[] {
    let programs = Array.from(this.programs.values()).filter(p => p.isActive);

    if (category) {
      programs = programs.filter(p => p.category === category);
    }

    return programs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Log an activity
   */
  logActivity(
    employeeId: string,
    activityId: string,
    value?: number,
    notes?: string
  ): ActivityLogEntry | null {
    const profile = this.profiles.get(employeeId);
    const activity = this.activities.get(activityId);

    if (!profile || !activity) return null;

    const logEntry: ActivityLogEntry = {
      id: this.generateId(),
      activityId,
      activityName: activity.name,
      category: activity.category,
      points: activity.points,
      duration: activity.duration,
      value,
      notes,
      loggedAt: new Date(),
    };

    profile.activityLog.push(logEntry);
    profile.totalPoints += activity.points;
    profile.lastActivityAt = new Date();

    // Update category score
    this.updateCategoryScore(profile, activity.category, 2);

    // Update streaks
    this.updateStreak(profile, activity.type);

    // Update wellness score
    this.recalculateWellnessScore(profile);

    return logEntry;
  }

  /**
   * Update category score
   */
  private updateCategoryScore(
    profile: EmployeeWellnessProfile,
    category: WellnessCategory,
    increment: number
  ): void {
    const categoryScore = profile.categoryScores.find(cs => cs.category === category);
    if (categoryScore) {
      const oldScore = categoryScore.score;
      categoryScore.score = Math.min(100, categoryScore.score + increment);
      categoryScore.trend = categoryScore.score > oldScore ? 'improving' :
                           categoryScore.score < oldScore ? 'declining' : 'stable';
      categoryScore.lastUpdated = new Date();
    }
  }

  /**
   * Update activity streak
   */
  private updateStreak(profile: EmployeeWellnessProfile, activityType: ActivityType): void {
    let streak = profile.streaks.find(s => s.activityType === activityType);

    if (!streak) {
      streak = {
        activityType,
        currentDays: 0,
        longestDays: 0,
        lastActivityDate: new Date(0),
      };
      profile.streaks.push(streak);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = new Date(streak.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Already logged today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      streak.currentDays++;
    } else {
      // Streak broken
      streak.currentDays = 1;
    }

    if (streak.currentDays > streak.longestDays) {
      streak.longestDays = streak.currentDays;
    }

    streak.lastActivityDate = new Date();
  }

  /**
   * Recalculate overall wellness score
   */
  private recalculateWellnessScore(profile: EmployeeWellnessProfile): void {
    const categoryWeights: Record<WellnessCategory, number> = {
      physical_fitness: 0.2,
      mental_health: 0.2,
      nutrition: 0.1,
      sleep: 0.15,
      stress_management: 0.15,
      work_life_balance: 0.1,
      financial_wellness: 0.05,
      social_wellness: 0.05,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    profile.categoryScores.forEach(cs => {
      const weight = categoryWeights[cs.category] || 0.1;
      weightedSum += cs.score * weight;
      totalWeight += weight;
    });

    profile.wellnessScore = Math.round(weightedSum / totalWeight);
  }

  /**
   * Create a wellness challenge
   */
  createChallenge(challenge: Omit<WellnessChallenge, 'id' | 'participants' | 'leaderboard' | 'status' | 'createdAt'>): WellnessChallenge {
    const now = new Date();
    const status: ChallengeStatus = challenge.startDate > now ? 'upcoming' : 'active';

    const newChallenge: WellnessChallenge = {
      ...challenge,
      id: this.generateId(),
      participants: [],
      leaderboard: [],
      status,
      createdAt: new Date(),
    };
    this.challenges.set(newChallenge.id, newChallenge);
    return newChallenge;
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(category?: WellnessCategory): WellnessChallenge[] {
    let challenges = Array.from(this.challenges.values())
      .filter(c => c.status === 'active');

    if (category) {
      challenges = challenges.filter(c => c.category === category);
    }

    return challenges.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  }

  /**
   * Join a challenge
   */
  joinChallenge(
    employeeId: string,
    employeeName: string,
    department: string,
    challengeId: string
  ): ChallengeParticipant | null {
    const challenge = this.challenges.get(challengeId);
    const profile = this.profiles.get(employeeId);

    if (!challenge || !profile || challenge.status !== 'active') return null;

    // Check if already joined
    if (challenge.participants.some(p => p.employeeId === employeeId)) {
      return null;
    }

    const participant: ChallengeParticipant = {
      id: this.generateId(),
      employeeId,
      employeeName,
      department,
      progress: 0,
      currentValue: 0,
      isCompleted: false,
      joinedAt: new Date(),
    };

    challenge.participants.push(participant);
    profile.activeChallenges.push(challengeId);

    this.updateChallengeLeaderboard(challenge);

    return participant;
  }

  /**
   * Update challenge progress
   */
  updateChallengeProgress(
    employeeId: string,
    challengeId: string,
    value: number
  ): ChallengeParticipant | null {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return null;

    const participant = challenge.participants.find(p => p.employeeId === employeeId);
    if (!participant || participant.isCompleted) return null;

    participant.currentValue = value;
    participant.progress = Math.min((value / challenge.goal.target) * 100, 100);

    if (participant.currentValue >= challenge.goal.target) {
      participant.isCompleted = true;
      participant.completedAt = new Date();

      const profile = this.profiles.get(employeeId);
      if (profile) {
        profile.totalPoints += challenge.pointsReward;
        profile.completedChallenges++;
        profile.activeChallenges = profile.activeChallenges.filter(c => c !== challengeId);
      }
    }

    this.updateChallengeLeaderboard(challenge);

    return participant;
  }

  /**
   * Update challenge leaderboard
   */
  private updateChallengeLeaderboard(challenge: WellnessChallenge): void {
    challenge.leaderboard = challenge.participants
      .sort((a, b) => b.currentValue - a.currentValue)
      .map((p, index) => ({
        rank: index + 1,
        participantId: p.id,
        participantName: p.employeeName,
        value: p.currentValue,
        progress: p.progress,
        isCompleted: p.isCompleted,
      }));
  }

  /**
   * Complete a wellness assessment
   */
  completeAssessment(
    employeeId: string,
    type: AssessmentType,
    responses: AssessmentResponse[]
  ): WellnessAssessment {
    const profile = this.profiles.get(employeeId);
    if (!profile) throw new Error('Profile not found');

    // Calculate score (simplified - real scoring would be more complex)
    const score = this.calculateAssessmentScore(responses);
    const maxScore = responses.length * 5;
    const percentile = Math.round((score / maxScore) * 100);

    const recommendations = this.generateRecommendations(type, percentile);

    const assessment: WellnessAssessment = {
      id: this.generateId(),
      type,
      score,
      maxScore,
      percentile,
      responses,
      recommendations: recommendations.en,
      recommendationsAr: recommendations.ar,
      completedAt: new Date(),
      nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };

    profile.assessments.push(assessment);

    // Update related category scores
    this.updateCategoryFromAssessment(profile, type, percentile);

    return assessment;
  }

  /**
   * Calculate assessment score
   */
  private calculateAssessmentScore(responses: AssessmentResponse[]): number {
    return responses.reduce((sum, r) => {
      const value = typeof r.answer === 'number' ? r.answer : 3;
      return sum + value;
    }, 0);
  }

  /**
   * Generate recommendations based on assessment
   */
  private generateRecommendations(
    type: AssessmentType,
    percentile: number
  ): { en: string[]; ar: string[] } {
    const recommendations: { en: string[]; ar: string[] } = { en: [], ar: [] };

    if (percentile < 40) {
      switch (type) {
        case 'stress_level':
          recommendations.en.push('Consider speaking with a wellness coach');
          recommendations.en.push('Try daily meditation for stress relief');
          recommendations.ar.push('فكر في التحدث مع مدرب صحي');
          recommendations.ar.push('جرب التأمل اليومي لتخفيف التوتر');
          break;
        case 'burnout_risk':
          recommendations.en.push('Take regular breaks during work hours');
          recommendations.en.push('Discuss workload with your manager');
          recommendations.ar.push('خذ استراحات منتظمة أثناء ساعات العمل');
          recommendations.ar.push('ناقش عبء العمل مع مديرك');
          break;
        case 'mental_health':
          recommendations.en.push('Connect with our Employee Assistance Program');
          recommendations.en.push('Practice gratitude journaling');
          recommendations.ar.push('تواصل مع برنامج مساعدة الموظفين');
          recommendations.ar.push('مارس كتابة يوميات الامتنان');
          break;
        default:
          recommendations.en.push('Join a wellness challenge to improve');
          recommendations.ar.push('انضم إلى تحدي صحي للتحسين');
      }
    } else if (percentile < 70) {
      recommendations.en.push('You\'re doing well! Keep up the good habits');
      recommendations.en.push('Try adding one new wellness activity');
      recommendations.ar.push('أنت تبلي بلاءً حسناً! حافظ على العادات الجيدة');
      recommendations.ar.push('حاول إضافة نشاط صحي جديد');
    } else {
      recommendations.en.push('Excellent! Consider mentoring others');
      recommendations.en.push('Share your wellness tips with colleagues');
      recommendations.ar.push('ممتاز! فكر في توجيه الآخرين');
      recommendations.ar.push('شارك نصائحك الصحية مع الزملاء');
    }

    return recommendations;
  }

  /**
   * Update category from assessment
   */
  private updateCategoryFromAssessment(
    profile: EmployeeWellnessProfile,
    type: AssessmentType,
    percentile: number
  ): void {
    const categoryMapping: Record<AssessmentType, WellnessCategory> = {
      overall_wellness: 'physical_fitness',
      stress_level: 'stress_management',
      work_life_balance: 'work_life_balance',
      mental_health: 'mental_health',
      physical_health: 'physical_fitness',
      burnout_risk: 'stress_management',
    };

    const category = categoryMapping[type];
    const categoryScore = profile.categoryScores.find(cs => cs.category === category);

    if (categoryScore) {
      const oldScore = categoryScore.score;
      categoryScore.score = percentile;
      categoryScore.trend = percentile > oldScore ? 'improving' :
                           percentile < oldScore ? 'declining' : 'stable';
      categoryScore.lastUpdated = new Date();
    }

    this.recalculateWellnessScore(profile);
  }

  /**
   * Set a wellness goal
   */
  setGoal(
    employeeId: string,
    category: WellnessCategory,
    description: string,
    descriptionAr: string,
    target: number,
    unit: string,
    targetDate: Date
  ): WellnessGoal {
    const profile = this.profiles.get(employeeId);
    if (!profile) throw new Error('Profile not found');

    const goal: WellnessGoal = {
      id: this.generateId(),
      category,
      description,
      descriptionAr,
      target,
      current: 0,
      unit,
      startDate: new Date(),
      targetDate,
      status: 'in_progress',
      milestones: [
        { percentage: 25, reached: false },
        { percentage: 50, reached: false, reward: 25 },
        { percentage: 75, reached: false },
        { percentage: 100, reached: false, reward: 100 },
      ],
    };

    profile.goals.push(goal);
    return goal;
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(employeeId: string, goalId: string, value: number): WellnessGoal | null {
    const profile = this.profiles.get(employeeId);
    if (!profile) return null;

    const goal = profile.goals.find(g => g.id === goalId);
    if (!goal || goal.status === 'completed' || goal.status === 'missed') return null;

    goal.current = value;
    const progress = (value / goal.target) * 100;

    // Check milestones
    goal.milestones.forEach(milestone => {
      if (!milestone.reached && progress >= milestone.percentage) {
        milestone.reached = true;
        milestone.reachedAt = new Date();
        if (milestone.reward) {
          profile.totalPoints += milestone.reward;
        }
      }
    });

    // Check completion
    if (value >= goal.target) {
      goal.status = 'completed';
      this.updateCategoryScore(profile, goal.category, 10);
    }

    return goal;
  }

  /**
   * Generate wellness insights
   */
  generateInsights(employeeId: string): WellnessInsight[] {
    const profile = this.profiles.get(employeeId);
    if (!profile) return [];

    const insights: WellnessInsight[] = [];

    // Check for low category scores
    profile.categoryScores.forEach(cs => {
      if (cs.score < 40) {
        insights.push({
          type: 'alert',
          title: `Low ${this.getCategoryLabel(cs.category, 'en')} Score`,
          titleAr: `درجة ${this.getCategoryLabel(cs.category, 'ar')} منخفضة`,
          description: `Your ${this.getCategoryLabel(cs.category, 'en').toLowerCase()} score is below average. Consider joining related activities.`,
          descriptionAr: `درجة ${this.getCategoryLabel(cs.category, 'ar')} أقل من المتوسط. فكر في الانضمام للأنشطة ذات الصلة.`,
          actionable: true,
          priority: 'high',
          category: cs.category,
          createdAt: new Date(),
        });
      }
    });

    // Check for streaks
    profile.streaks.forEach(streak => {
      if (streak.currentDays >= 7) {
        insights.push({
          type: 'achievement',
          title: `${streak.currentDays}-Day Streak!`,
          titleAr: `سلسلة ${streak.currentDays} يوم!`,
          description: `Great job maintaining your ${streak.activityType} streak!`,
          descriptionAr: `عمل رائع في الحفاظ على سلسلة ${streak.activityType}!`,
          actionable: false,
          priority: 'low',
          category: 'physical_fitness',
          createdAt: new Date(),
        });
      }
    });

    // Check for upcoming assessments
    const overdueAssessments = profile.assessments.filter(a =>
      a.nextDueDate && a.nextDueDate < new Date()
    );
    if (overdueAssessments.length > 0) {
      insights.push({
        type: 'reminder',
        title: 'Assessment Due',
        titleAr: 'التقييم مستحق',
        description: 'You have wellness assessments that are due for renewal.',
        descriptionAr: 'لديك تقييمات صحية مستحقة للتجديد.',
        actionable: true,
        priority: 'medium',
        category: 'mental_health',
        createdAt: new Date(),
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get wellness statistics
   */
  getStats(): WellnessStats {
    const profiles = Array.from(this.profiles.values());
    const activeProfiles = profiles.filter(p =>
      p.lastActivityAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const avgScore = profiles.length > 0
      ? profiles.reduce((sum, p) => sum + p.wellnessScore, 0) / profiles.length
      : 0;

    // Top categories
    const categorySums: Record<WellnessCategory, { sum: number; count: number }> = {} as any;
    profiles.forEach(p => {
      p.categoryScores.forEach(cs => {
        if (!categorySums[cs.category]) {
          categorySums[cs.category] = { sum: 0, count: 0 };
        }
        categorySums[cs.category].sum += cs.score;
        categorySums[cs.category].count++;
      });
    });

    const topCategories = Object.entries(categorySums)
      .map(([cat, data]) => ({
        category: cat as WellnessCategory,
        score: Math.round(data.sum / data.count),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Challenge completion rate
    const challenges = Array.from(this.challenges.values());
    const completedParticipants = challenges.flatMap(c =>
      c.participants.filter(p => p.isCompleted)
    ).length;
    const totalParticipants = challenges.flatMap(c => c.participants).length;
    const completionRate = totalParticipants > 0
      ? (completedParticipants / totalParticipants) * 100
      : 0;

    return {
      totalParticipants: profiles.length,
      activeParticipants: activeProfiles.length,
      participationRate: profiles.length > 0 ? (activeProfiles.length / profiles.length) * 100 : 0,
      averageWellnessScore: Math.round(avgScore),
      topCategories,
      challengeCompletionRate: Math.round(completionRate),
      totalPointsAwarded: profiles.reduce((sum, p) => sum + p.totalPoints, 0),
      monthlyTrend: this.generateMonthlyTrend(),
    };
  }

  /**
   * Generate monthly trend
   */
  private generateMonthlyTrend(): { month: string; score: number }[] {
    // Mock data - in production would calculate from historical data
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      trend.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        score: Math.round(50 + Math.random() * 30),
      });
    }
    return trend;
  }

  /**
   * Get all activities
   */
  getActivities(category?: WellnessCategory): WellnessActivity[] {
    let activities = Array.from(this.activities.values()).filter(a => a.isActive);

    if (category) {
      activities = activities.filter(a => a.category === category);
    }

    return activities;
  }

  /**
   * Add a resource
   */
  addResource(resource: Omit<WellnessResource, 'id' | 'createdAt'>): WellnessResource {
    const newResource: WellnessResource = {
      ...resource,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.resources.set(newResource.id, newResource);
    return newResource;
  }

  /**
   * Get resources
   */
  getResources(category?: WellnessCategory, type?: ResourceType): WellnessResource[] {
    let resources = Array.from(this.resources.values());

    if (category) {
      resources = resources.filter(r => r.category === category);
    }
    if (type) {
      resources = resources.filter(r => r.type === type);
    }

    return resources.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: WellnessCategory, language: 'en' | 'ar' = 'en'): string {
    return CATEGORY_LABELS[category][language];
  }

  /**
   * Get category info
   */
  getCategoryInfo(category: WellnessCategory): typeof CATEGORY_LABELS[WellnessCategory] {
    return CATEGORY_LABELS[category];
  }

  /**
   * Get assessment questions
   */
  getAssessmentQuestions(type: AssessmentType): typeof ASSESSMENT_QUESTIONS[AssessmentType] {
    return ASSESSMENT_QUESTIONS[type] || [];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const wellnessService = new WellnessService();

// Export types
export type { WellnessService };
