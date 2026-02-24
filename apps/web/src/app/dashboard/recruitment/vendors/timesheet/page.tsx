"use client";

import React, { useState, useEffect } from 'react';
import { RecruitmentSettingsService } from '../../services';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function AgencyTimesheetPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-indigo-500" />
                        Contractor Timesheets
                    </h1>
                    <p className="text-slate-500 text-sm">Review and approve weekly hours from vendors.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-sm font-bold">Dec 04 - Dec 10, 2023</span>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Timesheet Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Contractor</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4 text-center">Mon</th>
                                <th className="px-6 py-4 text-center">Tue</th>
                                <th className="px-6 py-4 text-center">Wed</th>
                                <th className="px-6 py-4 text-center">Thu</th>
                                <th className="px-6 py-4 text-center">Fri</th>
                                <th className="px-6 py-4 text-center font-bold">Total</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Sarah Jenkins', vendor: 'TechStaff', project: 'Mobile App Redesign', hours: [8, 8, 8, 8, 8], total: 40, status: 'Pending' },
                                { name: 'Michael Chen', vendor: 'Global Manpower', project: 'QA Automation', hours: [8, 8, 6, 8, 8], total: 38, status: 'Approved' },
                                { name: 'David Smith', vendor: 'TechStaff', project: 'Backend API', hours: [9, 9, 9, 9, 4], total: 40, status: 'Pending' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{row.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{row.vendor}</td>
                                    <td className="px-6 py-4 text-slate-500">{row.project}</td>
                                    {row.hours.map((h, j) => (
                                        <td key={j} className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-mono">{h}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center font-bold text-indigo-600">{row.total}</td>
                                    <td className="px-6 py-4 flex justify-end gap-2">
                                        {row.status === 'Pending' ? (
                                            <>
                                                <button className="p-1 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200"><CheckCircle2 className="w-5 h-5" /></button>
                                                <button className="p-1 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"><XCircle className="w-5 h-5" /></button>
                                            </>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded">Approved</span>
                                        )}
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

