"use client";

import React, { useState } from 'react';
import {
    Webhook,
    Plus,
    Activity,
    Trash2
} from 'lucide-react';

export default function WebhookManagerPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Webhook className="w-6 h-6 text-indigo-500" />
                        Webhook Manager
                    </h1>
                    <p className="text-slate-500 text-sm">Configure event callbacks and monitor deliveries.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Webhook
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><Activity className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">99.9%</div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Delivery Rate</div>
                        </div>
                    </div>
                </div>

                {/* Webhook List */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Target URL</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Recent Delivery</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { event: 'employee.created', url: 'https://api.example.com/hooks/new-hire', status: 'Active', last: '2 mins ago (200 OK)' },
                                { event: 'leave.approved', url: 'https://slack.com/api/webhooks/...', status: 'Active', last: '1 hour ago (200 OK)' },
                                { event: 'payroll.finalized', url: 'https://finance-Sys.internal/sync', status: 'Paused', last: '2 days ago (500 Error)' },
                            ].map((hook, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{hook.event}</td>
                                    <td className="px-6 py-4 font-mono text-slate-500 truncate max-w-xs">{hook.url}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${hook.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                            }`}>{hook.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${hook.last.includes('200') ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {hook.last}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold text-xs">Edit</button>
                                        <button className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

