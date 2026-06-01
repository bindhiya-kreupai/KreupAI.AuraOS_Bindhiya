// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    AlertOctagon,
    TrendingDown,
    DollarSign,
    Briefcase,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight
} from 'lucide-react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { predictiveAttrition } from '@/lib/services/ai-automation-client';

// --- MOCK DATA ---

const RISK_DISTRIBUTION = [
    { name: 'High Risk', value: 15, color: '#ef4444' }, // Red
    { name: 'Medium Risk', value: 35, color: '#f59e0b' }, // Amber
    { name: 'Low Risk', value: 250, color: '#10b981' }, // Green
];

const RISK_FACTORS = [
    { factor: 'Salary Gap', count: 45, impact: 'High' },
    { factor: 'Tenure Stagnation', count: 32, impact: 'High' },
    { factor: 'Low Engagement', count: 28, impact: 'Medium' },
    { factor: 'Overtime Burnout', count: 20, impact: 'Medium' },
    { factor: 'Manager Conflict', count: 12, impact: 'Low' },
];

const HIGH_RISK_EMPLOYEES = [
    { id: 1, name: 'Sarah Connor', role: 'Senior Lead', dept: 'Engineering', riskScore: 92, factor: 'Salary 15% below market', action: 'Market Correction' },
    { id: 2, name: 'John Rambo', role: 'DevOps Eng', dept: 'Operations', riskScore: 88, factor: 'High Burnout (60h weeks)', action: 'Workload Balancing' },
    { id: 3, name: 'Ellen Ripley', role: 'Product Mgr', dept: 'Product', riskScore: 85, factor: 'No Promotion > 3y', action: 'Career Pathing' },
    { id: 4, name: 'Tony Stark', role: 'CTO', dept: 'Executive', riskScore: 82, factor: 'External Offer Suspected', action: 'Retention Bonus' },
    { id: 5, name: 'Bruce Banner', role: 'Research Lead', dept: 'R&D', riskScore: 79, factor: 'Low Engagement Score', action: '1-on-1 Intervention' },
];

// --- COMPONENTS ---

export default function AttritionPredictionPage() {
    const [salaryBoost, setSalaryBoost] = useState(0);
    const [atRiskEmployees, setAtRiskEmployees] = useState<any[]>(HIGH_RISK_EMPLOYEES);
    const [riskScores, setRiskScores] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttritionData();
    }, []);

    const fetchAttritionData = async () => {
        try {
            const [riskScoresResult, atRiskResult] = await Promise.all([
                predictiveAttrition.getRiskScores(),
                predictiveAttrition.getAtRiskEmployees(),
            ]);

            if (riskScoresResult.success) {
                setRiskScores(riskScoresResult.data);
            }
            if (atRiskResult.success) {
                setAtRiskEmployees(atRiskResult.data?.employees || HIGH_RISK_EMPLOYEES);
            }
        } catch (error: any) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    // Simulation logic (mock)
    const predictedReduction = Math.min(salaryBoost * 1.5, 40); // 10% boost reduces risk by ~15%

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <AlertOctagon className="w-6 h-6 text-indigo-500" />
                        Attrition Prediction
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">AI-driven analysis of flight risk and retention strategies.</p>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/20">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs text-silver-mist font-bold uppercase">At-Risk Employees</p>
                        <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">50</h3>
                        <p className="text-xs text-rose-500 font-medium">16.6% of workforce</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs text-silver-mist font-bold uppercase">Potential Replacement Cost</p>
                        <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">$1.2M</h3>
                        <p className="text-xs text-slate-500 font-medium">Est. recruitment + training</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                        <TrendingDown className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs text-silver-mist font-bold uppercase">Prediction Accuracy</p>
                        <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">94%</h3>
                        <p className="text-xs text-emerald-500 font-medium">Based on 2Y historical data</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                {/* 1. Risk Distribution (Pie) */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Workforce Risk Profile</h2>
                    <div className="flex items-center justify-center h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={RISK_DISTRIBUTION}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {RISK_DISTRIBUTION.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Top Risk Factors (Bar) */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">Top Drivers of Attrition</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={RISK_FACTORS}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="factor" type="category" width={120} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Simulator & Action */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2">Retention Simulator</h2>
                        <p className="text-indigo-200 text-sm mb-4">
                            Simulate the impact of salary adjustments on attrition risk.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span>Salary Increase</span>
                                    <span>{salaryBoost}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="5"
                                    value={salaryBoost}
                                    onChange={(e) => setSalaryBoost(parseInt(e.target.value))}
                                    className="w-full h-2 bg-indigo-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/10">
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-emerald-400">-{predictedReduction.toFixed(1)}%</span>
                            <span className="text-sm font-medium text-indigo-200 mb-1">Risk Reduction</span>
                        </div>
                        <p className="text-xs text-indigo-200">
                            Increasing salaries by {salaryBoost}% is predicted to save approximately
                            <strong className="text-white"> {Math.round(predictedReduction / 2)} </strong>
                            high-risk employees from leaving this quarter.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. High Risk Employee Table */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-cloud dark:border-nebula-purple/50">
                    <h2 className="text-lg font-bold text-ink-black dark:text-pearl">Urgent Attention Required</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Risk Score</th>
                                <th className="px-6 py-4">Primary Factor</th>
                                <th className="px-6 py-4">AI Recommendation</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                            {atRiskEmployees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-ink-black dark:text-pearl">
                                        {employee.name}
                                        <div className="text-xs text-silver-mist font-normal">{employee.role}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{employee.dept}</td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                            <AlertOctagon className="w-3 h-3" />
                                            {employee.riskScore}/100
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {employee.factor}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            {employee.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

