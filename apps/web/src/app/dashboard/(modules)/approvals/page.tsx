"use client";

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Calendar,
  DollarSign,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import UnifiedApprovalCenter from '@/components/approvals/UnifiedApprovalCenter';
import BulkApproval from '@/components/approvals/BulkApproval';
import { ApprovalHistory } from '@/components/approvals/ApprovalHistory';

type Tab = 'pending' | 'bulk' | 'history';

interface ApprovalStatItem {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function ApprovalsModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalStats, setApprovalStats] = useState<ApprovalStatItem[]>([
    { label: 'Leave', count: 0, icon: Calendar, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Expense', count: 0, icon: DollarSign, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Timesheet', count: 0, icon: Clock, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800' },
    { label: 'Requisition', count: 0, icon: Users, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    { label: 'Document', count: 0, icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  ]);
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    async function fetchApprovalCounts() {
      setLoading(true);
      setError(null);

      try {
        const [leaveRes, expenseRes, timesheetRes, requisitionRes] = await Promise.allSettled([
          fetch('/api/v1/leave/apply').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/compensation/expense-claims?status=PENDING').then(r => r.json()).catch(() => null),
          fetch('/api/attendance/timesheets?status=PENDING').then(r => r.json()).catch(() => null),
          fetch('/api/recruitment/requisitions?status=Pending').then(r => r.json()).catch(() => null),
        ]);

        const leaveCount = leaveRes.status === 'fulfilled' && leaveRes.value?.success
          ? (leaveRes.value.data || []).filter((r: { status: string }) => r.status === 'PENDING').length
          : 0;

        const expenseCount = expenseRes.status === 'fulfilled' && expenseRes.value?.success
          ? (expenseRes.value.data || []).length
          : 0;

        const timesheetCount = timesheetRes.status === 'fulfilled' && timesheetRes.value?.success
          ? (timesheetRes.value.data || []).filter((t: { status: string }) => t.status === 'PENDING').length
          : 0;

        const requisitionCount = requisitionRes.status === 'fulfilled' && requisitionRes.value?.success
          ? (requisitionRes.value.data || []).filter((r: { approvalStatus: string }) => r.approvalStatus === 'Pending').length
          : 0;

        // Document approvals don't have a dedicated API yet; keep at 0
        const documentCount = 0;

        // Count urgent items (high-priority requisitions + any urgent-flagged items)
        let urgent = 0;
        if (requisitionRes.status === 'fulfilled' && requisitionRes.value?.success) {
          urgent += (requisitionRes.value.data || []).filter(
            (r: { priority: string; approvalStatus: string }) => r.priority === 'High' && r.approvalStatus === 'Pending'
          ).length;
        }
        setUrgentCount(urgent);

        setApprovalStats([
          { label: 'Leave', count: leaveCount, icon: Calendar, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Expense', count: expenseCount, icon: DollarSign, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Timesheet', count: timesheetCount, icon: Clock, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800' },
          { label: 'Requisition', count: requisitionCount, icon: Users, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
          { label: 'Document', count: documentCount, icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
        ]);
      } catch (err) {
        console.error('Failed to fetch approval counts:', err);
        setError('Failed to load approval data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchApprovalCounts();
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending Approvals' },
    { key: 'bulk', label: 'Bulk Actions' },
    { key: 'history', label: 'History' },
  ];

  const totalPending = approvalStats.reduce((sum, s) => sum + s.count, 0);

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 h-16" />
            ))}
          </div>
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl mb-6" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-indigo-500" />
          Approval Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and manage pending approvals across all request types
        </p>
      </div>

      {/* Stats by Type */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {approvalStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stat.count}</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Pending Banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800/30 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {totalPending} pending approval{totalPending !== 1 ? 's' : ''} require{totalPending === 1 ? 's' : ''} your attention
          </p>
          {urgentCount > 0 && (
            <p className="text-xs text-indigo-500 mt-0.5">
              {urgentCount} marked as urgent priority
            </p>
          )}
        </div>
        <button
          onClick={() => setActiveTab('bulk')}
          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Bulk Review
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'pending' && <UnifiedApprovalCenter />}
        {activeTab === 'bulk' && <BulkApproval />}
        {activeTab === 'history' && <ApprovalHistory />}
      </div>
    </div>
  );
}
