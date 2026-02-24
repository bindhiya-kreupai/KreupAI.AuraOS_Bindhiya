"use client";

import React, { useState } from 'react';
import {
    Plug,
    Search,
    Key,
    Copy,
    CheckCircle
} from 'lucide-react';

export default function ApiMarketplacePage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Plug className="w-6 h-6 text-indigo-500" />
                        API Marketplace
                    </h1>
                    <p className="text-slate-500 text-sm">Discover and manage API connections.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search APIs..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Active Keys */}
                <div className="lg:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">Your API Keys</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">Manage access tokens for your applications.</p>
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Key className="w-4 h-4" /> Generate New Key
                    </button>
                </div>

                {/* API List */}
                {[
                    { name: 'Core HR API', desc: 'Access employee data, org structure, and more.', version: 'v2.1', status: 'Connected', usage: 'High' },
                    { name: 'Payroll API', desc: 'Read-only access to payroll cycles and payslips.', version: 'v1.0', status: 'Not Connected', usage: 'None' },
                    { name: 'Recruitment API', desc: 'Manage job postings and candidate applications.', version: 'v1.5', status: 'Connected', usage: 'Medium' },
                    { name: 'Learning API', desc: 'Sync course progress and completion data.', version: 'v1.2', status: 'Not Connected', usage: 'None' },
                ].map((api, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <Plug className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{api.name}</h3>
                                    <span className="text-xs font-mono text-slate-400">{api.version}</span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${api.status === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>{api.status}</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">{api.desc}</p>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-400 uppercase">Usage: {api.usage}</span>
                            <div className="flex gap-2">
                                <button className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Docs</button>
                                <button className="text-sm font-bold text-indigo-600 hover:underline">
                                    {api.status === 'Connected' ? 'Manage' : 'Connect'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

