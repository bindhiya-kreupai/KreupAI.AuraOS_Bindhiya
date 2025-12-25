"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    CheckCircle2,
    Users,
    Clock,
    Trophy,
    ArrowRight
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
            setData(surveys.filter(s => s.type === 'poll' || s.type === 'quiz'));
        } catch (error) {
            console.error('Error fetching polls and quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-indigo-500" />
                        Polls & Quizzes
                    </h1>
                    <p className="text-slate-500 text-sm">Participate in quick polls and knowledge quizzes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Poll */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded animate-pulse">LIVE</span>
                        <h3 className="font-bold text-lg">Where should we host the Annual Retreat?</h3>
                    </div>

                    <div className="space-y-4 mb-6">
                        {[
                            { option: 'Beach Resort (Bali)', percent: 45, color: 'bg-emerald-500' },
                            { option: 'Mountain Cabin (Aspen)', percent: 30, color: 'bg-indigo-500' },
                            { option: 'City Break (Tokyo)', percent: 25, color: 'bg-amber-500' },
                        ].map((opt, i) => (
                            <div key={i} className="relative group cursor-pointer">
                                <div className="flex justify-between text-sm font-bold mb-1">
                                    <span className="group-hover:text-indigo-600 transition-colors">{opt.option}</span>
                                    <span>{opt.percent}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${opt.color} transition-all duration-1000`} style={{ width: `${opt.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 245 Voted</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ends in 2 days</span>
                    </div>
                </div>

                {/* Active Quiz */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-2xl mb-1">Cybersecurity 101</h3>
                                <p className="text-indigo-100 text-sm">Test your knowledge on phishing and password safety.</p>
                            </div>
                            <Trophy className="w-10 h-10 text-yellow-400" />
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-white/10 p-2 rounded-lg text-center backdrop-blur-sm min-w-[80px]">
                                <div className="text-xl font-bold">10</div>
                                <div className="text-[10px] uppercase opacity-75">Questions</div>
                            </div>
                            <div className="bg-white/10 p-2 rounded-lg text-center backdrop-blur-sm min-w-[80px]">
                                <div className="text-xl font-bold">+50</div>
                                <div className="text-[10px] uppercase opacity-75">Points</div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 group">
                            Start Quiz <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Recent Results</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { title: 'New Office Layout Poll', date: 'Nov 20', result: 'Open Plan (60%)', users: 312, type: 'Poll' },
                        { title: 'Product Knowledge Quiz', date: 'Nov 15', result: 'Avg Score: 8/10', users: 156, type: 'Quiz' },
                        { title: 'Cafeteria Menu Selection', date: 'Nov 10', result: 'Asian Fusion (55%)', users: 289, type: 'Poll' },
                    ].map((item, i) => (
                        <div key={i} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.type === 'Quiz' ? 'border-purple-200 text-purple-600 bg-purple-50' : 'border-indigo-200 text-indigo-600 bg-indigo-50'}`}>
                                        {item.type}
                                    </span>
                                    <h4 className="font-bold text-sm">{item.title}</h4>
                                </div>
                                <div className="text-xs text-slate-500">Ended on {item.date} • {item.users} Participants</div>
                            </div>
                            <div className="text-right text-sm font-bold text-slate-700 dark:text-slate-300">
                                {item.result}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
