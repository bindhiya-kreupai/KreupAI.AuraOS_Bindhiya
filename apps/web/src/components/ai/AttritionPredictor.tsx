/**
 * @module AttritionPredictor
 * @description Per-employee attrition risk predictor — circular gauge,
 *              risk factor breakdown, department heatmap, what-if simulator,
 *              retention actions, historical accuracy (Sec 7.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, TrendingDown, Sliders, Target, CheckCircle, Search } from 'lucide-react';
import { AIService, type AttritionRiskProfile } from '@/services/aiService';
import { HeatmapChart } from '@/components/analytics/PeopleAnalyticsCharts';

// ── Risk Gauge ─────────────────────────────────────────────────────────────────

function RiskGauge({ score }: { score: number }) {
  const size = 180;
  const cx = size / 2;
  const _cy = size / 2;
  const r = 70;
  const strokeW = 18;
  const circumference = Math.PI * r; // half circumference (180° arc)
  const offset = circumference * (1 - score / 100);

  const getColor = () => {
    if (score >= 75) return '#ef4444';
    if (score >= 50) return '#f97316';
    if (score >= 25) return '#f59e0b';
    return '#10b981';
  };

  const getLabel = () => {
    if (score >= 75) return { label: 'Critical Risk', bg: 'bg-red-100', text: 'text-red-700' };
    if (score >= 50) return { label: 'High Risk', bg: 'bg-orange-100', text: 'text-orange-700' };
    if (score >= 25) return { label: 'Medium Risk', bg: 'bg-amber-100', text: 'text-amber-700' };
    return { label: 'Low Risk', bg: 'bg-emerald-100', text: 'text-emerald-700' };
  };

  const level = getLabel();
  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeW / 2} ${size * 0.6 - strokeW / 2} A ${r} ${r} 0 0 1 ${size - strokeW / 2} ${size * 0.6 - strokeW / 2}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${strokeW / 2} ${size * 0.6 - strokeW / 2} A ${r} ${r} 0 0 1 ${size - strokeW / 2} ${size * 0.6 - strokeW / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={size * 0.6 - 16}
          textAnchor="middle"
          fontSize="32"
          fontWeight="800"
          fill={color}
        >
          {score}
        </text>
        <text x={cx} y={size * 0.6 - 2} textAnchor="middle" fontSize="11" fill="#94a3b8">
          / 100
        </text>
        {/* Labels */}
        <text x={strokeW} y={size * 0.6} textAnchor="start" fontSize="9" fill="#94a3b8">
          Low
        </text>
        <text x={size - strokeW} y={size * 0.6} textAnchor="end" fontSize="9" fill="#94a3b8">
          High
        </text>
      </svg>
      <span
        className={`text-sm font-semibold px-4 py-1 rounded-full mt-2 ${level.bg} ${level.text}`}
      >
        {level.label}
      </span>
    </div>
  );
}

// ── Risk Factor Bar ────────────────────────────────────────────────────────────

