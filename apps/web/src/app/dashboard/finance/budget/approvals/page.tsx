"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Clock,
    XCircle,
    UserCheck,
    FileText,
    AlertCircle,
    TrendingUp,
    Filter,
    Search,
    Loader2
} from 'lucide-react';
import { BudgetService } from '../../services';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'reviewing';

export default function BudgetApprovalsPage() {
    const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');
    const [approvals, setApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await BudgetService.getBudgets();
                setApprovals(data);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const filteredApprovals = filter === 'all'
        ? approvals
        : approvals.filter((a: any) => a.approvalStatus === filter || a.status === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="w-5 h-5" />;
            case 'rejected':
                return <XCircle className="w-5 h-5" />;
            case 'reviewing':
                return <Clock className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'rejected':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'reviewing':
                return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
            default:
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    const pendingCount = approvals.filter((a: any) => (a.approvalStatus || a.status) === 'pending').length;
    const reviewingCount = approvals.filter((a: any) => (a.approvalStatus || a.status) === 'reviewing').length;
    const approvedCount = approvals.filter((a: any) => (a.approvalStatus || a.status) === 'approved').length;
    const pendingAmount = approvals.filter((a: any) => (a.approvalStatus || a.status) === 'pending').reduce((sum: number, a: any) => sum + (a.totalAmount || 0), 0);

    const stats = [
        { label: 'Pending', value: pendingCount, icon: AlertCircle, color: 'text-amber-600' },
        { label: 'Under Review', value: reviewingCount, icon: Clock, color: 'text-indigo-600' },
        { label: 'Approved', value: approvedCount, icon: CheckCircle2, color: 'text-emerald-600' },
        { label: 'Total Amount', value: `$${(pendingAmount / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-blue-600' }
    ];

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-indigo-500" />
                        Budget Approvals
                    </h1>
                    <p className="text-slate-500 text-sm">Review and approve department budget requests</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search requests..." className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-2 shrink-0">
                {(['all', 'pending', 'reviewing', 'approved', 'rejected'] as const).map((f) => (
                    <button
                        key={f}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredApprovals.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No approvals found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredApprovals.map((approval: any) => {
                                const status = approval.approvalStatus || approval.status || 'pending';
                                return (
                                    <div key={approval.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-3 rounded-xl ${getStatusColor(status)}`}>
                                                    {getStatusIcon(status)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg">{approval.name || approval.title || 'Budget Request'}</h3>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{approval.description || ''}</p>
                                                    <div className="text-sm text-slate-500 flex flex-wrap gap-3">
                                                        <span><strong>Dept:</strong> {approval.department || '-'}</span>
                                                        <span>•</span>
                                                        <span><strong>Period:</strong> {approval.fiscalYear || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="font-bold text-2xl">${(approval.totalAmount || 0).toLocaleString()}</div>
                                                    <div className={`text-xs font-bold uppercase ${getStatusColor(status)} px-2 py-1 rounded-full inline-block mt-1`}>
                                                        {status}
                                                    </div>
                                                </div>
                                                {(status === 'pending' || status === 'reviewing') && (
                                                    <div className="flex gap-2">
                                                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors">Approve</button>
                                                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Reject</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

