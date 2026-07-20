'use client';

import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  LayoutGrid,
  PlusCircle,
  List,
  CheckSquare,
  Shield,
  Home,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { ProfileChangesDashboard } from '@/components/profile-changes/ProfileChangesDashboard';
import { ChangeRequestForm } from '@/components/profile-changes/ChangeRequestForm';
import { ChangeRequestList } from '@/components/profile-changes/ChangeRequestList';
import { ChangeRequestDetail } from '@/components/profile-changes/ChangeRequestDetail';
import { ChangeApprovalQueue } from '@/components/profile-changes/ChangeApprovalQueue';
import { ChangeVerificationPanel } from '@/components/profile-changes/ChangeVerificationPanel';
import { ProfileChangeService } from '@/services/profileChangeService';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveTab = 'dashboard' | 'my-requests' | 'approvals' | 'verification';
type SubView = 'list' | 'create' | 'detail' | 'verify';

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    description: 'Overview of your change requests',
  },
  {
    id: 'my-requests',
    label: 'My Requests',
    icon: List,
    description: 'All your change request history',
  },
  {
    id: 'approvals',
    label: 'Pending Approvals',
    icon: CheckSquare,
    description: 'Change requests awaiting your approval',
  },
  {
    id: 'verification',
    label: 'Verification',
    icon: Shield,
    description: 'Document verification for pending changes',
  },
];

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({
  tab,
  subView,
  onNavigate,
}: {
  tab: ActiveTab;
  subView: SubView;
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
        <span className="hidden sm:block">Profile Changes</span>
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
          <span className="text-slate-700 dark:text-slate-300 font-medium">New Request</span>
        </>
      )}
      {subView === 'detail' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Request Detail</span>
        </>
      )}
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfileChangesPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [subView, setSubView] = useState<SubView>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [initialChangeType, setInitialChangeType] = useState<string | undefined>(undefined);
  const [verificationIds, setVerificationIds] = useState<string[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const employeeId = user?.employeeId ?? '';

  useEffect(() => {
    if (activeTab !== 'verification' || !employeeId) return;
    let active = true;
    setVerificationLoading(true);
    ProfileChangeService.getChangeRequests({ employeeId, status: 'pending_verification' })
      .then((rows) => {
        if (active) setVerificationIds((rows ?? []).map((r) => r.id));
      })
      .catch(() => {
        if (active) setVerificationIds([]);
      })
      .finally(() => {
        if (active) setVerificationLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeTab, employeeId]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSubView('list');
    setSelectedRequestId(null);
    setInitialChangeType(undefined);
  };

  const handleNewRequest = (changeType?: string) => {
    setActiveTab('my-requests');
    setSubView('create');
    setInitialChangeType(changeType);
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setSubView('detail');
    if (activeTab === 'dashboard') setActiveTab('my-requests');
  };

  const handleBack = () => {
    setSubView('list');
    setSelectedRequestId(null);
    setInitialChangeType(undefined);
  };

  const handleBreadcrumbNavigate = (target: 'tab' | 'list') => {
    if (target === 'tab') {
      setActiveTab('dashboard');
      setSubView('list');
      setSelectedRequestId(null);
      setInitialChangeType(undefined);
    } else {
      setSubView('list');
      setSelectedRequestId(null);
      setInitialChangeType(undefined);
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col overflow-y-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              <FileEdit className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Profile Change Requests
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{currentTab?.description}</p>
            </div>
          </div>
        </div>
        <Breadcrumb tab={activeTab} subView={subView} onNavigate={handleBreadcrumbNavigate} />
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
          <ProfileChangesDashboard
            employeeId={employeeId}
            onNewRequest={handleNewRequest}
            onViewRequest={handleViewRequest}
            onViewAll={() => handleTabChange('my-requests')}
          />
        )}

        {/* My Requests - list */}
        {activeTab === 'my-requests' && subView === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                My Change Requests
              </h2>
              <button
                onClick={() => setSubView('create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                New Request
              </button>
            </div>
            <ChangeRequestList
              employeeId={employeeId}
              onViewRequest={handleViewRequest}
              onNewRequest={() => setSubView('create')}
            />
          </div>
        )}

        {/* My Requests - create */}
        {activeTab === 'my-requests' && subView === 'create' && (
          <ChangeRequestForm
            employeeId={employeeId}
            initialChangeType={initialChangeType}
            onSuccess={() => {
              setSubView('list');
              setInitialChangeType(undefined);
            }}
            onCancel={handleBack}
          />
        )}

        {/* My Requests - detail */}
        {activeTab === 'my-requests' && subView === 'detail' && selectedRequestId && (
          <ChangeRequestDetail
            requestId={selectedRequestId}
            onBack={handleBack}
            canApprove={false}
          />
        )}

        {/* Approvals tab */}
        {activeTab === 'approvals' && subView === 'list' && (
          <ChangeApprovalQueue approverId={employeeId} onViewDetail={handleViewRequest} />
        )}

        {activeTab === 'approvals' && subView === 'detail' && selectedRequestId && (
          <ChangeRequestDetail
            requestId={selectedRequestId}
            onBack={handleBack}
            canApprove={true}
            onApprove={handleBack}
            onReject={handleBack}
          />
        )}

        {/* Verification tab */}
        {activeTab === 'verification' && subView === 'list' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Document Verification
            </h2>
            {verificationLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : verificationIds.length > 0 ? (
              verificationIds.map((id) => (
                <ChangeVerificationPanel key={id} changeRequestId={id} isAdminView={false} />
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-400">
                No change requests currently awaiting document verification.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
