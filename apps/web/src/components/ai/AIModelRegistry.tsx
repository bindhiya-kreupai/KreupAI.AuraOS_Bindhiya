/**
 * @module AIModelRegistry
 * @description AI Model Registry — model cards grid, detail view with metrics,
 *              version history, performance trend charts, risk badges,
 *              retraining schedule, deploy/retire actions (Sec 31)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Pause,
  Play,
  Calendar,
  Loader2,
  Shield,
  Info,
} from 'lucide-react';
import {
  AIGovernanceService,
  type AIModel,
  type ModelStatus,
  type RiskLevel,
  type ModelPerformanceMetrics,
} from '@/services/aiGovernanceService';

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ModelStatus, { label: string; cls: string; icon: React.ElementType }> =
  {
    active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    staging: { label: 'Staging', cls: 'bg-blue-100 text-blue-700', icon: Play },
    retired: { label: 'Retired', cls: 'bg-slate-200 text-slate-600', icon: Pause },
    deprecated: { label: 'Deprecated', cls: 'bg-red-100 text-red-700', icon: AlertTriangle },
  };

const RISK_CONFIG: Record<RiskLevel, { label: string; cls: string; desc: string }> = {
  minimal: {
    label: 'Minimal Risk',
    cls: 'bg-emerald-100 text-emerald-700',
    desc: 'Low-impact analytics; no direct employment decisions',
  },
  limited: {
    label: 'Limited Risk',
    cls: 'bg-blue-100 text-blue-700',
    desc: 'Transparency obligations under EU AI Act',
  },
  high: {
    label: 'High Risk',
    cls: 'bg-red-100 text-red-700',
    desc: 'Employment AI — EU AI Act Annex III applies',
  },
  unacceptable: {
    label: 'Unacceptable',
    cls: 'bg-red-200 text-red-900',
    desc: 'Prohibited under EU AI Act Article 5',
  },
};

// ── Performance Trend Mini-Chart ──────────────────────────────────────────────

function TrendChart({ data }: { data: { date: string; accuracy: number }[] }) {
  if (!data || data.length < 2) return null;
  const svgW = 200;
  const svgH = 50;
  const padX = 8;
  const padY = 6;
  const w = svgW - padX * 2;
  const h = svgH - padY * 2;

  const values = data.map((d) => d.accuracy);
  const minV = Math.min(...values) - 2;
  const maxV = Math.max(...values) + 2;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * w,
    y: padY + h - ((d.accuracy - minV) / (maxV - minV)) * h,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const trend = values[values.length - 1] >= values[0];
  const color = trend ? '#10b981' : '#ef4444';

  return (
    <svg width={svgW} height={svgH} className="w-full h-12">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />
      ))}
    </svg>
  );
}

// ── Metric Gauge ──────────────────────────────────────────────────────────────

function _MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Model Card ────────────────────────────────────────────────────────────────

function ModelCard({
  model,
  perf,
  onSelect,
}: {
  model: AIModel;
  perf: ModelPerformanceMetrics | null;
  onSelect: (m: AIModel) => void;
}) {
  const { label: statusLabel, cls: statusCls, icon: StatusIcon } = STATUS_CONFIG[model.status];
  const { label: riskLabel, cls: riskCls } = RISK_CONFIG[model.riskLevel];

  return (
    <button
      onClick={() => onSelect(model)}
      className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-300 hover:shadow-md transition-all group w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
            {model.name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            v{model.version} · {model.linkedModule}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCls}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusLabel}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskCls}`}>
            {riskLabel}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
        {model.description}
      </p>

      {perf && (
        <>
          <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
            <div className="bg-slate-50 rounded-lg px-2 py-1.5">
              <p className="text-slate-400">Accuracy</p>
              <p className="font-bold text-slate-800">{perf.accuracy}%</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-2 py-1.5">
              <p className="text-slate-400">F1 Score</p>
              <p className="font-bold text-slate-800">{perf.f1Score}%</p>
            </div>
          </div>
          <TrendChart data={perf.trend} />
        </>
      )}

      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
        <Calendar className="w-3 h-3" />
        <span>
          Last trained:{' '}
          {new Date(model.lastTrainedDate).toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </button>
  );
}

// ── Model Detail View ─────────────────────────────────────────────────────────

function ModelDetail({
  model,
  perf,
  onBack,
  onRetire,
  onDeploy,
}: {
  model: AIModel;
  perf: ModelPerformanceMetrics | null;
  onBack: () => void;
  onRetire: (id: string) => void;
  onDeploy: (id: string) => void;
}) {
  const { label: statusLabel, cls: statusCls } = STATUS_CONFIG[model.status];
  const { label: riskLabel, cls: riskCls, desc: riskDesc } = RISK_CONFIG[model.riskLevel];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{model.name}</h2>
          <p className="text-sm text-slate-500">
            v{model.version} · {model.owner} · {model.ownerDepartment}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusCls}`}>
            {statusLabel}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${riskCls}`}>
            {riskLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {model.status === 'active' && (
          <button
            onClick={() => onRetire(model.id)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pause className="w-4 h-4" />
            Retire Model
          </button>
        )}
        {model.status === 'staging' && (
          <button
            onClick={() => onDeploy(model.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Deploy to Production
          </button>
        )}
        <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Trigger Retraining
        </button>
      </div>

      {/* Model Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          Model Card
        </h3>
        {[
          { label: 'Purpose', value: model.purpose },
          { label: 'Training Data', value: model.trainingDataDescription },
          { label: 'Target Audience', value: model.targetAudience },
          { label: 'API Endpoint', value: model.apiEndpoint },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              {label}
            </p>
            <p className="text-sm text-slate-700">{value}</p>
          </div>
        ))}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {model.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
            EU AI Act Risk Classification
          </p>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${riskCls}`}
          >
            <Shield className="w-4 h-4" />
            {riskLabel}
          </div>
          <p className="text-xs text-slate-500 mt-1">{riskDesc}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      {perf && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Accuracy', value: perf.accuracy, color: '#6366f1' },
              { label: 'Precision', value: perf.precision, color: '#10b981' },
              { label: 'Recall', value: perf.recall, color: '#f59e0b' },
              { label: 'F1 Score', value: perf.f1Score, color: '#8b5cf6' },
            ].map((m) => (
              <div key={m.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: m.color }}>
                  {m.value.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              AUC-ROC: {perf.aucRoc.toFixed(3)}
            </p>
          </div>

          {/* Data Drift */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Data Drift Score</p>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${perf.dataDriftScore > 0.2 ? 'bg-red-100 text-red-700' : perf.dataDriftScore > 0.1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
              >
                {perf.dataDriftScore > 0.2
                  ? 'High Drift'
                  : perf.dataDriftScore > 0.1
                    ? 'Moderate'
                    : 'Stable'}
              </span>
            </div>
            <div className="space-y-2">
              {Object.entries(perf.featureDrift)
                .slice(0, 5)
                .map(([feature, drift]) => (
                  <div key={feature} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 w-40 truncate capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(drift as number) * 100}%`,
                          backgroundColor:
                            (drift as number) > 0.2
                              ? '#ef4444'
                              : (drift as number) > 0.1
                                ? '#f59e0b'
                                : '#10b981',
                        }}
                      />
                    </div>
                    <span className="font-medium text-slate-600 w-8 text-right">
                      {((drift as number) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Performance Trend */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Accuracy Trend (6 months)</p>
            <TrendChart data={perf.trend} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{perf.trend[0]?.date}</span>
              <span>{perf.trend[perf.trend.length - 1]?.date}</span>
            </div>
          </div>
        </div>
      )}

      {/* Version & Retraining Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Version & Retraining
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Current Version</p>
            <p className="font-bold text-slate-800">v{model.version}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Deployed</p>
            <p className="font-medium text-slate-700">
              {new Date(model.deployedDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Last Trained</p>
            <p className="font-medium text-slate-700">
              {new Date(model.lastTrainedDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Next Retraining</p>
            <p
              className={`font-medium ${new Date(model.nextRetrainingDate) < new Date() ? 'text-red-600' : 'text-slate-700'}`}
            >
              {new Date(model.nextRetrainingDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIModelRegistry() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [perfData, setPerfData] = useState<Record<string, ModelPerformanceMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [filterStatus, setFilterStatus] = useState<ModelStatus | 'all'>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const mdls = await AIGovernanceService.getAIModels();
      setModels(mdls);
      const perfs: Record<string, ModelPerformanceMetrics> = {};
      for (const m of mdls) {
        const p = await AIGovernanceService.getModelPerformance(m.id);
        if (p) perfs[m.id] = p;
      }
      setPerfData(perfs);
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRetire = (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'retired' as ModelStatus } : m))
    );
    if (selectedModel?.id === id)
      setSelectedModel((prev) => (prev ? { ...prev, status: 'retired' } : prev));
    showToast('Model retired successfully');
  };

  const handleDeploy = (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'active' as ModelStatus } : m))
    );
    if (selectedModel?.id === id)
      setSelectedModel((prev) => (prev ? { ...prev, status: 'active' } : prev));
    showToast('Model deployed to production');
  };

  const filteredModels = models.filter((m) => {
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchRisk = filterRisk === 'all' || m.riskLevel === filterRisk;
    return matchStatus && matchRisk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (selectedModel) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <ModelDetail
          model={selectedModel}
          perf={perfData[selectedModel.id] ?? null}
          onBack={() => setSelectedModel(null)}
          onRetire={handleRetire}
          onDeploy={handleDeploy}
        />
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 z-50">
            <CheckCircle className="w-4 h-4" />
            {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            AI Model Registry
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {models.length} models registered · MLOps & Governance
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Active',
            value: models.filter((m) => m.status === 'active').length,
            cls: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          },
          {
            label: 'Staging',
            value: models.filter((m) => m.status === 'staging').length,
            cls: 'text-blue-600 bg-blue-50 border-blue-200',
          },
          {
            label: 'High Risk',
            value: models.filter((m) => m.riskLevel === 'high').length,
            cls: 'text-red-600 bg-red-50 border-red-200',
          },
          { label: 'Total', value: models.length, cls: 'text-slate-700 bg-white border-slate-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.cls}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ModelStatus | 'all')}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(STATUS_CONFIG) as ModelStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
        >
          <option value="all">All Risk Levels</option>
          {(Object.keys(RISK_CONFIG) as RiskLevel[]).map((r) => (
            <option key={r} value={r}>
              {RISK_CONFIG[r].label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-400 self-center">
          {filteredModels.length} models
        </span>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            perf={perfData[model.id] ?? null}
            onSelect={setSelectedModel}
          />
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
