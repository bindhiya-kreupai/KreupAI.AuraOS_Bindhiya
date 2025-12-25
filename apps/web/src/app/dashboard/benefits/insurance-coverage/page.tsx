"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    Download,
    Phone,
    Copy
} from 'lucide-react';
import { BenefitPlanService } from '../services';

export default function InsuranceCoveragePage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoverage();
    }, []);

    const fetchCoverage = async () => {
        try {
            setLoading(true);
            // Filter by health insurance category
            const data = await BenefitPlanService.getPlans({ category: 'health' });
            setPlans(data);
        } catch (error) {
            console.error('Error fetching insurance coverage:', error);
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
                        <Heart className="w-6 h-6 text-rose-500" />
                        My Coverage
                    </h1>
                    <p className="text-slate-500 text-sm">View details of your active insurance policies.</p>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    <Download className="w-4 h-4" /> Download All Cards
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pb-20">
                {/* Digital ID Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-[220px]">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold tracking-wider">BlueCross BlueShield</h3>
                            <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm">PPO Plan</span>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs text-blue-200 uppercase tracking-widest">Member Name</span>
                            <span className="text-lg font-bold">John Doe</span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <span className="block text-xs text-blue-200 uppercase tracking-widest mb-1">Member ID</span>
                                <div className="flex items-center gap-2 font-mono text-lg">
                                    XYZ-99887766
                                    <button className="hover:text-blue-200"><Copy className="w-3 h-3" /></button>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-blue-200 uppercase tracking-widest mb-1">Group ID</span>
                                <span className="font-mono">GRP-00123</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plan Details */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Coverage Quick View</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Deductible (Individual)</span>
                            <span className="font-bold">$1,500</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Co-Pay (Primary Care)</span>
                            <span className="font-bold">$25</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Co-Pay (Specialist)</span>
                            <span className="font-bold">$50</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500">Out-of-Pocket Max</span>
                            <span className="font-bold">$4,500</span>
                        </div>
                    </div>
                </div>

                {/* Support Contacts */}
                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-indigo-500">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Need Help?</h3>
                            <p className="text-sm text-slate-500">24/7 Nurse Line & Member Support</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm">
                            1-800-555-0199
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700">
                            Find a Doctor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
