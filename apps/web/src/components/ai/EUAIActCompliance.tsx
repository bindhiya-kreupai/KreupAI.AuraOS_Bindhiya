// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module EUAIActCompliance
 * @description EU AI Act Compliance Dashboard — risk classification matrix,
 *              high-risk requirements checklist, compliance status per requirement,
 *              documentation tracker, conformity assessment status,
 *              technical documentation generator, timeline & deadlines (Sec 31)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Loader2,
  Eye,
  BookOpen,
  Scale,
  Minus,
} from 'lucide-react';
import {
  AIGovernanceService,
  type AIModel,
  type EUAIActAssessment,
  type EUAIActRequirement,
  type RiskLevel,
} from '@/services/aiGovernanceService';

// ── Config ────────────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; cls: string; bg: string; description: string; color: string }
> = {
  unacceptable: {
    label: 'Unacceptable',
    cls: 'text-red-900',
    bg: 'bg-red-200 border-red-400',
    description: 'Prohibited — cannot be used',
    color: '#991b1b',
  },
  high: {
    label: 'High Risk',
    cls: 'text-red-700',
    bg: 'bg-red-100 border-red-300',
    description: 'Annex III — strict compliance required',
    color: '#ef4444',
  },
  limited: {
    label: 'Limited Risk',
    cls: 'text-amber-700',
    bg: 'bg-amber-100 border-amber-300',
    description: 'Transparency obligations',
    color: '#f59e0b',
  },
  minimal: {
    label: 'Minimal Risk',
    cls: 'text-emerald-700',
    bg: 'bg-emerald-100 border-emerald-300',
    description: 'Voluntary codes of conduct',
    color: '#10b981',
  },
};

const REQ_STATUS_CONFIG: Record<
  EUAIActRequirement['status'],
  { label: string; icon: React.ElementType; cls: string }
