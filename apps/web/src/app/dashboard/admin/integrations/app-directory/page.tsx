"use client";

import React, { useState } from 'react';
import {
    LayoutGrid,
    Search,
    DownloadCloud,
    Check,
    Star,
    ExternalLink
} from 'lucide-react';

export default function AppDirectoryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-indigo-500" />
                        App Directory
                    </h1>
                    <p className="text-slate-500 text-sm">Connect third-party tools and extend AuraOS capabilities.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search apps..."
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                {['All Apps', 'Communication', 'Payroll', 'Productivity', 'Recruiting', 'Security'].map((cat, i) => (
                    <button key={cat} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors
                        ${i === 0 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}
                    `}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full min-h-0 overflow-y-auto pb-20">
                {[
                    { name: 'Slack', cat: 'Communication', users: '20k+', rating: 4.8, installed: true, icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png' },
                    { name: 'Zoom', cat: 'Communication', users: '15k+', rating: 4.7, installed: false, icon: 'https://cdn-icons-png.flaticon.com/512/4401/4401470.png' },
                    { name: 'Google Drive', cat: 'Productivity', users: '50k+', rating: 4.9, installed: true, icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' },
                    { name: 'Jira', cat: 'Productivity', users: '12k+', rating: 4.5, installed: false, icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968875.png' },
                    { name: 'Greenhouse', cat: 'Recruiting', users: '5k+', rating: 4.6, installed: false, icon: 'https://cdn-icons-png.flaticon.com/512/3536/3536505.png' },
                    { name: 'Workday', cat: 'Payroll', users: '8k+', rating: 4.4, installed: false, icon: 'https://cdn-icons-png.flaticon.com/512/16803/16803889.png' },
                ].map((app, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2">
                                {/* Use a first letter fallback if Image fails, normally we'd use next/image but for speed using text/icon here */}
                                <span className="font-bold text-xl text-slate-500">{app.name[0]}</span>
                            </div>
                            {app.installed && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase">
                                    <Check className="w-3 h-3" /> Installed
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                        <div className="text-sm text-slate-500 mb-4">{app.cat}</div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {app.rating}</span>
                            <span>{app.users} users</span>
                        </div>

                        <button className={`w-full mt-auto py-2 rounded-xl text-sm font-bold transition-all
                            ${app.installed
                                ? 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}
                        `}>
                            {app.installed ? 'Configure' : 'Connect'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
