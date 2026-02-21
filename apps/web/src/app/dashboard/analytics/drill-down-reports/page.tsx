"use client";

import React, { useState, useEffect } from 'react';
import { ZoomIn, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface DeptItem {
    name: string;
    value: number;
    id: string;
}

export default function DrillDownReportsPage() {
    const [loading, setLoading] = useState(true);
    const [level, setLevel] = useState(1);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [level1Data, setLevel1Data] = useState<DeptItem[]>([]);
    const [level2Data, setLevel2Data] = useState<{ name: string; value: number }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/v1/analytics/headcount');
            const json = await res.json();
            const data = json?.data;

            if (data?.byDepartment) {
                setLevel1Data(
                    data.byDepartment.map((d: any) => ({
                        name: d.department,
                        value: d.count,
                        id: d.department.toLowerCase().replace(/\s+/g, '-'),
                    }))
                );
            }
        } catch (error) {
            console.error('Error loading drill-down data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrillDown = (data: any) => {
        if (level === 1 && data && data.activePayload && data.activePayload[0]) {
            const payload = data.activePayload[0].payload;
            setSelectedDept(payload.id);
            setLevel2Data([
                { name: `${payload.name} - Team A`, value: Math.round(payload.value * 0.4) },
                { name: `${payload.name} - Team B`, value: Math.round(payload.value * 0.35) },
                { name: `${payload.name} - Other`, value: Math.round(payload.value * 0.25) },
            ]);
            setLevel(2);
        }
    };

    const handleReset = () => {
        setLevel(1);
        setSelectedDept(null);
        setLevel2Data([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const currentData = level === 1 ? level1Data : level2Data;
    const selectedDeptName = level1Data.find(d => d.id === selectedDept)?.name || '';
    const title = level === 1 ? 'Department Headcount' : `${selectedDeptName} Breakdown`;

    return (
        <div className="p-6 space-y-8 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <ZoomIn className="w-8 h-8 text-indigo-500" />
                    Drill-down Reports
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Interactive exploration of workforce data.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    {level > 1 && (
                        <button onClick={handleReset} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                    )}
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <span className={level === 1 ? 'text-indigo-600' : ''}>Organization</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className={level === 2 ? 'text-indigo-600' : ''}>
                            {level === 2 ? selectedDeptName : 'Department'}
                        </span>
                    </div>
                </div>

                {currentData.length > 0 ? (
                    <div className="h-[500px] w-full cursor-pointer">
                        <h3 className="text-xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">{title}</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={currentData}
                                onClick={handleDrillDown}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                                <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} animationDuration={500} />
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-center text-xs text-slate-400 mt-4">
                            {level === 1 ? 'Tip: Click on a department bar to drill down.' : 'Viewing detailed breakdown.'}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <ZoomIn className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No headcount data available for drill-down</p>
                    </div>
                )}
            </div>
        </div>
    );
}
