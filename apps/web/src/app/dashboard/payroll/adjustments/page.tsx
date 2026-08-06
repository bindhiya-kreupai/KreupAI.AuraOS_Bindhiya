'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { AdjustmentService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import type { PayrollAdjustment, AdjustmentApprovalStatus, AdjustmentType } from '../types';

type SortField = 'createdAt' | 'amount' | 'employeeId' | 'payrollMonth';
type SortDir = 'asc' | 'desc';

type NewAdjustmentForm = {
  employeeId: string;
  payrollMonth: string;
  adjustmentType: AdjustmentType;
  code: string;
  name: string;
  amount: string;
  reason: string;
  category: string;
};

const STATUS_CONFIG: Record<
  AdjustmentApprovalStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    icon: FileText,
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  HR_APPROVED: {
    label: 'HR Approved',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Check,
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    icon: Ban,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-500 dark:text-slate-500',
    border: 'border-slate-200 dark:border-slate-700',
    icon: X,
  },
};

const TABS: string[] = ['ALL', 'PENDING', 'HR_APPROVED', 'APPROVED', 'REJECTED', 'CANCELLED'];

const emptyForm: NewAdjustmentForm = {
  employeeId: '',
  payrollMonth: new Date().toISOString().slice(0, 7),
  adjustmentType: 'EARNING',
  code: '',
  name: '',
  amount: '',
  reason: '',
  category: '',
};

