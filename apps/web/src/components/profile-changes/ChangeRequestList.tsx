'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  FileText,
  Home,
  ChevronRight,
  SlidersHorizontal,
  X,
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

function TypeIcon({ changeType }: { changeType: string }) {
  const meta = CHANGE_TYPE_META[changeType as ChangeType];
  if (!meta) return <FileText className="w-4 h-4 text-slate-400" />;
  const Icon = ICON_MAP[meta.icon] ?? FileText;
  return <Icon className={`w-4 h-4 ${meta.color}`} />;
}

// ── Filter bar ────────────────────────────────────────────────────────────────

interface FilterState {
  search: string;
  status: ChangeRequestStatus | '';
  changeType: ChangeType | '';
}

const STATUS_OPTIONS: { value: ChangeRequestStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS: { value: ChangeType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'bank_details', label: 'Bank Details' },
  { value: 'permanent_address', label: 'Permanent Address' },
  { value: 'current_address', label: 'Current Address' },
  { value: 'emergency_contact', label: 'Emergency Contact' },
  { value: 'personal_info', label: 'Personal Info' },
  { value: 'contact_info', label: 'Contact Info' },
  { value: 'tax_declaration', label: 'Tax Declaration' },
];

// ── Row component ─────────────────────────────────────────────────────────────

function RequestRow({ request, onView }: { request: ChangeRequest; onView: (id: string) => void }) {
  return (
    <button
      onClick={() => onView(request.id)}
      className="w-full flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      {/* Type icon */}
      <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
        <TypeIcon changeType={request.changeType} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {request.changeTypeName}
          </span>
          <StatusBadge status={request.status} />
          {request.priority === 'urgent' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20">
              Urgent
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
          <span>{request.requestCode}</span>
          <span className="hidden sm:block">·</span>
          <span className="hidden sm:block">{request.employeeName}</span>
          <span>·</span>
          <span>{new Date(request.createdDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Effective date */}
      {request.effectiveDate && (
        <div className="hidden md:block text-right">
          <p className="text-xs text-slate-500">Effective</p>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {new Date(request.effectiveDate).toLocaleDateString()}
          </p>
        </div>
      )}

      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ChangeRequestListProps {
  employeeId?: string;
  showEmployeeColumn?: boolean;
  onViewRequest: (id: string) => void;
  onNewRequest?: () => void;
}

export function ChangeRequestList({
  employeeId,
  _showEmployeeColumn = false,
  onViewRequest,
  onNewRequest,
}: ChangeRequestListProps) {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({ search: '', status: '', changeType: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    ProfileChangeService.getChangeRequests(employeeId ? { employeeId } : undefined)
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [employeeId]);

  const filtered = requests.filter((r) => {
    const matchSearch =
      !filters.search ||
      r.changeTypeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.requestCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.employeeName.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = !filters.status || r.status === filters.status;
    const matchType = !filters.changeType || r.changeType === filters.changeType;
    return matchSearch && matchStatus && matchType;
  });

  const activeFilters = [filters.status, filters.changeType].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ search: '', status: '', changeType: '' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[180px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search requests..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`inline-flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${
            showFilters || activeFilters > 0
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>

        {onNewRequest && (
          <button
            onClick={onNewRequest}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            New Request
          </button>
        )}
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center gap-3">
          <select
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value as ChangeRequestStatus | '' }))
            }
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.changeType}
            onChange={(e) =>
              setFilters((f) => ({ ...f, changeType: e.target.value as ChangeType | '' }))
            }
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Count */}
      <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {filtered.length}
          </span>{' '}
          of <span className="font-semibold">{requests.length}</span> requests
        </p>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-8 h-8 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No requests found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((request) => (
            <RequestRow key={request.id} request={request} onView={onViewRequest} />
          ))}
        </div>
      )}
    </div>
  );
}
