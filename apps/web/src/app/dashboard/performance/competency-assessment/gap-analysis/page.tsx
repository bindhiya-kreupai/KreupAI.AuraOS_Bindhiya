"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface RadarDataPoint {
    subject: string;
    A: number; // currentLevel
    B: number; // targetLevel
    fullMark: number;
}

interface GapAnalysisItem {
    competency: {
        name: string;
        category?: { name: string } | null;
    };
    currentLevel: { levelNumber: number; name: string };
    targetLevel: { levelNumber: number; name: string };
    gapScore: number;
    priority: string;
}

interface GapAnalysisData {
    id: string;
    name: string;
    items: GapAnalysisItem[];
    criticalGaps: number;
    highGaps: number;
    totalGaps: number;
    avgGapScore: number;
    hasDevelopmentPlan: boolean;
}

export default function GapAnalysisPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RadarDataPoint[]>([]);
    const [analyses, setAnalyses] = useState<GapAnalysisData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGapAnalysis() {
            try {
                const response = await fetch('/api/competency-library/gap-analysis');
                const json = await response.json();

                if (!json.success || !json.data || json.data.length === 0) {
                    setData([]);
                    setAnalyses([]);
                    return;
                }

                setAnalyses(json.data);

                // Transform the gap analysis items into radar chart format
                // Aggregate across all analyses, using the first/most recent one
                const radarMap = new Map<string, { current: number; target: number; count: number }>();

                for (const analysis of json.data) {
                    for (const item of analysis.items) {
                        const name = item.competency?.name || 'Unknown';
                        const existing = radarMap.get(name);
                        if (existing) {
                            existing.current += item.currentLevel.levelNumber;
                            existing.target += item.targetLevel.levelNumber;
                            existing.count += 1;
                        } else {
                            radarMap.set(name, {
                                current: item.currentLevel.levelNumber,
                                target: item.targetLevel.levelNumber,
                                count: 1,
                            });
                        }
                    }
                }

                const radarData: RadarDataPoint[] = Array.from(radarMap.entries())
                    .slice(0, 8) // Limit to 8 items for readability on the radar
                    .map(([subject, values]) => ({
                        subject,
                        A: Math.round((values.target / values.count) * 10) / 10,
                        B: Math.round((values.current / values.count) * 10) / 10,
                        fullMark: 5,
                    }));

                setData(radarData);
            } catch (err: any) {
                console.error('Failed to fetch gap analysis data:', err);
                setError('Failed to load gap analysis data');
            } finally {
                setLoading(false);
            }
        }

        fetchGapAnalysis();
    }, []);

    // Derive insights from real data
    const criticalItems = analyses.flatMap(a =>
        a.items.filter(i => i.priority === 'Critical' || i.gapScore >= 2)
    );
    const strongItems = data.filter(d => d.B >= d.A);
    const worstGap = criticalItems.length > 0
        ? criticalItems.sort((a, b) => b.gapScore - a.gapScore)[0]
        : null;
    const bestStrength = strongItems.length > 0
        ? strongItems.sort((a, b) => (b.B - b.A) - (a.B - a.A))[0]
        : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 text-slate-500">
                <p>{error}</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <PieChart className="w-6 h-6 text-indigo-500" />
                            Skill Gap Analysis
                        </h1>
                        <p className="text-slate-500 text-sm">Visualize discrepancies between required proficiency and actual skills.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                    <PieChart className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-lg font-medium">No gap analysis data available</p>
                    <p className="text-sm mt-1">Create a gap analysis to see competency discrepancies visualized here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-indigo-500" />
                        Skill Gap Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Visualize discrepancies between required proficiency and actual skills.</p>
                </div>
                <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm">
                    <option>Scope: My Team</option>
                    <option>Scope: Organization</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Visual Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center">
                    <h3 className="font-bold text-lg mb-2 self-start">Team Aggregate View</h3>
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                <Radar
                                    name="Required Level"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="#6366f1"
                                    fillOpacity={0.2}
                                />
                                <Radar
                                    name="Actual Level (Avg)"
                                    dataKey="B"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="#10b981"
                                    fillOpacity={0.3}
                                />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {worstGap ? (
                        <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold mb-2">
                                <AlertTriangle className="w-5 h-5" /> Critical Gap Identified
                            </div>
                            <p className="text-sm text-rose-800 dark:text-rose-300 mb-3">
                                <strong>{worstGap.competency?.name}:</strong> Gap score of {worstGap.gapScore} levels between current ({worstGap.currentLevel.name}) and target ({worstGap.targetLevel.name}).
                            </p>
                            <button className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                                Assign Training <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-500">No critical gaps identified.</p>
                        </div>
                    )}

                    {bestStrength ? (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-2">
                                <CheckCircle className="w-5 h-5" /> Strength Area
                            </div>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 relative">
                                <strong>{bestStrength.subject}:</strong> Actual level ({bestStrength.B}) meets or exceeds the required level ({bestStrength.A}).
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-500">No strength areas identified yet.</p>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold text-sm mb-3">Top Training Recommendations</h4>
                        {criticalItems.length > 0 ? (
                            <ul className="space-y-3 text-sm">
                                {criticalItems.slice(0, 3).map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                        <span>{item.competency?.name}</span>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded capitalize">
                                            {item.priority}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-400">No training recommendations at this time.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

