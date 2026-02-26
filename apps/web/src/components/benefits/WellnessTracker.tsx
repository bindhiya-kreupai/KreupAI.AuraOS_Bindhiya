'use client';

import React, { useState } from 'react';
import {
  Heart,
  Trophy,
  Flame,
  Star,
  Gift,
  Target,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Activity,
  Brain,
  Award,
  Crown,
  Footprints,
  Moon,
  Droplets,
  Dumbbell,
  Clock,
  Phone,
  BookOpen,
  Smile,
  Wind,
  Lock,
  Unlock,
  BadgeCheck,
  Zap,
  Sunrise,
  UserCheck,
  TrendingUp,
  DollarSign,
  Wallet,
  CreditCard,
  CircleDot,
  ChevronRight,
  Clipboard,
  Stethoscope,
  BarChart3,
  Layers,
  Plus,
  Eye,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'steps' | 'meditation' | 'nutrition' | 'fitness';
  startDate: string;
  endDate: string;
  progress: number;
  target: number;
  unit: string;
  participants: number;
  status: 'active' | 'completed' | 'upcoming';
  reward: number;
}

interface RecentReward {
  id: string;
  name: string;
  points: number;
  date: string;
}

interface HealthRiskAssessment {
  completed: boolean;
  lastCompletedDate: string | null;
  nextDueDate: string;
  riskScore: number | null; // 0–100, lower is better
  riskLevel: 'low' | 'moderate' | 'high' | null;
}

interface BiometricResult {
  label: string;
  value: string;
  status: 'normal' | 'at-risk' | 'high-risk';
  lastScreeningDate: string;
}

interface BiometricScreening {
  completed: boolean;
  nextScreeningDate: string;
  results: BiometricResult[];
}

interface TeamMember {
  id: string;
  name: string;
  department: string;
  points: number;
  avatarInitials: string;
  rank: number;
}

interface ActivityEntry {
  date: string;
  steps: number;
  exerciseMinutes: number;
  sleepHours: number;
  waterIntake: number; // glasses
}

interface MentalHealthResource {
  id: string;
  title: string;
  description: string;
  category: 'eap' | 'counseling' | 'meditation' | 'stress';
  available: boolean;
  contactOrLink: string;
}

