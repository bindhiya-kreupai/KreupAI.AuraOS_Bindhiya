'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Target, Building2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NitaqatBand = 'PLATINUM' | 'GREEN_HIGH' | 'GREEN_LOW' | 'YELLOW' | 'RED';

interface DepartmentData {
  department: string;
  totalEmployees: number;
  nationalCount: number;
  ratio: number;
  gap: number;
}

interface TrendData {
  period: string;
  ratio: number;
  nationalCount: number;
  totalCount: number;
}

interface EmiratiData {
  totalEmployees: number;
  emiratiCount: number;
  currentRatio: number;
  requiredRatio: number;
  requiredCount: number;
  gap: number;
  monthlyPenalty: number | null;
  isCompliant: boolean;
  departments: DepartmentData[];
  trend: TrendData[];
}

interface NitaqatData {
  totalEmployees: number;
  saudiCount: number;
  currentRatio: number;
  targetRatio: number;
  band: NitaqatBand;
  sectorName: string;
  gap: number;
  gapToNextBand: number | null;
  isCompliant: boolean;
  departments: DepartmentData[];
  trend: TrendData[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const EMIRATI_DATA: EmiratiData = {
  totalEmployees: 249,
  emiratiCount: 14,
  currentRatio: 0.0562,
  requiredRatio: 0.02,
  requiredCount: 5,
  gap: -9, // Surplus of 9 Emiratis above minimum
  monthlyPenalty: null,
  isCompliant: true,
  departments: [
    { department: 'Executive', totalEmployees: 8, nationalCount: 4, ratio: 0.5, gap: 0 },
    { department: 'Finance', totalEmployees: 22, nationalCount: 3, ratio: 0.136, gap: 0 },
    { department: 'Sales', totalEmployees: 55, nationalCount: 2, ratio: 0.036, gap: 0 },
    { department: 'Engineering', totalEmployees: 82, nationalCount: 2, ratio: 0.024, gap: 0 },
    { department: 'Operations', totalEmployees: 70, nationalCount: 2, ratio: 0.029, gap: 0 },
    { department: 'HR', totalEmployees: 12, nationalCount: 1, ratio: 0.083, gap: 0 },
  ],
  trend: [
    { period: 'Mar 25', ratio: 0.044, nationalCount: 11, totalCount: 247 },
    { period: 'Jun 25', ratio: 0.048, nationalCount: 12, totalCount: 248 },
    { period: 'Sep 25', ratio: 0.052, nationalCount: 13, totalCount: 248 },
    { period: 'Dec 25', ratio: 0.052, nationalCount: 13, totalCount: 249 },
    { period: 'Jan 26', ratio: 0.052, nationalCount: 13, totalCount: 249 },
    { period: 'Feb 26', ratio: 0.0562, nationalCount: 14, totalCount: 249 },
  ],
};

const NITAQAT_DATA: NitaqatData = {
  totalEmployees: 181,
  saudiCount: 66,
  currentRatio: 0.3646,
  targetRatio: 0.25,
  band: 'GREEN_HIGH',
  sectorName: 'IT & Software (ISIC 62)',
  gap: 0, // No gap — in green band
  gapToNextBand: null, // Already at GREEN_HIGH near PLATINUM
  isCompliant: true,
  departments: [
    { department: 'Executive', totalEmployees: 10, nationalCount: 6, ratio: 0.6, gap: 0 },
    { department: 'Finance', totalEmployees: 25, nationalCount: 12, ratio: 0.48, gap: 0 },
    { department: 'Sales', totalEmployees: 60, nationalCount: 18, ratio: 0.3, gap: 0 },
    { department: 'Engineering', totalEmployees: 55, nationalCount: 12, ratio: 0.218, gap: 2 },
    { department: 'Operations', totalEmployees: 31, nationalCount: 18, ratio: 0.581, gap: 0 },
  ],
  trend: [
    { period: 'Mar 25', ratio: 0.332, nationalCount: 58, totalCount: 175 },
    { period: 'Jun 25', ratio: 0.34, nationalCount: 60, totalCount: 176 },
    { period: 'Sep 25', ratio: 0.351, nationalCount: 63, totalCount: 179 },
    { period: 'Dec 25', ratio: 0.358, nationalCount: 65, totalCount: 181 },
    { period: 'Jan 26', ratio: 0.36, nationalCount: 65, totalCount: 180 },
    { period: 'Feb 26', ratio: 0.3646, nationalCount: 66, totalCount: 181 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BAND_CONFIG: Record<
  NitaqatBand,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  PLATINUM: {
    label: 'Platinum',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    description: 'Exceeds target by ≥7%',
  },
  GREEN_HIGH: {
    label: 'Green (High)',
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-300',
    description: 'Significantly above target',
  },
  GREEN_LOW: {
    label: 'Green (Low)',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    description: 'Meets or slightly above target',
  },
  YELLOW: {
    label: 'Yellow',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    description: 'Slightly below target — limited services',
  },
  RED: {
    label: 'Red',
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-300',
    description: 'Well below target — severe restrictions',
  },
};

function GaugeChart({
  current,
  target,
  max,
  colorClass,
}: {
  current: number;
  target: number;
  max: number;
  colorClass: string;
}) {
  const currentAngle = Math.min((current / max) * 180, 180);
  const targetAngle = Math.min((target / max) * 180, 180);

  return (
    <div className="relative w-40 h-20 mx-auto">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Current ratio arc */}
        <path
          d={`M 5 50 A 45 45 0 ${currentAngle > 90 ? 1 : 0} 1 ${
            50 + 45 * Math.cos(Math.PI - (currentAngle * Math.PI) / 180)
          } ${50 - 45 * Math.sin((currentAngle * Math.PI) / 180)}`}
          fill="none"
          stroke={colorClass === 'green' ? '#10B981' : colorClass === 'red' ? '#EF4444' : '#8B5CF6'}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Target marker */}
        <circle
          cx={50 + 45 * Math.cos(Math.PI - (targetAngle * Math.PI) / 180)}
          cy={50 - 45 * Math.sin((targetAngle * Math.PI) / 180)}
          r="3"
          fill="#F59E0B"
        />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-0">
        <p className="text-xl font-bold text-gray-800">{(current * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}

function TrendChart({ trend }: { trend: TrendData[] }) {
  const values = trend.map((t) => t.ratio);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 0.01;
  const width = 280;
  const height = 60;
  const padding = 10;

  const points = trend
    .map((t, i) => {
      const x = padding + (i / (trend.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((t.ratio - minV) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full">
        <polyline
          points={points}
          fill="none"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {trend.map((t, i) => {
          const x = padding + (i / (trend.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((t.ratio - minV) / range) * (height - 2 * padding);
          return (
            <g key={t.period}>
              <circle cx={x} cy={y} r="3" fill="#6366F1" />
              <text x={x} y={height + 14} textAnchor="middle" fontSize="7" fill="#9CA3AF">
                {t.period}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function NationalisationDashboard() {
  const [activeTab, setActiveTab] = useState<'UAE' | 'KSA'>('UAE');
  const emiratiData = EMIRATI_DATA;
  const nitaqatData = NITAQAT_DATA;
  const bandConf = BAND_CONFIG[nitaqatData.band];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nationalisation Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              UAE Emiratisation & KSA Nitaqat compliance monitoring
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">
            <Download className="w-4 h-4 text-gray-500" /> Export Report
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-0 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('UAE')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'UAE' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🇦🇪 UAE Emiratisation
          </button>
          <button
            onClick={() => setActiveTab('KSA')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'KSA' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🇸🇦 KSA Nitaqat
          </button>
        </div>

        {/* UAE Emiratisation */}
        {activeTab === 'UAE' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Employees',
                  value: emiratiData.totalEmployees,
                  sub: 'All nationalities',
                },
                {
                  label: 'Emirati Employees',
                  value: emiratiData.emiratiCount,
                  sub: `${(emiratiData.currentRatio * 100).toFixed(1)}% of workforce`,
                },
                {
                  label: 'Required (2024)',
                  value: emiratiData.requiredCount,
                  sub: `Min ${(emiratiData.requiredRatio * 100).toFixed(0)}% of workforce`,
                },
                {
                  label: 'Surplus',
                  value: Math.abs(emiratiData.gap),
                  sub: `${emiratiData.gap < 0 ? 'Above' : 'Below'} requirement`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                >
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Compliance Status + Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Emiratisation Ratio</h3>
                <GaugeChart
                  current={emiratiData.currentRatio}
                  target={emiratiData.requiredRatio}
                  max={0.15}
                  colorClass="green"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                  <span>0%</span>
                  <span className="text-yellow-600">
                    Target: {(emiratiData.requiredRatio * 100).toFixed(0)}%
                  </span>
                  <span>15%</span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {emiratiData.isCompliant ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Compliant — No Penalty
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        Non-compliant — AED {emiratiData.monthlyPenalty?.toLocaleString()}/month
                        penalty
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Ratio Trend (12 months)
                </h3>
                <TrendChart trend={emiratiData.trend} />
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-800">Department Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                        Department
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Total
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Emiratis
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Ratio
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 w-40">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {emiratiData.departments.map((dept) => (
                      <tr
                        key={dept.department}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{dept.department}</td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {dept.totalEmployees}
                        </td>
                        <td className="px-4 py-3 text-right text-indigo-700 font-medium">
                          {dept.nationalCount}
                        </td>
                        <td className="px-4 py-3 text-right">{(dept.ratio * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${dept.ratio >= 0.02 ? 'bg-green-500' : 'bg-yellow-500'}`}
                              style={{ width: `${Math.min(dept.ratio * 100 * 5, 100)}%` }} // Scale for visibility
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* KSA Nitaqat */}
        {activeTab === 'KSA' && (
          <>
            {/* Nitaqat Band Card */}
            <div
              className={`border-2 rounded-xl p-5 flex items-start gap-4 ${bandConf.bg} ${bandConf.border}`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold border-2 ${bandConf.bg} ${bandConf.border}`}
              >
                <Target className={`w-7 h-7 ${bandConf.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${bandConf.color}`}>
                    {bandConf.label} Band
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${bandConf.bg} ${bandConf.color} border ${bandConf.border}`}
                  >
                    {nitaqatData.sectorName}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${bandConf.color}`}>{bandConf.description}</p>
                <div className="flex flex-wrap gap-6 mt-2 text-sm">
                  <div>
                    <span className={`${bandConf.color} opacity-70 text-xs`}>Current Ratio</span>
                    <p className={`text-lg font-bold ${bandConf.color}`}>
                      {(nitaqatData.currentRatio * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className={`${bandConf.color} opacity-70 text-xs`}>Target Ratio</span>
                    <p className={`text-lg font-bold ${bandConf.color}`}>
                      {(nitaqatData.targetRatio * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className={`${bandConf.color} opacity-70 text-xs`}>Saudi Employees</span>
                    <p className={`text-lg font-bold ${bandConf.color}`}>
                      {nitaqatData.saudiCount} / {nitaqatData.totalEmployees}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Band Scale */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Nitaqat Band Scale</h3>
              <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
                {[
                  { band: 'RED', pct: 20, color: 'bg-red-400' },
                  { band: 'YELLOW', pct: 20, color: 'bg-yellow-400' },
                  { band: 'GREEN_LOW', pct: 20, color: 'bg-emerald-400' },
                  { band: 'GREEN_HIGH', pct: 20, color: 'bg-green-500' },
                  { band: 'PLATINUM', pct: 20, color: 'bg-purple-500' },
                ].map((b) => (
                  <div
                    key={b.band}
                    className={`flex-1 relative ${b.color} flex items-center justify-center`}
                    style={{ flex: b.pct }}
                  >
                    {b.band === nitaqatData.band && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-full border-2 border-gray-700 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-700 rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Red</span>
                <span>Yellow</span>
                <span>Green Low</span>
                <span>Green High</span>
                <span>Platinum</span>
              </div>
              <div className="mt-1 text-xs text-right" style={{ marginRight: '0%' }}>
                <span className="text-indigo-600 font-medium">
                  Current: {(nitaqatData.currentRatio * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Saudisation Ratio Trend (12 months)
              </h3>
              <TrendChart trend={nitaqatData.trend} />
            </div>

            {/* Department Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-800">Department Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                        Department
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Total
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Saudis
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Ratio
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                        Gap to Target
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nitaqatData.departments.map((dept) => {
                      const targetRatio = nitaqatData.targetRatio;
                      const targetCount = Math.ceil(dept.totalEmployees * targetRatio);
                      const deptGap = targetCount - dept.nationalCount;
                      return (
                        <tr
                          key={dept.department}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">{dept.department}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {dept.totalEmployees}
                          </td>
                          <td className="px-4 py-3 text-right text-green-700 font-medium">
                            {dept.nationalCount}
                          </td>
                          <td className="px-4 py-3 text-right">{(dept.ratio * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right">
                            {deptGap <= 0 ? (
                              <span className="text-xs text-green-600 font-medium">
                                Met (+{Math.abs(deptGap)})
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 font-medium">
                                Need {deptGap} more
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
