import * as React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  type: 'danger' | 'warning' | 'success' | 'info' | 'indigo' | 'amber';
  sub?: string;
}

export function KPICard({ label, value, icon: Icon, type, sub }: KPICardProps) {
  const styles = {
    danger: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      icon: 'bg-rose-100 text-rose-700',
      text: 'text-rose-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-700',
    },
    info: {
      bg: 'bg-slate-50',
      border: 'border-slate-100',
      icon: 'bg-slate-100 text-slate-800',
      text: 'text-slate-900',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      icon: 'bg-indigo-100 text-indigo-700',
      text: 'text-indigo-700',
    },
    amber: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      icon: 'bg-orange-100 text-orange-700',
      text: 'text-orange-700',
    },
  }[type];

  return (
    <div
      className={`rounded-2xl border ${styles.border} ${styles.bg} p-4 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <span className={`text-2xl font-black tracking-tight ${styles.text}`}>{value}</span>
        {sub && <p className="mt-0.5 text-[10px] font-medium text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
