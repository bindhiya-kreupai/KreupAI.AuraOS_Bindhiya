"use client";

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    AlertTriangle,
    Users,
    TrendingUp,
    ChevronRight,
    Shield,
    Loader2
} from 'lucide-react';
import { SuccessionCandidateService } from '../services';
import type { SuccessionCandidate } from '../types';

export default function CriticalPositionsPage() {
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

    // Build positions from candidates
    const positionMap = candidates.reduce<Record<string, { title: string; incumbent: string; risk: string; readiness: string; impact: string; successors: number }>>((acc, c) => {
        const posKey = c.targetPositionId || 'unknown';
        if (!acc[posKey]) {
            acc[posKey] = {
                title: c.targetPositionId || 'Unknown Position',
                incumbent: c.employeeName || 'TBD',
                risk: c.readinessLevel === 'ready_now' ? 'Low' : c.readinessLevel === 'ready_1_2_years' ? 'Medium' : 'High',
                readiness: c.readinessLevel === 'ready_now' ? 'High' : c.readinessLevel === 'ready_1_2_years' ? 'Medium' : 'Low',
                impact: 'High',
                successors: 0,
            };
        }
        acc[posKey].successors += 1;
        return acc;
    }, {});

    const positions = Object.entries(positionMap).map(([id, pos], i) => ({ id: i + 1, ...pos }));
    const highRiskCount = positions.filter(p => p.risk === 'High').length;
    const avgSuccessors = positions.length > 0 ? (positions.reduce((s, p) => s + p.successors, 0) / positions.length).toFixed(1) : '0';
    const coverage = positions.length > 0 ? Math.round((positions.filter(p => p.successors > 0).length / positions.length) * 100) : 0;

    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                        <Briefcase className="w-8 h-8 text-indigo-500" />
                        Critical Positions
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Identify and manage risk for business-critical roles.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold border border-rose-100 dark:border-rose-900/20 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {highRiskCount} High Risk Roles
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl text-indigo-600">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{coverage}%</div>
                            <div className="text-sm font-bold text-slate-500">Critical Role Coverage</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-emerald-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{avgSuccessors}</div>
                            <div className="text-sm font-bold text-slate-500">Avg Successors / Role</div>
                        </div>
                    </div>
                </div>

                {/* Risk Summary */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-sm text-slate-500 mb-4">Vacancy Risk Distribution</h3>
                    <div className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            High Risk ({positions.filter(p => p.risk === 'High').length})
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            Medium Risk ({positions.filter(p => p.risk === 'Medium').length})
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            Low Risk ({positions.filter(p => p.risk === 'Low').length})
                        </div>
                    </div>
                </div>
            </div>

            {/* Positions Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Position Title</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Current Incumbent</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Business Impact</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Vacancy Risk</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Successor Readiness</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {positions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">No critical positions data available.</td>
                            </tr>
                        ) : (
                            positions.map((pos) => (
                                <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group cursor-pointer transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{pos.title}</div>
                                        <div className="text-xs text-slate-500">{pos.successors} Potential Successors</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                {pos.incumbent.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pos.incumbent}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                                            {pos.impact}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${pos.risk === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' :
                                                pos.risk === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' :
                                                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                            }`}>
                                            {pos.risk}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${pos.readiness === 'High' ? 'bg-emerald-500' :
                                                        pos.readiness === 'Medium' ? 'bg-amber-500' :
                                                            'bg-rose-500'
                                                    }`}
                                                style={{ width: pos.readiness === 'High' ? '80%' : pos.readiness === 'Medium' ? '50%' : '20%' }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 mt-1 block">{pos.readiness}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

