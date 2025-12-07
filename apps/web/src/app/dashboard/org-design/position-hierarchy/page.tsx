"use client";

import React from 'react';
import {
    Layers,
    ChevronRight,
    Briefcase,
    Shield,
    Award,
    Edit3
} from 'lucide-react';

export default function PositionHierarchyPage() {
    const levels = [
        {
            id: 'L1',
            name: 'Executive / C-Suite',
            positions: ['CEO', 'CTO', 'CPO', 'CFO'],
            comp: '$250k - $500k',
            color: 'bg-indigo-600'
        },
        {
            id: 'L2',
            name: 'Vice President (VP)',
            positions: ['VP of Engineering', 'VP of Sales', 'VP of Marketing'],
            comp: '$180k - $280k',
            color: 'bg-indigo-500'
        },
        {
            id: 'L3',
            name: 'Director / Head of',
            positions: ['Director, Product Design', 'Director, DevOps', 'Head of HR'],
            comp: '$140k - $200k',
            color: 'bg-indigo-400'
        },
        {
            id: 'L4',
            name: 'Manager / Lead',
            positions: ['Engineering Manager', 'Product Lead', 'Sales Manager'],
            comp: '$110k - $160k',
            color: 'bg-indigo-300'
        },
        {
            id: 'L5',
            name: 'Senior Individual Contributor',
            positions: ['Senior Software Engineer', 'Senior Designer', 'Account Executive'],
            comp: '$90k - $140k',
            color: 'bg-indigo-200'
        },
        {
            id: 'L6',
            name: 'Associate / Entry Level',
            positions: ['Software Engineer I', 'Designer I', 'Sales Associate'],
            comp: '$60k - $90k',
            color: 'bg-indigo-100'
        }
    ];

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        Position Hierarchy
                    </h1>
                    <p className="text-slate-500 text-sm">Define job architecture, levels, and reporting structures independent of employees.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    Define New Level
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Level Visualization (Pyramid) */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col w-full max-w-[200px] gap-1 relative">
                        {levels.map((level, i) => (
                            <div
                                key={level.id}
                                className={`h-10 w-full rounded-md shadow-sm flex items-center justify-center text-xs font-bold text-white transition-transform hover:scale-105 cursor-pointer ${level.color}`}
                                style={{ width: `${100 - (i * 12)}%`, margin: '0 auto' }}
                            >
                                {level.id}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-6 text-center font-medium opacity-80">
                        Visualizing organizational depth and span hierarchy.
                    </p>
                </div>

                {/* Detailed Level List */}
                <div className="lg:col-span-3 space-y-4">
                    {levels.map(level => (
                        <div key={level.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-300 transition-colors group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${level.color} opacity-90 flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                                        {level.id}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{level.name}</h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {level.positions.length} Titles defined</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Comp: {level.comp}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-4 pl-16">
                                <div className="flex flex-wrap gap-2">
                                    {level.positions.map((pos, pIdx) => (
                                        <div key={pIdx} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 group/chip cursor-default">
                                            {pos}
                                            <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover/chip:opacity-100" />
                                        </div>
                                    ))}
                                    <button className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border-dashed border border-slate-300 dark:border-slate-600 rounded-md text-xs text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-colors">
                                        + Add Title
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
