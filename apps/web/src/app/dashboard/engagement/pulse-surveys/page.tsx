"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    BarChart2,
    Play,
    Loader2
} from 'lucide-react';
import { SurveyService } from '../services';

export default function PulseSurveysPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const surveys = await SurveyService.getSurveys();
            setData(Array.isArray(surveys) ? surveys : []);
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

    const activeSurveys = data.filter(s => s.status === 'active');
    const pastSurveys = data.filter(s => s.status === 'closed');

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        Pulse Surveys
                    </h1>
                    <p className="text-slate-500 text-sm">Quick surveys to gauge organizational health and sentiment.</p>
                </div>
            </div>

            {activeSurveys.length === 0 && pastSurveys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Activity className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">No surveys available yet.</p>
                    <p className="text-sm">Surveys will appear here once created.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Play className="w-4 h-4 text-emerald-500" /> Open for Response
                        </h3>
                        {activeSurveys.length === 0 ? (
                            <p className="text-sm text-slate-400">No active surveys at this time.</p>
                        ) : (
                            activeSurveys.map((survey: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Activity className="w-24 h-24 text-indigo-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block mb-3">
                                            {survey.type || 'Pulse'}
                                        </span>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{survey.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                            <span>{survey.questions || 0} Questions</span>
                                            <span>-</span>
                                            <span>~{survey.time || '5 mins'} to complete</span>
                                        </div>
                                        <button className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                            Start Survey
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-indigo-500" /> Past Insights
                        </h3>
                        <div className="space-y-6">
                            {pastSurveys.length === 0 ? (
                                <p className="text-sm text-slate-400">No past survey results yet.</p>
                            ) : (
                                pastSurveys.map((survey: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h4 className="font-bold">{survey.title}</h4>
                                            <p className="text-xs text-slate-500">Closed on {survey.date || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-indigo-600">{survey.score || 0}<span className="text-sm text-slate-400">/5</span></div>
                                            <div className="text-xs font-bold text-emerald-600">{survey.responseRate || '0%'} Responded</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
