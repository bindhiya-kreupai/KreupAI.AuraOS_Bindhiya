"use client";

import React, { useState, useEffect } from 'react';
import {
    Receipt,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Filter,
    Search,
    ChevronRight,
    MoreHorizontal,
    FileText,
    Loader2
} from 'lucide-react';
import { MobileApprovalsService } from '../services';

export default function ExpenseClaimsPage() {
    const [statusFilter, setStatusFilter] = useState('All');
    const [approvals, setApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await MobileApprovalsService.getAllApprovals();
                setApprovals(data as any[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const claims = [
        { id: 1, employee: 'Alice Johnson', avatar: 'AJ', category: 'travel', description: 'Flight to NYC Conference', amount: 450.00, date: '2024-03-15', status: 'Pending', attachment: true },
        { id: 2, employee: 'Bob Smith', avatar: 'BS', category: 'food', description: 'Client Dinner', amount: 125.50, date: '2024-03-14', status: 'Approved', attachment: true },
        { id: 3, employee: 'Charlie Brown', avatar: 'CB', category: 'supplies', description: 'Office Monitor', amount: 299.99, date: '2024-03-12', status: 'Rejected', attachment: false },
        { id: 4, employee: 'Diana Prince', avatar: 'DP', category: 'travel', description: 'Uber rides for client visit', amount: 45.20, date: '2024-03-10', status: 'Pending', attachment: true },
        { id: 5, employee: 'Evan Wright', avatar: 'EW', category: 'food', description: 'Team Lunch', amount: 85.00, date: '2024-03-08', status: 'Approved', attachment: true },
        { id: 6, employee: 'Alice Johnson', avatar: 'AJ', category: 'internet', description: 'Monthly Internet Bill', amount: 60.00, date: '2024-03-01', status: 'Approved', attachment: true },
    ];

    const stats = [
        { label: 'Total Claimed', value: '$12,450', subtext: 'This Month', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Pending Approval', value: '14', subtext: 'Claims waiting', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Auto-Approved', value: '45%', subtext: 'Based on policy', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Rejection Rate', value: '5.2%', subtext: 'Policy violations', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    ];

    const filteredClaims = statusFilter === 'All'
        ? claims
        : claims.filter(c => c.status === statusFilter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    const getCategoryIcon = (category: string) => {
        // Simple mapping, could be more elaborate
        return <Receipt className="w-4 h-4 text-slate-500" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-500" />
                        Expense Claims
                    </h1>
                    <p className="text-slate-500 text-sm">Review and manage employee expense reimbursement requests.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none">
                        Policy Settings
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                            <div className="text-xs text-slate-400 mt-1">{stat.subtext}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employees or descriptions..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Pending', 'Approved', 'Rejected'].map(state => (
                            <button
                                key={state}
                                onClick={() => setStatusFilter(state)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === state
                                        ? 'bg-slate-900 text-white dark:bg-indigo-500'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {state}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Employee</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Description</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Category</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Amount</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredClaims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                {claim.avatar}
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{claim.employee}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span>{claim.description}</span>
                                            {claim.attachment && <FileText className="w-3.5 h-3.5 text-slate-400" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 capitalize">
                                            {claim.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{claim.date}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                        ${claim.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {claim.status === 'Pending' && (
                                                <>
                                                    <button className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded text-emerald-600 dark:text-emerald-400 transition-colors" title="Approve">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded text-rose-600 dark:text-rose-400 transition-colors" title="Reject">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 transition-colors" title="View Details">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div>Showing 1-6 of 6 results</div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

