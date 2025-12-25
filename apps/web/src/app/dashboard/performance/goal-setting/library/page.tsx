"use client";

import React, { useState, useEffect } from 'react';
import { GoalService } from '../../core/services';
import {
    Target,
    BookOpen,
    Plus,
    Search,
    ChevronRight,
    Copy,
    Tag,
    Star,
    ArrowRight
} from 'lucide-react';

const CATEGORIES = [
    { name: 'Engineering', count: 45 },
    { name: 'Sales & Marketing', count: 32 },
    { name: 'Product Management', count: 18 },
    { name: 'Leadership', count: 12 },
    { name: 'Soft Skills', count: 24 },
];

const GOALS = [
    { id: 1, title: 'Improve Code Coverage', kpi: '> 85% Test Coverage', category: 'Engineering', difficulty: 'Medium', stars: 124 },
    { id: 2, title: 'Reduce Churn Rate', kpi: '< 2% Monthly Churn', category: 'Sales & Marketing', difficulty: 'Hard', stars: 89 },
    { id: 3, title: 'Mentor Junior Developers', kpi: '2 Mentees Promoted', category: 'Leadership', difficulty: 'Medium', stars: 56 },
    { id: 4, title: 'Launch Feature X', kpi: 'On-time delivery', category: 'Product Management', difficulty: 'Hard', stars: 210 },
];

export default function GoalLibraryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        Goal Library
                    </h1>
                    <p className="text-slate-500 text-sm">Reusable KPI templates and objective inspirations.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Propose Goal
                </button>
            </div>

            <div className="flex h-full min-h-0 gap-6 overflow-hidden">
                {/* Sidebar Categories */}
                <div className="w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-500 uppercase tracking-wider">
                        Categories
                    </div>
                    <div className="p-2 space-y-1">
                        {CATEGORIES.map(cat => (
                            <button key={cat.name} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{cat.name}</span>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search goals by title, KPI, or tag..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none"
                            />
                        </div>
                    </div>

                    {/* Goal List */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {GOALS.map(goal => (
                            <div key={goal.id} className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group last:border-0 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{goal.title}</h3>
                                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        {goal.stars} used
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-1 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <Target className="w-4 h-4 text-rose-500" />
                                        <span className="font-mono text-slate-600 dark:text-slate-300">{goal.kpi}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold
                                        ${goal.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}
                                    `}>
                                        {goal.difficulty}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Tag className="w-3 h-3" />
                                    <span>{goal.category}</span>
                                </div>

                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="flex items-center gap-2 bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-indigo-600">
                                        <Copy className="w-3 h-3" /> Use this Goal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
