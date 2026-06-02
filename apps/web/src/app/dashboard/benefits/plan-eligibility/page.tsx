"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    CheckCircle2,
    Briefcase,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { EligibilityService } from '../services';

export default function PlanEligibilityPage() {
    const [eligibilityRules, setEligibilityRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEligibility();
    }, []);

    const fetchEligibility = async () => {
        try {
            setLoading(true);
            const data = await EligibilityService.getEmployeeEligibility('EMP-001');
            setEligibilityRules(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Error fetching eligibility:', error);
            setEligibilityRules([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Plan Eligibility Rules
                    </h1>
                    <p className="text-slate-500 text-sm">Define criteria for employee benefit qualification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-20">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    </div>
                ) : eligibilityRules.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <Users className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No Eligibility Rules Found</h3>
                        <p className="text-sm text-slate-500 max-w-sm mt-1">Create eligibility rules to define which employees qualify for benefit plans.</p>
                    </div>
                ) : eligibilityRules.map((rule, i) => (
                    <div key={rule.id || i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{rule.benefitPlanName || rule.name}</h3>
                                    <p className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                                        {rule.reason || rule.criteria || 'No criteria specified'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-500 md:px-8 md:border-l md:border-r border-slate-100 dark:border-slate-800 flex-1 justify-center">
                            <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
                            <div className="text-center md:text-left">
                                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Status</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{rule.status || 'pending'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg border ${
                                rule.status === 'eligible' || rule.status === 'ELIGIBLE'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800'
                                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800'
                            }`}>
                                <CheckCircle2 className="w-4 h-4" /> {rule.status === 'eligible' || rule.status === 'ELIGIBLE' ? 'Eligible' : 'Pending'}
                            </span>
                        </div>
                    </div>
                ))}

                <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-600 dark:text-slate-300">Create New Eligibility Rule</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1">
                        Configure complex logic based on tenure, grade, department, or location.
                    </p>
                </div>
            </div>
        </div>
    );
}

