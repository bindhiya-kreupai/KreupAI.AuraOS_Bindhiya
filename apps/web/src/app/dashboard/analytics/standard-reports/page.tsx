"use client";

import React, { useState, useEffect } from 'react';
import {
    FileBarChart,
    Users,
    Banknote,
    Clock,
    Briefcase,
    TrendingUp,
    Download,
    Eye,
    ArrowRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { StandardReportService } from '../services';

// --- MOCK DATA ---

const REPORTS = [
    {
        id: 'rep-001',
        title: 'Headcount Analysis',
        category: 'HR Core',
        freq: 'Monthly',
        author: 'System',
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        description: 'Detailed breakdown of employee headcount by department, location, and type.'
    },
    {
        id: 'rep-002',
        title: 'Payroll Summary',
        category: 'Finance',
        freq: 'Bi-Weekly',
        author: 'System',
        icon: Banknote,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        description: 'Gross vs Net pay, tax deductions, and reimbursement totals.'
    },
    {
        id: 'rep-003',
        title: 'Attendance Trends',
        category: 'Workforce',
        freq: 'Weekly',
        author: 'System',
        icon: Clock,
        color: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        description: 'Absenteeism rates, late arrivals, and overtime hours analysis.'
    },
    {
        id: 'rep-004',
        title: 'Recruitment Funnel',
        category: 'Hiring',
        freq: 'Real-time',
        author: 'System',
        icon: Briefcase,
        color: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-500/10',
        description: 'Candidate pipeline conversion rates and time-to-hire metrics.'
    },
    {
        id: 'rep-005',
        title: 'Employee Performance',
        category: 'Talent',
        freq: 'Quarterly',
        author: 'System',
        icon: TrendingUp,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        description: 'Performance review scores, distribution, and goal completion rates.'
    },
];

const MOCK_CHART_DATA = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 280 },
    { name: 'May', value: 590 },
];

export default function StandardReportsPage() {
    const [selectedReport, setSelectedReport] = useState<typeof REPORTS[0] | null>(null);
    const [reports, setReports] = useState<any[]>(REPORTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const data = await StandardReportService.getAllReports();
            if (data.length > 0) {
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching standard reports:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <FileBarChart className="w-8 h-8 text-indigo-500" />
                    Standard Reports
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Access pre-built reports for common HR metrics and exports.</p>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer group flex flex-col h-full"
                        onClick={() => setSelectedReport(report)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${report.bg} ${report.color}`}>
                                <report.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{report.category}</span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 transition-colors">
                            {report.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6 flex-1 leading-relaxed">
                            {report.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {report.freq}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                View Report <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mock Report Modal/Detail View */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${selectedReport.bg} ${selectedReport.color}`}>
                                    <selectedReport.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedReport.title}</h2>
                                    <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-sm text-slate-500 mb-1">Total Metric {i}</div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.floor(Math.random() * 1000)}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Area */}
                            <div className="h-80 w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={MOCK_CHART_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                                        <YAxis fontSize={12} stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Data Table */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">ID</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Value</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {[1, 2, 3, 4, 5].map((row) => (
                                            <tr key={row} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-300">#R{row}00</td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400">Record {row}</td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{Math.floor(Math.random() * 100)}%</td>
                                                <td className="p-4">
                                                    <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Active</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