export default function PayrollAdjustmentsPage() {
  const { toasts, removeToast, success, error: toastError } = useToast();

  const [adjustments, setAdjustments] = useState<PayrollAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary?: { totalEarnings: number; totalDeductions: number; pendingCount: number };
  }>({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [creating, setCreating] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<NewAdjustmentForm>({ ...emptyForm });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    id: string | null;
    action: 'cancel' | 'delete' | null;
  }>({
    open: false,
    id: null,
    action: null,
  });

  useEffect(() => {
    fetchAdjustments();
  }, [currentPage, activeTab, monthFilter, typeFilter]);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 15,
      };
      if (activeTab && activeTab !== 'ALL') params.approvalStatus = activeTab;
      if (monthFilter) params.payrollMonth = monthFilter;
      if (typeFilter) params.adjustmentType = typeFilter;

      const result = await AdjustmentService.getAdjustments(params);
      setAdjustments(result.data);
      setMeta(result.meta);
    } catch (e: any) {
      toastError(e?.message || 'Failed to load payroll adjustments.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...adjustments];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.employeeId.toLowerCase().includes(q) ||
          (a.employeeName || '').toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortField === 'createdAt') {
        av = a.createdAt || '';
        bv = b.createdAt || '';
      } else if (sortField === 'amount') {
        av = Number(a.amount) || 0;
        bv = Number(b.amount) || 0;
      } else if (sortField === 'employeeId') {
        av = a.employeeId || '';
        bv = b.employeeId || '';
      } else if (sortField === 'payrollMonth') {
        av = a.payrollMonth || '';
        bv = b.payrollMonth || '';
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [adjustments, searchQuery, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleCreate = async () => {
    if (!createForm.employeeId.trim() || !createForm.amount || !createForm.reason.trim()) {
      toastError('Employee ID, amount, and reason are required.');
      return;
    }
    setCreating(true);
    try {
      if (editingId) {
        await AdjustmentService.updateAdjustment(editingId, {
          employeeId: createForm.employeeId,
          payrollMonth: createForm.payrollMonth,
          adjustmentType: createForm.adjustmentType,
          code: createForm.code,
          name: createForm.name,
          amount: Number(createForm.amount),
          reason: createForm.reason,
          category: createForm.category || undefined,
        });
        success('Adjustment updated successfully.');
      } else {
        await AdjustmentService.createAdjustment({
          employeeId: createForm.employeeId,
          payrollMonth: createForm.payrollMonth,
          adjustmentType: createForm.adjustmentType,
          code: createForm.code,
          name: createForm.name,
          amount: Number(createForm.amount),
          reason: createForm.reason,
          category: createForm.category || undefined,
        });
        success('Adjustment created successfully.');
      }
      setShowCreateForm(false);
      setEditingId(null);
      setCreateForm({ ...emptyForm });
      fetchAdjustments();
    } catch (e: any) {
      toastError(e?.message || 'Failed to save adjustment.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (adj: PayrollAdjustment) => {
    setEditingId(adj.id);
    setCreateForm({
      employeeId: adj.employeeId,
      payrollMonth: adj.payrollMonth,
      adjustmentType: adj.adjustmentType,
      code: adj.code || '',
      name: adj.name || '',
      amount: String(Number(adj.amount) || ''),
      reason: adj.reason || '',
      category: adj.category || '',
    });
    setShowCreateForm(true);
  };

  const handleSubmit = async (id: string) => {
    setApprovingId(id);
    try {
      await AdjustmentService.submitAdjustment(id);
      success('Adjustment submitted for approval.');
      fetchAdjustments();
    } catch (e: any) {
      toastError(e?.message || 'Failed to submit adjustment.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmAction.id) return;
    setApprovingId(confirmAction.id);
    try {
      await AdjustmentService.deleteAdjustment(confirmAction.id);
      success('Adjustment deleted.');
      setConfirmAction({ open: false, id: null, action: null });
      fetchAdjustments();
    } catch (e: any) {
      toastError(e?.message || 'Failed to delete adjustment.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await AdjustmentService.approveAdjustment(id);
      success('Adjustment approved.');
      fetchAdjustments();
    } catch (e: any) {
      toastError(e?.message || 'Failed to approve adjustment.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id || !rejectReason.trim()) {
      toastError('Rejection reason is required.');
      return;
    }
    setApprovingId(rejectModal.id);
    try {
      await AdjustmentService.rejectAdjustment(rejectModal.id, rejectReason);
      success('Adjustment rejected.');
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      fetchAdjustments();
    } catch (e: any) {
      toastError(e?.message || 'Failed to reject adjustment.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleCancel = async () => {
    if (!confirmAction.id) return;
    const { id, action } = confirmAction;
    setApprovingId(id);
    try {
      if (action === 'delete') {
        await AdjustmentService.deleteAdjustment(id);
        success('Adjustment deleted.');
      } else {
        await AdjustmentService.cancelAdjustment(id);
        success('Adjustment cancelled.');
      }
      setConfirmAction({ open: false, id: null, action: null });
      fetchAdjustments();
    } catch (e: any) {
      toastError(e?.message || 'Failed to update adjustment.');
    } finally {
      setApprovingId(null);
    }
  };

  const totalEarnings = adjustments
    .filter((a) => a.adjustmentType === 'EARNING')
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  const totalDeductions = adjustments
    .filter((a) => a.adjustmentType === 'DEDUCTION')
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  const pendingCount = adjustments.filter((a) => a.approvalStatus === 'PENDING').length;

  // Prefer server-computed summary (across the whole filtered result set) over
  // client-side sums that only cover the current page.
  const summary = meta.summary;
  const statEarnings = summary?.totalEarnings ?? totalEarnings;
  const statDeductions = summary?.totalDeductions ?? totalDeductions;
  const statPending = summary?.pendingCount ?? pendingCount;

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-3 h-3 inline-block ml-1 ${
        sortField === field ? 'text-indigo-500' : 'text-slate-400'
      }`}
    />
  );

  if (loading && adjustments.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading adjustments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Payroll Adjustments
          </h1>
          <p className="text-slate-500 text-sm">
            Off-cycle earnings and deductions management and approval workflow.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Adjustment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            +${statEarnings.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Deductions</span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            -${statDeductions.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{statPending}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Records</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">{meta.total}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : STATUS_CONFIG[tab]?.label || tab}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="EARNING">Earning</option>
              <option value="DEDUCTION">Deduction</option>
            </select>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider">
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                  onClick={() => handleSort('employeeId')}
                >
                  Employee <SortIcon field="employeeId" />
                </th>
                <th className="py-3 px-4 hidden md:table-cell">Type</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                  onClick={() => handleSort('amount')}
                >
                  Amount <SortIcon field="amount" />
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none hidden lg:table-cell"
                  onClick={() => handleSort('payrollMonth')}
                >
                  Month <SortIcon field="payrollMonth" />
                </th>
                <th className="py-3 px-4 hidden xl:table-cell">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 mb-1" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    </td>
                    <td className="py-3.5 px-4 hidden xl:table-cell">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-sm text-slate-500">
                      No payroll adjustments found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting filters or create a new adjustment.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((adj) => {
                  const sc = STATUS_CONFIG[adj.approvalStatus] || STATUS_CONFIG.DRAFT;
                  const StatusIcon = sc.icon;
                  const actions = adj.actions || [];
                  const has = (a: string) => actions.includes(a);
                  const isWorking = approvingId === adj.id;

                  return (
                    <tr
                      key={adj.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {adj.employeeId}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {adj.employeeName || adj.code}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            adj.adjustmentType === 'EARNING'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {adj.adjustmentType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm">
                        <span
                          className={
                            adj.adjustmentType === 'EARNING' ? 'text-emerald-600' : 'text-rose-600'
                          }
                        >
                          {adj.adjustmentType === 'EARNING' ? '+' : '-'}$
                          {Number(adj.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {adj.payrollMonth}
                        </div>
                      </td>
                      <td
                        className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate hidden xl:table-cell"
                        title={adj.reason}
                      >
                        {adj.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {has('edit') && (
                            <button
                              disabled={isWorking}
                              onClick={() => openEdit(adj)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              Edit
                            </button>
                          )}
                          {has('submit') && (
                            <button
                              disabled={isWorking}
                              onClick={() => handleSubmit(adj.id)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              {isWorking ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Submit
                            </button>
                          )}
                          {(has('approveHR') || has('approveFinance')) && (
                            <button
                              disabled={isWorking}
                              onClick={() => handleApprove(adj.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              {isWorking ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              {has('approveFinance') ? 'Approve Fin' : 'Approve'}
                            </button>
                          )}
                          {has('reject') && (
                            <button
                              disabled={isWorking}
                              onClick={() => setRejectModal({ open: true, id: adj.id })}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              Reject
                            </button>
                          )}
                          {has('cancel') && (
                            <button
                              disabled={isWorking}
                              onClick={() =>
                                setConfirmAction({
                                  open: true,
                                  id: adj.id,
                                  action: 'cancel',
                                })
                              }
                              className="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          )}
                          {has('delete') && (
                            <button
                              disabled={isWorking}
                              onClick={() =>
                                setConfirmAction({
                                  open: true,
                                  id: adj.id,
                                  action: 'delete',
                                })
                              }
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          )}
                          {actions.length === 0 && (
                            <span className="text-[11px] text-slate-400 italic">No action</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} records)
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
                let pageNum: number;
                if (meta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage >= meta.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" /> New Payroll Adjustment
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm overflow-y-auto">
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Employee ID *</span>
                <input
                  value={createForm.employeeId}
                  onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">
                  Payroll Month *
                </span>
                <input
                  type="month"
                  value={createForm.payrollMonth}
                  onChange={(e) => setCreateForm({ ...createForm, payrollMonth: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">
                  Adjustment Type *
                </span>
                <select
                  value={createForm.adjustmentType}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      adjustmentType: e.target.value as AdjustmentType,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <option value="EARNING">EARNING (+)</option>
                  <option value="DEDUCTION">DEDUCTION (-)</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Amount *</span>
                <input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Code</span>
                <input
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Name</span>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Category</span>
                <input
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-xs font-medium text-slate-500 mb-1">Reason *</span>
                <textarea
                  rows={3}
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 resize-none"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                {creating ? 'Creating...' : 'Create Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold flex items-center gap-2 text-rose-600">
                <Ban className="w-4 h-4" /> Reject Adjustment
              </h3>
              <button
                onClick={() => {
                  setRejectModal({ open: false, id: null });
                  setRejectReason('');
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">
                  Rejection Reason *
                </span>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this adjustment is rejected..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 resize-none text-sm"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setRejectModal({ open: false, id: null });
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={approvingId !== null || !rejectReason.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-60"
              >
                {approvingId && <Loader2 className="w-4 h-4 animate-spin" />}
                {approvingId ? 'Rejecting...' : 'Reject Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Cancel Adjustment
              </h3>
              <button
                onClick={() => setConfirmAction({ open: false, id: null, action: null })}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to cancel this adjustment? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setConfirmAction({ open: false, id: null, action: null })}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Keep
              </button>
              <button
                onClick={handleCancel}
                disabled={approvingId !== null}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60"
              >
                {approvingId && <Loader2 className="w-4 h-4 animate-spin" />}
                {approvingId ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
