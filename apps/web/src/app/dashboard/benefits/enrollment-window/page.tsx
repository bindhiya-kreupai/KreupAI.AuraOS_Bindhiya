"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarDays,
    Clock,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { EnrollmentWindowService } from '../services';

export default function EnrollmentWindowPage() {
    const [windows, setWindows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWindows();
    }, []);

    const fetchWindows = async () => {
        try {
            setLoading(true);
            const data = await EnrollmentWindowService.getWindows();
            setWindows(data);
        } catch (error) {
            console.error('Error fetching enrollment windows:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-indigo-500" />
                        Enrollment Windows
                    </h1>
                    <p className="text-slate-500 text-sm">Manage open enrollment periods and special signup windows.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Window */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">Active Now</span>
                            <span className="flex items-center gap-1 text-indigo-100 text-sm">
                                <Clock className="w-4 h-4" /> Ends in 12 Days
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Annual Open Enrollment 2025</h2>
                        <p className="text-indigo-100 mb-8 max-w-lg">
                            Employees created before Dec 1st are eligible to modify their Health, Dental, and Vision plans.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <span className="block text-indigo-200 text-xs font-bold uppercase mb-1">Start Date</span>
                                <span className="text-xl font-bold">Nov 15, 2024</span>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                <span className="block text-indigo-200 text-xs font-bold uppercase mb-1">End Date</span>
                                <span className="text-xl font-bold">Dec 15, 2024</span>
                            </div>
                        </div>

                        <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
                            <div className="bg-white h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold mt-2 text-indigo-100">
                            <span>65% Employees Enrolled</span>
                            <span>Target: 100%</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming/Past */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-center h-[180px]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">New Hire Window (Monthly)</h3>
                            <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded uppercase">Recurring</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Auto-opens for 30 days starting from the Date of Joining for any new employee.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> Always Active
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-center h-[180px] opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">Mid-Year Adjustment 2024</h3>
                            <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs font-bold rounded uppercase">Closed</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Special window for life event adjustments only.
                        </p>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <span>Jun 01 - Jun 15</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
