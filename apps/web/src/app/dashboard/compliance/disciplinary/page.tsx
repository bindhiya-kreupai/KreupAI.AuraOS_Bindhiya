"use client";

import React, { useState, useEffect } from 'react';
import {
    Gavel,
    AlertTriangle,
    FileText,
    User,
    Calendar,
    CheckCircle2,
    MoreVertical,
    Plus
} from 'lucide-react';
import { DisciplinaryService } from '../services';

const CASES = [
    { id: 'CASE-001', employee: 'John Doe', type: 'Misconduct', status: 'Investigation', severity: 'High', date: '2 days ago', investigator: 'Sarah Smith' },
    { id: 'CASE-002', employee: 'Mike Ross', type: 'Attendance', status: 'Closed', severity: 'Low', date: '3 weeks ago', investigator: 'Jane Doe' },
    { id: 'CASE-003', employee: 'Alice Chen', type: 'Policy Violation', status: 'Hearing', severity: 'Medium', date: '1 week ago', investigator: 'Bob Brown' },
];

export default function DisciplinaryPage() {
    const [records, setRecords] = useState<any[]>(CASES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const data = await DisciplinaryService.getRecords();
            if (data.length > 0) {
                setRecords(data);
            }
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gavel className="w-6 h-6 text-indigo-500" />
                        Disciplinary Actions
                    </h1>
                    <p className="text-slate-500 text-sm">Manage employee misconduct cases and hearings.</p>
                </div>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20">
                    <Plus className="w-4 h-4" /> Report Incident
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">5</div>
                        <div className="text-xs text-slate-500">Open Cases</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600">
                        <Gavel className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">2</div>
                        <div className="text-xs text-slate-500">Pending Hearings</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">128</div>
                        <div className="text-xs text-slate-500">Cases Resolved (YTD)</div>
                    </div>
                </div>
            </div>

            {/* Case List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                            <tr>
                                <th className="p-4">Case ID</th>
                                <th className="p-4">Employee</th>
                                <th className="p-4">Violation Type</th>
                                <th className="p-4">Severity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Investigator</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {CASES.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-slate-400">{c.id}</td>
                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-[10px] text-indigo-700">
                                            {c.employee.substring(0, 1)}
                                        </div>
                                        {c.employee}
                                    </td>
                                    <td className="p-4 text-slate-500">{c.type}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${c.severity === 'High' ? 'bg-rose-100 text-rose-600' :
                                                c.severity === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-500'}
                                        `}>
                                            {c.severity}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border
                                            ${c.status === 'Investigation' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
                                                c.status === 'Hearing' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                                    'bg-emerald-50 border-emerald-200 text-emerald-600'}
                                        `}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">{c.investigator}</td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                                            <MoreVertical className="w-4 h-4" />
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
