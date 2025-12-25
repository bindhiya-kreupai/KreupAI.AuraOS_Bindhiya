"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    Video,
    Check
} from 'lucide-react';
import { interviewScheduling } from '@/lib/services/ai-automation-client';

export default function InterviewSchedulingPage() {
    const [slots, setSlots] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await interviewScheduling.getSchedules();
            if (result.success) {
                setSchedules(result.data?.schedules || []);
                setSlots(result.data?.suggestedSlots || []);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (slotData: any) => {
        setLoading(true);
        try {
            await interviewScheduling.scheduleInterview(slotData);
            await fetchData();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-indigo-500" />
                        Smart Scheduler
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">AI-optimized interview slots based on interviewer availability and focus time.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Context Panel */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">Candidate</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                EC
                            </div>
                            <div>
                                <div className="font-bold text-ink-black dark:text-pearl">Emily Chen</div>
                                <div className="text-xs text-indigo-500">Senior React Developer</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">Interviewers</h3>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-stellar-blue bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                    I{i}
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-stellar-blue bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                                +2
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">Format</h3>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Video className="w-4 h-4 text-slate-400" /> Google Meet (45 min)
                        </div>
                    </div>
                </div>

                {/* 2. Slot Picker */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Recommended Slots (Tomorrow)</h2>

                    <div className="space-y-3">
                        {slots.map((slot, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${slot.available
                                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800 cursor-pointer'
                                    : 'border-slate-100 bg-slate-50 opacity-60 dark:bg-slate-800/50 dark:border-slate-700 cursor-not-allowed'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${slot.available ? 'bg-white text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-200 text-slate-500'}`}>
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-ink-black dark:text-pearl">{slot.time}</div>
                                        <div className={`text-xs ${slot.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                            {slot.available ? `AI Score: ${slot.score}/100` : 'Unavailable'}
                                        </div>
                                    </div>
                                </div>

                                {slot.available ? (
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded dark:bg-emerald-900/30 dark:text-emerald-400">
                                            {slot.reason}
                                        </span>
                                        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm">
                                            Book
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-500 italic px-4">
                                        {slot.reason}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button className="text-indigo-600 font-bold text-sm hover:underline">
                            View Full Calendar
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
