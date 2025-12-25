"use client";

import React, { useState, useEffect } from 'react';
import {
    Clock,
    PlusCircle,
    CalendarCheck,
    CheckCircle
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
            if (result.length > 0) {
                setCompOffs(result);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { days: '5 Days', status: 'Available', color: 'bg-emerald-500', note: 'Can be used anytime' },
                    { days: '2 Days', status: 'Expiring Soon', color: 'bg-amber-500', note: 'Expires Dec 31' },
                    { days: '12 Days', status: 'Utilized (YTD)', color: 'bg-indigo-500', note: 'Total claimed' },
                ].map((stat, i) => (
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
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">
                            Loading comp-off claims...
                        </div>
                    ) : (compOffs.filter(c => c.status === 'pending').length > 0 ? compOffs.filter(c => c.status === 'pending') : [
                        { id: '1', employeeId: 'E005', employeeName: 'Sarah Lee', workedDate: '2024-10-27', reason: 'Urgent Client Deployment', hoursWorked: 8, status: 'pending' as const, daysEarned: 1 },
                        { id: '2', employeeId: 'E006', employeeName: 'Tom Hardy', workedDate: '2024-10-26', reason: 'Server Maintenance', hoursWorked: 6, status: 'pending' as const, daysEarned: 0.75 },
                    ] as CompOff[]).map((claim, i) => {
                        const workedDate = new Date(claim.workedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                        return (
                            <div key={claim.id || i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-bold text-lg">{claim.employeeName}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <CalendarCheck className="w-3 h-3" /> Worked on {workedDate} • {claim.hoursWorked} Hours
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 italic">&quot;{claim.reason}&quot;</div>
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
        </div>
    );
}
