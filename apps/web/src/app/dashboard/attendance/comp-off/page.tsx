"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarPlus,
    Clock,
    CheckCircle2,
    Calendar,
    AlertCircle,
    Plus,
    History,
    FileText,
    Briefcase,
    Hourglass
} from 'lucide-react';
import { CompOffService } from '../services';

interface CompOffRequest {
    id: string;
    workDate: string;
    workHours: number;
    reason: string;
    status: string;
    expiryDate?: string;
    balance: number;
    used: number;
}

interface CompOffSummary {
    total: number;
    earned: number;
    used: number;
    pending: number;
    expiring: number;
}

export default function CompOffPage() {
    const [compOffs, setCompOffs] = useState<CompOffRequest[]>([]);
    const [summary, setSummary] = useState<CompOffSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompOffs();
    }, []);

    const fetchCompOffs = async () => {
        try {
            setLoading(true);
            const result = await CompOffService.getCompOffs();
            setCompOffs((result || []) as any);
            const summaryData = await CompOffService.getCompOffSummary('current-user-id');
            if (summaryData) {
                setSummary({
                    total: summaryData.balance || 0,
                    earned: summaryData.totalEarned || 0,
                    used: summaryData.totalUsed || 0,
                    pending: 0,
                    expiring: 0
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const availableCreditDays = summary?.total || 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <CalendarPlus className="w-6 h-6 text-celestial-indigo" />
                        Comp-off Applications
                    </h1>
                    <p className="text-silver-mist text-sm">Claim leave credit for extra hours worked on holidays/weekends.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> New Claim
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Wallet & Policy */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Credit Wallet */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 opacity-90">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wider">Available Balance</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-bold">{availableCreditDays}</span>
                                <span className="text-lg font-medium opacity-80">Days</span>
                            </div>
                            <div className="text-xs bg-white/20 inline-flex px-3 py-1 rounded-full backdrop-blur-sm">
                                Valid for 60 days from approval
                            </div>
                        </div>
                    </div>

                    {/* Policy Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            Policy Highlights
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Minimum <strong>4 hours</strong> of work required to claim half-day credit.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Full-day credit requires minimum <strong>8 hours</strong> logged.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Claims must be submitted within <strong>3 days</strong> of work.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 items-start">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Approvals required from: <strong>Reporting Manager</strong>.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: History & Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-500" />
                                Recent Claims
                            </h3>
                            <button className="text-xs font-bold text-celestial-indigo hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400">Loading...</div>
                            ) : compOffs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No comp-off records found</div>
                            ) : compOffs.map(claim => (
                                <div key={claim.id} className="p-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-ink-black dark:text-pearl">{claim.workDate}</span>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${claim.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                    claim.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-rose-100 text-rose-600'
                                                }`}>
                                                {claim.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-ink-black dark:text-pearl">{claim.workHours} Hours</div>
                                            <div className="text-xs text-silver-mist">
                                                {claim.workHours >= 8 ? 'Full Day Credit' : 'Half Day Credit'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 text-xs text-slate-600 dark:text-slate-300 mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3 h-3 text-silver-mist" />
                                            {claim.reason}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 text-silver-mist" />
                                            Balance: {claim.balance} days
                                        </div>
                                    </div>

                                    {claim.status === 'APPROVED' && claim.expiryDate && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-medium bg-rose-50 dark:bg-rose-900/10 inline-flex px-2 py-0.5 rounded">
                                            <Hourglass className="w-3 h-3" />
                                            Expires on {claim.expiryDate}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
