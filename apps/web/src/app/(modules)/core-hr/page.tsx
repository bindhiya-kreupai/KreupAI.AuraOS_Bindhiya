'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Network,
  MapPin,
  History,
  FileCheck,
  UserMinus,
  Contact,
  GraduationCap,
  ShieldCheck,
  ClipboardList,
  Globe,
  Check,
  Zap,
  ArrowUpRight
} from 'lucide-react';

import { EntitySwitcher } from './components/EntitySwitcher';
import { GlobalMetrics } from './components/GlobalMetrics';
import { AgenticWorkflowHub } from './components/AgenticWorkflowHub';

const coreHRFeatures = [
  {
    title: 'Employee Database',
    description: 'Manage comprehensive employee profiles and lifecycle data.',
    icon: Users,
    href: '/dashboard/core-hr/employees',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10'
  },
  {
    title: 'Organization Structure',
    description: 'Define departments, cost centers, and hierarchies.',
    icon: Network,
    href: '/dashboard/core-hr/departments',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10'
  },
  {
    title: 'Position Management',
    description: 'Track job roles, classifications, and headcount budgeting.',
    icon: ShieldCheck,
    href: '/dashboard/core-hr/position-management',
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10'
  },
  {
    title: 'Global Transfers',
    description: 'Process inter-company and cross-border movements.',
    icon: Globe,
    href: '/dashboard/core-hr/transfers',
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10'
  },
  {
    title: 'Employment History',
    description: 'Track career movements and job changes.',
    icon: History,
    href: '/dashboard/core-hr/employment-history',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10'
  },
  {
    title: 'Shared Services',
    description: 'Centralized administrative services hub.',
    icon: FileCheck,
    href: '/dashboard/core-hr/shared-services',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    title: 'Probation Tracking',
    description: 'Monitor employee probation periods and confirmations.',
    icon: ClipboardList,
    href: '/dashboard/core-hr/probation-tracking',
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10'
  },
  {
    title: 'Asset Management',
    description: 'Track equipment and assets assigned to employees.',
    icon: MapPin,
    href: '/dashboard/core-hr/asset-management',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10'
  },
  {
    title: 'Document Intelligence',
    description: 'AI OCR scanning and automated document lifecycles.',
    icon: ShieldCheck,
    href: '/dashboard/core-hr/document-intelligence',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  }
];

export default function CoreHRPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Leadership Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-cloud dark:border-nebula-purple/20">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-black dark:text-pearl tracking-tight mb-2">
            Core HR <span className="text-indigo-600 dark:text-indigo-400">Command Center</span>
          </h1>
          <p className="text-silver-mist max-w-xl leading-relaxed">
            Unified multi-entity administration across all global jurisdictions, organizational hierarchies, and talent lifecycles.
          </p>
        </div>
        <EntitySwitcher />
      </div>

      {/* Global Group Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">Group Performance Metrics</h2>
          <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View Detailed Analytics</button>
        </div>
        <GlobalMetrics />
      </div>

      <div className="pt-2">
        <AgenticWorkflowHub />
      </div>

      {/* Module Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">Administrative Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreHRFeatures.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group block p-6 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-silver-mist leading-relaxed">{feature.description}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Module <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Intelligent Insights Bridge */}
      <div className="bg-gradient-to-br from-celestial-indigo/10 via-white to-transparent dark:from-indigo-900/10 dark:via-stellar-blue dark:to-transparent border border-celestial-indigo/20 rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-500/10 scale-110">
            <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-ink-black dark:text-pearl mb-2">Automated Compliance Sentinel</h3>
            <p className="text-silver-mist max-w-2xl leading-relaxed">
              Our Agentic AI is actively monitoring cross-border labor law changes in <strong>UAE, KSA, and India</strong>.
              Real-time headcount trends and diversity metrics are being synchronized across your 4 active legal entities.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                <Check className="w-3 h-3" /> System Healthy
              </span>
              <span className="text-xs text-silver-mist font-medium">Last Audit: 12 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



