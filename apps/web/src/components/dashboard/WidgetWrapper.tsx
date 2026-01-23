"use client";

import React from 'react';
import { X, GripVertical } from 'lucide-react';

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  className?: string;
}

export function WidgetWrapper({ id, title, children, onRemove, className = '' }: WidgetWrapperProps) {
  return (
    <div className={`bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-shadow flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-silver-mist cursor-grab" />
          <h3 className="text-sm font-bold text-ink-black dark:text-pearl">{title}</h3>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(id)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-coral-alert transition-colors"
            aria-label={`Remove ${title} widget`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
}
