"use client";

import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Check,
    X,
    Loader2
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
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-indigo-500" />
                        Enrollment Management
                    </h1>
                    <p className="text-slate-500 text-sm">Approve and manage employee course enrollments.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <ClipboardList className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No enrollments found</p>
                    <p className="text-sm">Enrollment requests will appear here.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Learner</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Enrolled Date</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.map((enrollment, i) => (
                                <tr key={enrollment.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-bold">{enrollment.learnerName || enrollment.learnerId}</td>
                                    <td className="px-6 py-4">{enrollment.courseName || enrollment.courseTitle}</td>
                                    <td className="px-6 py-4 text-slate-500">{enrollment.enrolledDate ? new Date(enrollment.enrolledDate).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 font-mono">{enrollment.progress != null ? `${enrollment.progress}%` : '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            enrollment.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                            enrollment.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {enrollment.status}
                                        </span>
                                    </td>
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
            )}
        </div>
    );
}

