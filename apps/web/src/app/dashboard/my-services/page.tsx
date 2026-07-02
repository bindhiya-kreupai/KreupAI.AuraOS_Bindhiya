'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Ticket, FileEdit, FileText } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { GrievanceService, RequestCenterService, DocumentService } from './services';
import { ProfileChangeService } from '@/services/profileChangeService';

interface Summary {
  openGrievances: number;
  openRequests: number;
  pendingChanges: number;
  documents: number;
}

const FEATURES = [
  'Personal Info Update',
  'Leave Application',
  'Payslip Access',
  'Tax Declaration',
  'Tax Documents',
  'Benefits Enrollment',
  'Attendance View',
  'Team Directory',
  'Request Center',
  'My Documents',
  'Life Events',
  'Dependents',
  'Career Interests',
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {loading ? '—' : value}
        </div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function EssPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [summary, setSummary] = useState<Summary>({
    openGrievances: 0,
    openRequests: 0,
    pendingChanges: 0,
    documents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    let active = true;

    const countArray = (res: any): number => {
      if (Array.isArray(res?.data)) return res.data.length;
      if (Array.isArray(res)) return res.length;
      if (typeof res?.pagination?.total === 'number') return res.pagination.total;
      return 0;
    };

    (async () => {
      setLoading(true);
      const [grievances, requests, changes, docs] = await Promise.allSettled([
        GrievanceService.getGrievances({ status: 'OPEN' }),
        RequestCenterService.getRequests({ status: 'OPEN' }),
        ProfileChangeService.getChangeRequests({
          employeeId: user.employeeId,
          status: 'pending_approval',
        }),
        DocumentService.getDocuments({ employeeId: user.employeeId }),
      ]);

      if (!active) return;
      setSummary({
        openGrievances: grievances.status === 'fulfilled' ? countArray(grievances.value) : 0,
        openRequests: requests.status === 'fulfilled' ? countArray(requests.value) : 0,
        pendingChanges:
          changes.status === 'fulfilled' && Array.isArray(changes.value) ? changes.value.length : 0,
        documents: docs.status === 'fulfilled' ? countArray(docs.value) : 0,
      });
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ShieldAlert}
          label="Open Grievances"
          value={summary.openGrievances}
          color="bg-rose-50 text-rose-500 dark:bg-rose-900/20"
          loading={loading}
        />
        <StatCard
          icon={Ticket}
          label="Open Requests"
          value={summary.openRequests}
          color="bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20"
          loading={loading}
        />
        <StatCard
          icon={FileEdit}
          label="Pending Profile Changes"
          value={summary.pendingChanges}
          color="bg-amber-50 text-amber-500 dark:bg-amber-900/20"
          loading={loading}
        />
        <StatCard
          icon={FileText}
          label="My Documents"
          value={summary.documents}
          color="bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20"
          loading={loading}
        />
      </div>

      <ModuleGrid
        title="Employee Self-Service"
        description="Manage your requests, documents, and personal information."
        features={FEATURES}
        basePath="/dashboard/my-services"
      />
    </div>
  );
}
