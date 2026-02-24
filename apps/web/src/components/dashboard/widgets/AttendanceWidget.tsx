/**
 * @module AttendanceWidget
 * @description Clock status, hours today widget
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';

export const AttendanceWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [clockedIn, setClockedIn] = useState(false);
  const [hoursWorked, setHoursWorked] = useState('0h 0m');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mock data – in production, fetch from attendance API
  const todayStatus = {
    checkIn: '09:02 AM',
    expectedHours: '8h 0m',
    breakTaken: '45m',
    overtime: '0h',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Clock className="w-4 h-4 text-celestial-indigo" />
          Attendance
        </h3>
        <span className="text-xs text-silver-mist">{currentTime}</span>
      </div>

      {/* Clock In/Out Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            clockedIn ? 'bg-neural-mint animate-pulse' : 'bg-silver-mist'
          }`}
        />
        <span className="text-xs font-medium text-ink-black dark:text-pearl">
          {clockedIn ? 'Clocked In' : 'Not Clocked In'}
        </span>
      </div>

      {/* Hours Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-pearl/50 dark:bg-deep-cosmos/50 rounded-lg p-2">
          <p className="text-[10px] text-silver-mist">Check-in</p>
          <p className="text-xs font-semibold text-ink-black dark:text-pearl">
            {todayStatus.checkIn}
          </p>
        </div>
        <div className="bg-pearl/50 dark:bg-deep-cosmos/50 rounded-lg p-2">
          <p className="text-[10px] text-silver-mist">Hours Today</p>
          <p className="text-xs font-semibold text-ink-black dark:text-pearl">{hoursWorked}</p>
        </div>
        <div className="bg-pearl/50 dark:bg-deep-cosmos/50 rounded-lg p-2">
          <p className="text-[10px] text-silver-mist">Break</p>
          <p className="text-xs font-semibold text-ink-black dark:text-pearl">
            {todayStatus.breakTaken}
          </p>
        </div>
        <div className="bg-pearl/50 dark:bg-deep-cosmos/50 rounded-lg p-2">
          <p className="text-[10px] text-silver-mist">Expected</p>
          <p className="text-xs font-semibold text-ink-black dark:text-pearl">
            {todayStatus.expectedHours}
          </p>
        </div>
      </div>

      {/* Clock In/Out Button */}
      <button
        onClick={() => {
          setClockedIn(!clockedIn);
          if (!clockedIn) setHoursWorked('0h 0m');
        }}
        className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
          clockedIn
            ? 'bg-quantum-rose/10 text-quantum-rose hover:bg-quantum-rose/20'
            : 'bg-neural-mint/10 text-neural-mint hover:bg-neural-mint/20'
        }`}
      >
        {clockedIn ? (
          <>
            <LogOut className="w-3.5 h-3.5" /> Clock Out
          </>
        ) : (
          <>
            <LogIn className="w-3.5 h-3.5" /> Clock In
          </>
        )}
      </button>
    </div>
  );
};

export default AttendanceWidget;
