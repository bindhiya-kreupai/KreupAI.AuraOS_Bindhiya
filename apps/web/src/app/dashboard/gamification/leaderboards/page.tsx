'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Trophy, Crown, TrendingUp, Users, Loader2 } from 'lucide-react';
import { LeaderboardsService } from '../services';
import { useToast } from '../components/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface Entry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

const TABS: { label: string; scope: string }[] = [
  { label: 'Global', scope: 'global' },
  { label: 'Team', scope: 'team' },
  { label: 'Regional', scope: 'regional' },
];

export default function LeaderboardsPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const { toasts, dismiss, push } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('global');

  const loadData = useCallback(
    async (nextScope: string) => {
      try {
        setLoading(true);
        const data = await LeaderboardsService.getLeaderboards(nextScope);
        setEntries((data as unknown as Entry[]) || []);
      } catch (error) {
        push('error', error instanceof Error ? error.message : 'Failed to load leaderboard');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  useEffect(() => {
    if (!authLoading) loadData(scope);
  }, [authLoading, scope, loadData]);

  const podium = entries.slice(0, 3);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Leaderboards
          </h1>
          <p className="text-slate-500 text-sm">See who&apos;s leading the pack this month.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.scope}
              onClick={() => setScope(tab.scope)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                scope === tab.scope
                  ? 'bg-white dark:bg-slate-700 shadow text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
          <Users className="w-12 h-12 mb-3" />
          <p className="font-bold">No rankings yet</p>
          <p className="text-sm">Points activity will populate this leaderboard.</p>
        </div>
      ) : (
        <>
          {podium.length >= 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end mb-8">
              <div className="lg:col-span-3 flex justify-center items-end gap-3 h-64 mb-4">
                {podium[1] && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={podium[1].avatar}
                      alt=""
                      className="w-16 h-16 rounded-full border-4 border-slate-300 shadow-lg"
                    />
                    <div className="font-bold text-sm text-slate-600 dark:text-slate-300">
                      {podium[1].name}
                    </div>
                    <div className="w-24 h-32 bg-slate-200 dark:bg-slate-800 rounded-t-xl flex flex-col items-center justify-start pt-4 relative">
                      <span className="text-4xl font-bold text-slate-400 opacity-50">2</span>
                      <div className="text-xs font-bold mt-auto pb-2 text-slate-500">
                        {podium[1].points} pts
                      </div>
                    </div>
                  </div>
                )}
                {podium[0] && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />
                    <img
                      src={podium[0].avatar}
                      alt=""
                      className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-xl"
                    />
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {podium[0].name}
                    </div>
                    <div className="w-28 h-48 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-t-xl flex flex-col items-center justify-start pt-6 shadow-lg shadow-orange-500/20">
                      <span className="text-5xl font-bold text-white mb-1">1</span>
                      <div className="text-sm font-bold text-white/90 mt-auto pb-4">
                        {podium[0].points} pts
                      </div>
                    </div>
                  </div>
                )}
                {podium[2] && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={podium[2].avatar}
                      alt=""
                      className="w-16 h-16 rounded-full border-4 border-orange-300 shadow-lg"
                    />
                    <div className="font-bold text-sm text-slate-600 dark:text-slate-300">
                      {podium[2].name}
                    </div>
                    <div className="w-24 h-24 bg-orange-100 dark:bg-slate-800 rounded-t-xl flex flex-col items-center justify-start pt-4 relative">
                      <span className="text-4xl font-bold text-orange-800/30">3</span>
                      <div className="text-xs font-bold mt-auto pb-2 text-slate-500">
                        {podium[2].points} pts
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-4xl mx-auto w-full">
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all ${
                    entry.isCurrentUser || entry.userId === user?.employeeId
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200'
                      : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold w-6 text-center ${entry.rank <= 3 ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                      {entry.rank}
                    </span>
                    <img
                      src={entry.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full bg-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm">{entry.name}</h4>
                      <p className="text-xs text-slate-500">Rank: #{entry.rank}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="text-xs text-slate-400 hidden md:block">
                      {entry.change === 'up' && (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> up
                        </span>
                      )}
                      {entry.change === 'down' && (
                        <span className="text-rose-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 rotate-180" /> down
                        </span>
                      )}
                      {entry.change === 'same' && <span className="text-slate-400">-</span>}
                    </div>
                    <div className="font-bold text-slate-700 dark:text-slate-300 w-20 text-right">
                      {entry.points} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
