"use client";

import React, { useState, useEffect } from 'react';
import {
    Scale,
    Wallet,
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Eye,
    Plus,
    Download,
    RefreshCw,
    Search,
    FileCheck,
    Clock,
    Loader2
} from 'lucide-react';
import { PettyCashService } from '../../services';

type ReconciliationStatus = 'all' | 'balanced' | 'variance' | 'pending';

interface Reconciliation {
    id: string;
    date: string;
    reconciledBy: string;
    openingBalance: number;
    totalDisbursements: number;
    totalReplenishments: number;
    expectedBalance: number;
    actualBalance: number;
    variance: number;
    variancePercent: number;
    status: 'balanced' | 'variance' | 'pending';
    notes?: string;
    disbursementCount: number;
    replenishmentCount: number;
}

export default function ReconciliationPage() {
    const [filter, setFilter] = useState<ReconciliationStatus>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await PettyCashService.getReconciliations();
                setReconciliations(data as any[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const [reconciliations, setReconciliations] = useState<any[]>([]);

    const filteredReconciliations = filter === 'all'
        ? reconciliations
        : reconciliations.filter(r => r.status === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'balanced':
                return <CheckCircle className="w-4 h-4" />;
            case 'variance':
                return <AlertTriangle className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            default:
                return <XCircle className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'balanced':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'variance':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'pending':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
        }
    };

    const totalReconciliations = reconciliations.length;
    const balancedCount = reconciliations.filter(r => r.status === 'balanced').length;
    const varianceCount = reconciliations.filter(r => r.status === 'variance').length;
    const totalVariance = reconciliations.reduce((sum, r) => sum + Math.abs(r.variance), 0);
    const avgBalance = reconciliations.reduce((sum, r) => sum + r.actualBalance, 0) / reconciliations.length;

    const stats = [
        {
            label: 'Current Float Balance',
            value: `$${reconciliations[0]?.actualBalance.toFixed(2) || '0.00'}`,
            icon: Wallet,
            color: 'text-emerald-600',
            subtext: 'As of last reconciliation'
        },
        {
            label: 'Balanced Reconciliations',
            value: `${((balancedCount / totalReconciliations) * 100).toFixed(0)}%`,
            icon: CheckCircle,
            color: 'text-blue-600',
            subtext: `${balancedCount} of ${totalReconciliations}`
        },
        {
            label: 'Total Variance',
            value: `$${totalVariance.toFixed(2)}`,
            icon: AlertTriangle,
            color: varianceCount > 0 ? 'text-amber-600' : 'text-emerald-600',
            subtext: `${varianceCount} discrepancies`
        },
        {
            label: 'Average Float',
            value: `$${avgBalance.toFixed(2)}`,
            icon: TrendingUp,
            color: 'text-indigo-600',
            subtext: 'Last 10 periods'
        }
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-500" />
                        Float Reconciliation
                    </h1>
                    <p className="text-slate-500 text-sm">Track and reconcile petty cash float balances</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                        <Plus className="w-4 h-4" /> New Reconciliation
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
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
                        placeholder="Search reconciliations..."
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
                            filter === 'balanced'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('balanced')}
                    >
                        Balanced
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                            filter === 'variance'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setFilter('variance')}
                    >
                        With Variance
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
                </div>
            </div>

            {/* Reconciliation Table */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredReconciliations.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No reconciliations found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Reconciled By</th>
                                        <th className="p-4">Opening Balance</th>
                                        <th className="p-4">Disbursements</th>
                                        <th className="p-4">Replenishments</th>
                                        <th className="p-4">Expected Balance</th>
                                        <th className="p-4">Actual Balance</th>
                                        <th className="p-4">Variance</th>
                                        <th className="p-4">Transactions</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredReconciliations.map((recon) => {
                                        return (
                                            <tr
                                                key={recon.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                    recon.status === 'variance' ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''
                                                }`}
                                            >
                                                <td className="p-4 font-mono text-xs text-slate-500">{recon.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        <span className="font-medium">
                                                            {new Date(recon.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">{recon.reconciledBy}</td>
                                                <td className="p-4 font-mono">${recon.openingBalance.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-red-600 dark:text-red-400">
                                                            -${recon.totalDisbursements.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {recon.disbursementCount} items
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                                            +${recon.totalReplenishments.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {recon.replenishmentCount} items
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono font-bold">${recon.expectedBalance.toFixed(2)}</td>
                                                <td className="p-4 font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                                    ${recon.actualBalance.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    {recon.variance === 0 ? (
                                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span className="font-mono text-sm">$0.00</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <div className={`flex items-center gap-1 ${
                                                                recon.variance > 0
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {recon.variance > 0 ? (
                                                                    <TrendingUp className="w-4 h-4" />
                                                                ) : (
                                                                    <TrendingDown className="w-4 h-4" />
                                                                )}
                                                                <span className="font-mono font-bold">
                                                                    {recon.variance > 0 ? '+' : ''}${recon.variance.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-slate-500">
                                                                {recon.variancePercent > 0 ? '+' : ''}{recon.variancePercent.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                                                            <TrendingDown className="w-3 h-3" />
                                                            <span>{recon.disbursementCount}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs font-bold">
                                                            <TrendingUp className="w-3 h-3" />
                                                            <span>{recon.replenishmentCount}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(recon.status)} w-fit`}>
                                                        {getStatusIcon(recon.status)}
                                                        <span>{recon.status}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4 text-slate-500" />
                                                        </button>
                                                        {recon.status === 'variance' && (
                                                            <button
                                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                                title="Investigate"
                                                            >
                                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                            </button>
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

            {/* Notes Section */}
            {filteredReconciliations.some(r => r.notes) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shrink-0">
                    <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <FileCheck className="w-4 h-4" />
                        Recent Notes
                    </h3>
                    <div className="space-y-2">
                        {filteredReconciliations
                            .filter(r => r.notes)
                            .slice(0, 3)
                            .map(r => (
                                <div key={r.id} className="text-sm text-blue-800 dark:text-blue-300">
                                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{r.id}</span>
                                    {' - '}
                                    <span>{r.notes}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

