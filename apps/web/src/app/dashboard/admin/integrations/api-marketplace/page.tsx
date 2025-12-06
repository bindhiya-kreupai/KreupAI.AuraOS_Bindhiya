"use client";

import React from 'react';
import {
    Code,
    Key,
    Copy,
    Eye,
    EyeOff,
    Terminal,
    BookOpen,
    ShieldAlert
} from 'lucide-react';

export default function APIMarketplacePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Code className="w-6 h-6 text-indigo-500" />
                        API Marketplace
                    </h1>
                    <p className="text-slate-500 text-sm">Developer tools, API keys, and documentation.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Key className="w-4 h-4" /> Generate New Key
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* API Keys */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-500" /> Active API Keys
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {[
                            { name: 'Production - Payroll Service', prefix: 'sk_live_51M...', created: '2024-01-15', lastUsed: 'Just now', scope: 'Read/Write' },
                            { name: 'Staging - Mobile App', prefix: 'sk_test_49J...', created: '2024-03-10', lastUsed: '2 days ago', scope: 'Read Only' },
                            { name: 'Dev - Internal Tool', prefix: 'sk_test_22A...', created: '2024-05-22', lastUsed: '1 week ago', scope: 'Full Access' },
                        ].map((key, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{key.name}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 flex items-center gap-1">
                                            {key.prefix} <Copy className="w-3 h-3 cursor-pointer hover:text-indigo-500" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 rounded">{key.scope}</span>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <div className="text-xs text-slate-500">Last used: <span className="font-bold text-slate-700 dark:text-slate-300">{key.lastUsed}</span></div>
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button className="text-xs font-bold text-indigo-600 hover:underline">Roll Key</button>
                                        <button className="text-xs font-bold text-rose-600 hover:underline">Revoke</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documentation & Usage */}
                <div className="space-y-6">
                    {/* Usage Limits */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" /> Usage Quotas
                        </h3>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-500 uppercase">Requests / Month</span>
                                <span className="text-slate-700 dark:text-slate-300">854,200 / 1,000,000</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[85%]"></div>
                            </div>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl">
                            <p className="text-xs text-amber-800 dark:text-amber-500">
                                You are approaching your monthly limit (85%). Consider upgrading your plan to Enterprise for unlimited calls.
                            </p>
                        </div>
                    </div>

                    {/* Quick Docs */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-emerald-400" /> Quick Start
                        </h3>
                        <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-slate-300 mb-4 overflow-x-auto">
                            curl -X GET https://api.auraos.io/v1/employees \<br />
                            -H "Authorization: Bearer sk_live_..."
                        </div>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                            <BookOpen className="w-4 h-4" /> View Full Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
