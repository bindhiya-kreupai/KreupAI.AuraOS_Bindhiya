"use client";

import React from 'react';

const leaveTypes = [
  { type: 'Annual', used: 5, total: 20, color: 'bg-celestial-indigo' },
  { type: 'Sick', used: 2, total: 10, color: 'bg-quantum-rose' },
  { type: 'Personal', used: 1, total: 3, color: 'bg-sunset-amber' },
  { type: 'Comp-off', used: 0, total: 2, color: 'bg-neural-mint' },
];

export function LeaveBalanceWidget() {
  return (
    <div className="space-y-3">
      {leaveTypes.map((leave) => (
        <div key={leave.type} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink-black dark:text-pearl">{leave.type}</span>
            <span className="text-silver-mist">{leave.total - leave.used} remaining</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${leave.color}`}
              style={{ width: `${(leave.used / leave.total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
