// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  Home,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
} from 'lucide-react';
import type {
  ChangeRequest,
  ChangeRequestStatus,
  ChangeRequestHistoryEntry,
  ChangeType,
} from '@/services/profileChangeService';
import {
  ProfileChangeService,
  CHANGE_REQUEST_STATUS_META,
  CHANGE_TYPE_META,
} from '@/services/profileChangeService';

// ── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  FileText,
  Home,
};

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ChangeRequestStatus }) {
  const meta = CHANGE_REQUEST_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${meta.color} ${meta.bgColor}`}
    >
      {meta.label}
    </span>
  );
}

// ── Timeline entry ────────────────────────────────────────────────────────────

function TimelineEntry({ entry, isLast }: { entry: ChangeRequestHistoryEntry; isLast: boolean }) {
  const getActionIcon = () => {
    switch (entry.action) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'submitted':
        return <Upload className="w-4 h-4 text-blue-600" />;
      case 'document_verified':
        return <CheckCircle2 className="w-4 h-4 text-violet-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
          {getActionIcon()}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />}
      </div>
      <div className="pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
            {entry.action.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-slate-500">by {entry.userName}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{entry.details}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date(entry.timestamp).toLocaleString()}
        </p>
        {entry.oldStatus && entry.newStatus && (
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge status={entry.oldStatus} />
            <span className="text-slate-400 text-xs">→</span>
            <StatusBadge status={entry.newStatus} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Diff table ────────────────────────────────────────────────────────────────

function DiffTable({
  current,
  requested,
}: {
  current: Record<string, unknown>;
  requested: Record<string, unknown>;
}) {
  const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(requested)]));

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="grid grid-cols-3 gap-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Field
        </div>
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-l border-slate-200 dark:border-slate-700">
          Current
        </div>
        <div className="px-4 py-2 text-xs font-semibold text-indigo-600 uppercase tracking-wide border-l border-slate-200 dark:border-slate-700">
          Requested
        </div>
      </div>
      {allKeys.map((key, _idx) => {
        const curr = String(current[key] ?? '—');
        const req = String(requested[key] ?? '—');
        const changed = curr !== req;
        return (
          <div
            key={key}
            className={`grid grid-cols-3 border-b border-slate-100 dark:border-slate-800 last:border-0 ${
              changed ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''
            }`}
          >
            <div className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div
              className={`px-4 py-3 text-xs border-l border-slate-100 dark:border-slate-800 ${changed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {curr}
            </div>
            <div
              className={`px-4 py-3 text-xs border-l border-slate-100 dark:border-slate-800 font-medium ${changed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {req}
              {changed && (
                <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-1 rounded">
                  Changed
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ChangeRequestDetailProps {
  requestId: string;
  onBack: () => void;
  canApprove?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ChangeRequestDetail({
  requestId,
  onBack,
  canApprove = false,
  onApprove,
  onReject,
}: ChangeRequestDetailProps) {
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    ProfileChangeService.getChangeRequest(requestId)
      .then(setRequest)
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleCancel = async () => {
    if (!request || !window.confirm('Are you sure you want to cancel this request?')) return;
    setCancelling(true);
    try {
      const updated = await ProfileChangeService.cancelChangeRequest(
        request.id,
        'Cancelled by employee'
      );
      setRequest(updated);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20 text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Change request not found</p>
      </div>
    );
  }

  const typeMeta = CHANGE_TYPE_META[request.changeType as ChangeType];
  const TypeIcon = ICON_MAP[typeMeta?.icon ?? 'FileText'] ?? FileText;

  const canCancel = ['draft', 'submitted', 'pending_approval', 'pending_verification'].includes(
    request.status
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </button>

      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
              <TypeIcon className={`w-6 h-6 ${typeMeta?.color ?? 'text-indigo-600'}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {request.changeTypeName}
              </h1>
              <p className="text-sm text-slate-500">{request.requestCode}</p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Meta row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Employee</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {request.employeeName}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Department</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {request.departmentName}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Submitted</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {request.submittedDate ? new Date(request.submittedDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Effective Date</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {request.effectiveDate ? new Date(request.effectiveDate).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {request.reason && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs text-slate-500 mb-0.5">Reason</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
          </div>
        )}

        {/* Actions */}
        {(canApprove || canCancel) && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
            {canApprove && request.status === 'pending_approval' && (
              <>
                <button
                  onClick={onApprove}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={onReject}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-700 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {canCancel && !canApprove && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {cancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel Request
              </button>
            )}
          </div>
        )}
      </div>

      {/* Current → New diff */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Change Details
        </h2>
        <DiffTable
          current={request.currentValues as unknown as Record<string, unknown>}
          requested={request.requestedValues as unknown as Record<string, unknown>}
        />
      </div>

      {/* Verification documents */}
      {request.verificationRequired && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Verification Documents
            </h2>
            {request.verificationDocuments.length === 0 && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Required
              </span>
            )}
          </div>
          {request.verificationDocuments.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {request.verificationDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {doc.documentName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doc.documentType.replace(/_/g, ' ')} · {(doc.fileSize / 1024).toFixed(0)} KB
                      · {new Date(doc.uploadedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      doc.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : doc.status === 'rejected'
                          ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}
                  >
                    {doc.status}
                  </span>
                  <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Approval Timeline
          </h2>
          {showHistory ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {showHistory && (
          <div className="mt-5">
            {request.history.length === 0 ? (
              <p className="text-sm text-slate-400">No history yet</p>
            ) : (
              request.history.map((entry, idx) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  isLast={idx === request.history.length - 1}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
