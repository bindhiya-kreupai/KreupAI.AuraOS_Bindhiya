'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Activity, Heart, Brain, ChevronRight, Check, Loader2 } from 'lucide-react';
import { HRAService } from '../services';

const SECTIONS = [
    { title: 'General Health', status: 'Completed', score: 85, icon: Activity, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Cardiovascular', status: 'Pending', score: null, icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
    { title: 'Mental Wellbeing', status: 'Pending', score: null, icon: Brain, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
];

export default function HRAPage() {
    const [started, setStarted] = useState(false);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await HRAService.getAssessments();
                setAssessments(data as any[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-blue-500" />
                        Health Risk Assessment
                    </h1>
                    <p className="text-slate-500 text-sm">Understand your health profile and identify potential risks.</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-sm font-medium">
                    Last Assessment: <span className="font-bold">6 months ago</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left Panel: Status */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="radial-progress text-blue-500 mx-auto mb-4" style={{ "--value": "33", "--size": "8rem" } as any}>
                            <span className="text-2xl font-bold text-slate-800 dark:text-white">33%</span>
                        </div>
                        <h2 className="text-center font-bold text-lg mb-1">Assessment Progress</h2>
                        <p className="text-center text-slate-500 text-xs mb-6">Complete all sections to get your customized report.</p>

                        <div className="space-y-3">
                            {SECTIONS.map((section, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.color}`}>
                                        <section.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{section.title}</div>
                                        <div className={`text-xs ${section.status === 'Completed' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {section.status}
                                        </div>
                                    </div>
                                    {section.status === 'Completed' ? (
                                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-blue-600 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Cardiovascular Health Check</h2>
                        <p className="text-slate-500 max-w-md mb-8">
                            This section assesses your heart health risks based on lifestyle, family history, and biometric data. It takes approximately 5 minutes.
                        </p>
                        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                            Start Section <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

