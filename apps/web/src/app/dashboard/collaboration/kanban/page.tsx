"use client";

import React from 'react';
import {
    Layout,
    Plus,
    MoreHorizontal,
    MessageSquare,
    Paperclip,
    Clock,
    Filter,
    Search
} from 'lucide-react';

export default function KanbanPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layout className="w-6 h-6 text-indigo-500" />
                        Project Board
                    </h1>
                    <p className="text-slate-500 text-sm">Sprint 24: Core Features • Ends in 4 days</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900"></div>
                        ))}
                        <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200">+</button>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4" /> New Task
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 pb-2">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Filter tasks..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none" />
                </div>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-3 h-full min-w-max">
                    {/* Column: Todo */}
                    <div className="w-80 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">To Do <span className="ml-1 opacity-50">3</span></h3>
                            <button className="text-slate-400 hover:text-indigo-600"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {[
                                { title: 'Design System Update', tag: 'Design', color: 'pink' },
                                { title: 'User Research', tag: 'Research', color: 'purple' },
                                { title: 'Competitor Analysis', tag: 'Strategy', color: 'amber' },
                            ].map((task, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all">
                                    <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-${task.color}-100 text-${task.color}-600 mb-2`}>{task.tag}</div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">{task.title}</h4>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 2</span>
                                            <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> 1</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-bold">JD</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column: In Progress */}
                    <div className="w-80 flex flex-col h-full bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900 rounded text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-300">In Progress <span className="ml-1 opacity-50">2</span></h3>
                            <button className="text-indigo-400 hover:text-indigo-600"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {[
                                { title: 'Authentication Flow', tag: 'Dev', color: 'blue' },
                                { title: 'Dashboard Layout', tag: 'Frontend', color: 'cyan' },
                            ].map((task, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all">
                                    <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-${task.color}-100 text-${task.color}-600 mb-2`}>{task.tag}</div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">{task.title}</h4>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 5</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2d</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-[10px] flex items-center justify-center font-bold">AK</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column: Review */}
                    <div className="w-80 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">Review <span className="ml-1 opacity-50">1</span></h3>
                            <button className="text-slate-400 hover:text-indigo-600"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all">
                                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 mb-2">QA</div>
                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">Mobile Responsiveness Bug</h4>
                                <div className="flex justify-between items-center text-slate-400">
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 1</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-[10px] flex items-center justify-center font-bold">SJ</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column: Done */}
                    <div className="w-80 flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 opacity-70">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Done <span className="ml-1 opacity-50">12</span></h3>
                            <button className="text-slate-400 hover:text-indigo-600"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all opacity-80 decoration-slate-400">
                                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 mb-2 line-through">Setup</div>
                                <h4 className="font-bold text-sm text-slate-500 mb-3 line-through">Project Initialization</h4>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-xs">Yesterday</span>
                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-bold">ALL</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

