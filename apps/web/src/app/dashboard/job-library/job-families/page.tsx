"use client";

import React, { useState } from 'react';
import {
    Layers,
    ChevronRight,
    Users,
    FolderPlus
} from 'lucide-react';

export default function JobFamiliesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        Job Families
                    </h1>
                    <p className="text-slate-500 text-sm">Organize roles into families and functions.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <FolderPlus className="w-4 h-4" /> New Family
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Engineering', roles: 24, owner: 'CTO Office', sub: ['Software', 'DevOps', 'QA'], color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    { name: 'Product Management', roles: 8, owner: 'CPO Office', sub: ['Product', 'Design'], color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { name: 'Sales & Marketing', roles: 15, owner: 'CRO Office', sub: ['Sales', 'Marketing', 'RevOps'], color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                    { name: 'Finance', roles: 10, owner: 'CFO Office', sub: ['Accounting', 'FP&A', 'Tax'], color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { name: 'Human Resources', roles: 12, owner: 'CHRO Office', sub: ['Operations', 'Recruiting', 'L&D'], color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map((family, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${family.bg} ${family.color}`}>
                                <Layers className="w-6 h-6" />
                            </div>
                            <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <Users className="w-3 h-3" /> {family.roles} Roles
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-1">{family.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">Owner: {family.owner}</p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                            {family.sub.map((s, j) => (
                                <span key={j} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