> = {
  compliant: { label: 'Compliant', icon: CheckCircle, cls: 'text-emerald-700 bg-emerald-100' },
  partial: { label: 'Partial', icon: AlertTriangle, cls: 'text-amber-700 bg-amber-100' },
  non_compliant: { label: 'Non-Compliant', icon: XCircle, cls: 'text-red-700 bg-red-100' },
  not_applicable: { label: 'N/A', icon: Minus, cls: 'text-slate-500 bg-slate-100' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function complianceScore(requirements: EUAIActRequirement[]) {
  const applicable = requirements.filter((r) => r.status !== 'not_applicable');
  if (applicable.length === 0) return 100;
  const scores = { compliant: 1, partial: 0.5, non_compliant: 0, not_applicable: 0 };
  return Math.round(
    (applicable.reduce((s, r) => s + scores[r.status], 0) / applicable.length) * 100
  );
}

function ComplianceBar({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-slate-700">Overall Compliance</span>
        <span className="font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Risk Matrix ───────────────────────────────────────────────────────────────

function RiskMatrix({ models }: { models: AIModel[] }) {
  const modelsByRisk: Record<RiskLevel, AIModel[]> = {
    unacceptable: models.filter((m) => m.riskLevel === 'unacceptable'),
    high: models.filter((m) => m.riskLevel === 'high'),
    limited: models.filter((m) => m.riskLevel === 'limited'),
    minimal: models.filter((m) => m.riskLevel === 'minimal'),
  };

  return (
    <div className="space-y-2">
      {(['unacceptable', 'high', 'limited', 'minimal'] as RiskLevel[]).map((level) => {
        const { label, bg, description, _color, cls } = RISK_CONFIG[level];
        const levelModels = modelsByRisk[level];
        return (
          <div key={level} className={`rounded-xl border ${bg} p-3`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${cls}`} />
                <span className={`font-bold text-sm ${cls}`}>{label}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${cls}`}>
                {levelModels.length} model{levelModels.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className={`text-xs ${cls} opacity-80 mb-2`}>{description}</p>
            {levelModels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {levelModels.map((m) => (
                  <span
                    key={m.id}
                    className="text-xs bg-white/70 rounded-lg px-2 py-0.5 font-medium text-slate-700"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Requirement Card ──────────────────────────────────────────────────────────

function RequirementCard({ req }: { req: EUAIActRequirement }) {
  const [expanded, setExpanded] = useState(false);
  const { label, icon: Icon, cls } = REQ_STATUS_CONFIG[req.status];

  return (
    <div
      className={`rounded-xl border overflow-hidden ${req.status === 'non_compliant' ? 'border-red-200' : req.status === 'partial' ? 'border-amber-200' : 'border-slate-200'}`}
    >
      <button
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 ${cls}`}
        >
          <Icon className="w-3 h-3" />
          {label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{req.requirement}</p>
          <p className="text-xs text-slate-400 capitalize">{req.category}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2 text-sm">
          <p className="text-slate-600">{req.description}</p>
          {req.evidence && (
            <div className="bg-emerald-50 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-emerald-700 mb-0.5">Evidence</p>
              <p className="text-xs text-emerald-700">{req.evidence}</p>
            </div>
          )}
          {req.actionRequired && (
            <div className="bg-amber-50 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">Action Required</p>
              <p className="text-xs text-amber-700">{req.actionRequired}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function Timeline({ deadlines }: { deadlines: { date: string; milestone: string }[] }) {
  const today = new Date('2025-02-25');
  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="space-y-4">
        {sorted.map((item, i) => {
          const date = new Date(item.date);
          const isPast = date < today;
          const isDueSoon = !isPast && date.getTime() - today.getTime() < 90 * 86400000;
          const dotColor = isPast ? 'bg-slate-300' : isDueSoon ? 'bg-amber-500' : 'bg-indigo-500';
          const textColor = isPast
            ? 'text-slate-400'
            : isDueSoon
              ? 'text-amber-700'
              : 'text-slate-800';
          const bg = isPast
            ? 'bg-slate-50'
            : isDueSoon
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-slate-200';

          return (
            <div key={i} className="flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 z-10 ${dotColor}`}
              >
                {isPast ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : isDueSoon ? (
                  <AlertTriangle className="w-4 h-4 text-white" />
                ) : (
                  <Calendar className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`flex-1 rounded-xl border p-3 ${bg}`}>
                <p
                  className={`text-xs font-bold mb-0.5 ${isPast ? 'text-slate-400' : isDueSoon ? 'text-amber-600' : 'text-indigo-600'}`}
                >
                  {date.toLocaleDateString('en', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {isDueSoon && !isPast && (
                    <span className="ml-2 bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full text-xs">
                      {Math.ceil((date.getTime() - today.getTime()) / 86400000)}d left
                    </span>
                  )}
                </p>
                <p className={`text-sm font-semibold ${textColor}`}>{item.milestone}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Technical Documentation Template ─────────────────────────────────────────

function TechDocTemplate({ model, assessment }: { model: AIModel; assessment: EUAIActAssessment }) {
  const template = `# Technical Documentation — ${model.name}
## Article 11 (EU AI Act) Compliance Document
Version: ${model.version} | Date: ${new Date().toLocaleDateString()}

### 1. General Description
- **System Name**: ${model.name}
- **Version**: ${model.version}
- **Owner**: ${model.owner} (${model.ownerDepartment})
- **Risk Classification**: ${assessment.riskLevel.toUpperCase()}
- **Deployment Date**: ${model.deployedDate}

### 2. Purpose & Intended Use
${model.purpose}

### 3. Training Data
${model.trainingDataDescription}

### 4. Human Oversight Mechanism
${assessment.humanOversightMechanism}

### 5. Performance Metrics
See model performance dashboard for current metrics.

### 6. Limitations
[To be completed by model owner]

### 7. Data Governance
[Link to data governance documentation]

### 8. Conformity Assessment
Status: ${assessment.conformityAssessmentStatus}
`;

  return (
    <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-64">
      <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">{template}</pre>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EUAIActCompliance() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('model-001');
  const [assessment, setAssessment] = useState<EUAIActAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDocTemplate, setShowDocTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'requirements' | 'timeline' | 'docs'>(
    'matrix'
  );

  useEffect(() => {
    AIGovernanceService.getAIModels().then(setModels);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const a = await AIGovernanceService.getEUAIActCompliance(selectedModelId);
      setAssessment(a);
      setLoading(false);
    })();
  }, [selectedModelId]);

  const selectedModel = models.find((m) => m.id === selectedModelId);
  const score = assessment ? complianceScore(assessment.requirements) : 0;

  const statusCount = assessment
    ? {
        compliant: assessment.requirements.filter((r) => r.status === 'compliant').length,
        partial: assessment.requirements.filter((r) => r.status === 'partial').length,
        non_compliant: assessment.requirements.filter((r) => r.status === 'non_compliant').length,
      }
    : { compliant: 0, partial: 0, non_compliant: 0 };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" />
            EU AI Act Compliance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Regulation (EU) 2024/1689 · Risk classification & compliance tracking
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          The EU AI Act entered into force on August 1, 2024. Prohibited practice provisions apply
          from August 2, 2025. High-risk system requirements apply from August 2, 2026. This
          dashboard tracks your compliance journey.
        </p>
      </div>

      {/* Model Selector + Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="relative">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700 appearance-none pr-10"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {RISK_CONFIG[m.riskLevel].label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {assessment && selectedModel && (
          <>
            <ComplianceBar score={score} />
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <p className="text-2xl font-bold text-emerald-700">{statusCount.compliant}</p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">Compliant</p>
              </div>
              <div className="text-center bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-2xl font-bold text-amber-700">{statusCount.partial}</p>
                <p className="text-xs text-amber-600 font-medium mt-0.5">Partial</p>
              </div>
              <div className="text-center bg-red-50 rounded-xl p-3 border border-red-200">
                <p className="text-2xl font-bold text-red-700">{statusCount.non_compliant}</p>
                <p className="text-xs text-red-600 font-medium mt-0.5">Non-Compliant</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Conformity Assessment</p>
                <span
                  className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${assessment.conformityAssessmentStatus === 'complete' ? 'bg-emerald-100 text-emerald-700' : assessment.conformityAssessmentStatus === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                >
                  {assessment.conformityAssessmentStatus.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Technical Documentation</p>
                <span
                  className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${assessment.technicalDocumentationStatus === 'available' ? 'bg-emerald-100 text-emerald-700' : assessment.technicalDocumentationStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                >
                  {assessment.technicalDocumentationStatus}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {(
          [
            { key: 'matrix', label: 'Risk Matrix' },
            { key: 'requirements', label: 'Requirements' },
            { key: 'timeline', label: 'Timeline' },
            { key: 'docs', label: 'Documentation' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-fit py-2 px-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* Risk Matrix Tab */}
          {activeTab === 'matrix' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                All registered AI models classified by EU AI Act risk level:
              </p>
              <RiskMatrix models={models} />
              {assessment && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm">
                    Risk Justification — {selectedModel?.name}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold mb-3 ${RISK_CONFIG[assessment.riskLevel].bg} ${RISK_CONFIG[assessment.riskLevel].cls}`}
                  >
                    <Shield className="w-4 h-4" />
                    {RISK_CONFIG[assessment.riskLevel].label}
                  </div>
                  <p className="text-sm text-slate-600">{assessment.riskJustification}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Human Oversight:</span>{' '}
                      {assessment.humanOversightMechanism}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && assessment && (
            <div className="space-y-3">
              {/* Category Groups */}
              {Array.from(new Set(assessment.requirements.map((r) => r.category))).map(
                (category) => {
                  const catReqs = assessment.requirements.filter((r) => r.category === category);
                  return (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {catReqs.map((req) => (
                          <RequirementCard key={req.id} req={req} />
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && assessment && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  EU AI Act Key Deadlines
                </h3>
                <Timeline deadlines={assessment.keyDeadlines} />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm">
                <h3 className="font-semibold text-slate-700 mb-2 text-sm">Assessment Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Last Assessment</p>
                    <p className="font-medium text-slate-800">
                      {new Date(assessment.lastAssessmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Next Review</p>
                    <p className="font-medium text-slate-800">
                      {new Date(assessment.nextReviewDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documentation Tab */}
          {activeTab === 'docs' && assessment && selectedModel && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  Documentation Requirements Tracker
                </h3>
                {[
                  {
                    label: 'Technical Documentation (Article 11)',
                    status:
                      assessment.technicalDocumentationStatus === 'available'
                        ? 'complete'
                        : assessment.technicalDocumentationStatus === 'partial'
                          ? 'in_progress'
                          : 'not_started',
                  },
                  {
                    label: 'Conformity Assessment (Article 43)',
                    status: assessment.conformityAssessmentStatus,
                  },
                  {
                    label: 'Fundamental Rights Impact Assessment',
                    status:
                      assessment.requirements.find((r) => r.id === 'req-008')?.status ===
                      'non_compliant'
                        ? 'not_started'
                        : 'in_progress',
                  },
                  { label: 'Incident Reporting Procedures', status: 'in_progress' },
                  { label: 'Post-Market Monitoring Plan', status: 'complete' },
                  { label: 'EU Database Registration', status: 'not_started' },
                ].map((item) => {
                  const isComplete = item.status === 'complete';
                  const isInProgress = item.status === 'in_progress';
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0"
                    >
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : isInProgress ? (
                        <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="flex-1 text-sm text-slate-700">{item.label}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-700' : isInProgress ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Technical Doc Generator */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Technical Documentation Template
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDocTemplate((s) => !s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showDocTemplate ? 'Hide' : 'Preview'}
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Auto-generated technical documentation template based on Article 11 requirements.
                  Customize and submit to your DPO.
                </p>
                {showDocTemplate && (
                  <TechDocTemplate model={selectedModel} assessment={assessment} />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
