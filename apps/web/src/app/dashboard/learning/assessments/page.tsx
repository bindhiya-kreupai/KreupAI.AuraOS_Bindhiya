"use client";

import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck,
    CheckSquare,
    Trophy,
    Timer,
    AlertCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { AssessmentService } from '../services';

export default function AssessmentPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await AssessmentService.getAssessments();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-purple-500" />
                        Assessments & Quizzes
                    </h1>
                    <p className="text-slate-500 text-sm">Test your knowledge and earn certifications.</p>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-bold border border-purple-100 dark:border-purple-800/30">
                    <Trophy className="w-4 h-4" /> {data.length} Assessments
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <ClipboardCheck className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No assessments available</p>
                    <p className="text-sm">Assessments will appear here once created.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                    <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                        <h3 className="font-bold text-lg mb-2">Pending Assessments</h3>
                        {data.map((t, i) => (
                            <div key={t.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-sky-50 text-sky-500 dark:bg-opacity-10">
                                    <ClipboardCheck className="w-8 h-8" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t.title}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-bold text-slate-500">
                                        {t.timeLimit && <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {t.timeLimit}m</span>}
                                        <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {Array.isArray(t.questions) ? t.questions.length : 0} Qs</span>
                                        <span className="flex items-center gap-1">Pass: {t.passingScore}%</span>
                                    </div>
                                </div>
                                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                    Start Test <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Timer className="w-5 h-5 text-indigo-500" /> Assessment Info
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="text-sm text-slate-500">Total assessments</div>
                                    <div className="font-bold">{data.length}</div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="text-sm text-slate-500">Published</div>
                                    <div className="font-bold">{data.filter((a) => a.isPublished).length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

