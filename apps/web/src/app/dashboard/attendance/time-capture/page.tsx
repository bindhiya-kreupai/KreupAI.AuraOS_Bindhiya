'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceCheckService } from '@/app/dashboard/attendance/services';
import type { AttendanceCheck } from '@/app/dashboard/attendance/types';
import { MapPin, Camera, History, LogIn, LogOut, Coffee, Wifi } from 'lucide-react';

interface TimeCapture {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  location?: {
    address: string;
  };
}

export default function TimeCapturePage() {
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState<'OUT' | 'IN' | 'BREAK'>('OUT');
  const [captures, setCaptures] = useState<TimeCapture[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCaptures();
  }, []);

  const fetchCaptures = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await AttendanceCheckService.getChecks({ date: today });
      const capturesArr = (result || []).map((check: AttendanceCheck) => ({
        id: check.id,
        type: check.checkType.toUpperCase() as TimeCapture['type'],
        timestamp: check.checkTime,
        location: check.location ? { address: check.location } : undefined,
      }));
      setCaptures(capturesArr);
      // Determine current status from latest check
      if (capturesArr.length > 0) {
        const latestCheck = capturesArr[capturesArr.length - 1];
        if (latestCheck.type === 'CHECK_IN' || latestCheck.type === 'BREAK_END') {
          setStatus('IN');
        } else if (latestCheck.type === 'BREAK_START') {
          setStatus('BREAK');
        } else {
          setStatus('OUT');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const handleCapture = async (type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END') => {
    setLoading(true);
    try {
      await AttendanceCheckService.recordCheck({
        employeeId: 'current-user', // This would come from auth context
        type,
        timestamp: new Date().toISOString(),
        location: {
          latitude: 28.6139,
          longitude: 77.209,
          address: 'Dubai Office HQ',
        },
      } as any);

      await fetchCaptures();
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const computeTodayHours = (caps: TimeCapture[]) => {
    let totalMs = 0;
    let lastCheckIn: Date | null = null;
    for (const c of caps) {
      if (c.type === 'CHECK_IN' || c.type === 'BREAK_END') {
        lastCheckIn = new Date(c.timestamp);
      } else if ((c.type === 'CHECK_OUT' || c.type === 'BREAK_START') && lastCheckIn) {
        totalMs += new Date(c.timestamp).getTime() - lastCheckIn.getTime();
        lastCheckIn = null;
      }
    }
    // If still clocked in, add time until now
    if (lastCheckIn) {
      totalMs += Date.now() - lastCheckIn.getTime();
    }
    const hours = Math.floor(totalMs / 3600000);
    const mins = Math.floor((totalMs % 3600000) / 60000);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-6">
      {/* Clock & Action Panel */}
      <div className="flex flex-col gap-3">
        {/* Main Card */}
        <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-lg p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="mb-2 text-slate-500 dark:text-slate-400 font-medium">
            {formatDate(time)}
          </div>
          <div className="text-6xl font-bold text-ink-black dark:text-pearl font-mono tracking-wider mb-8">
            {formatTime(time)}
          </div>

          <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-700">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Dubai Office HQ
            </span>
            <span className="text-xs text-emerald-500 ml-2 font-mono flex items-center gap-1">
              <Wifi className="w-3 h-3" /> GPS Stable
            </span>
          </div>

          <div className="flex gap-3 w-full">
            {status === 'OUT' ? (
              <button
                onClick={() => handleCapture('CHECK_IN')}
                disabled={loading}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-bold text-lg shadow-emerald-200 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <LogIn className="w-6 h-6" /> {loading ? 'Processing...' : 'Clock In'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleCapture('CHECK_OUT')}
                  disabled={loading}
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-xl font-bold text-lg shadow-rose-200 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  <LogOut className="w-6 h-6" /> {loading ? 'Processing...' : 'Clock Out'}
                </button>
                {status !== 'BREAK' && (
                  <button
                    onClick={() => handleCapture('BREAK_START')}
                    disabled={loading}
                    className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl font-bold text-lg shadow-amber-200 shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <Coffee className="w-6 h-6" /> {loading ? 'Processing...' : 'Break'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Selfie Mock */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Camera className="w-4 h-4" /> Selfie Verification Required
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <p className="text-xs text-silver-mist uppercase font-bold">Today&apos;s Hours</p>
            <h3 className="text-2xl font-bold text-indigo-600">{computeTodayHours(captures)}</h3>
            <p className="text-xs text-slate-400">Target: 09:00</p>
          </div>
          <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <p className="text-xs text-silver-mist uppercase font-bold">Status</p>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
              {status === 'IN' ? 'Clocked In' : status === 'BREAK' ? 'On Break' : 'Clocked Out'}
            </h3>
            <p
              className={`text-xs ${status === 'IN' ? 'text-emerald-500' : status === 'BREAK' ? 'text-amber-500' : 'text-silver-mist'}`}
            >
              {status === 'IN' ? 'Active' : status === 'BREAK' ? 'Break' : 'Inactive'}
            </p>
          </div>
          <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <p className="text-xs text-silver-mist uppercase font-bold">Punches Today</p>
            <h3 className="text-2xl font-bold text-amber-500">{captures.length}</h3>
            <p className="text-xs text-slate-400">Check-ins & outs</p>
          </div>
          <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <p className="text-xs text-silver-mist uppercase font-bold">First Punch</p>
            <h3 className="text-2xl font-bold text-purple-500">
              {captures.length > 0
                ? new Date(captures[0].timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'}
            </h3>
          </div>
        </div>
      </div>

      {/* History & Map Panel */}
      <div className="flex flex-col gap-3">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col">
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex justify-between items-center">
            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" /> Recent Activity
            </h3>
            <button className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
          </div>
          <div className="p-4 space-y-4">
            {captures.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No activity today</p>
            ) : (
              captures.map((capture, i) => {
                const getActionDetails = (type: string) => {
                  switch (type) {
                    case 'CHECK_IN':
                      return {
                        action: 'Punch In',
                        icon: LogIn,
                        color: 'text-emerald-500 bg-emerald-50',
                      };
                    case 'CHECK_OUT':
                      return {
                        action: 'Punch Out',
                        icon: LogOut,
                        color: 'text-rose-500 bg-rose-50',
                      };
                    case 'BREAK_START':
                      return {
                        action: 'Break Start',
                        icon: Coffee,
                        color: 'text-amber-500 bg-amber-50',
                      };
                    case 'BREAK_END':
                      return {
                        action: 'Break End',
                        icon: Coffee,
                        color: 'text-amber-500 bg-amber-50',
                      };
                    default:
                      return { action: type, icon: History, color: 'text-slate-500 bg-slate-50' };
                  }
                };

                const log = {
                  ...getActionDetails(capture.type),
                  time: new Date(capture.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  location: capture.location?.address || 'Unknown',
                };

                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 relative pb-4 border-l-2 border-slate-100 dark:border-slate-800 last:border-0 pl-4 ml-2"
                  >
                    <div
                      className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${log.color} flex items-center justify-center`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                          {log.action}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{log.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-silver-mist mt-1">
                        <MapPin className="w-3 h-3" /> {log.location}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Simulated Map */}
        <div className="bg-slate-100 rounded-xl h-64 border border-slate-200 shadow-inner relative overflow-hidden flex items-center justify-center group">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] opacity-10 bg-cover bg-center" />
          <div className="z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold text-slate-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Location Detected
          </div>
        </div>
      </div>
    </div>
  );
}
