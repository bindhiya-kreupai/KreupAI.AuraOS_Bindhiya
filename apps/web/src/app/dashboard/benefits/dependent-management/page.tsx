"use client";

import React, { useState, useEffect } from 'react';
import {
    Baby,
    UserPlus,
    FileText,
    MoreVertical
} from 'lucide-react';
import { DependentService } from '../services';

export default function DependentManagementPage() {
    const [dependents, setDependents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDependents();
    }, []);

    const fetchDependents = async () => {
        try {
            setLoading(true);
            const data = await DependentService.getDependents({ employeeId: 'EMP-001' });
            if (data.length === 0) {
                setDependents(mockDependents);
            } else {
                setDependents(data);
            }
        } catch {
                        setDependents(mockDependents);
        } finally {
            setLoading(false);
        }
    };

    const mockDependents = [
        { name: 'Sarah Miller', relation: 'Spouse', dob: '1988-04-12', status: 'Verified', coverage: ['Health', 'Dental'] },
        { name: 'Timmy Miller', relation: 'Child', dob: '2015-08-22', status: 'Verified', coverage: ['Health', 'Vision'] },
        { name: 'Jessica Miller', relation: 'Child', dob: '2018-01-05', status: 'Pending Verification', coverage: ['Health'] },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Baby className="w-6 h-6 text-indigo-500" />
                        Dependent Management
                    </h1>
                    <p className="text-slate-500 text-sm">Add and verify family members for insurance coverage.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    <UserPlus className="w-4 h-4" /> Add Dependent
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-20">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : dependents.map((dep, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative">
                        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400">
                                {dep.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{dep.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">{dep.relation}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-sm text-slate-500">{dep.dob}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm font-bold text-slate-500">Status</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${dep.status === 'Verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {dep.status}
                                </span>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Covered Under</span>
                                <div className="flex gap-2 flex-wrap">
                                    {dep.coverage.map(c => (
                                        <span key={c} className="px-2 py-1 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {dep.status !== 'Verified' && (
                            <button className="w-full mt-6 py-2 border border-dashed border-slate-300 text-slate-500 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> Upload Verification Docs
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
