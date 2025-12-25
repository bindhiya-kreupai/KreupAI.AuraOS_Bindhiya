"use client";

import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    UserPlus,
    Check,
    X
} from 'lucide-react';
import { EnrollmentService } from '../services';

export default function EnrollmentPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await EnrollmentService.getEnrollments();
                setData(result);
            } catch (error) {
                console.error('Error fetching enrollments:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-indigo-500" />
                        Enrollment Management
                    </h1>
                    <p className="text-slate-500 text-sm">Approve and manage employee course enrollments.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Request Date</th>
                            <th className="px-6 py-4">Cost</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                            { name: 'Alice Johnson', course: 'Project Management Professional (PMP)', date: 'Oct 25', cost: '$1200', reason: 'Required for promotion' },
                            { name: 'Bob Williams', course: 'Advanced Python', date: 'Oct 24', cost: '$400', reason: 'Skill upskilling' },
                            { name: 'Charlie Brown', course: 'Public Speaking Workshop', date: 'Oct 22', cost: '$800', reason: 'Team lead role prep' },
                        ].map((req, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold">{req.name}</td>
                                <td className="px-6 py-4">{req.course}</td>
                                <td className="px-6 py-4 text-slate-500">{req.date}</td>
                                <td className="px-6 py-4 font-mono">{req.cost}</td>
                                <td className="px-6 py-4 text-slate-500 italic">"{req.reason}"</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="Approve">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200" title="Reject">
                                        <X className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
