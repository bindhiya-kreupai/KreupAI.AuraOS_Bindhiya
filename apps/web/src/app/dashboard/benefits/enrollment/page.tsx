"use client";

import React, { useState, useEffect } from 'react';
import {
    Heart,
    Smile,
    Eye,
    Check,
    Briefcase,
    Shield,
    DollarSign,
    Info,
    ChevronRight,
    ShoppingCart
} from 'lucide-react';
import { EnrollmentService, BenefitPlanService } from '../services';

// --- MOCK DATA ---

type PlanTier = 'Basic' | 'Gold' | 'Platinum';

interface Plan {
    id: string;
    tier: PlanTier;
    name: string;
    description: string;
    cost: number; // Monthly employee cost
    companyContribution: number;
    features: string[];
    recommended?: boolean;
}

interface BenefitCategory {
    id: string;
    title: string;
    icon: any;
    plans: Plan[];
}

const BENEFIT_DATA: BenefitCategory[] = [
    {
        id: 'health',
        title: 'Medical Insurance',
        icon: Heart,
        plans: [
            {
                id: 'h-basic',
                tier: 'Basic',
                name: 'Essential Care',
                description: 'Coverage for major medical events and preventive care.',
                cost: 0,
                companyContribution: 450,
                features: ['100% Preventive Care', '$5,000 Deductible', '20% Co-insurance', 'Telemedicine Included']
            },
            {
                id: 'h-gold',
                tier: 'Gold',
                name: 'Balanced Choice',
                description: 'Lower deductibles and copays for regular visits.',
                cost: 120,
                companyContribution: 550,
                features: ['100% Preventive Care', '$1,500 Deductible', '$30 Copay (PCP)', 'Specialist Referrals'],
                recommended: true
            },
            {
                id: 'h-plat',
                tier: 'Platinum',
                name: 'Premium Health',
                description: 'Maximum coverage with minimal out-of-pocket costs.',
                cost: 280,
                companyContribution: 650,
                features: ['100% Preventive Care', '$500 Deductible', '$15 Copay (PCP)', 'Out-of-Network Coverage']
            }
        ]
    },
    {
        id: 'dental',
        title: 'Dental Care',
        icon: Smile,
        plans: [
            {
                id: 'd-basic',
                tier: 'Basic',
                name: 'Preventive Dental',
                description: 'Covers cleanings and exams.',
                cost: 10,
                companyContribution: 30,
                features: ['2 Cleanings/Year', 'X-Rays Covered', 'No Orthodontia']
            },
            {
                id: 'd-gold',
                tier: 'Gold',
                name: 'Comprehensive Dental',
                description: 'Includes fillings, basic surgery, and major work.',
                cost: 35,
                companyContribution: 40,
                features: ['2 Cleanings/Year', '80% Fillings & Root Canals', '50% Major Work ($1500 max)']
            }
        ]
    },
    {
        id: 'vision',
        title: 'Vision Coverage',
        icon: Eye,
        plans: [
            {
                id: 'v-basic',
                tier: 'Basic',
                name: 'Standard Vision',
                description: 'Annual eye exam and discounts.',
                cost: 5,
                companyContribution: 15,
                features: ['$10 Exam Copay', '$130 Frame Allowance', 'Lens Discounts']
            },
            {
                id: 'v-gold',
                tier: 'Gold',
                name: 'Enhanced Vision',
                description: 'Higher allowances and designer frames.',
                cost: 15,
                companyContribution: 20,
                features: ['$0 Exam Copay', '$200 Frame Allowance', 'Progressive Lenses Covered']
            }
        ]
    }
];

