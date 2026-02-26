'use client';

/**
 * @component ComplianceAnalyticsDashboard
 * @description Compliance & Audit Analytics Dashboard — compliance scorecard, risk heatmap,
 *              audit findings, control effectiveness, remediation tracker, regulatory
 *              calendar, and report generator (Sec 23.6)
 * @project AURA HCM Platform
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  type AuditFinding,
  type AuditTrailEntry,
  ComplianceAuditAnalyticsService,
  type ComplianceScorecard,
  type ComplianceTrend,
  type ControlEffectiveness,
  type RegulatoryCalendarEvent,
  type RegulatoryRisk,
  type RemediationItem,
} from '@/services/complianceAuditAnalyticsService';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  alert,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-slate-800 rounded-xl border p-4 ${alert ? 'border-red-500/40' : 'border-slate-700'}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg bg-opacity-20`} style={{ background: `${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {alert && <AlertTriangle className="w-4 h-4 text-red-400" />}
      </div>
      <div className="mt-3 text-2xl font-bold text-white">{value}</div>
      <div className="text-slate-300 text-sm font-medium mt-0.5">{label}</div>
      {sub && <div className="text-slate-500 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    compliant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    non_compliant: 'bg-red-500/20 text-red-400 border-red-500/30',
    open: 'bg-red-500/20 text-red-400 border-red-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    risk_accepted: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    pass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    partial_pass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    fail: 'bg-red-500/20 text-red-400 border-red-500/30',
    not_tested: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  const label: Record<string, string> = {
    compliant: 'Compliant',
    partial: 'Partial',
    non_compliant: 'Non-Compliant',
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    risk_accepted: 'Risk Accepted',
    pass: 'Pass',
    partial_pass: 'Partial Pass',
    fail: 'Fail',
    not_tested: 'Not Tested',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    completed: 'Completed',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[status] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}
    >
      {label[status] ?? status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-600/20 text-red-400 border-red-600/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    informational: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[severity] ?? ''}`}
    >
      {severity}
    </span>
  );
}

function RiskLevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-amber-500 text-slate-900',
    low: 'bg-emerald-500 text-white',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize ${map[level] ?? ''}`}
    >
      {level}
    </span>
  );
}

// Compliance score gauge arc
function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const R = 60;
  const STROKE = 11;
  const arc = Math.PI * R;
  const progress = (score / 100) * arc;
  const color =
    score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width={156} height={98} viewBox="0 0 156 98">
        {/* Background arc */}
        <path
          d={`M ${78 - R} 90 A ${R} ${R} 0 0 1 ${78 + R} 90`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${78 - R} 90 A ${R} ${R} 0 0 1 ${78 + R} 90`}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${arc}`}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {/* Score text */}
        <text x={78} y={80} textAnchor="middle" fontSize={28} fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x={78} y={93} textAnchor="middle" fontSize={10} fill="#94a3b8">
          / 100
        </text>
      </svg>
      <div className="flex items-center gap-2 -mt-1">
        <span className="text-slate-400 text-sm">Grade</span>
        <span className="text-white font-bold text-xl">{grade}</span>
      </div>
    </div>
  );
}

