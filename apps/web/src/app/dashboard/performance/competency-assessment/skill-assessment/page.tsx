"use client";

import React, { useState, useEffect } from 'react';
import { CompetencyService } from '../../core/services';
import {
    ClipboardCheck,
    Calendar,
    User,
    Users,
    ChevronRight,
    Play
} from 'lucide-react';

export default function SkillAssessmentPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-indigo-500" />
                        Skill Assessment
                    </h1>
                    <p className="text-slate-500 text-sm">Initiate and track competency evaluations.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Play className="w-4 h-4" /> Start New Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Cycles */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Active Assessment Cycles</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Q4 2024 Tech Skills Review', due: 'Dec 15, 2024', status: 'In Progress', progress: 65, participants: 42 },
                                { name: 'Leadership 360 Feedback', due: 'Jan 10, 2025', status: 'Draft', progress: 10, participants: 12 },
                            ].map((cycle, i) => (
                                <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{cycle.name}</h4>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {cycle.due}</span>
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cycle.participants} Employees</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                            ${cycle.status === 'In Progress' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}
                                        `}>
                                            {cycle.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500">
                                            <span>Completion Rate</span>
                                            <span>{cycle.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${cycle.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button className="text-xs font-bold text-indigo-600 hover:underline">View Participants</button>
                                        <span className="text-slate-300">|</span>
                                        <button className="text-xs font-bold text-indigo-600 hover:underline">Send Reminders</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* My Assessments */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> My Pending Actions
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Self Assessment</div>
                                <div className="font-bold text-sm mb-2">Q4 2024 Tech Skills Review</div>
                                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                                    Start Evaluation
                                </button>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Team Assessment</div>
                                <div className="font-bold text-sm mb-2">Evaluate: John Doe</div>
                                <button className="w-full py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
