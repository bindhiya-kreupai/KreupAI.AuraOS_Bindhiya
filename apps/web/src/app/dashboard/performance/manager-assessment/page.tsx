"use client";

import React from 'react';
import {
    Users,
    CheckCircle2,
    ArrowRight,
    Search
} from 'lucide-react';

export default function ManagerAssessmentPage() {
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Manager Assessment
                    </h1>
                    <p className="text-slate-500 text-sm">Evaluate your direct reports for the active cycle.</p>
                </div>
                <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-sm font-bold border border-amber-100 dark:border-amber-800/30">
                    Due: Dec 31, 2025
                </div>
            </div>

            {/* Team List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-sm">My Team (4/8 Completed)</h3>
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search team..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                    </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { name: 'Sarah Connor', role: 'Product Manager', status: 'Pending', score: '-' },
                        { name: 'John Doe', role: 'Senior Engineer', status: 'Completed', score: '4.5' },
                        { name: 'Mike Ross', role: 'Legal Associate', status: 'Pending', score: '-' },
                        { name: 'Harvey Specter', role: 'Partner', status: 'Completed', score: '5.0' },
                    ].map((member, i) => (
                        <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 group cursor-pointer transition-colors">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold">{member.name}</div>
                                    <div className="text-xs text-slate-500">{member.role}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Status</div>
                                    <div className={`text-sm font-bold ${member.status === 'Completed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                        {member.status}
                                    </div>
                                </div>
                                <div className="text-right w-16">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Rating</div>
                                    <div className="text-lg font-bold font-mono">{member.score}</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
