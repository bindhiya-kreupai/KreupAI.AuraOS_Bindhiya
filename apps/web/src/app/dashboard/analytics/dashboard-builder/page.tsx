"use client";

import React, { useState, useEffect } from 'react';
import {
    PieChart,
    BarChart,
    Table,
    Download,
    Filter,
    Columns,
    Calendar,
    Save,
    Loader2
} from 'lucide-react';

interface DeptRow {
    department: string;
    count: number;
}

export default function ReportBuilderPage() {
    const [loading, setLoading] = useState(true);
    const [deptData, setDeptData] = useState<DeptRow[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/v1/analytics/headcount');
            const json = await res.json();
            const data = json?.data;

            if (data?.byDepartment) {
                setDeptData(
                    data.byDepartment.map((d: any) => ({
                        department: d.department,
                        count: d.count,
                    }))
                );
            }
        } catch (error: any) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-orange-500" />
                        Report Builder
                    </h1>
                    <p className="text-slate-500 text-sm">Create custom reports, analyze data trends, and schedule exports.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-sm mb-4">Data Source</h3>
                        <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold mb-4">
                            <option>Employee Master</option>
                            <option>Attendance Logs</option>
                            <option>Payroll Register</option>
                            <option>Recruitment Pipeline</option>
                        </select>

                        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Columns className="w-4 h-4 text-slate-400" /> Select Columns
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {['Employee ID', 'Full Name', 'Department', 'Designation', 'Joining Date', 'Status', 'Office Location', 'Reporting Manager'].map((c, i) => (
                                <label key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                                    <input type="checkbox" className="accent-orange-500 rounded" defaultChecked={i < 4} />
                                    {c}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" /> Filters
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1">Date Range</div>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <select className="bg-transparent text-xs font-bold w-full outline-none">
                                        <option>Custom Range</option>
                                        <option>This Month</option>
                                        <option>Last Quarter</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1">Department</div>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-xs font-bold outline-none">
                                    <option>All Departments</option>
                                    {deptData.map(d => (
                                        <option key={d.department}>{d.department}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg">Report Preview ({deptData.length > 0 ? `${deptData.length} Departments` : 'No Data'})</h2>
                        <div className="flex gap-2">
                            <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600"><Table className="w-4 h-4" /></button>
                            <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600"><BarChart className="w-4 h-4" /></button>
                            <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600"><PieChart className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl relative">
                        {deptData.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                                    <tr>
                                        {['#', 'Department', 'Headcount', '% of Total'].map((h, i) => (
                                            <th key={i} className="p-3 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {deptData.map((row, i) => {
                                        const total = deptData.reduce((s, d) => s + d.count, 0);
                                        const pct = total > 0 ? ((row.count / total) * 100).toFixed(1) : '0';
                                        return (
                                            <tr key={row.department} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-3 text-sm font-bold text-slate-700 dark:text-slate-300">{i + 1}</td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{row.department}</td>
                                                <td className="p-3 text-sm font-mono text-slate-600 dark:text-slate-400">{row.count}</td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{pct}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex items-center justify-center h-full py-20">
                                <div className="text-center">
                                    <Table className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">No data available. Run the report to see results.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

