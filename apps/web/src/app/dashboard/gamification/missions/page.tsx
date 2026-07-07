'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Map, CheckSquare, Gift, Lock, Loader2 } from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { MissionsService } from '../services';
import { useToast } from '../components/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface MissionView {
  missionId: string;
  title: string;
  reward: string;
  status: 'Completed' | 'Pending' | 'Locked';
}

export default function MissionsPage() {
  const { loading: authLoading } = useCurrentUser();
  const { toasts, dismiss, push } = useToast();
  const [missions, setMissions] = useState<MissionView[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch raw so we can read the streak from meta as well as the list.
      const res = await APIClient.get<any>('/gamification/missions');
      setMissions(APIClient.unwrapList<MissionView>(res));
      setStreak(res?.meta?.currentStreak ?? 0);
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Failed to load missions');
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  const handleStart = async (missionId: string) => {
    try {
      setStartingId(missionId);
      await MissionsService.startMission('', '', missionId);
      push('success', 'Mission started!');
      await loadData();
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Failed to start mission');
    } finally {
      setStartingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const streakDots = Array.from({ length: Math.min(5, streak) });

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            Daily Missions
          </h1>
          <p className="text-slate-500 text-sm">Complete tasks to earn streak bonuses.</p>
        </div>
      </div>

      {/* Streak Banner */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-600/20">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold">{streak}</div>
            <div className="text-[10px] uppercase font-bold text-indigo-200">Day Streak</div>
          </div>
          <div className="h-10 w-px bg-indigo-400/50"></div>
          <div>
            <div className="font-bold">
              {streak > 0 ? "You're on fire! 🔥" : 'Start your streak today!'}
            </div>
            <div className="text-sm text-indigo-100">
              Complete today&apos;s missions to keep the streak alive.
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          {streakDots.map((_, d) => (
            <div
              key={d}
              className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-emerald-900 font-bold text-xs ring-2 ring-indigo-500"
            >
              ✓
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs border-2 border-white/50 border-dashed">
            {streak + 1}
          </div>
        </div>
      </div>

      {/* Missions List */}
      {missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
          <Map className="w-12 h-12 mb-3" />
          <p className="font-bold">No missions available</p>
          <p className="text-sm">New missions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((m) => (
            <div
              key={m.missionId}
              className={`flex items-center justify-between p-5 rounded-2xl border ${
                m.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    m.status === 'Completed'
                      ? 'bg-emerald-500 text-white'
                      : m.status === 'Locked'
                        ? 'bg-slate-200 text-slate-400'
                        : 'border-2 border-slate-300'
                  }`}
                >
                  {m.status === 'Completed' ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : m.status === 'Locked' ? (
                    <Lock className="w-4 h-4" />
                  ) : null}
                </div>
                <div className={m.status === 'Completed' ? 'opacity-50 line-through' : ''}>
                  <h4 className="font-bold">{m.title}</h4>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
                  <Gift className="w-4 h-4" /> {m.reward}
                </div>
                {m.status === 'Pending' && (
                  <button
                    onClick={() => handleStart(m.missionId)}
                    disabled={startingId === m.missionId}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1"
                  >
                    {startingId === m.missionId && <Loader2 className="w-3 h-3 animate-spin" />}{' '}
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
