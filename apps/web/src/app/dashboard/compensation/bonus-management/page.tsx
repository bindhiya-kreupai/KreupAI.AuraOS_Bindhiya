"use client";

import React, { useState, useEffect } from 'react';
import {
    Gift,
    Calendar,
    Users,
    TrendingUp,
    Download,
    Eye
} from 'lucide-react';
import { BonusService } from '../services';

export default function BonusManagementPage() {
    const [schemes, setSchemes] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [schemesData, payoutsData] = await Promise.all([
                BonusService.getSchemes(),
                BonusService.getPayouts()
            ]);
            setSchemes(schemesData);
            setPayouts(payoutsData);
        } catch (error) {
            console.error('Error:', error);
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
                        <Gift className="w-6 h-6 text-indigo-500" />
                        Bonus Management
                    </h1>
                    <p className="text-slate-500 text-sm">Configure and distribute performance bonuses.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                    Release Bonus
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Campaigns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Active Bonus Campaigns</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'FY23 Annual Performance', date: 'Payout: Mar 31, 2024', status: 'Processing', amount: '$450,000', eligible: 145 },
                                { name: 'Q4 Sales Incentive', date: 'Payout: Feb 15, 2024', status: 'Draft', amount: '$85,000', eligible: 25 },
                                { name: 'Holiday Bonus', date: 'Paid: Dec 20, 2023', status: 'Completed', amount: '$120,000', eligible: 160 },
                            ].map((campaign, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                        <div className={`p-3 rounded-xl ${campaign.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : campaign.status === 'Processing' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                                            <Gift className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{campaign.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <Calendar className="w-3 h-3" /> {campaign.date}
                                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                                <Users className="w-3 h-3" /> {campaign.eligible} Eligible
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-indigo-600">{campaign.amount}</div>
                                            <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${campaign.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : campaign.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                        <div className="text-slate-400 hover:text-indigo-600">
                                            <Eye className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Rules */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Calculation Rules</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-indigo-500">
                                <div className="text-sm font-bold">Company Performance Multiplier</div>
                                <div className="flex justify-between mt-2 text-xs">
                                    <span>Rev &gt; 110% Target</span>
                                    <span className="font-bold text-emerald-500">1.2x Payout</span>
                                </div>
                                <div className="flex justify-between mt-1 text-xs">
                                    <span>Rev &lt; 90% Target</span>
                                    <span className="font-bold text-rose-500">0.8x Payout</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-amber-500">
                                <div className="text-sm font-bold">Proration Policy</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Employees joining after Oct 1st are not eligible for annual bonus.
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Edit Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
