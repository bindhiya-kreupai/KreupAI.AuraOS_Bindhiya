/**
 * @module wellnessService
 * @description ESS Wellness & Well-being service — wellness programs, enrollment,
 *              wellness score, activity logging, challenges, leaderboard, rewards (Sec 17.6)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type ProgramCategory =
  | 'fitness'
  | 'mental_health'
  | 'nutrition'
  | 'financial'
  | 'social'
  | 'sleep';
export type ChallengeType =
  | 'steps'
  | 'meditation'
  | 'nutrition'
  | 'fitness'
  | 'sleep'
  | 'hydration';
export type ActivityType =
  | 'steps'
  | 'meditation'
  | 'workout'
  | 'reading'
  | 'sleep'
  | 'nutrition'
  | 'cycling'
  | 'yoga'
  | 'stretching';
export type EnrollmentStatus = 'enrolled' | 'not_enrolled' | 'completed' | 'paused';

export interface WellnessProgram {
  id: string;
  name: string;
  description: string;
  category: ProgramCategory;
  durationWeeks: number;
  pointsPerCompletion: number;
  isEnrolled: boolean;
  enrollmentStatus: EnrollmentStatus;
  progress: number; // 0–100
  startDate?: string;
  completedDate?: string;
  instructorName?: string;
  emoji: string;
  totalEnrollments: number;
  rating: number;
  weeklyGoals: string[];
}

export interface WellnessScore {
  employeeId: string;
  overallScore: number; // 0–100
  breakdown: {
    physical: number;
    mental: number;
    financial: number;
    social: number;
    sleep: number;
    nutrition: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
  pointsEarned: number;
  streakDays: number;
}

export interface WellnessActivity {
  id: string;
  employeeId: string;
  type: ActivityType;
  value: number;
  unit: string;
  date: string;
  points: number;
  notes?: string;
}

export interface WellnessChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  targetValue: number;
  unit: string;
  currentProgress: number;
  participants: number;
  pointsReward: number;
  status: 'active' | 'upcoming' | 'completed';
  isJoined: boolean;
  myRank?: number;
  emoji: string;
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  name: string;
  department: string;
  value: number;
  unit: string;
  avatarInitials: string;
  isCurrentUser: boolean;
}

export interface WellnessReward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: ProgramCategory;
  earnedAt: string;
  badge: string;
}

export interface LogActivityInput {
  type: ActivityType;
  value: number;
  unit?: string;
  date?: string;
  notes?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PROGRAMS: WellnessProgram[] = [
  {
    id: 'prg-001',
    name: '10K Steps Daily',
    description: 'Build a consistent walking habit with daily step goals and milestone rewards.',
    category: 'fitness',
    durationWeeks: 8,
    pointsPerCompletion: 500,
    isEnrolled: true,
    enrollmentStatus: 'enrolled',
    progress: 65,
    startDate: '2025-01-06',
    instructorName: 'Dr. Laila Khalid',
    emoji: '🚶',
    totalEnrollments: 234,
    rating: 4.8,
    weeklyGoals: ['Walk 10,000 steps/day', 'Log activities daily', 'Complete 5 active days'],
  },
  {
    id: 'prg-002',
    name: 'Mindfulness & Meditation',
    description: 'Reduce stress and improve focus with guided meditation sessions.',
    category: 'mental_health',
    durationWeeks: 6,
    pointsPerCompletion: 400,
    isEnrolled: true,
    enrollmentStatus: 'in_progress',
    progress: 30,
    startDate: '2025-02-01',
    instructorName: 'Coach Amir Hassan',
    emoji: '🧘',
    totalEnrollments: 189,
    rating: 4.9,
    weeklyGoals: [
      '10 min meditation daily',
      'Complete 3 guided sessions',
      'Practice breathing exercises',
    ],
  } as WellnessProgram & { enrollmentStatus: 'in_progress' },
  {
    id: 'prg-003',
    name: 'Healthy Eating Habits',
    description: 'Learn nutrition fundamentals and build sustainable healthy eating patterns.',
    category: 'nutrition',
    durationWeeks: 10,
    pointsPerCompletion: 600,
    isEnrolled: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    instructorName: 'Nutritionist Reem Al-Ali',
    emoji: '🥗',
    totalEnrollments: 156,
    rating: 4.6,
    weeklyGoals: ['Track daily food intake', 'Eat 5 fruits/vegetables', 'Drink 8 glasses of water'],
  },
  {
    id: 'prg-004',
    name: 'Financial Wellness',
    description:
      'Master personal finance with budgeting tools, saving strategies, and investment basics.',
    category: 'financial',
    durationWeeks: 12,
    pointsPerCompletion: 700,
    isEnrolled: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    instructorName: 'CFP Mohammed Al-Rashid',
    emoji: '💰',
    totalEnrollments: 98,
    rating: 4.7,
    weeklyGoals: ['Review budget weekly', 'Complete one module', 'Track expenses'],
  },
  {
    id: 'prg-005',
    name: 'Sleep Optimization',
    description:
      'Improve sleep quality with evidence-based techniques and sleep hygiene practices.',
    category: 'sleep',
    durationWeeks: 4,
    pointsPerCompletion: 300,
    isEnrolled: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    instructorName: 'Dr. Nour Saleh',
    emoji: '😴',
    totalEnrollments: 211,
    rating: 4.5,
    weeklyGoals: ['Sleep 7–9 hours', 'No screens 1hr before bed', 'Wake at consistent time'],
  },
  {
    id: 'prg-006',
    name: 'Social Wellbeing',
    description:
      'Build meaningful connections, improve communication skills, and foster community.',
    category: 'social',
    durationWeeks: 8,
    pointsPerCompletion: 450,
    isEnrolled: false,
    enrollmentStatus: 'not_enrolled',
    progress: 0,
    instructorName: 'Coach Sara Al-Mansouri',
    emoji: '🤝',
    totalEnrollments: 73,
    rating: 4.4,
    weeklyGoals: [
      'Connect with a colleague',
      'Join one team activity',
      'Share a positive interaction',
    ],
  },
];

const MOCK_CHALLENGES: WellnessChallenge[] = [
  {
    id: 'chl-001',
    title: 'February Step Challenge',
    description: 'Walk 200,000 steps in February and win exciting rewards!',
    type: 'steps',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    targetValue: 200_000,
    unit: 'steps',
    currentProgress: 142_000,
    participants: 87,
    pointsReward: 1000,
    status: 'active',
    isJoined: true,
    myRank: 12,
    emoji: '👣',
  },
  {
    id: 'chl-002',
    title: '21-Day Meditation Streak',
    description: 'Meditate at least 10 minutes every day for 21 consecutive days.',
    type: 'meditation',
    startDate: '2025-02-10',
    endDate: '2025-03-02',
    targetValue: 21,
    unit: 'days',
    currentProgress: 15,
    participants: 45,
    pointsReward: 750,
    status: 'active',
    isJoined: true,
    myRank: 5,
    emoji: '🧘',
  },
  {
    id: 'chl-003',
    title: 'Hydration Challenge',
    description: 'Drink 8 glasses of water daily for 30 days.',
    type: 'hydration',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    targetValue: 30,
    unit: 'days',
    currentProgress: 0,
    participants: 0,
    pointsReward: 500,
    status: 'upcoming',
    isJoined: false,
    emoji: '💧',
  },
  {
    id: 'chl-004',
    title: 'January Fitness Blitz',
    description: 'Complete 20 workout sessions in January.',
    type: 'fitness',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    targetValue: 20,
    unit: 'sessions',
    currentProgress: 20,
    participants: 62,
    pointsReward: 800,
    status: 'completed',
    isJoined: true,
    myRank: 8,
    emoji: '🏋️',
  },
];

const MOCK_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  'chl-001': [
    {
      rank: 1,
      employeeId: 'emp-201',
      name: 'Khalid Al-Otaibi',
      department: 'IT',
      value: 198_400,
      unit: 'steps',
      avatarInitials: 'KO',
      isCurrentUser: false,
    },
    {
      rank: 2,
      employeeId: 'emp-202',
      name: 'Reem Al-Zahra',
      department: 'HR',
      value: 189_600,
      unit: 'steps',
      avatarInitials: 'RZ',
      isCurrentUser: false,
    },
    {
      rank: 3,
      employeeId: 'emp-203',
      name: 'Omar Hussain',
      department: 'Sales',
      value: 178_900,
      unit: 'steps',
      avatarInitials: 'OH',
      isCurrentUser: false,
    },
    {
      rank: 4,
      employeeId: 'emp-204',
      name: 'Sara Malik',
      department: 'Finance',
      value: 162_100,
      unit: 'steps',
      avatarInitials: 'SM',
      isCurrentUser: false,
    },
    {
      rank: 5,
      employeeId: 'emp-205',
      name: 'Ahmed Nabil',
      department: 'Eng',
      value: 155_300,
      unit: 'steps',
      avatarInitials: 'AN',
      isCurrentUser: false,
    },
    {
      rank: 12,
      employeeId: 'emp-current',
      name: 'You',
      department: 'Engineering',
      value: 142_000,
      unit: 'steps',
      avatarInitials: 'YO',
      isCurrentUser: true,
    },
  ],
  'chl-002': [
    {
      rank: 1,
      employeeId: 'emp-301',
      name: 'Fatima Al-Hassan',
      department: 'HR',
      value: 15,
      unit: 'days',
      avatarInitials: 'FH',
      isCurrentUser: false,
    },
    {
      rank: 2,
      employeeId: 'emp-302',
      name: 'Nour Khalid',
      department: 'Legal',
      value: 15,
      unit: 'days',
      avatarInitials: 'NK',
      isCurrentUser: false,
    },
    {
      rank: 3,
      employeeId: 'emp-303',
      name: 'Yusuf Al-Rashid',
      department: 'Ops',
      value: 15,
      unit: 'days',
      avatarInitials: 'YR',
      isCurrentUser: false,
    },
    {
      rank: 4,
      employeeId: 'emp-304',
      name: 'Hana Mohammed',
      department: 'IT',
      value: 14,
      unit: 'days',
      avatarInitials: 'HM',
      isCurrentUser: false,
    },
    {
      rank: 5,
      employeeId: 'emp-current',
      name: 'You',
      department: 'Engineering',
      value: 15,
      unit: 'days',
      avatarInitials: 'YO',
      isCurrentUser: true,
    },
  ],
};

const MOCK_REWARDS: WellnessReward[] = [
  {
    id: 'rwd-001',
    name: 'Step Starter',
    description: 'Walked 50,000 steps in a month',
    points: 200,
    category: 'fitness',
    earnedAt: '2025-01-31',
    badge: '🥉',
  },
  {
    id: 'rwd-002',
    name: 'Mindful Moment',
    description: 'Completed 7-day meditation streak',
    points: 150,
    category: 'mental_health',
    earnedAt: '2025-02-07',
    badge: '🧘',
  },
  {
    id: 'rwd-003',
    name: 'Fitness Fanatic',
    description: 'Completed January Fitness Blitz',
    points: 800,
    category: 'fitness',
    earnedAt: '2025-01-31',
    badge: '🏋️',
  },
  {
    id: 'rwd-004',
    name: 'Early Bird',
    description: 'Logged activity before 7am for 5 days',
    points: 100,
    category: 'fitness',
    earnedAt: '2025-02-14',
    badge: '🌅',
  },
];

// 30-day activity history
function generateActivityHistory(employeeId: string): WellnessActivity[] {
  const activities: WellnessActivity[] = [];
  const now = new Date('2025-02-25');
  const types: ActivityType[] = [
    'steps',
    'meditation',
    'workout',
    'yoga',
    'cycling',
    'steps',
    'meditation',
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const type = types[i % types.length];
    const values: Record<ActivityType, { v: number; u: string; pts: number }> = {
      steps: { v: 7000 + Math.floor(Math.random() * 6000), u: 'steps', pts: 10 },
      meditation: { v: 10 + Math.floor(Math.random() * 20), u: 'minutes', pts: 15 },
      workout: { v: 30 + Math.floor(Math.random() * 30), u: 'minutes', pts: 25 },
      reading: { v: 20 + Math.floor(Math.random() * 40), u: 'minutes', pts: 10 },
      sleep: { v: 6 + Math.random() * 2, u: 'hours', pts: 20 },
      nutrition: { v: 5 + Math.floor(Math.random() * 3), u: 'servings', pts: 15 },
      cycling: { v: 5 + Math.floor(Math.random() * 15), u: 'km', pts: 20 },
      yoga: { v: 20 + Math.floor(Math.random() * 40), u: 'minutes', pts: 20 },
      stretching: { v: 10 + Math.floor(Math.random() * 15), u: 'minutes', pts: 8 },
    };
    const { v, u, pts } = values[type];
    activities.push({
      id: `act-${i + 1}`,
      employeeId,
      type,
      value: parseFloat(v.toFixed(1)),
      unit: u,
      date: date.toISOString().split('T')[0],
      points: pts,
    });
  }
  return activities;
}

// ============================================================================
// SERVICE
// ============================================================================

export class WellnessService {
  // ── Get Wellness Programs ──────────────────────────────────────────────────

  static async getWellnessPrograms(): Promise<WellnessProgram[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_PROGRAMS];
  }

  // ── Enroll in Program ──────────────────────────────────────────────────────

  static async enrollProgram(
    programId: string
  ): Promise<{ success: boolean; program: WellnessProgram }> {
    await new Promise((r) => setTimeout(r, 300));
    const program = MOCK_PROGRAMS.find((p) => p.id === programId);
    if (!program) throw new Error('Program not found');
    program.isEnrolled = true;
    program.enrollmentStatus = 'enrolled';
    program.startDate = new Date().toISOString().split('T')[0];
    return { success: true, program };
  }

  // ── Get Wellness Score ─────────────────────────────────────────────────────

  static async getWellnessScore(employeeId: string): Promise<WellnessScore> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      employeeId,
      overallScore: 72,
      breakdown: {
        physical: 78,
        mental: 65,
        financial: 55,
        social: 80,
        sleep: 70,
        nutrition: 68,
      },
      trend: 'improving',
      lastUpdated: new Date().toISOString(),
      pointsEarned: 1250,
      streakDays: 15,
    };
  }

  // ── Log Activity ───────────────────────────────────────────────────────────

  static async logActivity(data: LogActivityInput): Promise<WellnessActivity> {
    await new Promise((r) => setTimeout(r, 250));
    const unitMap: Partial<Record<ActivityType, string>> = {
      steps: 'steps',
      meditation: 'minutes',
      workout: 'minutes',
      reading: 'minutes',
      sleep: 'hours',
      nutrition: 'servings',
      cycling: 'km',
      yoga: 'minutes',
      stretching: 'minutes',
    };
    const pointsMap: Partial<Record<ActivityType, number>> = {
      steps: 10,
      meditation: 15,
      workout: 25,
      reading: 10,
      sleep: 20,
      nutrition: 15,
      cycling: 20,
      yoga: 20,
      stretching: 8,
    };
    return {
      id: `act-${Date.now()}`,
      employeeId: 'emp-current',
      type: data.type,
      value: data.value,
      unit: data.unit ?? unitMap[data.type] ?? 'units',
      date: data.date ?? new Date().toISOString().split('T')[0],
      points: pointsMap[data.type] ?? 10,
      notes: data.notes,
    };
  }

  // ── Get Activity History ───────────────────────────────────────────────────

  static async getActivityHistory(
    employeeId: string,
    dateRange?: { from: string; to: string }
  ): Promise<WellnessActivity[]> {
    await new Promise((r) => setTimeout(r, 200));
    const all = generateActivityHistory(employeeId);
    if (!dateRange) return all;
    return all.filter((a) => a.date >= dateRange.from && a.date <= dateRange.to);
  }

  // ── Get Wellness Challenges ────────────────────────────────────────────────

  static async getWellnessChallenges(): Promise<WellnessChallenge[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_CHALLENGES];
  }

  // ── Join Challenge ─────────────────────────────────────────────────────────

  static async joinChallenge(challengeId: string): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 300));
    const challenge = MOCK_CHALLENGES.find((c) => c.id === challengeId);
    if (challenge) {
      challenge.isJoined = true;
      challenge.participants++;
    }
    return { success: true };
  }

  // ── Get Challenge Leaderboard ──────────────────────────────────────────────

  static async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_LEADERBOARDS[challengeId] ?? [];
  }

  // ── Get Wellness Rewards ───────────────────────────────────────────────────

  static async getWellnessRewards(): Promise<WellnessReward[]> {
    await new Promise((r) => setTimeout(r, 150));
    return [...MOCK_REWARDS];
  }
}
