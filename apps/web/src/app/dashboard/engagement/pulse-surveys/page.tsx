"use client";

import React, { useState } from 'react';
import {
    Activity,
    CheckCircle2,
    BarChart2,
    Play
} from 'lucide-react';

export default function PulseSurveysPage() {
    const activeSurveys = [
        { title: 'Weekly Check-in: Dec 06', type: 'Pulse', questions: 5, time: '2 mins', status: 'Active' },
        { title: 'Q4 Employee Satisfaction', type: 'Deep Dive', questions: 25, time: '10 mins', status: 'Active' },
    ];

    const pastSurveys = [
        { title: 'Remote Work Experience', date: 'Nov 15', responseRate: '85%', score: 4.2 },
        { title: 'Management Feedback', date: 'Oct 01', responseRate: '92%', score: 3.8 },
    ];

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Surveys */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Play className="w-4 h-4 text-emerald-500" /> Open for Respose
                    </h3>
                    {activeSurveys.map((survey, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity className="w-24 h-24 text-indigo-500" />
                            </div>

                            <div className="relative z-10">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block mb-3">
                                    {survey.type}
                                </span>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{survey.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <span>{survey.questions} Questions</span>
                                    <span>•</span>
                                    <span>~{survey.time} to complete</span>
                                </div>
                                <button className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                    Start Survey
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Past Results */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> Past Insights
                    </h3>
                    <div className="space-y-6">
                        {pastSurveys.map((survey, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="font-bold">{survey.title}</h4>
                                    <p className="text-xs text-slate-500">Closed on {survey.date}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-indigo-600">{survey.score}<span className="text-sm text-slate-400">/5</span></div>
                                    <div className="text-xs font-bold text-emerald-600">{survey.responseRate} Responded</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
