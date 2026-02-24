'use client';

import React, { useState } from 'react';
import {
    FileText, Calculator, ShieldCheck, AlertCircle,
    CheckCircle2, Briefcase, Home, Heart, Plane,
    TrendingUp, Info, X, FileIcon, Loader2,
    RefreshCw, Zap, Bot, Sparkles, ArrowUpRight,
    Landmark, Search, Filter, CreditCard, Scale,
    Globe, Building2, Terminal
} from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';

export default function GlobalTaxManager() {
    const [regime, setRegime] = useState<'old' | 'new'>('new');
    const [activeTab, setActiveTab] = useState<'declarations' | 'projections' | 'settings'>('declarations');

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Leadership Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
                        <Scale className="w-4 h-4" /> Global Taxation Sentinel
                    </div>
                    <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
                        Tax <span className="text-indigo-600 dark:text-indigo-400">Management Hub</span>
                    </h1>
                    <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
                        Universal orchestration for employee tax declarations and corporate liabilities. Real-time regime analysis, automated proof verification, and multi-jurisdictional tax slab tracking.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">FY 2024-25</span>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest">
                        <Calculator className="w-4 h-4" /> Run Projection
                    </button>
                </div>
            </div>

            {/* Tax Intelligence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Tax Liability (Active)" value="₹ 4.2M" icon={Landmark} color="indigo" trend="+1.2%" />
                <MetricCard title="Avg Tax Rate" value="14.5%" icon={TrendingUp} color="emerald" />
                <MetricCard title="Declaration Status" value="92%" icon={CheckCircle2} color="indigo" />
                <MetricCard title="Pending Proofs" value="18" icon={FileText} color="amber" alert />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Orchestrator */}
                <div className="xl:col-span-2 space-y-8">

                    <div className="flex items-center justify-between">
                        <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit">
                            <TabButton active={activeTab === 'declarations'} onClick={() => setActiveTab('declarations')}>Investment Tracker</TabButton>
                            <TabButton active={activeTab === 'projections'} onClick={() => setActiveTab('projections')}>Tax Projections</TabButton>
                            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Tax Slabs</TabButton>
                        </div>

                        <div className="flex items-center gap-3 bg-white dark:bg-stellar-blue p-1.5 rounded-2xl border border-cloud dark:border-nebula-purple/30 shadow-sm">
                            <button onClick={() => setRegime('old')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", regime === 'old' ? "bg-indigo-600 text-white shadow-lg" : "text-silver-mist")}>Old Regime</button>
                            <button onClick={() => setRegime('new')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", regime === 'new' ? "bg-emerald-600 text-white shadow-lg" : "text-silver-mist")}>New Regime</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-cloud dark:border-nebula-purple/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Tax Savings & Deductions</h2>
                                <p className="text-xs text-silver-mist">Review employee declarations and uploaded proofs for Section 80C, 80D, and HRA.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-silver-mist hover:text-indigo-600 transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-silver-mist hover:text-indigo-600 transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-4">
                            <InvestmentRow label="Section 80C (Mutual Funds, LIC, EPF)" limit="₹ 150,000" declared="₹ 142,500" progress={95} color="indigo" />
                            <InvestmentRow label="Section 80D (Health Insurance)" limit="₹ 25,000" declared="₹ 18,000" progress={72} color="emerald" />
                            <InvestmentRow label="House Rent Allowance (HRA)" limit="Variable" declared="₹ 240,000" progress={100} color="rose" />
                            <InvestmentRow label="NPS (Section 80CCD)" limit="₹ 50,000" declared="₹ 12,000" progress={24} color="amber" />
                        </div>

                        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 border-t border-cloud dark:border-nebula-purple/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none">Total Savings</p>
                                        <p className="text-2xl font-black text-ink-black dark:text-pearl">₹ 412,500</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none">Tax Saved</p>
                                        <p className="text-2xl font-black text-emerald-600">₹ 84,200</p>
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all border border-indigo-500">
                                    <Zap className="w-4 h-4" /> Verify All Proofs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Scale className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                                <Sparkles className="w-4 h-4" /> Tax AI Advisor
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 leading-tight">Dual-Regime Optimization</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-8">
                                Based on current projections, 68% of your workforce would benefit significantly from the <strong>New Tax Regime</strong>.
                            </p>

                            <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all border border-indigo-500">
                                Send Regime Advisory
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" /> Pending Compliance
                        </h3>
                        <div className="space-y-4">
                            <ComplianceItem label="Form 16 Generation" date="June 15" status="Pending" />
                            <ComplianceItem label="TDS Q4 Return" date="May 31" status="Upcoming" />
                            <ComplianceItem label="Regime Selection" date="Apr 10" status="Active" />
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-8 flex items-center justify-between group cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Global Slab Monitor</p>
                                <p className="text-sm font-black text-ink-black dark:text-pearl text-left">Audit 18 Declaration Discrepancies</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, trend, alert }: any) {
    const colors: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30",
        amber: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30",
    };

    return (
        <div className={cn(
            "bg-white dark:bg-stellar-blue rounded-3xl p-6 border transition-all group hover:border-indigo-500/50 shadow-sm",
            alert ? "border-amber-100 animate-pulse-slow" : "border-cloud dark:border-nebula-purple/30"
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("inline-flex p-3 rounded-2xl border transition-transform group-hover:scale-110", colors[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">{title}</p>
            <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:text-indigo-600 transition-colors">{value}</div>
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

function InvestmentRow({ label, limit, declared, progress, color }: any) {
    const barColors: Record<string, string> = {
        indigo: "bg-indigo-500",
        emerald: "bg-emerald-500",
        rose: "bg-rose-500",
        amber: "bg-amber-500",
    };

    return (
        <div className="space-y-3 group cursor-pointer p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 rounded-2xl transition-all border border-transparent hover:border-indigo-500/20">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-ink-black dark:text-pearl">{label}</p>
                    <p className="text-[10px] text-silver-mist uppercase tracking-widest font-bold">Limit: {limit}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Declared</p>
                    <p className="text-base font-black text-ink-black dark:text-pearl">{declared}</p>
                </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", barColors[color])} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

function ComplianceItem({ label, date, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-cloud dark:border-nebula-purple/5 group hover:border-indigo-500/30 transition-all cursor-default">
            <div>
                <p className="text-xs font-black text-ink-black dark:text-pearl">{label}</p>
                <p className="text-[10px] text-silver-mist uppercase tracking-widest">{date}</p>
            </div>
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{status}</span>
        </div>
    );
}
