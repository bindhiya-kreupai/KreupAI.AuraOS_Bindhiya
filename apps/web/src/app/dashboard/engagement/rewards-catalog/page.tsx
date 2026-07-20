'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Coins, Loader2 } from 'lucide-react';
import { RewardService } from '../services';

const CATEGORIES = ['All', 'Gift Cards', 'Experiences', 'Merchandise', 'Donations'];

export default function RewardsCatalogPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [category, setCategory] = useState('All');
  const [redeemBusy, setRedeemBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rewardsData, bal] = await Promise.all([
        RewardService.getRewards(),
        RewardService.getBalance().catch(() => ({ balance: 0 })),
      ]);
      setRewards(rewardsData);
      setBalance(bal.balance);
    } catch {
      setToast({ type: 'error', msg: 'Failed to load rewards.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRedeem = async (reward: any) => {
    try {
      setRedeemBusy(reward.id);
      const result = await RewardService.redeem(reward.id);
      if (result) setBalance(result.balance);
      showToast('success', `Redeemed ${reward.title}!`);
      await fetchData();
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to redeem reward.');
    } finally {
      setRedeemBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const visible =
    category === 'All' ? rewards : rewards.filter((r: any) => r.category === category);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`absolute top-2 right-2 z-50 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-indigo-500" />
            Rewards Catalog
          </h1>
          <p className="text-slate-500 text-sm">
            Redeem your hard-earned points for exciting rewards.
          </p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <Coins className="w-5 h-5" />
          <span className="font-bold text-lg">{balance} pts</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 whitespace-nowrap rounded-lg text-sm font-bold border transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Gift className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No rewards available yet.</p>
          <p className="text-sm">Reward items will appear here once configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {visible.map((item: any, i: number) => {
            const cost = item.pointsCost ?? item.cost ?? item.points ?? 0;
            const affordable = balance >= cost;
            return (
              <div
                key={item.id || i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-lg group-hover:opacity-100 transition-opacity">
                  {item.category || 'Reward'}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-md mb-1">{item.title}</h3>
                  <div className="text-amber-500 font-bold text-sm mb-4 flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {cost} pts
                  </div>
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={redeemBusy === item.id || !affordable}
                    className={`mt-auto w-full py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-60 ${
                      affordable
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {redeemBusy === item.id
                      ? 'Redeeming...'
                      : affordable
                        ? 'Redeem'
                        : 'Not enough points'}
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
