"use client";

import React, { useState } from 'react';
import {
  ClipboardCheck,
  Calendar,
  DollarSign,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import UnifiedApprovalCenter from '@/components/approvals/UnifiedApprovalCenter';
import ApprovalFilters from '@/components/approvals/ApprovalFilters';
import BulkApproval from '@/components/approvals/BulkApproval';
import { ApprovalHistory } from '@/components/approvals/ApprovalHistory';

type Tab = 'pending' | 'bulk' | 'history';

const approvalStats = [
  { label: 'Leave', count: 4, icon: Calendar, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  { label: 'Expense', count: 3, icon: DollarSign, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { label: 'Timesheet', count: 2, icon: Clock, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800' },
  { label: 'Requisition', count: 2, icon: Users, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  { label: 'Document', count: 1, icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
];

export default function ApprovalsModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending Approvals' },
    { key: 'bulk', label: 'Bulk Actions' },
    { key: 'history', label: 'History' },
  ];

  const totalPending = approvalStats.reduce((sum, s) => sum + s.count, 0);

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
            {totalPending} pending approvals require your attention
          </p>
          <p className="text-xs text-indigo-500 mt-0.5">
            2 marked as urgent priority
          </p>
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
