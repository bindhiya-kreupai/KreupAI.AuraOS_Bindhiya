'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Receipt,
  Coffee,
  Car,
  ShoppingBag,
  Utensils,
  Package,
  FileText,
  Plus,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { PettyCashService, exportToCsv } from '../../services';
import { ToastContainer, useToast } from '../../components/Toast';

type DisbursementStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'reimbursed';
type DisbursementCategory =
  | 'office-supplies'
  | 'travel'
  | 'meals'
  | 'utilities'
  | 'maintenance'
  | 'misc';

interface Disbursement {
  id: string;
  date: string;
  requestedBy: string;
  department: string;
  category: DisbursementCategory;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  approvedBy?: string;
  approvalDate?: string;
  hasReceipt: boolean;
  receiptNumber?: string;
  notes?: string;
}

export default function DisbursementsPage() {
  const [filter, setFilter] = useState<DisbursementStatus>('all');
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await PettyCashService.getTransactions();
        setDisbursements(data as any[]);
      } catch (error: any) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [disbursements, setDisbursements] = useState<any[]>([]);

  const filteredDisbursements =
    filter === 'all' ? disbursements : disbursements.filter((d) => d.status === filter);

  const handleExport = () => {
    if (filteredDisbursements.length === 0) {
      showToast('info', 'Nothing to export.');
      return;
    }
    exportToCsv(
      'petty-cash-disbursements',
      filteredDisbursements.map((d) => ({
        id: d.id,
        date: d.date,
        requestedBy: d.requestedBy,
        department: d.department,
        category: d.category,
        description: d.description,
        amount: d.amount,
        status: d.status,
        hasReceipt: d.hasReceipt,
        receiptNumber: d.receiptNumber,
        approvedBy: d.approvedBy,
        approvalDate: d.approvalDate,
      }))
    );
    showToast('success', 'Export started.');
  };

  const getCategoryIcon = (category: DisbursementCategory) => {
    switch (category) {
      case 'office-supplies':
        return <Package className="w-4 h-4" />;
      case 'travel':
        return <Car className="w-4 h-4" />;
      case 'meals':
        return <Utensils className="w-4 h-4" />;
      case 'utilities':
        return <Coffee className="w-4 h-4" />;
      case 'maintenance':
        return <ShoppingBag className="w-4 h-4" />;
      case 'misc':
        return <FileText className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: DisbursementCategory) => {
    switch (category) {
      case 'office-supplies':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'travel':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'meals':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'utilities':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'maintenance':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'misc':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'reimbursed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'approved':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'reimbursed':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const totalDisbursed = disbursements
    .filter((d) => d.status === 'reimbursed')
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingAmount = disbursements
    .filter((d) => d.status === 'pending' || d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingCount = disbursements.filter((d) => d.status === 'pending').length;
  const totalAmount = disbursements.reduce((sum, d) => sum + d.amount, 0);
  const withReceipts = disbursements.filter((d) => d.hasReceipt).length;

  const stats = [
    {
      label: 'Total Disbursed',
      value: `$${totalDisbursed.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      subtext: 'This period',
    },
    {
      label: 'Pending Approval',
      value: `$${pendingAmount.toFixed(2)}`,
      icon: Clock,
      color: 'text-amber-600',
      subtext: `${pendingCount} requests`,
    },
    {
      label: 'Total Requests',
      value: disbursements.length,
      icon: Receipt,
      color: 'text-blue-600',
      subtext: `$${totalAmount.toFixed(2)} total`,
    },
    {
      label: 'Receipts Submitted',
      value: `${((withReceipts / disbursements.length) * 100).toFixed(0)}%`,
      icon: FileText,
      color: 'text-indigo-600',
      subtext: `${withReceipts} of ${disbursements.length}`,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-500" />
            Petty Cash Disbursements
          </h1>
          <p className="text-slate-500 text-sm">
            Track and manage small cash disbursements and reimbursements
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
            <Plus className="w-4 h-4" /> New Disbursement
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by requester, description, or receipt number..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'approved'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'reimbursed'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('reimbursed')}
          >
            Reimbursed
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              filter === 'rejected'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Disbursements Table */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {filteredDisbursements.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No disbursements found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Requester</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Receipt</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Approved By</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDisbursements.map((disbursement) => {
                    return (
                      <tr
                        key={disbursement.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4 font-mono text-xs text-slate-500">{disbursement.id}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {new Date(disbursement.date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{disbursement.requestedBy}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {disbursement.department}
                        </td>
                        <td className="p-4">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold uppercase ${getCategoryColor(disbursement.category)} w-fit`}
                          >
                            {getCategoryIcon(disbursement.category)}
                            <span>{disbursement.category.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <div className="font-medium">{disbursement.description}</div>
                            {disbursement.notes && (
                              <div className="text-xs text-slate-500 mt-1">
                                {disbursement.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-lg">
                          ${disbursement.amount.toFixed(2)}
                        </td>
                        <td className="p-4">
                          {disbursement.hasReceipt ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-bold">Yes</span>
                              </div>
                              {disbursement.receiptNumber && (
                                <span className="text-xs text-slate-500 font-mono">
                                  {disbursement.receiptNumber}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs font-bold">No</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(disbursement.status)} w-fit`}
                          >
                            {getStatusIcon(disbursement.status)}
                            <span>{disbursement.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {disbursement.approvedBy ? (
                            <div className="flex flex-col">
                              <span className="text-sm">{disbursement.approvedBy}</span>
                              {disbursement.approvalDate && (
                                <span className="text-xs text-slate-500">
                                  {new Date(disbursement.approvalDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-slate-500" />
                            </button>
                            {disbursement.status === 'pending' && (
                              <>
                                <button
                                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4 text-blue-500" />
                                </button>
                                <button
                                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
