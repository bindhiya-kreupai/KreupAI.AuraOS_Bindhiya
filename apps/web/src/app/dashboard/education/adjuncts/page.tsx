"use client";

import React from 'react';
import {
    Users,
    Calendar,
    FileText,
    BookOpen,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function AdjunctsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-orange-500" />
                        Adjunct Management
                    </h1>
                    <p className="text-slate-500 text-sm">Contract renewals, course loads, and semester planning.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <select className="bg-transparent text-sm font-bold outline-none">
                        <option>Spring 2025</option>
                        <option>Fall 2024</option>
                        <option>Summer 2024</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Contract Status List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <div className="flex-1">
                            <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm">Contract Renewals Due</h4>
                            <p className="text-xs text-orange-700 dark:text-orange-400">15 Adjunct contracts expire in 30 days. Please review teaching evaluations.</p>
                        </div>
                        <button className="px-3 py-1.5 bg-white dark:bg-orange-950/50 text-orange-600 font-bold text-xs rounded-lg shadow-sm">Review All</button>
                    </div>

                    {[
                        { name: 'Prof. Albus Dumbledore', dept: 'Defense Against Dark Arts', courses: 2, status: 'Active', contract: 'Ends May 2025' },
                        { name: 'Prof. Minerva McGonagall', dept: 'Transfiguration', courses: 3, status: 'Renewal Pending', contract: 'Ends Dec 2024' },
                        { name: 'Prof. Severus Snape', dept: 'Potions', courses: 1, status: 'Active', contract: 'Ends May 2025' },
                        { name: 'Prof. Rubeus Hagrid', dept: 'Care of Magical Creatures', courses: 1, status: 'Probation', contract: 'Ends Dec 2024' },
                    ].map((prof, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    {prof.name.split(' ')[1][0]}{prof.name.split(' ')[2][0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{prof.name}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{prof.dept}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">
                                        <BookOpen className="w-3 h-3" /> {prof.courses} Courses Assigned
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                    ${prof.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                        prof.status === 'Renewal Pending' ? 'bg-amber-100 text-amber-600' :
                                            'bg-rose-100 text-rose-600'}
                                `}>
                                    {prof.status}
                                </span>
                                <div className="text-xs text-slate-500 font-bold">{prof.contract}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Course Load Stats */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Teaching Load
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1 text-slate-600 dark:text-slate-400">
                                    <span>Full-Time Faculty</span>
                                    <span>65%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[65%] rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1 text-slate-600 dark:text-slate-400">
                                    <span>Adjuncts</span>
                                    <span>35%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[35%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">128</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Total Sections</div>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Download Contract Report
                    </button>
                </div>
            </div>
        </div>
    );
}

