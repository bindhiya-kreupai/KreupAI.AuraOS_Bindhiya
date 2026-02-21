"use client";

import React, { useState, useEffect } from 'react';
import {
    Medal,
    Lock,
    Star,
    Shield,
    Loader2
} from 'lucide-react';
import { BadgesService } from '../services';

export default function BadgesPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await BadgesService.getBadges();
                setBadges(data as any);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);



    // Quick fix for missing icon import
    function Users(props: any) { return <Medal {...props} /> }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Medal className="w-6 h-6 text-indigo-500" />
                        My Badges
                    </h1>
                    <p className="text-slate-500 text-sm">Collect badges to showcase your achievements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((badge, i) => {
                    const Icon = badge.icon;
                    const isLocked = badge.status === 'Locked';

                    return (
                        <div key={i} className={`relative p-6 rounded-2xl border ${isLocked ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50' : 'border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-500/5'} flex flex-col items-center text-center group transition-all hover:-translate-y-1`}>
                            {isLocked && <div className="absolute top-4 right-4 text-slate-400"><Lock className="w-4 h-4" /></div>}

                            <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center ${isLocked ? 'bg-slate-200 grayscale' : badge.bg}`}>
                                <Icon className={`w-10 h-10 ${isLocked ? 'text-slate-400' : badge.color}`} />
                            </div>

                            <h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>{badge.title}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-2 py-0.5 rounded ${isLocked ? 'bg-slate-200 text-slate-500' : badge.bg + ' ' + badge.color}`}>
                                {badge.tier}
                            </span>
                            <p className="text-xs text-slate-500 mb-4">{badge.desc}</p>

                            {isLocked && badge.progress && (
                                <div className="w-full mt-auto">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                        <span>Progress</span>
                                        <span>{badge.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400" style={{ width: `${badge.progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {!isLocked && (
                                <div className="mt-auto text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    Unlocked Jan 2024
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
