"use client";

import React, { useState, useEffect } from 'react';
import {
    Zap,
    Star,
    Shield,
    Crown,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { LevelsService } from '../services';

export default function LevelsTiersPage() {
    const [levels, setLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await LevelsService.getLevelDefinitions();
                setLevels(data as any);
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
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        My Level
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize your journey and perks.</p>
                </div>
            </div>

            {/* Current Level Progress */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
                        <span className="text-4xl font-black">12</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Level 12: Expert Contributor</h2>
                    <p className="text-indigo-200 mb-8 max-w-lg mx-auto">You're in the top 10% of users! Only 450 XP more to reach 'Master'.</p>

                    <div className="w-full max-w-xl mx-auto mb-2">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span>2,450 XP</span>
                            <span>2,900 XP</span>
                        </div>
                        <div className="h-4 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 w-[75%] shadow-[0_0_20px_rgba(250,204,21,0.6)]"></div>
                        </div>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            {/* Tiers Grid */}
            <h3 className="font-bold text-xl pt-4">Tier Progression</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                    { name: 'Bronze', icon: Shield, min: '0 XP', color: 'text-orange-700 bg-orange-100', perks: ['Basic Badges', 'Standard Profile'] },
                    { name: 'Silver', icon: Star, min: '1,000 XP', color: 'text-slate-500 bg-slate-100', perks: ['Custom Avatar', 'Voting Rights'] },
                    { name: 'Gold', icon: Crown, min: '5,000 XP', color: 'text-amber-600 bg-amber-100', perks: ['Premium Rewards', 'Early Access'] },
                    { name: 'Platinum', icon: Zap, min: '10,000 XP', color: 'text-cyan-600 bg-cyan-100', perks: ['VIP Support', 'Mentor Status'] },
                ].map((tier, i) => (
                    <div key={i} className={`p-6 rounded-2xl border flex flex-col ${i === 1 ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} hover:shadow-lg transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${tier.color}`}>
                                <tier.icon className="w-6 h-6" />
                            </div>
                            {i === 1 && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">CURRENT</span>}
                        </div>
                        <h4 className="font-bold text-lg">{tier.name}</h4>
                        <div className="text-xs font-bold text-slate-400 mb-6 w-fit bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Starts at {tier.min}</div>

                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            {tier.perks.map((p, j) => (
                                <li key={j} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

