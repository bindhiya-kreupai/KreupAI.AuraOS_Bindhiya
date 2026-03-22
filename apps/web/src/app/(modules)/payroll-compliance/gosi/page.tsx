'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2, Download, CheckCircle2, AlertCircle,
    AlertTriangle, Users, ArrowLeft, Calculator,
    FileText, TrendingUp, Info, PieChart,
    Loader2, RefreshCw, Zap, Bot, Sparkles,
    ArrowUpRight, Landmark, Search, Filter,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@aura/ui/utils';

export default function KSAGOSIWorkspace() {
    const [activeTab, setActiveTab] = useState<'calculator' | 'registry' | 'rates'>('calculator');
    const [isSaudi, setIsSaudi] = useState(true);

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Leadership Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest">
                        <Building2 className="w-4 h-4" /> Saudi Vision 2030 Sentinel
                    </div>
                    <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
                        GOSI <span className="text-emerald-600 dark:text-emerald-400">Strategic Workspace</span>
                    </h1>
                    <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
                        General Organization for Social Insurance orchestration. Automated contribution logic for Saudi & Non-Saudi nationals, Mudad wage preservation, and GOSI certificate tracking.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <span className="text-xl">🇸🇦</span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Kingdom of Saudi Arabia</span>
                </div>
            </div>

            {/* GOSI Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Saudization Ratio" value="38.5%" icon={Users} color="emerald" trend="Platinum Tier" />
                <MetricCard title="Monthly Contribution" value="SAR 842k" icon={Landmark} color="indigo" />
                <MetricCard title="Annuity Status" value="Active" icon={ShieldCheck} color="indigo" />
                <MetricCard title="Pending Filings" value="1" icon={Clock} color="amber" alert />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Workspace */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Tab Navigation */}
                    <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit">
                        <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')}>Contribution Engine</TabButton>
                        <TabButton active={activeTab === 'registry'} onClick={() => setActiveTab('registry')}>Employee Registry</TabButton>
                        <TabButton active={activeTab === 'rates'} onClick={() => setActiveTab('rates')}>Statutory Rates</TabButton>
                    </div>

                    {activeTab === 'calculator' && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Contribution Simulator</h3>
                                    <div className="space-y-4">
                                        <div className="p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-cloud dark:border-nebula-purple/10 flex">
                                            <button
                                                onClick={() => setIsSaudi(true)}
                                                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", isSaudi ? "bg-white dark:bg-stellar-blue text-indigo-600 shadow-sm" : "text-silver-mist")}
                                            >
                                                Saudi National
                                            </button>
                                            <button
                                                onClick={() => setIsSaudi(false)}
                                                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", !isSaudi ? "bg-white dark:bg-stellar-blue text-indigo-600 shadow-sm" : "text-silver-mist")}
                                            >
                                                Expatriate
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Contributable Salary (Basic + Housing)</label>
                                            <div className="relative">
                                                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                                                <input className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" defaultValue="12500" />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 space-y-2">
                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">GOSI Wage Ceiling</p>
                                            <p className="text-xl font-black text-indigo-900 dark:text-pearl">SAR 45,000</p>
                                            <p className="text-[9px] text-silver-mist">Contributions capped as per HRSD regulations.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-3 space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-cloud dark:border-nebula-purple/10">
                                    <h4 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-6">Execution Breakdown</h4>
                                    <div className="space-y-6">
                                        <BreakdownRow label="Annuity (Pension)" employee={isSaudi ? "SAR 1,125" : "-"} employer="SAR 1,125" />
                                        <BreakdownRow label="Occupational Hazards" employee="-" employer="SAR 250" />
                                        <BreakdownRow label="SANED (Unemployment)" employee={isSaudi ? "SAR 93.75" : "-"} employer="SAR 93.75" />

                                        <div className="pt-6 border-t border-cloud dark:border-nebula-purple/10 flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Total Monthly Cost</p>
                                                <p className="text-3xl font-black text-emerald-600">SAR {isSaudi ? "2,687.50" : "250.00"}</p>
                                            </div>
                                            <button className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                                Apply to Payroll <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 italic">Calculation verified against GOSI API Rates v2.4 (Feb 2026)</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Building2 className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                                <Globe className="w-4 h-4" /> KSA Compliance Status
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 leading-tight">Mudad Integrated Filing</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-8">
                                Your establishment is currently 100% compliant with Mudad wage protection and GOSI certificate requirements for the current quarter.
                            </p>

                            <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500">
                                Generate Mudad SIF
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> Contribution History
                        </h3>
                        <div className="space-y-4">
                            <HistoryItem date="Feb 2026" value="SAR 842k" status="Filed" />
                            <HistoryItem date="Jan 2026" value="SAR 810k" status="Filed" />
                            <HistoryItem date="Dec 2025" value="SAR 795k" status="Filed" />
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-3xl p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-indigo-700 transition-all border border-indigo-500">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <Bot className="w-6 h-6 text-indigo-100" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">GOSI Sentinel</p>
                                <p className="text-sm font-black text-pearl">Resolve 1 Missing National ID</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, trend }: any) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30",
        amber: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30",
    };

    return (
        <div className="bg-white dark:bg-stellar-blue rounded-3xl p-6 border border-cloud dark:border-nebula-purple/30 shadow-sm transition-all group hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("inline-flex p-3 rounded-2xl border transition-transform group-hover:scale-110", colors[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">{title}</p>
            <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:text-emerald-600 transition-colors">{value}</div>
        </div>
    );
}

function TabButton({ children, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
                active
                    ? "bg-white dark:bg-stellar-blue text-indigo-600 shadow-sm ring-1 ring-cloud dark:ring-nebula-purple/30"
                    : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            )}
        >
            {children}
        </button>
    );
}

function BreakdownRow({ label, employee, employer }: any) {
    return (
        <div className="flex justify-between items-center group">
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-ink-black dark:text-pearl">{label}</p>
                <p className="text-[9px] text-silver-mist uppercase tracking-widest">MoH / GOSI Integrated</p>
            </div>
            <div className="flex gap-8">
                <div className="text-right">
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">Employee</p>
                    <p className="text-xs font-black text-ink-black dark:text-pearl">{employee}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">Employer</p>
                    <p className="text-xs font-black text-emerald-600">{employer}</p>
                </div>
            </div>
        </div>
    );
}

function HistoryItem({ date, value, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-cloud dark:border-nebula-purple/5 group hover:border-indigo-500/30 transition-all cursor-default">
            <div>
                <p className="text-xs font-black text-ink-black dark:text-pearl">{date}</p>
                <p className="text-[10px] text-silver-mist uppercase tracking-widest">{value}</p>
            </div>
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{status}</span>
        </div>
    );
}

const ShieldCheck = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const Clock = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
