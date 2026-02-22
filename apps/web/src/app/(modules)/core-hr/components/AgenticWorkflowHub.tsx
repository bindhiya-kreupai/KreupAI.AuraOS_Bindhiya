'use client';

import React from 'react';
import {
    Zap,
    BrainCircuit,
    AlertCircle,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    TrendingDown,
    ShieldAlert,
    Search
} from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';

const ANOMALIES = [
    { id: 'AN-22', type: 'Velocity Anomaly', detail: 'Bulk transfer (8 employees) between Aura Dubai and Riyadh initiated outside office hours.', severity: 'High', color: 'text-rose-600 bg-rose-50' },
    { id: 'AN-23', type: 'Path Divergence', detail: 'Position Request for "Lead AI Eng" bypassed regular Finance review.', severity: 'Medium', color: 'text-amber-600 bg-amber-50' },
];

const APPROVAL_PATH_AI = [
    { step: 'Legal Review', time: '1.2h', prediction: '98% Success', confidence: 'High' },
    { step: 'Group CFO', time: '4.8h', prediction: 'Requires Info', confidence: 'Medium' },
];

export function AgenticWorkflowHub() {
    return (
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                        <BrainCircuit className="w-3.5 h-3.5" /> Agentic Intelligence
                    </div>
                    <h2 className="text-xl font-extrabold text-ink-black dark:text-pearl tracking-tight">Administrative Sentinel</h2>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-cloud dark:border-nebula-purple/20">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-silver-mist uppercase">Process Efficiency</p>
                        <p className="text-sm font-extrabold text-emerald-600">88.4% (+2.1%)</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-[spin_3s_linear_infinite]" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Anomaly Detection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-silver-mist uppercase tracking-widest">Anomaly Detection</h3>
                        <span className="text-[10px] font-bold text-rose-600 animate-pulse flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Live Scanning
                        </span>
                    </div>
                    <div className="space-y-3">
                        {ANOMALIES.map(anom => (
                            <div key={anom.id} className="p-4 rounded-2xl border border-cloud dark:border-nebula-purple/10 bg-slate-50/50 dark:bg-slate-800/10 group hover:border-rose-400/50 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter", anom.color)}>{anom.severity}</span>
                                        <h4 className="text-sm font-bold text-ink-black dark:text-pearl">{anom.type}</h4>
                                    </div>
                                    <span className="text-[10px] text-silver-mist font-medium">{anom.id}</span>
                                </div>
                                <p className="text-xs text-silver-mist leading-relaxed mb-3">{anom.detail}</p>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 text-[10px] font-bold bg-white dark:bg-slate-800 border border-cloud dark:border-nebula-purple/20 rounded-lg hover:shadow-md transition-all">Dismiss</button>
                                    <button className="flex-1 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Investigate</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Approval Insights */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-silver-mist uppercase tracking-widest px-1">AI Bottleneck Predictions</h3>
                    <div className="bg-indigo-900 rounded-3xl p-5 text-white overflow-hidden relative shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="relative space-y-4">
                            {APPROVAL_PATH_AI.map(item => (
                                <div key={item.step} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-100">{item.step}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] flex items-center gap-1 font-bold"><Clock className="w-3 h-3 text-indigo-300" /> Avg {item.time}</span>
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded-lg",
                                                item.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                            )}>{item.prediction}</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                            <div className="pt-2 text-center">
                                <p className="text-[10px] text-indigo-200 italic mb-3">AI identifies "Group CFO" as a likely bottleneck for 48% of Q1 transfers.</p>
                                <button className="w-full py-2 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-[1.02] transition-transform">
                                    Optimize Approval Paths
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-700/70 uppercase">Auto-Pilot Enabled</p>
                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">14 routine requests were auto-approved by AI today.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
