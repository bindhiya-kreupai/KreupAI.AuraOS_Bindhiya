/**
 * @module LearningDashboard
 * @description Personal L&D overview — learning streak, in-progress courses,
 *              recommended section, learning path cards, achievement badges (Sec 21.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  Star,
  Zap,
  ArrowRight,
  Target,
} from 'lucide-react';
import {
  LearningCatalogService,
  COURSE_CATEGORY_META,
  COURSE_LEVEL_META,
  type Course,
  type LearningPath,
  type LearningAnalytics,
} from '@/services/learningCatalogService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ── Progress Ring (SVG) ────────────────────────────────────────────────────────

function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 5,
  color = '#6366f1',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;
  const cx = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

// ── Inline Sparkline ──────────────────────────────────────────────────────────

function ActivitySparkline({ data }: { data: { month: string; hours: number }[] }) {
  const max = Math.max(...data.map((d) => d.hours), 1);
  const W = 120;
  const H = 32;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.hours / max) * H;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `0,${H} ${polyline} ${W},${H}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark-grad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Course Card (In-Progress) ──────────────────────────────────────────────────

function InProgressCard({
  course,
  onContinue,
}: {
  course: Course;
  onContinue: (course: Course) => void;
}) {
  const catMeta = COURSE_CATEGORY_META[course.category];
  const lvlMeta = COURSE_LEVEL_META[course.level];

  return (
    <div className="bg-white rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all">
      {/* Progress Ring + Emoji */}
      <div className="relative flex-shrink-0">
        <ProgressRing progress={course.progress} size={56} />
        <span className="absolute inset-0 flex items-center justify-center text-xl">
          {course.thumbnailEmoji}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {course.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${catMeta.bgColor} ${catMeta.color}`}
              >
                {catMeta.label}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${lvlMeta.bgColor} ${lvlMeta.color}`}
              >
                {lvlMeta.label}
              </span>
            </div>
          </div>
          <span className="text-sm font-bold text-indigo-600 flex-shrink-0">
            {course.progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${course.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(course.duration)}
          </span>
          <button
            onClick={() => onContinue(course)}
            className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            <Play className="w-3 h-3 fill-indigo-600" />
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Recommended Course Card ────────────────────────────────────────────────────

function RecommendedCard({
  course,
  onEnroll,
}: {
  course: Course;
  onEnroll: (course: Course) => void;
}) {
  const _catMeta = COURSE_CATEGORY_META[course.category];
  const lvlMeta = COURSE_LEVEL_META[course.level];

  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-all w-56 flex-shrink-0">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{course.thumbnailEmoji}</span>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-gray-700">{course.rating}</span>
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {course.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${lvlMeta.bgColor} ${lvlMeta.color}`}
        >
          {lvlMeta.label}
        </span>
        <span className="text-xs text-gray-400">{formatDuration(course.duration)}</span>
      </div>
      <button
        onClick={() => onEnroll(course)}
        className="mt-auto w-full py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
      >
        Enroll Free
      </button>
    </div>
  );
}

// ── Learning Path Card ─────────────────────────────────────────────────────────

function LearningPathCard({
  path,
  onClick,
}: {
  path: LearningPath;
  onClick: (path: LearningPath) => void;
}) {
  return (
    <button
      onClick={() => onClick(path)}
      className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{path.thumbnailEmoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{path.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {path.courses.length} courses · {path.estimatedWeeks} weeks
          </p>
        </div>
        {path.isEnrolled && (
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
            Enrolled
          </span>
        )}
      </div>

      {path.isEnrolled && (
        <>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${path.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{path.progress}% complete</span>
            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              Continue <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </>
      )}

      {!path.isEnrolled && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {path.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400">{path.completionRate}% pass rate</span>
        </div>
      )}
    </button>
  );
}

// ── Achievement Badge ──────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, { emoji: string; color: string }> = {
  'First Course': { emoji: '🎯', color: 'bg-blue-50' },
  'Compliance Champion': { emoji: '🛡️', color: 'bg-red-50' },
  'Quick Learner': { emoji: '⚡', color: 'bg-amber-50' },
  'Month Streak': { emoji: '🔥', color: 'bg-orange-50' },
  'Team Player': { emoji: '🤝', color: 'bg-emerald-50' },
  Certified: { emoji: '🏅', color: 'bg-violet-50' },
};

function AchievementBadge({ name }: { name: string }) {
  const cfg = BADGE_CONFIG[name] ?? { emoji: '⭐', color: 'bg-gray-50' };
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${cfg.color}`}>
      <span className="text-2xl">{cfg.emoji}</span>
      <span className="text-xs font-medium text-gray-600 text-center leading-tight max-w-16">
        {name}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface LearningDashboardProps {
  onViewCatalog?: () => void;
  onViewPath?: (pathId: string) => void;
  onViewSkillGap?: () => void;
  onContinueCourse?: (courseId: string) => void;
}

export function LearningDashboard({
  onViewCatalog,
  onViewPath,
  onViewSkillGap,
  onContinueCourse,
}: LearningDashboardProps) {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [inProgress, setInProgress] = useState<Course[]>([]);
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ana, myLearning, allPaths] = await Promise.all([
        LearningCatalogService.getLearningAnalytics(),
        LearningCatalogService.getMyLearning('emp-current'),
        LearningCatalogService.getLearningPaths(),
      ]);
      setAnalytics(ana);
      setInProgress(myLearning.inProgress);
      setRecommended(myLearning.recommended);
      setPaths(allPaths);
      setLoading(false);
    };
    load();
  }, []);

  const handleEnroll = async (course: Course) => {
    const updated = await LearningCatalogService.enrollCourse(course.id, 'emp-current');
    setRecommended((prev) => prev.filter((c) => c.id !== updated.id));
    setInProgress((prev) => [updated, ...prev]);
  };

  if (loading || !analytics) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-indigo-200 font-medium">Welcome back!</p>
            <h1 className="text-2xl font-bold mt-0.5">Keep Learning</h1>
            <p className="text-sm text-indigo-200 mt-1">
              {analytics.hoursLearnedThisMonth}h this month
            </p>
          </div>
          <div className="flex flex-col items-center bg-white/20 rounded-2xl px-4 py-3">
            <Flame className="w-6 h-6 text-amber-300" />
            <span className="text-2xl font-bold mt-1">{analytics.learningStreak}</span>
            <span className="text-xs text-indigo-200">day streak</span>
          </div>
        </div>

        {/* Activity sparkline */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-indigo-200 mb-1">Hours this period</p>
            <ActivitySparkline
              data={analytics.monthlyActivity.map((m) => ({ month: m.month, hours: m.hours }))}
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-200">Total learning</p>
            <p className="text-xl font-bold">{analytics.hoursLearnedTotal}h</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: BookOpen,
            label: 'Enrolled',
            value: analytics.totalEnrollments,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            icon: CheckCircle,
            label: 'Completion',
            value: `${analytics.completionRate}%`,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            icon: Star,
            label: 'Avg Rating',
            value: analytics.averageRating,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* In-Progress */}
      {inProgress.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-500 fill-indigo-500" />
              Continue Learning
            </h2>
          </div>
          <div className="space-y-3">
            {inProgress.map((course) => (
              <InProgressCard
                key={course.id}
                course={course}
                onContinue={(c) => onContinueCourse?.(c.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Recommended For You
            </h2>
            <button
              onClick={onViewCatalog}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible">
            {recommended.map((course) => (
              <RecommendedCard key={course.id} course={course} onEnroll={handleEnroll} />
            ))}
          </div>
        </section>
      )}

      {/* Learning Paths */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            Learning Paths
          </h2>
        </div>
        <div className="space-y-2">
          {paths.slice(0, 3).map((path) => (
            <LearningPathCard key={path.id} path={path} onClick={(p) => onViewPath?.(p.id)} />
          ))}
        </div>
      </section>

      {/* Skill Gap CTA */}
      <button
        onClick={onViewSkillGap}
        className="w-full flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Skill Gap Analysis</p>
            <p className="text-xs text-gray-500 mt-0.5">See what skills to develop next</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-amber-600" />
      </button>

      {/* Achievement Badges */}
      {analytics.achievementBadges.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">Achievements</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {analytics.achievementBadges.map((badge) => (
              <AchievementBadge key={badge} name={badge} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default LearningDashboard;
