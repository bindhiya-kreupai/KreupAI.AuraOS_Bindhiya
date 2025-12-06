"use client";

import React, { useState } from 'react';
import {
    Map,
    CheckCircle2,
    Lock
} from 'lucide-react';

export default function LearningPathsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Map className="w-6 h-6 text-indigo-500" />
                        Learning Paths
                    </h1>
                    <p className="text-slate-500 text-sm">Structured curriculums to master specific skills.</p>
                </div>
            </div>

            <div className="space-y-8">
                {[
                    { title: 'Frontend Developer Path', progress: 45, steps: 8, current: 'React Hooks Deep Dive', completed: ['HTML/CSS Basics', 'JS Fundamentals', 'Intro to React'] },
                    { title: 'New Manager Onboarding', progress: 10, steps: 5, current: 'Conflict Resolution', completed: ['Company Values'] },
                ].map((path, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-xl">{path.title}</h3>
                                <p className="text-sm text-slate-500">Current Module: <span className="text-indigo-600 font-bold">{path.current}</span></p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-indigo-600">{path.progress}%</div>
                                <div className="text-xs text-slate-500">Completed</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${path.progress}%` }}></div>
                        </div>

                        {/* Steps Visualization */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-4">
                            {path.completed.map((step, j) => (
                                <div key={j} className="flex-shrink-0 flex flex-col items-center gap-2 w-32">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-center font-medium line-clamp-2">{step}</span>
                                </div>
                            ))}

                            {/* Current */}
                            <div className="flex-shrink-0 flex flex-col items-center gap-2 w-32">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 text-indigo-600 flex items-center justify-center animate-pulse">
                                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                                </div>
                                <span className="text-xs text-center font-bold text-indigo-600 line-clamp-2">{path.current}</span>
                            </div>

                            {/* Future */}
                            {[...Array(path.steps - path.completed.length - 1)].map((_, k) => (
                                <div key={k} className="flex-shrink-0 flex flex-col items-center gap-2 w-32 opacity-40">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="text-xs text-center line-clamp-2">Locked Module</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
