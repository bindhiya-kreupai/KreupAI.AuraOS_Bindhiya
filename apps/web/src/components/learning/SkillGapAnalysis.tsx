/**
 * @module SkillGapAnalysis
 * @description Skill gap analysis — SVG spider/radar chart (required vs current per skill),
 *              table view, filter by category, priority indicators, recommended actions (Sec 21.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BookOpen,
  BarChart2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  LearningCatalogService,
  type SkillGapData,
  type SkillData,
  type GapPriority,
} from '@/services/learningCatalogService';

// ── Types & Constants ─────────────────────────────────────────────────────────

const PRIORITY_META: Record<
  GapPriority,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  critical: { label: 'Critical Gap', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  moderate: { label: 'Moderate Gap', color: 'text-amber-600', bg: 'bg-amber-50', icon: TrendingUp },
  on_track: {
    label: 'On Track',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: CheckCircle,
  },
};

const SKILL_LEVEL_LABELS = ['', 'Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

// ── SVG Radar Chart ────────────────────────────────────────────────────────────

interface RadarChartProps {
  skills: SkillData[];
  maxLevel?: number;
}

function RadarChart({ skills, maxLevel = 5 }: RadarChartProps) {
  // Show max 8 skills on radar for readability
  const displaySkills = skills.slice(0, 8);
  const n = displaySkills.length;
  if (n < 3) return null;

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.75;

  // Angle for each vertex
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  // Point for a given radius fraction
  const point = (i: number, fraction: number) => {
    const a = angle(i);
    const r = maxR * fraction;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  };

  // Polygon points string
  const polygon = (levels: number[]) =>
    levels
      .map((lv, i) => {
        const { x, y } = point(i, lv / maxLevel);
        return `${x},${y}`;
      })
      .join(' ');

  const requiredLevels = displaySkills.map((s) => s.requiredLevel);
  const currentLevels = displaySkills.map((s) => s.currentLevel);

  // Grid rings
  const rings = [1, 2, 3, 4, 5];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-xs mx-auto"
      role="img"
      aria-label="Skill gap radar chart"
    >
      {/* Grid rings */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => {
            const { x, y } = point(i, ring / maxLevel);
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Spokes */}
      {displaySkills.map((_, i) => {
        const { x, y } = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />;
      })}

      {/* Required (indigo dashed) */}
      <polygon
        points={polygon(requiredLevels)}
        fill="rgba(99,102,241,0.08)"
        stroke="#6366f1"
        strokeWidth="2"
        strokeDasharray="4 2"
      />

      {/* Current (solid, with gap fill) */}
      <polygon
        points={polygon(currentLevels)}
        fill="rgba(16,185,129,0.15)"
        stroke="#10b981"
        strokeWidth="2"
      />

      {/* Required data points */}
      {requiredLevels.map((lv, i) => {
        const { x, y } = point(i, lv / maxLevel);
        return <circle key={`req-${i}`} cx={x} cy={y} r="4" fill="#6366f1" />;
      })}

      {/* Current data points */}
      {currentLevels.map((lv, i) => {
        const { x, y } = point(i, lv / maxLevel);
        return (
          <circle
            key={`cur-${i}`}
            cx={x}
            cy={y}
            r="4"
            fill="#10b981"
            stroke="white"
            strokeWidth="1.5"
          />
        );
      })}

      {/* Labels */}
      {displaySkills.map((skill, i) => {
        const a = angle(i);
        const labelR = maxR + 22;
        const lx = cx + labelR * Math.cos(a);
        const ly = cy + labelR * Math.sin(a);
        const textAnchor =
          Math.abs(Math.cos(a)) < 0.1 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        return (
          <text
            key={`label-${i}`}
            x={lx}
            y={ly}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontSize="9"
            fill={
              skill.priority === 'critical'
                ? '#dc2626'
                : skill.priority === 'moderate'
                  ? '#d97706'
                  : '#6b7280'
            }
            fontWeight={skill.priority !== 'on_track' ? '700' : '500'}
          >
            {skill.name.length > 10 ? skill.name.slice(0, 9) + '…' : skill.name}
          </text>
        );
      })}

      {/* Center label */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#9ca3af"
      >
        Skills
      </text>
    </svg>
  );
}

// ── Skill Row ─────────────────────────────────────────────────────────────────

