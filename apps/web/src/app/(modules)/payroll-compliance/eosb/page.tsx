'use client';

import React, { useState } from 'react';
import {
    Calculator, ArrowRight, ShieldCheck, Scale,
    Users, Landmark, PieChart, TrendingDown,
    RefreshCw, Download, Bot, Sparkles, Zap,
    ArrowUpRight, Globe, Building2, FileText,
    AlertCircle, History
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@aura/ui/src/lib/utils';

export default function EOSBCommandCenter() {
    const [activeCountry, setActiveCountry] = useState<'UAE' | 'KSA' | 'India'>('UAE');
    const [tenure, setTenure] = useState('4.5');

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Leadership Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm uppercase tracking-widest">
                        <Scale className="w-4 h-4" /> Termination & Gratuity Sentinel
                    </div>
                    <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
                        EOSB <span className="text-rose-600 dark:text-rose-400">Command Center</span>
                    </h1>
                    <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
                        Multi-jurisdictional End of Service Benefits orchestration. Compute gratuity, leave encashment, and notice period payoffs according to the latest Labour Laws.
                    </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 dark:bg-slate-900 rounded-2xl border border-cloud dark:border-nebula-purple/10">
                    <CountryTab active={activeCountry === 'UAE'} onClick={() => setActiveCountry('UAE')} flag="🇦🇪" label="UAE" />
                    <CountryTab active={activeCountry === 'KSA'} onClick={() => setActiveCountry('KSA')} flag="🇸🇦" label="KSA" />
                    <CountryTab active={activeCountry === 'India'} onClick={() => setActiveCountry('India')} flag="🇮🇳" label="India" />
                </div>
            </div>

            {/* Gratuity Liability Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Gratuity Liability" value="AED 1.2M" icon={Landmark} color="indigo" trend="+4.2%" />
                <MetricCard title="Avg Tenure" value="3.2 Yrs" icon={Users} color="emerald" />
                <MetricCard title="Retentions Today" value="02" icon={Bot} color="indigo" />
                <MetricCard title="Law Updates" value="Compliant" icon={ShieldCheck} color="rose" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Orchestrator */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                                        <Calculator className="w-5 h-5 text-rose-500" /> Benefit Simulation
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Employee Contract Type</label>
                                            <div className="p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-cloud dark:border-nebula-purple/10 flex">
                                                <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-white dark:bg-stellar-blue shadow-sm text-indigo-600">Limited</button>
                                                <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-silver-mist">Unlimited</button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Base Salary for Gratuity</label>
                                            <div className="relative">
                                                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                                                <input className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-sm font-bold outline-none" defaultValue="18500" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Years of Service</label>
                                                <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-sm font-bold outline-none" defaultValue="4.5" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Unpaid Leaves</label>
                                                <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-sm font-bold outline-none" defaultValue="0" />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all border border-rose-500">
                                                Calculate Final Settlement
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-cloud dark:border-nebula-purple/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                        <Zap className="w-24 h-24 text-rose-500" />
                                    </div>
                                    <h4 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-6 border-b border-cloud dark:border-nebula-purple/10 pb-4">Payout Intelligence</h4>
                                    <div className="space-y-6 relative z-10">
                                        <PayoutRow label="Years 1-5 (21 days/yr)" value="AED 43,210" />
                                        <PayoutRow label="Years 5+ (30 days/yr)" value="-" />
                                        <PayoutRow label="Leave Encashment" value="AED 8,400" />
                                        <PayoutRow label="Notice Buyout" value="AED 0" />

                                        <div className="pt-6 border-t border-cloud dark:border-nebula-purple/10 flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Estimated Net Settlement</p>
                                                <p className="text-4xl font-black text-rose-600">AED 51,610</p>
                                            </div>
                                            <button className="p-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/10 rounded-2xl text-xs font-black text-indigo-600 shadow-sm hover:scale-110 transition-transform">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 italic mb-1">UAE Labour Law Alert: Feb 2026</p>
                                        <p className="text-[10px] text-silver-mist leading-relaxed">Gratuity payout for resignations on Limited contracts no longer carries the 1/3 penalty. Calculations updated for MoHRE v3.0.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Globe className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-rose-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                                <Sparkles className="w-4 h-4" /> Strategic HR insight
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 leading-tight">Projected Gratuity Burn</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-8">
                                Your organization has a projected EOSB expense of AED 140k for the next 6 months based on employee turnover trends.
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Provisioning Accuracy</span>
                                    <span className="text-rose-400">98.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: '98%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <History className="w-4 h-4 text-rose-500" /> Recent Settlements
                        </h3>
                        <div className="space-y-4">
                            <HistoryItem name="K. Richards" reason="Resignation" amount="AED 124,500" />
                            <HistoryItem name="M. Al Jaber" reason="Retirement" amount="AED 452,000" />
                            <HistoryItem name="D. Gupta" reason="End of Project" amount="AED 82,100" />
                        </div>
                        <button className="w-full mt-8 py-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-[10px] font-black text-silver-mist uppercase tracking-widest hover:bg-slate-100 transition-all border border-cloud dark:border-nebula-purple/5">
                            Full Settlement Log
                        </button>
                    </div>

                    <div className="bg-indigo-600 rounded-3xl p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-indigo-700 transition-all border border-indigo-500">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <Bot className="w-6 h-6 text-indigo-100" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Gratuity AI Adviser</p>
                                <p className="text-sm font-black text-pearl">Optimize Liability Provisions</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, trend, alert }: any) {
    const colors: Record<string, string> = {
        rose: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30",
    };

    return (
        <div className={cn(
            "bg-white dark:bg-stellar-blue rounded-3xl p-6 border transition-all group hover:border-rose-500/50 shadow-sm",
            alert ? "border-amber-100 animate-pulse-slow" : "border-cloud dark:border-nebula-purple/30"
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("inline-flex p-3 rounded-2xl border transition-transform group-hover:scale-110", colors[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">{title}</p>
            <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:text-rose-600 transition-colors">{value}</div>
        </div>
    );
}

function CountryTab({ flag, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
                active
                    ? "bg-white dark:bg-stellar-blue text-indigo-600 shadow-sm ring-1 ring-cloud dark:ring-nebula-purple/30"
                    : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            )}
        >
            <span className="text-base leading-none">{flag}</span> {label}
        </button>
    );
}

function PayoutRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center group">
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-ink-black dark:text-pearl">{label}</p>
                <p className="text-[9px] text-silver-mist uppercase tracking-widest">Labour Law Clause 51</p>
            </div>
            <p className="text-sm font-black text-ink-black dark:text-pearl">{value}</p>
        </div>
    );
}

function HistoryItem({ name, reason, amount }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-cloud dark:border-nebula-purple/5 group hover:border-rose-500/30 transition-all cursor-default">
            <div>
                <p className="text-xs font-black text-ink-black dark:text-pearl">{name}</p>
                <p className="text-[10px] text-silver-mist uppercase tracking-widest">{reason}</p>
            </div>
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">{amount}</span>
        </div>
    );
}
