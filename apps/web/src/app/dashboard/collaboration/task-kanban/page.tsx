"use client";

import React, { useState } from 'react';
import {
    Kanban,
    Plus,
    MoreHorizontal,
    MessageSquare,
    Paperclip
} from 'lucide-react';

export default function TaskKanbanPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Kanban className="w-6 h-6 text-indigo-500" />
                        Task Kanban
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize workflow and track project progress.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex -space-x-2 mr-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900">JD</div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-900">MT</div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Task
                    </button>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto h-full pb-4">
                {[
                    {
                        title: 'To Do', color: 'bg-slate-200 dark:bg-slate-700', cards: [
                            { title: 'Update homepage hero', tag: 'Design', priority: 'High', comments: 2, attach: 1 },
                            { title: 'Fix navigation bug', tag: 'Dev', priority: 'Med', comments: 0, attach: 0 },
                        ]
                    },
                    {
                        title: 'In Progress', color: 'bg-indigo-200 dark:bg-indigo-900', cards: [
                            { title: 'Implement OAuth', tag: 'Backend', priority: 'High', comments: 5, attach: 2 },
                        ]
                    },
                    {
                        title: 'Review', color: 'bg-amber-200 dark:bg-amber-900', cards: [
                            { title: 'Draft Q3 report', tag: 'Content', priority: 'Low', comments: 1, attach: 0 },
                            { title: 'Optimize images', tag: 'Design', priority: 'Med', comments: 3, attach: 4 },
                        ]
                    },
                    {
                        title: 'Done', color: 'bg-emerald-200 dark:bg-emerald-900', cards: [
                            { title: 'Server migration', tag: 'DevOps', priority: 'Crit', comments: 8, attach: 0 },
                        ]
                    },
                ].map((col, i) => (
                    <div key={i} className="min-w-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">{col.title}</h3>
                                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold text-slate-400">{col.cards.length}</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                            {col.cards.map((card, k) => (
                                <div key={k} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md cursor-grab active:cursor-grabbing">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-xs font-bold text-slate-500 uppercase">{card.tag}</span>
                                        <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal className="w-4 h-4" /></button>
                                    </div>
                                    <h4 className="font-bold text-sm mb-3">{card.title}</h4>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex gap-3 text-slate-400 text-xs font-bold">
                                            {card.comments > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {card.comments}</span>}
                                            {card.attach > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {card.attach}</span>}
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">BS</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
