'use client';

/**
 * @component UnionManagementDashboard
 * @description Union & Collective Bargaining Management — active CBAs, membership stats,
 *   dues collection, grievance pipeline, CBA key terms viewer, negotiation history,
 *   and upcoming CBA renewal alerts.
 * @project AURA HCM Platform
 * @section 22.6 — Union & Collective Bargaining
 *
 * Legal References:
 *  US: National Labor Relations Act (NLRA), 29 U.S.C. § 151 et seq.
 *  US: Labor Management Relations Act (LMRA/Taft-Hartley), 29 U.S.C. § 141 et seq.
 *  UK: Trade Union and Labour Relations (Consolidation) Act 1992
 *  India: Industrial Disputes Act 1947 (IDA), Trade Unions Act 1926
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  TrendingUp,
  Shield,
  Gavel,
  Bell,
  BookOpen,
  RefreshCw,
  ExternalLink,
  ChevronUp,
  Info,
  Building,
  Globe,
  Scale,
  Plus,
} from 'lucide-react';
import type {
  Union,
  CollectiveBargainingAgreement,
  Grievance,
  DuesCollection,
  NegotiationHistory,
  GrievanceStatus,
  NegotiationStatus,
} from '@/services/unionService';
import { UnionService } from '@/services/unionService';

// ── Helper Utilities ──────────────────────────────────────────────────────────

function fmtDate(d: string | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date('2026-02-25');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    expired: 'bg-red-100 text-red-800',
    in_negotiation: 'bg-blue-100 text-blue-800',
    ratified: 'bg-purple-100 text-purple-800',
    terminated: 'bg-gray-100 text-gray-600',
    filed: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    hearing: 'bg-orange-100 text-orange-800',
    arbitration: 'bg-red-100 text-red-800',
    resolved: 'bg-green-100 text-green-800',
    withdrawn: 'bg-gray-100 text-gray-600',
    preparation: 'bg-yellow-100 text-yellow-800',
    table_bargaining: 'bg-blue-100 text-blue-800',
    impasse: 'bg-red-100 text-red-800',
    mediation: 'bg-orange-100 text-orange-800',
    ratification: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    collected: 'bg-blue-100 text-blue-800',
    remitted: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

function getGrievanceStageLabel(stage: string): string {
  const map: Record<string, string> = {
    step_1: 'Step 1',
    step_2: 'Step 2 — HR',
    step_3_arbitration: 'Step 3 — Arbitration',
  };
  return map[stage] ?? stage;
}

function getNegotiationStatusLabel(status: NegotiationStatus): string {
  const map: Record<NegotiationStatus, string> = {
    preparation: 'Preparation',
    table_bargaining: 'Table Bargaining',
    impasse: 'Impasse',
    mediation: 'Mediation',
    ratification: 'Ratification',
    completed: 'Completed',
  };
  return map[status];
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Grievance stage pipeline bar */
function GrievancePipeline({ grievances }: { grievances: Grievance[] }) {
  const stages: { key: GrievanceStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'filed', label: 'Filed', icon: <FileText className="h-4 w-4" /> },
    { key: 'under_review', label: 'Under Review', icon: <Clock className="h-4 w-4" /> },
    { key: 'hearing', label: 'Hearing', icon: <Gavel className="h-4 w-4" /> },
    { key: 'arbitration', label: 'Arbitration', icon: <Scale className="h-4 w-4" /> },
    { key: 'resolved', label: 'Resolved', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const counts = stages.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = grievances.filter((g) => g.status === s.key).length;
    return acc;
  }, {});

  const active = grievances.filter(
    (g) => g.status !== 'resolved' && g.status !== 'withdrawn'
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Grievance Pipeline</h3>
        <span className="text-sm text-gray-500">{active} active</span>
      </div>
      <div className="flex items-center gap-1">
        {stages.map((stage, idx) => {
          const count = counts[stage.key] ?? 0;
          const isLast = idx === stages.length - 1;
          const colorCls =
            stage.key === 'resolved'
              ? 'bg-green-50 border-green-200'
              : stage.key === 'arbitration'
                ? 'bg-red-50 border-red-200'
                : stage.key === 'hearing'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-blue-50 border-blue-200';

          return (
            <React.Fragment key={stage.key}>
              <div className={`flex-1 border rounded-lg p-3 text-center ${colorCls}`}>
                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                  {stage.icon}
                  <span className="text-xs font-medium">{stage.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
              {!isLast && <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/** CBA key terms viewer panel */
function CBAKeyTermsPanel({
  cba,
  onClose,
}: {
  cba: CollectiveBargainingAgreement;
  onClose: () => void;
}) {
  const terms = cba.keyTerms;
  const sections = [
    {
      title: 'Compensation',
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      items: [
        { label: 'Wage Increases', value: terms.wageIncrease },
        { label: 'Overtime Premium', value: terms.overtimePremium },
        { label: 'Overtime Threshold', value: `${terms.overtimeThreshold} hours/week` },
      ],
    },
    {
      title: 'Working Hours',
      icon: <Clock className="h-4 w-4 text-blue-600" />,
      items: [{ label: 'Standard Workweek', value: `${terms.workweekHours} hours` }],
    },
    {
      title: 'Leave & Benefits',
      icon: <Calendar className="h-4 w-4 text-purple-600" />,
      items: [
        { label: 'Vacation Days', value: terms.vacationDays },
        { label: 'Sick Days', value: `${terms.sickDays} days/year` },
        { label: 'Health Insurance', value: terms.healthInsurance },
        { label: 'Pension / Retirement', value: terms.pensionContribution },
      ],
    },
    {
      title: 'Seniority',
      icon: <TrendingUp className="h-4 w-4 text-orange-600" />,
      items: terms.seniorityClauses.map((clause, i) => ({
        label: `Clause ${i + 1}`,
        value: clause,
      })),
    },
    {
      title: 'Dispute Resolution',
      icon: <Gavel className="h-4 w-4 text-red-600" />,
      items: [
        { label: 'Grievance Procedure', value: terms.grievanceProcedure },
        { label: 'Disciplinary Procedure', value: terms.disciplinaryProcedure },
        {
          label: 'No-Strike Clause',
          value: terms.noStrikeClause ? 'Yes — included' : 'No — not included',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{cba.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(cba.status)}`}
              >
                {cba.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {fmtDate(cba.effectiveDate)} – {fmtDate(cba.expiryDate)}
              </span>
              <span className="text-xs text-gray-500">|</span>
              <span className="text-xs text-gray-500">{cba.coverageCount} employees covered</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {sections.map(
            (section) =>
              section.items.length > 0 && (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-2">
                    {section.icon}
                    <h3 className="font-semibold text-gray-800 text-sm">{section.title}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex gap-3 p-3">
                        <span className="text-xs text-gray-500 w-40 flex-shrink-0 pt-0.5">
                          {item.label}
                        </span>
                        <span className="text-sm text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}

          {/* Documents */}
          {cba.documents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-gray-800 text-sm">Documents</h3>
              </div>
              <div className="space-y-2">
                {cba.documents.map((doc) => (
                  <a
                    key={doc.name}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {doc.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Grievance row with expand/collapse details */
function GrievanceRow({ grievance }: { grievance: Grievance }) {
  const [expanded, setExpanded] = useState(false);

  const urgentClass =
    grievance.daysOpen >= 90
      ? 'border-l-4 border-red-400'
      : grievance.daysOpen >= 30
        ? 'border-l-4 border-orange-300'
        : 'border-l-4 border-transparent';

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${urgentClass}`}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{grievance.id.toUpperCase()}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(grievance.status)}`}
            >
              {grievance.status.replace('_', ' ')}
            </span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {getGrievanceStageLabel(grievance.stage)}
            </span>
            {grievance.daysOpen >= 60 && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {grievance.daysOpen}d open
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {grievance.employeeName} — {grievance.violatedArticle}
          </p>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <div className="text-xs text-gray-500">Filed</div>
          <div className="text-sm font-medium text-gray-700">{fmtDate(grievance.filedDate)}</div>
        </div>
        <div className="text-gray-400 flex-shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Employee</div>
              <div className="font-medium text-gray-800">{grievance.employeeName}</div>
              <div className="text-gray-500 text-xs">{grievance.department}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Union</div>
              <div className="font-medium text-gray-800">{grievance.unionName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Assigned Steward</div>
              <div className="text-gray-800">{grievance.assignedSteward}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">HR Representative</div>
              <div className="text-gray-800">{grievance.assignedHRRep}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-0.5">Description</div>
            <p className="text-gray-800 leading-relaxed">{grievance.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Remedy Sought</div>
              <p className="text-gray-800">{grievance.remedySought}</p>
            </div>
            {grievance.hearingDate && (
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Scheduled Hearing</div>
                <div className="text-gray-800">{fmtDate(grievance.hearingDate)}</div>
              </div>
            )}
            {grievance.arbitrationDate && (
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Arbitration Date</div>
                <div className="text-gray-800">{fmtDate(grievance.arbitrationDate)}</div>
              </div>
            )}
          </div>

          {grievance.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-700 font-medium mb-1">
                Resolution ({fmtDate(grievance.resolvedDate)})
              </div>
              <p className="text-green-800 text-sm">{grievance.resolution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Negotiation timeline row */
function NegotiationRow({ neg }: { neg: NegotiationHistory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs font-bold text-indigo-700">R{neg.round}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(neg.status)}`}
            >
              {getNegotiationStatusLabel(neg.status)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {fmtDate(neg.startDate)}
            {neg.endDate ? ` – ${fmtDate(neg.endDate)}` : ' — ongoing'}
            {neg.sessions > 0 && ` · ${neg.sessions} sessions`}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Company Lead</div>
              <div className="font-medium text-gray-800">{neg.companyLead}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Union Lead</div>
              <div className="font-medium text-gray-800">{neg.unionLead}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Key Issues</div>
            <ul className="space-y-1">
              {neg.keyIssues.map((issue) => (
                <li key={issue} className="flex items-start gap-2 text-gray-800">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
          {neg.outcome && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-700 font-medium mb-1">Outcome</div>
              <p className="text-green-800">{neg.outcome}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type Tab = 'overview' | 'agreements' | 'grievances' | 'dues' | 'negotiations';

export default function UnionManagementDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [unions, setUnions] = useState<Union[]>([]);
  const [agreements, setAgreements] = useState<CollectiveBargainingAgreement[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [dues, setDues] = useState<DuesCollection[]>([]);
  const [negotiations, setNegotiations] = useState<NegotiationHistory[]>([]);
  const [selectedCBA, setSelectedCBA] = useState<CollectiveBargainingAgreement | null>(null);
  const [selectedUnionId, setSelectedUnionId] = useState<string>('all');
  const [grievanceFilter, setGrievanceFilter] = useState<GrievanceStatus | 'all'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [u, a, g, d] = await Promise.all([
        UnionService.getUnions(),
        UnionService.getAllAgreements(),
        UnionService.getGrievances(),
        UnionService.getDuesCollection(),
      ]);
      setUnions(u);
      setAgreements(a);
      setGrievances(g);
      setDues(d);

      // Load negotiations for all unions
      const allNeg = (
        await Promise.all(u.map((union) => UnionService.getNegotiationHistory(union.id)))
      ).flat();
      setNegotiations(allNeg);
      setLoading(false);
    }
    load();
  }, []);

  // ── Derived Metrics ─────────────────────────────────────────────────────────

  const totalMembers = unions.reduce((s, u) => s + u.totalMembers, 0);
  const activeAgreements = agreements.filter((a) => a.status === 'active');
  const activeGrievances = grievances.filter(
    (g) => g.status !== 'resolved' && g.status !== 'withdrawn'
  );
  const arbitrationGrievances = grievances.filter((g) => g.status === 'arbitration');

  // CBA renewal alerts: active CBAs expiring within 12 months
  const renewalAlerts = activeAgreements.filter((a) => {
    const days = daysUntil(a.expiryDate);
    return days <= 365 && days > 0;
  });

  // Filtered grievances
  const filteredGrievances = grievances.filter((g) => {
    const unionMatch = selectedUnionId === 'all' || g.unionId === selectedUnionId;
    const statusMatch = grievanceFilter === 'all' || g.status === grievanceFilter;
    return unionMatch && statusMatch;
  });

  // Dues total (current period)
  const currentDues = dues.filter((d) => d.period === '2026-02');
  const duesStats = currentDues.reduce(
    (acc, d) => {
      acc.totalExpected += d.totalMembers * d.avgDuesPerMember;
      acc.totalCollected += d.totalAmount;
      acc.membersCollected += d.membersDuesCollected;
      acc.totalMembers += d.totalMembers;
      return acc;
    },
    { totalExpected: 0, totalCollected: 0, membersCollected: 0, totalMembers: 0 }
  );

  // ── Tabs ────────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Building className="h-4 w-4" /> },
    {
      id: 'agreements',
      label: 'Agreements',
      icon: <FileText className="h-4 w-4" />,
      badge: activeAgreements.length,
    },
    {
      id: 'grievances',
      label: 'Grievances',
      icon: <Gavel className="h-4 w-4" />,
      badge: activeGrievances.length,
    },
    { id: 'dues', label: 'Dues', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'negotiations', label: 'Negotiations', icon: <Scale className="h-4 w-4" /> },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="h-6 w-6 text-indigo-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Union & Labour Relations</h1>
                <p className="text-sm text-gray-500">
                  CBA management, grievance tracking, dues collection — NLRA § 151, TULRCA 1992
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4" />
              File Grievance
            </button>
          </div>

          {/* Renewal Alerts */}
          {renewalAlerts.length > 0 && (
            <div className="mt-4 space-y-2">
              {renewalAlerts.map((cba) => {
                const days = daysUntil(cba.expiryDate);
                const urgency =
                  days <= 90
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-amber-50 border-amber-300 text-amber-800';
                return (
                  <div
                    key={cba.id}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm ${urgency}`}
                  >
                    <Bell className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">CBA Renewal Alert:</span>
                    <span className="flex-1">{cba.title}</span>
                    <span className="font-semibold">
                      {days}d remaining (expires {fmtDate(cba.expiryDate)})
                    </span>
                    {cba.renewalStartDate && (
                      <span className="text-xs opacity-75">
                        · Negotiation start: {fmtDate(cba.renewalStartDate)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-3 text-gray-500">Loading union data…</span>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Total Union Members',
                      value: totalMembers.toString(),
                      sub: `${unions.length} recognized unions`,
                      icon: <Users className="h-5 w-5 text-indigo-600" />,
                      bg: 'bg-indigo-50',
                    },
                    {
                      label: 'Active CBAs',
                      value: activeAgreements.length.toString(),
                      sub: `${agreements.filter((a) => a.status === 'expired').length} expired`,
                      icon: <FileText className="h-5 w-5 text-green-600" />,
                      bg: 'bg-green-50',
                    },
                    {
                      label: 'Active Grievances',
                      value: activeGrievances.length.toString(),
                      sub: `${arbitrationGrievances.length} in arbitration`,
                      icon: <Gavel className="h-5 w-5 text-orange-600" />,
                      bg: 'bg-orange-50',
                    },
                    {
                      label: 'Dues Pending (Feb)',
                      value: currentDues
                        .filter((d) => d.currency === 'USD')
                        .reduce((s, d) => s + d.totalAmount, 0)
                        .toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0,
                        }),
                      sub: `${duesStats.membersCollected}/${duesStats.totalMembers} members`,
                      icon: <DollarSign className="h-5 w-5 text-blue-600" />,
                      bg: 'bg-blue-50',
                    },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className={`inline-flex p-2 rounded-lg ${kpi.bg} mb-3`}>{kpi.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                      <div className="text-sm font-medium text-gray-600 mt-0.5">{kpi.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Grievance Pipeline */}
                <GrievancePipeline grievances={grievances} />

                {/* Union Cards */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Recognized Unions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unions.map((union) => {
                      const unionAgreements = agreements.filter(
                        (a) => a.unionId === union.id && a.status === 'active'
                      );
                      const unionGrievances = activeGrievances.filter(
                        (g) => g.unionId === union.id
                      );
                      return (
                        <div
                          key={union.id}
                          className="bg-white border border-gray-200 rounded-xl p-5 space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-indigo-700">
                                  {union.abbreviation}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(union.status)}`}
                                >
                                  {union.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 mt-0.5">{union.name}</div>
                              <div className="text-xs text-gray-400">{union.localChapter}</div>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Globe className="h-3.5 w-3.5" />
                              {union.country}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="text-lg font-bold text-gray-900">
                                {union.totalMembers}
                              </div>
                              <div className="text-xs text-gray-500">Members</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="text-lg font-bold text-gray-900">
                                {unionAgreements.length}
                              </div>
                              <div className="text-xs text-gray-500">Active CBAs</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div
                                className={`text-lg font-bold ${unionGrievances.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}
                              >
                                {unionGrievances.length}
                              </div>
                              <div className="text-xs text-gray-500">Grievances</div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 space-y-1">
                            <div>
                              <span className="font-medium">President:</span> {union.president}
                            </div>
                            <div>
                              <span className="font-medium">Affiliation:</span> {union.affiliation}
                            </div>
                            <div>
                              <span className="font-medium">Recognized:</span>{' '}
                              {fmtDate(union.recognitionDate)} by {union.certificationBody}
                            </div>
                            <div>
                              <span className="font-medium">Represents:</span>{' '}
                              {union.representedDepartments.join(', ')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── AGREEMENTS TAB ── */}
            {tab === 'agreements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-base font-semibold text-gray-900">
                    Collective Bargaining Agreements
                  </h2>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={selectedUnionId}
                      onChange={(e) => setSelectedUnionId(e.target.value)}
                    >
                      <option value="all">All Unions</option>
                      {unions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.abbreviation}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {agreements
                  .filter((a) => selectedUnionId === 'all' || a.unionId === selectedUnionId)
                  .map((cba) => {
                    const days = daysUntil(cba.expiryDate);
                    const isExpiringSoon = cba.status === 'active' && days <= 365;
                    return (
                      <div
                        key={cba.id}
                        className={`bg-white border rounded-xl p-5 ${isExpiringSoon ? 'border-amber-300' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(cba.status)}`}
                              >
                                {cba.status.replace('_', ' ').toUpperCase()}
                              </span>
                              {isExpiringSoon && (
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                                  <Bell className="h-3 w-3" />
                                  Expires in {days}d
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mt-1 leading-tight">
                              {cba.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                              <span>
                                {fmtDate(cba.effectiveDate)} – {fmtDate(cba.expiryDate)}
                              </span>
                              <span>{cba.coverageCount} employees covered</span>
                              {cba.signedDate && <span>Signed {fmtDate(cba.signedDate)}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedCBA(cba)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              View Terms
                            </button>
                          </div>
                        </div>

                        {/* Key Terms Summary */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            {
                              label: 'Wage Increase',
                              value: cba.keyTerms.wageIncrease.split(',')[0],
                            },
                            { label: 'Workweek', value: `${cba.keyTerms.workweekHours}h/week` },
                            { label: 'Vacation', value: cba.keyTerms.vacationDays.split(',')[0] },
                            { label: 'Sick Days', value: `${cba.keyTerms.sickDays} days/yr` },
                          ].map((item) => (
                            <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                              <div className="text-xs text-gray-500">{item.label}</div>
                              <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Renewal timeline */}
                        {cba.renewalStartDate && cba.status === 'active' && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            Renewal negotiations scheduled to begin: {fmtDate(cba.renewalStartDate)}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* ── GRIEVANCES TAB ── */}
            {tab === 'grievances' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-base font-semibold text-gray-900">Grievance Tracker</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={selectedUnionId}
                      onChange={(e) => setSelectedUnionId(e.target.value)}
                    >
                      <option value="all">All Unions</option>
                      {unions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.abbreviation}
                        </option>
                      ))}
                    </select>
                    <select
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={grievanceFilter}
                      onChange={(e) =>
                        setGrievanceFilter(e.target.value as GrievanceStatus | 'all')
                      }
                    >
                      <option value="all">All Statuses</option>
                      <option value="filed">Filed</option>
                      <option value="under_review">Under Review</option>
                      <option value="hearing">Hearing</option>
                      <option value="arbitration">Arbitration</option>
                      <option value="resolved">Resolved</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>

                {/* Pipeline summary */}
                <GrievancePipeline grievances={grievances} />

                {/* Legal notice */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">NLRA § 8(a)(5) / TULRCA 1992 s.70B:</span>{' '}
                    Employers must bargain in good faith and respond to grievances within the
                    timeframes specified in the applicable CBA. Failure to respond may constitute an
                    unfair labor practice.
                  </div>
                </div>

                {/* Grievance list */}
                <div className="space-y-3">
                  {filteredGrievances.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
                      No grievances match the selected filters.
                    </div>
                  ) : (
                    filteredGrievances.map((g) => <GrievanceRow key={g.id} grievance={g} />)
                  )}
                </div>
              </div>
            )}

            {/* ── DUES TAB ── */}
            {tab === 'dues' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900">Union Dues Collection</h2>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="text-xs text-gray-500 mb-1">Feb 2026 — Collection Rate</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {duesStats.totalMembers > 0
                        ? ((duesStats.membersCollected / duesStats.totalMembers) * 100).toFixed(1)
                        : '—'}
                      %
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {duesStats.membersCollected}/{duesStats.totalMembers} members
                    </div>
                    <div className="mt-3 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{
                          width: `${(duesStats.membersCollected / duesStats.totalMembers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="text-xs text-gray-500 mb-1">CWA — Pending Remittance (Feb)</div>
                    <div className="text-3xl font-bold text-gray-900">$4,960</div>
                    <div className="text-sm text-gray-500 mt-1">Deduction date: Feb 28</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="text-xs text-gray-500 mb-1">
                      UNITE — Pending Remittance (Feb)
                    </div>
                    <div className="text-3xl font-bold text-gray-900">£2,280</div>
                    <div className="text-sm text-gray-500 mt-1">Deduction date: Feb 28</div>
                  </div>
                </div>

                {/* Dues table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Recent Dues Periods</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {[
                            'Period',
                            'Union',
                            'Members',
                            'Collected',
                            'Amount',
                            'Avg/Member',
                            'Deduction',
                            'Remittance',
                            'Status',
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {dues.map((d, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                              {d.period}
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              {d.unionName}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{d.totalMembers}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">{d.membersDuesCollected}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-16">
                                  <div
                                    className="bg-indigo-500 h-1.5 rounded-full"
                                    style={{
                                      width: `${(d.membersDuesCollected / d.totalMembers) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                              {fmtCurrency(d.totalAmount, d.currency)}
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              {fmtCurrency(d.avgDuesPerMember, d.currency)}
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {fmtDate(d.deductionDate)}
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {d.remittanceDate ? fmtDate(d.remittanceDate) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(d.status)}`}
                              >
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Compliance note */}
                <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500" />
                  <div>
                    <span className="font-medium">Dues Checkoff (29 U.S.C. § 186):</span> Dues
                    deduction from employee wages requires written authorization per LMRA § 302. UK
                    union dues payroll deduction is governed by the Employment Rights Act 1996,
                    s.68A. Remittance to the union must occur within the period specified in the
                    CBA.
                  </div>
                </div>
              </div>
            )}

            {/* ── NEGOTIATIONS TAB ── */}
            {tab === 'negotiations' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900">
                  Bargaining History & Upcoming Negotiations
                </h2>

                {/* Upcoming negotiations alert */}
                {negotiations
                  .filter((n) => n.status === 'preparation')
                  .map((neg) => {
                    const union = unions.find((u) => u.id === neg.unionId);
                    return (
                      <div
                        key={neg.id}
                        className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-300 rounded-xl"
                      >
                        <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-blue-900 text-sm">
                            Upcoming: Round {neg.round} Negotiations —{' '}
                            {union?.abbreviation ?? neg.unionId}
                          </div>
                          <div className="text-blue-700 text-xs mt-0.5">
                            Scheduled to begin {fmtDate(neg.startDate)} · Preparation phase
                          </div>
                          {neg.keyIssues.length > 0 && (
                            <div className="text-blue-700 text-xs mt-1">
                              Anticipated issues: {neg.keyIssues.join(' · ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Per union negotiation history */}
                {unions.map((union) => {
                  const unionNegs = negotiations.filter((n) => n.unionId === union.id);
                  if (unionNegs.length === 0) return null;
                  return (
                    <div key={union.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-gray-700 text-sm">
                          {union.abbreviation} — {union.name}
                        </span>
                        <span className="text-xs text-gray-400">({union.country})</span>
                      </div>
                      <div className="space-y-3">
                        {[...unionNegs].reverse().map((neg) => (
                          <NegotiationRow key={neg.id} neg={neg} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Bargaining obligation note */}
                <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500" />
                  <div>
                    <span className="font-medium">Good Faith Bargaining (NLRA § 8(d)):</span>{' '}
                    Parties must bargain collectively with respect to wages, hours, and other
                    terms/conditions of employment. UK equivalent: duty under TULRCA 1992 s.178 and
                    CAC procedural requirements for recognition/derecognition.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CBA Key Terms Modal */}
      {selectedCBA && <CBAKeyTermsPanel cba={selectedCBA} onClose={() => setSelectedCBA(null)} />}
    </div>
  );
}
