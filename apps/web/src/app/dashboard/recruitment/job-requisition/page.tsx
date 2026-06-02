'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUpRight,
  MapPin,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import { JobRequisitionService } from '../services';
import type { JobRequisition as RecruitmentJobRequisition } from '../types';

function getStatusLabel(status: RecruitmentJobRequisition['status'] | string): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'pending_approval':
      return 'Pending Approval';
    case 'draft':
      return 'Draft';
    case 'on_hold':
      return 'Frozen';
    case 'filled':
    case 'cancelled':
    case 'rejected':
      return 'Closed';
    default:
      return String(status || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}

function getPriorityLabel(priority: RecruitmentJobRequisition['priority'] | string): string {
  return String(priority || 'medium').replace(/\b\w/g, (character) => character.toUpperCase());
}

function getDisplayType(req: RecruitmentJobRequisition): string {
  return String(req.jobType || 'full_time').replace(/_/g, ' ');
}

function getDisplaySalary(req: RecruitmentJobRequisition): string {
  if (!req.salaryRange) return 'Not specified';
  if (typeof req.salaryRange === 'string') return req.salaryRange;
  if (req.salaryRange.min && req.salaryRange.max) {
    const currency = req.salaryRange.currency || 'USD';
    return `${currency} ${req.salaryRange.min.toLocaleString()} - ${req.salaryRange.max.toLocaleString()}`;
  }
  return 'Not specified';
}

export default function JobRequisitionsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [requisitions, setRequisitions] = useState<RecruitmentJobRequisition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const data = await JobRequisitionService.getRequisitions();
      setRequisitions(data);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Pending Approval':
      case 'Pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'Frozen':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Closed':
        return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="w-3 h-3 text-rose-500" />;
      case 'Medium':
        return <div className="w-2 h-2 rounded-full bg-amber-500" />;
      case 'Low':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      default:
        return null;
    }
  };

  const getDisplayTitle = (req: RecruitmentJobRequisition) => req.jobTitle || 'Untitled';
  const getDisplayManager = (req: RecruitmentJobRequisition) => req.hiringManagerName || 'Unknown';

  const filteredRequisitions =
    filterStatus === 'All'
      ? requisitions
      : requisitions.filter((requisition) =>
          getStatusLabel(requisition.status).toLowerCase().includes(filterStatus.toLowerCase())
        );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-silver-mist font-medium">Loading requisitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-celestial-indigo" />
            Job Requisitions
          </h1>
          <p className="text-silver-mist text-sm">
            Manage hiring requests, approvals, and candidate pipelines.
          </p>
        </div>
        <button
          onClick={async () => {
            const title = prompt('Position title:');
            if (!title?.trim()) return;
            const department = prompt('Department:', '');
            const positionsRaw = prompt('Number of positions:', '1');
            const positions = Math.max(1, Number(positionsRaw) || 1);
            const justification = prompt('Justification / reason:', '');
            try {
              const { JobRequisitionService } = await import('../services');
              await JobRequisitionService.createRequisition({
                title,
                department: department || undefined,
                numberOfPositions: positions,
                justification: justification || undefined,
                status: 'pending',
              } as any);
              alert(`Requisition for "${title}" created. The list will refresh.`);
              (window as any).location?.reload?.();
            } catch (e: any) {
              alert(`Could not create requisition: ${e?.message || e}`);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
        >
          <Plus className="w-4 h-4" /> Create Requisition
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="text-silver-mist text-xs font-bold uppercase">Total Open Roles</div>
          <div className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">
            {requisitions.filter((requisition) => requisition.status === 'open').length}
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="text-silver-mist text-xs font-bold uppercase">Pending Approval</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {requisitions.filter((requisition) => requisition.status === 'pending_approval').length}
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="text-silver-mist text-xs font-bold uppercase">Total Requisitions</div>
          <div className="text-2xl font-bold text-celestial-indigo mt-1">{requisitions.length}</div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="text-silver-mist text-xs font-bold uppercase">Closed</div>
          <div className="text-2xl font-bold text-emerald-500 mt-1">
            {
              requisitions.filter((requisition) =>
                ['filled', 'cancelled', 'rejected'].includes(requisition.status)
              ).length
            }
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white dark:bg-stellar-blue p-2 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search by title, department, or ID..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {['All', 'Open', 'Pending', 'Draft', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-celestial-indigo text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
          <button className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-celestial-indigo">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredRequisitions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
            No requisitions found
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Create your first job requisition to get started.
          </p>
        </div>
      )}

      {/* Requisition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
        {filteredRequisitions.map((req) => (
          <div
            key={req.id}
            className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="p-5">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors cursor-pointer">
                      {getDisplayTitle(req)}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {getPriorityIcon(getPriorityLabel(req.priority))}{' '}
                      {getPriorityLabel(req.priority)}
                    </div>
                  </div>
                  <div className="text-xs text-silver-mist flex items-center gap-2">
                    <span>{req.id.substring(0, 8)}</span>
                    <span>•</span>
                    <span>{req.departmentName}</span>
                    <span>•</span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${getStatusColor(getStatusLabel(req.status))} font-bold`}
                    >
                      {getStatusLabel(req.status)}
                    </span>
                  </div>
                </div>
                <button className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-silver-mist" />
                  {req.locationName || 'Not specified'}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <DollarSign className="w-4 h-4 text-silver-mist" />
                  {getDisplaySalary(req)}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-silver-mist" />
                  {getDisplayType(req)}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users className="w-4 h-4 text-silver-mist" />
                  Requested by: {getDisplayManager(req)}
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-slate-50 dark:bg-deep-cosmos/50 rounded-xl p-3 flex items-center justify-center gap-2 text-sm text-silver-mist border border-cloud dark:border-nebula-purple/20">
                {req.status === 'open' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Positions:{' '}
                    {req.numberOfPositions || 1}
                  </>
                )}
                {req.status === 'pending_approval' && (
                  <>
                    <Clock className="w-4 h-4" /> Awaiting Approval
                  </>
                )}
                {req.status === 'draft' && (
                  <>
                    <Briefcase className="w-4 h-4" /> Draft - Resume Editing
                  </>
                )}
                {['filled', 'cancelled', 'rejected'].includes(req.status) && (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Closed
                  </>
                )}
                {!['open', 'pending_approval', 'draft', 'filled', 'cancelled', 'rejected'].includes(
                  req.status
                ) && <>{getStatusLabel(req.status)}</>}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-cloud dark:border-nebula-purple/20 p-3 flex justify-between items-center bg-slate-50/50 dark:bg-deep-cosmos/30 rounded-b-2xl">
              <div className="text-xs text-silver-mist flex items-center gap-1">
                {req.requestedDate && (
                  <>
                    <Calendar className="w-3 h-3" /> Requested{' '}
                    {new Date(req.requestedDate).toLocaleDateString()}
                  </>
                )}
                {!req.requestedDate && 'No date'}
              </div>
              <button className="text-xs font-bold text-celestial-indigo hover:underline flex items-center gap-1">
                View Details <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
