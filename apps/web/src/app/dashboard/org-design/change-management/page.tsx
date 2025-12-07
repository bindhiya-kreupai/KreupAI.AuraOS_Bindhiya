"use client";

import React, { useState } from 'react';
import {
    GitPullRequest,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    MessageSquare,
    Users,
    FileText
} from 'lucide-react';

export default function ChangeManagementPage() {
    const changes = [
        {
            id: 1,
            title: 'Q4 Engineering Reorg',
            status: 'In Progress',
            progress: 45,
            owner: 'Sarah Connor',
            dueDate: 'Nov 30',
            impact: 'High',
            description: 'Merging Product A and B teams into a unified platform division.'
        },
        {
            id: 2,
            title: 'New Grade Structure Implementation',
            status: 'Planning',
            progress: 10,
            owner: 'HR Ops',
            dueDate: 'Dec 15',
            impact: 'Medium',
            description: 'Rolling out new compensation bands and job codes.'
        },
        {
            id: 3,
            title: 'Sales Territory Realignment',
            status: 'Completed',
            progress: 100,
            owner: 'Mike Ross',
            dueDate: 'Oct 01',
            impact: 'High',
            description: 'Adjusting APAC and EMEA sales regions.'
        }
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitPullRequest className="w-6 h-6 text-indigo-500" />
                        Change Management
                    </h1>
                    <p className="text-slate-500 text-sm">Plan, execute, and track organizational changes.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    Create New Initiative
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg mb-2">Active Initiatives</h3>
                    {changes.map(change => (
                        <div key={change.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg">{change.title}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${change.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                change.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-amber-100 text-amber-600'
                                            }`}>{change.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-500">{change.description}</p>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded border ${change.impact === 'High' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-50 border-slate-100'
                                    }`}>
                                    {change.impact} Impact
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 font-medium">
                                    <span>Progress</span>
                                    <span>{change.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${change.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${change.progress}%` }}></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Owner: <span className="font-bold text-slate-700 dark:text-slate-300">{change.owner}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Due: {change.dueDate}
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-indigo-600 font-bold flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Checklist
                        </h4>
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
                                <span className="text-sm text-slate-600 dark:text-slate-300">Draft Impact Assessment</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-300">Stakeholder Communication Plan</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-300">Update System Permissions</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" /> Templates
                        </h4>
                        <div className="space-y-2">
                            <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between group">
                                Communication Email
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between group">
                                Reorg Impact Analysis
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between group">
                                Training Plan
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
