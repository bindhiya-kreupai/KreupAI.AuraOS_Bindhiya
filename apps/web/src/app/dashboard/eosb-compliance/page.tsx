'use client';

import React, { useEffect, useState } from 'react';
import { ModuleGrid } from '@/components/dashboard/module-grid';
import { useTheme } from '@/stores/theme-store';
import { Sparkles, Calendar, Layers, ShieldCheck, Coins, AlertCircle, Loader2 } from 'lucide-react';

interface Dashboard {
  period: string;
  calcsCount: number;
  calcsTotalAmount: number;
  accrualsCount: number;
  accrualsTotalAmount: number;
  openDisputesCount: number;
  unsettledCount: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const minPeriod = () => {
  return '2010-01';
};

const maxPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function EosbHome() {
  const { isDark } = useTheme();
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());
  const [inputPeriod, setInputPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch(`/api/v1/eosb-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) setData(p.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [period]);

  const features = [
    { label: 'Finalized Calculations', slug: 'calculations' },
    { label: 'Monthly Accruals & GL', slug: 'accruals' },
    { label: 'Dispute Register', slug: 'disputes' },
    { label: 'Monthly Certificate', slug: 'certificate' },
  ];

  const inputYear = parseInt(inputPeriod.slice(0, 4), 10);
  const isInvalidYear =
    isNaN(inputYear) || inputYear < 2010 || inputYear > new Date().getFullYear();

  return (
    <main
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pb-10">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-700 rounded-2xl p-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md relative overflow-hidden border border-amber-500/20">
          <div className="absolute right-0 top-0 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> EPIC-28 · GCC EOSB Compliance
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">GCC End-of-Service Benefits</h1>
            <p className="text-amber-50 mt-2 max-w-2xl text-sm leading-relaxed">
              Verify statutory calculations (UAE, KSA, Bahrain, Qatar, Oman, Kuwait) and manage
              monthly accruals, disputes, and compliance certificates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm self-start lg:self-auto border border-white/10 shrink-0">
            <span className="text-sm font-medium text-slate-350">Year</span>
            <input
              type="number"
              value={isNaN(inputYear) ? '' : inputYear}
              onChange={(e) => {
                const val = e.target.value;
                setInputPeriod(val + (inputPeriod.slice(4) || '-07'));
              }}
              disabled={isLoading}
              min="2010"
              max={new Date().getFullYear()}
              className="w-24 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3 py-2 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setPeriod(inputPeriod)}
              disabled={isLoading || period === inputPeriod || isInvalidYear}
              className="rounded-lg bg-white text-slate-950 hover:bg-slate-100 px-4 py-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center justify-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
              {isLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>

        {/* KPI Tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-pulse flex flex-col gap-3 h-28 justify-between"
              >
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))
          ) : data ? (
            <>
              <Tile label="Settlements" value={data.calcsCount} icon={Layers} type="info" />
              <Tile
                label="Settlement Total"
                value={`AED ${data.calcsTotalAmount.toLocaleString()}`}
                icon={Coins}
                type="info"
              />
              <Tile
                label="GL Accruals"
                value={data.accrualsCount}
                icon={ShieldCheck}
                type="success"
              />
              <Tile
                label="Accrual Liability"
                value={`AED ${data.accrualsTotalAmount.toLocaleString()}`}
                icon={Coins}
                type="success"
              />
              <Tile
                label="Open Disputes"
                value={data.openDisputesCount}
                icon={AlertCircle}
                type="warning"
              />
              <Tile
                label="Unsettled Cases"
                value={data.unsettledCount}
                icon={AlertCircle}
                type="danger"
              />
            </>
          ) : (
            <div className="col-span-full py-10 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-250 dark:border-slate-800 rounded-xl">
              No End-of-Service benefit telemetry found for {period}.
            </div>
          )}
        </section>

        {/* Workspaces ModuleGrid */}
        <div className="-mt-4">
          <ModuleGrid
            title="EOSB Workspaces"
            description="Manage End of Service Benefit (EOSB) math, liabilities, and multi-jurisdiction compliance."
            features={features}
            basePath="/dashboard/eosb-compliance"
          />
        </div>
      </div>
    </main>
  );
}

interface TileProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  type: 'danger' | 'warning' | 'success' | 'info';
}

function Tile({ label, value, icon: Icon, type }: TileProps) {
  const styles = {
    danger: {
      bg: 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/40',
      icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400',
    },
    warning: {
      bg: 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/40',
      icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500',
      text: 'text-amber-600 dark:text-amber-500',
    },
    success: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    info: {
      bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
      icon: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-350',
      text: 'text-slate-900 dark:text-white',
    },
  }[type];

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3 ${styles.bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.icon} shrink-0`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <span className={`text-lg font-black tracking-tight whitespace-nowrap ${styles.text}`}>
        {value}
      </span>
    </div>
  );
}
