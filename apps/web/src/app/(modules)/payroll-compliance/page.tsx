'use client';

import React, { useState } from 'react';
import {
    Globe2, ShieldCheck, FileText, Landmark,
    Search, Filter, Plus, ChevronRight,
    CheckCircle2, AlertCircle, Clock, Zap,
    BarChart3, Download, RefreshCw,
    ArrowUpRight, Bot, Sparkles, Scale,
    Building2, Users, Calculator, Network
} from 'lucide-react';
import { cn } from '@aura/ui/utils';
import Link from 'next/link';

const COMPLIANCE_ITEMS = [
    {
        id: 'wps',
        title: 'UAE WPS',
        jurisdiction: 'United Arab Emirates',
        icon: ShieldCheck,
        status: 'Ready',
        color: 'emerald',
        description: 'Wage Protection System. Automated SIF (Salary Information File) generation.'
    },
    {
        id: 'gosi',
        title: 'KSA GOSI',
        jurisdiction: 'Saudi Arabia',
        icon: Building2,
        status: 'Pending Submission',
        color: 'amber',
        description: 'General Organization for Social Insurance. Monthly contribution filings.'
    },
    {
        id: 'india',
        title: 'India Statutory',
        jurisdiction: 'India',
        icon: Network,
        status: 'Overdue',
        color: 'rose',
        description: 'Consolidated PF, ESI, and Professional Tax monthly compliance returns.'
    },
    {
        id: 'mudad',
        title: 'Mudad Service',
        jurisdiction: 'Saudi Arabia',
        icon: Zap,
        status: 'Active',
        color: 'indigo',
        description: 'Integrated wage protection and contract documentation for HRSD.'
    }
];

export default function PayrollComplianceHub() {
    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Leadership Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
                        <Globe2 className="w-4 h-4" /> Global Compliance Sentinel
                    </div>
                    <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
                        Compliance <span className="text-indigo-600 dark:text-indigo-400">Command Hub</span>
                    </h1>
                    <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
                        Unify statutory filings, wage protection, and social insurance schemes across 7+ jurisdictions. Real-time drift detection and automated filing orchestration.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm">
                        <FileText className="w-4 h-4" /> Audit Log
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all">
                        <Plus className="w-4 h-4" /> Add Jurisdiction
                    </button>
                </div>
            </div>

            {/* Compliance Health Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CompStatCard title="Overall Health" value="94.2%" icon={ShieldCheck} color="indigo" trend="+2.1%" />
                <CompStatCard title="Filing Precision" value="99.9%" icon={Sparkles} color="emerald" />
                <CompStatCard title="Active Regimes" value="12" icon={Scale} color="amber" />
                <CompStatCard title="Pending Filings" value="3" icon={Clock} color="rose" alert />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Compliance Grid */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {COMPLIANCE_ITEMS.map((item, i) => (
                            <Link key={i} href={`/payroll-compliance/${item.id}`}>
                                <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 hover:border-indigo-500/50 transition-all shadow-sm group relative overflow-hidden h-full">
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn("p-4 rounded-2xl",
                                                item.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                                    item.color === 'amber' ? "bg-amber-50 text-amber-600" :
                                                        item.color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                                            )}>
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                item.status === 'Ready' ? "bg-emerald-50 text-emerald-600" :
                                                    item.status === 'Overdue' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-silver-mist"
                                            )}>
                                                {item.status}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest">{item.jurisdiction}</p>
                                        </div>

                                        <p className="text-xs text-silver-mist leading-relaxed mb-auto">
                                            {item.description}
                                        </p>

                                        <div className="pt-6 mt-6 border-t border-cloud dark:border-nebula-purple/10 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">Next Filing: Mar 5</span>
                                            <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                                Manage <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* AI Compliance Sentinel */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group border border-indigo-500">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Bot className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase tracking-widest mb-4">
                                <Zap className="w-4 h-4 text-indigo-200" /> Compliance AI
                            </div>
                            <h3 className="text-xl font-extrabold mb-4 leading-tight">Regulatory Drift Detected</h3>

                            <div className="space-y-3">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                                        <span className="text-xs font-bold">KSA Mudad Updates</span>
                                    </div>
                                    <p className="text-[10px] text-indigo-100/70 leading-relaxed">
                                        New ministerial resolution requires additional contract verification ID for digital onboarding.
                                    </p>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg hover:bg-indigo-50 transition-colors uppercase tracking-widest">
                                Auto-Update Engine
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" /> Jurisdictional Load
                        </h3>
                        <div className="space-y-4">
                            <LoadBar label="UAE" percentage={45} color="indigo" />
                            <LoadBar label="Saudi Arabia" percentage={35} color="emerald" />
                            <LoadBar label="India" percentage={20} color="amber" />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6">
                        <h4 className="text-[10px] font-black text-silver-mist uppercase tracking-widest mb-4">Compliance Certificates</h4>
                        <div className="space-y-3">
                            <CertificateItem label="Labour Law Cert" jurisdiction="KSA" date="Mar 2026" />
                            <CertificateItem label="Tax Compliance" jurisdiction="India" date="Feb 2026" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CompStatCard({ title, value, icon: Icon, color, trend, alert }: any) {
    const colorMap: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
        rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    };

    return (
        <div className={cn(
            "bg-white dark:bg-stellar-blue rounded-3xl p-6 border transition-all group hover:border-indigo-500/50 shadow-sm",
            alert ? "border-rose-100 animate-pulse-slow" : "border-cloud dark:border-nebula-purple/30"
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-2xl", colorMap[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className="text-[10px] font-extrabold text-silver-mist uppercase tracking-widest">{title}</p>
            <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
        </div>
    );
}

function LoadBar({ label, percentage, color }: any) {
    const colors: Record<string, string> = {
        indigo: "bg-indigo-500",
        emerald: "bg-emerald-500",
        amber: "bg-amber-500",
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

function CertificateItem({ label, jurisdiction, date }: any) {
    return (
        <div className="flex items-center justify-between gap-3 text-xs font-bold p-3 bg-white dark:bg-slate-800 rounded-xl border border-cloud dark:border-nebula-purple/5">
            <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-silver-mist" />
                <span className="text-ink-black dark:text-pearl">{label}</span>
            </div>
            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black">{jurisdiction} • {date}</span>
        </div>
    );
}
