/**
 * @module UnifiedApprovalCenter
 * @description Main unified approval center with pending list, bulk actions, filters, and history
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Inbox,
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Palmtree,
  Receipt,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApprovals } from '@/hooks/useApprovals';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalFilters, type FilterState } from './ApprovalFilters';
import { BulkApproval } from './BulkApproval';
import { ApprovalHistory } from './ApprovalHistory';

type ActiveTab = 'pending' | 'history';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
    <div className={`p-1.5 rounded-lg ${color}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div>
      <p className="text-lg font-bold text-ink-black dark:text-pearl leading-none">{value}</p>
      <p className="text-[9px] text-silver-mist">{label}</p>
    </div>
  </div>
);

export const UnifiedApprovalCenter: React.FC = () => {
  const {
    requests,
    loading,
    pending,
    completed,
    summary,
    selectedIds,
    approve,
    reject,
    escalate,
    bulkApprove,
    bulkReject,
    addComment,
    toggleSelect,
    selectAll,
    clearSelection,
  } = useApprovals();

  const [activeTab, setActiveTab] = useState<ActiveTab>('pending');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    priority: 'all',
    dateRange: 'all',
  });

  // Apply filters to pending
  const filteredPending = useMemo(() => {
    let result = pending;

    if (filters.type !== 'all') {
      result = result.filter((r) => r.type === filters.type);
    }
    if (filters.priority !== 'all') {
      result = result.filter((r) => r.priority === filters.priority);
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.requestedByName.toLowerCase().includes(q) ||
          r.requestedByDept.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    if (filters.dateRange !== 'all') {
      const now = new Date();
      result = result.filter((r) => {
        const reqDate = new Date(r.requestDate);
        switch (filters.dateRange) {
          case 'today':
            return reqDate.toDateString() === now.toDateString();
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 86400000);
            return reqDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(now.getTime() - 30 * 86400000);
            return reqDate >= monthAgo;
          }
          case 'overdue':
            return r.dueDate && new Date(r.dueDate) < now;
          default:
            return true;
        }
      });
    }

    // Sort: overdue first, then by priority, then by date
    return result.sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date() ? 1 : 0;
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date() ? 1 : 0;
      if (bOverdue !== aOverdue) return bOverdue - aOverdue;

      const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPri = priorityOrder[a.priority] || 0;
      const bPri = priorityOrder[b.priority] || 0;
      if (bPri !== aPri) return bPri - aPri;

      return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
    });
  }, [pending, filters]);

  const handleSelectAll = useCallback(() => {
    selectAll(filteredPending.map((r) => r.id));
  }, [filteredPending, selectAll]);

  const overdueCount = useMemo(
    () => pending.filter((r) => r.dueDate && new Date(r.dueDate) < new Date()).length,
    [pending]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-celestial-indigo border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          icon={Clock}
          label="Pending"
          value={summary.total}
          color="bg-sunset-amber/10 text-sunset-amber"
        />
        <StatCard
          icon={Palmtree}
          label="Leave"
          value={summary.leave}
          color="bg-celestial-indigo/10 text-celestial-indigo"
        />
        <StatCard
          icon={Receipt}
          label="Expense"
          value={summary.expense}
          color="bg-sunset-amber/10 text-sunset-amber"
        />
        <StatCard
          icon={Briefcase}
          label="Requisition"
          value={summary.requisition}
          color="bg-quantum-rose/10 text-quantum-rose"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={overdueCount}
          color="bg-coral-alert/10 text-coral-alert"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30 w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
              : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          Pending ({summary.total})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
              : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          History ({completed.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {/* Filters */}
          <ApprovalFilters filters={filters} onChange={setFilters} counts={summary} />

          {/* Bulk approval bar */}
          <BulkApproval
            selectedCount={selectedIds.size}
            totalPending={filteredPending.length}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkApprove={bulkApprove}
            onBulkReject={bulkReject}
          />

          {/* Approval cards */}
          {filteredPending.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-neural-mint/20 mx-auto mb-3" />
              <p className="text-sm text-silver-mist mb-1">All caught up!</p>
              <p className="text-[11px] text-silver-mist/60">
                No pending approvals match your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPending.map((req) => (
                <ApprovalCard
                  key={req.id}
                  request={req}
                  isSelected={selectedIds.has(req.id)}
                  onToggleSelect={toggleSelect}
                  onApprove={approve}
                  onReject={reject}
                  onEscalate={escalate}
                  onComment={addComment}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && <ApprovalHistory requests={requests} />}
    </div>
  );
};

export default UnifiedApprovalCenter;