export default function BenefitsEnrollmentPage() {
    const [selections, setSelections] = useState<Record<string, string>>({
        health: 'h-gold',
        dental: 'd-basic',
        vision: 'v-basic'
    });
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            // Fetch existing enrollments for the current employee
            const data = await EnrollmentService.getEnrollments({ employeeId: 'EMP-001' });
            setEnrollments(data);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (categoryId: string, planId: string) => {
        setSelections(prev => ({ ...prev, [categoryId]: planId }));
    };

    // Calculate totals
    let totalEmployeeCost = 0;
    let totalCompanyCost = 0;

    BENEFIT_DATA.forEach(cat => {
        const selectedId = selections[cat.id];
        const plan = cat.plans.find(p => p.id === selectedId);
        if (plan) {
            totalEmployeeCost += plan.cost;
            totalCompanyCost += plan.companyContribution;
        }
    });

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-10">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
                {/* Header */}
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-celestial-indigo/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div>
                        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <Shield className="w-6 h-6 text-emerald-500" />
                            2025 Open Enrollment
                        </h1>
                        <p className="text-silver-mist mt-1 max-w-2xl">
                            Choose your benefits for the upcoming year. Please review your options carefully.
                            Enrollment closes on <span className="font-bold text-ink-black dark:text-pearl">Nov 15, 2024</span>.
                        </p>
                    </div>
                </div>

                {/* Categories */}
                {BENEFIT_DATA.map(category => (
                    <div key={category.id} className="space-y-4">
                        <h3 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <category.icon className="w-5 h-5 text-celestial-indigo" />
                            {category.title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {category.plans.map(plan => {
                                const isSelected = selections[category.id] === plan.id;
                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${isSelected
                                                ? 'border-celestial-indigo bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md ring-1 ring-celestial-indigo'
                                                : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/50'
                                            }`}
                                        onClick={() => handleSelect(category.id, plan.id)}
                                    >
                                        {plan.recommended && (
                                            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 absolute top-0 right-0 rounded-bl-lg uppercase tracking-wider">
                                                Recommended
                                            </div>
                                        )}

                                        <div className="p-5 flex-1">
                                            <div className="text-xs font-bold text-silver-mist uppercase mb-1">{plan.tier}</div>
                                            <h4 className="font-bold text-lg text-ink-black dark:text-pearl mb-2">{plan.name}</h4>
                                            <p className="text-xs text-slate-500 mb-4 h-8">{plan.description}</p>

                                            <div className="space-y-2 mb-4">
                                                {plan.features.map((feature, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between">
                                            <div>
                                                <div className="text-xl font-bold text-ink-black dark:text-pearl">${plan.cost}</div>
                                                <div className="text-[10px] text-silver-mist">per month</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-celestial-indigo bg-celestial-indigo text-white' : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sticky Order Summary Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
                <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-lg sticky top-6 overflow-hidden">
                    <div className="p-5 bg-slate-900 text-white">
                        <h3 className="font-bold flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Your Selection
                        </h3>
                    </div>

                    <div className="p-5 space-y-4">
                        {BENEFIT_DATA.map(cat => {
                            const selectedPlan = cat.plans.find(p => p.id === selections[cat.id]);
                            if (!selectedPlan) return null;

                            return (
                                <div key={cat.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-medium text-ink-black dark:text-pearl">{cat.title}</div>
                                        <div className="text-xs text-silver-mist">{selectedPlan.name}</div>
                                    </div>
                                    <div className="font-bold text-ink-black dark:text-pearl">${selectedPlan.cost}</div>
                                </div>
                            );
                        })}

                        <div className="border-t border-cloud dark:border-nebula-purple/20 pt-4 mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-silver-mist">Total Deduction</span>
                                <span className="font-bold text-xl text-ink-black dark:text-pearl">${totalEmployeeCost}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                <span>Company Pays</span>
                                <span className="font-bold">${totalCompanyCost}</span>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-celestial-indigo text-white rounded-xl font-bold hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20 mt-2">
                            Confirm Enrollment
                        </button>
                        <p className="text-[10px] text-center text-silver-mist">
                            By confirming, you agree to the deduction from your payroll.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
