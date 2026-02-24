/**
 * @module ResumeMatchScore
 * @description Match percentage visualization showing how a parsed resume aligns
 *              with job requirements — overall score, breakdown, strengths & gaps
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Briefcase,
  GraduationCap,
  Wrench,
  Globe,
  Zap,
} from 'lucide-react';
import type { CandidateScore, ResumeData } from '@/lib/services/ai/types';

// ── Types ────────────────────────────────────────────────────────────────────────

interface ResumeMatchScoreProps {
  score: CandidateScore;
  resume: ResumeData;
  jobTitle?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const RECOMMENDATION_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: LucideIcon }
> = {
  STRONG_FIT: {
    label: 'Strong Fit',
    color: 'text-neural-mint',
    bgColor: 'bg-neural-mint/10',
    icon: CheckCircle2,
  },
  GOOD_FIT: {
    label: 'Good Fit',
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/10',
    icon: TrendingUp,
  },
  PARTIAL_FIT: {
    label: 'Partial Fit',
    color: 'text-sunset-amber',
    bgColor: 'bg-sunset-amber/10',
    icon: AlertTriangle,
  },
  NOT_RECOMMENDED: {
    label: 'Not Recommended',
    color: 'text-coral-alert',
    bgColor: 'bg-coral-alert/10',
    icon: XCircle,
  },
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  requiredSkills: Wrench,
  preferredSkills: Zap,
  experience: Briefcase,
  education: GraduationCap,
  certifications: Award,
  languages: Globe,
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-neural-mint';
  if (score >= 60) return 'text-celestial-indigo';
  if (score >= 40) return 'text-sunset-amber';
  return 'text-coral-alert';
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-neural-mint';
  if (score >= 60) return 'bg-celestial-indigo';
  if (score >= 40) return 'bg-sunset-amber';
  return 'bg-coral-alert';
};

const getScoreRingColor = (score: number): string => {
  if (score >= 80) return 'stroke-neural-mint';
  if (score >= 60) return 'stroke-celestial-indigo';
  if (score >= 40) return 'stroke-sunset-amber';
  return 'stroke-coral-alert';
};

// ── Circular Score Ring ──────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-pearl dark:stroke-deep-cosmos/30"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={getScoreRingColor(score)}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-[9px] text-silver-mist">/ 100</span>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────────

export const ResumeMatchScore: React.FC<ResumeMatchScoreProps> = ({ score, resume, jobTitle }) => {
  const recConfig =
    RECOMMENDATION_CONFIG[score.recommendation] || RECOMMENDATION_CONFIG.NOT_RECOMMENDED;
  const RecIcon = recConfig.icon;

  const breakdownEntries = useMemo(
    () => Object.entries(score.breakdown).sort((a, b) => b[1].weight - a[1].weight),
    [score.breakdown]
  );

  return (
    <div className="space-y-4">
      {/* Overall Score Header */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        <div className="flex items-center gap-4">
          <ScoreRing score={score.overallScore} />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-black dark:text-pearl">Match Score</p>
            {jobTitle && (
              <p className="text-[10px] text-silver-mist mt-0.5">
                {resume.contact.name || 'Candidate'} vs{' '}
                <span className="font-semibold">{jobTitle}</span>
              </p>
            )}

            {/* Recommendation Badge */}
            <div
              className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg ${recConfig.bgColor}`}
            >
              <RecIcon className={`w-4 h-4 ${recConfig.color}`} />
              <span className={`text-[11px] font-bold ${recConfig.color}`}>{recConfig.label}</span>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 mt-2 text-[10px]">
              <span className="text-neural-mint font-semibold">
                {score.strengths.length} strengths
              </span>
              <span className="text-coral-alert font-semibold">{score.skillGaps.length} gaps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Target className="w-4 h-4 text-celestial-indigo" />
          Score Breakdown
        </p>

        <div className="space-y-2">
          {breakdownEntries.map(([category, data]) => {
            const CatIcon = CATEGORY_ICONS[category] || Target;
            const catLabel = category
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (s) => s.toUpperCase());
            const normalizedScore = Math.round(data.score * 100);

            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CatIcon className="w-3 h-3 text-silver-mist" />
                    <span className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                      {catLabel}
                    </span>
                    <span className="text-[8px] text-silver-mist">
                      ({Math.round(data.weight * 100)}% weight)
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold ${getScoreColor(normalizedScore)}`}>
                    {normalizedScore}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getScoreBgColor(normalizedScore)}`}
                    style={{ width: `${normalizedScore}%` }}
                  />
                </div>

                {/* Details */}
                <p className="text-[9px] text-silver-mist">{data.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Strengths */}
        <div className="rounded-xl border border-neural-mint/20 bg-neural-mint/5 p-3 space-y-2">
          <p className="text-[11px] font-bold text-neural-mint flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Strengths ({score.strengths.length})
          </p>
          {score.strengths.length > 0 ? (
            <div className="space-y-1">
              {score.strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-[10px] text-ink-black dark:text-pearl"
                >
                  <CheckCircle2 className="w-3 h-3 text-neural-mint shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-silver-mist italic">No notable strengths identified</p>
          )}
        </div>

        {/* Skill Gaps */}
        <div className="rounded-xl border border-coral-alert/20 bg-coral-alert/5 p-3 space-y-2">
          <p className="text-[11px] font-bold text-coral-alert flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            Skill Gaps ({score.skillGaps.length})
          </p>
          {score.skillGaps.length > 0 ? (
            <div className="space-y-1">
              {score.skillGaps.map((g, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-[10px] text-ink-black dark:text-pearl"
                >
                  <XCircle className="w-3 h-3 text-coral-alert shrink-0 mt-0.5" />
                  {g}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-silver-mist italic">No significant gaps found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeMatchScore;
