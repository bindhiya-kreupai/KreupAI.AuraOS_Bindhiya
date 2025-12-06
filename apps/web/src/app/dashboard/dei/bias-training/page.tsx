"use client";

import React from 'react';
import {
    GraduationCap,
    PlayCircle,
    CheckCircle2,
    Clock,
    BookOpen
} from 'lucide-react';

export default function BiasTrainingPage() {
    const modules = [
        {
            title: 'Unconscious Bias Fundamentals',
            duration: '45 mins',
            status: 'Completed',
            completedDate: 'Oct 15, 2023',
            thumb: 'bg-indigo-100'
        },
        {
            title: 'Inclusive Leadership',
            duration: '60 mins',
            status: 'In Progress',
            progress: 45,
            thumb: 'bg-pink-100'
        },
        {
            title: 'Microaggressions at Work',
            duration: '30 mins',
            status: 'Not Started',
            thumb: 'bg-amber-100'
        },
        {
            title: 'Allyship 101',
            duration: '40 mins',
            status: 'Assigned',
            thumb: 'bg-emerald-100'
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-500" />
                        Unconscious Bias Training
                    </h1>
                    <p className="text-slate-500 text-sm">Mandatory and optional learning modules for an inclusive workplace.</p>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-indigo-600 rounded-2xl p-8 text-white flex items-center justify-between shadow-lg shadow-indigo-500/20">
                <div>
                    <h2 className="text-2xl font-bold mb-2">My Learning Path</h2>
                    <p className="opacity-90 max-w-lg">You are on track! Complete the "Inclusive Leadership" module by Friday to maintain your streak.</p>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold">2/4</span>
                            <span className="text-xs opacity-75 uppercase font-bold">Modules Done</span>
                        </div>
                        <div className="h-10 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold">120</span>
                            <span className="text-xs opacity-75 uppercase font-bold">Minutes Spent</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center relative">
                        <span className="text-2xl font-bold">50%</span>
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-lg mt-8">Course Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modules.map((mod, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group flex gap-4">
                        <div className={`w-20 h-20 rounded-lg ${mod.thumb} flex items-center justify-center shrink-0`}>
                            <BookOpen className="w-8 h-8 text-slate-700 opacity-50" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold group-hover:text-indigo-600 transition-colors">{mod.title}</h4>
                                {mod.status === 'Completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : mod.status === 'In Progress' ? (
                                    <PlayCircle className="w-5 h-5 text-indigo-500" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mod.duration}</span>
                                <span className={`px-2 py-0.5 rounded font-bold ${mod.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                        mod.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {mod.status}
                                </span>
                            </div>

                            {mod.status === 'In Progress' && (
                                <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${mod.progress}%` }}></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
