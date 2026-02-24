/**
 * @module SkillGapRecommendations
 * @description Learning recommendations linked to identified skill gaps,
 *              with relevance scores, provider info, and enrollment actions
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  GraduationCap,
  Video,
  Users,
  Award,
  Briefcase,
  Clock,
  Zap,
  ChevronRight,
  Filter,
  Star,
  CheckCircle2,
  Play,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type LearningType = 'course' | 'workshop' | 'mentoring' | 'certification' | 'on_the_job' | 'video';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type EnrollmentStatus = 'not_enrolled' | 'enrolled' | 'in_progress' | 'completed';

export interface LearningRecommendation {
  id: string;
  title: string;
  description: string;
  type: LearningType;
  provider: string;
  duration: string;
  difficulty: DifficultyLevel;
  relevanceScore: number;
  bridgesSkills: string[];
  gapReduction: number;
  url?: string;
  rating?: number;
  enrolledCount?: number;
  cost?: string;
  enrollmentStatus: EnrollmentStatus;
  isFeatured?: boolean;
}

export interface SkillGapRecommendationsProps {
  recommendations: LearningRecommendation[];
  onEnroll?: (id: string) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  LearningType,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  course: {
    label: 'Course',
    icon: BookOpen,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  workshop: {
    label: 'Workshop',
    icon: Users,
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10',
  },
  mentoring: {
    label: 'Mentoring',
    icon: GraduationCap,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
  },
  certification: {
    label: 'Certification',
    icon: Award,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  on_the_job: {
    label: 'On-the-Job',
    icon: Briefcase,
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10',
  },
  video: {
    label: 'Video',
    icon: Video,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
};

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'text-neural-mint' },
  intermediate: { label: 'Intermediate', color: 'text-celestial-indigo' },
  advanced: { label: 'Advanced', color: 'text-sunset-amber' },
  expert: { label: 'Expert', color: 'text-coral-alert' },
};

const STATUS_CONFIG: Record<
  EnrollmentStatus,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  not_enrolled: {
    label: 'Enroll',
    icon: ChevronRight,
    color: 'text-white',
    bg: 'bg-celestial-indigo hover:bg-celestial-indigo/90',
  },
  enrolled: {
    label: 'Start',
    icon: Play,
    color: 'text-white',
    bg: 'bg-neural-mint hover:bg-neural-mint/90',
  },
  in_progress: {
    label: 'Continue',
    icon: Play,
    color: 'text-white',
    bg: 'bg-sunset-amber hover:bg-sunset-amber/90',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
  },
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_RECOMMENDATIONS: LearningRecommendation[] = [
  {
    id: 'lr-1',
    title: 'Advanced System Design Patterns',
    description:
      'Master distributed system architecture, microservices patterns, and scalability principles used by top tech companies.',
    type: 'course',
    provider: 'Udemy Business',
    duration: '14h 30m',
    difficulty: 'advanced',
    relevanceScore: 97,
    bridgesSkills: ['System Design', 'Data Modeling'],
    gapReduction: 2,
    rating: 4.8,
    enrolledCount: 2340,
    cost: 'Included',
    enrollmentStatus: 'not_enrolled',
    isFeatured: true,
  },
  {
    id: 'lr-2',
    title: 'DevOps for Frontend Engineers',
    description:
      'CI/CD pipelines, containerization, infrastructure as code, and deployment strategies for modern web applications.',
    type: 'workshop',
    provider: 'Internal L&D',
    duration: '4h Workshop',
    difficulty: 'intermediate',
    relevanceScore: 92,
    bridgesSkills: ['DevOps/CI-CD'],
    gapReduction: 2,
    rating: 4.6,
    enrolledCount: 156,
    cost: 'Free',
    enrollmentStatus: 'enrolled',
  },
  {
    id: 'lr-3',
    title: 'Engineering Leadership Fundamentals',
    description:
      'Build leadership skills through 1:1 mentoring, team dynamics, conflict resolution, and engineering management practices.',
    type: 'mentoring',
    provider: 'Leadership Academy',
    duration: '8 Weeks',
    difficulty: 'intermediate',
    relevanceScore: 88,
    bridgesSkills: ['Leadership', 'Mentoring'],
    gapReduction: 2,
    rating: 4.9,
    enrolledCount: 89,
    cost: 'Free',
    enrollmentStatus: 'in_progress',
  },
  {
    id: 'lr-4',
    title: 'AWS Solutions Architect Associate',
    description:
      'Prepare for the AWS certification covering compute, storage, networking, and security services.',
    type: 'certification',
    provider: 'AWS Training',
    duration: '6 Weeks',
    difficulty: 'advanced',
    relevanceScore: 85,
    bridgesSkills: ['System Design', 'DevOps/CI-CD'],
    gapReduction: 1,
    rating: 4.7,
    enrolledCount: 5200,
    cost: '$300',
    enrollmentStatus: 'not_enrolled',
  },
  {
    id: 'lr-5',
    title: 'TypeScript Advanced Patterns & Generics',
    description:
      'Deep dive into advanced TypeScript: mapped types, conditional types, decorators, and type-safe patterns.',
    type: 'video',
    provider: 'Frontend Masters',
    duration: '6h 15m',
    difficulty: 'advanced',
    relevanceScore: 82,
    bridgesSkills: ['TypeScript'],
    gapReduction: 1,
    rating: 4.8,
    enrolledCount: 1820,
    cost: 'Included',
    enrollmentStatus: 'completed',
  },
  {
    id: 'lr-6',
    title: 'Mentoring & Coaching Practices',
    description:
      'Learn to effectively mentor junior engineers through structured coaching sessions and feedback techniques.',
    type: 'on_the_job',
    provider: 'People Team',
    duration: '4 Weeks',
    difficulty: 'intermediate',
    relevanceScore: 78,
    bridgesSkills: ['Mentoring', 'Leadership'],
    gapReduction: 1,
    rating: 4.5,
    enrolledCount: 67,
    cost: 'Free',
    enrollmentStatus: 'not_enrolled',
  },
  {
    id: 'lr-7',
    title: 'Database Design & Performance Optimization',
    description:
      'Relational and NoSQL database modeling, indexing strategies, query optimization, and schema evolution.',
    type: 'course',
    provider: 'Coursera',
    duration: '5 Weeks',
    difficulty: 'intermediate',
    relevanceScore: 75,
    bridgesSkills: ['Data Modeling'],
    gapReduction: 1,
    rating: 4.4,
    enrolledCount: 3100,
    cost: 'Included',
    enrollmentStatus: 'not_enrolled',
  },
  {
    id: 'lr-8',
    title: 'Problem-Solving for Staff Engineers',
    description:
      'Strategic problem decomposition, cross-team debugging, and architectural decision records for senior ICs.',
    type: 'workshop',
    provider: 'Internal L&D',
    duration: '2h Workshop',
    difficulty: 'expert',
    relevanceScore: 72,
    bridgesSkills: ['Problem Solving'],
    gapReduction: 1,
    enrolledCount: 42,
    cost: 'Free',
    enrollmentStatus: 'not_enrolled',
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const SkillGapRecommendations: React.FC<SkillGapRecommendationsProps> = ({
  recommendations,
  onEnroll,
}) => {
  const [typeFilter, setTypeFilter] = useState<LearningType | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const types = useMemo(() => {
    const set = new Set<LearningType>();
    recommendations.forEach((r) => set.add(r.type));
    return Array.from(set);
  }, [recommendations]);

  const filtered = useMemo(() => {
    let list = recommendations;
    if (typeFilter !== 'all') {
      list = list.filter((r) => r.type === typeFilter);
    }
    if (!showCompleted) {
      list = list.filter((r) => r.enrollmentStatus !== 'completed');
    }
    return list.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [recommendations, typeFilter, showCompleted]);

  const enrolledCount = recommendations.filter((r) => r.enrollmentStatus !== 'not_enrolled').length;
  const completedCount = recommendations.filter((r) => r.enrollmentStatus === 'completed').length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-neural-mint" />
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
            Learning Recommendations
          </p>
          <span className="text-[8px] text-silver-mist">({filtered.length} results)</span>
        </div>
        <div className="flex items-center gap-2 text-[8px]">
          <span className="text-silver-mist">
            Enrolled: <span className="font-bold text-celestial-indigo">{enrolledCount}</span>
          </span>
          <span className="text-silver-mist">
            Completed: <span className="font-bold text-neural-mint">{completedCount}</span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
            typeFilter === 'all'
              ? 'bg-celestial-indigo/10 text-celestial-indigo'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
          }`}
        >
          All
        </button>
        {types.map((t) => {
          const cfg = TYPE_CONFIG[t];
          const TypeIcon = cfg.icon;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
                typeFilter === t
                  ? `${cfg.bg} ${cfg.color}`
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <TypeIcon className="w-2.5 h-2.5" />
              {cfg.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => setShowCompleted((p) => !p)}
          className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
            showCompleted ? 'text-silver-mist' : 'bg-coral-alert/10 text-coral-alert'
          }`}
        >
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </button>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-2">
        {filtered.map((rec) => {
          const typeCfg = TYPE_CONFIG[rec.type];
          const diffCfg = DIFFICULTY_CONFIG[rec.difficulty];
          const statusCfg = STATUS_CONFIG[rec.enrollmentStatus];
          const TypeIcon = typeCfg.icon;
          const StatusIcon = statusCfg.icon;

          return (
            <div
              key={rec.id}
              className={`rounded-xl border p-3 transition-colors ${
                rec.isFeatured
                  ? 'border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/5'
                  : rec.enrollmentStatus === 'completed'
                    ? 'border-neural-mint/20 bg-neural-mint/5'
                    : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeCfg.bg}`}
                >
                  <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {rec.isFeatured && (
                          <span className="px-1 py-0.5 rounded text-[6px] font-black bg-sunset-amber/10 text-sunset-amber uppercase">
                            Top Pick
                          </span>
                        )}
                        <p className="text-[10px] font-bold text-ink-black dark:text-pearl truncate">
                          {rec.title}
                        </p>
                      </div>
                      <p className="text-[8px] text-silver-mist mt-0.5 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>

                    {/* Relevance Score */}
                    <div className="shrink-0 text-center">
                      <div
                        className={`text-[14px] font-black ${
                          rec.relevanceScore >= 90
                            ? 'text-neural-mint'
                            : rec.relevanceScore >= 80
                              ? 'text-celestial-indigo'
                              : 'text-sunset-amber'
                        }`}
                      >
                        {rec.relevanceScore}%
                      </div>
                      <p className="text-[6px] text-silver-mist font-bold">MATCH</p>
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`px-1 py-0.5 rounded text-[7px] font-bold ${typeCfg.color} ${typeCfg.bg}`}
                    >
                      {typeCfg.label}
                    </span>
                    <span className={`text-[7px] font-bold ${diffCfg.color}`}>{diffCfg.label}</span>
                    <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                      <Clock className="w-2 h-2" /> {rec.duration}
                    </span>
                    <span className="text-[7px] text-silver-mist">{rec.provider}</span>
                    {rec.rating && (
                      <span className="text-[7px] text-sunset-amber flex items-center gap-0.5 font-bold">
                        <Star className="w-2 h-2 fill-current" /> {rec.rating}
                      </span>
                    )}
                    {rec.cost && (
                      <span
                        className={`text-[7px] font-bold ${rec.cost === 'Free' || rec.cost === 'Included' ? 'text-neural-mint' : 'text-ink-black dark:text-pearl'}`}
                      >
                        {rec.cost}
                      </span>
                    )}
                  </div>

                  {/* Skills Bridged + Action */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[7px] text-silver-mist">Bridges:</span>
                      {rec.bridgesSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-quantum-rose/10 text-quantum-rose"
                        >
                          {skill}
                        </span>
                      ))}
                      <span className="text-[7px] font-bold text-neural-mint flex items-center gap-0.5">
                        <Zap className="w-2 h-2" /> -{rec.gapReduction} gap
                      </span>
                    </div>

                    <button
                      onClick={() => onEnroll?.(rec.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-bold transition-all ${statusCfg.bg} ${statusCfg.color}`}
                      disabled={rec.enrollmentStatus === 'completed'}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-6 text-center">
          <Filter className="w-8 h-8 mx-auto text-silver-mist/30 mb-2" />
          <p className="text-[10px] text-silver-mist">
            No recommendations match the selected filters
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillGapRecommendations;
