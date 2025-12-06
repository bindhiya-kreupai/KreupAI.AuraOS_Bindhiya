"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Database,
    Zap,
    Server,
    Cpu,
    AlertOctagon,
    CheckCircle2,
    RefreshCw,
    Play,
    Pause,
    BarChart3,
    Terminal,
    HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---

const SERVICES = [
    { name: 'API Gateway', status: 'Healthy', latency: '45ms', uptime: '99.99%', icon: Server, color: 'text-emerald-500' },
    { name: 'PostgreSQL DB', status: 'Healthy', latency: '12ms', uptime: '99.95%', icon: Database, color: 'text-indigo-500' },
    { name: 'Redis Cache', status: 'Healthy', latency: '2ms', uptime: '100%', icon: Zap, color: 'text-rose-500' },
    { name: 'File Storage', status: 'Degraded', latency: '850ms', uptime: '98.50%', icon: HardDrive, color: 'text-amber-500' },
];

const JOB_QUEUES = [
    { name: 'EmailWorker', active: 12, waiting: 450, failed: 0, status: 'Processing' },
    { name: 'PayrollEngine', active: 4, waiting: 0, failed: 0, status: 'Idle' },
    { name: 'ReportGenerator', active: 1, waiting: 5, failed: 2, status: 'Processing' },
];

const LOGS = [
    { time: '10:45:22', level: 'INFO', msg: 'Job #44592 completed successfully.' },
    { time: '10:45:24', level: 'INFO', msg: 'GET /api/users/me - 200 OK' },
    { time: '10:45:28', level: 'WARN', msg: 'High memory usage detected on worker-02' },
    { time: '10:45:30', level: 'INFO', msg: 'Scheduled task "DailyBackup" started.' },
];

export default function SystemHealthPage() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [simulatedLoad, setSimulatedLoad] = useState(45);

    // Simulate live metric updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSimulatedLoad(prev => Math.min(100, Math.max(10, prev + (Math.random() > 0.5 ? 5 : -5))));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-500" />
                        System Health
                    </h1>
                    <p className="text-slate-500 text-sm">Real-time infrastructure monitoring and diagnostics.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <span className="text-xs font-bold text-slate-500">Maintenance Mode</span>
                        <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className={`w-10 h-6 rounded-full p-0.5 transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Metrics & Services */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                        {SERVICES.map(service => (
                            <div key={service.name} className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-slate-200 dark:border-nebula-purple/50 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <service.icon className={`w-5 h-5 ${service.color}`} />
                                    <div className={`w-2 h-2 rounded-full ${service.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                </div>
                                <h3 className="font-bold text-sm truncate">{service.name}</h3>
                                <div className="mt-2 flex justify-between text-xs text-slate-500">
                                    <span>Latency</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{service.latency}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Uptime</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{service.uptime}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Area (Visual Mock) */}
                    <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Load Chart */}
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-slate-200 dark:border-nebula-purple/50 shadow-sm flex flex-col">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-indigo-500" /> System Load
                            </h3>
                            <div className="flex-1 flex items-end justify-between gap-1 px-2 h-32">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full bg-indigo-100 dark:bg-indigo-900 rounded-t-sm transition-all duration-300"
                                        style={{ height: `${Math.random() * 80 + 10}%` }}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4">
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 font-bold">Current Load</div>
                                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{simulatedLoad}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 font-bold">Peak (24h)</div>
                                    <div className="text-xl font-black text-slate-700 dark:text-slate-300">88%</div>
                                </div>
                            </div>
                        </div>

                        {/* Error Rate */}
                        <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-slate-200 dark:border-nebula-purple/50 shadow-sm flex flex-col">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <AlertOctagon className="w-5 h-5 text-rose-500" /> Error Rate
                            </h3>
                            <div className="flex-1 flex items-center justify-center relative">
                                <div className="w-32 h-32 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                    <span className="text-2xl font-black text-emerald-500">0.02%</span>
                                </div>
                                <div className="absolute top-0 right-0 p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-xs font-bold">
                                    Healthy
                                </div>
                            </div>
                            <div className="text-center text-xs text-slate-500 mt-2">Errors per 10k requests</div>
                        </div>
                    </div>
                </div>

                {/* Right: Queues & Logs */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Job Queues */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-slate-200 dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-indigo-500" /> Job Queues
                            </h3>
                            <span className="text-xs font-bold text-emerald-500 animate-pulse">● Live</span>
                        </div>

                        <div className="space-y-3">
                            {JOB_QUEUES.map(queue => (
                                <div key={queue.name} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-bold text-sm">{queue.name}</div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${queue.status === 'Processing' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {queue.status}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded py-1">
                                            <div className="font-bold text-emerald-600">{queue.active}</div>
                                            <div className="text-[9px] text-slate-400">Active</div>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded py-1">
                                            <div className="font-bold text-amber-600">{queue.waiting}</div>
                                            <div className="text-[9px] text-slate-400">Waiting</div>
                                        </div>
                                        <div className="bg-rose-50 dark:bg-rose-900/20 rounded py-1">
                                            <div className="font-bold text-rose-600">{queue.failed}</div>
                                            <div className="text-[9px] text-slate-400">Failed</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Logs */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex-1 flex flex-col overflow-hidden font-mono text-xs">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                            <span className="font-bold text-slate-400 flex items-center gap-2">
                                <Terminal className="w-4 h-4" /> System Logs
                            </span>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1.5 text-slate-300">
                            {LOGS.map((log, i) => (
                                <div key={i} className="flex gap-2 opacity-80 hover:opacity-100 transition-opacity">
                                    <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                                    <span className={`shrink-0 font-bold ${log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'}`}>{log.level}</span>
                                    <span className="truncate">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
