"use client";

import React, { useState, useEffect } from 'react';
import {
    HeartPulse,
    Activity,
    Eye,
    Dumbbell,
    Briefcase,
    Shield,
    Plus,
    Edit2,
    Trash2
} from 'lucide-react';
import { BenefitPlanService } from '../services';

export default function BenefitTypesPage() {
    const [benefits, setBenefits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBenefits();
    }, []);

    const fetchBenefits = async () => {
        try {
            setLoading(true);
            const data = await BenefitPlanService.getPlans();
            setBenefits(data);
        } catch (error) {
            console.error('Error:', error);
                        // Fallback to mock data
            setBenefits(mockBenefits);
        } finally {
            setLoading(false);
        }
    };

    const mockBenefits = [
        {
            id: 'BEN-001',
            name: 'Comprehensive Health Insurance',
            category: 'Health',
            provider: 'BlueCross',
            coverageLimit: '$500,000',
            employeeCost: '$0',
            icon: HeartPulse,
            color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'
        },
        {
            id: 'BEN-002',
            name: 'Dental Care Plan',
            category: 'Dental',
            provider: 'Delta Dental',
            coverageLimit: '$2,000/yr',
            employeeCost: '$15/mo',
            icon: Activity,
            color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
        },
        {
            id: 'BEN-003',
            name: 'Vision Plus',
            category: 'Vision',
            provider: 'VSP',
            coverageLimit: '$500/yr',
            employeeCost: '$5/mo',
            icon: Eye,
            color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            id: 'BEN-004',
            name: 'Gym Membership',
            category: 'Wellness',
            provider: 'Equinox',
            coverageLimit: 'Full Access',
            employeeCost: '50% copay',
            icon: Dumbbell,
            color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
        }
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : benefits.map((benefit) => (
                    <div key={benefit.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${benefit.color}`}>
                                <benefit.icon className="w-6 h-6" />
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

                        <h3 className="text-lg font-bold mb-1">{benefit.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">{benefit.provider}</p>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Category</span>
                                <span className="font-bold">{benefit.category}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Coverage</span>
                                <span className="font-bold text-emerald-600">{benefit.coverageLimit}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Employee Cost</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{benefit.employeeCost}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
