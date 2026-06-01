// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  FileText,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { ChangeRequest, ChangeRequestStatus } from '@/services/profileChangeService';
import {
  ProfileChangeService,
  CHANGE_REQUEST_STATUS_META,
  CHANGE_TYPE_META,
} from '@/services/profileChangeService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  FileText,
  Home,
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </button>
  );
}

function StatusBadge({ status }: { status: ChangeRequestStatus }) {
  const meta = CHANGE_REQUEST_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color} ${meta.bgColor}`}
    >
      {meta.label}
    </span>
  );
}

function ChangeTypeIcon({ type }: { type: string }) {
  const meta = CHANGE_TYPE_META[type as keyof typeof CHANGE_TYPE_META];
  if (!meta) return null;
  const Icon = ICON_MAP[meta.icon] ?? FileText;
  return <Icon className={`w-4 h-4 ${meta.color}`} />;
}

// ── Quick action card ─────────────────────────────────────────────────────────

const QUICK_CHANGE_TYPES = [
  {
    type: 'bank_details',
    label: 'Update Bank Details',
    icon: 'Landmark',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    type: 'current_address',
    label: 'Update Address',
    icon: 'MapPin',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    type: 'emergency_contact',
    label: 'Emergency Contact',
    icon: 'HeartPulse',
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    type: 'personal_info',
    label: 'Personal Info',
    icon: 'User',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    type: 'contact_info',
    label: 'Contact Info',
    icon: 'Phone',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    type: 'tax_declaration',
    label: 'Tax Declaration',
    icon: 'FileText',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface ProfileChangesDashboardProps {
  employeeId?: string;
  onNewRequest: (changeType?: string) => void;
  onViewRequest: (requestId: string) => void;
  onViewAll: () => void;
}

export function ProfileChangesDashboard({
  employeeId = 'emp-001',
  onNewRequest,
  onViewRequest,
  onViewAll,
}: ProfileChangesDashboardProps) {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProfileChangeService.getChangeRequests({ employeeId })
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [employeeId]);

  const pending = requests.filter(
    (r) =>
      r.status === 'pending_approval' ||
      r.status === 'pending_verification' ||
      r.status === 'submitted'
  );
  const approved = requests.filter((r) => r.status === 'approved');
  const rejected = requests.filter((r) => r.status === 'rejected');
  const recent = [...requests]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Profile Change Requests
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Submit and track changes to your profile information
          </p>
        </div>
        <button
          onClick={() => onNewRequest()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={requests.length}
          icon={TrendingUp}
          color="text-slate-700 dark:text-slate-200"
          bgColor="bg-slate-100 dark:bg-slate-800"
          onClick={onViewAll}
        />
        <StatCard
          label="Pending"
          value={pending.length}
          icon={Clock}
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
          onClick={onViewAll}
        />
        <StatCard
          label="Approved"
          value={approved.length}
          icon={CheckCircle2}
          color="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          label="Rejected"
          value={rejected.length}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Quick Change Request
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_CHANGE_TYPES.map((ct) => {
            const Icon = ICON_MAP[ct.icon] ?? FileText;
            return (
              <button
                key={ct.type}
                onClick={() => onNewRequest(ct.type)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 ${ct.bg} hover:shadow-md transition-shadow`}
              >
                <Icon className={`w-6 h-6 ${ct.color}`} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">
                  {ct.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">
              Pending Action Required
            </h3>
          </div>
          <div className="space-y-3">
            {pending.map((req) => (
              <button
                key={req.id}
                onClick={() => onViewRequest(req.id)}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <ChangeTypeIcon type={req.changeType} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {req.changeTypeName}
                    </p>
                    <p className="text-xs text-slate-500">{req.requestCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Recent Activity
          </h3>
          <button
            onClick={onViewAll}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No change requests yet</p>
            <button
              onClick={() => onNewRequest()}
              className="mt-3 text-sm text-indigo-600 hover:underline"
            >
              Submit your first request
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((req) => (
              <button
                key={req.id}
                onClick={() => onViewRequest(req.id)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-sm transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <ChangeTypeIcon type={req.changeType} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {req.changeTypeName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {req.requestCode} · {new Date(req.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
