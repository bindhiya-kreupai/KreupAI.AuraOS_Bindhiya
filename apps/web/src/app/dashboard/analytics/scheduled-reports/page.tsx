"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarClock,
    Plus,
    MoreVertical,
    Mail,
    FileText,
    Clock,
    CheckCircle,
    PauseCircle,
    Loader2
} from 'lucide-react';

interface Schedule {
    id: string;
    name: string;
    report: string;
    recipients: string[];
    freq: string;
    status: string;
    nextRun: string;
}

export default function ScheduledReportsPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await fetch('/api/v1/analytics/reports/custom');
            const json = await res.json();
            const reports = json?.data || [];

            const scheduled = reports
                .filter((r: any) => r.isScheduled)
                .map((r: any) => ({
                    id: r.id,
                    name: r.name || r.code,
                    report: r.category || 'Custom',
                    recipients: r.scheduleConfig?.recipients || [],
                    freq: r.scheduleConfig?.frequency || 'Manual',
                    status: r.isScheduled ? 'Active' : 'Paused',
                    nextRun: r.scheduleConfig?.nextRun || '--',
                }));

            setSchedules(scheduled);
        } catch (error) {
            console.error('Error loading schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async () => {
        try {
            await fetch('/api/v1/analytics/reports/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportName: 'New Scheduled Report',
                    frequency: 'weekly',
                    recipients: [],
                }),
            });
            await fetchSchedules();
            setShowModal(false);
        } catch (error) {
            console.error('Error creating schedule:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <CalendarClock className="w-8 h-8 text-indigo-500" />
                        Scheduled Reports
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Automate report delivery to stakeholders.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> Create Schedule
                </button>
            </div>

            {schedules.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Schedule Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Report Type</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Frequency</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Recipients</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Next Run</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 dark:text-slate-100">{schedule.name}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                                <FileText className="w-4 h-4" /> {schedule.report}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                                <Clock className="w-4 h-4" /> {schedule.freq}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
                                                <Mail className="w-4 h-4" /> {schedule.recipients.length} Recipients
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {schedule.status === 'Active' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                                                    <CheckCircle className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                    <PauseCircle className="w-3 h-3" /> Paused
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-mono text-slate-500">
                                            {schedule.nextRun}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                    <CalendarClock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No scheduled reports yet. Create one to automate report delivery.</p>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-500" /> Create New Schedule
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Schedule Name</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="e.g. Weekly Executive Summary" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Report Type</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                        <option>Headcount Analysis</option>
                                        <option>Payroll Summary</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Recipients (Email)</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" placeholder="Separate with commas" />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                            <button onClick={handleCreateSchedule} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Create Schedule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

