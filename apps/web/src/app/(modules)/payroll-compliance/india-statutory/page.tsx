'use client';

import React, { useState } from 'react';
import {
    FileText, Calculator, Building2, Shield,
    Landmark, ArrowLeft, RefreshCw, CheckCircle2,
    AlertCircle, Info, ChevronRight, IndianRupee,
    Zap, Bot, Sparkles, ArrowUpRight, Search, Filter,
    CreditCard, Scale
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@aura/ui/src/lib/utils';

export default function IndiaStatutoryHub() {
    const [activeTab, setActiveTab] = useState<'pf' | 'esi' | 'tds' | 'pt'>('pf');

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Leadership Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-sm uppercase tracking-widest">
                        <Scale className="w-4 h-4" /> BHARAT COMPLIANCE SENTINEL
                    </div>
                    <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
                        India <span className="text-orange-600 dark:text-orange-400">Statutory Hub</span>
                    </h1>
                    <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
                        Consolidated orchestration for EPF, ESIC, Professional Tax, and TDS. Automated filing logic for FY 2024-25 with dual-regime taxation intelligence.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                    <span className="text-xl">🇮🇳</span>
                    <span className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">Republic of India</span>
                </div>
            </div>

            {/* Compliance Health Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Filing Status" value="On-Time" icon={CheckCircle2} color="orange" trend="100% Precision" />
                <MetricCard title="PF Monthly Load" value="₹ 12.4L" icon={Building2} color="indigo" />
                <MetricCard title="Active TDS Liability" value="₹ 4.8L" icon={Landmark} color="indigo" />
                <MetricCard title="TDS Return Due" value="12 Days" icon={AlertCircle} color="amber" alert />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Orchestrator */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Tab Navigation */}
                    <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit">
                        <TabButton active={activeTab === 'pf'} onClick={() => setActiveTab('pf')}>Provident Fund</TabButton>
                        <TabButton active={activeTab === 'esi'} onClick={() => setActiveTab('esi')}>ESI (Insurance)</TabButton>
                        <TabButton active={activeTab === 'tds'} onClick={() => setActiveTab('tds')}>TDS / Income Tax</TabButton>
                        <TabButton active={activeTab === 'pt'} onClick={() => setActiveTab('pt')}>Professional Tax</TabButton>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                                        <Calculator className="w-5 h-5 text-indigo-500" /> Statutory Engine
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Basic + DA Component</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                                                <input className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-sm font-bold outline-none" defaultValue="45000" />
                                            </div>
                                        </div>

                                        {activeTab === 'tds' && (
                                            <div className="p-1 bg-slate-100/50 dark:bg-slate-900 rounded-xl border border-cloud dark:border-nebula-purple/10 flex">
                                                <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-white dark:bg-stellar-blue shadow-sm text-indigo-600">New Regime</button>
                                                <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-silver-mist">Old Regime</button>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all border border-indigo-500">
                                                Recalculate Liabilty
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-cloud dark:border-nebula-purple/10">
                                    <h4 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-6">Liability Breakdown</h4>
                                    <div className="space-y-6">
                                        <BreakdownRow label="Employee Contribution (12%)" value="₹ 5,400" />
                                        <BreakdownRow label="Employer EPF (3.67%)" value="₹ 1,652" />
                                        <BreakdownRow label="Employer EPS (8.33%)" value="₹ 1,250" />

                                        <div className="pt-6 border-t border-cloud dark:border-nebula-purple/10 flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">Periodic CTC Impact</p>
                                                <p className="text-3xl font-black text-orange-600">₹ 8,302</p>
                                            </div>
                                            <ArrowUpRight className="w-5 h-5 text-silver-mist" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-orange-600 to-rose-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group border border-orange-500">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Landmark className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-orange-200 font-bold text-[10px] uppercase tracking-widest mb-4">
                                <Sparkles className="w-4 h-4" /> AI Compliance Stream
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 leading-tight">Income Tax Ordinance 2024</h3>
                            <p className="text-xs text-orange-100/70 leading-relaxed mb-8">
                                Threshold for Nil Tax has been adjusted to ₹7.75L in the New Regime for the current assessment year.
                            </p>

                            <button className="w-full py-3.5 bg-white text-orange-600 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-orange-50 transition-all">
                                Update Tax Slabs
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-orange-500" /> Upcoming Deadlines
                        </h3>
                        <div className="space-y-4">
                            <DeadlineItem label="TDS Payment" date="Mar 07, 2026" status="Urgent" />
                            <DeadlineItem label="EPF Filing" date="Mar 15, 2026" status="Active" />
                            <DeadlineItem label="ESI Filing" date="Mar 15, 2026" status="Active" />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-all border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-600/20 rounded-2xl">
                                <Bot className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Compliance Sentinel</p>
                                <p className="text-sm font-black text-pearl">Audit 4 PAN Mismatches</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, trend, alert }: any) {
    const colors: Record<string, string> = {
        orange: "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30",
        amber: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30",
    };

    return (
        <div className={cn(
            "bg-white dark:bg-stellar-blue rounded-3xl p-6 border transition-all group hover:border-orange-500/50 shadow-sm",
            alert ? "border-amber-100 animate-pulse-slow" : "border-cloud dark:border-nebula-purple/30"
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("inline-flex p-3 rounded-2xl border transition-transform group-hover:scale-110", colors[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">{title}</p>
            <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:text-orange-600 transition-colors">{value}</div>
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

function BreakdownRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center group">
            <p className="text-xs font-bold text-ink-black dark:text-pearl">{label}</p>
            <p className="text-sm font-black text-ink-black dark:text-pearl">{value}</p>
        </div>
    );
}

function DeadlineItem({ label, date, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-cloud dark:border-nebula-purple/5 group hover:border-orange-500/30 transition-all cursor-default">
            <div>
                <p className="text-xs font-black text-ink-black dark:text-pearl">{label}</p>
                <p className="text-[10px] text-silver-mist uppercase tracking-widest">{date}</p>
            </div>
            <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                status === 'Urgent' ? "text-rose-600" : "text-indigo-600"
            )}>{status}</span>
        </div>
    );
}
