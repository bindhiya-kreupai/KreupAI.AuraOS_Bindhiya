/**
 * @module SkillRadarChart
 * @description Radar chart comparing current vs required skill levels
 *              with recharts RadarChart, dual overlays, and gap highlighting
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Zap, Eye, EyeOff } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface SkillDataPoint {
  skill: string;
  current: number;
  required: number;
  maxLevel: number;
  category: string;
}

export interface SkillRadarChartProps {
  data: SkillDataPoint[];
  maxLevel?: number;
  title?: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_SKILL_DATA: SkillDataPoint[] = [
  { skill: 'React/Next.js', current: 4, required: 5, maxLevel: 5, category: 'Technical' },
  { skill: 'TypeScript', current: 3, required: 4, maxLevel: 5, category: 'Technical' },
  { skill: 'System Design', current: 2, required: 4, maxLevel: 5, category: 'Technical' },
  { skill: 'Node.js', current: 3, required: 3, maxLevel: 5, category: 'Technical' },
  { skill: 'DevOps/CI-CD', current: 1, required: 3, maxLevel: 5, category: 'Technical' },
  { skill: 'Leadership', current: 2, required: 4, maxLevel: 5, category: 'Leadership' },
  { skill: 'Communication', current: 4, required: 4, maxLevel: 5, category: 'Behavioral' },
  { skill: 'Problem Solving', current: 4, required: 5, maxLevel: 5, category: 'Core' },
  { skill: 'Mentoring', current: 2, required: 3, maxLevel: 5, category: 'Leadership' },
  { skill: 'Data Modeling', current: 3, required: 4, maxLevel: 5, category: 'Technical' },
];

// ── Custom Tooltip ───────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  const current = payload.find((p) => p.name === 'Current Level');
  const required = payload.find((p) => p.name === 'Required Level');
  const gap = (required?.value ?? 0) - (current?.value ?? 0);

  return (
    <div className="bg-white dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/20 shadow-lg px-3 py-2">
      <p className="text-[10px] font-bold text-ink-black dark:text-pearl mb-1">{label}</p>
      {current && (
        <p className="text-[9px] text-celestial-indigo font-bold">Current: {current.value}/5</p>
      )}
      {required && (
        <p className="text-[9px] text-quantum-rose font-bold">Required: {required.value}/5</p>
      )}
      {gap > 0 && (
        <p className="text-[9px] text-coral-alert font-bold mt-0.5">Gap: -{gap} levels</p>
      )}
      {gap === 0 && <p className="text-[9px] text-neural-mint font-bold mt-0.5">On target</p>}
      {gap < 0 && (
        <p className="text-[9px] text-neural-mint font-bold mt-0.5">Exceeds by +{Math.abs(gap)}</p>
      )}
    </div>
  );
};

// ── Component ────────────────────────────────────────────────────────────────────

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  data,
  maxLevel = 5,
  title = 'Proficiency Radar',
}) => {
  const [showCurrent, setShowCurrent] = useState(true);
  const [showRequired, setShowRequired] = useState(true);

  const chartData = data.map((d) => ({
    subject: d.skill,
    current: d.current,
    required: d.required,
    fullMark: maxLevel,
  }));

  const totalGap = data.reduce((sum, d) => sum + Math.max(0, d.required - d.current), 0);
  const avgCurrent =
    data.length > 0 ? (data.reduce((s, d) => s + d.current, 0) / data.length).toFixed(1) : '0';
  const avgRequired =
    data.length > 0 ? (data.reduce((s, d) => s + d.required, 0) / data.length).toFixed(1) : '0';
  const metCount = data.filter((d) => d.current >= d.required).length;

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sunset-amber" />
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl">{title}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCurrent((p) => !p)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold transition-colors ${
              showCurrent ? 'bg-celestial-indigo/10 text-celestial-indigo' : 'text-silver-mist'
            }`}
          >
            {showCurrent ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            Current
          </button>
          <button
            onClick={() => setShowRequired((p) => !p)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold transition-colors ${
              showRequired ? 'bg-quantum-rose/10 text-quantum-rose' : 'text-silver-mist'
            }`}
          >
            {showRequired ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            Required
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1 text-[8px]">
          <span className="w-2 h-2 rounded-full bg-celestial-indigo" />
          <span className="text-silver-mist">Avg Current:</span>
          <span className="font-bold text-ink-black dark:text-pearl">{avgCurrent}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px]">
          <span className="w-2 h-2 rounded-full bg-quantum-rose" />
          <span className="text-silver-mist">Avg Required:</span>
          <span className="font-bold text-ink-black dark:text-pearl">{avgRequired}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px]">
          <span className="text-silver-mist">Skills Met:</span>
          <span className="font-bold text-neural-mint">
            {metCount}/{data.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[8px]">
          <span className="text-silver-mist">Total Gap:</span>
          <span className="font-bold text-coral-alert">{totalGap}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxLevel]}
              tick={{ fill: '#cbd5e1', fontSize: 7 }}
              axisLine={false}
              tickCount={maxLevel + 1}
            />
            {showCurrent && (
              <Radar
                name="Current Level"
                dataKey="current"
                stroke="#6366f1"
                strokeWidth={2}
                fill="#6366f1"
                fillOpacity={0.25}
              />
            )}
            {showRequired && (
              <Radar
                name="Required Level"
                dataKey="required"
                stroke="#ec4899"
                strokeWidth={2}
                fill="#ec4899"
                fillOpacity={0.08}
                strokeDasharray="5 3"
              />
            )}
            <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '12px' }} iconSize={8} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillRadarChart;
