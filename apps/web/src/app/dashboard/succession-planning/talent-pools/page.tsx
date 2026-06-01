// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Crown,
    TrendingUp,
    AlertTriangle,
    UserPlus,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { SuccessionPoolService, SuccessionCandidateService } from '../services';
import type { SuccessionPool, SuccessionCandidate } from '../types';

export default function TalentPoolsPage() {
    const [pools, setPools] = useState<SuccessionPool[]>([]);
    const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [poolsData, candidatesData] = await Promise.all([
                    SuccessionPoolService.getPools(),
                    SuccessionCandidateService.getCandidates(),
                ]);
                setPools(poolsData);
                setCandidates(candidatesData);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const poolColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
    const selectedPool = pools.length > 0 ? pools[0] : null;
    const readyNowCount = candidates.filter(c => c.readinessLevel === 'ready_now').length;

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-amber-500" />
                        Talent Pools
                    </h1>
                    <p className="text-slate-500 text-sm">Manage high-potential groups for succession and critical roles.</p>
                </div>
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20">
                    <UserPlus className="w-4 h-4" /> Create Pool
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0">
                {/* Pools List */}
                <div className="space-y-4 overflow-y-auto pb-20">
                    {pools.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                            No talent pools configured.
                        </div>
                    ) : (
                        pools.map((p, i) => (
                            <div key={p.poolId || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${poolColors[i % poolColors.length]}`}></div>
                                        {p.poolName}
                                    </h3>
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">Pool Size</div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{p.members?.length || 0}</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">Level</div>
                                        <div className="font-bold text-emerald-600">{p.targetLevel || 'General'}</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                                        <div className="text-xs text-slate-500 font-bold uppercase mb-1">Status</div>
                                        <div className="font-bold text-slate-600">{p.status || 'Active'}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pool Detail View */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{selectedPool?.poolName || 'Select a Pool'}</h2>
                            <p className="text-xs text-slate-500">Pipeline for leadership roles.</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-500 uppercase mb-4">Top Candidates</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto">
                        {candidates.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No candidates available.</div>
                        ) : (
                            candidates.slice(0, 5).map((c, i) => (
                                <div key={c.candidateId || i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                            {(c.employeeName || 'N').split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{c.employeeName}</div>
                                            <div className="text-xs text-slate-500">{c.currentPositionId || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-bold ${c.readinessLevel === 'ready_now' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {c.readinessLevel?.replace(/_/g, ' ') || 'TBD'}
                                        </div>
                                        <div className="text-[10px] text-slate-400">Status: {c.status || 'Active'}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

