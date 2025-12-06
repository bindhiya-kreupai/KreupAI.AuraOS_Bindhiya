"use client";

import React, { useState } from 'react';
import {
    Map,
    BookOpen,
    CheckCircle2,
    Lock,
    PlayCircle,
    Award,
    Clock,
    ChevronRight,
    Star,
    MoreHorizontal
} from 'lucide-react';

// --- MOCK DATA ---

interface PathModule {
    id: string;
    title: string;
    type: 'Course' | 'Video' | 'Quiz' | 'Project';
    duration: string;
    status: 'Completed' | 'In Progress' | 'Locked';
}

interface LearningPath {
    id: string;
    title: string;
    description: string;
    progress: number;
    totalModules: number;
    completedModules: number;
    estimatedTime: string;
    modules: PathModule[];
}

const ACTIVE_PATH: LearningPath = {
    id: 'PATH-001',
    title: 'New Manager Onboarding',
    description: 'Essential skills for first-time people managers.',
    progress: 45,
    totalModules: 5,
    completedModules: 2,
    estimatedTime: '12 Hours',
    modules: [
        { id: 'MOD-1', title: 'Company Culture & Values', type: 'Course', duration: '2h', status: 'Completed' },
        { id: 'MOD-2', title: 'HR Policies 101', type: 'Video', duration: '45m', status: 'Completed' },
        { id: 'MOD-3', title: 'Effective Communication', type: 'Course', duration: '3h', status: 'In Progress' },
        { id: 'MOD-4', title: 'Conflict Resolution', type: 'Quiz', duration: '30m', status: 'Locked' },
        { id: 'MOD-5', title: 'Leadership Capstone', type: 'Project', duration: '5h', status: 'Locked' },
    ]
};

const RECOMMENDED_PATHS = [
    {
        id: 'PATH-002',
        title: 'React & Next.js Mastery',
        modules: 12,
        duration: '24h',
        rating: 4.8,
        image: 'bg-blue-500' // Mock color
    },
    {
        id: 'PATH-003',
        title: 'Cybersecurity Awareness',
        modules: 4,
        duration: '2h',
        rating: 4.5,
        image: 'bg-emerald-500'
    },
    {
        id: 'PATH-004',
        title: 'Data Science Fundamentals',
        modules: 8,
        duration: '16h',
        rating: 4.7,
        image: 'bg-purple-500'
    }
];

export default function LearningPathsPage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Map className="w-6 h-6 text-celestial-indigo" />
                        Learning Paths
                    </h1>
                    <p className="text-silver-mist text-sm">Guided curriculums tailored for your career growth.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
                    Browse Library
                </button>
            </div>

            {/* Current Focus: Hero Card */}
            <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-cloud dark:border-nebula-purple/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="text-xs font-bold text-celestial-indigo uppercase mb-1">Current Focus</div>
                        <h2 className="text-xl font-bold text-ink-black dark:text-pearl">{ACTIVE_PATH.title}</h2>
                        <p className="text-sm text-silver-mist mt-1">{ACTIVE_PATH.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="text-2xl font-bold text-ink-black dark:text-pearl">{ACTIVE_PATH.progress}%</div>
                        <div className="w-32 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-celestial-indigo h-full" style={{ width: `${ACTIVE_PATH.progress}%` }}></div>
                        </div>
                        <div className="text-xs text-silver-mist mt-1">{ACTIVE_PATH.completedModules}/{ACTIVE_PATH.totalModules} Modules • {ACTIVE_PATH.estimatedTime} Left</div>
                    </div>
                </div>

                {/* Timeline Visual */}
                <div className="p-6 bg-slate-50 dark:bg-deep-cosmos/30">
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                            {ACTIVE_PATH.modules.map((module, i) => (
                                <div key={module.id} className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0 group">
                                    {/* Status Icon */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-colors ${module.status === 'Completed' ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900 text-white' :
                                            module.status === 'In Progress' ? 'bg-white dark:bg-stellar-blue border-celestial-indigo text-celestial-indigo' :
                                                'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                        }`}>
                                        {module.status === 'Completed' && <CheckCircle2 className="w-5 h-5" />}
                                        {module.status === 'In Progress' && <PlayCircle className="w-5 h-5" />}
                                        {module.status === 'Locked' && <Lock className="w-5 h-5" />}
                                    </div>

                                    {/* Line for Mobile */}
                                    <div className={`flex-1 h-0.5 md:hidden ${module.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                                    {/* Details */}
                                    <div className="mt-0 md:mt-4 text-left md:text-center w-full">
                                        <div className={`text-xs font-bold uppercase mb-1 ${module.status === 'Completed' ? 'text-emerald-600' :
                                                module.status === 'In Progress' ? 'text-celestial-indigo' :
                                                    'text-slate-400'
                                            }`}>
                                            {module.status === 'In Progress' ? 'Resume' : module.status}
                                        </div>
                                        <h4 className="text-sm font-bold text-ink-black dark:text-pearl line-clamp-2 md:h-10 mb-1">{module.title}</h4>
                                        <div className="flex items-center justify-start md:justify-center gap-2 text-xs text-silver-mist">
                                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {module.type}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {module.duration}</span>
                                        </div>
                                    </div>

                                    {/* Action Button (Mobile) */}
                                    <button className="md:hidden p-2 text-slate-400">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resume Button */}
                    <div className="mt-8 flex justify-center">
                        <button className="px-8 py-3 bg-celestial-indigo text-white rounded-full font-bold text-sm shadow-lg shadow-celestial-indigo/25 hover:scale-105 transition-transform flex items-center gap-2">
                            <PlayCircle className="w-5 h-5" /> Continue: Effective Communication
                        </button>
                    </div>
                </div>
            </div>

            {/* Recommended Section */}
            <div>
                <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Recommended for You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {RECOMMENDED_PATHS.map(path => (
                        <div key={path.id} className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                            <div className={`h-32 ${path.image} relative`}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {path.rating}
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-ink-black dark:text-pearl mb-2 group-hover:text-celestial-indigo transition-colors">{path.title}</h4>
                                <div className="flex items-center justify-between text-xs text-silver-mist mb-4">
                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {path.modules} Modules</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {path.duration}</span>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">Beginner</span>
                                </div>
                                <button className="w-full py-2 border border-celestial-indigo text-celestial-indigo rounded-lg text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                    Start Path
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
