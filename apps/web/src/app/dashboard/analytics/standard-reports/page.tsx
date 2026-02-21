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
    ArrowRight,
    Loader2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const REPORT_TEMPLATES = [
    {
        id: 'rep-001',
        title: 'Headcount Analysis',
        category: 'HR Core',
        freq: 'Monthly',
        author: 'System',
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        description: 'Detailed breakdown of employee headcount by department, location, and type.',
        apiEndpoint: '/api/v1/analytics/headcount',
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
        description: 'Gross vs Net pay, tax deductions, and reimbursement totals.',
        apiEndpoint: '/api/v1/analytics/compensation',
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
        description: 'Absenteeism rates, late arrivals, and overtime hours analysis.',
        apiEndpoint: '/api/v1/analytics/real-time',
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
        description: 'Candidate pipeline conversion rates and time-to-hire metrics.',
        apiEndpoint: '/api/v1/analytics/predictive',
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
        description: 'Performance review scores, distribution, and goal completion rates.',
        apiEndpoint: '/api/v1/analytics/people',
    },
];

export default function StandardReportsPage() {
    const [selectedReport, setSelectedReport] = useState<typeof REPORT_TEMPLATES[0] | null>(null);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleSelectReport = async (report: typeof REPORT_TEMPLATES[0]) => {
        setSelectedReport(report);
        setReportLoading(true);
        try {
            const res = await fetch(report.apiEndpoint);
            const json = await res.json();
            setReportData(json?.data || null);

            const data = json?.data;
            if (data?.byDepartment) {
                setChartData(data.byDepartment.map((d: any) => ({
                    name: d.department,
                    value: d.count || d.headcount || d.avgSalary || 0,
                })));
            } else if (data?.trends) {
                setChartData(data.trends.map((t: any) => ({
                    name: t.month || t.period,
                    value: t.count || t.totalGrossSalary || 0,
                })));
            } else {
                setChartData([]);
            }
        } catch (error) {
            console.error('Error loading report:', error);
            setReportData(null);
            setChartData([]);
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen pb-20">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
                    <FileBarChart className="w-8 h-8 text-indigo-500" />
                    Standard Reports
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Access pre-built reports for common HR metrics and exports.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {REPORT_TEMPLATES.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer group flex flex-col h-full"
                        onClick={() => handleSelectReport(report)}
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
                            {reportLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <>
                                    {chartData.length > 0 && (
                                        <div className="h-80 w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData}>
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
                                    )}

                                    {chartData.length === 0 && (
                                        <div className="text-center py-12">
                                            <FileBarChart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400">No chart data available for this report</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
