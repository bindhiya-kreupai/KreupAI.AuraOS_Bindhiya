'use client';

import React, { useState } from 'react';
import {
  Globe2, Languages, Type, LayoutTemplate,
  Map, ShieldCheck, FileText, Calendar,
  ArrowLeftRight, CheckCircle2, AlertCircle,
  Plus, Settings2, Download, RefreshCw,
  Search, Bot, Sparkles, ChevronRight
} from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';

const COMPLIANCE_REGIMES = [
  { name: 'WPS (Wage Protection System)', jurisdiction: 'UAE/KSA', status: 'Active', color: 'emerald' },
  { name: 'GOSI/SIO Contributions', jurisdiction: 'KSA/Bahrain', status: 'Configured', color: 'blue' },
  { name: 'MOL Contract Templates', jurisdiction: 'GCC Wide', status: 'In Review', color: 'amber' },
  { name: 'Nitaqat Compliance', jurisdiction: 'KSA', status: 'Compliant', color: 'emerald' }
];

const TERMINOLOGY_STATS = [
  { label: 'Core HR Terms', translated: 480, total: 500, percentage: 96 },
  { label: 'Payroll Components', translated: 120, total: 150, percentage: 80 },
  { label: 'Legal Doctypes', translated: 45, total: 45, percentage: 100 },
];

export default function LocalizationPage() {
  const [isRTL, setIsRTL] = useState(false);

  return (
    <div className={cn("p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700", isRTL ? "text-right" : "text-left")}>
      {/* Leadership Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
            <Globe2 className="w-4 h-4" /> MENA Native Engine
          </div>
          <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
            Localization <span className="text-indigo-600 dark:text-indigo-400">& Compliance</span>
          </h1>
          <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
            Configure jurisdiction-specific compliance, RTL orchestration, and native Arabic terminology. AuraOS is built to feel native from Riyadh to Dubai.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsRTL(!isRTL)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border",
              isRTL
                ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20"
                : "bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl border-cloud dark:border-nebula-purple/30 hover:bg-slate-50"
            )}
          >
            <ArrowLeftRight className="w-4 h-4" /> {isRTL ? 'English Mode' : 'Toggle RTL (Arabic)'}
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
            <RefreshCw className="w-4 h-4" /> Sync Terminology
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Terminology Hub */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-3">
                <Type className="w-6 h-6 text-indigo-500" /> Arabic Terminology Mapping
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                  type="text"
                  placeholder="Search labels..."
                  className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs w-48 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {TERMINOLOGY_STATS.map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl border border-cloud dark:border-nebula-purple/10 bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-black text-ink-black dark:text-pearl">{stat.percentage}%</span>
                    <span className="text-[10px] font-bold text-silver-mist">{stat.translated}/{stat.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-cloud dark:border-nebula-purple/10">
                    <th className="px-4 py-3 text-[10px] font-black text-silver-mist uppercase tracking-widest">Global Field Name</th>
                    <th className="px-4 py-3 text-[10px] font-black text-silver-mist uppercase tracking-widest">Arabic Native Label</th>
                    <th className="px-4 py-3 text-[10px] font-black text-silver-mist uppercase tracking-widest">Context</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cloud dark:divide-nebula-purple/5">
                  <TermRow global="Basic Salary" arabic="الراتب الأساسي" context="Payroll Registry" />
                  <TermRow global="Leave Request" arabic="طلب إجازة" context="Employee ESS" />
                  <TermRow global="Passport Number" arabic="رقم جواز السفر" context="MDM Identity" />
                  <TermRow global="Department" arabic="القسم" context="Org Hierarchy" />
                </tbody>
              </table>
            </div>
            <button className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-all uppercase tracking-widest">
              Open Terminology Editor
            </button>
          </div>

          {/* GCC Governance & Reporting Hub */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">MENA Governance Hub</h2>
                  <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Digital Sovereignty & Compliance Pack</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Download Master Pack</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {COMPLIANCE_REGIMES.map((reg, i) => (
                  <div key={i} className="flex items-start gap-6 p-6 bg-slate-50/50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/10 rounded-3xl hover:border-indigo-500/50 transition-all group/item">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover/item:scale-110 transition-transform",
                      reg.color === 'emerald' ? "bg-emerald-500 text-white" : reg.color === 'blue' ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      {reg.color === 'emerald' ? <ShieldCheck className="w-7 h-7" /> : <Layers className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-ink-black dark:text-pearl uppercase tracking-tight group-hover/item:text-indigo-600 transition-colors">{reg.name}</h3>
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", reg.status === 'Active' ? "bg-emerald-500" : "bg-amber-500")} />
                      </div>
                      <p className="text-[10px] text-silver-mist font-black uppercase tracking-widest leading-loose mb-3">{reg.jurisdiction} Regulation Registry</p>
                      <div className="flex gap-4">
                        <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-200 hover:border-indigo-600 transition-all">Configure</button>
                        <button className="text-[9px] font-black text-silver-mist uppercase tracking-widest hover:text-ink-black transition-all">Audit Logs</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Side Panel */}
        <div className="space-y-8">
          {/* Calendar Selector */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 scale-150">
              <Calendar className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> Timekeeping Engine
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Calendar Native</h3>
                <p className="text-indigo-100/70 text-sm leading-relaxed">
                  Toggle between Gregorian and Umm al-Qura (Hijri) calendars across the system.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95">Gregorian</button>
                <button className="flex-1 py-3 bg-indigo-500/50 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/20 hover:bg-white/10 active:scale-95">Hijri</button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-500" /> Regional Config
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <ConfigAction label="Date/Time Overrides" icon={Clock} />
              <ConfigAction label="Address Formats" icon={Map} />
              <ConfigAction label="Currency Rounding Rules" icon={ArrowLeftRight} />
              <ConfigAction label="Govt Reporting Packs" icon={FileText} />
            </div>
          </div>

          {/* AI Translation Bridge */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 group">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-ink-black dark:text-pearl uppercase tracking-widest">AI Translation</h3>
            </div>
            <p className="text-xs text-silver-mist leading-relaxed mb-6">
              Automatically translate and bridge 14,000+ UI labels using Aura's domain-specific LLM trained on Arabised legal HCM terminology.
            </p>
            <button className="w-full py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/20 rounded-xl text-[10px] font-black text-indigo-600 dark:text-pearl uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              Launch AI Bridging
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TermRow({ global, arabic, context }: any) {
  return (
    <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
      <td className="px-4 py-4">
        <div className="text-xs font-bold text-ink-black dark:text-pearl">{global}</div>
      </td>
      <td className="px-4 py-4 font-arabic">
        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400" dir="rtl">{arabic}</div>
      </td>
      <td className="px-4 py-4">
        <span className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">{context}</span>
      </td>
      <td className="px-4 py-4 text-right">
        <button className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100">
          <ChevronRight className="w-3.5 h-3.5 text-silver-mist" />
        </button>
      </td>
    </tr>
  );
}

function ConfigAction({ label, icon: Icon }: any) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-ink-black dark:text-pearl border border-transparent hover:border-cloud dark:hover:border-nebula-purple/20">
      <Icon className="w-4 h-4 text-silver-mist" />
      {label}
    </button>
  );
}
