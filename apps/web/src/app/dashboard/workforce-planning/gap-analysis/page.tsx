'use client';

import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface GapRow {
    role: string;
    available: number;
    needed: number;
    gap: number;
    criticality: string;
}

export default function GapAnalysisPage() {
    const [data, setData] = useState<GapRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/competency-library/gap-analysis?type=workforce');
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    const rows: GapRow[] = json.data.flatMap((analysis: any) =>
                        (analysis.items || []).map((item: any) => {
                            const currentLevel = item.currentLevel?.levelNumber ?? 0;
                            const targetLevel = item.targetLevel?.levelNumber ?? 0;
                            const gap = currentLevel - targetLevel;
                            const priority = item.priority || 'Medium';
                            const criticality =
                                priority === 'Critical' ? 'High' :
                                priority === 'High' ? 'High' :
                                priority === 'Medium' ? 'Medium' : 'Low';
                            return {
                                role: item.competency?.name || analysis.name || 'Unknown',
                                available: currentLevel,
                                needed: targetLevel,
                                gap,
                                criticality,
                            };
                        })
                    );
                    setData(rows);
                } else {
                    setData([]);
                }
            } catch (error: any) {
                console.error('Error fetching gap analysis data:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="w-6 h-6 text-rose-500" />
                        Gap Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Identify discrepancies between current capabilities and future needs.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Layers className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No gap analysis data available</p>
                    <p className="text-sm">Gap analysis data will appear here once workforce assessments are completed.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Role / Skill Set</th>
                                <th className="px-6 py-4 text-center">Current Supply</th>
                                <th className="px-6 py-4 text-center">Future Demand</th>
                                <th className="px-6 py-4 text-center">Net Gap</th>
                                <th className="px-6 py-4">Criticality</th>
                                <th className="px-6 py-4">Action Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-bold">{item.role}</td>
                                    <td className="px-6 py-4 text-center text-slate-500">{item.available}</td>
                                    <td className="px-6 py-4 text-center text-slate-500">{item.needed}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold px-2 py-1 rounded ${item.gap < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.gap > 0 ? '+' : ''}{item.gap}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold uppercase ${item.criticality === 'High' ? 'text-red-500' :
                                                item.criticality === 'Medium' ? 'text-orange-500' :
                                                    'text-slate-400'
                                            }`}>
                                            {item.criticality}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.gap < 0 ? (
                                            <button className="text-indigo-600 font-medium text-xs hover:underline flex items-center gap-1">
                                                Start Hiring <ArrowRight className="w-3 h-3" />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> Balanced
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

