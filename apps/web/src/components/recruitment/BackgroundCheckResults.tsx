/**
 * @module BackgroundCheckResults
 * @description Background check results detail view with individual check items,
 *              verification status, findings, report download, and compliance info
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  GraduationCap,
  FileSearch,
  CreditCard,
  Fingerprint,
  FlaskConical,
  Phone,
  Download,
  ExternalLink,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Lock,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type CheckItemStatus =
  | 'pending'
  | 'in_progress'
  | 'clear'
  | 'flagged'
  | 'failed'
  | 'not_applicable';
export type CheckCategory =
  | 'identity'
  | 'criminal'
  | 'employment'
  | 'education'
  | 'credit'
  | 'drug_test'
  | 'reference'
  | 'mvr';

export interface CheckItemDetail {
  id: string;
  category: CheckCategory;
  label: string;
  status: CheckItemStatus;
  result?: string;
  findings?: string;
  source?: string;
  verifiedDate?: string;
  notes?: string;
  reportUrl?: string;
}

export interface BackgroundCheckResultData {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  provider: string;
  providerRefId: string;
  checkType: string; // 'Comprehensive' | 'Basic' | 'Custom'
  overallStatus: 'pending' | 'in_progress' | 'clear' | 'flagged' | 'failed';
  items: CheckItemDetail[];
  consentDate: string;
  initiatedDate: string;
  completedDate?: string;
  expectedCompletionDate?: string;
  reportUrl?: string;
  cost?: { amount: number; currency: string };
}

interface BackgroundCheckResultsProps {
  result: BackgroundCheckResultData;
  onDownloadReport?: () => void;
  onBack?: () => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<CheckCategory, { icon: LucideIcon; label: string; color: string }> = {
  identity: { icon: Fingerprint, label: 'Identity Verification', color: 'text-celestial-indigo' },
  criminal: { icon: ShieldCheck, label: 'Criminal Record', color: 'text-quantum-rose' },
  employment: { icon: Building2, label: 'Employment Verification', color: 'text-sunset-amber' },
  education: { icon: GraduationCap, label: 'Education Verification', color: 'text-neural-mint' },
  credit: { icon: CreditCard, label: 'Credit Check', color: 'text-celestial-indigo' },
  drug_test: { icon: FlaskConical, label: 'Drug Screening', color: 'text-quantum-rose' },
  reference: { icon: Phone, label: 'Reference Check', color: 'text-sunset-amber' },
  mvr: { icon: FileSearch, label: 'Motor Vehicle Record', color: 'text-silver-mist' },
};

const STATUS_CONFIG: Record<
  CheckItemStatus,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  clear: { label: 'Clear', icon: CheckCircle2, color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  flagged: {
    label: 'Flagged',
    icon: AlertTriangle,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  failed: { label: 'Failed', icon: XCircle, color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
  not_applicable: {
    label: 'N/A',
    icon: Clock,
    color: 'text-silver-mist/50',
    bg: 'bg-silver-mist/5',
  },
};

const OVERALL_STATUS_CONFIG: Record<
  string,
  { icon: LucideIcon; label: string; color: string; bg: string; border: string }
> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-silver-mist',
    bg: 'bg-silver-mist/10',
    border: 'border-silver-mist/20',
  },
  in_progress: {
    icon: Clock,
    label: 'In Progress',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
    border: 'border-celestial-indigo/20',
  },
  clear: {
    icon: ShieldCheck,
    label: 'All Clear',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
    border: 'border-neural-mint/20',
  },
  flagged: {
    icon: ShieldAlert,
    label: 'Flagged',
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
    border: 'border-sunset-amber/20',
  },
  failed: {
    icon: ShieldX,
    label: 'Failed',
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10',
    border: 'border-coral-alert/20',
  },
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// ── Component ────────────────────────────────────────────────────────────────────

export const BackgroundCheckResults: React.FC<BackgroundCheckResultsProps> = ({
  result,
  onDownloadReport,
  onBack: _onBack,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const overallCfg = OVERALL_STATUS_CONFIG[result.overallStatus] || OVERALL_STATUS_CONFIG.pending;
  const OverallIcon = overallCfg.icon;

  const completionPct = useMemo(() => {
    const done = result.items.filter(
      (i) =>
        i.status === 'clear' ||
        i.status === 'flagged' ||
        i.status === 'failed' ||
        i.status === 'not_applicable'
    ).length;
    return result.items.length > 0 ? Math.round((done / result.items.length) * 100) : 0;
  }, [result.items]);

  const statusCounts = useMemo(
    () => ({
      clear: result.items.filter((i) => i.status === 'clear').length,
      flagged: result.items.filter((i) => i.status === 'flagged').length,
      failed: result.items.filter((i) => i.status === 'failed').length,
      pending: result.items.filter((i) => i.status === 'pending' || i.status === 'in_progress')
        .length,
    }),
    [result.items]
  );

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      {/* Overall Status Banner */}
      <div className={`rounded-xl border ${overallCfg.border} ${overallCfg.bg} p-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${overallCfg.bg} flex items-center justify-center`}>
            <OverallIcon className={`w-6 h-6 ${overallCfg.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-ink-black dark:text-pearl">
                {result.candidateName}
              </p>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${overallCfg.bg} ${overallCfg.color}`}
              >
                {overallCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[9px] text-silver-mist">
              <span>{result.jobTitle}</span>
              <span>•</span>
              <span>{result.checkType} Check</span>
              <span>•</span>
              <span>via {result.provider}</span>
              <span>•</span>
              <span>Ref: {result.providerRefId}</span>
            </div>
          </div>
          {result.reportUrl && (
            <button
              onClick={onDownloadReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20 transition-colors"
            >
              <Download className="w-3 h-3" /> Full Report
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-silver-mist">Completion</span>
            <span className="text-[9px] font-bold text-ink-black dark:text-pearl">
              {completionPct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/50 dark:bg-deep-cosmos/30 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                result.overallStatus === 'clear'
                  ? 'bg-neural-mint'
                  : result.overallStatus === 'flagged'
                    ? 'bg-sunset-amber'
                    : result.overallStatus === 'failed'
                      ? 'bg-coral-alert'
                      : 'bg-celestial-indigo'
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-3 mt-3">
          <MiniStat label="Clear" value={statusCounts.clear} color="text-neural-mint" />
          <MiniStat label="Flagged" value={statusCounts.flagged} color="text-sunset-amber" />
          <MiniStat label="Failed" value={statusCounts.failed} color="text-coral-alert" />
          <MiniStat label="Pending" value={statusCounts.pending} color="text-celestial-indigo" />
        </div>
      </div>

      {/* Timeline Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <InfoCell icon={Calendar} label="Initiated" value={formatDate(result.initiatedDate)} />
        <InfoCell icon={Lock} label="Consent" value={formatDate(result.consentDate)} />
        <InfoCell
          icon={Calendar}
          label={result.completedDate ? 'Completed' : 'Expected'}
          value={
            result.completedDate
              ? formatDate(result.completedDate)
              : result.expectedCompletionDate
                ? formatDate(result.expectedCompletionDate)
                : '—'
          }
        />
        {result.cost && (
          <InfoCell
            icon={CreditCard}
            label="Cost"
            value={`${result.cost.currency} ${result.cost.amount.toFixed(2)}`}
          />
        )}
      </div>

      {/* Check Items */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-celestial-indigo" />
          Verification Items
          <span className="text-[9px] font-normal text-silver-mist">
            ({result.items.length} checks)
          </span>
        </p>

        <div className="space-y-1.5">
          {result.items.map((item) => {
            const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.identity;
            const stCfg = STATUS_CONFIG[item.status];
            const StIcon = stCfg.icon;
            const CatIcon = catCfg.icon;
            const isExpanded = expandedItems[item.id] ?? false;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all ${
                  item.status === 'flagged'
                    ? 'border-sunset-amber/20 bg-sunset-amber/5'
                    : item.status === 'failed'
                      ? 'border-coral-alert/20 bg-coral-alert/5'
                      : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
                }`}
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  {/* Category Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg ${stCfg.bg} flex items-center justify-center shrink-0`}
                  >
                    <CatIcon className={`w-4 h-4 ${catCfg.color}`} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                      {item.label}
                    </p>
                    {item.result && (
                      <p className="text-[9px] text-silver-mist mt-0.5">Result: {item.result}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${stCfg.bg} ${stCfg.color} shrink-0`}
                  >
                    <StIcon className="w-3 h-3" />
                    {stCfg.label}
                  </span>

                  {/* Expand */}
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-silver-mist shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-silver-mist shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2 ml-11 space-y-2">
                    {item.findings && (
                      <div>
                        <p className="text-[8px] font-bold text-silver-mist uppercase tracking-wider mb-0.5">
                          Findings
                        </p>
                        <p className="text-[10px] text-ink-black dark:text-pearl leading-relaxed">
                          {item.findings}
                        </p>
                      </div>
                    )}
                    {item.source && (
                      <div className="flex items-center gap-1 text-[9px] text-silver-mist">
                        <Building2 className="w-2.5 h-2.5" /> Source: {item.source}
                      </div>
                    )}
                    {item.verifiedDate && (
                      <div className="flex items-center gap-1 text-[9px] text-silver-mist">
                        <Calendar className="w-2.5 h-2.5" /> Verified:{' '}
                        {formatDateTime(item.verifiedDate)}
                      </div>
                    )}
                    {item.notes && (
                      <div className="flex items-center gap-1 text-[9px] text-silver-mist">
                        <FileText className="w-2.5 h-2.5" /> {item.notes}
                      </div>
                    )}
                    {item.reportUrl && (
                      <button className="flex items-center gap-1 text-[9px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors">
                        <ExternalLink className="w-2.5 h-2.5" /> View Detailed Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Note */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
        <Lock className="w-3.5 h-3.5 text-celestial-indigo shrink-0" />
        <p className="text-[9px] text-celestial-indigo">
          Background check data is encrypted and stored in compliance with FCRA, EEOC, and local
          regulations. Access is restricted to authorized personnel.
        </p>
      </div>
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────────

const MiniStat: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="flex items-center gap-1.5">
    <span className={`text-sm font-bold ${color}`}>{value}</span>
    <span className="text-[9px] text-silver-mist">{label}</span>
  </div>
);

const InfoCell: React.FC<{ icon: LucideIcon; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="px-2.5 py-2 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
    <p className="text-[8px] text-silver-mist flex items-center gap-0.5 mb-0.5">
      <Icon className="w-2.5 h-2.5" /> {label}
    </p>
    <p className="text-[10px] font-semibold text-ink-black dark:text-pearl">{value}</p>
  </div>
);

export default BackgroundCheckResults;
