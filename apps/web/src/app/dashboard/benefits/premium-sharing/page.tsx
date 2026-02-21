"use client";

import React, { useState, useEffect } from 'react';
import {
    Coins,
    Loader2
} from 'lucide-react';
import { BenefitPlanService } from '../services';

interface PremiumItem {
    plan: string;
    total: string;
    employer: number;
    employee: number;
}

export default function PremiumSharingPage() {
    const [deductions, setDeductions] = useState<PremiumItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeductions();
    }, []);

    const fetchDeductions = async () => {
        try {
            setLoading(true);
            const response = await BenefitPlanService.getPlans({ status: 'ACTIVE' });
            const plans = response?.data || response || [];

            if (Array.isArray(plans) && plans.length > 0) {
                const items: PremiumItem[] = plans.map((plan: any) => {
                    const empPremium = plan.employeePremium || 0;
                    const erPremium = plan.employerPremium || 0;
                    const total = empPremium + erPremium;
                    const employerPct = total > 0 ? Math.round((erPremium / total) * 100) : 0;
                    const employeePct = total > 0 ? 100 - employerPct : 0;
                    return {
                        plan: plan.planName || plan.name || 'Unknown Plan',
                        total: `$${total.toLocaleString()}`,
                        employer: employerPct,
                        employee: employeePct,
                    };
                });
                setDeductions(items);
            } else {
                setDeductions([]);
            }
        } catch (error) {
            console.error('Error fetching premium data:', error);
            setDeductions([]);
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
                        <Coins className="w-6 h-6 text-indigo-500" />
                        Premium Sharing
                    </h1>
                    <p className="text-slate-500 text-sm">Configure employer vs. employee contribution ratios.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    </div>
                ) : deductions.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <Coins className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No Premium Data Available</h3>
                        <p className="text-sm text-slate-500 max-w-sm mt-1">Premium sharing information will appear once benefit plans are configured.</p>
                    </div>
                ) : deductions.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.plan}</h3>
                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-500">
                                Total: {item.total}/mo
                            </div>
                        </div>

                        <div className="h-4 flex rounded-full overflow-hidden mb-4">
                            <div
                                style={{ width: `${item.employer}%` }}
                                className="bg-indigo-500 h-full relative group"
                                title={`Employer: ${item.employer}%`}
                            ></div>
                            <div
                                style={{ width: `${item.employee}%` }}
                                className="bg-rose-400 h-full relative"
                                title={`Employee: ${item.employee}%`}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Employer Pays</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{item.employer}%</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Employee Pays</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                    <span className="text-xl font-bold text-rose-500">{item.employee}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
