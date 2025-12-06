"use client";

import React, { useState } from 'react';
import {
    Gift,
    ShoppingBag,
    Coins,
    Heart,
    Clock,
    Filter,
    ArrowRight
} from 'lucide-react';

const REWARDS = [
    { id: 1, name: 'Amazon Gift Card $50', cost: 500, category: 'Vouchers', image: '🎁' },
    { id: 2, name: 'Extra Day Off', cost: 1000, category: 'Perks', image: '🏖️' },
    { id: 3, name: 'Company Swag Pack', cost: 300, category: 'Merchandise', image: '👕' },
    { id: 4, name: 'Lunch with CEO', cost: 5000, category: 'Experiences', image: '🍽️' },
    { id: 5, name: 'Netflix Subscription', cost: 150, category: 'Subscriptions', image: '🎬' },
    { id: 6, name: 'Charity Donation', cost: 100, category: 'Donations', image: '🤲' },
];

export default function RewardsMarketplacePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-indigo-500" />
                        Rewards Marketplace
                    </h1>
                    <p className="text-slate-500 text-sm">Redeem your hard-earned points for exciting perks.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-200 dark:border-amber-800">
                        <Coins className="w-5 h-5 text-amber-600" />
                        <div className="flex flex-col leading-none">
                            <span className="text-xs font-bold text-amber-600 uppercase">Your Balance</span>
                            <span className="font-black text-lg text-amber-700 dark:text-amber-500">1,250 pts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Terms */}
            <div className="flex gap-2 shrink-0 overflow-x-auto pb-2">
                {['All', 'Vouchers', 'Perks', 'Merchandise', 'Experiences', 'Donations'].map(cat => (
                    <button key={cat} className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors whitespace-nowrap">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20">
                {REWARDS.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform">
                            {item.image}
                        </div>

                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                        <div className="text-xs text-slate-500 mb-4">{item.category}</div>

                        <div className="mt-auto w-full">
                            <div className="flex items-center justify-center gap-1 font-bold text-amber-600 mb-4">
                                <Coins className="w-4 h-4" /> {item.cost}
                            </div>

                            <button className="w-full py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                Redeem
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
