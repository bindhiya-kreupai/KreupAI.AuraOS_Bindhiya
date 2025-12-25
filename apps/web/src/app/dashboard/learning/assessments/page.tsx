"use client";

import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck,
    CheckSquare,
    Trophy,
    Timer,
    AlertCircle,
    ArrowRight
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
            } catch {
                                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-purple-500" />
                        Assessments & Quizzes
                    </h1>
                    <p className="text-slate-500 text-sm">Test your knowledge and earn certifications.</p>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-bold border border-purple-100 dark:border-purple-800/30">
                    <Trophy className="w-4 h-4" /> 12 Certifications Earned
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Available Tests */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <h3 className="font-bold text-lg mb-2">Pending Assessments</h3>
                    {[
                        { title: 'Q4 Compliance Quiz', due: 'Dec 15, 2025', questions: 20, time: '30 mins', status: 'Mandatory', color: 'rose' },
                        { title: 'React Skill Check', due: 'N/A', questions: 15, time: '20 mins', status: 'Optional', color: 'sky' },
                        { title: 'Managerial Safety Test', due: 'Dec 10, 2025', questions: 25, time: '45 mins', status: 'Mandatory', color: 'rose' },
                    ].map((t, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 
                                ${t.color === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'} dark:bg-opacity-10
                             `}>
                                <ClipboardCheck className="w-8 h-8" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t.title}</h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {t.time}</span>
                                    <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {t.questions} Qs</span>
                                    {t.status === 'Mandatory' && <span className="text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.status}</span>}
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                Start Test <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Results History */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Timer className="w-5 h-5 text-indigo-500" /> Recent Results
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: 'POSH Awareness', score: '95%', date: 'Nov 20', status: 'Passed' },
                                { title: 'Code Ethics', score: '100%', date: 'Nov 12', status: 'Passed' },
                                { title: 'Adv JavaScript', score: '65%', date: 'Oct 05', status: 'Failed' },
                            ].map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">{r.title}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">{r.date}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${r.status === 'Passed' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {r.score}
                                        </div>
                                        <div className={`text-[10px] font-bold uppercase ${r.status === 'Passed' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {r.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
