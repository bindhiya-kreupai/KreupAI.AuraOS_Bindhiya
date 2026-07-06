'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Medal,
  Lock,
  Star,
  Shield,
  Award,
  Trophy,
  Crown,
  Zap,
  Target,
  Heart,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { BadgesService } from '../services';
import { useToast } from '../components/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface BadgeView {
  badgeId: string;
  title: string;
  desc: string;
  icon: string;
  tier: string;
  status: 'Unlocked' | 'Locked';
  bg: string;
  color: string;
}

// Map the icon name persisted with each badge to a lucide component.
const ICON_MAP: Record<string, LucideIcon> = {
  Medal,
  Star,
  Shield,
  Award,
  Trophy,
  Crown,
  Zap,
  Target,
  Heart,
};

export default function BadgesPage() {
  const { loading: authLoading } = useCurrentUser();
  const { toasts, dismiss, push } = useToast();
  const [badges, setBadges] = useState<BadgeView[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await BadgesService.getBadges();
      setBadges((data as unknown as BadgeView[]) || []);
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Medal className="w-6 h-6 text-indigo-500" />
            My Badges
          </h1>
          <p className="text-slate-500 text-sm">Collect badges to showcase your achievements.</p>
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
          <Medal className="w-12 h-12 mb-3" />
          <p className="font-bold">No badges available</p>
          <p className="text-sm">Badges will appear here as your program grows.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {badges.map((badge) => {
            const Icon = ICON_MAP[badge.icon] || Medal;
            const isLocked = badge.status === 'Locked';

            return (
              <div
                key={badge.badgeId}
                className={`relative p-6 rounded-2xl border ${
                  isLocked
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
                    : 'border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-500/5'
                } flex flex-col items-center text-center group transition-all hover:-translate-y-1`}
              >
                {isLocked && (
                  <div className="absolute top-4 right-4 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center ${
                    isLocked ? 'bg-slate-200 grayscale' : badge.bg
                  }`}
                >
                  <Icon className={`w-10 h-10 ${isLocked ? 'text-slate-400' : badge.color}`} />
                </div>

                <h3
                  className={`font-bold text-lg mb-1 ${
                    isLocked ? 'text-slate-500' : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {badge.title}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-2 py-0.5 rounded ${
                    isLocked ? 'bg-slate-200 text-slate-500' : `${badge.bg} ${badge.color}`
                  }`}
                >
                  {badge.tier}
                </span>
                <p className="text-xs text-slate-500 mb-4">{badge.desc}</p>

                {!isLocked && (
                  <div className="mt-auto text-xs font-bold text-emerald-600 flex items-center gap-1">
                    Unlocked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
