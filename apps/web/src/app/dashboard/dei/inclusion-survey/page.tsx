"use client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    BarChart2,
    Send,
    ThumbsUp,
    ThumbsDown,
    Loader2
} from 'lucide-react';
import { InclusionSurveyService } from '../services';

export default function InclusionSurveyPage() {
    const [activeTab, setActiveTab] = useState('surveys');
    const [surveys, setSurveys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await InclusionSurveyService.getAllSurveys();
                setSurveys(data as any[]);
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
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Inclusion Surveys
                    </h1>
                    <p className="text-slate-500 text-sm">Gather anonymous feedback on workplace culture and belonging.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                        <Send className="w-4 h-4" /> Launch New Survey
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Surveys */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg mb-2">Active & Recent Surveys</h3>
                    {[
                        { title: 'Q4 2023 Inclusion Pulse', status: 'Active', responses: 842, date: 'Ends in 3 days', color: 'bg-emerald-500' },
                        { title: 'Remote Work Experience', status: 'Closed', responses: 1150, date: 'Ended Nov 30', color: 'bg-slate-500' },
                        { title: 'Belongingness Index', status: 'Draft', responses: 0, date: 'Planned Jan 15', color: 'bg-indigo-500' },
                    ].map((survey, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${survey.color}`}></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{survey.title}</h4>
                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${survey.color}`}>{survey.status}</span>
                                        <span>• {survey.date}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{survey.responses}</div>
                                    <div className="text-xs text-slate-400 uppercase">Responses</div>
                                </div>
                            </div>

                            {/* Progress Bar for Active */}
                            {survey.status === 'Active' && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
                                        <span>Participation Rate</span>
                                        <span>68%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[68%]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Key Insights */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-indigo-500" /> Sentiment Score
                        </h3>
                        <div className="text-center py-6">
                            <div className="text-5xl font-bold text-indigo-600 mb-2">4.2</div>
                            <div className="flex justify-center gap-1 text-slate-400 text-sm">
                                <span>out of 5.0</span>
                            </div>
                            <div className="mt-4 flex justify-center gap-4 text-sm font-bold">
                                <span className="text-emerald-600 flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> 78% Positive</span>
                                <span className="text-rose-600 flex items-center gap-1"><ThumbsDown className="w-4 h-4" /> 8% Negative</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                        <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">Focus Area</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Recent feedback indicates a need for better support for remote employees regarding "Feeling of Connection".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
