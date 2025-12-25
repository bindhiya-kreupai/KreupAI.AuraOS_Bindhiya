"use client";

import React, { useState, useEffect } from 'react';
import {
    Gift,
    ShoppingBag,
    Coins
} from 'lucide-react';
import { SocialFeedService } from '../services';

export default function RewardsCatalogPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const posts = await SocialFeedService.getPosts();
            setData(posts.filter(p => p.type === 'reward'));
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        Rewards Catalog
                    </h1>
                    <p className="text-slate-500 text-sm">Redeem your hard-earned points for exciting rewards.</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Coins className="w-5 h-5" />
                    <span className="font-bold text-lg">2,450 pts</span>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Gift Cards', 'Experiences', 'Merchandise', 'Donations'].map(cat => (
                    <button key={cat} className="px-4 py-2 bg-white dark:bg-slate-900 whitespace-nowrap rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: '$50 Amazon Gift Card', cost: 500, img: 'bg-slate-800', type: 'Gift Card' },
                    { title: 'Spa Day Package', cost: 1200, img: 'bg-emerald-800', type: 'Experience' },
                    { title: 'Aura Branded Hoodie', cost: 800, img: 'bg-indigo-800', type: 'Merch' },
                    { title: 'Donation to Red Cross', cost: 100, img: 'bg-rose-800', type: 'Donation' },
                    { title: '$20 Starbucks Card', cost: 200, img: 'bg-green-800', type: 'Gift Card' },
                    { title: 'Cinema Tickets (Pair)', cost: 350, img: 'bg-purple-800', type: 'Experience' },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className={`h-40 ${item.img} flex items-center justify-center text-white font-bold text-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                            {item.type}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-md mb-1">{item.title}</h3>
                            <div className="text-amber-500 font-bold text-sm mb-4 flex items-center gap-1">
                                <Coins className="w-3 h-3" /> {item.cost} pts
                            </div>
                            <button className="mt-auto w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                Redeem
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
