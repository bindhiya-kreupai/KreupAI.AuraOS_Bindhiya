'use client';

import React, { useState, useEffect } from 'react';
import { Award, Gift, Clock, CreditCard, ShoppingBag, ArrowUpRight, Loader2 } from 'lucide-react';
import { WellnessPointsService } from '../services';

const REWARDS = [
    { id: 1, title: '$50 Adidas Voucher', points: 5000, category: 'Apparel', image: 'bg-slate-900' },
    { id: 2, title: '1 Month Headspace', points: 3000, category: 'Wellness', image: 'bg-orange-500' },
    { id: 3, title: 'Healthy Meals Pack', points: 4500, category: 'Nutrition', image: 'bg-emerald-500' },
    { id: 4, title: 'Gym Bag', points: 2500, category: 'Gear', image: 'bg-indigo-500' },
];

const HISTORY = [
    { id: 1, action: 'Step Challenge Completion', points: '+500', date: '2 days ago', type: 'earn' },
    { id: 2, action: 'Daily Log-in Streak', points: '+50', date: 'Yesterday', type: 'earn' },
    { id: 3, action: 'Redeemed: Amazon Gift Card', points: '-2000', date: '1 week ago', type: 'spend' },
];

export default function WellnessPointsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await WellnessPointsService.getTransactions();
                setTransactions(Array.isArray(data) ? data : []);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-yellow-500" />
                        Wellness Points
                    </h1>
                    <p className="text-slate-500 text-sm">Earn points for healthy habits and redeem exciting rewards.</p>
                </div>
            </div>

            {/* Points Balance Card */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-3">
                    <div>
                        <div className="text-yellow-100 font-medium mb-1 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Available Balance
                        </div>
                        <div className="text-5xl font-bold tracking-tight">12,450</div>
                        <div className="text-yellow-100 text-sm mt-2">Lifetime Earned: 45,200</div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-bold transition-colors">
                            History
                        </button>
                        <button className="px-6 py-2 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg">
                            Redeem Now
                        </button>
                    </div>
                </div>
                <div className="absolute -right-10 -top-10 text-white/10">
                    <Award className="w-64 h-64" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rewards Store */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-indigo-500" />
                            Rewards Catalog
                        </h3>
                        <button className="text-sm font-medium text-slate-500 hover:text-indigo-500">View All</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {REWARDS.map(reward => (
                            <div key={reward.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group">
                                <div className={`w-16 h-16 rounded-lg ${reward.image} flex items-center justify-center text-white font-bold text-xs`}>
                                    IMG
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-slate-400 mb-0.5">{reward.category}</div>
                                    <h4 className="font-bold text-sm mb-1 group-hover:text-indigo-500 transition-colors">{reward.title}</h4>
                                    <div className="text-yellow-600 dark:text-yellow-500 font-bold text-sm flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                        {reward.points.toLocaleString()} pts
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-slate-400" />
                        Recent Activity
                    </h3>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
                        {HISTORY.map((item, idx) => (
                            <div key={idx} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{item.action}</span>
                                    <span className={`font-bold text-sm ${item.type === 'earn' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {item.points}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400">{item.date}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

