'use client';

import React, { useState } from 'react';
import {
    CreditCard, FileSpreadsheet, Download, CheckCircle2,
    Settings, ArrowRight, RefreshCw, Loader2,
    Landmark, ShieldCheck, Zap, Bot, Sparkles,
    ArrowUpRight, Globe, Building2, Search, Filter,
    TrendingUp, AlertCircle, FileText, Banknote
} from 'lucide-react';
import { cn } from '@aura/ui/utils';

export default function DisbursementHub() {
    const [activeBank, setActiveBank] = useState('Enbd');

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Leadership Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
                        <Landmark className="w-4 h-4" /> Global Treasury Sentinel
                    </div>
                    <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
                        Disbursement <span className="text-indigo-600 dark:text-indigo-400">Command Center</span>
                    </h1>
                    <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
                        Orchestrate multi-bank salary transfers across global jurisdictions. Generate encrypted bank files (SIF, NEFT, SWIFT), monitor liquidity, and track disbursement confirmation IDs.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm">
                        <Settings className="w-4 h-4" /> Bank Protocols
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest">
                        <Zap className="w-4 h-4" /> Initialize Transfer
                    </button>
                </div>
            </div>

            {/* Treasury Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Disbursable" value="AED 2.4M" icon={Banknote} color="indigo" trend="Liquidity Ready" />
                <MetricCard title="Success Rate" value="99.98%" icon={CheckCircle2} color="emerald" />
                <MetricCard title="Pending Batches" value="03" icon={FileSpreadsheet} color="amber" alert />
                <MetricCard title="Secure Gateways" value="06" icon={ShieldCheck} color="indigo" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Workspace */}
                <div className="xl:col-span-2 space-y-8">

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-cloud dark:border-nebula-purple/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Multi-Bank Batch Manager</h2>
                                <p className="text-xs text-silver-mist">Select bank-specific protocols to generate encrypted transfer instructions.</p>
                            </div>
                            <div className="flex bg-slate-100/50 dark:bg-slate-900 p-1 rounded-xl border border-cloud dark:border-nebula-purple/10">
                                <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-white dark:bg-stellar-blue shadow-sm text-indigo-600">Active Runs</button>
                                <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-silver-mist">History</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
                            <BankFormatCard name="Emirates NBD" protocol="SIF / UAE WPS" icon="🇦🇪" amount="AED 1.2M" status="Ready" active={activeBank === 'Enbd'} onClick={() => setActiveBank('Enbd')} />
                            <BankFormatCard name="Al Rajhi Bank" protocol="SARIE / KSA WPS" icon="🇸🇦" amount="SAR 840k" status="Ready" />
                            <BankFormatCard name="HDFC Bank" protocol="NEFT / RTGS" icon="🇮🇳" amount="INR 42.5L" status="Ready" />
                            <BankFormatCard name="HSBC Global" protocol="SWIFT / ISO-20022" icon="🌐" amount="USD 120k" status="Pending Approval" />
                        </div>

                        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 border-t border-cloud dark:border-nebula-purple/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none">Batch Selected</p>
                                    <p className="text-2xl font-black text-ink-black dark:text-pearl">Emirates NBD</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none">Net Value</p>
                                    <p className="text-2xl font-black text-emerald-600">AED 1,245,000</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-6 py-3.5 border border-cloud dark:border-nebula-purple/20 rounded-2xl text-[10px] font-black text-silver-mist uppercase tracking-widest hover:bg-white transition-all">
                                    Preview Batch
                                </button>
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all border border-indigo-500">
                                    <Download className="w-4 h-4" /> Download Bank File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group border border-indigo-500">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-indigo-200 font-bold text-[10px] uppercase tracking-widest mb-4">
                                <Sparkles className="w-4 h-4" /> Secure Disbursement
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 leading-tight">ISO-20022 Compliance</h3>
                            <p className="text-xs text-indigo-100/70 leading-relaxed mb-8">
                                All bank files are generated with enterprise-grade encryption and comply with global ISO-20022 messaging standards.
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-200/60">
                                    <span>Gateway Status</span>
                                    <span className="text-emerald-300">Operational</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> Disbursement Trends
                        </h3>
                        <div className="space-y-4">
                            <TrendItem label="Wages" percentage={85} color="indigo" />
                            <TrendItem label="Tax Liab." percentage={12} color="amber" />
                            <TrendItem label="Social Sec." percentage={3} color="rose" />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-all border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-600/20 rounded-2xl">
                                <Bot className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Disbursement AI Assistant</p>
                                <p className="text-sm font-black text-pearl">Resolve 3 Pending SWIFT Rejections</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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

function BankFormatCard({ name, protocol, icon, amount, status, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-6 rounded-3xl border transition-all cursor-pointer group hover:shadow-md",
                active
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-50 dark:bg-slate-900/50 border-cloud dark:border-nebula-purple/10 hover:border-indigo-500/50"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 dark:bg-white/5 flex items-center justify-center text-xl">
                    {icon}
                </div>
                <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                    active ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
                )}>
                    {status}
                </span>
            </div>
            <h4 className={cn("font-bold text-lg mb-1", active ? "text-white" : "text-ink-black dark:text-pearl")}>{name}</h4>
            <p className={cn("text-[9px] font-black uppercase tracking-widest mb-4", active ? "text-indigo-100 opacity-70" : "text-silver-mist")}>{protocol}</p>
            <p className={cn("text-xl font-black", active ? "text-white" : "text-indigo-600")}>{amount}</p>
        </div>
    );
}

function TrendItem({ label, percentage, color }: any) {
    const colors: Record<string, string> = {
        indigo: "bg-indigo-500",
        amber: "bg-amber-500",
        rose: "bg-rose-500",
    };
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-silver-mist">{label}</span>
                <span className="text-ink-black dark:text-pearl">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", colors[color])} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
