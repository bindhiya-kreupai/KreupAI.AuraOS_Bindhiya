"use client";

import React, { useState } from 'react';
import {
    Activity,
    ShieldAlert,
    Clock,
    DollarSign,
    MapPin,
    AlertCircle,
    CheckCircle,
    X,
    Filter,
    Search
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from 'recharts';

// --- MOCK DATA ---

const ANOMALIES = [
    { id: 1, type: 'Payroll', severity: 'Critical', desc: 'Duplicate salary credit detected for E-492', time: '10 mins ago', user: 'System', icon: DollarSign },
    { id: 2, type: 'Attendance', severity: 'High', desc: 'Geo-fencing violation: Clock-in from prohibited IP (Russia)', time: '45 mins ago', user: 'Alex M.', icon: MapPin },
    { id: 3, type: 'Overtime', severity: 'Medium', desc: 'Unusually high overtime claim (18h) for single shift', time: '2 hours ago', user: 'Sarah K.', icon: Clock },
    { id: 4, type: 'Access', severity: 'Medium', desc: 'Multiple failed login attempts from new device', time: '3 hours ago', user: 'John D.', icon: ShieldAlert },
    { id: 5, type: 'Allowance', severity: 'Low', desc: 'Housing allowance mismatch with Grade B2', time: '5 hours ago', user: 'Admin', icon: DollarSign },
];

const SEVERITY_STATS = [
    { name: 'Critical', count: 5, color: '#ef4444' },
    { name: 'High', count: 12, color: '#f97316' },
    { name: 'Medium', count: 24, color: '#eab308' },
    { name: 'Low', count: 45, color: '#3b82f6' },
];

const TYPE_STATS = [
    { name: 'Attendance', count: 45 },
    { name: 'Payroll', count: 12 },
    { name: 'Security', count: 8 },
    { name: 'Access', count: 21 },
];

// --- COMPONENTS ---

export default function AnomalyDetectionPage() {
    const [selectedTab, setSelectedTab] = useState('All');

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Activity className="w-6 h-6 text-rose-500" />
                        Anomaly Detection
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Real-time monitoring for irregularities in HR data and processes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Severity Chart */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Anomalies by Severity (24h)</h2>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={SEVERITY_STATS} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                                    {SEVERITY_STATS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Type Distribution */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Anomalies by Type</h2>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={TYPE_STATS}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Live Feed */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-indigo-500" />
                        Live Anomaly Feed
                    </h2>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        {['All', 'Critical', 'Unresolved'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${selectedTab === tab ? 'bg-white dark:bg-stellar-blue shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                    {ANOMALIES.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">

                            {/* Icon */}
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.severity === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                    item.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                                        item.severity === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                            'bg-blue-100 text-blue-600'
                                }`}>
                                <item.icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${item.severity === 'Critical' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                            item.severity === 'High' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                item.severity === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                    'bg-blue-50 border-blue-200 text-blue-700'
                                        }`}>
                                        {item.severity}
                                    </span>
                                    <span className="text-xs text-silver-mist font-medium">• {item.type}</span>
                                    <span className="text-xs text-silver-mist font-medium">• {item.time}</span>
                                </div>
                                <p className="text-sm font-semibold text-ink-black dark:text-pearl truncate">{item.desc}</p>
                                <p className="text-xs text-slate-500">Involving: <span className="font-medium text-slate-700 dark:text-slate-300">{item.user}</span></p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg transition-colors border border-emerald-200">
                                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200">
                                    <X className="w-3.5 h-3.5" /> Dismiss
                                </button>
                                <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-colors border border-indigo-200">
                                    Investigate
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center">
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Full Log History</button>
                </div>
            </div>

        </div>
    );
}