interface WellnessStipend {
  annualBudget: number;
  spent: number;
  remaining: number;
  fiscalYearEnd: string;
  recentClaims: {
    id: string;
    description: string;
    amount: number;
    date: string;
    status: 'approved' | 'pending' | 'denied';
  }[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon:
    | 'streak'
    | 'early-bird'
    | 'team-player'
    | 'fitness-guru'
    | 'mindful'
    | 'hydration'
    | 'nutrition'
    | 'champion'
    | 'explorer'
    | 'consistent'
    | 'leader'
    | 'zenmaster';
  earned: boolean;
  earnedDate: string | null;
  criteria: string;
}

interface WellnessProgram {
  id: string;
  name: string;
  description: string;
  enrolled: boolean;
  startDate: string;
  endDate: string;
  category: string;
  spotsLeft: number | null;
}

interface IncentiveTier {
  name: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsRequired: number;
  benefits: string[];
}

interface WellnessData {
  totalPoints: number;
  pointsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  rewardsRedeemed: number;
  rewardsAvailable: number;
  challenges: Challenge[];
  recentRewards: RecentReward[];
  healthRiskAssessment: HealthRiskAssessment;
  biometricScreening: BiometricScreening;
  teamLeaderboard: TeamMember[];
  activityLog: ActivityEntry[];
  mentalHealthResources: MentalHealthResource[];
  wellnessStipend: WellnessStipend;
  badges: Badge[];
  programs: WellnessProgram[];
  incentiveTiers: IncentiveTier[];
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockData: WellnessData = {
  totalPoints: 4250,
  pointsThisMonth: 380,
  currentStreak: 12,
  longestStreak: 34,
  rewardsRedeemed: 3,
  rewardsAvailable: 8,

  challenges: [
    {
      id: 'ch-001',
      title: '10K Steps Daily',
      description: 'Walk 10,000 steps every day for 30 days',
      type: 'steps',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      progress: 18,
      target: 30,
      unit: 'days',
      participants: 156,
      status: 'active',
      reward: 200,
    },
    {
      id: 'ch-002',
      title: 'Mindfulness Month',
      description: 'Complete 10 minutes of meditation daily',
      type: 'meditation',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      progress: 15,
      target: 30,
      unit: 'sessions',
      participants: 89,
      status: 'active',
      reward: 150,
    },
    {
      id: 'ch-003',
      title: 'Hydration Challenge',
      description: 'Drink 8 glasses of water daily for 2 weeks',
      type: 'nutrition',
      startDate: '2025-12-15',
      endDate: '2025-12-29',
      progress: 14,
      target: 14,
      unit: 'days',
      participants: 203,
      status: 'completed',
      reward: 100,
    },
    {
      id: 'ch-004',
      title: 'February Fitness',
      description: 'Complete 20 workout sessions in February',
      type: 'fitness',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      progress: 0,
      target: 20,
      unit: 'workouts',
      participants: 45,
      status: 'upcoming',
      reward: 250,
    },
    {
      id: 'ch-005',
      title: 'Healthy Eating Sprint',
      description: 'Log 5 servings of fruits/vegetables daily for 21 days',
      type: 'nutrition',
      startDate: '2026-01-10',
      endDate: '2026-01-31',
      progress: 12,
      target: 21,
      unit: 'days',
      participants: 112,
      status: 'active',
      reward: 175,
    },
    {
      id: 'ch-006',
      title: 'Yoga for Beginners',
      description: 'Attend 12 yoga sessions over 4 weeks',
      type: 'fitness',
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      progress: 12,
      target: 12,
      unit: 'sessions',
      participants: 67,
      status: 'completed',
      reward: 180,
    },
  ],

  recentRewards: [
    { id: 'r-001', name: 'Amazon Gift Card ($25)', points: 1000, date: '2026-01-10' },
    { id: 'r-002', name: 'Extra PTO Day', points: 2000, date: '2025-12-20' },
    { id: 'r-003', name: 'Fitness Gear Voucher ($50)', points: 1500, date: '2025-11-15' },
  ],

  healthRiskAssessment: {
    completed: true,
    lastCompletedDate: '2025-10-15',
    nextDueDate: '2026-10-15',
    riskScore: 22,
    riskLevel: 'low',
  },

  biometricScreening: {
    completed: true,
    nextScreeningDate: '2026-06-15',
    results: [
      { label: 'BMI', value: '23.4', status: 'normal', lastScreeningDate: '2025-11-20' },
      {
        label: 'Blood Pressure',
        value: '128/82 mmHg',
        status: 'at-risk',
        lastScreeningDate: '2025-11-20',
      },
      {
        label: 'Total Cholesterol',
        value: '195 mg/dL',
        status: 'normal',
        lastScreeningDate: '2025-11-20',
      },
      {
        label: 'Fasting Glucose',
        value: '105 mg/dL',
        status: 'at-risk',
        lastScreeningDate: '2025-11-20',
      },
    ],
  },

  teamLeaderboard: [
    {
      id: 'tm-001',
      name: 'Priya Sharma',
      department: 'Engineering',
      points: 5820,
      avatarInitials: 'PS',
      rank: 1,
    },
    {
      id: 'tm-002',
      name: 'Marcus Johnson',
      department: 'Marketing',
      points: 5340,
      avatarInitials: 'MJ',
      rank: 2,
    },
    {
      id: 'tm-003',
      name: 'Elena Rodriguez',
      department: 'Product',
      points: 4890,
      avatarInitials: 'ER',
      rank: 3,
    },
    {
      id: 'tm-004',
      name: 'James Chen',
      department: 'Design',
      points: 4250,
      avatarInitials: 'JC',
      rank: 4,
    },
    {
      id: 'tm-005',
      name: 'Aisha Williams',
      department: 'Sales',
      points: 3980,
      avatarInitials: 'AW',
      rank: 5,
    },
  ],

  activityLog: [
    { date: '2026-02-24', steps: 11240, exerciseMinutes: 45, sleepHours: 7.5, waterIntake: 9 },
    { date: '2026-02-23', steps: 8930, exerciseMinutes: 30, sleepHours: 6.8, waterIntake: 7 },
    { date: '2026-02-22', steps: 12450, exerciseMinutes: 60, sleepHours: 8.0, waterIntake: 10 },
    { date: '2026-02-21', steps: 6780, exerciseMinutes: 0, sleepHours: 7.2, waterIntake: 6 },
    { date: '2026-02-20', steps: 10120, exerciseMinutes: 40, sleepHours: 7.8, waterIntake: 8 },
    { date: '2026-02-19', steps: 9500, exerciseMinutes: 35, sleepHours: 6.5, waterIntake: 7 },
    { date: '2026-02-18', steps: 14200, exerciseMinutes: 75, sleepHours: 8.2, waterIntake: 11 },
  ],

  mentalHealthResources: [
    {
      id: 'mh-001',
      title: 'Employee Assistance Program (EAP)',
      description:
        'Confidential counseling and referral services available 24/7 for you and your family members.',
      category: 'eap',
      available: true,
      contactOrLink: '1-800-555-0199',
    },
    {
      id: 'mh-002',
      title: 'Licensed Counseling Sessions',
      description: 'Up to 8 free sessions per year with licensed therapists, in-person or virtual.',
      category: 'counseling',
      available: true,
      contactOrLink: 'portal.wellness.co/counseling',
    },
    {
      id: 'mh-003',
      title: 'Calm Premium Access',
      description: 'Free premium subscription to the Calm meditation and sleep app.',
      category: 'meditation',
      available: true,
      contactOrLink: 'calm.com/enterprise',
    },
    {
      id: 'mh-004',
      title: 'Stress Management Workshop',
      description:
        'Monthly interactive workshops on resilience, mindfulness, and coping strategies.',
      category: 'stress',
      available: true,
      contactOrLink: 'Next session: Mar 5, 2026',
    },
  ],

  wellnessStipend: {
    annualBudget: 1200,
    spent: 475,
    remaining: 725,
    fiscalYearEnd: '2026-12-31',
    recentClaims: [
      {
        id: 'ws-001',
        description: 'Gym Membership — Jan',
        amount: 75,
        date: '2026-01-05',
        status: 'approved',
      },
      {
        id: 'ws-002',
        description: 'Running Shoes',
        amount: 120,
        date: '2026-01-18',
        status: 'approved',
      },
      {
        id: 'ws-003',
        description: 'Yoga Class Package',
        amount: 180,
        date: '2026-02-01',
        status: 'approved',
      },
      {
        id: 'ws-004',
        description: 'Ergonomic Standing Desk Mat',
        amount: 100,
        date: '2026-02-10',
        status: 'pending',
      },
    ],
  },

  badges: [
    {
      id: 'b-001',
      name: '30-Day Streak',
      description: 'Maintain a 30-day wellness activity streak',
      icon: 'streak',
      earned: true,
      earnedDate: '2025-12-05',
      criteria: '30 consecutive days of logged activity',
    },
    {
      id: 'b-002',
      name: 'Early Bird',
      description: 'Complete 20 morning workouts before 7 AM',
      icon: 'early-bird',
      earned: true,
      earnedDate: '2025-11-18',
      criteria: '20 workouts logged before 7:00 AM',
    },
    {
      id: 'b-003',
      name: 'Team Player',
      description: 'Participate in 5 team challenges',
      icon: 'team-player',
      earned: true,
      earnedDate: '2026-01-12',
      criteria: 'Join and complete 5 team challenges',
    },
    {
      id: 'b-004',
      name: 'Fitness Guru',
      description: 'Complete 100 total workout sessions',
      icon: 'fitness-guru',
      earned: false,
      earnedDate: null,
      criteria: 'Log 100 workouts (currently at 78)',
    },
    {
      id: 'b-005',
      name: 'Mindful Master',
      description: 'Complete 60 meditation sessions',
      icon: 'mindful',
      earned: true,
      earnedDate: '2026-01-20',
      criteria: '60 meditation sessions logged',
    },
    {
      id: 'b-006',
      name: 'Hydration Hero',
      description: 'Meet daily water goal for 30 consecutive days',
      icon: 'hydration',
      earned: false,
      earnedDate: null,
      criteria: '30 consecutive days meeting water intake goal (currently at 18)',
    },
    {
      id: 'b-007',
      name: 'Nutrition Champion',
      description: 'Log balanced meals for 60 days',
      icon: 'nutrition',
      earned: false,
      earnedDate: null,
      criteria: '60 days of balanced meal logging (currently at 42)',
    },
    {
      id: 'b-008',
      name: 'Wellness Champion',
      description: 'Reach Gold tier in incentive program',
      icon: 'champion',
      earned: true,
      earnedDate: '2026-01-05',
      criteria: 'Accumulate 4,000+ wellness points',
    },
    {
      id: 'b-009',
      name: 'Explorer',
      description: 'Try 6 different wellness activities',
      icon: 'explorer',
      earned: true,
      earnedDate: '2025-10-30',
      criteria: 'Participate in 6 distinct activity categories',
    },
    {
      id: 'b-010',
      name: 'Consistent Performer',
      description: 'Meet weekly goals for 12 consecutive weeks',
      icon: 'consistent',
      earned: false,
      earnedDate: null,
      criteria: '12 consecutive weeks of meeting all weekly targets (currently at 8)',
    },
    {
      id: 'b-011',
      name: 'Team Leader',
      description: 'Be in top 3 of team leaderboard for 4 weeks',
      icon: 'leader',
      earned: false,
      earnedDate: null,
      criteria: 'Top 3 ranking for 4 consecutive weeks (currently at 2)',
    },
    {
      id: 'b-012',
      name: 'Zen Master',
      description: 'Complete 100 meditation sessions and a 60-day streak',
      icon: 'zenmaster',
      earned: false,
      earnedDate: null,
      criteria: '100 meditation sessions with a 60-day streak',
    },
  ],

  programs: [
    {
      id: 'prg-001',
      name: 'Weight Management Program',
      description: '12-week guided program with nutritionist support and weekly check-ins.',
      enrolled: true,
      startDate: '2026-01-15',
      endDate: '2026-04-15',
      category: 'Nutrition',
      spotsLeft: null,
    },
    {
      id: 'prg-002',
      name: 'Tobacco Cessation',
      description: 'Comprehensive quit-smoking program with counseling and NRT support.',
      enrolled: false,
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      category: 'Health',
      spotsLeft: 15,
    },
    {
      id: 'prg-003',
      name: 'Financial Wellness Workshop',
      description: '4-session workshop covering budgeting, investing, and retirement planning.',
      enrolled: false,
      startDate: '2026-03-10',
      endDate: '2026-04-07',
      category: 'Financial',
      spotsLeft: 8,
    },
    {
      id: 'prg-004',
      name: 'Couch to 5K',
      description: '8-week beginner running program with group training sessions.',
      enrolled: true,
      startDate: '2026-02-01',
      endDate: '2026-03-28',
      category: 'Fitness',
      spotsLeft: null,
    },
    {
      id: 'prg-005',
      name: 'Sleep Hygiene Masterclass',
      description: 'Learn evidence-based techniques to improve your sleep quality.',
      enrolled: false,
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      category: 'Wellness',
      spotsLeft: 20,
    },
  ],

  incentiveTiers: [
    {
      name: 'Bronze',
      level: 'bronze',
      pointsRequired: 0,
      benefits: ['Basic wellness rewards catalog', 'Monthly newsletter'],
    },
    {
      name: 'Silver',
      level: 'silver',
      pointsRequired: 2000,
      benefits: [
        'All Bronze benefits',
        '$50 wellness stipend bonus',
        'Priority program enrollment',
      ],
    },
    {
      name: 'Gold',
      level: 'gold',
      pointsRequired: 4000,
      benefits: [
        'All Silver benefits',
        '$100 wellness stipend bonus',
        'Premium fitness app access',
        'Quarterly wellness gift box',
      ],
    },
    {
      name: 'Platinum',
      level: 'platinum',
      pointsRequired: 7000,
      benefits: [
        'All Gold benefits',
        '$200 wellness stipend bonus',
        'Executive health screening',
        '1 extra PTO day',
        'Personal wellness coach',
      ],
    },
  ],

  currentTier: 'gold',
};

// ---------------------------------------------------------------------------
// Status / Tier configs
// ---------------------------------------------------------------------------

const statusConfig = {
  active: { bg: 'bg-aurora-green/10', text: 'text-aurora-green', label: 'Active' },
  completed: { bg: 'bg-celestial-indigo/10', text: 'text-celestial-indigo', label: 'Completed' },
  upcoming: {
    bg: 'bg-sunset-amber/10 dark:bg-sunset-amber/20',
    text: 'text-sunset-amber',
    label: 'Upcoming',
  },
};

const biometricStatusConfig = {
  normal: {
    bg: 'bg-aurora-green/10',
    text: 'text-aurora-green',
    dot: 'bg-aurora-green',
    label: 'Normal',
  },
  'at-risk': {
    bg: 'bg-sunset-amber/10',
    text: 'text-sunset-amber',
    dot: 'bg-sunset-amber',
    label: 'At Risk',
  },
  'high-risk': {
    bg: 'bg-coral-alert/10',
    text: 'text-coral-alert',
    dot: 'bg-coral-alert',
    label: 'High Risk',
  },
};

const riskLevelConfig = {
  low: { bg: 'bg-aurora-green/10', text: 'text-aurora-green', label: 'Low Risk' },
  moderate: { bg: 'bg-sunset-amber/10', text: 'text-sunset-amber', label: 'Moderate Risk' },
  high: { bg: 'bg-coral-alert/10', text: 'text-coral-alert', label: 'High Risk' },
};

const tierColors: Record<
  string,
  { bg: string; text: string; border: string; ring: string; icon: string }
> = {
  bronze: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    ring: 'ring-orange-400',
    icon: 'text-orange-500',
  },
  silver: {
    bg: 'bg-gray-100 dark:bg-gray-700/40',
    text: 'text-gray-600 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
    ring: 'ring-gray-400',
    icon: 'text-gray-500',
  },
  gold: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-400 dark:border-yellow-700',
    ring: 'ring-yellow-400',
    icon: 'text-yellow-500',
  },
  platinum: {
    bg: 'bg-celestial-indigo/10 dark:bg-celestial-indigo/20',
    text: 'text-celestial-indigo dark:text-celestial-indigo',
    border: 'border-celestial-indigo/40 dark:border-celestial-indigo/60',
    ring: 'ring-celestial-indigo',
    icon: 'text-celestial-indigo',
  },
};

