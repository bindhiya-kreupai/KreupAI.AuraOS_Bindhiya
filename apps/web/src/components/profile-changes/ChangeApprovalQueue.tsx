// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  Home,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import type {
  ChangeRequest,
  ChangeRequestStatus,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function _StatusBadge({ status }: { status: ChangeRequestStatus }) {
  const meta = CHANGE_REQUEST_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color} ${meta.bgColor}`}
    >
      {meta.label}
    </span>
  );
}

function TypeIcon({ changeType }: { changeType: string }) {
  const meta = CHANGE_TYPE_META[changeType as ChangeType];
  if (!meta) return <FileText className="w-4 h-4 text-slate-400" />;
  const Icon = ICON_MAP[meta.icon] ?? FileText;
  return <Icon className={`w-4 h-4 ${meta.color}`} />;
}

// ── Diff panel ────────────────────────────────────────────────────────────────

function SideBySideDiff({
  current,
  requested,
}: {
  current: Record<string, unknown>;
  requested: Record<string, unknown>;
}) {
  const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(requested)]));
  const changedKeys = allKeys.filter(
    (k) => String(current[k] ?? '') !== String(requested[k] ?? '')
  );

  return (
    <div className="space-y-2">
      {changedKeys.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No field differences detected</p>
      ) : (
        changedKeys.map((key) => (
          <div key={key} className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
              <p className="font-medium text-slate-500 mb-0.5 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </p>
              <p className="text-red-700 dark:text-red-400 line-through">
                {String(current[key] ?? '—')}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
              <p className="font-medium text-slate-500 mb-0.5 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {String(requested[key] ?? '—')}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Approval dialog ───────────────────────────────────────────────────────────

interface ApprovalDialogProps {
  request: ChangeRequest;
  onApprove: (id: string, comment: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onClose: () => void;
}

function ApprovalDialog({ request, onApprove, onReject, onClose }: ApprovalDialogProps) {
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(request.id, comment);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading(true);
    try {
      await onReject(request.id, rejectReason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              <TypeIcon changeType={request.changeType} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100">
                {request.changeTypeName}
              </h2>
              <p className="text-xs text-slate-500">
                {request.employeeName} · {request.requestCode}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Diff */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Proposed Changes
            </h3>
            <SideBySideDiff
              current={request.currentValues as unknown as Record<string, unknown>}
              requested={request.requestedValues as unknown as Record<string, unknown>}
            />
          </div>

          {/* Reason */}
          {request.reason && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-xs font-medium text-slate-500 mb-0.5">Employee Reason</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
            </div>
          )}

          {/* Verification docs */}
          {request.verificationDocuments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Documents
              </h3>
              <div className="space-y-2">
                {request.verificationDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {doc.documentName}
                    <span
                      className={`ml-auto px-1.5 py-0.5 rounded-full ${doc.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action selector */}
          {!mode && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setMode('approve')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setMode('reject')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-700 dark:text-red-400 font-semibold rounded-xl border border-red-200 dark:border-red-800 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {/* Approve mode */}
          {mode === 'approve' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Approval Comment (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirm Approval
                </button>
              </div>
            </div>
          )}

          {/* Reject mode */}
          {mode === 'reject' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Explain why this request is being rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading || !rejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ChangeApprovalQueueProps {
  approverId?: string;
  onViewDetail?: (id: string) => void;
}

export function ChangeApprovalQueue({
  approverId = 'mgr-001',
  onViewDetail,
}: ChangeApprovalQueueProps) {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    ProfileChangeService.getChangeRequests({ status: 'pending_approval' })
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [approverId]);

  const handleApprove = async (id: string, comment: string) => {
    await ProfileChangeService.approveChange(id, approverId, comment);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setSelectedRequest(null);
  };

  const handleReject = async (id: string, reason: string) => {
    await ProfileChangeService.rejectChange(id, reason);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setSelectedRequest(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const paginated = requests.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(requests.length / PAGE_SIZE);

  return (
    <>
      {selectedRequest && (
        <ApprovalDialog
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Approval Queue
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {requests.length} request{requests.length !== 1 ? 's' : ''} pending your approval
            </p>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex gap-2">
              <span className="text-xs text-slate-500 self-center">
                {selectedIds.size} selected
              </span>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bulk Approve
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-700 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800 transition-colors">
                <XCircle className="w-3.5 h-3.5" /> Bulk Reject
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
              <p className="text-sm text-slate-400 mt-1">No pending change requests to approve</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[2rem_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <div />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Employee
                </p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Change Type
                </p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Requested
                </p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Priority
                </p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Action
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((req) => (
                  <div
                    key={req.id}
                    className="flex md:grid md:grid-cols-[2rem_1fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 shrink-0"
                      checked={selectedIds.has(req.id)}
                      onChange={() => toggleSelect(req.id)}
                    />
                    {/* Employee */}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {req.employeeName}
                      </p>
                      <p className="text-xs text-slate-500">{req.departmentName}</p>
                    </div>
                    {/* Type */}
                    <div className="flex items-center gap-2">
                      <TypeIcon changeType={req.changeType} />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {req.changeTypeName}
                      </span>
                    </div>
                    {/* Date */}
                    <div className="text-xs text-slate-500">
                      {req.submittedDate ? new Date(req.submittedDate).toLocaleDateString() : '—'}
                    </div>
                    {/* Priority */}
                    <div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${req.priority === 'urgent' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                      >
                        {req.priority}
                      </span>
                    </div>
                    {/* Action */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Review <ArrowRight className="w-3 h-3" />
                      </button>
                      {onViewDetail && (
                        <button
                          onClick={() => onViewDetail(req.id)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
