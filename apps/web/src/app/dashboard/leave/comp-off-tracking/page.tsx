"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    PlusCircle,
    CalendarCheck,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { CompOffService } from '../services';
import type { CompOff } from '../types';

export default function CompOffTrackingPage() {
    const [compOffs, setCompOffs] = useState<CompOff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompOffs();
    }, []);

    const fetchCompOffs = async () => {
        try {
            setLoading(true);
            const result = await CompOffService.getCompOffs();
            setCompOffs(result);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Compute summary stats from compOffs data
    const summaryStats = useMemo(() => {
        const available = compOffs
            .filter(c => c.status === 'approved' && !c.isAvailed && !c.isExpired)
            .reduce((sum, c) => sum + (c.compOffDays ?? 0), 0);
        const expiringSoon = compOffs
            .filter(c => {
                if (c.status !== 'approved' || c.isAvailed || c.isExpired) return false;
                const expiry = new Date(c.expiryDate);
                const now = new Date();
                const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            })
            .reduce((sum, c) => sum + (c.compOffDays ?? 0), 0);
        const utilized = compOffs
            .filter(c => c.isAvailed)
            .reduce((sum, c) => sum + (c.compOffDays ?? 0), 0);

        return [
            { days: `${available} Days`, status: 'Available', color: 'bg-emerald-500', note: 'Can be used anytime' },
            { days: `${expiringSoon} Days`, status: 'Expiring Soon', color: 'bg-amber-500', note: 'Expires within 30 days' },
            { days: `${utilized} Days`, status: 'Utilized (YTD)', color: 'bg-indigo-500', note: 'Total claimed' },
        ];
    }, [compOffs]);

    const pendingClaims = useMemo(() => {
        return compOffs.filter(c => c.status === 'pending_approval');
    }, [compOffs]);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Comp-off Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Grant compensatory off for work done on holidays/weekends.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Grant Comp-off
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading comp-off data...
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {summaryStats.map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10 rounded-full opacity-10 ${stat.color}`}></div>
                                <h3 className="text-3xl font-bold mb-1">{stat.days}</h3>
                                <div className="text-sm font-bold text-slate-500 uppercase mb-2">{stat.status}</div>
                                <p className="text-xs text-slate-400">{stat.note}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Pending Claims</h3>
                        <div className="space-y-4">
                            {pendingClaims.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    No pending comp-off claims.
                                </div>
                            ) : pendingClaims.map((claim, i) => {
                                const workedDate = new Date(claim.workedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                                return (
                                    <div key={claim.id || i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <div className="font-bold text-lg">{claim.employeeName}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <CalendarCheck className="w-3 h-3" /> Worked on {workedDate} &bull; {claim.hoursWorked} Hours &bull; {claim.compOffDays} Day(s)
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 italic">&quot;{claim.workedReason}&quot;</div>
                                        </div>
                                        <div className="flex gap-2 mt-4 md:mt-0">
                                            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-bold">Reject</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