// Compliance trends line chart
function TrendChart({ data }: { data: ComplianceTrend[] }) {
  if (!data.length) return null;
  const W = 580;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;
  const minY = 60;
  const maxY = 100;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * IW;
  const yScale = (v: number) => PAD.top + ((maxY - v) / (maxY - minY)) * IH;

  const buildPath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ');

  const lines = [
    { key: 'overallScore' as keyof ComplianceTrend, label: 'Overall', color: '#6366f1' },
    { key: 'gdprScore' as keyof ComplianceTrend, label: 'GDPR', color: '#3b82f6' },
    { key: 'wpsScore' as keyof ComplianceTrend, label: 'WPS', color: '#22c55e' },
    { key: 'gosiScore' as keyof ComplianceTrend, label: 'GOSI', color: '#f59e0b' },
  ];

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ minHeight: 120 }}>
        {/* Gridlines */}
        {[70, 80, 90, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={yScale(v)}
              x2={W - PAD.right}
              y2={yScale(v)}
              stroke="#1e293b"
              strokeWidth={1}
            />
            <text x={PAD.left - 6} y={yScale(v) + 4} textAnchor="end" fontSize={9} fill="#475569">
              {v}
            </text>
          </g>
        ))}
        {/* Lines */}
        {lines.map((l) => (
          <path
            key={l.key}
            d={buildPath(data.map((d) => d[l.key] as number))}
            fill="none"
            stroke={l.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* Dots */}
        {lines.map((l) =>
          data.map((d, i) => (
            <circle
              key={`${l.key}-${i}`}
              cx={xScale(i)}
              cy={yScale(d[l.key] as number)}
              r={3}
              fill={l.color}
            />
          ))
        )}
        {/* X labels */}
        {data.map((d, i) => (
          <text
            key={d.period}
            x={xScale(i)}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="#64748b"
          >
            {d.period}
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 mt-1">
        {lines.map((l) => (
          <span key={l.key} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-3 h-0.5 inline-block rounded" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Risk heatmap (likelihood × impact matrix)
function RiskHeatmap({ risks }: { risks: RegulatoryRisk[] }) {
  const likelihood = [1, 2, 3, 4, 5];
  const impact = [5, 4, 3, 2, 1]; // y-axis descending
  const cellColor = (l: number, im: number): string => {
    const score = l * im;
    if (score >= 16) return '#ef4444';
    if (score >= 9) return '#f97316';
    if (score >= 4) return '#f59e0b';
    return '#22c55e';
  };
  const getCellRisks = (l: number, im: number) =>
    risks.filter((r) => r.likelihood === l && r.impact === im);

  return (
    <div className="overflow-x-auto">
      <div className="text-xs text-slate-500 mb-2 text-center">Impact →</div>
      <div className="flex">
        <div
          className="flex flex-col justify-around pr-2 text-xs text-slate-500"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            height: 200,
          }}
        >
          Likelihood →
        </div>
        <div>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
            {impact.map((im) =>
              likelihood.map((l) => {
                const cellRisks = getCellRisks(l, im);
                return (
                  <div
                    key={`${l}-${im}`}
                    className="relative rounded flex items-center justify-center group"
                    style={{
                      width: 52,
                      height: 40,
                      background: `${cellColor(l, im)}22`,
                      border: `1px solid ${cellColor(l, im)}44`,
                    }}
                    title={cellRisks.map((r) => r.regulationLabel).join(', ') || `L${l}×I${im}`}
                  >
                    {cellRisks.length > 0 && (
                      <>
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: cellColor(l, im) }}
                        >
                          {cellRisks.length}
                        </div>
                        <div className="absolute bottom-full left-0 mb-1 w-40 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 hidden group-hover:block z-10 shadow-xl">
                          {cellRisks.map((r) => (
                            <div key={r.regulationId} className="truncate">
                              {r.regulationLabel}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-1 mt-1">
            {likelihood.map((l) => (
              <div key={l} className="text-center text-xs text-slate-500" style={{ width: 52 }}>
                {l}
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 text-center mt-0.5">Likelihood</div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs">
        {[
          { color: '#ef4444', label: 'Critical (16-25)' },
          { color: '#f97316', label: 'High (9-15)' },
          { color: '#f59e0b', label: 'Medium (4-8)' },
          { color: '#22c55e', label: 'Low (1-3)' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1 text-slate-400">
            <span
              className="w-3 h-3 rounded"
              style={{ background: l.color + '44', border: `1px solid ${l.color}` }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Control effectiveness bar
function ControlBar({ score, result }: { score: number; result: string }) {
  const color =
    result === 'pass'
      ? '#22c55e'
      : result === 'partial_pass'
        ? '#f59e0b'
        : result === 'fail'
          ? '#ef4444'
          : '#475569';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{score}%</span>
    </div>
  );
}

// Remediation progress bar
function RemediationBar({ pct, slaRisk }: { pct: number; slaRisk: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: slaRisk ? '#ef4444' : pct >= 75 ? '#22c55e' : '#3b82f6',
          }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

// Audit trail outcome icon
function OutcomeIcon({ outcome }: { outcome: string }) {
  if (outcome === 'success')
    return <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
  if (outcome === 'failure') return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
  return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TABS = [
  'Overview',
  'Risk Map',
  'Findings',
  'Controls',
  'Remediation',
  'Audit Trail',
  'Calendar',
  'Reports',
] as const;
type Tab = (typeof TABS)[number];

export default function ComplianceAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [scorecard, setScorecard] = useState<ComplianceScorecard | null>(null);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [trail, setTrail] = useState<AuditTrailEntry[]>([]);
  const [risks, setRisks] = useState<RegulatoryRisk[]>([]);
  const [controls, setControls] = useState<ControlEffectiveness[]>([]);
  const [remediation, setRemediation] = useState<RemediationItem[]>([]);
  const [trends, setTrends] = useState<ComplianceTrend[]>([]);
  const [calendar, setCalendar] = useState<RegulatoryCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [findingSearch, setFindingSearch] = useState('');
  const [findingStatusFilter, setFindingStatusFilter] = useState('all');
  const [findingSeverityFilter, setFindingSeverityFilter] = useState('all');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ComplianceAuditAnalyticsService.getComplianceScorecard(),
      ComplianceAuditAnalyticsService.getAuditFindings(),
      ComplianceAuditAnalyticsService.getAuditTrail(20),
      ComplianceAuditAnalyticsService.getRegulatoryRiskMap(),
      ComplianceAuditAnalyticsService.getControlEffectiveness(),
      ComplianceAuditAnalyticsService.getRemediationStatus(),
      ComplianceAuditAnalyticsService.getComplianceTrends(),
      ComplianceAuditAnalyticsService.getRegulatoryCalendar(90),
    ]).then(([sc, fi, tr, ri, co, re, trd, cal]) => {
      setScorecard(sc);
      setFindings(fi);
      setTrail(tr);
      setRisks(ri);
      setControls(co);
      setRemediation(re);
      setTrends(trd);
      setCalendar(cal);
      setLoading(false);
    });
  }, []);

  const filteredFindings = findings.filter((f) => {
    const matchSearch =
      !findingSearch ||
      f.title.toLowerCase().includes(findingSearch.toLowerCase()) ||
      f.regulation.toLowerCase().includes(findingSearch.toLowerCase());
    const matchStatus = findingStatusFilter === 'all' || f.status === findingStatusFilter;
    const matchSeverity = findingSeverityFilter === 'all' || f.severity === findingSeverityFilter;
    return matchSearch && matchStatus && matchSeverity;
  });

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportGenerated(false);
    await ComplianceAuditAnalyticsService.generateComplianceReport('Q1 2026');
    setReportLoading(false);
    setReportGenerated(true);
  };

  const daysUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const today = new Date('2026-02-25');
    return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
        <Shield className="w-5 h-5 animate-pulse text-emerald-400" />
        <span>Loading compliance analytics…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Compliance & Audit Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitor regulatory compliance, track findings, and manage audit readiness across all
            jurisdictions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Last updated:</span>
          <span className="text-slate-300">{scorecard?.lastUpdated}</span>
          <button className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      {scorecard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard
            icon={ShieldCheck}
            label="Overall Score"
            value={`${scorecard.overallScore}/100`}
            sub={`Grade ${scorecard.grade} · +${scorecard.overallScore - scorecard.previousOverallScore} QoQ`}
            color="#22c55e"
          />
          <KPICard
            icon={ClipboardList}
            label="Open Findings"
            value={findings.filter((f) => f.status !== 'resolved').length}
            sub={`${scorecard.openCriticalFindings} critical open`}
            color="#f97316"
            alert={scorecard.openCriticalFindings > 0}
          />
          <KPICard
            icon={CheckCircle}
            label="Resolved This Qtr"
            value={scorecard.resolvedThisQuarter}
            sub="findings closed"
            color="#3b82f6"
          />
          <KPICard
            icon={Clock}
            label="SLA at Risk"
            value={remediation.filter((r) => r.slaBreachRisk).length}
            sub="items near deadline"
            color="#ef4444"
            alert={remediation.filter((r) => r.slaBreachRisk).length > 0}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ──────────────────────────────────── */}
      {activeTab === 'Overview' && scorecard && (
        <div className="space-y-6">
          {/* Scorecard + Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score gauge */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center">
              <ScoreGauge score={scorecard.overallScore} grade={scorecard.grade} />
              <div className="w-full grid grid-cols-3 gap-2 mt-4">
                {[
                  {
                    label: 'Compliant',
                    value: scorecard.scores.filter((s) => s.status === 'compliant').length,
                    color: '#22c55e',
                  },
                  {
                    label: 'Partial',
                    value: scorecard.scores.filter((s) => s.status === 'partial').length,
                    color: '#f59e0b',
                  },
                  {
                    label: 'Non-Compliant',
                    value: scorecard.scores.filter((s) => s.status === 'non_compliant').length,
                    color: '#ef4444',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="text-center p-2 rounded-lg"
                    style={{ background: `${s.color}18` }}
                  >
                    <div className="text-lg font-bold" style={{ color: s.color }}>
                      {s.value}
                    </div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trends chart */}
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="text-white font-semibold mb-3">Compliance Score Trends</h3>
              <TrendChart data={trends} />
            </div>
          </div>

          {/* Regulation scores grid */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4">Regulation Compliance Scores</h3>
            <div className="space-y-2">
              {scorecard.scores
                .sort((a, b) => a.score - b.score)
                .map((score) => (
                  <div
                    key={score.regulationId}
                    className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0"
                  >
                    <div className="w-44 min-w-0">
                      <div className="text-slate-300 text-sm font-medium truncate">
                        {score.regulationLabel}
                      </div>
                      <div className="text-slate-500 text-xs">{score.jurisdiction}</div>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${score.score}%`,
                            background:
                              score.score >= 85
                                ? '#22c55e'
                                : score.score >= 70
                                  ? '#f59e0b'
                                  : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-10 text-right">
                      <span
                        className={`text-sm font-bold ${score.score >= 85 ? 'text-emerald-400' : score.score >= 70 ? 'text-amber-400' : 'text-red-400'}`}
                      >
                        {score.score}
                      </span>
                    </div>
                    <div className="w-24 flex justify-end">
                      <StatusBadge status={score.status} />
                    </div>
                    <div className="w-16 text-right">
                      <span
                        className={`text-xs font-medium flex items-center justify-end gap-0.5 ${score.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {score.trend >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(score.trend)}
                      </span>
                    </div>
                    {score.criticalOpenItems > 0 && (
                      <div className="w-8 flex justify-center">
                        <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                          {score.criticalOpenItems}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Risk Map Tab ──────────────────────────────────── */}
      {activeTab === 'Risk Map' && (
        <div className="space-y-6">
          {/* Risk cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <div
                key={risk.regulationId}
                className={`bg-slate-800 rounded-xl border p-4 space-y-3 ${
                  risk.riskLevel === 'critical'
                    ? 'border-red-500/40'
                    : risk.riskLevel === 'high'
                      ? 'border-orange-500/40'
                      : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold text-sm">{risk.regulationLabel}</div>
                    <div className="text-slate-500 text-xs">
                      {risk.jurisdiction} · {risk.category}
                    </div>
                  </div>
                  <RiskLevelBadge level={risk.riskLevel} />
                </div>
                <p className="text-slate-400 text-xs">{risk.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white">{risk.likelihood}/5</div>
                    <div className="text-xs text-slate-500">Likelihood</div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white">{risk.impact}/5</div>
                    <div className="text-xs text-slate-500">Impact</div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-2 text-center">
                    <div
                      className={`text-sm font-bold ${risk.riskScore >= 16 ? 'text-red-400' : risk.riskScore >= 9 ? 'text-orange-400' : 'text-amber-400'}`}
                    >
                      {risk.riskScore}
                    </div>
                    <div className="text-xs text-slate-500">Risk Score</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={risk.mitigationStatus} />
                  {risk.daysToDeadline !== undefined && (
                    <span
                      className={`text-xs font-medium ${risk.daysToDeadline <= 7 ? 'text-red-400' : risk.daysToDeadline <= 30 ? 'text-amber-400' : 'text-slate-400'}`}
                    >
                      {risk.daysToDeadline <= 0 ? 'Overdue' : `${risk.daysToDeadline}d to deadline`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              Regulatory Risk Heatmap (Likelihood × Impact)
            </h3>
            <RiskHeatmap risks={risks} />
          </div>
        </div>
      )}

      {/* ── Findings Tab ──────────────────────────────────── */}
      {activeTab === 'Findings' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search findings…"
                value={findingSearch}
                onChange={(e) => setFindingSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <select
              value={findingSeverityFilter}
              onChange={(e) => setFindingSeverityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={findingStatusFilter}
              onChange={(e) => setFindingStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className={`bg-slate-800 rounded-xl border overflow-hidden ${
                  finding.severity === 'critical' && finding.status !== 'resolved'
                    ? 'border-red-500/40'
                    : 'border-slate-700'
                }`}
              >
                <button
                  className="w-full text-left p-4"
                  onClick={() =>
                    setExpandedFinding(expandedFinding === finding.id ? null : finding.id)
                  }
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm">{finding.title}</span>
                        <SeverityBadge severity={finding.severity} />
                        <StatusBadge status={finding.status} />
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {finding.regulation} · {finding.ownerDepartment} · Owner: {finding.owner}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {finding.dueDate && (
                        <span
                          className={
                            daysUntil(finding.dueDate) <= 7 && finding.status !== 'resolved'
                              ? 'text-red-400'
                              : ''
                          }
                        >
                          Due: {finding.dueDate}
                        </span>
                      )}
                      <span className="text-slate-300 font-medium">{finding.progressPct}%</span>
                      {expandedFinding === finding.id ? (
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  {/* Progress bar inline */}
                  <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${finding.progressPct}%`,
                        background:
                          finding.status === 'resolved'
                            ? '#22c55e'
                            : finding.progressPct >= 70
                              ? '#3b82f6'
                              : finding.progressPct >= 30
                                ? '#f59e0b'
                                : '#ef4444',
                      }}
                    />
                  </div>
                </button>

                {expandedFinding === finding.id && (
                  <div className="border-t border-slate-700 p-4 space-y-3 bg-slate-900/50">
                    <p className="text-slate-300 text-sm">{finding.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Affected Employees</div>
                        <div className="text-white font-semibold">{finding.affectedEmployees}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Audit Cycle</div>
                        <div className="text-white font-semibold">{finding.auditCycle}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Control ID</div>
                        <div className="text-blue-400 font-mono text-sm">{finding.controlId}</div>
                      </div>
                      {finding.potentialFinePenalty && (
                        <div>
                          <div className="text-xs text-slate-500">Potential Penalty</div>
                          <div className="text-red-400 font-semibold">
                            ${finding.potentialFinePenalty.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2">
                        Remediation Steps
                      </div>
                      <ol className="space-y-1">
                        {finding.remediationSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span
                              className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400 font-bold"
                              style={{ fontSize: 9 }}
                            >
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredFindings.length === 0 && (
              <div className="text-center text-slate-500 py-8">No findings match your filters.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Controls Tab ──────────────────────────────────── */}
      {activeTab === 'Controls' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Control</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Domain</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Owner</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3 hidden md:table-cell">
                      Regulations
                    </th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">
                      Effectiveness
                    </th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Result</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3 hidden sm:table-cell">
                      Exceptions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {controls.map((ctrl) => (
                    <tr
                      key={ctrl.controlId}
                      className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-white font-medium text-sm">{ctrl.controlName}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <span className="font-mono">{ctrl.controlId}</span>
                          {ctrl.automated && (
                            <span className="bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded text-xs">
                              Auto
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs capitalize">
                        {ctrl.domain.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{ctrl.owner}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {ctrl.relatedRegulations.map((r) => (
                            <span
                              key={r}
                              className="bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded font-mono"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 w-36">
                        <ControlBar score={ctrl.effectivenessScore} result={ctrl.testResult} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ctrl.testResult} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`text-sm font-bold ${ctrl.openExceptions > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                        >
                          {ctrl.openExceptions}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Remediation Tab ───────────────────────────────── */}
      {activeTab === 'Remediation' && (
        <div className="space-y-3">
          {remediation.map((item) => (
            <div
              key={item.findingId}
              className={`bg-slate-800 rounded-xl border p-4 space-y-3 ${item.slaBreachRisk ? 'border-red-500/40' : 'border-slate-700'}`}
            >
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{item.title}</span>
                    <SeverityBadge severity={item.severity} />
                    {item.slaBreachRisk && (
                      <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        SLA Risk
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    {item.regulation} · {item.ownerDepartment} · {item.owner}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div
                    className={`font-medium ${daysUntil(item.dueDate) <= 7 ? 'text-red-400' : daysUntil(item.dueDate) <= 30 ? 'text-amber-400' : 'text-slate-400'}`}
                  >
                    {daysUntil(item.dueDate) <= 0
                      ? 'Overdue'
                      : `${daysUntil(item.dueDate)}d remaining`}
                  </div>
                  <div className="text-slate-500 mt-0.5">Due: {item.dueDate}</div>
                </div>
              </div>
              <RemediationBar pct={item.progressPct} slaRisk={item.slaBreachRisk} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.latestUpdate}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Audit Trail Tab ───────────────────────────────── */}
      {activeTab === 'Audit Trail' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-medium text-sm">System Audit Log</span>
              <span className="text-slate-500 text-xs ml-auto">
                Showing last {trail.length} entries
              </span>
            </div>
            <div className="divide-y divide-slate-700/50">
              {trail.map((entry) => (
                <div key={entry.id} className="px-4 py-3 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <OutcomeIcon outcome={entry.outcome} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-300 text-sm font-medium">{entry.action}</span>
                        <span className="text-slate-500 text-xs">on</span>
                        <span className="text-blue-400 text-xs font-mono">{entry.resource}</span>
                        {entry.regulationRelevance && entry.regulationRelevance.length > 0 && (
                          <div className="flex gap-1">
                            {entry.regulationRelevance.map((r) => (
                              <span
                                key={r}
                                className="bg-emerald-500/15 text-emerald-400 text-xs px-1.5 py-0.5 rounded font-mono"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {entry.userName} · {entry.userDepartment} · {entry.ipAddress}
                      </div>
                      {entry.details && (
                        <div className="text-slate-400 text-xs mt-0.5 truncate">
                          {entry.details}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 text-right flex-shrink-0">
                      {new Date(entry.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar Tab ──────────────────────────────────── */}
      {activeTab === 'Calendar' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4 text-blue-400" />
            {calendar.length} regulatory events in the next 90 days
          </div>
          {calendar
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((event) => {
              const days = daysUntil(event.dueDate);
              return (
                <div
                  key={event.id}
                  className={`bg-slate-800 rounded-xl border p-4 ${days <= 7 ? 'border-red-500/40' : days <= 30 ? 'border-amber-500/30' : 'border-slate-700'}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center ${days <= 7 ? 'bg-red-500/20 border border-red-500/30' : days <= 30 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700 border border-slate-600'}`}
                    >
                      <div
                        className={`text-lg font-bold leading-tight ${days <= 7 ? 'text-red-400' : days <= 30 ? 'text-amber-400' : 'text-white'}`}
                      >
                        {new Date(event.dueDate).getDate()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(event.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="text-white font-medium text-sm">{event.title}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{event.description}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={event.status} />
                          <span
                            className={`text-xs font-medium ${days <= 7 ? 'text-red-400' : days <= 30 ? 'text-amber-400' : 'text-slate-400'}`}
                          >
                            {days <= 0 ? 'Overdue' : `${days}d`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-700 px-1.5 py-0.5 rounded">
                          {event.regulation}
                        </span>
                        <span className="capitalize">{event.type}</span>
                        <span>Owner: {event.responsible}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ── Reports Tab ───────────────────────────────────── */}
      {activeTab === 'Reports' && (
        <div className="space-y-6">
          {/* Report generator */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Quick Compliance Report Generator
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Report Period</label>
                <select className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
                  <option>Q1 2026</option>
                  <option>Q4 2025</option>
                  <option>H2 2025</option>
                  <option>Full Year 2025</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Scope</label>
                <select className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
                  <option>All Regulations</option>
                  <option>UAE Only (WPS + DIFC)</option>
                  <option>KSA Only (GOSI)</option>
                  <option>Data Privacy (GDPR + PDPA)</option>
                  <option>US Regulations (SOX + ACA + FMLA)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Export Format</label>
                <select className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
                  <option>PDF Report</option>
                  <option>Excel Workbook</option>
                  <option>CSV Data Export</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
              >
                {reportLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {reportLoading ? 'Generating…' : 'Generate Report'}
              </button>
              {reportGenerated && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Report ready
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs hover:bg-emerald-600/30">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Saved reports */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Recent Reports
            </h3>
            <div className="space-y-2">
              {[
                {
                  title: 'Q4 2025 Full Compliance Report',
                  date: '2026-01-05',
                  score: 80,
                  format: 'PDF',
                  size: '2.4 MB',
                },
                {
                  title: 'UAE Regulatory Review — Jan 2026',
                  date: '2026-02-01',
                  score: 94,
                  format: 'PDF',
                  size: '1.1 MB',
                },
                {
                  title: 'GDPR Annual Audit Report 2025',
                  date: '2026-01-15',
                  score: 82,
                  format: 'Excel',
                  size: '3.8 MB',
                },
                {
                  title: 'Q3 2025 Compliance Summary',
                  date: '2025-10-03',
                  score: 77,
                  format: 'PDF',
                  size: '2.1 MB',
                },
              ].map((rep) => (
                <div
                  key={rep.title}
                  className="flex items-center justify-between py-2.5 px-3 bg-slate-900 rounded-lg hover:bg-slate-700/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <div className="text-slate-300 text-sm font-medium">{rep.title}</div>
                      <div className="text-slate-500 text-xs">
                        {rep.date} · {rep.format} · {rep.size}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${rep.score >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}
                    >
                      {rep.score}/100
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition-all">
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
