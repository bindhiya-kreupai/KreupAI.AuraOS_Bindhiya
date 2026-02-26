/**
 * @module AIExplainabilityView
 * @description AI Explainability View — individual prediction explanation,
 *              feature importance bar chart, counterfactual explanations,
 *              decision path visualization, confidence score with uncertainty range,
 *              similar past predictions, natural language summary (Sec 31)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Info,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  GitBranch,
  RefreshCw,
  Loader2,
  Eye,
  Lightbulb,
  Users,
} from 'lucide-react';
import {
  AIGovernanceService,
  type ExplainabilityResult,
  type FeatureImportance,
  type CounterfactualExplanation,
} from '@/services/aiGovernanceService';

// ── Feature Importance Bar Chart ──────────────────────────────────────────────

function FeatureImportanceChart({ features }: { features: FeatureImportance[] }) {
  const sorted = [...features].sort((a, b) => b.importance - a.importance).slice(0, 10);
  const maxImportance = Math.max(...sorted.map((f) => f.importance));

  return (
    <div className="space-y-2">
      {sorted.map((f, i) => {
        const pct = (f.importance / maxImportance) * 100;
        const barColor = f.direction === 'negative' ? '#ef4444' : '#10b981';
        const bgColor = f.direction === 'negative' ? 'bg-red-50' : 'bg-emerald-50';
        const textColor = f.direction === 'negative' ? 'text-red-700' : 'text-emerald-700';

        return (
          <div key={i} className={`rounded-lg p-2.5 ${bgColor}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {f.direction === 'negative' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                )}
                <span className="text-xs font-semibold text-slate-800 truncate">{f.feature}</span>
              </div>
              <span className={`text-xs font-bold ml-2 flex-shrink-0 ${textColor}`}>
                {f.direction === 'negative' ? '+' : '-'}
                {(f.importance * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
            <p className="text-xs text-slate-500 italic">{f.description}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Confidence Gauge ──────────────────────────────────────────────────────────

function ConfidenceGauge({ confidence, range }: { confidence: number; range: [number, number] }) {
  const size = 120;
  const r = 46;
  const cx = size / 2;
  const cy = size / 2;
  // Half-circle gauge (180 degrees)
  const _startAngle = 180;
  const _endAngle = 360;
  const circumference = Math.PI * r;
  const _filledLength = (confidence / 100) * circumference;

  function polarToCart(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const color = confidence >= 75 ? '#ef4444' : confidence >= 50 ? '#f59e0b' : '#10b981';

  const bgStart = polarToCart(180);
  const bgEnd = polarToCart(0);
  const fgEnd = polarToCart(180 + (confidence / 100) * 180);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 16}>
        {/* Track */}
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* Value */}
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${confidence > 50 ? '1' : '0'} 1 ${fgEnd.x} ${fgEnd.y}`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={22} fontWeight="800" fill={color}>
          {confidence}%
        </text>
      </svg>
      <p className="text-xs text-slate-400 mt-1">
        Uncertainty range: {range[0]}%–{range[1]}%
      </p>
    </div>
  );
}

// ── Counterfactual Card ───────────────────────────────────────────────────────

function CounterfactualCard({ cf, index }: { cf: CounterfactualExplanation; index: number }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <p className="text-sm font-semibold text-blue-900">{cf.feature}</p>
      </div>
      <div className="flex items-center gap-2 text-xs mb-1.5 flex-wrap">
        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
          {cf.currentValue}
        </span>
        <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
          {cf.requiredValue}
        </span>
      </div>
      <p className="text-xs text-blue-700">{cf.impactDescription}</p>
    </div>
  );
}

// ── Decision Path Visualization ───────────────────────────────────────────────

function DecisionPath({ path }: { path: { node: string; condition: string; result: string }[] }) {
  return (
    <div className="flex flex-col gap-1">
      {path.map((step, i) => (
        <React.Fragment key={i}>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{step.node}</p>
            <p className="text-sm text-slate-700 mt-0.5">
              <span className="font-medium">IF</span> {step.condition}
            </p>
            <p className="text-xs text-indigo-600 font-semibold mt-0.5">→ {step.result}</p>
          </div>
          {i < path.length - 1 && (
            <div className="flex justify-center">
              <div className="w-0.5 h-4 bg-slate-300" />
            </div>
          )}
        </React.Fragment>
      ))}
      {/* Final outcome */}
      <div className="flex justify-center">
        <div className="w-0.5 h-4 bg-slate-300" />
      </div>
      <div className="bg-red-600 rounded-lg px-4 py-2.5 text-center">
        <p className="text-white font-bold text-sm">PREDICTION: HIGH RISK</p>
      </div>
    </div>
  );
}

// ── Similar Predictions ───────────────────────────────────────────────────────

function SimilarPredictions({
  predictions,
}: {
  predictions: { id: string; similarity: number; outcome: string }[];
}) {
  return (
    <div className="space-y-2">
      {predictions.map((pred) => {
        const isPositive = pred.outcome.toLowerCase().includes('stayed');
        return (
          <div key={pred.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 text-sm">
            <div className="w-12 text-center">
              <span className="text-xs font-bold text-slate-600">
                {Math.round(pred.similarity * 100)}%
              </span>
              <p className="text-xs text-slate-400">similar</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Prediction #{pred.id.replace('pred-', '')}</p>
              <p
                className={`text-sm font-medium ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}
              >
                {pred.outcome}
              </p>
            </div>
            {isPositive ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIExplainabilityView() {
  const [result, setResult] = useState<ExplainabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'features' | 'counterfactual' | 'path' | 'similar'
  >('features');
  const [predictionId, _setPredictionId] = useState('pred-12345');

  const load = async () => {
    setLoading(true);
    const r = await AIGovernanceService.getExplainability('model-001', predictionId);
    setResult(r);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [predictionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No explainability data available for this prediction.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-6 h-6 text-indigo-600" />
            AI Explainability
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Attrition Risk Predictor · Prediction #{predictionId.replace('pred-', '')}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Prediction Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ConfidenceGauge confidence={result.confidence} range={result.uncertaintyRange} />
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-xl font-bold text-sm mb-3">
              <AlertTriangle className="w-4 h-4" />
              {result.prediction}
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Model confidence</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Uncertainty range: {result.uncertaintyRange[0]}% – {result.uncertaintyRange[1]}%
            </p>
          </div>
        </div>

        {/* Natural Language Summary */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Why This Prediction?</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                {result.naturalLanguageSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {(
          [
            { key: 'features', label: 'Feature Importance' },
            { key: 'counterfactual', label: 'What-If Analysis' },
            { key: 'path', label: 'Decision Path' },
            { key: 'similar', label: 'Similar Cases' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 min-w-fit py-2 px-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${activeSection === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feature Importance */}
      {activeSection === 'features' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            Top Contributing Factors
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span>Increases risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-400" />
              <span>Reduces risk</span>
            </div>
          </div>
          <FeatureImportanceChart features={result.featureImportances} />
        </div>
      )}

      {/* Counterfactual */}
      {activeSection === 'counterfactual' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Counterfactual explanations show the minimum changes needed to reduce attrition
                risk. These are actionable insights for HR and managers.
              </p>
            </div>
          </div>
          {result.counterfactuals.map((cf, i) => (
            <CounterfactualCard key={i} cf={cf} index={i} />
          ))}
        </div>
      )}

      {/* Decision Path */}
      {activeSection === 'path' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-slate-400" />
            Decision Path
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Step-by-step logic that led to this prediction.
          </p>
          <DecisionPath path={result.decisionPath} />
        </div>
      )}

      {/* Similar Predictions */}
      {activeSection === 'similar' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Similar Past Predictions
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Historical predictions with similar feature profiles and their known outcomes.
          </p>
          <SimilarPredictions predictions={result.similarPredictions} />
          <div className="mt-3 bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">
              <span className="font-semibold">Interpretation:</span> In similar past cases,
              interventions such as salary adjustments and role changes successfully retained
              employees. Immediate action recommended.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
