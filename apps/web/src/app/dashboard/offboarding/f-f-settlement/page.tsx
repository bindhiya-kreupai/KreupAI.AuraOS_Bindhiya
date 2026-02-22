"use client";

import React, { useState, useEffect } from 'react';
import {
    Calculator,
    DollarSign,
    FileText,
    Download,
    AlertTriangle,
    CheckCircle,
    Calendar,
    Briefcase,
    Loader2
} from 'lucide-react';
import { FinalSettlementService } from '../services';

interface SettlementRecord {
    id: string;
    employeeName: string;
    employeeId: string;
    lastWorkingDate: string;
    status: string;
    netPayable: number;
    totalEarnings: number;
    totalDeductions: number;
    paymentDate?: string | null;
    clearanceStatus?: string;
}

export default function FnFSettlementPage() {
    const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await FinalSettlementService.getFinalSettlements();

                const mapped: SettlementRecord[] = (data || []).map((s: any) => ({
                    id: s.id,
                    employeeName: s.employeeName || 'Unknown',
                    employeeId: s.employeeId || '',
                    lastWorkingDate: s.lastWorkingDate || s.paymentDueDate
                        ? new Date(s.lastWorkingDate || s.paymentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '',
                    status: s.status || 'pending_calculation',
                    netPayable: s.netPayable || 0,
                    totalEarnings: s.totalEarnings || 0,
                    totalDeductions: s.totalDeductions || 0,
                    paymentDate: s.paymentDate
                        ? new Date(s.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : null,
                    clearanceStatus: s.clearanceStatus || '',
                }));

                setSettlements(mapped);
            } catch (error) {
                console.error('Error fetching settlements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading settlements...</p>
                </div>
            </div>
        );
    }

    // Show the first pending/draft settlement as the "active" one, or the most recent
    const activeSettlement = settlements.find(s => s.status !== 'paid') || settlements[0];
    const recentPaid = settlements.filter(s => s.status === 'paid');

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_calculation': return 'Draft Mode';
            case 'calculated': return 'Calculated';
            case 'approved': return 'Approved';
            case 'paid': return 'Paid';
            case 'disputed': return 'Disputed';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
            case 'approved': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800';
            case 'disputed': return 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-800';
            default: return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-500" />
                        Full & Final Settlement
                    </h1>
                    <p className="text-slate-500 text-sm">Calculate and process final payouts for exiting employees.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                    <DollarSign className="w-4 h-4" /> Process New Settlement
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Settlement Details or Empty State */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        {activeSettlement ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-bold text-lg">Settlement Details</h3>
                                    <div className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(activeSettlement.status)}`}>
                                        {getStatusLabel(activeSettlement.status)}
                                    </div>
                                </div>

                                {/* Employee Info */}
                                <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                                        {activeSettlement.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{activeSettlement.employeeName}</div>
                                        <div className="text-sm text-slate-500">
                                            Last Working Day: {activeSettlement.lastWorkingDate}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notice Period Recovery</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue={0} />
                                            <span className="text-sm font-bold text-slate-400">Days</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Leave Encashment</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" defaultValue={15} />
                                            <span className="text-sm font-bold text-slate-400">Days</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Variable Pay / Bonus</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="number" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium" defaultValue={0} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Asset Damage Deduction</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="number" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium" defaultValue={0} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-slate-500">Total Earnings</span>
                                        <span className="font-medium text-emerald-600">+{formatCurrency(activeSettlement.totalEarnings)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className="text-slate-500">Total Deductions</span>
                                        <span className="font-medium text-rose-600">-{formatCurrency(activeSettlement.totalDeductions)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                        <span className="font-bold text-indigo-900 dark:text-indigo-100">Net Payable Amount</span>
                                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(activeSettlement.netPayable)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                        Generate Statement
                                    </button>
                                    <button className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Save Draft
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold mb-2">No Pending Settlements</h3>
                                <p className="text-sm text-slate-500">All settlements have been processed.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: History & Info */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-400" /> Recent Settlements
                        </h3>
                        {recentPaid.length === 0 && settlements.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-500">
                                No settlement history found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(recentPaid.length > 0 ? recentPaid : settlements).slice(0, 5).map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                                        <div>
                                            <div className="font-bold text-sm">{item.employeeName}</div>
                                            <div className="text-xs text-slate-500">{item.paymentDate || item.lastWorkingDate}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm text-emerald-600">{formatCurrency(item.netPayable)}</div>
                                            <div className="text-[10px] font-bold uppercase text-emerald-500">{getStatusLabel(item.status)}</div>
                                        </div>
                                        <Download className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="w-full mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1">
                            View All History
                        </button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm mb-1">Compliance Alert</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                    Final settlements must be processed within 45 days of the last working day as per local labor laws.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

