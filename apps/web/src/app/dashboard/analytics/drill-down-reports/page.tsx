"use client";

import React, { useState, useEffect } from 'react';
import { ZoomIn, ChevronRight, ArrowLeft } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { StandardReportService } from '../services';

// --- MOCK DATA ---
const LEVEL_1_DATA = [
    { name: 'Engineering', value: 120, id: 'eng' },
    { name: 'Sales', value: 85, id: 'sales' },
    { name: 'Marketing', value: 45, id: 'mkt' },
    { name: 'HR', value: 25, id: 'hr' },
];

const LEVEL_2_DATA: Record<string, any[]> = {
    'eng': [
        { name: 'Frontend', value: 45 },
        { name: 'Backend', value: 50 },
        { name: 'DevOps', value: 15 },
        { name: 'QA', value: 10 },
    ],
    'sales': [
        { name: 'North America', value: 40 },
        { name: 'Europe', value: 30 },
        { name: 'APAC', value: 15 },
    ],
    'mkt': [
        { name: 'Social', value: 10 },
        { name: 'Content', value: 15 },
        { name: 'Ads', value: 20 },
    ],
    'hr': [
        { name: 'Recruiting', value: 10 },
        { name: 'Ops', value: 15 },
    ]
};

export default function DrillDownReportsPage() {
    const [level, setLevel] = useState(1);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);

    const handleDrillDown = (data: any) => {
        if (level === 1 && data && data.activePayload && data.activePayload[0]) {
            const payload = data.activePayload[0].payload;
            if (LEVEL_2_DATA[payload.id]) {
                setSelectedDept(payload.id);
                setLevel(2);
            }
        }
    };

    const handleReset = () => {
        setLevel(1);
        setSelectedDept(null);
    };

    const currentData = level === 1 ? LEVEL_1_DATA : (selectedDept ? LEVEL_2_DATA[selectedDept] : []);
    const title = level === 1 ? 'Department Headcount' : `${LEVEL_1_DATA.find(d => d.id === selectedDept)?.name} Breakdown`;

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
                            {level === 2 ? LEVEL_1_DATA.find(d => d.id === selectedDept)?.name : 'Department'}
                        </span>
                    </div>
                </div>

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
                            <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} animationDuration={500}>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        {level === 1 ? 'Tip: Click on a department bar to drill down.' : 'Viewing detailed breakdown.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
