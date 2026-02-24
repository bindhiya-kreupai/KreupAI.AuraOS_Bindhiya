"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Hourglass,
    CheckCircle2,
    Calendar,
    Clock
} from 'lucide-react';
import { ProbationService } from '../services';

function formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getDaysRemaining(endDate: Date | string | undefined): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'ongoing': return 'Ongoing';
        case 'extended': return 'Extended';
        case 'confirmed': return 'Confirmed';
        case 'terminated': return 'Terminated';
        default: return status || 'Unknown';
    }
}

export default function ProbationTrackingPage() {
    const [probationRecords, setProbationRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProbationRecords();
    }, []);

    const fetchProbationRecords = async () => {
        try {
            setLoading(true);
            const data = await ProbationService.getAllProbationRecords();
            setProbationRecords(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter to show active probation records (ongoing or extended)
    const activeRecords = useMemo(() => {
        return probationRecords.filter(r => r.status === 'ongoing' || r.status === 'extended');
    }, [probationRecords]);

    const handleAction = async (recordId: string, action: string) => {
        alert(`${action} initiated for employee. This action requires API integration for confirmation/extension workflows.`);
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Hourglass className="w-6 h-6 text-amber-500" />
                        Probation Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor probation periods and initiate confirmation workflows.</p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {!loading && probationRecords.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Hourglass className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No probation records found</p>
                    <p className="text-sm">Probation records will appear here once employees are added.</p>
                </div>
            )}

            {!loading && probationRecords.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeRecords.map((record) => {
                        const employeeName = record.employeeName || 'Unknown Employee';
                        const department = record.department || 'N/A';
                        const effectiveEndDate = record.extendedEndDate || record.probationEndDate;
                        const daysLeft = getDaysRemaining(effectiveEndDate);
                        const startDate = formatDate(record.probationStartDate);
                        const endDate = formatDate(effectiveEndDate);
                        const statusLabel = getStatusLabel(record.status);
                        const lastReview = record.reviews?.length > 0
                            ? record.reviews[record.reviews.length - 1]
                            : null;
                        const reviewStatus = lastReview
                            ? `Review: ${lastReview.performance?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Pending'}`
                            : 'No Reviews';

                        return (
                            <div key={record.recordId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                                            <img src={`https://i.pravatar.cc/150?u=${employeeName}`} alt={employeeName} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{employeeName}</h3>
                                            <div className="text-xs text-slate-500">{department}</div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold
                                        ${daysLeft <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}
                                    `}>
                                        {daysLeft} Days Left
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</span>
                                        <span className="font-bold">{startDate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> End Date</span>
                                        <span className="font-bold">{endDate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Status</span>
                                        <span className="font-bold text-amber-600">{statusLabel}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Review</span>
                                        <span className="font-bold text-slate-600 dark:text-slate-400">{reviewStatus}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(record.recordId, 'Confirm')}
                                        className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => handleAction(record.recordId, 'Extend')}
                                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
                                    >
                                        Extend
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {activeRecords.length === 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-slate-400">
                            <CheckCircle2 className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm">All probations have been resolved.</p>
                        </div>
                    )}

                    {activeRecords.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-slate-400">
                            <CheckCircle2 className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm">All other probations are on track.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

