"use client";

import React, { useState } from 'react';
import {
    Radio,
    Plus,
    Activity,
    CheckCircle2,
    XCircle,
    RotateCw,
    Trash2,
    MoreVertical
} from 'lucide-react';

export default function WebhooksPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Radio className="w-6 h-6 text-indigo-500" />
                        Webhooks
                    </h1>
                    <p className="text-slate-500 text-sm">Subscribe to real-time events and configure delivery endpoints.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Add Endpoint
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Endpoints List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg">Active Subscriptions</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {[
                            {
                                url: 'https://api.slack-integration.com/hooks/aura',
                                events: ['employee.created', 'leave.approved'],
                                status: 'Healthy',
                                success: 99.8
                            },
                            {
                                url: 'https://internal-payroll.acme.com/sync',
                                events: ['payroll.processed'],
                                status: 'Failing',
                                success: 45.2
                            },
                            {
                                url: 'https://analytics-collector.aws.com/ingest',
                                events: ['*'],
                                status: 'Healthy',
                                success: 100
                            },
                        ].map((hook, i) => (
                            <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-mono text-sm font-bold text-indigo-600 truncate max-w-sm">{hook.url}</div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1
                                            ${hook.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                        `}>
                                            {hook.status === 'Healthy' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {hook.status}
                                        </span>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    {hook.events.map(e => (
                                        <span key={e} className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{e}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span>Success Rate: <span className={hook.success > 98 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{hook.success}%</span></span>
                                    <span>Latency: 120ms</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Logs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Recent Deliveries
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3">
                        {[
                            { id: 'evt_1092830', type: 'employee.updated', time: '2s ago', status: 200 },
                            { id: 'evt_1092829', type: 'employee.updated', time: '2s ago', status: 200 },
                            { id: 'evt_1092828', type: 'leave.rejected', time: '1m ago', status: 500 },
                            { id: 'evt_1092827', type: 'payroll.generated', time: '5m ago', status: 200 },
                            { id: 'evt_1092826', type: 'payroll.generated', time: '5m ago', status: 404 },
                        ].map((log, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm">
                                <div>
                                    <div className="font-mono text-xs font-bold text-slate-500">{log.type}</div>
                                    <div className="text-[10px] text-slate-400">{log.id} • {log.time}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono
                                    ${log.status === 200 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                                `}>
                                    {log.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2">
                        <RotateCw className="w-3 h-3" /> Refresh Logs
                    </button>
                </div>
            </div>
        </div>
    );
}
