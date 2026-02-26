/**
 * @module ComplianceDashboard
 * @description Compliance framework overview with readiness gauges, control status charts,
 *              upcoming audits, and gap analysis summary.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  ChevronRight,
  FileCheck,
  Loader2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import {
  ComplianceFrameworkService,
  type ComplianceFramework,
  type ComplianceTimeline,
  type FrameworkId,
} from '@/services/complianceFrameworkService';

// ── Circular Readiness Gauge ─────────────────────────────────────────────────

function ReadinessGauge({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  const color =
    score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';

  const textColor =
    score >= 85
      ? 'text-emerald-600'
      : score >= 70
        ? 'text-blue-600'
        : score >= 50
          ? 'text-amber-600'
          : 'text-red-600';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
      </div>
    </div>
  );
}

// ── Framework Status Badge ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: ComplianceFramework['status'] }) {
  const config = {
    certified: {
      label: 'Certified',
      className: 'bg-emerald-100 text-emerald-700',
      icon: ShieldCheck,
    },
    'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700', icon: Shield },
    'not-started': {
      label: 'Not Started',
      className: 'bg-slate-100 text-slate-600',
      icon: ShieldAlert,
    },
    expired: { label: 'Expired', className: 'bg-red-100 text-red-700', icon: XCircle },
  }[status];

  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ── Control Status Bar Chart ─────────────────────────────────────────────────

function ControlStatusBar({
  compliant,
  partial,
  nonCompliant,
  total,
}: {
  compliant: number;
  partial: number;
  nonCompliant: number;
  total: number;
}) {
  if (total === 0) return null;
  const compliantPct = (compliant / total) * 100;
  const partialPct = (partial / total) * 100;
  const nonCompliantPct = (nonCompliant / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${compliantPct}%` }}
        />
        <div
          className="bg-amber-400 transition-all duration-500"
          style={{ width: `${partialPct}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-500"
          style={{ width: `${nonCompliantPct}%` }}
        />
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          {compliant} Compliant
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          {partial} Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          {nonCompliant} Non-Compliant
        </span>
      </div>
    </div>
  );
}

// ── Framework Card ───────────────────────────────────────────────────────────

function FrameworkCard({
  framework,
  onClick,
}: {
  framework: ComplianceFramework;
  onClick: () => void;
}) {
  const controls = framework.controls;
  const compliant = controls.filter((c) => c.status === 'compliant').length;
  const partial = controls.filter((c) => c.status === 'partial').length;
  const nonCompliant = controls.filter((c) => c.status === 'non-compliant').length;
  const displayTotal = controls.length || framework.totalControls;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 text-base">{framework.name}</h3>
            <StatusBadge status={framework.status} />
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">{framework.description}</p>
        </div>
        <ReadinessGauge score={framework.readinessScore} size={72} />
      </div>

      {controls.length > 0 && (
        <div className="mb-3">
          <ControlStatusBar
            compliant={compliant}
            partial={partial}
            nonCompliant={nonCompliant}
            total={displayTotal}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            Next Audit:{' '}
            {new Date(framework.nextAuditDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        {framework.auditor && (
          <span className="text-slate-400 truncate max-w-[140px]">{framework.auditor}</span>
        )}
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </button>
  );
}

// ── Overall Score Card ───────────────────────────────────────────────────────

function OverallScoreCard({ frameworks }: { frameworks: ComplianceFramework[] }) {
  const avgScore = Math.round(
    frameworks.reduce((sum, f) => sum + f.readinessScore, 0) / (frameworks.length || 1)
  );

  const certified = frameworks.filter((f) => f.status === 'certified').length;
  const inProgress = frameworks.filter((f) => f.status === 'in-progress').length;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-5 w-5 text-blue-200" />
        <h3 className="font-semibold text-sm text-blue-100">Overall Compliance Score</h3>
      </div>
      <div className="flex items-end gap-4 mb-4">
        <div>
          <p className="text-5xl font-bold">{avgScore}%</p>
          <p className="text-blue-200 text-sm mt-1">across {frameworks.length} frameworks</p>
        </div>
        <div className="pb-1">
          <TrendingUp className="h-6 w-6 text-emerald-300" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-2xl font-bold">{certified}</p>
          <p className="text-blue-200 text-xs">Certified</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-2xl font-bold">{inProgress}</p>
          <p className="text-blue-200 text-xs">In Progress</p>
        </div>
      </div>
    </div>
  );
}

// ── Timeline Event ───────────────────────────────────────────────────────────

function TimelineEvent({ event }: { event: ComplianceTimeline }) {
  const daysUntil = Math.ceil(
    (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const urgencyClass =
    daysUntil <= 14
      ? 'border-red-300 bg-red-50'
      : daysUntil <= 30
        ? 'border-amber-300 bg-amber-50'
        : 'border-slate-200 bg-white';

  const typeConfig = {
    audit: { icon: Shield, color: 'text-blue-500' },
    certification: { icon: ShieldCheck, color: 'text-emerald-500' },
    renewal: { icon: FileCheck, color: 'text-purple-500' },
    assessment: { icon: BarChart3, color: 'text-indigo-500' },
    deadline: { icon: AlertTriangle, color: 'text-red-500' },
  }[event.type];

  const Icon = typeConfig.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${urgencyClass}`}>
      <div className={`mt-0.5 ${typeConfig.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-slate-800">{event.title}</p>
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            {event.frameworkName}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {new Date(event.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          {' — '}
          {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days away`}
        </p>
      </div>
      {daysUntil <= 14 && daysUntil > 0 && (
        <span className="shrink-0 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
          Urgent
        </span>
      )}
    </div>
  );
}

// ── Gap Analysis Summary ─────────────────────────────────────────────────────

function GapAnalysisSummary({ frameworks }: { frameworks: ComplianceFramework[] }) {
  const allControls = frameworks.flatMap((f) => f.controls);
  const criticalGaps = allControls.filter(
    (c) => c.status === 'non-compliant' && c.riskLevel === 'critical'
  );
  const highGaps = allControls.filter(
    (c) => c.status === 'non-compliant' && c.riskLevel === 'high'
  );
  const partialHigh = allControls.filter(
    (c) => c.status === 'partial' && (c.riskLevel === 'critical' || c.riskLevel === 'high')
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-slate-900">Gap Analysis Summary</h3>
      </div>
      <div className="space-y-3">
        {criticalGaps.length === 0 && highGaps.length === 0 && partialHigh.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">No critical or high-risk gaps identified.</span>
          </div>
        ) : (
          <>
            {criticalGaps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Critical Gaps ({criticalGaps.length})
                  </span>
                </div>
                <div className="space-y-1 pl-6">
                  {criticalGaps.map((c) => (
                    <p key={c.id} className="text-xs text-slate-600">
                      <span className="font-mono text-red-600">{c.code}</span> — {c.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {highGaps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    High Risk Gaps ({highGaps.length})
                  </span>
                </div>
                <div className="space-y-1 pl-6">
                  {highGaps.map((c) => (
                    <p key={c.id} className="text-xs text-slate-600">
                      <span className="font-mono text-orange-600">{c.code}</span> — {c.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {partialHigh.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">
                    Partial — Action Required ({partialHigh.length})
                  </span>
                </div>
                <div className="space-y-1 pl-6">
                  {partialHigh.map((c) => (
                    <p key={c.id} className="text-xs text-slate-600">
                      <span className="font-mono text-amber-600">{c.code}</span> — {c.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

interface ComplianceDashboardProps {
  onSelectFramework?: (frameworkId: FrameworkId) => void;
  onSelectControl?: (controlId: string) => void;
}

export function ComplianceDashboard({
  onSelectFramework,
  _onSelectControl,
}: ComplianceDashboardProps) {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [timeline, setTimeline] = useState<ComplianceTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [fw, tl] = await Promise.all([
          ComplianceFrameworkService.getComplianceFrameworks(),
          ComplianceFrameworkService.getComplianceTimeline(),
        ]);

        // Load full details for SOC 2 and ISO 27001 to show controls
        const [soc2Full, isoFull] = await Promise.all([
          ComplianceFrameworkService.getFrameworkStatus('soc2'),
          ComplianceFrameworkService.getFrameworkStatus('iso27001'),
        ]);

        const enriched = fw.map((f) => {
          if (f.id === 'soc2' && soc2Full) return soc2Full;
          if (f.id === 'iso27001' && isoFull) return isoFull;
          return f;
        });

        setFrameworks(enriched);
        setTimeline(tl);
      } catch (err) {
        setError('Failed to load compliance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const upcomingEvents = timeline.filter((t) => !t.completed).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Frameworks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor compliance posture across SOC 2, ISO 27001, GDPR, HIPAA, and SOX
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-4 w-4" />
          <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Top Row: Score + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <OverallScoreCard frameworks={frameworks} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900">Upcoming Audits & Deadlines</h3>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming events.</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Framework Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Framework Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {frameworks.map((framework) => (
            <FrameworkCard
              key={framework.id}
              framework={framework}
              onClick={() => onSelectFramework?.(framework.id as FrameworkId)}
            />
          ))}
        </div>
      </div>

      {/* Gap Analysis */}
      <GapAnalysisSummary frameworks={frameworks} />

      {/* Recent Evidence Submissions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900">Recent Evidence Submissions</h3>
        </div>
        <div className="space-y-3">
          {frameworks
            .flatMap((f) => f.controls)
            .flatMap((c) => c.evidence)
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 5)
            .map((ev) => (
              <div key={ev.id} className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    ev.status === 'verified'
                      ? 'bg-emerald-500'
                      : ev.status === 'pending'
                        ? 'bg-amber-400'
                        : ev.status === 'rejected'
                          ? 'bg-red-500'
                          : 'bg-slate-300'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{ev.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {ev.description} — {new Date(ev.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    ev.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-700'
                      : ev.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : ev.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                </span>
              </div>
            ))}
          {frameworks.flatMap((f) => f.controls).flatMap((c) => c.evidence).length === 0 && (
            <p className="text-sm text-slate-500">No evidence submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplianceDashboard;
