"use client";

import React, { useState, useEffect } from 'react';
import {
    HeartPulse,
    Activity,
    Eye,
    Dumbbell,
    Shield,
    Plus,
    Edit2,
    Trash2,
    Loader2
} from 'lucide-react';
import { BenefitPlanService } from '../services';

const CATEGORY_ICONS: Record<string, { icon: any; color: string }> = {
    HEALTH_INSURANCE: { icon: HeartPulse, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
    DENTAL: { icon: Activity, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
    VISION: { icon: Eye, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    WELLNESS: { icon: Dumbbell, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    LIFE_INSURANCE: { icon: Shield, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    DISABILITY: { icon: Shield, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    RETIREMENT: { icon: Shield, color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' },
    FSA_HSA: { icon: Shield, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
};

export default function BenefitTypesPage() {
    const [benefits, setBenefits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBenefits();
    }, []);

    const fetchBenefits = async () => {
        try {
            setLoading(true);
            const response = await BenefitPlanService.getPlans();
            const data = response?.data || response || [];
            setBenefits(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Error fetching benefits:', error);
            setBenefits([]);
        } finally {
            setLoading(false);
        }
    };

    const getName = (b: any) => b.name || b.planName || 'Unknown Plan';
    const getProvider = (b: any) => b.provider || b.carrierName || 'Unknown Provider';
    const getCategory = (b: any) => {
        const c = b.category || 'OTHER';
        return c.replace(/_/g, ' ').replace(/\b\w/g, (ch: string) => ch.toUpperCase());
    };
    const getCoverage = (b: any) => {
        if (b.coverageLimit) return b.coverageLimit;
        if (b.outOfPocketMax) return `$${b.outOfPocketMax.toLocaleString()} OOP Max`;
        return 'See plan details';
    };
    const getEmployeeCost = (b: any) => {
        if (b.employeeCost) return b.employeeCost;
        const cost = b.employeePremium || 0;
        return cost === 0 ? '$0' : `$${cost}/mo`;
    };
    const getIconConfig = (b: any) => {
        const cat = b.category || 'OTHER';
        return CATEGORY_ICONS[cat] || { icon: Shield, color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/20' };
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        Benefit Types
                    </h1>
                    <p className="text-slate-500 text-sm">Configure available benefit plans and categories.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    <Plus className="w-4 h-4" /> Add New Benefit
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pb-20">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    </div>
                ) : benefits.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <Shield className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No Benefit Plans Found</h3>
                        <p className="text-sm text-slate-500 max-w-sm mt-1">Add benefit plans to configure available options for employees.</p>
                    </div>
                ) : benefits.map((benefit) => {
                    const iconConfig = getIconConfig(benefit);
                    const IconComponent = iconConfig.icon;

                    return (
                        <div key={benefit.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconConfig.color}`}>
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-1">{getName(benefit)}</h3>
                            <p className="text-sm text-slate-500 mb-4">{getProvider(benefit)}</p>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Category</span>
                                    <span className="font-bold">{getCategory(benefit)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Coverage</span>
                                    <span className="font-bold text-emerald-600">{getCoverage(benefit)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Employee Cost</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{getEmployeeCost(benefit)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

