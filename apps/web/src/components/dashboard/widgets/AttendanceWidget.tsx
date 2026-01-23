"use client";

import React from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';

export function AttendanceWidget() {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Clocked In</span>
        </div>
        <span className="text-xs text-silver-mist font-mono">{currentTime}</span>
      </div>
      <div className="text-center py-2">
        <p className="text-2xl font-bold text-ink-black dark:text-pearl font-mono">07:32</p>
        <p className="text-xs text-silver-mist mt-1">Hours Today (Target: 09:00)</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
          <div className="flex items-center justify-center gap-1 text-xs text-silver-mist mb-1">
            <LogIn className="w-3 h-3" /> In
          </div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">09:02 AM</p>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
          <div className="flex items-center justify-center gap-1 text-xs text-silver-mist mb-1">
            <Clock className="w-3 h-3" /> Break
          </div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">00:45</p>
        </div>
      </div>
    </div>
  );
}
