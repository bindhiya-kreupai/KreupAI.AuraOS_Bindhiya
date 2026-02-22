"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    Users,
    Clock,
    Trophy,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { SurveyService } from '../services';

export default function PollsQuizzesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const surveys = await SurveyService.getSurveys();
            const allSurveys = Array.isArray(surveys) ? surveys : [];
            setData(allSurveys.filter((s: any) => s.type === 'poll' || s.type === 'quiz'));
        } catch {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-indigo-500" />
                        Polls & Quizzes
                    </h1>
                    <p className="text-slate-500 text-sm">Participate in quick polls and knowledge quizzes.</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Trophy className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">No polls or quizzes available.</p>
                    <p className="text-sm">Polls and quizzes will appear here once created.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {data.filter((s: any) => s.type === 'poll' && s.status === 'active').map((poll: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded animate-pulse">LIVE</span>
                                    <h3 className="font-bold text-lg">{poll.title}</h3>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {poll.responses || 0} Voted</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {poll.deadline || 'Open'}</span>
                                </div>
                            </div>
                        ))}

                        {data.filter((s: any) => s.type === 'quiz' && s.status === 'active').map((quiz: any, i: number) => (
                            <div key={i} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-center">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-2xl mb-1">{quiz.title}</h3>
                                            <p className="text-indigo-100 text-sm">{quiz.description || ''}</p>
                                        </div>
                                        <Trophy className="w-10 h-10 text-yellow-400" />
                                    </div>
                                    <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 group">
                                        Start Quiz <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            </div>
                        ))}
                    </div>

                    {data.filter((s: any) => s.status === 'closed').length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Recent Results</h3>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.filter((s: any) => s.status === 'closed').map((item: any, i: number) => (
                                    <div key={i} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.type === 'quiz' ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-indigo-200 text-indigo-600 bg-indigo-50'}`}>
                                                    {item.type === 'quiz' ? 'Quiz' : 'Poll'}
                                                </span>
                                                <h4 className="font-bold text-sm">{item.title}</h4>
                                            </div>
                                            <div className="text-xs text-slate-500">{item.responses || 0} Participants</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

