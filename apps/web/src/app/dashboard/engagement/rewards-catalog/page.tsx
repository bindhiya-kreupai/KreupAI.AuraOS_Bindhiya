"use client";

import React, { useState, useEffect } from 'react';
import {
    Gift,
    Coins,
    Loader2
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function RewardsCatalogPage() {
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await SocialFeedService.getPosts();
            const data = (result as any)?.data || result;
            const allPosts = Array.isArray(data) ? data : [];
            setRewards(allPosts.filter((p: any) => p.type === 'reward'));
        } catch {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        Rewards Catalog
                    </h1>
                    <p className="text-slate-500 text-sm">Redeem your hard-earned points for exciting rewards.</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Coins className="w-5 h-5" />
                    <span className="font-bold text-lg">0 pts</span>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Gift Cards', 'Experiences', 'Merchandise', 'Donations'].map(cat => (
                    <button key={cat} className="px-4 py-2 bg-white dark:bg-slate-900 whitespace-nowrap rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                        {cat}
                    </button>
                ))}
            </div>

            {rewards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Gift className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">No rewards available yet.</p>
                    <p className="text-sm">Reward items will appear here once configured.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {rewards.map((item: any, i: number) => (
                        <div key={item.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                            <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-white font-bold text-lg opacity-80 group-hover:opacity-100 transition-opacity">
                                {item.type || 'Reward'}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-md mb-1">{item.title}</h3>
                                <div className="text-amber-500 font-bold text-sm mb-4 flex items-center gap-1">
                                    <Coins className="w-3 h-3" /> {item.cost || item.points || 0} pts
                                </div>
                                <button className="mt-auto w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    Redeem
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

