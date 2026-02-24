"use client";

import React, { useState, useEffect } from 'react';
import {
    HeartPulse,
    Calendar,
    Stethoscope,
    FileText,
    Loader2
} from 'lucide-react';
import { HealthCheckupService } from '../services';
import type { HealthCheckup } from '../services';

export default function HealthCheckupsPage() {
    const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await HealthCheckupService.getAll();
                setCheckups(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <HeartPulse className="w-6 h-6 text-rose-500" />
                        Health Checkups
                    </h1>
                    <p className="text-slate-500 text-sm">Schedule your annual checkups and view reports.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Book Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Upcoming */}
                <div className="lg:col-span-1 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Next Appointment
                    </h3>
                    {checkups.length > 0 && checkups[0].status !== 'Completed' ? (
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-2xl">{checkups[0].type}</span>
                                <span className="text-xs font-bold bg-white text-rose-600 px-2 py-0.5 rounded">CONFIRMED</span>
                            </div>
                            <div className="text-lg font-bold mb-1">{checkups[0].date}</div>
                            <div className="text-sm opacity-90">{checkups[0].clinic} - {checkups[0].doctor}</div>
                        </div>
                    ) : (
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20 text-center">
                            <p className="text-sm opacity-90">No upcoming appointments scheduled.</p>
                        </div>
                    )}
                    <p className="text-sm opacity-80 mb-6">Please fast for 12 hours prior to any blood work appointments.</p>

                    <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-white text-rose-600 rounded-lg font-bold text-sm">Reschedule</button>
                        <button className="flex-1 py-2 bg-rose-700 text-white rounded-lg font-bold text-sm">Details</button>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg">Checkup History</h3>
                    {checkups.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                            No checkup records found.
                        </div>
                    ) : (
                        checkups.filter(c => c.status === 'Completed').map((app, i) => (
                            <div key={app.id || i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Stethoscope className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{app.type}</h4>
                                        <div className="text-xs text-slate-500">{app.date} • {app.clinic}</div>
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                    <FileText className="w-3 h-3" /> View Report
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

