'use client';

import React, { useState } from 'react';
import {
  Settings, Globe, Building2, Briefcase,
  Search, ShieldCheck, Zap, Database,
  ArrowRight, Plus, Filter, Download,
  MapPin, DollarSign, Languages, FileText,
  Users, BarChart3, Bot, Sparkles, RefreshCw
} from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';
import Link from 'next/link';

const CATEGORIES = [
  {
    title: 'Geographic Master',
    icon: Globe,
    color: 'indigo',
    items: [
      { name: 'Countries', count: 195, path: '/master-data/countries' },
      { name: 'States/Provinces', count: 840, path: '/master-data/states' },
      { name: 'Cities', count: 2450, path: '/master-data/cities' },
    ]
  },
  {
    title: 'Organization Identity',
    icon: Building2,
    color: 'emerald',
    items: [
      { name: 'Legal Entities', count: 12, path: '/core-hr/entities' },
      { name: 'Departments', count: 48, path: '/master-data/departments' },
      { name: 'Cost Centers', count: 24, path: '/master-data/cost-centers' },
      { name: 'Locations', count: 32, path: '/master-data/locations' },
    ]
  },
  {
    title: 'Employment Framework',
    icon: Briefcase,
    color: 'amber',
    items: [
      { name: 'Designations', count: 156, path: '/master-data/designations' },
      { name: 'Job Profiles', count: 89, path: '/master-data/job-profiles' },
      { name: 'Grades & Bands', count: 14, path: '/master-data/grades' },
      { name: 'Skills Library', count: 420, path: '/master-data/skills' },
    ]
  },
  {
    title: 'Compliance & Payroll',
    icon: ShieldCheck,
    color: 'rose',
    items: [
      { name: 'Document Types', count: 24, path: '/master-data/document-types' },
      { name: 'Leave Categories', count: 18, path: '/master-data/leave-types' },
      { name: 'Tax Regimes', count: 6, path: '/master-data/tax-regimes' },
      { name: 'Custom Fields', count: 142, path: '/master-data/custom-fields' },
    ]
  }
];

export default function MasterDataPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Leadership Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
            <Database className="w-4 h-4" /> Global Registry Hub
          </div>
          <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
            Master Data <span className="text-indigo-600 dark:text-indigo-400">Management</span>
          </h1>
          <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
            The foundation of AuraOS. Manage high-integrity master records across all jurisdictions, ensuring consistency for payroll, compliance, and AI orchestration.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search across all registries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-sm w-full sm:w-80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
            <RefreshCw className="w-4 h-4" /> Sync All Entities
          </button>
        </div>
      </div>

      {/* Insight Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Data Integrity" value="99.2%" icon={ShieldCheck} color="emerald" trend="+0.4%" />
        <MetricCard title="Master Records" value="6,420" icon={Layers} color="indigo" />
        <MetricCard title="System Languages" value="12" icon={Languages} color="blue" />
        <MetricCard title="Currencies" value="15" icon={DollarSign} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Main Registry Grid */}
        <div className="xl:col-span-3 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-cloud dark:border-nebula-purple/10")}>
                    <cat.icon className={cn("w-5 h-5", `text-${cat.color}-600`)} />
                  </div>
                  <h2 className="text-xl font-bold text-ink-black dark:text-pearl">{cat.title}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.items.map((item, i) => (
                    <Link
                      href={item.path}
                      key={i}
                      className="flex items-center justify-between p-5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/20 rounded-3xl hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity">
                        <cat.icon className="w-12 h-12" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          <FileText className="w-4 h-4 text-silver-mist group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-ink-black dark:text-pearl text-sm group-hover:text-indigo-600 transition-colors">{item.name}</p>
                          <p className="text-[10px] text-silver-mist font-black uppercase tracking-widest">{item.count} Active Records</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-silver-mist group-hover:translate-x-1 group-hover:text-indigo-600 transition-all relative z-10" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Entity Jurisdiction Map Placeholder */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-md">
                <h2 className="text-2xl font-black text-ink-black dark:text-pearl leading-tight">Entity-Jurisdiction <span className="text-indigo-600">Sync Graph</span></h2>
                <p className="text-xs text-silver-mist leading-relaxed font-medium">
                  Visualize how your legal entities map across global jurisdictions. Ensure unified master records for multi-country payroll and statutory reports.
                </p>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">UAE Master: Active</div>
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">KSA Master: Synchronized</div>
                </div>
              </div>
              <div className="relative w-full md:w-64 h-48 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-cloud dark:border-nebula-purple-20 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                <Globe className="w-16 h-16 text-slate-200 dark:text-slate-800 group-hover:text-indigo-200 dark:group-hover:text-indigo-800/20 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-silver-mist uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Loading Visualizer...</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Side Panel */}
        <div className="space-y-8">
          {/* AI Intake Bridge */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group border border-white/10">
            <div className="absolute -right-4 -bottom-4 p-8 transform rotate-12 opacity-10 scale-150 group-hover:scale-110 transition-transform duration-700">
              <Bot className="w-40 h-40" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-200" /> AI Intake active
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Automated Data Ingestion</h3>
                <p className="text-indigo-100/70 text-sm leading-relaxed">
                  Bridge Document Intelligence with your Master Registry. Auto-populate Passport and ID data directly into Employee Profiles.
                </p>
              </div>
              <button className="w-full py-3.5 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-xl hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95">
                Launch Document OCR
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Bulk Operations
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <SidebarAction label="Import from CSV/Excel" icon={Plus} />
              <SidebarAction label="Mass Update Records" icon={Zap} />
              <SidebarAction label="Export Master Set" icon={Download} />
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xs font-black text-silver-mist uppercase tracking-widest mb-6 flex items-center justify-between">
              Registry Health <span className="text-[9px] text-emerald-500 animate-pulse">Live Tracking</span>
            </h3>
            <div className="space-y-6">
              <HealthItem label="GCC Labour Rules" status="Compliant" color="emerald" percentage={100} />
              <HealthItem label="Tax Slab 2026" status="Updates Needed" color="amber" percentage={65} />
              <HealthItem label="EU GDPR Mapping" status="Ready" color="emerald" percentage={92} />
              <HealthItem label="Visa Regulation V2" status="Critical Gap" color="rose" percentage={30} />
            </div>
            <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-black text-silver-mist uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              Run Global Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, trend }: any) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-indigo-500/5",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-emerald-500/5",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-blue-500/5",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 shadow-amber-500/5",
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-3xl p-5 border border-cloud dark:border-nebula-purple/30 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-2xl", colorMap[color] || colorMap.indigo)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
        )}
      </div>
      <p className="text-[10px] font-extrabold text-silver-mist uppercase tracking-widest">{title}</p>
      <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
    </div>
  );
}

function SidebarAction({ label, icon: Icon }: any) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-ink-black dark:text-pearl border border-transparent hover:border-cloud dark:hover:border-nebula-purple/20">
      <Icon className="w-4 h-4 text-silver-mist" />
      {label}
    </button>
  );
}

function HealthItem({ label, status, color, percentage }: any) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink-black dark:text-pearl">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn("text-[9px] font-black uppercase tracking-widest",
            color === 'emerald' ? "text-emerald-600" : color === 'amber' ? "text-amber-600" : "text-rose-600"
          )}>{status}</span>
        </div>
      </div>
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", colors[color])} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
