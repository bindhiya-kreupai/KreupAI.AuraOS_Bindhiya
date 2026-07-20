'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Swords, Clock, Target, Users, ArrowRight, Loader2, Check } from 'lucide-react';
import { ChallengesService } from '../services';
import { useToast } from '../components/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface ChallengeView {
  challengeId: string;
  title: string;
  desc: string;
  difficulty: string;
  pointsReward: number;
  reward: string;
  daysLeft: number;
  totalParticipants: number;
  isFeatured: boolean;
  joined: boolean;
  myProgress: number;
  targetValue: number;
  myCurrentValue: number;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-indigo-500',
  hard: 'bg-amber-500',
  expert: 'bg-rose-500',
};

export default function ChallengesPage() {
  const { loading: authLoading } = useCurrentUser();
  const { toasts, dismiss, push } = useToast();
  const [challenges, setChallenges] = useState<ChallengeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ChallengesService.getChallenges();
      setChallenges((data as unknown as ChallengeView[]) || []);
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Failed to load challenges');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  const handleJoin = async (challengeId: string) => {
    try {
      setJoiningId(challengeId);
      await ChallengesService.joinChallenge('', '', challengeId);
      push('success', 'Joined the challenge!');
      await loadData();
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Failed to join');
    } finally {
      setJoiningId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const featured = challenges.find((c) => c.isFeatured) || challenges[0] || null;
  const rest = challenges.filter((c) => c.challengeId !== featured?.challengeId);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-indigo-500" />
            Active Challenges
          </h1>
          <p className="text-slate-500 text-sm">Compete in time-limited events to earn big.</p>
        </div>
      </div>

      {challenges.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
          <Swords className="w-12 h-12 mb-3" />
          <p className="font-bold">No active challenges</p>
          <p className="text-sm">Check back soon for new challenges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {featured && (
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-indigo-900 rounded-3xl overflow-hidden relative min-h-[300px] flex items-end shadow-2xl">
              <div className="relative z-10 p-8 w-full">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                  <div>
                    <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-2 block">
                      {featured.daysLeft <= 3 ? 'Ending Soon' : 'Featured'}
                    </span>
                    <h2 className="text-4xl font-bold text-white mb-2">{featured.title}</h2>
                    <p className="text-slate-300 max-w-xl mb-6">{featured.desc}</p>
                    <div className="flex gap-3 text-white text-sm font-bold">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" /> {featured.daysLeft} Days Left
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" /> {featured.totalParticipants}{' '}
                        Participants
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => !featured.joined && handleJoin(featured.challengeId)}
                    disabled={featured.joined || joiningId === featured.challengeId}
                    className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-70 whitespace-nowrap"
                  >
                    {joiningId === featured.challengeId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : featured.joined ? (
                      <>
                        <Check className="w-4 h-4" /> Joined
                      </>
                    ) : (
                      <>
                        Join Challenge <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {rest.map((c) => {
            const color = DIFFICULTY_COLOR[c.difficulty] || 'bg-indigo-500';
            const pct =
              c.targetValue > 0
                ? Math.min(100, Math.round((c.myCurrentValue / c.targetValue) * 100))
                : 0;
            return (
              <div
                key={c.challengeId}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${color} text-white`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                    {c.reward}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-slate-500 mb-6">{c.desc}</p>
                <div className="mt-auto space-y-3">
                  {c.joined && (
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {c.myCurrentValue}/{c.targetValue}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => !c.joined && handleJoin(c.challengeId)}
                    disabled={c.joined || joiningId === c.challengeId}
                    className="w-full py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {joiningId === c.challengeId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : c.joined ? (
                      <>
                        <Check className="w-4 h-4" /> Joined
                      </>
                    ) : (
                      'Join Challenge'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
