/**
 * @module BackgroundCheckPortal
 * @description Background check portal with status dashboard, real-time check
 *              status updates, vendor integration indicators, and initiate flow
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calendar,
  Building2,
  Briefcase,
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { BackgroundCheckResults } from './BackgroundCheckResults';
import type { BackgroundCheckResultData } from './BackgroundCheckResults';

// ── Types ────────────────────────────────────────────────────────────────────────

export type PortalCheckStatus = 'pending' | 'in_progress' | 'clear' | 'flagged' | 'failed';

export interface VendorConfig {
  id: string;
  name: string;
  connected: boolean;
  apiStatus: 'online' | 'degraded' | 'offline';
  checksSupported: string[];
  avgTurnaround: string;
}

export interface CandidateCheck {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  department: string;
  status: PortalCheckStatus;
  vendor: string;
  providerRefId: string;
  checkType: string;
  progress: number; // 0-100
  itemCount: number;
  itemsCompleted: number;
  initiatedDate: string;
  completedDate?: string;
  expectedDate?: string;
  overallResult?: 'clear' | 'flagged' | 'failed';
  resultData?: BackgroundCheckResultData;
}

interface BackgroundCheckPortalProps {
  checks?: CandidateCheck[];
  vendors?: VendorConfig[];
  onInitiateCheck?: () => void;
  onRefresh?: () => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PortalCheckStatus,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  clear: { label: 'Clear', icon: ShieldCheck, color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  flagged: {
    label: 'Flagged',
    icon: ShieldAlert,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  failed: { label: 'Failed', icon: ShieldX, color: 'text-coral-alert', bg: 'bg-coral-alert/10' },
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_VENDORS: VendorConfig[] = [
  {
    id: 'v1',
    name: 'Checkr',
    connected: true,
    apiStatus: 'online',
    checksSupported: ['Criminal', 'Identity', 'MVR', 'Drug Test'],
    avgTurnaround: '2-5 days',
  },
  {
    id: 'v2',
    name: 'Sterling',
    connected: true,
    apiStatus: 'online',
    checksSupported: ['Criminal', 'Employment', 'Education', 'Credit'],
    avgTurnaround: '3-7 days',
  },
  {
    id: 'v3',
    name: 'HireRight',
    connected: true,
    apiStatus: 'degraded',
    checksSupported: ['Criminal', 'Employment', 'Education', 'Reference'],
    avgTurnaround: '5-10 days',
  },
  {
    id: 'v4',
    name: 'FirstAdvantage',
    connected: false,
    apiStatus: 'offline',
    checksSupported: ['Criminal', 'Employment', 'Education'],
    avgTurnaround: '3-5 days',
  },
];

const MOCK_RESULT_DATA: BackgroundCheckResultData = {
  id: 'bgr-001',
  candidateName: 'Michael Chen',
  candidateEmail: 'michael.chen@email.com',
  jobTitle: 'Senior Software Engineer',
  provider: 'Checkr',
  providerRefId: 'BGC-2026-001',
  checkType: 'Comprehensive',
  overallStatus: 'in_progress',
  consentDate: '2026-02-18T09:00:00Z',
  initiatedDate: '2026-02-18T10:00:00Z',
  expectedCompletionDate: '2026-02-25T23:59:59Z',
  cost: { amount: 89.99, currency: 'USD' },
  items: [
    {
      id: 'ci1',
      category: 'identity',
      label: 'Identity Verification',
      status: 'clear',
      result: 'Verified',
      findings: 'Full name, SSN, and date of birth match government records.',
      source: 'National ID Database',
      verifiedDate: '2026-02-18T14:00:00Z',
      notes: 'Identity verified successfully',
    },
    {
      id: 'ci2',
      category: 'criminal',
      label: 'Federal Criminal Search',
      status: 'clear',
      result: 'No Records Found',
      findings: 'Federal courts search across all 94 districts returned no results.',
      source: 'US Federal Court Records',
      verifiedDate: '2026-02-19T10:30:00Z',
    },
    {
      id: 'ci3',
      category: 'criminal',
      label: 'County Criminal Search',
      status: 'in_progress',
      result: undefined,
      source: 'Santa Clara County Court',
      notes: 'Pending county court response — estimated 2-3 business days',
    },
    {
      id: 'ci4',
      category: 'employment',
      label: 'Employment History — TechCorp Inc.',
      status: 'clear',
      result: 'Verified',
      findings:
        "Confirmed employment from Jan 2021 to present as Senior Engineer. Title and dates match candidate's disclosure.",
      source: 'TechCorp Inc. HR Department',
      verifiedDate: '2026-02-20T09:00:00Z',
    },
    {
      id: 'ci5',
      category: 'employment',
      label: 'Employment History — StartupXYZ',
      status: 'in_progress',
      result: undefined,
      source: 'StartupXYZ',
      notes: 'Awaiting HR response — follow-up sent',
    },
    {
      id: 'ci6',
      category: 'education',
      label: 'BS Computer Science — Stanford University',
      status: 'clear',
      result: 'Verified',
      findings:
        'Bachelor of Science in Computer Science confirmed. Graduated May 2018 with honors.',
      source: 'Stanford University Registrar',
      verifiedDate: '2026-02-19T15:00:00Z',
    },
    {
      id: 'ci7',
      category: 'credit',
      label: 'Credit Report',
      status: 'pending',
      result: undefined,
      notes: 'Awaiting credit bureau response',
    },
    {
      id: 'ci8',
      category: 'drug_test',
      label: 'Drug Screening (10-panel)',
      status: 'clear',
      result: 'Negative',
      findings: 'All 10 substances tested negative.',
      source: 'LabCorp',
      verifiedDate: '2026-02-19T12:00:00Z',
    },
  ],
};

const MOCK_CHECKS: CandidateCheck[] = [
  {
    id: 'bc-001',
    candidateName: 'Michael Chen',
    candidateEmail: 'michael.chen@email.com',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    status: 'in_progress',
    vendor: 'Checkr',
    providerRefId: 'BGC-2026-001',
    checkType: 'Comprehensive',
    progress: 62,
    itemCount: 8,
    itemsCompleted: 5,
    initiatedDate: '2026-02-18T10:00:00Z',
    expectedDate: '2026-02-25T23:59:59Z',
    resultData: MOCK_RESULT_DATA,
  },
  {
    id: 'bc-002',
    candidateName: 'Emily Martinez',
    candidateEmail: 'emily.martinez@email.com',
    jobTitle: 'Product Manager',
    department: 'Product',
    status: 'clear',
    vendor: 'Sterling',
    providerRefId: 'BGC-2026-002',
    checkType: 'Comprehensive',
    progress: 100,
    itemCount: 6,
    itemsCompleted: 6,
    initiatedDate: '2026-02-10T09:00:00Z',
    completedDate: '2026-02-17T16:30:00Z',
    overallResult: 'clear',
  },
  {
    id: 'bc-003',
    candidateName: 'Alex Kim',
    candidateEmail: 'alex.kim@email.com',
    jobTitle: 'UX Designer',
    department: 'Design',
    status: 'flagged',
    vendor: 'HireRight',
    providerRefId: 'BGC-2026-003',
    checkType: 'Basic',
    progress: 100,
    itemCount: 4,
    itemsCompleted: 4,
    initiatedDate: '2026-02-12T11:00:00Z',
    completedDate: '2026-02-19T14:00:00Z',
    overallResult: 'flagged',
  },
  {
    id: 'bc-004',
    candidateName: 'Ryan Cooper',
    candidateEmail: 'ryan.cooper@email.com',
    jobTitle: 'Data Analyst',
    department: 'Analytics',
    status: 'pending',
    vendor: 'Checkr',
    providerRefId: 'BGC-2026-004',
    checkType: 'Basic',
    progress: 0,
    itemCount: 4,
    itemsCompleted: 0,
    initiatedDate: '2026-02-23T14:00:00Z',
    expectedDate: '2026-03-02T23:59:59Z',
  },
  {
    id: 'bc-005',
    candidateName: 'James Wilson',
    candidateEmail: 'james.wilson@email.com',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    status: 'clear',
    vendor: 'Sterling',
    providerRefId: 'BGC-2026-005',
    checkType: 'Comprehensive',
    progress: 100,
    itemCount: 7,
    itemsCompleted: 7,
    initiatedDate: '2026-02-05T08:00:00Z',
    completedDate: '2026-02-12T11:00:00Z',
    overallResult: 'clear',
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const BackgroundCheckPortal: React.FC<BackgroundCheckPortalProps> = ({
  checks = MOCK_CHECKS,
  vendors = MOCK_VENDORS,
  onInitiateCheck,
  onRefresh: _onRefresh,
}) => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PortalCheckStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVendors, setShowVendors] = useState(false);

  const filtered = useMemo(() => {
    let result = checks;
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.candidateName.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          c.providerRefId.toLowerCase().includes(q) ||
          c.vendor.toLowerCase().includes(q)
      );
    }
    return result;
  }, [checks, statusFilter, searchQuery]);

  const selectedCheck = useMemo(
    () => checks.find((c) => c.id === selectedCheckId) || null,
    [checks, selectedCheckId]
  );

  const stats = useMemo(
    () => ({
      total: checks.length,
      inProgress: checks.filter((c) => c.status === 'in_progress' || c.status === 'pending').length,
      clear: checks.filter((c) => c.status === 'clear').length,
      flagged: checks.filter((c) => c.status === 'flagged').length,
      failed: checks.filter((c) => c.status === 'failed').length,
    }),
    [checks]
  );

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedCheckId(id);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setView('list');
    setSelectedCheckId(null);
  }, []);

  // ── Detail View ──────────────────────────────────────────────────────────

  if (view === 'detail' && selectedCheck) {
    if (selectedCheck.resultData) {
      return (
        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
          >
            <ChevronDown className="w-3 h-3 rotate-90" /> Back to Dashboard
          </button>
          <BackgroundCheckResults result={selectedCheck.resultData} />
        </div>
      );
    }

    // Minimal detail for checks without full result data
    const stCfg = STATUS_CONFIG[selectedCheck.status];
    const StIcon = stCfg.icon;
    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
        >
          <ChevronDown className="w-3 h-3 rotate-90" /> Back to Dashboard
        </button>
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-6 text-center space-y-3">
          <div
            className={`w-14 h-14 rounded-xl ${stCfg.bg} flex items-center justify-center mx-auto`}
          >
            <StIcon className={`w-7 h-7 ${stCfg.color}`} />
          </div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            {selectedCheck.candidateName}
          </p>
          <p className="text-[10px] text-silver-mist">
            {selectedCheck.jobTitle} · {selectedCheck.checkType} Check via {selectedCheck.vendor}
          </p>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold ${stCfg.bg} ${stCfg.color}`}
          >
            <StIcon className="w-3.5 h-3.5" /> {stCfg.label}
          </span>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 max-w-xs mx-auto">
              <span className="text-[9px] text-silver-mist">Progress</span>
              <span className="text-[9px] font-bold text-ink-black dark:text-pearl">
                {selectedCheck.itemsCompleted}/{selectedCheck.itemCount} checks
              </span>
            </div>
            <div className="h-2 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden max-w-xs mx-auto">
              <div
                className={`h-full rounded-full ${stCfg.color.replace('text-', 'bg-')}`}
                style={{ width: `${selectedCheck.progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-[9px] text-silver-mist mt-2">
            <span>Initiated: {formatDate(selectedCheck.initiatedDate)}</span>
            {selectedCheck.completedDate && (
              <span>Completed: {formatDate(selectedCheck.completedDate)}</span>
            )}
            {selectedCheck.expectedDate && !selectedCheck.completedDate && (
              <span>Expected: {formatDate(selectedCheck.expectedDate)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── List View ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatCard
          label="Total Checks"
          value={stats.total}
          icon={ShieldCheck}
          color="text-celestial-indigo"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="text-celestial-indigo"
        />
        <StatCard label="Clear" value={stats.clear} icon={CheckCircle2} color="text-neural-mint" />
        <StatCard
          label="Flagged"
          value={stats.flagged}
          icon={AlertTriangle}
          color="text-sunset-amber"
        />
        <StatCard label="Failed" value={stats.failed} icon={XCircle} color="text-coral-alert" />
      </div>

      {/* Vendor Status */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-2">
        <button
          onClick={() => setShowVendors(!showVendors)}
          className="w-full flex items-center justify-between"
        >
          <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-celestial-indigo" />
            Connected Providers
            <span className="text-[9px] font-normal text-silver-mist">
              ({vendors.filter((v) => v.connected).length}/{vendors.length} active)
            </span>
          </p>
          {showVendors ? (
            <ChevronUp className="w-3.5 h-3.5 text-silver-mist" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
          )}
        </button>

        {showVendors && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {vendors.map((v) => (
              <div
                key={v.id}
                className={`p-2.5 rounded-lg border transition-colors ${
                  v.connected
                    ? 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
                    : 'border-cloud/50 dark:border-nebula-purple/10 bg-pearl/20 dark:bg-deep-cosmos/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold text-ink-black dark:text-pearl">{v.name}</p>
                  <div
                    className={`flex items-center gap-1 ${
                      v.apiStatus === 'online'
                        ? 'text-neural-mint'
                        : v.apiStatus === 'degraded'
                          ? 'text-sunset-amber'
                          : 'text-silver-mist/40'
                    }`}
                  >
                    {v.connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[8px] text-silver-mist">{v.checksSupported.join(' · ')}</p>
                <p className="text-[8px] text-silver-mist mt-0.5">Avg: {v.avgTurnaround}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, position, vendor, or ref ID..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'in_progress', 'clear', 'flagged', 'failed'] as const).map((s) => {
            const cfg = s === 'all' ? null : STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-celestial-indigo/10 text-celestial-indigo'
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                {s === 'all' ? 'All' : cfg?.label}
              </button>
            );
          })}
        </div>
        {onInitiateCheck && (
          <button
            onClick={onInitiateCheck}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3 h-3" /> Initiate
          </button>
        )}
      </div>

      {/* Check List */}
      <div className="space-y-2">
        {filtered.map((check) => {
          const stCfg = STATUS_CONFIG[check.status];
          const StIcon = stCfg.icon;

          return (
            <div
              key={check.id}
              onClick={() => handleOpenDetail(check.id)}
              className={`rounded-xl border bg-white dark:bg-stellar-blue p-3 cursor-pointer hover:border-celestial-indigo/30 transition-all ${
                check.status === 'flagged'
                  ? 'border-sunset-amber/20'
                  : check.status === 'failed'
                    ? 'border-coral-alert/20'
                    : 'border-cloud dark:border-nebula-purple/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div
                  className={`w-9 h-9 rounded-lg ${stCfg.bg} flex items-center justify-center shrink-0`}
                >
                  <StIcon className={`w-4 h-4 ${stCfg.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[11px] font-bold text-ink-black dark:text-pearl truncate">
                      {check.candidateName}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${stCfg.bg} ${stCfg.color}`}
                    >
                      {stCfg.label}
                    </span>
                    {check.status === 'in_progress' && (
                      <span className="flex items-center gap-0.5 text-[8px] text-celestial-indigo">
                        <RefreshCw
                          className="w-2.5 h-2.5 animate-spin"
                          style={{ animationDuration: '3s' }}
                        />{' '}
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-silver-mist">
                    <span className="flex items-center gap-0.5">
                      <Briefcase className="w-2.5 h-2.5" /> {check.jobTitle}
                    </span>
                    <span>{check.checkType}</span>
                    <span>via {check.vendor}</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" /> {formatDate(check.initiatedDate)}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-20 shrink-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] text-silver-mist">Progress</span>
                    <span className="text-[8px] font-bold text-ink-black dark:text-pearl">
                      {check.itemsCompleted}/{check.itemCount}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        check.status === 'clear'
                          ? 'bg-neural-mint'
                          : check.status === 'flagged'
                            ? 'bg-sunset-amber'
                            : check.status === 'failed'
                              ? 'bg-coral-alert'
                              : 'bg-celestial-indigo'
                      }`}
                      style={{ width: `${check.progress}%` }}
                    />
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-silver-mist/40 shrink-0" />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <ShieldCheck className="w-6 h-6 text-silver-mist/20 mx-auto mb-2" />
            <p className="text-[10px] text-silver-mist">No background checks match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; icon: LucideIcon; color: string }> = ({
  label,
  value,
  icon: Icon,
  color,
}) => (
  <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
    <div className="flex items-center justify-between mb-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-lg font-bold text-ink-black dark:text-pearl">{value}</span>
    </div>
    <p className="text-[9px] text-silver-mist">{label}</p>
  </div>
);

export default BackgroundCheckPortal;