// ---------------------------------------------------------------------------
// Badge icon mapper
// ---------------------------------------------------------------------------

function BadgeIcon({ icon, className }: { icon: Badge['icon']; className?: string }) {
  const props = { className: className || 'w-5 h-5' };
  switch (icon) {
    case 'streak':
      return <Flame {...props} />;
    case 'early-bird':
      return <Sunrise {...props} />;
    case 'team-player':
      return <Users {...props} />;
    case 'fitness-guru':
      return <Dumbbell {...props} />;
    case 'mindful':
      return <Brain {...props} />;
    case 'hydration':
      return <Droplets {...props} />;
    case 'nutrition':
      return <Heart {...props} />;
    case 'champion':
      return <Trophy {...props} />;
    case 'explorer':
      return <Target {...props} />;
    case 'consistent':
      return <TrendingUp {...props} />;
    case 'leader':
      return <Crown {...props} />;
    case 'zenmaster':
      return <Wind {...props} />;
    default:
      return <Award {...props} />;
  }
}

// ---------------------------------------------------------------------------
// Mental health resource icon mapper
// ---------------------------------------------------------------------------

function ResourceIcon({
  category,
  className,
}: {
  category: MentalHealthResource['category'];
  className?: string;
}) {
  const props = { className: className || 'w-5 h-5' };
  switch (category) {
    case 'eap':
      return <Phone {...props} />;
    case 'counseling':
      return <UserCheck {...props} />;
    case 'meditation':
      return <Brain {...props} />;
    case 'stress':
      return <BookOpen {...props} />;
    default:
      return <Smile {...props} />;
  }
}

