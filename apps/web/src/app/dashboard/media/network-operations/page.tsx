"use client";

import React, { useState } from 'react';
import {
    Network,
    AlertTriangle,
    CheckCircle,
    Settings
} from 'lucide-react';

export default function NetworkOperationsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Network className="w-6 h-6 text-indigo-500" />
                        Network Operations Center
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor infrastructure health, alerts, and maintenance.</p>
                </div>
                <button className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Config
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Active Alerts</h3>
                        <div className="space-y-3">
                            {[
                                { msg: 'High packet loss on fiber-optic-node-04', sev: 'Critical', time: '2m ago' },
                                { msg: 'Latency spike in South-East region', sev: 'Warning', time: '15m ago' },
                                { msg: 'Scheduled maintenance for DB-Cluster-02', sev: 'Info', time: '1h ago' },
                            ].map((alert, i) => (
                                <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${alert.sev === 'Critical' ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30' :
                                        alert.sev === 'Warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' :
                                            'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                                    }`}>
                                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.sev === 'Critical' ? 'text-rose-500' :
                                            alert.sev === 'Warning' ? 'text-amber-500' : 'text-indigo-500'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{alert.msg}</div>
                                        <div className="text-xs text-slate-500 mt-1">{alert.time}</div>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">{alert.sev}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Infrastructure Map</h3>
                        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            <div className="text-slate-400 font-bold flex flex-col items-center">
                                <Network className="w-12 h-12 mb-2 opacity-50" />
                                <span>Interactive Map Visualization Placeholder</span>
                                <span className="text-xs font-normal opacity-70">(Requires WebGL)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-4">System Health</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Core Network', status: 'Healthy', uptime: '99.99%', load: 45 },
                            { name: 'Edge Servers', status: 'Healthy', uptime: '99.95%', load: 72 },
                            { name: 'Database Cluster', status: 'Maint', uptime: '98.50%', load: 12 },
                            { name: 'Auth Service', status: 'Healthy', uptime: '100%', load: 28 },
                        ].map((sys, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-bold text-sm">{sys.name}</div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${sys.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                        }`}>{sys.status}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Load: {sys.load}%</span>
                                    <span>Uptime: {sys.uptime}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full ${sys.load > 80 ? 'bg-rose-500' :
                                            sys.load > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} style={{ width: `${sys.load}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400">Maintenance Window</h4>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Next: Sunday 02:00</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Regular maintenance scheduled for Asian region servers to upgrade firmware. Expected downtime: 15 mins.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
