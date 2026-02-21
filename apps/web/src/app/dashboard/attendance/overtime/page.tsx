"use client";

import React, { useState, useEffect } from 'react';
import {
    Clock,
    DollarSign,
    Calendar,
    Plus,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    FileText,
    PieChart
} from 'lucide-react';
import { OvertimeService } from '../services';

interface OTClaim {
    id: string;
    date: string;
    project: string;
    hours: number;
    multiplier: 1.5 | 2.0;
    amount: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    approver: string;
}

interface OvertimeSummary {
    totalHours: number;
    weekdayHours: number;
    weekendHours: number;
    approvedHours: number;
    totalEarnings: number;
    pendingEarnings: number;
}

export default function OvertimePage() {
    const [overtimeRecords, setOvertimeRecords] = useState<OTClaim[]>([]);
    const [summary, setSummary] = useState<OvertimeSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchOvertimeData();
    }, []);

    const fetchOvertimeData = async () => {
        try {
            const records = await OvertimeService.getOvertimeRequests();
            setOvertimeRecords((records || []) as any);
            // Calculate summary from records
            const recordsArr = (records || []) as any[];
            const approved = recordsArr.filter((r: any) => r.status === 'Approved');
            const totalHours = recordsArr.reduce((sum: number, r: any) => sum + (r.hours || 0), 0);
            setSummary({
                totalHours,
                weekdayHours: totalHours * 0.6,
                weekendHours: totalHours * 0.4,
                approvedHours: approved.reduce((sum: number, r: any) => sum + (r.hours || 0), 0),
                totalEarnings: recordsArr.reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
                pendingEarnings: recordsArr.filter((r: any) => r.status === 'Pending').reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOvertime = async (data: any) => {
        setLoading(true);
        try {
            await OvertimeService.submitOvertimeRequest({
                employeeId: 'current-user',
                date: data.date,
                overtimeMinutes: data.hours * 60,
                reason: data.reason,
            } as any);
            await fetchOvertimeData();
            setShowForm(false);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Clock className="w-6 h-6 text-celestial-indigo" />
                        Overtime Management
                    </h1>
                    <p className="text-silver-mist text-sm">Log extra hours, track approvals, and estimate payouts.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> Log Overtime
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Stats & Policy */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Est. Payout Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 opacity-90">
                                <DollarSign className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wider">Estimated Payout</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl font-bold">${summary?.pendingEarnings || 0}</span>
                                <span className="text-lg font-medium opacity-80">Pending</span>
                            </div>
                            <div className="text-xs bg-white/20 inline-flex px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> December 2024 Cycle
                            </div>
                        </div>
                    </div>

                    {/* Hours Summary */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-celestial-indigo" />
                            Hours Summary
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Total Hours Logged</span>
                                <span className="font-bold text-ink-black dark:text-pearl">{summary?.totalHours || 0} Hrs</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Weekdays (1.5x)</span>
                                <span className="font-bold text-ink-black dark:text-pearl">{summary?.weekdayHours || 0} Hrs</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Weekends (2.0x)</span>
                                <span className="font-bold text-ink-black dark:text-pearl">{summary?.weekendHours || 0} Hrs</span>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Approved</span>
                                <span className="font-bold text-emerald-600">{summary?.approvedHours || 0} Hrs</span>
                            </div>
                        </div>
                    </div>

                    {/* Policy Widget */}
                    <div className="bg-slate-50 dark:bg-deep-cosmos/50 p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-3 text-sm">Policy Rules</h3>
                        <ul className="space-y-2">
                            <li className="text-xs text-slate-500 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo mt-1.5 shrink-0"></div>
                                Weekday OT is paid at 1.5x hourly rate.
                            </li>
                            <li className="text-xs text-slate-500 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo mt-1.5 shrink-0"></div>
                                Weekend/Holiday OT is paid at 2.0x hourly rate.
                            </li>
                            <li className="text-xs text-slate-500 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-celestial-indigo mt-1.5 shrink-0"></div>
                                Minimum 1 hour required to log a claim.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: Logs */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-500" />
                                Claim History
                            </h3>
                            <button className="text-xs font-bold text-celestial-indigo hover:underline">View All</button>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-celestial-indigo border-t-transparent rounded-full mx-auto"></div>
                                <p className="mt-2 text-slate-500">Loading...</p>
                            </div>
                        ) : overtimeRecords.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <p>No overtime records found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                            {overtimeRecords.map(claim => (
                                <div key={claim.id} className="p-4 rounded-xl border border-cloud dark:border-nebula-purple/20 hover:border-celestial-indigo/30 hover:bg-slate-50 dark:hover:bg-deep-cosmos/30 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 font-bold text-xs flex flex-col items-center justify-center w-12 h-12">
                                                <span>{claim.hours}</span>
                                                <span className="text-[9px] uppercase">Hrs</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-ink-black dark:text-pearl text-sm group-hover:text-celestial-indigo transition-colors">{claim.project}</h4>
                                                <div className="text-xs text-silver-mist flex items-center gap-2 mt-0.5">
                                                    <span>{claim.date}</span>
                                                    <span>•</span>
                                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-[10px]">{claim.multiplier}x Rate</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-ink-black dark:text-pearl text-sm">${claim.amount}</div>
                                            <div className={`text-[10px] font-bold uppercase mt-1 ${claim.status === 'Approved' ? 'text-emerald-500' :
                                                    claim.status === 'Pending' ? 'text-amber-500' :
                                                        'text-rose-500'
                                                }`}>
                                                {claim.status}
                                            </div>
                                        </div>
                                    </div>

                                    {claim.status === 'Approved' && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border-t border-dashed border-cloud dark:border-nebula-purple/20 pt-2 mt-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            Approved by {claim.approver}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
