"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    Download,
    Phone,
    Copy,
    Loader2
} from 'lucide-react';
import { BenefitPlanService, EnrollmentService } from '../services';

export default function InsuranceCoveragePage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoverage();
    }, []);

    const fetchCoverage = async () => {
        try {
            setLoading(true);
            const [plansResponse, enrollmentsResponse] = await Promise.all([
                BenefitPlanService.getPlans({ status: 'ACTIVE' }),
                EnrollmentService.getEnrollments(),
            ]);
            const plansData = plansResponse?.data || plansResponse || [];
            const enrollmentsData = enrollmentsResponse?.data || enrollmentsResponse || [];
            setPlans(Array.isArray(plansData) ? plansData : []);
            setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
        } catch (error) {
            console.error('Error fetching coverage:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get the primary health plan (first active enrollment's plan, or first health plan)
    const activePlan = (() => {
        if (enrollments.length > 0) {
            const enrollment = enrollments.find((e: any) => e.status === 'ACTIVE');
            if (enrollment?.plan) return enrollment.plan;
            const planId = enrollment?.planId;
            if (planId) {
                const plan = plans.find((p: any) => p.id === planId);
                if (plan) return plan;
            }
        }
        return plans.find((p: any) =>
            p.category === 'HEALTH_INSURANCE' || p.category === 'health_insurance'
        ) || plans[0] || null;
    })();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
            </div>
        );
    }

    if (!activePlan) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Heart className="w-6 h-6 text-rose-500" />
                            My Coverage
                        </h1>
                        <p className="text-slate-500 text-sm">View details of your active insurance policies.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                    <Heart className="w-12 h-12 text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">No Active Coverage</h2>
                    <p className="text-silver-mist max-w-md">You do not have any active insurance coverage. Enroll in a benefit plan to view your coverage details.</p>
                </div>
            </div>
        );
    }

    const carrierName = activePlan.carrierName || 'Insurance Provider';
    const planName = activePlan.planName || activePlan.name || 'Health Plan';
    const planTier = activePlan.planTier || 'Standard';
    const policyNumber = activePlan.carrierPolicyNumber || activePlan.policyNumber || 'N/A';
    const deductible = activePlan.deductible ? `$${activePlan.deductible.toLocaleString()}` : 'N/A';
    const copay = activePlan.copay ? `$${activePlan.copay}` : 'N/A';
    const outOfPocketMax = activePlan.outOfPocketMax ? `$${activePlan.outOfPocketMax.toLocaleString()}` : 'N/A';
    const coinsurance = activePlan.coinsurance ? `${activePlan.coinsurance}%` : 'N/A';

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pb-20">
                {/* Digital ID Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-[220px]">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold tracking-wider">{carrierName}</h3>
                            <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm">{planTier}</span>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs text-blue-200 uppercase tracking-widest">Plan Name</span>
                            <span className="text-lg font-bold">{planName}</span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <span className="block text-xs text-blue-200 uppercase tracking-widest mb-1">Policy Number</span>
                                <div className="flex items-center gap-2 font-mono text-lg">
                                    {policyNumber}
                                    <button className="hover:text-blue-200"><Copy className="w-3 h-3" /></button>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-blue-200 uppercase tracking-widest mb-1">Plan Code</span>
                                <span className="font-mono">{activePlan.planCode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plan Details */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Coverage Quick View</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Deductible</span>
                            <span className="font-bold">{deductible}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Co-Pay</span>
                            <span className="font-bold">{copay}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Co-Insurance</span>
                            <span className="font-bold">{coinsurance}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Out-of-Pocket Max</span>
                            <span className="font-bold">{outOfPocketMax}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500">Employee Premium</span>
                            <span className="font-bold">${activePlan.employeePremium || 0}/mo</span>
                        </div>
                    </div>
                </div>

                {/* Support Contacts */}
                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-indigo-500">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Need Help?</h3>
                            <p className="text-sm text-slate-500">24/7 Member Support</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm">
                            Contact {carrierName}
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

