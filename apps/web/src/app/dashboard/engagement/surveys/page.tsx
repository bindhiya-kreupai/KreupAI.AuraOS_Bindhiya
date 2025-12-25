"use client";

import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Clock,
    Play,
    CheckCircle
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
            setData(surveys);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-indigo-500" />
                        Company Surveys
                    </h1>
                    <p className="text-slate-500 text-sm">Detailed feedback forms and organizational studies.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Surveys */}
                {[
                    { title: 'Annual Employee Engagement Survey', deadline: 'Dec 31', time: '15 mins', status: 'Not Started', color: 'bg-indigo-600' },
                    { title: 'IT Infrastructure Feedback', deadline: 'Dec 15', time: '5 mins', status: 'In Progress', color: 'bg-emerald-600' },
                ].map((survey, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition-all group border-l-4 border-l-slate-400 dark:border-l-slate-600 overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${survey.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700`}></div>
                        <h3 className="font-bold text-xl mb-2 pr-8">{survey.title}</h3>
                        <div className="flex gap-4 text-sm text-slate-500 mb-6">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {survey.time}</span>
                            <span className="font-bold text-rose-500">Due: {survey.deadline}</span>
                        </div>
                        <button className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 ${survey.color}`}>
                            {survey.status === 'In Progress' ? 'Continue Survey' : 'Start Survey'} <Play className="w-4 h-4 fill-current" />
                        </button>
                    </div>
                ))}
            </div>

            {/* History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Completed Surveys</h3>
                <div className="space-y-4">
                    {[
                        { title: 'Q3 Pulse Check', completedOn: 'Oct 05', id: 'SUR-101' },
                        { title: 'Benefits Satisfaction Survey', completedOn: 'Sep 12', id: 'SUR-098' },
                    ].map((sur, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <h4 className="font-bold">{sur.title}</h4>
                                    <div className="text-xs text-slate-500">ID: {sur.id}</div>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-slate-500">
                                Submitted on {sur.completedOn}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
