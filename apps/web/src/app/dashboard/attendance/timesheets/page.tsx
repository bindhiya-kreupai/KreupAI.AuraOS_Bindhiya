"use client";

import React, { useState, useEffect } from 'react';
import {
    Table,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Send
} from 'lucide-react';
import { AttendanceRecordService } from '../services';

const WEEK_DAYS = ['Mon 01', 'Tue 02', 'Wed 03', 'Thu 04', 'Fri 05', 'Sat 06', 'Sun 07'];

interface TimesheetEntry {
    project: string;
    task: string;
    hours: number[];
    total: number;
}

interface TimesheetSummary {
    status: string;
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
}

export default function TimesheetsPage() {
    const [timesheetData, setTimesheetData] = useState<TimesheetEntry[]>([]);
    const [summary, setSummary] = useState<TimesheetSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTimesheets();
    }, []);

    const fetchTimesheets = async () => {
        try {
            const records = await AttendanceRecordService.getRecords({ type: 'summary' });
            // Transform attendance records to timesheet entries
            const entries: TimesheetEntry[] = (records as any[]).map((record: any) => ({
                project: record.project || 'Default Project',
                task: record.task || 'Daily Work',
                hours: record.dailyHours || [0, 0, 0, 0, 0, 0, 0],
                total: record.workingHours || 0,
            }));
            setTimesheetData(entries);
            // Calculate summary from actual data
            const totalHours = entries.reduce((sum, e) => sum + e.total, 0);
            const billableHours = entries.reduce((sum, e) => sum + (e.total * 0.875), 0); // Estimate billable
            setSummary({
                status: 'Draft',
                totalHours,
                billableHours: Math.round(billableHours * 10) / 10,
                nonBillableHours: Math.round((totalHours - billableHours) * 10) / 10,
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Create attendance record for timesheet submission
            await AttendanceRecordService.createRecord({
                employeeId: 'current-user',
                date: new Date().toISOString().split('T')[0],
                status: 'PRESENT',
                workingHours: summary?.totalHours || 0,
            } as any);
            await fetchTimesheets();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        My Timesheet
                    </h1>
                    <p className="text-silver-mist text-sm mt-1">Log your work hours across projects.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                        <Send className="w-4 h-4" /> Submit for Approval
                    </button>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center text-amber-800 text-sm">
                <div className="flex items-center gap-2 font-bold">
                    <Clock className="w-4 h-4" /> Status: Draft (Not Submitted)
                </div>
                <div>
                    Submission Deadline: <strong>Friday, 05 Apr 2025</strong>
                </div>
            </div>

            {/* Timesheet Grid */}
            <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="p-4 text-left min-w-[250px] font-bold text-slate-600 dark:text-slate-300">Project / Task</th>
                            {WEEK_DAYS.map((day, i) => (
                                <th key={i} className="p-4 text-center min-w-[80px] font-bold text-slate-600 dark:text-slate-300">
                                    {day}
                                </th>
                            ))}
                            <th className="p-4 text-center min-w-[80px] font-bold text-indigo-600">Total</th>
                            <th className="p-4 text-center w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="p-8 text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                                </td>
                            </tr>
                        ) : timesheetData.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="p-8 text-center text-slate-400">No timesheet entries</td>
                            </tr>
                        ) : (
                        timesheetData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-bold text-ink-black dark:text-pearl">{row.project}</div>
                                    <div className="text-xs text-silver-mist">{row.task}</div>
                                </td>
                                {row.hours.map((h, dayIdx) => (
                                    <td key={dayIdx} className="p-2 text-center">
                                        <input
                                            type="number"
                                            defaultValue={h === 0 ? '' : h}
                                            placeholder="-"
                                            className="w-12 py-1 text-center border border-slate-200 dark:border-slate-700 rounded bg-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300"
                                        />
                                    </td>
                                ))}
                                <td className="p-4 text-center font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10">
                                    {row.total}
                                </td>
                                <td className="p-4 text-center">
                                    <button className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        )))}
                        {/* Total Row */}
                        {!loading && timesheetData.length > 0 && (
                        <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                            <td className="p-4 text-right text-slate-600 dark:text-slate-300">Daily Total</td>
                            {WEEK_DAYS.map((_, dayIdx) => {
                                const dayTotal = timesheetData.reduce((sum, row) => sum + (row.hours[dayIdx] || 0), 0);
                                return (
                                    <td key={dayIdx} className={`p-4 text-center ${dayTotal === 0 ? 'text-slate-400' : ''}`}>
                                        {dayTotal.toFixed(1)}
                                    </td>
                                );
                            })}
                            <td className="p-4 text-center text-indigo-600 text-lg">
                                {timesheetData.reduce((sum, row) => sum + row.total, 0).toFixed(1)}
                            </td>
                            <td></td>
                        </tr>
                        )}
                    </tbody>
                </table>
                <div className="p-4 border-t border-cloud dark:border-nebula-purple/20">
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        + Add Line Item
                    </button>
                </div>
            </div>

            <div className="flex justify-end gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600">Billable ({summary?.billableHours || 0}h)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span className="text-slate-600">Non-Billable ({summary?.nonBillableHours || 0}h)</span>
                </div>
            </div>

        </div>
    );
}

