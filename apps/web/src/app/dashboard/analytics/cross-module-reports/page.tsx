"use client";

import React, { useState, useEffect } from 'react';
import { Link2, ArrowRightLeft, Loader2 } from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function CrossModuleReportsPage() {
    const [loading, setLoading] = useState(true);
    const [scatterData, setScatterData] = useState<{ x: number; y: number; z: number }[]>([]);
    const [correlation, setCorrelation] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [headcountRes, compRes] = await Promise.all([
                fetch('/api/v1/analytics/headcount').then(r => r.json()).catch(() => null),
                fetch('/api/v1/analytics/compensation').then(r => r.json()).catch(() => null),
            ]);

            const hcDepts = headcountRes?.data?.byDepartment || [];
            const compDepts = compRes?.data?.byDepartment || [];

            const points: { x: number; y: number; z: number }[] = [];
            hcDepts.forEach((hd: any) => {
                const comp = compDepts.find((cd: any) => cd.department === hd.department);
                if (comp) {
                    points.push({
                        x: hd.count,
                        y: Math.round(comp.avgSalary / 1000),
                        z: comp.headcount,
                    });
                }
            });

            setScatterData(points);

            if (points.length >= 3) {
                const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
                const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
                let num = 0, denX = 0, denY = 0;
                points.forEach(p => {
                    num += (p.x - avgX) * (p.y - avgY);
                    denX += (p.x - avgX) ** 2;
                    denY += (p.y - avgY) ** 2;
                });
                const r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
                const strength = Math.abs(r) > 0.7 ? 'strong' : Math.abs(r) > 0.4 ? 'moderate' : 'weak';
                const direction = r > 0 ? 'positive' : 'negative';
                setCorrelation(`${strength} ${direction} correlation (${r.toFixed(2)}) between Headcount and Avg Salary`);
            }
        } catch (error: any) {
            console.error('Error loading cross-module data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <Link2 className="w-8 h-8 text-indigo-500" />
                    Cross-module Reports
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Correlate data across different functional areas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5 text-indigo-500" /> Correlation Config
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">X-Axis Metric</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                    <option>Headcount (by Department)</option>
                                    <option>Attendance % (Attendance)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Y-Axis Metric</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm">
                                    <option>Avg Salary (Compensation)</option>
                                    <option>Turnover Rate (Attrition)</option>
                                </select>
                            </div>
                            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                                Analyze Correlation
                            </button>
                        </div>
                    </div>

                    {correlation && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                            <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Insight Detected</h4>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">{correlation}</p>
                        </div>
                    )}

                    {!correlation && scatterData.length === 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                            <p className="text-sm text-slate-400">No cross-module data available for analysis</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-[400px]">
                    <h3 className="font-bold text-lg mb-4 text-center">Correlation Scatter Plot</h3>
                    {scatterData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis type="number" dataKey="x" name="Headcount" unit=" emp" stroke="#94a3b8" />
                                <YAxis type="number" dataKey="y" name="Avg Salary" unit="K" stroke="#94a3b8" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Scatter name="Departments" data={scatterData} fill="#8884d8" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-slate-400">No data points to display</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

