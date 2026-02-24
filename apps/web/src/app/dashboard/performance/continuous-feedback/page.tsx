"use client";

import React, { useState, useEffect } from 'react';
import { ReviewCycleService } from '../core/services';
import {
    Settings,
    List,
    Plus,
    Calendar,
    Users,
    HelpCircle,
    ToggleLeft,
    ToggleRight,
    Save,
    Loader2
} from 'lucide-react';

export default function FeedbackConfigPage() {
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await ReviewCycleService.getCycles();
                setCycles(data);
            } catch (error) {
                console.error('Failed to load feedback config:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-500" />
                        Feedback 360 Configuration
                    </h1>
                    <p className="text-slate-500 text-sm">Setup review cycles, question banks, and anonymity rules.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Save className="w-4 h-4" /> Save Configuration
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20 overflow-y-auto">
                {/* Cycle Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" /> Cycle Settings
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Review Frequency</label>
                            <select className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none">
                                <option>Quarterly</option>
                                <option>Bi-Annual</option>
                                <option>Annual</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                                <input type="date" className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                                <input type="date" className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                                <div className="text-sm font-bold">Allow Self-Review</div>
                                <div className="text-xs text-slate-500">Employees review themselves first</div>
                            </div>
                            <ToggleRight className="w-8 h-8 text-emerald-500 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* Question Bank */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-indigo-500" /> Question Bank
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Question
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(cycles.length > 0 && cycles[0].questions?.length > 0
                            ? cycles[0].questions.map((q: any) => ({ q: q.text || q.question || q, type: q.type || 'Text' }))
                            : [
                                { q: 'No questions configured yet', type: 'Info' },
                            ]
                        ).map((item: any, i: number) => (
                            <div key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                <div className="text-sm font-bold mb-1">{item.q}</div>
                                <div className="text-[10px] text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded w-fit">{item.type}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Participants */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Participants
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-4 border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl text-center cursor-pointer hover:shadow-md transition-all">
                            <div className="text-3xl font-black text-indigo-600 mb-1">All</div>
                            <div className="text-sm font-bold text-indigo-800 dark:text-indigo-300">Company-Wide</div>
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:shadow-md transition-all hover:border-indigo-200">
                            <div className="text-3xl font-black text-slate-700 dark:text-slate-300 mb-1">Dept</div>
                            <div className="text-sm font-bold text-slate-500">Specific Departments</div>
                        </div>
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:shadow-md transition-all hover:border-indigo-200">
                            <div className="text-3xl font-black text-slate-700 dark:text-slate-300 mb-1">Custom</div>
                            <div className="text-sm font-bold text-slate-500">Select Employees</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

