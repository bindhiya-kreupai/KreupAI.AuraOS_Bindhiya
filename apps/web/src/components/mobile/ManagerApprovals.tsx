/**
 * @module ManagerApprovals
 * @description Mobile-optimised manager approval hub — leave, expenses, overtime,
 *              profile changes with swipe-to-approve/reject and bulk actions (Sec 15.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  Calendar,
  AlertCircle,
  RefreshCw,
  Check,
  MessageSquare,
} from 'lucide-react';
import {
  SwipeableCard,
  SWIPE_APPROVE,
  SWIPE_REJECT,
} from '@/components/ui/responsive/SwipeableCard';

// ── Types ─────────────────────────────────────────────────────────────────────

type ApprovalType = 'leave' | 'expense' | 'overtime' | 'profile_change';
type UrgencyLevel = 'low' | 'normal' | 'high' | 'critical';
type ActiveTab = 'all' | ApprovalType;

interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  employeeId: string;
  employeeName: string;
  employeeDept: string;
  avatarInitials: string;
  avatarColor: string;
  title: string;
  subtitle: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  urgency: UrgencyLevel;
  submittedDate: string;
  requestedDays?: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: 'apr-001',
    type: 'leave',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeDept: 'Engineering',
    avatarInitials: 'JD',
    avatarColor: 'bg-blue-500',
    title: 'Annual Leave',
    subtitle: 'March 10 – March 14 (5 days)',
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    requestedDays: 5,
    urgency: 'normal',
    submittedDate: '2026-02-24',
  },
  {
    id: 'apr-002',
    type: 'expense',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    employeeDept: 'Sales',
    avatarInitials: 'JS',
    avatarColor: 'bg-emerald-500',
    title: 'Client Entertainment',
    subtitle: 'February Business Dinner',
    amount: 485.5,
    urgency: 'normal',
    submittedDate: '2026-02-22',
  },
  {
    id: 'apr-003',
    type: 'overtime',
    employeeId: 'emp-003',
    employeeName: 'Sarah Lee',
    employeeDept: 'HR',
    avatarInitials: 'SL',
    avatarColor: 'bg-violet-500',
    title: 'Overtime Claim',
    subtitle: 'Feb 20 – 8 extra hours',
    amount: 320,
    urgency: 'low',
    submittedDate: '2026-02-20',
  },
  {
    id: 'apr-004',
    type: 'profile_change',
    employeeId: 'emp-004',
    employeeName: 'Michael Zhang',
    employeeDept: 'Finance',
    avatarInitials: 'MZ',
    avatarColor: 'bg-amber-500',
    title: 'Bank Details Change',
    subtitle: 'New account ending **4521',
    urgency: 'high',
    submittedDate: '2026-02-23',
  },
  {
    id: 'apr-005',
    type: 'leave',
    employeeId: 'emp-005',
    employeeName: 'Priya Patel',
    employeeDept: 'Operations',
    avatarInitials: 'PP',
    avatarColor: 'bg-rose-500',
    title: 'Sick Leave',
    subtitle: 'Feb 26 – Feb 27 (2 days)',
    startDate: '2026-02-26',
    endDate: '2026-02-27',
    requestedDays: 2,
    urgency: 'critical',
    submittedDate: '2026-02-25',
  },
  {
    id: 'apr-006',
    type: 'expense',
    employeeId: 'emp-006',
    employeeName: 'David Kim',
    employeeDept: 'Product',
    avatarInitials: 'DK',
    avatarColor: 'bg-cyan-500',
    title: 'Conference Registration',
    subtitle: 'ProductCon 2026 — San Francisco',
    amount: 1200,
    urgency: 'normal',
    submittedDate: '2026-02-21',
  },
  {
    id: 'apr-007',
    type: 'leave',
    employeeId: 'emp-007',
    employeeName: 'Lisa Wang',
    employeeDept: 'Marketing',
    avatarInitials: 'LW',
    avatarColor: 'bg-indigo-500',
    title: 'Parental Leave',
    subtitle: 'March 1 – May 31 (65 days)',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    requestedDays: 65,
    urgency: 'high',
    submittedDate: '2026-02-18',
  },
  {
    id: 'apr-008',
    type: 'overtime',
    employeeId: 'emp-008',
    employeeName: 'Tom Johnson',
    employeeDept: 'Engineering',
    avatarInitials: 'TJ',
    avatarColor: 'bg-teal-500',
    title: 'Weekend Overtime',
    subtitle: 'Feb 22 – 6 hours (production incident)',
    amount: 240,
    urgency: 'low',
    submittedDate: '2026-02-22',
  },
];

const TABS: { key: ActiveTab; label: string; type?: ApprovalType }[] = [
  { key: 'all', label: 'All' },
  { key: 'leave', label: 'Leave', type: 'leave' },
  { key: 'expense', label: 'Expenses', type: 'expense' },
  { key: 'overtime', label: 'Overtime', type: 'overtime' },
  { key: 'profile_change', label: 'Profile', type: 'profile_change' },
];

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-slate-500', bgColor: 'bg-slate-100' },
  normal: { label: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  high: { label: 'Urgent', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' },
};

const TYPE_ICON: Record<ApprovalType, React.ElementType> = {
  leave: Calendar,
  expense: DollarSign,
  overtime: Clock,
  profile_change: User,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ManagerApprovals() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [approvals, _setApprovals] = useState<ApprovalRequest[]>(MOCK_APPROVALS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [processed, setProcessed] = useState<Set<string>>(new Set());

  const filtered = activeTab === 'all' ? approvals : approvals.filter((a) => a.type === activeTab);

  const pending = filtered.filter((a) => !processed.has(a.id));

  const badgeCount = (tab: ActiveTab) => {
    if (tab === 'all') return approvals.filter((a) => !processed.has(a.id)).length;
    return approvals.filter((a) => a.type === tab && !processed.has(a.id)).length;
  };

  const handleApprove = useCallback((id: string) => {
    setProcessed((prev) => new Set([...prev, id]));
  }, []);

  const handleReject = useCallback((id: string) => {
    setRejectId(id);
    setRejectReason('');
  }, []);

  const confirmReject = () => {
    if (rejectId) {
      setProcessed((prev) => new Set([...prev, rejectId]));
      setRejectId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkApprove = () => {
    setProcessed((prev) => new Set([...prev, ...selected]));
    setSelected(new Set());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setProcessed(new Set());
      setRefreshing(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {approvals.filter((a) => !processed.has(a.id)).length} pending
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {TABS.map((tab) => {
            const count = badgeCount(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold ${
                      activeTab === tab.key
                        ? 'bg-white text-indigo-600'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
          <span className="text-white text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 text-white text-sm border border-white/40 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={bulkApprove}
              className="px-3 py-1.5 bg-white text-indigo-600 text-sm font-semibold rounded-lg"
            >
              Approve All
            </button>
          </div>
        </div>
      )}

      {/* Card List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="font-semibold text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">No pending approvals in this category.</p>
          </div>
        ) : (
          pending.map((item) => {
            const TypeIcon = TYPE_ICON[item.type];
            const urgency = URGENCY_CONFIG[item.urgency];
            const isSelected = selected.has(item.id);

            return (
              <SwipeableCard
                key={item.id}
                leftAction={{
                  ...SWIPE_APPROVE,
                  onAction: () => handleApprove(item.id),
                }}
                rightAction={{
                  ...SWIPE_REJECT,
                  onAction: () => handleReject(item.id),
                }}
                className="rounded-xl shadow-sm"
              >
                <div
                  className={`bg-white rounded-xl p-4 transition-all ${
                    isSelected ? 'ring-2 ring-indigo-400' : ''
                  }`}
                  onClick={() => selected.size > 0 && toggleSelect(item.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Select checkbox or avatar */}
                    <div
                      className="flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.id);
                      }}
                    >
                      {isSelected ? (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full ${item.avatarColor} flex items-center justify-center`}
                        >
                          <span className="text-white font-semibold text-sm">
                            {item.avatarInitials}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.employeeName}</p>
                          <p className="text-xs text-gray-500">{item.employeeDept}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${urgency.bgColor} ${urgency.color}`}
                        >
                          {urgency.label}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <TypeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-800">{item.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 ml-5">{item.subtitle}</p>

                      {item.amount && (
                        <p className="text-sm font-bold text-gray-900 mt-1 ml-5">
                          ${item.amount.toLocaleString()}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(item.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(item.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <span className="text-xs text-gray-400 ml-auto">{item.submittedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwipeableCard>
            );
          })
        )}

        {/* Swipe hint */}
        {pending.length > 0 && (
          <p className="text-center text-xs text-gray-400 py-2">
            Swipe right to approve · Swipe left to reject
          </p>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Reject Request</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejection (optional).
            </p>
            <div className="relative mb-4">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerApprovals;
