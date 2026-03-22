'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Upload, Download, FileText,
    CheckCircle2, AlertCircle, AlertTriangle,
    Building2, CreditCard, Users, ArrowLeft,
    Loader2, RefreshCw, Zap, Bot, Sparkles,
    ArrowUpRight, Landmark, Search, Filter
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@aura/ui/utils';

export default function UAEWPSWorkspace() {
    const [activeTab, setActiveTab] = useState<'orchestra' | 'validation' | 'agents'>('orchestra');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    const [records, setRecords] = useState([
        { id: 'EMP001', name: 'Ahmed Al Mansouri', labourCard: '1234567890', account: 'AE120000000012345678', netSalary: 12500, status: 'valid' },
        { id: 'EMP002', name: 'Sarah Jenkins', labourCard: '9876543210', account: 'AE980000000087654321', netSalary: 18000, status: 'valid' },
        { id: 'EMP003', name: 'Rajesh Kumar', labourCard: '5544332211', account: 'AE550000000011223344', netSalary: 9500, status: 'warning' },
    ]);

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Leadership Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> UAE Regulation Sentinel
                    </div>
                    <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
                        WPS <span className="text-emerald-600 dark:text-emerald-400">Command Workspace</span>
                    </h1>
                    <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
                        Wage Protection System orchestration for the Emirates. Generate compliant SIF files, validate MoHRE requirements, and monitor disbursement status with AI precision.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <span className="text-xl">🇦🇪</span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">United Arab Emirates</span>
                </div>
            </div>

            {/* WPS Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="WPS Status" value="Compliant" icon={ShieldCheck} color="emerald" />
                <MetricCard title="Total SIF Value" value="AED 452k" icon={Landmark} color="indigo" />
                <MetricCard title="Active Employees" value="42" icon={Users} color="amber" />
                <MetricCard title="Validation Errors" value="0" icon={AlertCircle} color="emerald" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Workspace */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Tab Navigation */}
                    <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit">
                        <TabButton active={activeTab === 'orchestra'} onClick={() => setActiveTab('orchestra')}>SIF Orchestrator</TabButton>
                        <TabButton active={activeTab === 'validation'} onClick={() => setActiveTab('validation')}>Validation Sentinel</TabButton>
                        <TabButton active={activeTab === 'agents'} onClick={() => setActiveTab('agents')}>WPS Agents</TabButton>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-cloud dark:border-nebula-purple/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Employee Registry for SIF</h2>
                                <p className="text-xs text-silver-mist">Validate labour card numbers and IBAN formats before generating the Ministry file.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/10 rounded-xl text-silver-mist hover:text-indigo-600 transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest">
                                    Import Payroll Data
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-cloud dark:border-nebula-purple/10">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-silver-mist uppercase tracking-widest">Employee</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-silver-mist uppercase tracking-widest">Labour Card</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-silver-mist uppercase tracking-widest">Account (IBAN)</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-silver-mist uppercase tracking-widest">Net (AED)</th>
                                        <th className="px-8 py-4 text-center text-[10px] font-black text-silver-mist uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                                    {records.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-indigo-600 uppercase">
                                                        {r.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-ink-black dark:text-pearl">{r.name}</p>
                                                        <p className="text-[10px] text-silver-mist uppercase tracking-wider">{r.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-mono text-xs text-silver-mist tracking-tighter">{r.labourCard}</td>
                                            <td className="px-8 py-5 font-mono text-xs text-silver-mist tracking-tighter">{r.account}</td>
                                            <td className="px-8 py-5 text-right font-black text-ink-black dark:text-pearl">{(r.netSalary).toLocaleString()}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                    r.status === 'valid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                                )}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none">Total Employees</p>
                                    <p className="text-2xl font-black text-ink-black dark:text-pearl">42</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none">Total Value</p>
                                    <p className="text-2xl font-black text-emerald-600">AED 452,100</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl text-xs font-black text-ink-black dark:text-pearl uppercase tracking-widest hover:bg-slate-50 transition-all">
                                    <RefreshCw className="w-4 h-4" /> Validate SIF
                                </button>
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500">
                                    <Download className="w-4 h-4" /> Download .SIF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group border border-emerald-500">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-emerald-100 font-bold text-[10px] uppercase tracking-widest mb-4">
                                <Sparkles className="w-4 h-4" /> Compliance Intelligence
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 leading-tight">MoHRE Compliance Stream</h3>
                            <p className="text-xs text-emerald-50/70 leading-relaxed mb-8">
                                Your current payroll cycle is 100% compliant with the latest Ministry of Human Resources & Emiratisation guidelines.
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-100">
                                    <span>SIF Format Integrity</span>
                                    <span>100%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-500" /> SIF Generation History
                        </h3>
                        <div className="space-y-4">
                            <HistoryItem date="Feb 2026" value="AED 452k" status="Disbursed" />
                            <HistoryItem date="Jan 2026" value="AED 448k" status="Disbursed" />
                            <HistoryItem date="Dec 2025" value="AED 455k" status="Disbursed" />
                        </div>
                        <button className="w-full mt-8 py-3.5 border border-cloud dark:border-nebula-purple/20 rounded-2xl text-[10px] font-black text-silver-mist uppercase tracking-widest hover:bg-slate-50 transition-all">
                            View All Filings
                        </button>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-all border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-600/20 rounded-2xl">
                                <Bot className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">WPS AI Assistant</p>
                                <p className="text-sm font-black text-pearl">Resolve 2 Validation Warnings</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30",
        amber: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30",
    };

    return (
        <div className="bg-white dark:bg-stellar-blue rounded-3xl p-6 border border-cloud dark:border-nebula-purple/30 shadow-sm transition-all group hover:border-emerald-500/50">
            <div className={cn("inline-flex p-3 rounded-2xl mb-4 border transition-transform group-hover:scale-110", colors[color])}>
                <Icon className="w-5 h-5" />
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

function HistoryItem({ date, value, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-cloud dark:border-nebula-purple/5 group hover:border-indigo-500/30 transition-all cursor-default">
            <div>
                <p className="text-xs font-black text-ink-black dark:text-pearl">{date}</p>
                <p className="text-[10px] text-silver-mist uppercase tracking-widest">{value}</p>
            </div>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{status}</span>
        </div>
    );
}
