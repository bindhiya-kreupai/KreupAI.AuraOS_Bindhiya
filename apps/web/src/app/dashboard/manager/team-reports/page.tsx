"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    PieChart,
    TrendingUp,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Loader2
} from 'lucide-react';

interface ReportData {
    totalEmployees: number;
    averageAttendance?: number;
    totalAbsences?: number;
    totalLateComings?: number;
    averageRating?: number;
    performanceDistribution?: Array<{ rating: number; count: number; percentage: number }>;
    leavesByType?: Array<{ leaveTypeId: string; count: number; totalDays: number }>;
    employeeAttendance?: Array<{ employeeName: string; attendanceRate: number; totalDays: number; presentDays: number }>;
}

export default function TeamReportsPage() {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('attendance');

    useEffect(() => {
        fetchReport(reportType);
    }, [reportType]);

    async function fetchReport(type: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/manager/reports?type=${type}`);
            if (res.ok) {
                const data = await res.json();
                setReportData(data.data || null);
            }
        } catch (err) {
            console.error('Failed to fetch report:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading && !reportData) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-sm text-silver-mist">Loading reports...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                        Team Reports
                    </h1>
                    <p className="text-slate-500 text-sm">Analytics on team performance, attendance, and resource utilization.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium"
                    >
                        <option value="attendance">Attendance Report</option>
                        <option value="performance">Performance Report</option>
                        <option value="compensation">Compensation Report</option>
                        <option value="skills_gap">Skills Gap Report</option>
                    </select>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="ml-2 text-sm text-slate-500">Loading report...</span>
                </div>
            ) : !reportData ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <BarChart2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No report data available</p>
                    <p className="text-xs text-slate-400 mt-1">Select a report type to generate</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold">{reportData.totalEmployees}</div>
                            <div className="text-xs text-slate-500">Team Size</div>
                        </div>
                        {reportData.averageAttendance !== undefined && (
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{reportData.averageAttendance}%</div>
                                <div className="text-xs text-slate-500">Avg Attendance</div>
                            </div>
                        )}
                        {reportData.totalAbsences !== undefined && (
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{reportData.totalAbsences}</div>
                                <div className="text-xs text-slate-500">Total Absences</div>
                            </div>
                        )}
                        {reportData.averageRating !== undefined && (
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{reportData.averageRating}/5</div>
                                <div className="text-xs text-slate-500">Avg Performance</div>
                            </div>
                        )}
                        {reportData.totalLateComings !== undefined && (
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{reportData.totalLateComings}</div>
                                <div className="text-xs text-slate-500">Late Comings</div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {reportData.performanceDistribution && reportData.performanceDistribution.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                                <h3 className="font-bold text-lg mb-6">Performance Distribution</h3>
                                <div className="flex-1 flex items-end gap-3 px-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    {reportData.performanceDistribution.map((item, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="w-full relative h-[200px] bg-slate-50 dark:bg-slate-800 rounded-t-xl overflow-hidden flex items-end">
                                                <div
                                                    className="w-full bg-indigo-400 rounded-t-xl transition-all duration-1000 group-hover:opacity-80"
                                                    style={{ height: `${Math.max(item.percentage, 5)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">Rating {item.rating}</span>
                                            <span className="text-[10px] text-slate-400">{item.count} ({item.percentage}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {reportData.employeeAttendance && reportData.employeeAttendance.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-lg mb-6">Employee Attendance</h3>
                                <div className="space-y-4">
                                    {reportData.employeeAttendance.map((emp, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium">{emp.employeeName}</span>
                                                <span className="text-slate-500">{emp.attendanceRate}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${emp.attendanceRate >= 95 ? 'bg-emerald-500' : emp.attendanceRate >= 80 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${emp.attendanceRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {reportData.leavesByType && reportData.leavesByType.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-lg mb-6">Leaves by Type</h3>
                                <div className="space-y-4">
                                    {reportData.leavesByType.map((leave, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <span className="text-sm font-medium">{leave.leaveTypeId}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold">{leave.totalDays} days</span>
                                                <span className="text-xs text-slate-500 ml-2">({leave.count} requests)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

