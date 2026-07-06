import * as React from 'react';

type RAGStatus = 'GREEN' | 'AMBER' | 'RED';

interface RAGBadgeProps {
  status: RAGStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export function RAGBadge({ status, size = 'md' }: RAGBadgeProps) {
  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    GREEN: {
      bg: 'bg-emerald-50 border border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      label: 'Green',
    },
    AMBER: {
      bg: 'bg-amber-50 border border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      label: 'Amber',
    },
    RED: {
      bg: 'bg-rose-50 border border-rose-200',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
      label: 'Red',
    },
  };

  const s = styles[status?.toUpperCase()] ?? {
    bg: 'bg-slate-50 border border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
    label: status ?? '—',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${s.bg} ${s.text} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

interface CertStatusBadgeProps {
  status: string;
}

export function CertStatusBadge({ status }: CertStatusBadgeProps) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    SIGNED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    BLOCKED: 'bg-rose-50 text-rose-800 border-rose-200',
  };
  const cls = styles[status?.toUpperCase()] ?? 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {status ?? '—'}
    </span>
  );
}
