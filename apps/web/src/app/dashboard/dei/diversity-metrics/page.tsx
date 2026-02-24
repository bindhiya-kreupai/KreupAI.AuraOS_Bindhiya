"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    Globe,
    PieChart,
    Download,
    Filter,
    Loader2
} from 'lucide-react';
import { DiversityMetricsService } from '../services';
import {
    Pie,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

export default function DiversityMetricsPage() {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await DiversityMetricsService.getAllMetrics();
                setMetrics(data as any);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Mock Data for Charts
    const genderData = [
        { name: 'Male', value: 55, color: '#6366f1' },
        { name: 'Female', value: 42, color: '#ec4899' },
        { name: 'Non-Binary', value: 3, color: '#10b981' },
    ];

    const ethnicityData = [
        { name: 'White', value: 45, color: '#94a3b8' },
        { name: 'Asian', value: 25, color: '#f59e0b' },
        { name: 'Hispanic', value: 15, color: '#8b5cf6' },
        { name: 'Black', value: 10, color: '#ef4444' },
        { name: 'Other', value: 5, color: '#10b981' },
    ];

    const leadershipData = [
        { level: 'Executive', male: 60, female: 40 },
        { level: 'Director', male: 55, female: 45 },
        { level: 'Manager', male: 50, female: 50 },
        { level: 'Individual', male: 48, female: 52 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
                        Diversity Metrics
                    </h1>
                    <p className="text-slate-500 text-sm">Real-time statistics on workforce demographics.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase">Total Employees</div>
                            <div className="text-2xl font-bold">1,248</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase">Diverse Hires (YTD)</div>
                            <div className="text-2xl font-bold text-emerald-600">+12%</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-full text-pink-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase">Women in Leadership</div>
                            <div className="text-2xl font-bold">42%</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-600">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase">Nationalities</div>
                            <div className="text-2xl font-bold">34</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[400px]">
                {/* Gender Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="font-bold text-lg mb-4">Gender Distribution</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={genderData}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ethnicity Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="font-bold text-lg mb-4">Ethnicity Breakdown</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ethnicityData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12 }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {ethnicityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Leadership Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
                <h3 className="font-bold text-lg mb-4">Gender by Leadership Level</h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leadershipData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="level" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 12 }} />
                            <Legend />
                            <Bar dataKey="male" name="Male" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="female" name="Female" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

