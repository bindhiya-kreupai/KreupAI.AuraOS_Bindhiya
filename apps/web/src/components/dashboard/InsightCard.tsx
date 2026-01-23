"use client";

import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface InsightCardProps {
  id: string;
  type: 'turnover-risk' | 'compliance' | 'training' | 'performance';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'positive';
  icon: LucideIcon;
}

const severityStyles = {
  high: 'border-l-coral-alert bg-coral-alert/5',
  medium: 'border-l-sunset-amber bg-sunset-amber/5',
  low: 'border-l-celestial-indigo bg-celestial-indigo/5',
  positive: 'border-l-neural-mint bg-neural-mint/5',
};

const iconStyles = {
  high: 'text-coral-alert bg-coral-alert/10',
  medium: 'text-sunset-amber bg-sunset-amber/10',
  low: 'text-celestial-indigo bg-celestial-indigo/10',
  positive: 'text-neural-mint bg-neural-mint/10',
};

export function InsightCard({ title, description, severity, icon: Icon }: InsightCardProps) {
  return (
    <div className={`border-l-2 ${severityStyles[severity]} rounded-r-lg p-3 flex items-start gap-3 cursor-pointer hover:shadow-sm transition-shadow group`}>
      <div className={`p-1.5 rounded-lg ${iconStyles[severity]} flex-shrink-0`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink-black dark:text-pearl">{title}</p>
        <p className="text-[11px] text-silver-mist mt-0.5 line-clamp-2">{description}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
    </div>
  );
}
