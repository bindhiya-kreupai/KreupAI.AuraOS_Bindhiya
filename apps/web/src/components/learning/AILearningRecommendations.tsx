/**
 * @module AILearningRecommendations
 * @description AI-powered personalized learning recommendations —
 *              role/skill-gap–based suggestions, trending courses in
 *              the organization, and career-aligned picks
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  Star,
  Users,
  Play,
  Flame,
  Award,
  Briefcase,
  Zap,
  Video,
  FileText,
  Wrench,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type RecommendationSource =
  | 'skill_gap'
  | 'role_based'
  | 'career_path'
  | 'peer_popular'
  | 'manager_assigned'
  | 'ai_suggested';
export type CourseFormat =
  | 'video'
  | 'article'
  | 'workshop'
  | 'interactive'
  | 'project'
  | 'certification';
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  provider: string;
  format: CourseFormat;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rating: number;
  ratingCount: number;
  enrolledCount: number;
  skills: string[];
  matchScore: number;
  source: RecommendationSource;
  urgency: UrgencyLevel;
  reason: string;
  thumbnailEmoji: string;
  isBookmarked: boolean;
  isEnrolled: boolean;
  completionRate?: number;
  instructor?: string;
  cost: 'free' | 'included' | 'paid';
}

export interface TrendingCourse {
  id: string;
  title: string;
  provider: string;
  format: CourseFormat;
  enrollmentsThisWeek: number;
  enrollmentsGrowth: number;
  rating: number;
  duration: string;
  skills: string[];
  thumbnailEmoji: string;
  department: string;
  rank: number;
}

export interface RoleSkillProfile {
  role: string;
  department: string;
  skillsCovered: number;
  skillsRequired: number;
  topGaps: string[];
  readinessScore: number;
}

export interface AILearningRecommendationsProps {
  recommendations?: AIRecommendation[];
  trending?: TrendingCourse[];
  profile?: RoleSkillProfile;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const FORMAT_CONFIG: Record<CourseFormat, { icon: LucideIcon; label: string; color: string }> = {
  video: { icon: Video, label: 'Video', color: 'text-celestial-indigo' },
  article: { icon: FileText, label: 'Article', color: 'text-neural-mint' },
  workshop: { icon: Users, label: 'Workshop', color: 'text-quantum-rose' },
  interactive: { icon: Zap, label: 'Interactive', color: 'text-sunset-amber' },
  project: { icon: Wrench, label: 'Project', color: 'text-coral-alert' },
  certification: { icon: Award, label: 'Certification', color: 'text-celestial-indigo' },
};

const SOURCE_LABELS: Record<
  RecommendationSource,
  { label: string; icon: LucideIcon; color: string }
> = {
  skill_gap: { label: 'Skill Gap', icon: Target, color: 'text-coral-alert bg-coral-alert/10' },
  role_based: {
    label: 'Role Based',
    icon: Briefcase,
    color: 'text-celestial-indigo bg-celestial-indigo/10',
  },
  career_path: {
    label: 'Career Path',
    icon: TrendingUp,
    color: 'text-neural-mint bg-neural-mint/10',
  },
  peer_popular: { label: 'Popular', icon: Users, color: 'text-quantum-rose bg-quantum-rose/10' },
  manager_assigned: {
    label: 'Manager Pick',
    icon: Star,
    color: 'text-sunset-amber bg-sunset-amber/10',
  },
  ai_suggested: {
    label: 'AI Suggested',
    icon: Sparkles,
    color: 'text-celestial-indigo bg-celestial-indigo/10',
  },
};

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
  high: { label: 'High', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
  medium: { label: 'Medium', color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10' },
  low: { label: 'Low', color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_PROFILE: RoleSkillProfile = {
  role: 'Senior Full-Stack Engineer',
  department: 'Engineering',
  skillsCovered: 14,
  skillsRequired: 20,
  topGaps: [
    'System Design',
    'Cloud Architecture',
    'Team Leadership',
    'Performance Optimization',
    'Security Best Practices',
  ],
  readinessScore: 68,
};

const MOCK_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'ar-1',
    title: 'System Design for Senior Engineers',
    description:
      'Master distributed systems, load balancing, caching strategies, and microservice architectures. Required for Staff+ promotion track.',
    provider: 'Internal L&D',
    format: 'video',
    duration: '16h',
    level: 'advanced',
    rating: 4.9,
    ratingCount: 234,
    enrolledCount: 892,
    skills: ['System Design', 'Distributed Systems', 'Scalability'],
    matchScore: 97,
    source: 'skill_gap',
    urgency: 'critical',
    reason:
      'Closes your #1 skill gap for the Staff Engineer role. 92% of promoted Staff Engineers completed this.',
    thumbnailEmoji: '🏗️',
    isBookmarked: false,
    isEnrolled: false,
    instructor: 'Alex Xu',
    cost: 'included',
  },
  {
    id: 'ar-2',
    title: 'AWS Solutions Architect — Associate Prep',
    description:
      'Hands-on cloud architecture with VPC, EC2, S3, Lambda, and infrastructure-as-code. Includes practice exams.',
    provider: 'AWS Training',
    format: 'certification',
    duration: '40h',
    level: 'advanced',
    rating: 4.8,
    ratingCount: 567,
    enrolledCount: 1245,
    skills: ['Cloud Architecture', 'AWS', 'Infrastructure'],
    matchScore: 94,
    source: 'role_based',
    urgency: 'high',
    reason:
      'Cloud Architecture is required for Senior Engineer II. Your team is migrating to AWS Q3.',
    thumbnailEmoji: '☁️',
    isBookmarked: true,
    isEnrolled: false,
    cost: 'included',
  },
  {
    id: 'ar-3',
    title: 'Engineering Leadership Foundations',
    description:
      'Transition from IC to tech lead. Covers mentoring, code reviews at scale, technical vision, and cross-team influence.',
    provider: 'Leadership Academy',
    format: 'workshop',
    duration: '12h',
    level: 'intermediate',
    rating: 4.7,
    ratingCount: 189,
    enrolledCount: 456,
    skills: ['Team Leadership', 'Mentoring', 'Communication'],
    matchScore: 91,
    source: 'career_path',
    urgency: 'high',
    reason:
      'Aligned with your career goal: Engineering Manager. Your manager flagged leadership as a growth area.',
    thumbnailEmoji: '👥',
    isBookmarked: false,
    isEnrolled: false,
    instructor: 'Will Larson',
    cost: 'included',
  },
  {
    id: 'ar-4',
    title: 'Web Performance Optimization Masterclass',
    description:
      'Core Web Vitals, bundle optimization, rendering patterns, caching strategies, and performance budgets.',
    provider: 'Frontend Masters',
    format: 'video',
    duration: '8h',
    level: 'advanced',
    rating: 4.6,
    ratingCount: 312,
    enrolledCount: 678,
    skills: ['Performance Optimization', 'Web Vitals', 'React'],
    matchScore: 88,
    source: 'ai_suggested',
    urgency: 'medium',
    reason:
      'Based on your recent project work on the dashboard — performance optimization would boost your impact.',
    thumbnailEmoji: '⚡',
    isBookmarked: false,
    isEnrolled: false,
    instructor: 'Todd Motto',
    cost: 'free',
  },
  {
    id: 'ar-5',
    title: 'OWASP Top 10 — Secure Coding Practices',
    description:
      'Prevent XSS, CSRF, SQL injection, and other security vulnerabilities. Includes code review exercises.',
    provider: 'Security Team',
    format: 'interactive',
    duration: '6h',
    level: 'intermediate',
    rating: 4.5,
    ratingCount: 156,
    enrolledCount: 423,
    skills: ['Security Best Practices', 'OWASP', 'Secure Coding'],
    matchScore: 85,
    source: 'manager_assigned',
    urgency: 'high',
    reason: 'Assigned by your manager. Mandatory for all engineers handling customer data by Q2.',
    thumbnailEmoji: '🔒',
    isBookmarked: false,
    isEnrolled: false,
    cost: 'included',
  },
  {
    id: 'ar-6',
    title: 'Advanced TypeScript Patterns',
    description:
      'Template literal types, conditional types, branded types, and type-safe API patterns used in production.',
    provider: 'Total TypeScript',
    format: 'video',
    duration: '10h',
    level: 'advanced',
    rating: 4.9,
    ratingCount: 445,
    enrolledCount: 1567,
    skills: ['TypeScript', 'Type Safety', 'API Design'],
    matchScore: 82,
    source: 'peer_popular',
    urgency: 'low',
    reason: '78% of engineers on your team enrolled this month. Top-rated course in Engineering.',
    thumbnailEmoji: '🔷',
    isBookmarked: false,
    isEnrolled: true,
    completionRate: 45,
    instructor: 'Matt Pocock',
    cost: 'included',
  },
  {
    id: 'ar-7',
    title: 'Technical Writing for Engineers',
    description:
      'Write clear RFCs, ADRs, postmortems, and documentation. Improve async communication skills.',
    provider: 'Internal L&D',
    format: 'article',
    duration: '4h',
    level: 'beginner',
    rating: 4.3,
    ratingCount: 98,
    enrolledCount: 234,
    skills: ['Communication', 'Documentation', 'Technical Writing'],
    matchScore: 76,
    source: 'ai_suggested',
    urgency: 'low',
    reason:
      'AI analysis of your peer feedback: "could improve written communication". Quick win course.',
    thumbnailEmoji: '📝',
    isBookmarked: false,
    isEnrolled: false,
    cost: 'free',
  },
  {
    id: 'ar-8',
    title: 'Database Performance & Query Optimization',
    description:
      'PostgreSQL internals, index tuning, query plans, connection pooling, and read replicas at scale.',
    provider: 'Coursera',
    format: 'project',
    duration: '14h',
    level: 'advanced',
    rating: 4.7,
    ratingCount: 278,
    enrolledCount: 890,
    skills: ['PostgreSQL', 'Database Design', 'Query Optimization'],
    matchScore: 73,
    source: 'skill_gap',
    urgency: 'medium',
    reason: 'Database skills gap detected. Your team owns 3 high-traffic database services.',
    thumbnailEmoji: '🗄️',
    isBookmarked: false,
    isEnrolled: false,
    cost: 'paid',
  },
];

const MOCK_TRENDING: TrendingCourse[] = [
  {
    id: 'tr-1',
    title: 'AI-Assisted Development with Copilot',
    provider: 'GitHub',
    format: 'interactive',
    enrollmentsThisWeek: 89,
    enrollmentsGrowth: 156,
    rating: 4.8,
    duration: '6h',
    skills: ['AI Tools', 'Productivity'],
    thumbnailEmoji: '🤖',
    department: 'Engineering',
    rank: 1,
  },
  {
    id: 'tr-2',
    title: 'React Server Components Deep Dive',
    provider: 'Vercel',
    format: 'video',
    enrollmentsThisWeek: 67,
    enrollmentsGrowth: 120,
    rating: 4.7,
    duration: '8h',
    skills: ['React', 'Next.js'],
    thumbnailEmoji: '⚛️',
    department: 'Engineering',
    rank: 2,
  },
  {
    id: 'tr-3',
    title: 'Data Privacy & GDPR Compliance',
    provider: 'Legal Team',
    format: 'article',
    enrollmentsThisWeek: 54,
    enrollmentsGrowth: 45,
    rating: 4.4,
    duration: '3h',
    skills: ['Compliance', 'Privacy'],
    thumbnailEmoji: '🛡️',
    department: 'All Departments',
    rank: 3,
  },
  {
    id: 'tr-4',
    title: 'Effective Remote Collaboration',
    provider: 'People Team',
    format: 'workshop',
    enrollmentsThisWeek: 48,
    enrollmentsGrowth: 32,
    rating: 4.6,
    duration: '4h',
    skills: ['Communication', 'Teamwork'],
    thumbnailEmoji: '🌐',
    department: 'All Departments',
    rank: 4,
  },
  {
    id: 'tr-5',
    title: 'Kubernetes for Developers',
    provider: 'CNCF',
    format: 'interactive',
    enrollmentsThisWeek: 42,
    enrollmentsGrowth: 78,
    rating: 4.5,
    duration: '12h',
    skills: ['Kubernetes', 'DevOps'],
    thumbnailEmoji: '🐳',
    department: 'Engineering',
    rank: 5,
  },
  {
    id: 'tr-6',
    title: 'Product Thinking for Engineers',
    provider: 'Product Team',
    format: 'workshop',
    enrollmentsThisWeek: 38,
    enrollmentsGrowth: 67,
    rating: 4.8,
    duration: '5h',
    skills: ['Product Sense', 'Strategy'],
    thumbnailEmoji: '💡',
    department: 'Engineering',
    rank: 6,
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const AILearningRecommendations: React.FC<AILearningRecommendationsProps> = ({
  recommendations = MOCK_RECOMMENDATIONS,
  trending = MOCK_TRENDING,
  profile = MOCK_PROFILE,
}) => {
  const [sourceFilter, setSourceFilter] = useState<RecommendationSource | 'all'>('all');
  const [bookmarked, setBookmarked] = useState<Set<string>>(
    () => new Set(recommendations.filter((r) => r.isBookmarked).map((r) => r.id))
  );
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [expandedRec, _setExpandedRec] = useState<string | null>(null);
  const [showAllTrending, setShowAllTrending] = useState(false);

  const filteredRecs = useMemo(() => {
    let recs = [...recommendations];
    if (sourceFilter !== 'all') {
      recs = recs.filter((r) => r.source === sourceFilter);
    }
    return recs.sort((a, b) => b.matchScore - a.matchScore);
  }, [recommendations, sourceFilter]);

  const sources = useMemo(() => {
    const counts: Record<string, number> = {};
    recommendations.forEach((r) => {
      counts[r.source] = (counts[r.source] || 0) + 1;
    });
    return counts;
  }, [recommendations]);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const giveFeedback = (id: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? (undefined as unknown as 'up') : type,
    }));
  };

  const displayedTrending = showAllTrending ? trending : trending.slice(0, 4);

  return (
    <div className="space-y-3">
      {/* AI Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-celestial-indigo to-quantum-rose flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-ink-black dark:text-pearl">
            AI Learning Recommendations
          </p>
          <p className="text-[8px] text-silver-mist">
            Personalized for {profile.role} • {profile.department}
          </p>
        </div>
      </div>

      {/* Role Readiness Card */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-celestial-indigo" /> Role Readiness
            </p>
            <p className="text-[8px] text-silver-mist">
              {profile.skillsCovered}/{profile.skillsRequired} skills covered for {profile.role}
            </p>
          </div>
          <div className="text-center">
            <p
              className={`text-[20px] font-black ${profile.readinessScore >= 80 ? 'text-neural-mint' : profile.readinessScore >= 60 ? 'text-sunset-amber' : 'text-coral-alert'}`}
            >
              {profile.readinessScore}%
            </p>
            <p className="text-[7px] text-silver-mist font-bold">MATCH</p>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-cloud dark:bg-nebula-purple/20 mb-2">
          <div
            className={`h-full rounded-full transition-all ${profile.readinessScore >= 80 ? 'bg-neural-mint' : profile.readinessScore >= 60 ? 'bg-sunset-amber' : 'bg-coral-alert'}`}
            style={{ width: `${profile.readinessScore}%` }}
          />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[7px] font-bold text-silver-mist mr-1">Top Gaps:</span>
          {profile.topGaps.map((gap) => (
            <span
              key={gap}
              className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-coral-alert/10 text-coral-alert"
            >
              {gap}
            </span>
          ))}
        </div>
      </div>

      {/* Source Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setSourceFilter('all')}
          className={`px-2 py-1 rounded-lg text-[8px] font-bold transition-colors ${
            sourceFilter === 'all'
              ? 'bg-celestial-indigo text-white'
              : 'bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist hover:text-celestial-indigo'
          }`}
        >
          All ({recommendations.length})
        </button>
        {Object.entries(sources).map(([src, count]) => {
          const cfg = SOURCE_LABELS[src as RecommendationSource];
          const SourceIcon = cfg.icon;
          return (
            <button
              key={src}
              onClick={() => setSourceFilter(src as RecommendationSource)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold transition-colors ${
                sourceFilter === src
                  ? 'bg-celestial-indigo text-white'
                  : 'bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist hover:text-celestial-indigo'
              }`}
            >
              <SourceIcon className="w-2.5 h-2.5" /> {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Personalized Recommendations */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-celestial-indigo" /> For You ({filteredRecs.length})
        </p>

        {filteredRecs.map((rec) => {
          const fmtCfg = FORMAT_CONFIG[rec.format];
          const FormatIcon = fmtCfg.icon;
          const srcCfg = SOURCE_LABELS[rec.source];
          const SrcIcon = srcCfg.icon;
          const urgCfg = URGENCY_CONFIG[rec.urgency];
          const _isExpanded = expandedRec === rec.id;

          return (
            <div
              key={rec.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-celestial-indigo/10 flex items-center justify-center text-lg shrink-0">
                    {rec.thumbnailEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                        {rec.title}
                      </p>
                      {rec.urgency !== 'low' && (
                        <span
                          className={`px-1 py-0.5 rounded text-[6px] font-bold ${urgCfg.color} ${urgCfg.bg}`}
                        >
                          {urgCfg.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span
                        className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] font-bold ${srcCfg.color}`}
                      >
                        <SrcIcon className="w-2.5 h-2.5" /> {srcCfg.label}
                      </span>
                      <span className={`flex items-center gap-0.5 text-[7px] ${fmtCfg.color}`}>
                        <FormatIcon className="w-2.5 h-2.5" /> {fmtCfg.label}
                      </span>
                      <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {rec.duration}
                      </span>
                      <span className="text-[7px] text-sunset-amber flex items-center gap-0.5 font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" /> {rec.rating}
                      </span>
                      <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" /> {rec.enrolledCount.toLocaleString()}
                      </span>
                      {rec.cost === 'free' && (
                        <span className="px-1 py-0.5 rounded text-[6px] font-bold text-neural-mint bg-neural-mint/10">
                          FREE
                        </span>
                      )}
                    </div>

                    {/* AI Reason */}
                    <div className="mt-1.5 px-2 py-1 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
                      <p className="text-[8px] text-celestial-indigo flex items-start gap-1">
                        <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{rec.reason}</span>
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {rec.skills.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded-full text-[6px] font-bold bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="text-center shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        rec.matchScore >= 90
                          ? 'border-neural-mint'
                          : rec.matchScore >= 80
                            ? 'border-celestial-indigo'
                            : 'border-sunset-amber'
                      }`}
                    >
                      <span
                        className={`text-[11px] font-black ${
                          rec.matchScore >= 90
                            ? 'text-neural-mint'
                            : rec.matchScore >= 80
                              ? 'text-celestial-indigo'
                              : 'text-sunset-amber'
                        }`}
                      >
                        {rec.matchScore}%
                      </span>
                    </div>
                    <p className="text-[6px] text-silver-mist font-bold mt-0.5">MATCH</p>
                  </div>
                </div>

                {/* Enrolled progress */}
                {rec.isEnrolled && rec.completionRate !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[7px] mb-0.5">
                      <span className="text-silver-mist">In Progress</span>
                      <span className="font-bold text-celestial-indigo">{rec.completionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
                      <div
                        className="h-full rounded-full bg-celestial-indigo"
                        style={{ width: `${rec.completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-3 py-2 border-t border-cloud/50 dark:border-nebula-purple/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(rec.id)}
                    className={`p-1 rounded transition-colors ${bookmarked.has(rec.id) ? 'text-sunset-amber' : 'text-silver-mist hover:text-sunset-amber'}`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${bookmarked.has(rec.id) ? 'fill-current' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => giveFeedback(rec.id, 'up')}
                    className={`p-1 rounded transition-colors ${feedback[rec.id] === 'up' ? 'text-neural-mint' : 'text-silver-mist hover:text-neural-mint'}`}
                  >
                    <ThumbsUp
                      className={`w-3 h-3 ${feedback[rec.id] === 'up' ? 'fill-current' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => giveFeedback(rec.id, 'down')}
                    className={`p-1 rounded transition-colors ${feedback[rec.id] === 'down' ? 'text-coral-alert' : 'text-silver-mist hover:text-coral-alert'}`}
                  >
                    <ThumbsDown
                      className={`w-3 h-3 ${feedback[rec.id] === 'down' ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                {rec.isEnrolled ? (
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity">
                    <Play className="w-3 h-3" /> Continue
                  </button>
                ) : (
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity">
                    <BookOpen className="w-3 h-3" /> Enroll
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending in Organization */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        <div className="px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 flex items-center justify-between">
          <p className="text-[10px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-coral-alert" /> Trending in Your Organization
          </p>
          <span className="text-[7px] text-silver-mist">This week</span>
        </div>

        {displayedTrending.map((course, _idx) => {
          const fmtCfg = FORMAT_CONFIG[course.format];
          const FormatIcon = fmtCfg.icon;
          return (
            <div
              key={course.id}
              className="flex items-center gap-3 px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 last:border-b-0 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/10 transition-colors"
            >
              <span
                className={`text-[12px] font-black w-5 shrink-0 ${
                  course.rank === 1
                    ? 'text-sunset-amber'
                    : course.rank === 2
                      ? 'text-silver-mist'
                      : course.rank === 3
                        ? 'text-[#CD7F32]'
                        : 'text-silver-mist/50'
                }`}
              >
                #{course.rank}
              </span>
              <div className="w-8 h-8 rounded-lg bg-celestial-indigo/10 flex items-center justify-center text-sm shrink-0">
                {course.thumbnailEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-ink-black dark:text-pearl truncate">
                  {course.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`flex items-center gap-0.5 text-[7px] ${fmtCfg.color}`}>
                    <FormatIcon className="w-2.5 h-2.5" /> {fmtCfg.label}
                  </span>
                  <span className="text-[7px] text-silver-mist">{course.provider}</span>
                  <span className="text-[7px] text-silver-mist">{course.duration}</span>
                  <span className="text-[7px] text-sunset-amber font-bold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" /> {course.rating}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-bold text-ink-black dark:text-pearl">
                  {course.enrollmentsThisWeek}
                </p>
                <p className="text-[7px] text-neural-mint font-bold flex items-center gap-0.5 justify-end">
                  <TrendingUp className="w-2.5 h-2.5" /> +{course.enrollmentsGrowth}%
                </p>
              </div>
            </div>
          );
        })}

        {trending.length > 4 && (
          <button
            onClick={() => setShowAllTrending(!showAllTrending)}
            className="w-full px-3 py-2 text-[8px] font-bold text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors flex items-center justify-center gap-1"
          >
            {showAllTrending ? 'Show Less' : `Show All (${trending.length})`}
            {showAllTrending ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* AI Insight */}
      <div className="rounded-xl border border-celestial-indigo/20 bg-gradient-to-r from-celestial-indigo/5 to-quantum-rose/5 p-3">
        <p className="text-[9px] font-bold text-celestial-indigo flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5" /> AI Career Insight
        </p>
        <p className="text-[8px] text-ink-black dark:text-pearl leading-relaxed">
          Based on your skill profile, peer benchmarks, and career trajectory, completing the top 3
          recommended courses would increase your role readiness from{' '}
          <strong className="text-sunset-amber">{profile.readinessScore}%</strong> to an estimated{' '}
          <strong className="text-neural-mint">89%</strong>. Engineers who reached 85%+ readiness
          were promoted 2.3x faster on average. Focus on <strong>System Design</strong> and{' '}
          <strong>Cloud Architecture</strong> first for the highest impact.
        </p>
      </div>
    </div>
  );
};

export default AILearningRecommendations;
