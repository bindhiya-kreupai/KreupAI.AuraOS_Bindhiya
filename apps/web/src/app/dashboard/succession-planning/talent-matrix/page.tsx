"use client";

import React, { useState, useEffect } from 'react';
import { Grid, Info, Loader2 } from 'lucide-react';
import { SuccessionCandidateService } from '../services';
import type { SuccessionCandidate } from '../types';

const BOX_LABELS: Record<number, { title: string, color: string }> = {
    9: { title: 'Star / Future Leader', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
    8: { title: 'High Potential', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    7: { title: 'Rough Diamond', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    6: { title: 'High Performer', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    5: { title: 'Core Player', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
    4: { title: 'Inconsistent', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    3: { title: 'Workhorse', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    2: { title: 'Effective', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
    1: { title: 'Underperformer', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

export default function TalentMatrixPage() {
    const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await SuccessionCandidateService.getCandidates();
                setCandidates(data);
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

    // Map candidates to 9-box model based on readiness
    const talentData = candidates.map((c, i) => {
        let box = 5; // default core player
        if (c.readinessLevel === 'ready_now') box = 9;
        else if (c.readinessLevel === 'ready_1_2_years') box = 6;
        else if (c.readinessLevel === 'ready_3_5_years') box = 3;
        return {
            id: i + 1,
            name: c.employeeName || `Candidate ${i + 1}`,
            role: c.currentPositionId || 'N/A',
            box,
        };
    });

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Grid className="w-8 h-8 text-indigo-500" />
                        Talent Matrix (9-Box)
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Evaluate talent based on Performance vs Potential.</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                    <Info className="w-4 h-4" /> Calibration Guide
                </button>
            </div>

            <div className="relative">
                {/* Axis Labels */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 font-bold text-slate-400 uppercase tracking-widest text-sm">
                    Potential
                </div>
                <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 font-bold text-slate-400 uppercase tracking-widest text-sm">
                    Performance
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-3 h-[600px] w-full">
                    {[
                        [7, 8, 9], // Top Row: High Potential
                        [4, 5, 6], // Mid Row: Med Potential
                        [1, 2, 3]  // Bot Row: Low Potential
                    ].map((row, rIdx) => (
                        <React.Fragment key={rIdx}>
                            {row.map((boxNum) => {
                                const employees = talentData.filter(e => e.box === boxNum);
                                const style = BOX_LABELS[boxNum];
                                return (
                                    <div key={boxNum} className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-indigo-400 transition-colors">
                                        <div className={`p-2 text-xs font-bold uppercase text-center border-b border-white/50 dark:border-black/50 ${style.color}`}>
                                            {style.title}
                                        </div>
                                        <div className="p-3 flex-1 overflow-y-auto space-y-2 bg-slate-50/50 dark:bg-slate-950/50">
                                            {employees.map(emp => (
                                                <div key={emp.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{emp.name}</div>
                                                    <div className="text-xs text-slate-500">{emp.role}</div>
                                                </div>
                                            ))}
                                            {employees.length === 0 && (
                                                <div className="text-center text-xs text-slate-300 dark:text-slate-600 mt-4 italic">No employees</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