// ---------------------------------------------------------------------------
// Tabs type
// ---------------------------------------------------------------------------

type TabKey = 'overview' | 'activity' | 'challenges' | 'badges' | 'programs' | 'resources';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WellnessTracker() {
  const data = mockData;
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'activity', label: 'Activity Log', icon: <Activity className="w-4 h-4" /> },
    { key: 'challenges', label: 'Challenges', icon: <Target className="w-4 h-4" /> },
    { key: 'badges', label: 'Badges', icon: <Award className="w-4 h-4" /> },
    { key: 'programs', label: 'Programs', icon: <Layers className="w-4 h-4" /> },
    { key: 'resources', label: 'Resources', icon: <Smile className="w-4 h-4" /> },
  ];

  // -----------------------------------------------------------------------
  // Current tier progress
  // -----------------------------------------------------------------------
  const currentTierObj = data.incentiveTiers.find((t) => t.level === data.currentTier)!;
  const currentTierIndex = data.incentiveTiers.findIndex((t) => t.level === data.currentTier);
  const nextTier = data.incentiveTiers[currentTierIndex + 1] ?? null;
  const tierProgress = nextTier
    ? ((data.totalPoints - currentTierObj.pointsRequired) /
        (nextTier.pointsRequired - currentTierObj.pointsRequired)) *
      100
    : 100;

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-celestial-indigo" />
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Wellness Tracker</h1>
            <p className="text-sm text-silver-mist">Track your wellness journey and earn rewards</p>
          </div>
        </div>

        {/* Health Risk Assessment Banner */}
        <div className="mb-6 rounded-xl border border-cloud dark:border-nebula-purple/50 bg-gradient-to-r from-celestial-indigo/5 to-aurora-green/5 dark:from-celestial-indigo/10 dark:to-aurora-green/10 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-celestial-indigo/10 dark:bg-celestial-indigo/20 flex items-center justify-center">
                <Clipboard className="w-5 h-5 text-celestial-indigo" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink-black dark:text-pearl">
                  Health Risk Assessment
                </h2>
                {data.healthRiskAssessment.completed ? (
                  <p className="text-sm text-silver-mist mt-0.5">
                    Completed on {data.healthRiskAssessment.lastCompletedDate} &middot; Next due{' '}
                    {data.healthRiskAssessment.nextDueDate}
                  </p>
                ) : (
                  <p className="text-sm text-coral-alert mt-0.5">
                    Not yet completed &middot; Due by {data.healthRiskAssessment.nextDueDate}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {data.healthRiskAssessment.completed && data.healthRiskAssessment.riskLevel && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${riskLevelConfig[data.healthRiskAssessment.riskLevel].bg} ${riskLevelConfig[data.healthRiskAssessment.riskLevel].text}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Score: {data.healthRiskAssessment.riskScore}/100 &middot;{' '}
                  {riskLevelConfig[data.healthRiskAssessment.riskLevel].label}
                </span>
              )}
              {data.healthRiskAssessment.completed ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-aurora-green/10 text-aurora-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-coral-alert/10 text-coral-alert">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Action Required
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {data.totalPoints.toLocaleString()}
            </p>
            <p className="text-xs text-silver-mist">Total Points</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Trophy className="w-5 h-5 text-celestial-indigo mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              +{data.pointsThisMonth}
            </p>
            <p className="text-xs text-silver-mist">This Month</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {data.currentStreak}
            </p>
            <p className="text-xs text-silver-mist">Day Streak</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <Gift className="w-5 h-5 text-aurora-green mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {data.rewardsRedeemed}
            </p>
            <p className="text-xs text-silver-mist">Rewards Earned</p>
          </div>
        </div>

        {/* Incentive Tier Progress */}
        <div className="mb-6 rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Incentive Tier
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${tierColors[data.currentTier].bg} ${tierColors[data.currentTier].text}`}
            >
              <Crown className="w-3.5 h-3.5" />
              {currentTierObj.name}
            </span>
          </div>
          {/* Tier bar */}
          <div className="flex items-center gap-1 mb-3">
            {data.incentiveTiers.map((tier, idx) => {
              const isCurrentOrPast = idx <= currentTierIndex;
              const isCurrent = tier.level === data.currentTier;
              return (
                <div key={tier.level} className="flex-1">
                  <div
                    className={`h-2 rounded-full ${isCurrentOrPast ? 'bg-celestial-indigo' : 'bg-cloud dark:bg-nebula-purple/30'} ${isCurrent && nextTier ? '' : ''}`}
                  >
                    {isCurrent && nextTier && (
                      <div
                        className="h-full rounded-full bg-celestial-indigo/60"
                        style={{ width: `${Math.min(tierProgress, 100)}%` }}
                      />
                    )}
                  </div>
                  <p
                    className={`text-[10px] mt-1 text-center font-medium ${isCurrent ? tierColors[tier.level].text : 'text-silver-mist'}`}
                  >
                    {tier.name}
                  </p>
                </div>
              );
            })}
          </div>
          {nextTier ? (
            <p className="text-xs text-silver-mist">
              {nextTier.pointsRequired - data.totalPoints} points to{' '}
              <span className="font-medium text-ink-black dark:text-pearl">{nextTier.name}</span>{' '}
              tier
            </p>
          ) : (
            <p className="text-xs text-aurora-green font-medium">
              You have reached the highest tier!
            </p>
          )}
          {/* Current tier benefits */}
          <div className="mt-3 flex flex-wrap gap-2">
            {currentTierObj.benefits.map((b, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-1 rounded-md bg-cloud dark:bg-deep-cosmos text-silver-mist"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-cloud dark:border-nebula-purple/50 overflow-x-auto">
          <nav className="flex gap-1 -mb-px" aria-label="Wellness tracker tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-celestial-indigo text-celestial-indigo'
                    : 'border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:border-cloud dark:hover:border-nebula-purple/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ============================================================= */}
        {/* TAB: Overview                                                  */}
        {/* ============================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Biometric Screening */}
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-quantum-rose" />
                  Biometric Screening
                </h2>
                <span className="text-xs text-silver-mist">
                  Next screening: {data.biometricScreening.nextScreeningDate}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.biometricScreening.results.map((result) => {
                  const cfg = biometricStatusConfig[result.status];
                  return (
                    <div
                      key={result.label}
                      className="rounded-lg border border-cloud dark:border-nebula-purple/30 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-silver-mist">{result.label}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-ink-black dark:text-pearl">
                        {result.value}
                      </p>
                      <p className="text-[11px] text-silver-mist mt-1">
                        Screened {result.lastScreeningDate}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two-col: Team Leaderboard + Wellness Stipend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Leaderboard */}
              <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
                <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-nebula-purple" />
                  Team Leaderboard
                </h2>
                <div className="space-y-3">
                  {data.teamLeaderboard.map((member) => {
                    const isTop3 = member.rank <= 3;
                    const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-400'];
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <span
                          className={`w-6 text-center text-sm font-bold ${isTop3 ? rankColors[member.rank - 1] : 'text-silver-mist'}`}
                        >
                          {member.rank <= 3 ? (
                            <Crown className={`w-4 h-4 mx-auto ${rankColors[member.rank - 1]}`} />
                          ) : (
                            `#${member.rank}`
                          )}
                        </span>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-celestial-indigo/10 dark:bg-celestial-indigo/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-celestial-indigo">
                            {member.avatarInitials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-silver-mist">{member.department}</p>
                        </div>
                        <span className="text-sm font-semibold text-ink-black dark:text-pearl">
                          {member.points.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-silver-mist">pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wellness Stipend Tracker */}
              <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
                <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-aurora-green" />
                  Wellness Stipend
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <DollarSign className="w-4 h-4 text-aurora-green mx-auto mb-1" />
                    <p className="text-lg font-bold text-ink-black dark:text-pearl">
                      ${data.wellnessStipend.annualBudget.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-silver-mist">Annual Budget</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="w-4 h-4 text-sunset-amber mx-auto mb-1" />
                    <p className="text-lg font-bold text-ink-black dark:text-pearl">
                      ${data.wellnessStipend.spent.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-silver-mist">Spent</p>
                  </div>
                  <div className="text-center">
                    <Zap className="w-4 h-4 text-celestial-indigo mx-auto mb-1" />
                    <p className="text-lg font-bold text-aurora-green">
                      ${data.wellnessStipend.remaining.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-silver-mist">Remaining</p>
                  </div>
                </div>
                {/* Stipend progress bar */}
                <div className="w-full h-2.5 rounded-full bg-cloud dark:bg-nebula-purple/30 mb-1">
                  <div
                    className="h-full rounded-full bg-aurora-green"
                    style={{
                      width: `${(data.wellnessStipend.spent / data.wellnessStipend.annualBudget) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-silver-mist mb-4">
                  {Math.round(
                    (data.wellnessStipend.spent / data.wellnessStipend.annualBudget) * 100
                  )}
                  % used &middot; Resets {data.wellnessStipend.fiscalYearEnd}
                </p>
                {/* Recent claims */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-silver-mist uppercase tracking-wide">
                    Recent Claims
                  </p>
                  {data.wellnessStipend.recentClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <CircleDot
                          className={`w-3.5 h-3.5 flex-shrink-0 ${claim.status === 'approved' ? 'text-aurora-green' : claim.status === 'pending' ? 'text-sunset-amber' : 'text-coral-alert'}`}
                        />
                        <span className="text-ink-black dark:text-pearl truncate">
                          {claim.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="font-medium text-ink-black dark:text-pearl">
                          ${claim.amount}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${claim.status === 'approved' ? 'bg-aurora-green/10 text-aurora-green' : claim.status === 'pending' ? 'bg-sunset-amber/10 text-sunset-amber' : 'bg-coral-alert/10 text-coral-alert'}`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Rewards */}
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-celestial-indigo" />
                Rewards Redeemed
              </h2>
              <div className="space-y-3">
                {data.recentRewards.map((reward) => (
                  <div key={reward.id} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-aurora-green flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">
                        {reward.name}
                      </p>
                      <p className="text-xs text-silver-mist">{reward.date}</p>
                    </div>
                    <span className="text-sm text-celestial-indigo font-medium">
                      {reward.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB: Activity Log                                              */}
        {/* ============================================================= */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-celestial-indigo" />
                Daily Activity — Last 7 Days
              </h2>
              {/* Table header */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cloud dark:border-nebula-purple/30">
                      <th className="text-left py-2 pr-4 text-xs font-medium text-silver-mist uppercase tracking-wide">
                        Date
                      </th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-silver-mist uppercase tracking-wide">
                        <span className="inline-flex items-center gap-1">
                          <Footprints className="w-3 h-3" /> Steps
                        </span>
                      </th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-silver-mist uppercase tracking-wide">
                        <span className="inline-flex items-center gap-1">
                          <Dumbbell className="w-3 h-3" /> Exercise
                        </span>
                      </th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-silver-mist uppercase tracking-wide">
                        <span className="inline-flex items-center gap-1">
                          <Moon className="w-3 h-3" /> Sleep
                        </span>
                      </th>
                      <th className="text-right py-2 pl-4 text-xs font-medium text-silver-mist uppercase tracking-wide">
                        <span className="inline-flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> Water
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.activityLog.map((entry) => (
                      <tr
                        key={entry.date}
                        className="border-b border-cloud/50 dark:border-nebula-purple/20 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium text-ink-black dark:text-pearl whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-silver-mist" />
                            {entry.date}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-medium ${entry.steps >= 10000 ? 'text-aurora-green' : 'text-ink-black dark:text-pearl'}`}
                          >
                            {entry.steps.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-medium ${entry.exerciseMinutes >= 30 ? 'text-aurora-green' : entry.exerciseMinutes === 0 ? 'text-coral-alert' : 'text-ink-black dark:text-pearl'}`}
                          >
                            {entry.exerciseMinutes} min
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-medium ${entry.sleepHours >= 7 ? 'text-aurora-green' : entry.sleepHours < 6 ? 'text-coral-alert' : 'text-sunset-amber'}`}
                          >
                            {entry.sleepHours}h
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <span
                            className={`font-medium ${entry.waterIntake >= 8 ? 'text-aurora-green' : entry.waterIntake < 6 ? 'text-coral-alert' : 'text-sunset-amber'}`}
                          >
                            {entry.waterIntake} glasses
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Weekly averages */}
              <div className="mt-4 pt-4 border-t border-cloud dark:border-nebula-purple/30">
                <p className="text-xs font-medium text-silver-mist uppercase tracking-wide mb-3">
                  Weekly Averages
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Footprints className="w-4 h-4 text-celestial-indigo mx-auto mb-1" />
                    <p className="text-base font-bold text-ink-black dark:text-pearl">
                      {Math.round(
                        data.activityLog.reduce((s, e) => s + e.steps, 0) / data.activityLog.length
                      ).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-silver-mist">Avg Steps</p>
                  </div>
                  <div className="text-center">
                    <Dumbbell className="w-4 h-4 text-quantum-rose mx-auto mb-1" />
                    <p className="text-base font-bold text-ink-black dark:text-pearl">
                      {Math.round(
                        data.activityLog.reduce((s, e) => s + e.exerciseMinutes, 0) /
                          data.activityLog.length
                      )}{' '}
                      min
                    </p>
                    <p className="text-[11px] text-silver-mist">Avg Exercise</p>
                  </div>
                  <div className="text-center">
                    <Moon className="w-4 h-4 text-nebula-purple mx-auto mb-1" />
                    <p className="text-base font-bold text-ink-black dark:text-pearl">
                      {(
                        data.activityLog.reduce((s, e) => s + e.sleepHours, 0) /
                        data.activityLog.length
                      ).toFixed(1)}
                      h
                    </p>
                    <p className="text-[11px] text-silver-mist">Avg Sleep</p>
                  </div>
                  <div className="text-center">
                    <Droplets className="w-4 h-4 text-neural-mint mx-auto mb-1" />
                    <p className="text-base font-bold text-ink-black dark:text-pearl">
                      {Math.round(
                        data.activityLog.reduce((s, e) => s + e.waterIntake, 0) /
                          data.activityLog.length
                      )}
                    </p>
                    <p className="text-[11px] text-silver-mist">Avg Glasses</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple bar visualization */}
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aurora-green" />
                Steps — 7 Day Trend
              </h2>
              <div className="flex items-end gap-2 h-40">
                {data.activityLog
                  .slice()
                  .reverse()
                  .map((entry) => {
                    const maxSteps = Math.max(...data.activityLog.map((e) => e.steps));
                    const height = (entry.steps / maxSteps) * 100;
                    const meetsGoal = entry.steps >= 10000;
                    return (
                      <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-ink-black dark:text-pearl">
                          {(entry.steps / 1000).toFixed(1)}k
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all ${meetsGoal ? 'bg-aurora-green' : 'bg-celestial-indigo/60'}`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-silver-mist">{entry.date.slice(8)}</span>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-2 flex items-center gap-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-aurora-green" />
                  <span className="text-[11px] text-silver-mist">Goal met (10k+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-celestial-indigo/60" />
                  <span className="text-[11px] text-silver-mist">Below goal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB: Challenges                                                */}
        {/* ============================================================= */}
        {activeTab === 'challenges' && (
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-celestial-indigo" />
              Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.challenges.map((challenge) => {
                const config = statusConfig[challenge.status];
                const progressPercent = (challenge.progress / challenge.target) * 100;

                return (
                  <div
                    key={challenge.id}
                    className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}
                      >
                        {config.label}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-silver-mist">
                        <Users className="w-3.5 h-3.5" />
                        <span>{challenge.participants}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-silver-mist mt-1">{challenge.description}</p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-silver-mist">
                          {challenge.progress}/{challenge.target} {challenge.unit}
                        </span>
                        <span className="font-medium text-ink-black dark:text-pearl">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
                        <div
                          className={`h-full rounded-full transition-all ${
                            challenge.status === 'completed'
                              ? 'bg-aurora-green'
                              : 'bg-celestial-indigo'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-silver-mist">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{challenge.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-ink-black dark:text-pearl font-medium">
                          {challenge.reward} pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB: Badges                                                    */}
        {/* ============================================================= */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Earned Badges */}
            <div>
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-aurora-green" />
                Earned Badges
                <span className="text-xs font-normal text-silver-mist ml-1">
                  ({data.badges.filter((b) => b.earned).length}/{data.badges.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.badges
                  .filter((b) => b.earned)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-xl border border-aurora-green/30 dark:border-aurora-green/20 bg-aurora-green/5 dark:bg-aurora-green/10 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-aurora-green/10 dark:bg-aurora-green/20 flex items-center justify-center">
                          <BadgeIcon icon={badge.icon} className="w-5 h-5 text-aurora-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                              {badge.name}
                            </h3>
                            <Unlock className="w-3.5 h-3.5 text-aurora-green flex-shrink-0" />
                          </div>
                          <p className="text-xs text-silver-mist mt-0.5">{badge.description}</p>
                          <p className="text-[11px] text-aurora-green mt-1.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Earned {badge.earnedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Locked Badges */}
            <div>
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-silver-mist" />
                Locked Badges
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.badges
                  .filter((b) => !b.earned)
                  .map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 opacity-75"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cloud dark:bg-nebula-purple/20 flex items-center justify-center">
                          <BadgeIcon icon={badge.icon} className="w-5 h-5 text-silver-mist" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                              {badge.name}
                            </h3>
                            <Lock className="w-3.5 h-3.5 text-silver-mist flex-shrink-0" />
                          </div>
                          <p className="text-xs text-silver-mist mt-0.5">{badge.description}</p>
                          <p className="text-[11px] text-sunset-amber mt-1.5 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {badge.criteria}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB: Programs                                                  */}
        {/* ============================================================= */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            {/* Enrolled Programs */}
            <div>
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-aurora-green" />
                Enrolled Programs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.programs
                  .filter((p) => p.enrolled)
                  .map((program) => (
                    <div
                      key={program.id}
                      className="rounded-xl border border-aurora-green/30 dark:border-aurora-green/20 bg-aurora-green/5 dark:bg-aurora-green/10 p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-aurora-green/10 text-aurora-green">
                          Enrolled
                        </span>
                        <span className="text-xs text-silver-mist">{program.category}</span>
                      </div>
                      <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
                        {program.name}
                      </h3>
                      <p className="text-sm text-silver-mist mt-1">{program.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-silver-mist">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {program.startDate} — {program.endDate}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Available Programs */}
            <div>
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-celestial-indigo" />
                Available Programs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.programs
                  .filter((p) => !p.enrolled)
                  .map((program) => (
                    <div
                      key={program.id}
                      className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-celestial-indigo/10 text-celestial-indigo">
                          {program.category}
                        </span>
                        {program.spotsLeft !== null && (
                          <span className="text-xs text-sunset-amber font-medium">
                            {program.spotsLeft} spots left
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
                        {program.name}
                      </h3>
                      <p className="text-sm text-silver-mist mt-1">{program.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-silver-mist">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {program.startDate} — {program.endDate}
                          </span>
                        </div>
                        <button className="inline-flex items-center gap-1 text-xs font-medium text-celestial-indigo hover:text-celestial-indigo/80 transition-colors">
                          Enroll <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB: Mental Health Resources                                   */}
        {/* ============================================================= */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-nebula-purple" />
                Mental Health &amp; Wellbeing Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.mentalHealthResources.map((resource) => {
                  const categoryColors: Record<string, string> = {
                    eap: 'bg-coral-alert/10 text-coral-alert',
                    counseling: 'bg-celestial-indigo/10 text-celestial-indigo',
                    meditation: 'bg-nebula-purple/10 text-nebula-purple',
                    stress: 'bg-neural-mint/10 text-neural-mint',
                  };
                  const categoryLabel: Record<string, string> = {
                    eap: 'EAP',
                    counseling: 'Counseling',
                    meditation: 'Meditation',
                    stress: 'Stress Management',
                  };
                  return (
                    <div
                      key={resource.id}
                      className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-nebula-purple/10 dark:bg-nebula-purple/20 flex items-center justify-center">
                          <ResourceIcon
                            category={resource.category}
                            className="w-5 h-5 text-nebula-purple"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                              {resource.title}
                            </h3>
                          </div>
                          <span
                            className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-2 ${categoryColors[resource.category] || 'bg-cloud text-silver-mist'}`}
                          >
                            {categoryLabel[resource.category] || resource.category}
                          </span>
                          <p className="text-xs text-silver-mist">{resource.description}</p>
                          <div className="mt-3 flex items-center gap-2">
                            {resource.available ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-aurora-green font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-silver-mist font-medium">
                                <Clock className="w-3 h-3" /> Coming Soon
                              </span>
                            )}
                            <span className="text-[11px] text-silver-mist">&middot;</span>
                            <span className="text-[11px] text-celestial-indigo flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {resource.contactOrLink}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick support */}
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-gradient-to-r from-nebula-purple/5 to-quantum-rose/5 dark:from-nebula-purple/10 dark:to-quantum-rose/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral-alert/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-coral-alert" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                    Need immediate support?
                  </h3>
                  <p className="text-xs text-silver-mist mt-0.5">
                    Contact the Employee Assistance Program 24/7 at{' '}
                    <span className="font-medium text-ink-black dark:text-pearl">
                      1-800-555-0199
                    </span>{' '}
                    — confidential and free for all employees and family members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
