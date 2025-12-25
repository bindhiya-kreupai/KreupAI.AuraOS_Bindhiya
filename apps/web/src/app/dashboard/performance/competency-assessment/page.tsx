"use client";
// Force rebuild

import React, { useState, useEffect } from 'react';
import { CompetencyService } from '../core/services';
import {
    Book,
    Search,
    Filter,
    Plus,
    ChevronDown,
    ChevronUp,
    BrainCircuit,
    Users,
    Briefcase,
    Star,
    LayoutGrid
} from 'lucide-react';

// --- MOCK DATA ---

type Category = 'Technical' | 'Behavioral' | 'Leadership';

interface Competency {
    id: string;
    title: string;
    category: Category;
    description: string;
    levels: {
        beginner: string;
        intermediate: string;
        advanced: string;
        expert: string;
    };
}

const COMPETENCIES: Competency[] = [
    {
        id: 'COMP-001',
        title: 'Strategic Thinking',
        category: 'Leadership',
        description: 'The ability to understand the organization\'s goals and align strategies to achieve them.',
        levels: {
            beginner: 'Understands basic organizational goals and how own role contributes.',
            intermediate: 'Aligns daily tasks with strategic objectives; identifies opportunities for improvement.',
            advanced: 'Develops departmental strategies; anticipates market trends and business shifts.',
            expert: 'Shapes organization-wide vision; drives innovation and long-term sustainability.'
        }
    },
    {
        id: 'COMP-002',
        title: 'Effective Communication',
        category: 'Behavioral',
        description: 'The ability to convey information clearly and effectively to diverse audiences.',
        levels: {
            beginner: 'Communicates clearly in routine situations; listens actively.',
            intermediate: 'Adapts style to different audiences; handles difficult conversations constructively.',
            advanced: 'Facilitates complex discussions; influences stakeholders through persuasion.',
            expert: 'Inspires and motivates through storytelling; handles crisis communication masterfully.'
        }
    },
    {
        id: 'COMP-003',
        title: 'Cloud Architecture (AWS)',
        category: 'Technical',
        description: 'Proficiency in designing and deploying scalable applications on Amazon Web Services.',
        levels: {
            beginner: 'Understands core services (EC2, S3); can deploy simple apps.',
            intermediate: 'Designs fault-tolerant systems; optimizes for cost and performance.',
            advanced: 'Architects multi-region serverless solutions; handles advanced networking.',
            expert: 'Defines enterprise cloud strategy; contributes to open source tools.'
        }
    }
];

export default function CompetencyLibraryPage() {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [filter, setFilter] = useState<Category | 'All'>('All');

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const categories = ['All', 'Technical', 'Behavioral', 'Leadership'];

    const filteredCompetencies = filter === 'All'
        ? COMPETENCIES
        : COMPETENCIES.filter(c => c.category === filter);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Book className="w-6 h-6 text-celestial-indigo" />
                        Competency Library
                    </h1>
                    <p className="text-silver-mist text-sm">Define and manage the skills framework for your organization.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Plus className="w-4 h-4" /> Add Competency
                </button>
            </div>

            {/* Filters & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-ink-black dark:text-pearl">142</div>
                        <div className="text-xs text-silver-mist uppercase font-bold">Total Skills</div>
                    </div>
                </div>
                <div className="md:col-span-3 bg-white dark:bg-stellar-blue p-2 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                        <input
                            type="text"
                            placeholder="Find a competency..."
                            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none text-ink-black dark:text-pearl"
                        />
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat as Category | 'All')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${filter === cat
                                    ? 'bg-celestial-indigo text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Competency List */}
            <div className="space-y-4">
                {filteredCompetencies.map(comp => {
                    const isExpanded = expandedIds.includes(comp.id);
                    return (
                        <div key={comp.id} className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden transition-all duration-300">
                            <div
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-deep-cosmos/50"
                                onClick={() => toggleExpand(comp.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 p-2 rounded-lg shrink-0 ${comp.category === 'Leadership' ? 'bg-amber-100 text-amber-600' :
                                        comp.category === 'Technical' ? 'bg-blue-100 text-blue-600' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {comp.category === 'Leadership' && <Users className="w-5 h-5" />}
                                        {comp.category === 'Technical' && <LayoutGrid className="w-5 h-5" />}
                                        {comp.category === 'Behavioral' && <Briefcase className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-ink-black dark:text-pearl">{comp.title}</h3>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                {comp.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-silver-mist">{comp.description}</p>
                                    </div>
                                </div>
                                <div className="text-slate-400">
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </div>

                            {/* Expanded Proficiency Matrix */}
                            {isExpanded && (
                                <div className="border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-deep-cosmos/30 p-6 animate-in slide-in-from-top-2 duration-200">
                                    <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        Proficiency Levels
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                                            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Level 1: Beginner</div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{comp.levels.beginner}</p>
                                        </div>
                                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                                            <div className="text-xs font-bold text-celestial-indigo uppercase mb-2">Level 2: Intermediate</div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{comp.levels.intermediate}</p>
                                        </div>
                                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                                            <div className="text-xs font-bold text-purple-500 uppercase mb-2">Level 3: Advanced</div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{comp.levels.advanced}</p>
                                        </div>
                                        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 border-emerald-200 dark:border-emerald-900/50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/10 rounded-bl-xl"></div>
                                            <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Level 4: Expert</div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{comp.levels.expert}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
