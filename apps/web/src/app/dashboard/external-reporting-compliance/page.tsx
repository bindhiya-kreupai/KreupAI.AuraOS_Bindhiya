'use client';

import React from 'react';
import { useTheme } from '@/stores/theme-store';
import Link from 'next/link';
import { ExternalLink, ArrowRight, FolderLock, Sparkles } from 'lucide-react';

export default function ExternalReportingComplianceHomePage() {
  const { isDark } = useTheme();

  const tools = [
    {
      href: '/dashboard/external-reporting-compliance/bilingual-disclosure',
      label: 'Bilingual Disclosure',
      desc: 'Verify disclosure texts meet language requirements (English & Arabic).',
    },
    {
      href: '/dashboard/external-reporting-compliance/file-format',
      label: 'File Format Validator',
      desc: 'Validate structure, header signatures, and delimiters for official uploads.',
    },
    {
      href: '/dashboard/external-reporting-compliance/submission-cadence',
      label: 'Submission Cadence Check',
      desc: 'Track and verify submission history against expected compliance intervals.',
    },
  ];

  return (
    <main
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md relative overflow-hidden border border-indigo-500/20">
          <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> EPIC-29 · EXTERNAL REPORTING COMPLIANCE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              External Reporting Compliance
            </h1>
            <p className="text-indigo-100/90 mt-2 max-w-2xl text-sm leading-relaxed">
              Validate corporate filings and regulatory reports against format, language, and
              frequency rules.
            </p>
          </div>
        </div>

        {/* Workspaces */}
        <section className="-mt-2">
          <div className="flex items-center gap-2 mb-4">
            <FolderLock className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xs font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
              Reporting Workspaces
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {tools.map((t) => (
              <WorkspaceCard
                key={t.href}
                href={t.href}
                title={t.label}
                subtitle="Evaluator"
                desc={t.desc}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

interface WorkspaceCardProps {
  href: string;
  title: string;
  subtitle: string;
  desc: string;
}

function WorkspaceCard({ href, title, subtitle, desc }: WorkspaceCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-slate-450 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {subtitle}
        </span>
        <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
          {title}
          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-slate-800 dark:text-slate-200 transition-all ml-0.5" />
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1.5">{desc}</p>
      </div>
      <div className="flex justify-end pt-5 mt-auto">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-950 dark:group-hover:bg-white text-slate-400 dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-950 transition-all">
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
