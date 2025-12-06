"use client";

import React, { useState } from 'react';
import {
    Grid,
    Search,
    Download
} from 'lucide-react';

export default function AppDirectoryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Grid className="w-6 h-6 text-indigo-500" />
                        App Directory
                    </h1>
                    <p className="text-slate-500 text-sm">Explore and install third-party integrations.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search apps..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {['All Apps', 'Communication', 'Productivity', 'Finance', 'Security'].map((cat, i) => (
                    <button key={i} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { name: 'Slack', cat: 'Communication', desc: 'Send notifications and updates to Slack channels.', installed: true, icon: 'bg-rose-500' },
                    { name: 'Microsoft Teams', cat: 'Communication', desc: 'Collaborate with your team directly from AuraOS.', installed: false, icon: 'bg-indigo-500' },
                    { name: 'Zoom', cat: 'Productivity', desc: 'Schedule and join meetings instantly.', installed: true, icon: 'bg-blue-500' },
                    { name: 'Google Drive', cat: 'Productivity', desc: 'Access and share files securely.', installed: false, icon: 'bg-emerald-500' },
                    { name: 'Salesforce', cat: 'CRM', desc: 'Sync customer data and sales pipelines.', installed: false, icon: 'bg-sky-500' },
                    { name: 'Jira', cat: 'Project Mgmt', desc: 'Track issues and project progress.', installed: true, icon: 'bg-blue-600' },
                ].map((app, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl ${app.icon} flex items-center justify-center text-white font-bold text-xl`}>
                                {app.name[0]}
                            </div>
                            {app.installed && <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded text-[10px] font-bold uppercase">Installed</div>}
                        </div>
                        <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{app.cat}</p>
                        <p className="text-sm text-slate-500 mb-6 flex-1">{app.desc}</p>

                        <button className={`w-full py-2 rounded-lg text-sm font-bold ${app.installed
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}>
                            {app.installed ? 'Configure' : 'Install'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
