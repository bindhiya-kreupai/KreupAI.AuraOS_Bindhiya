"use client";

import React, { useState } from 'react';
import {
    GraduationCap,
    Play,
    CheckCircle2,
    Clock,
    Award
} from 'lucide-react';

export default function SafetyTrainingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-500" />
                        Safety Training
                    </h1>
                    <p className="text-slate-500 text-sm">Mandatory compliance courses and certifications.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Courses */}
                {[
                    { title: 'Fire Safety Drill 2023', min: 15, progress: 45, deadling: 'Due in 3 days', type: 'Mandatory' },
                    { title: 'Ergonomics at Work', min: 30, progress: 0, deadling: 'Due Dec 31', type: 'Recommended' },
                    { title: 'Cybersecurity Basics', min: 60, progress: 10, deadling: 'Overdue', type: 'Mandatory' },
                ].map((course, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                        <div className="h-40 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center group cursor-pointer">
                            <Play className="w-12 h-12 text-indigo-500 opacity-80 group-hover:scale-110 transition-transform" />
                            <span className="absolute top-4 right-4 text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded text-slate-600">
                                {course.type}
                            </span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                            <div className="flex justify-between text-xs text-slate-500 mb-4">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.min} mins</span>
                                <span className="font-bold text-rose-500">{course.deadling}</span>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>{course.progress}% Complete</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" /> My Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'Workplace First Aid L1', date: 'Issued Jan 15, 2023', valid: 'Valid until 2025' },
                        { title: 'Code of Conduct v2.0', date: 'Issued Mar 01, 2023', valid: 'No Expiry' },
                    ].map((cert, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{cert.title}</h4>
                                <div className="text-xs text-slate-500">{cert.date} • <span className="text-emerald-600">{cert.valid}</span></div>
                            </div>
                            <button className="ml-auto text-xs font-bold text-indigo-600 hover:underline">Download</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
