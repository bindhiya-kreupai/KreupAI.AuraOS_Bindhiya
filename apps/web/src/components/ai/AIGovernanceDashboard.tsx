/**
 * @module AIGovernanceDashboard
 * @description AI governance and responsible AI — model inventory, bias detection,
 *              explainability, audit log, EU AI Act compliance (Sec 31.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Shield,
  Eye,
  FileText,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Download,
  Info,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'models' | 'bias' | 'explainability' | 'audit' | 'euaiact';
type ModelRisk = 'minimal' | 'limited' | 'high' | 'unacceptable';
type ModelStatus = 'deployed' | 'staging' | 'deprecated' | 'monitoring';

interface AIModel {
  id: string;
  name: string;
  purpose: string;
  version: string;
  accuracy: number;
  lastRetrained: string;
  riskClassification: ModelRisk;
  status: ModelStatus;
  biasScore: number;
  department: string;
}

interface BiasMetric {
  modelId: string;
  attribute: string;
  demographicParity: number;
  equalizedOdds: number;
  disparateImpact: number;
  status: 'pass' | 'warning' | 'fail';
}

interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative' | 'neutral';
}

interface AuditDecision {
  id: string;
  timestamp: string;
  decisionType: string;
  modelId: string;
  inputSummary: string;
  output: string;
  confidence: number;
  humanOverride: boolean;
  employeeId?: string;
}

interface EUAIActItem {
  modelId: string;
  modelName: string;
  riskCategory: ModelRisk;
  requirements: { requirement: string; status: 'met' | 'partial' | 'not-met' }[];
  altaiScore: number;
  complianceScore: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const AI_MODELS: AIModel[] = [
  {
    id: 'm-001',
    name: 'Resume Screening AI',
    purpose: 'Automated candidate screening and shortlisting',
    version: 'v3.2.1',
    accuracy: 88,
    lastRetrained: '2026-01-15',
    riskClassification: 'high',
    status: 'deployed',
    biasScore: 82,
    department: 'Recruitment',
  },
  {
    id: 'm-002',
    name: 'Attrition Predictor',
    purpose: 'Flight risk prediction and early intervention',
    version: 'v2.5.0',
    accuracy: 76,
    lastRetrained: '2025-12-10',
    riskClassification: 'limited',
    status: 'deployed',
    biasScore: 91,
    department: 'HR Analytics',
  },
  {
    id: 'm-003',
    name: 'Salary Benchmarking Model',
    purpose: 'Market salary recommendations and pay equity analysis',
    version: 'v1.8.3',
    accuracy: 84,
    lastRetrained: '2026-02-01',
    riskClassification: 'limited',
    status: 'deployed',
    biasScore: 88,
    department: 'Compensation',
  },
  {
    id: 'm-004',
    name: 'Scheduling Optimizer',
    purpose: 'AI-driven shift scheduling and workforce optimization',
    version: 'v4.1.0',
    accuracy: 91,
    lastRetrained: '2026-02-10',
    riskClassification: 'minimal',
    status: 'deployed',
    biasScore: 95,
    department: 'Operations',
  },
  {
    id: 'm-005',
    name: 'Performance Rating AI',
    purpose: 'Assists managers in calibrating performance ratings',
    version: 'v1.2.0',
    accuracy: 72,
    lastRetrained: '2025-11-20',
    riskClassification: 'high',
    status: 'staging',
    biasScore: 74,
    department: 'Performance',
  },
];

const BIAS_METRICS: BiasMetric[] = [
  {
    modelId: 'm-001',
    attribute: 'Gender',
    demographicParity: 0.92,
    equalizedOdds: 0.88,
    disparateImpact: 0.85,
    status: 'warning',
  },
  {
    modelId: 'm-001',
    attribute: 'Ethnicity',
    demographicParity: 0.89,
    equalizedOdds: 0.84,
    disparateImpact: 0.82,
    status: 'warning',
  },
  {
    modelId: 'm-001',
    attribute: 'Age (40+)',
    demographicParity: 0.78,
    equalizedOdds: 0.72,
    disparateImpact: 0.74,
    status: 'fail',
  },
  {
    modelId: 'm-002',
    attribute: 'Gender',
    demographicParity: 0.97,
    equalizedOdds: 0.95,
    disparateImpact: 0.94,
    status: 'pass',
  },
  {
    modelId: 'm-002',
    attribute: 'Ethnicity',
    demographicParity: 0.94,
    equalizedOdds: 0.92,
    disparateImpact: 0.91,
    status: 'pass',
  },
  {
    modelId: 'm-003',
    attribute: 'Gender',
    demographicParity: 0.96,
    equalizedOdds: 0.94,
    disparateImpact: 0.93,
    status: 'pass',
  },
  {
    modelId: 'm-005',
    attribute: 'Gender',
    demographicParity: 0.82,
    equalizedOdds: 0.78,
    disparateImpact: 0.76,
    status: 'fail',
  },
];

const FEATURE_IMPORTANCE: Record<string, FeatureImportance[]> = {
  'm-001': [
    { feature: 'Skills Match Score', importance: 0.34, direction: 'positive' },
    { feature: 'Years of Experience', importance: 0.22, direction: 'positive' },
    { feature: 'Education Level', importance: 0.18, direction: 'positive' },
    { feature: 'Employment Gap', importance: 0.12, direction: 'negative' },
    { feature: 'Previous Company Tier', importance: 0.08, direction: 'positive' },
    { feature: 'Keyword Density', importance: 0.06, direction: 'positive' },
  ],
  'm-002': [
    { feature: 'Engagement Survey Score', importance: 0.28, direction: 'negative' },
    { feature: 'Time Since Last Promotion', importance: 0.24, direction: 'negative' },
    { feature: 'Compensation vs Market', importance: 0.2, direction: 'negative' },
    { feature: 'Manager Rating', importance: 0.14, direction: 'positive' },
    { feature: 'Career Velocity', importance: 0.1, direction: 'positive' },
    { feature: 'Tenure', importance: 0.04, direction: 'positive' },
  ],
};

const AUDIT_DECISIONS: AuditDecision[] = [
  {
    id: 'ad-001',
    timestamp: '2026-02-26 11:32',
    decisionType: 'Resume Screening',
    modelId: 'm-001',
    inputSummary: 'Candidate: J. Smith, SWE role, 5yr exp',
    output: 'Shortlisted (Score: 84/100)',
    confidence: 84,
    humanOverride: false,
    employeeId: 'CAND-0042',
  },
  {
    id: 'ad-002',
    timestamp: '2026-02-26 10:18',
    decisionType: 'Attrition Prediction',
    modelId: 'm-002',
    inputSummary: 'Employee: EMP-0142, Sales, 3yr tenure',
    output: 'High Risk (Score: 78/100)',
    confidence: 78,
    humanOverride: true,
    employeeId: 'EMP-0142',
  },
  {
    id: 'ad-003',
    timestamp: '2026-02-26 09:55',
    decisionType: 'Salary Recommendation',
    modelId: 'm-003',
    inputSummary: 'Role: Sr. Engineer, Level 5, SF',
    output: 'Recommended: $148K–$162K',
    confidence: 91,
    humanOverride: false,
  },
  {
    id: 'ad-004',
    timestamp: '2026-02-25 16:44',
    decisionType: 'Resume Screening',
    modelId: 'm-001',
    inputSummary: 'Candidate: M. Garcia, Data Analyst',
    output: 'Rejected (Score: 42/100)',
    confidence: 42,
    humanOverride: true,
    employeeId: 'CAND-0058',
  },
  {
    id: 'ad-005',
    timestamp: '2026-02-25 14:22',
    decisionType: 'Shift Schedule Optimization',
    modelId: 'm-004',
    inputSummary: 'Team: Ops-A, Week of Feb 28',
    output: 'Optimal schedule generated',
    confidence: 96,
    humanOverride: false,
  },
];

const EU_AI_ACT_ITEMS: EUAIActItem[] = [
  {
    modelId: 'm-001',
    modelName: 'Resume Screening AI',
    riskCategory: 'high',
    altaiScore: 62,
    complianceScore: 68,
    requirements: [
      { requirement: 'Human oversight mechanism', status: 'met' },
      { requirement: 'Bias testing & documentation', status: 'partial' },
      { requirement: 'Transparency to affected persons', status: 'partial' },
      { requirement: 'Accuracy & robustness testing', status: 'met' },
      { requirement: 'Data governance documentation', status: 'met' },
      { requirement: 'CONFORMITY assessment', status: 'not-met' },
    ],
  },
  {
    modelId: 'm-002',
    modelName: 'Attrition Predictor',
    riskCategory: 'limited',
    altaiScore: 78,
    complianceScore: 84,
    requirements: [
      { requirement: 'Human oversight mechanism', status: 'met' },
      { requirement: 'Transparency notice to users', status: 'met' },
      { requirement: 'Data minimization compliance', status: 'partial' },
      { requirement: 'Accuracy documentation', status: 'met' },
    ],
  },
  {
    modelId: 'm-005',
    modelName: 'Performance Rating AI',
    riskCategory: 'high',
    altaiScore: 48,
    complianceScore: 52,
    requirements: [
      { requirement: 'Human oversight mechanism', status: 'partial' },
      { requirement: 'Bias testing & documentation', status: 'not-met' },
      { requirement: 'Transparency to affected persons', status: 'not-met' },
      { requirement: 'CONFORMITY assessment', status: 'not-met' },
      { requirement: 'Post-market monitoring plan', status: 'partial' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'models', label: 'AI Models', icon: Cpu },
  { id: 'bias', label: 'Bias Detection', icon: Shield },
  { id: 'explainability', label: 'Explainability', icon: Eye },
  { id: 'audit', label: 'Audit Log', icon: FileText },
  { id: 'euaiact', label: 'EU AI Act', icon: Globe },
];

function riskClassConfig(risk: ModelRisk) {
  const map = {
    minimal: { label: 'Minimal Risk', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    limited: { label: 'Limited Risk', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    high: { label: 'High Risk', color: 'bg-red-100 text-red-700 border-red-200' },
    unacceptable: { label: 'Unacceptable', color: 'bg-gray-900 text-white border-gray-800' },
  };
  return map[risk];
}

function modelStatusConfig(s: ModelStatus) {
  const map = {
    deployed: { label: 'Deployed', color: 'bg-emerald-100 text-emerald-700' },
    staging: { label: 'Staging', color: 'bg-amber-100 text-amber-700' },
    deprecated: { label: 'Deprecated', color: 'bg-gray-100 text-gray-600' },
    monitoring: { label: 'Monitoring', color: 'bg-blue-100 text-blue-700' },
  };
  return map[s];
}

function biasStatusConfig(s: BiasMetric['status']) {
  const map = {
    pass: { label: 'Pass', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    warning: { label: 'Warning', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    fail: { label: 'Fail', color: 'bg-red-100 text-red-700', icon: XCircle },
  };
  return map[s];
}

function reqStatusConfig(s: 'met' | 'partial' | 'not-met') {
  const map = {
    met: { icon: CheckCircle, color: 'text-emerald-500' },
    partial: { icon: AlertCircle, color: 'text-amber-500' },
    'not-met': { icon: XCircle, color: 'text-red-500' },
  };
  return map[s];
}

// ── Tab: AI Models ────────────────────────────────────────────────────────────

function AIModelsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Deployed Models',
            value: AI_MODELS.filter((m) => m.status === 'deployed').length,
            color: 'text-blue-600',
          },
          {
            label: 'High Risk Models',
            value: AI_MODELS.filter((m) => m.riskClassification === 'high').length,
            color: 'text-red-600',
          },
          {
            label: 'Avg Accuracy',
            value: `${Math.round(AI_MODELS.reduce((s, m) => s + m.accuracy, 0) / AI_MODELS.length)}%`,
            color: 'text-emerald-600',
          },
          {
            label: 'Avg Fairness Score',
            value: `${Math.round(AI_MODELS.reduce((s, m) => s + m.biasScore, 0) / AI_MODELS.length)}/100`,
            color: 'text-purple-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {AI_MODELS.map((model) => {
          const { label: riskLabel, color: riskColor } = riskClassConfig(model.riskClassification);
          const { label: statusLabel, color: statusColor } = modelStatusConfig(model.status);
          return (
            <div
              key={model.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-800">{model.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${riskColor}`}
                      >
                        {riskLabel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{model.purpose}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400">Version</span>
                        <p className="font-mono font-semibold text-gray-700 mt-0.5">
                          {model.version}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Accuracy</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${model.accuracy}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-700">{model.accuracy}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Fairness Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${model.biasScore >= 90 ? 'bg-emerald-500' : model.biasScore >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${model.biasScore}%` }}
                            />
                          </div>
                          <span
                            className={`font-bold ${model.biasScore >= 90 ? 'text-emerald-600' : model.biasScore >= 75 ? 'text-amber-600' : 'text-red-600'}`}
                          >
                            {model.biasScore}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Retrained</span>
                        <p className="font-semibold text-gray-700 mt-0.5">{model.lastRetrained}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 font-medium">
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Bias Detection ───────────────────────────────────────────────────────

function BiasDetectionTab() {
  const [selectedModel, setSelectedModel] = useState('m-001');
  const modelMetrics = BIAS_METRICS.filter((m) => m.modelId === selectedModel);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Select Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {AI_MODELS.filter((m) => m.status !== 'deprecated').map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700">
          <p className="font-semibold mb-0.5">Fairness Metric Thresholds</p>
          <p>
            Demographic Parity &gt; 0.80 | Equalized Odds &gt; 0.80 | Disparate Impact &gt; 0.80
            (4/5ths rule)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {modelMetrics.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No bias metrics available for this model.
          </div>
        )}
        {modelMetrics.map((metric, i) => {
          const { label, color, icon: Icon } = biasStatusConfig(metric.status);
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800">{metric.attribute}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} flex items-center gap-1`}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Demographic Parity', value: metric.demographicParity, threshold: 0.8 },
                  { name: 'Equalized Odds', value: metric.equalizedOdds, threshold: 0.8 },
                  { name: 'Disparate Impact', value: metric.disparateImpact, threshold: 0.8 },
                ].map((m) => {
                  const passing = m.value >= m.threshold;
                  return (
                    <div
                      key={m.name}
                      className={`p-3 rounded-lg ${passing ? 'bg-emerald-50' : 'bg-red-50'}`}
                    >
                      <p className="text-xs text-gray-500 mb-1">{m.name}</p>
                      <p
                        className={`text-xl font-bold ${passing ? 'text-emerald-700' : 'text-red-700'}`}
                      >
                        {m.value.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${passing ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {passing
                          ? `Above threshold (${m.threshold})`
                          : `Below threshold (${m.threshold})`}
                      </p>
                      <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${passing ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${m.value * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Explainability ───────────────────────────────────────────────────────

function ExplainabilityTab() {
  const [selectedModel, setSelectedModel] = useState('m-001');
  const features = FEATURE_IMPORTANCE[selectedModel] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Select Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(FEATURE_IMPORTANCE).map((id) => {
            const m = AI_MODELS.find((x) => x.id === id);
            return (
              <option key={id} value={id}>
                {m?.name ?? id}
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Feature Importance (SHAP Values)</h3>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-44 truncate">{f.feature}</span>
                <div className="flex-1 relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full ${f.direction === 'positive' ? 'bg-blue-500' : f.direction === 'negative' ? 'bg-red-400' : 'bg-gray-400'}`}
                    style={{ width: `${f.importance * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-600 w-10 text-right">
                  {(f.importance * 100).toFixed(0)}%
                </span>
                <span
                  className={`text-xs font-medium w-12 text-center px-1 py-0.5 rounded ${f.direction === 'positive' ? 'bg-blue-100 text-blue-700' : f.direction === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {f.direction === 'positive'
                    ? '+Risk'
                    : f.direction === 'negative'
                      ? '-Risk'
                      : 'Neut'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Sample Prediction Explanation</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Input
            </p>
            <div className="space-y-1 text-xs text-gray-700">
              {selectedModel === 'm-001' ? (
                <>
                  <p>Candidate: J. Anderson, Senior Software Engineer</p>
                  <p>Skills Match: 78/100 | Experience: 8 years</p>
                  <p>Education: BS Computer Science (Top 50 University)</p>
                </>
              ) : (
                <>
                  <p>Employee: EMP-0192, Sales Representative</p>
                  <p>Engagement Score: 52/100 | Last Promotion: 2 years ago</p>
                  <p>Comp vs Market: -8% | Manager Rating: 3.2/5</p>
                </>
              )}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Prediction Explanation
            </p>
            {selectedModel === 'm-001' ? (
              <p className="text-xs text-gray-700 leading-relaxed">
                Score: <strong>78/100 — Shortlisted</strong>. Main drivers: High skills match
                (+34%), strong experience level (+22%), good educational background (+18%). Minor
                concern: 6-month employment gap (-12%).
              </p>
            ) : (
              <p className="text-xs text-gray-700 leading-relaxed">
                Risk Score: <strong>71/100 — High Risk</strong>. Main drivers: Low engagement score
                (+28%), no promotion in 2+ years (+24%), compensation below market rate (+20%).
                Mitigating: Active manager (+14%).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Audit Log ────────────────────────────────────────────────────────────

function AuditLogTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Decisions Today', value: '142', color: 'text-blue-600' },
          { label: 'Human Overrides', value: '12', color: 'text-amber-600' },
          { label: 'Override Rate', value: '8.4%', color: 'text-orange-600' },
          { label: 'Avg Confidence', value: '78%', color: 'text-purple-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">AI Decision Audit Trail</h3>
          <button className="text-xs flex items-center gap-1.5 text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Decision Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Input Summary
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Output
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Override
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {AUDIT_DECISIONS.map((d) => (
              <tr key={d.id} className={`hover:bg-gray-50 ${d.humanOverride ? 'bg-amber-50' : ''}`}>
                <td className="px-4 py-3 text-xs font-mono text-gray-600">{d.timestamp}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-gray-800">{d.decisionType}</span>
                  <p className="text-xs text-gray-400">
                    {AI_MODELS.find((m) => m.id === d.modelId)?.version}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                  {d.inputSummary}
                </td>
                <td className="px-4 py-3 text-xs text-gray-700 max-w-xs truncate">{d.output}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.confidence >= 80 ? 'bg-emerald-500' : d.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${d.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{d.confidence}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {d.humanOverride ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                      Overridden
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                      Accepted
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: EU AI Act ────────────────────────────────────────────────────────────

function EUAIActTab() {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h4 className="font-semibold text-purple-800 mb-1 flex items-center gap-2">
          <Globe className="w-4 h-4" /> EU AI Act Compliance Overview
        </h4>
        <p className="text-xs text-purple-600">
          The EU AI Act classifies AI systems into risk categories. High-risk AI systems (including
          HR decision tools) require mandatory transparency, oversight, and documentation
          requirements by August 2026.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'High Risk Models',
            value: EU_AI_ACT_ITEMS.filter((m) => m.riskCategory === 'high').length,
            color: 'text-red-600',
          },
          {
            label: 'Limited Risk Models',
            value: EU_AI_ACT_ITEMS.filter((m) => m.riskCategory === 'limited').length,
            color: 'text-blue-600',
          },
          {
            label: 'Avg Compliance Score',
            value: `${Math.round(EU_AI_ACT_ITEMS.reduce((s, m) => s + m.complianceScore, 0) / EU_AI_ACT_ITEMS.length)}%`,
            color: 'text-amber-600',
          },
          {
            label: 'Avg ALTAI Score',
            value: `${Math.round(EU_AI_ACT_ITEMS.reduce((s, m) => s + m.altaiScore, 0) / EU_AI_ACT_ITEMS.length)}/100`,
            color: 'text-purple-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {EU_AI_ACT_ITEMS.map((item) => {
          const { label, color } = riskClassConfig(item.riskCategory);
          const metCount = item.requirements.filter((r) => r.status === 'met').length;
          const totalCount = item.requirements.length;
          return (
            <div
              key={item.modelId}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{item.modelName}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
                    >
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {metCount}/{totalCount} requirements met
                  </p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p
                      className={`text-2xl font-bold ${item.complianceScore >= 80 ? 'text-emerald-600' : item.complianceScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}
                    >
                      {item.complianceScore}%
                    </p>
                    <p className="text-xs text-gray-500">Compliance</p>
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${item.altaiScore >= 75 ? 'text-blue-600' : item.altaiScore >= 55 ? 'text-amber-600' : 'text-red-600'}`}
                    >
                      {item.altaiScore}
                    </p>
                    <p className="text-xs text-gray-500">ALTAI Score</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {item.requirements.map((req, i) => {
                  const { icon: Icon, color: iconColor } = reqStatusConfig(req.status);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                      <span className="text-sm text-gray-700">{req.requirement}</span>
                      <span
                        className={`ml-auto text-xs px-2 py-0.5 rounded font-medium ${req.status === 'met' ? 'bg-emerald-100 text-emerald-700' : req.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {req.status === 'not-met'
                          ? 'Not Met'
                          : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIGovernanceDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('models');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Governance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Responsible AI — fairness, transparency, and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 600);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TAB_LIST.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'models' && <AIModelsTab />}
          {activeTab === 'bias' && <BiasDetectionTab />}
          {activeTab === 'explainability' && <ExplainabilityTab />}
          {activeTab === 'audit' && <AuditLogTab />}
          {activeTab === 'euaiact' && <EUAIActTab />}
        </>
      )}
    </div>
  );
}
