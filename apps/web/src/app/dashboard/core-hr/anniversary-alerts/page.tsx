"use client";

import React, { useState, useEffect } from 'react';
import {
    Award,
    Calendar,
    Gift,
    MessageCircle
} from 'lucide-react';
import { AnniversaryService } from '../services';
import type { Anniversary } from '../types';

const cardColors = ['bg-amber-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-purple-500', 'bg-sky-500'];

const formatDaysUntil = (anniversaryDate: Date | string): string => {
    const date = new Date(anniversaryDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return new Date(anniversaryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    if (diffDays <= 7) return `In ${diffDays} days`;
    return new Date(anniversaryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

export default function AnniversaryAlertsPage() {
    const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnniversaries();
    }, []);

    const fetchAnniversaries = async () => {
        try {
            const data = await AnniversaryService.getAllAnniversaries();
            setAnniversaries(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (type: string, name: string) => {
        alert(`${type} sent to ${name}!`);
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-amber-500" />
                        Anniversary Alerts
                    </h1>
                    <p className="text-slate-500 text-sm">Upcoming work anniversaries and long-service awards.</p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {!loading && anniversaries.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Award className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No upcoming anniversaries</p>
                    <p className="text-sm">Anniversaries will appear here once records are added.</p>
                </div>
            )}

            {!loading && anniversaries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {anniversaries.map((emp, i) => {
                        const color = cardColors[i % cardColors.length];
                        const dateText = formatDaysUntil(emp.anniversaryDate);
                        const isTomorrow = dateText === 'Tomorrow';
                        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.employeeName)}&background=random`;

                        return (
                            <div key={emp.anniversaryId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className={`absolute top-0 right-0 p-4 ${color} bg-opacity-10 rounded-bl-3xl font-bold text-2xl`}>
                                    {emp.yearsOfService ?? '-'}
                                </div>

                                {isTomorrow && (
                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/confetti.png')]"></div>
                                )}

                                <div className="flex flex-col items-center text-center mt-4">
                                    <div className="w-24 h-24 rounded-full p-1 border-4 border-slate-100 dark:border-slate-800 mb-4 relative">
                                        <img src={avatarUrl} alt={emp.employeeName} className="w-full h-full rounded-full object-cover" />
                                        <div className="absolute bottom-0 right-0 bg-amber-400 text-white p-2 rounded-full border-4 border-white dark:border-slate-900 shadow-sm">
                                            <Award className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mt-2">{emp.employeeName}</h3>
                                    <div className="text-slate-500 text-sm mb-4">{emp.anniversaryType === 'work' ? 'Work Anniversary' : emp.anniversaryType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>

                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 mb-6">
                                        <Calendar className="w-3 h-3" /> Anniversary: {dateText}
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => handleAction('Gift', emp.employeeName)}
                                            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Gift className="w-4 h-4" /> Send Gift
                                        </button>
                                        <button
                                            onClick={() => handleAction('Wish', emp.employeeName)}
                                            className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-4 h-4" /> Wish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