function RiskFactorBar({
  factor,
}: {
  factor: {
    factor: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    weight: number;
  };
}) {
  const impactColor = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-blue-400' }[
    factor.impact
  ];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${impactColor}`} />
          <span className="text-sm text-slate-700 truncate">{factor.factor}</span>
        </div>
        <span className="text-xs font-semibold text-slate-600 flex-shrink-0">{factor.weight}%</span>
      </div>
      <div className="ml-4">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${impactColor}`}
            style={{ width: `${factor.weight}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{factor.description}</p>
      </div>
    </div>
  );
}

// ── Department Heatmap ─────────────────────────────────────────────────────────

const DEPT_HEATMAP_DATA: number[][] = [
  [87, 72, 45, 32, 28, 22], // Critical (>75)
  [76, 61, 58, 41, 35, 29], // High (50-75)
  [65, 52, 48, 38, 30, 25], // Medium (25-50)
  [42, 38, 35, 28, 22, 18], // Low (<25)
];

// ── What-If Simulator ─────────────────────────────────────────────────────────

function WhatIfSimulator({ baseScore }: { baseScore: number }) {
  const [salaryIncrease, setSalaryIncrease] = useState(0);
  const [promotionYears, setPromotionYears] = useState(0);
  const [engagementBoost, setEngagementBoost] = useState(0);
  const [mentorAssigned, setMentorAssigned] = useState(false);

  // Simple impact model
  const impact =
    salaryIncrease * 0.4 +
    (promotionYears > 0 ? Math.min(promotionYears * 8, 20) : 0) +
    engagementBoost * 0.3 +
    (mentorAssigned ? 8 : 0);

  const newScore = Math.max(0, Math.min(100, Math.round(baseScore - impact)));
  const reduction = Math.round(impact);

  const getColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Salary Increase: <strong>+{salaryIncrease}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={salaryIncrease}
            onChange={(e) => setSalaryIncrease(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Accelerate Promotion:{' '}
            <strong>
              {promotionYears} yr{promotionYears !== 1 ? 's' : ''} earlier
            </strong>
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.5"
            value={promotionYears}
            onChange={(e) => setPromotionYears(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Engagement Score Boost: <strong>+{engagementBoost}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={engagementBoost}
            onChange={(e) => setEngagementBoost(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
        <div className="flex items-center gap-3 pt-3">
          <button
            onClick={() => setMentorAssigned((v) => !v)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center ${mentorAssigned ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${mentorAssigned ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <label className="text-xs text-slate-600">Assign Senior Mentor</label>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
        <div className="text-center">
          <div className="text-sm text-slate-400">Current Risk</div>
          <div className={`text-3xl font-bold ${getColor(baseScore)}`}>{baseScore}</div>
        </div>
        <div className="flex items-center gap-2 text-2xl">→</div>
        <div className="text-center">
          <div className="text-sm text-slate-400">Projected Risk</div>
          <div className={`text-3xl font-bold ${getColor(newScore)}`}>{newScore}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-400">Reduction</div>
          <div className="text-3xl font-bold text-emerald-600">-{reduction}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface AttritionPredictorProps {
  initialEmployeeId?: string;
  onBack?: () => void;
}

export default function AttritionPredictor({ initialEmployeeId, onBack }: AttritionPredictorProps) {
  const [profiles, setProfiles] = useState<AttritionRiskProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<AttritionRiskProfile | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'heatmap' | 'whatif' | 'actions'>(
    'profile'
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const allProfiles = (await AIService.predictAttritionRisk()) as AttritionRiskProfile[];
      setProfiles(allProfiles);
      if (initialEmployeeId) {
        setSelectedProfile(
          allProfiles.find((p) => p.employeeId === initialEmployeeId) ?? allProfiles[0]
        );
      } else {
        setSelectedProfile(allProfiles[0]);
      }
      setLoading(false);
    };
    load();
  }, [initialEmployeeId]);

  const filteredProfiles = profiles.filter(
    (p) =>
      search === '' ||
      p.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Sidebar — employee list */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="font-bold text-slate-800">Attrition Predictor</h2>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1 max-h-80 lg:max-h-screen overflow-y-auto">
          {filteredProfiles.map((p) => (
            <button
              key={p.employeeId}
              onClick={() => setSelectedProfile(p)}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${selectedProfile?.employeeId === p.employeeId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: AIService.getRiskColor(p.riskLevel) }}
              >
                {p.riskScore}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{p.employeeName}</p>
                <p className="text-[10px] text-slate-400 truncate">{p.department}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {selectedProfile && (
        <div className="flex-1 space-y-4">
          {/* Employee header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{selectedProfile.employeeName}</h2>
                <p className="text-sm text-slate-500">
                  {selectedProfile.role} · {selectedProfile.department}
                </p>
                {selectedProfile.predictedAttritionDate && (
                  <p className="text-xs text-red-500 mt-1">
                    Predicted departure:{' '}
                    {new Date(selectedProfile.predictedAttritionDate).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <RiskGauge score={selectedProfile.riskScore} />
            </div>

            {/* Model accuracy */}
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span>
                Model confidence:{' '}
                <strong className="text-slate-600">{selectedProfile.confidenceScore}%</strong>
              </span>
              <span>·</span>
              <span>
                Last updated: {new Date(selectedProfile.lastUpdated).toLocaleDateString()}
              </span>
              <span>·</span>
              <span>
                Model accuracy: <strong className="text-emerald-600">82%</strong> on holdout set
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 -mb-4 bg-white rounded-t-xl px-1">
            {(['profile', 'heatmap', 'whatif', 'actions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'profile'
                  ? 'Risk Factors'
                  : tab === 'heatmap'
                    ? 'Dept Heatmap'
                    : tab === 'whatif'
                      ? 'What-If Sim'
                      : 'Retention Actions'}
              </button>
            ))}
          </div>

          {/* Risk Factors tab */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Contributing Risk Factors</h3>
              {selectedProfile.riskFactors.map((f) => (
                <RiskFactorBar key={f.factor} factor={f} />
              ))}
            </div>
          )}

          {/* Department heatmap tab */}
          {activeTab === 'heatmap' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                Department × Risk Level Heatmap
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Count of employees at each risk level by department
              </p>
              <HeatmapChart
                data={DEPT_HEATMAP_DATA}
                rowLabels={['Critical', 'High', 'Medium', 'Low']}
                colLabels={['Eng', 'Sales', 'Ops', 'Mktg', 'Prod', 'HR']}
                colorScale={['#eff6ff', '#dc2626']}
                height={120}
              />
            </div>
          )}

          {/* What-if simulator tab */}
          {activeTab === 'whatif' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-slate-800 text-sm">What-If Scenario Simulator</h3>
              </div>
              <WhatIfSimulator baseScore={selectedProfile.riskScore} />
            </div>
          )}

          {/* Retention actions tab */}
          {activeTab === 'actions' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-slate-800 text-sm">
                  Recommended Retention Actions
                </h3>
              </div>
              <div className="space-y-2.5">
                {selectedProfile.retentionActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{action}</p>
                    </div>
                    <TrendingDown className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  Historical Model Accuracy
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-600">
                  <span>
                    Precision: <strong>84%</strong>
                  </span>
                  <span>
                    Recall: <strong>79%</strong>
                  </span>
                  <span>
                    F1 Score: <strong>0.81</strong>
                  </span>
                  <span>
                    AUC: <strong>0.88</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
