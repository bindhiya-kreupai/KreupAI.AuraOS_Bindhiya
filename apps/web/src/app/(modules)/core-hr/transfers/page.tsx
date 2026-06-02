'use client';

import React from 'react';
import { Globe, Filter, Plus, ArrowRightLeft, TrendingUp, Search, MoreHorizontal, ChevronRight, Building2 } from 'lucide-react';
import { cn } from '@aura/ui/utils';
import { InterCompanyTransferService } from '@/app/dashboard/core-hr/services';
import type { InterCompanyTransfer } from '@/app/dashboard/core-hr/types';
import { format } from 'date-fns';

export default function GlobalTransfersPage() {
    const [transfers, setTransfers] = React.useState<InterCompanyTransfer[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadTransfers() {
            const data = await InterCompanyTransferService.getAllTransfers();
            setTransfers(data);
            setIsLoading(false);
        }
        loadTransfers();
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-emerald-600 bg-emerald-50';
            case 'pending': return 'text-amber-600 bg-amber-50';
            case 'approved': return 'text-blue-600 bg-blue-50';
            case 'in_progress': return 'text-indigo-600 bg-indigo-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1">
                        <Globe className="w-4 h-4" /> Multi-Entity Support
                    </div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Global Transfers</h1>
                    <p className="text-silver-mist text-sm">Manage and track employee movements across legal entities and jurisdictions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-cloud dark:border-nebula-purple/30 rounded-xl bg-white dark:bg-stellar-blue text-sm font-semibold hover:shadow-md transition-all">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
                        <Plus className="w-4 h-4" /> Initiate Transfer
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-silver-mist uppercase tracking-wider">Active Transfers</span>
                    </div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl">12</div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">▲ 4 from last month</p>
                </div>
                <div className="p-4 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-silver-mist uppercase tracking-wider">Historical Total</span>
                    </div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl">148</div>
                    <p className="text-[10px] text-silver-mist font-bold mt-1">Across 4 jurisdictions</p>
                </div>
                <div className="p-4 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-silver-mist uppercase tracking-wider">Target Entity Growth</span>
                    </div>
                    <div className="text-2xl font-bold text-ink-black dark:text-pearl">KSA (Riyadh)</div>
                    <p className="text-[10px] text-silver-mist font-bold mt-1">Highest net-inflow entity</p>
                </div>
            </div>

            {/* Search & List */}
            <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                        <input
                            type="text"
                            placeholder="Search by employee name or transfer ID..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="px-6 py-4 text-xs font-bold text-silver-mist uppercase tracking-widest">Employee & Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-silver-mist uppercase tracking-widest text-center">Transfer Route</th>
                                <th className="px-6 py-4 text-xs font-bold text-silver-mist uppercase tracking-widest text-center">Target Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-silver-mist uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-silver-mist uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-2" /><div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 dark:bg-stellar-blue rounded w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : transfers.map((transfer) => (
                                <tr key={transfer.transferId} className="hover:bg-slate-50/50 dark:hover:bg-indigo-900/5 transition-colors group">
                                    <td className="px-6 py-4 text-ink-black dark:text-pearl">
                                        <div className="font-bold">{transfer.employeeName}</div>
                                        <div className="text-xs font-medium text-silver-mist uppercase tracking-tighter">{transfer.transferType}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-silver-mist uppercase">{transfer.fromCompanyName}</div>
                                            </div>
                                            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{transfer.toCompanyName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-semibold">{format(new Date(transfer.effectiveDate), 'MMM dd, yyyy')}</div>
                                        <div className="text-[10px] font-medium text-silver-mist">{transfer.transferId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5", getStatusStyles(transfer.status))}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {transfer.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group-hover:text-indigo-600">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-cloud dark:border-nebula-purple/20 bg-slate-50/30 dark:bg-slate-900/30 text-center">
                    <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                        View All Historical Transfers <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
