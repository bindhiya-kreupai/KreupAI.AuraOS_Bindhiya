"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { CourseService } from '../services';

export default function ComplianceTrainingPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result);
            } catch (error: any) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const complianceCourses = data.filter((c) =>
        c.category?.toLowerCase().includes('compliance') ||
        c.isComplianceTraining ||
        c.type?.toLowerCase().includes('compliance')
    );

    const completedCount = complianceCourses.filter((c) => c.status === 'completed').length;
    const overallRate = complianceCourses.length > 0
        ? Math.round((completedCount / complianceCourses.length) * 100)
        : 0;

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Compliance Training
                    </h1>
                    <p className="text-slate-500 text-sm">Mandatory training modules and completion tracking.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold uppercase text-slate-500 mb-1">Overall Compliance</div>
                            <div className="text-3xl font-bold text-emerald-600">{overallRate}%</div>
                        </div>
                        <ShieldCheck className="w-10 h-10 text-emerald-100" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold uppercase text-slate-500 mb-1">Total Modules</div>
                            <div className="text-3xl font-bold text-amber-500">{data.length}</div>
                        </div>
                        <AlertTriangle className="w-10 h-10 text-amber-100" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold uppercase text-slate-500 mb-1">Compliance Courses</div>
                            <div className="text-3xl font-bold text-indigo-600">{complianceCourses.length}</div>
                        </div>
                        <CheckCircle className="w-10 h-10 text-indigo-100" />
                    </div>

                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Training Modules</h3>
                        {data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                                <ShieldCheck className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No training modules found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.map((mod, i) => (
                                    <div key={mod.id || i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-sm">{mod.title}</h4>
                                                {mod.level === 'advanced' && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded uppercase">High Priority</span>}
                                            </div>
                                            <div className="text-xs text-slate-500">{mod.description || `Category: ${mod.category || 'General'}`}</div>
                                        </div>
                                        <div className="w-32">
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>{mod.status}</span>
                                                <span>{mod.completionRate ? `${mod.completionRate}%` : '-'}</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${mod.completionRate === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${mod.completionRate || 0}%` }}></div>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
                                            {mod.status === 'completed' ? 'Review' : 'Start'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

