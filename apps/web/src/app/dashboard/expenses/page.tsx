// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState } from 'react';
import { Receipt, Clock, BarChart3, Shield, LayoutGrid, ChevronRight, Home } from 'lucide-react';
import { ExpenseDashboard } from '@/components/expenses/ExpenseDashboard';
import { ExpenseReportForm } from '@/components/expenses/ExpenseReportForm';
import { ExpenseReportList } from '@/components/expenses/ExpenseReportList';
import { ExpenseReportDetail } from '@/components/expenses/ExpenseReportDetail';
import { ExpenseApprovalQueue } from '@/components/expenses/ExpenseApprovalQueue';
import { ExpensePolicyManager } from '@/components/expenses/ExpensePolicyManager';
import { ExpenseAnalytics } from '@/components/expenses/ExpenseAnalytics';

// ── Types ──────────────────────────────────────────────────────────────────────

type ActiveTab = 'dashboard' | 'my-reports' | 'approvals' | 'analytics' | 'policies';
type SubView = 'list' | 'create' | 'detail';

// ── Tab config ─────────────────────────────────────────────────────────────────

const TABS: { id: ActiveTab; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    description: 'Overview & quick actions',
  },
  {
    id: 'my-reports',
    label: 'My Reports',
    icon: Receipt,
    description: 'Create and manage expense reports',
  },
  {
    id: 'approvals',
    label: 'Pending Approvals',
    icon: Clock,
    description: 'Review and approve expense reports',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Spend trends and insights',
  },
  {
    id: 'policies',
    label: 'Policies',
    icon: Shield,
    description: 'Expense policies and rules',
  },
];

// ── Breadcrumb ─────────────────────────────────────────────────────────────────

function Breadcrumb({
  tab,
  subView,
  reportId,
  onNavigate,
}: {
  tab: ActiveTab;
  subView: SubView;
  reportId: string | null;
  onNavigate: (target: 'tab' | 'list') => void;
}) {
  const currentTab = TABS.find((t) => t.id === tab);

  return (
    <nav className="flex items-center gap-2 text-sm">
      <button
        onClick={() => onNavigate('tab')}
        className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:block">Expenses</span>
      </button>
      {currentTab && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button
            onClick={() => (subView !== 'list' ? onNavigate('list') : undefined)}
            className={`font-medium transition-colors ${
              subView !== 'list'
                ? 'text-slate-400 hover:text-indigo-600'
                : 'text-slate-700 dark:text-slate-300 cursor-default'
            }`}
          >
            {currentTab.label}
          </button>
        </>
      )}
      {subView === 'create' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">New Report</span>
        </>
      )}
      {subView === 'detail' && reportId && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Report Detail</span>
        </>
      )}
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [subView, setSubView] = useState<SubView>('list');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSubView('list');
    setSelectedReportId(null);
  };

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setSubView('detail');
    if (activeTab === 'dashboard') setActiveTab('my-reports');
  };

  const handleCreateReport = () => {
    setActiveTab('my-reports');
    setSubView('create');
  };

  const handleBack = () => {
    setSubView('list');
    setSelectedReportId(null);
  };

  const handleBreadcrumbNavigate = (target: 'tab' | 'list') => {
    if (target === 'tab') {
      setActiveTab('dashboard');
      setSubView('list');
      setSelectedReportId(null);
    } else {
      setSubView('list');
      setSelectedReportId(null);
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col overflow-y-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Expense & Reimbursement
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{currentTab?.description}</p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          tab={activeTab}
          subView={subView}
          reportId={selectedReportId}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>

      {/* Tab navigation */}
      <div className="flex overflow-x-auto shrink-0 -mx-1 px-1">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {/* Dashboard tab */}
        {activeTab === 'dashboard' && subView === 'list' && (
          <ExpenseDashboard
            onCreateReport={handleCreateReport}
            onViewReport={handleViewReport}
            onViewApprovals={() => handleTabChange('approvals')}
            onViewAnalytics={() => handleTabChange('analytics')}
          />
        )}

        {/* My Reports tab */}
        {activeTab === 'my-reports' && subView === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                My Expense Reports
              </h2>
              <button
                onClick={() => setSubView('create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Receipt className="w-4 h-4" />
                New Report
              </button>
            </div>
            <ExpenseReportList onViewReport={handleViewReport} showFilters={true} />
          </div>
        )}

        {activeTab === 'my-reports' && subView === 'create' && (
          <ExpenseReportForm
            employeeId="emp-001"
            departmentId="dept-002"
            onSuccess={(report) => {
              setSelectedReportId(report.id);
              setSubView('detail');
            }}
            onCancel={handleBack}
          />
        )}

        {activeTab === 'my-reports' && subView === 'detail' && selectedReportId && (
          <ExpenseReportDetail reportId={selectedReportId} onBack={handleBack} />
        )}

        {/* Approvals tab */}
        {activeTab === 'approvals' && subView === 'list' && (
          <ExpenseApprovalQueue approverId="mgr-001" onViewReport={handleViewReport} />
        )}

        {activeTab === 'approvals' && subView === 'detail' && selectedReportId && (
          <ExpenseReportDetail
            reportId={selectedReportId}
            onBack={handleBack}
            onApprove={() => {
              handleBack();
            }}
            onReject={() => {
              handleBack();
            }}
          />
        )}

        {/* Analytics tab */}
        {activeTab === 'analytics' && <ExpenseAnalytics />}

        {/* Policies tab */}
        {activeTab === 'policies' && <ExpensePolicyManager adminView={true} />}
      </div>
    </div>
  );
}
