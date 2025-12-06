"use client";

import React, { useState } from 'react';
import {
    Share2,
    Globe,
    CheckCircle2,
    ToggleRight,
    ToggleLeft,
    ExternalLink,
    RefreshCw,
    Linkedin,
    Building
} from 'lucide-react';

const INTEGRATIONS = [
    { id: 'LI-001', name: 'LinkedIn Jobs', icon: Linkedin, status: 'Connected', posts: 12, lastSync: '10 mins ago' },
    { id: 'IND-002', name: 'Indeed', icon: Building, status: 'Connected', posts: 8, lastSync: '1 hour ago' },
    { id: 'GL-003', name: 'Glassdoor', icon: Share2, status: 'Disconnected', posts: 0, lastSync: 'Never' },
];

export default function JobBoardsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        Job Board Integrations
                    </h1>
                    <p className="text-slate-500 text-sm">Automatically cross-post job openings to external platforms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {INTEGRATIONS.map(board => (
                    <div key={board.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-lg transition-all">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
                            ${board.status === 'Connected' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
                        `}>
                            <board.icon className="w-8 h-8" />
                        </div>

                        <h3 className="font-bold text-lg">{board.name}</h3>
                        <div className={`mt-2 mb-6 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                             ${board.status === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                        `}>
                            {board.status === 'Connected' && <CheckCircle2 className="w-3 h-3" />}
                            {board.status}
                        </div>

                        {board.status === 'Connected' ? (
                            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Active Posts</span>
                                    <span className="font-bold">{board.posts}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Last Sync</span>
                                    <span className="font-bold">{board.lastSync}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-24 mb-6 flex items-center justify-center text-sm text-slate-400 italic">
                                Connect to start posting
                            </div>
                        )}

                        <button className={`w-full py-2 rounded-xl font-bold text-sm transition-colors border
                            ${board.status === 'Connected'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600 border-transparent shadow-lg shadow-indigo-500/20'}
                        `}>
                            {board.status === 'Connected' ? 'Disconnect' : 'Connect Account'}
                        </button>
                    </div>
                ))}

                {/* Coming Soon Card */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                    <Globe className="w-8 h-8 mb-4 opacity-50" />
                    <span className="font-bold">More Coming Soon</span>
                    <span className="text-xs mt-1">ZipRecruiter, Monster, etc.</span>
                </div>
            </div>
        </div>
    );
}
