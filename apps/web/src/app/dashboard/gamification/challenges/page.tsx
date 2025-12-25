"use client";

import React, { useState } from 'react';
import {
    Swords,
    Clock,
    Target,
    Users,
    ArrowRight
} from 'lucide-react';

export default function ChallengesPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Swords className="w-6 h-6 text-indigo-500" />
                        Active Challenges
                    </h1>
                    <p className="text-slate-500 text-sm">Compete in time-limited events to earn big.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hero Challenge */}
                <div className="lg:col-span-2 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center rounded-3xl overflow-hidden relative min-h-[300px] flex items-end shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="relative z-10 p-8 w-full">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-2 block animate-pulse">Ending Soon</span>
                                <h2 className="text-4xl font-bold text-white mb-2">The Code Quality Sprint</h2>
                                <p className="text-slate-300 max-w-xl mb-6">Reduce technical debt by refactoring legacy modules. Top contributors get the exclusive &apos;Cleaner' badge.</p>
                                <div className="flex gap-6 text-white text-sm font-bold">
                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> 2 Days Left</span>
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> 42 Participants</span>
                                </div>
                            </div>
                            <button className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                                Join Challenge <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secondary Challenges */}
                {[
                    { title: 'Knowledge Sharer', desc: 'Write 3 documentation articles', reward: '500 XP', color: 'bg-emerald-500' },
                    { title: 'Early Bird', desc: 'Log in before 8:30 AM for a week', reward: '200 XP', color: 'bg-indigo-500' },
                ].map((c, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${c.color} text-white`}>
                                <Target className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">{c.reward}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                        <p className="text-sm text-slate-500 mb-6">{c.desc}</p>
                        <div className="mt-auto">
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>Progress</span>
                                <span>1/3</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${c.color} w-[33%]`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
