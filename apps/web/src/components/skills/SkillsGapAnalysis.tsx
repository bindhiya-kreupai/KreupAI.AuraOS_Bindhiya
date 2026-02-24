/**
 * @module SkillsGapAnalysis
 * @description Skills Gap Analysis overview — gap summary cards,
 *              current vs required level table, critical gaps,
 *              integrates SkillRadarChart and SkillGapRecommendations
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  BrainCircuit,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { SkillRadarChart } from './SkillRadarChart';
import type { SkillDataPoint } from './SkillRadarChart';
import { SkillGapRecommendations } from './SkillGapRecommendations';
import type { LearningRecommendation } from './SkillGapRecommendations';

// ── Types ────────────────────────────────────────────────────────────────────────

type GapSeverity = 'critical' | 'moderate' | 'minor' | 'met' | 'exceeds';

interface SkillGapItem {
  skill: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  maxLevel: number;
  gap: number;
  severity: GapSeverity;
  trend: 'improving' | 'declining' | 'stable';
  lastAssessed?: string;
}

interface RoleFitSummary {
  roleName: string;
  department: string;
  overallFit: number;
  skillsMet: number;
  totalSkills: number;
  criticalGaps: number;
  readinessLabel: string;
}

export interface SkillsGapAnalysisProps {
  skills: SkillDataPoint[];
  recommendations: LearningRecommendation[];
  roleFit?: RoleFitSummary;
  onEnroll?: (id: string) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  GapSeverity,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  critical: {
    label: 'Critical',
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10',
    icon: AlertTriangle,
  },
  moderate: {
    label: 'Moderate',
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
    icon: TrendingDown,
  },
  minor: {
    label: 'Minor',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
    icon: Minus,
  },
  met: {
    label: 'On Target',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
    icon: CheckCircle2,
  },
  exceeds: {
    label: 'Exceeds',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
    icon: TrendingUp,
  },
};

const TREND_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  improving: { icon: TrendingUp, color: 'text-neural-mint', label: 'Improving' },
  declining: { icon: TrendingDown, color: 'text-coral-alert', label: 'Declining' },
  stable: { icon: Minus, color: 'text-silver-mist', label: 'Stable' },
};

const CATEGORY_COLORS: Record<string, string> = {
  Technical: 'bg-celestial-indigo/10 text-celestial-indigo',
  Leadership: 'bg-nebula-purple/10 text-nebula-purple',
  Behavioral: 'bg-quantum-rose/10 text-quantum-rose',
  Core: 'bg-sunset-amber/10 text-sunset-amber',
  Functional: 'bg-neural-mint/10 text-neural-mint',
};

// ── Helpers ──────────────────────────────────────────────────────────────────────

function getSeverity(gap: number): GapSeverity {
  if (gap <= -1) return 'exceeds';
  if (gap === 0) return 'met';
  if (gap === 1) return 'minor';
  if (gap === 2) return 'moderate';
  return 'critical';
}

function getRandomTrend(): 'improving' | 'declining' | 'stable' {
  const trends: ('improving' | 'declining' | 'stable')[] = ['improving', 'declining', 'stable'];
  return trends[Math.floor(Math.random() * 3)];
}

// ── Mock Role Fit ────────────────────────────────────────────────────────────────

const MOCK_ROLE_FIT: RoleFitSummary = {
  roleName: 'Staff Software Engineer',
  department: 'Engineering',
  overallFit: 68,
  skillsMet: 4,
  totalSkills: 10,
  criticalGaps: 2,
  readinessLabel: 'Developing',
};

// ── Component ────────────────────────────────────────────────────────────────────

export const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({
  skills,
  recommendations,
  roleFit = MOCK_ROLE_FIT,
  onEnroll,
}) => {
  const [sortBy, setSortBy] = useState<'gap' | 'name' | 'category'>('gap');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Build gap items from skill data
  const gapItems: SkillGapItem[] = useMemo(() => {
    return skills.map((s) => {
      const gap = s.required - s.current;
      return {
        skill: s.skill,
        category: s.category,
        currentLevel: s.current,
        requiredLevel: s.required,
        maxLevel: s.maxLevel,
        gap,
        severity: getSeverity(gap),
        trend: getRandomTrend(),
        lastAssessed: '2026-02-15',
      };
    });
  }, [skills]);

  const sortedItems = useMemo(() => {
    const items = [...gapItems];
    if (sortBy === 'gap') items.sort((a, b) => b.gap - a.gap);
    else if (sortBy === 'name') items.sort((a, b) => a.skill.localeCompare(b.skill));
    else items.sort((a, b) => a.category.localeCompare(b.category));
    return items;
  }, [gapItems, sortBy]);

  const displayedItems = showAllSkills ? sortedItems : sortedItems.slice(0, 6);

  // Stats
  const criticalCount = gapItems.filter((g) => g.severity === 'critical').length;
  const moderateCount = gapItems.filter((g) => g.severity === 'moderate').length;
  const metCount = gapItems.filter((g) => g.severity === 'met' || g.severity === 'exceeds').length;
  const totalGapPoints = gapItems.reduce((s, g) => s + Math.max(0, g.gap), 0);
  const avgGap = gapItems.length > 0 ? (totalGapPoints / gapItems.length).toFixed(1) : '0';
  const strongestSkill = [...gapItems].sort((a, b) => b.currentLevel - a.currentLevel)[0];
  const weakestSkill = [...gapItems].sort((a, b) => a.currentLevel - b.currentLevel)[0];

  return (
    <div className="space-y-4">
      {/* Role Fit Banner */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-celestial-indigo/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-celestial-indigo" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                {roleFit.roleName}
              </p>
              <p className="text-[8px] text-silver-mist">{roleFit.department} • Target Role</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p
                className={`text-[18px] font-black ${
                  roleFit.overallFit >= 80
                    ? 'text-neural-mint'
                    : roleFit.overallFit >= 60
                      ? 'text-sunset-amber'
                      : 'text-coral-alert'
                }`}
              >
                {roleFit.overallFit}%
              </p>
              <p className="text-[7px] text-silver-mist font-bold">ROLE FIT</p>
            </div>
            <div className="h-8 w-px bg-cloud dark:bg-nebula-purple/20" />
            <div className="text-center">
              <p className="text-[14px] font-black text-ink-black dark:text-pearl">
                {roleFit.skillsMet}/{roleFit.totalSkills}
              </p>
              <p className="text-[7px] text-silver-mist font-bold">SKILLS MET</p>
            </div>
            <div className="h-8 w-px bg-cloud dark:bg-nebula-purple/20" />
            <div className="text-center">
              <p className="text-[14px] font-black text-coral-alert">{roleFit.criticalGaps}</p>
              <p className="text-[7px] text-silver-mist font-bold">CRITICAL</p>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-[8px] font-bold ${
                roleFit.readinessLabel === 'Ready'
                  ? 'bg-neural-mint/10 text-neural-mint'
                  : roleFit.readinessLabel === 'Developing'
                    ? 'bg-sunset-amber/10 text-sunset-amber'
                    : 'bg-coral-alert/10 text-coral-alert'
              }`}
            >
              {roleFit.readinessLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          {
            label: 'Total Skills',
            value: gapItems.length,
            color: 'text-ink-black dark:text-pearl',
            icon: Layers,
          },
          { label: 'On Target', value: metCount, color: 'text-neural-mint', icon: CheckCircle2 },
          {
            label: 'Critical Gaps',
            value: criticalCount,
            color: 'text-coral-alert',
            icon: AlertTriangle,
          },
          {
            label: 'Moderate Gaps',
            value: moderateCount,
            color: 'text-sunset-amber',
            icon: TrendingDown,
          },
          { label: 'Avg Gap', value: avgGap, color: 'text-celestial-indigo', icon: BarChart3 },
          { label: 'Gap Points', value: totalGapPoints, color: 'text-quantum-rose', icon: Target },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3 text-center"
            >
              <StatIcon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-[14px] font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[7px] text-silver-mist font-bold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Radar Chart */}
        <SkillRadarChart data={skills} />

        {/* Right: AI Insight + Top Gaps */}
        <div className="space-y-3">
          {/* AI Insight */}
          <div className="rounded-xl bg-gradient-to-br from-celestial-indigo to-nebula-purple p-4 text-white">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <BrainCircuit className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-wide">
                AI Career Insight
              </span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Focus on <strong className="text-sunset-amber">System Design</strong> and{' '}
              <strong className="text-sunset-amber">DevOps/CI-CD</strong> — closing these 2 critical
              gaps will boost your role fit from {roleFit.overallFit}% to an estimated{' '}
              <strong className="text-neural-mint">85%</strong>. The recommended &quot;Advanced
              System Design Patterns&quot; course addresses both areas.
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-neural-mint/20 bg-neural-mint/5 p-3">
              <p className="text-[8px] text-neural-mint font-bold mb-1">Strongest Skill</p>
              {strongestSkill && (
                <>
                  <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                    {strongestSkill.skill}
                  </p>
                  <p className="text-[9px] text-silver-mist">
                    Level {strongestSkill.currentLevel}/{strongestSkill.maxLevel}
                  </p>
                </>
              )}
            </div>
            <div className="rounded-xl border border-coral-alert/20 bg-coral-alert/5 p-3">
              <p className="text-[8px] text-coral-alert font-bold mb-1">Needs Most Work</p>
              {weakestSkill && (
                <>
                  <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                    {weakestSkill.skill}
                  </p>
                  <p className="text-[9px] text-silver-mist">
                    Level {weakestSkill.currentLevel}/{weakestSkill.maxLevel}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Gap Table */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/20">
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
            Current vs Required Levels
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-silver-mist mr-1">Sort:</span>
            {(['gap', 'name', 'category'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-0.5 rounded text-[8px] font-bold transition-colors ${
                  sortBy === s
                    ? 'bg-celestial-indigo/10 text-celestial-indigo'
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Rows */}
        {displayedItems.map((item) => {
          const sevCfg = SEVERITY_CONFIG[item.severity];
          const trendCfg = TREND_CONFIG[item.trend];
          const SevIcon = sevCfg.icon;
          const TrendIcon = trendCfg.icon;
          const isExpanded = expandedSkill === item.skill;
          const currentPct = Math.round((item.currentLevel / item.maxLevel) * 100);
          const requiredPct = Math.round((item.requiredLevel / item.maxLevel) * 100);
          const catColor = CATEGORY_COLORS[item.category] || 'bg-silver-mist/10 text-silver-mist';

          return (
            <div
              key={item.skill}
              className="border-b border-cloud/50 dark:border-nebula-purple/10 last:border-b-0"
            >
              <button
                onClick={() => setExpandedSkill(isExpanded ? null : item.skill)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cloud/30 dark:hover:bg-nebula-purple/5 transition-colors text-left"
              >
                {/* Severity */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${sevCfg.bg}`}
                >
                  <SevIcon className={`w-3 h-3 ${sevCfg.color}`} />
                </div>

                {/* Skill Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-ink-black dark:text-pearl truncate">
                      {item.skill}
                    </span>
                    <span className={`px-1 py-0.5 rounded text-[6px] font-bold ${catColor}`}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Level Bars */}
                <div className="w-32 hidden sm:block">
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="h-1.5 flex-1 rounded-full bg-cloud dark:bg-nebula-purple/20">
                      <div
                        className="h-full rounded-full bg-celestial-indigo"
                        style={{ width: `${currentPct}%` }}
                      />
                    </div>
                    <span className="text-[7px] font-bold text-celestial-indigo w-4 text-right">
                      {item.currentLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 flex-1 rounded-full bg-cloud dark:bg-nebula-purple/20">
                      <div
                        className="h-full rounded-full bg-quantum-rose/50"
                        style={{ width: `${requiredPct}%` }}
                      />
                    </div>
                    <span className="text-[7px] font-bold text-quantum-rose w-4 text-right">
                      {item.requiredLevel}
                    </span>
                  </div>
                </div>

                {/* Gap Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black ${sevCfg.bg} ${sevCfg.color}`}
                >
                  {item.gap > 0 ? `-${item.gap}` : item.gap === 0 ? '✓' : `+${Math.abs(item.gap)}`}
                </span>

                {/* Trend */}
                <div className="flex items-center gap-0.5 w-8">
                  <TrendIcon className={`w-3 h-3 ${trendCfg.color}`} />
                </div>

                {/* Expand */}
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-silver-mist" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-silver-mist" />
                )}
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-4 pb-3 pt-0">
                  <div className="rounded-lg bg-cloud/30 dark:bg-nebula-purple/5 p-3 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8px]">
                      <div>
                        <span className="text-silver-mist">Current Level</span>
                        <p className="font-bold text-celestial-indigo text-[11px]">
                          {item.currentLevel}/{item.maxLevel}
                        </p>
                      </div>
                      <div>
                        <span className="text-silver-mist">Required Level</span>
                        <p className="font-bold text-quantum-rose text-[11px]">
                          {item.requiredLevel}/{item.maxLevel}
                        </p>
                      </div>
                      <div>
                        <span className="text-silver-mist">Severity</span>
                        <p className={`font-bold text-[11px] ${sevCfg.color}`}>{sevCfg.label}</p>
                      </div>
                      <div>
                        <span className="text-silver-mist">Trend</span>
                        <p className={`font-bold text-[11px] ${trendCfg.color}`}>
                          {trendCfg.label}
                        </p>
                      </div>
                    </div>

                    {/* Visual bar comparison */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[7px] text-silver-mist w-14">Current</span>
                        <div className="flex-1 h-2 rounded-full bg-cloud dark:bg-nebula-purple/20">
                          <div
                            className="h-full rounded-full bg-celestial-indigo transition-all"
                            style={{ width: `${currentPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[7px] text-silver-mist w-14">Required</span>
                        <div className="flex-1 h-2 rounded-full bg-cloud dark:bg-nebula-purple/20">
                          <div
                            className="h-full rounded-full bg-quantum-rose/60 transition-all"
                            style={{ width: `${requiredPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {item.lastAssessed && (
                      <p className="text-[7px] text-silver-mist">
                        Last assessed:{' '}
                        {new Date(item.lastAssessed).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Show More */}
        {sortedItems.length > 6 && (
          <button
            onClick={() => setShowAllSkills((p) => !p)}
            className="w-full py-2 text-[9px] font-bold text-celestial-indigo hover:bg-celestial-indigo/5 transition-colors flex items-center justify-center gap-1"
          >
            {showAllSkills ? (
              <>
                Show Less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Show All {sortedItems.length} Skills <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Learning Recommendations */}
      <SkillGapRecommendations recommendations={recommendations} onEnroll={onEnroll} />
    </div>
  );
};

export default SkillsGapAnalysis;
