/**
 * @module DSARDashboard
 * @description Data Subject Access Request (DSAR) dashboard with SLA countdown,
 *              type distribution, status workflow, and new request form.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  FileSearch,
  Trash2,
  Share2,
  Ban,
  MessageSquare,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import {
  DataGovernanceService,
  DSAR_TYPE_META,
  DSAR_STATUS_META,
  type DSARRequest,
  type DSARType,
  type DSARStatus,
  type DSARRegulation,
  type GovernanceMetrics,
} from '@/services/dataGovernanceService';

// ── SLA countdown ──────────────────────────────────────────────────────────────

function SLACountdown({ dueDate, status }: { dueDate: string; status: DSARStatus }) {
  const isComplete = ['completed', 'rejected', 'withdrawn'].includes(status);
  if (isComplete) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const msLeft = due.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isCritical = daysLeft <= 5 && daysLeft >= 0;

  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full ${
        isOverdue
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
          : isCritical
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
      }`}
    >
      <Clock className="w-3 h-3" />
      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
    </div>
  );
}

// ── Type icon ─────────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: DSARType }) {
  switch (type) {
    case 'access':
      return <FileSearch className="w-4 h-4" />;
    case 'erasure':
      return <Trash2 className="w-4 h-4" />;
    case 'portability':
      return <Share2 className="w-4 h-4" />;
    case 'rectification':
      return <MessageSquare className="w-4 h-4" />;
    case 'restriction':
      return <Ban className="w-4 h-4" />;
    case 'objection':
      return <Shield className="w-4 h-4" />;
    default:
      return <Shield className="w-4 h-4" />;
  }
}

// ── Request card ──────────────────────────────────────────────────────────────

interface RequestCardProps {
  request: DSARRequest;
  onUpdateStatus: (id: string, status: DSARStatus) => void;
}

function RequestCard({ request, onUpdateStatus }: RequestCardProps) {
  const typeMeta = DSAR_TYPE_META[request.type];
  const statusMeta = DSAR_STATUS_META[request.status];

  const NEXT_STATUS: Partial<Record<DSARStatus, DSARStatus>> = {
    received: 'acknowledged',
    acknowledged: 'processing',
    processing: 'review',
    review: 'completed',
  };

  const nextStatus = NEXT_STATUS[request.status];

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4 hover:border-celestial-indigo/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-pearl dark:bg-deep-cosmos flex items-center justify-center flex-shrink-0">
          <span className={typeMeta.color}>
            <TypeIcon type={request.type} />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-silver-mist">{request.requestCode}</span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusMeta.bgColor} ${statusMeta.color}`}
            >
              {statusMeta.label}
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 uppercase">
              {request.regulation}
            </span>
          </div>
          <p className={`text-sm font-semibold mt-0.5 ${typeMeta.color}`}>{typeMeta.label}</p>
          <p className="text-xs text-ink-black dark:text-pearl">
            {request.subjectName}
            <span className="text-silver-mist"> · {request.subjectEmail}</span>
          </p>
          {request.notes && (
            <p className="text-xs text-silver-mist mt-1 line-clamp-2">{request.notes}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <SLACountdown dueDate={request.dueDate} status={request.status} />
            <span className="text-[10px] text-silver-mist">
              Submitted {new Date(request.submittedAt).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-silver-mist">
              Due {new Date(request.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        {nextStatus && (
          <button
            onClick={() => onUpdateStatus(request.id, nextStatus)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-celestial-indigo/10 dark:bg-celestial-indigo/20 text-celestial-indigo text-[10px] font-semibold hover:bg-celestial-indigo hover:text-white transition-colors flex-shrink-0"
          >
            Mark as {DSAR_STATUS_META[nextStatus].label}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── New DSAR Form ─────────────────────────────────────────────────────────────

interface NewDSARFormProps {
  onSubmit: (type: DSARType, regulation: DSARRegulation, subjectId: string, notes: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function NewDSARForm({ onSubmit, onCancel, isSubmitting }: NewDSARFormProps) {
  const [type, setType] = useState<DSARType>('access');
  const [regulation, setRegulation] = useState<DSARRegulation>('gdpr');
  const [subjectId, setSubjectId] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-celestial-indigo/30 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl">New DSAR Request</h3>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos text-silver-mist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-silver-mist mb-1.5">Request Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DSARType)}
            className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-white dark:bg-deep-cosmos/30 text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30"
          >
            {Object.entries(DSAR_TYPE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-silver-mist mb-1.5">Regulation</label>
          <select
            value={regulation}
            onChange={(e) => setRegulation(e.target.value as DSARRegulation)}
            className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-white dark:bg-deep-cosmos/30 text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30"
          >
            <option value="gdpr">GDPR (30 days)</option>
            <option value="ccpa">CCPA (45 days)</option>
            <option value="pdpa">PDPA (30 days)</option>
            <option value="lgpd">LGPD (15 days)</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-silver-mist mb-1.5">
            Employee / Subject ID
          </label>
          <input
            type="text"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            placeholder="e.g. emp-001"
            className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-silver-mist mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Additional context for the request..."
            className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onSubmit(type, regulation, subjectId, notes)}
          disabled={!subjectId || isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Submit Request
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DSARDashboard() {
  const [requests, setRequests] = useState<DSARRequest[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DSARStatus | 'all'>('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ requests: reqs }, mets] = await Promise.all([
        DataGovernanceService.getDataSubjectRequests(),
        DataGovernanceService.getMetrics(),
      ]);
      setRequests(reqs);
      setMetrics(mets);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (id: string, status: DSARStatus) => {
    await DataGovernanceService.updateDSARStatus(id, status);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r))
    );
  };

  const handleNewDSAR = async (
    type: DSARType,
    regulation: DSARRegulation,
    subjectId: string,
    notes: string
  ) => {
    setIsSubmitting(true);
    try {
      const req = await DataGovernanceService.createDSAR({ type, regulation, subjectId, notes });
      setRequests((prev) => [req, ...prev]);
      setShowNewForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests =
    statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter);

  const OPEN_STATUSES: DSARStatus[] = ['received', 'acknowledged', 'processing', 'review'];
  const openRequests = requests.filter((r) => OPEN_STATUSES.includes(r.status));
  const overdueRequests = openRequests.filter((r) => new Date(r.dueDate) < new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Shield className="w-5 h-5 text-celestial-indigo" />
            Data Subject Access Requests
          </h2>
          <p className="text-xs text-silver-mist mt-0.5">
            GDPR Article 15 · CCPA Section 1798.100 · Track and fulfill data rights requests
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* New form */}
      {showNewForm && (
        <NewDSARForm
          onSubmit={handleNewDSAR}
          onCancel={() => setShowNewForm(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total DSARs',
              value: metrics.totalDSARs,
              icon: <BarChart3 className="w-4 h-4" />,
              color: 'text-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              label: 'Open',
              value: metrics.openDSARs,
              icon: <Clock className="w-4 h-4" />,
              color: 'text-amber-600',
              bg: 'bg-amber-50 dark:bg-amber-900/20',
            },
            {
              label: 'Overdue',
              value: overdueRequests.length,
              icon: <AlertTriangle className="w-4 h-4" />,
              color: 'text-red-600',
              bg: 'bg-red-50 dark:bg-red-900/20',
            },
            {
              label: 'Completion Rate',
              value: `${metrics.completionRate}%`,
              icon: <CheckCircle className="w-4 h-4" />,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4"
            >
              <div
                className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-silver-mist mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* SLA warning */}
      {overdueRequests.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {overdueRequests.length} overdue request{overdueRequests.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
              These requests have exceeded their legal deadline. Immediate action required.
            </p>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-silver-mist flex-shrink-0" />
        {(
          [
            'all',
            'received',
            'acknowledged',
            'processing',
            'review',
            'completed',
            'rejected',
          ] as const
        ).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              statusFilter === s
                ? 'bg-celestial-indigo text-white'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos'
            }`}
          >
            {s === 'all' ? 'All' : DSAR_STATUS_META[s as DSARStatus].label}
          </button>
        ))}
      </div>

      {/* Request list */}
      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Shield className="w-10 h-10 text-silver-mist/20 mb-3" />
          <p className="text-sm text-silver-mist">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <RequestCard key={req.id} request={req} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

export default DSARDashboard;
