"use client";

import React, { useState } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    Calendar,
    CheckCircle2,
    FileText,
    TrendingUp,
    AlertOctagon,
    Filter,
    Search,
    ChevronRight,
    Scale
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

// --- MOCK DATA ---

const COMPLIANCE_SCORE = 92;

const UPCOMING_DEADLINES = [
    { id: 1, title: 'PF Monthly Return', dueDate: 'Dec 15, 2025', category: 'Payroll', status: 'Due Soon', priority: 'High' },
    { id: 2, title: 'Professional Tax Filing', dueDate: 'Dec 20, 2025', category: 'Tax', status: 'Pending', priority: 'Medium' },
    { id: 3, title: 'Annual Labor Return', dueDate: 'Dec 31, 2025', category: 'Labor Law', status: 'On Track', priority: 'High' },
];

const VIOLATIONS = [
    { id: 1, title: 'Missing POSH Committee', severity: 'Critical', identifiedBy: 'Internal Audit', date: 'Dec 01, 2025', status: 'Open' },
    { id: 2, title: 'ESI Contribution Mismatch', severity: 'Medium', identifiedBy: 'System', date: 'Nov 28, 2025', status: 'In Progress' },
    { id: 3, title: 'Expired Fire Safety Cert', severity: 'High', identifiedBy: 'Admin', date: 'Nov 15, 2025', status: 'Resolved' },
];

const RISK_DISTRIBUTION = [
    { name: 'Labor Law', value: 35, color: '#f59e0b' },
    { name: 'Taxation', value: 25, color: '#6366f1' },
    { name: 'Workplace Safety', value: 20, color: '#10b981' },
    { name: 'Data Privacy', value: 20, color: '#ec4899' },
];

export default function ComplianceAuditPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Scale className="w-6 h-6 text-emerald-500" />
                        Compliance Audit
                    </h1>
                    <p className="text-silver-mist text-sm">Monitor statutory adherence, track violations, and manage regulatory risks.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-rose-500/20">
                        <AlertOctagon className="w-4 h-4" /> Report Violation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Score & Calendar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Compliance Score Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold opacity-90 mb-1 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" /> Overall Compliance
                            </h3>
                            <div className="flex items-end gap-2 mt-4">
                                <span className="text-5xl font-bold">{COMPLIANCE_SCORE}%</span>
                                <span className="text-sm font-bold opacity-80 mb-2">Excellent</span>
                            </div>
                            <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${COMPLIANCE_SCORE}%` }}
                                    className="h-full bg-white opacity-80 rounded-full"
                                />
                            </div>
                            <div className="text-xs opacity-70 mt-2">Last Audit: Dec 04, 2025</div>
                        </div>
                    </div>

                    {/* Statutory Calendar */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" /> Statutory Deadlines
                        </h3>
                        <div className="space-y-4">
                            {UPCOMING_DEADLINES.map(task => (
                                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-cloud dark:border-slate-800 hover:border-indigo-300 transition-colors bg-white dark:bg-slate-900/40">
                                    <div className="flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-[50px] text-center hidden sm:flex">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">{task.dueDate.split(&apos; ')[0]}</span>
                                        <span className="text-lg font-bold text-ink-black dark:text-pearl">{task.dueDate.split(&apos; ')[1].replace(',', '')}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-ink-black dark:text-pearl">{task.title}</h4>
                                            {task.priority === 'High' && <span className="w-2 h-2 rounded-full bg-rose-500 mt-1"></span>}
                                        </div>
                                        <div className="text-xs text-silver-mist mt-1 mb-2">{task.category}</div>
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block
                                            ${task.status === 'Due Soon' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                task.status === 'On Track' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                    'bg-slate-100 text-slate-600'}
                                        `}>
                                            {task.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle: Violation Log */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-rose-500" /> Risk & Violations Log
                            </h3>
                            <div className="flex gap-2 text-xs">
                                <span className="font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded">1 Critical</span>
                                <span className="font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">1 Medium</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-silver-mist uppercase">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Violation</th>
                                        <th className="px-4 py-3">Severity</th>
                                        <th className="px-4 py-3">Identified Date</th>
                                        <th className="px-4 py-3">Source</th>
                                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cloud dark:divide-slate-800">
                                    {VIOLATIONS.map(v => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                                            <td className="px-4 py-3 font-bold text-ink-black dark:text-pearl">{v.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase
                                                    ${v.severity === 'Critical' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' :
                                                        v.severity === 'High' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
                                                            'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}
                                                `}>
                                                    {v.severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{v.date}</td>
                                            <td className="px-4 py-3 text-xs font-bold">{v.identifiedBy}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${v.status === 'Resolved' ? 'bg-emerald-500' : v.status === 'Open' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                                                        <span>{v.status}</span>
                                                    </div>
                                                    <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-indigo-500 hover:underline">
                                                        Resolutions
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom: Risk Distribution Chart */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-500" /> Risk Categories
                        </h3>
                        <div className="h-48 w-full flex items-center gap-8">
                            <ResponsiveContainer width="40%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={RISK_DISTRIBUTION}
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {RISK_DISTRIBUTION.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {RISK_DISTRIBUTION.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <div>
                                            <div className="text-xs text-silver-mist">{item.name}</div>
                                            <div className="font-bold text-sm">{item.value}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
