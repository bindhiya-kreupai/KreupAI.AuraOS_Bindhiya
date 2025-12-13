"use client";

import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    XCircle,
    UserCheck,
    FileText,
    AlertCircle,
    TrendingUp,
    Filter,
    Search
} from 'lucide-react';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'reviewing';

interface BudgetApproval {
    id: string;
    title: string;
    department: string;
    amount: number;
    requestedBy: string;
    requestDate: string;
    status: ApprovalStatus;
    priority: 'high' | 'medium' | 'low';
    description: string;
}

export default function BudgetApprovalsPage() {
    const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');

    const approvals: BudgetApproval[] = [
        {
            id: 'BA-001',
            title: 'Q2 Engineering Equipment',
            department: 'Engineering',
            amount: 45000,
            requestedBy: 'Sarah Connor',
            requestDate: '2025-12-10',
            status: 'pending',
            priority: 'high',
            description: 'New development workstations and testing equipment'
        },
        {
            id: 'BA-002',
            title: 'Sales Offsite Event',
            department: 'Sales',
            amount: 12000,
            requestedBy: 'Kyle Reese',
            requestDate: '2025-12-09',
            status: 'reviewing',
            priority: 'medium',
            description: 'Annual sales team building and strategy planning'
        },
        {
            id: 'BA-003',
            title: 'Recruitment Agency Fee',
            department: 'HR',
            amount: 8500,
            requestedBy: 'John Doe',
            requestDate: '2025-12-08',
            status: 'approved',
            priority: 'medium',
            description: 'Agency fees for senior developer positions'
        },
        {
            id: 'BA-004',
            title: 'Marketing Campaign Budget',
            department: 'Marketing',
            amount: 35000,
            requestedBy: 'Jane Smith',
            requestDate: '2025-12-07',
            status: 'pending',
            priority: 'high',
            description: 'Q1 product launch marketing campaign'
        },
        {
            id: 'BA-005',
            title: 'Office Renovation',
            department: 'Operations',
            amount: 22000,
            requestedBy: 'Mike Johnson',
            requestDate: '2025-12-05',
            status: 'rejected',
            priority: 'low',
            description: 'Conference room upgrades and furniture replacement'
        }
    ];

    const filteredApprovals = filter === 'all'
        ? approvals
        : approvals.filter(a => a.status === filter);

    const getStatusIcon = (status: ApprovalStatus) => {
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

    const getStatusColor = (status: ApprovalStatus) => {
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 dark:text-red-400';
            case 'medium':
                return 'text-amber-600 dark:text-amber-400';
            default:
                return 'text-slate-600 dark:text-slate-400';
        }
    };

    const stats = [
        {
            label: 'Pending',
            value: approvals.filter(a => a.status === 'pending').length,
            icon: AlertCircle,
            color: 'text-amber-600'
        },
        {
            label: 'Under Review',
            value: approvals.filter(a => a.status === 'reviewing').length,
            icon: Clock,
            color: 'text-indigo-600'
        },
        {
            label: 'Approved',
            value: approvals.filter(a => a.status === 'approved').length,
            icon: CheckCircle2,
            color: 'text-emerald-600'
        },
        {
            label: 'Total Amount',
            value: `$${(approvals.filter(a => a.status === 'pending').reduce((sum, a) => sum + a.amount, 0) / 1000).toFixed(0)}k`,
            icon: TrendingUp,
            color: 'text-blue-600'
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
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

            {/* Filters */}
            <div className="flex gap-2 shrink-0">
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        filter === 'all'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        filter === 'pending'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        filter === 'reviewing'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('reviewing')}
                >
                    Reviewing
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        filter === 'approved'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('approved')}
                >
                    Approved
                </button>
                <button
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        filter === 'rejected'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected
                </button>
            </div>

            {/* Approvals List */}
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
                            {filteredApprovals.map((approval) => (
                                <div
                                    key={approval.id}
                                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-3 rounded-xl ${getStatusColor(approval.status)}`}>
                                                {getStatusIcon(approval.status)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg">{approval.title}</h3>
                                                    <span className={`text-xs font-bold uppercase ${getPriorityColor(approval.priority)}`}>
                                                        {approval.priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    {approval.description}
                                                </p>
                                                <div className="text-sm text-slate-500 flex flex-wrap gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <strong>ID:</strong> {approval.id}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <strong>Dept:</strong> {approval.department}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <strong>Requested by:</strong> {approval.requestedBy}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <strong>Date:</strong> {new Date(approval.requestDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="font-bold text-2xl">
                                                    ${approval.amount.toLocaleString()}
                                                </div>
                                                <div className={`text-xs font-bold uppercase ${getStatusColor(approval.status)} px-2 py-1 rounded-full inline-block mt-1`}>
                                                    {approval.status}
                                                </div>
                                            </div>

                                            {(approval.status === 'pending' || approval.status === 'reviewing') && (
                                                <div className="flex gap-2">
                                                    <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors">
                                                        Approve
                                                    </button>
                                                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                        Reject
                                                    </button>
                                                    <button className="px-4 py-2 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                        Details
                                                    </button>
                                                </div>
                                            )}

                                            {approval.status === 'approved' && (
                                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                    View Details
                                                </button>
                                            )}

                                            {approval.status === 'rejected' && (
                                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                    View Reason
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
