"use client";

import React, { useState } from 'react';
import {
    Flag,
    Target,
    CheckCircle2,
    Circle,
    MoreHorizontal,
    TrendingUp,
    Calendar
} from 'lucide-react';

export default function PlansPage() {
    const [activeTab, setActiveTab] = useState('30 Days');

    const phases = [
        {
            title: '30 Days',
            focus: 'Learn & Connect',
            desc: 'Understand the product, meet the team, and complete initial training.',
            goals: [
                { id: 1, title: 'Complete Product Certification Level 1', status: 'In Progress', progress: 60 },
                { id: 2, title: 'Meet 1:1 with all team members', status: 'Pending', progress: 0 },
                { id: 3, title: 'Ship first bug fix to production', status: 'Completed', progress: 100 },
            ]
        },
        {
            title: '60 Days',
            focus: 'Contribute',
            desc: 'Take ownership of small features and participate in code reviews.',
            goals: [
                { id: 4, title: 'Lead a feature implementation', status: 'Locked', progress: 0 },
                { id: 5, title: 'Present at Engineering All-Hands', status: 'Locked', progress: 0 },
            ]
        },
        {
            title: '90 Days',
            focus: 'Lead & Innovate',
            desc: 'Propose improvements, mentor junior members, and act independently.',
            goals: [
                { id: 6, title: 'Propose an architectural improvement', status: 'Locked', progress: 0 },
            ]
        }
    ];

    const currentPhase = phases.find(p => p.title === activeTab) || phases[0];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500" />
                        30-60-90 Day Plan
                    </h1>
                    <p className="text-slate-500 text-sm">Structured goals to ensure a successful ramp-up period.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-4 h-4" /> Start Date: Oct 25, 2024
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Phase Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    {phases.map(phase => (
                        <div key={phase.title}
                            onClick={() => setActiveTab(phase.title)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeTab === phase.title
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h3 className={`font-bold ${activeTab === phase.title ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{phase.title}</h3>
                                {activeTab === phase.title && <Flag className="w-4 h-4 text-indigo-500" />}
                            </div>
                            <div className="text-xs text-slate-500">{phase.focus}</div>
                        </div>
                    ))}

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="font-bold text-sm">Progress Overview</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[25%]"></div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 text-right">25% Completed</div>
                    </div>
                </div>

                {/* Right: Goals List */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 min-h-[500px] flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                {currentPhase.title} Goals
                                <span className="text-sm font-normal px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                                    {currentPhase.focus}
                                </span>
                            </h2>
                            <p className="text-slate-500 mt-2">{currentPhase.desc}</p>
                        </div>

                        <div className="space-y-4 flex-1">
                            {currentPhase.goals.map(goal => (
                                <div key={goal.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${goal.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                    goal.status === 'Locked' ? 'bg-slate-100 border-slate-200 text-slate-300' :
                                                        'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {goal.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-lg ${goal.status === 'Completed' ? 'text-slate-500 line-through' : ''}`}>{goal.title}</h4>
                                                <div className={`text-xs font-bold uppercase mt-1 px-2 py-0.5 rounded-md inline-block ${goal.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                        goal.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' :
                                                            'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {goal.status}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {goal.status === 'In Progress' && (
                                        <div className="pl-10 pr-4">
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>Progress</span>
                                                <span>{goal.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action Bar */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold">Share with Manager</button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                                Update Progress
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