function SkillRow({ skill, onEnroll }: { skill: SkillData; onEnroll: (courseId: string) => void }) {
  const meta = PRIORITY_META[skill.priority];
  const PriorityIcon = meta.icon;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border-l-4 ${
        skill.priority === 'critical'
          ? 'border-red-400 bg-red-50/30'
          : skill.priority === 'moderate'
            ? 'border-amber-400 bg-amber-50/30'
            : 'border-emerald-400 bg-emerald-50/10'
      } overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
      >
        {/* Priority icon */}
        <PriorityIcon className={`w-4 h-4 flex-shrink-0 ${meta.color}`} />

        {/* Skill name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 text-sm">{skill.name}</p>
            <span className="text-xs text-gray-400">{skill.category}</span>
          </div>
          {/* Level bars */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1.5 rounded-full ${
                    i < skill.currentLevel ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {skill.currentLevel}/{skill.requiredLevel}
            </span>
            {skill.gap > 0 && (
              <span className={`text-xs font-semibold ${meta.color}`}>-{skill.gap} gap</span>
            )}
          </div>
        </div>

        {/* Priority badge */}
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${meta.bg} ${meta.color}`}
        >
          {meta.label}
        </span>

        {skill.recommendedCourseId &&
          (expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ))}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400">Current Level</p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {SKILL_LEVEL_LABELS[skill.currentLevel] || 'Not Assessed'}
              </p>
              <p className="text-xs text-gray-400">({skill.currentLevel}/5)</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400">Required Level</p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {SKILL_LEVEL_LABELS[skill.requiredLevel]}
              </p>
              <p className="text-xs text-gray-400">({skill.requiredLevel}/5)</p>
            </div>
          </div>

          {skill.recommendedCourseId && skill.recommendedCourseTitle && (
            <div className="bg-white rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Recommended Course</p>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {skill.recommendedCourseTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onEnroll(skill.recommendedCourseId!)}
                className="flex items-center gap-1 text-xs text-indigo-600 font-semibold flex-shrink-0 hover:text-indigo-700 transition-colors"
              >
                Enroll <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface SkillGapAnalysisProps {
  employeeId?: string;
  onEnrollCourse?: (courseId: string) => void;
}

export function SkillGapAnalysis({
  employeeId = 'emp-001',
  onEnrollCourse,
}: SkillGapAnalysisProps) {
  const [gapData, setGapData] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState<GapPriority | ''>('');
  const [viewMode, setViewMode] = useState<'radar' | 'table'>('radar');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await LearningCatalogService.getSkillGapAnalysis(employeeId);
      setGapData(data);
      setLoading(false);
    };
    load();
  }, [employeeId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const data = await LearningCatalogService.getSkillGapAnalysis(employeeId);
    setGapData(data);
    setRefreshing(false);
  };

  const handleEnroll = async (courseId: string) => {
    await LearningCatalogService.enrollCourse(courseId, employeeId);
    onEnrollCourse?.(courseId);
  };

  if (loading || !gapData) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Categories from skills
  const categories = Array.from(new Set(gapData.skills.map((s) => s.category)));

  // Filtered skills
  const filteredSkills = gapData.skills.filter((s) => {
    if (filterCategory && s.category !== filterCategory) return false;
    if (filterPriority && s.priority !== filterPriority) return false;
    return true;
  });

  // Sort: critical first, then moderate, then on_track
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    const order: Record<GapPriority, number> = { critical: 0, moderate: 1, on_track: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {gapData.employeeName} · {gapData.role} · {gapData.department}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-600">{gapData.criticalGapsCount}</p>
          <p className="text-xs text-gray-500">Critical Gaps</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{gapData.moderateGapsCount}</p>
          <p className="text-xs text-gray-500">Moderate Gaps</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-600">{gapData.onTrackCount}</p>
          <p className="text-xs text-gray-500">On Track</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900">Overall Readiness Score</p>
          <p className="text-2xl font-bold text-indigo-600">{gapData.overallGapScore}%</p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              gapData.overallGapScore >= 80
                ? 'bg-emerald-500'
                : gapData.overallGapScore >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${gapData.overallGapScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {new Date(gapData.lastUpdated).toLocaleDateString()}
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setViewMode('radar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'radar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Radar View
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Detail View
        </button>
      </div>

      {/* Radar Chart */}
      {viewMode === 'radar' && (
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Skill Radar</h2>
          <RadarChart skills={gapData.skills} />

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-0.5 bg-indigo-500"
                style={{ borderTop: '2px dashed #6366f1' }}
              />
              <span className="text-xs text-gray-500">Required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-emerald-500" />
              <span className="text-xs text-gray-500">Current</span>
            </div>
          </div>

          {/* Quick skill summary bars */}
          <div className="mt-5 space-y-2">
            {gapData.skills.slice(0, 6).map((skill) => (
              <div key={skill.id} className="flex items-center gap-3">
                <p className="text-xs text-gray-600 w-28 flex-shrink-0 truncate">{skill.name}</p>
                <div className="flex-1 relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  {/* Required level bar */}
                  <div
                    className="absolute h-full bg-indigo-100 rounded-full"
                    style={{ width: `${(skill.requiredLevel / 5) * 100}%` }}
                  />
                  {/* Current level bar */}
                  <div
                    className={`absolute h-full rounded-full ${
                      skill.priority === 'critical'
                        ? 'bg-red-400'
                        : skill.priority === 'moderate'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                    }`}
                    style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
                  {skill.currentLevel}/{skill.requiredLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar (for table view) */}
      {viewMode === 'table' && (
        <div className="flex gap-2 flex-wrap">
          {/* Priority filter */}
          {(['', 'critical', 'moderate', 'on_track'] as (GapPriority | '')[]).map((p) => {
            const label = p === '' ? 'All' : PRIORITY_META[p as GapPriority].label;
            const isActive = filterPriority === p;
            return (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  isActive
                    ? p === 'critical'
                      ? 'bg-red-500 text-white'
                      : p === 'moderate'
                        ? 'bg-amber-500 text-white'
                        : p === 'on_track'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}

          {/* Category filter */}
          {categories.length > 1 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Skill List */}
      {viewMode === 'table' && (
        <div className="space-y-2">
          {sortedSkills.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No skills match the filter</p>
            </div>
          ) : (
            sortedSkills.map((skill) => (
              <SkillRow key={skill.id} skill={skill} onEnroll={handleEnroll} />
            ))
          )}
        </div>
      )}

      {/* Recommended Actions */}
      {gapData.criticalGapsCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4">
          <p className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Priority Actions
          </p>
          <div className="space-y-2">
            {gapData.skills
              .filter((s) => s.priority === 'critical' && s.recommendedCourseId)
              .map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <BookOpen className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{skill.name}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {skill.recommendedCourseTitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEnroll(skill.recommendedCourseId!)}
                    className="flex items-center gap-1 text-xs text-red-600 font-semibold flex-shrink-0 hover:text-red-700 transition-colors"
                  >
                    Enroll <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillGapAnalysis;
