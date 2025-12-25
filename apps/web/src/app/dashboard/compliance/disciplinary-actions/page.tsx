"use client";

import React, { useState, useEffect } from 'react';
import {
    Gavel,
    UserX,
    AlertTriangle,
    FileWarning
} from 'lucide-react';
import { DisciplinaryService } from '../services';

export default function DisciplinaryActionsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const data = await DisciplinaryService.getRecords();
            setRecords(data);
        } catch (error) {
            console.error('Error fetching disciplinary records:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserX className="w-6 h-6 text-indigo-500" />
                        Disciplinary Actions
                    </h1>
                    <p className="text-slate-500 text-sm">Record and track disciplinary measures.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Verbal Warnings', count: 42, color: 'bg-indigo-500' },
                    { label: 'Written Warnings', count: 18, color: 'bg-amber-500' },
                    { label: 'Suspensions', count: 5, color: 'bg-rose-500' },
                    { label: 'Terminations', count: 2, color: 'bg-slate-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold mb-1">{stat.count}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase">{stat.label}</div>
                        </div>
                        <div className={`w-2 h-10 rounded-full ${stat.color}`}></div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Recent Actions</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Infraction</th>
                            <th className="px-6 py-4">Action Taken</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">HR Manager</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'John Doe', infraction: 'Late Arrival (3x)', action: 'Verbal Warning', date: 'Oct 25', mgr: 'Sarah Connor' },
                            { name: 'Jane Smith', infraction: 'Safety Violation', action: 'Written Warning', date: 'Oct 24', mgr: 'Ellen Ripley' },
                            { name: 'Bob Johnson', infraction: 'Insubordination', action: 'Suspension (3 Days)', date: 'Oct 20', mgr: 'Sarah Connor' },
                            { name: 'Mike Ross', infraction: 'Theft', action: 'Termination', date: 'Oct 15', mgr: 'Harvey Specter' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold">{row.name}</td>
                                <td className="px-6 py-4 text-slate-500">{row.infraction}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${row.action.includes('Term') ? 'bg-slate-200 text-slate-600' :
                                            row.action.includes('Suspension') ? 'bg-rose-100 text-rose-600' :
                                                row.action.includes('Written') ? 'bg-amber-100 text-amber-600' :
                                                    'bg-indigo-100 text-indigo-600'
                                        }`}>{row.action}</span>
                                </td>
                                <td className="px-6 py-4">{row.date}</td>
                                <td className="px-6 py-4">{row.mgr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
