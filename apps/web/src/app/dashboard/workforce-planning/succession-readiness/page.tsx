'use client';

import React from 'react';
import { Crown, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';

const CRITICAL_ROLES = [
    { role: 'Chief Technology Officer', incumbent: 'Sarah Connor', status: 'At Risk', successors: 0 },
    { role: 'VP of Sales', incumbent: 'Michael Scott', status: 'Ready', successors: 2 },
    { role: 'Director of Marketing', incumbent: 'Pam Beesly', status: 'Prepare', successors: 1 },
    { role: 'Head of Product', incumbent: 'Jim Halpert', status: 'Ready', successors: 3 },
];

export default function SuccessionReadinessPage() {
    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Crown className="w-6 h-6 text-yellow-500" />
                        Succession Readiness
                    </h1>
                    <p className="text-slate-500 text-sm">Track bench strength for critical leadership roles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {CRITICAL_ROLES.map((role, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{role.role}</h3>
                            <p className="text-sm text-slate-500">Incumbent: <span className="text-slate-700 dark:text-slate-300 font-medium">{role.incumbent}</span></p>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Status</div>
                                {role.status === 'Ready' && <span className="flex items-center gap-1 text-emerald-500 font-bold"><CheckCircle className="w-4 h-4" /> Secure</span>}
                                {role.status === 'Prepare' && <span className="flex items-center gap-1 text-amber-500 font-bold"><UserPlus className="w-4 h-4" /> Developing</span>}
                                {role.status === 'At Risk' && <span className="flex items-center gap-1 text-red-500 font-bold"><AlertTriangle className="w-4 h-4" /> Alert</span>}
                            </div>

                            <div className="text-center min-w-[100px]">
                                <div className="text-xs text-slate-400 uppercase font-bold mb-1">Successors</div>
                                <div className="text-2xl font-bold">{role.successors}</div>
                            </div>

                            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                View Pipeline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
