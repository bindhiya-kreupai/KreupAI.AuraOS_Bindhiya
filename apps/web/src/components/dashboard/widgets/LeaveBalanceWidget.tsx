/**
 * @module LeaveBalanceWidget
 * @description Leave balance breakdown widget
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';

interface LeaveType {
  type: string;
  total: number;
  used: number;
  color: string;
}

export const LeaveBalanceWidget: React.FC = () => {
  // Mock data – in production, fetch from leave API
  const leaveBalances: LeaveType[] = [
    { type: 'Annual', total: 21, used: 8, color: 'bg-celestial-indigo' },
    { type: 'Sick', total: 10, used: 2, color: 'bg-quantum-rose' },
    { type: 'Personal', total: 5, used: 1, color: 'bg-sunset-amber' },
    { type: 'Comp Off', total: 3, used: 0, color: 'bg-neural-mint' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-neural-mint" />
        Leave Balance
      </h3>

      <div className="space-y-2.5">
        {leaveBalances.map((leave) => {
          const remaining = leave.total - leave.used;
          const percentage = (leave.used / leave.total) * 100;

          return (
            <div key={leave.type} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-black dark:text-pearl">
                  {leave.type}
                </span>
                <span className="text-[10px] text-silver-mist">
                  {remaining}/{leave.total} remaining
                </span>
              </div>
              <div className="w-full h-1.5 bg-pearl dark:bg-deep-cosmos rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${leave.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="pt-2 border-t border-cloud/50 dark:border-nebula-purple/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-silver-mist">Total Available</span>
          <span className="text-sm font-bold text-celestial-indigo">
            {leaveBalances.reduce((sum, l) => sum + (l.total - l.used), 0)} days
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceWidget;
