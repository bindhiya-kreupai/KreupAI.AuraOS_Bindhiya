"use client";

import React, { useState, useEffect } from 'react';
import { CompetencyService } from '../../core/services';
import {
    Book,
    Search,
    Filter,
    MoreVertical,
    Plus,
    Tag
} from 'lucide-react';

export default function CompetencyCatalogPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Book className="w-6 h-6 text-indigo-500" />
                        Competency Catalog
                    </h1>
                    <p className="text-slate-500 text-sm">Master repository of behavioral, functional, and technical competencies.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    <Plus className="w-4 h-4" /> Add Competency
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, code, or description..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {[
                    { name: 'Strategic Thinking', code: 'BEH-001', type: 'Behavioral', desc: 'Ability to see the big picture and plan for the long term.', levels: 5 },
                    { name: 'Java Programming', code: 'TECH-104', type: 'Technical', desc: 'Proficiency in Java SE, EE, and related frameworks.', levels: 4 },
                    { name: 'Project Management', code: 'FUNC-023', type: 'Functional', desc: 'Planning, executing, and closing projects effectively.', levels: 5 },
                    { name: 'Emotional Intelligence', code: 'BEH-005', type: 'Behavioral', desc: 'Understanding and managing own and others emotions.', levels: 3 },
                    { name: 'Data Analysis', code: 'TECH-089', type: 'Technical', desc: 'Interpreting complex data sets to drive decision making.', levels: 5 },
                    { name: 'Sales Negotiation', code: 'FUNC-012', type: 'Functional', desc: 'Closing deals and managing client relationships.', levels: 4 },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                ${item.type === 'Behavioral' ? 'bg-purple-100 text-purple-700' :
                                    item.type === 'Technical' ? 'bg-cyan-100 text-cyan-700' :
                                        'bg-emerald-100 text-emerald-700'}
                            `}>
                                {item.type}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{item.name}</h3>
                        <div className="text-xs font-mono text-slate-400 mb-4">{item.code}</div>

                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                            {item.desc}
                        </p>

                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.levels} Proficiency Levels Defined</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
