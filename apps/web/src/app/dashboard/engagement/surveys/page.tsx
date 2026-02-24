"use client";

import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Clock,
    Play,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { SurveyService } from '../services';

export default function SurveysPage() {
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

    const activeSurveys = data.filter((s: any) => s.status === 'active' || s.status === 'open');
    const completedSurveys = data.filter((s: any) => s.status === 'closed' || s.status === 'completed');

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-indigo-500" />
                        Company Surveys
                    </h1>
                    <p className="text-slate-500 text-sm">Detailed feedback forms and organizational studies.</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <ClipboardList className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">No surveys available yet.</p>
                    <p className="text-sm">Company surveys will appear here once created.</p>
                </div>
            ) : (
                <>
                    {activeSurveys.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeSurveys.map((survey: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition-all group border-l-4 border-l-slate-400 dark:border-l-slate-600 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
                                    <h3 className="font-bold text-xl mb-2 pr-8">{survey.title}</h3>
                                    <div className="flex gap-3 text-sm text-slate-500 mb-6">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {survey.time || '~10 mins'}</span>
                                        {survey.deadline && <span className="font-bold text-rose-500">Due: {survey.deadline}</span>}
                                    </div>
                                    <button className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 bg-indigo-600">
                                        Start Survey <Play className="w-4 h-4 fill-current" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {completedSurveys.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Completed Surveys</h3>
                            <div className="space-y-4">
                                {completedSurveys.map((sur: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            <div>
                                                <h4 className="font-bold">{sur.title}</h4>
                                                {sur.id && <div className="text-xs text-slate-500">ID: {sur.id}</div>}
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-slate-500">
                                            {sur.completedOn ? `Submitted on ${sur.completedOn}` : 'Completed'}
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

